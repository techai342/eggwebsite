import React, { useState, useMemo, useCallback } from 'react';
import { useFarm, COMMISSION_RATES, ASSET_SPEC, VERIFIED_MERCHANTS, DEFAULT_PLATFORM_SETTINGS } from '../context/FarmContext';
import { uploadToImageKit } from '../services/imagekit';
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
            <span className="font-bold text-amber-300 block">Security Notice:</span>
            <span>This cockpit is reserved for authorized platform administrators only.</span>
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
      <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#081a10] border border-amber-400/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative text-white">
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
      <div className="rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#180a0a] via-[#100808] to-[#0d2c20] border border-rose-500/40 p-5 sm:p-6 shadow-[0_20px_50px_rgba(225,29,72,0.3)] relative text-white">
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

const DEPOSIT_REJECTION_PRESETS = [
  'Transaction ID (TID) not found in bank/wallet records',
  'Payment amount does not match plan price',
  'Sender mobile number does not match receipt',
  'Duplicate or already claimed Transaction ID',
  'Unclear or invalid payment screenshot/proof',
  'Payment reversed or cancelled by sender',
  'Other / Custom reason'
];

function RejectDepositModal({ deposit, onClose, onConfirm }) {
  const [reasonCategory, setReasonCategory] = useState(DEPOSIT_REJECTION_PRESETS[0]);
  const [customNote, setCustomNote] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReason = customNote.trim()
      ? `${reasonCategory}: ${customNote.trim()}`
      : reasonCategory;
    onConfirm(deposit.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#120808] border border-rose-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-rose-500/30">
          <div className="flex items-center gap-2 text-rose-400">
            <i className="fa-solid fa-triangle-exclamation text-lg"></i>
            <h3 className="font-manrope font-black text-sm uppercase tracking-wide">
              Reject Deposit Request
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 text-slate-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-black/40 border border-rose-500/20 rounded-xl p-3 text-xs text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Farmer:</span>
              <span className="font-bold text-white">@{deposit?.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Units / Plan:</span>
              <span className="font-bold text-amber-300">
                {deposit?.units}x Hens (Rs. {Number(deposit?.amountPkr || 0).toLocaleString()} PKR)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Gateway / TID:</span>
              <span className="font-bold text-emerald-400">
                {deposit?.gateway} • #{deposit?.transactionId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Sender Details:</span>
              <span className="font-bold text-slate-200">
                {deposit?.senderAccountTitle} ({deposit?.senderAccountNumber})
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Rejection Reason Category
            </label>
            <select
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
              className="w-full bg-black/50 border border-rose-500/40 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:border-rose-400 cursor-pointer"
            >
              {DEPOSIT_REJECTION_PRESETS.map((reason) => (
                <option key={reason} value={reason} className="bg-slate-900 text-white">
                  {reason}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              Additional Details / Operator Note
            </label>
            <textarea
              rows="2"
              placeholder="Explain why this deposit is being rejected..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full bg-black/50 border border-slate-600 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-rose-400 placeholder-slate-500"
            ></textarea>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer"
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
    depositRequests = [],
    approveDepositRequest,
    rejectDepositRequest,
    updateDepositProof,
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
    supportMessages = [],
    sendSupportMessage,
    editSupportMessage,
    deleteSupportMessage,
    markSupportMessagesRead,
    getWhatsAppSupportUrl,
    showToast,
    navigateTo,
    logout
  } = useFarm();

  // Route security clearance
  const isAdmin = Boolean(
    user?.isLoggedIn && (user?.role === 'admin' || user?.email === 'admin@gmail.com')
  );

  // Active Tab: 'USERS' | 'WITHDRAWALS' | 'AFFILIATES' | 'GATEWAYS' | 'SETTINGS' | 'SUPPORT'
  const [activeTab, setActiveTab] = useState('USERS');

  // Modal states
  const [balanceModalUser, setBalanceModalUser] = useState(null);
  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState(null);
  const [rejectModalDeposit, setRejectModalDeposit] = useState(null);
  const [viewingReceipt, setViewingReceipt] = useState(null);
  const [isAttachingReceiptForId, setIsAttachingReceiptForId] = useState(null);

  const handleAdminAttachReceipt = async (depId, file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setIsAttachingReceiptForId(depId);
    showToast('info', 'Uploading receipt screenshot to ImageKit CDN...');
    try {
      const res = await uploadToImageKit(file, `admin_receipt_${depId}_${Date.now()}.jpg`);
      if (res.success && res.url) {
        if (updateDepositProof) {
          await updateDepositProof({ depositId: depId, proofScreenshot: res.url });
        }
        showToast('success', 'Receipt attached and verified successfully!');
      } else {
        showToast('error', res.error || 'Failed to upload receipt.');
      }
    } catch (err) {
      showToast('error', err?.message || 'Error attaching receipt.');
    } finally {
      setIsAttachingReceiptForId(null);
    }
  };

  // Tab 1 (Users) state
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL'); // 'ALL' | 'Active' | 'Blocked'

  // Tab 2 (Withdrawals) state
  const [withdrawalFilter, setWithdrawalFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'

  // Tab: Deposits Desk state
  const [depositFilter, setDepositFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'
  const [depositSearch, setDepositSearch] = useState('');

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

  // Tab 6 (Support & Live Chat) state
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [adminEditingMsgId, setAdminEditingMsgId] = useState(null);
  const [adminEditText, setAdminEditText] = useState('');
  const [supportSearch, setSupportSearch] = useState('');

  // Tab 5 (Settings & Platform Economics) state
  const [waGroup, setWaGroup] = useState(platformSettings?.communityLinks?.whatsappGroup || '');
  const [waChannel, setWaChannel] = useState(platformSettings?.communityLinks?.whatsappChannel || '');
  const [supportPhone, setSupportPhone] = useState(platformSettings?.communityLinks?.supportPhone || '');
  const [callNumber, setCallNumber] = useState(platformSettings?.communityLinks?.callNumber || platformSettings?.communityLinks?.supportPhone || '+923412017923');
  const [popupEnabled, setPopupEnabled] = useState(Boolean(platformSettings?.communityLinks?.popupEnabled ?? true));

  // 1. Livestock & Production Yield
  const [henPrice, setHenPrice] = useState(platformSettings?.henUnitPrice ?? platformSettings?.marketRates?.henUnitPrice ?? 500);
  const [dailyYield, setDailyYield] = useState(platformSettings?.dailyEggYield ?? 1);
  const [contractDays, setContractDays] = useState(platformSettings?.contractDurationDays ?? 120);

  // 2. P2P Liquidation & Store Payout Rates
  const [eggBasePrice, setEggBasePrice] = useState(platformSettings?.eggBasePrice ?? 30);
  const [rateSonica, setRateSonica] = useState(platformSettings?.marketRates?.eggRates?.sonica ?? 32);
  const [rateUsmaina, setRateUsmaina] = useState(platformSettings?.marketRates?.eggRates?.usmaina ?? 30);
  const [rateSyed, setRateSyed] = useState(platformSettings?.marketRates?.eggRates?.syed ?? 33);

  // 3. Liquidity Bounds & Minimum Withdrawal Limits
  const [minWdEggs, setMinWdEggs] = useState(platformSettings?.minWithdrawalEggs ?? 1);
  const [minWdPkr, setMinWdPkr] = useState(platformSettings?.minWithdrawalPkr ?? 30);
  const [maxWdEggs, setMaxWdEggs] = useState(platformSettings?.maxWithdrawalEggs ?? 10000);

  // 4. Affiliate Matrix & Downline Commission Rates
  const [commL1, setCommL1] = useState(platformSettings?.referralCommissionLevel1 ?? 2.0);
  const [commL2, setCommL2] = useState(platformSettings?.referralCommissionLevel2 ?? 1.0);
  const [flatBonus, setFlatBonus] = useState(platformSettings?.referralFlatBonusPkr ?? 50);

  // Sync state if platformSettings changes from context
  React.useEffect(() => {
    const ep = platformSettings?.depositGateways?.easypisa || platformSettings?.depositGateways?.easypaisa;
    if (ep) {
      setEasyTitle(ep.accountTitle || ep.title || '');
      setEasyNumber(ep.accountNumber || ep.number || '');
      setEasyQr(ep.qrCodeUrl || '/src/assets/easypisa.png');
      setEasyInst(ep.instructions || '');
    }
    const jz = platformSettings?.depositGateways?.jazzcash;
    if (jz) {
      setJazzTitle(jz.accountTitle || jz.title || '');
      setJazzNumber(jz.accountNumber || jz.number || '');
      setJazzQr(jz.qrCodeUrl || '/src/assets/jazzcash.png');
      setJazzInst(jz.instructions || '');
    }

    if (platformSettings?.communityLinks) {
      setWaGroup(platformSettings.communityLinks.whatsappGroup || '');
      setWaChannel(platformSettings.communityLinks.whatsappChannel || '');
      setSupportPhone(platformSettings.communityLinks.supportPhone || '');
      setCallNumber(platformSettings.communityLinks.callNumber || platformSettings.communityLinks.supportPhone || '+923412017923');
      setPopupEnabled(Boolean(platformSettings.communityLinks.popupEnabled ?? true));
    }
    if (platformSettings) {
      setHenPrice(platformSettings.henUnitPrice ?? platformSettings.marketRates?.henUnitPrice ?? 500);
      setDailyYield(platformSettings.dailyEggYield ?? 1);
      setContractDays(platformSettings.contractDurationDays ?? 120);
      setEggBasePrice(platformSettings.eggBasePrice ?? 30);
      setMinWdEggs(platformSettings.minWithdrawalEggs ?? 1);
      setMinWdPkr(platformSettings.minWithdrawalPkr ?? 30);
      setMaxWdEggs(platformSettings.maxWithdrawalEggs ?? 10000);
      setCommL1(platformSettings.referralCommissionLevel1 ?? 2.0);
      setCommL2(platformSettings.referralCommissionLevel2 ?? 1.0);
      setFlatBonus(platformSettings.referralFlatBonusPkr ?? 50);
    }
    if (platformSettings?.marketRates?.eggRates) {
      setRateSonica(platformSettings.marketRates.eggRates.sonica ?? 32);
      setRateUsmaina(platformSettings.marketRates.eggRates.usmaina ?? 30);
      setRateSyed(platformSettings.marketRates.eggRates.syed ?? 33);
    }
  }, [platformSettings]);

  // Live Support Chat Threads Memo
  const chatThreads = useMemo(() => {
    const threadsMap = {};
    const msgs = Array.isArray(supportMessages) ? supportMessages : [];

    msgs.forEach((msg) => {
      const uid = String(msg.userId || '1197');
      if (!threadsMap[uid]) {
        const matchedUser = (Array.isArray(users) ? users : []).find(
          (u) => String(u.accountId) === uid || String(u.username) === uid || String(u.id) === uid
        );
        threadsMap[uid] = {
          userId: uid,
          farmer: matchedUser || {
            username: msg.username || msg.senderName || 'Farmer #' + uid,
            name: msg.senderName || 'Valued Farmer',
            accountId: uid,
            phone: null,
            balance: 0,
            eggVault: 0,
            role: 'farmer'
          },
          messages: [],
          unreadCount: 0,
          lastMessage: null
        };
      }
      threadsMap[uid].messages.push(msg);
      if (!msg.isRead && msg.senderRole !== 'admin') {
        threadsMap[uid].unreadCount += 1;
      }
    });

    Object.values(threadsMap).forEach((t) => {
      t.messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      t.lastMessage = t.messages[t.messages.length - 1];
    });

    return Object.values(threadsMap).sort((a, b) => {
      const tA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const tB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return tB - tA;
    });
  }, [supportMessages, users]);

  const totalUnreadSupport = useMemo(() => {
    return (Array.isArray(supportMessages) ? supportMessages : []).filter(
      (m) => !m.isRead && m.senderRole !== 'admin'
    ).length;
  }, [supportMessages]);

  const filteredChatThreads = useMemo(() => {
    if (!supportSearch.trim()) return chatThreads;
    const q = supportSearch.toLowerCase();
    return chatThreads.filter(
      (t) =>
        t.userId.toLowerCase().includes(q) ||
        (t.farmer.username && t.farmer.username.toLowerCase().includes(q)) ||
        (t.farmer.name && t.farmer.name.toLowerCase().includes(q))
    );
  }, [chatThreads, supportSearch]);

  const activeThread = useMemo(() => {
    if (selectedChatUserId) {
      const found = chatThreads.find((t) => t.userId === selectedChatUserId);
      if (found) return found;
    }
    return chatThreads.length > 0 ? chatThreads[0] : null;
  }, [selectedChatUserId, chatThreads]);

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

    const depList = Array.isArray(depositRequests) ? depositRequests : [];
    const pendingDeps = depList.filter((d) => d.status === 'Pending');
    const pendingDepositsCount = pendingDeps.length;
    const pendingDepositsVolumePkr = pendingDeps.reduce((sum, d) => sum + (Number(d.amountPkr) || 0), 0);
    const completedDeps = depList.filter((d) => d.status === 'Completed' || d.status === 'Approved');
    const completedDepositsVolumePkr = completedDeps.reduce((sum, d) => sum + (Number(d.amountPkr) || 0), 0);

    return {
      totalUsers,
      activeUsers,
      blockedUsers,
      totalActiveHens,
      totalEggsProduced,
      totalLiquidatedPkr,
      completedWdCount: completedWds.length,
      pendingCount,
      pendingVolumePkr,
      pendingDepositsCount,
      pendingDepositsVolumePkr,
      completedDepositsCount: completedDeps.length,
      completedDepositsVolumePkr
    };
  }, [users, withdrawals, depositRequests]);

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

  // Deposits Desk Filtered Deposits
  const filteredDeposits = useMemo(() => {
    const list = Array.isArray(depositRequests) ? depositRequests : [];
    const query = depositSearch.trim().toLowerCase();
    return list.filter((d) => {
      if (depositFilter !== 'All' && d.status !== depositFilter) return false;
      if (!query) return true;
      return (
        String(d.username || '').toLowerCase().includes(query) ||
        String(d.transactionId || '').toLowerCase().includes(query) ||
        String(d.senderAccountNumber || '').toLowerCase().includes(query) ||
        String(d.senderAccountTitle || '').toLowerCase().includes(query) ||
        String(d.gateway || '').toLowerCase().includes(query)
      );
    });
  }, [depositRequests, depositFilter, depositSearch]);

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
  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      const res = await approveWithdrawal(withdrawalId);
      if (res?.success) {
        showToast('success', res.message || 'Withdrawal approved successfully!');
      }
    } catch (err) {
      showToast('error', err?.message || 'Failed to approve withdrawal.');
    }
  };

  // 1-Click Approve Deposit & Credit Hens
  const handleApproveDeposit = async (depositId) => {
    try {
      const res = await approveDepositRequest({ depositId });
      if (res?.success) {
        showToast('success', res.message || 'Deposit approved & Hens credited!');
      }
    } catch (err) {
      showToast('error', err?.message || 'Failed to approve deposit.');
    }
  };

  // Quick Save Support Channels & Helpline Numbers
  const handleSaveSupportConfig = (e) => {
    e?.preventDefault?.();
    updatePlatformSettings({
      communityLinks: {
        whatsappGroup: waGroup.trim(),
        whatsappGroupUrl: waGroup.trim(),
        whatsappChannel: waChannel.trim(),
        whatsappChannelUrl: waChannel.trim(),
        supportPhone: supportPhone.trim(),
        callNumber: callNumber.trim() || supportPhone.trim(),
        popupEnabled: Boolean(popupEnabled),
        communityPopupEnabled: Boolean(popupEnabled)
      }
    });
    showToast('success', 'Support channels & helpline numbers saved successfully!');
  };

  // 1-Click Reject Deposit Confirm
  const handleRejectDepositConfirm = async (depositId, reason) => {
    try {
      const res = await rejectDepositRequest({ depositId, reason });
      if (res?.success) {
        showToast('info', 'Deposit request rejected.');
      }
    } catch (err) {
      showToast('error', err?.message || 'Failed to reject deposit.');
    }
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

  // Preset configurations for instant economic governance
  const applyEconomyPreset = (type) => {
    if (type === 'STANDARD') {
      setHenPrice(500);
      setDailyYield(1);
      setContractDays(120);
      setEggBasePrice(30);
      setRateSonica(32);
      setRateUsmaina(30);
      setRateSyed(33);
      setMinWdEggs(1);
      setMinWdPkr(30);
      setMaxWdEggs(10000);
      setCommL1(2.0);
      setCommL2(1.0);
      setFlatBonus(50);
      showToast('info', 'Loaded Standard 500 PKR / 120-Day Farm Economy Preset');
    } else if (type === 'FESTIVAL_PROMO') {
      setHenPrice(450);
      setDailyYield(1);
      setContractDays(120);
      setEggBasePrice(35);
      setRateSonica(36);
      setRateUsmaina(34);
      setRateSyed(37);
      setMinWdEggs(1);
      setMinWdPkr(35);
      setMaxWdEggs(10000);
      setCommL1(3.0);
      setCommL2(1.5);
      setFlatBonus(75);
      showToast('info', 'Loaded Festival Boost 450 PKR / High Payout Preset');
    } else if (type === 'VIP_HIGH_YIELD') {
      setHenPrice(1000);
      setDailyYield(2);
      setContractDays(90);
      setEggBasePrice(40);
      setRateSonica(42);
      setRateUsmaina(40);
      setRateSyed(43);
      setMinWdEggs(5);
      setMinWdPkr(200);
      setMaxWdEggs(20000);
      setCommL1(4.0);
      setCommL2(2.0);
      setFlatBonus(100);
      showToast('info', 'Loaded VIP High-Yield 1,000 PKR / 2 Eggs-Per-Day Preset');
    }
  };

  // Save Platform Settings Handler (Replicates to localStorage and live Supabase table)
  const handleSaveSettings = (e) => {
    e.preventDefault();
    updatePlatformSettings({
      henUnitPrice: Number(henPrice) || 500,
      dailyEggYield: Number(dailyYield) || 1,
      contractDurationDays: Number(contractDays) || 120,
      eggBasePrice: Number(eggBasePrice) || 30,
      minWithdrawalEggs: Number(minWdEggs) || 1,
      minWithdrawalPkr: Number(minWdPkr) || 30,
      maxWithdrawalEggs: Number(maxWdEggs) || 10000,
      referralCommissionLevel1: Number(commL1) || 2.0,
      referralCommissionLevel2: Number(commL2) || 1.0,
      referralFlatBonusPkr: Number(flatBonus) || 50,
      communityLinks: {
        whatsappGroup: waGroup,
        whatsappGroupUrl: waGroup,
        whatsappChannel: waChannel,
        whatsappChannelUrl: waChannel,
        supportPhone: supportPhone.trim(),
        callNumber: callNumber.trim() || supportPhone.trim(),
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
            onClick={() => setActiveTab('DEPOSITS')}
            className={`flex-1 min-w-[155px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none relative cursor-pointer ${
              activeTab === 'DEPOSITS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-money-bill-trend-up text-sm"></i>
            <span>Deposits &amp; Hens</span>
            {kpis.pendingDepositsCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'DEPOSITS' ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white animate-pulse'
              }`}>
                {kpis.pendingDepositsCount}
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

          <button
            type="button"
            onClick={() => setActiveTab('SUPPORT')}
            className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none relative cursor-pointer ${
              activeTab === 'SUPPORT'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <i className="fa-solid fa-headset text-sm"></i>
            <span>Live Chat Desk</span>
            {totalUnreadSupport > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'SUPPORT' ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white animate-pulse'
              }`}>
                {totalUnreadSupport}
              </span>
            )}
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
            TAB: MANUAL DEPOSITS & HEN PURCHASES DESK
           ========================================================================= */}
        {activeTab === 'DEPOSITS' && (
          <div className="space-y-4">
            {/* Quick Summary Pill Bar */}
            <div className="rounded-2xl p-3.5 bg-black/40 border border-amber-400/20 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setDepositFilter('Pending')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    depositFilter === 'Pending'
                      ? 'bg-amber-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-hourglass-half text-[10px]"></i>
                  <span>Pending ({kpis.pendingDepositsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('Completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    depositFilter === 'Completed'
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  <span>Completed ({kpis.completedDepositsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('Rejected')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    depositFilter === 'Rejected'
                      ? 'bg-rose-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  <i className="fa-solid fa-ban text-[10px]"></i>
                  <span>Rejected ({depositRequests.filter((d) => d.status === 'Rejected').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('All')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    depositFilter === 'All'
                      ? 'bg-slate-700 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }`}
                >
                  All ({depositRequests.length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search user, TID, phone..."
                  value={depositSearch}
                  onChange={(e) => setDepositSearch(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none transition-all pl-8"
                />
                <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500"></i>
              </div>
            </div>

            {/* Deposits List */}
            <div className="space-y-3">
              {filteredDeposits.length === 0 ? (
                <div className="rounded-2xl p-8 text-center text-slate-400 bg-black/30 border border-slate-800">
                  <i className="fa-solid fa-circle-check text-2xl text-emerald-500 mb-2"></i>
                  <p className="text-sm">No deposit requests found in "{depositFilter}" status.</p>
                </div>
              ) : (
                filteredDeposits.map((dep) => {
                  const isPending = dep.status === 'Pending';
                  const isCompleted = dep.status === 'Completed' || dep.status === 'Approved';
                  const isRejected = dep.status === 'Rejected';

                  return (
                    <div
                      key={dep.id || dep.dbId}
                      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
                        isPending
                          ? 'bg-[#181308] border-amber-500/50 shadow-lg shadow-amber-950/20'
                          : isCompleted
                          ? 'bg-[#081810] border-emerald-500/30'
                          : 'bg-[#180a0a] border-rose-500/30'
                      }`}
                    >
                      {/* Top Row: User + Status Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/40 flex items-center justify-center text-white font-manrope font-black text-sm">
                            {dep.username ? dep.username.substring(0, 2).toUpperCase() : 'UR'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-manrope font-black text-sm text-white">
                                @{dep.username}
                              </h4>
                              <span className="text-[10px] text-slate-400">
                                {dep.userId ? `ID: ${dep.userId}` : ''}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Submitted: {new Date(dep.createdAt || Date.now()).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            {isPending && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            )}
                            <i
                              className={`fa-solid ${
                                isPending
                                  ? 'fa-hourglass-half'
                                  : isCompleted
                                  ? 'fa-circle-check'
                                  : 'fa-ban'
                              }`}
                            ></i>
                            <span>{dep.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle Details Grid: Plan, Amount, Gateway, Sender & TID */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-black/40 p-3 rounded-xl border border-slate-800/60 mb-3 text-xs">
                        {/* 1. Plan & Hens */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Livestock Requested
                          </span>
                          <div className="font-manrope font-black text-base text-yellow-300 mt-0.5 flex items-center gap-1">
                            <span>🐔 {dep.units}x Hens</span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            @ Rs. {Number(dep.unitPrice || 500).toLocaleString()}/hen
                          </span>
                        </div>

                        {/* 2. Amount PKR */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Amount Paid
                          </span>
                          <div className="font-manrope font-black text-base text-emerald-400 mt-0.5">
                            Rs. {Number(dep.amountPkr || 0).toLocaleString()} PKR
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Via {dep.gateway}
                          </span>
                        </div>

                        {/* 3. Sender Info */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Sender Details
                          </span>
                          <strong className="text-white block mt-0.5 truncate">
                            {dep.senderAccountTitle || 'Valued Farmer'}
                          </strong>
                          <span className="font-mono text-slate-300 text-[11px] block">
                            {dep.senderAccountNumber || 'N/A'}
                          </span>
                        </div>

                        {/* 4. Transaction ID (TID) */}
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Transaction ID (TID)
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <code className="font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30 text-xs">
                              {dep.transactionId}
                            </code>
                          </div>
                          <span className="text-[9.5px] text-slate-400">
                            Verify in {dep.gateway} app
                          </span>
                        </div>
                      </div>

                      {/* Payment Proof Receipt Screenshot (ImageKit Cloud CDN) */}
                      <div className="mb-3 p-3 rounded-xl bg-black/60 border border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {dep.proofScreenshot ? (
                            <div
                              onClick={() => setViewingReceipt(dep)}
                              className="relative w-14 h-14 rounded-lg overflow-hidden border border-emerald-500/40 bg-slate-900 cursor-pointer group flex-shrink-0"
                              title="Click to Zoom Receipt"
                            >
                              <img
                                src={dep.proofScreenshot}
                                alt="Payment Proof"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity">
                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                              </div>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-lg border border-dashed border-slate-700 bg-slate-900/50 flex flex-col items-center justify-center text-slate-500 text-[9px] text-center p-1 flex-shrink-0">
                              <i className="fa-solid fa-image-slash text-xs mb-0.5"></i>
                              <span>No Image</span>
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white">Payment Receipt Proof</span>
                              {dep.proofScreenshot ? (
                                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                                  <i className="fa-solid fa-cloud-arrow-up text-[9px]"></i>
                                  <span>ImageKit CDN</span>
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">
                                  TID Only
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {dep.proofScreenshot
                                ? 'Receipt screenshot verified & hosted on ImageKit CDN'
                                : 'Farmer submitted TID without image. Verify via SMS / App.'}
                            </span>
                          </div>
                        </div>

                        {dep.proofScreenshot ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setViewingReceipt(dep)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <i className="fa-solid fa-expand text-[10px]"></i>
                              <span>View Receipt</span>
                            </button>
                            <a
                              href={dep.proofScreenshot}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                              title="Open original CDN URL"
                            >
                              <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <label className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer relative overflow-hidden">
                              <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                              <span>{isAttachingReceiptForId === dep.id ? 'Uploading...' : 'Attach Receipt'}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleAdminAttachReceipt(dep.id, e.target.files?.[0])}
                                disabled={isAttachingReceiptForId === dep.id}
                                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                              />
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Rejection Note (if rejected) */}
                      {isRejected && dep.adminNotes && (
                        <div className="mb-3 p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200">
                          <i className="fa-solid fa-circle-exclamation mr-1.5 text-rose-400"></i>
                          <strong className="font-bold">Rejection Reason:</strong> {dep.adminNotes}
                        </div>
                      )}

                      {/* Approval Info (if completed) */}
                      {isCompleted && (
                        <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/30 px-3 py-2 rounded-xl border border-emerald-500/20">
                          <span className="flex items-center gap-1.5">
                            <i className="fa-solid fa-circle-check"></i>
                            Approved &amp; {dep.units}x Hens Active on Farm!
                          </span>
                          {dep.approvedAt && (
                            <span className="text-[10px] text-slate-400">
                              Approved: {new Date(dep.approvedAt).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Action Bar (When Pending) */}
                      {isPending && (
                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                          {/* Direct WhatsApp Contact Button */}
                          <a
                            href={`https://wa.me/${String(dep.senderAccountNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Assalam-o-Alaikum ${dep.username}! AL Rehman Meta Eggs Admin here regarding your deposit request of Rs. ${dep.amountPkr} for ${dep.units} Hens (TID: ${dep.transactionId}).`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5"
                          >
                            <i className="fa-brands fa-whatsapp text-sm text-emerald-400"></i>
                            <span>WhatsApp Farmer</span>
                          </a>

                          {/* Reject Deposit Button */}
                          <button
                            type="button"
                            onClick={() => setRejectModalDeposit(dep)}
                            className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <i className="fa-solid fa-xmark text-xs"></i>
                            <span>Reject Request</span>
                          </button>

                          {/* Approve Deposit Button */}
                          <button
                            type="button"
                            onClick={() => handleApproveDeposit(dep.id)}
                            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <i className="fa-solid fa-check-double text-xs"></i>
                            <span>Approve &amp; Credit Hens</span>
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
            TAB 5: PLATFORM SETTINGS & ECONOMIC GOVERNANCE
           ========================================================================= */}
        {activeTab === 'SETTINGS' && (
          <form onSubmit={handleSaveSettings} className="space-y-5">
            {/* Header & Quick Presets Toolbar */}
            <div className="rounded-2xl p-5 bg-gradient-to-r from-[#0d2a1c] via-[#092116] to-[#04120a] border border-amber-400/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-sm font-black border border-amber-400/30">
                    <i className="fa-solid fa-coins"></i>
                  </span>
                  <div>
                    <h3 className="font-manrope font-black text-base text-white uppercase tracking-tight flex items-center gap-2">
                      <span>Platform Economics &amp; Pricing Governance</span>
                      <span className="text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full uppercase">
                        Super Admin Mode
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Configure flock asset costs, P2P egg liquidation rates, cashout thresholds, and affiliate commission percentages.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Presets Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Quick Presets:
                </span>
                <button
                  type="button"
                  onClick={() => applyEconomyPreset('STANDARD')}
                  className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-slate-700 hover:border-amber-400 text-[10px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-scale-balanced text-amber-400"></i>
                  <span>Standard 500</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyEconomyPreset('FESTIVAL_PROMO')}
                  className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-slate-700 hover:border-emerald-400 text-[10px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-bolt text-emerald-400"></i>
                  <span>Festival 450</span>
                </button>
                <button
                  type="button"
                  onClick={() => applyEconomyPreset('VIP_HIGH_YIELD')}
                  className="px-2.5 py-1.5 rounded-lg bg-black/50 border border-slate-700 hover:border-purple-400 text-[10px] font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-crown text-purple-400"></i>
                  <span>VIP 1000</span>
                </button>
              </div>
            </div>

            {/* SECTION 1: LIVESTOCK & PRODUCTION YIELD */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-amber-400/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-amber-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-feather"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-sm text-white uppercase tracking-tight">
                      Flock Livestock &amp; Production Yield Controls
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Controls acquisition costs on the Buy Hen page and daily egg harvesting calculations
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Total Yield: {(Number(dailyYield) || 1) * (Number(contractDays) || 120)} Eggs/Hen
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Hen Unit Price
                    </label>
                    <span className="text-[9px] text-slate-400">Buy Asset Page</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                      Rs
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={henPrice}
                      onChange={(e) => setHenPrice(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white text-sm font-black font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setHenPrice((prev) => Math.max(50, Number(prev) - 50))}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[9px] font-bold text-slate-300 transition-colors"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => setHenPrice((prev) => Number(prev) + 50)}
                      className="flex-1 py-1 bg-white/5 hover:bg-white/10 rounded-md text-[9px] font-bold text-slate-300 transition-colors"
                    >
                      +50
                    </button>
                    <button
                      type="button"
                      onClick={() => setHenPrice(500)}
                      className="px-2 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 rounded-md text-[9px] font-bold transition-colors"
                    >
                      Reset 500
                    </button>
                  </div>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Daily Egg Yield / Hen
                    </label>
                    <span className="text-[9px] text-slate-400">Harvest Cycle</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      step="1"
                      value={dailyYield}
                      onChange={(e) => setDailyYield(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">
                      Egg(s)/Day
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Standard is 1 egg per 24 hours per hen.
                  </span>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Contract Term Duration
                    </label>
                    <span className="text-[9px] text-slate-400">Lifecycle</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      value={contractDays}
                      onChange={(e) => setContractDays(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-amber-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-400">
                      Days
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Standard active period is 120 days per unit.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: P2P EGG LIQUIDATION & STORE RATES */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-emerald-400/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-emerald-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-egg"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-sm text-white uppercase tracking-tight">
                      P2P Egg Liquidation &amp; Merchant Store Rates
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Configure live per-egg liquidation rates paid to farmers on Sell Egg page
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Avg Rate: Rs. {(((Number(rateSonica) || 32) + (Number(rateUsmaina) || 30) + (Number(rateSyed) || 33)) / 3).toFixed(1)} PKR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                      Base Egg Price
                    </span>
                    <span className="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">Reference</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={eggBasePrice}
                      onChange={(e) => setEggBasePrice(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">System baseline: 30 Rs</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                      Sonica FORM STORE
                    </span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateSonica}
                      onChange={(e) => setRateSonica(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Default: 32 Rs/egg</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                      Usmaina Poltry Farm
                    </span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateUsmaina}
                      onChange={(e) => setRateUsmaina(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Default: 30 Rs/egg</span>
                </div>

                <div className="bg-black/40 rounded-xl p-3 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10.5px] font-bold text-slate-300 uppercase block">
                      Syed poultry farm
                    </span>
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Verified</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400">Rs</span>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={rateSyed}
                      onChange={(e) => setRateSyed(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-lg py-1.5 pl-8 pr-2 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 block">Default: 33 Rs/egg</span>
                </div>
              </div>
            </div>

            {/* SECTION 3: LIQUIDITY BOUNDS & WITHDRAWAL LIMITS */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-cyan-400/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-cyan-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-money-bill-transfer"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-sm text-white uppercase tracking-tight">
                      Liquidity Bounds &amp; Minimum Withdrawal Limits
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Enforces liquidation barriers to protect merchant reserves and prevent micro-transaction abuse
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-300 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Threshold: ≥{minWdEggs} Egg(s) &amp; ≥Rs. {minWdPkr} PKR
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Min Withdrawal (Eggs)
                    </label>
                    <span className="text-[9px] text-slate-400">Vault Check</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={minWdEggs}
                      onChange={(e) => setMinWdEggs(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-cyan-400">
                      Eggs
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Farmers cannot liquidate fewer eggs than this threshold.
                  </span>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Min Withdrawal (PKR)
                    </label>
                    <span className="text-[9px] text-slate-400">Cashout Net</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-cyan-400">
                      Rs
                    </span>
                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={minWdPkr}
                      onChange={(e) => setMinWdPkr(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white text-sm font-black font-mono focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Order total in PKR must meet or exceed this amount.
                  </span>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Max Liquidation Limit
                    </label>
                    <span className="text-[9px] text-slate-400">Per Order</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={maxWdEggs}
                      onChange={(e) => setMaxWdEggs(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-cyan-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      Eggs
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Maximum eggs allowed in a single liquidation transaction.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 4: AFFILIATE COMMISSION MATRIX */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-b from-[#0a2216] via-[#0d2c20] to-[#071910] border border-purple-400/30 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-400/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-400/20 text-purple-400 flex items-center justify-center text-xs">
                    <i className="fa-solid fa-users-gear"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-sm text-white uppercase tracking-tight">
                      Affiliate &amp; Downline Commission Matrix
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Adjust real-time referral cash commissions credited upon hen asset purchases
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-400/10 border border-purple-400/20 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Total Referral Payout: {(Number(commL1) || 2) + (Number(commL2) || 1)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Level 1 Commission (Direct)
                    </label>
                    <span className="text-[8px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded">Tier 1</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={commL1}
                      onChange={(e) => setCommL1(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-purple-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400">
                      %
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 block pt-1">
                    Direct sponsor earns Rs. {((Number(henPrice) || 500) * (Number(commL1) || 2) / 100).toFixed(2)} PKR per {Number(henPrice) || 500} PKR unit.
                  </span>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Level 2 Commission (Secondary)
                    </label>
                    <span className="text-[8px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-1.5 py-0.5 rounded">Tier 2</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="50"
                      value={commL2}
                      onChange={(e) => setCommL2(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-sm font-black font-mono focus:outline-none focus:border-purple-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-indigo-400">
                      %
                    </span>
                  </div>
                  <span className="text-[9.5px] text-slate-400 block pt-1">
                    Secondary sponsor earns Rs. {((Number(henPrice) || 500) * (Number(commL2) || 1) / 100).toFixed(2)} PKR per {Number(henPrice) || 500} PKR unit.
                  </span>
                </div>

                <div className="bg-black/40 rounded-xl p-3.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                      Flat Referral Bonus
                    </label>
                    <span className="text-[8px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">Signup</span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-amber-400">
                      Rs
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={flatBonus}
                      onChange={(e) => setFlatBonus(e.target.value)}
                      required
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-white text-sm font-black font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <span className="text-[9.5px] text-slate-500 block pt-1">
                    Bonus credited on confirmed downstream milestones.
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 5: LIVE FINANCIAL IMPACT & FARMER ROI SIMULATOR PREVIEW */}
            <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-[#121f14] via-[#0d2618] to-[#06150b] border-2 border-amber-400/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center justify-between border-b border-amber-400/20 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-black flex items-center justify-center text-sm font-black shadow-md">
                    <i className="fa-solid fa-calculator"></i>
                  </div>
                  <div>
                    <h4 className="font-manrope font-black text-sm sm:text-base text-white uppercase tracking-tight flex items-center gap-2">
                      <span>Live Financial Impact &amp; Farmer ROI Preview</span>
                      <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full">
                        Real-time Pre-Flight Calculation
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-300">
                      Calculates projected return metrics per hen unit under your current settings before saving
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Hen Price
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-amber-400 block mt-1">
                    Rs. {Number(henPrice) || 0}
                  </strong>
                  <span className="text-[8px] text-slate-500">Capital Investment</span>
                </div>

                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Term Output
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-white block mt-1">
                    {(Number(dailyYield) || 1) * (Number(contractDays) || 120)} Eggs
                  </strong>
                  <span className="text-[8px] text-slate-500">Over {Number(contractDays) || 120} Days</span>
                </div>

                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Gross Liquidation
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-emerald-400 block mt-1">
                    Rs. {Math.round(((Number(dailyYield) || 1) * (Number(contractDays) || 120)) * (((Number(rateSonica) || 32) + (Number(rateUsmaina) || 30) + (Number(rateSyed) || 33)) / 3))}
                  </strong>
                  <span className="text-[8px] text-slate-500">At Avg Store Rate</span>
                </div>

                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Farmer Net Profit
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-[#c9f36a] block mt-1">
                    Rs. {Math.round(((Number(dailyYield) || 1) * (Number(contractDays) || 120)) * (((Number(rateSonica) || 32) + (Number(rateUsmaina) || 30) + (Number(rateSyed) || 33)) / 3)) - (Number(henPrice) || 500)}
                  </strong>
                  <span className="text-[8px] text-emerald-300">Clean Yield Surplus</span>
                </div>

                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Projected ROI
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-amber-300 block mt-1">
                    +{Number(henPrice) > 0 ? (((Math.round(((Number(dailyYield) || 1) * (Number(contractDays) || 120)) * (((Number(rateSonica) || 32) + (Number(rateUsmaina) || 30) + (Number(rateSyed) || 33)) / 3)) - (Number(henPrice) || 500)) / Number(henPrice)) * 100).toFixed(1) : '0'}%
                  </strong>
                  <span className="text-[8px] text-amber-400">Total Lifecycle Gain</span>
                </div>

                <div className="p-3 bg-black/50 border border-slate-800 rounded-xl">
                  <span className="text-[8.5px] font-bold uppercase text-slate-400 block tracking-wider">
                    Downline Payout
                  </span>
                  <strong className="text-base sm:text-lg font-mono font-black text-purple-400 block mt-1">
                    Rs. {((Number(henPrice) || 500) * ((Number(commL1) || 2) + (Number(commL2) || 1)) / 100).toFixed(1)}
                  </strong>
                  <span className="text-[8px] text-purple-300">L1+L2 Cash Bounty</span>
                </div>
              </div>
            </div>

            {/* SECTION 6: OFFICIAL COMMUNITY CHANNELS */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      <i className="fa-solid fa-headset text-sky-400 mr-1"></i> Helpline Call Number (Direct Phone Call)
                    </label>
                    <input
                      type="text"
                      value={callNumber}
                      onChange={(e) => setCallNumber(e.target.value)}
                      placeholder="+923412017923"
                      required
                      className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[9.5px] text-slate-400 mt-1">Users clicking 'Call Helpline' will dial this number directly.</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                      <i className="fa-brands fa-whatsapp text-emerald-400 mr-1"></i> WhatsApp Support Chat Number (wa.me)
                    </label>
                    <input
                      type="text"
                      value={supportPhone}
                      onChange={(e) => setSupportPhone(e.target.value)}
                      placeholder="+923412017923"
                      required
                      className="w-full bg-black/50 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                    />
                    <p className="text-[9.5px] text-slate-400 mt-1">Users clicking 'WhatsApp Chat' will open chat with this number.</p>
                  </div>
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

            {/* Prominent Save & Deploy Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 rounded-2xl">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Settings replicate live to Farm Context, LocalStorage &amp; Supabase Database</span>
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-manrope font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-floppy-disk text-sm"></i>
                <span>Save &amp; Deploy Platform Economics</span>
              </button>
            </div>
          </form>
        )}

        {/* =========================================================================
            TAB 6: LIVE SUPPORT INBOX & CHAT COCKPIT
           ========================================================================= */}
        {activeTab === 'SUPPORT' && (
          <div className="space-y-4">
            {/* Top Control Banner */}
            <div className="rounded-2xl p-4 sm:p-5 bg-black/40 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
                  <i className="fa-solid fa-headset text-xl"></i>
                </div>
                <div>
                  <h3 className="font-manrope font-black text-sm uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <span>VIP Farmer Support &amp; Live Chat Console</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Real-time farmer queries, in-app messaging, message edit/delete &amp; direct WhatsApp connectivity.
                  </p>
                </div>
              </div>

              {/* Status Pills & Direct WhatsApp Test */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-emerald-500/30 text-xs">
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Unread Queries:</span>
                  <span className={`font-mono font-black ${totalUnreadSupport > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
                    {totalUnreadSupport} Messages
                  </span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-black/50 border border-slate-700 text-xs">
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Configured WhatsApp:</span>
                  <span className="text-[#c9f36a] font-mono font-bold">{supportPhone || 'Not Configured'}</span>
                </div>

                <a
                  href={getWhatsAppSupportUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-manrope font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                  title="Test Admin WhatsApp Link"
                >
                  <i className="fa-brands fa-whatsapp text-sm"></i>
                  <span>Test WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Quick Support Channels & Helpline Numbers Manager */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-emerald-950/40 via-black/50 to-slate-900/40 border border-emerald-500/30 shadow-lg">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="font-manrope font-black text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                    <i className="fa-solid fa-sliders text-amber-400"></i>
                    <span>Official Support &amp; Contact Channels Manager</span>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Live editable helpline phone number, WhatsApp chat number, official group &amp; channel links across the website.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSaveSupportConfig}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-manrope font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <i className="fa-solid fa-floppy-disk"></i>
                  <span>Save Support Settings</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-headset text-sky-400 mr-1"></i> Helpline Call Number
                  </label>
                  <input
                    type="text"
                    value={callNumber}
                    onChange={(e) => setCallNumber(e.target.value)}
                    placeholder="+923412017923"
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <a href={`tel:${callNumber}`} className="text-sky-400 hover:underline flex items-center gap-1">
                      <i className="fa-solid fa-phone"></i> Test Call
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-brands fa-whatsapp text-emerald-400 mr-1"></i> WhatsApp Support Chat
                  </label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    placeholder="+923412017923"
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <a href={getWhatsAppSupportUrl()} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                      <i className="fa-brands fa-whatsapp"></i> Test Chat
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-users text-teal-400 mr-1"></i> WhatsApp Group URL
                  </label>
                  <input
                    type="url"
                    value={waGroup}
                    onChange={(e) => setWaGroup(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <a href={waGroup} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline flex items-center gap-1">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Visit Group
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    <i className="fa-solid fa-bullhorn text-amber-400 mr-1"></i> WhatsApp Channel URL
                  </label>
                  <input
                    type="url"
                    value={waChannel}
                    onChange={(e) => setWaChannel(e.target.value)}
                    placeholder="https://whatsapp.com/channel/..."
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2 px-3 text-white text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <div className="mt-1 flex items-center justify-between text-[10px]">
                    <a href={waChannel} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline flex items-center gap-1">
                      <i className="fa-solid fa-arrow-up-right-from-square"></i> Visit Channel
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* 2-Column Chat Cockpit */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              
              {/* Left Column: Farmer Threads (col-span-4) */}
              <div className="lg:col-span-4 rounded-2xl bg-black/40 border border-slate-800 p-3.5 flex flex-col max-h-[650px] shadow-md">
                <div className="mb-3">
                  <div className="relative">
                    <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    <input
                      type="text"
                      placeholder="Search farmer or ID..."
                      value={supportSearch}
                      onChange={(e) => setSupportSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-black/50 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 font-manrope"
                    />
                  </div>
                </div>

                {/* Threads List */}
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-1">
                  {filteredChatThreads.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      <i className="fa-solid fa-inbox text-3xl mb-2 text-slate-600 block"></i>
                      <span>No farmer conversations found.</span>
                    </div>
                  ) : (
                    filteredChatThreads.map((thread) => {
                      const isSelected = activeThread?.userId === thread.userId;
                      const hasUnread = thread.unreadCount > 0;
                      const farmerPhone = thread.farmer?.phone;

                      return (
                        <div
                          key={thread.userId}
                          onClick={() => {
                            setSelectedChatUserId(thread.userId);
                            markSupportMessagesRead({ userId: thread.userId });
                          }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-950/80 to-[#0e3020] border-emerald-500/60 shadow-md'
                              : 'bg-black/30 border-slate-800 hover:border-slate-700 hover:bg-black/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {thread.farmer?.username ? thread.farmer.username.charAt(0).toUpperCase() : 'F'}
                              </div>
                              <div className="overflow-hidden">
                                <h4 className="font-extrabold text-xs text-white truncate max-w-[130px]">
                                  {thread.farmer?.name || thread.farmer?.username || 'Farmer'}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-mono block truncate">
                                  @{thread.farmer?.username || thread.userId} • ID: {thread.userId}
                                </span>
                              </div>
                            </div>

                            {hasUnread && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-black text-[9px] animate-pulse">
                                {thread.unreadCount} NEW
                              </span>
                            )}
                          </div>

                          {/* Last message snippet */}
                          <p className="text-[11px] text-slate-300 truncate font-sans">
                            {thread.lastMessage ? (
                              <>
                                <span className="text-slate-400 font-bold mr-1">
                                  {thread.lastMessage.senderRole === 'admin' ? 'You:' : 'Farmer:'}
                                </span>
                                {thread.lastMessage.message}
                              </>
                            ) : (
                              <span className="italic text-slate-500">No messages yet</span>
                            )}
                          </p>

                          <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 border-t border-slate-800/60">
                            <span>
                              {thread.lastMessage?.createdAt
                                ? new Date(thread.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </span>
                            {farmerPhone && (
                              <span className="text-emerald-400/80 font-mono">
                                <i className="fa-solid fa-phone text-[8px] mr-1"></i>
                                {farmerPhone}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Column: Active Conversation (col-span-8) */}
              <div className="lg:col-span-8 rounded-2xl bg-black/40 border border-slate-800 flex flex-col max-h-[650px] shadow-md overflow-hidden">
                {activeThread ? (
                  <>
                    {/* Conversation Header */}
                    <div className="p-3.5 bg-black/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-[#082013] flex items-center justify-center font-black text-sm shadow-sm">
                          {activeThread.farmer?.username ? activeThread.farmer.username.charAt(0).toUpperCase() : 'F'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-sm text-white">
                              {activeThread.farmer?.name || activeThread.farmer?.username || 'Farmer'}
                            </h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[9px] uppercase font-bold">
                              ID: #{activeThread.userId}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10.5px] text-slate-400 mt-0.5">
                            <span>@{activeThread.farmer?.username}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-mono">
                              Vault: {Number(activeThread.farmer?.eggVault || 0)} Eggs
                            </span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono">
                              Balance: {Number(activeThread.farmer?.balance || 0).toLocaleString()} PKR
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Direct WhatsApp Farmer Button */}
                      {activeThread.farmer?.phone ? (
                        <a
                          href={`https://wa.me/${String(activeThread.farmer.phone).replace(/\D/g, '').replace(/^0/, '92')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${activeThread.farmer?.username || 'Farmer'}, this is AL Rehman Meta Eggs Official Support.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-manrope font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all"
                        >
                          <i className="fa-brands fa-whatsapp text-sm"></i>
                          <span>WhatsApp Farmer</span>
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 bg-slate-800/60 px-2.5 py-1 rounded-lg">
                          No Phone Registered
                        </span>
                      )}
                    </div>

                    {/* Messages Scroll Area */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar bg-black/20">
                      {activeThread.messages.length === 0 ? (
                        <div className="text-center py-16 text-slate-500 text-xs">
                          <i className="fa-solid fa-comments text-3xl mb-2 text-slate-600 block"></i>
                          <span>No messages in this thread yet. Send a greeting below!</span>
                        </div>
                      ) : (
                        activeThread.messages.map((msg) => {
                          const isAdminMsg = msg.senderRole === 'admin';
                          const isEditingThis = adminEditingMsgId === msg.id;

                          return (
                            <div
                              key={msg.id}
                              className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'} group`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 px-1">
                                <span className="text-[9.5px] font-bold text-slate-400">
                                  {isAdminMsg ? 'You (Support)' : (msg.senderName || 'Farmer')}
                                </span>
                                <span className="text-[8.5px] text-slate-500 font-mono">
                                  {msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    : ''}
                                </span>
                                {msg.isEdited && (
                                  <span className="text-[8px] text-amber-400/80 italic">(edited)</span>
                                )}
                              </div>

                              {/* Bubble */}
                              <div
                                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-md ${
                                  isAdminMsg
                                    ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 text-amber-100 rounded-tr-xs'
                                    : 'bg-[#0f2d1e] border border-emerald-500/40 text-emerald-100 rounded-tl-xs'
                                }`}
                              >
                                {isEditingThis ? (
                                  <div className="space-y-2">
                                    <textarea
                                      rows={2}
                                      value={adminEditText}
                                      onChange={(e) => setAdminEditText(e.target.value)}
                                      className="w-full bg-black/60 border border-amber-400/60 rounded-lg p-2 text-xs text-white focus:outline-none"
                                    />
                                    <div className="flex items-center justify-end gap-2">
                                      <button
                                        type="button"
                                        onClick={() => { setAdminEditingMsgId(null); setAdminEditText(''); }}
                                        className="px-2 py-1 rounded bg-black/40 text-slate-300 text-[10px] hover:text-white"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (!adminEditText.trim()) return;
                                          await editSupportMessage({ messageId: msg.id, newMessage: adminEditText });
                                          setAdminEditingMsgId(null);
                                          setAdminEditText('');
                                        }}
                                        className="px-2.5 py-1 rounded bg-amber-500 text-black font-extrabold text-[10px] hover:bg-amber-400"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="whitespace-pre-wrap break-words leading-relaxed font-sans">
                                    {msg.message}
                                  </p>
                                )}
                              </div>

                              {/* Actions: Edit / Delete */}
                              {!isEditingThis && (
                                <div className="flex items-center gap-2 mt-1 px-1 opacity-70 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setAdminEditingMsgId(msg.id);
                                      setAdminEditText(msg.message);
                                    }}
                                    className="text-[9.5px] text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                                    title="Edit this message"
                                  >
                                    <i className="fa-solid fa-pen text-[8px]"></i>
                                    <span>Edit</span>
                                  </button>
                                  <span className="text-slate-600">•</span>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      if (window.confirm('Delete this message?')) {
                                        await deleteSupportMessage({ messageId: msg.id });
                                      }
                                    }}
                                    className="text-[9.5px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                                    title="Delete message"
                                  >
                                    <i className="fa-solid fa-trash-can text-[8px]"></i>
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Quick Response Chips */}
                    <div className="p-2 bg-black/60 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
                      <span className="text-[9px] uppercase font-bold text-slate-500 whitespace-nowrap pl-1">
                        Quick Reply:
                      </span>
                      {[
                        'Assalam-o-Alaikum! We are checking your account.',
                        'Your withdrawal request has been verified and processed.',
                        'Please provide your payment transaction ID or receipt.',
                        'Your egg rate and balance have been refreshed.'
                      ].map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAdminReplyText(chip)}
                          className="px-2 py-1 rounded-lg bg-black/40 hover:bg-black/80 border border-slate-700 text-[10px] text-slate-300 hover:text-white whitespace-nowrap cursor-pointer transition-all"
                        >
                          {chip.slice(0, 30)}...
                        </button>
                      ))}
                    </div>

                    {/* Reply Input Form */}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!adminReplyText.trim()) return;
                        const text = adminReplyText;
                        setAdminReplyText('');
                        await sendSupportMessage({
                          message: text,
                          targetUserId: activeThread.userId
                        });
                      }}
                      className="p-3 bg-black/50 border-t border-slate-800 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        placeholder={`Reply to ${activeThread.farmer?.name || 'Farmer'}...`}
                        value={adminReplyText}
                        onChange={(e) => setAdminReplyText(e.target.value)}
                        className="flex-1 bg-black/60 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-manrope"
                      />
                      <button
                        type="submit"
                        disabled={!adminReplyText.trim()}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-[#082013] font-manrope font-black text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                      >
                        <i className="fa-solid fa-paper-plane text-xs"></i>
                        <span>Reply</span>
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
                    <i className="fa-solid fa-headset text-4xl text-slate-700 mb-3"></i>
                    <h4 className="font-extrabold text-sm text-slate-300 mb-1">No Conversation Selected</h4>
                    <p className="text-xs text-slate-400 max-w-sm">
                      Select a farmer thread from the left or wait for incoming farmer support tickets.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
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

      {/* Payment Receipt Fullscreen Lightbox Modal (ImageKit CDN) */}
      {viewingReceipt && (
        <div
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
          onClick={() => setViewingReceipt(null)}
        >
          <div
            className="relative max-w-2xl w-full bg-[#0a1f13] border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl space-y-4 max-h-[92vh] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <div>
                  <h3 className="font-manrope font-black text-sm text-white">
                    Payment Proof Receipt: @{viewingReceipt.username}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    TID: <span className="font-mono text-amber-300">{viewingReceipt.transactionId}</span> • Rs. {Number(viewingReceipt.amountPkr || 0).toLocaleString()} via {viewingReceipt.gateway}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="flex-1 min-h-0 bg-black/70 rounded-2xl p-2 border border-slate-800 flex items-center justify-center overflow-hidden">
              <img
                src={viewingReceipt.proofScreenshot}
                alt="Full Payment Proof"
                className="max-h-[60vh] max-w-full object-contain rounded-xl shadow-lg"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <a
                href={viewingReceipt.proofScreenshot}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 underline flex items-center gap-1 font-mono"
              >
                <i className="fa-solid fa-link text-[10px]"></i>
                <span className="truncate max-w-[280px]">{viewingReceipt.proofScreenshot}</span>
              </a>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.clipboard?.writeText) {
                      navigator.clipboard.writeText(viewingReceipt.proofScreenshot);
                    }
                    showToast('info', 'ImageKit CDN URL copied to clipboard!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 cursor-pointer"
                >
                  <i className="fa-solid fa-copy mr-1 text-[10px]"></i>
                  Copy URL
                </button>
                {viewingReceipt.status === 'Pending' && (
                  <button
                    type="button"
                    onClick={() => {
                      approveDepositRequest({ depositId: viewingReceipt.id || viewingReceipt.dbId });
                      setViewingReceipt(null);
                    }}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-black font-manrope font-black text-xs uppercase tracking-wider shadow-md active:scale-95 cursor-pointer"
                  >
                    <i className="fa-solid fa-check mr-1"></i>
                    Approve Deposit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Deposit Dialog Modal */}
      {rejectModalDeposit && (
        <RejectDepositModal
          deposit={rejectModalDeposit}
          onClose={() => setRejectModalDeposit(null)}
          onConfirm={(id, reason) => handleRejectDepositConfirm(id, reason)}
        />
      )}
    </div>
  );
}
