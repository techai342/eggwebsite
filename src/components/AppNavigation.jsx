import React, { useState, useEffect } from 'react';
import { useFarm } from '../context/FarmContext';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';
import SupportChatModal from './SupportChatModal';
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
  variant = 'canopy',
  currentRoute = '/dashboard'
}) {
  const { navigateTo, user, balance, eggVault, activeAssets, logout, getWhatsAppSupportUrl } = useFarm();

  const activeFlockCount = (activeAssets || []).filter((a) => {
    const term = Number(a.termDays) || 120;
    const elapsed = a.daysElapsed !== undefined ? Number(a.daysElapsed) : 0;
    const remaining = a.daysRemaining !== undefined ? Number(a.daysRemaining) : (term - elapsed);
    return remaining > 0 && a.status !== 'completed';
  }).reduce((sum, a) => sum + (Number(a.units) || 0), 0);

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
    } else if (getWhatsAppSupportUrl) {
      window.open(getWhatsAppSupportUrl(), '_blank');
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

        {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') && (
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-[#082013] font-black text-[10px] uppercase shadow-sm border border-amber-200 active:scale-95 transition-all"
            onClick={() => navigateTo('/admin')}
            title="Super Admin Panel"
            aria-label="Admin Panel"
          >
            <i className="fa-solid fa-crown text-[10px]"></i>
            <span>Admin</span>
          </button>
        )}

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

  // Default Signature Canopy Arched Header + Laptop/Desktop Executive Navbar
  return (
    <>
      {/* 1. MOBILE CANOPY ARCHED HEADER (< 768px) */}
      <header className="canopy-header md:hidden">
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

          {/* Right Section: Admin Launcher, FARM CLOUD status badge & Live Chat Trigger */}
          <div className="flex items-center gap-2">
            {/* Golden Crown Super Admin Launcher Button */}
            {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') && (
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-[#082013] font-black text-[9.5px] uppercase tracking-wider shadow-[0_2px_10px_rgba(245,158,11,0.35)] hover:brightness-110 active:scale-95 transition-all border border-amber-200"
                title="Super Admin Cockpit"
                aria-label="Admin Panel"
              >
                <i className="fa-solid fa-crown text-[10px] text-[#082013]"></i>
                <span className="hidden xs:inline">Admin Panel</span>
              </button>
            )}

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

      {/* 2. LAPTOP / DESKTOP EXECUTIVE NAVIGATION BAR (>= 768px) */}
      <header className="hidden md:block bg-gradient-to-r from-[#071c10] via-[#0d2c20] to-[#071c10] border-b-2 border-[#c9f36a]/30 shadow-md text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Brand Identity & Back */}
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-[#c9f36a]/40 text-[#c9f36a] flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
                title="Go Back"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
              </button>
            )}

            <div
              onClick={() => navigateTo('/dashboard')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/20 border-2 border-[#c9f36a]/60 p-1 flex items-center justify-center shadow-inner group-hover:scale-105 transition-all">
                <img src={henImg} alt="Hen Logo" className="w-full h-full object-contain drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-manrope font-black text-base lg:text-lg text-white tracking-wide uppercase group-hover:text-[#c9f36a] transition-colors">
                    {title}
                  </h1>
                  <span className="flex items-center gap-1 bg-[#c9f36a]/20 border border-[#c9f36a]/50 text-[#c9f36a] text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9f36a] animate-pulse"></span>
                    <span>FARM CLOUD</span>
                  </span>
                </div>
                <span className="text-[9px] font-extrabold text-emerald-300/80 tracking-widest uppercase block">
                  VIP Digital Poultry &amp; Egg Yield Engine
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="flex items-center gap-1 lg:gap-2">
            {[
              { label: 'Home', path: '/dashboard', icon: 'fa-house-chimney', active: currentRoute === '/dashboard' || currentRoute === '/' || currentRoute === '/home' },
              { label: 'My Farm', path: '/my-farm', icon: 'fa-egg', active: currentRoute === '/my-farm' || currentRoute === '/farm' },
              { label: 'Buy Hens', path: '/buy-asset', icon: 'fa-cart-shopping', active: currentRoute === '/buy-asset' || currentRoute === '/deposit' || currentRoute === '/buy' },
              { label: 'Sell Eggs', path: '/sell-egg', icon: 'fa-hand-holding-dollar', active: currentRoute === '/sell-egg' || currentRoute === '/withdraw' || currentRoute === '/sale' },
              { label: 'My Team', path: '/team', icon: 'fa-users', active: currentRoute === '/team' },
              { label: 'Security', path: '/change-password', icon: 'fa-shield-halved', active: currentRoute === '/change-password' || currentRoute === '/profile' }
            ].map((link) => (
              <a
                key={link.path}
                href={`#${link.path}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigateTo(link.path);
                }}
                className={`px-3.5 py-2 rounded-xl font-manrope font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  link.active
                    ? 'bg-[#c9f36a] text-[#082013] font-black shadow-md'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <i className={`fa-solid ${link.icon} text-xs ${link.active ? 'text-[#082013]' : 'text-emerald-400'}`}></i>
                <span>{link.label}</span>
              </a>
            ))}

            {/* Admin Panel Launcher */}
            {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') && (
              <button
                type="button"
                onClick={() => navigateTo('/admin')}
                className="ml-1 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-[#082013] font-manrope font-black text-xs uppercase tracking-wider shadow-sm hover:brightness-110 active:scale-95 transition-all border border-amber-200 flex items-center gap-1.5 cursor-pointer"
                title="Super Admin Cockpit"
              >
                <i className="fa-solid fa-crown text-xs text-[#082013]"></i>
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* User Telemetry & Quick Action */}
          <div className="flex items-center gap-2.5">
            <div className="hidden xl:flex items-center gap-3 bg-black/40 border border-emerald-500/30 rounded-2xl px-3.5 py-1.5 text-xs">
              <div>
                <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block font-bold">Liquid PKR</span>
                <span className="font-mono font-black text-emerald-400 block">Rs. {Number(balance || 0).toLocaleString()}</span>
              </div>
              <div className="w-[1px] h-6 bg-white/15"></div>
              <div>
                <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block font-bold">Egg Vault</span>
                <span className="font-mono font-black text-amber-300 block">{Math.floor(Number(eggVault || 0)).toLocaleString()} Eggs</span>
              </div>
              <div className="w-[1px] h-6 bg-white/15"></div>
              <div>
                <span className="text-[7.5px] uppercase tracking-wider text-slate-400 block font-bold">Flock</span>
                <span className="font-mono font-black text-[#c9f36a] block">{activeFlockCount} Hens</span>
              </div>
            </div>

            {/* Live Chat Support Trigger */}
            <button
              type="button"
              onClick={handleChat}
              className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-[#c9f36a] text-xs font-manrope font-extrabold flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              title="24/7 Official Live Support Desk"
            >
              <i className="fa-solid fa-headset text-sm"></i>
              <span className="hidden lg:inline">Live Support</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigateTo('/login');
              }}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-white/15 flex items-center justify-center transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Log Out Account"
            >
              <i className="fa-solid fa-power-off text-xs"></i>
            </button>
          </div>

        </div>
      </header>
    </>
  );
}

/**
 * AppSidebar: Sliding VIP farmer drawer with account telemetry,
 * egg balance overview, and full destination routing.
 */
export function AppSidebar({ isOpen, onClose, onOpenSupport }) {
  const { user, eggVault, balance, logout, navigateTo, getWhatsAppSupportUrl } = useFarm();

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
              {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') ? (
                <span className="tc-profile-crown bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-[#082013] font-black border border-amber-200 shadow-md">
                  <i className="fa-solid fa-crown text-[10px]"></i> Super Admin
                </span>
              ) : (
                <span className="tc-profile-crown">
                  <i className="fa-solid fa-crown"></i> VIP
                </span>
              )}
            </div>

            <div className="tc-profile-details">
              <h4 className="tc-profile-username">
                <span>{user?.username || 'mrsaqib242'}</span>
                <i className="fa-solid fa-circle-check text-[#38bdf8] text-[13px]" title="Verified Member"></i>
              </h4>
              <div className="tc-profile-badge-row">
                <span className="tc-id-pill">ID: {user?.accountId || '#1197'}</span>
                {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') ? (
                  <span className="tc-active-dot-pill bg-amber-100 text-amber-900 border-amber-300">
                    <i className="fa-solid fa-shield text-[10px] text-amber-600 mr-1"></i> Root Operator
                  </span>
                ) : (
                  <span className="tc-active-dot-pill">
                    <span className="tc-active-dot-pip"></span> Active Farmer
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Glass Balance Card Inside Header */}
          <div className="tc-header-balance-card">
            <div className="tc-hbc-top">
              <span className="tc-hbc-label">Harvested Egg Vault</span>
              <div className="tc-hbc-val-wrap">
                <span className="tc-hbc-val">{Math.floor(Number(eggVault || 0)).toLocaleString()}</span>
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
          {/* Golden Super Admin Panel Item for Admin Users */}
          {user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com') && (
            <li className="tc-menu-item">
              <a
                href="#/admin"
                onClick={(e) => { e.preventDefault(); handleNav('/admin'); }}
                className="tc-menu-link"
                style={{
                  background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.16), rgba(234, 179, 8, 0.06))',
                  borderLeft: '3px solid #f59e0b',
                  boxShadow: '0 2px 8px rgba(245, 158, 11, 0.12)'
                }}
              >
                <div className="tc-menu-link-left">
                  <div className="tc-menu-icon-box" style={{ background: '#fef3c7', color: '#b45309' }}>
                    <i className="fa-solid fa-crown text-[13px]"></i>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-amber-950 text-[13px]">Super Admin Panel</span>
                    <span className="text-[10px] text-amber-700/80 font-medium">Control Center &amp; Gateways</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-[#082013] shadow-sm">
                  Root
                </span>
              </a>
            </li>
          )}

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
              href="#/my-farm"
              onClick={(e) => { e.preventDefault(); handleNav('/my-farm'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#fef9c3', color: '#854d0e' }}>
                  <i className="fa-solid fa-egg"></i>
                </div>
                <span>My Farm Coop</span>
              </div>
              <span className="px-1.5 py-0.5 text-[8.5px] font-black rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Flock
              </span>
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
              href="#/team"
              onClick={(e) => { e.preventDefault(); handleNav('/team'); }}
              className="tc-menu-link"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  <i className="fa-solid fa-users"></i>
                </div>
                <span>My Team &amp; Referrals</span>
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

          <li className="tc-menu-item">
            <button
              type="button"
              onClick={() => {
                if (onClose) onClose();
                if (onOpenSupport) {
                  onOpenSupport();
                } else if (getWhatsAppSupportUrl) {
                  window.open(getWhatsAppSupportUrl(), '_blank');
                }
              }}
              className="tc-menu-link w-full text-left cursor-pointer"
            >
              <div className="tc-menu-link-left">
                <div className="tc-menu-icon-box" style={{ background: '#ecfdf5', color: '#059669' }}>
                  <i className="fa-solid fa-headset"></i>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-800 text-[13px]">Support &amp; Live Chat</span>
                  <span className="text-[10px] text-emerald-600 font-bold">24/7 WhatsApp &amp; In-App Desk</span>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[8.5px] font-black rounded-full bg-emerald-100 text-emerald-800 uppercase">
                Online
              </span>
            </button>
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

  const isHomeActive = currentRoute === '/dashboard' || currentRoute === '/home' || currentRoute === '/user/dashboard' || currentRoute === '/';
  const isFarmActive = currentRoute === '/my-farm' || currentRoute === '/farm' || currentRoute === '/user/farm' || currentRoute === '/dashboard#farm';
  const isBuyActive = currentRoute === '/buy-asset' || currentRoute === '/deposit' || currentRoute === '/buy' || currentRoute === '/user/deposit';
  const isSaleActive = currentRoute === '/sell-egg' || currentRoute === '/withdraw' || currentRoute === '/sale' || currentRoute === '/user/withdraw';
  const isProfileActive = currentRoute === '/change-password' || currentRoute === '/profile' || currentRoute === '/user/change-password';

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
        href="#/my-farm"
        onClick={(e) => handleItemClick(e, '/my-farm')}
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
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  return (
    <div className="app-desktop-canvas">
      <div className="app-shell-480 farm-mesh-pattern">
        {showHeader && (
          <AppHeader
            title={title}
            showBack={showBack}
            onBack={onBack}
            onMenuToggle={() => setIsSidebarOpen(true)}
            onChatClick={() => setIsSupportOpen(true)}
            currentRoute={currentRoute}
          />
        )}

        <AppSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpenSupport={() => {
            setIsSidebarOpen(false);
            setIsSupportOpen(true);
          }}
        />

        <main className={`flex-1 relative z-10 ${showNav ? 'pb-24' : 'pb-6'}`}>
          {children}
        </main>

        {showNav && !isSupportOpen && <AppBottomNav currentRoute={currentRoute} />}

        {/* Floating Quick Support Desk Action Beacon */}
        {!isSupportOpen && (
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="tc-support-beacon fixed z-40 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-r from-emerald-500 via-[#16a34a] to-[#15803d] text-white shadow-[0_4px_25px_rgba(22,163,74,0.6)] border-2 border-[#c9f36a] flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer group"
            title="24/7 Official Live Support Desk"
            aria-label="Open Live Support Desk"
          >
            <i className="fa-solid fa-headset text-lg md:text-xl group-hover:rotate-12 transition-transform"></i>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9f36a] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#c9f36a] border-2 border-[#082013]"></span>
            </span>
          </button>
        )}

        <SupportChatModal
          isOpen={isSupportOpen}
          onClose={() => setIsSupportOpen(false)}
        />
      </div>
    </div>
  );
}

export default AppShell;
