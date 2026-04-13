export default function SessionTable({
  sessions,
  selectedSessionId,
  onSelectSession,
  styles,
}) {
  return (
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
          {sessions.length === 0 ? (
            <tr>
              <td colSpan="8" style={styles.emptyCell}>
                No sessions found.
              </td>
            </tr>
          ) : (
            sessions.map((session, idx) => (
              <tr
                key={`${session.session_id}-${idx}`}
                onClick={() => onSelectSession(session.session_id)}
                style={{
                  ...styles.clickableRow,
                  backgroundColor:
                    selectedSessionId === session.session_id ? "#172554" : "transparent",
                }}
              >
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
  );
}
