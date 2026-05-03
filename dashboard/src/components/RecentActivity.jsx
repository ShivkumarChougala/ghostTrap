import SessionDetails from "./SessionDetails";

export default function RecentActivity({
  sessions,
  selectedSessionId,
  selectedSession,
  selectedCommands,
  sessionLoading,
  sessionError,
  onSelectSession,
  styles,
}) {
  if (!sessions || sessions.length === 0) {
    return <p style={styles.muted}>No recent activity.</p>;
  }

  return (
    <div style={styles.attackTable}>
      <div style={styles.attackTableHeader}>
        <div>Time</div>
        <div>Attacker</div>
        <div>Origin</div>
        <div>Target Sensor</div>
        <div>Flow</div>
        <div>Action</div>
      </div>

      {sessions.slice(0, 20).map((s) => {
        const isOpen = selectedSessionId === s.session_id;
        const isActive = !s.end_time;

        return (
          <div key={s.session_id}>
            <div style={styles.attackTableRow}>
              <div>
                <div style={styles.attackMain}>{formatTime(s.start_time)}</div>
                <div style={styles.attackSub}>{s.attacker_day || "-"}</div>
              </div>

              <div>
                <div style={styles.attackMain}>{s.source_ip}</div>
                <div style={styles.attackSub}>{shortAsn(s.asn)}</div>
              </div>

              <div>
                <div style={styles.attackMain}>{s.city || "Unknown"}</div>
                <div style={styles.attackSub}>
                  {normalizeCountry(s.country)} · {s.country_code || "--"}
                </div>
              </div>

              <div>
                <div style={styles.attackSensor}>{sensorLabel(s)}</div>
                <div style={styles.attackSub}>
                  {s.sensor_id || "pre-sensor"} · {s.sensor_provider || "GhostTrap"}
                </div>
              </div>

              <div style={styles.attackFlow}>
                {s.country_code || "--"} <span style={styles.attackArrow}>→</span>{" "}
                {sensorCode(s.sensor_country)}
              </div>

              <div style={styles.attackActions}>
                <span
                  style={{
                    ...styles.attackStatus,
                    ...(isActive ? styles.attackStatusActive : styles.attackStatusDone),
                  }}
                >
                  {isActive ? "Live" : "Done"}
                </span>

                <button
                  style={{
                    ...styles.attackViewButton,
                    ...(isOpen ? styles.attackViewButtonActive : {}),
                  }}
                  onClick={() => onSelectSession(s.session_id)}
                >
                  {isOpen ? "Hide" : "View"}
                </button>
              </div>
            </div>

            {isOpen && (
              <div style={styles.inlineSessionDetails}>
                <SessionDetails
                  sessionId={selectedSessionId}
                  session={selectedSession}
                  commands={selectedCommands}
                  loading={sessionLoading}
                  error={sessionError}
                  styles={styles}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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
  if (country === "Unknown") return "LEG";
  return "--";
}

function sensorLabel(s) {
  if (s.sensor_id === "pre-sensor") return "Legacy / Pre-sensor";
  return s.sensor_region || s.sensor_country || "Unknown Sensor";
}
