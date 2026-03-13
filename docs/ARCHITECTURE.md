# GhostTrap Architecture

## Overview

```
                    INTERNET / ATTACKER
                           |
                    192.168.56.x
                           |
        ┌──────────────────┼──────────────────┐
        |                  |                  |
   Ubuntu VM          Linux VM          Windows VM
   192.168.56.3      192.168.56.5      192.168.56.x
        |                  |                  |
   SSH :22 (trap)    MySQL :3306        RDP :3389
   HTTP :80 (trap)   FTP   :21         SMB :445
        |                  |                  |
   Filebeat           Filebeat           Filebeat
        |                  |                  |
        └──────────────────┼──────────────────┘
                           |
                    KALI HOST :5044
                    192.168.56.1
                           |
              ┌────────────┼────────────┐
              |            |            |
          Logstash   Elasticsearch   Kibana
           :5044        :9200        :5601
                           |
                      AI Bridge
                        :5000
                           |
                        Ollama
                       Mistral AI
                       :11434
```

## Components

### Honeypot Layer (VMs)
- **SSH Honeypot** — High interaction fake SSH server with AI responses
- **HTTP Honeypot** — Fake web server with admin panels, sensitive files
- **MySQL Honeypot** — Fake database with realistic data
- **RDP Honeypot** — Fake Windows Remote Desktop

### Log Pipeline
- **Filebeat** — Ships logs from VMs to Logstash
- **Logstash** — Parses and enriches log data
- **Elasticsearch** — Stores all attack data
- **Kibana** — Visualizes attacks in real-time

### AI Engine
- **Ollama** — Local LLM runtime (no internet required)
- **Mistral 7B** — AI model that generates realistic terminal responses
- **AI Bridge** — Flask API that connects honeypot to Ollama

## Data Flow

```
Attacker Types Command
        ↓
SSH Honeypot Receives
        ↓
Known command? → Handle locally (fast)
Unknown command? → Send to AI Bridge
        ↓
AI Bridge → Ollama → Mistral generates response
        ↓
Response sent back to attacker
        ↓
Everything logged to Filebeat
        ↓
Filebeat → Logstash → Elasticsearch
        ↓
Kibana shows live attack data
```

## Network Segmentation

```
192.168.31.0/24  →  Real home network (host only)
192.168.56.0/24  →  GhostTrap lab (isolated)

VMs cannot reach real network = SAFE
Host bridges both networks = CONTROL
```
