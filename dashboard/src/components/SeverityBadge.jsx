const severityStyles = {
  CRITICAL: {
    background: "rgba(239, 68, 68, 0.14)",
    color: "#fecaca",
    border: "1px solid rgba(239, 68, 68, 0.28)",
  },
  HIGH: {
    background: "rgba(251, 146, 60, 0.14)",
    color: "#fed7aa",
    border: "1px solid rgba(251, 146, 60, 0.28)",
  },
  MEDIUM: {
    background: "rgba(245, 158, 11, 0.14)",
    color: "#fde68a",
    border: "1px solid rgba(245, 158, 11, 0.28)",
  },
  LOW: {
    background: "rgba(34, 197, 94, 0.14)",
    color: "#bbf7d0",
    border: "1px solid rgba(34, 197, 94, 0.28)",
  },
  NONE: {
    background: "rgba(148, 163, 184, 0.12)",
    color: "#cbd5e1",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
};

export default function SeverityBadge({ severity = "NONE" }) {
  const style = severityStyles[severity] || severityStyles.NONE;

  return (
    <span
      style={{
        ...style,
        padding: "6px 11px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 800,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: "88px",
        textAlign: "center",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        backdropFilter: "blur(10px)",
      }}
    >
      {severity}
    </span>
  );
}
