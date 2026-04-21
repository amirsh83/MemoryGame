from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum
import enum
from database import Base


class ExpenseCategory(str, enum.Enum):
    housing = "housing"
    food = "food"
    transport = "transport"
    utilities = "utilities"
    entertainment = "entertainment"
    health = "health"
    shopping = "shopping"
    travel = "travel"
    education = "education"
    subscriptions = "subscriptions"
    income = "income"
    savings = "savings"
    other = "other"


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="USD")
    description = Column(String(512), nullable=False)
    category = Column(Enum(ExpenseCategory), default=ExpenseCategory.other)
    merchant = Column(String(256), nullable=True)

    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    statement_id = Column(Integer, ForeignKey("statements.id"), nullable=True)
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
