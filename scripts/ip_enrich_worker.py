import time
import sys
import os

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, PROJECT_ROOT)

from database.db import get_db_connection
from database.ip_enrich import enrich_ip, is_private_ip


def get_next_ip(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT host(s.src_ip) AS ip
        FROM sessions s
        LEFT JOIN ip_intel i
          ON host(s.src_ip) = host(i.ip)
        WHERE i.ip IS NULL
          AND s.src_ip NOT << inet '10.0.0.0/8'
          AND s.src_ip NOT << inet '172.16.0.0/12'
          AND s.src_ip NOT << inet '192.168.0.0/16'
          AND s.src_ip NOT << inet '127.0.0.0/8'
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
                print("[+] No pending public IPs. Sleeping...")
                time.sleep(10)
                continue

            if is_private_ip(ip):
                print(f"[~] Skipping private/local IP: {ip}")
                time.sleep(2)
                continue

            print(f"[+] Enriching public IP: {ip}")
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
