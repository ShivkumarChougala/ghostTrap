"""
GhostTrap - command_handler.py
Dispatches fake shell commands and returns responses.
Imports filesystem data from fake_fs.py and AI fallback from aiBridge.py.
"""
import json
import time
from datetime import datetime
from loguru import logger
from core.ssh.fake_fs import FAKE_FS, FAKE_FILES, SENSITIVE_FILES, resolve_path
from ai.aiBridge import ask_ai


def handle_command(command, session):
    """
    Process a command string and return the output to send back to the attacker.
    Returns "EXIT" to signal the session should close.
    """
    cmd = command.strip()
    if not cmd:
        return ""

    parts = cmd.split()
    base_cmd = parts[0]

    # ── Directory navigation ──────────────────────────────────────────────
    if base_cmd == "cd":
        target = parts[1] if len(parts) > 1 else "/root"
        new_path = resolve_path(session["cwd"], target)
        if new_path in FAKE_FS:
            session["cwd"] = new_path
            return ""
        return f"bash: cd: {target}: No such file or directory"

    elif base_cmd == "pwd":
        return session["cwd"]

    elif base_cmd == "sudo":
        if len(parts) > 1 and parts[1] == "-l":
            return (
                "Matching Defaults entries for ubuntu on ubuntu-server:\n"
                "    env_reset, mail_badpass\n\n"
                "User ubuntu may run the following commands on ubuntu-server:\n"
                "    (ALL : ALL) ALL"
            )
        if "su" in cmd or "-i" in cmd:
            # FIX 2: capture old_user BEFORE reassigning session["user"]
            old_user = session["user"]
            session["user"] = "root"
            session["cwd"] = "/root"
            # FIX 1: correct indentation — logger call is part of this if block
            logger.warning(json.dumps({
                "timestamp": datetime.now().isoformat(),
                "event": "privilege_escalation",
                "src_ip": session["client_ip"],
                "from_user": old_user,
                "to_user": "root",
                "method": cmd,
                "threat_level": "CRITICAL",
                "session_id": session["session_id"]
            }))
            print(f"[CRITICAL] {session['client_ip']} escalated from {old_user} to root via {cmd}")
            return ""
        # FIX 3: return is now inside the sudo block's else, not at module level
        return "[sudo] password for ubuntu: "

    elif base_cmd == "su":
        old_user = session["user"]
        session["user"] = "root"
        session["cwd"] = "/root"
        logger.warning(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "privilege_escalation",
            "src_ip": session["client_ip"],
            "from_user": old_user,
            "to_user": "root",
            "method": cmd,
            "threat_level": "CRITICAL",
            "session_id": session["session_id"]
        }))
        print(f"[CRITICAL] {session['client_ip']} escalated from {old_user} to root via {cmd}")
        return ""

    elif base_cmd == "id":
        if session["user"] == "root":
            return "uid=0(root) gid=0(root) groups=0(root)"
        return "uid=1000(ubuntu) gid=1000(ubuntu) groups=1000(ubuntu),27(sudo)"

    elif base_cmd == "whoami":
        return session["user"]

    elif base_cmd == "hostname":
        return "ubuntu-server"

    elif base_cmd == "uname":
        if "-a" in parts:
            return "Linux ubuntu-server 5.15.0-52-generic #58-Ubuntu SMP x86_64 x86_64 x86_64 GNU/Linux"
        return "Linux"

    elif base_cmd == "free":
        return (
            "              total        used        free      shared  buff/cache   available\n"
            "Mem:           1992         342         911          12         738        1502\n"
            "Swap:             0           0           0"
        )

    elif base_cmd == "df":
        return (
            "Filesystem      Size  Used Avail Use% Mounted on\n"
            "/dev/sda1        40G  3.1G   35G   9% /\n"
            "tmpfs           996M     0  996M   0% /dev/shm"
        )

    elif base_cmd == "ps":
        if "aux" in parts:
            return (
                "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n"
                "root         1  0.0  0.1  22500  4100 ?        Ss   Mar10   0:03 /sbin/init\n"
                "root       512  0.0  0.2  39244  5400 ?        Ss   Mar10   0:01 /usr/sbin/sshd -D\n"
                "root      1043  0.0  0.1  16800  3200 pts/0    Ss   10:20   0:00 -bash\n"
                "root      2100  0.1  0.3  45000  6200 ?        Sl   10:25   0:02 python3 monitor.py"
            )
        return (
            "USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n"
            "root         1  0.0  0.1  22500  4100 ?        Ss   Mar10   0:03 /sbin/init\n"
            "root       512  0.0  0.2  39244  5400 ?        Ss   Mar10   0:01 /usr/sbin/sshd -D\n"
            "root      1043  0.0  0.1  16800  3200 pts/0    Ss   10:20   0:00 -bash"
        )

    elif base_cmd == "top":
        return (
            "top - 10:25:01 up 1 day,  3:42,  1 user,  load average: 0.15, 0.10, 0.05\n"
            "Tasks:  85 total,   1 running,  84 sleeping,   0 stopped,   0 zombie\n"
            "%Cpu(s):  2.0 us,  1.0 sy,  0.0 ni, 97.0 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\n"
            "MiB Mem :   1992.0 total,   911.0 free,   342.0 used,   738.0 buff/cache\n"
            "MiB Swap:      0.0 total,     0.0 free,     0.0 used.  1502.0 avail Mem"
        )

    elif base_cmd == "history":
        output = []
        for i, entry in enumerate(session["history"], 1):
            output.append(f"{i}  {entry['command']}")
        return "\n".join(output)

    elif base_cmd == "ip":
        if len(parts) > 1 and parts[1] == "a":
            return (
                "1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n"
                "    inet 127.0.0.1/8 scope host lo\n"
                "2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n"
                "    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0"
            )
        return ""

    elif base_cmd == "ifconfig":
        return (
            "eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n"
            "        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n"
            "        ether 02:42:ac:11:00:02  txqueuelen 1000  (Ethernet)\n"
            "lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n"
            "        inet 127.0.0.1  netmask 255.0.0.0"
        )

    elif base_cmd == "netstat":
        return (
            "Active Internet connections (only servers)\n"
            "Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n"
            "tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      512/sshd\n"
            "tcp        0      0 127.0.0.1:631           0.0.0.0:*               LISTEN      421/cupsd\n"
            "udp        0      0 0.0.0.0:68              0.0.0.0:*                           325/dhclient"
        )

    elif base_cmd == "ss":
        return (
            "Netid State  Recv-Q Send-Q Local Address:Port   Peer Address:Port\n"
            "tcp   LISTEN 0      128    0.0.0.0:22          0.0.0.0:*\n"
            "tcp   LISTEN 0      128    127.0.0.1:631       0.0.0.0:*\n"
            "udp   UNCONN 0      0      0.0.0.0:68          0.0.0.0:*"
        )

    elif base_cmd == "lsof":
        return (
            "COMMAND  PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\n"
            "sshd     512 root    3u  IPv4  18342      0t0  TCP *:22 (LISTEN)\n"
            "cupsd    421 root    6u  IPv4  15321      0t0  TCP 127.0.0.1:631 (LISTEN)\n"
            "dhclient 325 root    7u  IPv4  12111      0t0  UDP *:68"
        )

    elif base_cmd == "clear":
        return "\033[2J\033[H"

    # ── File listing ─────────────────────────────────────────────────────
    elif base_cmd == "ls":
        path = session["cwd"]
        files = FAKE_FS.get(path, [])
        if "-la" in cmd or "-l" in cmd:
            result = "total 48\ndrwx------ 4 root root 4096 Mar 11 10:00 .\ndrwxr-xr-x 20 root root 4096 Mar 11 10:00 ..\n"
            for f in files:
                full_path = resolve_path(path, f)
                if full_path in FAKE_FS:
                    result += f"drwxr-xr-x 2 root root 4096 Mar 11 10:00 {f}\n"
                else:
                    result += f"-rw-r--r-- 1 root root 1234 Mar 11 10:00 {f}\n"
            return result.strip()
        return "  ".join(files) if files else ""

    # ── File creation ─────────────────────────────────────────────────────
    elif base_cmd == "touch":
        if len(parts) > 1:
            file_path = resolve_path(session["cwd"], parts[1])
            FAKE_FS.setdefault(session["cwd"], [])
            if parts[1] not in FAKE_FS[session["cwd"]]:
                FAKE_FS[session["cwd"]].append(parts[1])
            FAKE_FILES[file_path] = ""
            return ""
        return "touch: missing file operand"

    # ── File reading ──────────────────────────────────────────────────────
    elif base_cmd == "cat":
        if len(parts) < 2:
            return ""
        filepath = resolve_path(session["cwd"], parts[1])
        if filepath in FAKE_FILES:
            if filepath in SENSITIVE_FILES:
                _log_sensitive_access(session, filepath)
            return FAKE_FILES[filepath].strip()
        if filepath in FAKE_FS:
            return f"cat: {parts[1]}: Is a directory"
        return f"cat: {parts[1]}: No such file or directory"

    # ── Network download attempts ─────────────────────────────────────────
    elif base_cmd in ["wget", "curl"]:
        url = parts[-1] if len(parts) > 1 else ""
        _log_download_attempt(session, url)
        return (
            f"--2026-03-11 10:00:00--  {url}\n"
            "Resolving... failed: Temporary failure in name resolution."
        )

    # ── Exit ──────────────────────────────────────────────────────────────
    elif base_cmd in ["exit", "logout", "quit"]:
        return "EXIT"

    # ── Unknown → AI fallback ─────────────────────────────────────────────
    else:
        ai_calls = session.get("ai_calls", 0)
        if ai_calls >= 2:
            return f"bash: {command}: command not found"
        session["ai_calls"] = ai_calls + 1
        print(f"[AI] Sending to AI: {command}")
        start = time.time()
        response = ask_ai(command, session["cwd"], session["history"])
        latency_ms = round((time.time() - start) * 1000, 2)
        logger.info(json.dumps({
            "timestamp": datetime.now().isoformat(),
            "event": "ai_command_response",
            "src_ip": session["client_ip"],
            "user": session["user"],
            "command": command,
            "latency_ms": latency_ms,
            "session_id": session["session_id"],
            "ai_model": "phi3:mini",
            "used_ai": True
        }))
        return response or f"bash: {command}: command not found"


def _log_sensitive_access(session, filepath):
    """Log when sensitive files are accessed"""
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


def _log_download_attempt(session, url):
    """Log when attacker attempts to download malware"""
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "event": "malware_download_attempt",
        "src_ip": session["client_ip"],
        "url": url,
        "category": "download",
        "threat_level": "CRITICAL",
        "session_id": session["session_id"]
    }
    logger.warning(json.dumps(log_entry))
    print(f"[CRITICAL] {session['client_ip']} tried to download: {url}")
