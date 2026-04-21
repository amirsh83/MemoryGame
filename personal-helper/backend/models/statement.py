from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Enum
import enum
from database import Base


class StatementType(str, enum.Enum):
    credit_card = "credit_card"
    bank = "bank"
    investment = "investment"


class Statement(Base):
    __tablename__ = "statements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    filename = Column(String(512), nullable=False)
    statement_type = Column(Enum(StatementType), nullable=False)
    institution = Column(String(256), nullable=True)
    period_start = Column(DateTime, nullable=True)
    period_end = Column(DateTime, nullable=True)
    total_amount = Column(Float, nullable=True)
    currency = Column(String(8), default="USD")

    # Encrypted file path on disk
    file_path = Column(Text, nullable=True)
    parsed = Column(String(8), default="no")

    uploaded_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
