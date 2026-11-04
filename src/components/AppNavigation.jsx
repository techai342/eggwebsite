import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';
import '../rawafiles.css';

/**
 * AppHeader: Signature arched green canopy header with back button,
 * AL REHMAN META EGGS brand, FARM CLOUD live beacon, and menu drawer toggle.
 */
export function AppHeader({
  title = 'AL REHMAN META EGGS',
  showBack = false,
  onBack,
  onMenuToggle,
  onChatClick,
  variant = 'canopy'
}) {
  const { navigateTo } = useFarm();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/dashboard');
    }
  };

  const handleChat = () => {
    if (onChatClick) {
      onChatClick();
    } else {
      alert('AL Rehman Meta Eggs Official Live Support Desk: 24/7 WhatsApp & Farm Community Support Active.');
    }
  };

  if (variant === 'light') {
    return (
      <header className="tc-header">
        <button
          type="button"
          className="tc-action-btn tc-menu-btn"
          onClick={onMenuToggle}
          aria-label="Open Navigation Menu"
        >
          <i className="fa-solid fa-bars-staggered"></i>
        </button>

        <div className="tc-brand-center">
          <a
            href="#/dashboard"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/dashboard');
            }}
            className="tc-brand-header-link"
          >
            <div className="tc-brand-hen-badge">
              <img src={henImg} className="tc-brand-hen-img" alt="Hen" />
              <span className="tc-brand-hen-sparkle"></span>
            </div>
            <div className="tc-brand-text-col">
              <span className="tc-brand-title">{title}</span>
              <div className="tc-brand-tagline">
                <span>INVEST</span>
                <span className="tc-tag-dot">•</span>
                <span>HARVEST</span>
                <span className="tc-tag-dot">•</span>
                <span>EARN</span>
              </div>
            </div>
          </a>
        </div>

        <button
          type="button"
          className="tc-livechat-header-btn"
          onClick={handleChat}
          title="Live Chat Support"
          aria-label="Live Chat Support"
        >
          <i className="fa-solid fa-headset"></i>
          <span className="tc-livechat-pip animate-ping"></span>
          <span className="tc-livechat-pip"></span>
        </button>
      </header>
    );
  }

  // Default Signature Canopy Arched Header
  return (
    <header className="canopy-header">
      <div className="canopy-header-glow-top"></div>
      <div className="canopy-header-glow-bottom"></div>

      <div className="relative z-10 flex items-center justify-between gap-2">
        {/* Left Section: Back Button or Menu Button */}
        <div className="flex items-center gap-2">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-[#c9f36a]/40 text-[#c9f36a] hover:bg-[#c9f36a]/20 active:scale-95 transition-all shadow-sm"
              title="Go Back"
              aria-label="Go Back"
            >
              <i className="fa-solid fa-arrow-left text-xs"></i>
            </button>
          )}

          <button
            type="button"
            onClick={onMenuToggle}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-[#c9f36a]/40 text-[#c9f36a] hover:bg-[#c9f36a]/20 active:scale-95 transition-all shadow-sm"
            title="Navigation Menu"
            aria-label="Open Navigation Menu"
          >
            <i className="fa-solid fa-bars-staggered text-xs"></i>
          </button>

          {/* Brand Name Capsule */}
          <div
            onClick={() => navigateTo('/dashboard')}
            className="cursor-pointer flex items-center gap-2 bg-black/35 backdrop-blur-md border border-[#c9f36a]/30 px-3 py-1.5 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9f36a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9f36a]"></span>
            </span>
            <span className="font-manrope font-black text-[10.5px] sm:text-[11px] tracking-wider uppercase text-white drop-shadow-sm truncate max-w-[155px]">
              {title}
            </span>
          </div>
        </div>

        {/* Right Section: FARM CLOUD status badge & Live Chat Trigger */}
        <div className="flex items-center gap-2">
          {/* Live Farm Cloud Status Beacon */}
          <div className="hidden xs:flex items-center gap-1.5 bg-gradient-to-r from-[#c9f36a]/20 to-emerald-500/15 border border-[#c9f36a]/40 px-2.5 py-1 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-manrope font-black text-[8.5px] text-[#c9f36a] uppercase tracking-wider">
              FARM CLOUD
            </span>
          </div>

          {/* Live Chat Headset Trigger */}
          <button
            type="button"
            onClick={handleChat}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-black/40 border border-[#c9f36a]/50 text-[#c9f36a] hover:bg-[#c9f36a]/20 active:scale-90 transition-all shadow-sm"
            title="Live Support Chat"
            aria-label="Live Support"
          >
            <i className="fa-solid fa-headset text-xs"></i>
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-[#0d2c20]"></span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * AppSidebar: Sliding VIP farmer drawer with account telemetry,
 * egg balance overview, and full destination routing.
 */
export function AppSidebar({ isOpen, onClose }) {
  const { user, eggVault, balance, logout, navigateTo } = useFarm();

  const handleNav = (path) => {
    if (onClose) onClose();
    navigateTo(path);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (onClose) onClose();
    logout();
    navigateTo('/login');
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`tc-sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>

      {/* Sliding Sidebar Drawer */}
      <aside
        id="tcSidebar"
        className={`tc-sidebar ${isOpen ? 'active' : ''}`}
        aria-label="VIP Farmer Navigation Drawer"
      >
        {/* VIP Profile Hero Header */}
        <div className="tc-sidebar-profile">
          <button
            type="button"
            className="tc-sidebar-close-btn"
            onClick={onClose}
            aria-label="Close Sidebar"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>

          {/* Farmer Profile Info */}
          <div className="tc-profile-top-row">
            <div className="tc-profile-avatar-wrap">
              <div className="tc-profile-avatar">
                <i className="fa-solid fa-user-astronaut"></i>
              </div>
              <span className="tc-profile-crown">
                <i className="fa-solid fa-crown"></i> VIP
              </span>
            </div>

            <div className="tc-profile-details">
              <h4 className="tc-profile-username">
                <span>{user?.username || 'mrsaqib242'}</span>
                <i className="fa-solid fa-circle-check text-[#38bdf8] text-[13px]" title="Verified Member"></i>
              </h4>
              <div className="tc-profile-badge-row">
                <span className="tc-id-pill">ID: {user?.accountId || '#1197'}</span>
                <span className="tc-active-dot-pill">
                  <span className="tc-active-dot-pip"></span> Active Farmer
                </span>
              </div>
            </div>
          </div>

          {/* Glass Balance Card Inside Header */}
          <div className="tc-header-balance-card">
            <div className="tc-hbc-top">
              <span className="tc-hbc-label">Harvested Egg Vault</span>
              <div className="tc-hbc-val-wrap">
                <span className="tc-hbc-val">{Number(eggVault || 0).toFixed(2)}</span>
                <span className="tc-hbc-unit">Eggs</span>
              </div>
            </div>
            <div className="tc-hbc-actions">
              <button
                type="button"
                onClick={() => handleNav('/buy-asset')}
                className="tc-hbc-btn tc-hbc-btn-deposit"
              >
                <i className="fa-solid fa-plus-circle"></i>
                <span>Buy Hen</span>
              </button>
              <button
                type="button"
                onClick={() => handleNav('/sell-egg')}
                className="tc-hbc-btn tc-hbc-btn-withdraw"
              >
                <i className="fa-solid fa-hand-holding-dollar"></i>
                <span>Sell Egg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <ul className="tc-menu-list">
          <li className="tc-menu-item">
            <a
              href="#/dashboard"
              onClick={(e) => { e.preventDefault(); handleNav('/dashboard'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#e0f2fe', color: '#0284c7' }}>
                  <i className="fa-solid fa-house-chimney-window"></i>
                </div>
                <span>Dashboard</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-slate-300"></i>
            </a>
          </li>

          <li className="tc-menu-item">
            <a
              href="#/buy-asset"
              onClick={(e) => { e.preventDefault(); handleNav('/buy-asset'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <img src={henImg} style={{ width: '22px', height: '22px', objectFit: 'contain' }} alt="Buy Hen" />
                </div>
                <span>Buy Hen Asset</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-slate-300"></i>
            </a>
          </li>

          <li className="tc-menu-item">
            <a
              href="#/sell-egg"
              onClick={(e) => { e.preventDefault(); handleNav('/sell-egg'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#fef3c7', color: '#d97706' }}>
                  <img src={logoImg} style={{ width: '20px', height: '20px', objectFit: 'contain' }} alt="Sell Egg" />
                </div>
                <span>Sell Egg (P2P)</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-slate-300"></i>
            </a>
          </li>

          <li className="tc-menu-item">
            <a
              href="#/dashboard"
              onClick={(e) => { e.preventDefault(); handleNav('/dashboard'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#e0e7ff', color: '#4f46e5' }}>
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <span>All History</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-slate-300"></i>
            </a>
          </li>

          <li className="tc-menu-item">
            <a
              href="#/change-password"
              onClick={(e) => { e.preventDefault(); handleNav('/change-password'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#ede9fe', color: '#7c3aed' }}>
                  <i className="fa-solid fa-shield-halved"></i>
                </div>
                <span>Change Password</span>
              </div>
              <i className="fa-solid fa-chevron-right text-[11px] text-slate-300"></i>
            </a>
          </li>
        </ul>

        {/* Sidebar Footer with Logout & Security Badge */}
        <div className="tc-sidebar-footer">
          <button
            type="button"
            onClick={handleLogout}
            className="tc-sidebar-logout-btn"
          >
            <i className="fa-solid fa-power-off"></i>
            <span>Log Out Account</span>
          </button>
          <div className="tc-sidebar-security-badge">
            <i className="fa-solid fa-shield-halved text-emerald-500"></i>
            <span>256-Bit SSL Encrypted • AL Rehman Meta Eggs</span>
          </div>
        </div>
      </aside>
    </>
  );
}

/**
 * AppBottomNav: Sticky 5-item mobile dock fixed at bottom of 480px app container.
 * Features: Home, My Farm, elevated center BUY button, Sale, and Profile.
 */
export function AppBottomNav({ currentRoute = '/dashboard', onNavigate }) {
  const { navigateTo } = useFarm();

  const handleItemClick = (e, path) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigateTo(path);
    }
  };

  const isHomeActive = currentRoute === '/dashboard' || currentRoute === '/';
  const isFarmActive = currentRoute === '/dashboard#farm';
  const isBuyActive = currentRoute === '/buy-asset';
  const isSaleActive = currentRoute === '/sell-egg' || currentRoute === '/withdraw';
  const isProfileActive = currentRoute === '/change-password';

  return (
    <nav className="tc-bottombar" aria-label="Bottom Navigation Dock">
      {/* 1. Home Option */}
      <a
        href="#/dashboard"
        onClick={(e) => handleItemClick(e, '/dashboard')}
        className={`tc-bottom-item ${isHomeActive ? 'active' : ''}`}
        aria-label="Home"
      >
        <div className="tc-bottom-icon-box">
          <i className="fa-solid fa-house-chimney"></i>
        </div>
        <span className="tc-bottom-text">Home</span>
      </a>

      {/* 2. My Farm Option */}
      <a
        href="#/dashboard"
        onClick={(e) => handleItemClick(e, '/dashboard')}
        className={`tc-bottom-item ${isFarmActive ? 'active' : ''}`}
        aria-label="My Farm"
      >
        <div className="tc-bottom-icon-box">
          <i className="fa-solid fa-egg"></i>
        </div>
        <span className="tc-bottom-text">My Farm</span>
      </a>

      {/* 3. Center Elevated Action Button (BUY) */}
      <a
        href="#/buy-asset"
        onClick={(e) => handleItemClick(e, '/buy-asset')}
        className={`tc-bottom-center-item ${isBuyActive ? 'active' : ''}`}
        aria-label="Buy VIP Asset"
      >
        <div className="tc-center-orb">
          <span className="tc-center-orb-pulse"></span>
          <img src={henImg} alt="Buy Hen" />
        </div>
        <span className="tc-center-text">BUY</span>
      </a>

      {/* 4. Sale / Withdraw Option */}
      <a
        href="#/sell-egg"
        onClick={(e) => handleItemClick(e, '/sell-egg')}
        className={`tc-bottom-item ${isSaleActive ? 'active' : ''}`}
        aria-label="Sell Egg"
      >
        <div className="tc-bottom-icon-box">
          <img
            src={logoImg}
            style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            alt="Sale"
          />
        </div>
        <span className="tc-bottom-text">Sale</span>
      </a>

      {/* 5. Profile Option */}
      <a
        href="#/change-password"
        onClick={(e) => handleItemClick(e, '/change-password')}
        className={`tc-bottom-item ${isProfileActive ? 'active' : ''}`}
        aria-label="Profile"
      >
        <div className="tc-bottom-icon-box">
          <i className="fa-solid fa-circle-user"></i>
        </div>
        <span className="tc-bottom-text">Profile</span>
      </a>
    </nav>
  );
}

/**
 * AppShell: Common application container wrapping pages in 480px responsive canvas
 * with sticky AppHeader, sliding AppSidebar drawer, and sticky AppBottomNav dock.
 */
export function AppShell({
  children,
  currentRoute = '/dashboard',
  title = 'AL REHMAN META EGGS',
  showBack = false,
  showNav = true,
  showHeader = true,
  onBack
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-desktop-canvas">
      <div className="app-shell-480 farm-mesh-pattern">
        {showHeader && (
          <AppHeader
            title={title}
            showBack={showBack}
            onBack={onBack}
            onMenuToggle={() => setIsSidebarOpen(true)}
          />
        )}

        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className={`flex-1 relative z-10 ${showNav ? 'pb-24' : 'pb-6'}`}>
          {children}
        </main>

        {showNav && <AppBottomNav currentRoute={currentRoute} />}
      </div>
    </div>
  );
}

export default AppShell;
