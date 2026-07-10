import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Terminal, Mail, AlertTriangle, ArrowLeft, Lock, CheckCircle, User } from 'lucide-react';

export const Login = () => {
  const { 
    initiateVerify, 
    confirmVerify, 
    setPasswordAndRegister, 
    loginWithPassword, 
    triggerToast 
  } = useApp();

  const [authType, setAuthType] = useState('signin'); // 'signin' or 'register'
  
  // Sign In Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [regStep, setRegStep] = useState('email'); // 'email', 'verify', 'set_password'
  const [regEmail, setRegEmail] = useState('');
  const [regCode, setRegCode] = useState('');
  const [regPassword, setRegPassword] = useState('');
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

  // Sign In Submit Handler
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your email or username.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await loginWithPassword(loginIdentifier.trim(), loginPassword, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Invalid credentials.');
    }
  };

  // Register Step 1: Send Email Code
  const handleRegEmailSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmail(regEmail)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await initiateVerify(regEmail.trim());
    setLoading(false);

    if (res.success) {
      if (res.code) {
        setDevOtp(res.code);
      }
      setSuccessMsg('Verification code dispatched to your inbox.');
      setRegStep('verify');
    } else {
      setErrorMsg(res.error || 'Could not initiate registration.');
    }
  };

  // Register Step 2: Verify Code
  const handleRegCodeSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regCode.trim() || regCode.length < 6) {
      setErrorMsg('Enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    const res = await confirmVerify(regEmail.trim(), regCode.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Email verified successfully.');
      setRegStep('set_password');
    } else {
      setErrorMsg(res.error || 'Invalid verification code.');
    }
  };

  // Register Step 3: Set Password and Complete Setup
  const handleRegPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const pwdError = validatePassword(regPassword);
    if (pwdError) {
      setErrorMsg(pwdError);
      return;
    }

    setLoading(true);
    const res = await setPasswordAndRegister(regEmail.trim(), regPassword, rememberMe);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || 'Registration failed.');
    }
  };

  const handleBackToEmail = () => {
    setRegStep('email');
    setRegCode('');
    setRegPassword('');
    setErrorMsg('');
    setSuccessMsg('');
    setDevOtp('');
  };

  const handleTabChange = (type) => {
    setAuthType(type);
    setErrorMsg('');
    setSuccessMsg('');
    setLoginIdentifier('');
    setLoginPassword('');
    setRegEmail('');
    setRegCode('');
    setRegPassword('');
    setRegStep('email');
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

        {/* Auth Mode Toggle Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-950 p-1.5 rounded-lg border border-white/5">
          <button
            type="button"
            onClick={() => handleTabChange('signin')}
            className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
              authType === 'signin' ? 'bg-primary text-white shadow-glow-accent' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
              authType === 'register' ? 'bg-primary text-white shadow-glow-accent' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Register
          </button>
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
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
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

        {/* Dynamic View Controller */}
        <AnimatePresence mode="wait">
          
          {/* VIEW: SIGN IN */}
          {authType === 'signin' && (
            <motion.form
              key="signin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSignInSubmit}
              className="space-y-4"
              autoComplete="off"
            >
              {/* Email / Username Input */}
              <div className="space-y-1 text-left">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                  Email Address or Username
                </label>
                <div className="relative">
                  <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter email or username"
                    autoComplete="off"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1 text-left">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                  />
                </div>
              </div>

              {/* Remember Session */}
              <div className="flex items-center gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="rememberSignIn"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-cyan-400 bg-slate-950 border border-white/10 rounded h-3.5 w-3.5 cursor-pointer"
                />
                <label htmlFor="rememberSignIn" className="text-[10px] text-slate-400 cursor-pointer font-display select-none">
                  Remember my session credentials
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:shadow-glow-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying Coordinates...' : 'Verify Security Credentials'}
              </button>
            </motion.form>
          )}

          {/* VIEW: REGISTER */}
          {authType === 'register' && (
            <div key="register" className="space-y-4">
              
              {/* Step 1: Input email and initiate registration verification */}
              {regStep === 'email' && (
                <motion.form
                  key="reg_email"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRegEmailSubmit}
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
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
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
                    {loading ? 'Dispatched Sync Request...' : 'Initiate Registration'}
                  </button>
                </motion.form>
              )}

              {/* Step 2: Verification code entry */}
              {regStep === 'verify' && (
                <motion.form
                  key="reg_verify"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRegCodeSubmit}
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
                        value={regCode}
                        onChange={(e) => setRegCode(e.target.value)}
                        placeholder="Enter 6-digit code"
                        autoComplete="off"
                        className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white tracking-[0.25em] font-mono text-center focus:outline-none focus:border-cyan-500/40 transition-colors"
                      />
                    </div>
                    
                    {devOtp && import.meta.env.DEV && (
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

              {/* Step 3: Complete registration by assigning password */}
              {regStep === 'set_password' && (
                <motion.form
                  key="reg_password"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleRegPasswordSubmit}
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
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters, uppercase, number"
                        autoComplete="new-password"
                        className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Remember Session */}
                  <div className="flex items-center gap-2 pt-1 text-left">
                    <input
                      type="checkbox"
                      id="rememberReg"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-cyan-400 bg-slate-950 border border-white/10 rounded h-3.5 w-3.5 cursor-pointer"
                    />
                    <label htmlFor="rememberReg" className="text-[10px] text-slate-400 cursor-pointer font-display select-none">
                      Remember my session credentials
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

            </div>
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
