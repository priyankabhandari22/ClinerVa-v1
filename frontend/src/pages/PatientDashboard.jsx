import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import HealthProfile from '../components/HealthProfile';
import ProfileImageUploader from '../components/ProfileImageUploader';
import AIMatchPanel from '../components/AIMatchPanel';
import AnimatedFindButton from '../components/AnimatedFindButton';
import {
  LogOut, UserCircle, Activity, FileText, ChevronRight,
  LayoutDashboard, Brain, MapPin, Bookmark, Bell, Settings,
  HeartPulse, Loader2, Sparkles, Wifi, WifiOff,
  ChevronDown, ChevronUp, AlertCircle, PlayCircle, Info,
  Download, BookmarkPlus,CheckCircle2 ,Filter,Search,Building2
} from 'lucide-react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { logout, user, getAvatarUrl } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState('online');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [medicalData, setMedicalData] = useState(null);
  const [showMedicalModal, setShowMedicalModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [previewStats, setPreviewStats] = useState(null);
  const [matchResults, setMatchResults] = useState([]);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [lastSearch, setLastSearch] = useState('');
  const [savedTrials, setSavedTrials] = useState([]);
  const [isSavingTrial, setIsSavingTrial] = useState({});
  const [toastMessage, setToastMessage] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const [locationFilter, setLocationFilter] = useState('Anywhere (Remote/Travel)');
  const [minScoreFilter, setMinScoreFilter] = useState(50);
  const [phaseFilters, setPhaseFilters] = useState(['Phase II', 'Phase III']);

  const handleSaveMedicalInfo = async (formData) => {
    try {
      const token = localStorage.getItem('clinerva_token');
      const response = await fetch('http://localhost:5000/api/patients/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const data = await response.json();
        if (data.patient) setMedicalData(data.patient);
        setShowMedicalModal(false);
      } else {
        console.error('Failed to save medical info');
      }
    } catch (error) {
      console.error('Error saving medical info:', error);
    }
  };

  useEffect(() => {
    let interval;
    if (isLoadingMatch) {
      setLoadingStep(1);
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < 4 ? prev + 1 : prev));
      }, 800);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoadingMatch]);

  const handleFindTrials = async () => {
    setHasSearched(true);
    setError(null);

    if (!medicalData) {
      return;
    }

    setIsLoadingMatch(true);
    setMatchResults(null);

    try {
      const response = await fetch('http://localhost:8080/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: {
            name: user?.name || "Anonymous",
            email: user?.email || "",
            age: medicalData?.age ? Number(medicalData.age) : 0,
            gender: medicalData?.gender || "",
            diagnosis: medicalData?.diagnosis || "",
            medications: Array.isArray(medicalData?.medications) ? medicalData.medications : [],
            labResults: {
              HbA1c: medicalData?.labResults?.HbA1c ? parseFloat(medicalData.labResults.HbA1c) || 0 : 0,
              eGFR: medicalData?.labResults?.eGFR ? parseFloat(medicalData.labResults.eGFR) || 0 : 0
            },
            smokingStatus: medicalData?.smokingStatus || "Unknown",
            surgicalHistory: medicalData?.surgicalHistory || "None",
            location: medicalData?.location || ""
          }
        })
      });

      if (!response.ok) throw new Error("Server error");
      
      const data = await response.json();
      setMatchResults(data);
    } catch (err) {
      setError("Could not connect to matching engine. Make sure the server is running.");
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const toggleCardExpansion = (id) => {
    setExpandedCardId(prev => prev === id ? null : id);
  };

  const [expandedTab, setExpandedTab] = useState({});
  const setTab = (cardId, tabName) => {
    setExpandedTab(prev => ({ ...prev, [cardId]: tabName }));
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-blue-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };
  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const filteredResults = (matchResults?.rankedResults || []).filter(trial => {
    if (trial.confidenceScore < minScoreFilter) return false;
    if (phaseFilters.length > 0 && !phaseFilters.includes(trial.phase)) return false;
    return true;
  });

  const displayedResults = filteredResults.slice(0, visibleCount);

  const handleExportCSV = () => {
    if (!filteredResults.length) return;
    const headers = ['Rank', 'Trial Name', 'Score', 'Location', 'Category'];
    const rows = filteredResults.map((r, i) => [
      i + 1,
      `"${r.trial?.title?.replace(/"/g, '""') || 'Unknown Title'}"`,
      r.confidenceScore,
      `"${r.trial?.locations?.[0]?.city || 'Multi-site'}"`,
      `"${r.trial?.condition || 'Various'}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "matched_trials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveTrial = async (trial) => {
    // If already saved, do nothing
    if (savedTrials.some(st => st.trialId === trial.trialId)) return;

    setIsSavingTrial(prev => ({ ...prev, [trial.trialId]: true }));
    try {
      const token = localStorage.getItem('clinerva_token');
      const response = await fetch('http://localhost:5000/api/patients/saved-trials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(trial)
      });
      
      const data = await response.json();
      if (response.ok) {
        if (!data.alreadySaved) {
          setSavedTrials(prev => [data.savedTrial, ...prev]);
        }
        setToastMessage("✅ Trial saved to your Trial Matches!");
      } else {
        setToastMessage("❌ Failed to save trial");
      }
    } catch (error) {
      console.error('Error saving trial:', error);
      setToastMessage("❌ Failed to save trial");
    } finally {
      setIsSavingTrial(prev => ({ ...prev, [trial.trialId]: false }));
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleRemoveSavedTrial = async (trialId) => {
    if (!window.confirm("Remove this trial from saved?")) return;

    try {
      const token = localStorage.getItem('clinerva_token');
      const response = await fetch(`http://localhost:5000/api/patients/saved-trials/${trialId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setSavedTrials(prev => prev.filter(t => t.trialId !== trialId));
        if (expandedCardId === trialId) setExpandedCardId(null);
        setToastMessage("🗑 Trial removed!");
      }
    } catch (error) {
      console.error('Error removing trial:', error);
      setToastMessage("❌ Failed to remove trial");
    } finally {
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handlePhaseToggle = (phase) => {
    setPhaseFilters(prev => 
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  // Fetch patient profile and saved trials on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('clinerva_token');
        if (!token) return;

        const [profileRes, savedRes] = await Promise.all([
          fetch('http://localhost:5000/api/patients/profile/me', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          fetch('http://localhost:5000/api/patients/saved-trials', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const profileData = await profileRes.json();
        if (profileData.patient) {
          setMedicalData(profileData.patient);
        }

        const savedData = await savedRes.json();
        if (savedData.savedTrials) {
          setSavedTrials(savedData.savedTrials);
        }

      } catch (error) {
        console.error('Error fetching patient data:', error);
      }
    };
    fetchData();
  }, []);

  // Simulate dashboard data fetching
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F0F9F4]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-[#2E7D5C] animate-spin" />
          <p className="text-[#1B5E3A] font-medium">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'My Health Profile', icon: FileText },
    { name: 'Trial Matches', icon: Brain },
    { name: 'Nearby Clinical Trials', icon: MapPin },
    { name: 'Saved Trials', icon: Bookmark },
    { name: 'Notifications', icon: Bell },
    { name: 'Profile', icon: UserCircle },
    { name: 'Settings', icon: Settings },
  ];

  const trialMatches = [
    {
      id: 'T-8842', name: 'Advanced Immunotherapy for Solid Tumors',
      condition: 'Non-Small Cell Lung Cancer', score: 98,
      location: 'San Francisco, CA (12 miles)', hospital: 'UCSF Medical Center',
      phase: 'Phase II', status: 'Recruiting', ageGroup: '18-65',
    },
    {
      id: 'T-3190', name: 'Targeted Therapy with T-Cell Engagement',
      condition: 'Metastatic Melanoma', score: 94,
      location: 'Stanford, CA (28 miles)', hospital: 'Stanford Health Care',
      phase: 'Phase III', status: 'Recruiting', ageGroup: 'Adults',
    },
    {
      id: 'T-1055', name: 'Combination Therapy Clinical Study',
      condition: 'Advanced Solid Tumors', score: 87,
      location: 'Los Angeles, CA', hospital: 'UCLA Medical Center',
      phase: 'Phase I/II', status: 'Active, not recruiting', ageGroup: '18+',
    },
  ];

  const DEMO_PATIENT_ID = user?.patientId || null;
  const DEMO_TRIAL_ID = null;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center space-x-2 animate-in slide-in-from-top-4 duration-300">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-[#A8D5BA]/30 flex flex-col z-20 sticky top-0 h-screen hidden lg:flex shadow-xl shadow-[#2E7D5C]/5">
        {/* Brand */}
        <div className="p-6 border-b border-[#A8D5BA]/20 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#2E7D5C] text-white rounded-xl flex items-center justify-center shadow-md shadow-[#2E7D5C]/30">
            <UserCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">Clinerva Patient</span>
        </div>

        {/* AI status chip */}
        {/* <div className="mx-4 mt-3 mb-1">
          {aiStatus && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${aiStatus === 'online'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
              }`}>
              {aiStatus === 'online'
                ? <><Wifi className="w-3 h-3" /> GPT-4o AI Online</>
                : <><WifiOff className="w-3 h-3" /> AI Offline</>}
            </div>
          )}
        </div> */}

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.name
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
              {activeTab === item.name && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600" />}
            </button>
          ))}

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3 px-3">Account</p>
          {navItems.slice(5).map((item) => (
            <button
              key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.name
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
              {item.name === 'Notifications' && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">3</span>
              )}
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-[#A8D5BA]/20 mt-auto">
          <button onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all group">
            <LogOut className="w-5 h-5 text-rose-400 group-hover:text-rose-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-[#A8D5BA]/20 px-6 sm:px-8 py-4 flex items-center justify-between z-10 sticky top-0 shadow-sm shadow-[#2E7D5C]/5">
          <h2 className="text-xl font-bold text-[#1B5E3A]">{activeTab}</h2>
          <div className="flex items-center space-x-4 pl-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-bold text-[#1B5E3A]">{user?.name || 'Patient'}</span>
              <span className="text-xs font-semibold text-[#2E7D5C] capitalize">{user?.role || 'patient'}</span>
            </div>
            <div className="w-10 h-10 rounded-full overflow-hidden shadow-md shadow-[#2E7D5C]/20 bg-gradient-to-tr from-[#2E7D5C] to-[#6BBF8A] p-0.5">
              <img src={getAvatarUrl()} alt={user?.name} className="w-full h-full object-cover rounded-full bg-white" />
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'Dashboard' ? (
            // ── FIX 1: Wrapped in a single <div> to close properly ──────
            <div>
              <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#1B5E3A] tracking-tight">Your Health Journey</h1>
                  <p className="text-[#1B5E3A]/60 mt-2 text-lg font-medium">AI-powered trial matching based on your unique medical profile.</p>
                </div>
                <button onClick={() => setShowMedicalModal(true)} className="bg-white text-[#2E7D5C] border border-[#2E7D5C]/20 px-5 py-2.5 rounded-xl font-bold hover:bg-[#F0F9F4] transition-colors shadow-sm flex items-center space-x-2 w-fit">
                  <FileText className="w-5 h-5" />
                  <span>Update Medical Info</span>
                </button>
              </div>

              {/* Top KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-[#A8D5BA]/30 shadow-sm shadow-[#2E7D5C]/5 flex flex-col justify-between hover:shadow-md hover:border-[#A8D5BA] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F9F4] text-[#2E7D5C] flex items-center justify-center">
                      <HeartPulse className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-[#2E7D5C] bg-[#A8D5BA]/20 px-2 py-1 rounded-md">+2 this week</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B5E3A]/60">Recommended Trials</p>
                    <p className="text-3xl font-extrabold text-[#1B5E3A]">14</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#A8D5BA]/30 shadow-sm shadow-[#2E7D5C]/5 flex flex-col justify-between hover:shadow-md hover:border-[#A8D5BA] transition-all relative overflow-hidden">
                  <div className="absolute right-[-10px] bottom-[-10px] text-[#2E7D5C]/5">
                    <CheckCircle2 className="w-32 h-32" />
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F9F4] text-[#2E7D5C] flex items-center justify-center">
                      <Brain className="w-6 h-6" />
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="text-sm font-bold text-[#1B5E3A]/60">Highest Match %</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-extrabold text-[#2E7D5C]">98%</p>
                      <span className="text-sm font-medium text-[#1B5E3A]/50">Accuracy</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-[#A8D5BA]/30 shadow-sm shadow-[#2E7D5C]/5 flex flex-col justify-between hover:shadow-md hover:border-[#A8D5BA] transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#F0F9F4] text-[#2E7D5C] flex items-center justify-center">
                      <MapPin className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#1B5E3A]/60">Nearby Trials</p>
                    <p className="text-3xl font-extrabold text-[#1B5E3A]">6</p>
                    <p className="text-xs font-medium text-[#1B5E3A]/50 mt-1">Within 50 miles</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-[#2E7D5C] to-[#1B5E3A] text-white p-6 rounded-2xl border-none shadow-lg shadow-[#2E7D5C]/20 flex flex-col justify-between hover:shadow-xl hover:shadow-[#2E7D5C]/30 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm shadow-inner">
                      <Activity className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#A8D5BA]">Application Status</p>
                    <p className="text-3xl font-extrabold text-white">Pending</p>
                    <p className="text-xs font-medium text-[#A8D5BA]/80 mt-1">Trial T-8842</p>
                  </div>
                </div>
              </div>

              {/* Main Content: Filters + Trial Cards */}
              <div className="flex flex-col xl:flex-row gap-8">

                {/* Filter Sidebar */}
                <div className="xl:w-64 shrink-0">
                  <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-[#A8D5BA]/30 shadow-sm p-5 sticky top-28 shadow-[#2E7D5C]/5">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-bold text-[#1B5E3A] flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-[#2E7D5C]" />
                        <span>Filters</span>
                      </h3>
                      <button className="text-xs font-bold text-[#6BBF8A] hover:text-[#2E7D5C]">Clear</button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-[#1B5E3A]/80 mb-2">Location / Distance</label>
                        <select 
                          value={locationFilter} 
                          onChange={(e) => {
                            setLocationFilter(e.target.value);
                            if (searchText && hasSearched) handleFindTrials(e.target.value);
                          }}
                          className="w-full bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1B5E3A] focus:outline-none focus:border-[#2E7D5C] focus:ring-1 focus:ring-[#2E7D5C]/30 transition-all"
                        >
                          <option>Within 25 Miles</option>
                          <option>Within 50 Miles</option>
                          <option>Within 100 Miles</option>
                          <option>Anywhere (Remote/Travel)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#1B5E3A]/80 mb-2">Minimum Match Score: {minScoreFilter}%</label>
                        <input 
                          type="range" 
                          min="0" max="100" 
                          value={minScoreFilter}
                          onChange={(e) => setMinScoreFilter(Number(e.target.value))}
                          className="w-full accent-[#2E7D5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#1B5E3A]/80 mb-2">Disease / Condition</label>
                        <select className="w-full bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1B5E3A] focus:outline-none focus:border-[#2E7D5C] focus:ring-1 focus:ring-[#2E7D5C]/30 transition-all">
                          <option>All My Conditions</option>
                          <option>Non-Small Cell Lung Cancer</option>
                          <option>Asthma</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#1B5E3A]/80 mb-2">Trial Phase</label>
                        <div className="space-y-2">
                          {['Phase I', 'Phase II', 'Phase III', 'Phase IV'].map(phase => (
                            <label key={phase} className="flex items-center space-x-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="rounded text-[#2E7D5C] focus:ring-[#2E7D5C] w-4 h-4 border-[#A8D5BA] bg-[#F0F9F4]/50" 
                                checked={phaseFilters.includes(phase)}
                                onChange={() => handlePhaseToggle(phase)}
                              />
                              <span className="text-sm font-medium text-[#1B5E3A]/70">{phase}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-[#1B5E3A]/80 mb-2">Age Group</label>
                        <select className="w-full bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl px-3 py-2.5 text-sm font-medium text-[#1B5E3A] focus:outline-none focus:border-[#2E7D5C] focus:ring-1 focus:ring-[#2E7D5C]/30 transition-all">
                          <option>Adults (18-65)</option>
                          <option>Seniors (65+)</option>
                          <option>Pediatric (0-17)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Search Section */}
                <div className="flex-1 space-y-8">
                  {/* Main Action Button */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex justify-center w-full">
                    <AnimatedFindButton 
                      onClick={handleFindTrials} 
                      isLoading={isLoadingMatch}
                      hasSearched={hasSearched}
                      resultsCount={matchResults ? matchResults.length : 0}
                    />
                  </div>

                  {/* Warning: Missing Profile */}
                  {hasSearched && !medicalData && !isLoadingMatch && (
                    <div className="bg-[#FFF8E7] border-l-4 border-[#F59E0B] p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start space-x-3 text-[#B45309]">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-lg">⚠️ Please complete your health profile first</h4>
                          <p className="text-sm font-medium mt-1 text-[#D97706]">We need your medical information to find matching clinical trials.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab('Profile')}
                        className="bg-[#FDE68A] hover:bg-[#FCD34D] text-[#92400E] border border-[#F59E0B]/30 rounded-lg px-6 py-2.5 font-bold transition-colors whitespace-nowrap shadow-sm"
                      >
                        Complete Profile
                      </button>
                    </div>
                  )}

                  {/* Error State */}
                  {hasSearched && error && !isLoadingMatch && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-start space-x-3 text-red-800">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-lg">⚠️ Could not connect to matching engine.</h4>
                          <p className="text-sm font-medium mt-1">Make sure the server is running.</p>
                        </div>
                      </div>
                      <button 
                        onClick={handleFindTrials}
                        className="bg-red-100 hover:bg-red-200 text-red-900 border border-red-300 rounded-lg px-6 py-2.5 font-bold transition-colors whitespace-nowrap"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Loading State Skeletons */}
                  {isLoadingMatch && (
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border border-[#A8D5BA]/30 rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row gap-6 animate-pulse">
                          <div className="flex-1 space-y-4">
                            <div className="w-32 h-6 bg-[#A8D5BA]/20 rounded-full"></div>
                            <div className="w-3/4 h-8 bg-[#A8D5BA]/30 rounded-lg"></div>
                            <div className="w-1/2 h-4 bg-[#A8D5BA]/20 rounded"></div>
                            <div className="w-full h-24 bg-[#F0F9F4] rounded-xl mt-4"></div>
                          </div>
                          <div className="flex flex-col space-y-3 justify-center lg:w-48 shrink-0">
                            <div className="h-12 bg-[#A8D5BA]/20 rounded-xl"></div>
                            <div className="h-12 bg-[#A8D5BA]/20 rounded-xl"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Results State */}
                  {hasSearched && matchResults?.eligibleCount > 0 && !isLoadingMatch && !error && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-[#1B5E3A] flex items-center space-x-2">
                          <span>🎯 Top Match Results</span>
                          <span className="bg-[#A8D5BA]/30 text-[#2E7D5C] px-3 py-1 rounded-full text-sm font-extrabold">{matchResults.eligibleCount} found</span>
                        </h3>
                        <button onClick={handleFindTrials} className="text-[#2E7D5C] hover:text-[#1B5E3A] font-bold text-sm bg-[#A8D5BA]/20 hover:bg-[#A8D5BA]/40 px-4 py-2 rounded-lg transition-colors">
                          Search Again
                        </button>
                      </div>

                      <div className="space-y-6">
                        {(matchResults?.rankedResults || []).map((trial) => {
                          const scoreColorClass = trial.confidenceScore >= 90 ? 'text-emerald-600' : trial.confidenceScore >= 70 ? 'text-blue-600' : trial.confidenceScore >= 50 ? 'text-amber-500' : 'text-red-500';
                          const categoryColorClass = trial.confidenceScore >= 90 ? 'text-emerald-700' : trial.confidenceScore >= 70 ? 'text-blue-700' : trial.confidenceScore >= 50 ? 'text-amber-700' : 'text-red-700';

                          const isExpanded = expandedCardId === trial.trialId;
                          const activeCardTab = expandedTab[trial.trialId] || 'Why You Match';

                          return (
                            <div key={trial.trialId} className={`bg-white border ${isExpanded ? 'border-[#6BBF8A] ring-2 ring-[#a8d5ba]/50' : 'border-[#A8D5BA]/30 hover:shadow-lg hover:border-[#6BBF8A]/50'} rounded-2xl transition-all shadow-sm shadow-[#2E7D5C]/5 relative overflow-hidden`}>
                              {/* Main Card Header (Always Visible) */}
                              <div 
                                className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6 cursor-pointer group"
                                onClick={() => toggleCardExpansion(trial.trialId)}
                              >
                                {/* Left Match Score Column */}
                                <div className="flex flex-col items-center justify-center lg:w-40 shrink-0 border-b lg:border-b-0 lg:border-r border-[#A8D5BA]/20 pb-6 lg:pb-0 lg:pr-6">
                                  <span className="text-[#1B5E3A]/50 font-bold uppercase tracking-widest text-xs mb-2">Rank #{trial.rank}</span>
                                  <span className={`text-5xl font-extrabold tracking-tighter ${scoreColorClass}`}>
                                    {parseInt(trial.confidenceScore)}%
                                  </span>
                                  <span className={`mt-3 font-bold text-sm text-center ${categoryColorClass}`}>
                                    {trial.category}
                                  </span>
                                </div>

                                {/* Center Content Component */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-2xl font-bold text-[#1B5E3A] mb-2 leading-tight group-hover:text-[#2E7D5C] transition-colors">
                                    {trial.trialName}
                                  </h4>
                                  <div className="flex flex-wrap items-center text-sm font-medium text-[#1B5E3A]/70 mb-2 gap-x-4 gap-y-2">
                                    <span className="bg-[#F0F9F4] text-[#2E7D5C] border border-[#A8D5BA]/30 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Phase {trial.phase}</span>
                                    <span className="text-[#A8D5BA]/50">•</span>
                                    <span className="flex items-center space-x-1"><MapPin className="w-4 h-4" /> <span>{trial.location}</span></span>
                                    <span className="text-[#A8D5BA]/50">•</span>
                                    <span className="flex items-center space-x-1"><Building2 className="w-4 h-4" /> <span>{trial.sponsor}</span></span>
                                  </div>
                                </div>

                                {/* Right Action Column */}
                                <div className="flex flex-col space-y-3 justify-center lg:w-48 shrink-0 lg:border-l border-[#A8D5BA]/20 pt-6 lg:pt-0 lg:pl-6 relative">
                                  <button onClick={(e) => { e.stopPropagation(); /* apply logic */ }} className="w-full bg-[#2E7D5C] hover:bg-[#1B5E3A] text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-[#2E7D5C]/30 transition-all active:scale-[0.98]">
                                    Apply for Trial
                                  </button>
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleSaveTrial(trial); }}
                                    disabled={savedTrials.some(st => st.trialId === trial.trialId) || isSavingTrial[trial.trialId]}
                                    className={`w-full py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2 border disabled:cursor-not-allowed ${savedTrials.some(st => st.trialId === trial.trialId) ? 'bg-[#A8D5BA]/20 text-[#2E7D5C] border-[#A8D5BA]/40' : 'bg-white text-[#1B5E3A]/80 border-[#A8D5BA]/40 hover:bg-[#F0F9F4] hover:border-[#6BBF8A] group/save'}`}
                                  >
                                    {isSavingTrial[trial.trialId] ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-[#6BBF8A]" />
                                    ) : (
                                      <BookmarkPlus className={`w-4 h-4 ${savedTrials.some(st => st.trialId === trial.trialId) ? '' : 'text-[#6BBF8A] group-hover/save:text-[#2E7D5C]'}`} />
                                    )}
                                    <span>{savedTrials.some(st => st.trialId === trial.trialId) ? 'Saved' :isSavingTrial[trial.trialId] ? 'Saving...' : 'Save Trial'}</span>
                                  </button>
                                  
                                  <div className="absolute -bottom-2 -right-2 lg:bottom-0 lg:right-0 flex items-center justify-center p-2 text-[#A8D5BA] group-hover:text-[#2E7D5C] transition-colors">
                                    {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                                  </div>
                                </div>
                              </div>

                              {/* Expanded Content Section */}
                              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 border-t border-slate-100 bg-slate-50/50' : 'max-h-0 opacity-0'}`}>
                                <div className="p-6 lg:p-8">
                                  {/* Top Trial Info Strip */}
                                  <div className="bg-white/50 backdrop-blur-sm border border-[#A8D5BA]/30 rounded-xl p-4 mb-6 flex flex-wrap items-center text-sm font-medium text-[#1B5E3A]/70 gap-x-6 gap-y-2">
                                    <span className="font-bold text-[#1B5E3A]">[Phase {trial.phase}]</span>
                                    <span className="text-[#2E7D5C] font-bold flex items-center"><span className="w-2 h-2 rounded-full bg-[#6BBF8A] mr-2 animate-pulse"></span> Recruiting</span>
                                    <span>[{trial.location}]</span>
                                    <span className="text-[#A8D5BA]/50">|</span>
                                    <span>Sponsor: <span className="font-bold text-[#1B5E3A]">{trial.sponsor}</span></span>
                                    <span className="text-[#A8D5BA]/50">|</span>
                                    <span>Trial ID: <span className="font-bold text-[#1B5E3A]">{trial.trialId}</span></span>
                                  </div>

                                  {/* Tabs Navigation */}
                                  <div className="flex items-center space-x-2 border-b border-[#A8D5BA]/20 mb-6 overflow-x-auto hide-scrollbar pb-px">
                                    {['Why You Match', 'Criteria Breakdown', 'AI Analysis'].map(tab => (
                                      <button
                                        key={tab}
                                        onClick={() => setTab(trial.trialId, tab)}
                                        className={`px-4 py-2.5 font-bold text-sm whitespace-nowrap border-b-2 transition-colors duration-150 ${activeCardTab === tab ? 'border-[#2E7D5C] text-[#2E7D5C]' : 'border-transparent text-[#1B5E3A]/60 hover:text-[#1B5E3A] hover:border-[#A8D5BA]/50'}`}
                                      >
                                        {tab === 'Why You Match' && '🧬 '}
                                        {tab === 'Criteria Breakdown' && '📋 '}
                                        {tab === 'AI Analysis' && '🤖 '}
                                        {tab}
                                      </button>
                                    ))}
                                  </div>

                                  {/* Tab Content Display */}
                                  <div className="min-h-[200px] animate-fade-in">
                                    {activeCardTab === 'Why You Match' && trial.explanation?.patientView && (
                                      <div className="space-y-6">
                                        <h4 className="text-2xl font-extrabold text-[#1B5E3A] leading-tight">
                                          {trial.explanation.patientView.headline}
                                        </h4>
                                        <p className="text-[#1B5E3A]/70 font-medium">
                                          You meet most of the trial requirements, which makes you a strong candidate.
                                        </p>

                                        <div className="bg-[#F0F9F4] border border-[#A8D5BA]/40 rounded-xl p-5 shadow-sm">
                                          <h5 className="font-bold text-[#1B5E3A] mb-3 uppercase tracking-wide text-xs">What Helped</h5>
                                          <div className="space-y-2.5">
                                            {(trial.explanation.patientView.whatHelped || []).map((item, i) => (
                                              <div key={i} className="flex items-start text-sm font-medium text-[#1B5E3A]/80">
                                                <span className="text-[#6BBF8A] mr-2.5 shrink-0 text-base leading-none mt-0.5">✅</span>
                                                <span className="leading-snug">{item.replace(/^\[OK\] /, '')}</span>
                                              </div>
                                            ))}
                                            {(!trial.explanation.patientView.whatHelped || trial.explanation.patientView.whatHelped.length === 0) && (
                                              <p className="text-sm text-[#1B5E3A]/50 italic">No specific positive factors noted.</p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="bg-[#FFF8E7] border border-[#F59E0B]/30 rounded-xl p-5 shadow-sm">
                                          <h5 className="font-bold text-[#B45309] mb-3 uppercase tracking-wide text-xs">Things to Note</h5>
                                          <div className="space-y-2.5">
                                            {(trial.explanation.patientView.whatHurt || []).map((item, i) => (
                                              <div key={i} className="flex items-start text-sm font-medium text-[#92400E]">
                                                <span className="text-[#F59E0B] mr-2.5 shrink-0 text-base leading-none mt-0.5">⚠️</span>
                                                <span className="leading-snug">{item.replace(/^\[!!\] /, '')}</span>
                                              </div>
                                            ))}
                                            {(!trial.explanation.patientView.whatHurt || trial.explanation.patientView.whatHurt.length === 0) && (
                                              <p className="text-sm text-[#D97706] italic">No warnings noted.</p>
                                            )}
                                          </div>
                                        </div>

                                        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center space-x-3 text-[#1E3A8A] font-medium text-sm shadow-sm">
                                          <span className="text-xl">💬</span>
                                          <p>{trial.explanation.patientView.nextStep || 'Speak with your doctor — some factors may be addressable.'}</p>
                                        </div>
                                      </div>
                                    )}

                                    {activeCardTab === 'Criteria Breakdown' && trial.ruleResult?.results && (
                                      <div>
                                        <div className="overflow-x-auto rounded-xl border border-[#A8D5BA]/30 shadow-sm">
                                          <table className="w-full text-left border-collapse bg-white">
                                            <thead>
                                              <tr className="bg-[#F0F9F4] border-b border-[#A8D5BA]/30 text-[#1B5E3A]/60 font-bold text-xs uppercase tracking-wider">
                                                <th className="py-3 px-4">Criterion</th>
                                                <th className="py-3 px-4">Required</th>
                                                <th className="py-3 px-4">Your Value</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#A8D5BA]/10 text-sm font-medium">
                                              {trial.ruleResult.results.map((r, i) => (
                                                <tr key={i} className="hover:bg-[#F0F9F4]/50 transition-colors">
                                                  <td className="py-3 px-4 text-[#1B5E3A] capitalize">{r.criterion.replace(/_/g, ' ')}</td>
                                                  <td className="py-3 px-4 text-[#1B5E3A]/70">{r.required || 'N/A'}</td>
                                                  <td className="py-3 px-4 text-[#1B5E3A]/70">{r.actual !== null && r.actual !== undefined ? r.actual : 'Unknown'}</td>
                                                  <td className="py-3 px-4 text-center">
                                                    {r.status === 'PASS' ? (
                                                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#D1FAE5] text-[#065F46] text-xs font-bold gap-1">✅ Pass</span>
                                                    ) : r.status === 'FAIL' ? (
                                                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#FEE2E2] text-[#991B1B] text-xs font-bold gap-1">❌ Fail</span>
                                                    ) : (
                                                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#F1F5F9] text-[#334155] text-xs font-bold gap-1">➖ Skip</span>
                                                    )}
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                        <div className="mt-4 flex items-center gap-3 text-sm font-bold">
                                          <div className="bg-[#D1FAE5] text-[#065F46] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
                                            {trial.ruleResult.results.filter(r => r.status === 'PASS').length} criteria passed
                                          </div>
                                          <div className="bg-[#FEE2E2] text-[#991B1B] px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-[#EF4444]"></div>
                                            {trial.ruleResult.results.filter(r => r.status === 'FAIL').length} criteria failed
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {activeCardTab === 'AI Analysis' && trial.explanation?.doctorView && (
                                      <div className="space-y-6">
                                        <div className="bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl p-4 flex items-center justify-between text-sm shadow-sm">
                                          <p className="font-medium text-[#1B5E3A]/70">
                                            Patient <span className="font-bold text-[#1B5E3A]">{trial.patientId}</span> scored <span className="font-bold text-[#1B5E3A]">{trial.match_score || trial.confidenceScore}%</span> for trial <span className="font-bold text-[#1B5E3A]">{trial.trialId}</span>.
                                          </p>
                                          <div className="bg-white border border-[#A8D5BA]/40 px-3 py-1.5 rounded-lg font-bold text-[#2E7D5C] shadow-sm">
                                            Model Confidence: {trial.explanation.doctorView.modelConfidence || 'N/A'}%
                                          </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                          <div>
                                            <h5 className="font-bold text-[#1B5E3A] mb-3 text-sm uppercase tracking-wide">What Boosted Your Score</h5>
                                            <div className="flex flex-wrap gap-2">
                                              {(trial.explanation.doctorView.topPositiveFactors || []).map((item, i) => (
                                                <span key={i} className="inline-flex items-center text-xs font-bold bg-[#D1FAE5] text-[#065F46] px-3 py-1.5 rounded-full shadow-sm">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] mr-2"></div>
                                                  {item}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                          <div>
                                            <h5 className="font-bold text-[#1B5E3A] mb-3 text-sm uppercase tracking-wide">What Reduced Your Score</h5>
                                            <div className="flex flex-wrap gap-2">
                                              {(trial.explanation.doctorView.topNegativeFactors || []).map((item, i) => (
                                                <span key={i} className="inline-flex items-center text-xs font-bold bg-[#FEE2E2] text-[#991B1B] px-3 py-1.5 rounded-full shadow-sm">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mr-2"></div>
                                                  {item}
                                                </span>
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        <div className="pt-6 border-t border-[#A8D5BA]/20">
                                          <h5 className="font-bold text-[#1B5E3A] text-lg mb-1">SHAP Factor Analysis</h5>
                                          <p className="text-[#1B5E3A]/60 text-sm font-medium mb-6">Positive = helped your score | Negative = reduced your score</p>
                                          
                                          <div className="space-y-3">
                                            {(trial.explanation?.shapExplanation || []).map((factor, i) => {
                                              const isPositive = factor.direction === 'positive';
                                              const impactVal = parseFloat(factor.impact) || 0;
                                              const absImpact = Math.abs(impactVal);
                                              // simple normalize width up to max ~0.3
                                              const widthPercent = Math.min(100, (absImpact / 0.3) * 100); 

                                              return (
                                                <div key={i} className="flex items-center text-sm group" title={factor.meaning || factor.feature}>
                                                  <div className="w-1/3 pr-4 font-medium text-[#1B5E3A]/80 truncate text-right">
                                                    {factor.feature.replace(/_/g, ' ')}
                                                  </div>
                                                  <div className="w-1/3 flex items-center justify-center relative h-6">
                                                    {/* Central Axis */}
                                                    <div className="absolute inset-y-0 left-1/2 w-px bg-[#A8D5BA]/50"></div>
                                                    
                                                    {/* Bar Grid visually centered */}
                                                    <div className="w-full h-full flex items-center">
                                                      <div className="w-1/2 flex justify-end">
                                                        {(!isPositive) && (
                                                          <div 
                                                            className="h-4 bg-[#F87171] rounded-l mr-px transition-all duration-700 ease-out" 
                                                            style={{ width: `${widthPercent}%` }}
                                                          ></div>
                                                        )}
                                                      </div>
                                                      <div className="w-1/2 flex justify-start">
                                                        {(isPositive) && (
                                                          <div 
                                                            className="h-4 bg-[#6BBF8A] rounded-r ml-px transition-all duration-700 ease-out" 
                                                            style={{ width: `${widthPercent}%` }}
                                                          ></div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="w-1/3 pl-4 font-mono font-bold text-xs">
                                                    <span className={isPositive ? 'text-[#059669]' : 'text-[#DC2626]'}>
                                                      {isPositive ? '+' : ''}{impactVal.toFixed(4)}
                                                    </span>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Bottom Score Breakdown Component */}
                                  {trial.scoreBreakdown && (
                                    <div className="mt-8 pt-6 border-t border-[#A8D5BA]/20">
                                      <h4 className="text-lg font-bold text-[#1B5E3A] mb-6 flex items-center gap-2">
                                        <span>📊</span> Score Breakdown
                                      </h4>
                                      <div className="grid md:grid-cols-2 gap-x-12 gap-y-4">
                                        {[
                                          { key: 'age_score', label: 'Age Compatibility' },
                                          { key: 'hba1c_score', label: 'Blood Sugar (HbA1c)' },
                                          { key: 'egfr_score', label: 'Kidney Function (eGFR)' },
                                          { key: 'diagnosis_match', label: 'Diagnosis Match' },
                                          { key: 'smoking_match', label: 'Smoking Status' },
                                          { key: 'location_score', label: 'Location Proximity' },
                                          { key: 'criteria_pass_ratio', label: 'Criteria Pass Rate' },
                                          { key: 'phase_compatibility', label: 'Trial Phase Fit' }
                                        ].map((stat, i) => {
                                          const val = trial.scoreBreakdown[stat.key];
                                          const numVal = typeof val === 'number' ? val : 0;
                                          const pct = Math.round(numVal * 100);
                                          const barColor = pct >= 80 ? 'bg-[#34D399]' : pct >= 50 ? 'bg-[#FBBF24]' : 'bg-[#F87171]';

                                          return (
                                            <div key={i} className="flex items-center text-sm">
                                              <span className="w-1/2 font-medium text-[#1B5E3A]/70 truncate pr-2">{stat.label}</span>
                                              <div className="w-1/3 bg-[#F0F9F4] border border-[#A8D5BA]/20 h-2.5 rounded-full overflow-hidden shrink-0">
                                                <div 
                                                  className={`h-full rounded-full transition-all duration-1000 ease-out delay-150 ${barColor}`} 
                                                  style={{ width: isExpanded ? `${pct}%` : '0%' }}
                                                ></div>
                                              </div>
                                              <span className="w-1/6 text-right font-bold text-[#1B5E3A]">{pct}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {hasSearched && matchResults?.eligibleCount === 0 && !isLoadingMatch && medicalData && !error && (
                    <div className="bg-white border text-center border-slate-200 rounded-2xl p-12 shadow-sm">
                      <div className="w-24 h-24 mx-auto bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-6">
                        <Search className="w-10 h-10" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">No matching trials found for your profile</h3>
                      <p className="text-slate-500 font-medium max-w-sm mx-auto mb-8">
                        Try updating your health profile with more details to improve your matches.
                      </p>
                      <button 
                        onClick={() => {
                          setActiveTab('Profile');
                        }}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-lg shadow-brand-500/30"
                      >
                        Update Health Profile
                      </button>
                    </div>
                  )}

                </div>
              </div>
            </div>
          ) : activeTab === 'My Health Profile' ? (
            <HealthProfile patient={medicalData} isLoading={isLoading} />
          ) : activeTab === 'Trial Matches' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-extrabold text-[#1B5E3A] tracking-tight">Your Saved Trial Matches</h3>
                <span className="bg-[#A8D5BA]/30 text-[#2E7D5C] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">{savedTrials.length} Saved</span>
              </div>
              
              {savedTrials.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#A8D5BA]/30 p-12 lg:p-24 text-center shadow-sm flex flex-col items-center justify-center">
                  <div className="w-24 h-24 bg-[#F0F9F4] rounded-full flex items-center justify-center mb-6">
                    <Bookmark className="w-12 h-12 text-[#A8D5BA]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1B5E3A] mb-3">No saved trials yet</h3>
                  <p className="text-[#1B5E3A]/60 font-medium mb-8 max-w-sm">
                    Find matching trials from your dashboard and save them here to review or apply later.
                  </p>
                  <button 
                    onClick={() => setActiveTab('Dashboard')}
                    className="bg-[#2E7D5C] hover:bg-[#1B5E3A] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#2E7D5C]/30 transition-all active:scale-[0.98]"
                  >
                    Go to Dashboard
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {savedTrials.map((trial) => {
                    const scoreColorClass = trial.confidenceScore >= 90 ? 'text-emerald-600' : trial.confidenceScore >= 70 ? 'text-blue-600' : trial.confidenceScore >= 50 ? 'text-amber-500' : 'text-red-500';
                    const categoryColorClass = trial.confidenceScore >= 90 ? 'text-emerald-700' : trial.confidenceScore >= 70 ? 'text-blue-700' : trial.confidenceScore >= 50 ? 'text-amber-700' : 'text-red-700';

                    const isExpanded = expandedCardId === trial.trialId;
                    const activeCardTab = expandedTab[trial.trialId] || 'Why You Match';

                    return (
                      <div key={trial.trialId} className={`bg-white border ${isExpanded ? 'border-[#6BBF8A] ring-2 ring-[#a8d5ba]/50' : 'border-[#A8D5BA]/30 hover:shadow-lg hover:border-[#6BBF8A]/50'} rounded-2xl transition-all shadow-sm relative overflow-hidden`}>
                        {/* Main Card Header (Always Visible) */}
                        <div 
                          className="p-6 lg:p-8 flex flex-col lg:flex-row gap-6 cursor-pointer group relative"
                          onClick={() => toggleCardExpansion(trial.trialId)}
                        >
                          {/* Saved Date Badge */}
                          <div className="absolute top-4 right-4 bg-[#F0F9F4] text-[#2E7D5C] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            Saved on: {new Date(trial.savedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>

                          {/* Left Match Score Column */}
                          <div className="flex flex-col items-center justify-center lg:w-40 shrink-0 border-b lg:border-b-0 lg:border-r border-[#A8D5BA]/20 pb-6 lg:pb-0 lg:pr-6 mt-4 lg:mt-0">
                            <span className="text-[#1B5E3A]/50 font-bold uppercase tracking-widest text-xs mb-2">Rank #{trial.rank}</span>
                            <span className={`text-5xl font-extrabold tracking-tighter ${scoreColorClass}`}>
                              {parseInt(trial.confidenceScore)}%
                            </span>
                            <span className={`mt-3 font-bold text-sm text-center ${categoryColorClass}`}>
                              {trial.category}
                            </span>
                          </div>

                          {/* Center Content Component */}
                          <div className="flex-1 min-w-0 mt-4 lg:mt-0">
                            <h4 className="text-2xl font-bold text-[#1B5E3A] mb-2 leading-tight group-hover:text-[#2E7D5C] transition-colors pr-12 lg:pr-0">
                              {trial.trialName}
                            </h4>
                            <div className="flex flex-wrap items-center text-sm font-medium text-[#1B5E3A]/70 mb-2 gap-x-4 gap-y-2">
                              <span className="bg-[#F0F9F4] text-[#2E7D5C] px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Phase {trial.phase}</span>
                              <span className="flex items-center space-x-1 text-[#2E7D5C]"><span className="w-1.5 h-1.5 rounded-full bg-[#6BBF8A]"></span><span>{trial.status || 'Recruiting'}</span></span>
                              <span className="text-[#A8D5BA]/50">•</span>
                              <span className="flex items-center space-x-1"><MapPin className="w-4 h-4" /> <span>{trial.location}</span></span>
                              <span className="text-[#A8D5BA]/50">•</span>
                              <span className="flex items-center space-x-1"><Building2 className="w-4 h-4" /> <span>{trial.sponsor}</span></span>
                            </div>
                          </div>

                          {/* Right Action Column */}
                          <div className="flex flex-col space-y-3 justify-center lg:w-48 shrink-0 lg:border-l border-[#A8D5BA]/20 pt-6 lg:pt-0 lg:pl-6 relative">
                            <button onClick={(e) => { e.stopPropagation(); /* apply logic */ }} className="w-full bg-[#2E7D5C] hover:bg-[#1B5E3A] text-white py-3.5 px-4 rounded-xl font-bold shadow-lg shadow-[#2E7D5C]/30 transition-all active:scale-[0.98]">
                              Apply for Trial
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemoveSavedTrial(trial.trialId); }}
                              className="w-full bg-white hover:bg-red-50 text-[#1B5E3A]/60 hover:text-red-600 border border-[#A8D5BA]/40 hover:border-red-200 py-3 px-4 rounded-xl font-bold transition-colors flex items-center justify-center space-x-2"
                            >
                              <span>🗑 Remove</span>
                            </button>
                            
                            <div className="absolute -bottom-2 -right-2 lg:bottom-0 lg:right-0 flex items-center justify-center p-2 text-[#A8D5BA] group-hover:text-[#2E7D5C] transition-colors">
                              {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Content Section (Reused from Dashboard) */}
                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[2000px] opacity-100 border-t border-slate-100 bg-slate-50/50' : 'max-h-0 opacity-0'}`}>
                          <div className="p-6 lg:p-8">
                            <div className="flex items-center space-x-2 border-b border-[#A8D5BA]/20 mb-6 overflow-x-auto hide-scrollbar pb-px">
                              {['Why You Match', 'Criteria Breakdown', 'AI Analysis'].map(tab => (
                                <button
                                  key={tab}
                                  onClick={() => setTab(trial.trialId, tab)}
                                  className={`px-4 py-2.5 font-bold text-sm whitespace-nowrap border-b-2 transition-colors duration-150 ${activeCardTab === tab ? 'border-[#2E7D5C] text-[#2E7D5C]' : 'border-transparent text-[#1B5E3A]/60 hover:text-[#1B5E3A] hover:border-[#A8D5BA]/50'}`}
                                >
                                  {tab === 'Why You Match' && '🧬 '}
                                  {tab === 'Criteria Breakdown' && '📋 '}
                                  {tab === 'AI Analysis' && '🤖 '}
                                  {tab}
                                </button>
                              ))}
                            </div>

                            <div className="min-h-[200px] animate-fade-in">
                              {activeCardTab === 'Why You Match' && trial.explanation?.patientView && (
                                <div className="space-y-6">
                                  <h4 className="text-2xl font-extrabold text-[#1B5E3A] leading-tight">
                                    {trial.explanation.patientView.headline}
                                  </h4>
                                  <p className="text-[#1B5E3A]/70 font-medium">{trial.explanation.patientView.summary}</p>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                                    <div className="space-y-4">
                                      <h5 className="font-bold text-[#1B5E3A] flex items-center"><span className="w-8 h-8 rounded-full bg-[#D1FAE5] text-[#059669] flex items-center justify-center mr-3 font-extrabold text-lg">✓</span> What Helped</h5>
                                      <ul className="space-y-3">
                                        {(trial.explanation.patientView.whatHelped || []).map((item, i) => (
                                          <li key={i} className="flex items-start text-[#1B5E3A]/80 font-medium">
                                            <span className="text-[#10B981] mr-2 mt-0.5">•</span>
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="space-y-4">
                                      <h5 className="font-bold text-[#1B5E3A] flex items-center"><span className="w-8 h-8 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center mr-3 font-extrabold text-lg">!</span> Things to Note</h5>
                                      <ul className="space-y-3">
                                        {(trial.explanation.patientView.whatHurt || []).map((item, i) => (
                                          <li key={i} className="flex items-start text-[#1B5E3A]/80 font-medium">
                                            <span className="text-[#F59E0B] mr-2 mt-0.5">•</span>
                                            {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-5 mt-6 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#DBEAFE] rounded-bl-full opacity-50 -z-10"></div>
                                     <p className="text-[#1E3A8A] font-bold mb-1">What's Next?</p>
                                     <p className="text-[#1E40AF] font-medium">{trial.explanation.patientView.nextStep}</p>
                                  </div>
                                </div>
                              )}

                              {activeCardTab === 'Criteria Breakdown' && trial.ruleResult?.results && (
                                <div className="space-y-6">
                                  <div className="flex items-center flex-wrap gap-4 mb-4">
                                    <div className="bg-[#D1FAE5] border border-[#A7F3D0] px-4 py-2 rounded-lg">
                                      <span className="text-[#047857] font-bold text-sm uppercase tracking-wider">Passed</span>
                                      <span className="block text-xl font-extrabold text-[#059669]">{trial.ruleResult.results.filter(r => r.status === 'Pass').length} Conditions</span>
                                    </div>
                                    <div className="bg-[#FEE2E2] border border-[#FECACA] px-4 py-2 rounded-lg">
                                      <span className="text-[#B91C1C] font-bold text-sm uppercase tracking-wider">Failed</span>
                                      <span className="block text-xl font-extrabold text-[#DC2626]">{trial.ruleResult.results.filter(r => r.status === 'Fail').length} Conditions</span>
                                    </div>
                                  </div>
                                  <div className="overflow-x-auto rounded-xl border border-[#A8D5BA]/30">
                                    <table className="w-full text-left bg-white">
                                      <thead className="bg-[#F0F9F4] border-b border-[#A8D5BA]/30 text-[#1B5E3A]/60 font-bold text-xs uppercase tracking-wider">
                                        <tr>
                                          <th className="px-6 py-4">Criterion</th>
                                          <th className="px-6 py-4">Required</th>
                                          <th className="px-6 py-4">Your Value</th>
                                          <th className="px-6 py-4">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-[#A8D5BA]/10 text-sm font-medium">
                                        {trial.ruleResult.results.map((r, i) => (
                                          <tr key={i} className="hover:bg-[#F0F9F4]/50 transition-colors">
                                            <td className="px-6 py-4 text-[#1B5E3A] font-bold">{r.criterion}</td>
                                            <td className="px-6 py-4 text-[#1B5E3A]/70">{r.required}</td>
                                            <td className="px-6 py-4 text-[#1B5E3A]/70">{r.actual}</td>
                                            <td className="px-6 py-4">
                                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${r.status === 'Pass' ? 'bg-[#D1FAE5] text-[#065F46]' : r.status === 'Fail' ? 'bg-[#FEE2E2] text-[#991B1B]' : 'bg-[#F1F5F9] text-[#334155]'}`}>
                                                {r.status}
                                              </span>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}

                              {activeCardTab === 'AI Analysis' && trial.explanation?.doctorView && (
                                <div className="space-y-8">
                                   <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-xl bg-[#F0F9F4]/50 border border-[#A8D5BA]/30">
                                     <div>
                                      <h5 className="font-bold text-[#1B5E3A]/60 uppercase tracking-widest text-xs mb-1">Model Confidence</h5>
                                      <p className="text-2xl font-extrabold text-[#1B5E3A] tracking-tight">{trial.explanation.doctorView.modelConfidence}</p>
                                     </div>
                                     <div className="flex-1 max-w-sm w-full">
                                       <div className="h-3 w-full bg-[#A8D5BA]/20 rounded-full overflow-hidden">
                                           <div className={`h-full bg-gradient-to-r ${trial.confidenceScore >= 70 ? 'from-[#34D399] to-[#10B981]' : 'from-[#FBBF24] to-[#F59E0B]'}`} style={{ width: `${trial.confidenceScore}%` }}></div>
                                       </div>
                                     </div>
                                   </div>

                                   <div className="space-y-4">
                                     <h5 className="font-bold text-[#1B5E3A]">SHAP Factor Analysis (Impact on Match Score)</h5>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 mt-4">
                                        {(trial.explanation.doctorView.shapExplanation || []).map((factor, i) => {
                                           const isPositive = factor.direction === 'positive';
                                           const impactFloat = parseFloat(factor.impact);
                                           const widthPercent = Math.min(Math.abs(impactFloat) * 100 * 2, 100);
                                           
                                           return (
                                             <div key={i} className="flex flex-col space-y-2 group">
                                                <div className="flex justify-between text-sm font-medium">
                                                  <span className="text-[#1B5E3A]/70 capitalize group-hover:text-[#1B5E3A] transition-colors">{factor.feature.replace(/_/g, ' ')}</span>
                                                  <span className={`${isPositive ? 'text-[#059669]' : 'text-[#DC2626]'} font-bold`}>{factor.impact}</span>
                                                </div>
                                                <div className="flex items-center">
                                                  <div className="flex-1 flex justify-end pr-2 border-r border-[#A8D5BA]/50 h-4">
                                                    {!isPositive && (
                                                      <div className="h-full bg-[#F87171] rounded-l" style={{ width: `${widthPercent}%` }}></div>
                                                    )}
                                                  </div>
                                                  <div className="flex-1 flex justify-start pl-2 h-4">
                                                    {isPositive && (
                                                      <div className="h-full bg-[#6BBF8A] rounded-r" style={{ width: `${widthPercent}%` }}></div>
                                                    )}
                                                  </div>
                                                </div>
                                                <p className="text-xs text-[#1B5E3A]/50 mt-1 italic">{factor.meaning}</p>
                                             </div>
                                           );
                                        })}
                                     </div>
                                   </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Score Breakdown (Always inside expanded content) */}
                            {trial.scoreBreakdown && Object.keys(trial.scoreBreakdown).length > 0 && (
                              <div className="mt-8 pt-8 border-t border-[#A8D5BA]/20">
                                <h4 className="text-sm font-extrabold text-[#1B5E3A]/50 tracking-wider uppercase mb-6 px-1">Detailed Score Breakdown</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
                                  {Object.entries(trial.scoreBreakdown).map(([key, val]) => {
                                    const percent = Math.round(val * 100);
                                    let label = key.replace(/_/g, ' ').replace(' score', '').replace(' match', '');
                                    label = label.charAt(0).toUpperCase() + label.slice(1);
                                    
                                    const scoreColorClass = percent >= 80 ? 'text-[#059669]' : percent >= 50 ? 'text-[#D97706]' : 'text-[#DC2626]';
                                    const scoreBgClass = percent >= 80 ? 'bg-[#34D399]' : percent >= 50 ? 'bg-[#FBBF24]' : 'bg-[#F87171]';

                                    return (
                                      <div key={key} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                          <span className="text-sm font-bold text-[#1B5E3A]/70 truncate pr-2">{label}</span>
                                          <span className={`text-sm font-extrabold ${scoreColorClass}`}>{percent}%</span>
                                        </div>
                                        <div className="h-2 w-full bg-[#A8D5BA]/20 rounded-full overflow-hidden">
                                          <div className={`h-full ${scoreBgClass} rounded-full shadow-sm transition-all duration-1000 delay-300`} style={{ width: `${percent}%` }}></div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : activeTab === 'Nearby Clinical Trials' ? (
            <div className="text-slate-500 py-12">Nearby Trials - Coming Soon</div>
          ) : activeTab === 'Saved Trials' ? (
            <div className="text-slate-500 py-12">Saved Trials - Coming Soon</div>
          ) : activeTab === 'Notifications' ? (
            <div className="text-slate-500 py-12">Notifications - Coming Soon</div>
          ) : activeTab === 'Profile' ? (
            <PatientProfile />
          ) : activeTab === 'Settings' ? (
            <SettingsView />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-medium">
              View under construction
            </div>
          )}
        </div>
      </main>

      <MedicalInfoModal
        isOpen={showMedicalModal}
        onClose={() => setShowMedicalModal(false)}
        initialData={medicalData}
        onSave={handleSaveMedicalInfo}
      />
    </div>
  );
}

/* ── Patient Profile Tab ───────────────────────────────────────────────── */
function PatientProfile() {
  const { user } = useAuth();

  // ── FIX 2: Moved these state variables & handler INTO PatientProfile ──
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showSuccess && (
        <div className="bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 text-[#1B5E3A]/90 p-4 rounded-xl flex items-center space-x-3 text-sm font-bold animate-fade-in-up">
          <CheckCircle2 className="w-5 h-5 text-[#2E7D5C]" />
          <span>Your medical profile has been updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-[#A8D5BA]/30 shadow-sm overflow-hidden animate-fade-in-up">
        <div className="p-8 border-b border-[#A8D5BA]/20 flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#2E7D5C] to-[#6BBF8A] flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden shrink-0">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Jane'}`} alt="Jane" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#1B5E3A]">{user?.name || 'Patient'}</h2>
            <p className="text-[#2E7D5C] font-bold tracking-wide text-sm mt-1 bg-[#F0F9F4] inline-block px-3 py-1 rounded-md capitalize">{user?.role || 'Patient'}</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" defaultValue={user?.name || ''} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" defaultValue={user?.email || ''} />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Role</label>
              <input type="text" className="w-full px-4 py-3 bg-[#F0F9F4]/90 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors capitalize text-[#1B5E3A]/60" value={user?.role || 'patient'} readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Medical History Summary (Confidential)</label>
            <textarea rows="4" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors resize-none" placeholder="Enter your medical history..." defaultValue="" />
          </div>
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleUpdate}
              disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2 ${
                isSaving ? 'bg-[#A8D5BA] text-white cursor-not-allowed shadow-none' : 'bg-[#2E7D5C] text-white hover:bg-[#1B5E3A] shadow-[#2E7D5C]/30 active:scale-[0.98]'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Update Profile</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Settings Tab ──────────────────────────────────────────────────────── */
function SettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-[#A8D5BA]/30 shadow-sm p-8">
        <h3 className="text-xl font-bold text-[#1B5E3A] mb-6">Security &amp; Password</h3>
        <div className="space-y-4 max-w-md">
          <input type="password" placeholder="Current Password" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
          <input type="password" placeholder="New Password" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
          <button className="bg-[#F0F9F4] text-[#2E7D5C] px-6 py-3 rounded-xl font-bold hover:bg-[#A8D5BA]/30 transition-colors mt-2">Change Password</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#A8D5BA]/30 shadow-sm p-8">
        <h3 className="text-xl font-bold text-[#1B5E3A] mb-6">Privacy &amp; Preferences</h3>
        <div className="space-y-5">
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-[#F0F9F4]/50 rounded-xl border border-[#A8D5BA]/20">
            <input type="checkbox" className="w-5 h-5 rounded border-[#A8D5BA] text-[#2E7D5C]" defaultChecked />
            <div>
              <span className="block font-bold text-[#1B5E3A]">Email Notifications</span>
              <span className="text-sm font-medium text-[#1B5E3A]/60">Receive alerts when new matches are found.</span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-[#F0F9F4]/50 rounded-xl border border-[#A8D5BA]/20">
            <input type="checkbox" className="w-5 h-5 rounded border-[#A8D5BA] text-[#2E7D5C]" defaultChecked />
            <div>
              <span className="block font-bold text-[#1B5E3A]">Data Anonymization</span>
              <span className="text-sm font-medium text-[#1B5E3A]/60">Keep my personal info hidden from researchers until I apply.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-[#FEE2E2]/50 rounded-2xl border border-[#FECACA] p-8">
        <h3 className="text-xl font-bold text-[#B91C1C] mb-2">Danger Zone</h3>
        <p className="text-sm font-medium text-[#B91C1C]/80 mb-6 max-w-lg">Once you delete your account, there is no going back. You will lose all your clinical trial matches and medical profile data.</p>
        <button className="bg-[#DC2626] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#B91C1C] shadow-sm transition-all">Delete Account</button>
      </div>
    </div>
  );
}

/* ── Animated Score Component ────────────────────────────────────────────── */
function AnimatedScore({ score, getScoreColor }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = parseInt(score, 10);
    if (isNaN(end)) return;
    if (start === end) { setCurrent(end); return; }
    
    const duration = 1000;
    const increment = end / (duration / 30);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        clearInterval(timer);
        setCurrent(end);
      } else {
        setCurrent(Math.floor(start));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [score]);
  
  return <span className={`block text-5xl font-extrabold tracking-tighter ${getScoreColor(current)}`}>{current}%</span>;
}

/* ── Medical Info Modal ────────────────────────────────────────────────── */
function MedicalInfoModal({ isOpen, onClose, initialData, onSave }) {
  const [formData, setFormData] = useState({
    age: '',
    gender: 'Male',
    diagnosis: '',
    medications: '',
    labResults: { HbA1c: '', eGFR: '' },
    smokingStatus: 'Never',
    surgicalHistory: 'None',
    location: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        age: initialData.age || '',
        gender: initialData.gender || 'Male',
        diagnosis: initialData.diagnosis || '',
        medications: Array.isArray(initialData.medications) ? initialData.medications.join(', ') : (initialData.medications || ''),
        labResults: {
          HbA1c: initialData.labResults?.HbA1c || '',
          eGFR: initialData.labResults?.eGFR || ''
        },
        smokingStatus: initialData.smokingStatus || 'Never',
        surgicalHistory: initialData.surgicalHistory || 'None',
        location: initialData.location || ''
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('labResults.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, labResults: { ...prev.labResults, [field]: value } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        medications: formData.medications.split(',').map(m => m.trim()).filter(m => m),
      };
      await onSave(dataToSave);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1B5E3A]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-[#A8D5BA]/50">
        <div className="p-6 border-b border-[#A8D5BA]/20 flex justify-between items-center bg-white z-10 shrink-0">
          <h2 className="text-xl font-bold text-[#1B5E3A]">Update Medical Profile</h2>
          <button onClick={onClose} className="text-[#1B5E3A]/40 hover:text-[#1B5E3A] transition-colors p-2 rounded-full hover:bg-[#F0F9F4]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto p-6 bg-white">
          <form id="medical-info-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Primary Diagnosis</label>
                <input type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange} placeholder="e.g., Type 2 Diabetes" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" required />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Current Medications (Comma separated)</label>
                <input type="text" name="medications" value={formData.medications} onChange={handleChange} placeholder="e.g., Metformin, Lisinopril" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">HbA1c (%)</label>
                <input type="number" step="0.1" name="labResults.HbA1c" value={formData.labResults.HbA1c} onChange={handleChange} placeholder="e.g., 7.8" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">eGFR</label>
                <input type="number" step="0.1" name="labResults.eGFR" value={formData.labResults.eGFR} onChange={handleChange} placeholder="e.g., 65" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Smoking Status</label>
                <select name="smokingStatus" value={formData.smokingStatus} onChange={handleChange} className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors">
                  <option value="Never">Never</option>
                  <option value="Former">Former</option>
                  <option value="Current">Current</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Surgical History</label>
                <input type="text" name="surgicalHistory" value={formData.surgicalHistory} onChange={handleChange} placeholder="e.g., Appendectomy" className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Location (City)</label>
                <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-[#F0F9F4]/50 border border-[#A8D5BA]/30 rounded-xl outline-none focus:border-[#2E7D5C] transition-colors" required />
              </div>
            </div>
          </form>
        </div>
        <div className="p-6 shrink-0 flex justify-end space-x-4 border-t border-[#A8D5BA]/20 bg-[#F0F9F4]/20">
          <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#1B5E3A]/70 hover:bg-[#F0F9F4] transition-colors border border-[#A8D5BA]/40 hover:text-[#1B5E3A]">Cancel</button>
          <button type="submit" form="medical-info-form" disabled={isSaving} className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2 ${isSaving ? 'bg-[#A8D5BA] text-white cursor-not-allowed shadow-none' : 'bg-[#2E7D5C] text-white hover:bg-[#1B5E3A] shadow-[#2E7D5C]/30 active:scale-[0.98]'}`}>
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Info</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}