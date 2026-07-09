import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Shield, Sparkles, Terminal, User, Mail, AlertTriangle } from 'lucide-react';

export const Login = () => {
  const { loginUser } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFreshLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    // 1. Email structure verification
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address!');
      return;
    }

    // 2. Sign up validation
    if (isSignUp && !name.trim()) {
      setErrorMsg('Display Name is required to sign up!');
      return;
    }

    setLoading(true);
    
    // Simulate initial workspace sync load
    setTimeout(async () => {
      const res = await loginUser(name.trim(), email.trim(), password, false, isSignUp);
      setLoading(false);
      
      if (res && !res.success) {
        setErrorMsg(res.error);
      }
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-darkbg grid-bg overflow-hidden px-4 select-none">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full glass-panel rounded-2xl border-white/10 p-8 shadow-2xl relative"
      >
        {/* Glow corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-accent" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-accent" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-accent" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-accent" />

        {/* Logo and Icon */}
        <div className="flex justify-center mb-3">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center text-slate-950 font-futuristic font-black text-2xl shadow-glow-accent relative">
            L
            <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-white/20">
              <Sparkles size={10} className="text-accent" />
            </div>
          </div>
        </div>

        <div className="text-center mb-5">
          <h1 className="text-2xl font-black font-futuristic text-white tracking-widest text-neon-cyan uppercase mb-1">
            LevelUp
          </h1>
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400 font-display">
            Habit Mastery Terminal
          </p>
        </div>

        {/* Tabs for Sign In vs Sign Up */}
        <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950 p-1.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => { setIsSignUp(false); setErrorMsg(''); }}
            className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
              !isSignUp ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsSignUp(true); setErrorMsg(''); }}
            className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
              isSignUp ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Callout */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-center gap-2 uppercase tracking-wider leading-relaxed">
            <AlertTriangle size={14} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Input credentials form */}
        <form onSubmit={handleFreshLoginSubmit} className="space-y-4 mb-6">
          {isSignUp && (
            <div className="space-y-1">
              <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
                Display Name
              </label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. alex@growth.com"
                className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-semibold tracking-wider">
              Password
            </label>
            <div className="relative">
              <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
              />
            </div>
          </div>

          {loading ? (
            <div className="w-full py-3 rounded bg-slate-900 border border-white/10 flex items-center justify-center gap-3">
              <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
              <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-widest animate-pulse">
                Initializing Environment...
              </span>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded shadow-lg transition-all duration-200 hover:shadow-glow-accent cursor-pointer active:scale-95"
              >
                {isSignUp ? 'Create Secure Account' : 'Sign In to LevelUp'}
              </button>
            </div>
          )}
        </form>

        <div className="border-t border-white/5 pt-4 flex items-center justify-center gap-1.5 text-[9px] text-slate-500 font-display">
          <Terminal size={10} />
          <span>PORTAL ACCREDITED SECURE SYSTEM</span>
        </div>
      </motion.div>
    </div>
  );
};
