from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

SYSTEM_PROMPT = """You are a real Ubuntu 22.04 Linux server terminal.
Hostname: ubuntu-server, User: root.

STRICT RULES:
1. Respond ONLY with raw terminal output
2. NO backticks
3. NO markdown
4. NO explanations
5. NO code blocks
6. SHORT realistic responses only
7. Never break character
"""

@app.route('/command', methods=['POST'])
def handle_command():
    data = request.json

    command = data.get('command', '')
    cwd = data.get('cwd', '/root')
    history = data.get('history', [])

    history_text = ""
    for h in history[-3:]:
        history_text += f"$ {h['command']}\n{h.get('response','')}\n"

    prompt = f"""{SYSTEM_PROMPT}

CWD: {cwd}

History:
{history_text}

Command: {command}
Output:
"""

    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 80
                }
            },
            timeout=60
        )

        if response.status_code == 200:

            result = response.json().get("response", "")

            # clean markdown / garbage
            result = result.replace("```", "")
            result = result.replace("`", "")
            result = result.strip()

            # prevent huge output
            result = result[:1500]

            # fallback if model returns nothing
            if not result:
                result = f"bash: {command}: command not found"

            return jsonify({"response": result})

    except Exception as e:
        print(f"[AI ERROR] {e}")

    return jsonify({"response": f"bash: {command}: command not found"})


if __name__ == '__main__':
    print("[*] GhostTrap AI Bridge running on port 5000")
    app.run(host='0.0.0.0', port=5000)
