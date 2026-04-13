export default function SessionDetails({
  sessionId,
  session,
  commands,
  loading,
  error,
  styles,
}) {
  if (loading) {
    return <p style={styles.muted}>Loading session details...</p>;
  }

  if (error) {
    return <div style={styles.errorBox}>{error}</div>;
  }

  if (!session) {
    return <p style={styles.muted}>Select a session from the table above to inspect it.</p>;
  }

  return (
    <div>
      <div style={styles.detailsGrid}>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>Session ID</div>
          <div style={styles.detailValueMono}>{session.session_id}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>Source IP</div>
          <div style={styles.detailValue}>{session.source_ip || "-"}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>Honeypot</div>
          <div style={styles.detailValue}>{session.honeypot || "-"}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>VM</div>
          <div style={styles.detailValue}>{session.vm || "-"}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>Total Commands</div>
          <div style={styles.detailValue}>{session.total_commands ?? 0}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>AI Calls</div>
          <div style={styles.detailValue}>{session.ai_calls ?? 0}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>Start Time</div>
          <div style={styles.detailValue}>{session.start_time || "-"}</div>
        </div>
        <div style={styles.detailCard}>
          <div style={styles.detailLabel}>End Time</div>
          <div style={styles.detailValue}>{session.end_time || "-"}</div>
        </div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <h4 style={{ marginBottom: "12px", color: "#f8fafc" }}>Session Commands</h4>

        {commands.length === 0 ? (
          <p style={styles.muted}>No commands recorded for this session.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Command</th>
                  <th style={styles.th}>CWD</th>
                  <th style={styles.th}>Output</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((cmd, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{cmd.timestamp || "-"}</td>
                    <td style={styles.tdMono}>{cmd.command || "-"}</td>
                    <td style={styles.td}>{cmd.cwd || "-"}</td>
                    <td style={styles.tdPre}>{cmd.output || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
