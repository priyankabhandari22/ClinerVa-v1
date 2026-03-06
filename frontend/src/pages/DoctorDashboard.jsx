import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ProfileImageUploader from '../components/ProfileImageUploader';
import AIMatchPanel from '../components/AIMatchPanel';
import {
  LogOut, Stethoscope, Search, Bell, LayoutDashboard, Upload,
  Brain, Users, ListPlus, BarChart3, UserCircle, Settings,
  ChevronRight, FileText, MapPin, CheckCircle2, AlertCircle,
  Loader2, Activity, Wifi, WifiOff, Sparkles
} from 'lucide-react';
import { matchingAPI } from '../services/api';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { logout, user, getAvatarUrl } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard Overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiStatus, setAiStatus] = useState(null);

  // Ping AI health endpoint once on mount
  useEffect(() => {
    matchingAPI.aiHealth()
      .then(() => setAiStatus('online'))
      .catch(() => setAiStatus('offline'));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(t);
  }, [activeTab]);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading Dashboard…</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard Overview', icon: LayoutDashboard },
    { name: 'Upload Patient Data', icon: Upload, action: () => setShowUploadModal(true) },
    { name: 'Clinical Trial Matching', icon: Brain },
    { name: 'Patient Records', icon: Users },
    { name: 'Trial Recommendations', icon: ListPlus },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Profile', icon: UserCircle },
    { name: 'Settings', icon: Settings },
  ];

  const matchedPatients = [
    { id: 'P-4921', age: 45, diagnosis: 'Non-Small Cell Lung Cancer', trial: 'Immunotherapy Phase II', match: 98, location: 'Local', status: 'Eligible' },
    { id: 'P-8832', age: 62, diagnosis: 'Type 2 Diabetes', trial: 'GLP-1 Agonist Study', match: 92, location: 'Regional', status: 'Review Required' },
    { id: 'P-1054', age: 38, diagnosis: 'Rheumatoid Arthritis', trial: 'JAK Inhibitor Trial', match: 88, location: 'National', status: 'Eligible' },
  ];

  // Demo patientId for AI panel — replace with real ObjectId from your DB
  const DEMO_PATIENT_ID = null;

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
            <Stethoscope className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">Clinerva</span>
        </div>

        {/* AI status chip */}
        <div className="mx-4 mt-3 mb-1">
          {aiStatus && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${aiStatus === 'online' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}>
              {aiStatus === 'online'
                ? <><Wifi className="w-3 h-3" /> GPT-4o AI Online</>
                : <><WifiOff className="w-3 h-3" /> AI Offline</>}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-3">Main Menu</p>
          {menuItems.slice(0, 6).map((item) => (
            <button
              key={item.name}
              onClick={() => { if (item.action) item.action(); else setActiveTab(item.name); }}
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

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-6 mb-3 px-3">Preferences</p>
          {menuItems.slice(6).map((item) => (
            <button
              key={item.name} onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === item.name
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all group">
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">{activeTab}</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="text" placeholder="Search records…"
                className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 w-64 transition-all" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-brand-600 transition-colors">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900">{user?.name || 'Doctor'}</span>
                <span className="text-xs font-semibold text-slate-500 capitalize">{user?.role || 'Doctor'}</span>
              </div>
              {/* Live Cloudinary avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-brand-100 shadow-sm bg-gradient-to-tr from-brand-600 to-indigo-600">
                <img src={getAvatarUrl()} alt={user?.name} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'Dashboard Overview' && <DashboardOverview matchedPatients={matchedPatients} isLoading={isLoading} setShowUploadModal={setShowUploadModal} patientId={DEMO_PATIENT_ID} />}
          {activeTab === 'Clinical Trial Matching' && <AIMatchingTab patientId={DEMO_PATIENT_ID} />}
          {activeTab === 'Profile' && <DoctorProfile />}
          {activeTab === 'Settings' && <SettingsView />}
          {!['Dashboard Overview', 'Clinical Trial Matching', 'Profile', 'Settings'].includes(activeTab) && (
            <div className="flex items-center justify-center h-full text-slate-400 font-medium">
              This section is coming soon
            </div>
          )}
        </div>
      </main>

      {/* ── Upload Modal ─────────────────────────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Upload Patient Data</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Data will be automatically anonymized before processing.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)}
                className="w-10 h-10 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 rounded-full flex items-center justify-center transition-colors">
                ✕
              </button>
            </div>
            <div className="p-8">
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                    <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Primary Disease</label>
                    <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none" placeholder="Diagnosis" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Medical History &amp; Notes</label>
                  <textarea rows={3} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none resize-none" placeholder="Brief history…" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Upload Test Results (EHR/PDF)</label>
                  <div className="border-2 border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 transition-colors rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer text-center">
                    <FileText className="w-10 h-10 text-brand-400 mb-3" />
                    <p className="text-sm font-bold text-slate-700 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs font-medium text-slate-500">PDF, DICOM, JSON (Max 50 MB)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <p className="text-sm font-medium text-emerald-800">
                    <span className="font-bold">Auto-Anonymization Enabled.</span> PII (Name, SSN, Contact) will be scrubbed before sending to the AI Matching Module.
                  </p>
                </div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end space-x-4">
              <button onClick={() => setShowUploadModal(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
              <button className="px-6 py-3 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 shadow-lg shadow-brand-500/30 transition-all">Process &amp; Match</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Dashboard Overview ──────────────────────────────────────────────────── */
function DashboardOverview({ matchedPatients, isLoading, setShowUploadModal, patientId }) {
  return (
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { icon: <Users className="w-6 h-6" />, color: 'bg-blue-50 text-brand-600', label: 'Total Uploaded', value: '1,248' },
          { icon: <Activity className="w-6 h-6" />, color: 'bg-indigo-50 text-indigo-600', label: 'Active Trials', value: '42' },
          { icon: <Brain className="w-6 h-6" />, color: 'bg-emerald-50 text-emerald-600', label: 'Matched Patients', value: '386' },
          { icon: <BarChart3 className="w-6 h-6" />, color: 'bg-amber-50 text-amber-600', label: 'Match Accuracy', value: '98.4%' },
        ].map((k, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${k.color}`}>{k.icon}</div>
            <div>
              <p className="text-sm font-bold text-slate-500">{k.label}</p>
              <p className="text-2xl font-extrabold text-slate-900">{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Patient Upload &amp; Match Volume</h3>
        <div className="h-48 flex items-end space-x-2 md:space-x-4">
          {[40, 55, 30, 75, 90, 60, 100].map((h, i) => (
            <div key={i} className="flex-1 bg-brand-50 rounded-t-lg relative group h-full">
              <div className="absolute bottom-0 w-full bg-brand-500 rounded-t-xl transition-all duration-1000 group-hover:bg-brand-400"
                style={{ height: isLoading ? '0%' : `${h}%` }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs font-bold text-slate-400 uppercase">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Patient table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
              <Brain className="w-5 h-5 text-brand-600" /><span>AI Matching Results</span>
            </h3>
            <button className="text-sm font-bold text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg transition-colors">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['Anon ID', 'Diagnosis', 'Eligible Trial', 'Score', 'AI', 'Action'].map(h => (
                    <th key={h} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading
                  ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array(6).fill(0).map((_, j) => (
                        <td key={j} className="px-6 py-4"><div className="w-24 h-4 bg-slate-200 rounded" /></td>
                      ))}
                    </tr>
                  ))
                  : matchedPatients.map((patient, i) => (
                    <PatientRow key={i} patient={patient} i={i} patientId={patientId} />
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-brand-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-brand-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-10 translate-x-10" />
            <h3 className="text-xl font-bold mb-2">Upload Patient Data</h3>
            <p className="text-brand-100 text-sm font-medium mb-6">Securely upload and anonymize EHRs for AI matching.</p>
            <button onClick={() => setShowUploadModal(true)}
              className="w-full bg-white text-brand-700 font-bold py-3 rounded-xl shadow-sm hover:shadow-md hover:scale-[1.02] transition-all flex items-center justify-center space-x-2">
              <Upload className="w-5 h-5" /><span>Start New Upload</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-6">Patient Pipeline</h3>
            {[
              { label: 'Awaiting Matching', count: 450, color: 'bg-slate-400', pct: '40%' },
              { label: 'Matches Found', count: 386, color: 'bg-brand-500', pct: '35%' },
              { label: 'Enrolled in Trial', count: 124, color: 'bg-emerald-500', pct: '15%' },
            ].map(bar => (
              <div key={bar.label} className="mb-5">
                <div className="flex justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700">{bar.label}</span>
                  <span className="text-slate-900">{bar.count}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`${bar.color} h-full rounded-full`} style={{ width: bar.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── PatientRow with expandable AI Panel ─────────────────────────────── */
function PatientRow({ patient, i, patientId }) {
  const [showAI, setShowAI] = useState(false);
  return (
    <>
      <tr className="hover:bg-slate-50/50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="font-bold text-slate-900">{patient.id}</div>
          <div className="text-xs font-medium text-slate-500">Age: {patient.age}</div>
        </td>
        <td className="px-6 py-4">
          <div className="font-bold text-slate-700 text-sm">{patient.diagnosis}</div>
          <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
            <MapPin className="w-3 h-3" /><span>{patient.location}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm font-bold text-indigo-700 bg-indigo-50 inline-block px-3 py-1 rounded-lg">{patient.trial}</div>
          <div className="text-xs font-medium text-slate-500 mt-1 flex items-center space-x-1">
            {patient.status === 'Eligible'
              ? <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              : <AlertCircle className="w-3 h-3 text-amber-500" />}
            <span>{patient.status}</span>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <div className="text-lg font-extrabold text-brand-600">{patient.match}%</div>
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: `${patient.match}%` }} />
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {patientId ? (
            <button
              onClick={() => setShowAI(v => !v)}
              className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1.5 rounded-lg transition-colors">
              <Sparkles className="w-3.5 h-3.5" />
              {showAI ? 'Hide' : 'AI'}
            </button>
          ) : (
            <span className="text-xs text-slate-400 font-medium">No patient ID</span>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <button className="bg-white border border-slate-200 hover:border-brand-300 hover:text-brand-600 text-slate-600 p-2 rounded-xl transition-all shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
        </td>
      </tr>
      {showAI && patientId && (
        <tr>
          <td colSpan={6} className="px-6 pb-4">
            <AIMatchPanel patientId={patientId} />
          </td>
        </tr>
      )}
    </>
  );
}

/* ── Clinical Trial Matching tab ─────────────────────────────────────────── */
function AIMatchingTab({ patientId }) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">AI Clinical Trial Matching</h1>
        <p className="text-slate-500 mt-1">Use GPT-4o to evaluate patient eligibility and get personalised recommendations.</p>
      </div>

      {patientId ? (
        <AIMatchPanel patientId={patientId} />
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-800">No Patient ID Configured</p>
            <p className="text-sm text-amber-700 mt-1">
              Connect a real patient MongoDB ObjectId to <code className="font-mono bg-amber-100 px-1 rounded">DEMO_PATIENT_ID</code> in DoctorDashboard.jsx to enable live AI matching.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Doctor Profile ──────────────────────────────────────────────────────── */
function DoctorProfile() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleUpdate = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false); setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1200);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {showSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center space-x-3 mb-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="font-bold text-sm">Profile updated successfully!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Photo section */}
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Photo</h2>
          {/* Real Cloudinary upload */}
          <ProfileImageUploader size="lg" editable />
        </div>

        {/* Account info */}
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" defaultValue={user?.name || ''} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" defaultValue={user?.email || ''} />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors capitalize text-slate-500" value={user?.role || 'doctor'} readOnly />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Organization / Hospital</label>
              <input type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" placeholder="Enter your organization…" />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button onClick={handleUpdate} disabled={isSaving}
              className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center space-x-2 ${isSaving ? 'bg-brand-400 text-white cursor-not-allowed shadow-none' : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/30 active:scale-[0.98]'
                }`}>
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /><span>Saving…</span></> : <span>Update Profile</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Settings ────────────────────────────────────────────────────────────── */
function SettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Security &amp; Password</h3>
        <div className="space-y-4 max-w-md">
          <input type="password" placeholder="Current Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" />
          <input type="password" placeholder="New Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" />
          <button className="bg-brand-50 text-brand-700 px-6 py-3 rounded-xl font-bold hover:bg-brand-100 transition-colors mt-2">Change Password</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Privacy &amp; Preferences</h3>
        <div className="space-y-5">
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-600" defaultChecked />
            <div>
              <span className="block font-bold text-slate-700">Email Notifications</span>
              <span className="text-sm font-medium text-slate-500">Receive alerts when new matches are found.</span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-600" defaultChecked />
            <div>
              <span className="block font-bold text-slate-700">Strict Data Anonymization</span>
              <span className="text-sm font-medium text-slate-500">Automatically scrub PII from all uploads.</span>
            </div>
          </label>
        </div>
      </div>

      <div className="bg-red-50 rounded-2xl border border-red-100 p-8">
        <h3 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm font-medium text-red-600 mb-6 max-w-lg">Once you delete your account, there is no going back. All uploaded datasets and matches will be permanently deleted.</p>
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 shadow-sm transition-all">Delete Account</button>
      </div>
    </div>
  );
}
