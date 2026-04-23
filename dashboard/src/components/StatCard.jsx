export default function StatCard({ title, value, icon: Icon, subtitle, styles }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardGlow} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value ?? 0}</div>
        <div style={styles.cardSubtitle}>{subtitle}</div>
      </div>

      <div style={{ ...styles.iconBox, position: "relative", zIndex: 1 }}>
        <Icon size={22} />
      </div>
    </div>
  );
}
