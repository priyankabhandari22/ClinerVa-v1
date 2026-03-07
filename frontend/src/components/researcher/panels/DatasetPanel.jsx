import { useState, useEffect, useRef } from "react";
import {
  Upload, FileText, AlertCircle, CheckCircle2
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

// ─── DATASET PANEL ────────────────────────────────────────────────────────────
function DatasetPanel() {
  const datasets = [
    { id: 1, name: "Patient_Demographics_2024.csv", size: "2.5 MB", uploadDate: "2024-03-01", rows: "12,450", status: "clean" },
    { id: 2, name: "Treatment_Records_Q1.csv", size: "4.8 MB", uploadDate: "2024-02-28", rows: "8,920", status: "warning" },
    { id: 3, name: "Lab_Results_2024.csv", size: "1.2 MB", uploadDate: "2024-02-20", rows: "5,340", status: "clean" },
  ];
  const stats = [
    { title: "Missing Values", value: "142", color: "#F59E0B", icon: AlertCircle },
    { title: "Duplicate Rows", value: "8",   color: "#EF4444", icon: AlertCircle },
    { title: "Data Completeness", value: "98.2%", color: C.blue, icon: CheckCircle2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Dataset Management</h1></Reveal>

      {/* Upload */}
      <Reveal delay={60}>
        <div style={{ background: C.white, border: `2px dashed ${C.sky}`, borderRadius: 16, padding: "28px", display: "flex", gap: 14 }}>
          {[{ icon: <Upload size={16} />, label: "Upload Dataset", primary: true }, { icon: <FileText size={16} />, label: "Import CSV", primary: false }].map(btn => (
            <button key={btn.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, border: btn.primary ? "none" : `2px solid ${C.blue}`, background: btn.primary ? C.blue : "transparent", color: btn.primary ? "#fff" : C.blue, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.primary ? C.navy : C.sky; }}
              onMouseLeave={e => { e.currentTarget.style.background = btn.primary ? C.blue : "transparent"; }}>
              {btn.icon}{btn.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Stats */}
      <div>
        <Reveal delay={80}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>Data Cleaning Status</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.title} delay={i * 80}>
                <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 14, padding: 22, transition: "box-shadow 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,40,84,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 12, color: C.gray600, fontWeight: 600, marginBottom: 6 }}>{s.title}</p>
                      <p style={{ fontSize: 30, fontWeight: 800, color: s.color }}>{s.value}</p>
                    </div>
                    <div style={{ padding: 10, background: C.gray50, borderRadius: 10 }}><Icon size={20} color={s.color} /></div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <Reveal delay={100}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>Datasets</h2>
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                  {["Dataset Name", "Size", "Rows", "Upload Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.deep, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datasets.map((d, idx) => (
                  <tr key={d.id} style={{ borderBottom: idx < datasets.length - 1 ? `1px solid ${C.gray200}` : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: C.gray900 }}>{d.name}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.size}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.rows}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.uploadDate}</td>
                    <td style={{ padding: "14px 18px" }}>
                      {d.status === "clean"
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "#DCFCE7", color: "#16A34A", fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={12} />Clean</span>
                        : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "#FEF9C3", color: "#CA8A04", fontSize: 12, fontWeight: 700 }}><AlertCircle size={12} />Review</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

export default DatasetPanel;
