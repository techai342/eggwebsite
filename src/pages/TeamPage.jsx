import React, { useState, useMemo } from 'react';
import { useFarm, COMMISSION_RATES, ASSET_SPEC } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';
import '../rawafiles.css';

/**
 * TeamPage: Dedicated 2-Tier Team & Referral Affiliate Hub
 * Provides comprehensive referral statistics, unique invite link/code sharing,
 * interactive downline registration & purchase simulator, team ledger, and clean state reset.
 */
export default function TeamPage() {
  const {
    user,
    referralCode,
    referralLink,
    teamMembers = [],
    referralStats = {
      totalInvited: 0,
      level1Count: 0,
      level2Count: 0,
      totalCommissionEarned: 0,
      activeTeamCount: 0,
      totalDownlineUnits: 0,
      totalDownlineVolumePkr: 0
    },
    registerDownline,
    simulateDownlinePurchase,
    resetToFreshState,
    showToast,
    navigateTo,
    balance = 0,
    platformSettings
  } = useFarm();

  // Dynamic affiliate rates and unit price
  const l1Percent = Number(platformSettings?.referralCommissionLevel1 !== undefined ? platformSettings.referralCommissionLevel1 : 2.0);
  const l2Percent = Number(platformSettings?.referralCommissionLevel2 !== undefined ? platformSettings.referralCommissionLevel2 : 1.0);
  const henUnitPrice = Number(platformSettings?.henUnitPrice || ASSET_SPEC?.unitPrice || 500);

  // Active tab for Simulator Tool: 'REGISTER' | 'PURCHASE'
  const [simulatorTab, setSimulatorTab] = useState('REGISTER');

  // Downline Registration Form state
  const [newUsername, setNewUsername] = useState('');
  const [newTierLevel, setNewTierLevel] = useState(1);
  const [newUpliner, setNewUpliner] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Downline Purchase Simulator Form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [purchaseUnits, setPurchaseUnits] = useState(1);
  const [isSimulating, setIsSimulating] = useState(false);

  // Table filter & search state
  const [ledgerTierFilter, setLedgerTierFilter] = useState('ALL'); // 'ALL' | '1' | '2'
  const [searchQuery, setSearchQuery] = useState('');

  // Selected downline member object for purchase simulation
  const selectedDownlineMember = useMemo(() => {
    if (!selectedMemberId && teamMembers.length > 0) {
      return teamMembers[0];
    }
    return teamMembers.find((m) => m.id === selectedMemberId) || teamMembers[0] || null;
  }, [selectedMemberId, teamMembers]);

  // Live calculation preview for purchase simulator
  const simulatedPurchaseVolumePkr = useMemo(() => {
    const qty = Math.max(1, Number(purchaseUnits) || 1);
    return qty * henUnitPrice;
  }, [purchaseUnits, henUnitPrice]);

  const simulatedCommissionRate = useMemo(() => {
    if (!selectedDownlineMember) return l1Percent / 100;
    return Number(selectedDownlineMember.tierLevel) === 2
      ? l2Percent / 100
      : l1Percent / 100;
  }, [selectedDownlineMember, l1Percent, l2Percent]);

  const simulatedCommissionPkr = useMemo(() => {
    return Number((simulatedPurchaseVolumePkr * simulatedCommissionRate).toFixed(2));
  }, [simulatedPurchaseVolumePkr, simulatedCommissionRate]);

  // Filtered members for table
  const filteredTeamMembers = useMemo(() => {
    return teamMembers.filter((member) => {
      const matchesTier =
        ledgerTierFilter === 'ALL' || String(member.tierLevel) === String(ledgerTierFilter);
      const matchesSearch =
        !searchQuery ||
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.upliner && member.upliner.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesTier && matchesSearch;
    });
  }, [teamMembers, ledgerTierFilter, searchQuery]);

  // Available Level 1 downline members for Level 2 upliner selection
  const level1Members = useMemo(() => {
    return teamMembers.filter((m) => Number(m.tierLevel) === 1);
  }, [teamMembers]);

  // Generic copy helper with visual toast feedback
  const handleCopy = async (text, label) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('success', `${label} copied to clipboard!`);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      showToast('info', `${label}: ${text}`);
    }
  };

  // WhatsApp share action
  const handleWhatsAppShare = () => {
    const message = `Join my AL Rehman Meta Eggs poultry farming team and earn daily egg profits!\n\nUse Referral Code: ${referralCode}\nInvite Link: ${referralLink}`;
    const url = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(message);
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  // Register Downline submission
  const handleRegisterDownlineSubmit = (e) => {
    e.preventDefault();
    const cleanUsername = String(newUsername || '').trim();
    if (!cleanUsername) {
      showToast('error', 'Please enter a downline farmer username.');
      return;
    }

    setIsRegistering(true);
    try {
      const uplinerToAssign =
        Number(newTierLevel) === 2
          ? newUpliner || (level1Members[0]?.username || 'team_leader')
          : (user?.username || 'mrsaqib242');

      const res = registerDownline({
        username: cleanUsername,
        tierLevel: Number(newTierLevel),
        upliner: uplinerToAssign,
        joinDate: new Date().toISOString()
      });

      if (res.success) {
        setNewUsername('');
        setNewUpliner('');
        // Automatically select the new member in the purchase simulator
        if (res.member) {
          setSelectedMemberId(res.member.id);
        }
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // Simulate Purchase submission
  const handleSimulatePurchaseSubmit = (e) => {
    e.preventDefault();
    if (!selectedDownlineMember) {
      showToast('error', 'Please select a downline member to simulate purchase.');
      return;
    }

    const units = Math.max(1, Number(purchaseUnits) || 1);
    setIsSimulating(true);
    try {
      simulateDownlinePurchase({
        memberId: selectedDownlineMember.id,
        username: selectedDownlineMember.username,
        units
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Clean baseline reset
  const handleResetToFresh = () => {
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmReset = window.confirm(
        'Are you sure you want to reset farm state to clean baseline? This will purge all simulated downlines and restore default initial state.'
      );
      if (!confirmReset) return;
    }
    resetToFreshState();
    setSelectedMemberId('');
    setPurchaseUnits(1);
    setNewUsername('');
  };

  return (
    <AppShell
      currentRoute="/team"
      title="MY TEAM & REFERRALS"
      showBack={true}
      onBack={() => navigateTo('/dashboard')}
    >
      <div className="px-3.5 pt-3 pb-8 flex flex-col gap-4">
        {/* ==================================================== */}
        {/* TOP CANOPY STATUS BAR                                */}
        {/* ==================================================== */}
        <div className="card-farm-3d p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="w-8 h-8 rounded-xl bg-[#f0f5eb] border border-[#c2d9bf] text-[#153d2b] flex items-center justify-center text-xs active:scale-95 transition-all shadow-2xs hover:bg-[#e4ede0] cursor-pointer"
              title="Return to Dashboard"
              aria-label="Return to Dashboard"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div>
              <h2 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide leading-tight">
                My Team &amp; Referrals
              </h2>
              <span className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
                2-Tier Affiliate Network
              </span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[#eef5e6] border border-[#16a34a]/30 text-[#15803d] text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
            <span>VIP AFFILIATE</span>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 1: UPLINER SPONSOR CARD                      */}
        {/* ==================================================== */}
        <div className="card-farm-3d p-4 bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 shadow-[0_4px_16px_rgba(21,61,43,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0f5ee]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ecfdf5] to-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center text-lg text-[#059669] shadow-inner flex-shrink-0">
                <i className="fa-solid fa-user-shield"></i>
              </div>
              <div>
                <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-none">
                  Sponsor Association
                </span>
                <h3 className="font-manrope font-black text-sm text-[#0d2c20] tracking-wide uppercase leading-tight mt-0.5">
                  Upliner Sponsor Details
                </h3>
              </div>
            </div>

            <span className="text-[7.5px] font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
              <i className="fa-solid fa-circle-check text-emerald-600 mr-1"></i>
              Verified
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {/* Upliner Username */}
            <div className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Upliner Sponsor
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <i className="fa-solid fa-user-tie text-xs text-[#15803d]"></i>
                <span className="font-manrope font-black text-xs text-[#0d2c20] tracking-wider uppercase truncate">
                  {user?.upliner || 'N/A'}
                </span>
              </div>
              <span className="text-[7px] font-bold text-emerald-700 mt-1 uppercase">
                {user?.upliner && user.upliner !== 'N/A' ? 'Direct Sponsor' : 'Root Account / Direct'}
              </span>
            </div>

            {/* My Account ID */}
            <div className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                My Account ID
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <i className="fa-solid fa-id-card-clip text-xs text-indigo-600"></i>
                <span className="font-manrope font-black text-xs text-[#0d2c20] tracking-wider uppercase">
                  {user?.accountId || '#1197'}
                </span>
              </div>
              <span className="text-[7px] font-bold text-slate-500 mt-1 uppercase">
                VIP Recruiter
              </span>
            </div>

            {/* Current Farmer Profile */}
            <div className="col-span-2 sm:col-span-1 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl p-2.5 flex flex-col justify-between">
              <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Farmer Username
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <i className="fa-solid fa-circle-user text-xs text-amber-600"></i>
                <span className="font-manrope font-black text-xs text-[#0d2c20] tracking-wider uppercase truncate">
                  {user?.username || 'mrsaqib242'}
                </span>
              </div>
              <span className="text-[7px] font-bold text-amber-700 mt-1 uppercase">
                Active Squad Leader
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 2: UNIQUE REFERRAL LINK & CODE               */}
        {/* ==================================================== */}
        <div className="vip-conic-wrapper">
          <div className="vip-conic-beam"></div>

          <div className="vip-conic-inner p-4 relative">
            <div className="relative z-10 flex flex-col gap-3.5">
              {/* Header Strip */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-xs shadow-sm">
                    <i className="fa-solid fa-share-nodes"></i>
                  </div>
                  <div>
                    <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider leading-none">
                      Your Unique Referral Pass
                    </h3>
                    <span className="text-[7.5px] font-bold text-[#15803d] tracking-widest uppercase block mt-0.5">
                      Share &amp; Earn 2-Tier Cash Commission
                    </span>
                  </div>
                </div>

                <span className="text-[7.5px] font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <i className="fa-solid fa-gift text-[8px]"></i>
                  <span>Instant {l1Percent}% / {l2Percent}%</span>
                </span>
              </div>

              {/* Referral Code Box */}
              <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-[0_4px_16px_rgba(21,61,43,0.05)]">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803d] text-xs shadow-sm flex-shrink-0">
                    <i className="fa-solid fa-key"></i>
                  </div>
                  <div className="min-w-0">
                    <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">
                      Unique Referral Code
                    </span>
                    <span className="font-manrope font-black text-base text-[#0d2c20] tracking-widest uppercase block leading-tight font-mono truncate">
                      {referralCode}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(referralCode, 'Referral code')}
                  className="flex items-center gap-1 bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-[10px] px-3 py-2 rounded-xl shadow active:scale-90 transition-all cursor-pointer flex-shrink-0"
                >
                  <i className="fa-solid fa-copy text-[9.5px]"></i>
                  <span>Copy Code</span>
                </button>
              </div>

              {/* Referral Link Box */}
              <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex flex-col gap-2 shadow-[0_4px_16px_rgba(21,61,43,0.05)]">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">
                    Direct Referral Link
                  </span>
                  <span className="text-[7px] font-black text-[#15803d] uppercase tracking-wide">
                    1-Tap Auto-Register
                  </span>
                </div>

                <div className="bg-[#f8faf6] border border-[#e2ebd9] rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-2">
                  <span className="font-mono text-[9.5px] text-slate-600 truncate flex-1 select-all">
                    {referralLink}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-1">
                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => handleCopy(referralLink, 'Referral link')}
                    className="flex items-center justify-center gap-1.5 bg-[#f0f5eb] hover:bg-[#e4ede0] border border-[#c2d9bf] text-[#153d2b] font-manrope font-black text-[10.5px] py-2 rounded-xl active:scale-95 transition-all cursor-pointer shadow-2xs"
                  >
                    <i className="fa-solid fa-link text-[10px]"></i>
                    <span>Copy Referral Link</span>
                  </button>

                  {/* WhatsApp Share Button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppShare}
                    className="flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-manrope font-black text-[10.5px] py-2 rounded-xl shadow-[0_4px_12px_rgba(37,211,102,0.35)] active:scale-95 transition-all cursor-pointer"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>WhatsApp Share</span>
                  </button>
                </div>
              </div>

              {/* Policy note */}
              <div className="flex items-center justify-between px-1 text-[8px] text-[#153d2b]">
                <span className="flex items-center gap-1 font-medium">
                  <i className="fa-solid fa-shield-halved text-[#16a34a]"></i>
                  <span>Lifetime 2-tier affiliate tracking automatically attached</span>
                </span>
                <span className="text-[#15803d] font-black uppercase">Instant Payouts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 3: DYNAMIC REFERRAL STATISTICS CARDS         */}
        {/* ==================================================== */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="font-manrope font-black text-xs text-[#153d2b] uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-chart-pie text-emerald-600"></i>
              <span>Affiliate Performance Dashboard</span>
            </h3>
            <span className="text-[7.5px] font-black text-[#15803d] uppercase tracking-wide">
              Live State Ledger
            </span>
          </div>

          {/* 1 Hen Bought = 1 Free Egg Reward Announcement */}
          <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#c9f36a]/20 to-emerald-500/15 border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-xl shadow-inner shrink-0">
                🥚
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider">
                    Hen Purchase Reward: 1 Hen Bought = 1 Free Egg!
                  </h4>
                  <span className="bg-amber-400 text-amber-950 font-black text-[7.5px] px-2 py-0.5 rounded-full uppercase">
                    1 Hen = 1 Egg
                  </span>
                </div>
                <p className="text-[9px] text-[#15803d] font-bold mt-1 leading-snug">
                  Jab aap ka referral <strong className="text-emerald-900 font-black">Hen khareedega</strong> to aap ko har hen par <strong className="text-amber-800 font-black">1 Anda Vault mein milega</strong> (2 Hens = 2 Eggs, 5 Hens = 5 Eggs, 10 Hens = 10 Eggs). <span className="text-rose-700 font-black">Sirf join karne par 0 anday</span>.
                </p>
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-amber-300 text-center shrink-0 shadow-xs flex sm:flex-col items-center justify-between sm:justify-center gap-2 sm:gap-0">
              <span className="text-[7.5px] uppercase font-black text-slate-500 block">Team Egg Rewards</span>
              <span className="font-mono font-black text-base text-amber-700">+{referralStats?.referralEggRewards ?? 0}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 1: Total Invited */}
            <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-wider">
                  Total Invited
                </span>
                <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-users"></i>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h4 className="font-manrope font-black text-2xl text-[#0d2c20] tracking-tight">
                    {referralStats.totalInvited}
                  </h4>
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                    Farmers
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                  <span className="text-[7px] font-black text-indigo-700 uppercase tracking-wide">
                    All Tiers Combined
                  </span>
                </div>
              </div>
            </div>

            {/* Card 2: Level 1 Count */}
            <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-[#15803d] uppercase tracking-wider">
                  Level 1 Count
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-50 text-[#15803d] flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-user-plus"></i>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h4 className="font-manrope font-black text-2xl text-[#15803d] tracking-tight">
                    {referralStats.level1Count}
                  </h4>
                  <span className="text-[8px] font-bold text-emerald-800/70 uppercase tracking-wide">
                    Direct
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-pulse"></span>
                  <span className="text-[7px] font-black text-emerald-800 uppercase tracking-wide">
                    Direct 2.00%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3: Level 2 Count */}
            <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-blue-700 uppercase tracking-wider">
                  Level 2 Count
                </span>
                <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-network-wired"></i>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h4 className="font-manrope font-black text-2xl text-blue-900 tracking-tight">
                    {referralStats.level2Count}
                  </h4>
                  <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wide">
                    Secondary
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span className="text-[7px] font-black text-blue-700 uppercase tracking-wide">
                    Secondary 1.00%
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Total Commission Earned (PKR) */}
            <div className="bg-gradient-to-br from-[#ecfdf5] via-[#f0fdf4] to-white border border-emerald-300 rounded-2xl p-3 flex flex-col justify-between shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8px] font-black text-emerald-900 uppercase tracking-wider">
                  Commission Earned
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">
                  <i className="fa-solid fa-sack-dollar"></i>
                </div>
              </div>
              <div>
                <div className="flex items-baseline gap-1">
                  <h4 className="font-manrope font-black text-xl sm:text-2xl text-[#15803d] tracking-tight truncate">
                    Rs. {Number(referralStats.totalCommissionEarned || 0).toFixed(2)}
                  </h4>
                </div>
                <div className="mt-1 flex items-center gap-1 bg-emerald-100/70 border border-emerald-300 rounded-md px-1.5 py-0.5 w-max">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
                  <span className="text-[7px] font-black text-emerald-900 uppercase tracking-wide">
                    Liquid PKR Balance
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Micro Telemetry Bar */}
          <div className="mt-2.5 bg-white border border-[#28734a]/15 rounded-xl p-2.5 flex items-center justify-between text-[8px] text-[#153d2b] shadow-2xs">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a]"></span>
              <span className="font-bold">Active Squad:</span>
              <span className="font-mono font-black text-[#15803d]">
                {referralStats.activeTeamCount || 0} Deposited
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Downline Hens:</span>
              <span className="font-mono font-black text-[#0d2c20]">
                {referralStats.totalDownlineUnits || 0} Units
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold">Team Volume:</span>
              <span className="font-mono font-black text-indigo-700">
                Rs. {Number(referralStats.totalDownlineVolumePkr || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* SECTION 4: INTERACTIVE SIMULATION / INVITE TOOL      */}
        {/* ==================================================== */}
        <div className="card-farm-3d p-4 bg-white border border-[#28734a]/20 shadow-[0_4px_16px_rgba(21,61,43,0.05)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#f0f5ee]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 text-xs shadow-sm">
                <i className="fa-solid fa-flask-vial"></i>
              </div>
              <div>
                <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide leading-none">
                  Affiliate Testing &amp; Simulation Tool
                </h3>
                <span className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase block mt-0.5">
                  Register Downlines &amp; Credit Real-Time Commission
                </span>
              </div>
            </div>

            <span className="text-[7.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Interactive
            </span>
          </div>

          {/* Tool Navigation Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#f0f5eb] rounded-xl mb-3.5 border border-[#c2d9bf]/60">
            <button
              type="button"
              onClick={() => setSimulatorTab('REGISTER')}
              className={`py-2 rounded-lg font-manrope font-black text-[10.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                simulatorTab === 'REGISTER'
                  ? 'bg-white text-[#153d2b] shadow-xs'
                  : 'text-slate-500 hover:text-[#153d2b]'
              }`}
            >
              <i className="fa-solid fa-user-plus text-[10px]"></i>
              <span>1. Register Downline</span>
            </button>
            <button
              type="button"
              onClick={() => setSimulatorTab('PURCHASE')}
              className={`py-2 rounded-lg font-manrope font-black text-[10.5px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                simulatorTab === 'PURCHASE'
                  ? 'bg-white text-[#153d2b] shadow-xs'
                  : 'text-slate-500 hover:text-[#153d2b]'
              }`}
            >
              <i className="fa-solid fa-cart-shopping text-[10px]"></i>
              <span>2. Simulate Purchase</span>
            </button>
          </div>

          {/* TAB 1: REGISTER DOWNLINE FORM */}
          {simulatorTab === 'REGISTER' && (
            <form onSubmit={handleRegisterDownlineSubmit} className="flex flex-col gap-3">
              <div>
                <label className="text-[8px] font-black text-[#0d2c20] uppercase tracking-wider block mb-1">
                  Downline Farmer Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                    <i className="fa-solid fa-user"></i>
                  </div>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="e.g. farmer_ali_88"
                    className="w-full pl-9 pr-3 py-2 bg-[#f8faf6] border border-[#c2d9bf] rounded-xl text-xs font-bold text-[#0d2c20] placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="text-[8px] font-black text-[#0d2c20] uppercase tracking-wider block mb-1">
                  Affiliate Tier Level <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTierLevel(1)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      newTierLevel === 1
                        ? 'bg-emerald-50 border-[#16a34a] text-emerald-950 shadow-xs'
                        : 'bg-[#f8faf6] border-[#e2ebd9] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-manrope font-black text-[11px] uppercase">Level 1</span>
                      <span className="text-[7.5px] font-black bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                        Direct {l1Percent}%
                      </span>
                    </div>
                    <span className="text-[7.5px] font-medium text-slate-500">
                      Direct invite linked to your code
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTierLevel(2)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      newTierLevel === 2
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-950 shadow-xs'
                        : 'bg-[#f8faf6] border-[#e2ebd9] text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-manrope font-black text-[11px] uppercase">Level 2</span>
                      <span className="text-[7.5px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-md">
                        Secondary {l2Percent}%
                      </span>
                    </div>
                    <span className="text-[7.5px] font-medium text-slate-500">
                      Secondary invite under your squad
                    </span>
                  </button>
                </div>
              </div>

              {/* Upliner selection (if Level 2) */}
              {newTierLevel === 2 && (
                <div>
                  <label className="text-[8px] font-black text-[#0d2c20] uppercase tracking-wider block mb-1">
                    Direct Upliner (Level 1 Parent)
                  </label>
                  {level1Members.length > 0 ? (
                    <select
                      value={newUpliner}
                      onChange={(e) => setNewUpliner(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] border border-[#c2d9bf] rounded-xl text-xs font-bold text-[#0d2c20] focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">-- Select from your Level 1 members --</option>
                      {level1Members.map((m) => (
                        <option key={m.id} value={m.username}>
                          {m.username} (Direct L1)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newUpliner}
                      onChange={(e) => setNewUpliner(e.target.value)}
                      placeholder="e.g. squad_leader_1"
                      className="w-full px-3 py-2 bg-[#f8faf6] border border-[#c2d9bf] rounded-xl text-xs font-bold text-[#0d2c20] placeholder-slate-400 focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all"
                    />
                  )}
                  <span className="text-[7px] text-slate-400 mt-1 block">
                    Level 2 referrals award you {l2Percent.toFixed(2)}% commission whenever they buy hen units.
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full mt-1 bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-xs py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-user-check"></i>
                <span>Register Downline Member</span>
              </button>
            </form>
          )}

          {/* TAB 2: SIMULATE ASSET PURCHASE FORM */}
          {simulatorTab === 'PURCHASE' && (
            <form onSubmit={handleSimulatePurchaseSubmit} className="flex flex-col gap-3">
              {teamMembers.length === 0 ? (
                <div className="bg-[#f8faf6] border border-amber-200/80 rounded-2xl p-4 text-center flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                    <i className="fa-solid fa-users-slash"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase">
                      No Registered Downlines
                    </h4>
                    <p className="text-[8.5px] text-slate-500 mt-0.5">
                      Register at least one downline farmer above to simulate hen purchases and credit commission!
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSimulatorTab('REGISTER')}
                    className="mt-1 bg-[#153d2b] text-[#c9f36a] text-[9.5px] font-black px-3.5 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                  >
                    Go to Registration Form
                  </button>
                </div>
              ) : (
                <>
                  {/* Select downline member */}
                  <div>
                    <label className="text-[8px] font-black text-[#0d2c20] uppercase tracking-wider block mb-1">
                      Select Downline Farmer <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedMemberId || selectedDownlineMember?.id || ''}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#f8faf6] border border-[#c2d9bf] rounded-xl text-xs font-bold text-[#0d2c20] focus:outline-none focus:border-[#16a34a] focus:bg-white transition-all cursor-pointer"
                    >
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.username} — Level {m.tierLevel} ({Number(m.tierLevel) === 1 ? `Direct ${l1Percent}%` : `Secondary ${l2Percent}%`}) | Upliner: {m.upliner}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input & Quick presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[8px] font-black text-[#0d2c20] uppercase tracking-wider">
                        Hen Assets to Purchase ({henUnitPrice} PKR/Unit)
                      </label>
                      <span className="text-[8px] font-bold text-[#15803d]">
                        Rs. 500 / Hen
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPurchaseUnits((p) => Math.max(1, (Number(p) || 1) - 1))}
                        className="w-9 h-9 rounded-xl bg-[#f0f5eb] border border-[#c2d9bf] text-[#153d2b] font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="1000"
                        value={purchaseUnits}
                        onChange={(e) => setPurchaseUnits(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="flex-1 py-1.5 px-3 bg-[#f8faf6] border border-[#c2d9bf] rounded-xl text-center text-sm font-black text-[#0d2c20] focus:outline-none focus:border-[#16a34a]"
                      />
                      <button
                        type="button"
                        onClick={() => setPurchaseUnits((p) => (Number(p) || 1) + 1)}
                        className="w-9 h-9 rounded-xl bg-[#f0f5eb] border border-[#c2d9bf] text-[#153d2b] font-black text-sm flex items-center justify-center active:scale-90 transition-all cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-5 gap-1.5 mt-2">
                      {[1, 2, 5, 10, 25].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setPurchaseUnits(preset)}
                          className={`py-1 rounded-lg text-[9px] font-black tracking-wider transition-all cursor-pointer ${
                            Number(purchaseUnits) === preset
                              ? 'bg-[#153d2b] text-[#c9f36a] shadow-xs'
                              : 'bg-[#f0f5eb] text-[#153d2b] hover:bg-[#e4ede0]'
                          }`}
                        >
                          +{preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic calculation preview card */}
                  <div className="bg-gradient-to-br from-[#f0fdf4] to-[#f8faf6] border border-emerald-300 rounded-2xl p-3 flex flex-col gap-2 shadow-2xs">
                    <div className="flex items-center justify-between text-[8px] font-black uppercase text-slate-400">
                      <span>Simulated Order Preview</span>
                      <span className="text-emerald-700">Real-Time Crediting</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase block">
                          Total Purchase Volume
                        </span>
                        <span className="font-manrope font-black text-[#0d2c20]">
                          Rs. {simulatedPurchaseVolumePkr.toLocaleString()} PKR
                        </span>
                      </div>

                      <div>
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase block">
                          Commission Rate ({Number(selectedDownlineMember?.tierLevel) === 2 ? 'L2' : 'L1'})
                        </span>
                        <span className="font-manrope font-black text-indigo-700">
                          {(simulatedCommissionRate * 100).toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                      <div>
                        <span className="text-[7.5px] font-bold text-slate-500 uppercase block">
                          Your Rewards: Free Eggs + Cash Commission
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-manrope font-black text-sm text-amber-700 flex items-center gap-1">
                            🥚 +{purchaseUnits} Free Eggs
                          </span>
                          <span className="text-slate-300 font-bold">|</span>
                          <span className="font-manrope font-black text-sm text-[#15803d]">
                            +Rs. {simulatedCommissionPkr.toFixed(2)} PKR
                          </span>
                        </div>
                      </div>

                      <span className="text-[8px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Instant Credit
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSimulating}
                    className="w-full bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#166534] hover:from-[#15803d] hover:to-[#14532d] text-white font-manrope font-black text-xs py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-coins"></i>
                    <span>Simulate Purchase &amp; Credit Commission</span>
                  </button>
                </>
              )}
            </form>
          )}
        </div>

        {/* ==================================================== */}
        {/* SECTION 5: TEAM MEMBERS TABLE / LEDGER               */}
        {/* ==================================================== */}
        <div className="card-farm-3d p-4 bg-white border border-[#28734a]/20 shadow-[0_4px_16px_rgba(21,61,43,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-[#f0f5ee]">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs">
                  <i className="fa-solid fa-list-check"></i>
                </div>
                <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider leading-none">
                  Team Members Ledger
                </h3>
              </div>
              <span className="text-[7.5px] font-bold text-slate-400 tracking-wider uppercase block mt-1">
                Showing {filteredTeamMembers.length} of {teamMembers.length} Referred Members
              </span>
            </div>

            {/* Tier Filters */}
            <div className="flex items-center gap-1 bg-[#f0f5eb] p-1 rounded-xl border border-[#c2d9bf]/60">
              <button
                type="button"
                onClick={() => setLedgerTierFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  ledgerTierFilter === 'ALL'
                    ? 'bg-white text-[#153d2b] shadow-2xs'
                    : 'text-slate-500 hover:text-[#153d2b]'
                }`}
              >
                All ({teamMembers.length})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTierFilter('1')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  ledgerTierFilter === '1'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-500 hover:text-emerald-800'
                }`}
              >
                L1 ({referralStats.level1Count})
              </button>
              <button
                type="button"
                onClick={() => setLedgerTierFilter('2')}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  ledgerTierFilter === '2'
                    ? 'bg-white text-indigo-800 shadow-2xs'
                    : 'text-slate-500 hover:text-indigo-800'
                }`}
              >
                L2 ({referralStats.level2Count})
              </button>
            </div>
          </div>

          {/* Search box if members exist */}
          {teamMembers.length > 0 && (
            <div className="mb-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by farmer username or upliner..."
                  className="w-full pl-9 pr-3 py-1.5 bg-[#f8faf6] border border-[#e2ebd9] rounded-xl text-xs font-medium text-[#0d2c20] placeholder-slate-400 focus:outline-none focus:border-[#16a34a]"
                />
              </div>
            </div>
          )}

          {/* Empty State */}
          {teamMembers.length === 0 ? (
            <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2.5 bg-[#fbfdf9] border border-dashed border-[#c2d9bf] rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ecfdf5] to-[#d1fae5] border border-[#a7f3d0] flex items-center justify-center text-2xl text-[#10b981] shadow-inner">
                <i className="fa-solid fa-user-group"></i>
              </div>
              <div>
                <h4 className="font-manrope font-black text-sm text-[#0d2c20] uppercase tracking-wide">
                  No Team Members Yet
                </h4>
                <p className="text-[9px] text-slate-500 max-w-[260px] mx-auto mt-1 leading-relaxed">
                  Share your unique referral link to build your affiliate squad, or use the interactive simulator above to test downline registrations!
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSimulatorTab('REGISTER');
                  window.scrollTo({ top: 350, behavior: 'smooth' });
                }}
                className="mt-1 bg-gradient-to-r from-[#153d2b] to-[#1e523a] text-[#c9f36a] text-[9.5px] font-black px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-user-plus mr-1"></i>
                Register First Downline
              </button>
            </div>
          ) : filteredTeamMembers.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs font-medium">
              No downline members match the filter criteria.
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {filteredTeamMembers.map((member) => {
                const isL1 = Number(member.tierLevel) === 1;
                const dateStr = member.joinDate
                  ? new Date(member.joinDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'N/A';

                return (
                  <div
                    key={member.id}
                    className="p-3 bg-[#f8faf6] hover:bg-white border border-[#e2ebd9] hover:border-[#16a34a]/40 rounded-2xl transition-all shadow-2xs flex flex-col gap-2"
                  >
                    {/* Top Row: Username + Tier Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-xs flex-shrink-0 ${
                            isL1
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          {member.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-manrope font-black text-xs text-[#0d2c20] truncate">
                            {member.username}
                          </h4>
                          <span className="text-[7.5px] text-slate-400 block">
                            Joined: {dateStr}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                            isL1
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                              : 'bg-indigo-50 text-indigo-800 border border-indigo-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isL1 ? 'bg-emerald-600' : 'bg-indigo-600'
                            }`}
                          ></span>
                          <span>{isL1 ? `Level 1 (${l1Percent}%)` : `Level 2 (${l2Percent}%)`}</span>
                        </span>
                      </div>
                    </div>

                    {/* Hen & Free Egg Reward Highlight Ribbon */}
                    <div className="flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#c9f36a]/15 to-emerald-500/10 border border-amber-300/40 text-[8px]">
                      <div className="flex items-center gap-1.5 text-[#0d2c20]">
                        <span className="text-sm">🥚</span>
                        {Number(member.assetsPurchased || 0) > 0 ? (
                          <span className="font-bold">
                            Is member ne <strong className="text-emerald-800 font-black">{member.assetsPurchased} Hens</strong> khareedi ➜ Aap ko mile <strong className="text-amber-800 font-black">+{member.assetsPurchased} Free Eggs</strong>!
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">
                            Is member ne 0 Hen khareedi ➜ <strong className="text-slate-700">0 Eggs (Sirf join par koi anda nahi)</strong>
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-black text-[7.5px] uppercase tracking-wide ${Number(member.assetsPurchased || 0) > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                        {Number(member.assetsPurchased || 0) > 0 ? `+${member.assetsPurchased} Eggs` : '0 Eggs'}
                      </span>
                    </div>

                    {/* Middle Row: Metrics (Hens, Eggs Earned, Commission, Volume) */}
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-[8px]">
                      <div className="bg-white rounded-lg p-1.5 border border-[#e2ebd9]/70 text-center">
                        <span className="text-slate-400 block font-bold uppercase">Hens</span>
                        <span className="font-mono font-black text-[#0d2c20] text-[10px]">
                          {member.assetsPurchased || 0}
                        </span>
                      </div>

                      <div className="bg-amber-50/70 rounded-lg p-1.5 border border-amber-200 text-center">
                        <span className="text-amber-700 block font-bold uppercase">Eggs</span>
                        <span className="font-mono font-black text-amber-800 text-[10px]">
                          +{member.assetsPurchased || 0}
                        </span>
                      </div>

                      <div className="bg-white rounded-lg p-1.5 border border-[#e2ebd9]/70 text-center">
                        <span className="text-slate-400 block font-bold uppercase">Volume</span>
                        <span className="font-mono font-black text-[#0d2c20] text-[10px] truncate block">
                          Rs. {Number(member.totalSpentPkr || 0).toLocaleString()}
                        </span>
                      </div>

                      <div className="bg-white rounded-lg p-1.5 border border-emerald-200 text-center">
                        <span className="text-emerald-700 block font-bold uppercase">Cash</span>
                        <span className="font-mono font-black text-[#15803d] text-[10px] truncate block">
                          Rs. {Number(member.commissionEarnedPkr || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action: Upliner info & Quick Simulate Purchase */}
                    <div className="flex items-center justify-between text-[7.5px] pt-1">
                      <span className="text-slate-400">
                        Upliner: <span className="font-bold text-slate-700">{member.upliner || 'Root'}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMemberId(member.id);
                          setSimulatorTab('PURCHASE');
                          window.scrollTo({ top: 380, behavior: 'smooth' });
                        }}
                        className="text-[#15803d] hover:text-[#0d2c20] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                      >
                        <i className="fa-solid fa-cart-plus"></i>
                        <span>Simulate Purchase</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================================================== */}
        {/* SECTION 6: CLEAN BASELINE RESET & COMMISSION POLICY  */}
        {/* ==================================================== */}
        <div className="flex flex-col gap-3">
          {/* 2-Tier Policy Breakdown Card */}
          <div className="card-farm-3d p-4 bg-gradient-to-br from-[#f8faf6] to-white border border-[#28734a]/20 shadow-xs">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">
                <i className="fa-solid fa-scale-balanced"></i>
              </div>
              <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide">
                2-Tier Affiliate Commission Rules
              </h4>
            </div>

            <div className="space-y-2 text-[9px] text-[#153d2b] leading-relaxed">
              <div className="flex items-start gap-2 bg-emerald-50/70 border border-emerald-200/60 rounded-xl p-2.5">
                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center flex-shrink-0">
                  L1
                </span>
                <div>
                  <span className="font-black text-emerald-900 block">
                    Direct Tier 1 Referrals: {l1Percent.toFixed(2)}% Cash Commission
                  </span>
                  <span className="text-slate-600">
                    Earn {l1Percent.toFixed(2)}% on every hen asset purchased by farmers who register with your referral link/code (Rs. {(henUnitPrice * l1Percent / 100).toFixed(2)} PKR per {henUnitPrice} PKR unit).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-indigo-50/70 border border-indigo-200/60 rounded-xl p-2.5">
                <span className="w-5 h-5 rounded-md bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center flex-shrink-0">
                  L2
                </span>
                <div>
                  <span className="font-black text-indigo-900 block">
                    Secondary Tier 2 Referrals: {l2Percent.toFixed(2)}% Cash Commission
                  </span>
                  <span className="text-slate-600">
                    Earn {l2Percent.toFixed(2)}% on every hen asset purchased by farmers invited by your direct downlines (Rs. {(henUnitPrice * l2Percent / 100).toFixed(2)} PKR per {henUnitPrice} PKR unit).
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 1-Click Fresh State Reset Action Card */}
          <div className="card-farm-3d p-4 bg-rose-50/50 border border-rose-200/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center text-lg flex-shrink-0">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <div>
                <h4 className="font-manrope font-black text-xs text-rose-950 uppercase tracking-wide">
                  Clean Baseline State Reset
                </h4>
                <p className="text-[8px] text-rose-800/80 mt-0.5 leading-snug">
                  Purge simulated downlines &amp; temporary records to restore clean initial production state.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetToFresh}
              className="bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-manrope font-black text-[10.5px] px-4 py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              <i className="fa-solid fa-rotate-left"></i>
              <span>Reset to Fresh State</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
