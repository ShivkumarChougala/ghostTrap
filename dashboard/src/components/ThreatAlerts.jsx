export default function ThreatAlerts({ sessions, styles }) {
  if (!sessions || sessions.length === 0) {
    return <p style={styles.muted}>No alerts.</p>;
  }

  const alerts = sessions.slice(0, 6).map((s) => {
    return {
      id: s.session_id,
      ip: s.source_ip,
      time: s.start_time,
      severity: getSeverity(s),
      message: buildMessage(s),
    };
  });

  return (
    <div style={styles.alertList}>
      {alerts.map((a) => (
        <div
          key={a.id}
          style={{
            ...styles.alertItem,
            ...a.severity.style,
          }}
        >
          <div>
            <div style={styles.alertTitle}>{a.severity.label}</div>

            <div style={styles.alertSub}>
              {a.message}
            </div>
          </div>

          <div style={styles.alertTime}>
            {formatTime(a.time)}
          </div>
        </div>
      ))}
    </div>
  );
}

function getSeverity(session) {
  if (session.total_commands > 10) {
    return {
      label: "Critical activity",
      style: {
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.3)",
      },
    };
  }

  if (session.total_commands > 3) {
    return {
      label: "High activity",
      style: {
        background: "rgba(245,158,11,0.12)",
        border: "1px solid rgba(245,158,11,0.3)",
      },
    };
  }

  return {
    label: "Login attempt",
    style: {
      background: "rgba(59,130,246,0.12)",
      border: "1px solid rgba(59,130,246,0.3)",
    },
  };
}

function buildMessage(s) {
  if (s.total_commands > 0) {
    return `IP ${s.source_ip} executed ${s.total_commands} commands`;
  }

  return `SSH login attempt from ${s.source_ip}`;
}

function formatTime(ts) {
  if (!ts) return "-";
  return new Date(ts).toLocaleTimeString();
}
