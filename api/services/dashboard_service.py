from fastapi import HTTPException
from database.db import get_db_connection
from fastapi import HTTPException

def get_summary():
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("SELECT COUNT(*) AS count FROM sessions;")
        total_sessions = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM login_attempts;")
        login_attempts = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM commands;")
        commands_logged = cur.fetchone()["count"]

        cur.execute("SELECT COUNT(*) AS count FROM ip_intel;")
        enriched_ips = cur.fetchone()["count"]

        return {
            "total_sessions": total_sessions,
            "login_attempts": login_attempts,
            "commands_logged": commands_logged,
            "enriched_ips": enriched_ips,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch summary: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_timeline():
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                TO_CHAR(DATE_TRUNC('hour', s.start_time), 'YYYY-MM-DD HH24:00') AS time_bucket,
                COUNT(DISTINCT s.session_id) AS sessions,
                COUNT(c.id) AS commands
            FROM sessions s
            LEFT JOIN commands c ON c.session_id = s.session_id
            GROUP BY DATE_TRUNC('hour', s.start_time)
            ORDER BY DATE_TRUNC('hour', s.start_time) DESC
            LIMIT 24;
        """)

        rows = cur.fetchall()

        return [
            {
                "time_bucket": row["time_bucket"],
                "sessions": row["sessions"],
                "commands": row["commands"],
            }
            for row in rows
        ][::-1]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch timeline: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_top_commands(limit=10):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT command AS label, COUNT(*) AS count
            FROM commands
            WHERE command IS NOT NULL AND command <> ''
            GROUP BY command
            ORDER BY count DESC
            LIMIT %s;
        """, (limit,))

        rows = cur.fetchall()
        return [{"label": row["label"], "count": row["count"]} for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top commands: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_top_usernames(limit=10):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT username AS label, COUNT(*) AS count
            FROM login_attempts
            WHERE username IS NOT NULL AND username <> ''
            GROUP BY username
            ORDER BY count DESC
            LIMIT %s;
        """, (limit,))

        rows = cur.fetchall()
        return [{"label": row["label"], "count": row["count"]} for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top usernames: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_top_passwords(limit=10):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT password AS label, COUNT(*) AS count
            FROM login_attempts
            WHERE password IS NOT NULL AND password <> ''
            GROUP BY password
            ORDER BY count DESC
            LIMIT %s;
        """, (limit,))

        rows = cur.fetchall()
        return [{"label": row["label"], "count": row["count"]} for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top passwords: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_top_source_ips(limit=10):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT HOST(src_ip) AS label, COUNT(*) AS count
            FROM sessions
            GROUP BY src_ip
            ORDER BY count DESC
            LIMIT %s;
        """, (limit,))

        rows = cur.fetchall()
        return [{"label": row["label"], "count": row["count"]} for row in rows]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch top source IPs: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_recent_sessions(limit=20):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                start_time,
                end_time,
                honeypot,
                vm,
                total_commands,
                ai_calls
            FROM sessions
            ORDER BY start_time DESC
            LIMIT %s;
        """, (limit,))

        rows = cur.fetchall()

        return [
            {
                "session_id": str(row["session_id"]),
                "source_ip": row["source_ip"],
                "start_time": row["start_time"].isoformat() if row["start_time"] else None,
                "end_time": row["end_time"].isoformat() if row["end_time"] else None,
                "honeypot": row["honeypot"],
                "vm": row["vm"],
                "total_commands": row["total_commands"],
                "ai_calls": row["ai_calls"],
            }
            for row in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch recent sessions: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def get_session_detail(session_id: str):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                session_id,
                HOST(src_ip) AS source_ip,
                start_time,
                end_time,
                honeypot,
                vm,
                total_commands,
                ai_calls
            FROM sessions
            WHERE session_id = %s;
        """, (session_id,))

        row = cur.fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Session not found")

        return {
            "session_id": str(row["session_id"]),
            "source_ip": row["source_ip"],
            "start_time": row["start_time"].isoformat() if row["start_time"] else None,
            "end_time": row["end_time"].isoformat() if row["end_time"] else None,
            "honeypot": row["honeypot"],
            "vm": row["vm"],
            "total_commands": row["total_commands"],
            "ai_calls": row["ai_calls"],
        }

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch session: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()


def get_session_commands(session_id: str, limit=100):
    conn = None
    cur = None

    try:
        conn = get_db_connection()
        cur = conn.cursor()

        cur.execute("""
            SELECT
                command,
                output,
                timestamp
            FROM commands
            WHERE session_id = %s
            ORDER BY timestamp ASC
            LIMIT %s;
        """, (session_id, limit))

        rows = cur.fetchall()

        return [
            {
                "command": row["command"],
                "output": row["output"],
                "timestamp": row["timestamp"].isoformat() if row["timestamp"] else None,
            }
            for row in rows
        ]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch commands: {str(e)}")

    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
