import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import HealthProfile from '../components/HealthProfile';
import { 
  LogOut, 
  UserCircle, 
  Activity, 
  FileText, 
  ChevronRight,
  LayoutDashboard,
  Brain,
  MapPin,
  Bookmark,
  Loader2,
  Bell,
  Settings,
  Search,
  Filter,
  CheckCircle2,
  Building2,
  Syringe,
  Calendar,
  HeartPulse,
  X
} from 'lucide-react';
import axios from 'axios';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State for Medical Info
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicalData, setMedicalData] = useState({
    age: 52,
    gender: "Male",
    diagnosis: "Type 2 Diabetes",
    medications: "Metformin",
    labResults: { HbA1c: 7.8, eGFR: 65 },
    smokingStatus: "Never",
    surgicalHistory: "None",
    location: "Mumbai"
  });

  // Fetch Patient Profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('clinerva_token');
        if (!token) return;

        const { data } = await axios.get('http://localhost:5000/api/patients/profile/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (data && data.patient) {
          const pt = data.patient;
          setMedicalData({
            age: pt.age || 52,
            gender: pt.gender || 'Male',
            diagnosis: pt.diagnosis || '',
            medications: Array.isArray(pt.medications) ? pt.medications.join(', ') : (pt.medications || ''),
            labResults: pt.labResults || { HbA1c: 0, eGFR: 0 },
            smokingStatus: pt.smokingStatus || 'Never',
            surgicalHistory: pt.surgicalHistory || 'None',
            location: pt.location || 'Mumbai'
          });
        }
      } catch (error) {
        console.error('Error fetching patient profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
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
      id: "T-8842",
      name: "Advanced Immunotherapy for Solid Tumors",
      condition: "Non-Small Cell Lung Cancer",
      score: 98,
      location: "San Francisco, CA (12 miles away)",
      hospital: "UCSF Medical Center",
      phase: "Phase II",
      status: "Recruiting",
      ageGroup: "18-65"
    },
    {
      id: "T-3190",
      name: "Targeted Therapy with T-Cell Engagement",
      condition: "Metastatic Melanoma",
      score: 94,
      location: "Stanford, CA (28 miles away)",
      hospital: "Stanford Health Care",
      phase: "Phase III",
      status: "Recruiting",
      ageGroup: "Adults"
    },
    {
      id: "T-1055",
      name: "Combination Therapy Clinical Study",
      condition: "Advanced Solid Tumors",
      score: 87,
      location: "Los Angeles, CA",
      hospital: "UCLA Medical Center",
      phase: "Phase I/II",
      status: "Active, not recruiting",
      ageGroup: "18+"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col z-20 sticky top-0 h-screen hidden lg:flex">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-brand-500/30">
            <UserCircle className="w-6 h-6 stroke-[2]" />
          </div>
          <span className="text-xl font-extrabold text-slate-800 tracking-tight">Clinerva Patient</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">Main Menu</p>
          
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.name 
                  ? 'bg-brand-50 text-brand-700' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.name ? 'text-brand-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
              {activeTab === item.name && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-600"></div>}
            </button>
          ))}
          
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-3 block">Account & Preferences</p>
          
          {navItems.slice(5).map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.name 
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

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-all group"
          >
            <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between z-10 sticky top-0">
          <h2 className="text-xl font-bold text-slate-800">{activeTab}</h2>
          
          <div className="flex items-center space-x-6">
            <div className="hidden sm:flex items-center space-x-3 pl-6">
               <div className="flex flex-col items-end">
                 <span className="text-sm font-bold text-slate-900">{user?.name || 'Patient'}</span>
                 <span className="text-xs font-semibold text-brand-600 capitalize">{user?.role || 'patient'}</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md overflow-hidden">
                 <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Patient'}`} alt={user?.name || 'Patient'} className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {activeTab === 'Dashboard' ? (
            <>
              <div className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Health Journey</h1>
              <p className="text-slate-500 mt-2 text-lg">AI-powered trial matching based on your unique medical profile.</p>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-50 text-brand-700 border border-brand-200 px-5 py-2.5 rounded-xl font-bold hover:bg-brand-100 transition-colors flex items-center space-x-2 w-fit"
            >
              <FileText className="w-5 h-5" />
              <span>Update Medical Info</span>
            </button>
          </div>

          {/* Top KPI Cards (Widgets) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  <HeartPulse className="w-6 h-6" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">+2 this week</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Recommended Trials</p>
                <p className="text-3xl font-extrabold text-slate-900">14</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute right-[-10px] bottom-[-10px] text-emerald-500/10">
                <CheckCircle2 className="w-32 h-32" />
              </div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Brain className="w-6 h-6" />
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-sm font-bold text-slate-500">Highest Match %</p>
                <div className="flex items-baseline space-x-2">
                  <p className="text-3xl font-extrabold text-emerald-600">98%</p>
                  <span className="text-sm font-medium text-slate-500">Accuracy</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MapPin className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Nearby Trials</p>
                <p className="text-3xl font-extrabold text-slate-900">6</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Within 50 miles</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow bg-gradient-to-br from-brand-600 to-indigo-700 text-white border-none shadow-brand-500/30">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center backdrop-blur-sm">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-brand-100">Application Status</p>
                <p className="text-3xl font-extrabold text-white">Pending</p>
                <p className="text-xs font-medium text-brand-200 mt-1">Trial T-8842</p>
              </div>
            </div>
          </div>

          {/* Main Content Area: Filters + Trial Cards */}
          <div className="flex flex-col xl:flex-row gap-8">
            
            {/* Filter Sidebar (Desktop) / Dropdown (Mobile) */}
            <div className="xl:w-64 shrink-0">
               <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-28">
                 <div className="flex items-center justify-between mb-6">
                   <h3 className="font-bold text-slate-900 flex items-center space-x-2">
                     <Filter className="w-5 h-5 text-brand-600" />
                     <span>Filters</span>
                   </h3>
                   <button className="text-xs font-bold text-brand-600 hover:text-brand-800">Clear</button>
                 </div>

                 <div className="space-y-6">
                   {/* Location Filter */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Location / Distance</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-500">
                       <option>Within 25 Miles</option>
                       <option>Within 50 Miles</option>
                       <option>Within 100 Miles</option>
                       <option>Anywhere (Remote/Travel)</option>
                     </select>
                   </div>
                   
                   {/* Disease Filter */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Disease / Condition</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-500">
                       <option>All My Conditions</option>
                       <option>Non-Small Cell Lung Cancer</option>
                       <option>Asthma</option>
                     </select>
                   </div>

                   {/* Trial Phase Filter */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Trial Phase</label>
                     <div className="space-y-2">
                       {['Phase I', 'Phase II', 'Phase III', 'Phase IV'].map(phase => (
                         <label key={phase} className="flex items-center space-x-2">
                           <input type="checkbox" className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4 border-slate-300" defaultChecked={phase === 'Phase II' || phase === 'Phase III'} />
                           <span className="text-sm font-medium text-slate-600">{phase}</span>
                         </label>
                       ))}
                     </div>
                   </div>

                   {/* Age Group Filter */}
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Age Group</label>
                     <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-500">
                       <option>Adults (18-65)</option>
                       <option>Seniors (65+)</option>
                       <option>Pediatric (0-17)</option>
                     </select>
                   </div>
                 </div>
               </div>
            </div>

            {/* Trial Cards List */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-slate-800">Top Trial Matches ({trialMatches.length})</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-500">Sort by:</span>
                  <select className="bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer">
                    <option>Eligibility Score</option>
                    <option>Distance</option>
                    <option>Newest</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 animate-pulse mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div className="flex space-x-2">
                          <div className="w-16 h-6 bg-slate-200 rounded-full"></div>
                          <div className="w-24 h-6 bg-slate-200 rounded-full"></div>
                        </div>
                        <div className="w-3/4 h-8 bg-slate-200 rounded-lg"></div>
                        <div className="w-1/2 h-4 bg-slate-200 rounded"></div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                           <div className="w-full h-10 bg-slate-100 rounded-lg"></div>
                           <div className="w-full h-10 bg-slate-100 rounded-lg"></div>
                        </div>
                      </div>
                      <div className="w-full lg:w-48 xl:w-56 shrink-0 h-40 bg-slate-100 rounded-xl"></div>
                    </div>
                  </div>
                ))
              ) : (
                trialMatches.map((trial, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group animate-fade-in-up mb-6" style={{ animationDelay: `${idx * 150}ms` }}>
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                      {/* Trial Info */}
                      <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full">{trial.phase}</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1 ${
                          trial.status === 'Recruiting' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${trial.status === 'Recruiting' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                          <span>{trial.status}</span>
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full">Age: {trial.ageGroup}</span>
                      </div>
                      
                      <h4 className="text-2xl font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2 leading-tight">
                        {trial.name}
                      </h4>
                      <p className="text-brand-600 font-semibold mb-4 text-sm flex items-center space-x-1">
                        <Syringe className="w-4 h-4" />
                        <span>Condition: {trial.condition}</span>
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium text-slate-500">
                        <div className="flex items-start space-x-2">
                          <Building2 className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-700 font-bold">{trial.hospital}</span>
                            <span>Hospital / Research Center</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="block text-slate-700 font-bold">{trial.location}</span>
                            <span>Distance / Area</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Score & Actions */}
                    <div className="flex flex-col items-start lg:items-end justify-between min-w-[200px] border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6">
                      <div className="w-full flex lg:flex-col items-center lg:items-end justify-between lg:justify-start mb-6 lg:mb-0">
                        <div className="text-center lg:text-right">
                          <span className="block text-4xl font-extrabold text-emerald-600">{trial.score}%</span>
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center justify-end space-x-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Eligibility Score</span>
                          </span>
                        </div>
                        <div className="w-12 h-12 lg:w-16 lg:h-16 lg:mt-4 hidden sm:block">
                          {/* Circular progress visual */}
                          <svg viewBox="0 0 36 36" className="w-full h-full text-emerald-500">
                            <path
                              className="text-slate-100"
                              fill="none"
                              strokeWidth="3"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                              className="text-emerald-500"
                              fill="none"
                              strokeWidth="3"
                              strokeDasharray={`${trial.score}, 100`}
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                          </svg>
                        </div>
                      </div>
                      
                      <div className="w-full flex flex-col space-y-2 lg:mt-6">
                        <button className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-[0.98] flex items-center justify-center space-x-2">
                          <span>Apply for Trial</span>
                        </button>
                        <button className="w-full bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 py-2.5 px-4 rounded-xl font-bold transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
            </>
          ) : activeTab === 'My Health Profile' ? (
            <HealthProfile patient={medicalData} isLoading={isLoading} />
          ) : activeTab === 'Profile' ? (
            <PatientProfile medicalData={medicalData} onEdit={() => setIsModalOpen(true)} />
          ) : activeTab === 'Settings' ? (
            <SettingsView />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 font-medium">
              View under construction
            </div>
          )}
        </div>
      </main>

      {/* --- Medical Info Modal --- */}
      {isModalOpen && (
        <MedicalInfoModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          data={medicalData}
          onSave={setMedicalData}
        />
      )}
    </div>
  );
}

function PatientProfile({ medicalData, onEdit }) {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-md overflow-hidden shrink-0">
              <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.name || 'Patient'}`} alt={user?.name || 'Patient'} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Patient'}</h2>
              <p className="text-brand-600 font-bold tracking-wide text-sm mt-1 bg-brand-50 inline-block px-3 py-1 rounded-md capitalize">{user?.role || 'Patient'}</p>
            </div>
          </div>
          <button 
            onClick={onEdit}
            className="flex items-center space-x-2 bg-brand-50 hover:bg-brand-100 text-brand-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left Column: Demographics & Account */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Account Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Email Address</span>
                    <span className="block text-base font-bold text-slate-900">{user?.email || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Location</span>
                    <span className="block text-base font-bold text-slate-900">{medicalData?.location || 'Not specified'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vitals & Demographics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Age</span>
                    <span className="block text-xl font-extrabold text-slate-800">{medicalData?.age || '--'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">Gender</span>
                    <span className="block text-xl font-extrabold text-slate-800">{medicalData?.gender || '--'}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">HbA1c</span>
                    <span className="block text-xl font-extrabold text-emerald-600">{medicalData?.labResults?.HbA1c || '--'}%</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="block text-xs font-semibold text-slate-500 mb-1">eGFR</span>
                    <span className="block text-xl font-extrabold text-emerald-600">{medicalData?.labResults?.eGFR || '--'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Clinical Profile */}
            <div className="space-y-8">
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Clinical Profile</span>
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Primary Diagnosis</span>
                    <div className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                      {medicalData?.diagnosis || 'None'}
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-2">Current Medications</span>
                    <div className="flex flex-wrap gap-2">
                      {medicalData?.medications ? (
                        medicalData.medications.split(',').map((med, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm font-semibold">
                            {med.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm font-medium text-slate-400">No medications listed</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Surgical History</span>
                    <p className="text-sm font-bold text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {medicalData?.surgicalHistory || 'None'}
                    </p>
                  </div>

                  <div>
                    <span className="block text-sm font-semibold text-slate-500 mb-1">Smoking Status</span>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                      medicalData?.smokingStatus === 'Current' ? 'bg-red-50 text-red-600' :
                      medicalData?.smokingStatus === 'Former' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {medicalData?.smokingStatus || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Security & Password</h3>
        <div className="space-y-4 max-w-md">
          <input type="password" placeholder="Current Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" />
          <input type="password" placeholder="New Password" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 transition-colors" />
          <button className="bg-brand-50 text-brand-700 px-6 py-3 rounded-xl font-bold hover:bg-brand-100 transition-colors mt-2">Change Password</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-900 mb-6">Privacy & Preferences</h3>
        <div className="space-y-5">
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-brand-600" defaultChecked />
            <div>
              <span className="block font-bold text-slate-700">Email Notifications</span>
              <span className="text-sm font-medium text-slate-500">Receive alerts when new matches are found.</span>
            </div>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer" defaultChecked/>
                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-5 rounded-full bg-brand-500 cursor-pointer"></label>
            </div>
            <div>
              <span className="block font-bold text-slate-700">Data Anonymization</span>
              <span className="text-sm font-medium text-slate-500">Keep my personal info hidden from researchers until I apply.</span>
            </div>
          </label>
        </div>
      </div>
      
      <div className="bg-red-50 rounded-2xl border border-red-100 p-8">
        <h3 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h3>
        <p className="text-sm font-medium text-red-600 mb-6 max-w-lg">Once you delete your account, there is no going back. You will lose access to all your clinical trial matches and medical profile data.</p>
        <button className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 shadow-sm transition-all">Delete Account</button>
      </div>
    </div>
  );
}

// ── Medical Info Modal Component ─────────────────────────────────────────────
function MedicalInfoModal({ isOpen, onClose, data, onSave }) {
  const [formData, setFormData] = useState({ ...data });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('lab_')) {
      const labKey = name.split('_')[1];
      setFormData(prev => ({
        ...prev,
        labResults: { ...prev.labResults, [labKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('clinerva_token');
      
      const payload = { ...formData };
      
      const res = await axios.post('http://localhost:5000/api/patients/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        onSave(formData);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile data. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-6 h-6 text-brand-600" />
              Update Medical Information
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Ensure your health profile is accurate for better trial matching.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto custom-scroll space-y-6 flex-1">
          {/* Section 1: Demographics */}
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Demographics</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Age</label>
                <input 
                  type="number" name="age" value={formData.age} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Gender</label>
                <select 
                  name="gender" value={formData.gender} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                <input 
                  type="text" name="location" value={formData.location} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Details */}
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Clinical Details</p>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Diagnosis</label>
                <input 
                  type="text" name="diagnosis" value={formData.diagnosis} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Medications (Comma separated)</label>
                <input 
                  type="text" name="medications" value={formData.medications} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Surgical History</label>
                <input 
                  type="text" name="surgicalHistory" value={formData.surgicalHistory} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Lab Results & Lifestyle */}
          <div>
            <p className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Vitals & Lifestyle</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">HbA1c</label>
                <input 
                  type="number" step="0.1" name="lab_HbA1c" value={formData.labResults?.HbA1c || 0} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">eGFR</label>
                <input 
                  type="number" name="lab_eGFR" value={formData.labResults?.eGFR || 0} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Smoking Status</label>
                <select 
                  name="smokingStatus" value={formData.smokingStatus} onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-500 text-sm font-medium"
                >
                  <option value="Never">Never</option>
                  <option value="Former">Former</option>
                  <option value="Current">Current</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 flex items-center justify-end space-x-4 shrink-0 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all ${
              isSubmitting 
                ? 'bg-brand-400 cursor-not-allowed text-white/80' 
                : 'bg-brand-600 shadow-lg shadow-brand-500/30 hover:bg-brand-700 active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
               <span className="flex items-center space-x-2"><Loader2 className="w-5 h-5 animate-spin"/> <span>Saving...</span></span>
            ) : "Save Information"}
          </button>
        </div>
      </div>
    </div>
  );
}
