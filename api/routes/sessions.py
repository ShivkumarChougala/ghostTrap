from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse
from database.db import get_db_connection

router = APIRouter(tags=["Sessions"])


@router.get(
    "/sessions",
    summary="Recent sessions",
    description="Internal-only endpoint returning recent honeypot sessions for dashboard and admin use."
)
def get_sessions(limit: int = Query(20, ge=1, le=100, description="Maximum number of results")):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                honeypot,
                vm,
                total_commands,
                ai_calls,
                start_time,
                end_time
            FROM sessions
            ORDER BY start_time DESC
            LIMIT %s
            """,
            (limit,)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "limit": limit
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/sessions/{session_id}",
    summary="Session detail",
    description="Internal-only endpoint returning detailed metadata for a specific session."
)
def get_session_detail(session_id: str):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                fake_user,
                honeypot,
                vm,
                total_commands,
                ai_calls,
                start_time,
                end_time,
                duration
            FROM sessions
            WHERE session_id = %s
            """,
            (session_id,)
        )

        row = cur.fetchone()

        if not row:
            return JSONResponse(
                status_code=404,
                content={
                    "error": {
                        "code": "not_found",
                        "message": f"Session {session_id} not found"
                    }
                }
            )

        return {
            "data": row
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/sessions/{session_id}/commands",
    summary="Session commands",
    description="Internal-only endpoint returning recorded commands for a specific session."
)
def get_session_commands(
    session_id: str,
    limit: int = Query(100, ge=1, le=500, description="Maximum number of results")
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
            (session_id, limit)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "session_id": session_id,
                "limit": limit
            }
        }
    finally:
        cur.close()
        conn.close()
