import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Zap, Users, Upload, CheckCircle
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  deep: "#0F2854",
  navy: "#1C4D8D",
  blue: "#4988C4",
  sky: "#BDE8F5",
  white: "#FFFFFF",
  gray50: "#F8FAFC",
  gray100: "#F1F5F9",
  gray200: "#E2E8F0",
  gray600: "#475569",
  gray900: "#0F172A",
};

// ─── SCROLL-REVEAL HOOK ───────────────────────────────────────────────────────
function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px", ...options });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

// ─── REVEAL WRAPPER ──────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, visible] = useScrollReveal();
  const translate = direction === "up" ? "translateY(32px)"
    : direction === "left" ? "translateX(-32px)"
      : direction === "right" ? "translateX(32px)"
        : "translateY(-32px)";
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : translate,
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, delay = 0 }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Reveal delay={delay}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered ? `linear-gradient(135deg, ${C.navy} 0%, ${C.deep} 100%)` : C.white,
          border: `1px solid ${hovered ? "transparent" : C.gray200}`,
          borderRadius: 16, padding: "24px", cursor: "default",
          transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
          boxShadow: hovered ? `0 12px 32px rgba(15,40,84,0.25)` : "0 1px 4px rgba(15,40,84,0.06)",
          transform: hovered ? "translateY(-4px)" : "none",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: hovered ? C.sky : C.gray600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{title}</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: hovered ? C.white : C.gray900, lineHeight: 1 }}>{value}</p>
            {trend && <p style={{ fontSize: 12, fontWeight: 600, color: hovered ? "#6EE7B7" : "#16A34A", marginTop: 8 }}>{trend}</p>}
          </div>
          <div style={{ padding: 12, borderRadius: 12, background: hovered ? "rgba(189,232,245,0.15)" : C.sky, transition: "background 0.35s" }}>
            <Icon size={22} color={hovered ? C.sky : C.navy} />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

// ─── OVERVIEW PANEL ───────────────────────────────────────────────────────────
function OverviewPanel() {
  const cards = [
    { title: "Active Trials", value: "12", icon: TrendingUp, trend: "+3 this month" },
    { title: "Pending Applications", value: "48", icon: Users, trend: "+15 this week" },
    { title: "AI Matches Found", value: "342", icon: Zap, trend: "+56 today" },
    { title: "Enrolled Patients", value: "89", icon: CheckCircle, trend: "+12 new" },
  ];
  const activity = [
    { title: "New application received", description: "Patient applied for TRIAL-2024-001 with 92% AI match score", timestamp: "2 hours ago", icon: Upload },
    { title: "Trial status updated", description: "Clinical Trial TRIAL-2024-001 moved to RECRUITING stage", timestamp: "5 hours ago", icon: CheckCircle },
    { title: "AI matching completed", description: "Batch eligibility validation done for 38 candidates", timestamp: "1 day ago", icon: TrendingUp },
    { title: "Doctor referral received", description: "Dr. Smith referred a patient for TRIAL-ONC-005", timestamp: "2 days ago", icon: Users },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Research Overview</h1></Reveal>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 18 }}>
        {cards.map((c, i) => <StatCard key={c.title} {...c} delay={i * 80} />)}
      </div>

      <div>
        <Reveal delay={80}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 16 }}>Recent Activity</h2></Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {activity.map((a, i) => {
            const Icon = a.icon;
            return (
              <Reveal key={a.title} delay={i * 70} direction="left">
                <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14, transition: "box-shadow 0.2s, border-color 0.2s", cursor: "default" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 20px rgba(73,136,196,0.12)`; e.currentTarget.style.borderColor = C.sky; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = C.gray200; }}>
                  <div style={{ padding: 10, background: C.sky, borderRadius: 10 }}>
                    <Icon size={18} color={C.navy} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: 14, color: C.gray900 }}>{a.title}</p>
                    <p style={{ fontSize: 13, color: C.gray600, marginTop: 2 }}>{a.description}</p>
                    <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>{a.timestamp}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default OverviewPanel;
