import React, { useState } from 'react';
import { useFarm } from '../context/FarmContext';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';
import '../rawafiles.css';

/**
 * LoginPage: High-fidelity Farmer Authentication Screen
 * Faithful replica of Alkram Meta Eggs _ Login.html re-branded to "AL Rehman Meta Eggs".
 * Features:
 * - Mobile-first 480px app viewport
 * - Downward curved green canopy header with sun glow & ambient circles
 * - Top nav with back button, center live cloud badge with pulsing dot, right home button
 * - Smart poultry ecosystem tag, AL REHMAN META EGGS HARVEST APP header
 * - 3D Animal Avatar Badge (84x84) with rotating dashed ring, hen image, and egg mini tag
 * - 3 Benefit Pills: Daily Eggs (fa-egg), Fast Cashout (fa-bolt), 100% Organic (fa-shield-halved)
 * - White continuous body with Farmer Access headline and fingerprint icon badge
 * - Farmer username & password fields with lead icons and interactive password eye toggle
 * - Keep Signed In checkbox and Forgot Pass link
 * - High-impact CTA Enter Farm Coop button with loading state
 * - Bottom Register strip and 256-bit SSL status badge
 * - Client-side state integration with useFarm().login()
 */
export default function LoginPage() {
  const { login, navigateTo, showToast } = useFarm();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // Authenticate via Supabase with fallback
      const result = await login(username, password);
      if (result.success) {
        if (rememberMe && typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem('alrehman_remember_user', username);
        }
        setTimeout(() => {
          navigateTo('/dashboard');
        }, 300);
      } else {
        setErrorMsg(result.message || 'Invalid credentials');
        setLoading(false);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
      setLoading(false);
    }
  };

  const handleForgotPass = (e) => {
    e.preventDefault();
    showToast(
      'info',
      'Please contact official admin support on WhatsApp to reset your account password.'
    );
  };

  const handleRegisterNotice = (e) => {
    e.preventDefault();
    navigateTo('/register');
  };

  return (
    <div className="app-desktop-canvas">
      <div className="app-full-page app-shell-480">
        {/* 1. FULL WIDTH GREEN HEADER WITH DOWNWARD ARCHED CANOPY */}
        <header className="full-green-header">
          {/* Top Nav Row */}
          <div className="top-nav-row">
            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="back-circle-btn"
              title="Back to Portal"
              aria-label="Back to Portal"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="live-cloud-badge">
              <span className="live-dot"></span>
              <span>AL REHMAN META EGGS FARM CLOUD</span>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('/')}
              className="home-circle-btn"
              title="Farm Portal Home"
              aria-label="Farm Portal Home"
            >
              <i className="fa-solid fa-house"></i>
            </button>
          </div>

          {/* Hero Info & 3D Hen Display */}
          <div className="hero-info-row">
            <div className="hero-left-text">
              <div className="hero-sub-tag">
                <i className="fa-solid fa-wheat-awn"></i>
                <span>Smart Poultry Ecosystem</span>
              </div>

              <h1 className="hero-title-text">
                AL REHMAN META EGGS
                <span>HARVEST APP</span>
              </h1>

              <p className="hero-desc-text">
                Collect your daily egg yields &amp; manage poultry coops
              </p>
            </div>

            {/* 3D Animal Avatar Badge with Egg Satellite */}
            <div className="hero-avatar-box">
              <div className="avatar-dashed-ring"></div>
              <div className="avatar-img-card">
                <img src={henImg} alt="AL Rehman Meta Eggs Hen Mascot" />
              </div>
              <div className="egg-mini-tag" title="Daily Harvest Yield">
                <img src={logoImg} alt="Egg Harvest Logo" />
              </div>
            </div>
          </div>

          {/* 3 Benefit Pills Inside the Green Header */}
          <div className="benefit-chips-strip">
            <div className="benefit-chip">
              <i className="fa-solid fa-egg"></i>
              <span>Daily Eggs</span>
            </div>
            <div className="benefit-chip">
              <i className="fa-solid fa-bolt"></i>
              <span>Fast Cashout</span>
            </div>
            <div className="benefit-chip">
              <i className="fa-solid fa-shield-halved"></i>
              <span>100% Organic</span>
            </div>
          </div>
        </header>

        {/* 2. FULL PAGE WHITE LOGIN FORM (CONTINUOUS BODY) */}
        <main className="full-form-body">
          <div className="form-top-wrap">
            {/* Headline */}
            <div className="form-headline">
              <div className="headline-text">
                <h2>Farmer Access</h2>
                <p>Sign in to enter your poultry farm coop</p>
              </div>
              <div className="headline-icon-badge">
                <i className="fa-solid fa-fingerprint"></i>
              </div>
            </div>

            {/* Account Switcher Tabs: Sign In (Active) vs Register */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-4 border border-slate-200/80 shadow-inner">
              <button
                type="button"
                className="flex-1 py-2 px-3 rounded-xl bg-[#0a2717] text-[#c9f36a] font-manrope font-black text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 cursor-default transition-all"
              >
                <i className="fa-solid fa-lock text-[11px]"></i>
                <span>Sign In</span>
              </button>
              <a
                href="#/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/register');
                }}
                className="flex-1 py-2 px-3 rounded-xl text-slate-700 hover:text-emerald-950 hover:bg-white/90 font-manrope font-black text-xs uppercase tracking-wider text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 no-underline active:scale-95"
              >
                <i className="fa-solid fa-user-plus text-[11px] text-emerald-600"></i>
                <span>Register</span>
              </a>
            </div>

            {/* Error Message Feedback Banner */}
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-rose-500"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="login-form-body" autoComplete="on">
              {/* Username Field */}
              <div className="field-group">
                <label className="field-label" htmlFor="username">
                  <i className="fa-solid fa-user-circle"></i>
                  <span>Farmer Username</span>
                </label>
                <div className="field-box">
                  <div className="field-icon-lead">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input-control"
                    placeholder="Enter your username or email"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="field-group">
                <label className="field-label" htmlFor="password">
                  <i className="fa-solid fa-key"></i>
                  <span>Secret Farm Password</span>
                </label>
                <div className="field-box">
                  <div className="field-icon-lead">
                    <i className="fa-solid fa-lock"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input-control"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pass-eye-toggle"
                    id="passEyeToggle"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                    aria-label="Toggle Password Visibility"
                  >
                    <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-regular fa-eye'} id="passEyeIcon"></i>
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="field-options-row">
                <label className="remember-tag">
                  <input
                    type="checkbox"
                    name="remember"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="real-chk-input"
                  />
                  <span className="chk-box">
                    <i className="fa-solid fa-check"></i>
                  </span>
                  <span>Keep Signed In</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPass}
                  className="forgot-key-link"
                  style={{ background: 'none', border: 'none', padding: 0 }}
                >
                  Forgot Pass?
                </button>
              </div>

              {/* High-Impact CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-farm-enter"
                id="btnFarmEnter"
                style={{ opacity: loading ? 0.9 : 1 }}
              >
                <span>{loading ? 'Entering Coop...' : 'Enter Farm Coop'}</span>
                <div className="enter-capsule-icon">
                  <i className={loading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-arrow-right-to-bracket'}></i>
                </div>
              </button>

              {/* Direct In-Form Register Link */}
              <div className="flex items-center justify-center gap-1.5 pt-3 text-center">
                <span className="text-xs text-slate-500 font-medium">Don't have a farm account?</span>
                <a
                  href="#/register"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('/register');
                  }}
                  className="text-xs font-black text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center gap-1 cursor-pointer transition-colors no-underline"
                >
                  <span className="underline">Register Free</span>
                  <i className="fa-solid fa-arrow-right text-[10px]"></i>
                </a>
              </div>
            </form>
          </div>

          {/* Bottom Elements */}
          <div className="bottom-actions-wrap">
            {/* Bottom Register Strip */}
            <div className="bottom-register-strip">
              <div className="reg-strip-text">
                <h4>New to the Farm?</h4>
                <p>Start with free daily egg harvests</p>
              </div>
              <a
                href="#/register"
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo('/register');
                }}
                className="reg-link-pill cursor-pointer no-underline flex items-center gap-1.5"
              >
                <span>Register</span>
                <i className="fa-solid fa-chevron-right text-[8px]"></i>
              </a>
            </div>

            {/* SSL Status Indicator */}
            <div className="card-ssl-status">
              <i className="fa-solid fa-circle-check"></i>
              <span>256-Bit Encrypted • Verified Poultry Cloud</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
