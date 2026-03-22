"""
GhostTrap - fake_fs.py
Fake filesystem structure, file contents, and path resolution.
"""

# --------------------------
# Fake directory tree
# --------------------------
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

# --------------------------
# Fake file contents
# --------------------------
FAKE_FILES = {
    "/etc/passwd": (
        "root:x:0:0:root:/root:/bin/bash\n"
        "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash\n"
        "admin:x:1001:1001:Admin:/home/admin:/bin/bash\n"
        "mysql:x:112:117:MySQL:/var/lib/mysql:/bin/false\n"
    ),
    "/etc/shadow": (
        "root:$6$xyz$hashedpassword123:19000:0:99999:7:::\n"
        "ubuntu:$6$abc$anotherhashedpwd:19000:0:99999:7:::\n"
    ),
    "/etc/hostname": "ubuntu-server\n",
    "/root/notes.txt": (
        "TODO:\n"
        "- Update SSL cert\n"
        "- Change DB password (currently: Pr0d@2024!)\n"
        "- Backup before Friday\n"
    ),
    "/root/.bash_history": (
        "ls -la\n"
        "cd /var/www/html\n"
        "mysql -u root -pPr0d@2024!\n"
        "cat /etc/shadow\n"
        "wget http://update.server.com/patch.sh\n"
    ),
    "/root/.ssh/id_rsa": (
        "-----BEGIN RSA PRIVATE KEY-----\n"
        "MIIEowIBAAKCAQEA2a2rwplBQLzHPZe5RJr9GhMiGMKuSaRFuaErFHHBTMDWxFAb\n"
        "-----END RSA PRIVATE KEY-----\n"
    ),
    "/var/www/html/wp-config.php": (
        "<?php\n"
        "define('DB_NAME', 'wordpress');\n"
        "define('DB_USER', 'wpuser');\n"
        "define('DB_PASSWORD', 'WpP@ss2024!');\n"
        "define('DB_HOST', 'localhost');\n"
    ),
}

# Files that trigger a CRITICAL alert when read
SENSITIVE_FILES = {
    "/etc/shadow",
    "/root/.ssh/id_rsa",
    "/root/notes.txt",
    "/var/www/html/wp-config.php",
}

# --------------------------
# Path resolver
# --------------------------
def resolve_path(cwd, path):
    """Resolve a path (absolute or relative) against cwd."""
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
