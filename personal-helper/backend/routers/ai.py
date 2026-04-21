from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from services import ai_service

router = APIRouter(prefix="/ai", tags=["ai"])


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    calendar_context: Optional[str] = None


class QuestionRequest(BaseModel):
    question: str


@router.post("/chat")
def chat(
    body: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.messages:
        raise HTTPException(status_code=400, detail="No messages provided")

    try:
        reply = ai_service.chat(
            user=user,
            db=db,
            messages=[m.model_dump() for m in body.messages],
            calendar_context=body.calendar_context,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")

    return {"reply": reply}


@router.get("/week-summary")
def week_summary(
    calendar_context: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        summary = ai_service.get_week_summary(user, db, calendar_context)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
    return {"summary": summary}


@router.post("/ask")
def ask(
    body: QuestionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Empty question")
    try:
        answer = ai_service.get_financial_advice(user, db, body.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI error: {str(e)}")
    return {"answer": answer}
