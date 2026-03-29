# GhostTrap — API Layer (FastAPI Integration)

## Overview

This document describes the FastAPI-based API layer used in the GhostTrap SSH Honeypot.

The API acts as a central abstraction layer between PostgreSQL and external consumers such as dashboards, analytics systems, and future API users.

---

## Step 1 - Architecture

```
[Attacker]
     ↓
[SSH Honeypot VM]
     ↓
[PostgreSQL VM]
     ↓
[FastAPI API Layer]
     ↓
[Dashboard / External Clients]
```

---

## Step 2 - API Configuration

| Component   | Value     |
| ----------- | --------- |
| Framework   | FastAPI   |
| Base URL    | /api/v1   |
| Port        | 8000      |
| Host        | 0.0.0.0   |
| Data Format | JSON      |

---

## Step 3 - API Features

The API provides:

- real-time analytics  
- session tracking  
- attacker behavior insights  
- structured data access  
- reusable backend layer  

---

## Step 4 - API Endpoints

## Health Check

```
GET /health
curl http://127.0.0.1:8000/health
```

---

## Summary

```
GET /api/v1/summary
curl http://127.0.0.1:8000/api/v1/summary
```

---

## Timeline

```
GET /api/v1/timeline
curl http://127.0.0.1:8000/api/v1/timeline
```

---

## Top Commands

```
GET /api/v1/top-commands
curl http://127.0.0.1:8000/api/v1/top-commands
```

---

## Top Usernames

```
GET /api/v1/top-usernames
curl http://127.0.0.1:8000/api/v1/top-usernames
```

---

## Top Passwords ⚠️

```
GET /api/v1/top-passwords
curl http://127.0.0.1:8000/api/v1/top-passwords
```

Sensitive data — should be protected in future.

---

## Top Source IPs

```
GET /api/v1/top-source-ips
curl http://127.0.0.1:8000/api/v1/top-source-ips
```

---

## Recent Sessions

```
GET /api/v1/recent-sessions
curl http://127.0.0.1:8000/api/v1/recent-sessions
```

---

## Session Detail

```
GET /api/v1/sessions/{session_id}
curl http://127.0.0.1:8000/api/v1/sessions/<session_id>
```

---

## Session Commands

```
GET /api/v1/sessions/{session_id}/commands
curl http://127.0.0.1:8000/api/v1/sessions/<session_id>/commands
```

---

## Step 5 - Data Processing Logic

## Summary Calculation

- counts sessions from sessions table  
- counts login attempts from login_attempts  
- counts commands from commands  
- counts enriched IPs from ip_intel  

---

## Timeline Aggregation

- groups sessions by hour  
- joins commands table  
- calculates activity volume  

---

## Top Metrics

- uses GROUP BY and COUNT  
- sorted by frequency  
- filters null values  

---

## Session Drill-down

- uses session_id (UUID)  
- fetches metadata from sessions  
- fetches commands from commands  

---

## Step 6 - API Design Principles

- versioned routes (/api/v1)  
- separation of database and UI  
- read-only endpoints  
- structured JSON responses  
- scalable backend design  

---

## Step 7 - Security Considerations

Sensitive endpoints:

- top-passwords  
- top-usernames  
- recent-sessions  
- session detail  
- session commands  

Future protections:

- API keys  
- authentication  
- rate limiting  

---

## Step 8 - Verification Commands

```
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/v1/summary
curl http://127.0.0.1:8000/api/v1/top-commands
curl http://127.0.0.1:8000/api/v1/top-usernames
curl http://127.0.0.1:8000/api/v1/top-passwords
curl http://127.0.0.1:8000/api/v1/top-source-ips
curl http://127.0.0.1:8000/api/v1/recent-sessions
```

---

## Step 9 - Sample Data (Live API Output)

## Summary

```
{
  "total_sessions": 114,
  "login_attempts": 122,
  "commands_logged": 69,
  "enriched_ips": 1
}
```

---

## Top Commands

```
[
  {"label":"clear","count":11},
  {"label":"ls","count":10},
  {"label":"exit","count":5}
]
```

---

## Top Usernames

```
[
  {"label":"justchillguy","count":104},
  {"label":"ubuntu","count":10},
  {"label":"root","count":8}
]
```

---

## Top Passwords

```
[
  {"label":"12345","count":104},
  {"label":"sdf","count":4}
]
```

---

## Top Source IPs

```
[
  {"label":"192.168.31.117","count":104},
  {"label":"192.168.31.116","count":8}
]
```

---

## Session Detail

```
{
  "session_id":"ce9388c7-b090-4bca-bd90-86a401ebc867",
  "source_ip":"192.168.31.116",
  "start_time":"2026-03-28T04:26:45.987590",
  "end_time":"2026-03-28T04:28:43.501359"
}
```

---

## Session Commands

```
[
  {
    "command":"ls",
    "timestamp":"2026-03-28T04:27:01.123456"
  }
]
```

---


