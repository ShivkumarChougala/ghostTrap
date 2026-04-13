const API_BASE = "http://192.168.31.190:8000/api/v1";

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return res.json();
}

export async function getDashboardData() {
  const [
    summary,
    timeline,
    topCommands,
    topUsernames,
    topPasswords,
    topSourceIps,
    recentSessions,
  ] = await Promise.all([
    fetchJson("/summary"),
    fetchJson("/timeline"),
    fetchJson("/top-commands"),
    fetchJson("/top-usernames"),
    fetchJson("/top-passwords"),
    fetchJson("/top-source-ips"),
    fetchJson("/recent-sessions"),
  ]);

  return {
    summary,
    timeline,
    topCommands,
    topUsernames,
    topPasswords,
    topSourceIps,
    recentSessions,
  };
}

export async function getSessionDetails(sessionId) {
  const [session, commands] = await Promise.all([
    fetchJson(`/sessions/${sessionId}`),
    fetchJson(`/sessions/${sessionId}/commands`),
  ]);

  return {
    session,
    commands,
  };
}
