export default function Section({
  title,
  children,
  right,
  subtitle,
  styles,
}) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        <div style={styles.sectionTitleWrap}>
          <h3 style={styles.sectionTitle}>{title}</h3>
          {subtitle ? <div style={styles.sectionSubtext}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}
