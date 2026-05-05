import { useMemo, useState } from "react";

export default function RecentActivity({ sessions, styles }) {
  const [filter, setFilter] = useState("all");

  const enriched = useMemo(() => {
    return (sessions || []).map((s) => ({
      ...s,
      isActive: !s.end_time,
      risk: getRisk(s),
    }));
  }, [sessions]);

  const filtered = enriched.filter((s) => {
    if (filter === "live") return s.isActive;
    if (filter === "high") return ["High", "Critical"].includes(s.risk);
    if (filter === "commands") return Number(s.total_commands || 0) > 0;
    if (filter === "india") return s.sensor_country === "India";
    if (filter === "us") return s.sensor_country === "United States";
    if (filter === "legacy") return s.sensor_id === "pre-sensor";
    return true;
  });

  if (!sessions || sessions.length === 0) {
    return <p style={styles.muted}>No recent activity.</p>;
  }

  return (
    <div style={ui.wrap}>
      {/* STICKY FILTER BAR */}
      <div style={ui.toolbar}>
        {[
          ["all", "All"],
          ["live", "Live"],
          ["high", "High Risk"],
          ["commands", "Commands Seen"],
          ["india", "India Sensor"],
          ["us", "US Sensor"],
          ["legacy", "Legacy Data"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              ...ui.chip,
              ...(filter === key ? ui.chipActive : {}),
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div style={ui.table}>
        <div style={ui.header}>
          <div>Time</div>
          <div>Attacker</div>
          <div>Origin</div>
          <div>Sensor</div>
          <div>Flow</div>
          <div>Risk</div>
        </div>

        {filtered.slice(0, 20).map((s) => (
          <div key={s.session_id} style={ui.row}>
            <div>
              <div style={ui.main}>{formatTime(s.start_time)}</div>
              <div style={ui.sub}>{s.attacker_day || "-"}</div>
            </div>

            <div>
              <div style={ui.main}>{s.source_ip}</div>
              <div style={ui.sub}>{shortAsn(s.asn)}</div>
            </div>

            <div>
              <div style={ui.main}>{s.city || "Unknown"}</div>
              <div style={ui.sub}>
                {normalizeCountry(s.country)} · {s.country_code || "--"}
              </div>
            </div>

            <div>
              <div style={ui.sensor}>{sensorLabel(s)}</div>
              <div style={ui.sub}>{s.sensor_id}</div>
            </div>

            <div style={ui.flow}>
              {s.country_code || "--"} → {sensorCode(s.sensor_country)}
            </div>

            <div>
              <span style={{ ...ui.risk, ...riskStyle(s.risk) }}>
                {s.risk}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- LOGIC ---------- */

function getRisk(s) {
  const commands = Number(s.total_commands || 0);
  const attempts = Number(s.login_attempts || 0);

  if (commands >= 5) return "Critical";
  if (commands >= 2) return "High";
  if (attempts >= 20 || commands > 0) return "Medium";
  return "Low";
}

/* ---------- HELPERS ---------- */

function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function shortAsn(asn) {
  if (!asn) return "Unknown ASN";
  return asn.split(" ").slice(0, 2).join(" ");
}

function normalizeCountry(country) {
  if (!country) return "Unknown";
  if (country === "The Netherlands") return "Netherlands";
  return country;
}

function sensorCode(country) {
  if (country === "India") return "IN";
  if (country === "United States") return "US";
  return "--";
}

function sensorLabel(s) {
  if (s.sensor_id === "pre-sensor") return "Legacy";
  return s.sensor_region || s.sensor_country || "Unknown";
}

/* ---------- UI ---------- */

const ui = {
  wrap: { minWidth: "1000px" },

  toolbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    gap: "10px",
    padding: "14px 0",
    background: "linear-gradient(180deg, #0b1120 70%, rgba(11,17,32,0.92))",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(148,163,184,0.15)",
  },

  chip: {
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#1e293b",
    color: "#94a3b8",
    border: "1px solid #334155",
    cursor: "pointer",
    fontWeight: 700,
  },

  chipActive: {
    background: "#0ea5e9",
    color: "#fff",
  },

  table: {
    border: "1px solid #1e293b",
    borderRadius: "12px",
    overflow: "hidden",
    marginTop: "10px",
  },

  header: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr",
    padding: "12px 16px",
    background: "#0f172a",
    fontSize: "12px",
    color: "#64748b",
    fontWeight: 800,
  },

  row: {
    display: "grid",
    gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1fr 1fr",
    padding: "16px",
    borderTop: "1px solid #1e293b",
  },

  main: {
    fontWeight: 800,
    color: "#e2e8f0",
  },

  sub: {
    fontSize: "12px",
    color: "#64748b",
  },

  sensor: {
    color: "#38bdf8",
    fontWeight: 800,
  },

  flow: {
    fontWeight: 700,
  },

  risk: {
    padding: "6px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 800,
  },

  critical: { background: "#7f1d1d", color: "#fecaca" },
  high: { background: "#7c2d12", color: "#fed7aa" },
  medium: { background: "#78350f", color: "#fde68a" },
  low: { background: "#064e3b", color: "#bbf7d0" },
};

function riskStyle(r) {
  if (r === "Critical") return ui.critical;
  if (r === "High") return ui.high;
  if (r === "Medium") return ui.medium;
  return ui.low;
}
