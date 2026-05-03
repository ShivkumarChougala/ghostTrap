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
@router.get(
    "/analytics/regions",
    summary="Regional attack intelligence",
    description="Returns attacker activity grouped by country with IP, ASN, city, username, and latest activity."
)
def get_regional_attack_intelligence(
    limit: int = Query(10, ge=1, le=100, description="Maximum number of regions"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute(
            """
            WITH country_base AS (
                SELECT
                    COALESCE(ii.country, 'Unknown') AS country,
                    COALESCE(ii.country_code, '') AS country_code,
                    COUNT(s.session_id) AS attacks,
                    COUNT(DISTINCT s.src_ip) AS unique_ips,
                    MAX(s.start_time) AS last_seen
                FROM sessions s
                LEFT JOIN ip_intel ii
                    ON HOST(s.src_ip) = ii.ip
                WHERE s.start_time >= NOW() - (%s || ' hours')::interval
                GROUP BY COALESCE(ii.country, 'Unknown'), COALESCE(ii.country_code, '')
            ),

            top_ips AS (
                SELECT DISTINCT ON (COALESCE(ii.country, 'Unknown'))
                    COALESCE(ii.country, 'Unknown') AS country,
                    HOST(s.src_ip) AS top_ip,
                    COUNT(*) AS ip_count
                FROM sessions s
                LEFT JOIN ip_intel ii
                    ON HOST(s.src_ip) = ii.ip
                WHERE s.start_time >= NOW() - (%s || ' hours')::interval
                GROUP BY COALESCE(ii.country, 'Unknown'), HOST(s.src_ip)
                ORDER BY COALESCE(ii.country, 'Unknown'), COUNT(*) DESC
            ),

            top_usernames AS (
                SELECT DISTINCT ON (COALESCE(ii.country, 'Unknown'))
                    COALESCE(ii.country, 'Unknown') AS country,
                    la.username AS top_username,
                    COUNT(*) AS username_count
                FROM login_attempts la
                LEFT JOIN sessions s
                    ON la.session_id = s.session_id
                LEFT JOIN ip_intel ii
                    ON HOST(s.src_ip) = ii.ip
                WHERE la.timestamp >= NOW() - (%s || ' hours')::interval
                  AND la.username IS NOT NULL
                  AND TRIM(la.username) <> ''
                GROUP BY COALESCE(ii.country, 'Unknown'), la.username
                ORDER BY COALESCE(ii.country, 'Unknown'), COUNT(*) DESC
            ),

            top_asns AS (
                SELECT DISTINCT ON (COALESCE(ii.country, 'Unknown'))
                    COALESCE(ii.country, 'Unknown') AS country,
                    ii.asn AS top_asn,
                    COUNT(*) AS asn_count
                FROM sessions s
                LEFT JOIN ip_intel ii
                    ON HOST(s.src_ip) = ii.ip
                WHERE s.start_time >= NOW() - (%s || ' hours')::interval
                  AND ii.asn IS NOT NULL
                  AND TRIM(ii.asn) <> ''
                GROUP BY COALESCE(ii.country, 'Unknown'), ii.asn
                ORDER BY COALESCE(ii.country, 'Unknown'), COUNT(*) DESC
            ),

            top_cities AS (
                SELECT DISTINCT ON (COALESCE(ii.country, 'Unknown'))
                    COALESCE(ii.country, 'Unknown') AS country,
                    ii.city AS top_city,
                    COUNT(*) AS city_count
                FROM sessions s
                LEFT JOIN ip_intel ii
                    ON HOST(s.src_ip) = ii.ip
                WHERE s.start_time >= NOW() - (%s || ' hours')::interval
                  AND ii.city IS NOT NULL
                  AND TRIM(ii.city) <> ''
                GROUP BY COALESCE(ii.country, 'Unknown'), ii.city
                ORDER BY COALESCE(ii.country, 'Unknown'), COUNT(*) DESC
            )

            SELECT
                cb.country,
                cb.country_code,
                cb.attacks,
                cb.unique_ips,
                ti.top_ip,
                tc.top_city,
                ta.top_asn,
                tu.top_username,
                cb.last_seen
            FROM country_base cb
            LEFT JOIN top_ips ti ON cb.country = ti.country
            LEFT JOIN top_cities tc ON cb.country = tc.country
            LEFT JOIN top_asns ta ON cb.country = ta.country
            LEFT JOIN top_usernames tu ON cb.country = tu.country
            ORDER BY cb.attacks DESC
            LIMIT %s;
            """,
            (hours, hours, hours, hours, hours, limit)
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
