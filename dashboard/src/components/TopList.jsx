export default function TopList({
  items,
  labelKey,
  valueKey,
  emptyText,
  styles,
}) {
  if (!items || items.length === 0) {
    return <p style={styles.muted}>{emptyText}</p>;
  }

  return (
    <div>
      {items.map((item, idx) => (
        <div key={`${item[labelKey]}-${idx}`} style={styles.topRow}>
          <span style={styles.topLabel}>{item[labelKey] || "-"}</span>
          <span style={styles.badge}>{item[valueKey] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
