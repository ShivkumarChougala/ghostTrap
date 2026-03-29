from api.schemas.dashboard import SessionDetail, CommandItem
from api.services.dashboard_service import get_session_detail, get_session_commands
from typing import List
from typing import List
from fastapi import APIRouter, Query
from api.schemas.dashboard import (
    SummaryResponse,
    TimelinePoint,
    TopItem,
    RecentSessionItem,
)
from api.services.dashboard_service import (
    get_summary,
    get_timeline,
    get_top_commands,
    get_top_usernames,
    get_top_passwords,
    get_top_source_ips,
    get_recent_sessions,
)

router = APIRouter(prefix="/api/v1", tags=["Dashboard"])


@router.get("/summary", response_model=SummaryResponse)
def summary():
    return get_summary()


@router.get("/timeline", response_model=List[TimelinePoint])
def timeline():
    return get_timeline()


@router.get("/top-commands", response_model=List[TopItem])
def top_commands(limit: int = Query(10, ge=1, le=100)):
    return get_top_commands(limit)


@router.get("/top-usernames", response_model=List[TopItem])
def top_usernames(limit: int = Query(10, ge=1, le=100)):
    return get_top_usernames(limit)


@router.get("/top-passwords", response_model=List[TopItem])
def top_passwords(limit: int = Query(10, ge=1, le=100)):
    return get_top_passwords(limit)


@router.get("/top-source-ips", response_model=List[TopItem])
def top_source_ips(limit: int = Query(10, ge=1, le=100)):
    return get_top_source_ips(limit)


@router.get("/recent-sessions", response_model=List[RecentSessionItem])
def recent_sessions(limit: int = Query(20, ge=1, le=100)):
    return get_recent_sessions(limit)

@router.get("/sessions/{session_id}", response_model=SessionDetail)
def session_detail(session_id: str):
    return get_session_detail(session_id)


@router.get("/sessions/{session_id}/commands", response_model=List[CommandItem])
def session_commands(session_id: str, limit: int = Query(100, ge=1, le=500)):
    return get_session_commands(session_id, limit)
