import React, { useState, useMemo, useCallback } from 'react';
import { useFarm, COMMISSION_RATES, ASSET_SPEC, VERIFIED_MERCHANTS, DEFAULT_PLATFORM_SETTINGS } from '../context/FarmContext';
import easypisaImg from '../assets/easypisa.png';
import jazzcashImg from '../assets/jazzcash.png';
import henImg from '../assets/hen.png';
import eggImg from '../assets/egg.png';
import logoImg from '../assets/logo.webp';
import '../rawafiles.css';

/**
 * AdminAccessDeniedGuard: Security barrier rendered when an unauthenticated
 * or unauthorized farmer attempts to access the Super Admin Cockpit.
 */
function AdminAccessDeniedGuard({ user, onReturn, onLogin }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#04120a] via-[#071c11] to-[#030d07] text-white flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-lg rounded-2xl p-6 sm:p-8 text-center border-2 border-rose-500/40 bg-gradient-to-b from-[#180a0a] via-[#120808] to-[#0d2c20] shadow-[0_15px_40px_rgba(225,29,72,0.3)] relative overflow-hidden">
        {/* Top ambient aura */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Locked Shield / Padlock Badge */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-rose-500/10 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 text-3xl shadow-[0_0_25px_rgba(244,63,94,0.35)] animate-pulse mb-4">
          <i className="fa-solid fa-lock"></i>
          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-[#082013] text-[11px] flex items-center justify-center font-black border border-white">
            <i className="fa-solid fa-shield"></i>
          </span>
        </div>

        <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 mb-2">
          Super Admin Clearance Required
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-white font-manrope uppercase tracking-tight mb-2">
          Access Restricted
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
          The active session <span className="font-bold text-amber-300">@{user?.username || 'Guest'}</span> lacks root administrative clearance. This area is reserved exclusively for platform operators and auditors.
        </p>

        {/* Operator Hint Pill */}
        <div className="bg-black/40 border border-amber-500/25 rounded-xl p-3 mb-6 text-left flex items-start gap-2.5">
          <i className="fa-solid fa-circle-info text-amber-400 text-sm mt-0.5"></i>
          <div className="text-[11px] text-slate-300">
            <span className="font-bold text-amber-300 block">Operator Credential Hint:</span>
            <span>Default Super Admin: <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">admin@gmail.com</code> / <code className="bg-black/60 px-1.5 py-0.5 rounded text-amber-200">password123</code></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onReturn}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Return to Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onLogin}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-right-to-bracket"></i>
            <span>Sign in as Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * UserBalanceModal: Dialog allowing Super Admin to adjust liquid PKR,
 * egg inventory, and active hen flock with an audit note.
 */
function UserBalanceModal({ targetUser, onClose, onSave }) {
  const [balance, setBalance] = useState(targetUser?.balance ?? 0);
  const [eggVault, setEggVault] = useState(targetUser?.eggVault ?? 0);
  const [hens, setHens] = useState(targetUser?.activeHens ?? 0);
  const [auditNote, setAuditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSaving(true);
    onSave(targetUser.id, {
      balance: Math.max(0, Number(balance)),
      eggVault: Math.max(0, Number(eggVault)),
      hens: Math.max(0, Number(hens)),
      auditNote
    });
    setIsSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl w-full max-w-md bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#081a10] border border-amber-400/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-400/20 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
              <i className="fa-solid fa-sliders text-sm"></i>
            </div>
            <div>
              <h3 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                Adjust Farmer Balances
              </h3>
              <p className="text-[11px] text-amber-200/80">
                User: <span className="font-bold text-white">@{targetUser?.username}</span> ({targetUser?.accountId || targetUser?.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* PKR Balance Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Liquid PKR Balance (Rs.)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                PKR
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                required
                className="w-full bg-black/40 border border-emerald-500/40 rounded-xl py-2 pl-12 pr-3 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Egg Vault Balance Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Egg Vault Inventory
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-300">
                <i className="fa-solid fa-egg"></i>
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={eggVault}
                onChange={(e) => setEggVault(e.target.value)}
                required
                className="w-full bg-black/40 border border-amber-500/40 rounded-xl py-2 pl-10 pr-3 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Active Hen Units Input */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Active Hens in Coop (Units)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-amber-400">
                <i className="fa-solid fa-crow"></i>
              </span>
              <input
                type="number"
                min="0"
                step="1"
                value={hens}
                onChange={(e) => setHens(e.target.value)}
                required
                className="w-full bg-black/40 border border-amber-500/40 rounded-xl py-2 pl-10 pr-3 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Audit Reason */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Administrative Audit Note / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. Deposit dispute resolution / VIP promo credit"
              value={auditNote}
              onChange={(e) => setAuditNote(e.target.value)}
              className="w-full bg-black/40 border border-slate-600 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400 placeholder-slate-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              {isSaving ? 'Saving...' : 'Apply Adjustments'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * RejectWithdrawalModal: Dialog allowing Super Admin to reject cashout
 * request with a selected reason and optional balance refund toggle.
 */
function RejectWithdrawalModal({ withdrawal, onClose, onConfirm }) {
  const [reasonCategory, setReasonCategory] = useState('Account Title Mismatch / Invalid Account Number');
  const [customNote, setCustomNote] = useState('');
  const [refundBalance, setRefundBalance] = useState(true);

  const REASON_PRESETS = [
    'Account Title Mismatch / Invalid Account Number',
    'Suspected Fraudulent / Unverified Activity',
    'Gateway Temporary Network Maintenance',
    'User Requested Order Cancellation',
    'Other / Custom Reason'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = customNote.trim() ? `${reasonCategory}: ${customNote.trim()}` : reasonCategory;
    onConfirm(withdrawal.id, finalReason, refundBalance);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="rounded-2xl w-full max-w-md bg-gradient-to-b from-[#180a0a] via-[#100808] to-[#0d2c20] border border-rose-500/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(225,29,72,0.3)] relative overflow-hidden text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-500/20 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400">
              <i className="fa-solid fa-ban text-sm"></i>
            </div>
            <div>
              <h3 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                Reject Cashout Request
              </h3>
              <p className="text-[11px] text-rose-300/80">
                ID: <span className="font-bold text-white">{withdrawal?.id}</span> • Rs. {Number(withdrawal?.amountPkr || 0).toLocaleString()} PKR
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-slate-300 hover:text-white hover:bg-black/60 flex items-center justify-center transition-all"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Affected summary */}
          <div className="bg-black/40 border border-rose-500/20 rounded-xl p-3 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Farmer:</span>
              <span className="font-bold text-white">{withdrawal?.accountTitle} (@{withdrawal?.username || 'user'})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Egg Volume / Store:</span>
              <span className="font-bold text-amber-300">{withdrawal?.eggs} Eggs • {withdrawal?.store}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Destination:</span>
              <span className="font-bold text-emerald-400">{withdrawal?.method} • {withdrawal?.accountNumber}</span>
            </div>
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Rejection Reason Category
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-black/50 border border-rose-500/40 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-rose-400"
            >
              {REASON_PRESETS.map((reason) => (
                <option key={reason} value={reason} className="bg-slate-900 text-white">
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Note */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Additional Details / Operator Note
            </label>
            <textarea
              rows="2"
              placeholder="Explain why this request is being rejected..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-black/50 border border-slate-600 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-rose-400 placeholder-slate-500"
            ></textarea>
          </div>

          {/* Balance Refund Checkbox */}
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-3">
            <input
              type="checkbox"
              id="refundCheckbox"
              checked={refundBalance}
              onChange={(e) => setRefundBalance(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 border-slate-700 bg-slate-900"
            />
            <label htmlFor="refundCheckbox" className="text-xs text-slate-300 cursor-pointer select-none">
              <span className="font-bold text-emerald-300 block">Refund Balance to User</span>
              Credit Rs. {Number(withdrawal?.amountPkr || 0).toLocaleString()} PKR back to farmer account balance upon rejection.
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * AdminDashboardPage: Master Super Admin Cockpit & Platform Control Center
 * Mission-critical governance hub for users, withdrawals, affiliates,
 * deposit gateways, and economic platform settings.
 */
export default function AdminDashboardPage() {
  const {
    user,
    users = [],
    withdrawals = [],
    platformSettings = DEFAULT_PLATFORM_SETTINGS,
    activityLogs = [],
    teamMembers = [],
    blockUser,
    unblockUser,
    setUserRole,
    updateUserBalances,
    approveWithdrawal,
    rejectWithdrawal,
    updatePlatformSettings,
    showToast,
    navigateTo,
    logout
  } = useFarm();

  // Route security clearance
  const isAdmin = Boolean(
    user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com')
  );

  // Active Tab: 'USERS' | 'WITHDRAWALS' | 'AFFILIATES' | 'GATEWAYS' | 'SETTINGS'
  const [activeTab, setActiveTab] = useState('USERS');

  // Modal states
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState(null);

  // Tab 1 (Users) state
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Blocked'

  // Tab 2 (Withdrawals) state
  const [withdrawalFilter, setWithdrawalFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'

  // Tab 3 (Affiliates) state
  const [selectedAffiliateUsername, setSelectedAffiliateUsername] = useState('mrsaqib242');

  // Tab 4 (Gateways) state
  const [gatewayTab, setGatewayTab] = useState('easypisa'); // 'easypisa' | 'jazzcash'
  const [easyTitle, setEasyTitle] = useState(platformSettings?.depositGateways?.easypisa?.accountTitle || '');
  const [easyNumber, setEasyNumber] = useState(platformSettings?.depositGateways?.easypisa?.accountNumber || '');
  const [easyQr, setEasyQr] = useState(platformSettings?.depositGateways?.easypisa?.qrCodeUrl || '/src/assets/easypisa.png');
  const [easyInst, setEasyInst] = useState(platformSettings?.depositGateways?.easypisa?.instructions || '');

  const [jazzTitle, setJazzTitle] = useState(platformSettings?.depositGateways?.jazzcash?.accountTitle || '');
  const [jazzNumber, setJazzNumber] = useState(platformSettings?.depositGateways?.jazzcash?.accountNumber || '');
  const [jazzQr, setJazzQr] = useState(platformSettings?.depositGateways?.jazzcash?.qrCodeUrl || '/src/assets/jazzcash.png');
  const [jazzInst, setJazzInst] = useState(platformSettings?.depositGateways?.jazzcash?.instructions || '');

  // Tab 5 (Settings) state
  const [waGroup, setWaGroup] = useState(platformSettings?.communityLinks?.whatsappGroup || '');
  const [waChannel, setWaChannel] = useState(platformSettings?.communityLinks?.whatsappChannel || '');
  const [supportPhone, setSupportPhone] = useState(platformSettings?.communityLinks?.supportPhone || '');
  const [popupEnabled, setPopupEnabled] = useState(Boolean(platformSettings?.communityLinks?.popupEnabled ?? true));

  const [rateSonica, setRateSonica] = useState(platformSettings?.marketRates?.eggRates?.sonica ?? 32);
  const [rateUsmaina, setRateUsmaina] = useState(platformSettings?.marketRates?.eggRates?.usmaina ?? 30);
  const [rateSyed, setRateSyed] = useState(platformSettings?.marketRates?.eggRates?.syed ?? 33);
  const [henPrice, setHenPrice] = useState(platformSettings?.marketRates?.henUnitPrice ?? 500);

  // Sync state if platformSettings changes from context
  React.useEffect(() => {
    if (platformSettings?.depositGateways?.easypisa) {
      setEasyTitle(platformSettings.depositGateways.easypisa.accountTitle || '');
      setEasyNumber(platformSettings.depositGateways.easypisa.accountNumber || '');
      setEasyQr(platformSettings.depositGateways.easypisa.qrCodeUrl || '/src/assets/easypisa.png');
      setEasyInst(platformSettings.depositGateways.easypisa.instructions || '');
    }
    if (platformSettings?.depositGateways?.jazzcash) {
      setJazzTitle(platformSettings.depositGateways.jazzcash.accountTitle || '');
      setJazzNumber(platformSettings.depositGateways.jazzcash.accountNumber || '');
      setJazzQr(platformSettings.depositGateways.jazzcash.qrCodeUrl || '/src/assets/jazzcash.png');
      setJazzInst(platformSettings.depositGateways.jazzcash.instructions || '');
    }
    if (platformSettings?.communityLinks) {
      setWaGroup(platformSettings.communityLinks.whatsappGroup || '');
      setWaChannel(platformSettings.communityLinks.whatsappChannel || '');
      setSupportPhone(platformSettings.communityLinks.supportPhone || '');
      setPopupEnabled(Boolean(platformSettings.communityLinks.popupEnabled ?? true));
    }
    if (platformSettings?.marketRates) {
      setRateSonica(platformSettings.marketRates.eggRates?.sonica ?? 32);
      setRateUsmaina(platformSettings.marketRates.eggRates?.usmaina ?? 30);
      setRateSyed(platformSettings.marketRates.eggRates?.syed ?? 33);
      setHenPrice(platformSettings.marketRates.henUnitPrice ?? 500);
    }
  }, [platformSettings]);

  // Compute Platform KPI Metrics
  const kpis = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    const wdList = Array.isArray(withdrawals) ? withdrawals : [];

    const totalUsers = userList.length;
    const activeUsers = userList.filter((u) => u.status === 'Active').length;
    const blockedUsers = userList.filter((u) => u.status === 'Blocked').length;

    const totalActiveHens = userList.reduce((sum, u) => sum + (Number(u.activeHens) || 0), 0);
    const totalEggsInVaults = userList.reduce((sum, u) => sum + (Number(u.eggVault) || 0), 0);
    const totalEggsSold = wdList.reduce((sum, w) => sum + (Number(w.eggs) || 0), 0);
    const totalEggsProduced = totalEggsInVaults + totalEggsSold;

    const completedWds = wdList.filter((w) => w.status === 'Completed');
    const totalLiquidatedPkr = completedWds.reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0);

    const pendingWds = wdList.filter((w) => w.status === 'Pending');
    const pendingCount = pendingWds.length;
    const pendingVolumePkr = pendingWds.reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalActiveHens,
      totalEggsProduced,
      totalLiquidatedPkr,
      completedWdCount: completedWds.length,
      pendingCount,
      pendingVolumePkr
    };
  }, [users, withdrawals]);

  // Tab 1 Filtered Users
  const filteredUsers = useMemo(() => {
    const list = Array.isArray(users) ? users : [];
    return list.filter((u) => {
      const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      const q = userSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.accountId && u.accountId.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [users, userSearch, userStatusFilter]);

  // Tab 2 Filtered Withdrawals
  const filteredWithdrawals = useMemo(() => {
    const list = Array.isArray(withdrawals) ? withdrawals : [];
    return list.filter((w) => {
      if (withdrawalFilter === 'All') return true;
      return w.status === withdrawalFilter;
    });
  }, [withdrawals, withdrawalFilter]);

  // Tab 3 Downlines genealogy for selected user
  const affiliateGenealogy = useMemo(() => {
    const userList = Array.isArray(users) ? users : [];
    const root =
      userList.find(
        (u) =>
          u.username.toLowerCase() === selectedAffiliateUsername.toLowerCase() ||
          u.id === selectedAffiliateUsername
      ) || userList[0];

    if (!root) {
      return { root: null, level1: [], level2: [], totalInvited: 0, totalVolume: 0, totalCommission: 0 };
    }

    // Direct Level 1 Downlines (upliner equals root's username or referralCode)
    const level1 = userList.filter(
      (u) =>
        u.id !== root.id &&
        u.upliner &&
        (u.upliner.toLowerCase() === root.username.toLowerCase() ||
          (root.referralCode && u.upliner.toLowerCase() === root.referralCode.toLowerCase()))
    );

    const level1Usernames = level1.map((u) => u.username.toLowerCase());

    // Secondary Level 2 Downlines (upliner is in Level 1)
    const level2 = userList.filter(
      (u) => u.upliner && level1Usernames.includes(u.upliner.toLowerCase())
    );

    const l1Volume = level1.reduce((sum, u) => sum + ((Number(u.activeHens) || 0) * 500), 0);
    const l2Volume = level2.reduce((sum, u) => sum + ((Number(u.activeHens) || 0) * 500), 0);
    const l1Comm = l1Volume * (COMMISSION_RATES?.LEVEL_1 || 0.02);
    const l2Comm = l2Volume * (COMMISSION_RATES?.LEVEL_2 || 0.01);

    return {
      root,
      level1,
      level2,
      totalInvited: level1.length + level2.length,
      level1Count: level1.length,
      level2Count: level2.length,
      totalVolume: l1Volume + l2Volume,
      totalCommission: l1Comm + l2Comm
    };
  }, [users, selectedAffiliateUsername]);

  // 1-Click Copy Helper
  const handleCopy = (text, label) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      showToast('success', `${label} copied to clipboard!`);
    } catch (_) {
      showToast('info', `${label}: ${text}`);
    }
  };

  // 1-Click Block/Unblock toggle handler
  const handleToggleBlock = (u) => {
    if (u.role === 'admin' || u.id === 'usr_admin' || u.username === 'admin' || u.email === 'admin@gmail.com') {
      showToast('error', 'Super Admin accounts are protected and cannot be blocked.');
      return;
    }
    if (u.status === 'Active') {
      blockUser(u.id);
    } else {
      unblockUser(u.id);
    }
  };

  // 1-Click Promote to Admin or Demote to Farmer handler
  const handleToggleRole = (u) => {
    if (!u) return;
    const isRoot = u.id === 'usr_admin' || u.username === 'admin' || u.email === 'admin@gmail.com';
    if (isRoot) {
      showToast('error', 'Primary Root Super Admin account cannot be modified.');
      return;
    }
    const currentRole = u.role || 'farmer';
    const nextRole = currentRole === 'admin' ? 'farmer' : 'admin';
    setUserRole(u.id, nextRole);
  };

  // 1-Click Approve Withdrawal
  const handleApproveWithdrawal = (withdrawalId) => {
    approveWithdrawal(withdrawalId);
  };

  // Save Gateway Settings Handler
  const handleSaveGateways = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      depositGateways: {
        easypisa: {
          accountTitle: easyTitle,
          accountNumber: easyNumber,
          qrCodeUrl: easyQr,
          instructions: easyInst
        },
        jazzcash: {
          accountTitle: jazzTitle,
          accountNumber: jazzNumber,
          qrCodeUrl: jazzQr,
          instructions: jazzInst
        }
      }
    });
  };

  // Save Platform Settings Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      communityLinks: {
        whatsappGroup: waGroup,
        whatsappGroupUrl: waGroup,
        whatsappChannel: waChannel,
        whatsappChannelUrl: waChannel,
        supportPhone: supportPhone,
        popupEnabled: popupEnabled,
        communityPopupEnabled: popupEnabled
      },
      marketRates: {
        henUnitPrice: Number(henPrice) || 500,
        stores: [
          { id: 'sonica', name: 'Sonica FORM STORE', rate: Number(rateSonica) || 32 },
          { id: 'usmaina', name: 'Usmaina Poltry Farm', rate: Number(rateUsmaina) || 30 },
          { id: 'syed', name: 'Syed poultry farm', rate: Number(rateSyed) || 33 }
        ],
        eggRates: {
          sonica: Number(rateSonica) || 32,
          usmaina: Number(rateUsmaina) || 30,
          syed: Number(rateSyed) || 33
        }
      }
    });
  };

  // Security barrier check
  if (!isAdmin) {
    return (
      <AdminAccessDeniedGuard
        user={user}
        onReturn={() => navigateTo('/dashboard')}
        onLogin={() => navigateTo('/login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#030d07] via-[#06180f] to-[#020804] text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      {/* 1. Executive Top Sticky Admin Header */}
      <header className="sticky top-0 z-40 bg-[#06180f]/95 backdrop-blur-md border-b border-amber-400/20 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full rounded-[10px] bg-[#071c11] flex items-center justify-center text-amber-300">
                <i className="fa-solid fa-crown text-lg"></i>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                  AL Rehman Meta Eggs
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-[#071c11] shadow-sm">
                  Super Admin Cockpit
                </span>
                <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ROOT CLEARANCE
                </span>
              </div>
              <p className="text-[11px] text-amber-200/70 hidden sm:block">
                Agribusiness Governance, P2P Liquidity &amp; Platform Yield Engine
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-emerald-500/40 text-[11px] font-bold text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden md:inline">SYSTEM</span>
              <span>LIVE</span>
            </div>

            {/* Switch to Farmer App */}
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
              title="Open Farmer Dashboard"
            >
              <i className="fa-solid fa-house-chimney text-xs"></i>
              <span className="hidden sm:inline">Farmer App</span>
            </button>

            {/* Logout Admin */}
            <button
              type="button"
              onClick={() => {
                logout();
                navigateTo('/login');
              }}
              className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-rose-950/80 border border-slate-700 hover:border-rose-500 text-slate-300 hover:text-rose-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
              title="Logout from Admin"
            >
              <i className="fa-solid fa-arrow-right-from-bracket text-xs"></i>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Executive Desktop/Laptop Workspace */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Canopy Admin Command HUD Header Banner */}
        <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-[#082013] via-[#0d2c20] to-[#153d2b] border border-amber-400/35 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 p-0.5 shadow-lg flex items-center justify-center flex-shrink-0">
                <div className="w-full h-full rounded-[14px] bg-[#082013] flex items-center justify-center text-amber-300">
                  <i className="fa-solid fa-crown text-2xl"></i>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-manrope font-black text-xl sm:text-2xl text-white uppercase tracking-tight">
                    Super Admin Cockpit
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-[#082013] shadow-sm">
                    Root Governance
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-200/90 mt-0.5">
                  AL Rehman Meta Eggs Agribusiness Governance, Real-Time P2P Liquidity &amp; Yield Matrix
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-xl bg-black/45 border border-amber-400/30 text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <i className="fa-solid fa-users text-xs"></i>
                <span>{kpis.totalUsers} Farmers Registered</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-black/45 border border-emerald-500/40 text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <i className="fa-solid fa-sack-dollar text-xs"></i>
                <span>Rs. {kpis.totalLiquidatedPkr.toLocaleString()} Liquidated</span>
              </span>
            </div>
          </div>
        </div>

        {/* 3. Top 5 Platform KPI Overview Cards (Full desktop 5-col grid, no text truncation!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Card 1: Total Registered Users */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#0a2216] to-[#071910] border border-emerald-500/30 shadow-lg hover:border-emerald-400/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Total Farmers</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <i className="fa-solid fa-users text-xs"></i>
              </div>
            </div>
            <div>
              <div className="font-manrope font-black text-2xl sm:text-3xl text-white">
                {kpis.totalUsers}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                {kpis.activeUsers} Active • {kpis.blockedUsers} Blocked
              </div>
            </div>
          </div>

          {/* Card 2: Total Active Hens */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#181a0a] to-[#0f1408] border border-amber-500/30 shadow-lg hover:border-amber-400/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Active Flock</span>
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <i className="fa-solid fa-crow text-xs"></i>
              </div>
            </div>
            <div>
              <div className="font-manrope font-black text-2xl sm:text-3xl text-amber-300">
                {kpis.totalActiveHens} <span className="text-sm text-amber-400 font-bold">Hens</span>
              </div>
              <div className="text-xs text-amber-300 font-semibold mt-1">
                +{kpis.totalActiveHens} Eggs / 24h Yield
              </div>
            </div>
          </div>

          {/* Card 3: Total Eggs Produced */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#19190a] to-[#121208] border border-yellow-500/30 shadow-lg hover:border-yellow-400/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Eggs Produced</span>
              <div className="w-7 h-7 rounded-lg bg-yellow-500/20 text-yellow-300 flex items-center justify-center">
                <i className="fa-solid fa-egg text-xs"></i>
              </div>
            </div>
            <div>
              <div className="font-manrope font-black text-2xl sm:text-3xl text-yellow-300">
                {kpis.totalEggsProduced}
              </div>
              <div className="text-xs text-yellow-300 font-semibold mt-1">
                ~Rs. {(kpis.totalEggsProduced * 32).toLocaleString()} PKR Est.
              </div>
            </div>
          </div>

          {/* Card 4: Total Liquidated PKR */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#0a2216] to-[#071910] border border-emerald-500/30 shadow-lg hover:border-emerald-400/50 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Liquidated PKR</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <i className="fa-solid fa-sack-dollar text-xs"></i>
              </div>
            </div>
            <div>
              <div className="font-manrope font-black text-xl sm:text-2xl text-emerald-400">
                Rs. {kpis.totalLiquidatedPkr.toLocaleString()}
              </div>
              <div className="text-xs text-emerald-400 font-semibold mt-1">
                {kpis.completedWdCount} Cashouts Disbursed
              </div>
            </div>
          </div>

          {/* Card 5: Pending Cashouts Queue */}
          <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-[#220a0a] to-[#140808] border border-rose-500/40 shadow-lg hover:border-rose-400/60 transition-all relative overflow-hidden flex flex-col justify-between">
            {kpis.pendingCount > 0 && (
              <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            )}
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
              <span>Pending Queue</span>
              <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <i className="fa-solid fa-hourglass-half text-xs"></i>
              </div>
            </div>
            <div>
              <div className="font-manrope font-black text-2xl sm:text-3xl text-rose-400">
                {kpis.pendingCount}
              </div>
              <div className="text-xs text-rose-300 font-semibold mt-1">
                Rs. {kpis.pendingVolumePkr.toLocaleString()} PKR Queue
              </div>
            </div>
          </div>
        </div>

        {/* 4. 5 Main Operational Tabs Bar */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/50 border border-amber-400/25 overflow-x-auto no-scrollbar shadow-lg">
          <button
            type="button"
            onClick={() => setActiveTab('USERS')}
            className={`flex-1 min-w-[125px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
              activeTab === 'USERS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-users-gear text-sm"></i>
            <span>Users &amp; Farmers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={`flex-1 min-w-[145px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none relative cursor-pointer ${
              activeTab === 'WITHDRAWALS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-money-bill-transfer text-sm"></i>
            <span>Cashout Desk</span>
            {kpis.pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'WITHDRAWALS' ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {kpis.pendingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AFFILIATES')}
            className={`flex-1 min-w-[125px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
              activeTab === 'AFFILIATES'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-sitemap text-sm"></i>
            <span>Downlines</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('GATEWAYS')}
            className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
              activeTab === 'GATEWAYS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-qrcode text-sm"></i>
            <span>Gateways &amp; QR</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SETTINGS')}
            className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none cursor-pointer ${
              activeTab === 'SETTINGS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-sliders text-sm"></i>
            <span>Platform Settings</span>
          </button>
        </div>

        {/* =========================================================================
            TAB 1: USERS MANAGEMENT
           ========================================================================= */}
        {activeTab === 'USERS' && (
          <div className="space-y-4">
            {/* Search and Status Filter Bar */}
            <div className="rounded-2xl p-4 bg-black/40 border border-emerald-500/30 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-md">
              <div className="relative flex-1">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search by username, email, account ID, or name..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-1.5 self-center sm:self-auto">
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userStatusFilter === 'ALL'
                      ? 'bg-amber-400 text-[#082013] font-black'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('Active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userStatusFilter === 'Active'
                      ? 'bg-emerald-500 text-white font-black'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  Active ({users.filter((u) => u.status === 'Active').length})
                </button>
                <button
                  type="button"
                  onClick={() => setUserStatusFilter('Blocked')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    userStatusFilter === 'Blocked'
                      ? 'bg-rose-600 text-white font-black'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  Blocked ({users.filter((u) => u.status === 'Blocked').length})
                </button>
              </div>
            </div>

            {/* Users Ledger Cards */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="rounded-2xl p-8 text-center text-slate-400 bg-black/30 border border-slate-800">
                  <i className="fa-solid fa-user-slash text-2xl text-slate-500 mb-2"></i>
                  <p className="text-sm">No users matched your search criteria.</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isRootAdmin = u.id === 'usr_admin' || u.username === 'admin' || u.email === 'admin@gmail.com';
                  const isUserAdmin = u.role === 'admin' || isRootAdmin;
                  const isBlocked = u.status === 'Blocked';

                  return (
                    <div
                      key={u.id || u.username}
                      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#0a2216] via-[#0d2c20] to-[#071910] border transition-all shadow-md ${
                        isBlocked ? 'border-rose-500/40 bg-rose-950/10' : 'border-amber-400/20'
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        {/* Farmer Identity */}
                        <div className="flex items-start gap-3">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold shadow-md ${
                            isUserAdmin
                              ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-[#082013]'
                              : isBlocked
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          }`}>
                            {isUserAdmin ? <i className="fa-solid fa-crown text-base"></i> : <i className="fa-solid fa-user text-base"></i>}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-manrope font-black text-sm sm:text-base text-white">
                                {u.name || u.username}
                              </span>
                              <span className="text-xs text-amber-300 font-mono">
                                @{u.username}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ({u.accountId || u.id})
                              </span>

                              {/* Role Pill */}
                              {isUserAdmin ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-400 text-[#082013]">
                                  Admin
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                                  Farmer
                                </span>
                              )}

                              {/* Status Pill */}
                              {isBlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                                  <i className="fa-solid fa-ban text-[8px]"></i> Blocked
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                                  <i className="fa-solid fa-circle-check text-[8px]"></i> Active
                                </span>
                              )}
                            </div>

                            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3 flex-wrap">
                              <span><i className="fa-regular fa-envelope text-[10px] mr-1"></i>{u.email}</span>
                              <span><i className="fa-solid fa-user-tag text-[10px] mr-1"></i>Upliner: {u.upliner || 'N/A'}</span>
                              <span><i className="fa-regular fa-calendar text-[10px] mr-1"></i>Joined: {u.joinDate || '2026-10-15'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Live Balances Matrix */}
                        <div className="flex items-center gap-2 sm:gap-3 bg-black/40 border border-slate-800 rounded-xl px-3 py-2 text-xs">
                          <div className="text-center px-1.5">
                            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Balance</span>
                            <span className="font-mono font-bold text-emerald-400">
                              Rs. {Number(u.balance || 0).toLocaleString()}
                            </span>
                          </div>
                          <div className="h-6 w-px bg-slate-800"></div>
                          <div className="text-center px-1.5">
                            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Egg Vault</span>
                            <span className="font-mono font-bold text-amber-300">
                              {Number(u.eggVault || 0)} <span className="text-[10px] font-normal">Eggs</span>
                            </span>
                          </div>
                          <div className="h-6 w-px bg-slate-800"></div>
                          <div className="text-center px-1.5">
                            <span className="text-[9.5px] uppercase font-bold text-slate-400 block">Hens</span>
                            <span className="font-mono font-bold text-yellow-300">
                              {Number(u.activeHens || 0)} <span className="text-[10px] font-normal">Units</span>
                            </span>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2 self-end md:self-center flex-wrap">
                          <button
                            type="button"
                            onClick={() => setBalanceModalUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/50 hover:bg-amber-400 hover:text-[#082013] text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                            title="Adjust Balances"
                          >
                            <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                            <span>Adjust</span>
                          </button>

                          {/* Role Action: Make Admin or Demote */}
                          {isRootAdmin ? (
                            <span className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1 select-none" title="Root Super Admin">
                              <i className="fa-solid fa-shield text-[10px]"></i>
                              <span>Root</span>
                            </span>
                          ) : isUserAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-900/40 border border-purple-400/60 hover:bg-purple-800 text-purple-200 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                              title="Demote to regular farmer"
                            >
                              <i className="fa-solid fa-user-minus text-[11px]"></i>
                              <span>Demote</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleRole(u)}
                              className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 hover:border-amber-400 hover:from-amber-500 hover:to-yellow-500 hover:text-slate-950 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                              title="Promote this user to Admin"
                            >
                              <i className="fa-solid fa-crown text-[11px] text-amber-400"></i>
                              <span>Make Admin</span>
                            </button>
                          )}

                          {isRootAdmin ? (
                            <span className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-500 text-xs font-bold cursor-not-allowed select-none">
                              Protected
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleToggleBlock(u)}
                              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                                isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-rose-600 hover:bg-rose-500 text-white'
                              }`}
                            >
                              <i className={`fa-solid ${isBlocked ? 'fa-unlock' : 'fa-ban'} text-[11px]`}></i>
                              <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Session Activity Logs Stream */}
            <div className="rounded-2xl p-4 sm:p-5 bg-black/40 border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-timeline text-amber-400 text-xs"></i>
                  <h3 className="font-manrope font-black text-xs sm:text-sm text-white uppercase tracking-wider">
                    Recent Platform Audit &amp; Activity Stream
                  </h3>
                </div>
                <span className="text-[10px] text-slate-500">
                  {activityLogs.length} events logged
                </span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {activityLogs.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-3">No activity logs recorded yet.</p>
                ) : (
                  activityLogs.slice(0, 15).map((log) => (
                    <div
                      key={log.id}
                      className="p-2 rounded-lg bg-black/50 border border-slate-800/80 text-[11px] flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            log.status === 'WARNING' || log.status === 'FAILED'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {log.action}
                          </span>
                          <span className="font-bold text-slate-300">@{log.username}</span>
                          <span className="text-[10px] text-slate-500">[{log.category}]</span>
                        </div>
                        <p className="text-slate-400">{log.details}</p>
                      </div>
                      <span className="text-[9.5px] text-slate-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: WITHDRAWALS APPROVAL DESK
           ========================================================================= */}
        {activeTab === 'WITHDRAWALS' && (
          <div className="space-y-4">
            {/* Queue Filter Tabs */}
            <div className="rounded-2xl p-3.5 bg-black/40 border border-amber-400/20 flex flex-wrap items-center justify-between gap-2 shadow-md">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setWithdrawalFilter('Pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    withdrawalFilter === 'Pending'
                      ? 'bg-rose-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-hourglass-half text-[10px]"></i>
                  <span>Pending ({withdrawals.filter((w) => w.status === 'Pending').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalFilter('Completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    withdrawalFilter === 'Completed'
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  <span>Completed ({withdrawals.filter((w) => w.status === 'Completed').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalFilter('Rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    withdrawalFilter === 'Rejected'
                      ? 'bg-slate-700 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-ban text-[10px]"></i>
                  <span>Rejected ({withdrawals.filter((w) => w.status === 'Rejected').length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawalFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    withdrawalFilter === 'All'
                      ? 'bg-amber-400 text-[#082013] font-black'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  All Requests ({withdrawals.length})
                </button>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                Showing {filteredWithdrawals.length} cashout orders
              </span>
            </div>

            {/* Withdrawals List */}
            <div className="space-y-3">
              {filteredWithdrawals.length === 0 ? (
                <div className="rounded-2xl p-8 text-center text-slate-400 bg-black/30 border border-slate-800">
                  <i className="fa-solid fa-circle-check text-2xl text-emerald-500 mb-2"></i>
                  <p className="text-sm">No cashout requests found in "{withdrawalFilter}" status.</p>
                </div>
              ) : (
                filteredWithdrawals.map((w) => {
                  const isPending = w.status === 'Pending';
                  const isCompleted = w.status === 'Completed';
                  const isRejected = w.status === 'Rejected';

                  return (
                    <div
                      key={w.id}
                      className={`rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-[#0a2216] via-[#0d2c20] to-[#071910] border transition-all shadow-md ${
                        isPending
                          ? 'border-amber-400/40 shadow-[0_4px_20px_rgba(245,158,11,0.15)]'
                          : isCompleted
                          ? 'border-emerald-500/25'
                          : 'border-rose-500/25'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-xs text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                            {w.id}
                          </span>

                          {/* Status Pill */}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                              <i className="fa-solid fa-hourglass-half text-[8px]"></i> Pending Review
                            </span>
                          )}
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                              <i className="fa-solid fa-check-double text-[8px]"></i> Disbursed
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1">
                              <i className="fa-solid fa-xmark text-[8px]"></i> Rejected
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {new Date(w.date).toLocaleDateString()} {new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Payout Amount Highlight */}
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Cashout Amount</span>
                          <span className="font-manrope font-black text-lg text-emerald-400">
                            Rs. {Number(w.amountPkr || 0).toLocaleString()} <span className="text-xs">PKR</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs mb-3">
                        {/* Farmer & Store Info */}
                        <div className="bg-black/35 rounded-xl p-2.5 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Farmer &amp; Liquidation</span>
                          <div className="font-bold text-white">@{w.username || 'farmer'}</div>
                          <div className="text-amber-300 text-[11px] mt-0.5">
                            {w.eggs} Eggs @ Rs. {w.rate}/egg
                          </div>
                          <div className="text-slate-400 text-[10.5px]">Store: {w.store}</div>
                        </div>

                        {/* Payment Destination */}
                        <div className="bg-black/35 rounded-xl p-2.5 border border-slate-800">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Disbursement Channel</span>
                          <div className="flex items-center gap-1.5 font-bold text-white">
                            <i className="fa-solid fa-wallet text-amber-400 text-xs"></i>
                            <span>{w.method}</span>
                          </div>
                          <div className="text-slate-300 text-[11px] mt-0.5">Title: {w.accountTitle}</div>
                          {w.bankName && <div className="text-slate-400 text-[10.5px]">Bank: {w.bankName}</div>}
                        </div>

                        {/* Account Number / IBAN with 1-Click Copy */}
                        <div className="bg-black/35 rounded-xl p-2.5 border border-slate-800 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">Account No / IBAN</span>
                            <div className="font-mono font-bold text-amber-300 text-xs truncate">
                              {w.accountNumber}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(w.accountNumber, 'Account Number')}
                            className="mt-1 text-left text-[10.5px] text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                          >
                            <i className="fa-regular fa-copy text-[10px]"></i>
                            <span>Copy Account Number</span>
                          </button>
                        </div>
                      </div>

                      {/* Transaction Hash / Reason notes if completed or rejected */}
                      {isCompleted && (
                        <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2 text-[11px] text-slate-300 flex items-center justify-between gap-2 mb-3">
                          <span>Tx Hash: <code className="text-emerald-400 font-mono">{w.txHash || 'TX-ADM-ONLINE-DISBURSE'}</code></span>
                          <span className="text-[10px] text-emerald-400/80">Completed</span>
                        </div>
                      )}

                      {isRejected && (
                        <div className="bg-rose-950/20 border border-rose-500/20 rounded-lg p-2 text-[11px] text-slate-300 mb-3">
                          <span className="text-rose-400 font-bold">Rejection Reason:</span> {w.rejectReason || 'Order rejected by administrator.'}
                        </div>
                      )}

                      {/* Action buttons (Only for Pending) */}
                      {isPending && (
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                          <button
                            type="button"
                            onClick={() => setRejectModalWithdrawal(w)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <i className="fa-solid fa-xmark text-xs"></i>
                            <span>Reject Request</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleApproveWithdrawal(w.id)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5"
                          >
                            <i className="fa-solid fa-check-double text-xs"></i>
                            <span>Approve &amp; Disburse</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: REFERRAL TEAMS & DOWNLINES TREE
           ========================================================================= */}
        {activeTab === 'AFFILIATES' && (
          <div className="space-y-4">
            {/* User Genealogist Selector */}
            <div className="rounded-2xl p-4 bg-black/40 border border-amber-400/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div>
                <h3 className="font-manrope font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
                  <i className="fa-solid fa-network-wired text-amber-400"></i>
                  <span>Inspect Downlines Genealogy Tree</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Select any registered farmer to inspect their 2-tier affiliate network &amp; attributed volume
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="text-[11px] font-bold text-slate-300 uppercase whitespace-nowrap">
                  Farmer:
                </label>
                <select
                  value={selectedAffiliateUsername}
                  onChange={(e) => setSelectedAffiliateUsername(e.target.value)}
                  className="bg-black/60 border border-amber-400/40 rounded-xl py-1.5 px-3 text-white text-xs font-bold focus:outline-none focus:border-amber-400 w-full sm:w-48"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.username} className="bg-slate-900 text-white">
                      @{u.username} ({u.name || u.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected User Summary Cards */}
            {affiliateGenealogy.root && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                <div className="rounded-2xl p-4 bg-black/40 border border-emerald-500/30 shadow-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Downlines</span>
                  <span className="font-manrope font-black text-xl text-white">
                    {affiliateGenealogy.totalInvited}
                  </span>
                  <span className="text-[10px] text-emerald-400 block mt-0.5">
                    L1: {affiliateGenealogy.level1Count} • L2: {affiliateGenealogy.level2Count}
                  </span>
                </div>

                <div className="rounded-2xl p-4 bg-black/40 border border-amber-500/30 shadow-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Level 1 Direct (2%)</span>
                  <span className="font-manrope font-black text-xl text-amber-300">
                    {affiliateGenealogy.level1Count}
                  </span>
                  <span className="text-[10px] text-amber-300/80 block mt-0.5">
                    2.00% Commission Tier
                  </span>
                </div>

                <div className="rounded-2xl p-4 bg-black/40 border border-yellow-500/30 shadow-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Level 2 Indirect (1%)</span>
                  <span className="font-manrope font-black text-xl text-yellow-300">
                    {affiliateGenealogy.level2Count}
                  </span>
                  <span className="text-[10px] text-yellow-300/80 block mt-0.5">
                    1.00% Commission Tier
                  </span>
                </div>

                <div className="rounded-2xl p-4 bg-black/40 border border-emerald-500/30 shadow-md">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Lifetime Commission</span>
                  <span className="font-manrope font-black text-lg text-emerald-400 truncate block">
                    Rs. {affiliateGenealogy.totalCommission.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Vol: Rs. {affiliateGenealogy.totalVolume.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Visual 2-Tier Genealogy Tree */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-amber-400/30 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-2">
                <span className="font-manrope font-black text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-tree text-emerald-400"></i>
                  <span>Genealogy Tree Representation</span>
                </span>
                <span className="text-[10px] text-slate-400">
                  Root Sponsor: <strong className="text-amber-300">@{affiliateGenealogy.root?.username}</strong>
                </span>
              </div>

              {/* Root Sponsor Card */}
              <div className="flex flex-col items-center">
                <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 border-2 border-amber-400 text-center max-w-sm w-full shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-[#082013] font-black text-sm flex items-center justify-center mx-auto mb-1.5 shadow-md">
                    <i className="fa-solid fa-crown"></i>
                  </div>
                  <h4 className="font-manrope font-black text-white text-sm">
                    @{affiliateGenealogy.root?.username}
                  </h4>
                  <span className="text-[10px] text-amber-300 font-mono block">
                    Code: {affiliateGenealogy.root?.referralCode || affiliateGenealogy.root?.username}
                  </span>
                </div>

                <div className="w-0.5 h-6 bg-gradient-to-b from-amber-400 to-emerald-500 my-1"></div>
              </div>

              {/* Level 1 Direct Tier */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-[#082013]">
                    Level 1 (Direct 2.00%)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {affiliateGenealogy.level1.length} Direct Referrals
                  </span>
                </div>

                {affiliateGenealogy.level1.length === 0 ? (
                  <div className="p-3 rounded-xl bg-black/30 border border-slate-800 text-center text-xs text-slate-500">
                    No Level 1 downline members registered for this farmer yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {affiliateGenealogy.level1.map((m) => {
                      const units = Number(m.activeHens) || 0;
                      const spent = units * 500;
                      const comm = spent * 0.02;

                      return (
                        <div
                          key={m.id || m.username}
                          className="rounded-xl p-3 bg-black/50 border border-emerald-500/30 text-xs space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">@{m.username}</span>
                            <span className="text-[9.5px] text-emerald-400 font-bold">+2.00%</span>
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            Flock: <strong className="text-amber-300">{units} Hens</strong> (Rs. {spent.toLocaleString()})
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            Commission Yield: <strong>Rs. {comm.toFixed(2)} PKR</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Level 2 Indirect Tier */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-yellow-400 text-[#082013]">
                    Level 2 (Indirect 1.00%)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {affiliateGenealogy.level2.length} Secondary Referrals
                  </span>
                </div>

                {affiliateGenealogy.level2.length === 0 ? (
                  <div className="p-3 rounded-xl bg-black/30 border border-slate-800 text-center text-xs text-slate-500">
                    No Level 2 downline members registered in this network.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {affiliateGenealogy.level2.map((m) => {
                      const units = Number(m.activeHens) || 0;
                      const spent = units * 500;
                      const comm = spent * 0.01;

                      return (
                        <div
                          key={m.id || m.username}
                          className="rounded-xl p-3 bg-black/50 border border-yellow-500/30 text-xs space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white">@{m.username}</span>
                            <span className="text-[9.5px] text-yellow-300 font-bold">+1.00%</span>
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            Sponsor: <strong className="text-slate-300">@{m.upliner}</strong>
                          </div>
                          <div className="text-[10.5px] text-slate-400">
                            Flock: <strong className="text-amber-300">{units} Hens</strong> (Rs. {spent.toLocaleString()})
                          </div>
                          <div className="text-[10px] text-emerald-400">
                            Commission Yield: <strong>Rs. {comm.toFixed(2)} PKR</strong>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: DEPOSIT GATEWAYS & QR CODE MANAGER
           ========================================================================= */}
        {activeTab === 'GATEWAYS' && (
          <div className="space-y-4">
            {/* Gateway Selector Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGatewayTab('easypisa')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  gatewayTab === 'easypisa'
                    ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-md'
                    : 'bg-black/40 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <img src={easypisaImg} alt="EasyPaisa" className="w-5 h-5 object-contain rounded" />
                <span>EasyPaisa Gateway</span>
              </button>

              <button
                type="button"
                onClick={() => setGatewayTab('jazzcash')}
                className={`flex-1 py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  gatewayTab === 'jazzcash'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-md'
                    : 'bg-black/40 border border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <img src={jazzcashImg} alt="JazzCash" className="w-5 h-5 object-contain rounded" />
                <span>JazzCash Gateway</span>
              </button>
            </div>

            {/* Gateway Form */}
            <form onSubmit={handleSaveGateways} className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-amber-400/30 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-qrcode text-amber-400 text-base"></i>
                  <h3 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                    {gatewayTab === 'easypisa' ? 'EasyPaisa' : 'JazzCash'} Deposit Account &amp; Barcode
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Active Gateway
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Input Fields */}
                <div className="space-y-3">
                  {gatewayTab === 'easypisa' ? (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Official Account Title
                        </label>
                        <input
                          type="text"
                          value={easyTitle}
                          onChange={(e) => setEasyTitle(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Account / Mobile Till Number
                        </label>
                        <input
                          type="text"
                          value={easyNumber}
                          onChange={(e) => setEasyNumber(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          QR Code Image URL / Asset Path
                        </label>
                        <input
                          type="text"
                          value={easyQr}
                          onChange={(e) => setEasyQr(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Buyer Deposit Instructions (Urdu / English)
                        </label>
                        <textarea
                          rows="3"
                          value={easyInst}
                          onChange={(e) => setEasyInst(e.target.value)}
                          className="w-full bg-black/50 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                        ></textarea>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Official Account Title
                        </label>
                        <input
                          type="text"
                          value={jazzTitle}
                          onChange={(e) => setJazzTitle(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Account / Mobile Till Number
                        </label>
                        <input
                          type="text"
                          value={jazzNumber}
                          onChange={(e) => setJazzNumber(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          QR Code Image URL / Asset Path
                        </label>
                        <input
                          type="text"
                          value={jazzQr}
                          onChange={(e) => setJazzQr(e.target.value)}
                          required
                          className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                          Buyer Deposit Instructions (Urdu / English)
                        </label>
                        <textarea
                          rows="3"
                          value={jazzInst}
                          onChange={(e) => setJazzInst(e.target.value)}
                          className="w-full bg-black/50 border border-slate-700 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-amber-400"
                        ></textarea>
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Live QR Preview */}
                <div className="flex flex-col items-center justify-center p-4 bg-black/40 border border-slate-800 rounded-xl text-center">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Live Barcode Preview
                  </span>
                  <div className="w-44 h-44 rounded-xl bg-white p-2.5 border-2 border-amber-400 shadow-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={gatewayTab === 'easypisa' ? (easyQr || easypisaImg) : (jazzQr || jazzcashImg)}
                      alt="Deposit QR Code"
                      onError={(e) => {
                        e.target.src = gatewayTab === 'easypisa' ? easypisaImg : jazzcashImg;
                      }}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-amber-300/80 mt-2">
                    Scannable in {gatewayTab === 'easypisa' ? 'EasyPaisa' : 'JazzCash'} App
                  </span>
                </div>
              </div>

              {/* Save Bar */}
              <div className="flex justify-end pt-3 border-t border-slate-800">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Gateway Settings</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================================
            TAB 5: PLATFORM SETTINGS & COMMUNITY LINKS
           ========================================================================= */}
        {activeTab === 'SETTINGS' && (
          <form onSubmit={handleSaveSettings} className="space-y-4">
            {/* Community Links & Popups */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-amber-400/30 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-amber-400/20 pb-3">
                <i className="fa-brands fa-whatsapp text-emerald-400 text-lg"></i>
                <div>
                  <h3 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                    Official Community &amp; Help Desk Links
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Broadcasted to all farmers across the dashboard, drawer, and welcome modals
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-brands fa-whatsapp text-emerald-400 mr-1"></i> Official WhatsApp Group URL
                  </label>
                  <input
                    type="url"
                    value={waGroup}
                    onChange={(e) => setWaGroup(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-bullhorn text-amber-400 mr-1"></i> Official WhatsApp Channel URL
                  </label>
                  <input
                    type="url"
                    value={waChannel}
                    onChange={(e) => setWaChannel(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-phone text-emerald-400 mr-1"></i> Customer Support Phone Number
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    required
                    className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-black/40 border border-slate-800 rounded-xl">
                  <div>
                    <span className="font-bold text-xs text-white block">Community Welcome Popup</span>
                    <span className="text-[10px] text-slate-400">Show official channels modal on user dashboard login</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={popupEnabled}
                      onChange={(e) => setPopupEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Dynamic Market Rates Manager */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-amber-400/30 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 border-b border-amber-400/20 pb-3">
                <i className="fa-solid fa-chart-line text-amber-400 text-lg"></i>
                <div>
                  <h3 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight">
                    Dynamic P2P Egg Liquidation Rates &amp; Asset Price
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Configure official per-egg payout rates for verified merchant stores
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                    Sonica FORM STORE
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateSonica}
                      onChange={(e) => setRateSonica(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Default: 32 Rs/egg</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                    Usmaina Poltry Farm
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateUsmaina}
                      onChange={(e) => setRateUsmaina(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Default: 30 Rs/egg</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                    Syed poultry farm
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateSyed}
                      onChange={(e) => setRateSyed(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Default: 33 Rs/egg</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1">
                  <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                    Hen Unit Price
                  </span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">Rs</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      value={henPrice}
                      onChange={(e) => setHenPrice(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block">Default: 500 PKR</span>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        )}
      </main>

      {/* Executive Admin Footer */}
      <footer className="w-full border-t border-amber-400/10 py-6 mt-12 bg-black/40 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-shield-halved text-amber-400"></i>
            <span className="font-semibold text-white">AL Rehman Meta Eggs</span>
            <span>• Super Admin Cockpit v2.4.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Farmer Portal
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/team')}
              className="hover:text-amber-300 transition-colors cursor-pointer"
            >
              Team Hub
            </button>
            <span className="text-emerald-400 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>

      {/* Manual Balance Adjust Dialog Modal */}
      {balanceModalUser && (
        <UserBalanceModal
          targetUser={balanceModalUser}
          onClose={() => setBalanceModalUser(null)}
          onSave={(userId, newBalances) => updateUserBalances(userId, newBalances)}
        />
      )}

      {/* Reject Withdrawal Dialog Modal */}
      {rejectModalWithdrawal && (
        <RejectWithdrawalModal
          withdrawal={rejectModalWithdrawal}
          onClose={() => setRejectModalWithdrawal(null)}
          onConfirm={(id, reason, refund) => rejectWithdrawal(id, reason, refund)}
        />
      )}
    </div>
  );
}
