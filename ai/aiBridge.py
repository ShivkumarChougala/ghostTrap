"""
GhostTrap - aiBridge.py
Flask API wrapper around Ollama (phi3).
Also exposes ask_ai() so command_handler.py can import it directly.
Runs on port 5000, accepts POST /command from sshHoneypot.py.
"""

import requests
from flask import Flask, request, jsonify
from loguru import logger

# --------------------------
# Config
# --------------------------
OLLAMA_URL   = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "mistral"

SYSTEM_PROMPT = """You are simulating the stdout of a real Ubuntu 24.04 bash shell for a security research honeypot.

Rules:
- Output ONLY what the real command would print to stdout. Nothing else.
- Never truncate output mid-line. Always complete every line fully.
- Never include explanations, commentary, or AI-style text.
- Never include markdown, code fences, or backticks.
- Use realistic IP addresses, hostnames, timestamps, and package names.
- For network commands (ping, traceroute) use realistic latency values (10-80ms).
- For apt/yum commands show realistic package lists and version numbers.
- If a command would fail, return the exact error bash would print.
- Keep output under 20 lines unless the real command genuinely produces more.
- The hostname is ubuntu-server, the IP is 192.168.1.100."""

app = Flask(__name__)


# --------------------------
# Core AI function (importable)
# --------------------------
def ask_ai(command, cwd, session_history):
    """
    Send a command to Ollama and return a realistic shell response.
    Importable directly by command_handler.py OR called via Flask API.
    """
    history_context = ""
    if session_history:
        for entry in session_history:
            history_context += f"$ {entry['command']}\n{entry['response']}\n"

    prompt = f"""{SYSTEM_PROMPT}

Current directory: {cwd}
Recent session:
{history_context}
$ {command}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 300
                }
            },
            timeout=60
        )

        if response.status_code == 200:
            result = response.json().get("response", "").strip()
            return result.replace("```", "").replace("`", "")

        logger.warning(f"Ollama returned {response.status_code} for: {command}")
        return f"bash: {command}: command not found"

    except requests.exceptions.ConnectionError:
        logger.error(f"Ollama unreachable at {OLLAMA_URL}")
        return f"bash: {command}: command not found"

    except Exception as e:
        logger.error(f"Ollama error for '{command}': {e}")
        return f"bash: {command}: command not found"


# --------------------------
# Flask routes
# --------------------------
@app.route("/command", methods=["POST"])
def handle_command():
    data    = request.get_json(silent=True) or {}
    command = data.get("command", "")
    cwd     = data.get("cwd", "/root")
    history = data.get("history", [])

    if not command:
        return jsonify({"error": "no command provided"}), 400

    logger.info(f"[AI] received: {command} (cwd={cwd})")
    result = ask_ai(command, cwd, history)
    logger.info(f"[AI] response: {result[:80]}")

    return jsonify({"response": result})


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": OLLAMA_MODEL})


# --------------------------
# Entrypoint
# --------------------------
if __name__ == "__main__":
    logger.add("/opt/project/ghostTrap/ai/aiBridge.log", rotation="10 MB")
    print(f"[*] GhostTrap AI Bridge")
    print(f"[*] Ollama model : {OLLAMA_MODEL}")
    print(f"[*] Listening on : http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=False)
