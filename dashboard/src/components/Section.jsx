export default function Section({ title, children, right, styles }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <h3 style={styles.sectionTitle}>{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}
