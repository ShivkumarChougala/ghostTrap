import socket
import paramiko
import threading
import json
import requests
from datetime import datetime
from loguru import logger

logger.add("/opt/ghosttrap/ssh_honeypot.log", rotation="10 MB")

HOST_KEY = paramiko.RSAKey(filename='/opt/ghosttrap/server.key')
FAKE_BANNER = "SSH-2.0-OpenSSH_8.9p1 Ubuntu-3ubuntu0.6"
AI_BRIDGE_URL = "http://192.168.56.1:5000/command"

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
            result = result.replace("```", "").replace("`", "")
            return result
        return "bash: {}: command not found".format(command)
    except Exception as e:
        logger.error("AI Bridge error: {}".format(e))
        return "bash: {}: command not found".format(command)

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

def handle_command(command, session):
    cmd = command.strip()
    if not cmd:
        return ""

    parts = cmd.split()
    base_cmd = parts[0]

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

    elif base_cmd == "clear":
        return "\033[2J\033[H"

    elif base_cmd == "ls":
        path = session["cwd"]
        files = FAKE_FS.get(path, [])
        if "-la" in cmd or "-l" in cmd:
            result = "total 48\ndrwx------ 4 root root 4096 Mar 11 10:00 .\ndrwxr-xr-x 20 root root 4096 Mar 11 10:00 ..\n"
            for f in files:
                full_path = resolve_path(path, f)
                if full_path in FAKE_FS:
                    result += "drwxr-xr-x 2 root root 4096 Mar 11 10:00 {}\n".format(f)
                else:
                    result += "-rw-r--r-- 1 root root 1234 Mar 11 10:00 {}\n".format(f)
            return result.strip()
        return "  ".join(files) if files else ""

    elif base_cmd == "touch":
        if len(parts) > 1:
            file_path = resolve_path(session["cwd"], parts[1])
            FAKE_FS.setdefault(session["cwd"], [])
            if parts[1] not in FAKE_FS[session["cwd"]]:
                FAKE_FS[session["cwd"]].append(parts[1])
            FAKE_FILES[file_path] = ""
            return ""
        return "touch: missing file operand"

    elif base_cmd == "cat":
        if len(parts) < 2:
            return ""
        filepath = resolve_path(session["cwd"], parts[1])
        if filepath in FAKE_FILES:
            sensitive = ["/etc/shadow", "/root/.ssh/id_rsa", "/root/notes.txt", "/var/www/html/wp-config.php"]
            if filepath in sensitive:
                log_entry = {
                    "timestamp": datetime.now().isoformat(),
                    "event": "sensitive_file_access",
                    "src_ip": session["client_ip"],
                    "file": filepath,
                    "threat_level": "CRITICAL",
                    "honeypot": "ssh",
                    "vm": "ubuntu"
                }
                logger.warning(json.dumps(log_entry))
                print("[CRITICAL] {} accessed: {}".format(session["client_ip"], filepath))
            return FAKE_FILES[filepath].strip()
        if filepath in FAKE_FS:
            return "cat: {}: Is a directory".format(parts[1])
        return ask_ai(command, session["cwd"], session["history"])

    elif base_cmd in ["wget", "curl"]:
        url = parts[-1] if len(parts) > 1 else ""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "malware_download_attempt",
            "src_ip": session["client_ip"],
            "url": url,
            "threat_level": "CRITICAL",
            "honeypot": "ssh",
            "vm": "ubuntu"
        }
        logger.warning(json.dumps(log_entry))
        print("[CRITICAL] {} tried to download: {}".format(session["client_ip"], url))
        if base_cmd == "wget":
            return "--2026-03-11 10:00:00--  {}\nResolving... failed: Temporary failure in name resolution.".format(url)
        return "curl: (6) Could not resolve host"

    elif base_cmd in ["exit", "logout", "quit"]:
        return "EXIT"

    else:
        print("[AI] Sending to AI: {}".format(command))
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
            "vm": "ubuntu"
        }
        logger.info(json.dumps(log_entry))
        print("[!] Attempt {} from {} → {}:{}".format(
            self.session["attempt_count"], self.client_ip, username, password))
        if self.session["attempt_count"] >= 3:
            print("[LETTIN IN] {} — AI mode activated!".format(self.client_ip))
            log_entry["event"] = "ssh_login_success"
            logger.info(json.dumps(log_entry))
            return paramiko.AUTH_SUCCESSFUL
        return paramiko.AUTH_FAILED

    def check_channel_shell_request(self, channel):
        self.event.set()
        return True

    def check_channel_pty_request(self, channel, term, width, height, pixelwidth, pixelheight, modes):
        return True

# --------------------------
# Client handler
# --------------------------
def handle_client(client_socket, client_ip):
    session = {
        "client_ip": client_ip,
        "cwd": "/root",
        "attempt_count": 0,
        "history": [],
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

        channel.send("\r\n")
        channel.send("Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)\r\n")
        channel.send("\r\n")
        channel.send(" * Documentation:  https://help.ubuntu.com\r\n")
        channel.send("Last login: Mon Mar 10 09:00:00 2026 from 10.0.0.5\r\n")
        channel.send("\r\n")

        command_buffer = ""
        channel.send("root@ubuntu-server:~# ")

        while True:
            try:
                data = channel.recv(1024)
                if not data:
                    break
                char = data.decode("utf-8", errors="ignore")

                if char in ("\x7f", "\x08"):
                    if command_buffer:
                        command_buffer = command_buffer[:-1]
                        channel.send("\x08 \x08")
                    continue

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
                            "vm": "ubuntu"
                        }
                        logger.info(json.dumps(log_entry))
                        print("[CMD] {} ran: {}".format(client_ip, cmd))

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
                    channel.send("root@ubuntu-server:{}# ".format(cwd_display))
                else:
                    if char.isprintable():
                        command_buffer += char
                        channel.send(char)

            except Exception:
                break

    except Exception as e:
        logger.error("Error with {}: {}".format(client_ip, e))
    finally:
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "event": "session_ended",
            "src_ip": client_ip,
            "total_commands": len(session["history"]),
            "commands": session["history"],
            "duration": str(datetime.now() - session["start_time"]),
            "honeypot": "ssh",
            "vm": "ubuntu"
        }
        logger.info(json.dumps(log_entry))
        print("[SESSION ENDED] {} — {} commands captured".format(
            client_ip, len(session["history"])))
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
    print("[*] Listening on port {}".format(port))
    print("[*] AI Bridge: {}".format(AI_BRIDGE_URL))
    print("[*] Mode: HIGH INTERACTION + AI")
    print("[*] Waiting for attackers...")

    while True:
        try:
            client, addr = server_socket.accept()
            client_ip = addr[0]
            print("\n[+] New connection from {}".format(client_ip))
            thread = threading.Thread(target=handle_client, args=(client, client_ip))
            thread.daemon = True
            thread.start()
        except KeyboardInterrupt:
            print("\n[*] Shutting down GhostTrap")
            break

if __name__ == "__main__":
    start_honeypot(port=22)
