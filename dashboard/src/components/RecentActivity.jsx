export default function RecentActivity({ sessions, onSelectSession, styles }) {
  if (!sessions || sessions.length === 0) {
    return <p style={styles.muted}>No recent activity.</p>;
  }

  return (
    <div>
      {sessions.slice(0, 20).map((s) => (
        <div key={s.session_id} style={styles.activityItem}>
          <div style={styles.activityTime}>
            {formatTime(s.start_time)}
          </div>

          <div style={styles.activityContent}>
            <div>
              SSH session from <b>{s.source_ip}</b>
            </div>

            <div style={styles.activitySub}>
              Honeypot: {s.honeypot} · VM: {s.vm} · Commands:{" "}
              {s.total_commands}
            </div>
          </div>

          <div
            style={styles.activityBadge}
            onClick={() => onSelectSession(s.session_id)}
          >
            View
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(ts) {
  if (!ts) return "-";
  const d = new Date(ts);
  return d.toLocaleTimeString();
}
