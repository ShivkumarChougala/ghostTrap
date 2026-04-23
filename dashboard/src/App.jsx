import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Shield,
  Terminal,
  Users,
  RefreshCw,
  Search,
  Globe,
  AlertTriangle,
} from "lucide-react";
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

import { getDashboardData, getSessionDetails } from "./services/api";
import { styles } from "./styles/dashboardStyles";

import StatCard from "./components/StatCard";
import Section from "./components/Section";
import TopList from "./components/TopList";
import SessionTable from "./components/SessionTable";
import SessionDetails from "./components/SessionDetails";

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

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [selectedCommands, setSelectedCommands] = useState([]);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const loadDashboard = async (mode = "initial") => {
    try {
      setError("");
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

      const data = await getDashboardData();

      setSummary(data.summary);
      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
      setTopCommands(Array.isArray(data.topCommands) ? data.topCommands : []);
      setTopUsernames(Array.isArray(data.topUsernames) ? data.topUsernames : []);
      setTopPasswords(Array.isArray(data.topPasswords) ? data.topPasswords : []);
      setTopIps(Array.isArray(data.topSourceIps) ? data.topSourceIps : []);
      setRecentSessions(Array.isArray(data.recentSessions) ? data.recentSessions : []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadSelectedSession = async (sessionId) => {
    try {
      setSessionLoading(true);
      setSessionError("");
      setSelectedSessionId(sessionId);

      const data = await getSessionDetails(sessionId);

      setSelectedSession(data.session);
      setSelectedCommands(Array.isArray(data.commands) ? data.commands : []);
    } catch (err) {
      setSessionError(err.message || "Failed to load session details");
      setSelectedSession(null);
      setSelectedCommands([]);
    } finally {
      setSessionLoading(false);
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

  const posture = useMemo(() => {
    const critical = selectedCommands.filter((c) =>
      /shadow|id_rsa|authorized_keys|nc|python -c|python3 -c|bash -i|curl|wget/i.test(
        c.command || ""
      )
    ).length;

    const high = selectedCommands.filter((c) =>
      /sudo|su|useradd|adduser|passwd/i.test(c.command || "")
    ).length;

    const medium = selectedCommands.filter((c) =>
      /chmod|chown|find|cat|tail|head/i.test(c.command || "")
    ).length;

    const low = selectedCommands.filter((c) =>
      /ls|pwd|whoami|id|uname|hostname|ps/i.test(c.command || "")
    ).length;

    return { critical, high, medium, low };
  }, [selectedCommands]);

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.shell}>
          <h1 style={styles.heading}>GhostTrap Command Center</h1>
          <p style={styles.subheading}>Loading live honeypot telemetry...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.header}>
          <div>
            <div style={styles.badgePill}>
              <span style={styles.liveDot} />
              Live Threat Monitoring
            </div>

            <div style={styles.headingRow}>
              <div style={styles.logoBox}>
                <Shield size={24} />
              </div>

              <div>
                <h1 style={styles.heading}>GhostTrap Command Center</h1>
                <p style={styles.subheading}>
                  Real-time SSH honeypot monitoring, attacker behavior visibility,
                  session intelligence, and command risk analysis in one place.
                </p>
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
                placeholder="Search by session, IP, honeypot, VM..."
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
          <StatCard
            title="Total Sessions"
            value={summary?.total_sessions}
            subtitle="Captured SSH sessions"
            icon={Activity}
            styles={styles}
          />
          <StatCard
            title="Login Attempts"
            value={summary?.login_attempts}
            subtitle="Credential guessing activity"
            icon={Users}
            styles={styles}
          />
          <StatCard
            title="Commands Logged"
            value={summary?.commands_logged}
            subtitle="Observed attacker commands"
            icon={Terminal}
            styles={styles}
          />
          <StatCard
            title="Enriched IPs"
            value={summary?.enriched_ips}
            subtitle="IPs resolved with threat intel"
            icon={Globe}
            styles={styles}
          />
        </div>

        <div style={styles.grid2}>
          <Section
            title="Attack Activity Timeline"
            subtitle="Sessions and attacker interactions over time"
            right={<span style={styles.muted}>Updated: {lastUpdated || "-"}</span>}
            styles={styles}
          >
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={timeline}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis dataKey="time_bucket" stroke="rgba(255,255,255,0.35)" />
                  <YAxis stroke="rgba(255,255,255,0.35)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(11,21,38,0.96)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "#e5eef9",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="#3dd9ff"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="commands"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section
            title="Threat Posture"
            subtitle="Current command risk snapshot from selected session"
            styles={styles}
          >
            <div style={styles.riskGrid}>
              <div style={{ ...styles.detailCard, ...styles.kpiCritical }}>
                <div style={styles.detailLabel}>Critical</div>
                <div style={styles.cardValue}>{posture.critical}</div>
              </div>

              <div style={{ ...styles.detailCard, ...styles.kpiHigh }}>
                <div style={styles.detailLabel}>High</div>
                <div style={styles.cardValue}>{posture.high}</div>
              </div>

              <div style={{ ...styles.detailCard, ...styles.kpiMedium }}>
                <div style={styles.detailLabel}>Medium</div>
                <div style={styles.cardValue}>{posture.medium}</div>
              </div>

              <div style={{ ...styles.detailCard, ...styles.kpiLow }}>
                <div style={styles.detailLabel}>Low</div>
                <div style={styles.cardValue}>{posture.low}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  ...styles.detailCard,
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <AlertTriangle size={18} color="#f59e0b" />
                <div style={styles.detailValue}>
                  {selectedSessionId
                    ? `Selected session: ${selectedSessionId}`
                    : "Select a session below to inspect its command risk profile."}
                </div>
              </div>
            </div>
          </Section>
        </div>

        <div style={styles.grid2Equal}>
          <Section
            title="Top Commands Chart"
            subtitle="Most frequently observed attacker commands"
            styles={styles}
          >
            <div style={{ width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topCommands.slice(0, 6)}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    stroke="rgba(255,255,255,0.35)"
                    tickFormatter={(value) =>
                      String(value).length > 10 ? `${String(value).slice(0, 10)}…` : value
                    }
                  />
                  <YAxis stroke="rgba(255,255,255,0.35)" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(11,21,38,0.96)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "14px",
                      color: "#e5eef9",
                    }}
                  />
                  <Bar dataKey="count" fill="#4f8cff" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section
            title="Top Commands List"
            subtitle="Top command values with counts"
            styles={styles}
          >
            <TopList
              items={topCommands}
              labelKey="label"
              valueKey="count"
              emptyText="No command data."
              styles={styles}
              limit={8}
            />
          </Section>
        </div>

        <div style={styles.grid3}>
          <Section
            title="Top Usernames"
            subtitle="Most observed usernames"
            styles={styles}
          >
            <TopList
              items={topUsernames}
              labelKey="label"
              valueKey="count"
              emptyText="No username data."
              styles={styles}
              limit={8}
            />
          </Section>

          <Section
            title="Top Passwords"
            subtitle="Most observed passwords"
            styles={styles}
          >
            <TopList
              items={topPasswords}
              labelKey="label"
              valueKey="count"
              emptyText="No password data."
              styles={styles}
              limit={8}
            />
          </Section>

          <Section
            title="Top Source IPs"
            subtitle="Most active attacker source IPs"
            styles={styles}
          >
            <TopList
              items={topIps}
              labelKey="label"
              valueKey="count"
              emptyText="No IP data."
              styles={styles}
              limit={8}
            />
          </Section>
        </div>

        <Section
          title="Recent Sessions"
          subtitle="Latest attacker sessions with quick telemetry view"
          right={<span style={styles.muted}>Live window: {lastUpdated || "-"}</span>}
          styles={styles}
        >
          <SessionTable
            sessions={filteredSessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={loadSelectedSession}
            styles={styles}
          />
        </Section>

        <Section
          title="Session Intelligence"
          subtitle="Detailed session metadata, risk summary, and full command history"
          right={
            selectedSessionId ? (
              <span style={styles.muted}>Selected: {selectedSessionId}</span>
            ) : (
              <span style={styles.muted}>No session selected</span>
            )
          }
          styles={styles}
        >
          <SessionDetails
            sessionId={selectedSessionId}
            session={selectedSession}
            commands={selectedCommands}
            loading={sessionLoading}
            error={sessionError}
            styles={styles}
          />
        </Section>
      </div>
    </div>
  );
}
