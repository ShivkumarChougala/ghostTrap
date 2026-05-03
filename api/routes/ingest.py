import os
from fastapi import APIRouter, Header, HTTPException, Request
from database.db import create_session, log_command

router = APIRouter(prefix="/api/v1/ingest", tags=["Ingest"])


def verify_token(
    x_token: str | None,
    x_ingest_token: str | None,
    authorization: str | None,
    x_ghosttrap_token: str | None = None,
):
    expected = os.getenv("GHOSTTRAP_INGEST_TOKEN")

    if not expected:
        raise HTTPException(status_code=500, detail="Ingest token not configured")

    candidates = [
        x_token,
        x_ingest_token,
        x_ghosttrap_token,
    ]

    if authorization:
        candidates.append(authorization)
        if authorization.lower().startswith("bearer "):
            candidates.append(authorization.split(" ", 1)[1])

    if expected not in candidates:
        raise HTTPException(status_code=401, detail="Invalid ingest token")


async def auth_and_payload(
    request: Request,
    x_token: str | None,
    x_ingest_token: str | None,
    authorization: str | None,
    x_ghosttrap_token: str | None = None,
):
    verify_token(x_token, x_ingest_token, authorization, x_ghosttrap_token)
    return await request.json()


@router.post("/sessions")
@router.post("/session")
async def ingest_session(
    request: Request,
    x_token: str | None = Header(default=None),
    x_ingest_token: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    x_ghosttrap_token: str | None = Header(default=None),
):
    payload = await auth_and_payload(request, x_token, x_ingest_token, authorization, x_ghosttrap_token)

    create_session(payload)

    return {
        "status": "ok",
        "message": "session ingested",
        "session_id": payload.get("session_id"),
    }


@router.post("/commands")
@router.post("/command")
async def ingest_command(
    request: Request,
    x_token: str | None = Header(default=None),
    x_ingest_token: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    x_ghosttrap_token: str | None = Header(default=None),
):
    payload = await auth_and_payload(request, x_token, x_ingest_token, authorization, x_ghosttrap_token)

    log_command(
        session_id=payload.get("session_id"),
        src_ip=payload.get("src_ip"),
        command=payload.get("command"),
        output=payload.get("output"),
        cwd=payload.get("cwd"),
    )

    return {
        "status": "ok",
        "message": "command ingested",
        "session_id": payload.get("session_id"),
    }


@router.post("/login-attempts")
async def ingest_login_attempt(
    request: Request,
    x_token: str | None = Header(default=None),
    x_ingest_token: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    x_ghosttrap_token: str | None = Header(default=None),
):
    payload = await auth_and_payload(request, x_token, x_ingest_token, authorization, x_ghosttrap_token)

    from database.db import get_db_connection

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            INSERT INTO login_attempts (
                session_id,
                src_ip,
                username,
                password,
                attempt_number,
                success,
                timestamp
            )
            VALUES (
                %(session_id)s,
                %(src_ip)s,
                %(username)s,
                %(password)s,
                %(attempt_number)s,
                %(success)s,
                COALESCE(%(timestamp)s::timestamp, NOW())
            )
            """,
            {
                "session_id": payload.get("session_id"),
                "src_ip": payload.get("src_ip") or payload.get("client_ip"),
                "username": payload.get("username") or payload.get("fake_user"),
                "password": payload.get("password"),
                "attempt_number": payload.get("attempt_number") or payload.get("attempt") or 1,
                "success": payload.get("success", True),
                "timestamp": payload.get("timestamp"),
            },
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {
        "status": "ok",
        "message": "login attempt ingested",
        "session_id": payload.get("session_id"),
    }



@router.post("/sessions/{session_id}/end")
async def ingest_session_end(
    session_id: str,
    request: Request,
    x_token: str | None = Header(default=None),
    x_ingest_token: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    x_ghosttrap_token: str | None = Header(default=None),
):
    payload = await auth_and_payload(request, x_token, x_ingest_token, authorization, x_ghosttrap_token)

    from database.db import get_db_connection

    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            UPDATE sessions
            SET
                end_time = COALESCE(%(end_time)s::timestamp, NOW()),
                total_commands = COALESCE(%(total_commands)s, total_commands),
                ai_calls = COALESCE(%(ai_calls)s, ai_calls)
            WHERE session_id = %(session_id)s
            """,
            {
                "session_id": session_id,
                "end_time": payload.get("end_time") or payload.get("timestamp"),
                "total_commands": payload.get("total_commands"),
                "ai_calls": payload.get("ai_calls"),
            },
        )
        conn.commit()
    finally:
        cur.close()
        conn.close()

    return {
        "status": "ok",
        "message": "session ended",
        "session_id": session_id,
    }


@router.get("/health")
def ingest_health(
    x_token: str | None = Header(default=None),
    x_ingest_token: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
    x_ghosttrap_token: str | None = Header(default=None),
):
    verify_token(x_token, x_ingest_token, authorization, x_ghosttrap_token)

    return {
        "status": "ok",
        "message": "ingest route ready",
    }
