import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';

/**
 * RegisterPage: Farmer Registration & Account Creation Screen
 * Optimized for Laptop / Desktop (dual-column executive card) and Mobile.
 *
 * Requirements:
 * - Username (min 3 chars)
 * - Gmail / Email or Phone number
 * - Password (min 6 chars) with eye visibility toggle
 * - Confirm Password with eye visibility toggle
 * - Full Name (optional)
 * - Referral Code (auto-populated if ?ref=... in URL)
 * - Auto-login upon registration and immediate redirect to /dashboard
 * - Link to /login for existing accounts
 */
export default function RegisterPage() {
  const { registerUser, navigateTo, showToast } = useFarm();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Extract referral code from URL query (?ref=...) or hash (/#/register?ref=...)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        let ref = urlParams.get('ref');
        if (!ref && window.location.hash.includes('?')) {
          const hashQuery = window.location.hash.split('?')[1];
          const hashParams = new URLSearchParams(hashQuery);
          ref = hashParams.get('ref');
        }
        if (ref) {
          setReferralCode(ref.trim());
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (!cleanUsername || cleanUsername.length < 3) {
      setErrorMsg('Username must be at least 3 characters (letters, numbers, underscores).');
      return;
    }

    const cleanIdentifier = emailOrPhone.trim();
    if (!cleanIdentifier) {
      setErrorMsg('Please enter your Gmail / Email or Mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify both password fields.');
      return;
    }

    if (!agreeTerms) {
      setErrorMsg('Please accept the Farm Cooperative Rules & Harvest Terms.');
      return;
    }

    setLoading(true);

    try {
      const result = registerUser({
        name: name.trim() || cleanUsername,
        username: cleanUsername,
        emailOrPhone: cleanIdentifier,
        password,
        referralCode: referralCode.trim()
      });

      if (result.success) {
        showToast('success', `Welcome @${cleanUsername}! Account created successfully.`);
        setTimeout(() => {
          navigateTo('/dashboard');
        }, 350);
      } else {
        setErrorMsg(result.message || 'Registration failed. Please check your details.');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred during registration.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04120a] via-[#071f13] to-[#030d07] text-slate-100 flex flex-col justify-center items-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-amber-400 selection:text-black">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Dual-Column Laptop Card (Responsive: single-column on mobile, dual on lg) */}
      <div className="relative z-10 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_25px_70px_rgba(0,0,0,0.65)] border border-emerald-500/25 grid grid-cols-1 lg:grid-cols-12 bg-white">
        
        {/* =========================================================================
            LEFT COLUMN (Desktop/Laptop Branding & Benefits)
           ========================================================================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#062013] via-[#0b3320] to-[#04150c] p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white relative overflow-hidden border-b lg:border-b-0 lg:border-r border-emerald-500/20">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Top Brand Identity */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logoImg}
                  alt="AL Rehman Meta Eggs"
                  className="w-10 h-10 rounded-xl object-contain bg-white/10 p-1 border border-white/20 shadow-md"
                />
                <div>
                  <h2 className="font-manrope font-black text-sm sm:text-base tracking-tight text-white uppercase leading-none">
                    AL Rehman
                  </h2>
                  <span className="text-[10px] font-bold text-amber-300 tracking-wider uppercase">
                    Meta Eggs Farm
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-200 transition-all flex items-center gap-1.5"
                title="Go to Login"
              >
                <span>Login</span>
                <i className="fa-solid fa-arrow-right text-[10px]"></i>
              </button>
            </div>

            {/* Hen Avatar Centerpiece */}
            <div className="my-4 flex items-center gap-4 bg-black/30 border border-emerald-500/30 p-4 rounded-2xl backdrop-blur-sm">
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-[14px] bg-[#072416] flex items-center justify-center p-1.5 overflow-hidden">
                    <img src={henImg} alt="Hen" className="w-full h-full object-contain drop-shadow" />
                  </div>
                </div>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-amber-400 text-[#072416] text-[8.5px] font-black uppercase tracking-wider shadow">
                  +1 EGG
                </span>
              </div>
              <div>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Agro-Digital Coop
                </span>
                <h3 className="font-manrope font-black text-base text-white mt-1 leading-snug">
                  Smart Poultry Assets
                </h3>
                <p className="text-xs text-emerald-100/70">
                  Earn daily fresh egg yields from verified flock coops
                </p>
              </div>
            </div>

            {/* Feature Perks List */}
            <div className="space-y-3 my-6">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <i className="fa-solid fa-egg"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Daily Organic Egg Production</h4>
                  <p className="text-[11px] text-emerald-100/70">
                    Each hen yields 1 egg every 24 hours for a full 120-day production cycle.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <i className="fa-solid fa-bolt"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Instant P2P Cashouts</h4>
                  <p className="text-[11px] text-emerald-100/70">
                    Liquidate egg yields anytime to JazzCash, EasyPaisa, or direct Bank transfer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-yellow-400/20 text-yellow-300 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">2-Tier Squad Commissions</h4>
                  <p className="text-[11px] text-emerald-100/70">
                    Earn 10% direct affiliate commission plus 5% sub-affiliate rewards.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Live Community Ticker */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200/80">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-semibold text-white">5,420+ Active Pakistani Farmers</span>
            </div>
            <span className="font-bold text-amber-300">24/7 Live</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN (Laptop High-Contrast Form Workspace)
           ========================================================================= */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white text-slate-800">
          {/* Headline */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-1">
              <i className="fa-solid fa-user-plus"></i>
              <span>Farmer Registration</span>
            </div>
            <h1 className="font-manrope font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join the cooperative, adopt your laying flock, and harvest daily egg yields.
            </p>
          </div>

          {/* Error Feedback Banner */}
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 animate-shake">
              <i className="fa-solid fa-circle-exclamation text-rose-500 text-sm flex-shrink-0"></i>
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username & Full Name in Grid on Tablet/Laptop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Username Field */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-at text-sm"></i>
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    placeholder="e.g. saqib242"
                    required
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Full Name Field (Optional) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-address-card text-sm"></i>
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Saqib Khan"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Email / Mobile Number Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gmail / Email or Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="fa-solid fa-envelope text-sm"></i>
                </span>
                <input
                  type="text"
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="e.g. saqib@gmail.com or 03001234567"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Use your Gmail or Pakistani mobile number (JazzCash/EasyPaisa compatible).
              </span>
            </div>

            {/* Password & Confirm Password in Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Create Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-lock text-sm"></i>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <i className="fa-solid fa-shield-check text-sm"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    tabIndex={-1}
                    aria-label="Toggle confirm password visibility"
                  >
                    <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Referral Code Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Referral Code <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                {referralCode && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <i className="fa-solid fa-check text-[9px] mr-1"></i>Sponsor Linked
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <i className="fa-solid fa-users text-sm"></i>
                </span>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.trim())}
                  placeholder="e.g. mrsaqib242"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="agreeTermsRegister"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="agreeTermsRegister" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
                I agree to the <span className="font-semibold text-emerald-700">Farm Cooperative Rules</span> and 24-hour harvest yield cycles.
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-green-800 hover:from-emerald-500 hover:to-green-700 text-white font-manrope font-black text-sm uppercase tracking-wider shadow-[0_8px_25px_rgba(16,185,129,0.35)] active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin text-sm"></i>
                  <span>Creating Your Farm Account...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-circle-check text-sm text-yellow-300"></i>
                  <span>Register &amp; Enter Farm</span>
                  <i className="fa-solid fa-arrow-right text-xs opacity-75"></i>
                </>
              )}
            </button>
          </form>

          {/* Bottom Already Registered Strip */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-center sm:text-left">
              <p className="text-xs font-semibold text-slate-700">Already registered farmer?</p>
              <p className="text-[11px] text-slate-400">Log in to view your laying flock &amp; egg vault</p>
            </div>
            <button
              type="button"
              onClick={() => navigateTo('/login')}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-arrow-right-to-bracket text-emerald-600 text-xs"></i>
              <span>Log In</span>
            </button>
          </div>

          {/* SSL Protection Badge */}
          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[10.5px] mt-4">
            <i className="fa-solid fa-lock text-emerald-600"></i>
            <span>256-Bit SSL Encrypted Farmer Data Protection</span>
          </div>
        </div>

      </div>
    </div>
  );
}
