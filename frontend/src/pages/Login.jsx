import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Stethoscope, UserCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);
    
    // Simulate slight network delay for UI smoothness
    await new Promise(r => setTimeout(r, 600));

    let result;
    if (isLoginMode) {
      result = await login(email, password);
    } else {
      if (name.trim() === '') {
        setErrorMsg('Please enter your full name');
        setIsLoading(false);
        return;
      }
      result = await register(name, email, password, role.toUpperCase()); // Convert role to uppercase to match backend schema
    }

    if (result.success) {
      if (result.role === 'doctor') {
        navigate('/doctor-dashboard');
      } else {
        navigate('/patient-dashboard');
      }
    } else {
      setErrorMsg(result.message || 'Authentication failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden text-slate-900">
      {/* Left Side - Info Display */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-900 text-white relative">
        {/* Soft background decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-brand-400/20 blur-3xl"></div>
        </div>

        {/* Top Logo / Title */}
        <div className="relative z-10 space-y-8">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-white text-brand-700 rounded-2xl flex items-center justify-center shadow-xl">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <span className="text-3xl font-bold tracking-tight">Clinerva</span>
          </div>

          <div>
             <h1 className="text-4xl lg:text-5xl font-extrabold leading-[1.15] tracking-tight mb-6">
               Where Every Patient<br />Finds Their Trial
             </h1>
             <p className="text-brand-100 text-lg lg:text-xl font-medium max-w-md leading-relaxed">
               AI-powered platform connecting patients with the right clinical trials, safely and securely.
             </p>
          </div>
          
          <div className="flex justify-center my-12 opacity-80 py-8 relative">
            {/* Illustration placeholder using Lucide icons */}
            <Activity className="w-48 h-48 opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-white/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 grid grid-cols-3 gap-6 pt-12 border-t border-brand-500/50">
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight">99.9%</p>
            <p className="text-brand-200 text-sm font-medium">Matching Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight">50K+</p>
            <p className="text-brand-200 text-sm font-medium">Patients Helped</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight">100+</p>
            <p className="text-brand-200 text-sm font-medium">Clinical Trials</p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-gradient-to-br from-brand-50 via-white to-brand-100">
        {/* Abstract background shapes */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-brand-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-[pulse_4s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-[pulse_5s_ease-in-out_infinite]"></div>

        {/* Glassmorphism Login Card */}
        <div className="w-full max-w-md bg-white/50 backdrop-blur-xl border border-white/60 rounded-[2rem] p-8 sm:p-10 shadow-[0_8px_40px_0_rgba(31,38,135,0.05)] relative z-10">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{isLoginMode ? 'Welcome back' : 'Create an Account'}</h2>
            <p className="text-slate-500 mt-2.5 font-medium text-sm">
              {isLoginMode ? 'Please enter your details to sign in.' : 'Enter your details to register.'}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-600 border border-red-100 font-medium text-sm text-center animate-fade-in-up">
              {errorMsg}
            </div>
          )}

          <div className="flex p-1.5 bg-slate-100/60 rounded-2xl mb-8 backdrop-blur-md border border-white/50 shadow-inner">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all duration-300 ${
                role === 'patient' 
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center space-x-2 text-sm font-bold transition-all duration-300 ${
                role === 'doctor' 
                  ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all outline-none font-medium placeholder-slate-400"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={!isLoginMode}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Email address</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all outline-none font-medium placeholder-slate-400"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-slate-700">Password</label>
                {isLoginMode && (
                  <a href="#" className="text-sm font-bold text-brand-600 hover:text-brand-700 transition-colors">Forgot Password?</a>
                )}
              </div>
              <input 
                type="password" 
                className="w-full px-5 py-4 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all outline-none font-medium placeholder-slate-400"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 px-6 font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 mt-4 
                ${isLoading 
                  ? 'bg-brand-400 text-white cursor-not-allowed shadow-none' 
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/30 active:scale-[0.98]'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{isLoginMode ? 'Login' : 'Register'} as {role === 'doctor' ? 'Doctor' : 'Patient'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-200/50">
            <p className="text-slate-500 text-sm font-medium">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => setIsLoginMode(!isLoginMode)} 
                className="text-brand-600 font-bold hover:text-brand-700 transition-colors"
                type="button"
              >
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
