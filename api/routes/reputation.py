from fastapi import APIRouter, HTTPException
from database.db import get_db_connection

router = APIRouter(prefix="/reputation", tags=["ReputationWatch"])


@router.get("/ip/{ip}")
def lookup_ip(ip: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            ip,
            country,
            country_code,
            city,
            asn,
            isp,
            org,
            attack_type,
            risk_score,
            confidence,
            first_seen,
            last_seen,
            seen_count,
            command_count,
            sensor_count,
            sources
        FROM reputationwatch_ips
        WHERE ip = %s
    """, (ip,))

    row = cur.fetchone()

    cur.close()
    conn.close()

    if not row:
        raise HTTPException(status_code=404, detail="IP not found in ReputationWatch")

    return {
        "data": {
            "ip": row[0],
            "country": row[1],
            "country_code": row[2],
            "city": row[3],
            "asn": row[4],
            "isp": row[5],
            "org": row[6],
            "attack_type": row[7],
            "risk_score": row[8],
            "confidence": row[9],
            "first_seen": row[10],
            "last_seen": row[11],
            "seen_count": row[12],
            "command_count": row[13],
            "sensor_count": row[14],
            "sources": row[15],
        }
    }
