import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime

DB_CONFIG = {
    "host": "192.168.31.190",
    "port": 5432,
    "dbname": "ghosttrap",
    "user": "ghosttrap_user",
    "password": "your_password"
}

def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)

def create_session(session):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO sessions (
                session_id, src_ip, fake_user, start_time, honeypot, vm, ai_calls
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            session["session_id"],
            session["client_ip"],
            session["user"],
            session["start_time"],
            "ssh",
            "ubuntu",
            session.get("ai_calls", 0)
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

def log_login_attempt(session_id, src_ip, username, password, attempt_number, success=False):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO login_attempts (
                session_id, src_ip, username, password, attempt_number, success
            ) VALUES (%s, %s, %s, %s, %s, %s)
        """, (
            session_id, src_ip, username, password, attempt_number, success
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

def log_command(session_id, src_ip, command, output=None, cwd=None):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO commands (
                session_id, src_ip, command, output, cwd
            ) VALUES (%s, %s, %s, %s, %s)
        """, (
            session_id, src_ip, command, output, cwd
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()

def end_session(session):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        end_time = datetime.now()
        duration = end_time - session["start_time"]

        cur.execute("""
            UPDATE sessions
            SET end_time = %s,
                duration = %s,
                total_commands = %s,
                ai_calls = %s,
                fake_user = %s
            WHERE session_id = %s
        """, (
            end_time,
            duration,
            len(session["history"]),
            session.get("ai_calls", 0),
            session["user"],
            session["session_id"]
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()
