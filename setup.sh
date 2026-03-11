#!/bin/bash
# GhostTrap Setup Script
# Run on Kali Host

echo "================================================"
echo "  GhostTrap - AI Powered Honeypot Network"
echo "  Setting up host machine..."
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}[!] Please run as root${NC}"
    exit 1
fi

echo -e "${YELLOW}[*] Setting up VirtualBox network...${NC}"
vboxmanage hostonlyif create 2>/dev/null
vboxmanage hostonlyif ipconfig vboxnet0 \
    --ip 192.168.56.1 --netmask 255.255.255.0 2>/dev/null
vboxmanage dhcpserver modify \
    --ifname vboxnet0 \
    --ip 192.168.56.100 \
    --netmask 255.255.255.0 \
    --lowerip 192.168.56.101 \
    --upperip 192.168.56.254 \
    --enable 2>/dev/null
echo -e "${GREEN}[+] Network setup complete${NC}"

echo -e "${YELLOW}[*] Installing Docker...${NC}"
apt install docker.io docker-compose -y > /dev/null 2>&1
systemctl start docker
systemctl enable docker
echo -e "${GREEN}[+] Docker installed${NC}"

echo -e "${YELLOW}[*] Setting Elasticsearch memory limit...${NC}"
sysctl -w vm.max_map_count=262144
echo "vm.max_map_count=262144" >> /etc/sysctl.conf
echo -e "${GREEN}[+] Memory limit set${NC}"

echo -e "${YELLOW}[*] Starting ELK Stack...${NC}"
docker-compose up -d
echo -e "${GREEN}[+] ELK Stack started${NC}"

echo -e "${YELLOW}[*] Installing Ollama...${NC}"
curl -fsSL https://ollama.ai/install.sh | sh > /dev/null 2>&1
systemctl start ollama
systemctl enable ollama
echo -e "${GREEN}[+] Ollama installed${NC}"

echo -e "${YELLOW}[*] Pulling Mistral AI model (4GB)...${NC}"
ollama pull mistral
echo -e "${GREEN}[+] Mistral model ready${NC}"

echo -e "${YELLOW}[*] Installing Python dependencies...${NC}"
pip3 install flask requests --break-system-packages > /dev/null 2>&1
echo -e "${GREEN}[+] Dependencies installed${NC}"

echo -e "${YELLOW}[*] Starting AI Bridge...${NC}"
nohup python3 ai/ai_bridge.py > /var/log/ghosttrap_ai.log 2>&1 &
echo -e "${GREEN}[+] AI Bridge started on port 5000${NC}"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  GhostTrap Host Setup Complete!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Next steps:"
echo "1. Setup Ubuntu VM (see docs/INSTALL.md)"
echo "2. Open Kibana: http://localhost:5601"
echo "3. Start attacking your honeypot!"
echo ""
