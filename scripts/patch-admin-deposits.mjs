import fs from 'fs';
import path from 'path';

const filePath = path.resolve('D:/allakermegg/src/pages/AdminDashboardPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize to LF for predictable matching
const hadCRLF = content.includes('\r\n');
if (hadCRLF) {
  content = content.replace(/\r\n/g, '\n');
}

// 1. Add RejectDepositModal definition before AdminDashboardPage
const modalCode = `const DEPOSIT_REJECTION_PRESETS = [
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
      ? \`\${reasonCategory}: \${customNote.trim()}\`
      : reasonCategory;
    onConfirm(deposit.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[999999] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#120808] border border-rose-500/50 rounded-3xl p-5 max-w-md w-full shadow-2xl relative space-y-4">
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
 * AdminDashboardPage: Master Super Admin Cockpit & Platform Control Center`;

content = content.replace(
  '/**\n * AdminDashboardPage: Master Super Admin Cockpit & Platform Control Center',
  modalCode
);

// 2. Destructure depositRequests and methods from useFarm
content = content.replace(
  '    withdrawals = [],\n    platformSettings = DEFAULT_PLATFORM_SETTINGS,',
  '    withdrawals = [],\n    depositRequests = [],\n    approveDepositRequest,\n    rejectDepositRequest,\n    platformSettings = DEFAULT_PLATFORM_SETTINGS,'
);

// 3. Add states
content = content.replace(
  "  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState(null);\n\n  // Tab 1 (Users) state",
  "  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState(null);\n  const [rejectModalDeposit, setRejectModalDeposit] = useState(null);\n\n  // Tab 1 (Users) state"
);

content = content.replace(
  "  const [withdrawalFilter, setWithdrawalFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'\n\n  // Tab 3 (Affiliates) state",
  "  const [withdrawalFilter, setWithdrawalFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'\n\n  // Tab: Deposits Desk state\n  const [depositFilter, setDepositFilter] = useState('Pending'); // 'Pending' | 'Completed' | 'Rejected' | 'All'\n  const [depositSearch, setDepositSearch] = useState('');\n\n  // Tab 3 (Affiliates) state"
);

// 4. Update KPI calculation
const oldKpiBlock = `    const pendingWds = wdList.filter((w) => w.status === 'Pending');
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
  }, [users, withdrawals]);`;

const newKpiBlock = `    const pendingWds = wdList.filter((w) => w.status === 'Pending');
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
  }, [users, withdrawals, depositRequests]);`;

content = content.replace(oldKpiBlock, newKpiBlock);

// 5. Add filteredDeposits memo
const oldWithdrawalMemo = `  // Tab 2 Filtered Withdrawals
  const filteredWithdrawals = useMemo(() => {
    const list = Array.isArray(withdrawals) ? withdrawals : [];
    return list.filter((w) => {
      if (withdrawalFilter === 'All') return true;
      return w.status === withdrawalFilter;
    });
  }, [withdrawals, withdrawalFilter]);`;

const newWithdrawalAndDepositsMemo = `  // Tab 2 Filtered Withdrawals
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
  }, [depositRequests, depositFilter, depositSearch]);`;

content = content.replace(oldWithdrawalMemo, newWithdrawalAndDepositsMemo);

// 6. Add handlers
const oldWithdrawalHandler = `  // 1-Click Approve Withdrawal
  const handleApproveWithdrawal = (withdrawalId) => {
    approveWithdrawal(withdrawalId);
  };`;

const newWithdrawalAndDepositHandlers = `  // 1-Click Approve Withdrawal
  const handleApproveWithdrawal = (withdrawalId) => {
    approveWithdrawal(withdrawalId);
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
  };`;

content = content.replace(oldWithdrawalHandler, newWithdrawalAndDepositHandlers);

// 7. Add Deposits Tab button
const oldWithdrawalBtn = `          <button
            type="button"
            onClick={() => setActiveTab('WITHDRAWALS')}
            className={\`flex-1 min-w-[145px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none relative cursor-pointer \${
              activeTab === 'WITHDRAWALS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }\`}
          >
            <i className="fa-solid fa-money-bill-transfer text-sm"></i>
            <span>Cashout Desk</span>
            {kpis.pendingCount > 0 && (
              <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${
                activeTab === 'WITHDRAWALS' ? 'bg-rose-600 text-white' : 'bg-rose-500 text-white animate-pulse'
              }\`}>
                {kpis.pendingCount}
              </span>
            )}
          </button>`;

const newWithdrawalAndDepositsBtn = `${oldWithdrawalBtn}

          <button
            type="button"
            onClick={() => setActiveTab('DEPOSITS')}
            className={\`flex-1 min-w-[155px] py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 select-none relative cursor-pointer \${
              activeTab === 'DEPOSITS'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-[#082013] font-black shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }\`}
          >
            <i className="fa-solid fa-money-bill-trend-up text-sm"></i>
            <span>Deposits &amp; Hens</span>
            {kpis.pendingDepositsCount > 0 && (
              <span className={\`px-2 py-0.5 rounded-full text-[10px] font-black \${
                activeTab === 'DEPOSITS' ? 'bg-amber-600 text-white' : 'bg-amber-500 text-white animate-pulse'
              }\`}>
                {kpis.pendingDepositsCount}
              </span>
            )}
          </button>`;

content = content.replace(oldWithdrawalBtn, newWithdrawalAndDepositsBtn);

// 8. Add activeTab === 'DEPOSITS' view right before TAB 3: REFERRAL TEAMS
const depositsTabPane = `        {/* =========================================================================
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
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                    depositFilter === 'Pending'
                      ? 'bg-amber-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }\`}
                >
                  <i className="fa-solid fa-hourglass-half text-[10px]"></i>
                  <span>Pending ({kpis.pendingDepositsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('Completed')}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                    depositFilter === 'Completed'
                      ? 'bg-emerald-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }\`}
                >
                  <i className="fa-solid fa-circle-check text-[10px]"></i>
                  <span>Completed ({kpis.completedDepositsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('Rejected')}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer \${
                    depositFilter === 'Rejected'
                      ? 'bg-rose-600 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }\`}
                >
                  <i className="fa-solid fa-ban text-[10px]"></i>
                  <span>Rejected ({depositRequests.filter((d) => d.status === 'Rejected').length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositFilter('All')}
                  className={\`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                    depositFilter === 'All'
                      ? 'bg-slate-700 text-white font-black shadow-md'
                      : 'bg-black/50 text-slate-300 hover:text-white'
                  }\`}
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
                      className={\`rounded-2xl p-4 sm:p-5 border transition-all \${
                        isPending
                          ? 'bg-[#181308] border-amber-500/50 shadow-lg shadow-amber-950/20'
                          : isCompleted
                          ? 'bg-[#081810] border-emerald-500/30'
                          : 'bg-[#180a0a] border-rose-500/30'
                      }\`}
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
                                {dep.userId ? \`ID: \${dep.userId}\` : ''}
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
                            className={\`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 \${
                              isPending
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : isCompleted
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }\`}
                          >
                            {isPending && (
                              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            )}
                            <i
                              className={\`fa-solid \${
                                isPending
                                  ? 'fa-hourglass-half'
                                  : isCompleted
                                  ? 'fa-circle-check'
                                  : 'fa-ban'
                              }\`}
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
                            href={\`https://wa.me/\${String(dep.senderAccountNumber || '').replace(/[^0-9]/g, '')}?text=\${encodeURIComponent(
                              \`Assalam-o-Alaikum \${dep.username}! AL Rehman Meta Eggs Admin here regarding your deposit request of Rs. \${dep.amountPkr} for \${dep.units} Hens (TID: \${dep.transactionId}).\`
                            )}\`}
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
            TAB 3: REFERRAL TEAMS & DOWNLINES TREE`;

content = content.replace(
  `        {/* =========================================================================\n            TAB 3: REFERRAL TEAMS & DOWNLINES TREE`,
  depositsTabPane
);

// 9. Add RejectDepositModal at bottom
const oldBottomModal = `      {/* Reject Withdrawal Dialog Modal */}
      {rejectModalWithdrawal && (
        <RejectWithdrawalModal
          withdrawal={rejectModalWithdrawal}
          onClose={() => setRejectModalWithdrawal(null)}
          onConfirm={(id, reason, refund) => rejectWithdrawal(id, reason, refund)}
        />
      )}`;

const newBottomModals = `${oldBottomModal}

      {/* Reject Deposit Dialog Modal */}
      {rejectModalDeposit && (
        <RejectDepositModal
          deposit={rejectModalDeposit}
          onClose={() => setRejectModalDeposit(null)}
          onConfirm={(id, reason) => handleRejectDepositConfirm(id, reason)}
        />
      )}`;

content = content.replace(oldBottomModal, newBottomModals);

if (hadCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('AdminDashboardPage successfully patched with Deposits Desk!');
