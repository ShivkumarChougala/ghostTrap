export default function AttackMap({ intel, styles }) {
  const countries = intel?.top_countries || [];

  const hotspots = countries.slice(0, 5).map((c, i) => ({
    ...c,
    ...getHotspotPosition(c.country, i),
  }));

  return (
    <div style={styles.attackMapWrap}>
      <div style={styles.attackMap}>
        {hotspots.map((h, i) => (
          <div
            key={`${h.country}-${i}`}
            style={{
              ...styles.hotspot,
              left: h.left,
              top: h.top,
              width: 14 + Math.min((h.count || 1) * 5, 22),
              height: 14 + Math.min((h.count || 1) * 5, 22),
            }}
            title={`${h.country}: ${h.count}`}
          />
        ))}

        <div style={styles.mapLabel}>Observed attacker geo distribution</div>
      </div>

      <div style={styles.mapLegend}>
        {countries.slice(0, 5).map((c, i) => (
          <div key={i} style={styles.mapLegendRow}>
            <span style={styles.legendDot} />
            <span>{c.country || "Unknown"}</span>
            <b>{c.count}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

function getHotspotPosition(country = "", index) {
  const map = {
    China: { left: "72%", top: "42%" },
    Germany: { left: "49%", top: "33%" },
    India: { left: "64%", top: "52%" },
    Netherlands: { left: "47%", top: "31%" },
    Russia: { left: "61%", top: "25%" },
    "The Netherlands": { left: "47%", top: "31%" },
    "United States": { left: "22%", top: "42%" },
    Singapore: { left: "69%", top: "64%" },
    Japan: { left: "80%", top: "45%" },
  };

  return map[country] || fallback[index % fallback.length];
}

const fallback = [
  { left: "22%", top: "42%" },
  { left: "49%", top: "33%" },
  { left: "64%", top: "52%" },
  { left: "72%", top: "42%" },
  { left: "80%", top: "45%" },
];
