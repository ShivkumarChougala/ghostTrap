"""
GhostTrap - shell_input.py
Interactive shell input loop: arrow key history, tab completion, backspace, Ctrl-C, colored prompt.
Called from handle_client() in ssh_honeypot.py via run_shell().
"""

import json
from datetime import datetime
from loguru import logger

from core.ssh.fake_fs import FAKE_FS, resolve_path
# --------------------------
# Known shell commands for tab completion
# --------------------------
KNOWN_COMMANDS = [
    "cat", "cd", "clear", "curl", "df", "echo", "exit", "find",
    "free", "grep", "hostname", "id", "ifconfig", "ip", "ls",
    "logout", "mkdir", "mv", "nano", "ps", "pwd", "rm", "scp",
    "ssh", "tail", "touch", "uname", "vim", "wget", "whoami",
]

# --------------------------
# Prompt
# --------------------------
HOSTNAME = "ubuntu-server"

def build_prompt(cwd, hostname=HOSTNAME):
    display_cwd = "~" if cwd == "/root" else cwd
    return (
        f"\033[01;32mroot@{hostname}\033[0m"
        f":\033[01;34m{display_cwd}\033[0m"
        f"# "
    ).encode()


# --------------------------
# Escape sequence constants
# --------------------------
ESC         = b'\x1b'
TAB         = b'\x09'
UP_ARROW    = '[A'
DOWN_ARROW  = '[B'
RIGHT_ARROW = '[C'
LEFT_ARROW  = '[D'


# --------------------------
# Main shell loop
# --------------------------
def run_shell(channel, session, handle_command_fn):
    """
    Drop-in replacement for the raw recv loop in handle_client().

    Args:
        channel           : paramiko channel
        session           : session dict (cwd, history, client_ip, session_id, ...)
        handle_command_fn : handle_command(cmd, session) from command_handler.py
    """
    buf        = ""
    history    = []
    hist_idx   = -1
    escape_buf = ""
    in_escape  = False

    channel.send(build_prompt(session["cwd"]))

    while True:
        try:
            data = channel.recv(1)
        except Exception:
            break
        if not data:
            break

        # ── Mid escape sequence ───────────────────────────────────────────
        if in_escape:
            escape_buf += data.decode("utf-8", errors="ignore")
            if len(escape_buf) < 2:
                continue

            action = None
            if escape_buf == UP_ARROW:
                action = "up"
            elif escape_buf == DOWN_ARROW:
                action = "down"
            elif escape_buf in (RIGHT_ARROW, LEFT_ARROW):
                action = "skip"
            else:
                in_escape = False
                escape_buf = ""
                continue

            in_escape = False
            escape_buf = ""

            if action == "up":
                if history and hist_idx < len(history) - 1:
                    hist_idx += 1
                    buf = history[-(hist_idx + 1)]
                    _redraw(channel, session["cwd"], buf)
            elif action == "down":
                if hist_idx > 0:
                    hist_idx -= 1
                    buf = history[-(hist_idx + 1)]
                    _redraw(channel, session["cwd"], buf)
                elif hist_idx == 0:
                    hist_idx = -1
                    buf = ""
                    _redraw(channel, session["cwd"], buf)
            continue

        # ── ESC byte ─────────────────────────────────────────────────────
        if data == ESC:
            in_escape = True
            escape_buf = ""
            continue

        # ── Backspace ─────────────────────────────────────────────────────
        if data in (b'\x7f', b'\x08'):
            if buf:
                buf = buf[:-1]
                channel.send(b'\x08 \x08')
            continue

        # ── Ctrl-C ────────────────────────────────────────────────────────
        if data == b'\x03':
            buf = ""
            hist_idx = -1
            channel.send(b'^C\r\n')
            channel.send(build_prompt(session["cwd"]))
            continue

        # ── Ctrl-L (clear screen) ─────────────────────────────────────────
        if data == b'\x0c':
            channel.send(b'\033[2J\033[H')
            channel.send(build_prompt(session["cwd"]))
            if buf:
                channel.send(buf.encode())
            continue

        # ── Enter ─────────────────────────────────────────────────────────
        try:
            char = data.decode("utf-8")
        except UnicodeDecodeError:
            continue

        if char in ("\r", "\n"):
            channel.send(b'\r\n')
            cmd = buf.strip()

            if cmd:
                if not history or history[-1] != cmd:
                    history.append(cmd)
                hist_idx = -1

                logger.info(json.dumps({
                    "timestamp":  datetime.now().isoformat(),
                    "event":      "ssh_command",
                    "src_ip":     session["client_ip"],
                    "command":    cmd,
                    "cwd":        session["cwd"],
                    "honeypot":   "ssh",
                    "session_id": session["session_id"]
                }))
                print(f"[CMD] {session['client_ip']} ran: {cmd}")

                response = handle_command_fn(cmd, session)

                if response == "EXIT":
                    channel.send(b'logout\r\n')
                    break

                session["history"].append({
                    "command":  cmd,
                    "response": response,
                    "cwd":      session["cwd"]
                })

                if response:
                    for line in response.split("\n"):
                        channel.send((line + "\r\n").encode())

            buf = ""
            channel.send(build_prompt(session["cwd"]))
            continue

        # ── Tab completion ────────────────────────────────────────────────
        if data == TAB:
            buf = _handle_tab(channel, session["cwd"], buf)
            continue

        # ── Printable char ────────────────────────────────────────────────
        if char.isprintable():
            buf += char
            channel.send(char.encode())


# --------------------------
# Helpers
# --------------------------
def _redraw(channel, cwd, buf):
    """Clear the current line and reprint prompt + buffer."""
    channel.send(b'\r\033[K')
    channel.send(build_prompt(cwd))
    if buf:
        channel.send(buf.encode())


def _handle_tab(channel, cwd, buf):
    """
    Tab completion logic.
    - First word → complete against KNOWN_COMMANDS
    - Second word onwards → complete against fake filesystem entries
    Behaves like bash: single match autocompletes, multiple matches prints list.
    """
    parts = buf.split(" ")

    if len(parts) == 1:
        # Completing a command name
        prefix   = parts[0]
        matches  = [c for c in KNOWN_COMMANDS if c.startswith(prefix)]
        if not matches:
            return buf
        if len(matches) == 1:
            # Single match — complete it and add a space
            completed = matches[0] + " "
            channel.send(b'\r\033[K')
            channel.send(build_prompt(cwd))
            channel.send(completed.encode())
            return completed
        else:
            # Multiple matches — print them below like bash does
            channel.send(b'\r\n')
            channel.send(("  ".join(matches) + "\r\n").encode())
            channel.send(build_prompt(cwd))
            channel.send(buf.encode())
            return buf

    else:
        # Completing a path argument
        prefix    = parts[-1]
        completed = _complete_path(cwd, prefix)

        if not completed:
            return buf

        if len(completed) == 1:
            # Single match — fill it in
            parts[-1] = completed[0]
            new_buf   = " ".join(parts)
            # Add trailing slash if it's a directory, space if file
            full_path = resolve_path(cwd, completed[0])
            if full_path in FAKE_FS:
                new_buf += "/"
            else:
                new_buf += " "
            channel.send(b'\r\033[K')
            channel.send(build_prompt(cwd))
            channel.send(new_buf.encode())
            return new_buf
        else:
            # Multiple matches — list them
            channel.send(b'\r\n')
            channel.send(("  ".join(completed) + "\r\n").encode())
            channel.send(build_prompt(cwd))
            channel.send(buf.encode())
            return buf


def _complete_path(cwd, prefix):
    """
    Return filesystem entries that match the given prefix,
    relative to cwd or absolute if prefix starts with /.
    """
    if prefix.startswith("/"):
        # Absolute path — split into dir + partial name
        if "/" in prefix[1:]:
            dir_part  = prefix.rsplit("/", 1)[0] or "/"
            name_part = prefix.rsplit("/", 1)[1]
        else:
            dir_part  = "/"
            name_part = prefix[1:]
    else:
        if "/" in prefix:
            dir_part  = resolve_path(cwd, prefix.rsplit("/", 1)[0])
            name_part = prefix.rsplit("/", 1)[1]
        else:
            dir_part  = cwd
            name_part = prefix

    entries = FAKE_FS.get(dir_part, [])
    return [e for e in entries if e.startswith(name_part)]
