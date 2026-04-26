const pulseKeyframes = `
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239,68,68,0.7);
  }
  70% {
    box-shadow: 0 0 0 18px rgba(239,68,68,0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239,68,68,0);
  }
}
`;
if (typeof document !== "undefined" && !document.getElementById("pulse-keyframes")) {
  const style = document.createElement("style");
  style.id = "pulse-keyframes";
  style.innerHTML = pulseKeyframes;
  document.head.appendChild(style);
}
export const styles = {
  page: {
    minHeight: "100vh",
    color: "var(--text)",
    padding: "32px 24px 40px",
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
activityItem: {
  display: "grid",
  gridTemplateColumns: "120px 1fr 100px",
  gap: "12px",
  padding: "14px",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  alignItems: "center",
},
threatBanner: {
  background: "linear-gradient(90deg, rgba(239,68,68,0.16), rgba(245,158,11,0.14))",
  border: "1px solid rgba(239,68,68,0.25)",
  padding: "14px 18px",
  borderRadius: "16px",
  fontWeight: 700,
  marginBottom: "18px",
  color: "#fecaca",
},

aiBox: {
  background: "rgba(61,217,255,0.08)",
  border: "1px solid rgba(61,217,255,0.2)",
  padding: "16px",
  borderRadius: "14px",
  color: "#9feaff",
  lineHeight: 1.6,
},

commandThreatList: {
  display: "grid",
  gap: 12,
},
countBadge: {
  background: "rgba(255,255,255,0.06)",
  padding: "6px 10px",
  borderRadius: 10,
  fontSize: 13,
  fontWeight: 700,
  minWidth: 36,
  textAlign: "center",
},
countText: {
  fontSize: 16,
  fontWeight: 800,
  color: "#e5edf8",
},
ipIntelGrid: {
  display: "grid",
  gridTemplateColumns: "0.9fr 1fr 1.4fr",
  gap: 24,
  width: "100%",
  overflow: "hidden",
},


smallTitle: {
  margin: "0 0 12px",
  fontSize: 14,
  color: "#8ea0b8",
},

coverageBox: {
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 16,
  padding: 18,
  background: "rgba(255,255,255,0.03)",
  display: "grid",
  gap: 14,
  minWidth: 0,
},

bigNumber: {
  fontSize: 36,
  fontWeight: 900,
  color: "#38bdf8",
},

coverageStats: {
  display: "grid",
  gap: 8,
  color: "#cbd5e1",
  fontSize: 13,
},

intelRow: {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 12,
  padding: "11px 0",
  borderBottom: "1px solid rgba(255,255,255,0.08)",
  color: "#dbeafe",
  fontSize: 13,
  minWidth: 0,
},
alertList: {
  display: "grid",
  gap: 12,
},

alertItem: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 14,
  borderRadius: 14,
},

alertTitle: {
  fontSize: 14,
  fontWeight: 700,
  color: "#e5edf8",
},

alertSub: {
  fontSize: 12,
  color: "#8ea0b8",
  marginTop: 4,
},

alertTime: {
  fontSize: 12,
  color: "#94a3b8",
},

intelBlock: {
  marginBottom: 12,
},

intelBar: {
  height: 6,
  background: "rgba(255,255,255,0.06)",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 6,
},

intelFill: {
  height: "100%",
  background: "linear-gradient(90deg,#ef4444,#f59e0b)",
  borderRadius: 999,
},

intelFillAlt: {
  height: "100%",
  background: "linear-gradient(90deg,#38bdf8,#8b5cf6)",
  borderRadius: 999,
},

intelText: {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
},

commandThreatItem: {
  display: "flex",
  justifyContent: "space-between",
  gap: 14,
  alignItems: "center",
  padding: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  background: "rgba(255,255,255,0.03)",
},

commandText: {
  fontFamily: "monospace",
  color: "#dbeafe",
  fontSize: 14,
},

commandSub: {
  color: "#8ea0b8",
  fontSize: 12,
  marginTop: 5,
},

commandRight: {
  display: "flex",
  alignItems: "center",
  gap: 10,
},

riskPill: {
  padding: "5px 9px",
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
},

activityTime: {
  color: "#8ea0b8",
  fontSize: 13,
},

activityContent: {
  color: "#e5edf8",
  fontSize: 14,
},

activitySub: {
  fontSize: 12,
  color: "#8ea0b8",
  marginTop: 4,
},

activityBadge: {
  background: "#132035",
  padding: "6px 10px",
  borderRadius: 999,
  fontSize: 12,
  cursor: "pointer",
  textAlign: "center",
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

attackMapWrap: {
  display: "grid",
  gridTemplateColumns: "1.5fr 0.8fr",
  gap: 18,
  alignItems: "stretch",
},

attackMap: {
  position: "relative",
  minHeight: 330,
  borderRadius: 20,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.08)",
  background:
    "radial-gradient(circle at 20% 45%, rgba(56,189,248,0.10), transparent 10%), radial-gradient(circle at 50% 35%, rgba(239,68,68,0.12), transparent 12%), radial-gradient(circle at 70% 50%, rgba(245,158,11,0.10), transparent 10%), linear-gradient(135deg,#07111f,#111c2e)",
},
hotspot: {
  position: "absolute",
  transform: "translate(-50%, -50%)",
  borderRadius: "999px",
  background: "rgba(239,68,68,0.9)",
  border: "2px solid rgba(255,255,255,0.8)",
  animation: "pulse 2s infinite",
},
mapLabel: {
  position: "absolute",
  left: 18,
  bottom: 18,
  color: "#8ea0b8",
  fontSize: 13,
},

mapLegend: {
  display: "grid",
  gap: 10,
  alignContent: "start",
},

mapLegendRow: {
  display: "grid",
  gridTemplateColumns: "12px 1fr auto",
  gap: 10,
  alignItems: "center",
  padding: 12,
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#dbeafe",
  fontSize: 13,
},

legendDot: {
  width: 9,
  height: 9,
  borderRadius: 999,
  background: "#ef4444",
  boxShadow: "0 0 14px rgba(239,68,68,0.8)",
},

appLayout: {
  display: "flex",
  minHeight: "100vh",
  background: "linear-gradient(135deg,#050814,#0b1220)",
},

pageWithSidebar: {
  marginLeft: 260,
  width: "calc(100% - 260px)",
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

  attackTable: {
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 18,
    overflow: "hidden",
    background: "rgba(2,6,23,0.35)",
    width: "100%",
  },

  attackTableHeader: {
    display: "grid",
    gridTemplateColumns: "0.8fr 1.25fr 1.15fr 1.25fr 0.75fr 1fr",
    gap: 18,
    padding: "16px 20px",
    background: "rgba(15,23,42,0.72)",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#8ea0b8",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },

  attackTableRow: {
    display: "grid",
    gridTemplateColumns: "0.8fr 1.25fr 1.15fr 1.25fr 0.75fr 1fr",
    gap: 18,
    alignItems: "center",
    padding: "22px 20px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },

  attackMain: {
    color: "#e5edf8",
    fontSize: 17,
    fontWeight: 800,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  attackSensor: {
    color: "#38bdf8",
    fontSize: 17,
    fontWeight: 900,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  attackSub: {
    color: "#71839c",
    fontSize: 13,
    marginTop: 8,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  attackFlow: {
    color: "#e5edf8",
    fontSize: 18,
    fontWeight: 900,
    whiteSpace: "nowrap",
  },

  attackArrow: {
    color: "#f97316",
    margin: "0 6px",
  },

  attackActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    whiteSpace: "nowrap",
  },

  attackStatus: {
    padding: "7px 11px",
    borderRadius: 10,
    fontSize: 12,
    fontWeight: 900,
  },

  attackStatusActive: {
    background: "rgba(34,197,94,0.12)",
    color: "#22c55e",
  },

  attackStatusDone: {
    background: "rgba(148,163,184,0.10)",
    color: "#94a3b8",
  },

  attackViewButton: {
    background: "#132035",
    color: "#dbeafe",
    border: "1px solid rgba(255,255,255,0.10)",
    padding: "8px 16px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    cursor: "pointer",
  },

  attackViewButtonActive: {
    background: "rgba(56,189,248,0.16)",
    border: "1px solid rgba(56,189,248,0.35)",
    color: "#67e8f9",
  },

};
