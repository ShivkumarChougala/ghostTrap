from fastapi import APIRouter, Query
from database.db import get_db_connection

router = APIRouter(tags=["Analytics"])


@router.get(
    "/analytics/commands",
    summary="Top attacker commands",
    description="Returns the most frequently observed commands in the selected time window."
)
def get_top_commands(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT command, COUNT(*) AS count
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND command IS NOT NULL
              AND TRIM(command) <> ''
            GROUP BY command
            ORDER BY count DESC, command ASC
            LIMIT %s
            """,
            (hours, limit)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "limit": limit,
                "hours": hours
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/analytics/usernames",
    summary="Top attempted usernames",
    description="Returns the most common usernames used in login attempts for the selected time window."
)
def get_top_usernames(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT username, COUNT(*) AS count
            FROM login_attempts
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND username IS NOT NULL
              AND TRIM(username) <> ''
            GROUP BY username
            ORDER BY count DESC, username ASC
            LIMIT %s
            """,
            (hours, limit)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "limit": limit,
                "hours": hours
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/analytics/passwords",
    summary="Top attempted passwords",
    description="Internal-only endpoint for dashboard and admin analysis. Not intended for future public API exposure."
)
def get_top_passwords(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT password, COUNT(*) AS count
            FROM login_attempts
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND password IS NOT NULL
              AND TRIM(password) <> ''
            GROUP BY password
            ORDER BY count DESC, password ASC
            LIMIT %s
            """,
            (hours, limit)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "limit": limit,
                "hours": hours
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/analytics/source-ips",
    summary="Top source IPs",
    description="Internal-only endpoint for dashboard and admin analysis. Not intended for future public API exposure."
)
def get_top_source_ips(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            SELECT HOST(src_ip) AS source_ip, COUNT(*) AS count
            FROM sessions
            WHERE start_time >= NOW() - (%s || ' hours')::interval
              AND src_ip IS NOT NULL
            GROUP BY src_ip
            ORDER BY count DESC, source_ip ASC
            LIMIT %s
            """,
            (hours, limit)
        )

        rows = cur.fetchall()

        return {
            "data": rows,
            "meta": {
                "limit": limit,
                "hours": hours
            }
        }
    finally:
        cur.close()
        conn.close()
