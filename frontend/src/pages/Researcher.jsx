import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Database, Zap, Users, Upload, CheckCircle, Clock,
  Bell, ChevronDown, User, LogOut, Plus, BarChart3, LineChart,
  AlertCircle, Lightbulb, Heart, Download, Share2, FileText,
  CheckCircle2, Activity, FlaskConical, Menu, X
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

// ─── PANEL TRANSITION WRAPPER ─────────────────────────────────────────────────
function PanelTransition({ children, panelKey }) {
  const [displayed, setDisplayed] = useState(children);
  const [animKey, setAnimKey] = useState(panelKey);
  const [entering, setEntering] = useState(false);

  useEffect(() => {
    setEntering(true);
    const t1 = setTimeout(() => {
      setDisplayed(children);
      setAnimKey(panelKey);
    }, 160);
    const t2 = setTimeout(() => setEntering(false), 320);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [panelKey]);

  return (
    <div
      style={{
        opacity: entering ? 0 : 1,
        transform: entering ? "translateY(12px)" : "none",
        transition: "opacity 0.32s ease, transform 0.32s ease",
      }}
    >
      {displayed}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: <Activity size={18} /> },
    { id: "trials", label: "Clinical Trials", icon: <Database size={18} /> },
    { id: "applications", label: "Applications", icon: <Users size={18} /> },
    { id: "analysis", label: "AI Match Analysis", icon: <BarChart3 size={18} /> },
    { id: "insights", label: "Eligibility Insights", icon: <Zap size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
  ];

  return (
    <div
      style={{
        width: collapsed ? 64 : 220,
        background: `linear-gradient(160deg, ${C.deep} 0%, ${C.navy} 100%)`,
        transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
        boxShadow: "4px 0 24px rgba(15,40,84,0.18)",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 20,
        position: "relative",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", borderBottom: `1px solid rgba(189,232,245,0.12)`, display: "flex", alignItems: "center", gap: 10, overflow: "hidden" }}>
        <div style={{ width: 36, height: 36, background: C.blue, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 18, color: "#fff", flexShrink: 0, boxShadow: `0 2px 12px rgba(73,136,196,0.4)` }}>C</div>
        {!collapsed && <span style={{ fontWeight: 800, fontSize: 17, color: "#fff", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>Clinerva</span>}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{ position: "absolute", top: 22, right: -12, width: 24, height: 24, borderRadius: "50%", background: C.blue, border: `2px solid ${C.deep}`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 30, transition: "transform 0.3s", transform: collapsed ? "rotate(180deg)" : "none" }}
      >
        <ChevronDown size={12} style={{ transform: "rotate(90deg)" }} />
      </button>

      {/* Create Trial */}
      <div style={{ padding: "12px 10px 4px" }}>
        <button
          onClick={() => setActiveTab("create-trial")}
          style={{ width: "100%", background: C.blue, border: "none", color: "#fff", fontWeight: 700, borderRadius: 10, padding: collapsed ? "10px 0" : "10px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, fontSize: 13, transition: "background 0.2s, box-shadow 0.2s", boxShadow: `0 2px 10px rgba(73,136,196,0.3)`, overflow: "hidden", whiteSpace: "nowrap" }}
          onMouseEnter={e => e.currentTarget.style.background = "#5A96D3"}
          onMouseLeave={e => e.currentTarget.style.background = C.blue}>
          <Plus size={16} style={{ flexShrink: 0 }} />
          {!collapsed && "Create Trial"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map((item, i) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "11px 0" : "11px 14px",
                borderRadius: 10, border: "none", cursor: "pointer", width: "100%",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active ? `rgba(73,136,196,0.22)` : "transparent",
                color: active ? C.sky : "rgba(189,232,245,0.65)",
                fontWeight: active ? 700 : 500, fontSize: 13,
                transition: "all 0.2s", overflow: "hidden", whiteSpace: "nowrap",
                boxShadow: active ? `inset 2px 0 0 ${C.blue}` : "none",
                animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(73,136,196,0.12)"; e.currentTarget.style.color = C.sky; }}
              onMouseLeave={e => { e.currentTarget.style.background = active ? "rgba(73,136,196,0.22)" : "transparent"; e.currentTarget.style.color = active ? C.sky : "rgba(189,232,245,0.65)"; }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
              {active && !collapsed && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: C.sky }} />}
            </button>
          );
        })}

        <div style={{ borderTop: `1px solid rgba(189,232,245,0.1)`, margin: "8px 0 4px" }} />
        {[{ label: "Running Trials", icon: "▶" }, { label: "Past Trials", icon: "✓" }].map(it => (
          <button key={it.label} style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "10px 0" : "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", width: "100%", justifyContent: collapsed ? "center" : "flex-start", background: "transparent", color: "rgba(189,232,245,0.5)", fontWeight: 500, fontSize: 13, transition: "all 0.2s", overflow: "hidden", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(73,136,196,0.1)"; e.currentTarget.style.color = C.sky; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(189,232,245,0.5)"; }}>
            <span style={{ fontSize: 12, flexShrink: 0 }}>{it.icon}</span>
            {!collapsed && it.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div style={{ padding: "10px", borderTop: `1px solid rgba(189,232,245,0.1)` }}>
        <button style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, padding: collapsed ? "10px 0" : "10px 14px", borderRadius: 10, border: "none", background: "transparent", color: "rgba(189,232,245,0.5)", cursor: "pointer", fontSize: 13, transition: "all 0.2s", overflow: "hidden", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,100,100,0.12)"; e.currentTarget.style.color = "#FF8080"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(189,232,245,0.5)"; }}>
          <LogOut size={16} style={{ flexShrink: 0 }} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ activeTab, setActiveTab, userMenuOpen, setUserMenuOpen }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "trials", label: "Clinical Trials" },
    { id: "applications", label: "Applications" },
    { id: "analysis", label: "AI Analysis" },
    { id: "insights", label: "Insights" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <div style={{ background: C.white, borderBottom: `1px solid ${C.gray200}`, boxShadow: "0 1px 12px rgba(15,40,84,0.07)", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, padding: "0 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{ position: "relative", padding: "8px 14px", fontWeight: active ? 700 : 500, fontSize: 13, color: active ? C.navy : C.gray600, background: "none", border: "none", cursor: "pointer", borderRadius: 8, transition: "all 0.2s" }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = C.gray100; e.currentTarget.style.color = C.navy; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.gray600; } }}>
                {tab.label}
                {active && (
                  <span style={{ position: "absolute", bottom: -1, left: "50%", transform: "translateX(-50%)", width: "70%", height: 2.5, background: C.blue, borderRadius: 99, animation: "slideIn 0.25s ease" }} />
                )}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button style={{ position: "relative", padding: 8, background: "none", border: "none", color: C.gray600, cursor: "pointer", borderRadius: 8, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray100}
            onMouseLeave={e => e.currentTarget.style.background = "none"}>
            <Bell size={18} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: `2px solid ${C.white}` }} />
          </button>

          <div style={{ position: "relative" }}>
            <button onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", background: userMenuOpen ? C.gray100 : "none", border: "none", borderRadius: 10, cursor: "pointer", transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.gray100}
              onMouseLeave={e => { if (!userMenuOpen) e.currentTarget.style.background = "none"; }}>
              <div style={{ width: 32, height: 32, background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 2px 8px rgba(73,136,196,0.35)` }}>
                <User size={15} color="#fff" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.gray900 }}>Dr. Jane Smith</span>
              <ChevronDown size={14} color={C.gray600} style={{ transform: userMenuOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {userMenuOpen && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 6px)", width: 180, background: C.white, borderRadius: 12, boxShadow: "0 8px 32px rgba(15,40,84,0.15)", border: `1px solid ${C.gray200}`, overflow: "hidden", animation: "dropDown 0.2s ease" }}>
                {["Profile", "Settings", "Help & Support"].map(item => (
                  <button key={item} style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", fontSize: 13, color: C.gray900, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>{item}</button>
                ))}
                <div style={{ borderTop: `1px solid ${C.gray200}`, margin: "4px 0" }} />
                <button style={{ width: "100%", textAlign: "left", padding: "10px 16px", background: "none", border: "none", fontSize: 13, color: "#EF4444", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>
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
    { title: "Enrolled Patients", value: "89", icon: Users, trend: "+12 new" },
  ];
  const activity = [
    { title: "New application received", description: "Patient applied for TRIAL-2024-001 with 92% AI match score", timestamp: "2 hours ago", icon: Upload },
    { title: "Trial status updated", description: "Clinical Trial TRIAL-2024-001 is now RECRUITING", timestamp: "5 hours ago", icon: CheckCircle },
    { title: "AI matching completed", description: "Batch AI eligibility validation done for Phase 2 Trial", timestamp: "1 day ago", icon: TrendingUp },
    { title: "Doctor referral", description: "Dr. Smith referred a patient for TRIAL-ONC-005", timestamp: "2 days ago", icon: Users },
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

// ─── TRIALS PANEL ────────────────────────────────────────────────────────────
function TrialsPanel({ setActiveTab }) {
  const trials = [
    { id: 1, name: "TRIAL-2024-001 (Oncology)", phase: "Phase 2", startDate: "2024-03-01", participants: "45/100", status: "active" },
    { id: 2, name: "TRIAL-2024-005 (Neurology)", phase: "Phase 3", startDate: "2024-02-28", participants: "12/50", status: "planning" },
    { id: 3, name: "TRIAL-2023-012 (Cardiology)", phase: "Phase 4", startDate: "2024-02-20", participants: "200/200", status: "active" },
  ];
  const stats = [
    { title: "Recruiting Trials", value: "4", color: "#F59E0B", icon: AlertCircle },
    { title: "Trials Closing Soon", value: "2", color: "#EF4444", icon: AlertCircle },
    { title: "Total Active Trials", value: "8", color: C.blue, icon: CheckCircle2 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Clinical Trials Management</h1></Reveal>

      {/* Create Trial */}
      <Reveal delay={60}>
        <div style={{ background: C.white, border: `2px dashed ${C.sky}`, borderRadius: 16, padding: "28px", display: "flex", gap: 14 }}>
          {[{ icon: <Plus size={16} />, label: "Create New Trial", primary: true, action: () => setActiveTab("create-trial") }, { icon: <FileText size={16} />, label: "Import Protocol", primary: false }].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 13, border: btn.primary ? "none" : `2px solid ${C.blue}`, background: btn.primary ? C.blue : "transparent", color: btn.primary ? "#fff" : C.blue, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = btn.primary ? C.navy : C.sky; }}
              onMouseLeave={e => { e.currentTarget.style.background = btn.primary ? C.blue : "transparent"; }}>
              {btn.icon}{btn.label}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Stats */}
      <div>
        <Reveal delay={80}><h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>Trial Portfolio Overview</h2></Reveal>
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
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>All Trials</h2>
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                  {["Trial Name", "Phase", "Participants", "Start Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.deep, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trials.map((d, idx) => (
                  <tr key={d.id} style={{ borderBottom: idx < trials.length - 1 ? `1px solid ${C.gray200}` : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: C.gray900 }}>{d.name}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.phase}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.participants}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.startDate}</td>
                    <td style={{ padding: "14px 18px" }}>
                      {d.status === "active"
                        ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "#DCFCE7", color: "#16A34A", fontSize: 12, fontWeight: 700 }}><CheckCircle2 size={12} />Active</span>
                        : <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "#FEF9C3", color: "#CA8A04", fontSize: 12, fontWeight: 700 }}><AlertCircle size={12} />Planning</span>}
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

// ─── CREATE TRIAL PANEL ───────────────────────────────────────────────────────
function CreateTrialPanel({ setActiveTab }) {
  const [formData, setFormData] = useState({
    title: "", description: "", trialPhase: "Phase 1", studyType: "Interventional",
    status: "OPEN", participantLimit: "", rewardAmount: "", doctorCommission: "",
    startDate: "", endDate: "", duration: "", eligibilitySummary: "",
    contactName: "", contactEmail: "", contactPhone: "", objectives: "",
    city: "", state: "", hospital: ""
  });
  const [loading, setLoading] = useState(false);
  const [labs, setLabs] = useState([]);
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  useEffect(() => {
    // Fetch research labs so user can pick one
    fetch("http://localhost:5001/api/auth/labs")
      .then(r => r.json())
      .then(d => { if (d.labs) setLabs(d.labs); })
      .catch(() => { }); // silently fail — user can type ID manually
  }, []);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLabId.trim()) {
      showToast("error", "Please enter or select a Research Lab ID.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        trialPhase: formData.trialPhase,
        studyType: formData.studyType,
        status: formData.status,
        participantLimit: Number(formData.participantLimit),
        rewardAmount: Number(formData.rewardAmount) || 0,
        doctorCommission: Number(formData.doctorCommission) || 0,
        startDate: formData.startDate,
        endDate: formData.endDate,
        duration: formData.duration,
        eligibilitySummary: formData.eligibilitySummary,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        objectives: formData.objectives
          ? formData.objectives.split("\n").map(s => s.trim()).filter(Boolean)
          : [],
        locations: (formData.city || formData.hospital)
          ? [{ city: formData.city, state: formData.state, hospital: formData.hospital }]
          : []
      };

      const res = await fetch(
        `http://localhost:5001/api/trials/${selectedLabId.trim()}/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "✅ Trial created successfully!");
        setTimeout(() => setActiveTab("trials"), 1600);
      } else {
        showToast("error", "❌ " + (data.error || data.message || "Failed to create trial."));
      }
    } catch (err) {
      showToast("error", "❌ Network error: " + err.message);
    }
    setLoading(false);
  };

  const inp = {
    width: "100%", padding: "11px 14px", borderRadius: 8,
    border: `1.5px solid ${C.gray200}`, fontSize: 14,
    outline: "none", fontFamily: "inherit", background: C.white,
    transition: "border-color 0.2s", boxSizing: "border-box", color: C.gray900
  };
  const lbl = {
    display: "block", fontSize: 12, fontWeight: 700, color: C.gray600,
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em"
  };
  const SectionTitle = ({ children }) => (
    <div style={{
      fontSize: 13, fontWeight: 700, color: C.navy,
      borderBottom: `2px solid ${C.sky}`, paddingBottom: 8,
      marginBottom: 4, gridColumn: "span 2", marginTop: 8
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: "fixed", top: 24, right: 28, zIndex: 9999,
          padding: "14px 22px", borderRadius: 12,
          background: toast.type === "success" ? "#DCFCE7" : "#FEE2E2",
          color: toast.type === "success" ? "#15803D" : "#B91C1C",
          fontWeight: 700, fontSize: 14,
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          animation: "dropDown 0.3s ease"
        }}>
          {toast.msg}
        </div>
      )}

      {/* Page Header */}
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button
            onClick={() => setActiveTab("trials")}
            style={{
              background: C.white, border: `1.5px solid ${C.gray200}`,
              borderRadius: 8, padding: "7px 10px", display: "flex",
              cursor: "pointer", color: C.navy, transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray50}
            onMouseLeave={e => e.currentTarget.style.background = C.white}
          >
            <ChevronDown size={18} style={{ transform: "rotate(90deg)" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, margin: 0 }}>
              Create New Clinical Trial
            </h1>
            <p style={{ fontSize: 13, color: C.gray600, marginTop: 4 }}>
              Fill in all details below. The trial will be saved to the database.
            </p>
          </div>
        </div>
      </Reveal>

      {/* Form Card */}
      <Reveal delay={60}>
        <div style={{
          background: C.white, border: `1px solid ${C.gray200}`,
          borderRadius: 16, padding: "32px 36px"
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>

              {/* ── Research Lab ── */}
              <SectionTitle>Research Lab</SectionTitle>
              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>
                  Research Lab ID <span style={{ color: "#EF4444" }}>*</span>
                </label>
                {labs.length > 0 ? (
                  <select
                    value={selectedLabId}
                    onChange={e => setSelectedLabId(e.target.value)}
                    style={inp}
                  >
                    <option value="">— Select a Research Lab —</option>
                    {labs.map(lab => (
                      <option key={lab._id} value={lab._id}>
                        {lab.labName} ({lab._id})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={selectedLabId}
                    onChange={e => setSelectedLabId(e.target.value)}
                    placeholder="Paste MongoDB ObjectId of the ResearchLab (24 hex chars)"
                    style={inp}
                  />
                )}
                <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}>
                  Must be a valid ResearchLab _id from the database.
                </p>
              </div>

              {/* ── Basic Info ── */}
              <SectionTitle>Basic Information</SectionTitle>

              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>
                  Trial Title <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  required type="text" name="title"
                  value={formData.title} onChange={handleChange}
                  placeholder="e.g. Phase 2 Oncology Trial — Lung Cancer Treatment"
                  style={inp}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>
                  Description <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <textarea
                  required name="description"
                  value={formData.description} onChange={handleChange}
                  placeholder="Describe the trial purpose, methodology, and expected outcomes..."
                  style={{ ...inp, minHeight: 110, resize: "vertical" }}
                />
              </div>

              <div>
                <label style={lbl}>
                  Trial Phase <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <select name="trialPhase" value={formData.trialPhase} onChange={handleChange} style={inp}>
                  <option>Phase 1</option>
                  <option>Phase 2</option>
                  <option>Phase 3</option>
                  <option>Phase 4</option>
                </select>
              </div>

              <div>
                <label style={lbl}>Study Type</label>
                <select name="studyType" value={formData.studyType} onChange={handleChange} style={inp}>
                  <option>Observational</option>
                  <option>Interventional</option>
                  <option>Expanded Access</option>
                </select>
              </div>

              <div>
                <label style={lbl}>Initial Status</label>
                <select name="status" value={formData.status} onChange={handleChange} style={inp}>
                  <option value="PLANNING">PLANNING</option>
                  <option value="OPEN">OPEN</option>
                  <option value="RECRUITING">RECRUITING</option>
                </select>
              </div>

              <div>
                <label style={lbl}>Duration</label>
                <input
                  type="text" name="duration"
                  value={formData.duration} onChange={handleChange}
                  placeholder="e.g. 6 months or 1 year" style={inp}
                />
              </div>

              {/* ── Participants & Financials ── */}
              <SectionTitle>Participants &amp; Financials</SectionTitle>

              <div>
                <label style={lbl}>
                  Participant Limit <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  required type="number" name="participantLimit"
                  value={formData.participantLimit} onChange={handleChange}
                  placeholder="e.g. 100" style={inp} min="1"
                />
              </div>

              <div>
                <label style={lbl}>Reward Amount (₹ / $)</label>
                <input
                  type="number" name="rewardAmount"
                  value={formData.rewardAmount} onChange={handleChange}
                  placeholder="e.g. 5000" style={inp} min="0"
                />
              </div>

              <div>
                <label style={lbl}>Doctor Commission (₹ / $)</label>
                <input
                  type="number" name="doctorCommission"
                  value={formData.doctorCommission} onChange={handleChange}
                  placeholder="e.g. 1000" style={inp} min="0"
                />
              </div>

              {/* ── Schedule ── */}
              <SectionTitle>Schedule</SectionTitle>

              <div>
                <label style={lbl}>
                  Start Date <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  required type="date" name="startDate"
                  value={formData.startDate} onChange={handleChange} style={inp}
                />
              </div>

              <div>
                <label style={lbl}>
                  End Date <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  required type="date" name="endDate"
                  value={formData.endDate} onChange={handleChange} style={inp}
                />
              </div>

              {/* ── Location ── */}
              <SectionTitle>Trial Location (Optional)</SectionTitle>

              <div>
                <label style={lbl}>City</label>
                <input
                  type="text" name="city"
                  value={formData.city} onChange={handleChange}
                  placeholder="e.g. Mumbai" style={inp}
                />
              </div>

              <div>
                <label style={lbl}>State</label>
                <input
                  type="text" name="state"
                  value={formData.state} onChange={handleChange}
                  placeholder="e.g. Maharashtra" style={inp}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Hospital / Facility</label>
                <input
                  type="text" name="hospital"
                  value={formData.hospital} onChange={handleChange}
                  placeholder="e.g. AIIMS Delhi" style={inp}
                />
              </div>

              {/* ── Eligibility & Objectives ── */}
              <SectionTitle>Eligibility &amp; Objectives</SectionTitle>

              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>Eligibility Summary</label>
                <textarea
                  name="eligibilitySummary"
                  value={formData.eligibilitySummary} onChange={handleChange}
                  placeholder="Brief description of who qualifies for this trial..."
                  style={{ ...inp, minHeight: 80, resize: "vertical" }}
                />
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={lbl}>
                  Objectives{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, textTransform: "none" }}>
                    (one per line)
                  </span>
                </label>
                <textarea
                  name="objectives"
                  value={formData.objectives} onChange={handleChange}
                  placeholder={"Evaluate safety of drug X\nMeasure efficacy in Stage 3 patients\nAssess quality of life changes"}
                  style={{ ...inp, minHeight: 90, resize: "vertical" }}
                />
              </div>

              {/* ── Contact ── */}
              <SectionTitle>Contact Information</SectionTitle>

              <div>
                <label style={lbl}>Contact Name</label>
                <input
                  type="text" name="contactName"
                  value={formData.contactName} onChange={handleChange}
                  placeholder="Dr. Priya Sharma" style={inp}
                />
              </div>

              <div>
                <label style={lbl}>Contact Email</label>
                <input
                  type="email" name="contactEmail"
                  value={formData.contactEmail} onChange={handleChange}
                  placeholder="contact@hospital.com" style={inp}
                />
              </div>

              <div>
                <label style={lbl}>Contact Phone</label>
                <input
                  type="tel" name="contactPhone"
                  value={formData.contactPhone} onChange={handleChange}
                  placeholder="+91 98765 43210" style={inp}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{
              borderTop: `1px solid ${C.gray200}`,
              marginTop: 28, paddingTop: 24,
              display: "flex", justifyContent: "flex-end", gap: 12
            }}>
              <button
                type="button"
                onClick={() => setActiveTab("trials")}
                style={{
                  padding: "11px 28px", borderRadius: 10,
                  border: `1.5px solid ${C.gray200}`, background: C.white,
                  color: C.gray600, fontWeight: 600, fontSize: 14, cursor: "pointer"
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                onMouseLeave={e => e.currentTarget.style.background = C.white}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "11px 36px", borderRadius: 10, border: "none",
                  background: loading ? C.navy : C.blue,
                  color: "#fff", fontWeight: 700, fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 8,
                  transition: "background 0.2s"
                }}
              >
                {loading ? "Saving…" : <><Plus size={16} /> Save Trial</>}
              </button>
            </div>
          </form>
        </div>
      </Reveal>
    </div>
  );
}

// ─── APPLICATIONS PANEL ───────────────────────────────────────────────────────
function ApplicationsPanel() {
  const applications = [
    { id: 1, patient: "John Doe", trial: "TRIAL-2024-001", score: 0.94, date: "2024-03-01", status: "PENDING" },
    { id: 2, patient: "Sarah Smith", trial: "TRIAL-2024-005", score: 0.88, date: "2024-02-28", status: "DOCTOR_REVIEW" },
    { id: 3, patient: "Michael Brown", trial: "TRIAL-2023-012", score: 0.96, date: "2024-02-25", status: "APPROVED" },
    { id: 4, patient: "Emily Davis", trial: "TRIAL-2024-001", score: 0.45, date: "2024-02-24", status: "REJECTED" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Trial Applications</h1></Reveal>

      <Reveal delay={100}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: C.deep, marginBottom: 14 }}>Recent Applications</h2>
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: C.gray50, borderBottom: `1px solid ${C.gray200}` }}>
                  {["Patient", "Trial", "AI Match Score", "Date Applied", "Status", "Action"].map(h => (
                    <th key={h} style={{ padding: "14px 18px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.deep, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((d, idx) => (
                  <tr key={d.id} style={{ borderBottom: idx < applications.length - 1 ? `1px solid ${C.gray200}` : "none", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = C.gray50}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>
                    <td style={{ padding: "14px 18px", fontSize: 13, fontWeight: 600, color: C.gray900 }}>{d.patient}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.trial}</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.blue, fontWeight: 700 }}>{(d.score * 100).toFixed(0)}%</td>
                    <td style={{ padding: "14px 18px", fontSize: 13, color: C.gray600 }}>{d.date}</td>
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700,
                        background: d.status === 'APPROVED' ? "#DCFCE7" : d.status === 'REJECTED' ? "#FEE2E2" : d.status === 'DOCTOR_REVIEW' ? "#FEF9C3" : "#E0F2FE",
                        color: d.status === 'APPROVED' ? "#16A34A" : d.status === 'REJECTED' ? "#EF4444" : d.status === 'DOCTOR_REVIEW' ? "#CA8A04" : "#0284C7"
                      }}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px" }}>
                      <button style={{ padding: "6px 12px", background: C.blue, color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Review</button>
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

// ─── ANALYSIS PANEL ───────────────────────────────────────────────────────────
function AnalysisPanel() {
  const metrics = [
    { title: "AI Model Accuracy", value: "94.2%", trend: "+2.1%", icon: "📊" },
    { title: "Match Precision", value: "92.8%", trend: "+1.5%", icon: "🎯" },
    { title: "Enrollment Rate", value: "68.6%", trend: "+5.8%", icon: "📈" },
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
    { v1: "AI Score", v2: "Enrollment Rate", r: 0.88 },
    { v1: "Doctor Referral", v2: "Approval Rate", r: 0.75 },
    { v1: "Distance", v2: "Withdrawal Rate", r: -0.82 },
    { v1: "Prior Conditions", v2: "Eligibility", r: -0.45 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>AI Match Analysis</h1></Reveal>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
        {metrics.map((m, i) => (
          <Reveal key={m.title} delay={i * 80}>
            <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 22, transition: "all 0.3s" }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px rgba(73,136,196,0.15)`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.sky; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.gray200; }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ fontSize: 12, color: C.gray600, fontWeight: 600, marginBottom: 6 }}>{m.title}</p>
                  <p style={{ fontSize: 34, fontWeight: 800, color: C.deep }}>{m.value}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#16A34A", marginTop: 6 }}>{m.trend}</p>
                </div>
                <span style={{ fontSize: 28 }}>{m.icon}</span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* Bar Chart */}
      <Reveal delay={80}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <LineChart size={22} color={C.blue} />
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.deep }}>Patient Matching Trend</h3>
          </div>
          <div style={{ height: 220, display: "flex", alignItems: "flex-end", justifyContent: "space-around", background: C.gray50, borderRadius: 12, padding: "20px 16px 0", gap: 8 }}>
            {trendData.map((d, i) => (
              <div key={d.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
                  {[{ h: d.value * 1.8, bg: C.blue }, { h: d.prediction * 1.8, bg: C.sky }].map((bar, bi) => (
                    <div key={bi} style={{ width: 20, height: bar.h, background: bar.bg, borderRadius: "5px 5px 0 0", cursor: "pointer", transition: "filter 0.2s, transform 0.2s", animation: `growUp 0.6s ease ${i * 80 + bi * 40}ms both` }}
                      onMouseEnter={e => { e.currentTarget.style.filter = "brightness(0.85)"; e.currentTarget.style.transform = "scaleY(1.04)"; }}
                      onMouseLeave={e => { e.currentTarget.style.filter = "none"; e.currentTarget.style.transform = "none"; }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: C.gray600 }}>{d.month}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 16 }}>
            {[{ color: C.blue, label: "Actual" }, { color: C.sky, label: "Predicted" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 14, height: 14, background: l.color, borderRadius: 4 }} />
                <span style={{ fontSize: 12, color: C.gray600, fontWeight: 600 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Correlations */}
      <Reveal delay={120}>
        <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 16, padding: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <BarChart3 size={22} color={C.blue} />
            <h3 style={{ fontWeight: 700, fontSize: 16, color: C.deep }}>Correlation Analysis</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {correlations.map((c, i) => (
              <Reveal key={i} delay={i * 60} direction="left">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", background: C.gray50, borderRadius: 12, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.sky + "44"}
                  onMouseLeave={e => e.currentTarget.style.background = C.gray50}>
                  <p style={{ fontWeight: 600, fontSize: 13, color: C.deep }}>{c.v1} × {c.v2}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 160, height: 8, background: C.gray200, borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ width: `${Math.abs(c.r) * 100}%`, height: "100%", background: c.r > 0 ? "#22C55E" : "#F97316", borderRadius: 99, transition: "width 0.8s ease", animation: "expandBar 0.8s ease both" }} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.deep, width: 44 }}>{c.r > 0 ? "+" : ""}{c.r.toFixed(2)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* Note */}
      <Reveal delay={160}>
        <div style={{ background: `linear-gradient(135deg, ${C.sky}55, ${C.sky}22)`, border: `1px solid ${C.sky}`, borderRadius: 14, padding: "18px 20px", display: "flex", gap: 14 }}>
          <AlertCircle size={18} color={C.navy} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ fontWeight: 700, fontSize: 14, color: C.deep, marginBottom: 4 }}>Analysis Insight</p>
            <p style={{ fontSize: 13, color: C.navy, lineHeight: 1.6 }}>The negative correlation (-0.82) between Distance and Withdrawal Rate suggests patients traveling further are more likely to withdraw. Consider increasing travel compensation.</p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ─── INSIGHTS PANEL ───────────────────────────────────────────────────────────
function InsightsPanel() {
  const [filter, setFilter] = useState("all");
  const insights = [
    { id: 1, title: "High-Match Patient Segment", description: "Patients aged 40–60 showed an 88% eligibility match. This group demonstrates higher protocol adherence.", timestamp: "2 hours ago", icon: Lightbulb, type: "positive" },
    { id: 2, title: "Eligibility Criteria Adjustment", description: "Loosening BMI criteria by 2 points could increase eligible candidate pool by 40% with minimal safety risk.", timestamp: "6 hours ago", icon: Zap, type: "recommendation" },
    { id: 3, title: "Withdrawn Candidates Risk", description: "Candidates with comorbid hypertension showed 25% higher trial withdrawal rates. Recommend added screening protocols.", timestamp: "1 day ago", icon: Heart, type: "warning" },
    { id: 4, title: "Optimal Trial Duration", description: "Optimal trial retention observed for 28-35 days duration. Shorter trials show 15% lower adherence.", timestamp: "2 days ago", icon: TrendingUp, type: "positive" },
    { id: 5, title: "Seasonal Enrollment Variation", description: "Enrollment efficacy varies by season, with 12% faster recruitment during spring/summer.", timestamp: "3 days ago", icon: AlertCircle, type: "observation" },
  ];

  const typeConfig = {
    positive: { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D", accent: "#22C55E" },
    warning: { bg: "#FFF1F2", border: "#FCA5A5", text: "#7F1D1D", accent: "#EF4444" },
    recommendation: { bg: `${C.sky}33`, border: C.sky, text: C.deep, accent: C.blue },
    observation: { bg: "#FFFBEB", border: "#FCD34D", text: "#78350F", accent: "#F59E0B" },
  };

  const filters = ["all", "positive", "recommendation", "warning", "observation"];
  const filtered = filter === "all" ? insights : insights.filter(i => i.type === filter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>AI-Generated Insights</h1>
          <p style={{ fontSize: 14, color: C.gray600, marginTop: 4 }}>Actionable patterns and correlations from your clinical data</p>
        </div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={60}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "7px 16px", borderRadius: 99, fontWeight: 600, fontSize: 12, textTransform: "capitalize", cursor: "pointer", transition: "all 0.2s", border: filter === f ? "none" : `1px solid ${C.gray200}`, background: filter === f ? C.blue : C.white, color: filter === f ? "#fff" : C.gray600, boxShadow: filter === f ? `0 2px 10px rgba(73,136,196,0.3)` : "none" }}>
              {f === "all" ? "All Insights" : f}
            </button>
          ))}
        </div>
      </Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map((insight, i) => {
          const Icon = insight.icon;
          const cfg = typeConfig[insight.type];
          return (
            <Reveal key={insight.id} delay={i * 70}>
              <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", gap: 16, cursor: "pointer", transition: "all 0.25s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 24px rgba(15,40,84,0.1)`; e.currentTarget.style.transform = "translateX(4px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                <div style={{ padding: 12, borderRadius: 12, background: cfg.accent + "22", flexShrink: 0 }}>
                  <Icon size={22} color={cfg.accent} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: cfg.text, marginBottom: 6 }}>{insight.title}</p>
                  <p style={{ fontSize: 13, color: cfg.text, opacity: 0.85, lineHeight: 1.6, marginBottom: 8 }}>{insight.description}</p>
                  <p style={{ fontSize: 11, color: cfg.text, opacity: 0.6 }}>{insight.timestamp}</p>
                </div>
                <button style={{ flexShrink: 0, alignSelf: "center", padding: "8px 16px", borderRadius: 10, border: "none", background: cfg.accent, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "filter 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.filter = "brightness(0.88)"}
                  onMouseLeave={e => e.currentTarget.style.filter = "none"}>Learn More</button>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORTS PANEL ────────────────────────────────────────────────────────────
function ReportsPanel() {
  const [selected, setSelected] = useState(null);
  const reports = [
    { id: 1, title: "TRIAL-2024-001: Phase 2 Analysis", date: "2024-03-01", findings: 4, charts: 8, pages: 24, summary: "Phase 2 clinical trial analysis showing 92% efficacy rate with minimal adverse effects." },
    { id: 2, title: "Comparative Treatment Study", date: "2024-02-25", findings: 6, charts: 12, pages: 32, summary: "Comparative analysis between Treatment A and B across 500+ patients. Treatment A shows 18% better outcomes." },
    { id: 3, title: "Safety Profile Summary", date: "2024-02-15", findings: 3, charts: 5, pages: 16, summary: "Comprehensive safety assessment including adverse events, drug interactions, and population-specific risks." },
  ];
  const findings = [
    "Treatment demonstrates 92% efficacy in primary endpoint",
    "Adverse events are mild to moderate with no serious safety concerns",
    "Age group 40–60 shows optimal response rates",
    "Gender does not significantly impact treatment response",
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <Reveal><h1 style={{ fontSize: 26, fontWeight: 800, color: C.deep, letterSpacing: "-0.3px" }}>Trial Reports</h1></Reveal>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {reports.map((r, i) => (
          <Reveal key={r.id} delay={i * 80}>
            <div onClick={() => setSelected(selected?.id === r.id ? null : r)}
              style={{ background: selected?.id === r.id ? `linear-gradient(135deg, ${C.sky}40, ${C.sky}15)` : C.white, border: `2px solid ${selected?.id === r.id ? C.blue : C.gray200}`, borderRadius: 16, padding: "20px 24px", cursor: "pointer", transition: "all 0.25s", boxShadow: selected?.id === r.id ? `0 4px 20px rgba(73,136,196,0.15)` : "none" }}
              onMouseEnter={e => { if (selected?.id !== r.id) { e.currentTarget.style.borderColor = C.sky; e.currentTarget.style.boxShadow = `0 4px 16px rgba(73,136,196,0.1)`; } }}
              onMouseLeave={e => { if (selected?.id !== r.id) { e.currentTarget.style.borderColor = C.gray200; e.currentTarget.style.boxShadow = "none"; } }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <BarChart3 size={18} color={C.blue} />
                    <p style={{ fontWeight: 700, fontSize: 15, color: C.deep }}>{r.title}</p>
                  </div>
                  <p style={{ fontSize: 13, color: C.gray600, marginBottom: 12 }}>{r.summary}</p>
                  <div style={{ display: "flex", gap: 20 }}>
                    {[["findings", r.findings, "Key Findings"], ["charts", r.charts, "Charts"], ["pages", r.pages, "Pages"]].map(([k, v, lbl]) => (
                      <div key={k} style={{ fontSize: 12, color: C.gray600 }}><span style={{ fontWeight: 700, color: C.deep }}>{v}</span> {lbl}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, marginLeft: 16 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, background: "#DCFCE7", color: "#16A34A", fontSize: 11, fontWeight: 700 }}><CheckCircle2 size={12} />Complete</span>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>{new Date(r.date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {selected && (
        <Reveal direction="up">
          <div style={{ background: C.white, border: `1px solid ${C.gray200}`, borderRadius: 20, padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: C.deep, marginBottom: 4 }}>{selected.title}</h3>
                <p style={{ fontSize: 13, color: C.gray600 }}>Generated on {new Date(selected.date).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ icon: <Download size={15} />, label: "Export PDF", primary: true }, { icon: <Download size={15} />, label: "CSV", primary: false }, { icon: <Share2 size={15} />, label: "Share", primary: false }].map(btn => (
                  <button key={btn.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 10, fontWeight: 700, fontSize: 12, border: btn.primary ? "none" : `1.5px solid ${C.gray200}`, background: btn.primary ? C.blue : "transparent", color: btn.primary ? "#fff" : C.gray900, cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = btn.primary ? C.navy : C.gray50; }}
                    onMouseLeave={e => { e.currentTarget.style.background = btn.primary ? C.blue : "transparent"; }}>
                    {btn.icon}{btn.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${C.gray200}`, paddingTop: 24 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                {[["Key Findings", selected.findings], ["Charts", selected.charts], ["Pages", selected.pages], ["Status", "✓ Complete"]].map(([lbl, val]) => (
                  <div key={lbl} style={{ background: C.gray50, borderRadius: 12, padding: 16 }}>
                    <p style={{ fontSize: 11, color: C.gray600, fontWeight: 600, marginBottom: 6 }}>{lbl}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, color: C.deep }}>{val}</p>
                  </div>
                ))}
              </div>

              <h4 style={{ fontWeight: 700, fontSize: 15, color: C.deep, marginBottom: 12 }}>Key Findings</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {findings.map((f, i) => (
                  <Reveal key={i} delay={i * 60} direction="left">
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", background: `${C.sky}33`, border: `1px solid ${C.sky}`, borderRadius: 12 }}>
                      <CheckCircle2 size={18} color={C.blue} style={{ flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 13, color: C.deep, lineHeight: 1.5 }}>{f}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {!selected && (
        <Reveal>
          <div style={{ background: C.gray50, border: `2px dashed ${C.gray200}`, borderRadius: 16, padding: 48, textAlign: "center" }}>
            <FileText size={40} color={C.gray200} style={{ margin: "0 auto 12px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: C.gray600 }}>Select a report to view details</p>
            <p style={{ fontSize: 13, color: "#94A3B8", marginTop: 4 }}>Click any report above to explore findings and export options</p>
          </div>
        </Reveal>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Researcher() {
  const [activeTab, setActiveTab] = useState("overview");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const renderPanel = () => {
    switch (activeTab) {
      case "overview": return <OverviewPanel />;
      case "trials": return <TrialsPanel setActiveTab={setActiveTab} />;
      case "create-trial": return <CreateTrialPanel setActiveTab={setActiveTab} />;
      case "applications": return <ApplicationsPanel />;
      case "analysis": return <AnalysisPanel />;
      case "insights": return <InsightsPanel />;
      case "reports": return <ReportsPanel />;
      default: return <OverviewPanel />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: C.gray50, fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden" }} onClick={() => userMenuOpen && setUserMenuOpen(false)}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} collapsed={collapsed} setCollapsed={setCollapsed} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <main style={{ flex: 1, overflowY: "auto", padding: "32px 36px" }} onClick={() => setUserMenuOpen(false)}>
          <PanelTransition panelKey={activeTab}>
            {renderPanel()}
          </PanelTransition>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes slideIn { from { width: 0 } to { width: 70% } }
        @keyframes dropDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: none } }
        @keyframes growUp { from { transform: scaleY(0); transform-origin: bottom } to { transform: scaleY(1); transform-origin: bottom } }
        @keyframes expandBar { from { width: 0 } to {} }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.sky}; border-radius: 99px; }
      `}</style>
    </div>
  );
}
