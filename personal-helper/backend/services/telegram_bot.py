"""
Telegram bot — full-featured personal helper via chat.
Supports: /start, /summary, /expenses, /addexpense, /ask, /calendar, /link
"""
import secrets
import logging
from datetime import datetime, timedelta
from typing import Optional
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    ConversationHandler,
    filters,
    ContextTypes,
)
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.expense import Expense, ExpenseCategory
from services import ai_service
from config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)

# Conversation states
ASK_AMOUNT, ASK_DESC, ASK_CATEGORY, ASK_DATE = range(4)
_pending_add: dict[int, dict] = {}


def get_db() -> Session:
    return SessionLocal()


def _get_user_by_telegram(chat_id: str) -> Optional[User]:
    db = get_db()
    try:
        return db.query(User).filter(User.telegram_chat_id == str(chat_id)).first()
    finally:
        db.close()


def _require_linked(func):
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = str(update.effective_chat.id)
        user = _get_user_by_telegram(chat_id)
        if not user:
            await update.message.reply_text(
                "Your Telegram is not linked yet.\n"
                "Open the web app → Settings → Link Telegram to get your link code."
            )
            return
        return await func(update, context, user)
    return wrapper


async def cmd_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    user = _get_user_by_telegram(chat_id)

    args = context.args or []
    if args:
        link_token = args[0]
        db = get_db()
        try:
            pending_user = db.query(User).filter(User.telegram_link_token == link_token).first()
            if pending_user:
                pending_user.telegram_chat_id = chat_id
                pending_user.telegram_link_token = None
                db.commit()
                await update.message.reply_text(
                    f"Linked! Welcome, {pending_user.name}!\n\n"
                    "Commands:\n"
                    "/summary — your week summary\n"
                    "/expenses — recent expenses\n"
                    "/addexpense — add an expense\n"
                    "/ask <question> — ask your AI assistant\n"
                    "/calendar — upcoming events"
                )
                return
            else:
                await update.message.reply_text("Invalid link token. Please try again from the web app.")
                return
        finally:
            db.close()

    if user:
        await update.message.reply_text(
            f"Welcome back, {user.name}!\n\n"
            "/summary — week summary\n"
            "/expenses — recent expenses\n"
            "/addexpense — add an expense\n"
            "/ask <question> — AI assistant\n"
            "/calendar — upcoming events"
        )
    else:
        await update.message.reply_text(
            "Hi! I'm your Personal Finance Helper.\n"
            "To get started, link your account from the web app.\n"
            "Go to Settings → Link Telegram."
        )


@_require_linked
async def cmd_summary(update: Update, context: ContextTypes.DEFAULT_TYPE, user: User):
    await update.message.reply_text("Generating your weekly summary...")
    db = get_db()
    try:
        summary = ai_service.get_week_summary(user, db)
        await update.message.reply_text(summary, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")
    finally:
        db.close()


@_require_linked
async def cmd_expenses(update: Update, context: ContextTypes.DEFAULT_TYPE, user: User):
    db = get_db()
    try:
        since = datetime.utcnow() - timedelta(days=30)
        expenses = (
            db.query(Expense)
            .filter(Expense.user_id == user.id, Expense.date >= since)
            .order_by(Expense.date.desc())
            .limit(10)
            .all()
        )

        if not expenses:
            await update.message.reply_text("No expenses in the last 30 days.")
            return

        total = sum(e.amount for e in expenses)
        lines = [f"*Last 30 days — ${total:.2f} total*\n"]
        for e in expenses:
            lines.append(f"• {e.date.strftime('%b %d')} {e.description[:30]} — *${e.amount:.2f}* ({e.category})")

        await update.message.reply_text("\n".join(lines), parse_mode="Markdown")
    finally:
        db.close()


@_require_linked
async def cmd_addexpense_start(update: Update, context: ContextTypes.DEFAULT_TYPE, user: User):
    _pending_add[update.effective_chat.id] = {"user_id": user.id}
    await update.message.reply_text("How much did you spend? (e.g. 24.50)")
    return ASK_AMOUNT


async def ask_amount(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        amount = float(update.message.text.replace("$", "").replace(",", "").strip())
        if amount <= 0:
            raise ValueError
    except ValueError:
        await update.message.reply_text("Please enter a valid positive number.")
        return ASK_AMOUNT

    _pending_add[update.effective_chat.id]["amount"] = amount
    await update.message.reply_text("What was it for? (description)")
    return ASK_DESC


async def ask_desc(update: Update, context: ContextTypes.DEFAULT_TYPE):
    desc = update.message.text.strip()[:512]
    _pending_add[update.effective_chat.id]["description"] = desc

    keyboard = [
        [InlineKeyboardButton("Food", callback_data="cat_food"), InlineKeyboardButton("Transport", callback_data="cat_transport")],
        [InlineKeyboardButton("Shopping", callback_data="cat_shopping"), InlineKeyboardButton("Utilities", callback_data="cat_utilities")],
        [InlineKeyboardButton("Entertainment", callback_data="cat_entertainment"), InlineKeyboardButton("Health", callback_data="cat_health")],
        [InlineKeyboardButton("Travel", callback_data="cat_travel"), InlineKeyboardButton("Other", callback_data="cat_other")],
    ]
    await update.message.reply_text("Category?", reply_markup=InlineKeyboardMarkup(keyboard))
    return ASK_CATEGORY


async def ask_category(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    cat = query.data.replace("cat_", "")
    chat_id = query.message.chat.id
    _pending_add[chat_id]["category"] = cat

    db = get_db()
    try:
        data = _pending_add.pop(chat_id, {})
        if not data:
            await query.edit_message_text("Session expired. Start again with /addexpense")
            return ConversationHandler.END

        expense = Expense(
            user_id=data["user_id"],
            amount=data["amount"],
            currency="USD",
            description=data["description"],
            category=ExpenseCategory(cat),
            date=datetime.utcnow(),
        )
        db.add(expense)
        db.commit()
        await query.edit_message_text(
            f"Saved! ${data['amount']:.2f} — {data['description']} ({cat})"
        )
    except Exception as e:
        await query.edit_message_text(f"Error saving: {e}")
    finally:
        db.close()

    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    _pending_add.pop(update.effective_chat.id, None)
    await update.message.reply_text("Cancelled.")
    return ConversationHandler.END


@_require_linked
async def cmd_ask(update: Update, context: ContextTypes.DEFAULT_TYPE, user: User):
    question = " ".join(context.args or []).strip()
    if not question:
        await update.message.reply_text("Usage: /ask <your question>\nExample: /ask How can I save more money?")
        return

    await update.message.reply_text("Thinking...")
    db = get_db()
    try:
        answer = ai_service.get_financial_advice(user, db, question)
        await update.message.reply_text(answer, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")
    finally:
        db.close()


@_require_linked
async def cmd_calendar(update: Update, context: ContextTypes.DEFAULT_TYPE, user: User):
    from services.google_auth import get_calendar_service
    from datetime import timezone

    db = get_db()
    try:
        service = get_calendar_service(user, db)
        now = datetime.now(timezone.utc).isoformat()
        result = service.events().list(
            calendarId="primary",
            timeMin=now,
            maxResults=7,
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        events = result.get("items", [])
        if not events:
            await update.message.reply_text("No upcoming events.")
            return

        lines = ["*Upcoming Events:*\n"]
        for e in events:
            start = e.get("start", {})
            start_str = start.get("dateTime", start.get("date", "?"))[:16].replace("T", " ")
            lines.append(f"• {start_str} — {e.get('summary', '(no title)')}")

        await update.message.reply_text("\n".join(lines), parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Calendar error: {e}")
    finally:
        db.close()


async def handle_free_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat_id = str(update.effective_chat.id)
    user = _get_user_by_telegram(chat_id)
    if not user:
        await update.message.reply_text("Please link your account first. See /start")
        return

    text = update.message.text or ""
    db = get_db()
    try:
        reply = ai_service.chat(user, db, [{"role": "user", "content": text}])
        await update.message.reply_text(reply, parse_mode="Markdown")
    except Exception as e:
        await update.message.reply_text(f"Error: {e}")
    finally:
        db.close()


def build_application() -> Application:
    app = Application.builder().token(settings.telegram_bot_token).build()

    add_expense_conv = ConversationHandler(
        entry_points=[CommandHandler("addexpense", cmd_addexpense_start)],
        states={
            ASK_AMOUNT: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_amount)],
            ASK_DESC: [MessageHandler(filters.TEXT & ~filters.COMMAND, ask_desc)],
            ASK_CATEGORY: [CallbackQueryHandler(ask_category, pattern="^cat_")],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )

    app.add_handler(CommandHandler("start", cmd_start))
    app.add_handler(CommandHandler("summary", cmd_summary))
    app.add_handler(CommandHandler("expenses", cmd_expenses))
    app.add_handler(CommandHandler("ask", cmd_ask))
    app.add_handler(CommandHandler("calendar", cmd_calendar))
    app.add_handler(add_expense_conv)
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_free_text))

    return app
