from fastapi import APIRouter, Query
from database.db import get_db_connection

router = APIRouter(tags=["Threats"])


MALWARE_PATTERNS = [
    "%wget%",
    "%curl%",
    "%tftp%",
    "%ftpget%",
    "%busybox wget%",
    "%busybox tftp%",
    "%chmod +x%",
    "%sh %",
    "%bash %",
    "%./%",
]

SENSITIVE_PATTERNS = [
    "%/etc/shadow%",
    "%/etc/passwd%",
    "%/root/.ssh/id_rsa%",
    "%authorized_keys%",
    "%wp-config.php%",
    "%/root/notes.txt%",
]


@router.get(
    "/threats/overview",
    summary="Threat activity overview",
    description="Returns a high-level summary of suspicious command activity, including malware download attempts and sensitive file access attempts for the selected time window."
)
def get_threats_overview(hours: int = Query(24, ge=1, le=8760, description="Time window in hours")):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        malware_sql = " OR ".join(["command ILIKE %s" for _ in MALWARE_PATTERNS])
        sensitive_sql = " OR ".join(["command ILIKE %s" for _ in SENSITIVE_PATTERNS])

        cur.execute(
            f"""
            SELECT COUNT(*) AS malware_attempts
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND ({malware_sql})
            """,
            [hours, *MALWARE_PATTERNS]
        )
        malware_attempts = cur.fetchone()["malware_attempts"]

        cur.execute(
            f"""
            SELECT COUNT(*) AS sensitive_access_attempts
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND ({sensitive_sql})
            """,
            [hours, *SENSITIVE_PATTERNS]
        )
        sensitive_access_attempts = cur.fetchone()["sensitive_access_attempts"]

        cur.execute(
            """
            SELECT COUNT(*) AS total_commands
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
            """,
            (hours,)
        )
        total_commands = cur.fetchone()["total_commands"]

        risk_level = "LOW"
        if malware_attempts > 0 or sensitive_access_attempts > 0:
            risk_level = "HIGH"
        elif total_commands > 0:
            risk_level = "MEDIUM"

        return {
            "data": {
                "window_hours": hours,
                "risk_level": risk_level,
                "total_commands": total_commands,
                "malware_attempts": malware_attempts,
                "sensitive_access_attempts": sensitive_access_attempts
            }
        }
    finally:
        cur.close()
        conn.close()


@router.get(
    "/threats/malware-attempts",
    summary="Recent malware download attempts",
    description="Returns recent suspicious commands associated with malware retrieval or execution behavior, such as wget, curl, tftp, and shell-launch patterns."
)
def get_malware_attempts(
    limit: int = Query(20, ge=1, le=200, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        malware_sql = " OR ".join(["command ILIKE %s" for _ in MALWARE_PATTERNS])

        cur.execute(
            f"""
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                command,
                cwd,
                timestamp
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND ({malware_sql})
            ORDER BY timestamp DESC
            LIMIT %s
            """,
            [hours, *MALWARE_PATTERNS, limit]
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
    "/threats/sensitive-access",
    summary="Recent sensitive file access attempts",
    description="Returns recent commands targeting sensitive files such as /etc/shadow, SSH private keys, and application secrets."
)
def get_sensitive_access(
    limit: int = Query(20, ge=1, le=200, description="Maximum number of results"),
    hours: int = Query(24, ge=1, le=8760, description="Time window in hours")
):
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        sensitive_sql = " OR ".join(["command ILIKE %s" for _ in SENSITIVE_PATTERNS])

        cur.execute(
            f"""
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                command,
                cwd,
                timestamp
            FROM commands
            WHERE timestamp >= NOW() - (%s || ' hours')::interval
              AND ({sensitive_sql})
            ORDER BY timestamp DESC
            LIMIT %s
            """,
            [hours, *SENSITIVE_PATTERNS, limit]
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
