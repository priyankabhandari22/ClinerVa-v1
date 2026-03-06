import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Brain, 
  Stethoscope, 
  Users, 
  ChevronRight, 
  ShieldCheck, 
  Zap, 
  Globe 
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen">
      
      {/* Navbar */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-2xl font-extrabold tracking-tight">Clinerva</span>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">How it Works</a>
              <a href="#for-patients" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">For Patients</a>
              <a href="#for-doctors" className="text-sm font-bold text-slate-600 hover:text-brand-600 transition-colors">For Doctors</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-brand-600 transition-colors hidden sm:block">Log in</Link>
              <Link to="/login" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide shadow-lg shadow-brand-500/30 transition-all active:scale-95">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-brand-50 to-white -z-10"></div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-brand-400/20 blur-[100px] rounded-full -z-10 mix-blend-multiply"></div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-brand-50 border border-brand-100 px-4 py-2 rounded-full mb-8">
             <span className="flex h-2 w-2 relative">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
             </span>
             <span className="text-xs font-bold text-brand-700 uppercase tracking-widest">The Future of Medical Research</span>
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-slate-900">
            Where Every Patient <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">Finds Their Trial</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium mb-12 leading-relaxed">
            Clinerva is an AI-powered clinical trial eligibility Platform. We securely bridge the gap between complex medical records and life-saving research opportunities.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-500/30 hover:bg-brand-700 hover:-translate-y-1 transition-all flex items-center justify-center space-x-2">
              <span>Find a Trial Today</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-2xl font-bold text-lg shadow-sm border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-all">
              See How It Works
            </a>
          </div>

          {/* Hero Image Mockup */}
          <div className="mt-20 mx-auto max-w-5xl relative">
            <div className="rounded-3xl border border-slate-200/50 bg-white/50 backdrop-blur-xl shadow-2xl overflow-hidden relative z-10 p-2">
              <div className="bg-slate-100 rounded-2xl aspect-video w-full flex items-center justify-center border border-slate-200 overflow-hidden relative">
                 {/* Decorative mock UI */}
                 <div className="absolute top-0 left-0 w-full h-full bg-slate-50 opacity-90 p-8 flex flex-col gap-4 text-left">
                   <div className="w-1/3 h-8 bg-slate-200 rounded-lg"></div>
                   <div className="w-full h-full border border-slate-200 bg-white rounded-xl p-6 shadow-sm flex flex-col gap-4">
                     <div className="flex gap-4">
                       <div className="w-12 h-12 bg-indigo-100 rounded-xl"></div>
                       <div className="flex flex-col gap-2">
                         <div className="w-48 h-4 bg-slate-200 rounded"></div>
                         <div className="w-32 h-3 bg-slate-100 rounded"></div>
                       </div>
                     </div>
                     <div className="w-full flex-1 bg-slate-50 border border-slate-100 rounded-lg mt-4 flex items-center justify-center">
                       <Brain className="w-16 h-16 text-slate-300 animate-pulse" />
                     </div>
                   </div>
                 </div>
              </div>
            </div>
            {/* Glow under mockup */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-4/5 h-20 bg-brand-500/30 blur-3xl rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Features / How it works */}
      <section id="how-it-works" className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">Driven By Intelligent Matching</h2>
            <p className="text-lg text-slate-500 font-medium">Finding the right clinical trial used to take months. Our AI matching engine evaluates thousands of trials against patient data in seconds, securely and accurately.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Anonymized & Secure", desc: "Patient data is stripped of PII. Security and HIPAA compliance are built into our foundation.", color: "bg-emerald-50 text-emerald-600" },
              { icon: Brain, title: "AI-Powered Parsing", desc: "Our engine converts complex trial inclusion/exclusion text into structured rules automatically.", color: "bg-indigo-50 text-indigo-600" },
              { icon: Zap, title: "Real-time Matching", desc: "Get ranked trial recommendations instantly with detailed explanations and eligibility scores.", color: "bg-amber-50 text-amber-600" }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg transition-all">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Doctors / Patients split */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* For Doctors */}
          <div id="for-doctors" className="flex flex-col lg:flex-row items-center gap-16 mb-24">
            <div className="flex-1 lg:order-2">
              <div className="relative">
                <div className="absolute inset-0 bg-brand-200 rounded-[3rem] transform rotate-3 scale-105"></div>
                <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-10 lg:p-12 rounded-[3rem] text-white shadow-2xl">
                   <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/20 mb-8 backdrop-blur-sm">
                     <Stethoscope className="w-8 h-8 text-brand-300" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4">Empower Your Practice</h3>
                   <ul className="space-y-4 mb-8">
                     {['Upload anonymized patient cohorts', 'Track patient application status', 'Filter trials by biomarker & phase', 'Detailed clinical eligibility reasoning'].map((li, i) => (
                       <li key={i} className="flex items-center space-x-3 text-slate-300 font-medium">
                         <ChevronRight className="w-5 h-5 text-brand-400" />
                         <span>{li}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>
            <div className="flex-1 lg:order-1 lg:pr-12">
              <h2 className="text-4xl font-extrabold mb-6">For Doctors & Researchers</h2>
              <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">Spend less time searching through databases and more time treating patients. Clinerva provides healthcare professionals with a unified dashboard to effortlessly match patient cohorts to active, recruiting trials globally.</p>
              <Link to="/login" className="inline-flex items-center space-x-2 text-brand-600 font-bold text-lg hover:text-brand-700 transition-colors">
                <span>Explore Doctor Portal</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* For Patients */}
          <div id="for-patients" className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-200 rounded-[3rem] transform -rotate-3 scale-105"></div>
                <div className="relative bg-gradient-to-br from-brand-600 to-indigo-700 p-10 lg:p-12 rounded-[3rem] text-white shadow-2xl border border-white/10">
                   <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/30 mb-8 backdrop-blur-sm">
                     <Users className="w-8 h-8 text-white" />
                   </div>
                   <h3 className="text-3xl font-bold mb-4">Take Control of Your Health</h3>
                   <ul className="space-y-4 mb-8">
                     {['View trials customized to your profile', 'Understand your specific match score', 'Find trials near your location', 'Apply directly to research centers'].map((li, i) => (
                       <li key={i} className="flex items-center space-x-3 text-indigo-100 font-medium">
                         <ChevronRight className="w-5 h-5 text-white" />
                         <span>{li}</span>
                       </li>
                     ))}
                   </ul>
                </div>
              </div>
            </div>
            <div className="flex-1 lg:pl-12">
              <h2 className="text-4xl font-extrabold mb-6">For Patients & Families</h2>
              <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed">Navigating medical research is daunting. We translate complex trial requirements to show exactly why you might be a fit for cutting-edge treatments—all presented in an easy-to-understand layout.</p>
              <Link to="/login" className="inline-flex items-center space-x-2 text-indigo-600 font-bold text-lg hover:text-indigo-700 transition-colors">
                <span>View Patient Dashboard</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 pt-20 pb-10 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 border-b border-slate-800 pb-16">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-brand-600 text-white rounded-lg flex items-center justify-center">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">Clinerva</span>
              </div>
              <p className="text-sm font-medium max-w-sm">
                Where every patient finds their trial. Advancing medical research through intelligent matching.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-sm font-medium">
            <p>© 2026 Clinerva, Inc. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">HIPAA Compliance</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
