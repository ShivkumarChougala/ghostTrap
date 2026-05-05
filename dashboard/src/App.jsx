import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Shield,
  Terminal,
  Users,
  RefreshCw,
  Search,
  Globe,
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
  Cell,
} from "recharts";
import { getDashboardData, getSessionDetails } from "./services/api";
import { styles } from "./styles/dashboardStyles";

import StatCard from "./components/StatCard";
import Section from "./components/Section";
import TopList from "./components/TopList";
import RecentActivity from "./components/RecentActivity";
import SessionDetails from "./components/SessionDetails";
import TopCommandThreats from "./components/TopCommandThreats";
import IPIntelSummary from "./components/IPIntelSummary";
import AttackMap from "./components/AttackMap";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://192.168.31.190:8000/api/v1";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [summary24h, setSummary24h] = useState(null);
  const [liveOverview, setLiveOverview] = useState(null);

  const [timeline, setTimeline] = useState([]);
  const [topCommands, setTopCommands] = useState([]);
  const [topUsernames, setTopUsernames] = useState([]);
  const [topPasswords, setTopPasswords] = useState([]);
  const [topIps, setTopIps] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [ipIntelSummary, setIpIntelSummary] = useState(null);

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

  const formatNumber = (value) => Number(value || 0).toLocaleString();

  const loadLiveOverview = async () => {
    const res = await fetch(`${API_BASE}/overview?hours=1`);
    if (!res.ok) throw new Error(`Live overview API error ${res.status}`);
    const json = await res.json();
    setLiveOverview(json.data || json);
  };

  const loadDashboard = async (mode = "initial") => {
    try {
      setError("");
      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

      const data = await getDashboardData();
      await loadLiveOverview();

      setSummary(data.summary || data);
      setSummary24h(data.summary24h || {});
      setTimeline(Array.isArray(data.timeline) ? data.timeline : []);
      setTopCommands(Array.isArray(data.topCommands) ? data.topCommands : []);
      setTopUsernames(Array.isArray(data.topUsernames) ? data.topUsernames : []);
      setTopPasswords(Array.isArray(data.topPasswords) ? data.topPasswords : []);
      setTopIps(Array.isArray(data.topSourceIps) ? data.topSourceIps : []);
      setRecentSessions(Array.isArray(data.recentSessions) ? data.recentSessions : []);
      setIpIntelSummary(data.ipIntelSummary || null);
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

      if (selectedSessionId === sessionId) {
        setSelectedSessionId(null);
        setSelectedSession(null);
        setSelectedCommands([]);
        return;
      }

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

    const timer = setInterval(() => {
      loadDashboard("refresh");
    }, 60000);

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
        String(session.vm || "").toLowerCase().includes(q) ||
        String(session.country || "").toLowerCase().includes(q) ||
        String(session.sensor_id || "").toLowerCase().includes(q)
      );
    });
  }, [recentSessions, search]);

  const getAddedMetric = (key) => {
    const total = Number(summary?.[key] || 0);
    const added = Number(summary24h?.[key] || 0);
    const percent = total > 0 ? ((added / total) * 100).toFixed(1) : "0.0";

    return `+${formatNumber(added)} in last 24h · ${percent}% of total`;
  };

  const threatBannerText = useMemo(() => {
    const attempts = Number(liveOverview?.login_attempts || 0);

    if (attempts >= 1000) {
      return `Critical Attack Activity — ${formatNumber(
        attempts
      )} login attempts observed in the last 1 hour`;
    }

    if (attempts >= 100) {
      return `High Attack Activity — ${formatNumber(
        attempts
      )} login attempts observed in the last 1 hour`;
    }

    if (attempts >= 25) {
      return `Moderate Attack Activity — ${formatNumber(
        attempts
      )} login attempts observed in the last 1 hour`;
    }

    return `Normal Activity — ${formatNumber(
      attempts
    )} login attempts observed in the last 1 hour`;
  }, [liveOverview]);

  if (loading) {
    return (
      <div style={styles.appLayout}>
       
        <div style={styles.pageWithSidebar}>
          <div style={styles.shell}>
            <h1 style={styles.heading}>GhostTrap</h1>
            <p style={styles.subheading}>Loading live honeypot telemetry...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.appLayout}>
      

      <div style={styles.pageWithSidebar}>
        <div style={styles.shell}>
          <div id="overview" style={styles.header}>
            <div>
              <div style={styles.badgePill}>
                <span style={styles.liveDot} />
                Live Threat Monitoring · 
              </div>

              <div style={styles.headingRow}>
                <div style={styles.logoBox}>
                  <Shield size={24} />
                </div>

                <div>
                  <h1 style={styles.heading}>GhostTrap</h1>
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
                  placeholder="Search session, IP, country, sensor..."
                />
              </div>

              <button style={styles.button} onClick={() => loadDashboard("refresh")}>
                <RefreshCw size={16} style={{ marginRight: 8 }} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          
     <div style={styles.threatBanner}>
  	 <div style={styles.threatBannerLeft}>
    	 <span style={styles.threatSeverityDot} />

    	<div style={styles.threatBannerMetric}>
      	Live Threat Signal
    	</div>

    	<div style={styles.threatBannerSub}>
     	 {formatNumber(liveOverview?.login_attempts || 0)} login attempts in the last 1 hour
    	</div>
    </div>

   <div style={styles.threatBannerRight}>
   	 Updated {lastUpdated || "-"} · Refresh 60s
  </div>
</div>
 


          <div style={styles.grid4}>
            <StatCard
              title="Total Sessions"
              value={summary?.total_sessions}
              subtitle={getAddedMetric("total_sessions")}
              icon={Activity}
              styles={styles}
            />

            <StatCard
              title="Login Attempts"
              value={summary?.login_attempts}
              subtitle={getAddedMetric("login_attempts")}
              icon={Users}
              styles={styles}
            />

            <StatCard
              title="Commands Logged"
              value={summary?.commands_logged}
              subtitle={getAddedMetric("commands_logged")}
              icon={Terminal}
              styles={styles}
            />

            <StatCard
              title="Enriched IPs"
              value={summary?.enriched_ips}
              subtitle={getAddedMetric("enriched_ips")}
              icon={Globe}
              styles={styles}
            />
          </div>

          <div id="attack-map">
            <Section
              title="Global Attack Map"
              subtitle="Observed attacker locations based on enriched source IPs"
              styles={styles}
            >
              <AttackMap intel={ipIntelSummary} styles={styles} />
            </Section>
          </div>

          <div id="ip-intel">
            <Section
              title="IP Intelligence Summary"
              subtitle="Geo, ASN, and enrichment coverage for observed attacker IPs"
              styles={styles}
            >
              <IPIntelSummary intel={ipIntelSummary} styles={styles} />
            </Section>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1.7fr) minmax(360px, 0.8fr)",
              gap: "22px",
              alignItems: "stretch",
            }}
          >
            <Section
              title="Attack Activity Timeline"
              subtitle="Sessions and attacker interactions over time"
              right={<span style={styles.muted}>Updated: {lastUpdated || "-"}</span>}
              styles={styles}
            >
              <div style={{ width: "100%", height: 460 }}>
                <ResponsiveContainer width="100%" height="100%">
                <BarChart
  data={timeline}
  margin={{ top: 28, right: 32, left: 8, bottom: 18 }}
  barCategoryGap="20%"
  barGap={6}
>
  <defs>
    <linearGradient id="sessionsBar" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
      <stop offset="100%" stopColor="#0891b2" stopOpacity={0.55} />
    </linearGradient>

    
  </defs>

  <CartesianGrid
    stroke="rgba(255,255,255,0.07)"
    strokeDasharray="3 3"
    vertical={false}
  />
<XAxis
  dataKey="timestamp"
  tickFormatter={(val) =>
    new Date(val).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })
  }
  stroke="rgba(255,255,255,0.35)"
  tick={{ fontSize: 12, fill: "rgba(226,232,240,0.65)" }}
  minTickGap={28}
  axisLine={false}
  tickLine={false}
/>
  <YAxis
    stroke="rgba(255,255,255,0.35)"
    tick={{ fontSize: 12, fill: "rgba(226,232,240,0.65)" }}
    width={42}
    axisLine={false}
    tickLine={false}
  />

  <Tooltip
  cursor={{ fill: "rgba(148,163,184,0.06)" }}
  formatter={(value, name) => [
    Number(value).toLocaleString("en-IN"),
    name,
  ]}
  labelFormatter={(val) =>
  new Date(val).toLocaleString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}
  contentStyle={{
    background: "rgba(8,13,26,0.98)",
    border: "1px solid rgba(148,163,184,0.24)",
    borderRadius: "16px",
    color: "#e5eef9",
    border: "1px solid rgba(148,163,184,0.18)",
  }}
  labelStyle={{
    color: "#f8fafc",
    fontWeight: 800,
    marginBottom: 10,
  }}
  itemStyle={{
    color: "#22d3ee",
    fontWeight: 700,
  }}
/>

  <Bar
  dataKey="sessions"
  name="Sessions"
  radius={[10, 10, 0, 0]}
  barSize={36}
>
  {timeline.map((entry, index) => (
    <Cell
      key={`cell-${index}`}
      fill={
        entry.sessions > 4000
          ? "#ef4444" // 🔴 spike = red
          : "url(#sessionsBar)"
      }
    />
  ))}
</Bar>

 
</BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section
              title="Command Risk Intelligence"
              subtitle="Commands classified by attacker behavior"
              styles={styles}
            >
              <div
                style={{
                  maxHeight: "460px",
                  overflowY: "auto",
                  paddingRight: "6px",
                }}
              >
                <TopCommandThreats commands={topCommands} styles={styles} />
              </div>
            </Section>
          </div>

          <div id="credentials" style={styles.grid3}>
            <Section title="Top Usernames" subtitle="Most observed usernames" styles={styles}>
              <TopList
                items={topUsernames}
                labelKey="label"
                valueKey="count"
                emptyText="No username data."
                styles={styles}
                limit={8}
              />
            </Section>

            <Section title="Top Passwords" subtitle="Most observed passwords" styles={styles}>
              <TopList
                items={topPasswords}
                labelKey="label"
                valueKey="count"
                emptyText="No password data."
                styles={styles}
                limit={8}
              />
            </Section>

            <div id="source-ips">
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
          </div>

          <div id="sessions">
            <Section
              title="Session Intelligence Feed"
              subtitle="Attacker sessions enriched with origin, sensor, intent, activity, and risk context"
              right={<span style={styles.muted}>Updated: {lastUpdated || "-"}</span>}
              styles={styles}
            >
              <div
                style={{
                  maxHeight: "520px",
                  overflowY: "auto",
                  overflowX: "auto",
                  paddingRight: "6px",
                }}
              >
                <RecentActivity
                  sessions={filteredSessions}
                  onSelectSession={loadSelectedSession}
                  selectedSessionId={selectedSessionId}
                  styles={styles}
                />
              </div>
            </Section>
          </div>

          {selectedSessionId && (
            <Section
              title="Session Intelligence"
              subtitle="Detailed session metadata, risk summary, and full command history"
              right={<span style={styles.muted}>Selected: {selectedSessionId}</span>}
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
          )}
        </div>
      </div>
    </div>
  );
}
