import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))
import socket
import threading
import uuid
import subprocess
import platform
import psutil
import paramiko
from datetime import datetime
from loguru import logger
from core.ssh.shell_input import run_shell
from core.ssh.command_handler import handle_command
## database
from database.db import create_session, log_login_attempt, end_session
from database.ip_enrich import enrich_ip


# --------------------------
# Config
# --------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HOST_KEY = paramiko.RSAKey(filename=os.path.join(BASE_DIR, 'server.key'))
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
        success = self.session["attempt_count"] >= 2
        logger.info({
            "timestamp":  datetime.now().isoformat(),
            "event":      "ssh_login_attempt",
            "src_ip":     self.client_ip,
            "fake_user":  self.session["user"],
            "username":   username,
            "password":   password,
            "attempt":    self.session["attempt_count"],
            "honeypot":   "ssh",
            "vm":         "ubuntu",
            "session_id": self.session["session_id"]
        })
        log_login_attempt(
            session_id=self.session["session_id"],
            src_ip=self.client_ip,
            username=username,
            password=password,
            attempt_number=self.session["attempt_count"],
            success=success
        )
        print(f"[!] Attempt {self.session['attempt_count']} from {self.client_ip} → {username}:{password}")
        if success:
            print(f"[LETTING IN] {self.client_ip} — AI shell active")
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

    def generate_ubuntu_banner(self):
        now = datetime.utcnow().strftime("%a %b %d %I:%M:%S %p UTC %Y")
        return f"""Welcome to Ubuntu 24.04.3 LTS (GNU/Linux 6.8.0-52-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of {now}

  System load:             0.08
  Usage of /:              14.2% of 24.00GB
  Memory usage:            23%
  Swap usage:              0%
  Processes:               121
  Users logged in:         1
  IPv4 address for enp0s3: 10.0.2.15

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
        "cwd":           "/home/ubuntu",
        "user":          "ubuntu",
        "attempt_count": 0,
        "history":       [],
        "session_id":    str(uuid.uuid4()),
        "start_time":    datetime.now(),
        "ai_calls":      0
    }
    create_session(session)
    enrich_ip(client_ip)

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
        end_session(session)
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
# Banner
# --------------------------
def show_banner(port):
    print(r"""
   ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗████████╗ █████╗ ██████╗ 
  ██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔══██╗██╔══██╗
  ██║  ███╗███████║██║   ██║███████╗   ██║      ██║   ███████║██████╔╝
  ██║   ██║██╔══██║██║   ██║╚════██║   ██║      ██║   ██╔══██║██╔═══╝ 
  ╚██████╔╝██║  ██║╚██████╔╝███████║   ██║      ██║   ██║  ██║██║     
   ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚═╝  ╚═╝╚═╝     
    """)
    print("           GhostTrap AI SSH Honeypot\n")
    print(f"[+] PORT     : {port}")
    print(f"[+] MODE     : HIGH INTERACTION")
    print(f"[+] STATUS   : RUNNING")
    print(f"[+] LOGGING  : ENABLED")
    print("\n[*] Waiting for attackers...\n")

# --------------------------
# Entrypoint
# --------------------------
def start_honeypot(port=22):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("0.0.0.0", port))
    server_socket.listen(100)
    show_banner(port)
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
