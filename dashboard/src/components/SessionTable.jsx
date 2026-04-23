import SeverityBadge from "./SeverityBadge";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

function shortId(id) {
  if (!id) return "-";
  if (id.length <= 18) return id;
  return `${id.slice(0, 8)}...${id.slice(-6)}`;
}

export default function SessionTable({
  sessions,
  selectedSessionId,
  onSelectSession,
  styles,
}) {
  if (!sessions.length) {
    return <div style={styles.emptyCell}>No sessions found.</div>;
  }

  return (
    <div style={styles.tableWrap}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {sessions.map((session, idx) => {
          const isSelected = selectedSessionId === session.session_id;

          return (
            <div
              key={`${session.session_id}-${idx}`}
              onClick={() => onSelectSession(session.session_id)}
              style={{
                ...styles.sessionRow,
                ...(isSelected ? styles.sessionRowSelected : {}),
                gridTemplateColumns: "1.6fr 1fr 0.8fr 0.7fr 0.7fr 1.1fr",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ ...styles.sessionTitle, ...styles.mono }}>
                  {shortId(session.session_id)}
                </div>
                <div style={styles.sessionSub}>
                  {(session.honeypot || "-")} • {(session.vm || "-")}
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.detailValue}>{session.source_ip || "-"}</div>
                <div style={styles.sessionSub}>Source IP</div>
              </div>

              <div>
                <SeverityBadge severity="LOW" />
              </div>

              <div>
                <div style={styles.detailValue}>{session.total_commands ?? 0}</div>
                <div style={styles.sessionSub}>Commands</div>
              </div>

              <div>
                <div style={styles.detailValue}>{session.ai_calls ?? 0}</div>
                <div style={styles.sessionSub}>AI Calls</div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={styles.detailValue}>
                  {formatDateTime(session.start_time)}
                </div>
                <div style={styles.sessionSub}>
                  End {formatDateTime(session.end_time)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
