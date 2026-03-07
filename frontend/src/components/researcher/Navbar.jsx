import { Bell, ChevronDown, User } from 'lucide-react';

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

function Navbar({ activeTab, setActiveTab, userMenuOpen, setUserMenuOpen }) 
// Navbar removed. Profile and notification will be placed in Sidebar.
