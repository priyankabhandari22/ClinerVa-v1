import { useState } from "react";
import {
  Activity,
  Database,
  BarChart3,
  Zap,
  FileText,
  Plus,
  LogOut,
  ChevronDown,
  Bell,
  User,
  Users
} from "lucide-react";

// ─── PALETTE ─────────────────────────────────────────
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

function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: `linear-gradient(160deg, ${C.deep} 0%, ${C.navy} 100%)`,
        transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
        boxShadow: "4px 0 24px rgba(15,40,84,0.18)",
        position: "relative",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px 16px",
          borderBottom: `1px solid rgba(189,232,245,0.12)`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            background: C.blue,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            color: "#fff",
            flexShrink: 0,
            boxShadow: `0 2px 12px rgba(73,136,196,0.4)`,
          }}
        >
          C
        </div>

        {!collapsed && (
          <span
            style={{
              fontWeight: 800,
              fontSize: 17,
              color: "#fff",
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
            }}
          >
            Clinerva
          </span>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: "absolute",
          top: 22,
          right: -12,
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: C.blue,
          border: `2px solid ${C.deep}`,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 30,
          transform: collapsed ? "rotate(180deg)" : "none",
        }}
      >
        <ChevronDown size={12} style={{ transform: "rotate(90deg)" }} />
      </button>

      {/* Create Trial */}
      <div style={{ padding: "12px 10px 4px" }}>
        <button
          onClick={() => setActiveTab("create-trial")}
          style={{
            width: "100%",
            background: C.blue,
            border: "none",
            color: "#fff",
            fontWeight: 700,
            borderRadius: 10,
            padding: collapsed ? "10px 0" : "10px 14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: 8,
            fontSize: 13,
            boxShadow: `0 2px 10px rgba(73,136,196,0.3)`,
          }}
        >
          <Plus size={16} />
          {!collapsed && "Create Trial"}
        </button>
      </div>

      {/* Navigation */}
      <nav
        style={{
          flex: 1,
          padding: "8px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {navItems.map((item) => {
          const active = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: collapsed ? "11px 0" : "11px 14px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                width: "100%",
                justifyContent: collapsed ? "center" : "flex-start",
                background: active
                  ? `rgba(73,136,196,0.22)`
                  : "transparent",
                color: active
                  ? C.sky
                  : "rgba(189,232,245,0.65)",
                fontWeight: active ? 700 : 500,
                fontSize: 13,
              }}
            >
              {item.icon}
              {!collapsed && item.label}
            </button>
          );
        })}
      </nav>

      {/* Profile / Notifications */}
      <div
        style={{
          padding: "10px",
          borderTop: `1px solid rgba(189,232,245,0.1)`,
        }}
      >
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: `linear-gradient(135deg, ${C.blue}, ${C.navy})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={18} color="#fff" />
          </button>

          <button
            style={{
              padding: 8,
              border: "none",
              background: "transparent",
              color: C.sky,
              cursor: "pointer",
            }}
          >
            <Bell size={18} />
          </button>
        </div>

        {userMenuOpen && (
          <div
            style={{
              position: "absolute",
              bottom: 70,
              left: collapsed ? "50%" : 16,
              transform: collapsed ? "translateX(-50%)" : "none",
              width: 180,
              background: C.white,
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(15,40,84,0.15)",
              border: `1px solid ${C.gray200}`,
              overflow: "hidden",
            }}
          >
            {["Profile", "Settings", "Help & Support"].map((item) => (
              <button
                key={item}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 16px",
                  background: "none",
                  border: "none",
                  fontSize: 13,
                  color: C.gray900,
                  cursor: "pointer",
                }}
              >
                {item}
              </button>
            ))}

            <div
              style={{
                borderTop: `1px solid ${C.gray200}`,
                margin: "4px 0",
              }}
            />

            <button
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 16px",
                background: "none",
                border: "none",
                fontSize: 13,
                color: "#EF4444",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>
        )}

        <button
          style={{
            width: "100%",
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: collapsed ? "10px 0" : "10px 14px",
            borderRadius: 10,
            border: "none",
            background: "transparent",
            color: "rgba(189,232,245,0.5)",
            cursor: "pointer",
          }}
        >
          <LogOut size={16} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;