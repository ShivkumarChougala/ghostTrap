from pydantic import BaseModel
from typing import Optional
from typing import List

class SummaryResponse(BaseModel):
    total_sessions: int
    login_attempts: int
    commands_logged: int
    enriched_ips: int


class TimelinePoint(BaseModel):
    time_bucket: str
    sessions: int
    commands: int


class TopItem(BaseModel):
    label: str
    count: int


class RecentSessionItem(BaseModel):
    session_id: str
    source_ip: str
    start_time: Optional[str]
    end_time: Optional[str]
    honeypot: Optional[str] = None
    vm: Optional[str] = None
    total_commands: Optional[int] = 0
    ai_calls: Optional[int] = 0

class SessionDetail(BaseModel):
    session_id: str
    source_ip: str
    start_time: Optional[str]
    end_time: Optional[str]
    honeypot: Optional[str]
    vm: Optional[str]
    total_commands: Optional[int]
    ai_calls: Optional[int]


class CommandItem(BaseModel):
    command: str
    output: Optional[str]
    timestamp: Optional[str]
