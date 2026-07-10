import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Terminal, Mail, AlertTriangle, ArrowLeft, Lock, CheckCircle } from 'lucide-react';

export const Login = () => {
  const { 
    initiateVerify, 
    confirmVerify, 
    setPasswordAndRegister, 
    loginWithPassword, 
    triggerToast 
  } = useApp();

  const [view, setView] = useState('email'); // 'email', 'verify', 'password', 'set_password'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters.";
    if (!/[A-Z]/.test(pwd)) return "Include at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Include at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Include at least one number.";
    return null;
  };

  // Step 1: Send verification email
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await initiateVerify(email.trim());
    setLoading(false);

    if (res.success) {
      setIsNewUser(res.isNewUser);
      if (res.code) {
        setDevOtp(res.code);
      }
      setSuccessMsg('Verification code dispatched to your inbox.');
      setView('verify');
    } else {
      setErrorMsg(res.error || 'Could not initiate verification.');
    }
  };

  // Step 2: Confirm verification code
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!code.trim() || code.length < 6) {
      setErrorMsg('Enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await confirmVerify(email.trim(), code.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully.');
      if (res.isNewUser) {
        setView('set_password');
      } else {
        setView('password');
      }
    } else {
      setErrorMsg(res.error || 'Invalid verification code.');
    }
  };

  // Step 3a: Registration - Set password
  const handleSetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const pwdError = validatePassword(password);
    if (pwdError) {
      setErrorMsg(pwdError);
      return;
    }

    setLoading(true);
    const res = await setPasswordAndRegister(email.trim(), password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Account setup failed.');
    }
  };

  // Step 3b: Login - Password entry
  const handlePasswordLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    setLoading(true);
    const res = await loginWithPassword(email.trim(), password, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Password verification failed.');
    }
  };

  const handleBackToEmail = () => {
    setView('email');
    setCode('');
    setPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setDevOtp('');
  };

  return (
    <div className="relative min-h-screen w-screen flex items-center justify-center bg-darkbg grid-bg overflow-hidden px-4 select-none">
      
      {/* Background Neon Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Glass Panel */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glass-panel rounded-2xl border-white/10 p-8 shadow-2xl relative z-10"
      >
        {/* Glow corners */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-accent/40" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-accent/40" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b border-l border-accent/40" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-accent/40" />

        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary to-accent rounded-xl flex items-center justify-center text-slate-950 font-futuristic font-black text-2xl shadow-glow-accent relative">
            L
            <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-slate-900 border border-white/20">
              <Sparkles size={10} className="text-accent" />
            </div>
          </div>
          <h1 className="text-2xl font-black font-futuristic text-white tracking-widest text-neon-cyan uppercase mt-3 mb-0.5">
            LevelUp
          </h1>
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-400 font-display">
            Authentication Terminal
          </p>
        </div>

        {/* Error / Success Callouts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-start gap-2 uppercase tracking-wider leading-relaxed text-left"
            >
              <AlertTriangle size={14} className="shrink-0 mt-0.5 animate-pulse" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-start gap-2 uppercase tracking-wider leading-relaxed text-left"
            >
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Wizard View Controller */}
        <AnimatePresence mode="wait">
          
          {/* Step 1: Email Address Entry */}
          {view === 'email' && (
            <motion.form
              key="email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleEmailSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-1 text-left">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@domain.com"
                    autoComplete="off"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Dispatched Sync Request...' : 'Initiate Terminal Verification'}
              </button>
            </motion.form>
          )}

          {/* Step 2: Code Verification */}
          {view === 'verify' && (
            <motion.form
              key="verify"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleCodeSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Verification OTP Code
                  </label>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 font-futuristic tracking-wider cursor-pointer"
                  >
                    <ArrowLeft size={10} /> Change Email
                  </button>
                </div>
                
                <div className="relative">
                  <Terminal size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    autoComplete="off"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white tracking-[0.25em] font-mono text-center focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
                
                {devOtp && (
                  <div className="pt-1.5 text-[8px] font-mono text-cyan-400 uppercase tracking-wider text-left bg-slate-950/40 p-1.5 rounded border border-cyan-500/10">
                    [⚡ Developer OTP Bypass: {devOtp}]
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify Secure Protocol'}
              </button>
            </motion.form>
          )}

          {/* Step 3a: Registration - Set Password */}
          {view === 'set_password' && (
            <motion.form
              key="set_password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleSetPasswordSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-1 text-left">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                  Set Account Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 8 characters, uppercase, number"
                    autoComplete="new-password"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="rememberSet"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-cyan-400 bg-slate-950 border border-white/10 rounded h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="rememberSet" className="text-[10px] text-slate-400 cursor-pointer font-display select-none">
                  Remember my secure session token
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Configuring Account...' : 'Complete Initialization'}
              </button>
            </motion.form>
          )}

          {/* Step 3b: Login - Enter Password */}
          {view === 'password' && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handlePasswordLoginSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              <div className="space-y-1 text-left">
                <div className="flex justify-between items-center">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Enter Password
                  </label>
                  <button
                    type="button"
                    onClick={handleBackToEmail}
                    className="text-[9px] text-slate-400 hover:text-white flex items-center gap-1 font-futuristic tracking-wider cursor-pointer"
                  >
                    <ArrowLeft size={10} /> Back
                  </button>
                </div>
                
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    autoComplete="current-password"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="rememberLog"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-cyan-400 bg-slate-950 border border-white/10 rounded h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="rememberLog" className="text-[10px] text-slate-400 cursor-pointer font-display select-none">
                  Remember my secure session token
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Verify Security Credentials'}
              </button>
            </motion.form>
          )}

        </AnimatePresence>

        <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-center gap-1.5 text-[8px] text-slate-500 font-display">
          <Terminal size={9} />
          <span>PORTAL ACCREDITED SECURE SYSTEM v2.0</span>
        </div>
      </motion.div>
    </div>
  );
};
