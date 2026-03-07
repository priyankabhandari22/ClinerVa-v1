import { useState, useEffect, useRef } from "react";
import {
  Download, Share2, FileText, BarChart3, CheckCircle, Eye
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────────────────────────────
const C = {
  deep:   "#0F2854",
  navy:   "#1C4D8D",
  blue:   "#4988C4",
  sky:    "#BDE8F5",
  white:  "#FFFFFF",
  gray50: "#F8FAFC",
  gray100:"#F1F5F9",
  gray200:"#E2E8F0",
  gray600:"#475569",
  gray900:"#0F172A",
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

// ─── REPORTS PANEL ────────────────────────────────────────────────────────────
function ReportsPanel() {
  const [selected, setSelected] = useState(null);
  const reports = [
    {
      id: 1,
      title: "TRIAL-2024-001: Phase 2 Analysis",
      date: "2024-03-01",
      status: "complete",
      findings: 4,
      charts: 8,
      pages: 24,
      summary: "Comprehensive analysis of Phase 2 clinical trial showing 92% efficacy rate with minimal adverse effects.",
    },
    {
      id: 2,
      title: "Comparative Treatment Study",
      date: "2024-02-25",
      status: "complete",
      findings: 6,
      charts: 12,
      pages: 32,
      summary: "Comparative analysis between Treatment A and Treatment B across 500+ patients. Treatment A shows 18% better outcomes.",
    },
    {
      id: 3,
      title: "Safety Profile Summary",
      date: "2024-02-15",
      status: "complete",
      findings: 3,
      charts: 5,
      pages: 16,
      summary: "Comprehensive safety assessment including adverse event analysis, drug interactions, and population-specific risks.",
    },
  ];
  const findings = [
    "Treatment demonstrates 92% efficacy in primary endpoint",
    "Adverse events are mild to moderate with no serious safety concerns",
    "Age group 40-60 shows optimal response rates",
    "Gender does not significantly impact treatment response",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Trial Reports</h1></Reveal>

      {/* Reports List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {reports.map((report, i) => (
          <Reveal key={report.id} delay={i * 60}>
            <div onClick={() => setSelected(report)}
              style={{
                background: selected?.id === report.id ? C.sky : C.white,
                border: `2px solid ${selected?.id === report.id ? C.blue : C.gray200}`,
                borderRadius: 16,
                padding: 24,
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              onMouseEnter={e => {
                if (selected?.id !== report.id) {
                  e.currentTarget.style.borderColor = C.blue;
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,40,84,0.1)";
                }
              }}
              onMouseLeave={e => {
                if (selected?.id !== report.id) {
                  e.currentTarget.style.borderColor = C.gray200;
                  e.currentTarget.style.boxShadow = "none";
                }
              }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <BarChart3 size={20} color={C.blue} />
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: C.deep }}>{report.title}</h3>
                  </div>
                  <p style={{ fontSize: 14, color: C.gray600, marginBottom: 16, lineHeight: 1.5 }}>{report.summary}</p>
                  <div style={{ display: "flex", gap: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.deep }}>{report.findings}</span>
                      <span style={{ fontSize: 13, color: C.gray600 }}>Key Findings</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.deep }}>{report.charts}</span>
                      <span style={{ fontSize: 13, color: C.gray600 }}>Charts</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: C.deep }}>{report.pages}</span>
                      <span style={{ fontSize: 13, color: C.gray600 }}>Pages</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, marginLeft: 16 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 99, background: "#DCFCE7", color: "#16A34A", fontSize: 12, fontWeight: 700 }}>
                    <CheckCircle size={14} />
                    Complete
                  </span>
                  <p style={{ fontSize: 12, color: C.gray600 }}>{new Date(report.date).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Report Details */}
      {selected && (
        <Reveal delay={80}>
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 800, color: C.deep, marginBottom: 4 }}>{selected.title}</h3>
                <p style={{ fontSize: 14, color: C.gray600 }}>Generated on {new Date(selected.date).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, background: C.blue, color: "#fff", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.navy}
                  onMouseLeave={e => e.currentTarget.style.background = C.blue}>
                  <Download size={16} />
                  Export PDF
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, border: `2px solid ${C.blue}`, background: "transparent", color: C.blue, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.sky}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Download size={16} />
                  Download CSV
                </button>
                <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, border: `2px solid ${C.gray200}`, background: "transparent", color: C.gray600, cursor: "pointer", transition: "all 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 24 }}>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 32 }}>
                {[
                  { label: "Key Findings", value: selected.findings },
                  { label: "Charts & Graphs", value: selected.charts },
                  { label: "Report Pages", value: selected.pages },
                  { label: "Status", value: "Complete", icon: CheckCircle, color: "#10B981" },
                ].map(stat => (
                  <div key={stat.label} style={{ background: C.gray50, borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 12, color: C.gray600, fontWeight: 600, marginBottom: 4 }}>{stat.label}</p>
                    {stat.icon ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <stat.icon size={20} color={stat.color} />
                        <span style={{ fontSize: 16, fontWeight: 700, color: C.deep }}>{stat.value}</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: 28, fontWeight: 800, color: C.deep }}>{stat.value}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 12 }}>Executive Summary</h4>
                <p style={{ fontSize: 14, color: C.gray600, lineHeight: 1.6 }}>{selected.summary}</p>
              </div>

              {/* Findings */}
              <div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 16 }}>Key Findings</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {findings.map((finding, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, background: C.sky, border: `1px solid ${C.blue}`, borderRadius: 12 }}>
                      <CheckCircle size={20} color={C.blue} style={{ flexShrink: 0, marginTop: 2 }} />
                      <p style={{ fontSize: 14, color: C.deep, lineHeight: 1.5 }}>{finding}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {/* Placeholder */}
      {!selected && (
        <Reveal delay={100}>
          <div style={{ background: C.gray50, border: `2px dashed ${C.gray200}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
            <FileText size={48} color={C.gray600} style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 18, fontWeight: 600, color: C.gray600, marginBottom: 4 }}>Select a report to view details</p>
            <p style={{ fontSize: 14, color: C.gray600 }}>Click on any report above to view findings, charts, and export options</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}

export default ReportsPanel;
