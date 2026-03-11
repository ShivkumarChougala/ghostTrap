## Your GhostTrap Setup 

┌─────────────────────────────────────────┐
│            SETUP                        │
│                                         │
│  Main OS (Kali Linux)                   │
│  └── IP: 192.168.31.212 (WiFi/Internet) │
│  └── IP: 192.168.56.1   (VM Bridge)     │
│                                         │
│  VM 1 - Linux VM                        │
│  └── IP: 192.168.56.101                 │
│                                         │
│  VM 2 - Ubuntu VM                       │
│  └── IP: 192.168.56.102                 │
│                                         │
│  VM 3 - Windows VM                      │
│  └── IP: 192.168.56.103                 │
└─────────────────────────────────────────┘

## Traffic Flow for GhostTrap

Internet
    ↓
Kali Host (192.168.31.212)
    ↓
    ├──→ Linux VM  (192.168.56.101) 🍯
    ├──→ Ubuntu VM (192.168.56.102) 🍯
    └──→ Windows VM(192.168.56.103) 🍯


##
 Your Main OS is Kali Linux?
└── That means Kali = your ATTACKER machine too!

So your setup is:
├── Kali Host  → Attacker + GhostTrap Brain 🧠
├── Linux VM   → Honeypot 🍯
├── Ubuntu VM  → Honeypot 🍯
└── Windows VM → Honeypot 🍯

## Updated GhostTrap Architecture

KALI HOST (Brain + Attacker)
├── Runs GhostTrap Core
├── Runs ELK Stack
├── Runs AI Engine
├── Runs Dashboard
└── Runs Attack simulations

LINUX VM (Honeypot 1)
├── Fake SSH :22
└── Fake FTP :21

UBUNTU VM (Honeypot 2)
├── Fake HTTP :80
└── Fake MySQL :3306

WINDOWS VM (Honeypot 3)
├── Fake RDP :3389
└── Fake SMB :445
