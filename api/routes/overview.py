from fastapi import APIRouter, Query
from database.db import get_db_connection

router = APIRouter(tags=["Overview"])


@router.get(
    "/overview",
    summary="Overview metrics",
    description="Returns high-level GhostTrap activity metrics for the selected time window, including sessions, login attempts, commands, enriched IPs, and AI calls."
)
def get_overview(hours: int = Query(24, ge=1, le=8760, description="Time window in hours")):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT COUNT(*) AS total_sessions
            FROM sessions
            WHERE start_time >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        total_sessions = cur.fetchone()["total_sessions"]

        cur.execute(
            """
            SELECT COUNT(*) AS login_attempts
            FROM login_attempts
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        login_attempts = cur.fetchone()["login_attempts"]

        cur.execute(
            """
            SELECT COUNT(*) AS commands_logged
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        commands_logged = cur.fetchone()["commands_logged"]

        cur.execute(
            """
            SELECT COUNT(DISTINCT s.src_ip) AS enriched_ips
            FROM sessions s
            JOIN ip_intel i ON s.src_ip = i.ip
            WHERE s.start_time >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        enriched_ips = cur.fetchone()["enriched_ips"]

        cur.execute(
            """
            SELECT COALESCE(SUM(ai_calls), 0) AS ai_calls
            FROM sessions
            WHERE start_time >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        ai_calls = cur.fetchone()["ai_calls"]

        return {
            "data": {
                "window_hours": hours,
                "total_sessions": total_sessions,
                "login_attempts": login_attempts,
                "commands_logged": commands_logged,
                "enriched_ips": enriched_ips,
                "ai_calls": ai_calls,
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/overview/timeline",
    summary="Activity timeline",
    description="Returns time-bucketed session and command activity for the selected time window."
)
def get_timeline(
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours"),
    interval: str = Query("hour", pattern="^(hour|day)$", description="Aggregation interval: hour or day")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        date_trunc_unit = "hour" if interval == "hour" else "day"

        cur.execute(
            f"""
            WITH session_data AS (
                SELECT
                    DATE_TRUNC('{date_trunc_unit}', start_time) AS bucket,
                    COUNT(*) AS session_count
                FROM sessions
                WHERE start_time >= NOW() - (%s || ' hours')::interval
                GROUP BY bucket
            ),
            command_data AS (
                SELECT
                    DATE_TRUNC('{date_trunc_unit}', timestamp) AS bucket,
                    COUNT(*) AS command_count
                FROM commands
                WHERE timestamp >= NOW() - (%s || ' hours')::interval
                GROUP BY bucket
            )
            SELECT
                COALESCE(s.bucket, c.bucket) AS timestamp,
                COALESCE(s.session_count, 0) AS sessions,
                COALESCE(c.command_count, 0) AS commands
            FROM session_data s
            FULL OUTER JOIN command_data c
                ON s.bucket = c.bucket
            ORDER BY timestamp ASC
            """,
            (hours, hours)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "hours": hours,
                "interval": interval
            }
        }
    finally:
        cur.close()
        conn.close()
