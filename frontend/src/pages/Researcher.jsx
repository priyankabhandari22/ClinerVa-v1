import { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  TrendingUp, Database, Zap, Users, Upload, CheckCircle, Clock,
  Bell, ChevronDown, User, LogOut, Plus, BarChart3, LineChart,
  AlertCircle, Lightbulb, Heart, Download, Share2, FileText,
  CheckCircle2, Activity, FlaskConical, Menu, X, ArrowRight,
  Search, Filter, MapPin, Calendar, Users2, Microscope,
  BookOpen, Settings, HelpCircle, RefreshCw, Eye, Edit2,
  Trash2, MoreVertical, Phone, Mail, Building, Loader, UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NODE_API_BASE = "http://localhost:5000/api";
const AI_ENGINE_BASE = "http://localhost:8000";

// ─── COLOR PALETTE - GREEN THEME ─────────────────────────────────────────────
const Colors = {
  // Deep Greens
  darkGreen: "#0A2E1C",
  deepGreen: "#1B5E3A",
  midGreen: "#2E7D5C",
  // Light Greens
  lightGreen: "#A8D5BA",
  accentGreen: "#6BBF8A",
  // Grays
  bg: "#F0F9F4",
  cardBg: "#FFFFFF",
  textDark: "#1B5E3A",
  textMuted: "#4B6B5B",
  borderLight: "#E0EFE5",
  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
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
  const translate = direction === "up" ? { y: 32 }
    : direction === "left" ? { x: -32 }
      : direction === "right" ? { x: 32 }
        : { y: -32 };
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...translate }}
      animate={visible ? { opacity: 1, x: 0, y: 0 } : {}}
      transition={{ duration: 0.6, delay: delay / 1000, ease: "easeOut" }}
    >
      {children}
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {displayed}
    </motion.div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────────────────────
function Sidebar({ activeTab, setActiveTab, collapsed, setCollapsed, onLogout }) {
  const navItems = [
    { id: "overview", label: "Overview", icon: <Activity size={18} /> },
    { id: "trials", label: "Clinical Trials", icon: <Microscope size={18} /> },
    { id: "applications", label: "Applications", icon: <Users size={18} /> },
    { id: "analysis", label: "AI Match", icon: <BarChart3 size={18} /> },
    { id: "insights", label: "Eligibility Insights", icon: <Lightbulb size={18} /> },
    { id: "reports", label: "Reports", icon: <FileText size={18} /> },
  ];

  return (
    <motion.div
      className="relative flex flex-col h-screen"
      style={{
        width: collapsed ? 80 : 260,
        background: `linear-gradient(180deg, ${Colors.darkGreen} 0%, ${Colors.deepGreen} 100%)`,
        boxShadow: "4px 0 24px rgba(27,94,58,0.2)",
        transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <motion.div 
        className="flex items-center gap-3 p-4 border-b"
        style={{ borderColor: `${Colors.lightGreen}20` }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-white p-2 rounded-xl shadow-lg flex items-center justify-center"
        >
          <Activity className="text-[#2E7D5C] w-6 h-6" />
        </motion.div>
        {!collapsed && (
          <motion.span 
            className="font-black text-white text-lg tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Clinerva
          </motion.span>
        )}
      </motion.div>

      {/* Collapse toggle */}
      <motion.button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-30 transition-all"
        style={{
          background: Colors.accentGreen,
          border: `2px solid ${Colors.darkGreen}`,
          color: "white",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronDown size={12} style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(90deg)", transition: "transform 0.3s" }} />
      </motion.button>

      {/* Create Trial */}
      <div className="px-3 py-4">
        <motion.button
          onClick={() => setActiveTab("create-trial")}
          className="w-full flex items-center justify-center gap-2 font-bold text-white rounded-lg py-2 transition-all"
          style={{
            background: Colors.accentGreen,
            boxShadow: `0 4px 12px ${Colors.accentGreen}40`,
          }}
          whileHover={{ scale: 1.05, boxShadow: `0 6px 16px ${Colors.accentGreen}60` }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span className="text-sm">New Trial</span>}
        </motion.button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <AnimatePresence>
          {navItems.map((item, i) => {
            const active = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative"
                style={{
                  background: active ? `${Colors.accentGreen}25` : "transparent",
                  color: active ? Colors.lightGreen : `${Colors.lightGreen}99`,
                }}
                whileHover={{ background: active ? `${Colors.accentGreen}25` : `${Colors.accentGreen}15` }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                {!collapsed && (
                  <>
                    <span className="text-sm font-600 flex-1 text-left">{item.label}</span>
                    {active && <span className="w-1.5 h-1.5 bg-white rounded-full" />}
                  </>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t" style={{ borderColor: `${Colors.lightGreen}20` }}>
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-red-300"
          style={{ background: "rgba(239, 68, 68, 0.1)" }}
          whileHover={{ background: "rgba(239, 68, 68, 0.2)" }}
          whileTap={{ scale: 0.95 }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && <span className="text-sm font-600">Logout</span>}
        </motion.button>
      </div>
    </motion.div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ activeTab, setActiveTab, userMenuOpen, setUserMenuOpen }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "trials", label: "Clinical Trials" },
    { id: "applications", label: "Applications" },
    { id: "analysis", label: "AI Match" },
    { id: "insights", label: "Insights" },
    { id: "reports", label: "Reports" },
  ];

  return (
    <motion.div 
      className="sticky top-0 z-10 flex items-center justify-between h-16 px-8 border-b"
      style={{
        background: Colors.cardBg,
        borderColor: Colors.borderLight,
        boxShadow: "0 2px 12px rgba(27, 94, 58, 0.08)",
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div className="flex items-center gap-1" layout>
        <AnimatePresence>
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <motion.button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm relative`}
                style={{
                  color: active ? Colors.deepGreen : Colors.textMuted,
                  background: active ? `${Colors.accentGreen}15` : "transparent",
                }}
                whileHover={{ background: active ? `${Colors.accentGreen}15` : `${Colors.accentGreen}08` }}
                whileTap={{ scale: 0.98 }}
              >
                {tab.label}
                {active && (
                  <motion.span 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full"
                    style={{ background: Colors.accentGreen, width: "40%" }}
                    layoutId="navUnderline"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>

      <motion.div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg transition-all"
          style={{ background: Colors.bg }}
        >
          <Bell size={20} style={{ color: Colors.textMuted }} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        <div className="relative">
          <motion.button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all"
            style={{
              background: userMenuOpen ? Colors.bg : "transparent",
            }}
            whileHover={{ background: Colors.bg }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${Colors.deepGreen}, ${Colors.midGreen})`,
              }}
            >
              <User size={18} />
            </motion.div>
            <span className="text-sm font-semibold" style={{ color: Colors.textDark }}>Dr. Jane Smith</span>
            <motion.span
              animate={{ rotate: userMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} style={{ color: Colors.textMuted }} />
            </motion.span>
          </motion.button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg border overflow-hidden"
                style={{
                  background: Colors.cardBg,
                  borderColor: Colors.borderLight,
                  boxShadow: "0 10px 30px rgba(27, 94, 58, 0.15)",
                }}
              >
                {["Profile", "Settings", "Help & Support"].map((item, idx) => (
                  <motion.button
                    key={item}
                    className="w-full text-left px-4 py-3 text-sm font-medium transition-all border-b:"
                    style={{
                      color: Colors.deepGreen,
                      borderBottom: idx < 2 ? `1px solid ${Colors.borderLight}` : "none",
                    }}
                    whileHover={{ background: Colors.bg }}
                  >
                    {item}
                  </motion.button>
                ))}
                <motion.button
                  className="w-full text-left px-4 py-3 text-sm font-medium transition-all"
                  style={{ color: Colors.danger }}
                  whileHover={{ background: "rgba(239, 68, 68, 0.08)" }}
                >
                  Logout
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, trend, delay = 0, color = Colors.accentGreen }) {
  return (
    <Reveal delay={delay}>
      <motion.div
        className="rounded-2xl p-6 border cursor-default relative overflow-hidden group"
        style={{
          background: Colors.cardBg,
          borderColor: Colors.borderLight,
          boxShadow: "0 2px 8px rgba(27, 94, 58, 0.06)",
        }}
        whileHover={{
          boxShadow: "0 12px 32px rgba(27, 94, 58, 0.15)",
          transform: "translateY(-4px)",
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Gradient background */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{
            background: `linear-gradient(135deg, ${Colors.deepGreen}05, ${Colors.accentGreen}05)`,
          }}
        />

        <div className="relative flex justify-between items-start">
          <div>
            <motion.p 
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: Colors.textMuted }}
            >
              {title}
            </motion.p>
            <motion.p 
              className="text-4xl font-black"
              style={{ color: color }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: delay / 1000 + 0.2 }}
            >
              {value}
            </motion.p>
            {trend && (
              <motion.p 
                className="text-sm font-bold mt-2"
                style={{ color: Colors.success }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay / 1000 + 0.4 }}
              >
                {trend}
              </motion.p>
            )}
          </div>
          <motion.div 
            className="p-3 rounded-xl"
            style={{ background: `${color}15` }}
            whileHover={{ scale: 1.1 }}
          >
            <Icon size={24} style={{ color }} />
          </motion.div>
        </div>
      </motion.div>
    </Reveal>
  );
}

// ─── OVERVIEW PANEL ───────────────────────────────────────────────────────────
function OverviewPanel() {
  const cards = [
    { title: "Active Trials", value: "12", icon: FlaskConical, trend: "+3 this month", color: Colors.accentGreen },
    { title: "Pending Applications", value: "48", icon: UserCircle, trend: "+15 this week", color: Colors.info },
    { title: "AI Matches Found", value: "342", icon: Zap, trend: "+56 today", color: Colors.warning },
    { title: "Enrolled Patients", value: "89", icon: Users, trend: "+12 new", color: Colors.success },
  ];

  const activity = [
    { title: "New application received", description: "Patient applied for TRIAL-2024-001 with 92% AI match score", timestamp: "2 hours ago", icon: Upload, color: Colors.info },
    { title: "Trial status updated", description: "Clinical Trial TRIAL-2024-001 is now RECRUITING", timestamp: "5 hours ago", icon: CheckCircle, color: Colors.success },
    { title: "AI matching completed", description: "Batch AI eligibility validation done for Phase 2 Trial", timestamp: "1 day ago", icon: TrendingUp, color: Colors.accentGreen },
    { title: "Doctor referral", description: "Dr. Smith referred a patient for TRIAL-ONC-005", timestamp: "2 days ago", icon: Users, color: Colors.warning },
  ];

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <motion.h1 
            className="text-4xl font-black tracking-tight mb-2"
            style={{ color: Colors.deepGreen }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Research Overview
          </motion.h1>
          <motion.p 
            className="text-sm font-medium"
            style={{ color: Colors.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Dashboard and performance metrics
          </motion.p>
        </div>
      </Reveal>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1, delayChildren: 0.1 }}
      >
        {cards.map((c, i) => <StatCard key={c.title} {...c} delay={i * 80} />)}
      </motion.div>

      {/* Activity Section */}
      <Reveal delay={200}>
        <div>
          <motion.h2 
            className="text-2xl font-bold mb-4 tracking-tight"
            style={{ color: Colors.deepGreen }}
          >
            Recent Activity
          </motion.h2>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.08 }}
          >
            {activity.map((a, i) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.title}
                  className="rounded-xl p-4 border transition-all cursor-default group"
                  style={{
                    background: Colors.cardBg,
                    borderColor: Colors.borderLight,
                  }}
                  whileHover={{
                    borderColor: a.color,
                    boxShadow: `0 6px 20px ${a.color}15`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="flex gap-4 items-start">
                    <motion.div 
                      className="p-2.5 rounded-lg flex-shrink-0"
                      style={{ background: `${a.color}15` }}
                      whileHover={{ scale: 1.1 }}
                    >
                      <Icon size={20} style={{ color: a.color }} />
                    </motion.div>
                    <div className="flex-1 min-w-0">
                      <motion.p 
                        className="font-bold text-sm"
                        style={{ color: Colors.deepGreen }}
                      >
                        {a.title}
                      </motion.p>
                      <motion.p 
                        className="text-sm font-medium mt-1"
                        style={{ color: Colors.textMuted }}
                      >
                        {a.description}
                      </motion.p>
                      <motion.p 
                        className="text-xs font-medium mt-2"
                        style={{ color: `${Colors.textMuted}99` }}
                      >
                        {a.timestamp}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </Reveal>
    </div>
  );
}

// ─── TRIALS PANEL ────────────────────────────────────────────────────────────
function TrialsPanel({ setActiveTab }) {
  const [allTrials, setAllTrials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedTrial, setSelectedTrial] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch trials on mount
  useEffect(() => {
    fetchTrials();
  }, []);

  const fetchTrials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AI_ENGINE_BASE}/trials`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllTrials(data.trials || []);
    } catch (err) {
      setError("Failed to load trials. Is the AI engine running on port 8000?");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from real data
  const recruitingCount = allTrials.filter(t => t.status === "Recruiting").length;
  const closingSoonCount = allTrials.filter(t => {
    const end = new Date(t.endDate);
    const now = new Date();
    const diffDays = (end - now) / (1000 * 60 * 60 * 24);
    return diffDays <= 90 && diffDays > 0;
  }).length;
  const activeCount = allTrials.filter(t => t.status === "Recruiting" || t.status === "Open").length;

  // Filter and search trials
  let filteredTrials = allTrials;
  if (statusFilter !== "All") {
    filteredTrials = filteredTrials.filter(t => t.status === statusFilter);
  }
  if (searchText.trim()) {
    const search = searchText.toLowerCase();
    filteredTrials = filteredTrials.filter(t =>
      t.name?.toLowerCase().includes(search) ||
      t.sponsor?.toLowerCase().includes(search) ||
      t.trialId?.toLowerCase().includes(search)
    );
  }

  // Stat cards
  const stats = [
    { title: "Recruiting Trials", value: loading ? "—" : recruitingCount, color: Colors.accentGreen, icon: Users },
    { title: "Trials Closing Soon", value: loading ? "—" : closingSoonCount, color: Colors.warning, icon: Clock },
    { title: "Total Active Trials", value: loading ? "—" : activeCount, color: Colors.info, icon: FlaskConical },
  ];

  // Format date
  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Status badge
  const getStatusBadge = (status) => {
    const badges = {
      "Recruiting": { bg: `${Colors.success}15`, color: Colors.success, label: "● Recruiting" },
      "Open": { bg: `${Colors.info}15`, color: Colors.info, label: "● Open" },
      "Closed": { bg: `${Colors.textMuted}10`, color: Colors.textMuted, label: "● Closed" },
      "Completed": { bg: "#E9D5FF", color: "#7E22CE", label: "● Completed" },
    };
    const badge = badges[status] || badges["Closed"];
    return badge;
  };

  // Skeleton loader
  const SkeletonRow = () => (
    <tr>
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <motion.div
            className="h-4 rounded"
            style={{
              background: `linear-gradient(90deg, ${Colors.borderLight} 0%, #fff 50%, ${Colors.borderLight} 100%)`,
              backgroundSize: "200% 100%",
            }}
            animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        </td>
      ))}
    </tr>
  );

  return (
    <div className="space-y-8">
      <Reveal>
        <div>
          <motion.h1 
            className="text-4xl font-black tracking-tight mb-2"
            style={{ color: Colors.deepGreen }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Clinical Trials Management
          </motion.h1>
          <motion.p 
            className="text-sm font-medium"
            style={{ color: Colors.textMuted }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Manage and track all clinical trials
          </motion.p>
        </div>
      </Reveal>

      {/* Create Trial Buttons */}
      <Reveal delay={60}>
        <motion.div 
          className="rounded-xl p-7 border-2 border-dashed flex gap-3"
          style={{
            background: Colors.bg,
            borderColor: Colors.borderLight,
          }}
          whileHover={{ borderColor: Colors.accentGreen }}
          transition={{ duration: 0.3 }}
        >
          {[
            { icon: <Plus size={18} />, label: "Create New Trial", primary: true, action: () => setActiveTab("create-trial") },
            { icon: <Upload size={18} />, label: "Import Protocol", primary: false }
          ].map(btn => (
            <motion.button
              key={btn.label}
              onClick={btn.action}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition-all"
              style={{
                background: btn.primary ? Colors.deepGreen : "transparent",
                color: btn.primary ? "white" : Colors.deepGreen,
                border: btn.primary ? "none" : `2px solid ${Colors.deepGreen}`,
              }}
              whileHover={{
                transform: "translateY(-2px)",
                boxShadow: btn.primary ? `0 8px 16px ${Colors.deepGreen}25` : "none",
                background: btn.primary ? Colors.midGreen : Colors.bg,
              }}
              whileTap={{ scale: 0.95 }}
            >
              {btn.icon}
              {btn.label}
            </motion.button>
          ))}
        </motion.div>
      </Reveal>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <Reveal delay={80}>
            <motion.div
              className="rounded-lg p-4 border flex items-center justify-between gap-3"
              style={{
                background: `${Colors.danger}10`,
                borderColor: `${Colors.danger}30`,
              }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <span className="text-sm font-bold flex-1" style={{ color: Colors.danger }}>
                ⚠️ {error}
              </span>
              <motion.button
                onClick={fetchTrials}
                className="px-4 py-2 rounded-lg font-bold text-xs text-white transition-all"
                style={{ background: Colors.danger }}
                whileHover={{ background: "#DC2626" }}
                whileTap={{ scale: 0.95 }}
              >
                Retry
              </motion.button>
            </motion.div>
          </Reveal>
        )}
      </AnimatePresence>

      {/* Stats */}
      <Reveal delay={100}>
        <div>
          <motion.h2 
            className="text-2xl font-bold mb-4 tracking-tight"
            style={{ color: Colors.deepGreen }}
          >
            Trial Portfolio Overview
          </motion.h2>
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 80} />)}
          </motion.div>
        </div>
      </Reveal>

      {/* Table Section */}
      <Reveal delay={150}>
        <div className="space-y-4">
          {/* Header with refresh */}
          <div className="flex items-center justify-between gap-3">
            <motion.h2 
              className="text-2xl font-bold tracking-tight"
              style={{ color: Colors.deepGreen }}
            >
              All Trials
            </motion.h2>
            <motion.button
              onClick={fetchTrials}
              disabled={loading}
              className="px-4 py-2 rounded-lg border font-bold text-sm flex items-center gap-2 transition-all"
              style={{
                borderColor: Colors.borderLight,
                color: Colors.deepGreen,
                background: Colors.bg,
                opacity: loading ? 0.6 : 1,
              }}
              whileHover={{ background: Colors.cardBg }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
              Refresh
            </motion.button>
          </div>

          {/* Search & Filters */}
          {!loading && (
            <motion.div 
              className="flex gap-3 flex-wrap"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <input
                type="text"
                placeholder="Search trials by name, sponsor..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 min-w-64 px-4 py-2.5 rounded-lg border font-medium text-sm outline-none transition-all"
                style={{
                  borderColor: Colors.borderLight,
                  background: Colors.cardBg,
                  color: Colors.deepGreen,
                }}
                onFocus={(e) => e.target.style.borderColor = Colors.accentGreen}
                onBlur={(e) => e.target.style.borderColor = Colors.borderLight}
              />
              <div className="flex gap-2">
                {["All", "Recruiting", "Open", "Closed"].map(filter => (
                  <motion.button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className="px-4 py-2.5 rounded-lg font-bold text-sm transition-all"
                    style={{
                      background: statusFilter === filter ? Colors.deepGreen : Colors.bg,
                      color: statusFilter === filter ? "white" : Colors.deepGreen,
                      border: statusFilter === filter ? "none" : `1.5px solid ${Colors.borderLight}`,
                    }}
                    whileHover={{
                      transform: "translateY(-2px)",
                      boxShadow: statusFilter === filter ? `0 4px 12px ${Colors.deepGreen}25` : "none",
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {filter}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Results count */}
          {!loading && filteredTrials.length > 0 && (
            <motion.p 
              className="text-sm font-medium"
              style={{ color: Colors.textMuted }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Showing {filteredTrials.length} of {allTrials.length} trials
            </motion.p>
          )}

          {/* Empty states & Table */}
          <motion.div 
            className="rounded-xl border overflow-hidden"
            style={{
              background: Colors.cardBg,
              borderColor: Colors.borderLight,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{duration: 0.4 }}
          >
            {!loading && filteredTrials.length === 0 && allTrials.length === 0 ? (
              <div className="p-16 text-center">
                <div className="text-5xl mb-4">🧪</div>
                <p className="font-bold text-lg mb-2" style={{ color: Colors.deepGreen }}>No clinical trials found</p>
                <p className="font-medium mb-6" style={{ color: Colors.textMuted }}>Create your first trial to get started</p>
                <motion.button
                  onClick={() => setActiveTab("create-trial")}
                  className="px-6 py-2.5 rounded-lg font-bold text-white transition-all"
                  style={{ background: Colors.deepGreen }}
                  whileHover={{ background: Colors.midGreen, transform: "translateY(-2px)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  + Create New Trial
                </motion.button>
              </div>
            ) : !loading && filteredTrials.length === 0 ? (
              <div className="p-8 text-center" style={{ color: Colors.textMuted }}>
                <p className="font-medium">No trials match your search or filters</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr style={{ background: Colors.bg, borderBottom: `1px solid ${Colors.borderLight}` }}>
                    {["Trial Name", "Phase", "Participants", "Start Date", "Location", "Status", "Action"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: Colors.textMuted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                  ) : (
                    filteredTrials.map((trial, idx) => {
                      const badge = getStatusBadge(trial.status);
                      const trialName = trial.name && trial.name.length > 50 ? trial.name.substring(0, 50) + "..." : trial.name;
                      return (
                        <motion.tr
                          key={trial.trialId || idx}
                          className="border-t transition-all hover:bg-[#F0F9F4]"
                          style={{ borderColor: Colors.borderLight }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <td className="px-6 py-4 font-bold text-sm" style={{ color: Colors.deepGreen }} title={trial.name}>
                            {trialName}
                          </td>
                          <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>{trial.phase}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>0/{trial.maxParticipants}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>{formatDate(trial.startDate)}</td>
                          <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>📍 {trial.location}</td>
                          <td className="px-6 py-4">
                            <span
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                              }}
                            >
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <motion.button
                              onClick={() => {
                                setSelectedTrial(trial);
                                setShowModal(true);
                              }}
                              className="px-3 py-1.5 rounded-lg border font-bold text-xs transition-all"
                              style={{
                                borderColor: Colors.accentGreen,
                                color: Colors.accentGreen,
                                background: "transparent",
                              }}
                              whileHover={{
                                background: Colors.accentGreen,
                                color: "white",
                                transform: "translateY(-2px)",
                              }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Details
                            </motion.button>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </motion.div>
        </div>
      </Reveal>

      {/* Trial Detail Modal */}
      <AnimatePresence>
        {showModal && selectedTrial && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
            style={{ background: "rgba(0,0,0,0.5)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                className="sticky top-0 flex items-center justify-between p-6 border-b"
                style={{
                  borderColor: Colors.borderLight,
                  background: Colors.bg,
                }}
              >
                <motion.h3 
                  className="text-2xl font-black"
                  style={{ color: Colors.deepGreen }}
                >
                  {selectedTrial.name}
                </motion.h3>
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-lg font-bold transition-all"
                  style={{
                    background: Colors.borderLight,
                    color: Colors.textMuted,
                  }}
                  whileHover={{
                    background: Colors.accentGreen,
                    color: "white",
                  }}
                  whileTap={{ scale: 0.9 }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: Colors.textMuted }}>
                    Trial Information
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: "Trial ID", value: selectedTrial.trialId },
                      { label: "Phase", value: selectedTrial.phase },
                      { label: "Status", value: getStatusBadge(selectedTrial.status).label.replace("● ", "") },
                      { label: "Location", value: `📍 ${selectedTrial.location}` },
                      { label: "Sponsor", value: selectedTrial.sponsor },
                      { label: "Start Date", value: formatDate(selectedTrial.startDate) },
                      { label: "End Date", value: formatDate(selectedTrial.endDate) },
                      { label: "Max Participants", value: selectedTrial.maxParticipants },
                    ].map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: Colors.textMuted }}>
                          {item.label}
                        </p>
                        <p className="font-bold text-sm" style={{ color: Colors.deepGreen }}>
                          {item.value || "—"}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Column */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: Colors.textMuted }}>
                    Eligibility Criteria
                  </h4>
                  {selectedTrial.criteria ? (
                    <div className="space-y-4">
                      {selectedTrial.criteria.inclusion && Object.keys(selectedTrial.criteria.inclusion).length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                          <h5 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: Colors.success }}>
                            ✅ INCLUSION
                          </h5>
                          <div className="pl-4 border-l-2" style={{ borderColor: Colors.success }}>
                            {Object.entries(selectedTrial.criteria.inclusion).map(([key, val], i) => (
                              <p key={i} className="text-xs font-medium mb-3" style={{ color: Colors.textMuted }}>
                                <strong style={{ color: Colors.deepGreen }}>{key}:</strong> {String(val)}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {selectedTrial.criteria.exclusion && Object.keys(selectedTrial.criteria.exclusion).length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                          <h5 className="text-xs font-bold mb-2 flex items-center gap-2" style={{ color: Colors.danger }}>
                            ❌ EXCLUSION
                          </h5>
                          <div className="pl-4 border-l-2" style={{ borderColor: Colors.danger }}>
                            {Object.entries(selectedTrial.criteria.exclusion).map(([key, val], i) => (
                              <p key={i} className="text-xs font-medium mb-3" style={{ color: Colors.textMuted }}>
                                <strong style={{ color: Colors.deepGreen }}>{key}:</strong> {String(val)}
                              </p>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: Colors.textMuted }}>No criteria specified</p>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div
                className="flex gap-3 p-6 border-t"
                style={{ borderColor: Colors.borderLight, background: Colors.bg }}
              >
                <motion.button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-lg font-bold text-sm transition-all border"
                  style={{
                    borderColor: Colors.borderLight,
                    color: Colors.deepGreen,
                    background: Colors.cardBg,
                  }}
                  whileHover={{ background: Colors.bg }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
                <motion.button
                  className="px-6 py-2.5 rounded-lg font-bold text-sm text-white transition-all"
                  style={{ background: Colors.deepGreen }}
                  whileHover={{ background: Colors.midGreen, transform: "translateY(-2px)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Edit Trial
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [selectedLabId, setSelectedLabId] = useState("");
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }

  useEffect(() => {
    // Fetch research labs so user can pick one
    fetch(`${NODE_API_BASE}/auth/labs`)
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
        `${NODE_API_BASE}/trials/${selectedLabId.trim()}/create`,
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
    border: `1.5px solid ${Colors.borderLight}`, fontSize: 14,
    outline: "none", fontFamily: "inherit", background: Colors.cardBg,
    transition: "border-color 0.2s", boxSizing: "border-box", color: Colors.textDark
  };
  const lbl = {
    display: "block", fontSize: 12, fontWeight: 700, color: Colors.textMuted,
    marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.05em"
  };
  const SectionTitle = ({ children }) => (
    <motion.div 
      style={{
        fontSize: 13, fontWeight: 700, color: Colors.deepGreen,
        borderBottom: `2px solid ${Colors.accentGreen}`, paddingBottom: 8,
        marginBottom: 4, gridColumn: "span 2", marginTop: 8
      }}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );

  return (
    <div className="space-y-8 pb-12">
      <style>{`
        @keyframes dropDown {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            style={{
              position: "fixed", top: 24, right: 28, zIndex: 9999,
              padding: "14px 22px", borderRadius: 12,
              background: toast.type === "success" ? `${Colors.success}15` : `${Colors.danger}15`,
              color: toast.type === "success" ? Colors.success : Colors.danger,
              fontWeight: 700, fontSize: 14,
              boxShadow: `0 4px 20px ${toast.type === "success" ? Colors.success : Colors.danger}25`,
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <Reveal>
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.button
            onClick={() => setActiveTab("trials")}
            className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all"
            style={{
              background: Colors.cardBg,
              borderColor: Colors.borderLight,
              color: Colors.deepGreen,
            }}
            whileHover={{ background: Colors.bg, transform: "translateX(-2px)" }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown size={18} style={{ transform: "rotate(90deg)" }} />
          </motion.button>
          <div>
            <motion.h1 
              className="text-4xl font-black m-0 tracking-tight"
              style={{ color: Colors.deepGreen }}
            >
              Create New Clinical Trial
            </motion.h1>
            <motion.p 
              className="text-sm font-medium mt-2"
              style={{ color: Colors.textMuted }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Fill in all details below. The trial will be saved to the database.
            </motion.p>
          </div>
        </motion.div>
      </Reveal>

      {/* Form Card */}
      <Reveal delay={60}>
        <motion.div 
          className="rounded-2xl p-8 border"
          style={{
            background: Colors.cardBg,
            borderColor: Colors.borderLight,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px 28px" }}>

              {/* ── Research Lab ── */}
              <SectionTitle>Research Lab</SectionTitle>
              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <label style={lbl}>
                  Research Lab ID <span style={{ color: Colors.danger }}>*</span>
                </label>
                {labs.length > 0 ? (
                  <motion.select
                    value={selectedLabId}
                    onChange={e => setSelectedLabId(e.target.value)}
                    style={inp}
                    whileFocus={{ borderColor: Colors.accentGreen }}
                  >
                    <option value="">— Select a Research Lab —</option>
                    {labs.map(lab => (
                      <option key={lab._id} value={lab._id}>
                        {lab.labName} ({lab._id})
                      </option>
                    ))}
                  </motion.select>
                ) : (
                  <motion.input
                    type="text"
                    value={selectedLabId}
                    onChange={e => setSelectedLabId(e.target.value)}
                    placeholder="Paste MongoDB ObjectId of the ResearchLab (24 hex chars)"
                    style={inp}
                    whileFocus={{ borderColor: Colors.accentGreen }}
                  />
                )}
                <p style={{ fontSize: 11, color: Colors.textMuted, marginTop: 4 }}>
                  Must be a valid ResearchLab _id from the database.
                </p>
              </motion.div>

              {/* ── Basic Info ── */}
              <SectionTitle>Basic Information</SectionTitle>

              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                <label style={lbl}>Trial Title <span style={{ color: Colors.danger }}>*</span></label>
                <motion.input
                  required type="text" name="title"
                  value={formData.title} onChange={handleChange}
                  placeholder="e.g. Phase 2 Oncology Trial — Lung Cancer Treatment"
                  style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <label style={lbl}>Description <span style={{ color: Colors.danger }}>*</span></label>
                <motion.textarea
                  required name="description"
                  value={formData.description} onChange={handleChange}
                  placeholder="Describe the trial purpose, methodology, and expected outcomes..."
                  style={{ ...inp, minHeight: 110, resize: "vertical" }}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}>
                <label style={lbl}>Trial Phase <span style={{ color: Colors.danger }}>*</span></label>
                <motion.select name="trialPhase" value={formData.trialPhase} onChange={handleChange} style={inp}>
                  <option>Phase 1</option>
                  <option>Phase 2</option>
                  <option>Phase 3</option>
                  <option>Phase 4</option>
                </motion.select>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <label style={lbl}>Study Type</label>
                <motion.select name="studyType" value={formData.studyType} onChange={handleChange} style={inp}>
                  <option>Observational</option>
                  <option>Interventional</option>
                  <option>Expanded Access</option>
                </motion.select>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                <label style={lbl}>Initial Status</label>
                <motion.select name="status" value={formData.status} onChange={handleChange} style={inp}>
                  <option value="PLANNING">PLANNING</option>
                  <option value="OPEN">OPEN</option>
                  <option value="RECRUITING">RECRUITING</option>
                </motion.select>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                <label style={lbl}>Duration</label>
                <motion.input
                  type="text" name="duration"
                  value={formData.duration} onChange={handleChange}
                  placeholder="e.g. 6 months or 1 year" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              {/* ── Participants & Financials ── */}
              <SectionTitle>Participants &amp; Financials</SectionTitle>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                <label style={lbl}>Participant Limit <span style={{ color: Colors.danger }}>*</span></label>
                <motion.input
                  required type="number" name="participantLimit"
                  value={formData.participantLimit} onChange={handleChange}
                  placeholder="e.g. 100" style={inp} min="1"
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <label style={lbl}>Reward Amount (₹ / $)</label>
                <motion.input
                  type="number" name="rewardAmount"
                  value={formData.rewardAmount} onChange={handleChange}
                  placeholder="e.g. 5000" style={inp} min="0"
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
                <label style={lbl}>Doctor Commission (₹ / $)</label>
                <motion.input
                  type="number" name="doctorCommission"
                  value={formData.doctorCommission} onChange={handleChange}
                  placeholder="e.g. 1000" style={inp} min="0"
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              {/* ── Schedule ── */}
              <SectionTitle>Schedule</SectionTitle>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
                <label style={lbl}>Start Date <span style={{ color: Colors.danger }}>*</span></label>
                <motion.input
                  required type="date" name="startDate"
                  value={formData.startDate} onChange={handleChange} style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.65 }}>
                <label style={lbl}>End Date <span style={{ color: Colors.danger }}>*</span></label>
                <motion.input
                  required type="date" name="endDate"
                  value={formData.endDate} onChange={handleChange} style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              {/* ── Location ── */}
              <SectionTitle>Trial Location (Optional)</SectionTitle>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <label style={lbl}>City</label>
                <motion.input
                  type="text" name="city"
                  value={formData.city} onChange={handleChange}
                  placeholder="e.g. Mumbai" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}>
                <label style={lbl}>State</label>
                <motion.input
                  type="text" name="state"
                  value={formData.state} onChange={handleChange}
                  placeholder="e.g. Maharashtra" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                <label style={lbl}>Hospital / Facility</label>
                <motion.input
                  type="text" name="hospital"
                  value={formData.hospital} onChange={handleChange}
                  placeholder="e.g. AIIMS Delhi" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              {/* ── Eligibility & Objectives ── */}
              <SectionTitle>Eligibility &amp; Objectives</SectionTitle>

              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
                <label style={lbl}>Eligibility Summary</label>
                <motion.textarea
                  name="eligibilitySummary"
                  value={formData.eligibilitySummary} onChange={handleChange}
                  placeholder="Brief description of who qualifies for this trial..."
                  style={{ ...inp, minHeight: 80, resize: "vertical" }}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div style={{ gridColumn: "span 2" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                <label style={lbl}>
                  Objectives{" "}
                  <span style={{ fontSize: 11, fontWeight: 400, textTransform: "none" }}>
                    (one per line)
                  </span>
                </label>
                <motion.textarea
                  name="objectives"
                  value={formData.objectives} onChange={handleChange}
                  placeholder={"Evaluate safety of drug X\nMeasure efficacy in Stage 3 patients\nAssess quality of life changes"}
                  style={{ ...inp, minHeight: 90, resize: "vertical" }}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              {/* ── Contact ── */}
              <SectionTitle>Contact Information</SectionTitle>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.95 }}>
                <label style={lbl}>Contact Name</label>
                <motion.input
                  type="text" name="contactName"
                  value={formData.contactName} onChange={handleChange}
                  placeholder="Dr. Priya Sharma" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                <label style={lbl}>Contact Email</label>
                <motion.input
                  type="email" name="contactEmail"
                  value={formData.contactEmail} onChange={handleChange}
                  placeholder="contact@hospital.com" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.05 }}>
                <label style={lbl}>Contact Phone</label>
                <motion.input
                  type="tel" name="contactPhone"
                  value={formData.contactPhone} onChange={handleChange}
                  placeholder="+91 98765 43210" style={inp}
                  whileFocus={{ borderColor: Colors.accentGreen }}
                />
              </motion.div>
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-end gap-3 pt-6 border-t mt-7"
              style={{ borderColor: Colors.borderLight }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <motion.button
                type="button"
                onClick={() => setActiveTab("trials")}
                className="px-7 py-2.5 rounded-lg font-bold text-sm border transition-all"
                style={{
                  borderColor: Colors.borderLight,
                  color: Colors.deepGreen,
                  background: Colors.cardBg,
                }}
                whileHover={{ background: Colors.bg, transform: "translateY(-2px)" }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="px-9 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all"
                style={{
                  background: loading ? Colors.textMuted : Colors.deepGreen,
                  opacity: loading ? 0.7 : 1,
                }}
                whileHover={!loading ? { background: Colors.midGreen, transform: "translateY(-2px)" } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                {loading ? "Saving…" : <><Plus size={16} /> Save Trial</>}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
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

  const getStatusBadge = (status) => {
    const badges = {
      'APPROVED': { bg: `${Colors.success}15`, color: Colors.success },
      'REJECTED': { bg: `${Colors.danger}15`, color: Colors.danger },
      'DOCTOR_REVIEW': { bg: `${Colors.warning}15`, color: Colors.warning },
      'PENDING': { bg: `${Colors.info}15`, color: Colors.info }
    };
    return badges[status] || badges['PENDING'];
  };

  return (
    <motion.div className="space-y-8">
      <Reveal>
        <motion.h1 
          className="text-4xl font-black tracking-tight"
          style={{ color: Colors.deepGreen }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Trial Applications
        </motion.h1>
      </Reveal>

      <Reveal delay={100}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <motion.h2 
            className="text-2xl font-bold mb-4 tracking-tight"
            style={{ color: Colors.deepGreen }}
          >
            Recent Applications
          </motion.h2>
          <motion.div 
            className="rounded-xl border overflow-hidden"
            style={{
              background: Colors.cardBg,
              borderColor: Colors.borderLight,
            }}
          >
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: Colors.bg, borderBottom: `1px solid ${Colors.borderLight}` }}>
                  {["Patient", "Trial", "AI Match Score", "Date Applied", "Status", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider" style={{ color: Colors.textMuted }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((d, idx) => {
                  const badge = getStatusBadge(d.status);
                  return (
                    <motion.tr 
                      key={d.id} 
                      className="border-t transition-all"
                      style={{ borderColor: Colors.borderLight }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={{ backgroundColor: Colors.bg }}
                    >
                      <td className="px-6 py-4 font-bold text-sm" style={{ color: Colors.deepGreen }}>
                        {d.patient}
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>
                        {d.trial}
                      </td>
                      <td className="px-6 py-4 font-bold text-sm" style={{ color: Colors.accentGreen }}>
                        {(d.score * 100).toFixed(0)}%
                      </td>
                      <td className="px-6 py-4 text-sm" style={{ color: Colors.textMuted }}>
                        {d.date}
                      </td>
                      <td className="px-6 py-4">
                        <motion.span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold"
                          style={{
                            background: badge.bg,
                            color: badge.color,
                          }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {d.status}
                        </motion.span>
                      </td>
                      <td className="px-6 py-4">
                        <motion.button
                          className="px-3 py-1.5 rounded-lg border font-bold text-xs transition-all"
                          style={{
                            borderColor: Colors.accentGreen,
                            color: Colors.accentGreen,
                            background: "transparent",
                          }}
                          whileHover={{
                            background: Colors.accentGreen,
                            color: "white",
                            transform: "translateY(-2px)",
                          }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Review
                        </motion.button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </motion.div>
        </motion.div>
      </Reveal>
    </motion.div>
  );
}

// ─── ANALYSIS PANEL ───────────────────────────────────────────────────────────
function AnalysisPanel() {
  const [matchState, setMatchState] = useState('idle');
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [particles, setParticles] = useState([]);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const [expandedTab, setExpandedTab] = useState('why');

  const fireParticles = () => {
    const newParticles = Array.from({ length: 10 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 100,
      y: (Math.random() - 0.5) * 100 - 50,
      color: ['#00BFA6', '#FFFFFF', '#6366f1'][Math.floor(Math.random() * 3)],
      size: Math.random() * 4 + 3
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 700);
  };

  const handleRunMatch = async () => {
    fireParticles();
    setMatchState('loading');
    setResults(null);
    setErrorMsg(null);
    
    setActiveStep(1);
    setTimeout(() => setActiveStep(2), 700);
    setTimeout(() => setActiveStep(3), 1500);
    setTimeout(() => setActiveStep(4), 2500);
    
    try {
      const response = await fetch(`${AI_ENGINE_BASE}/reverse/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          criteriaText: "Match all available patients from the database against all clinical trials. Find best candidates for each trial.",
          filters: { minScore: 50, maxResults: 20 }
        })
      });

      if (!response.ok) throw new Error('Failed to connect to AI engine');
      const data = await response.json();
      
      setTimeout(() => {
        if (!data || !data.rankedPatients || data.rankedPatients.length === 0) {
          setMatchState('empty');
        } else {
          setMatchState('success_flash');
          setResults(data);
          setTimeout(() => {
            setMatchState('success');
          }, 1500);
        }
      }, 2500);
      
    } catch (err) {
      setTimeout(() => {
        setErrorMsg(err.message);
        setMatchState('error');
      }, 1000);
    }
  };

  const ParticleEffect = () => (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ 
            background: p.color, width: p.size, height: p.size,
            left: '50%', top: '50%', x: '-50%', y: '-50%'
          }}
          initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 0 }}
          animate={{ x: `calc(-50% + ${p.x}px)`, y: `calc(-50% + ${p.y}px)`, opacity: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      ))}
    </div>
  );

  const getScoreColor = (scoreStr) => {
    const score = parseFloat(scoreStr);
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const buttonGradient = "linear-gradient(90deg, #1a3c6e, #00BFA6, #6366f1, #1a3c6e)";
  const isCompact = matchState === 'success' || matchState === 'empty' || matchState === 'error';

  return (
    <motion.div className="space-y-8 flex flex-col items-center max-w-5xl mx-auto w-full pt-4 relative">
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes breathingShadow {
          0% { box-shadow: 0 0 20px rgba(0,191,166,0.3), 0 8px 32px rgba(26,60,110,0.4); }
          50% { box-shadow: 0 0 30px rgba(0,191,166,0.5), 0 12px 40px rgba(26,60,110,0.6); }
          100% { box-shadow: 0 0 20px rgba(0,191,166,0.3), 0 8px 32px rgba(26,60,110,0.4); }
        }
        .ai-button {
          background-image: ${buttonGradient};
          background-size: 300% 300%;
          animation: gradientShift 4s ease infinite, breathingShadow 2.5s ease-in-out infinite;
          border: 1.5px solid rgba(255,255,255,0.25);
          position: relative;
        }
        @media (prefers-reduced-motion: reduce) {
          .ai-button {
            animation: none;
            background-size: auto;
          }
        }
        .ai-button:hover:not(:disabled) {
          animation: gradientShift 2s ease infinite;
          box-shadow: 0 0 40px rgba(0,191,166,0.5), 0 16px 48px rgba(26,60,110,0.5) !important;
          transform: translateY(-4px);
        }
        .ai-button:active:not(:disabled) {
          transform: translateY(2px) scale(0.97);
          box-shadow: 0 0 15px rgba(0,191,166,0.4) !important;
        }
        .ai-button.loading {
          animation: gradientShift 6s ease infinite !important;
          opacity: 0.9;
        }
        .ai-button-success {
          background: #22c55e !important;
          animation: none !important;
          box-shadow: 0 0 20px rgba(34,197,94,0.4) !important;
        }
        .brain-icon {
          animation: pulseScale 2s ease-in-out infinite;
        }
        .arrow-icon {
          animation: floatFloat 1.5s ease-in-out infinite;
        }
        @keyframes pulseScale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes floatFloat {
          0%, 100% { transform: translateX(-3px); }
          50% { transform: translateX(3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .brain-icon, .arrow-icon, .ai-button:hover {
            animation: none;
            transform: none;
          }
        }
      `}</style>

      <Reveal className={isCompact ? "w-full flex justify-between items-center" : "text-center"}>
        <div>
          <motion.h1 
            className="text-4xl font-black tracking-tight"
            style={{ color: Colors.deepGreen }}
          >
            AI Match
          </motion.h1>
          <motion.p 
            className="text-sm font-medium mt-2"
            style={{ color: Colors.textMuted }}
          >
            Find the best patients for your clinical trials using AI
          </motion.p>
        </div>
        
        {isCompact && matchState !== 'success_flash' && (
          <motion.button
            onClick={handleRunMatch}
            className="ai-button rounded-xl flex items-center justify-center gap-2 overflow-hidden mx-auto md:mx-0 shrink-0"
            style={{ width: 140, height: 40 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <RefreshCw size={14} color="white" />
            <span className="text-sm font-bold text-white">Run Again</span>
          </motion.button>
        )}
      </Reveal>

      <AnimatePresence mode="wait">
        {!isCompact && (
          <motion.div
            key="big-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="w-full flex flex-col items-center mt-8"
          >
            <motion.button
              onClick={handleRunMatch}
              disabled={matchState === 'loading'}
              className={`ai-button rounded-[20px] flex items-center justify-between px-6 transition-all duration-300 ${matchState === 'loading' ? 'loading' : ''} ${matchState === 'success_flash' ? 'ai-button-success scale-105' : ''}`}
              style={{ width: 320, height: 80 }}
            >
              <ParticleEffect />
              
              {matchState === 'success_flash' ? (
                <div className="w-full flex justify-center text-white font-bold text-lg">
                  ✅ Match Complete!
                </div>
              ) : matchState === 'loading' ? (
                <>
                  <div className="flex items-center gap-1 w-[24px]">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-2 h-2 bg-white rounded-full" animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} />
                    ))}
                  </div>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-white font-bold text-base tracking-wide">Analyzing Patients...</span>
                    <span className="text-white/65 text-[10px] uppercase tracking-widest mt-0.5">••• working</span>
                  </div>
                  <div className="w-[24px] h-[24px]">
                    <div className="w-full h-full rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  </div>
                </>
              ) : (
                <>
                  <svg className="brain-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                  </svg>
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-white font-bold text-base tracking-wide">Run AI Patient Match</span>
                    <span className="text-white/65 text-[10px] uppercase tracking-widest mt-0.5" style={{ letterSpacing: '1.2px' }}>Powered by Clinerva AI Engine</span>
                  </div>
                  <Zap size={20} color="white" className="arrow-icon" />
                </>
              )}
            </motion.button>

            {matchState === 'loading' && (
              <motion.div 
                className="flex gap-2 mt-8 items-center bg-white px-4 py-2 rounded-full shadow-sm border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {[
                  { step: 1, text: "Loading patients" },
                  { step: 2, text: "Running rules" },
                  { step: 3, text: "ML scoring" },
                  { step: 4, text: "Done!" },
                ].map((s, i) => {
                  const isActive = activeStep === s.step;
                  const isDone = activeStep > s.step;
                  return (
                    <motion.div
                      key={s.step}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5`}
                      style={{
                        background: isDone ? Colors.success : isActive ? Colors.info : Colors.cardBg,
                        color: isDone || isActive ? 'white' : Colors.textMuted
                      }}
                      animate={isActive ? { scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] } : {}}
                      transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                    >
                      {isActive ? <Loader size={12} className="animate-spin" /> : isDone ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {s.text}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isCompact && matchState === 'success' && results && (
        <motion.div 
          className="w-full space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white border rounded-xl p-5 shadow-sm" style={{ borderColor: Colors.borderLight }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🎯</span>
              <h3 className="font-black text-lg" style={{ color: Colors.deepGreen }}>Match Complete</h3>
            </div>
            
            <div className="flex items-center gap-6 mb-4 pb-4 border-b" style={{ borderColor: Colors.borderLight }}>
              <div>
                <span className="text-xs font-bold uppercase" style={{ color: Colors.textMuted }}>Total Evaluated</span>
                <p className="text-xl font-black" style={{ color: Colors.deepGreen }}>{results.totalEvaluated || 0}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <span className="text-xs font-bold uppercase" style={{ color: Colors.textMuted }}>Matched</span>
                <p className="text-xl font-black" style={{ color: Colors.accentGreen }}>{results.eligibleCount || (results.rankedPatients ? results.rankedPatients.length : 0)}</p>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <div>
                <span className="text-xs font-bold uppercase" style={{ color: Colors.textMuted }}>Avg Score</span>
                <p className="text-xl font-black" style={{ color: Colors.info }}>
                  {results.rankedPatients && results.rankedPatients.length > 0 
                    ? Math.round(results.rankedPatients.reduce((acc, p) => acc + (p.confidenceScore || 0), 0) / results.rankedPatients.length) + '%'
                    : '—'}
                </p>
              </div>
            </div>

            <div className="flex gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 items-start">
              <span className="text-lg">💡</span>
              <p className="text-sm font-medium text-blue-900 leading-relaxed italic">
                "{results.summary?.insight || `Successfully matched ${results.rankedPatients?.length || 0} candidates across available trials.`}"
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(results.rankedPatients || []).map((patient, idx) => {
              const score = patient.confidenceScore?.toFixed(0) || '0';
              const sColor = getScoreColor(score);
              const isExpanded = expandedPatient === patient.patientId;

              return (
                <motion.div
                  key={patient.patientId || idx}
                  className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: Colors.borderLight }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-gray-100 text-gray-600">Rank #{idx + 1}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-black" style={{ color: sColor }}>{score}%</span>
                        <span className="text-xs font-bold" style={{ color: sColor }}>{patient.category || 'Match'}</span>
                      </div>
                    </div>

                    <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${score}%`, background: sColor }} />
                    </div>

                    <div className="mb-4">
                      <h4 className="font-black text-base flex items-center gap-2 mb-1" style={{ color: Colors.deepGreen }}>
                        👤 {patient.patientId || 'Unknown Patient'}
                      </h4>
                      <p className="text-sm font-medium" style={{ color: Colors.textMuted }}>
                        Age: {patient.patientDetails?.age || 'N/A'} | {patient.patientDetails?.gender || 'N/A'} | {patient.patient?.diagnosis || patient.patientDetails?.diagnosis || 'Various'}
                      </p>
                      <p className="text-sm font-medium" style={{ color: Colors.textMuted }}>
                        📍 {patient.patientDetails?.location || 'N/A'}
                      </p>
                    </div>

                    <div className="mb-4">
                      <span className="text-xs font-bold uppercase text-gray-400 mb-2 block">Matched For Trial</span>
                      <p className="text-sm font-bold text-gray-800">{patient.trialId || 'TRIAL'}</p>
                      <p className="text-xs font-medium text-gray-500 leading-tight mt-1">{patient.trialName}</p>
                    </div>

                    {patient.ruleResult?.matchedCriteria && patient.ruleResult.matchedCriteria.length > 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-bold uppercase text-gray-400 mb-1 block">Criteria Met:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {patient.ruleResult.matchedCriteria.slice(0, 3).map((crit, i) => (
                            <span key={i} className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                              ✅ {crit.split('_')[0]}
                            </span>
                          ))}
                          {patient.ruleResult.matchedCriteria.length > 3 && (
                            <span className="text-xs font-bold bg-gray-50 text-gray-600 px-2 py-1 rounded">
                              +{patient.ruleResult.matchedCriteria.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 bg-yellow-50 p-2.5 rounded border border-yellow-100 mb-4">
                      <span className="text-sm">💡</span>
                      <p className="text-xs font-medium text-yellow-800 italic leading-snug">
                        "{patient.ruleResult?.doctorExplanation || patient.matchReason || 'Strong candidate. Meets primary requirements.'}"
                      </p>
                    </div>

                    <button 
                      onClick={() => setExpandedPatient(isExpanded ? null : patient.patientId)}
                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-bold text-gray-700 transition"
                    >
                      {isExpanded ? 'Hide Details' : 'View Full Details'}
                    </button>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t bg-gray-50/50 overflow-hidden"
                        style={{ borderColor: Colors.borderLight }}
                      >
                        <div className="p-4 border-b flex gap-2 overflow-x-auto scrollbar-hide" style={{ borderColor: Colors.borderLight }}>
                          {['Why They Match', 'Criteria Breakdown', 'AI Analysis'].map((tabStr, ti) => {
                            const tabKey = ['why', 'criteria', 'ai'][ti];
                            return (
                              <button
                                key={tabKey}
                                onClick={() => setExpandedTab(tabKey)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${expandedTab === tabKey ? 'bg-white text-blue-700 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}
                              >
                                {tabStr}
                              </button>
                            );
                          })}
                        </div>
                        <div className="p-4 text-sm font-medium text-gray-600 leading-relaxed min-h-[120px]">
                          {expandedTab === 'why' && (
                            <div>
                              <p className="mb-2"><strong className="text-gray-800">Overview:</strong> {patient.ruleResult?.patientView?.overview || 'Patient matches primary inclusion criteria.'}</p>
                              <div className="mt-3">
                                <strong className="text-gray-800 block mb-1">Key Strengths:</strong>
                                <ul className="list-disc pl-4 space-y-1">
                                  {(patient.ruleResult?.patientView?.keyStrengths || ['Optimal age range', 'Verified diagnosis', 'Good location match']).map((str, i) => (
                                    <li key={i}>{str}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          )}
                          {expandedTab === 'criteria' && (
                            <div>
                              <strong className="text-gray-800 block mb-2">Rules Evaluated</strong>
                              <div className="space-y-2">
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-green-100">
                                  <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Included Factors</span>
                                  <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">{patient.ruleResult?.matchedCriteria?.length || 0} checks</span>
                                </div>
                                <div className="flex justify-between items-center bg-white p-2 rounded border border-red-100">
                                  <span className="flex items-center gap-1.5"><X size={14} className="text-red-500"/> Excluded Factors</span>
                                  <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded">{patient.ruleResult?.failedCriteria?.length || 0} hits</span>
                                </div>
                              </div>
                            </div>
                          )}
                          {expandedTab === 'ai' && (
                            <div>
                              <strong className="text-gray-800 block mb-2">ML Model Outputs</strong>
                              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(patient.scoreBreakdown || { model: "v2-clinical", certainty: 0.94 }, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {isCompact && matchState === 'empty' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full flex flex-col items-center justify-center p-12 bg-white rounded-xl border mt-8"
          style={{ borderColor: Colors.borderLight }}
        >
          <span className="text-6xl mb-4">🔬</span>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No patient matches found</h3>
          <p className="text-sm font-medium text-gray-500 text-center mb-6 max-w-sm">
            Try adjusting the matching criteria or adding more patient records to the database.
          </p>
          <button
            onClick={() => { setMatchState('idle'); setActiveStep(0); }}
            className="px-6 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition"
          >
            Run Again
          </button>
        </motion.div>
      )}

      {isCompact && matchState === 'error' && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md mx-auto p-6 bg-red-50 rounded-xl border border-red-100 mt-8 text-center"
        >
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={24} />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Connection Failed</h3>
          <p className="text-sm font-medium text-red-700/80 mb-6">
            {errorMsg || "Could not reach the AI engine."}<br/>
            Make sure server is on port 8000.
          </p>
          <button
            onClick={handleRunMatch}
            className="px-6 py-2.5 bg-red-100 text-red-800 hover:bg-red-200 font-bold rounded-lg transition"
          >
            Try Again
          </button>
        </motion.div>
      )}
    </motion.div>
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
    positive: { bg: `${Colors.success}10`, border: Colors.success, text: Colors.success, accent: Colors.success },
    warning: { bg: `${Colors.danger}10`, border: Colors.danger, text: Colors.danger, accent: Colors.danger },
    recommendation: { bg: `${Colors.info}10`, border: Colors.info, text: Colors.info, accent: Colors.info },
    observation: { bg: `${Colors.warning}10`, border: Colors.warning, text: Colors.warning, accent: Colors.warning },
  };

  const filters = ["all", "positive", "recommendation", "warning", "observation"];
  const filtered = filter === "all" ? insights : insights.filter(i => i.type === filter);

  return (
    <motion.div className="space-y-8">
      <Reveal>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: Colors.deepGreen }}>
            AI-Generated Insights
          </h1>
          <p className="text-sm font-medium mt-2" style={{ color: Colors.textMuted }}>
            Actionable patterns and correlations from your clinical data
          </p>
        </motion.div>
      </Reveal>

      {/* Filters */}
      <Reveal delay={60}>
        <motion.div 
          className="flex gap-2 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {filters.map(f => (
            <motion.button 
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all"
              style={{
                background: filter === f ? Colors.deepGreen : Colors.cardBg,
                color: filter === f ? "white" : Colors.deepGreen,
                border: filter === f ? "none" : `1.5px solid ${Colors.borderLight}`,
              }}
              whileHover={{ transform: "translateY(-2px)" }}
              whileTap={{ scale: 0.95 }}
            >
              {f === "all" ? "All Insights" : f}
            </motion.button>
          ))}
        </motion.div>
      </Reveal>

      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.08 }}
      >
        {filtered.map((insight, i) => {
          const Icon = insight.icon;
          const cfg = typeConfig[insight.type];
          return (
            <Reveal key={insight.id} delay={i * 70}>
              <motion.div
                className="rounded-xl p-6 border cursor-pointer transition-all flex gap-4"
                style={{
                  background: cfg.bg,
                  borderColor: cfg.border,
                }}
                whileHover={{
                  transform: "translateX(4px)",
                  boxShadow: `0 8px 20px ${cfg.accent}25`,
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <motion.div 
                  className="p-3 rounded-lg flex-shrink-0"
                  style={{
                    background: `${cfg.accent}15`,
                  }}
                  whileHover={{ scale: 1.1 }}
                >
                  <Icon size={20} color={cfg.accent} />
                </motion.div>
                <div className="flex-1">
                  <p className="font-bold text-sm mb-2" style={{ color: cfg.text }}>
                    {insight.title}
                  </p>
                  <p className="text-xs font-medium leading-relaxed mb-2" style={{ color: cfg.text, opacity: 0.85 }}>
                    {insight.description}
                  </p>
                  <p className="text-xs" style={{ color: cfg.text, opacity: 0.6 }}>
                    {insight.timestamp}
                  </p>
                </div>
                <motion.button
                  className="flex-shrink-0 px-4 py-2 rounded-lg font-bold text-xs text-white transition-all"
                  style={{ background: cfg.accent }}
                  whileHover={{ opacity: 0.85, transform: "translateY(-2px)" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </Reveal>
          );
        })}
      </motion.div>
    </motion.div>
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
    <motion.div className="space-y-8">
      <Reveal>
        <motion.h1 
          className="text-4xl font-black tracking-tight"
          style={{ color: Colors.deepGreen }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Trial Reports
        </motion.h1>
      </Reveal>

      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.08 }}
      >
        {reports.map((r, i) => (
          <Reveal key={r.id} delay={i * 80}>
            <motion.div
              onClick={() => setSelected(selected?.id === r.id ? null : r)}
              className="rounded-xl p-6 border cursor-pointer transition-all"
              style={{
                background: selected?.id === r.id ? `${Colors.accentGreen}08` : Colors.cardBg,
                borderColor: selected?.id === r.id ? Colors.accentGreen : Colors.borderLight,
              }}
              whileHover={selected?.id !== r.id ? {
                borderColor: Colors.accentGreen,
                boxShadow: `0 6px 16px ${Colors.accentGreen}15`,
              } : {}}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <BarChart3 size={18} style={{ color: Colors.deepGreen }} />
                    <p className="font-bold text-sm" style={{ color: Colors.deepGreen }}>
                      {r.title}
                    </p>
                  </div>
                  <p className="text-xs font-medium mb-4" style={{ color: Colors.textMuted }}>
                    {r.summary}
                  </p>
                  <div className="flex gap-6">
                    {[["findings", r.findings, "Key Findings"], ["charts", r.charts, "Charts"], ["pages", r.pages, "Pages"]].map(([k, v, lbl]) => (
                      <div key={k} className="text-xs" style={{ color: Colors.textMuted }}>
                        <span className="font-bold" style={{ color: Colors.deepGreen }}>
                          {v}
                        </span>{" "}
                        {lbl}
                      </div>
                    ))}
                  </div>
                </div>
                <motion.div 
                  className="flex flex-col items-end gap-2 flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06 + 0.1 }}
                >
                  <motion.span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: `${Colors.success}15`,
                      color: Colors.success,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <CheckCircle2 size={12} />
                    Complete
                  </motion.span>
                  <span className="text-xs" style={{ color: Colors.textMuted }}>
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </Reveal>
        ))}
      </motion.div>

      <AnimatePresence>
        {selected && (
          <Reveal direction="up">
            <motion.div
              className="rounded-2xl p-8 border"
              style={{
                background: Colors.cardBg,
                borderColor: Colors.borderLight,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex justify-between items-start gap-4 mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div>
                  <h3 className="text-2xl font-black mb-1 tracking-tight" style={{ color: Colors.deepGreen }}>
                    {selected.title}
                  </h3>
                  <p className="text-sm font-medium" style={{ color: Colors.textMuted }}>
                    Generated on {new Date(selected.date).toLocaleDateString()}
                  </p>
                </div>
                <motion.div 
                  className="flex gap-2 flex-shrink-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {[{ icon: <Download size={15} />, label: "Export PDF", primary: true }, { icon: <Download size={15} />, label: "CSV", primary: false }, { icon: <Share2 size={15} />, label: "Share", primary: false }].map(btn => (
                    <motion.button
                      key={btn.label}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all"
                      style={{
                        background: btn.primary ? Colors.deepGreen : Colors.bg,
                        color: btn.primary ? "white" : Colors.deepGreen,
                        border: btn.primary ? "none" : `1.5px solid ${Colors.borderLight}`,
                      }}
                      whileHover={{
                        background: btn.primary ? Colors.midGreen : Colors.cardBg,
                        transform: "translateY(-2px)",
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {btn.icon}
                      {btn.label}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>

              <motion.div
                className="border-t pt-6"
                style={{ borderColor: Colors.borderLight }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[["Key Findings", selected.findings], ["Charts", selected.charts], ["Pages", selected.pages], ["Status", "✓ Complete"]].map(([lbl, val]) => (
                    <motion.div
                      key={lbl}
                      className="rounded-lg p-4"
                      style={{ background: Colors.bg }}
                      whileHover={{ backgroundColor: `${Colors.accentGreen}10` }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: Colors.textMuted }}>
                        {lbl}
                      </p>
                      <p className="text-2xl font-black" style={{ color: Colors.deepGreen }}>
                        {val}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <motion.h4 
                  className="font-bold text-sm mb-4 tracking-tight"
                  style={{ color: Colors.deepGreen }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                >
                  Key Findings
                </motion.h4>
                <motion.div 
                  className="space-y-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.06, delay: 0.3 }}
                >
                  {findings.map((f, i) => (
                    <Reveal key={i} delay={i * 60} direction="left">
                      <motion.div
                        className="flex items-start gap-3 p-4 rounded-lg border"
                        style={{
                          background: `${Colors.success}08`,
                          borderColor: `${Colors.success}20`,
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        whileHover={{ backgroundColor: `${Colors.success}15` }}
                      >
                        <CheckCircle2 size={18} style={{ color: Colors.success, flexShrink: 0, marginTop: 2 }} />
                        <p className="text-sm leading-relaxed" style={{ color: Colors.deepGreen }}>
                          {f}
                        </p>
                      </motion.div>
                    </Reveal>
                  ))}
                </motion.div>
              </motion.div>
            </motion.div>
          </Reveal>
        )}
      </AnimatePresence>

      {!selected && (
        <Reveal>
          <motion.div
            className="rounded-xl border-2 border-dashed p-12 text-center"
            style={{
              background: Colors.bg,
              borderColor: Colors.borderLight,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <FileText size={40} style={{ color: Colors.textMuted, margin: "0 auto 12px" }} />
            <p className="font-bold text-sm" style={{ color: Colors.textMuted }}>
              Select a report to view details
            </p>
            <p className="text-xs font-medium mt-2" style={{ color: Colors.textMuted, opacity: 0.7 }}>
              Click any report above to explore findings and export options
            </p>
          </motion.div>
        </Reveal>
      )}
    </motion.div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Researcher() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
    <div style={{ display: "flex", height: "100vh", background: Colors.bg, fontFamily: "'DM Sans', system-ui, sans-serif", overflow: "hidden" }} onClick={() => userMenuOpen && setUserMenuOpen(false)}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        onLogout={handleLogout}
      />

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
        ::-webkit-scrollbar-thumb { background: ${Colors.accentGreen}; border-radius: 99px; }
      `}</style>
    </div>
  );
}
