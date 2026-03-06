import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ChevronRight, Stethoscope, UserCircle, ShieldCheck, HeartPulse } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

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

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen flex bg-[#F0F9F4] overflow-hidden text-[#1B5E3A] font-sans selection:bg-[#6BBF8A] selection:text-white">
      {/* Left Side - Info Display */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-16 bg-gradient-to-br from-[#1B5E3A] via-[#2E7D5C] to-[#0A2E1C] text-white relative">
        {/* Soft background decor */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }} 
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#A8D5BA]/20 blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -50, 0] }} 
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#6BBF8A]/20 blur-[100px]"
          />
        </div>

        {/* Top Logo / Title */}
        <div className="relative z-10 space-y-8 mt-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-3 mb-12 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-12 h-12 bg-white text-[#2E7D5C] rounded-2xl flex items-center justify-center shadow-xl hover:rotate-12 transition-transform">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-white">Clinerva</span>
          </motion.div>

          <motion.div variants={fadeInUp} initial="hidden" animate="show">
             <h1 className="text-4xl lg:text-5xl font-black leading-[1.15] tracking-tighter mb-6 text-white">
               Where Every Patient<br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A8D5BA] to-[#6BBF8A]">Finds Their Trial</span>
             </h1>
             <p className="text-[#A8D5BA] text-lg lg:text-xl font-medium max-w-md leading-relaxed">
               AI-powered platform connecting patients, doctors, and researchers securely and precisely.
             </p>
          </motion.div>
          
          <motion.div 
            variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.2 }}
            className="flex justify-center my-12 opacity-80 py-8 relative"
          >
            <ShieldCheck className="w-48 h-48 opacity-20 text-[#A8D5BA]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[3px] border-[#A8D5BA]/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-20"></div>
          </motion.div>
        </div>

        {/* Bottom Stats */}
        <motion.div 
          variants={fadeInUp} initial="hidden" animate="show" transition={{ delay: 0.4 }}
          className="relative z-10 grid grid-cols-3 gap-6 pt-12 border-t border-[#A8D5BA]/30"
        >
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight text-white">99.9%</p>
            <p className="text-[#A8D5BA] text-sm font-medium">Matching Accuracy</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight text-white">50K+</p>
            <p className="text-[#A8D5BA] text-sm font-medium">Patients Helped</p>
          </div>
          <div>
            <p className="text-3xl font-bold mb-1 tracking-tight text-white">100+</p>
            <p className="text-[#A8D5BA] text-sm font-medium">Clinical Trials</p>
          </div>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#F0F9F4] z-10">
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, -30, 0], y: [0, 40, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute top-20 right-20 w-72 h-72 bg-[#A8D5BA]/40 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, 40, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-20 left-20 w-72 h-72 bg-[#6BBF8A]/30 rounded-full blur-[100px]"
          />
        </div>

        {/* Glassmorphism Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
          className="w-full max-w-md bg-white/70 backdrop-blur-xl border border-white/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl shadow-[#2E7D5C]/10 relative z-10"
        >
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-[#1B5E3A] tracking-tighter">
              {isLoginMode ? 'Welcome Back' : 'Join Clinerva'}
            </h2>
            <p className="text-[#2E7D5C]/70 mt-2.5 font-medium text-sm">
              {isLoginMode ? 'Enter your details to sign in securely.' : 'Create an account to access the ecosystem.'}
            </p>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 border border-red-100 font-medium text-sm text-center"
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex p-1.5 bg-[#E8F5EE] rounded-2xl mb-8 border border-[#A8D5BA]/30 relative">
            <div 
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-white rounded-xl shadow-sm border border-[#A8D5BA]/40 transition-all duration-300 ease-out"
              style={{ left: role === 'patient' ? '6px' : 'calc(50%)' }}
            />
            
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`relative z-10 flex-1 py-3 px-4 flex items-center justify-center space-x-2 text-sm font-bold transition-colors ${
                role === 'patient' ? 'text-[#1B5E3A]' : 'text-[#2E7D5C]/60 hover:text-[#2E7D5C]'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              <span>Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`relative z-10 flex-1 py-3 px-4 flex items-center justify-center space-x-2 text-sm font-bold transition-colors ${
                role === 'doctor' ? 'text-[#1B5E3A]' : 'text-[#2E7D5C]/60 hover:text-[#2E7D5C]'
              }`}
            >
              <Stethoscope className="w-5 h-5" />
              <span>Doctor</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="popLayout">
              {!isLoginMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl focus:ring-4 focus:ring-[#A8D5BA]/30 focus:border-[#2E7D5C] transition-all outline-none font-medium text-[#1B5E3A] placeholder-[#2E7D5C]/40"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLoginMode}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            
            <div>
              <label className="block text-sm font-bold text-[#1B5E3A] mb-2">Email address</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl focus:ring-4 focus:ring-[#A8D5BA]/30 focus:border-[#2E7D5C] transition-all outline-none font-medium text-[#1B5E3A] placeholder-[#2E7D5C]/40"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-[#1B5E3A]">Password</label>
                {isLoginMode && (
                  <a href="#" className="text-sm font-bold text-[#2E7D5C] hover:text-[#1B5E3A] transition-colors">Forgot Password?</a>
                )}
              </div>
              <input 
                type="password" 
                className="w-full px-5 py-4 bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl focus:ring-4 focus:ring-[#A8D5BA]/30 focus:border-[#2E7D5C] transition-all outline-none font-medium text-[#1B5E3A] placeholder-[#2E7D5C]/40"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <motion.button 
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 px-6 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 mt-6 
                ${isLoading 
                  ? 'bg-[#A8D5BA] text-white cursor-not-allowed shadow-none' 
                  : 'bg-[#2E7D5C] hover:bg-[#1B5E3A] text-white shadow-[#2E7D5C]/30'
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
                  <span>{isLoginMode ? 'Sign In' : 'Create Account'}</span>
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-[#A8D5BA]/30">
            <p className="text-[#2E7D5C]/80 text-sm font-medium">
              {isLoginMode ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setErrorMsg('');
                }} 
                className="text-[#1B5E3A] font-bold hover:text-[#2E7D5C] transition-colors bg-[#E8F5EE] px-3 py-1 rounded-lg ml-1"
                type="button"
              >
                {isLoginMode ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
            <div className="mt-4 text-center pt-6 border-t border-[#A8D5BA]/30">Login as Researcher </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
