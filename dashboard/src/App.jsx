import React, { useEffect, useMemo, useState } from "react";
import { Activity, Shield, Terminal, Users, RefreshCw, Search, Globe } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const API_BASE = "http://192.168.31.190:8000/api/v1";

async function fetchJson(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }
  return res.json();
}

function Card({ title, value, icon: Icon, subtitle }) {
  return (
    <div style={styles.card}>
      <div>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value ?? 0}</div>
        <div style={styles.cardSubtitle}>{subtitle}</div>
      </div>
      <div style={styles.iconBox}>
        <Icon size={24} />
      </div>
    </div>
  );
}

function Section({ title, children, right }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function TopList({ items, labelKey, valueKey, emptyText }) {
  if (!items || items.length === 0) {
    return <p style={styles.muted}>{emptyText}</p>;
  }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={`${item[labelKey]}-${idx}`} style={styles.topRow}>
          <span style={styles.topLabel}>{item[labelKey] || "-"}</span>
          <span style={styles.badge}>{item[valueKey] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [summary, setSummary] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [topCommands, setTopCommands] = useState([]);
  const [topUsernames, setTopUsernames] = useState([]);
  const [topPasswords, setTopPasswords] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const loadDashboard = async (mode = "initial") => {
    try {
      setError("");
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

      const [
        summaryData,
        timelineData,
        commandsData,
        usernamesData,
        passwordsData,
        ipsData,
        sessionsData,
      ] = await Promise.all([
        fetchJson("/summary"),
        fetchJson("/timeline"),
        fetchJson("/top-commands"),
        fetchJson("/top-usernames"),
        fetchJson("/top-passwords"),
        fetchJson("/top-source-ips"),
        fetchJson("/recent-sessions"),
      ]);

      setSummary(summaryData);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
      setTopCommands(Array.isArray(commandsData) ? commandsData : []);
      setTopUsernames(Array.isArray(usernamesData) ? usernamesData : []);
      setTopPasswords(Array.isArray(passwordsData) ? passwordsData : []);
      setTopIps(Array.isArray(ipsData) ? ipsData : []);
      setRecentSessions(Array.isArray(sessionsData) ? sessionsData : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard("initial");
    const timer = setInterval(() => loadDashboard("refresh"), 15000);
    return () => clearInterval(timer);
  }, []);

  const filteredSessions = useMemo(() => {
    if (!search.trim()) return recentSessions;
    const q = search.toLowerCase();

    return recentSessions.filter((session) => {
      return (
        String(session.session_id || "").toLowerCase().includes(q) ||
        String(session.source_ip || "").toLowerCase().includes(q) ||
        String(session.honeypot || "").toLowerCase().includes(q) ||
        String(session.vm || "").toLowerCase().includes(q)
      );
    });
  }, [recentSessions, search]);

  if (loading) {
    return (
      <div style={styles.page}>
        <h1 style={styles.heading}>GhostTrap Dashboard</h1>
        <p style={styles.muted}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.headingRow}>
            <div style={styles.logoBox}>
              <Shield size={24} />
            </div>
            <div>
              <h1 style={styles.heading}>GhostTrap Dashboard</h1>
              <p style={styles.subheading}>Live SSH honeypot monitoring</p>
            </div>
          </div>
        </div>

        <div style={styles.headerControls}>
          <div style={styles.searchBox}>
            <Search size={16} />
            <input
              style={styles.input}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search session, IP, honeypot..."
            />
          </div>

          <button style={styles.button} onClick={() => loadDashboard("refresh")}>
            <RefreshCw size={16} style={{ marginRight: 8 }} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      <div style={styles.grid4}>
        <Card
          title="Total Sessions"
          value={summary?.total_sessions}
          subtitle="Captured SSH sessions"
          icon={Activity}
        />
        <Card
          title="Login Attempts"
          value={summary?.login_attempts}
          subtitle="Credential guesses logged"
          icon={Users}
        />
        <Card
          title="Commands Logged"
          value={summary?.commands_logged}
          subtitle="Attacker commands"
          icon={Terminal}
        />
        <Card
          title="Enriched IPs"
          value={summary?.enriched_ips}
          subtitle="IPs with intel"
          icon={Globe}
        />
      </div>

      <div style={styles.grid2}>
        <Section title="Activity Timeline">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time_bucket" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="commands" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Top Commands Bar View">
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={topCommands.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div style={styles.grid4}>
        <Section title="Top Commands">
          <TopList
            items={topCommands}
            labelKey="label"
            valueKey="count"
            emptyText="No command data."
          />
        </Section>

        <Section title="Top Usernames">
          <TopList
            items={topUsernames}
            labelKey="label"
            valueKey="count"
            emptyText="No username data."
          />
        </Section>

        <Section title="Top Passwords">
          <TopList
            items={topPasswords}
            labelKey="label"
            valueKey="count"
            emptyText="No password data."
          />
        </Section>

        <Section title="Top Source IPs">
          <TopList
            items={topIps}
            labelKey="label"
            valueKey="count"
            emptyText="No IP data."
          />
        </Section>
      </div>

      <Section title="Recent Sessions" right={<span style={styles.muted}>Updated: {lastUpdated || "-"}</span>}>
        <div style={{ overflowX: "auto" }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Session ID</th>
                <th style={styles.th}>Source IP</th>
                <th style={styles.th}>Honeypot</th>
                <th style={styles.th}>VM</th>
                <th style={styles.th}>Commands</th>
                <th style={styles.th}>AI Calls</th>
                <th style={styles.th}>Start</th>
                <th style={styles.th}>End</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={styles.emptyCell}>
                    No sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, idx) => (
                  <tr key={`${session.session_id}-${idx}`}>
                    <td style={styles.tdMono}>{session.session_id}</td>
                    <td style={styles.td}>{session.source_ip || "-"}</td>
                    <td style={styles.td}>{session.honeypot || "-"}</td>
                    <td style={styles.td}>{session.vm || "-"}</td>
                    <td style={styles.td}>{session.total_commands ?? 0}</td>
                    <td style={styles.td}>{session.ai_calls ?? 0}</td>
                    <td style={styles.td}>{session.start_time || "-"}</td>
                    <td style={styles.td}>{session.end_time || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "#e5e7eb",
    padding: "24px",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoBox: {
    background: "#1e293b",
    padding: "12px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    margin: 0,
    fontSize: "30px",
    color: "#f8fafc",
  },
  subheading: {
    margin: "6px 0 0 0",
    color: "#94a3b8",
  },
  headerControls: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    padding: "10px 12px",
    minWidth: "280px",
  },
  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#e5e7eb",
    width: "100%",
  },
  button: {
    display: "flex",
    alignItems: "center",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontWeight: 600,
  },
  errorBox: {
    background: "#7f1d1d",
    color: "#fecaca",
    padding: "12px 14px",
    borderRadius: "10px",
    marginBottom: "20px",
  },
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  card: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "14px",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  cardValue: {
    fontSize: "32px",
    fontWeight: "bold",
    color: "#f8fafc",
  },
  cardSubtitle: {
    marginTop: "6px",
    fontSize: "12px",
    color: "#64748b",
  },
  iconBox: {
    background: "#1e293b",
    padding: "12px",
    borderRadius: "14px",
    color: "#cbd5e1",
  },
  section: {
    background: "#111827",
    border: "1px solid #1f2937",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "18px",
    color: "#f8fafc",
  },
  muted: {
    color: "#94a3b8",
    fontSize: "14px",
  },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #1f2937",
  },
  topLabel: {
    color: "#e5e7eb",
    maxWidth: "75%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  badge: {
    background: "#1e293b",
    color: "#cbd5e1",
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 600,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px",
    borderBottom: "1px solid #334155",
    color: "#94a3b8",
    fontSize: "13px",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid #1f2937",
    color: "#e5e7eb",
    fontSize: "14px",
  },
  tdMono: {
    padding: "12px",
    borderBottom: "1px solid #1f2937",
    color: "#e5e7eb",
    fontSize: "12px",
    fontFamily: "monospace",
  },
  emptyCell: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
  },
};
