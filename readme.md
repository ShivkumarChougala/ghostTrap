# GhostTrap  
**AI-Powered Honeypot & Attacker Intelligence Platform**

    root@ghosttrap:~# ./ghosttrap
    [+] SSH Honeypot Active
    [+] API Server Running
    [+] Dashboard Online
    [+] Capturing attacker behavior...

---

## Overview

GhostTrap is a high-interaction honeypot platform designed to capture and analyze real attacker behavior.

It simulates a realistic Linux environment, allows attackers to execute commands, records full sessions, enriches attacker data, and exposes insights through a structured API and dashboard.

---

## How It Works

    attacker@internet:~$ ssh root@ghosttrap
    Password: ********

    root@ubuntu-server:~# whoami
    root

    root@ubuntu-server:~# cat /etc/shadow
    [activity captured by GhostTrap]

GhostTrap presents a realistic SSH service. After controlled authentication, attackers are placed in a simulated shell where:

- commands are executed or emulated  
- AI generates realistic terminal responses  
- credentials and commands are logged  
- attacker data is enriched (IP, geo, ASN)  
- sessions are stored and visualized  

---

## Key Features

- High-interaction SSH honeypot  
- Realistic fake Linux shell  
- Full session tracking  
- Credential capture  
- Command logging  
- IP intelligence enrichment  
- Malware download detection  
- Sensitive file access detection  
- Real-time API  
- Web dashboard  

---

## Live Dashboard

https://dashboard.thechougala.in/

---

## Tech Stack

    Python      -> Honeypot core
    Paramiko    -> SSH server emulation
    FastAPI     -> REST API
    PostgreSQL  -> Data storage
    React       -> Dashboard
    Ollama      -> AI responses
    Docker      -> Deployment

---

## How to Run

### 1. Clone Repository

    git clone https://github.com/ShivkumarChougala/ghostTrap.git
    cd ghosttrap

### 2. Setup Environment

    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

### 3. Configure

    # create .env file
    DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/ghosttrap
    API_BASE_URL=http://localhost:8000
    OLLAMA_URL=http://localhost:11434

### 4. Start Services

    # start API
    uvicorn api.main:app --host 0.0.0.0 --port 8000

    # start SSH honeypot
    python3 honeypots/ssh/sshHoneypot.py

    # start dashboard
    cd dashboard
    npm install
    npm run dev

---

## Status

    [+] SSH Honeypot        Complete
    [+] API v1             Live
    [+] Dashboard          Working
    [+] IP Enrichment      Integrated
    [*] AI Integration     Improving
    [*] Multi-Honeypots    Planned

---

## Disclaimer

This project is intended for educational and defensive security research only.

---

## License

MIT
