import { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function AttackMap({ styles }) {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    let mounted = true;

    async function fetchAllSessions() {
      try {
        let page = 1;
        let all = [];
        let hasNext = true;

        while (hasNext) {
          const res = await fetch(
            `https://api.thechougala.in/api/v1/sessions?page=${page}&page_size=500`
          );

          const json = await res.json();

          all = [...all, ...(json.data || [])];
          hasNext = Boolean(json.meta?.has_next);
          page += 1;
        }

        if (mounted) {
          setSessions(all);
        }
      } catch (err) {
        if (mounted) {
          setSessions([]);
        }
      }
    }

    fetchAllSessions();

    return () => {
      mounted = false;
    };
  }, []);

  const sensorStats = buildSensorStats(sessions);
  const sourcePoints = buildSourcePoints(sessions);

  return (
    <div
      style={{
        ...styles.attackMapWrap,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 500px",
        gap: 20,
        alignItems: "stretch",
      }}
    >
      <div
        style={{
          ...styles.attackMap,
          minHeight: 620,
          maxHeight: 620,
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 55% 45%, rgba(56,189,248,0.06), transparent 42%), #08111f",
          border: "1px solid rgba(148,163,184,0.14)",
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 128, center: [8, 24] }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(148,163,184,0.17)"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth={0.35}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      outline: "none",
                      fill: "rgba(56,189,248,0.12)",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {sourcePoints.slice(0, 8).map((p, i) => (
            <Marker key={`source-${p.country}-${i}`} coordinates={p.coordinates}>
              <g>
                <title>
                  {p.country} — {p.count} attacks ({p.share}%)
                </title>

                <circle
                  r={7 + Math.min(p.share / 8, 7)}
                  fill="rgba(56,189,248,0.16)"
                  stroke="rgba(56,189,248,0.45)"
                  strokeWidth="1"
                />

                <circle
                  r={4 + Math.min(p.share / 12, 5)}
                  fill="rgba(56,189,248,0.95)"
                  stroke="rgba(226,246,255,0.85)"
                  strokeWidth="1"
                />

                <text
                  x="13"
                  y="-3"
                  fill="#e5eef9"
                  fontSize="10"
                  fontWeight="800"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
                >
                  {p.code}
                </text>

                <text
                  x="13"
                  y="10"
                  fill="#38bdf8"
                  fontSize="10"
                  fontWeight="900"
                  style={{ textShadow: "0 2px 8px rgba(0,0,0,0.95)" }}
                >
                  {p.share}%
                </text>
              </g>
            </Marker>
          ))}

          {sensorStats.map((s, i) => (
            <Marker key={`sensor-${s.sensor_id}-${i}`} coordinates={s.coordinates}>
              <g>
                <title>
                  {s.display_name} — {s.total} attacks
                </title>

                <circle
                  r="9"
                  fill={
                    s.is_historical
                      ? "rgba(148,163,184,0.85)"
                      : "rgba(34,197,94,0.95)"
                  }
                  stroke={
                    s.is_historical
                      ? "rgba(226,232,240,0.85)"
                      : "rgba(240,253,244,0.95)"
                  }
                  strokeWidth="1.6"
                />

                <circle r="3.5" fill="#ffffff" />
              </g>
            </Marker>
          ))}
        </ComposableMap>

        <div
          style={{
            position: "absolute",
            left: 24,
            top: 22,
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(8,15,28,0.78)",
            border: "1px solid rgba(148,163,184,0.16)",
            color: "rgba(229,238,249,0.72)",
            fontSize: 12,
          }}
        >
          ● Live sensor telemetry
        </div>

        <div
          style={{
            position: "absolute",
            left: 24,
            bottom: 18,
            color: "rgba(229,238,249,0.45)",
            fontSize: 12,
          }}
        >
          Blue = attacker origin share · Green = live sensors · Grey = pre-sensor data
        </div>
      </div>

      <div
        style={{
          ...styles.mapLegend,
          minHeight: 620,
          maxHeight: 620,
          padding: 22,
          background: "rgba(8,15,28,0.42)",
          border: "1px solid rgba(148,163,184,0.14)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          overflowY: "auto",
        }}
      >
        <div>
          <div
            style={{
              color: "#38bdf8",
              fontSize: 11,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 10,
            }}
          >
            Sensor Intelligence
          </div>

          <div
            style={{
              color: "#e5eef9",
              fontSize: 24,
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            Deployment Attack Coverage
          </div>

          <div
            style={{
              color: "rgba(229,238,249,0.58)",
              fontSize: 13,
              lineHeight: 1.55,
              marginTop: 8,
            }}
          >
            Live sensor coverage first, followed by historical pre-sensor telemetry.
          </div>
        </div>

        {sensorStats.map((sensor) => (
          <SensorCard
            key={sensor.sensor_id}
            sensor={sensor}
            totalSessions={sessions.length}
          />
        ))}

        {!sensorStats.length && (
          <div
            style={{
              padding: 16,
              borderRadius: 16,
              background: "rgba(2,6,23,0.32)",
              border: "1px solid rgba(148,163,184,0.12)",
              color: "rgba(229,238,249,0.58)",
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            No sensor intelligence available yet.
          </div>
        )}
      </div>
    </div>
  );
}

function SensorCard({ sensor, totalSessions }) {
  const sensorShare = totalSessions
    ? Math.round((sensor.total / totalSessions) * 100)
    : 0;

  return (
    <div
      style={{
        background: sensor.is_historical
          ? "rgba(15,23,42,0.38)"
          : "rgba(2,6,23,0.34)",
        border: sensor.is_historical
          ? "1px solid rgba(148,163,184,0.18)"
          : "1px solid rgba(148,163,184,0.12)",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: "#e5eef9",
              fontSize: 20,
              fontWeight: 900,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={sensor.display_name}
          >
            {sensor.display_name}
          </div>

          <div
            style={{
              color: "rgba(229,238,249,0.55)",
              fontSize: 12,
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={`${sensor.sensor_region} · ${sensor.sensor_id} · ${sensor.sensor_provider}`}
          >
            {sensor.sensor_region} · {sensor.sensor_id} ·{" "}
            {sensor.sensor_provider}
          </div>
        </div>

        <div
          style={{
            fontSize: 12,
            color: sensor.is_historical ? "#cbd5e1" : "#22c55e",
            background: sensor.is_historical
              ? "rgba(148,163,184,0.1)"
              : "rgba(34,197,94,0.1)",
            border: sensor.is_historical
              ? "1px solid rgba(148,163,184,0.22)"
              : "1px solid rgba(34,197,94,0.22)",
            padding: "5px 9px",
            borderRadius: 999,
            height: "max-content",
            flexShrink: 0,
          }}
        >
          {sensor.is_historical ? "Historical" : "Live"}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 10,
          margin: "16px 0",
        }}
      >
        <SmallMetric label="Attacks" value={sensor.total} />
        <SmallMetric label="Sensor Share" value={`${sensorShare}%`} />
        <SmallMetric label="Top Origin" value={sensor.top_origin_code} />
        <SmallMetric label="Countries" value={sensor.unique_countries} />
      </div>

      <MiniTable
        title="Top Countries"
        rows={sensor.origins.slice(0, 2)}
        nameKey="country"
      />

      <MiniTable
        title="Top Source IPs"
        rows={sensor.source_ips.slice(0, 2)}
        nameKey="ip"
      />

      <MiniTable
        title="Top ASNs"
        rows={sensor.asns.slice(0, 2)}
        nameKey="asn"
      />

      {sensor.latest && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(148,163,184,0.1)",
            color: "rgba(229,238,249,0.5)",
            fontSize: 12,
            lineHeight: 1.45,
          }}
        >
          Last seen: {sensor.latest.city || "Unknown city"},{" "}
          {sensor.latest.country || "Unknown"} ·{" "}
          {formatTimeAgo(sensor.latest.start_time)}
        </div>
      )}
    </div>
  );
}

function MiniTable({ title, rows, nameKey }) {
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          color: "rgba(229,238,249,0.52)",
          fontSize: 12,
          fontWeight: 800,
          marginBottom: 6,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </div>

      {rows.map((row, i) => (
        <div
          key={`${title}-${row[nameKey]}-${i}`}
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 52px 52px",
            gap: 10,
            padding: "8px 0",
            borderBottom:
              i === rows.length - 1
                ? "none"
                : "1px solid rgba(148,163,184,0.1)",
            fontSize: 13,
            alignItems: "center",
          }}
        >
          <span
            style={{
              color: "#e5eef9",
              fontWeight: 750,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
            title={row[nameKey]}
          >
            {row[nameKey]}
          </span>

          <span style={{ textAlign: "right", color: "rgba(229,238,249,0.7)" }}>
            {row.count}
          </span>

          <span
            style={{
              textAlign: "right",
              color: "#38bdf8",
              fontWeight: 900,
            }}
          >
            {row.share}%
          </span>
        </div>
      ))}
    </div>
  );
}

function SmallMetric({ label, value }) {
  return (
    <div
      style={{
        background: "rgba(8,15,28,0.55)",
        border: "1px solid rgba(148,163,184,0.1)",
        borderRadius: 12,
        padding: 10,
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: "rgba(229,238,249,0.52)",
          fontSize: 11,
          marginBottom: 5,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={label}
      >
        {label}
      </div>

      <div
        style={{
          color: "#e5eef9",
          fontSize: 17,
          fontWeight: 900,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        title={String(value)}
      >
        {value}
      </div>
    </div>
  );
}

function buildSensorStats(sessions = []) {
  const sensors = new Map();

  for (const s of sessions) {
    const sensorId = s.sensor_id || "pre-sensor-data";
    const isHistorical = sensorId === "pre-sensor-data" || sensorId === "pre-sensor";

    if (!sensors.has(sensorId)) {
      sensors.set(sensorId, {
        sensor_id: sensorId,
        sensor_country: s.sensor_country || "Pre-Sensor Data",
        sensor_region: s.sensor_region || "No sensor attribution",
        sensor_provider: s.sensor_provider || "Historical",
        display_name: isHistorical
          ? "Pre-Sensor Data"
          : `${s.sensor_country || "Unknown"} Sensor`,
        is_historical: isHistorical,
        coordinates: isHistorical
          ? [78.9629, 20.5937]
          : getCountryCoordinates(s.sensor_country),
        total: 0,
        originsMap: new Map(),
        ipsMap: new Map(),
        asnMap: new Map(),
        latest: null,
      });
    }

    const sensor = sensors.get(sensorId);
    const originCountry = s.country || "Unknown";
    const originCode =
      s.country_code || originCountry.slice(0, 2).toUpperCase();
    const sourceIp = s.source_ip || "Unknown IP";
    const asn = s.asn || "Unknown ASN";

    sensor.total += 1;

    if (!sensor.originsMap.has(originCountry)) {
      sensor.originsMap.set(originCountry, {
        country: originCountry,
        country_code: originCode,
        count: 0,
      });
    }

    if (!sensor.ipsMap.has(sourceIp)) {
      sensor.ipsMap.set(sourceIp, {
        ip: sourceIp,
        count: 0,
      });
    }

    if (!sensor.asnMap.has(asn)) {
      sensor.asnMap.set(asn, {
        asn,
        count: 0,
      });
    }

    sensor.originsMap.get(originCountry).count += 1;
    sensor.ipsMap.get(sourceIp).count += 1;
    sensor.asnMap.get(asn).count += 1;

    if (
      !sensor.latest ||
      new Date(s.start_time).getTime() >
        new Date(sensor.latest.start_time).getTime()
    ) {
      sensor.latest = s;
    }
  }

  return Array.from(sensors.values())
    .map((sensor) => {
      const origins = withShare(sensor.originsMap, sensor.total);
      const sourceIps = withShare(sensor.ipsMap, sensor.total);
      const asns = withShare(sensor.asnMap, sensor.total);

      return {
        ...sensor,
        origins,
        source_ips: sourceIps,
        asns,
        unique_countries: origins.length,
        top_origin_code: origins[0]?.country_code || "-",
      };
    })
    .sort((a, b) => {
      const order = {
        "vps-india-01": 1,
        "vps-newjersey-01": 2,
        "pre-sensor-data": 3,
        "pre-sensor": 3,
      };

      const aOrder = order[a.sensor_id] || 99;
      const bOrder = order[b.sensor_id] || 99;

      if (aOrder !== bOrder) return aOrder - bOrder;

      return b.total - a.total;
    });
}

function withShare(map, total) {
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      share: total ? Math.round((item.count / total) * 100) : 0,
    }));
}

function buildSourcePoints(sessions = []) {
  const sources = new Map();

  for (const s of sessions) {
    const country = s.country || "Unknown";
    const code = s.country_code || country.slice(0, 2).toUpperCase();

    if (!sources.has(country)) {
      sources.set(country, {
        country,
        code,
        count: 0,
        coordinates:
          Number.isFinite(Number(s.longitude)) &&
          Number.isFinite(Number(s.latitude))
            ? [Number(s.longitude), Number(s.latitude)]
            : getCountryCoordinates(country),
      });
    }

    sources.get(country).count += 1;
  }

  const total = sessions.length || 1;

  return Array.from(sources.values())
    .map((s) => ({
      ...s,
      share: Math.round((s.count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
}

function formatTimeAgo(value) {
  if (!value) return "unknown time";

  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "unknown time";

  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getCountryCoordinates(country = "") {
  const map = {
    China: [104.1954, 35.8617],
    Germany: [10.4515, 51.1657],
    India: [78.9629, 20.5937],
    Netherlands: [5.2913, 52.1326],
    "The Netherlands": [5.2913, 52.1326],
    Russia: [105.3188, 61.524],
    "United States": [-95.7129, 37.0902],
    Singapore: [103.8198, 1.3521],
    Japan: [138.2529, 36.2048],
    France: [2.2137, 46.2276],
    Brazil: [-51.9253, -14.235],
    Vietnam: [108.2772, 14.0583],
    Indonesia: [113.9213, -0.7893],
    Thailand: [100.9925, 15.87],
    "United Kingdom": [-3.436, 55.3781],
    Canada: [-106.3468, 56.1304],
    Turkey: [35.2433, 38.9637],
    Iran: [53.688, 32.4279],
  };

  return map[country] || [78.9629, 20.5937];
}
