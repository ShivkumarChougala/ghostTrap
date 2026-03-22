"""
GhostTrap - ssh_honeypot.py
Main entrypoint. Handles SSH transport, auth, banner, and spawns shell sessions.
All shell logic lives in shell_input.py, command_handler.py, fake_fs.py, ai_bridge.py.
"""

import socket
import threading
import uuid
import subprocess
import platform
import psutil
import paramiko
from datetime import datetime
from loguru import logger

from shell_input import run_shell
from command_handler import handle_command

# --------------------------
# Config
# --------------------------
HOST_KEY    = paramiko.RSAKey(filename='server.key')
FAKE_BANNER = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"

logger.add("/opt/ghosttrap/ssh_honeypot.log", rotation="10 MB")


# --------------------------
# SSH server interface
# --------------------------
class FakeSSHServer(paramiko.ServerInterface):
    def __init__(self, client_ip, session):
        self.client_ip = client_ip
        self.session   = session
        self.event     = threading.Event()

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_auth_password(self, username, password):
        self.session["attempt_count"] += 1
        logger.info({
            "timestamp":   datetime.now().isoformat(),
            "event":       "ssh_login_attempt",
            "src_ip":      self.client_ip,
            "username":    username,
            "password":    password,
            "attempt":     self.session["attempt_count"],
            "honeypot":    "ssh",
            "vm":          "ubuntu",
            "session_id":  self.session["session_id"]
        })
        print(f"[!] Attempt {self.session['attempt_count']} from {self.client_ip} → {username}:{password}")

        # Let the attacker in after 3 attempts (realistic brute-force behaviour)
        if self.session["attempt_count"] >= 3:
            print(f"[LETTING IN] {self.client_ip} — AI shell active")
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

    def generate_ubuntu_banner(self):
        now       = datetime.utcnow().strftime("%a %b %d %I:%M:%S %p UTC %Y")
        load      = psutil.getloadavg()[0]
        mem       = psutil.virtual_memory().percent
        swap      = psutil.swap_memory().percent
        processes = len(psutil.pids())
        disk      = psutil.disk_usage('/')
        ipv4      = subprocess.getoutput("hostname -I | awk '{print $1}'")
        ipv6_list = subprocess.getoutput(
            "ip -6 addr show scope global | grep inet6 | awk '{print $2}' | cut -d/ -f1"
        ).split("\n")
        ipv6_lines = "".join(
            f"  IPv6 address for enp0s3: {ip}\n"
            for ip in ipv6_list if ip.strip()
        )

        return f"""Welcome to Ubuntu 24.04.3 LTS (GNU/Linux {platform.release()} x86_64)
 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of {now}

  System load:             {load}
  Usage of /:              {disk.percent}% of {round(disk.total / (1024**3), 2)}GB
  Memory usage:            {mem}%
  Swap usage:              {swap}%
  Processes:               {processes}
  Users logged in:         1
  IPv4 address for enp0s3: {ipv4}
{ipv6_lines}
Expanded Security Maintenance for Applications is not enabled.

86 updates can be applied immediately.
31 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable

Last login: Fri Mar 13 20:13:21 2026 from 192.168.56.1""".strip()


# --------------------------
# Per-client handler
# --------------------------
def handle_client(client_socket, client_ip):
    session = {
        "client_ip":     client_ip,
        "cwd":           "/root",
        "attempt_count": 0,
        "history":       [],
        "session_id":    str(uuid.uuid4()),
        "start_time":    datetime.now()
    }
    transport = None

    try:
        transport = paramiko.Transport(client_socket)
        transport.local_version = FAKE_BANNER
        transport.add_server_key(HOST_KEY)

        server = FakeSSHServer(client_ip, session)
        transport.start_server(server=server)

        channel = transport.accept(30)
        if channel is None:
            return

        # Send Ubuntu MOTD banner
        banner = server.generate_ubuntu_banner()
        channel.send(b"\r\n")
        for line in banner.split("\n"):
            channel.send((line + "\r\n").encode())
        channel.send(b"\r\n")

        # Hand off to interactive shell (arrow keys, history, colored prompt)
        run_shell(channel, session, handle_command)

    except Exception as e:
        logger.error(f"Error with {client_ip}: {e}")

    finally:
        logger.info({
            "timestamp":      datetime.now().isoformat(),
            "event":          "session_ended",
            "src_ip":         client_ip,
            "total_commands": len(session["history"]),
            "commands":       session["history"],
            "duration":       str(datetime.now() - session["start_time"]),
            "session_id":     session["session_id"],
            "honeypot":       "ssh",
            "vm":             "ubuntu"
        })
        print(f"[SESSION ENDED] {client_ip} — {len(session['history'])} commands captured")
        if transport:
            transport.close()


# --------------------------
# Entrypoint
# --------------------------
def start_honeypot(port=22):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("0.0.0.0", port))
    server_socket.listen(100)

    print("[*] GhostTrap AI-Powered SSH Honeypot")
    print(f"[*] Listening on port {port}")
    print("[*] Mode: HIGH INTERACTION + AI")
    print("[*] Waiting for attackers...\n")

    while True:
        client_socket, addr = server_socket.accept()
        client_ip = addr[0]
        print(f"[+] Connection from {client_ip}")
        threading.Thread(
            target=handle_client,
            args=(client_socket, client_ip),
            daemon=True
        ).start()


if __name__ == "__main__":
    start_honeypot(port=22)
