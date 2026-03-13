from flask import Flask, request, jsonify
import requests
import time
import random

app = Flask(__name__)

SYSTEM_PROMPT = """You are a real Ubuntu 22.04 Linux terminal.

Hostname: ubuntu-server
User: root
Shell: bash

Rules:
- Respond exactly like a Linux terminal.
- Output ONLY the command result.
- Never explain anything.
- Never mention AI, model, or assistant.
- Never use markdown, backticks, or formatting.
- Never add extra text.

If a command fails return the exact bash error.

Examples:

ls
bin boot dev etc home root tmp usr var

pwd
/root

whoami
root

cd /etc

ls
passwd shadow hostname resolv.conf

If a command is unknown:
bash: <command>: command not found

Stay in character as a Linux terminal.
"""

COMMON_COMMANDS = {
    "whoami": "root",
    "pwd": "/root",
    "hostname": "ubuntu-server",
    "id": "uid=0(root) gid=0(root) groups=0(root)",
    "uname -a": "Linux ubuntu-server 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux",
    "uptime": " 10:14:22 up 12 days,  3:21,  2 users,  load average: 0.12, 0.08, 0.05",
}

@app.route('/command', methods=['POST'])
def handle_command():

    data = request.json
    command = data.get('command', '').strip()
    cwd = data.get('cwd', '/root')
    history = data.get('history', [])

    # Realistic response delay
    time.sleep(random.uniform(0.1, 0.5))

    # Handle common commands locally
    if command in COMMON_COMMANDS:
        return jsonify({"response": COMMON_COMMANDS[command]})

    history_text = ""
    for h in history[-3:]:
        history_text += f"$ {h['command']}\n{h.get('response','')}\n"

    prompt = f"""{SYSTEM_PROMPT}

Current Directory:
{cwd}

History:
{history_text}

$ {command}
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2,
                    "num_predict": 40
                }
            },
            timeout=60
        )

        if response.status_code == 200:

            result = response.json().get("response", "").strip()

            # Clean AI output
            result = result.replace("```", "")
            result = result.replace("`", "")
            result = result.replace("bash>", "")
            result = result.replace("$ ", "")
            result = result.strip()

            if result == "":
                result = f"bash: {command.split()[0]}: command not found"

            return jsonify({"response": result})

    except Exception:
        pass

    return jsonify({"response": f"bash: {command.split()[0]}: command not found"})


if __name__ == '__main__':
    print("[*] GhostTrap AI Bridge running on port 5000")
    app.run(host='0.0.0.0', port=5000)
