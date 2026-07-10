import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Sparkles, Terminal, User, Mail, AlertTriangle, ArrowLeft, Key, Lock, CheckCircle } from 'lucide-react';

export const Login = () => {
  const { loginUser, loginWithGoogle, forgotPassword, resetPassword, triggerToast } = useApp();
  
  // Tab/Screen states: 'signin', 'signup', 'forgot'
  const [view, setView] = useState('signin');
  
  // Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  
  // Forgot Password flow states
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Google sign in modal overlay state
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  
  // Common states
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Email format check
  const validateEmail = (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val.trim());
  };

  // Strong password checker
  const validatePassword = (pwd) => {
    if (pwd.length < 8) return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter.";
    if (!/[a-z]/.test(pwd)) return "Password must contain at least one lowercase letter.";
    if (!/[0-9]/.test(pwd)) return "Password must contain at least one number.";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Password must contain at least one special character.";
    return null;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (view === 'signup') {
      if (!name.trim()) {
        setErrorMsg('Display Name is required to register.');
        return;
      }
      const pwdError = validatePassword(password);
      if (pwdError) {
        setErrorMsg(pwdError);
        return;
      }
    }

    setLoading(true);
    
    // Simulate terminal boot sequence delay
    setTimeout(async () => {
      try {
        const isSignUp = view === 'signup';
        const res = await loginUser(name.trim(), email.trim(), password, false, isSignUp, rememberMe);
        setLoading(false);
        if (res && !res.success) {
          setErrorMsg(res.error);
        }
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.message || 'Authentication error.');
      }
    }, 1000);
  };

  // Forgot password triggers
  const handleRequestCode = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!validateEmail(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email.trim());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Reset code sent! Check your inbox (or terminal server logs).');
      setResetCodeSent(true);
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetCode.trim() || resetCode.length < 6) {
      setErrorMsg('Please enter the 6-digit verification code.');
      return;
    }

    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      setErrorMsg(pwdError);
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim(), resetCode.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      triggerToast('Reset Success', 'Password updated successfully. Sign in now!', 'success');
      setView('signin');
      setPassword('');
      setResetCodeSent(false);
      setResetCode('');
      setNewPassword('');
    } else {
      setErrorMsg(res.error);
    }
  };

  const handleDemoLogin = () => {
    setErrorMsg('');
    setLoading(true);
    setTimeout(async () => {
      await loginUser('', '', '', true, false, rememberMe);
      setLoading(false);
    }, 800);
  };

  const triggerGoogleSignIn = async (gEmail, gName, gAvatar) => {
    setShowGoogleModal(false);
    setLoading(true);
    const res = await loginWithGoogle(gEmail, gName, gAvatar, rememberMe);
    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.error);
    }
  };

  const handleCustomGoogleSubmit = (e) => {
    e.preventDefault();
    if (!customGoogleName.trim() || !validateEmail(customGoogleEmail)) {
      triggerToast('Invalid Input', 'Please enter a valid Google name and email.', 'warning');
      return;
    }
    const avatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(customGoogleName.trim())}`;
    triggerGoogleSignIn(customGoogleEmail.trim().toLowerCase(), customGoogleName.trim(), avatar);
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

        {/* View Toggle tabs (only show for Login / Register) */}
        {view !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 mb-5 bg-slate-950 p-1.5 rounded-lg border border-white/5">
            <button
              type="button"
              onClick={() => { setView('signin'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
                view === 'signin' ? 'bg-primary text-white shadow-glow-accent' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setView('signup'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`py-1.5 text-[9px] font-bold uppercase tracking-wider rounded font-futuristic transition-all cursor-pointer ${
                view === 'signup' ? 'bg-primary text-white shadow-glow-accent' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Error / Success Callouts */}
        <AnimatePresence mode="wait">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-3 mb-4 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-semibold flex items-start gap-2 uppercase tracking-wider leading-relaxed"
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
              className="p-3 mb-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold flex items-start gap-2 uppercase tracking-wider leading-relaxed"
            >
              <CheckCircle size={14} className="shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign In & Sign Up Form views */}
        {view !== 'forgot' && (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            
            {view === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
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
                  placeholder="e.g. alex@levelup.com"
                  className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                  Password
                </label>
                {view === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                    className="text-[9px] text-accent hover:underline font-futuristic tracking-wider cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Shield size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={view === 'signup' ? "Requires A-Z, a-z, 0-9, special, min 8 chars" : "Password credential"}
                  className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                />
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-cyan-400 bg-slate-950 border border-white/10 rounded h-3.5 w-3.5 cursor-pointer"
              />
              <label htmlFor="remember" className="text-[10px] text-slate-400 cursor-pointer font-display">
                Remember my secure session token
              </label>
            </div>

            {loading ? (
              <div className="w-full py-3.5 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center gap-3">
                <span className="w-4 h-4 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                <span className="text-[10px] font-bold font-futuristic text-slate-300 uppercase tracking-widest animate-pulse">
                  Deploying Environment...
                </span>
              </div>
            ) : (
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:shadow-glow-accent cursor-pointer transition-all active:scale-95"
              >
                {view === 'signup' ? 'Create Secure Account' : 'Sign In to LevelUp'}
              </button>
            )}
          </form>
        )}

        {/* Forgot Password View */}
        {view === 'forgot' && (
          <div>
            <button
              onClick={() => { setView('signin'); setErrorMsg(''); setSuccessMsg(''); setResetCodeSent(false); }}
              className="flex items-center gap-1.5 text-[9px] font-bold font-futuristic text-slate-500 hover:text-accent uppercase tracking-widest transition-colors cursor-pointer mb-5"
            >
              <ArrowLeft size={10} /> Back to Sign In
            </button>

            {!resetCodeSent ? (
              <form onSubmit={handleRequestCode} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    Confirm Registered Email
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. registered@email.com"
                      className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="w-full py-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-[9px] font-bold font-futuristic text-slate-400 uppercase tracking-widest animate-pulse">
                      Requesting Code...
                    </span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-primary to-accent hover:from-primary-light hover:to-accent-light text-slate-950 font-futuristic font-bold text-xs tracking-widest uppercase rounded-lg shadow-lg hover:shadow-glow-accent cursor-pointer transition-all active:scale-95"
                  >
                    Send Verification Code
                  </button>
                )}
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    6-Digit Verification Code
                  </label>
                  <div className="relative">
                    <Key size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors font-mono tracking-widest text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-futuristic text-slate-400 font-bold tracking-wider">
                    New Secure Password
                  </label>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Requires A-Z, a-z, 0-9, special, min 8 chars"
                      className="w-full bg-slate-900 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500/40 transition-colors"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="w-full py-3 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-accent border-t-transparent animate-spin" />
                    <span className="text-[9px] font-bold font-futuristic text-slate-400 uppercase tracking-widest animate-pulse">
                      Updating Password...
                    </span>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 font-futuristic font-bold text-xs tracking-widest uppercase rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    Reset Password
                  </button>
                )}
              </form>
            )}
          </div>
        )}

        {/* Divider & Social Sign In */}
        <div className="relative my-6 text-center">
          <hr className="border-white/5" />
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-slate-950/90 text-[8px] uppercase tracking-widest font-futuristic text-slate-500">
            Or Sync With
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Custom Google Sign In Trigger */}
          <button
            onClick={() => setShowGoogleModal(true)}
            className="py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/15 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <span className="text-red-400 font-bold">G</span> Google Sign In
          </button>
          
          <button
            onClick={handleDemoLogin}
            className="py-2.5 bg-slate-900/60 hover:bg-slate-900 border border-white/5 hover:border-white/15 rounded-lg text-[9px] font-bold uppercase tracking-wider text-slate-200 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <Terminal size={11} className="text-accent" /> Demo Sandbox
          </button>
        </div>

        <div className="border-t border-white/5 pt-4 mt-6 flex items-center justify-center gap-1.5 text-[8px] text-slate-500 font-display">
          <Terminal size={9} />
          <span>PORTAL ACCREDITED SECURE SYSTEM v2.0</span>
        </div>
      </motion.div>

      {/* Interactive Mock Google Account Selector Overlay Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-sm w-full bg-slate-950 border border-white/10 rounded-xl p-6 space-y-4 shadow-2xl relative"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold font-futuristic text-white uppercase tracking-wider">
                Sign in with Google
              </h3>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="text-slate-500 hover:text-white font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-[10px] text-slate-400 font-display leading-relaxed">
              Choose a Google account to sync profile data:
            </p>

            <div className="space-y-2">
              <div
                onClick={() => triggerGoogleSignIn('alex.mercer@gmail.com', 'Alex Mercer', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Alex')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 text-xs font-bold font-futuristic">AM</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white leading-none">Alex Mercer</p>
                  <p className="text-[8px] text-slate-500 mt-1">alex.mercer@gmail.com</p>
                </div>
              </div>

              <div
                onClick={() => triggerGoogleSignIn('yechu.dev@gmail.com', 'Yechu', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Yechu')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 bg-cyan-500/20 rounded-full flex items-center justify-center text-cyan-400 text-xs font-bold font-futuristic">YC</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white leading-none">Yechu</p>
                  <p className="text-[8px] text-slate-500 mt-1">yechu.dev@gmail.com</p>
                </div>
              </div>

              <div
                onClick={() => triggerGoogleSignIn('cadet@levelup.io', 'Penguin Cadet', 'https://api.dicebear.com/7.x/adventurer/svg?seed=Penguin')}
                className="p-3 bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 text-xs font-bold font-futuristic">PC</div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-white leading-none">Penguin Cadet</p>
                  <p className="text-[8px] text-slate-500 mt-1">cadet@levelup.io</p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-3">
              <h4 className="text-[9px] font-bold font-futuristic text-slate-500 uppercase tracking-widest mb-2 text-left">
                Use Custom Google Account
              </h4>
              <form onSubmit={handleCustomGoogleSubmit} className="space-y-2">
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/40"
                />
                <input
                  type="email"
                  required
                  placeholder="Google Email Address"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 rounded p-2 text-[10px] text-white focus:outline-none focus:border-cyan-500/40"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-primary to-accent text-slate-950 font-futuristic font-bold text-[9px] uppercase tracking-widest rounded transition-all cursor-pointer"
                >
                  Link & Authorize Google Profile
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
