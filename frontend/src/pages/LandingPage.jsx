import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Activity, ShieldCheck, Microscope, Cpu, Users,
  Menu, X, ArrowRight, Star, HeartPulse,
  UserCircle, ClipboardList, FlaskConical, Sparkles,
  Send, Phone, MapPin, Mail, ThumbsUp, MessageSquare,
  CheckCircle2
} from "lucide-react";

// ─── SPLASH SCREEN ───────────────────────────────────────────────────────────
const SplashScreen = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F0F9F4]"
  >
    <div className="flex flex-col items-center gap-6">
      <motion.div
        animate={{ rotate: [-10, 10, -10] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="bg-[#2E7D5C] p-8 rounded-[2.5rem] shadow-2xl shadow-[#2E7D5C]/20"
      >
        <Activity className="text-white w-20 h-20 md:w-32 md:h-32" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="text-4xl md:text-6xl font-black text-[#1B5E3A] tracking-tighter"
      >
        Clinerva
      </motion.h1>
      <div className="w-48 h-1.5 bg-[#A8D5BA]/30 rounded-full mt-4 overflow-hidden">
        <motion.div
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 4, ease: "linear" }}
          className="w-full h-full bg-[#2E7D5C]"
        />
      </div>
    </div>
  </motion.div>
);

const NAV_ITEMS = ["Home", "Features", "How It Works", "Reviews", "Contact"];

// ─── STAR RATING COMPONENT ────────────────────────────────────────────────────
const StarRating = ({ rating, onChange }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button key={s} type="button" onClick={() => onChange(s)}>
        <Star
          size={24}
          className="transition-colors"
          fill={s <= rating ? "#F59E0B" : "none"}
          stroke={s <= rating ? "#F59E0B" : "#9CA3AF"}
        />
      </button>
    ))}
  </div>
);

export default function LandingPage() {
  const [menu, setMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("home");

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactSent, setContactSent] = useState(false);

  // User review form state
  const [reviewForm, setReviewForm] = useState({ name: "", role: "", rating: 5, text: "" });
  const [userReviews, setUserReviews] = useState([]);
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // IntersectionObserver
  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((item) => item.toLowerCase().replace(/\s+/g, "-"));
    const observers = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, [isLoading]);

  const handleContactSubmit = () => {
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSent(true);
    setContactForm({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setContactSent(false), 4000);
  };

  const handleReviewSubmit = () => {
    if (!reviewForm.name || !reviewForm.text) return;
    setUserReviews((prev) => [{ ...reviewForm, date: new Date().toLocaleDateString() }, ...prev]);
    setReviewSent(true);
    setReviewForm({ name: "", role: "", rating: 5, text: "" });
    setTimeout(() => setReviewSent(false), 4000);
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const marqueeTestimonials = [
    { name: "Dr. Sarah Chen", role: "Oncologist", text: "Clinerva has reduced our diagnostic turnaround by 40%. The AI insights are incredibly precise." },
    { name: "James Wilson", role: "Patient", text: "Having all my records in one secure place makes coordinating with specialists so much easier." },
    { name: "Dr. Aris Thorne", role: "Lead Researcher", text: "The anonymized datasets provided here are a goldmine for genomic research." },
    { name: "Maria Garcia", role: "Clinic Manager", text: "The most intuitive dashboard I've used in 15 years of healthcare administration." },
    { name: "David Kim", role: "Radiologist", text: "Collaborating with researchers in real-time has changed how we approach complex cases." },
  ];

  const howItWorksSteps = [
    { icon: <UserCircle size={32} />, step: "01", title: "Create Your Profile", desc: "Sign up as a doctor, patient, or researcher. Your role determines your personalised dashboard and data access levels.", color: "#2E7D5C" },
    { icon: <ClipboardList size={32} />, step: "02", title: "Connect Your Records", desc: "Securely upload or sync existing medical records. Our encryption ensures only authorised parties can access your data.", color: "#3A8F6B" },
    { icon: <Cpu size={32} />, step: "03", title: "AI Analyses Your Data", desc: "Our diagnostic engine scans patterns across global anonymised datasets to surface insights and flag anomalies in real time.", color: "#4BA57A" },
    { icon: <FlaskConical size={32} />, step: "04", title: "Collaborate & Research", desc: "Share findings with your care team or contribute anonymised data to the global research hub to advance medical science.", color: "#5DBF8A" },
    { icon: <Sparkles size={32} />, step: "05", title: "Better Outcomes", desc: "Faster diagnoses, reduced errors, and smarter treatment plans — powered by collective intelligence.", color: "#6BBF8A" },
  ];

  return (
    <>
      <AnimatePresence>
        {isLoading && <SplashScreen key="splash" />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen bg-[#F0F9F4] text-[#1B5E3A] overflow-x-hidden font-sans selection:bg-[#6BBF8A] selection:text-white"
      >
        {/* BG ORBS */}
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
          <motion.div animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[10%] -left-[10%] w-[500px] h-[500px] rounded-full bg-[#A8D5BA]/30 blur-[120px]" />
          <motion.div animate={{ scale: [1, 1.3, 1], x: [0, -80, 0], y: [0, -100, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#6BBF8A]/20 blur-[120px]" />
        </div>

        {/* ── NAVBAR ── */}
        <nav className="fixed w-full z-50 backdrop-blur-xl bg-white/70 border-b border-[#A8D5BA]/30 px-6 md:px-16 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-[#2E7D5C] p-2 rounded-lg group-hover:rotate-12 transition-transform">
              <Activity className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1B5E3A]">Clinerva</h1>
          </div>

          <div className="hidden md:flex gap-7 items-center font-medium text-sm uppercase tracking-wider">
            {NAV_ITEMS.map((item) => {
              const id = item.toLowerCase().replace(/\s+/g, "-");
              const isActive = activeSection === id;
              return (
                <a key={item} href={`#${id}`} className="relative transition-all duration-300 whitespace-nowrap"
                  style={{ color: isActive ? "#2E7D5C" : "#1B5E3A", fontSize: isActive ? "0.95rem" : "0.78rem", fontWeight: isActive ? "800" : "500" }}>
                  {item}
                  <span className="absolute bottom-[-5px] left-0 h-[2.5px] rounded-full bg-[#2E7D5C] transition-all duration-300" style={{ width: isActive ? "100%" : "0%" }} />
                  {isActive && (
                    <motion.span layoutId="nav-dot" className="absolute -top-1 -right-2 w-1.5 h-1.5 rounded-full bg-[#6BBF8A]"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                  )}
                </a>
              );
            })}
          </div>

          <a href="/login" className="hidden md:block bg-[#2E7D5C] text-white px-6 py-2.5 rounded-full font-semibold hover:bg-[#1B5E3A] hover:shadow-lg transition-all active:scale-95">
            Join Us
          </a>
          <button className="md:hidden p-2 text-[#2E7D5C]" onClick={() => setMenu(!menu)}>
            {menu ? <X /> : <Menu />}
          </button>
        </nav>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {menu && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "100vh" }} exit={{ opacity: 0, height: 0 }}
              className="fixed inset-0 z-40 bg-white pt-24 px-8 md:hidden flex flex-col gap-8 overflow-auto">
              {NAV_ITEMS.map((item) => {
                const id = item.toLowerCase().replace(/\s+/g, "-");
                const isActive = activeSection === id;
                return (
                  <a key={item} href={`#${id}`} onClick={() => setMenu(false)} className="transition-all duration-300"
                    style={{ fontSize: isActive ? "2rem" : "1.75rem", fontWeight: isActive ? "900" : "700", color: isActive ? "#2E7D5C" : "#1B5E3A" }}>
                    {isActive && <span className="mr-2 text-[#6BBF8A]">→</span>}
                    {item}
                  </a>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── HERO ── */}
        <section id="home" className="relative pt-44 pb-20 px-6 flex flex-col items-center text-center">
          <motion.h1 variants={fadeInUp} initial="hidden" whileInView="show"
            className="text-5xl md:text-8xl font-black leading-tight max-w-5xl tracking-tighter">
            Where Medicine Meets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D5C] to-[#6BBF8A]">Data Intelligence.</span>
          </motion.h1>
          <motion.p variants={fadeInUp} initial="hidden" whileInView="show"
            className="mt-8 max-w-2xl text-lg md:text-xl text-[#2E7D5C]/70 leading-relaxed">
            Clinerva is the first decentralised ecosystem connecting doctors, patients,
            and researchers with AI-driven diagnostic precision.
          </motion.p>
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="mt-12">
            <a href="/login" className="bg-[#2E7D5C] text-white px-12 py-5 rounded-2xl shadow-2xl hover:bg-[#1B5E3A] transition-all flex items-center gap-3 font-bold text-lg active:scale-95">
              Get Started <ArrowRight size={20} />
            </a>
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="py-24 px-6 md:px-16 relative z-10">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
              Everything You <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D5C] to-[#6BBF8A]">Need</span>
            </h2>
            <p className="mt-4 text-[#2E7D5C]/70 text-lg">One platform. Every stakeholder. Zero compromise.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Doctor Dashboard", icon: <Activity />, desc: "Unified workspace for consultations and clinical history." },
              { title: "Patient Portal", icon: <Users />, desc: "Securely access records and communicate with your care team." },
              { title: "Research Hub", icon: <Microscope />, desc: "Analyse anonymised global datasets to advance medicine." },
              { title: "AI Diagnostics", icon: <Cpu />, desc: "Real-time AI pattern recognition for clinical decision support." },
              { title: "Secure Records", icon: <ShieldCheck />, desc: "Military-grade encryption for all medical data." },
              { title: "Vital Sync", icon: <HeartPulse />, desc: "Live synchronisation of patient vitals across institutions." },
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeInUp} initial="hidden" whileInView="show" whileHover={{ y: -10 }}
                className="group bg-white/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/50 shadow-sm hover:shadow-2xl hover:bg-white transition-all duration-500">
                <div className="text-[#2E7D5C] bg-[#E8F5EE] w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-[#2E7D5C] group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="py-28 px-6 md:px-16 relative z-10 bg-white/30">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="text-center mb-20">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D5C] text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              How <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D5C] to-[#6BBF8A]">Clinerva</span> Works
            </h2>
            <p className="mt-4 text-[#2E7D5C]/70 text-lg max-w-xl mx-auto">
              From sign-up to smarter healthcare in five straightforward steps.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical line desktop */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#A8D5BA]/50 -translate-x-1/2 hidden md:block" />

            {howItWorksSteps.map((step, idx) => (
              <motion.div key={idx} variants={fadeInUp} initial="hidden" whileInView="show" viewport={{ once: true }}
                className={`relative flex items-center gap-0 mb-16 ${idx % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                {/* Card */}
                <div className="flex-1 px-4 md:px-8">
                  <div className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-8 shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 duration-300">
                    {/* Mobile icon */}
                    <div className="md:hidden w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-white" style={{ backgroundColor: step.color }}>
                      {step.icon}
                    </div>
                    <span className="text-5xl font-black text-[#A8D5BA]/50 leading-none block mb-2">{step.step}</span>
                    <h3 className="text-2xl font-bold mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                {/* Center icon bubble — desktop only */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full items-center justify-center shadow-xl z-10 text-white flex-shrink-0"
                  style={{ backgroundColor: step.color }}>
                  {step.icon}
                </div>

                {/* Spacer for other side */}
                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── MARQUEE BAND ── */}
        <section className="py-20 bg-[#1B5E3A] overflow-hidden relative">
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-[#1B5E3A] to-transparent z-10" />
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-[#1B5E3A] to-transparent z-10" />
          <div className="flex space-x-8 animate-scroll-left">
            {[...marqueeTestimonials, ...marqueeTestimonials].map((t, i) => (
              <div key={i} className="flex-shrink-0 w-[350px] bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:bg-white/20 transition-colors">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p className="text-white text-lg mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#2E7D5C] rounded-full flex items-center justify-center text-white font-bold">{t.name[0]}</div>
                  <div>
                    <div className="text-white font-bold">{t.name}</div>
                    <div className="text-[#A8D5BA] text-sm">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── USER REVIEWS ── */}
        <section id="reviews" className="py-28 px-6 md:px-16 relative z-10">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="text-center mb-16">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D5C] text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Community Voice
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              User <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D5C] to-[#6BBF8A]">Reviews</span>
            </h2>
            <p className="mt-4 text-[#2E7D5C]/70 text-lg">Share your experience with the Clinerva community.</p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Write a review */}
            <motion.div variants={fadeInUp} initial="hidden" whileInView="show"
              className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-10 shadow-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-[#2E7D5C] p-2 rounded-xl"><MessageSquare className="text-white w-5 h-5" /></div>
                <h3 className="text-2xl font-bold">Write a Review</h3>
              </div>
              <div className="space-y-5">
                <input type="text" placeholder="Your name" value={reviewForm.name}
                  onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                  className="w-full bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition" />
                <input type="text" placeholder="Your role (e.g. Doctor, Patient)" value={reviewForm.role}
                  onChange={(e) => setReviewForm({ ...reviewForm, role: e.target.value })}
                  className="w-full bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition" />
                <div>
                  <p className="text-sm font-semibold text-[#2E7D5C] mb-2">Your Rating</p>
                  <StarRating rating={reviewForm.rating} onChange={(r) => setReviewForm({ ...reviewForm, rating: r })} />
                </div>
                <textarea rows={4} placeholder="Share your experience…" value={reviewForm.text}
                  onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                  className="w-full bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition resize-none" />

                <AnimatePresence>
                  {reviewSent && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-[#E8F5EE] text-[#2E7D5C] px-4 py-3 rounded-xl font-semibold">
                      <ThumbsUp size={18} /> Thanks! Your review has been posted.
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleReviewSubmit}
                  className="w-full bg-[#2E7D5C] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#1B5E3A] transition-all active:scale-95 flex items-center justify-center gap-2">
                  Submit Review <Send size={18} />
                </button>
              </div>
            </motion.div>

            {/* Review feed */}
            <div className="flex flex-col gap-6 max-h-[620px] overflow-y-auto pr-2 custom-scroll">
              {userReviews.length === 0 && (
                <motion.div variants={fadeInUp} initial="hidden" whileInView="show"
                  className="flex flex-col items-center justify-center h-full text-center text-[#2E7D5C]/50 gap-4 py-16">
                  <MessageSquare size={48} className="opacity-30" />
                  <p className="text-lg font-medium">No reviews yet — be the first!</p>
                </motion.div>
              )}
              {userReviews.map((review, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                  className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[1.5rem] p-7 shadow-md hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 bg-[#2E7D5C] rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {review.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#1B5E3A]">{review.name}</p>
                        {review.role && <p className="text-sm text-[#2E7D5C]/60">{review.role}</p>}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">{review.date}</span>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} fill={j < review.rating ? "#F59E0B" : "none"} stroke={j < review.rating ? "#F59E0B" : "#D1D5DB"} />
                    ))}
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CONTACT US ── */}
        <section id="contact" className="py-28 px-6 md:px-16 relative z-10 bg-white/20">
          <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="text-center mb-16">
            <span className="inline-block bg-[#E8F5EE] text-[#2E7D5C] text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
              Get In Touch
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
              Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2E7D5C] to-[#6BBF8A]">Us</span>
            </h2>
            <p className="mt-4 text-[#2E7D5C]/70 text-lg max-w-lg mx-auto">
              Questions, partnerships, or feedback — our team is here to help.
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-5 gap-12">
            {/* Info cards */}
            <motion.div variants={fadeInUp} initial="hidden" whileInView="show" className="md:col-span-2 flex flex-col gap-6">
              {[
                { icon: <Mail size={22} />, label: "Email", value: "priyanka@clinerva.health" },
                { icon: <Phone size={22} />, label: "Phone", value: "+91 98765 43210" },
                { icon: <MapPin size={22} />, label: "Location", value: "TSEC Campus, Kandivali, Mumbai" },
              ].map((info, i) => (
                <motion.div key={i} whileHover={{ x: 6 }}
                  className="flex items-start gap-5 bg-white/60 backdrop-blur-md border border-white/80 rounded-2xl p-6 shadow-sm">
                  <div className="bg-[#2E7D5C] p-3 rounded-xl text-white flex-shrink-0">{info.icon}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#2E7D5C]/60 uppercase tracking-wider">{info.label}</p>
                    <p className="font-bold text-[#1B5E3A] mt-1">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Form */}
            <motion.div variants={fadeInUp} initial="hidden" whileInView="show"
              className="md:col-span-3 bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] p-10 shadow-lg">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <input type="text" placeholder="Your name" value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition w-full" />
                  <input type="email" placeholder="Email address" value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition w-full" />
                </div>
                <input type="text" placeholder="Subject" value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition" />
                <textarea rows={5} placeholder="Your message…" value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-[#F0F9F4] border border-[#A8D5BA]/50 rounded-2xl px-5 py-4 text-[#1B5E3A] placeholder-[#2E7D5C]/40 focus:outline-none focus:ring-2 focus:ring-[#2E7D5C]/30 transition resize-none" />

                <AnimatePresence>
                  {contactSent && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="flex items-center gap-2 bg-[#E8F5EE] text-[#2E7D5C] px-4 py-3 rounded-xl font-semibold">
                      <CheckCircle2 size={18} /> Message sent! We'll be in touch shortly.
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={handleContactSubmit}
                  className="w-full bg-[#2E7D5C] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#1B5E3A] transition-all active:scale-95 flex items-center justify-center gap-2">
                  Send Message <Send size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="bg-[#0A2E1C] text-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="text-[#6BBF8A]" />
                <h2 className="text-2xl font-bold">Clinerva</h2>
              </div>
              <p className="text-gray-400 max-w-sm mb-6 text-lg">
                Empowering the medical community through secure data and collaborative intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-gray-400"><li>Diagnostics</li><li>Research Hub</li><li>Security</li></ul>
            </div>
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-gray-400"><li>About</li><li>VCET Hackathon</li><li>Privacy Policy</li></ul>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/10 text-center text-gray-500">
            © 2026 Clinerva — Built for the Future.
          </div>
        </footer>

        <style jsx global>{`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-left { animation: scroll-left 40s linear infinite; }
          .animate-scroll-left:hover { animation-play-state: paused; }
          .custom-scroll::-webkit-scrollbar { width: 4px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #A8D5BA; border-radius: 8px; }
        `}</style>
      </motion.div>
    </>
  );
}