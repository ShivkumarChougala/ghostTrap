import time
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from database.db import get_db_connection
from database.ip_enrich import enrich_ip


def get_next_ip(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT host(s.src_ip) AS ip
        FROM sessions s
        LEFT JOIN ip_intel i
          ON host(s.src_ip) = host(i.ip)
        WHERE i.ip IS NULL
        ORDER BY ip
        LIMIT 1;
    """)
    row = cur.fetchone()
    cur.close()

    if not row:
        return None

    return row["ip"]


def main():
    print("[+] IP Enrichment Worker started...")

    while True:
        conn = get_db_connection()

        try:
            ip = get_next_ip(conn)

            if not ip:
                print("[+] No pending IPs. Sleeping...")
                time.sleep(10)
                continue

            print(f"[+] Enriching {ip}")
            enrich_ip(ip)

            time.sleep(1.5)

        except KeyboardInterrupt:
            print("[!] Worker stopped by user")
            break

        except Exception as e:
            print(f"[!] Worker error: {e}")
            time.sleep(5)

        finally:
            conn.close()


if __name__ == "__main__":
    main()
