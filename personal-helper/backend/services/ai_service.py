"""
Claude-powered AI assistant with full financial + calendar context.
Uses prompt caching for system prompt efficiency.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
import anthropic
from sqlalchemy.orm import Session
from sqlalchemy import func

from models.user import User
from models.expense import Expense
from models.statement import Statement
from config import get_settings

settings = get_settings()

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

MODEL = "claude-sonnet-4-6"


def _build_financial_context(user: User, db: Session) -> str:
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    expenses_this_month = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= month_start,
    ).all()

    total_this_month = sum(e.amount for e in expenses_this_month)
    by_category: dict[str, float] = {}
    for e in expenses_this_month:
        cat = str(e.category or "other")
        by_category[cat] = round(by_category.get(cat, 0.0) + e.amount, 2)

    last_30_days = now - timedelta(days=30)
    recent_expenses = db.query(Expense).filter(
        Expense.user_id == user.id,
        Expense.date >= last_30_days,
    ).order_by(Expense.date.desc()).limit(20).all()

    recent_str = "\n".join(
        f"  - {e.date.strftime('%b %d')}: {e.description} — ${e.amount:.2f} ({e.category})"
        for e in recent_expenses
    ) or "  No recent transactions."

    cat_str = "\n".join(f"  - {k}: ${v:.2f}" for k, v in sorted(by_category.items(), key=lambda x: -x[1]))

    stmt_count = db.query(Statement).filter(Statement.user_id == user.id).count()

    return f"""
== FINANCIAL SNAPSHOT ({now.strftime('%B %Y')}) ==
Total spent this month: ${total_this_month:.2f}
Spending by category:
{cat_str or '  No data yet.'}

Recent transactions (last 30 days):
{recent_str}

Uploaded statements: {stmt_count}
""".strip()


SYSTEM_PROMPT = """You are a private, highly capable personal assistant for {name}. You help with:

1. **Financial management** — Analyzing spending, reducing expenses, building savings habits, budgeting advice
2. **Calendar & scheduling** — Summarizing upcoming events, suggesting scheduling improvements
3. **Email insights** — Summarizing important emails, identifying bills or action items
4. **General life advice** — Answering any question thoughtfully

Your personality:
- Direct, warm, and concise
- Non-judgmental about spending habits
- Proactive in spotting financial risks or savings opportunities
- You always protect the user's privacy — never share data externally

Rules:
- Give actionable advice, not generic platitudes
- When discussing finances, cite actual numbers from the context
- If asked about the week or month, use the financial context provided
- Format responses clearly (use bullet points, bold for key numbers)
- Keep responses focused and readable on mobile
"""


def chat(
    user: User,
    db: Session,
    messages: list[dict],
    calendar_context: Optional[str] = None,
) -> str:
    financial_context = _build_financial_context(user, db)

    context_block = f"""
Current date: {datetime.now(timezone.utc).strftime('%A, %B %d, %Y')}
User: {user.name} ({user.email})

{financial_context}
"""
    if calendar_context:
        context_block += f"\n\n== UPCOMING CALENDAR EVENTS ==\n{calendar_context}"

    system = [
        {
            "type": "text",
            "text": SYSTEM_PROMPT.format(name=user.name),
            "cache_control": {"type": "ephemeral"},
        },
        {
            "type": "text",
            "text": context_block,
        },
    ]

    api_messages = []
    for msg in messages[-20:]:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role in ("user", "assistant") and content:
            api_messages.append({"role": role, "content": content})

    if not api_messages or api_messages[-1]["role"] != "user":
        return "Please ask me something!"

    response = client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system,
        messages=api_messages,
        betas=["prompt-caching-2024-07-31"],
    )

    return response.content[0].text


def get_week_summary(user: User, db: Session, calendar_context: Optional[str] = None) -> str:
    messages = [
        {
            "role": "user",
            "content": (
                "Give me a concise summary of my week. Include:\n"
                "1. My spending so far this month vs any patterns you notice\n"
                "2. Top expense categories and whether they look healthy\n"
                "3. Any quick wins to save money this week\n"
                "4. Upcoming calendar highlights if available\n"
                "Keep it brief and actionable."
            ),
        }
    ]
    return chat(user, db, messages, calendar_context)


def get_financial_advice(user: User, db: Session, question: str) -> str:
    messages = [{"role": "user", "content": question}]
    return chat(user, db, messages)
