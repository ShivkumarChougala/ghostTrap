import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const TARGET = [78.9629, 20.5937];

export default function AttackMap({ intel, styles }) {
  const countries = intel?.top_countries || [];

  const hotspots = countries.slice(0, 6).map((c, i) => ({
    ...c,
    coordinates: getCountryCoordinates(c.country, i),
  }));

  const maxCount = Math.max(...countries.map((c) => Number(c.count || 0)), 1);

  return (
    <div
      style={{
        ...styles.attackMapWrap,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 360px",
        gap: "22px",
        alignItems: "stretch",
      }}
    >
      <style>
        {`
          @keyframes routeFlow {
            0% { stroke-dashoffset: 120; opacity: 0.2; }
            45% { opacity: 0.75; }
            100% { stroke-dashoffset: 0; opacity: 0.28; }
          }

          @keyframes sourceGlow {
            0%, 100% { opacity: 0.45; }
            50% { opacity: 1; }
          }

          @keyframes targetPulse {
            0% { r: 8; opacity: 0.6; }
            75% { r: 28; opacity: 0; }
            100% { r: 28; opacity: 0; }
          }

          .gt-route-line {
            stroke-dasharray: 10 12;
            animation: routeFlow 4s linear infinite;
          }

          .gt-source-glow {
            animation: sourceGlow 2.4s ease-in-out infinite;
          }

          .gt-target-pulse {
            animation: targetPulse 2.5s ease-out infinite;
          }
        `}
      </style>

      <div
        style={{
          ...styles.attackMap,
          minHeight: 520,
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 55% 45%, rgba(61,217,255,0.10), transparent 58%), rgba(8,15,28,0.84)",
        }}
      >
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 125,
            center: [8, 25],
          }}
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="rgba(148,163,184,0.22)"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth={0.35}
                  style={{
                    default: { outline: "none" },
                    hover: {
                      outline: "none",
                      fill: "rgba(61,217,255,0.18)",
                    },
                    pressed: { outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>

          {hotspots.map((h, i) => (
            <Line
              key={`route-${h.country}-${i}`}
              from={h.coordinates}
              to={TARGET}
              stroke="rgba(61,217,255,0.72)"
              strokeWidth={1.1 + Math.min(Number(h.count || 1) * 0.12, 2)}
              strokeLinecap="round"
              className="gt-route-line"
              style={{
                animationDelay: `${i * 0.35}s`,
                filter: "drop-shadow(0 0 5px rgba(61,217,255,0.42))",
              }}
            />
          ))}

          {hotspots.map((h, i) => (
            <Marker key={`source-${h.country}-${i}`} coordinates={h.coordinates}>
              <g>
                <title>
                  {h.country || "Unknown"} — {h.count} attacks
                </title>

                <circle
                  className="gt-source-glow"
                  r="5"
                  fill="rgba(61,217,255,0.9)"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="1"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />

                <circle
                  r="11"
                  fill="rgba(61,217,255,0.12)"
                />
              </g>
            </Marker>
          ))}

          <Marker coordinates={TARGET}>
            <g>
              <title>GhostTrap honeypot target</title>

              <circle
                className="gt-target-pulse"
                r="8"
                fill="none"
                stroke="rgba(34,197,94,0.85)"
                strokeWidth="2"
              />

              <circle
                r="8"
                fill="rgba(34,197,94,0.95)"
                stroke="rgba(255,255,255,0.9)"
                strokeWidth="1.5"
              />

              <circle r="3" fill="#ffffff" />

              <text
                x="14"
                y="4"
                fill="#e5eef9"
                fontSize="11"
                fontWeight="700"
                style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                }}
              >
                GhostTrap
              </text>
            </g>
          </Marker>
        </ComposableMap>

        <div
          style={{
            position: "absolute",
            left: 28,
            top: 24,
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(8,15,28,0.74)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(229,238,249,0.78)",
            fontSize: 13,
            backdropFilter: "blur(10px)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "#22c55e",
              boxShadow: "0 0 14px rgba(34,197,94,0.75)",
            }}
          />
          Live attack routing
        </div>

        <div style={styles.mapLabel}>
          Attack paths from enriched source countries
        </div>
      </div>

      <div
        style={{
          ...styles.mapLegend,
          height: "100%",
          alignSelf: "stretch",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          padding: "18px",
        }}
      >
        <div
          style={{
            color: "#e5eef9",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          Top Attack Sources
        </div>

        {countries.slice(0, 6).map((c, i) => {
          const count = Number(c.count || 0);
          const width = Math.max((count / maxCount) * 100, 8);

          return (
            <div
              key={i}
              style={{
                padding: "14px",
                borderRadius: 16,
                background: "rgba(8,15,28,0.42)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    color: "#e5eef9",
                    fontWeight: 650,
                    lineHeight: 1.2,
                  }}
                >
                  {c.country || "Unknown"}
                </span>

                <b style={{ color: "#3dd9ff" }}>{count}</b>
              </div>

              <div
                style={{
                  height: 7,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${width}%`,
                    height: "100%",
                    borderRadius: 999,
                    background:
                      "linear-gradient(90deg, rgba(61,217,255,0.35), rgba(61,217,255,0.95))",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getCountryCoordinates(country = "", index) {
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

  return map[country] || fallback[index % fallback.length];
}

const fallback = [
  [-95.7129, 37.0902],
  [10.4515, 51.1657],
  [78.9629, 20.5937],
  [104.1954, 35.8617],
  [138.2529, 36.2048],
  [103.8198, 1.3521],
];
