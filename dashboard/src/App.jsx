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
          subtitle="Credential guesses logged"
          icon={Users}
          styles={styles}
        />
        <StatCard
          title="Commands Logged"
          value={summary?.commands_logged}
          subtitle="Attacker commands"
          icon={Terminal}
          styles={styles}
        />
        <StatCard
          title="Enriched IPs"
          value={summary?.enriched_ips}
          subtitle="IPs with intel"
          icon={Globe}
          styles={styles}
        />
      </div>

      <div style={styles.grid2}>
        <Section title="Activity Timeline" styles={styles}>
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

        <Section title="Top Commands Bar View" styles={styles}>
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
        <Section title="Top Commands" styles={styles}>
          <TopList
            items={topCommands}
            labelKey="label"
            valueKey="count"
            emptyText="No command data."
            styles={styles}
          />
        </Section>

        <Section title="Top Usernames" styles={styles}>
          <TopList
            items={topUsernames}
            labelKey="label"
            valueKey="count"
            emptyText="No username data."
            styles={styles}
          />
        </Section>

        <Section title="Top Passwords" styles={styles}>
          <TopList
            items={topPasswords}
            labelKey="label"
            valueKey="count"
            emptyText="No password data."
            styles={styles}
          />
        </Section>

        <Section title="Top Source IPs" styles={styles}>
          <TopList
            items={topIps}
            labelKey="label"
            valueKey="count"
            emptyText="No IP data."
            styles={styles}
          />
        </Section>
      </div>

      <Section
        title="Recent Sessions"
        right={<span style={styles.muted}>Updated: {lastUpdated || "-"}</span>}
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
        title="Session Details"
        right={
          selectedSessionId ? (
            <span style={styles.muted}>Selected: {selectedSessionId}</span>
          ) : (
            <span style={styles.muted}>Click a session row</span>
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
  );
}
