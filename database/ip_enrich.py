import time
import requests
from loguru import logger

from database.db import get_ip_intel, upsert_ip_intel, touch_ip_last_seen


PRIVATE_PREFIXES = (
    "127.",
    "10.",
    "192.168.",
    "172.16.",
    "172.17.",
    "172.18.",
    "172.19.",
    "172.20.",
    "172.21.",
    "172.22.",
    "172.23.",
    "172.24.",
    "172.25.",
    "172.26.",
    "172.27.",
    "172.28.",
    "172.29.",
    "172.30.",
    "172.31.",
)

SEEN_PRIVATE_IPS = set()


def is_private_ip(ip: str) -> bool:
    if not ip:
        return True

    return (
        ip.startswith(PRIVATE_PREFIXES)
        or ip == "::1"
        or ip.startswith("fe80:")
    )


def fetch_ip_data(ip: str):
    url = (
        f"http://ip-api.com/json/{ip}"
        "?fields=status,message,country,countryCode,city,isp,org,as,query,"
        "timezone,lat,lon"
    )

    resp = requests.get(url, timeout=10)

    if resp.status_code == 429:
        raise ValueError("ip-api rate limit hit: HTTP 429")

    data = resp.json()

    if data.get("status") != "success":
        raise ValueError(f"ip-api lookup failed for {ip}: {data.get('message')}")

    return {
        "country": data.get("country"),
        "country_code": data.get("countryCode"),
        "city": data.get("city"),
        "asn": data.get("as"),
        "isp": data.get("isp"),
        "org": data.get("org"),
        "timezone": data.get("timezone"),
        "latitude": data.get("lat"),
        "longitude": data.get("lon"),
        "is_proxy": None,
        "is_vpn": None,
        "is_tor": None,
    }


def enrich_ip(ip: str):
    if is_private_ip(ip):
        if ip not in SEEN_PRIVATE_IPS:
            logger.info(f"Skipping private/local IP enrichment: {ip}")
            SEEN_PRIVATE_IPS.add(ip)
        return None

    existing = get_ip_intel(ip)

    if existing:
        touch_ip_last_seen(ip)

        # If old record is missing new geo fields, refresh it once
        if (
            not existing.get("country_code")
            or not existing.get("timezone")
            or not existing.get("latitude")
            or not existing.get("longitude")
        ):
            logger.info(f"Refreshing incomplete IP intel: {ip}")
        else:
            logger.info(f"IP intel already exists, updated last_seen: {ip}")
            return existing

    try:
        # ip-api free tier safety: around 40 requests/min
        time.sleep(1.5)

        intel = fetch_ip_data(ip)

        upsert_ip_intel(
            ip=ip,
            country=intel["country"],
            country_code=intel["country_code"],
            city=intel["city"],
            asn=intel["asn"],
            isp=intel["isp"],
            org=intel["org"],
            timezone=intel["timezone"],
            latitude=intel["latitude"],
            longitude=intel["longitude"],
            is_proxy=intel["is_proxy"],
            is_vpn=intel["is_vpn"],
            is_tor=intel["is_tor"],
        )

        logger.info(
            f"Enriched and stored IP intel: {ip} "
            f"{intel['country']} {intel['country_code']} {intel['timezone']}"
        )

        return intel

    except Exception as e:
        logger.error(f"Failed to enrich IP {ip}: {e}")
        return None

