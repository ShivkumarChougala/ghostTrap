# GhostTrap Installation Guide

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Docker | 24.x+ |
| Docker Compose | 2.x+ |
| Ollama | 0.17+ |
| VirtualBox | 7.x+ |
| RAM | 16GB+ (32GB recommended) |
| CPU | 4+ cores (8 recommended) |

---

## Step 1 — Clone Repository

```bash
git clone https://github.com/YOURUSERNAME/GhostTrap.git
cd GhostTrap
```

---

## Step 2 — Setup VirtualBox Network

```bash
# Create host-only network
sudo vboxmanage hostonlyif create
sudo vboxmanage hostonlyif ipconfig vboxnet0 \
  --ip 192.168.56.1 --netmask 255.255.255.0

# Enable DHCP
sudo vboxmanage dhcpserver modify \
  --ifname vboxnet0 \
  --ip 192.168.56.100 \
  --netmask 255.255.255.0 \
  --lowerip 192.168.56.101 \
  --upperip 192.168.56.254 \
  --enable
```

---

## Step 3 — Start ELK Stack

```bash
# Set system limit for Elasticsearch
sudo sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" | sudo tee -a /etc/sysctl.conf

# Start ELK Stack
docker-compose up -d

# Verify running
docker ps
```

---

## Step 4 — Install Ollama + Mistral AI

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Configure to listen on all interfaces
sudo systemctl stop ollama
# Edit /etc/systemd/system/ollama.service
# Add: Environment="OLLAMA_HOST=0.0.0.0:11434"
sudo systemctl daemon-reload
sudo systemctl start ollama

# Pull Mistral model
ollama pull mistral
```

---

## Step 5 — Start AI Bridge

```bash
pip3 install flask requests
python3 ai/ai_bridge.py &
```

---

## Step 6 — Deploy SSH Honeypot (Ubuntu VM)

```bash
# On Ubuntu VM
pip3 install paramiko loguru requests

# Generate SSH key
mkdir -p /opt/ghosttrap
ssh-keygen -t rsa -b 2048 -f /opt/ghosttrap/server.key -N ""

# Move real SSH to port 2222
sudo systemctl stop ssh.socket
sudo systemctl disable ssh.socket
sudo sed -i 's/Port 22/Port 2222/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Start GhostTrap
sudo python3 honeypots/ssh_honeypot.py
```

---

## Step 7 — Configure Filebeat (Ubuntu VM)

```bash
# Install Filebeat
wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
echo "deb https://artifacts.elastic.co/packages/8.x/apt stable main" | \
  sudo tee /etc/apt/sources.list.d/elastic-8.x.list
sudo apt update && sudo apt install filebeat -y

# Copy config
sudo cp filebeat/filebeat.yml /etc/filebeat/filebeat.yml

# Start Filebeat
sudo systemctl start filebeat
sudo systemctl enable filebeat
```

---

## Step 8 — Open Kibana Dashboard

```
http://localhost:5601
→ Discover
→ Create Data View
→ Index pattern: ghosttrap-*
→ Save
```

---

## Verify Everything Works

```bash
# From attack machine
nmap 192.168.56.3

# Should show:
# 22/tcp  open  ssh   ← GhostTrap AI Honeypot
# 2222/tcp open ssh   ← Real SSH
```
