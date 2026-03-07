import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';

const AnimatedFindButton = ({ onClick, isLoading, hasSearched, resultsCount }) => {
  const [loadingStep, setLoadingStep] = useState(0);
  const [isSuccessFlash, setIsSuccessFlash] = useState(false);
  const [particles, setParticles] = useState([]);
  
  // Loading sequence steps
  useEffect(() => {
    let timers = [];
    if (isLoading) {
      setLoadingStep(0);
      timers.push(setTimeout(() => setLoadingStep(1), 800));
      timers.push(setTimeout(() => setLoadingStep(2), 1800));
      timers.push(setTimeout(() => setLoadingStep(3), 2800));
    }
    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  // Success flash
  useEffect(() => {
    // If it was loading and now it's not, and it was a search, flash!
    if (hasSearched && !isLoading && resultsCount !== undefined) {
      setIsSuccessFlash(true);
      const timer = setTimeout(() => {
        setIsSuccessFlash(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasSearched, resultsCount]);

  const triggerParticles = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create 12 particles
    const newParticles = Array.from({ length: 12 }).map((_, i) => {
      // Upward random spread (between PI and 2 * PI, meaning upper half in standard screen coordinates (Y down))
      const a = (Math.random() * Math.PI) + Math.PI; 
      const distance = Math.random() * 60 + 40;
      const dx = Math.cos(a) * distance;
      const dy = Math.sin(a) * distance;
      const size = Math.random() * 4 + 4; // 4 to 8px
      const colors = ['#00BFA6', '#1a3c6e', '#ffffff'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      return { id: Date.now() + i + Math.random(), x, y, dx, dy, size, color };
    });
    
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 800);
  };

  const handleClick = (e) => {
    if (isLoading) return;
    triggerParticles(e);
    onClick(e);
  };

  const steps = [
    { label: "Fetching profile" },
    { label: "Running AI match" },
    { label: "Scoring trials" },
    { label: "Ready!" },
  ];

  // Post-success smaller state ("Search Again")
  if (hasSearched && !isLoading && !isSuccessFlash) {
    return (
      <button 
        onClick={handleClick}
        className="ml-auto h-12 bg-white text-brand-600 border border-brand-200 hover:bg-brand-50 rounded-xl px-6 font-bold shadow-sm transition-all active:scale-95 flex items-center space-x-2 relative overflow-hidden group mb-6"
      >
        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
        <span>Search Again</span>
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none animate-burst-particle"
            style={{
              left: p.x - p.size/2,
              top: p.y - p.size/2,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`
            }}
          />
        ))}
      </button>
    );
  }

  // Loading, Idle, or Success Flash state
  return (
    <div className="flex flex-col items-center w-full">
      <button
        onClick={handleClick}
        disabled={isLoading || isSuccessFlash}
        className={`relative w-full rounded-2xl overflow-hidden transition-all duration-300 ease-in-out font-sans group ${
          isSuccessFlash 
            ? 'h-[72px] bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_8px_32px_rgba(16,185,129,0.4)] animate-success-bounce text-white border-none' 
          : isLoading
            ? 'h-[72px] opacity-85 shadow-[0_8px_32px_rgba(0,191,166,0.35)] cursor-wait text-white border border-white/20'
          : 'h-[72px] shadow-[0_8px_32px_rgba(0,191,166,0.35)] hover:shadow-[0_12px_48px_rgba(0,191,166,0.55)] hover:-translate-y-[3px] active:translate-y-[1px] active:scale-[0.98] active:shadow-[0_4px_16px_rgba(0,191,166,0.25)] text-white hover:cursor-pointer animate-shadow-breathe border border-white/20'
        }`}
        style={{
          background: !isSuccessFlash ? 'linear-gradient(90deg, #1a3c6e 0%, #00BFA6 50%, #1a3c6e 100%)' : undefined,
          backgroundSize: '200% 200%',
          animation: !isSuccessFlash ? (isLoading ? 'bg-gradient-sweep 5s ease-in-out infinite' : 'bg-gradient-sweep 3s ease-in-out infinite') : 'none'
        }}
        aria-label="Find My Matching Trials"
      >
        {/* Shimmer sweep */}
        {!isLoading && !isSuccessFlash && (
          <div className="absolute inset-0 w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:animate-shimmer-sweep pointer-events-none mix-blend-overlay" />
        )}

        {/* Floating particles (idle) */}
        {!isLoading && !isSuccessFlash && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute left-[20%] top-full w-1 h-1 bg-white rounded-full flex animate-float-up-fade" style={{ animationDelay: '0s' }} />
            <div className="absolute left-[50%] top-full w-1.5 h-1.5 bg-white rounded-full flex animate-float-up-fade opacity-50" style={{ animationDelay: '1s' }} />
            <div className="absolute left-[80%] top-full w-1 h-1 bg-white rounded-full flex animate-float-up-fade" style={{ animationDelay: '2s' }} />
          </div>
        )}

        {/* Content Container */}
        <div className="absolute inset-0 flex items-center justify-between px-8">
          {/* Left Icon */}
          <div className="w-8 shrink-0 flex items-center justify-center">
            {isSuccessFlash ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : isLoading ? (
              <div className="relative w-6 h-6 flex animate-[loader-spin_1s_linear_infinite]">
                {/* 3 dots orbiting in circle */}
                <div className="absolute top-0 left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            ) : (
              // Pulse/Heartbeat SVG
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-[28px] h-[28px] animate-pulse-heartbeat text-white drop-shadow-sm">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            )}
          </div>

          {/* Center Text */}
          <div className="flex flex-col items-center justify-center pointer-events-none select-none">
            {isSuccessFlash ? (
              <span className="text-xl font-bold tracking-wide drop-shadow-sm">✅ {resultsCount} {resultsCount === 1 ? 'Trial' : 'Trials'} Found!</span>
            ) : isLoading ? (
              <>
                <span className="text-[18px] font-bold tracking-[0.5px] drop-shadow-sm leading-tight text-white/95">Analyzing Your Profile...</span>
                <span className="text-[11px] font-medium text-white/70 tracking-[1px] mt-0.5 relative">
                  AI is working<span className="typing-dots inline-block absolute pl-0.5"></span>
                </span>
              </>
            ) : (
              <>
                <span className="text-[18px] font-bold tracking-[0.5px] drop-shadow-sm leading-tight text-white">Find My Matching Trials</span>
                <span className="text-[11px] font-medium text-white/70 tracking-[1px] mt-0.5">Powered by Clinerva AI</span>
              </>
            )}
          </div>

          {/* Right Icon */}
          <div className="w-8 shrink-0 flex items-center justify-center">
            {isSuccessFlash ? (
              <Sparkles className="w-6 h-6 text-emerald-100" />
            ) : isLoading ? (
              // Progress Arc
              <svg className="w-7 h-7 transform -rotate-90">
                <circle cx="14" cy="14" r="12" stroke="rgba(255,255,255,0.2)" strokeWidth="3" fill="none" />
                <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="3" fill="none" className="transition-all duration-300 ease-linear" strokeDasharray="75.4" strokeDashoffset={75.4 - (75.4 * (loadingStep+1)/4)} />
              </svg>
            ) : (
               // Sparkles/Stars spinning
              <span className="text-[28px] leading-none animate-spin-twinkle flex origin-center text-white mix-blend-screen drop-shadow-md pb-1">✨</span>
            )}
          </div>
        </div>

        {/* Burst Particles */}
        {particles.map(p => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none animate-burst-particle z-10"
            style={{
              left: p.x - p.size/2,
              top: p.y - p.size/2,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              '--dx': `${p.dx}px`,
              '--dy': `${p.dy}px`
            }}
          />
        ))}
      </button>

      {/* Loading Steps underneath */}
      <div 
        className={`mt-4 flex flex-row items-center justify-center w-full transition-all duration-500 overflow-hidden ${
          isLoading ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0'
        }`}
      >
        {steps.map((step, idx) => {
          const isActive = loadingStep === idx;
          const isDone = loadingStep > idx;
          return (
            <div key={idx} className="flex items-center">
              <div 
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all duration-300 shadow-sm border ${
                  isDone ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  isActive ? 'bg-blue-50 text-blue-700 ring-2 ring-blue-300/50 border-blue-200 animate-pulse' :
                  'bg-slate-50 text-slate-400 border-slate-200'
                }`}
              >
                {isDone ? <span>✅</span> : <span>⏳</span>}
                <span className="hidden sm:inline-block">{step.label}</span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-3 sm:w-6 h-[2px] rounded-full mx-1 sm:mx-2 transition-colors duration-500 ${loadingStep > idx ? 'bg-emerald-300' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimatedFindButton;
