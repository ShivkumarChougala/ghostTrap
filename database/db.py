import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "dbname": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


def get_db_connection():
    return psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)


def create_session(session):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        sensor_id = session.get("sensor_id")

        if not sensor_id:
            raise ValueError("sensor_id is required for live ingestion")

        cur.execute("""
            INSERT INTO sessions (
                session_id,
                src_ip,
                fake_user,
                start_time,
                honeypot,
                vm,
                ai_calls,
                sensor_id,
                sensor_country,
                sensor_region,
                sensor_provider
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            session["session_id"],
            session.get("client_ip") or session.get("src_ip"),
            session.get("user") or session.get("username"),
            session["start_time"],
            session.get("honeypot", "ssh"),
            session.get("vm", "ubuntu"),
            session.get("ai_calls", 0),
            session.get("sensor_id"),
            session.get("sensor_country"),
            session.get("sensor_region"),
            session.get("sensor_provider"),
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
            session_id,
            src_ip,
            username,
            password,
            attempt_number,
            success,
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
            session_id,
            src_ip,
            command,
            output,
            cwd,
        ))
        conn.commit()
    finally:
        cur.close()
        conn.close()
