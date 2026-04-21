import base64
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from services.google_auth import get_gmail_service

router = APIRouter(prefix="/mail", tags=["mail"])


def _decode_body(payload: dict) -> str:
    body = ""
    mime_type = payload.get("mimeType", "")
    data = payload.get("body", {}).get("data", "")

    if data:
        try:
            body = base64.urlsafe_b64decode(data + "==").decode("utf-8", errors="replace")
        except Exception:
            pass

    if not body and "parts" in payload:
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain":
                part_data = part.get("body", {}).get("data", "")
                if part_data:
                    try:
                        body = base64.urlsafe_b64decode(part_data + "==").decode("utf-8", errors="replace")
                        break
                    except Exception:
                        pass

    return body


@router.get("/messages")
def list_messages(
    query: str = "",
    max_results: int = 20,
    page_token: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_gmail_service(user, db)
    params = {
        "userId": "me",
        "maxResults": min(max_results, 100),
        "q": query,
    }
    if page_token:
        params["pageToken"] = page_token

    result = service.users().messages().list(**params).execute()
    message_ids = [m["id"] for m in result.get("messages", [])]

    messages = []
    for msg_id in message_ids[:max_results]:
        try:
            msg = service.users().messages().get(userId="me", id=msg_id, format="metadata",
                metadataHeaders=["From", "Subject", "Date"]).execute()
            headers = {h["name"]: h["value"] for h in msg.get("payload", {}).get("headers", [])}
            messages.append({
                "id": msg_id,
                "thread_id": msg.get("threadId"),
                "from": headers.get("From", ""),
                "subject": headers.get("Subject", "(no subject)"),
                "date": headers.get("Date", ""),
                "snippet": msg.get("snippet", ""),
                "label_ids": msg.get("labelIds", []),
            })
        except Exception:
            continue

    return {
        "messages": messages,
        "next_page_token": result.get("nextPageToken"),
        "result_size_estimate": result.get("resultSizeEstimate", 0),
    }


@router.get("/messages/{message_id}")
def get_message(
    message_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_gmail_service(user, db)
    try:
        msg = service.users().messages().get(userId="me", id=message_id, format="full").execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Message not found")

    payload = msg.get("payload", {})
    headers = {h["name"]: h["value"] for h in payload.get("headers", [])}
    body = _decode_body(payload)

    return {
        "id": message_id,
        "thread_id": msg.get("threadId"),
        "from": headers.get("From", ""),
        "to": headers.get("To", ""),
        "subject": headers.get("Subject", "(no subject)"),
        "date": headers.get("Date", ""),
        "body": body,
        "snippet": msg.get("snippet", ""),
        "label_ids": msg.get("labelIds", []),
    }


@router.get("/labels")
def list_labels(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_gmail_service(user, db)
    result = service.users().labels().list(userId="me").execute()
    return {"labels": result.get("labels", [])}


@router.get("/threads")
def list_threads(
    query: str = "",
    max_results: int = 20,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_gmail_service(user, db)
    result = service.users().threads().list(
        userId="me",
        q=query,
        maxResults=min(max_results, 100),
    ).execute()
    return {
        "threads": result.get("threads", []),
        "next_page_token": result.get("nextPageToken"),
    }
