const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "https://api.thechougala.in/api/v1";

const ANALYTICS_HOURS = 8760;

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}

function unwrap(res, fallback = []) {
  if (res && Object.prototype.hasOwnProperty.call(res, "data")) {
    return res.data;
  }

  return res ?? fallback;
}

function normalize(items = [], key) {
  return items.map((i) => ({
    ...i,
    label: i.label || i[key] || "unknown",
    count: Number(i.count || 0),
  }));
}

export async function getDashboardData() {
  const [
    summary,
    summary24h,
    timeline,
    commands,
    usernames,
    passwords,
    ips,
    sessions,
    threatOverview,
    malwareAttempts,
    sensitiveAccess,
    ipIntelSummary,
  ] = await Promise.all([
    fetchJson(`/overview?hours=${ANALYTICS_HOURS}`),
    fetchJson(`/overview?hours=24`),
    fetchJson(`/overview/timeline?hours=${ANALYTICS_HOURS}&interval=day`),
    fetchJson(`/analytics/commands?limit=10&hours=${ANALYTICS_HOURS}`),
    fetchJson(`/analytics/usernames?limit=10&hours=${ANALYTICS_HOURS}`),
    fetchJson(`/analytics/passwords?limit=10&hours=${ANALYTICS_HOURS}`),
    fetchJson(`/analytics/source-ips?limit=10&hours=${ANALYTICS_HOURS}`),
    fetchJson(`/sessions?page=1&page_size=100`),
    fetchJson("/threats/overview"),
    fetchJson("/threats/malware-attempts"),
    fetchJson("/threats/sensitive-access"),
    fetchJson("/ip-intel/summary"),
  ]);

  return {
    summary: unwrap(summary, {}),
    summary24h: unwrap(summary24h, {}),

    timeline: unwrap(timeline, []).map((t) => ({
      ...t,
      time_bucket: t.time_bucket || t.timestamp || t.time,
      time: t.time || t.timestamp || t.time_bucket,
      timestamp: t.timestamp || t.time_bucket || t.time,
      sessions: Number(t.sessions || 0),
      commands: Number(t.commands || 0),
    })),

    topCommands: normalize(unwrap(commands, []), "command"),
    topUsernames: normalize(unwrap(usernames, []), "username"),
    topPasswords: normalize(unwrap(passwords, []), "password"),
    topSourceIps: normalize(unwrap(ips, []), "source_ip"),

    recentSessions: unwrap(sessions, []),
    recentSessionsMeta: sessions?.meta || {},

    threatOverview: unwrap(threatOverview, {}),
    malwareAttempts: unwrap(malwareAttempts, []),
    sensitiveAccess: unwrap(sensitiveAccess, []),
    ipIntelSummary: unwrap(ipIntelSummary, {}),
  };
}

export async function getSessions(page = 1, pageSize = 100) {
  return fetchJson(`/sessions?page=${page}&page_size=${pageSize}`);
}

export async function getSessionDetails(sessionId) {
  const [session, commands] = await Promise.all([
    fetchJson(`/sessions/${sessionId}`),
    fetchJson(`/sessions/${sessionId}/commands`),
  ]);

  return {
    session: unwrap(session, {}),
    commands: unwrap(commands, []),
  };
}
