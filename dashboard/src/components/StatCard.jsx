export default function StatCard({ title, value, icon: Icon, subtitle, styles }) {
  return (
    <div style={styles.card}>
      <div>
        <div style={styles.cardTitle}>{title}</div>
        <div style={styles.cardValue}>{value ?? 0}</div>
        <div style={styles.cardSubtitle}>{subtitle}</div>
      </div>

      <div style={styles.iconBox}>
        <Icon size={24} />
      </div>
    </div>
  );
}
