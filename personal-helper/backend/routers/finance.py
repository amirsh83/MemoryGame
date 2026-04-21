import os
import secrets
from datetime import datetime, date
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel, field_validator
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from models.expense import Expense, ExpenseCategory
from models.statement import Statement, StatementType
from services.statement_parser import parse_statement

router = APIRouter(prefix="/finance", tags=["finance"])

UPLOAD_DIR = "data/statements"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_MB = 20


class ExpenseIn(BaseModel):
    amount: float
    currency: str = "USD"
    description: str
    category: ExpenseCategory = ExpenseCategory.other
    merchant: Optional[str] = None
    date: Optional[str] = None  # ISO date string
    notes: Optional[str] = None

    @field_validator("amount")
    @classmethod
    def positive_amount(cls, v):
        if v <= 0:
            raise ValueError("Amount must be positive")
        return v


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    category: Optional[ExpenseCategory] = None
    merchant: Optional[str] = None
    date: Optional[str] = None
    notes: Optional[str] = None


@router.get("/expenses")
def list_expenses(
    category: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Expense).filter(Expense.user_id == user.id)
    if category:
        q = q.filter(Expense.category == category)
    if date_from:
        q = q.filter(Expense.date >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(Expense.date <= datetime.fromisoformat(date_to))

    total = q.count()
    expenses = q.order_by(Expense.date.desc()).offset(offset).limit(min(limit, 500)).all()

    return {
        "total": total,
        "expenses": [
            {
                "id": e.id,
                "amount": e.amount,
                "currency": e.currency,
                "description": e.description,
                "category": e.category,
                "merchant": e.merchant,
                "date": e.date.isoformat(),
                "notes": e.notes,
                "statement_id": e.statement_id,
            }
            for e in expenses
        ],
    }


@router.post("/expenses", status_code=201)
def create_expense(
    body: ExpenseIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    exp_date = datetime.utcnow()
    if body.date:
        try:
            exp_date = datetime.fromisoformat(body.date)
        except ValueError:
            pass

    expense = Expense(
        user_id=user.id,
        amount=body.amount,
        currency=body.currency,
        description=body.description,
        category=body.category,
        merchant=body.merchant,
        date=exp_date,
        notes=body.notes,
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return {"id": expense.id, "message": "Expense created"}


@router.patch("/expenses/{expense_id}")
def update_expense(
    expense_id: int,
    body: ExpenseUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    if body.amount is not None:
        expense.amount = body.amount
    if body.currency is not None:
        expense.currency = body.currency
    if body.description is not None:
        expense.description = body.description
    if body.category is not None:
        expense.category = body.category
    if body.merchant is not None:
        expense.merchant = body.merchant
    if body.date is not None:
        try:
            expense.date = datetime.fromisoformat(body.date)
        except ValueError:
            pass
    if body.notes is not None:
        expense.notes = body.notes

    db.commit()
    return {"message": "Updated"}


@router.delete("/expenses/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


@router.get("/summary")
def get_summary(
    year: Optional[int] = None,
    month: Optional[int] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Expense).filter(Expense.user_id == user.id)
    now = datetime.utcnow()
    yr = year or now.year
    mo = month or now.month

    q = q.filter(
        func.strftime("%Y", Expense.date) == str(yr),
        func.strftime("%m", Expense.date) == f"{mo:02d}",
    )
    expenses = q.all()

    total = sum(e.amount for e in expenses)
    by_category: dict[str, float] = {}
    for e in expenses:
        cat = e.category or "other"
        by_category[cat] = round(by_category.get(cat, 0) + e.amount, 2)

    top_merchants: dict[str, float] = {}
    for e in expenses:
        if e.merchant:
            top_merchants[e.merchant] = round(top_merchants.get(e.merchant, 0) + e.amount, 2)

    sorted_merchants = sorted(top_merchants.items(), key=lambda x: x[1], reverse=True)[:10]

    return {
        "year": yr,
        "month": mo,
        "total_spent": round(total, 2),
        "transaction_count": len(expenses),
        "by_category": by_category,
        "top_merchants": dict(sorted_merchants),
    }


@router.post("/statements", status_code=201)
async def upload_statement(
    file: UploadFile = File(...),
    statement_type: str = Form(...),
    institution: str = Form(""),
    notes: str = Form(""),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.size and file.size > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 20MB)")

    allowed_ext = {"pdf", "csv", "xls", "xlsx"}
    ext = (file.filename or "").lower().rsplit(".", 1)[-1]
    if ext not in allowed_ext:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    try:
        stmt_type = StatementType(statement_type)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid statement type")

    content = await file.read()

    safe_name = f"{user.id}_{secrets.token_hex(8)}_{file.filename}"
    safe_name = "".join(c for c in safe_name if c.isalnum() or c in "._-")
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(content)

    statement = Statement(
        user_id=user.id,
        filename=file.filename or safe_name,
        statement_type=stmt_type,
        institution=institution,
        file_path=file_path,
        notes=notes,
        parsed="no",
    )
    db.add(statement)
    db.commit()
    db.refresh(statement)

    # Parse and auto-create expenses
    parsed_rows = parse_statement(file.filename or "", content)
    created_count = 0
    for row in parsed_rows:
        expense = Expense(
            user_id=user.id,
            amount=row["amount"],
            currency="USD",
            description=row["description"],
            category=row.get("category", "other"),
            merchant=row.get("merchant", ""),
            date=row.get("date", datetime.utcnow()),
            statement_id=statement.id,
        )
        db.add(expense)
        created_count += 1

    if created_count:
        statement.parsed = "yes"

    db.commit()

    return {
        "statement_id": statement.id,
        "expenses_created": created_count,
        "message": f"Statement uploaded. {created_count} transactions imported.",
    }


@router.get("/statements")
def list_statements(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    statements = db.query(Statement).filter(Statement.user_id == user.id).order_by(Statement.uploaded_at.desc()).all()
    return {
        "statements": [
            {
                "id": s.id,
                "filename": s.filename,
                "statement_type": s.statement_type,
                "institution": s.institution,
                "parsed": s.parsed,
                "uploaded_at": s.uploaded_at.isoformat(),
                "notes": s.notes,
            }
            for s in statements
        ]
    }


@router.delete("/statements/{statement_id}", status_code=204)
def delete_statement(
    statement_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = db.query(Statement).filter(Statement.id == statement_id, Statement.user_id == user.id).first()
    if not stmt:
        raise HTTPException(status_code=404, detail="Statement not found")

    if stmt.file_path and os.path.exists(stmt.file_path):
        os.remove(stmt.file_path)

    db.query(Expense).filter(Expense.statement_id == statement_id).delete()
    db.delete(stmt)
    db.commit()
