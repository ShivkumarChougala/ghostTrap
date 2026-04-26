# GhostTrap  
**AI-Powered Honeypot & Attacker Intelligence Platform**

---

## Overview

GhostTrap is a high-interaction honeypot platform designed to capture and analyze real attacker behavior.

It simulates a realistic system environment, allowing attackers to execute commands while all activity is recorded, enriched, and exposed through a structured API and dashboard.

---

## How It Works

GhostTrap presents a realistic SSH service to attackers.

After controlled authentication, attackers are placed in a simulated Linux environment where:
- commands are executed or emulated  
- responses are generated (including AI-assisted output)  
- all activity is logged with full session context  

Each session is enriched with attacker intelligence (IP, geo, ASN) and stored for analysis.

---

## Key Features

- High-interaction SSH honeypot  
- Full session tracking and command logging  
- Credential capture (usernames and passwords)  
- IP intelligence enrichment (geo, ASN, ISP)  
- Threat detection (malware downloads, sensitive file access)  
- Real-time API and web dashboard  

---

## Live Dashboard

https://dashboard.thechougala.in/

---

## Tech Stack

Python · FastAPI · PostgreSQL · React · Ollama · Docker

---

## Status

Actively developed and deployed with live attack data.

---

## License

MIT
