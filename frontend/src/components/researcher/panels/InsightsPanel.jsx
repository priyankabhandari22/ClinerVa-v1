import { useState, useEffect, useRef } from "react";
import {
  Lightbulb, Heart, Zap, TrendingUp, AlertCircle, Filter
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

// ─── INSIGHTS PANEL ───────────────────────────────────────────────────────────
function InsightsPanel() {
  const [filter, setFilter] = useState("all");
  const insights = [
    {
      id: 1,
      title: "High-Match Patient Segment",
      desc: "Patients aged 40–60 showed an 88% eligibility match with active oncology trials. This age group demonstrates higher protocol adherence and 22% lower withdrawal rates.",
      time: "2 hours ago",
      icon: Lightbulb,
      color: C.blue,
      bg: C.sky,
      type: "positive",
    },
    {
      id: 2,
      title: "Eligibility Criteria Adjustment",
      desc: "Relaxing BMI threshold by 2 points could increase the eligible candidate pool by 40% with minimal safety risk. Recommend a criteria review with the trial coordinator.",
      time: "6 hours ago",
      icon: Zap,
      color: C.navy,
      bg: C.sky,
      type: "recommendation",
    },
    {
      id: 3,
      title: "High Withdrawal Risk Detected",
      desc: "Candidates with comorbid hypertension showed 25% higher trial withdrawal. Recommend additional pre-screening and adjusted consent protocols for this population.",
      time: "1 day ago",
      icon: Heart,
      color: "#EF4444",
      bg: "#FEF2F2",
      type: "warning",
    },
    {
      id: 4,
      title: "Optimal Trial Duration",
      desc: "Trials with 28–35 day durations show 92% patient retention vs 77% for shorter trials. Recommend adjusting TRIAL-2024-005 timeline accordingly.",
      time: "2 days ago",
      icon: TrendingUp,
      color: C.blue,
      bg: C.sky,
      type: "positive",
    },
    {
      id: 5,
      title: "Seasonal Enrollment Variation",
      desc: "Enrollment rates are 18% higher during spring/summer. Consider timing new trial launches for Q2 to maximize early candidate pipeline.",
      time: "3 days ago",
      icon: AlertCircle,
      color: "#F59E0B",
      bg: "#FFFBEB",
      type: "observation",
    },
  ];
  const filtered = filter === "all" ? insights : insights.filter(i => i.type === filter);

  const getTypeColor = (type) => {
    switch (type) {
      case "positive": return "#10B981";
      case "warning": return "#EF4444";
      case "recommendation": return C.blue;
      case "observation": return "#F59E0B";
      default: return C.gray600;
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px", marginBottom: 8 }}>AI-Generated Insights</h1>
          <p style={{ fontSize: 14, color: C.gray600 }}>Discover actionable patterns and correlations from your clinical data</p>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={60}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[
            { key: "all", label: "All Insights" },
            { key: "recommendation", label: "Recommendations" },
            { key: "warning", label: "Warnings" },
            { key: "positive", label: "Positive" },
          ].map(btn => (
            <button key={btn.key} onClick={() => setFilter(btn.key)}
              style={{
                padding: "8px 16px",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                border: `2px solid ${filter === btn.key ? C.blue : C.gray200}`,
                background: filter === btn.key ? C.blue : C.white,
                color: filter === btn.key ? "#fff" : C.gray600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                if (filter !== btn.key) {
                  e.currentTarget.style.background = C.gray50;
                  e.currentTarget.style.borderColor = C.blue;
                }
              }}
              onMouseLeave={e => {
                if (filter !== btn.key) {
                  e.currentTarget.style.background = C.white;
                  e.currentTarget.style.borderColor = C.gray200;
                }
              }}>
              {btn.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Insights */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {filtered.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <Reveal key={insight.id} delay={i * 60}>
              <div style={{
                background: C.white,
                border: `1px solid ${C.gray200}`,
                borderRadius: 16,
                padding: 24,
                transition: "box-shadow 0.2s, transform 0.2s",
                cursor: "pointer",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(15,40,84,0.15)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "none";
                }}>
                <div style={{ display: "flex", gap: 16 }}>
                  <div style={{ flexShrink: 0, padding: 12, background: insight.bg, borderRadius: 12 }}>
                    <Icon size={24} color={insight.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 8 }}>{insight.title}</h3>
                    <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.5, marginBottom: 12 }}>{insight.desc}</p>
                    <p style={{ fontSize: 12, color: C.gray600, fontWeight: 500 }}>{insight.time}</p>
                  </div>
                  <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
                    <button style={{
                      padding: "8px 16px",
                      borderRadius: 10,
                      fontSize: 13,
                      fontWeight: 600,
                      background: insight.color,
                      color: "#fff",
                      border: "none",
                      cursor: "pointer",
                      transition: "filter 0.2s",
                    }}
                      onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.9)"}
                      onMouseLeave={e => e.currentTarget.style.filter = "brightness(1)"}>
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export default InsightsPanel;
