export default function IPIntelSummary({ intel, styles }) {
  if (!intel) {
    return <p style={styles.muted}>No IP intelligence data yet.</p>;
  }

  const countries = intel.top_countries || [];
  const asns = intel.top_asns || [];

  const maxCountry = Math.max(...countries.map((c) => c.count || 0), 1);
  const maxAsn = Math.max(...asns.map((a) => a.count || 0), 1);

  return (
    <div style={styles.ipIntelGrid}>
      <div>
        <h3 style={styles.smallTitle}>Coverage</h3>

        <div style={styles.coverageBox}>
          <div>
            <div style={styles.bigNumber}>{intel.coverage_percent || 0}%</div>
            <div style={styles.muted}>Enrichment coverage</div>
          </div>

          <div style={styles.coverageStats}>
            <div>Total IPs: <b>{intel.unique_ips || 0}</b></div>
            <div>Enriched: <b>{intel.enriched_ips || 0}</b></div>
            <div>Pending: <b>{intel.pending_ips || 0}</b></div>
          </div>
        </div>
      </div>

      <div>
        <h3 style={styles.smallTitle}>Top Countries</h3>

        {countries.slice(0, 5).map((c, i) => (
          <div key={i} style={styles.intelBlock}>
            <div style={styles.intelRow}>
              <span style={styles.intelText}>{c.country || "Unknown"}</span>
              <b>{c.count}</b>
            </div>

            <div style={styles.intelBar}>
              <div
                style={{
                  ...styles.intelFill,
                  width: `${Math.max(((c.count || 0) / maxCountry) * 100, 8)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 style={styles.smallTitle}>Top ASNs</h3>

        {asns.slice(0, 5).map((a, i) => (
          <div key={i} style={styles.intelBlock}>
            <div style={styles.intelRow}>
              <span style={styles.intelText}>{a.asn || "Unknown"}</span>
              <b>{a.count}</b>
            </div>

            <div style={styles.intelBar}>
              <div
                style={{
                  ...styles.intelFillAlt,
                  width: `${Math.max(((a.count || 0) / maxAsn) * 100, 8)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
