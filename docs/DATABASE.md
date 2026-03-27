# 🗄️ GhostTrap — PostgreSQL Database Integration

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

### 4. IP Intelligence (Future Use)

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


