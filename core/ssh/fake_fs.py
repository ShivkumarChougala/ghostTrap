"""
GhostTrap - fake_fs.py
Fake filesystem structure, file contents, and path resolution.
"""

# --------------------------
# Fake directory tree
# --------------------------
FAKE_FS = {
    "/": ["bin", "boot", "dev", "etc", "home", "lib", "opt", "proc", "root", "srv", "tmp", "usr", "var"],
    "/etc": ["passwd", "shadow", "hosts", "hostname", "resolv.conf", "os-release", "crontab", "ssh", "mysql"],
    "/etc/ssh": ["sshd_config", "ssh_config"],
    "/etc/mysql": ["my.cnf"],
    "/root": [".bashrc", ".bash_history", ".ssh", ".env", "backup.zip", "notes.txt", "scripts"],
    "/root/.ssh": ["authorized_keys", "id_rsa", "id_rsa.pub"],
    "/root/scripts": ["backup.sh", "deploy.sh"],
    "/home": ["ubuntu", "admin", "deploy"],
    "/home/ubuntu": [".bashrc", ".profile", ".ssh", "projects"],
    "/home/ubuntu/.ssh": ["authorized_keys"],
    "/home/ubuntu/projects": ["internal-api", "site-backup"],
    "/home/admin": [".bashrc", ".ssh"],
    "/home/admin/.ssh": ["authorized_keys"],
    "/var": ["log", "www", "mail", "lib", "backups"],
    "/var/log": ["auth.log", "syslog", "nginx", "apache2"],
    "/var/log/nginx": ["access.log", "error.log"],
    "/var/log/apache2": ["access.log", "error.log"],
    "/var/backups": ["shadow.bak", "wp_backup.sql"],
    "/var/www": ["html"],
    "/var/www/html": ["index.html", "wp-config.php", "wp-admin", ".htaccess", ".env"],
    "/tmp": [],
    "/opt": ["backup", "scripts", "monitoring"],
    "/opt/scripts": ["deploy.sh", "cleanup.sh"],
    "/opt/monitoring": ["agent.conf"],
    "/srv": ["app"],
    "/srv/app": ["docker-compose.yml", ".env", "README.md"],
    "/proc": ["cpuinfo", "meminfo", "version"],
}

# --------------------------
# Fake file contents
# --------------------------
FAKE_FILES = {
    "/etc/passwd": (
        "root:x:0:0:root:/root:/bin/bash\n"
        "ubuntu:x:1000:1000:Ubuntu:/home/ubuntu:/bin/bash\n"
        "admin:x:1001:1001:Admin:/home/admin:/bin/bash\n"
        "mysql:x:112:117:MySQL:/var/lib/mysql:/usr/sbin/nologin\n"
        "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n"
    ),
    "/etc/shadow": (
        "root:$6$xyz$hashedpassword123:19000:0:99999:7:::\n"
        "ubuntu:$6$abc$anotherhashedpwd:19000:0:99999:7:::\n"
        "admin:$6$qwe$adminhash987:19000:0:99999:7:::\n"
    ),
    "/etc/hostname": "ubuntu-server\n",
    "/etc/hosts": (
        "127.0.0.1 localhost\n"
        "127.0.1.1 ubuntu-server\n"
        "192.168.1.100 ubuntu-server\n"
    ),
    "/etc/resolv.conf": (
        "nameserver 8.8.8.8\n"
        "nameserver 1.1.1.1\n"
    ),
    "/etc/os-release": (
        'PRETTY_NAME="Ubuntu 24.04.3 LTS"\n'
        'NAME="Ubuntu"\n'
        'VERSION_ID="24.04"\n'
    ),
    "/etc/ssh/sshd_config": (
        "Port 22\n"
        "PermitRootLogin yes\n"
        "PasswordAuthentication yes\n"
        "PubkeyAuthentication yes\n"
    ),
    "/etc/mysql/my.cnf": (
        "[client]\n"
        "user=root\n"
        "password=Str0ngDB@2024\n"
    ),
    "/root/notes.txt": (
        "TODO:\n"
        "- Update SSL cert\n"
        "- Change DB password (currently: Pr0d@2024!)\n"
        "- Backup before Friday\n"
    ),
    "/root/.env": (
        "APP_ENV=production\n"
        "DB_HOST=127.0.0.1\n"
        "DB_USER=prod_admin\n"
        "DB_PASS=Sup3rS3cret!\n"
        "AWS_ACCESS_KEY_ID=AKIAEXAMPLEKEY\n"
    ),
    "/root/.bash_history": (
        "ls -la\n"
        "cd /var/www/html\n"
        "mysql -u root -pPr0d@2024!\n"
        "cat /etc/shadow\n"
        "wget http://update.server.com/patch.sh\n"
        "systemctl restart nginx\n"
    ),
    "/root/.ssh/id_rsa": (
        "-----BEGIN RSA PRIVATE KEY-----\n"
        "MIIEowIBAAKCAQEA2a2rwplBQLzHPZe5RJr9GhMiGMKuSaRFuaErFHHBTMDWxFAb\n"
        "-----END RSA PRIVATE KEY-----\n"
    ),
    "/home/ubuntu/.ssh/authorized_keys": (
        "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCexample ubuntu@laptop\n"
    ),
    "/var/www/html/wp-config.php": (
        "<?php\n"
        "define('DB_NAME', 'wordpress');\n"
        "define('DB_USER', 'wpuser');\n"
        "define('DB_PASSWORD', 'WpP@ss2024!');\n"
        "define('DB_HOST', 'localhost');\n"
    ),
    "/var/www/html/.env": (
        "APP_NAME=portal\n"
        "APP_ENV=production\n"
        "DB_PASSWORD=Portal@123\n"
        "REDIS_PASSWORD=redispass\n"
    ),
    "/var/log/auth.log": (
        "Mar 11 09:21:10 ubuntu-server sshd[512]: Accepted password for root from 192.168.1.50 port 53422 ssh2\n"
        "Mar 11 09:21:15 ubuntu-server sudo: ubuntu : TTY=pts/0 ; PWD=/home/ubuntu ; USER=root ; COMMAND=/usr/bin/systemctl restart nginx\n"
    ),
    "/var/log/nginx/access.log": (
        '192.168.1.20 - - [11/Mar/2026:09:20:01 +0000] "GET / HTTP/1.1" 200 512 "-" "curl/8.5.0"\n'
    ),
    "/var/backups/shadow.bak": (
        "root:$6$xyz$backuphash:19000:0:99999:7:::\n"
    ),
    "/srv/app/docker-compose.yml": (
        "version: '3'\n"
        "services:\n"
        "  web:\n"
        "    image: nginx:latest\n"
        "  db:\n"
        "    image: mysql:8\n"
    ),
    "/srv/app/.env": (
        "MYSQL_ROOT_PASSWORD=R00tDB!\n"
        "API_KEY=prod-api-key-example\n"
    ),
    "/proc/version": "Linux version 5.15.0-52-generic (buildd@lcy02-amd64)\n",
    "/proc/cpuinfo": (
        "processor\t: 0\n"
        "model name\t: Intel(R) Xeon(R) CPU\n"
    ),
    "/proc/meminfo": (
        "MemTotal:        2048000 kB\n"
        "MemFree:          812000 kB\n"
    ),
}

# Files that trigger a CRITICAL alert when read
SENSITIVE_FILES = {
    "/etc/shadow",
    "/root/.ssh/id_rsa",
    "/root/notes.txt",
    "/root/.env",
    "/etc/mysql/my.cnf",
    "/var/www/html/wp-config.php",
    "/var/www/html/.env",
    "/var/backups/shadow.bak",
    "/srv/app/.env",
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
