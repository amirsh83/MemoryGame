from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from middleware.auth import get_current_user
from models.user import User
from services.google_auth import get_calendar_service

router = APIRouter(prefix="/calendar", tags=["calendar"])


class EventCreate(BaseModel):
    summary: str
    description: Optional[str] = None
    location: Optional[str] = None
    start: str  # ISO 8601 datetime string
    end: str
    timezone: str = "UTC"
    all_day: bool = False


class EventUpdate(BaseModel):
    summary: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    start: Optional[str] = None
    end: Optional[str] = None
    timezone: Optional[str] = None


@router.get("/events")
def list_events(
    time_min: Optional[str] = None,
    time_max: Optional[str] = None,
    max_results: int = 50,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)
    now = datetime.now(timezone.utc).isoformat()
    params = {
        "calendarId": "primary",
        "timeMin": time_min or now,
        "maxResults": min(max_results, 250),
        "singleEvents": True,
        "orderBy": "startTime",
    }
    if time_max:
        params["timeMax"] = time_max

    result = service.events().list(**params).execute()
    return {"events": result.get("items", []), "next_page_token": result.get("nextPageToken")}


@router.get("/events/{event_id}")
def get_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)
    try:
        event = service.events().get(calendarId="primary", eventId=event_id).execute()
    except Exception as e:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.post("/events", status_code=201)
def create_event(
    body: EventCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)

    if body.all_day:
        event_body = {
            "summary": body.summary,
            "description": body.description,
            "location": body.location,
            "start": {"date": body.start[:10]},
            "end": {"date": body.end[:10]},
        }
    else:
        event_body = {
            "summary": body.summary,
            "description": body.description,
            "location": body.location,
            "start": {"dateTime": body.start, "timeZone": body.timezone},
            "end": {"dateTime": body.end, "timeZone": body.timezone},
        }

    event_body = {k: v for k, v in event_body.items() if v is not None}

    try:
        created = service.events().insert(calendarId="primary", body=event_body).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return created


@router.patch("/events/{event_id}")
def update_event(
    event_id: str,
    body: EventUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)
    try:
        existing = service.events().get(calendarId="primary", eventId=event_id).execute()
    except Exception:
        raise HTTPException(status_code=404, detail="Event not found")

    if body.summary is not None:
        existing["summary"] = body.summary
    if body.description is not None:
        existing["description"] = body.description
    if body.location is not None:
        existing["location"] = body.location
    if body.start is not None:
        tz = body.timezone or existing.get("start", {}).get("timeZone", "UTC")
        existing["start"] = {"dateTime": body.start, "timeZone": tz}
    if body.end is not None:
        tz = body.timezone or existing.get("end", {}).get("timeZone", "UTC")
        existing["end"] = {"dateTime": body.end, "timeZone": tz}

    try:
        updated = service.events().update(calendarId="primary", eventId=event_id, body=existing).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return updated


@router.delete("/events/{event_id}", status_code=204)
def delete_event(
    event_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)
    try:
        service.events().delete(calendarId="primary", eventId=event_id).execute()
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/calendars")
def list_calendars(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = get_calendar_service(user, db)
    result = service.calendarList().list().execute()
    return {"calendars": result.get("items", [])}
