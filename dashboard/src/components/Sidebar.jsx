import { useEffect, useState } from "react";

export default function Sidebar() {
  const items = [
    { label: "Overview", id: "overview" },
    { label: "Commands", id: "commands" },
    { label: "Credentials", id: "credentials" },
    { label: "Source IPs", id: "source-ips" },
    { label: "Attack Map", id: "attack-map" },
    { label: "IP Intelligence", id: "ip-intel" },
    { label: "Alerts", id: "alerts" },
    { label: "Sessions", id: "sessions" },
  ];

  const [active, setActive] = useState("overview");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setActive(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.25, 0.5, 0.75],
        rootMargin: "-15% 0px -65% 0px",
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    setActive(id);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        Ghost<span style={{ color: "#ef4444" }}>Trap</span>
      </div>

      <div style={styles.sub}>Threat Intelligence Platform</div>

      <nav>
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            style={{
              ...styles.navItem,
              ...(active === item.id ? styles.active : {}),
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 260,
    minHeight: "100vh",
    position: "fixed",
    left: 0,
    top: 0,
    background: "#070b12",
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 22,
    zIndex: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: 900,
    marginBottom: 6,
    color: "#e5edf8",
  },
  sub: {
    color: "#8ea0b8",
    fontSize: 13,
    marginBottom: 28,
  },
  navItem: {
    width: "100%",
    display: "block",
    textAlign: "left",
    color: "#b8c7dc",
    background: "transparent",
    border: "none",
    padding: "12px 14px",
    borderRadius: 12,
    margin: "6px 0",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.18s ease",
  },
  active: {
    background: "#132035",
    color: "#ffffff",
    boxShadow: "inset 3px 0 0 #ef4444",
  },
};
