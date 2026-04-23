export const styles = {
  page: {
    minHeight: "100vh",
    color: "var(--text)",
    padding: "32px 24px 40px",
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  shell: {
    maxWidth: "1440px",
    margin: "0 auto",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "28px",
  },

  headingRow: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },

  logoBox: {
    width: "56px",
    height: "56px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(79,140,255,0.22), rgba(139,92,246,0.18))",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "var(--shadow)",
    color: "var(--text)",
    backdropFilter: "blur(14px)",
  },

  badgePill: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(61, 217, 255, 0.18)",
    background: "rgba(61, 217, 255, 0.08)",
    color: "#9feaff",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "14px",
  },

  liveDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "var(--cyan)",
    boxShadow: "0 0 16px rgba(61, 217, 255, 0.9)",
  },

  heading: {
    margin: 0,
    fontSize: "40px",
    lineHeight: 1.05,
    fontWeight: 700,
    letterSpacing: "-0.04em",
    color: "var(--text)",
  },

  subheading: {
    margin: "8px 0 0 0",
    color: "var(--muted)",
    fontSize: "15px",
    maxWidth: "760px",
    lineHeight: 1.6,
  },

  headerControls: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    alignItems: "center",
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "16px",
    padding: "12px 14px",
    minWidth: "320px",
    color: "var(--muted)",
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(14px)",
  },

  input: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "var(--text)",
    width: "100%",
    fontSize: "14px",
  },

  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, rgba(61,217,255,0.18), rgba(79,140,255,0.18))",
    color: "var(--text)",
    border: "1px solid rgba(61,217,255,0.16)",
    borderRadius: "16px",
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(14px)",
  },

  errorBox: {
    background: "rgba(239, 68, 68, 0.14)",
    border: "1px solid rgba(239, 68, 68, 0.22)",
    color: "#fecaca",
    padding: "14px 16px",
    borderRadius: "16px",
    marginBottom: "20px",
  },

  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    marginBottom: "18px",
  },

  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  grid2: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.55fr) minmax(340px, 1fr)",
    gap: "18px",
    marginBottom: "18px",
  },

  grid2Equal: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "18px",
    marginBottom: "18px",
  },

  card: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(16px)",
    minHeight: "132px",
    position: "relative",
    overflow: "hidden",
  },

  cardGlow: {
    position: "absolute",
    inset: "-40% auto auto -10%",
    width: "160px",
    height: "160px",
    borderRadius: "999px",
    background: "radial-gradient(circle, rgba(61,217,255,0.14), transparent 68%)",
    pointerEvents: "none",
  },

  cardTitle: {
    fontSize: "13px",
    color: "var(--muted)",
    marginBottom: "10px",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 700,
  },

  cardValue: {
    fontSize: "38px",
    fontWeight: 800,
    lineHeight: 1,
    color: "var(--text)",
    letterSpacing: "-0.04em",
  },

  cardSubtitle: {
    marginTop: "10px",
    fontSize: "13px",
    color: "var(--muted)",
    lineHeight: 1.5,
  },

  iconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "#cfe8ff",
    flexShrink: 0,
  },

  section: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "24px",
    padding: "20px",
    marginBottom: "18px",
    boxShadow: "var(--shadow)",
    backdropFilter: "blur(16px)",
    minWidth: 0,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },

  sectionTitleWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: 0,
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    lineHeight: 1.1,
    fontWeight: 700,
    color: "var(--text)",
    letterSpacing: "-0.02em",
  },

  sectionSubtext: {
    color: "var(--muted)",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  muted: {
    color: "var(--muted)",
    fontSize: "13px",
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },

  topLabel: {
    color: "var(--text)",
    maxWidth: "78%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    fontSize: "14px",
  },

  badge: {
    background: "rgba(255,255,255,0.08)",
    color: "var(--text)",
    padding: "5px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
    border: "1px solid rgba(255,255,255,0.08)",
  },

  tableWrap: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  sessionRow: {
    display: "grid",
    gridTemplateColumns: "1.45fr 1fr 0.8fr 0.7fr 0.7fr 1fr",
    gap: "14px",
    alignItems: "center",
    padding: "16px 18px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.16)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  sessionRowSelected: {
    border: "1px solid rgba(79,140,255,0.34)",
    background: "rgba(79,140,255,0.12)",
    boxShadow: "0 0 0 1px rgba(79,140,255,0.12) inset",
  },

  sessionHeaderRow: {
    display: "grid",
    gridTemplateColumns: "1.45fr 1fr 0.8fr 0.7fr 0.7fr 1fr",
    gap: "14px",
    padding: "0 18px 6px",
    color: "var(--muted)",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
  },

  sessionTitle: {
    color: "var(--text)",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  sessionSub: {
    color: "var(--muted)",
    fontSize: "12px",
    marginTop: "4px",
  },

  mono: {
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
  },

  emptyCell: {
    padding: "24px",
    textAlign: "center",
    color: "var(--muted)",
    border: "1px dashed rgba(255,255,255,0.12)",
    borderRadius: "18px",
    background: "rgba(255,255,255,0.03)",
  },

  detailsPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
  },

  detailCard: {
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "16px",
    minHeight: "92px",
    minWidth: 0,
  },

  detailLabel: {
    color: "var(--muted)",
    fontSize: "11px",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    fontWeight: 700,
  },

  detailValue: {
    color: "var(--text)",
    fontSize: "15px",
    lineHeight: 1.5,
    wordBreak: "break-word",
    fontWeight: 600,
  },

  detailValueMono: {
    color: "var(--text)",
    fontSize: "13px",
    lineHeight: 1.6,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    wordBreak: "break-word",
  },

  riskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },

  kpiCritical: {
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.16)",
  },

  kpiHigh: {
    background: "rgba(251,146,60,0.10)",
    border: "1px solid rgba(251,146,60,0.16)",
  },

  kpiMedium: {
    background: "rgba(245,158,11,0.10)",
    border: "1px solid rgba(245,158,11,0.16)",
  },

  kpiLow: {
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.16)",
  },

  commandsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  commandCard: {
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "14px 16px",
    minWidth: 0,
  },

  commandTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "14px",
    marginBottom: "10px",
  },

  commandText: {
    color: "#9feaff",
    fontSize: "13px",
    fontWeight: 700,
    lineHeight: 1.6,
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    wordBreak: "break-word",
  },

  commandMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "10px",
  },

  metaBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "14px",
    padding: "10px 12px",
    minWidth: 0,
  },

  metaLabel: {
    color: "var(--muted)",
    fontSize: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: "6px",
    fontWeight: 700,
  },

  metaValue: {
    color: "var(--text)",
    fontSize: "13px",
    lineHeight: 1.5,
    wordBreak: "break-word",
  },

  rowCritical: {
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.14)",
  },

  rowHigh: {
    background: "rgba(251,146,60,0.08)",
    border: "1px solid rgba(251,146,60,0.14)",
  },

  rowMedium: {
    background: "rgba(245,158,11,0.08)",
    border: "1px solid rgba(245,158,11,0.14)",
  },

  rowLow: {
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.14)",
  },
};
