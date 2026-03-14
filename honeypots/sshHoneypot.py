import time
import subprocess
import psutil
import platform
import socket
import paramiko
import threading
import json
import requests
import uuid
from datetime import datetime
from loguru import logger

# Log setup
logger.add("/opt/ghosttrap/ssh_honeypot.log", rotation="10 MB")

# SSH server keys and banner
HOST_KEY = paramiko.RSAKey(filename='/opt/ghosttrap/server.key')
FAKE_BANNER = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"
AI_BRIDGE_URL = "http://192.168.56.1:5000/command"

# Fake filesystem
FAKE_FS = {
    "/": ["bin", "boot", "dev", "etc", "home", "lib", "opt", "root", "tmp", "usr", "var"],
    "/etc": ["passwd", "shadow", "hosts", "hostname", "resolv.conf", "os-release", "crontab"],
    "/root": [".bashrc", ".bash_history", ".ssh", "backup.zip", "notes.txt"],
    "/root/.ssh": ["authorized_keys", "id_rsa", "id_rsa.pub"],
    "/home": ["ubuntu", "admin", "deploy"],
    "/var": ["log", "www", "mail", "lib"],
    "/var/www": ["html"],
    "/var/www/html": ["index.html", "wp-config.php", "wp-admin", ".htaccess"],
    "/tmp": [],
    "/opt": ["backup", "scripts"],
}

FAKE_FILES = {
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\nubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash\nadmin:x:1001:1001:Admin:/home/admin:/bin/bash\nmysql:x:112:117:MySQL:/var/lib/mysql:/bin/false\n",
    "/etc/shadow": "root:$6$xyz$hashedpassword123:19000:0:99999:7:::\nubuntu:$6$abc$anotherhashedpwd:19000:0:99999:7:::\n",
    "/etc/hostname": "ubuntu-server\n",
    "/root/notes.txt": "TODO:\n- Update SSL cert\n- Change DB password (currently: Pr0d@2024!)\n- Backup before Friday\n",
    "/root/.bash_history": "ls -la\ncd /var/www/html\nmysql -u root -pPr0d@2024!\ncat /etc/shadow\nwget http://update.server.com/patch.sh\n",
    "/root/.ssh/id_rsa": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA2a2rwplBQLzHPZe5RJr9GhMiGMKuSaRFuaErFHHBTMDWxFAb\n-----END RSA PRIVATE KEY-----\n",
    "/var/www/html/wp-config.php": "<?php\ndefine('DB_NAME', 'wordpress');\ndefine('DB_USER', 'wpuser');\ndefine('DB_PASSWORD', 'WpP@ss2024!');\ndefine('DB_HOST', 'localhost');\n",
}


# --------------------------
# AI Bridge helper
# --------------------------
def ask_ai(command, cwd, session_history):
    try:
        response = requests.post(
            AI_BRIDGE_URL,
            json={
                "command": command,
                "cwd": cwd,
                "history": session_history[-3:] if session_history else []
            },
            timeout=60
        )
        if response.status_code == 200:
            result = response.json().get("response", "").strip()
            return result.replace("```", "").replace("`", "")
        return f"bash: {command}: command not found"
    except Exception as e:
        logger.error(f"AI Bridge error: {e}")
        return f"bash: {command}: command not found"


# --------------------------
# Path resolver
# --------------------------
def resolve_path(cwd, path):
    if path.startswith("/"):
        resolved = path
    else:
        resolved = cwd.rstrip("/") + "/" + path
    parts = resolved.split("/")
    stack = []
    for part in parts:
        if part == "" or part == ".":
            continue
        elif part == "..":
            if stack:
                stack.pop()
        else:
            stack.append(part)
    return "/" + "/".join(stack)


# --------------------------
# Command handler
# --------------------------
def handle_command(command, session):
    cmd = command.strip()
    if not cmd:
        return ""
    parts = cmd.split()
    base_cmd = parts[0]

    # -------- Directory navigation --------
    if base_cmd == "cd":
        target = parts[1] if len(parts) > 1 else "/root"
        new_path = resolve_path(session["cwd"], target)
        if new_path in FAKE_FS:
            session["cwd"] = new_path
            return ""
        else:
            return f"bash: cd: {target}: No such file or directory"

    elif base_cmd == "pwd":
        return session["cwd"]

    elif base_cmd == "whoami":
        return "root"

    elif base_cmd == "id":
        return "uid=0(root) gid=0(root) groups=0(root)"

    elif base_cmd == "hostname":
        return "ubuntu-server"

    elif base_cmd == "uname":
        # FIX 1: return line was under-indented by one space
        if "-a" in parts:
            return "Linux ubuntu-server 5.15.0-52-generic #58-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux"
        return "Linux"

    elif base_cmd == "free":
        return """              total        used        free      shared  buff/cache   available
Mem:           1992         342         911          12         738        1502
Swap:             0           0           0"""

    elif base_cmd == "df":
        return """Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        40G  3.1G   35G   9% /
tmpfs           996M     0  996M   0% /dev/shm"""

    elif base_cmd == "ps":
        return """USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  22500  4100 ?        Ss   Mar10   0:03 /sbin/init
root       512  0.0  0.2  39244  5400 ?        Ss   Mar10   0:01 /usr/sbin/sshd -D
root      1043  0.0  0.1  16800  3200 pts/0    Ss   10:20   0:00 -bash"""

    elif base_cmd == "ip":
        # FIX 2: if-body was under-indented, causing it to fall outside the elif block
        if len(parts) > 1 and parts[1] == "a":
            return """1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0"""
        return ""

    elif base_cmd == "ifconfig":
        return """eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 02:42:ac:11:00:02  txqueuelen 1000  (Ethernet)
lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0"""

    elif base_cmd == "clear":
        return "\033[2J\033[H"

    # -------- File listing --------
    elif base_cmd == "ls":
        path = session["cwd"]
        files = FAKE_FS.get(path, [])
        if "-la" in cmd or "-l" in cmd:
            result = "total 48\ndrwx------ 4 root root 4096 Mar 11 10:00 .\ndrwxr-xr-x 20 root root 4096 Mar 1>\n"
            for f in files:
                full_path = resolve_path(path, f)
                if full_path in FAKE_FS:
                    result += f"drwxr-xr-x 2 root root 4096 Mar 11 10:00 {f}\n"
                else:
                    result += f"-rw-r--r-- 1 root root 1234 Mar 11 10:00 {f}\n"
            return result.strip()
        return "  ".join(files) if files else ""

    # -------- File creation --------
    elif base_cmd == "touch":
        if len(parts) > 1:
            file_path = resolve_path(session["cwd"], parts[1])
            FAKE_FS.setdefault(session["cwd"], [])
            if parts[1] not in FAKE_FS[session["cwd"]]:
                FAKE_FS[session["cwd"]].append(parts[1])
            FAKE_FILES[file_path] = ""
            return ""
        return "touch: missing file operand"

    # -------- File reading --------
    elif base_cmd == "cat":
        if len(parts) < 2:
            return ""
        filepath = resolve_path(session["cwd"], parts[1])
        if filepath in FAKE_FILES:
            # FIX 3: stray 'w' character before 'sensitive' keyword — removed
            sensitive = ["/etc/shadow", "/root/.ssh/id_rsa",
                         "/root/notes.txt", "/var/www/html/wp-config.php"]
            if filepath in sensitive:
                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "event": "sensitive_file_access",
                    "src_ip": session["client_ip"],
                    "file": filepath,
                    "threat_level": "CRITICAL",
                    "session_id": session["session_id"]
                }
                logger.warning(json.dumps(log_entry))
                print(f"[CRITICAL] {session['client_ip']} accessed {filepath}")
            return FAKE_FILES[filepath].strip()
        if filepath in FAKE_FS:
            return f"cat: {parts[1]}: Is a directory"
        return ask_ai(command, session["cwd"], session["history"])

    # -------- Dangerous commands --------
    elif base_cmd in ["wget", "curl"]:
        url = parts[-1] if len(parts) > 1 else ""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "malware_download_attempt",
            "src_ip": session["client_ip"],
            "url": url,
            "threat_level": "CRITICAL",
            "session_id": session["session_id"]
        }
        logger.warning(json.dumps(log_entry))
        print(f"[CRITICAL] {session['client_ip']} tried to download: {url}")
        return f"--2026-03-11 10:00:00--  {url}\nResolving... failed: Temporary failure in name resolution."

    # -------- Exit session --------
    elif base_cmd in ["exit", "logout", "quit"]:
        return "EXIT"

    # -------- Unknown commands --------
    else:
        print(f"[AI] Sending to AI: {command}")
        return ask_ai(command, session["cwd"], session["history"])


# --------------------------
# SSH Server Classes
# --------------------------
class FakeSSHServer(paramiko.ServerInterface):
    def __init__(self, client_ip, session):
        self.client_ip = client_ip
        self.session = session
        self.event = threading.Event()

    def check_channel_request(self, kind, chanid):
        if kind == "session":
            return paramiko.OPEN_SUCCEEDED
        return paramiko.OPEN_FAILED_ADMINISTRATIVELY_PROHIBITED

    def check_auth_password(self, username, password):
        self.session["attempt_count"] += 1
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "ssh_login_attempt",
            "src_ip": self.client_ip,
            "username": username,
            "password": password,
            "attempt": self.session["attempt_count"],
            "honeypot": "ssh",
            "vm": "ubuntu",
            "session_id": self.session["session_id"]
        }
        logger.info(json.dumps(log_entry))
        print(f"[!] Attempt {self.session['attempt_count']} from {self.client_ip} → {username}:{password}")
        if self.session["attempt_count"] >= 3:
            print(f"[LETTIN IN] {self.client_ip} — AI mode activated!")
            log_entry["event"] = "ssh_login_success"
            logger.info(json.dumps(log_entry))
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

    def generate_ubuntu_banner(self):
        now = datetime.utcnow().strftime("%a %b %d %I:%M:%S %p UTC %Y")
        load = psutil.getloadavg()[0]
        mem = psutil.virtual_memory().percent
        swap = psutil.swap_memory().percent
        processes = len(psutil.pids())
        disk = psutil.disk_usage('/')
        disk_percent = disk.percent
        disk_total = round(disk.total / (1024**3), 2)
        last_login_ip = "192.168.56.1"
        ipv4 = subprocess.getoutput("hostname -I | awk '{print $1}'")
        ipv6_list = subprocess.getoutput(
            "ip -6 addr show scope global | grep inet6 | awk '{print $2}' | cut -d/ -f1"
        ).split("\n")
        ipv6_lines = ""
        for ip in ipv6_list:
            if ip.strip():
                ipv6_lines += f"  IPv6 address for enp0s3: {ip}\n"
        banner = f"""
Welcome to Ubuntu 24.04.3 LTS (GNU/Linux {platform.release()} x86_64)
 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro
 System information as of {now}
  System load:             {load}
  Usage of /:              {disk_percent}% of {disk_total}GB
  Memory usage:            {mem}%
  Swap usage:              {swap}%
  Processes:               {processes}
  Users logged in:         1
  IPv4 address for enp0s3: {ipv4}
{ipv6_lines}
 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.
   https://ubuntu.com/engage/secure-kubernetes-at-the-edge
Expanded Security Maintenance for Applications is not enabled.
86 updates can be applied immediately.
31 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable
4 additional security updates can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm
Last login: Fri Mar 13 20:13:21 2026 from {last_login_ip}
"""
        return banner.strip()


# --------------------------
# Client handler
# --------------------------
def handle_client(client_socket, client_ip):
    session = {
        "client_ip": client_ip,
        "cwd": "/root",
        "attempt_count": 0,
        "history": [],
        "session_id": str(uuid.uuid4()),
        "start_time": datetime.now()
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

        banner = server.generate_ubuntu_banner()
        channel.send("\r\n")
        for line in banner.split("\n"):
            channel.send(line + "\r\n")

        channel.send("\r\nroot@ubuntu-server:~# ")
        command_buffer = ""

        while True:
            data = channel.recv(1024)
            if not data:
                break
            char = data.decode("utf-8", errors="ignore")

            # Backspace handling
            if char in ("\x7f", "\x08"):
                if command_buffer:
                    command_buffer = command_buffer[:-1]
                    channel.send("\x08 \x08")
                continue

            # Enter pressed
            if char in ("\r", "\n"):
                channel.send("\r\n")
                if command_buffer.strip():
                    cmd = command_buffer.strip()
                    log_entry = {
                        "timestamp": datetime.now().isoformat(),
                        "event": "ssh_command",
                        "src_ip": client_ip,
                        "command": cmd,
                        "cwd": session["cwd"],
                        "honeypot": "ssh",
                        "session_id": session["session_id"]
                    }
                    logger.info(json.dumps(log_entry))
                    print(f"[CMD] {client_ip} ran: {cmd}")
                    response = handle_command(cmd, session)
                    if response == "EXIT":
                        channel.send("logout\r\n")
                        break
                    session["history"].append({
                        "command": cmd,
                        "response": response,
                        "cwd": session["cwd"]
                    })
                    if response:
                        for line in response.split("\n"):
                            channel.send(line + "\r\n")
                command_buffer = ""
                cwd_display = "~" if session["cwd"] == "/root" else session["cwd"]
                channel.send(f"root@ubuntu-server:{cwd_display}# ")
            else:
                if char.isprintable():
                    command_buffer += char
                    channel.send(char)

    except Exception as e:
        logger.error(f"Error with {client_ip}: {e}")
    finally:
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "session_ended",
            "src_ip": client_ip,
            "total_commands": len(session["history"]),
            "commands": session["history"],
            "duration": str(datetime.now() - session["start_time"]),
            "session_id": session["session_id"],
            "honeypot": "ssh",
            "vm": "ubuntu"
        }
        logger.info(json.dumps(log_entry))
        print(f"[SESSION ENDED] {client_ip} — {len(session['history'])} commands captured")
        if transport:
            transport.close()


# --------------------------
# Main honeypot server
# --------------------------
def start_honeypot(port=22):
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind(("0.0.0.0", port))
    server_socket.listen(100)
    print("[*] GhostTrap AI-Powered SSH Honeypot")
    print(f"[*] Listening on port {port}")
    print(f"[*] AI Bridge: {AI_BRIDGE_URL}")
    print("[*] Mode: HIGH INTERACTION + AI")
    print("[*] Waiting for attackers...")
    while True:
        client_socket, addr = server_socket.accept()
        client_ip = addr[0]
        print(f"[+] Connection from {client_ip}")
        thread = threading.Thread(
            target=handle_client,
            args=(client_socket, client_ip),
            daemon=True
        )
        thread.start()


if __name__ == "__main__":
    start_honeypot(port=22)
