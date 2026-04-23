export default function TopList({
  items,
  labelKey,
  valueKey,
  emptyText,
  styles,
  limit = 8,
}) {
  if (!items || items.length === 0) {
    return <div style={styles.emptyCell}>{emptyText}</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {items.slice(0, limit).map((item, idx) => (
        <div
          key={`${item[labelKey]}-${idx}`}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            padding: "12px 14px",
            borderRadius: "16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              ...styles.topLabel,
              maxWidth: "75%",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={item[labelKey] || "-"}
          >
            {item[labelKey] || "-"}
          </span>

          <span
            style={{
              ...styles.badge,
              minWidth: "56px",
              textAlign: "center",
              justifyContent: "center",
              display: "inline-flex",
            }}
          >
            {item[valueKey] ?? 0}
          </span>
        </div>
      ))}
    </div>
  );
}
