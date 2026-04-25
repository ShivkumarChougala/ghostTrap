from datetime import timezone as dt_timezone
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

from database.db import get_db_connection

router = APIRouter(tags=["Sessions"])


def get_attacker_time(start_time, attacker_timezone):
    if not start_time or not attacker_timezone:
        return {
            "attacker_local_time": None,
            "attacker_hour": None,
            "attacker_day": None,
        }

    try:
        if start_time.tzinfo is None:
            start_time = start_time.replace(tzinfo=dt_timezone.utc)

        local_dt = start_time.astimezone(ZoneInfo(attacker_timezone))

        return {
            "attacker_local_time": local_dt.isoformat(),
            "attacker_hour": local_dt.hour,
            "attacker_day": local_dt.strftime("%A"),
        }

    except Exception:
        return {
            "attacker_local_time": None,
            "attacker_hour": None,
            "attacker_day": None,
        }


@router.get(
    "/sessions",
    summary="Recent sessions",
    description="Internal-only endpoint returning recent honeypot sessions for dashboard and admin use.",
)
def get_sessions(limit: int = Query(20, ge=1, le=100, description="Maximum number of results")):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                s.session_id,
                HOST(s.src_ip) AS source_ip,
                i.country,
                i.country_code,
                i.city,
                i.asn,
                i.isp,
                i.org,
                i.timezone,
                i.latitude,
                i.longitude,
                s.honeypot,
                s.vm,
                s.total_commands,
                s.ai_calls,
                s.start_time,
                s.end_time
            FROM sessions s
            LEFT JOIN ip_intel i
              ON HOST(s.src_ip) = HOST(i.ip)
            ORDER BY s.start_time DESC
            LIMIT %s
            """,
            (limit,),
        )

        rows = cur.fetchall()
        data = []

        for row in rows:
            item = dict(row)
            item.update(get_attacker_time(item.get("start_time"), item.get("timezone")))
            data.append(item)

        return {
            "data": data,
            "meta": {
                "limit": limit,
            },
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/sessions/{session_id}",
    summary="Session detail",
    description="Internal-only endpoint returning detailed metadata for a specific session.",
)
def get_session_detail(session_id: str):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                s.session_id,
                HOST(s.src_ip) AS source_ip,
                s.fake_user,
                i.country,
                i.country_code,
                i.city,
                i.asn,
                i.isp,
                i.org,
                i.timezone,
                i.latitude,
                i.longitude,
                s.honeypot,
                s.vm,
                s.total_commands,
                s.ai_calls,
                s.start_time,
                s.end_time,
                s.duration
            FROM sessions s
            LEFT JOIN ip_intel i
              ON HOST(s.src_ip) = HOST(i.ip)
            WHERE s.session_id = %s
            """,
            (session_id,),
        )

        row = cur.fetchone()

        if not row:
            return JSONResponse(
                status_code=404,
                content={
                    "error": {
                        "code": "not_found",
                        "message": f"Session {session_id} not found",
                    }
                },
            )

        item = dict(row)
        item.update(get_attacker_time(item.get("start_time"), item.get("timezone")))

        return {
            "data": item,
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/sessions/{session_id}/commands",
    summary="Session commands",
    description="Internal-only endpoint returning recorded commands for a specific session.",
)
def get_session_commands(
    session_id: str,
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results"),
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                command,
                output,
                cwd,
                timestamp
            FROM commands
            WHERE session_id = %s
            ORDER BY timestamp ASC
            LIMIT %s
            """,
            (session_id, limit),
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "session_id": session_id,
                "limit": limit,
            },
        }
    finally:
        cur.close()
        conn.close()
