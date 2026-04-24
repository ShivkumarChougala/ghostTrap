export default function TopCommandThreats({ commands, styles }) {
  if (!commands || commands.length === 0) {
    return <p style={styles.muted}>No command data.</p>;
  }

  return (
    <div style={styles.commandThreatList}>
      {commands.slice(0, 8).map((item, index) => {
        const risk = getCommandRisk(item.label);

        return (
          <div key={index} style={styles.commandThreatItem}>
            <div>
              <div style={styles.commandText}>{item.label}</div>
              <div style={styles.commandSub}>{risk.reason}</div>
            </div>

            <div style={styles.commandRight}>
  <span style={styles.countText}>{item.count}</span>
  <span style={{ ...styles.riskPill, ...risk.style }}>
    {risk.label}
  </span>
</div>
          </div>
        );
      })}
    </div>
  );
}

function getCommandRisk(command = "") {
  if (/wget|curl|nc|bash -i|python -c|python3 -c/i.test(command)) {
    return {
      label: "Critical",
      reason: "Possible malware download or reverse shell behavior",
      style: { background: "#ef444422", color: "#f87171" },
    };
  }

  if (/shadow|passwd|id_rsa|authorized_keys/i.test(command)) {
    return {
      label: "High",
      reason: "Sensitive file access attempt",
      style: { background: "#f59e0b22", color: "#fbbf24" },
    };
  }

  if (/uname|whoami|id|hostname|pwd|ls/i.test(command)) {
    return {
      label: "Recon",
      reason: "System reconnaissance command",
      style: { background: "#38bdf822", color: "#7dd3fc" },
    };
  }

  return {
    label: "Low",
    reason: "General shell activity",
    style: { background: "#22c55e22", color: "#4ade80" },
  };
}
