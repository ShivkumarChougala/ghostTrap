from fastapi import APIRouter
from database.db import get_db_connection

router = APIRouter(prefix="/api/v1/ip-intel", tags=["IP Intelligence"])


@router.get("/summary")
def ip_intel_summary():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT COUNT(DISTINCT host(src_ip)) AS unique_ips
        FROM sessions;
    """)
    unique_ips = cur.fetchone()["unique_ips"] or 0

    cur.execute("""
        SELECT COUNT(DISTINCT host(i.ip)) AS enriched_ips
        FROM sessions s
        JOIN ip_intel i
          ON host(s.src_ip) = host(i.ip);
    """)
    enriched_ips = cur.fetchone()["enriched_ips"] or 0

    pending_ips = unique_ips - enriched_ips
    coverage_percent = round((enriched_ips / unique_ips) * 100, 2) if unique_ips else 0

    cur.execute("""
        SELECT country, COUNT(*) AS count
        FROM ip_intel
        WHERE country IS NOT NULL
        GROUP BY country
        ORDER BY count DESC
        LIMIT 5;
    """)
    top_countries = cur.fetchall()

    cur.execute("""
        SELECT asn, COUNT(*) AS count
        FROM ip_intel
        WHERE asn IS NOT NULL
        GROUP BY asn
        ORDER BY count DESC
        LIMIT 5;
    """)
    top_asns = cur.fetchall()

    cur.execute("""
        SELECT ip, country, city, asn, isp, last_seen
        FROM ip_intel
        ORDER BY last_seen DESC
        LIMIT 10;
    """)
    recent = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "unique_ips": unique_ips,
        "enriched_ips": enriched_ips,
        "pending_ips": pending_ips,
        "coverage_percent": coverage_percent,
        "top_countries": top_countries,
        "top_asns": top_asns,
        "recent": recent,
    }
