import SeverityBadge from "./SeverityBadge";
import { analyzeCommand, getSessionRiskSummary } from "../utils/threatUtils";

function getCommandRowStyle(severity, styles) {
  if (severity === "CRITICAL") return styles.rowCritical;
  if (severity === "HIGH") return styles.rowHigh;
  if (severity === "MEDIUM") return styles.rowMedium;
  return styles.rowLow;
}

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
    return (
      <div style={styles.emptyCell}>
        Select a session from the table above to inspect attacker behavior.
      </div>
    );
  }

  const riskSummary = getSessionRiskSummary(commands);

  return (
    <div style={styles.detailsPanel}>
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

      <div>
        <div style={{ marginBottom: "14px" }}>
          <h4 style={{ margin: 0, color: "var(--text)", fontSize: "18px" }}>
            Session Risk Summary
          </h4>
        </div>

        <div style={styles.riskGrid}>
          <div style={{ ...styles.detailCard, ...styles.kpiCritical }}>
            <div style={styles.detailLabel}>Overall Risk</div>
            <div style={{ marginTop: "10px" }}>
              <SeverityBadge severity={riskSummary.overall} />
            </div>
          </div>

          <div style={{ ...styles.detailCard, ...styles.kpiCritical }}>
            <div style={styles.detailLabel}>Critical Commands</div>
            <div style={styles.cardValue}>{riskSummary.counts.CRITICAL}</div>
          </div>

          <div style={{ ...styles.detailCard, ...styles.kpiHigh }}>
            <div style={styles.detailLabel}>High Risk Commands</div>
            <div style={styles.cardValue}>{riskSummary.counts.HIGH}</div>
          </div>

          <div style={{ ...styles.detailCard, ...styles.kpiMedium }}>
            <div style={styles.detailLabel}>Medium Risk Commands</div>
            <div style={styles.cardValue}>{riskSummary.counts.MEDIUM}</div>
          </div>

          <div style={{ ...styles.detailCard, ...styles.kpiLow }}>
            <div style={styles.detailLabel}>Low Risk Commands</div>
            <div style={styles.cardValue}>{riskSummary.counts.LOW}</div>
          </div>
        </div>
      </div>

      <div>
        <div style={{ marginBottom: "14px" }}>
          <h4 style={{ margin: 0, color: "var(--text)", fontSize: "18px" }}>
            Session Commands
          </h4>
        </div>

        {!commands.length ? (
          <div style={styles.emptyCell}>No commands recorded for this session.</div>
        ) : (
          <div style={styles.commandsList}>
            {commands.map((cmd, idx) => {
              const analysis = analyzeCommand(cmd.command || "-");

              return (
                <div
                  key={idx}
                  style={{
                    ...styles.commandCard,
                    ...getCommandRowStyle(analysis.severity, styles),
                  }}
                >
                  <div style={styles.commandTop}>
                    <div style={styles.commandText}>{cmd.command || "-"}</div>
                    <SeverityBadge severity={analysis.severity} />
                  </div>

                  <div style={styles.commandMeta}>
                    <div style={styles.metaBox}>
                      <div style={styles.metaLabel}>Timestamp</div>
                      <div style={styles.metaValue}>{cmd.timestamp || "-"}</div>
                    </div>

                    <div style={styles.metaBox}>
                      <div style={styles.metaLabel}>Reason</div>
                      <div style={styles.metaValue}>{analysis.reason}</div>
                    </div>

                    <div style={styles.metaBox}>
                      <div style={styles.metaLabel}>Working Directory</div>
                      <div style={styles.metaValue}>{cmd.cwd || "-"}</div>
                    </div>

                    <div style={styles.metaBox}>
                      <div style={styles.metaLabel}>Output</div>
                      <div style={styles.metaValue}>{cmd.output || "-"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
