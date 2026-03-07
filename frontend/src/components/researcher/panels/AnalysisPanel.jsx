import { useState, useEffect, useRef } from "react";
import {
  BarChart3, LineChart, AlertCircle, TrendingUp, TrendingDown
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

// ─── ANALYSIS PANEL ───────────────────────────────────────────────────────────
function AnalysisPanel() {
  const metrics = [
    { title: "AI Matching Accuracy", value: "94.2%", trend: "+2.1%", icon: BarChart3, color: C.blue },
    { title: "Eligibility Precision", value: "92.8%", trend: "+1.5%", icon: TrendingUp, color: "#10B981" },
    { title: "Enrollment Rate", value: "68.6%", trend: "+5.8%", icon: TrendingDown, color: "#F59E0B" },
  ];
  const trendData = [
    { month: "Jan", value: 65, prediction: 68 },
    { month: "Feb", value: 72, prediction: 75 },
    { month: "Mar", value: 78, prediction: 82 },
    { month: "Apr", value: 85, prediction: 88 },
    { month: "May", value: 88, prediction: 91 },
    { month: "Jun", value: 92, prediction: 94 },
  ];
  const correlations = [
    { var1: "AI Score", var2: "Enrollment Rate", corr: 0.78 },
    { var1: "Doctor Referral", var2: "Approval Rate", corr: 0.65 },
    { var1: "Distance", var2: "Withdrawal Rate", corr: -0.82 },
    { var1: "Prior Conditions", var2: "Eligibility", corr: -0.45 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>AI Match Analysis</h1></Reveal>

      {/* Metrics */}
      <div>
        <Reveal delay={60}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>AI Model Performance Metrics</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {metrics.map((m, i) => {
            const Icon = m.icon;
            return (
              <Reveal key={m.title} delay={i * 80}>
                <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 22, transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,40,84,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 12, color: C.gray600, fontWeight: 600, marginBottom: 6 }}>{m.title}</p>
                      <p style={{ fontSize: 30, fontWeight: 800, color: C.deep }}>{m.value}</p>
                      <p style={{ fontSize: 12, fontWeight: 700, color: m.color, marginTop: 4 }}>{m.trend}</p>
                    </div>
                    <div style={{ padding: 10, background: C.gray50, borderRadius: 10 }}><Icon size={20} color={m.color} /></div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Trend Chart */}
      <Reveal delay={80}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <LineChart size={24} color={C.blue} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.deep }}>Patient Matching Trend</h3>
          </div>
          <div style={{ height: 320, display: "flex", alignItems: "end", justifyContent: "space-around", gap: 8, background: C.gray50, borderRadius: 12, padding: "32px 16px" }}>
            {trendData.map((d, i) => (
              <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "end", gap: 2, height: 256 }}>
                  <div style={{ width: 20, background: C.blue, borderRadius: "4px 4px 0 0", height: `${d.value * 2.5}px`, transition: "all 0.3s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.navy}
                    onMouseLeave={e => e.currentTarget.style.background = C.blue}
                    title={`Actual: ${d.value}%`}></div>
                  <div style={{ width: 20, background: C.sky, borderRadius: "4px 4px 0 0", height: `${d.prediction * 2.5}px`, transition: "all 0.3s", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.blue}
                    onMouseLeave={e => e.currentTarget.style.background = C.sky}
                    title={`Predicted: ${d.prediction}%`}></div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: C.gray600 }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, background: C.blue, borderRadius: 2 }}></div>
              <span style={{ fontSize: 13, color: C.gray600 }}>Actual Values</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 16, height: 16, background: C.sky, borderRadius: 2 }}></div>
              <span style={{ fontSize: 13, color: C.gray600 }}>Predictions</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* Correlations */}
      <Reveal delay={100}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <BarChart3 size={24} color={C.blue} />
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.deep }}>Correlation Analysis</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {correlations.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: C.gray50, borderRadius: 12, transition: "background 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray100}
                onMouseLeave={e => e.currentTarget.style.background = C.gray50}>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.gray900 }}>{c.var1} × {c.var2}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 192, height: 8, background: C.gray200, borderRadius: 99, overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: c.corr > 0 ? "#10B981" : "#F59E0B", width: `${Math.abs(c.corr) * 100}%`, transition: "width 0.3s" }}></div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.gray900, width: 48, textAlign: "right" }}>{c.corr > 0 ? "+" : ""}{c.corr.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Insights */}
      <Reveal delay={120}>
        <div style={{ background: C.sky, border: `1px solid ${C.blue}`, borderRadius: 16, padding: 24, display: "flex", gap: 16 }}>
          <AlertCircle size={20} color={C.navy} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Analysis Insights</h4>
            <p style={{ fontSize: 14, color: C.deep, lineHeight: 1.5 }}>
              The negative correlation (-0.82) between Distance and Withdrawal Rate suggests that patients traveling further are more likely to withdraw. Consider investigating travel compensation for trial applications.
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default AnalysisPanel;
