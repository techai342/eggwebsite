import React, { useState, useEffect, useMemo } from 'react';
import { useFarm } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import SupportChatModal from '../components/SupportChatModal';
import henImg from '../assets/hen.png';
import logoImg from '../assets/logo.webp';
import eggImg from '../assets/egg.png';

export default function DashboardPage() {
  const {
    user,
    balance,
    eggVault,
    activeAssets,
    harvestEggs,
    cooldownActive,
    cooldownHoursRemaining,
    lastHarvest,
    navigateTo,
    analytics,
    transactions,
    withdrawals,
    depositRequests = [],
    showToast,
    VERIFIED_MERCHANTS,
    referralStats,
    platformSettings,
    getWhatsAppSupportUrl,
    isAutoHarvestEnabled,
    toggleAutoHarvest
  } = useFarm();

  // Modals state
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCooldownModalOpen, setIsCooldownModalOpen] = useState(false);
  const [isHarvestCelebrationOpen, setIsHarvestCelebrationOpen] = useState(false);
  const [harvestYieldAmount, setHarvestYieldAmount] = useState(0);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTab, setHistoryTab] = useState('ALL'); // ALL | BUY | HARVEST | SELL
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isMyFarmModalOpen, setIsMyFarmModalOpen] = useState(false);

  // P2P Trade Theater interactive simulation state
  const [p2pActiveMerchantIndex, setP2pActiveMerchantIndex] = useState(1); // Usmaina by default
  const [p2pCycleStep, setP2pCycleStep] = useState('WALK'); // WALK -> TRADE -> PAYOUT

  // Total active hens count
  const totalActiveUnits = useMemo(() => {
    return activeAssets.filter((a) => {
      const term = Number(a.termDays) || 120;
      const elapsed = a.daysElapsed !== undefined ? Number(a.daysElapsed) : 0;
      const remaining = a.daysRemaining !== undefined ? Number(a.daysRemaining) : (term - elapsed);
      return remaining > 0 && a.status !== 'completed';
    }).reduce((sum, a) => sum + (Number(a.units) || 0), 0);
  }, [activeAssets]);

  // Pending deposit / hen orders for current farmer
  const userPendingDeposits = useMemo(() => {
    if (!Array.isArray(depositRequests)) return [];
    return depositRequests.filter(
      (d) =>
        d.status === 'Pending' &&
        ((user?.id && d.userId === user.id) ||
          (user?.username && String(d.username).toLowerCase() === String(user.username).toLowerCase()))
    );
  }, [depositRequests, user]);

  // Live countdown clock state for cooldown modal
  const [remainingTimeStr, setRemainingTimeStr] = useState('24:00:00');

  useEffect(() => {
    const updateClock = () => {
      if (!lastHarvest || !cooldownActive) {
        setRemainingTimeStr('24:00:00');
        return;
      }
      const last = new Date(lastHarvest).getTime();
      if (isNaN(last)) {
        setRemainingTimeStr('24:00:00');
        return;
      }
      const diffMs = (24 * 60 * 60 * 1000) - (Date.now() - last);
      if (diffMs <= 0) {
        setRemainingTimeStr('00:00:00');
        return;
      }
      const totalSeconds = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      const pad = (n) => String(n).padStart(2, '0');
      setRemainingTimeStr(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, [lastHarvest, cooldownActive, cooldownHoursRemaining]);

  // P2P trade animation step loop
  useEffect(() => {
    const timer = setInterval(() => {
      setP2pCycleStep((prev) => {
        if (prev === 'WALK') return 'TRADE';
        if (prev === 'TRADE') return 'PAYOUT';
        // After PAYOUT, cycle to next merchant and start walking again
        setP2pActiveMerchantIndex((mIdx) => (mIdx + 1) % (VERIFIED_MERCHANTS?.length || 3));
        return 'WALK';
      });
    }, 4500);
    return () => clearInterval(timer);
  }, [VERIFIED_MERCHANTS]);

  // Harvest Action Controller
  const handleHarvestClick = () => {
    if (cooldownActive) {
      setIsCooldownModalOpen(true);
      return;
    }

    if (totalActiveUnits <= 0) {
      showToast('warning', 'No active hens available in your flock. Buy hens first to start production!');
      return;
    }

    const res = harvestEggs();
    if (res.success) {
      setHarvestYieldAmount(res.eggsCollected || totalActiveUnits);
      setIsHarvestCelebrationOpen(true);
    } else {
      setIsCooldownModalOpen(true);
    }
  };

  // 1-Tap Copy Referral Code
  const handleCopyInvitationCode = () => {
    const username = user?.username || 'mrsaqib242';
    const siteTitle = 'AL Rehman Meta Eggs';
    const shareMessage = `🌟 Welcome to ${siteTitle} 🌟\n\n🔑 Your Invitation Code: ${username}\n\n📲 Official Android App Download:\n👉 https://alkram-meta-eggs.digital/app 👈\n\n🚀 Start your smart digital ${siteTitle} farming journey today & earn daily harvest yields!\n💡 Register now & enter this Invitation Code during registration.`;

    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareMessage).then(() => {
        showToast('success', 'Referral Link Copied Successfully!');
      }).catch(() => {
        showToast('success', 'Referral Code Copied: ' + username);
      });
    } else {
      showToast('success', 'Referral Code Copied: ' + username);
    }
  };

  // WhatsApp Share URL
  const whatsappShareUrl = useMemo(() => {
    const username = user?.username || 'mrsaqib242';
    const msg = `🌟 Welcome to AL Rehman Meta Eggs 🌟\n\n🔑 Your Invitation Code: ${username}\n\n📲 Official Android App Download:\n👉 https://alkram-meta-eggs.digital/app 👈\n\n🚀 Start your smart digital AL Rehman Meta Eggs farming journey today & earn daily harvest yields!`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  }, [user]);

  // Filtered transactions for History modal
  const filteredHistory = useMemo(() => {
    const list = [];
    const seenDepositIds = new Set();

    // 1. Map user's deposit requests as BUY orders
    (depositRequests || []).forEach((d) => {
      const isMine =
        (user?.id && String(d.userId) === String(user.id)) ||
        (user?.accountId && String(d.userId) === String(user.accountId)) ||
        (user?.username && String(d.username).toLowerCase() === String(user.username).toLowerCase());
      if (isMine) {
        seenDepositIds.add(String(d.id));
        if (d.dbId) seenDepositIds.add(String(d.dbId));
        list.push({
          id: d.id,
          category: 'BUY',
          title: `Hen Purchase (${d.units}x Hens via ${d.gateway})`,
          amount: Number(d.amountPkr || 0),
          unit: 'PKR',
          date: d.createdAt,
          status: d.status || 'Pending',
          channel: `${d.gateway} • TID: #${d.transactionId}`,
          proofScreenshot: d.proofScreenshot,
          adminNotes: d.adminNotes
        });
      }
    });

    // 2. Map transactions
    (transactions || []).forEach((t) => {
      if (t.depositId && seenDepositIds.has(String(t.depositId))) return;
      list.push({
        id: t.id,
        category: t.type, // 'BUY' | 'HARVEST' | 'SELL'
        title: t.description || `${t.type} Order`,
        amount: t.amount,
        unit: t.unit || 'PKR',
        date: t.date,
        status: t.status || 'Completed',
        channel: t.gateway || 'Platform Vault'
      });
    });

    // 3. Map withdrawals as SELL
    (withdrawals || []).forEach((w) => {
      list.push({
        id: w.id,
        category: 'SELL',
        title: `P2P Sale to ${w.store || 'Verified Store'}`,
        amount: w.amountPkr,
        unit: 'PKR',
        eggs: w.eggs,
        date: w.date,
        status: w.status || 'Completed',
        channel: `${w.method} (${w.accountTitle || ''})`
      });
    });

    // Sort descending by date
    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    if (historyTab === 'ALL') return list;
    return list.filter((item) => item.category === historyTab);
  }, [transactions, withdrawals, depositRequests, historyTab, user]);

  const activeMerchant = (VERIFIED_MERCHANTS && VERIFIED_MERCHANTS[p2pActiveMerchantIndex]) || {
    name: 'Usmaina Poltry Farm',
    rate: 30,
    rating: 4.0,
    trades: 1657
  };

  return (
    <AppShell currentRoute="/dashboard" title="AL REHMAN META EGGS">
      {/* Dynamic Keyframe & P2P Styling */}
      <style>{`
        /* ------------------------------------------------ */
        /* LIVE REVOLVING ECOSYSTEM ORBIT ANIMATIONS        */
        /* ------------------------------------------------ */
        @keyframes ecoOrbitSpinCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ecoOrbitSpinCCW {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        @keyframes ecoAnimalBreath {
          0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3)); }
          50% { transform: scale(1.09) translateY(-5px); filter: drop-shadow(0 10px 20px rgba(201,243,106,0.55)); }
        }
        @keyframes liveRadarGlow {
          0% { transform: scale(0.9); opacity: 0.85; }
          50% { transform: scale(1.22); opacity: 0.35; }
          100% { transform: scale(1.42); opacity: 0; }
        }
        @keyframes liveEqualizerBar {
          0%, 100% { height: 3px; }
          50% { height: 11px; }
        }
        @keyframes liveShimmerProgress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes smokeRise {
          0% { transform: translateY(0) scale(0.5); opacity: 0.9; }
          50% { transform: translateY(-12px) scale(1.2); opacity: 0.6; }
          100% { transform: translateY(-24px) scale(2.0); opacity: 0; }
        }
        @keyframes cloudFloat {
          0% { transform: translateX(-50px); }
          100% { transform: translateX(450px); }
        }
        @keyframes characterWalkBob {
          0% { transform: translateY(0); }
          100% { transform: translateY(-6px); }
        }

        .eco-orbit-track {
          animation: ecoOrbitSpinCW 12s linear infinite;
        }
        .eco-satellite-counter {
          animation: ecoOrbitSpinCCW 12s linear infinite;
        }
        .eco-animal-breath {
          animation: ecoAnimalBreath 3s ease-in-out infinite;
        }
        .eco-radar-pulse {
          animation: liveRadarGlow 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        /* Perimeter Border Patrol (0% -> 100%) */
        @keyframes borderPatrolLoop {
          0% { top: 0%; left: 28px; transform: translate(-50%, -50%) rotate(0deg); }
          24% { top: 0%; left: calc(100% - 28px); transform: translate(-50%, -50%) rotate(90deg); }
          26% { top: 28px; left: 100%; transform: translate(-50%, -50%) rotate(105deg); }
          48% { top: calc(100% - 28px); left: 100%; transform: translate(-50%, -50%) rotate(180deg); }
          51% { top: 100%; left: calc(100% - 28px); transform: translate(-50%, -50%) rotate(195deg); }
          73% { top: 100%; left: 28px; transform: translate(-50%, -50%) rotate(270deg); }
          76% { top: calc(100% - 28px); left: 0%; transform: translate(-50%, -50%) rotate(285deg); }
          97% { top: 28px; left: 0%; transform: translate(-50%, -50%) rotate(345deg); }
          100% { top: 0%; left: 28px; transform: translate(-50%, -50%) rotate(360deg); }
        }
        .box-border-patrol {
          position: absolute;
          width: 28px;
          height: 28px;
          z-index: 35;
          pointer-events: none;
          animation: borderPatrolLoop 22s linear infinite;
        }

        /* VIP Laser Conic Beam */
        @keyframes borderConicRotate {
          100% { transform: rotate(360deg); }
        }
        .vip-conic-wrapper {
          position: relative;
          border-radius: 28px;
          padding: 2px;
          overflow: hidden;
          box-shadow: 0 12px 32px -6px rgba(21, 61, 43, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03);
        }
        .vip-conic-beam {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent 0 270deg, #16a34a 305deg, #84cc16 330deg, #eab308 348deg, #ffffff 358deg, transparent 360deg);
          animation: borderConicRotate 4s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
        .vip-conic-inner {
          position: relative;
          background: linear-gradient(155deg, #ffffff 0%, #fafbf7 50%, #f4f6ee 100%);
          border: 1px solid rgba(40, 115, 74, 0.12);
          border-radius: 26px;
          z-index: 1;
          overflow: hidden;
        }

        /* P2P Realistic Theater */
        .p2p-stage-wrap {
          position: relative;
          width: 100%;
          height: 195px;
          background: linear-gradient(180deg, #cbe7be 0%, #e8f5df 45%, #daf0cb 75%, #bedfa8 100%);
          border-radius: 22px;
          overflow: hidden;
          border: 1.5px solid rgba(40, 115, 74, 0.22);
          box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.05);
        }
        .p2p-sun-glow {
          position: absolute;
          top: -20px;
          right: 40px;
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(253, 224, 71, 0.6) 0%, rgba(250, 204, 21, 0.2) 50%, transparent 70%);
          border-radius: 50%;
          pointer-events: none;
        }
        .p2p-cloud-1 {
          position: absolute;
          top: 10px;
          left: 15px;
          width: 48px;
          height: 14px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          animation: cloudFloat 22s linear infinite;
          pointer-events: none;
        }
        .p2p-cloud-2 {
          position: absolute;
          top: 26px;
          left: 150px;
          width: 62px;
          height: 18px;
          background: rgba(255, 255, 255, 0.85);
          border-radius: 20px;
          animation: cloudFloat 30s linear infinite 4s;
          pointer-events: none;
        }
        .p2p-ground-path {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 42px;
          background: linear-gradient(180deg, #6c8e5e 0%, #567749 40%, #446138 100%);
          border-top: 3px solid #3d5931;
        }
        .p2p-cobbles {
          position: absolute;
          bottom: 8px;
          left: 78px;
          right: 88px;
          height: 18px;
          background: repeating-linear-gradient(90deg, rgba(254, 243, 199, 0.35) 0 10px, rgba(217, 119, 6, 0.2) 10px 12px, transparent 12px 18px);
          border-radius: 10px;
          border: 1px dashed rgba(255,255,255,0.25);
        }
        .p2p-cottage {
          position: absolute;
          left: 8px;
          bottom: 18px;
          width: 80px;
          height: 118px;
          z-index: 5;
        }
        .p2p-cottage-roof {
          width: 100%;
          height: 44px;
          background: linear-gradient(135deg, #dc2626 0%, #991b1b 60%, #7f1d1d 100%);
          clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
          position: relative;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        .p2p-cottage-chimney {
          position: absolute;
          top: 2px;
          left: 12px;
          width: 12px;
          height: 20px;
          background: repeating-linear-gradient(180deg, #9a3412 0 4px, #7c2d12 4px 6px);
          border-radius: 2px;
          border: 1px solid #431407;
        }
        .p2p-chimney-smoke {
          position: absolute;
          top: -12px;
          left: 12px;
          width: 10px;
          height: 10px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 240, 0.4) 60%, transparent 80%);
          border-radius: 50%;
          animation: smokeRise 2.6s infinite ease-out;
        }
        .p2p-cottage-body {
          width: 72px;
          height: 74px;
          margin: 0 auto;
          background: linear-gradient(180deg, #fef9c3 0%, #fef08a 60%, #fde047 100%);
          border: 2px solid #854d0e;
          border-top: none;
          position: relative;
          box-shadow: 0 6px 14px rgba(0,0,0,0.2);
          border-radius: 0 0 4px 4px;
        }
        .p2p-cottage-window {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, #fef08a 20%, #60a5fa 90%);
          border: 2px solid #78350f;
          border-radius: 4px;
        }
        .p2p-door-frame {
          position: absolute;
          bottom: 0;
          left: 8px;
          width: 28px;
          height: 52px;
          background: #270f03;
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
        }
        .p2p-door {
          width: 100%;
          height: 100%;
          background: repeating-linear-gradient(90deg, #854d0e 0 6px, #713f12 6px 8px, #582a08 8px 9px);
          border-top-left-radius: 14px;
          border-top-right-radius: 14px;
          border: 1.5px solid #3d1a04;
          transform-origin: left;
          transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .p2p-shop {
          position: absolute;
          right: 8px;
          bottom: 18px;
          width: 88px;
          height: 122px;
          z-index: 5;
        }
        .p2p-shop-awning {
          width: 100%;
          height: 34px;
          background: repeating-linear-gradient(90deg, #15803d 0 12px, #ffffff 12px 24px);
          border-bottom: 3px solid #14532d;
          border-radius: 6px 6px 3px 3px;
          box-shadow: 0 5px 12px rgba(0,0,0,0.22);
        }
        .p2p-shop-sign {
          background: linear-gradient(135deg, #153d2b 0%, #0d2c20 100%);
          color: #c9f36a;
          font-size: 7.5px;
          font-weight: 900;
          text-align: center;
          padding: 2.5px 2px;
          border: 1px solid rgba(201, 243, 106, 0.4);
          border-radius: 3px;
          margin: 0 2px 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .p2p-shop-body {
          width: 82px;
          height: 86px;
          margin: -2px auto 0;
          background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
          border: 2px solid #166534;
          position: relative;
          box-shadow: 0 6px 16px rgba(0,0,0,0.18);
          border-radius: 0 0 4px 4px;
        }
        .p2p-counter {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          bottom: 18px;
          width: 82px;
          height: 50px;
          background: linear-gradient(180deg, #92400e 0%, #713f12 50%, #451a03 100%);
          border: 2px solid #270f03;
          border-radius: 8px;
          box-shadow: 0 8px 18px rgba(0,0,0,0.3);
          z-index: 4;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4px;
        }
        .p2p-counter-top {
          height: 9px;
          background: linear-gradient(90deg, #ca8a04 0%, #fde047 50%, #ca8a04 100%);
          border-radius: 4px;
        }
        .p2p-counter-label {
          font-size: 7px;
          font-weight: 900;
          color: #fef08a;
          text-align: center;
          text-transform: uppercase;
        }
        .p2p-member-actor {
          position: absolute;
          bottom: 22px;
          width: 44px;
          height: 72px;
          z-index: 6;
          transition: all 2.2s cubic-bezier(0.35, 0, 0.25, 1);
        }
        .p2p-member-actor.walking {
          animation: characterWalkBob 0.32s infinite alternate ease-in-out;
        }
        .p2p-merchant-actor {
          position: absolute;
          right: 18px;
          bottom: 22px;
          width: 44px;
          height: 72px;
          z-index: 6;
        }
        .p2p-handover-egg {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          z-index: 20;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0;
        }
        .p2p-handover-egg.transferring {
          transform: translate(25px, -8px) scale(1.2) rotate(15deg);
          opacity: 1;
        }
        .p2p-handover-cash {
          position: absolute;
          bottom: 50px;
          left: 50%;
          transform: translateX(-50%) scale(0);
          min-width: 48px;
          height: 20px;
          padding: 0 6px;
          background: linear-gradient(135deg, #22c55e 0%, #15803d 100%);
          border: 1.5px solid #86efac;
          border-radius: 6px;
          z-index: 20;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 9px;
          font-weight: 900;
          opacity: 0;
        }
        .p2p-handover-cash.transferring {
          transform: translate(-30px, -6px) scale(1.15);
          opacity: 1;
        }
        .p2p-payout-banner {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%) translateY(-12px) scale(0.85);
          background: linear-gradient(135deg, #153d2b 0%, #0d2c20 100%);
          color: #c9f36a;
          border: 1.5px solid #c9f36a;
          padding: 4.5px 14px;
          border-radius: 9999px;
          font-size: 10px;
          font-weight: 900;
          z-index: 30;
          opacity: 0;
          pointer-events: none;
          transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
          white-space: nowrap;
        }
        .p2p-payout-banner.active {
          transform: translateX(-50%) translateY(0) scale(1);
          opacity: 1;
        }
      `}</style>

      {/* ==================================================== */}
      {/* 1. SIGNATURE CANOPY PROFILE & EARNINGS VAULT         */}
      {/* ==================================================== */}
      <div className="bg-gradient-to-b from-[#153d2b] to-[#0d2c20] text-white px-4 pt-1 pb-5 -mt-2 rounded-b-[28px] shadow-lg relative overflow-hidden mb-4 z-20">
        {/* Ambient Stardust Glows */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-[#c9f36a]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#16a34a]/20 rounded-full blur-2xl pointer-events-none"></div>

        {/* Farmer Profile Quick Info Row */}
        <div className="flex items-center justify-between gap-2.5 mb-3.5 relative z-10 bg-white/[0.06] backdrop-blur-sm border border-white/10 rounded-2xl p-2.5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-[#16a34a]/30 via-white/10 to-transparent border-2 border-[#c9f36a]/60 p-0.5 flex items-center justify-center shadow-[0_4px_14px_rgba(201,243,106,0.25)]">
              <i className="fas fa-user-circle text-2xl text-white"></i>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0d2c20] rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-extrabold text-[#c9f36a] tracking-widest uppercase block leading-tight">
                  Welcome, Farmer
                </span>
              </div>
              <h2 className="font-manrope font-black text-sm text-white tracking-wide uppercase leading-tight flex items-center gap-1 mt-0.5">
                <span>{user?.username || 'mrsaqib242'}</span>
                <i className="fa-solid fa-circle-check text-[#c9f36a] text-[11px]" title="Verified Member"></i>
              </h2>
              <span className="text-[8.5px] font-semibold text-white/60 block leading-tight mt-0.5">
                <i className="fa-solid fa-network-wired text-[8px] text-white/40"></i> Upliner: {user?.upliner || 'N/A'}
              </span>
            </div>
          </div>

          <div className="text-right pr-1">
            <span className="text-[8px] font-extrabold text-white/50 uppercase tracking-widest block">Account ID</span>
            <span className="font-mono font-black text-xs text-white block mt-0.5">{user?.accountId || '#1197'}</span>
            <span className="inline-block mt-0.5 text-[8px] font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
              100% SECURE
            </span>
          </div>
        </div>

        {/* Balance Showcase Card (Earnings Vault) */}
        <div className="bg-gradient-to-b from-white/[0.12] to-black/[0.25] backdrop-blur-md border border-white/20 rounded-2xl p-3 relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.25)]">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9f36a] animate-pulse"></span>
              <span className="text-[8.5px] font-extrabold text-[#c9f36a] uppercase tracking-widest">
                EARNINGS VAULT
              </span>
            </div>
            <span className="text-[7.5px] bg-white/10 text-white/80 font-bold px-1.5 py-0.5 rounded-full border border-white/10 uppercase tracking-wide">
              1 Wallet Active
            </span>
          </div>

          {/* Primary Yield (Eggs Vault) */}
          <div className="relative bg-gradient-to-r from-black/40 via-[#153d2b]/40 to-black/30 border border-[#c9f36a]/35 rounded-xl p-2.5 flex items-center justify-between mb-2 shadow-md overflow-hidden">
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-[#c9f36a]/15 rounded-full blur-xl pointer-events-none"></div>

            <div className="relative z-10 min-w-0">
              <span className="inline-flex items-center gap-1 bg-[#c9f36a]/20 border border-[#c9f36a]/35 text-[#c9f36a] text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider mb-0.5">
                <i className="fa-solid fa-crown text-[7px] text-[#fbbf24]"></i> Primary Yield
              </span>
              <div className="flex items-baseline gap-1">
                <h3 className="font-manrope font-black text-xl text-white tracking-tight drop-shadow-sm leading-tight">
                  {Number(eggVault || 0).toLocaleString()}
                </h3>
                <span className="text-[11px] font-black text-[#c9f36a] uppercase">Egg</span>
              </div>
              <span className="text-[8px] font-semibold text-white/60 block mt-0.5">
                Instant Sellable Poultry Eggs • Est: Rs. {(Number(eggVault || 0) * 30).toLocaleString()} PKR
              </span>
            </div>

            <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-[#c9f36a]/25 via-white/10 to-transparent border border-[#c9f36a]/40 flex items-center justify-center p-1 shadow-lg flex-shrink-0">
              <img src={logoImg} className="w-7 h-7 object-contain filter drop-shadow-md" alt="Egg" />
            </div>
          </div>

          {/* Quick Buy / Sell Primary Action Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigateTo('/buy-asset')}
              className="bg-[#c9f36a] hover:bg-[#b8e858] active:scale-95 text-[#0d2c20] font-manrope font-black text-[10px] tracking-wider uppercase py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <i className="fa-solid fa-plus-circle text-[10.5px]"></i>
              <span>BUY Hens</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/sell-egg')}
              className="bg-white/15 hover:bg-white/25 active:scale-95 text-white font-manrope font-black text-[10px] tracking-wider uppercase py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border border-white/20 shadow-md transition-all cursor-pointer"
            >
              <i className="fa-solid fa-hand-holding-dollar text-[10.5px] text-[#c9f36a]"></i>
              <span>SELL Eggs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-4 space-y-5 pb-6">

        {/* ==================================================== */}
        {/* PENDING HEN PURCHASE & DEPOSIT ORDERS BANNER         */}
        {/* ==================================================== */}
        {userPendingDeposits.length > 0 && (
          <div className="farm-card-3d p-3.5 bg-gradient-to-br from-amber-500/10 via-amber-50/80 to-emerald-500/10 border-2 border-amber-400/60 rounded-2xl relative z-10 shadow-md">
            <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-amber-300/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider">
                  Pending Hen Orders ({userPendingDeposits.length})
                </h3>
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300">
                Awaiting Verification
              </span>
            </div>

            <div className="space-y-2">
              {userPendingDeposits.map((dep) => (
                <div
                  key={dep.id}
                  className="bg-white/90 border border-amber-200/80 rounded-xl p-2.5 shadow-sm space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-black">
                        🐔
                      </span>
                      <strong className="font-manrope font-black text-xs text-[#0d2c20]">
                        {dep.units}x Hens ({dep.gateway})
                      </strong>
                    </div>
                    <span className="font-manrope font-black text-xs text-emerald-800">
                      Rs. {Number(dep.amountPkr || 0).toLocaleString()} PKR
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[9px] text-slate-600 bg-amber-50/50 p-1.5 rounded-lg border border-amber-100">
                    <div>
                      <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Transaction ID:</span>
                      <code className="font-mono font-bold text-amber-800">{dep.transactionId}</code>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block text-[7.5px] uppercase">Sender Account:</span>
                      <span className="font-bold text-slate-700 truncate block">
                        {dep.senderAccountNumber || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-[8px] font-bold text-amber-700 flex items-center gap-1">
                      <i className="fa-solid fa-clock-rotate-left"></i>
                      Admin is verifying payment...
                    </span>
                    <a
                      href={`https://wa.me/923412017923?text=${encodeURIComponent(
                        `Assalam-o-Alaikum Admin! Maine AL Rehman Meta Eggs pe ${dep.units} Hens ka deposit submit kiya hai (Rs. ${dep.amountPkr}, TID: ${dep.transactionId}). Kindly isay jaldi approve ker k hens active ker dein.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <i className="fa-brands fa-whatsapp"></i>
                      <span>Fast Approval</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 text-[8px] font-medium text-slate-500 text-center leading-tight">
              💡 <span className="font-bold text-slate-700">Note:</span> Jaisay hi Admin payment verify karega, aap ki murgiyan foran farm mein add ho jayengi aur anday dena shuru ker dein gi.
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 2. LIVE NOTICE MARQUEE TICKER                        */}
        {/* ==================================================== */}
        <div className="bg-white border border-[#28734a]/20 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm relative z-10">
          <span className="flex-shrink-0 bg-[#153d2b] text-[#c9f36a] text-[9px] font-black px-2.5 py-1 rounded-lg tracking-wider uppercase flex items-center gap-1">
            <i className="fa-solid fa-bullhorn text-[8px]"></i> NOTICE
          </span>
          <marquee className="text-[11px] font-bold text-[#153d2b]" scrollamount="4">
            ✨ Welcome to AL Rehman Meta Eggs! 🐔 Invest in Premium Hens &amp; Collect Daily High-Yield Eggs! 🥚 Sell at the Best Market Prices via our Secure P2P Trading System! 💰 🚀
          </marquee>
        </div>

        {/* Official App Download Strip */}
        <div className="bg-white border border-[#28734a]/20 hover:border-[#16a34a]/50 rounded-2xl p-2 sm:p-2.5 flex items-center justify-between gap-2.5 shadow-sm relative z-10 transition-all">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#dcfce7] via-[#bbf7d0] to-[#86efac] border border-[#16a34a]/30 flex items-center justify-center text-[#15803d] shadow-sm flex-shrink-0">
              <i className="fa-brands fa-android text-base"></i>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide leading-tight truncate">
                  Official App Download
                </h4>
                <span className="text-[7.5px] font-black text-emerald-800 bg-emerald-100 border border-emerald-300/80 px-1.5 py-0.5 rounded uppercase tracking-wider flex-shrink-0">
                  5 MB
                </span>
              </div>
              <span className="text-[8px] font-semibold text-slate-500 block leading-tight mt-0.5 truncate">
                Fast, Smooth &amp; 100% Safe APK
              </span>
            </div>
          </div>

          <a
            href="https://alkram-meta-eggs.digital/app/Alkram_Meta_Eggs.apk"
            className="flex-shrink-0 bg-gradient-to-r from-[#153d2b] via-[#1b4b35] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#28734a] text-[#c9f36a] font-manrope font-black text-[9.5px] px-3.5 py-2 rounded-xl shadow-xs active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1.5"
          >
            <i className="fa-solid fa-download text-[9px] animate-bounce"></i>
            <span>DOWNLOAD</span>
          </a>
        </div>

        {/* ==================================================== */}
        {/* 3. DYNAMIC FARM PRODUCTION & LIVE ORBIT HARVEST NEXUS*/}
        {/* ==================================================== */}
        <div id="planSliderWrapper" className="relative z-10">
          <div className="overflow-hidden -mx-3.5 px-3.5 -my-3.5 py-3.5">
            <div className="w-full flex-shrink-0 px-1">
              <div
                className="bg-[#f0f4ea] border-2 border-[#c2d9bf] rounded-[26px] p-3.5 shadow-[0_4px_20px_rgba(21,61,43,0.05),0_0_15px_rgba(201,243,106,0.15)] relative z-10"
                style={{
                  background: 'radial-gradient(circle at 50% 40%, rgba(201, 243, 106, 0.18) 0%, rgba(240, 244, 234, 0.95) 65%, #e9efe1 100%)'
                }}
              >
                {/* 0 to 100% Traveling Border Patrol Egg Node */}
                <div className="box-border-patrol">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-[#16a34a] shadow-[0_2px_8px_rgba(22,163,74,0.5)] p-0.5 flex items-center justify-center">
                    <img src={logoImg} className="w-full h-full object-contain filter drop-shadow-sm" alt="patrol" />
                  </div>
                </div>

                {/* Ambient Radial Glow Behind Central Orbit */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-[#c9f36a]/15 rounded-full blur-2xl pointer-events-none"></div>

                {/* Card Top Header */}
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-[#c8dec5] relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-xl bg-gradient-to-br from-[#eef5e6] to-[#dcfce7] border border-[#16a34a]/30 flex items-center justify-center p-1 shadow-sm">
                      <img src={henImg} className="w-full h-full object-contain filter drop-shadow-sm" alt="AL Rehman Meta Eggs" />
                      <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#16a34a] border border-white rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-manrope font-black text-[11.5px] text-[#0d2c20] uppercase tracking-wide leading-tight">
                        AL Rehman Meta Eggs Ecosystem
                      </h4>
                      <span className="text-[7.5px] font-bold text-slate-500 block leading-tight">
                        Automated Daily Production
                      </span>
                    </div>
                  </div>

                  {/* Live Status Beacon with animated equalizer bars */}
                  <div className="inline-flex items-center gap-1.5 bg-[#0d2c20] text-[#c9f36a] border border-[#c9f36a]/40 px-2 py-0.5 rounded-full text-[8px] font-black shadow-sm">
                    <div className="flex items-end gap-0.5 h-2.5">
                      <span className="w-0.5 bg-[#c9f36a] rounded-full animate-[liveEqualizerBar_0.8s_ease-in-out_infinite]"></span>
                      <span className="w-0.5 bg-[#c9f36a] rounded-full animate-[liveEqualizerBar_1.2s_ease-in-out_infinite_0.2s]"></span>
                      <span className="w-0.5 bg-[#c9f36a] rounded-full animate-[liveEqualizerBar_0.9s_ease-in-out_infinite_0.4s]"></span>
                    </div>
                    <span className="tracking-wider uppercase">{totalActiveUnits} ACTIVE</span>
                  </div>
                </div>

                {/* 2-Column High-Tech Production Metrics */}
                <div className="grid grid-cols-2 gap-2 mb-2 relative z-10">
                  {/* My Egg Vault */}
                  <div className="relative bg-white/80 backdrop-blur-sm border border-[#c9dcc6] rounded-xl p-2 shadow-sm overflow-hidden group hover:border-[#16a34a] transition-all">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[7px] font-extrabold text-slate-500 uppercase tracking-wider">My Egg Vault</span>
                      <div className="w-3.5 h-3.5 rounded-full bg-[#eef5e6] p-0.5 flex items-center justify-center">
                        <img src={logoImg} className="w-full h-full object-contain" alt="mini" />
                      </div>
                    </div>
                    <strong className="font-manrope font-black text-[#0d2c20] text-xs block leading-tight">
                      {Number(eggVault || 0).toLocaleString()}
                      <span className="text-[7.5px] text-[#15803d] font-black uppercase ml-1">Egg</span>
                    </strong>
                    <div className="w-full h-1 bg-[#d8ead4] rounded-full mt-1.5 overflow-hidden relative">
                      <div className="h-full w-1/2 bg-gradient-to-r from-[#16a34a] to-[#c9f36a] rounded-full animate-[liveShimmerProgress_2s_infinite]"></div>
                    </div>
                  </div>

                  {/* Daily Rate Box */}
                  <div className="relative bg-[#f8faf4]/90 backdrop-blur-sm border border-[#c9dcc6] rounded-xl p-2 shadow-sm overflow-hidden group hover:border-[#16a34a] transition-all">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[7px] font-extrabold text-[#15803d] uppercase tracking-wider">Production Rate</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
                    </div>
                    <strong className="font-manrope font-black text-[#15803d] text-xs block leading-tight">
                      +{totalActiveUnits} Egg<span className="text-[7px] font-extrabold text-slate-500">/day</span>
                    </strong>
                    <div className="w-full h-1 bg-[#d8ead4] rounded-full mt-1.5 overflow-hidden relative">
                      <div className="h-full w-2/3 bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#c9f36a] rounded-full animate-[liveShimmerProgress_1.6s_infinite]"></div>
                    </div>
                  </div>
                </div>

                {/* Central Harvest Nexus (124px x 124px) */}
                <div className="flex flex-col items-center justify-center py-1.5 mb-1.5 relative z-10">
                  <div className="relative w-[124px] h-[124px] flex items-center justify-center">
                    {/* Concentric Radar Sonic Pulses */}
                    <div className="absolute inset-0 rounded-full border-2 border-[#c9f36a]/60 eco-radar-pulse pointer-events-none"></div>
                    <div className="absolute inset-[-6px] rounded-full border border-[#16a34a]/35 eco-radar-pulse pointer-events-none" style={{ animationDelay: '1.1s' }}></div>

                    {/* Outer Dashed Revolving Orbit Track */}
                    <div className="absolute inset-1 rounded-full border-2 border-dashed border-[#16a34a]/45 eco-orbit-track pointer-events-none">
                      {/* Orbiting Satellite 1 (Top) */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-2 border-[#16a34a] shadow-md p-0.5 flex items-center justify-center">
                        <img src={logoImg} className="w-full h-full object-contain eco-satellite-counter filter drop-shadow-sm" alt="orbit-egg" />
                      </div>
                      {/* Orbiting Satellite 2 (Bottom) */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-[#c9f36a] border-2 border-[#0d2c20] shadow-md flex items-center justify-center text-[7px] text-[#0d2c20] font-black">
                        <span className="eco-satellite-counter">✨</span>
                      </div>
                    </div>

                    {/* Inner Guide Ring */}
                    <div className="absolute inset-3.5 rounded-full border border-dotted border-[#16a34a]/30 pointer-events-none"></div>

                    {/* Interactive Central Hub Disc (76px x 76px) */}
                    <button
                      type="button"
                      onClick={handleHarvestClick}
                      className={`relative w-[76px] h-[76px] rounded-full border-[3px] flex flex-col items-center justify-center select-none cursor-pointer active:scale-95 transition-all z-10 ${
                        isAutoHarvestEnabled
                          ? 'bg-gradient-to-br from-[#082013] via-[#0d2c20] to-[#153d2b] border-[#c9f36a] shadow-[0_4px_16px_rgba(201,243,106,0.45),inset_0_2px_6px_rgba(201,243,106,0.3)]'
                          : 'bg-gradient-to-br from-[#20080d] via-[#2c0d12] to-[#3d151c] border-rose-500 shadow-[0_4px_16px_rgba(244,63,94,0.45),inset_0_2px_6px_rgba(244,63,94,0.3)]'
                      }`}
                      title={isAutoHarvestEnabled ? 'Auto-Harvest Active (Green)' : 'Manual Harvest Mode (Red)'}
                    >
                      <img src={henImg} className="w-6 h-6 object-contain eco-animal-breath" alt="Hen" />
                      <span className={`text-[6.5px] font-manrope font-black tracking-widest uppercase mt-0.5 drop-shadow ${
                        isAutoHarvestEnabled ? 'text-[#c9f36a]' : 'text-rose-300'
                      }`}>
                        {cooldownActive ? (isAutoHarvestEnabled ? 'AUTO 24H' : 'MANUAL') : 'HARVEST'}
                      </span>
                    </button>
                  </div>

                  {/* Automated Callout Capsule with 1-Tap Toggle (Green = ON, Red = OFF) */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAutoHarvest();
                    }}
                    className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm cursor-pointer transition-all border-2 active:scale-95 ${
                      isAutoHarvestEnabled
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 hover:bg-emerald-100 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-rose-50 border-rose-500 text-rose-800 hover:bg-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                    }`}
                    title="Click to toggle Auto-Harvest ON (Green) / OFF (Red)"
                  >
                    <span className={`w-2 h-2 rounded-full ${isAutoHarvestEnabled ? 'bg-emerald-500 animate-ping' : 'bg-rose-500 animate-ping'}`}></span>
                    <span className="font-manrope font-black text-[8.5px] tracking-wider uppercase">
                      {isAutoHarvestEnabled
                        ? `🟢 AUTO-HARVEST ON (${remainingTimeStr})`
                        : `🔴 AUTO-HARVEST OFF • MANUAL`}
                    </span>
                    <i className={`fa-solid ${isAutoHarvestEnabled ? 'fa-robot text-emerald-600' : 'fa-hand text-rose-600'} text-[9px]`}></i>
                  </div>
                </div>

                {/* Plan Specific Action Buttons */}
                <div className="grid grid-cols-2 gap-2 relative z-10">
                  <button
                    type="button"
                    onClick={() => navigateTo('/buy-asset')}
                    className="bg-gradient-to-r from-[#0d2c20] via-[#153d2b] to-[#1e523a] hover:from-[#153d2b] hover:to-[#28734a] text-white font-manrope font-black text-[8.5px] tracking-wider uppercase rounded-xl py-2 text-center shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <img src={henImg} className="w-3.5 h-3.5 object-contain inline-block" alt="Hen" />
                    <span>BUY AL REHMAN META EGGS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('/sell-egg')}
                    className="bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#166534] hover:from-[#15803d] hover:to-[#14532d] text-white font-manrope font-black text-[8.5px] tracking-wider uppercase rounded-xl py-2 text-center shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    <img src={logoImg} className="w-3.5 h-3.5 object-contain inline-block" alt="Egg" />
                    <span>SELL EGG</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. FARM OVERVIEW LIVE ANALYTICS GRID (4 CARDS)       */}
        {/* ==================================================== */}
        <div className="z-10 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-manrope font-black text-xs text-[#153d2b] uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-chart-line text-sm text-[#16a34a]"></i>
              <span>Farm Overview</span>
            </h3>
            <span className="text-[8px] bg-[#eef5e6] text-[#15803d] font-black px-2.5 py-0.5 rounded-full border border-[#16a34a]/20 uppercase tracking-wider">
              Live Analytics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 mb-2.5">
            {/* Total Buy Units */}
            <div className="bg-gradient-to-b from-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-[#16a34a]/60 rounded-[26px] p-3.5 flex flex-col justify-between shadow-[0_4px_16px_rgba(21,61,43,0.06)] relative overflow-hidden transition-all duration-300 group">
              <div className="flex items-start justify-between gap-1 mb-2.5">
                <span className="text-[9.5px] font-black text-[#153d2b] uppercase tracking-wide leading-tight pt-0.5">
                  Total Hens Bought
                </span>
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-[#16a34a]/40 animate-spin" style={{ animationDuration: '8s' }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#c9f36a] border border-[#0d2c20] shadow-[0_0_8px_#c9f36a]"></div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#eef5e6] to-[#dcfce7] border-2 border-white shadow-sm flex items-center justify-center relative z-10">
                    <img src={henImg} className="w-4 h-4 object-contain" alt="Hens" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-manrope font-black text-[#082013] text-base sm:text-lg tracking-tight leading-none">
                    {analytics?.totalUnitsBought || totalActiveUnits}
                  </h4>
                  <span className="text-[9px] font-black text-[#15803d] uppercase tracking-wider bg-[#16a34a]/10 px-2 py-0.5 rounded-md">Units</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-[#eef5e6] px-2.5 py-1 rounded-xl mt-2 border border-[#16a34a]/25 shadow-xs">
                  <span className="text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">Vol:</span>
                  <span className="text-[9.5px] font-black text-[#15803d]">Rs. {Number(analytics?.totalBuyVolumePkr || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Egg Sale */}
            <div className="bg-gradient-to-b from-white to-[#fffcf7] border border-[#28734a]/20 hover:border-amber-400/60 rounded-[26px] p-3.5 flex flex-col justify-between shadow-[0_4px_16px_rgba(21,61,43,0.06)] relative overflow-hidden transition-all duration-300 group">
              <div className="flex items-start justify-between gap-1 mb-2.5">
                <span className="text-[9.5px] font-black text-[#153d2b] uppercase tracking-wide leading-tight pt-0.5">
                  Total Egg Sale
                </span>
                <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-dashed border-amber-400/50 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 border border-[#78350f] shadow-[0_0_8px_#f59e0b]"></div>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-white shadow-sm flex items-center justify-center relative z-10">
                    <img src={logoImg} className="w-4 h-4 object-contain" alt="Egg" />
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-manrope font-black text-[#082013] text-base sm:text-lg tracking-tight leading-none">
                    {Number(analytics?.totalEggsSold || 0).toLocaleString()}
                  </h4>
                  <span className="text-[9px] font-black text-amber-700 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded-md">Egg</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl mt-2 border border-amber-300/40 shadow-xs">
                  <span className="text-[8.5px] font-bold text-amber-900/60 uppercase tracking-wide">Sold:</span>
                  <span className="text-[9.5px] font-black text-amber-800">Rs. {Number(analytics?.totalSalesPkr || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Grand Totals (Buy Volume & Total Sales) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-gradient-to-br from-[#082013] via-[#0d2c20] to-[#153d2b] text-white rounded-[26px] p-3.5 shadow-lg relative overflow-hidden border border-[#c9f36a]/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-[#c9f36a] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9f36a]/20 border border-[#c9f36a]/40 flex items-center justify-center text-[8px] text-[#c9f36a]">
                    <i className="fa-solid fa-cart-shopping"></i>
                  </span>
                  <span>TOTAL BUY</span>
                </span>
                <span className="text-[7.5px] bg-white/15 px-2 py-0.5 rounded-full text-white font-black uppercase tracking-wider">All Assets</span>
              </div>
              <h3 className="font-manrope font-black text-base sm:text-lg text-white tracking-tight mt-1">
                Rs. {Number(analytics?.totalBuyVolumePkr || 0).toLocaleString()}
              </h3>
              <span className="text-[8.5px] font-bold text-white/85 block mt-1">
                {analytics?.totalUnitsBought || totalActiveUnits} Units Total Volume
              </span>
            </div>

            <div className="bg-gradient-to-br from-[#0f4422] via-[#15803d] to-[#16a34a] text-white rounded-[26px] p-3.5 shadow-lg relative overflow-hidden border border-[#c9f36a]/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-[#c9f36a] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#c9f36a]/20 border border-[#c9f36a]/40 flex items-center justify-center text-[8px] text-[#c9f36a]">
                    <i className="fa-solid fa-hand-holding-dollar"></i>
                  </span>
                  <span>TOTAL SALES</span>
                </span>
                <span className="text-[7.5px] bg-white/15 px-2 py-0.5 rounded-full text-white font-black uppercase tracking-wider">Payouts</span>
              </div>
              <h3 className="font-manrope font-black text-base sm:text-lg text-[#c9f36a] tracking-tight mt-1">
                Rs. {Number(analytics?.totalSalesPkr || 0).toLocaleString()}
              </h3>
              <span className="text-[8.5px] font-bold text-white/90 block mt-1">
                Sum of Amount Sold
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 5. 6-TILE BENTO QUICK MENU                           */}
        {/* ==================================================== */}
        <div className="z-10 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-manrope font-black text-xs text-[#153d2b] uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse"></span>
              <span>Quick Management</span>
            </h3>
            <span className="text-[8px] bg-[#eef5e6] text-[#15803d] font-black px-2.5 py-0.5 rounded-full border border-[#16a34a]/20 uppercase tracking-wider">
              6 Shortcuts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Product Reward */}
            <button
              type="button"
              onClick={() => showToast('info', 'Product Rewards: iPhones, 70cc Bikes & Cash Bounties unlocked at higher tier!')}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-amber-400/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#fef3c7] via-[#fde68a] to-[#fcd34d] text-amber-700 flex items-center justify-center text-lg shadow-sm border-2 border-amber-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-gift"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">Product Reward</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">{"Prizes & Gifts"}</span>
              </div>
            </button>

            {/* 2. Team Rewards */}
            <button
              type="button"
              onClick={() => showToast('info', 'Team Rewards: Earn instant commission up to 3 levels on squad hen purchases!')}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-purple-400/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#f3e8ff] via-[#e9d5ff] to-[#d8b4fe] text-purple-700 flex items-center justify-center text-lg shadow-sm border-2 border-purple-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-medal"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">Rewards</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-purple-700 bg-purple-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">Team Rewards</span>
              </div>
            </button>

            {/* 3. All History (Opens Modal!) */}
            <button
              type="button"
              onClick={() => setIsHistoryModalOpen(true)}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-teal-400/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#ccfbf1] via-[#99f6e4] to-[#5eead4] text-teal-800 flex items-center justify-center text-lg shadow-sm border-2 border-teal-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">All History</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-teal-800 bg-teal-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">Buy • Sale • Trx</span>
              </div>
            </button>

            {/* 4. My Farm */}
            <button
              type="button"
              onClick={() => navigateTo('/my-farm')}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-[#16a34a]/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#ecfccb] via-[#d9f99d] to-[#bef264] text-[#166534] flex items-center justify-center text-lg shadow-sm border-2 border-lime-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-egg"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">My Farm</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-[#15803d] bg-lime-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">Active Units</span>
              </div>
            </button>

            {/* 5. Team */}
            <button
              type="button"
              onClick={() => navigateTo('/team')}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-indigo-400/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#e0e7ff] via-[#c7d2fe] to-[#a5b4fc] text-indigo-700 flex items-center justify-center text-lg shadow-sm border-2 border-indigo-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">Team</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-indigo-700 bg-indigo-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">Network</span>
              </div>
            </button>

            {/* 6. Password (Security) */}
            <button
              type="button"
              onClick={() => navigateTo('/change-password')}
              className="bg-gradient-to-br from-white via-white to-[#fbfdf9] border border-[#28734a]/20 hover:border-rose-400/60 rounded-[24px] p-3 flex items-center gap-3 shadow-[0_4px_16px_rgba(21,61,43,0.05)] hover:shadow-md active:scale-[0.98] transition-all text-left group"
            >
              <div className="w-11 h-11 rounded-[18px] bg-gradient-to-br from-[#ffe4e6] via-[#fecdd3] to-[#fda4af] text-rose-700 flex items-center justify-center text-lg shadow-sm border-2 border-rose-400/60 group-hover:scale-105 transition-all flex-shrink-0">
                <i className="fa-solid fa-key"></i>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-manrope font-black text-[#0d2c20] text-xs uppercase tracking-wide truncate">Password</h4>
                  <i className="fa-solid fa-chevron-right text-[8.5px] text-slate-300"></i>
                </div>
                <span className="text-[7.5px] font-black text-rose-700 bg-rose-500/15 px-2 py-0.5 rounded-md uppercase tracking-wider inline-block mt-1">Change Pin</span>
              </div>
            </button>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 6. VIP INVITE & SQUAD HUB (ROTATING CONIC BEAM)      */}
        {/* ==================================================== */}
        <div id="vipSquadHub" className="z-10 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-manrope font-black text-xs text-[#153d2b] uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-crown text-amber-500"></i>
              <span>Invite &amp; Earn Program</span>
            </h3>
            <span className="text-[7.5px] bg-[#c9f36a]/25 text-[#0d2c20] border border-[#c9f36a]/50 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
              <span>VIP RECRUITER</span>
            </span>
          </div>

          <div className="vip-conic-wrapper">
            <div className="vip-conic-beam"></div>

            <div className="vip-conic-inner p-4 sm:p-5 relative">
              <div className="relative z-10 flex flex-col gap-4">
                {/* Top Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xs text-emerald-600 shadow-sm">
                      <i className="fa-solid fa-ticket text-emerald-600 text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider leading-none">
                        Squad Referral Pass
                      </h4>
                      <span className="text-[8px] font-bold text-[#15803d] tracking-widest uppercase block mt-0.5">
                        Instant Rewards Active
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-black bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <i className="fa-solid fa-gift text-[8px]"></i>
                    <span>Lifetime Bonus</span>
                  </span>
                </div>

                {/* Code Box with 1-Tap Copy & WhatsApp Share */}
                <div className="bg-white border border-[#28734a]/20 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-[0_4px_16px_rgba(21,61,43,0.05)] relative overflow-hidden">
                  <div className="flex items-center gap-2.5 pl-1 min-w-0">
                    <div className="relative w-9 h-9 flex items-center justify-center flex-shrink-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#15803d] text-xs shadow-sm">
                        <i className="fa-solid fa-key"></i>
                      </div>
                    </div>

                    <div className="min-w-0">
                      <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block leading-tight">Farmer Invite Code</span>
                      <span className="font-manrope font-black text-base sm:text-lg text-[#0d2c20] tracking-widest uppercase block leading-tight font-mono truncate">
                        {user?.username || 'mrsaqib242'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Copy Button */}
                    <button
                      type="button"
                      onClick={handleCopyInvitationCode}
                      className="flex items-center gap-1 bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-[10.5px] px-3.5 py-2.5 rounded-xl shadow active:scale-90 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-copy text-[10px]"></i>
                      <span>COPY</span>
                    </button>

                    {/* WhatsApp Share Button */}
                    <a
                      href={whatsappShareUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl flex items-center justify-center text-lg shadow-[0_4px_12px_rgba(37,211,102,0.35)] active:scale-90 transition-all cursor-pointer"
                      title="Direct WhatsApp Share"
                    >
                      <i className="fa-brands fa-whatsapp text-lg"></i>
                    </a>
                  </div>
                </div>

                {/* Micro info */}
                <div className="flex items-center justify-between px-1 text-[8px] text-[#153d2b] font-medium">
                  <span className="flex items-center gap-1">
                    <i className="fa-solid fa-circle-check text-[#16a34a]"></i>
                    <span>Copies Code + App Download link automatically!</span>
                  </span>
                  <span className="text-[#15803d] font-bold">1-Tap WhatsApp</span>
                </div>

                {/* Dual Orbital Team Hubs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  <button
                    type="button"
                    onClick={() => navigateTo('/team')}
                    className="bg-white border border-indigo-100 hover:border-indigo-300 rounded-2xl p-3 flex flex-col justify-between shadow-xs hover:shadow-md active:scale-[0.98] transition-all text-left cursor-pointer group"
                    title="View Full Squad in Team Hub"
                  >
                    <div className="flex items-center justify-between mb-2 w-full">
                      <span className="text-[8.5px] font-black text-indigo-950 uppercase tracking-wider">Total Squad</span>
                      <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-[10px] group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-users"></i>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <h4 className="font-manrope font-black text-2xl text-[#0d2c20] tracking-tight">
                          {referralStats?.totalInvited ?? 0}
                        </h4>
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wide">Farmers</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 bg-indigo-50 border border-indigo-100 rounded-md px-1.5 py-0.5 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        <span className="text-[7.5px] font-bold text-indigo-700 uppercase tracking-wide">Total Network</span>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigateTo('/team')}
                    className="bg-white border border-emerald-200/80 hover:border-emerald-300 rounded-2xl p-3 flex flex-col justify-between shadow-xs hover:shadow-md active:scale-[0.98] transition-all text-left cursor-pointer group"
                    title="View Active Team in Team Hub"
                  >
                    <div className="flex items-center justify-between mb-2 w-full">
                      <span className="text-[8.5px] font-black text-[#15803d] uppercase tracking-wider">Active Team</span>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#15803d] flex items-center justify-center text-[10px] animate-pulse group-hover:scale-110 transition-transform">
                        <i className="fa-solid fa-bolt"></i>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <h4 className="font-manrope font-black text-2xl text-[#15803d] tracking-tight">
                          {referralStats?.activeTeamCount ?? 0}
                        </h4>
                        <span className="text-[8.5px] font-bold text-[#15803d]/70 uppercase tracking-wide">Deposited</span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 bg-emerald-50 border border-emerald-200 rounded-md px-1.5 py-0.5 w-max">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
                        <span className="text-[7.5px] font-bold text-emerald-800 uppercase tracking-wide">Min 1 Deposit</span>
                      </div>
                    </div>
                  </button>
                </div>

                {/* Conversion meter */}
                <button
                  type="button"
                  onClick={() => navigateTo('/team')}
                  className="bg-white border border-[#28734a]/15 hover:border-[#28734a]/35 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-sm active:scale-[0.99] transition-all text-left cursor-pointer w-full group"
                  title="View Team Conversion Metrics"
                >
                  <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-wider w-full">
                    <span className="text-[#153d2b] flex items-center gap-1 font-bold">
                      <i className="fa-solid fa-chart-line text-[#16a34a]"></i>
                      <span>Squad Conversion Rate</span>
                    </span>
                    <span className="text-[#15803d] font-mono font-black">
                      {referralStats?.totalInvited > 0
                        ? `${Math.round(((referralStats?.activeTeamCount || 0) / referralStats.totalInvited) * 100)}% Active`
                        : '0% Active'}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                    <div
                      className="h-full bg-gradient-to-r from-[#16a34a] via-[#84cc16] to-amber-400 rounded-full transition-all duration-500"
                      style={{
                        width: referralStats?.totalInvited > 0
                          ? `${Math.max(6, Math.min(100, Math.round(((referralStats?.activeTeamCount || 0) / referralStats.totalInvited) * 100)))}%`
                          : '6%'
                      }}
                    ></div>
                  </div>
                </button>

                {/* Open Team & Referral Hub action button */}
                <button
                  type="button"
                  onClick={() => navigateTo('/team')}
                  className="w-full bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-xs py-2.5 rounded-xl shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <i className="fa-solid fa-users"></i>
                  <span>Open Team &amp; Referral Hub</span>
                  <i className="fa-solid fa-arrow-right text-[10px] ml-0.5"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 7. INTERACTIVE P2P TRADE THEATER                     */}
        {/* ==================================================== */}
        <div className="z-10 relative">
          <div className="bg-white border border-[#28734a]/15 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(21,61,43,0.06)] relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10 px-0.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-100 to-amber-50 border border-amber-200/90 flex items-center justify-center text-amber-600 shadow-2xs text-sm flex-shrink-0">
                  <i className="fa-solid fa-store"></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-manrope font-black text-[12px] sm:text-[13px] text-[#0d2c20] uppercase tracking-wide leading-tight truncate">
                    P2P Trade &amp; Instant Cashout
                  </h3>
                  <span className="text-[8px] sm:text-[8.5px] font-bold text-[#16a34a] tracking-wider uppercase block mt-0.5 truncate">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping mr-1"></span>
                    Live Member Exchange • 0% Fee
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('/sell-egg')}
                className="flex-shrink-0 text-[9.5px] font-black bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] px-3.5 py-1.5 rounded-xl shadow active:scale-95 transition-all uppercase tracking-wider flex items-center gap-1 cursor-pointer"
              >
                <span>Sell Now</span>
                <i className="fa-solid fa-arrow-right text-[8px]"></i>
              </button>
            </div>

            {/* Simulation Stage (Cottage -> Path -> Counter -> Shop) */}
            <div className="p2p-stage-wrap mb-4">
              <div className="p2p-sun-glow"></div>
              <div className="p2p-cloud-1"></div>
              <div className="p2p-cloud-2"></div>

              {/* Cobblestone Path */}
              <div className="p2p-ground-path">
                <div className="p2p-cobbles"></div>
              </div>

              {/* Member Cottage */}
              <div className="p2p-cottage">
                <div className="p2p-cottage-roof">
                  <div className="p2p-cottage-chimney">
                    <div className="p2p-chimney-smoke"></div>
                  </div>
                </div>
                <div className="p2p-cottage-body">
                  <div className="p2p-cottage-window"></div>
                  <div className="p2p-door-frame">
                    <div className={`p2p-door ${p2pCycleStep !== 'WALK' ? 'open' : ''}`}>
                      <div className="p2p-door-knob"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Member / Farmer Actor */}
              <div
                className={`p2p-member-actor ${p2pCycleStep === 'WALK' ? 'walking' : ''}`}
                style={{
                  transform: p2pCycleStep === 'WALK'
                    ? 'translateX(35px) scaleX(1)'
                    : 'translateX(155px) scaleX(1)'
                }}
              >
                <svg viewBox="0 0 50 80" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                  {/* Straw Hat */}
                  <ellipse cx="25" cy="14" rx="20" ry="6" fill="#f59e0b" stroke="#b45309" strokeWidth="1.2"></ellipse>
                  <path d="M 12 14 C 12 6, 38 6, 38 14 Z" fill="#d97706"></path>
                  <path d="M 12 14 Q 25 18 38 14" stroke="#dc2626" strokeWidth="2.5" fill="none"></path>
                  {/* Head */}
                  <circle cx="25" cy="22" r="9" fill="#fed7aa"></circle>
                  <circle cx="20.5" cy="20.5" rx="1.6" ry="2.2" fill="#0f172a"></circle>
                  <circle cx="29.5" cy="20.5" rx="1.6" ry="2.2" fill="#0f172a"></circle>
                  <path d="M 21.5 25.5 Q 25 28.5 28.5 25.5" stroke="#b91c1c" strokeWidth="1.2" fill="#ffffff" strokeLinecap="round"></path>
                  {/* Shirt & Overalls */}
                  <path d="M 17 30 L 33 30 L 35 44 L 15 44 Z" fill="#dc2626"></path>
                  <path d="M 18 35 L 32 35 L 34 54 L 16 54 Z" fill="#1e40af"></path>
                  <rect x="18" y="30" width="3.5" height="15" fill="#1d4ed8"></rect>
                  <rect x="28.5" y="30" width="3.5" height="15" fill="#1d4ed8"></rect>
                  {/* Boots */}
                  <rect x="17.5" y="53" width="6.5" height="15" rx="2" fill="#1e3a8a"></rect>
                  <rect x="26" y="53" width="6.5" height="15" rx="2" fill="#1e3a8a"></rect>
                  <path d="M 15 67 L 24 67 L 24.5 73 L 14 73 Z" fill="#78350f"></path>
                  <path d="M 26 67 L 35 67 L 36 73 L 25.5 73 Z" fill="#78350f"></path>
                </svg>
              </div>

              {/* Center Trade Counter */}
              <div className="p2p-counter">
                <div className="p2p-counter-top"></div>
                <div className="p2p-counter-label">
                  ⚖️ 50 Eggs ➔ Rs {50 * activeMerchant.rate}
                </div>
                <div className="flex items-center justify-around text-[10px]">
                  <span>⚖️</span>
                  <span>🪙</span>
                </div>
              </div>

              {/* Handover items */}
              <div
                className={`p2p-handover-egg ${p2pCycleStep === 'TRADE' ? 'transferring' : ''}`}
                style={{
                  opacity: p2pCycleStep === 'TRADE' ? 1 : 0,
                  transform: p2pCycleStep === 'TRADE' ? 'translate(25px, -8px) scale(1.2)' : 'scale(0)'
                }}
              >
                🥚
              </div>
              <div
                className={`p2p-handover-cash ${p2pCycleStep === 'PAYOUT' ? 'transferring' : ''}`}
                style={{
                  opacity: p2pCycleStep === 'PAYOUT' ? 1 : 0,
                  transform: p2pCycleStep === 'PAYOUT' ? 'translate(-30px, -6px) scale(1.15)' : 'scale(0)'
                }}
              >
                💵 Rs {50 * activeMerchant.rate}
              </div>

              {/* Payout Banner */}
              <div className={`p2p-payout-banner ${p2pCycleStep === 'PAYOUT' ? 'active' : ''}`}>
                🎉 {activeMerchant.name} paid Rs {(50 * activeMerchant.rate).toLocaleString()} for 50 Eggs!
              </div>

              {/* Right: Official Buyer Shop & Merchant */}
              <div className="p2p-shop">
                <div className="p2p-shop-awning"></div>
                <div className="p2p-shop-sign">{activeMerchant.name.toUpperCase()} ★</div>
                <div className="p2p-shop-body">
                  <div className="p2p-merchant-actor">
                    <svg viewBox="0 0 50 80" className="w-full h-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                      <path d="M 14 16 C 14 8, 36 8, 36 16 C 36 18, 33 19, 32 20 C 25 15, 17 18, 14 16 Z" fill="#1e293b"></path>
                      <circle cx="25" cy="22" r="9" fill="#fed7aa"></circle>
                      <circle cx="20" cy="20.5" r="3.8" fill="rgba(255,255,255,0.35)" stroke="#b45309" strokeWidth="1.2"></circle>
                      <circle cx="30" cy="20.5" r="3.8" fill="rgba(255,255,255,0.35)" stroke="#b45309" strokeWidth="1.2"></circle>
                      <circle cx="20.5" cy="20" r="1.5" fill="#0f172a"></circle>
                      <circle cx="30.5" cy="20" r="1.5" fill="#0f172a"></circle>
                      <path d="M 16 30 L 34 30 L 36 50 L 14 50 Z" fill="#f8fafc"></path>
                      <polygon points="25,31 23,37 25,44 27,37" fill="#047857"></polygon>
                      <path d="M 15 31 L 22 31 L 23 48 L 14 48 Z" fill="#15803d"></path>
                      <path d="M 35 31 L 28 31 L 27 48 L 36 48 Z" fill="#15803d"></path>
                      <rect x="2" y="42" width="11" height="7.5" rx="1" fill="#22c55e" stroke="#15803d" strokeWidth="0.8"></rect>
                      <rect x="15" y="49" width="20" height="15" fill="#0f172a"></rect>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* ================================================ */}
            {/* 8. TOP VERIFIED BUYERS LIVE CAROUSEL             */}
            {/* ================================================ */}
            <div>
              <div className="flex items-center justify-between mb-2.5 px-0.5">
                <span className="text-xs font-black text-[#0d2c20] uppercase tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-award text-amber-500"></i>
                  <span>Top Official Buyers (Live Rates)</span>
                </span>
                <span className="text-[10px] font-bold text-[#16a34a]">Swipe Cards ➔</span>
              </div>

              <div className="flex md:grid md:grid-cols-3 items-stretch gap-3 overflow-x-auto md:overflow-visible no-scrollbar pb-1 snap-x snap-mandatory scroll-smooth" style={{ WebkitOverflowScrolling: 'touch' }}>
                {/* 1. Sonica FORM STORE */}
                <div className="flex-1 min-w-[270px] sm:min-w-[290px] md:min-w-0 snap-start bg-gradient-to-b from-white to-[#fafbf7] border border-[#28734a]/20 hover:border-amber-400 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        🥇 #1 TOP RATED
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="font-manrope font-black text-xs text-[#0d2c20]">5.0</span>
                        <span className="text-[9.5px] font-bold text-slate-400">(6,141 trades)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-manrope font-black text-sm text-[#0d2c20] tracking-tight truncate">
                        Sonica FORM STORE
                      </h4>
                      <i className="fa-solid fa-circle-check text-blue-500 text-xs flex-shrink-0" title="Verified Merchant"></i>
                    </div>

                    <div className="mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        <span>🥚</span>
                        <span>Egg (Hen) Buyer</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#f8f7f0] border border-[#e2ede0] flex items-center justify-between mb-3 shadow-inner">
                    <div>
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Official Buying Rate</span>
                      <span className="font-mono font-black text-[#15803d] text-sm leading-tight block mt-0.5">
                        32.00 Rs <span className="text-[9.5px] font-bold text-slate-400">/ unit</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Trade Limits</span>
                      <span className="font-mono text-[#0d2c20] font-bold text-xs leading-tight block mt-0.5">
                        1 - 10000 Rs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#28734a]/10">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
                      <span>24/7 Auto Payout</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateTo('/sell-egg')}
                      className="bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>SELL NOW</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                </div>

                {/* 2. Usmaina Poltry Farm */}
                <div className="flex-1 min-w-[270px] sm:min-w-[290px] md:min-w-0 snap-start bg-gradient-to-b from-white to-[#fafbf7] border border-[#28734a]/20 hover:border-emerald-400 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9.5px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        🥈 #2 BEST RATE
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="font-manrope font-black text-xs text-[#0d2c20]">4.0</span>
                        <span className="text-[9.5px] font-bold text-slate-400">(1,657 trades)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-manrope font-black text-sm text-[#0d2c20] tracking-tight truncate">
                        Usmaina Poltry Farm
                      </h4>
                      <i className="fa-solid fa-circle-check text-blue-500 text-xs flex-shrink-0" title="Verified Merchant"></i>
                    </div>

                    <div className="mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        <span>🥚</span>
                        <span>Egg (Hen) Buyer</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#f8f7f0] border border-[#e2ede0] flex items-center justify-between mb-3 shadow-inner">
                    <div>
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Official Buying Rate</span>
                      <span className="font-mono font-black text-[#15803d] text-sm leading-tight block mt-0.5">
                        30.00 Rs <span className="text-[9.5px] font-bold text-slate-400">/ unit</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Trade Limits</span>
                      <span className="font-mono text-[#0d2c20] font-bold text-xs leading-tight block mt-0.5">
                        1 - 10000 Rs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#28734a]/10">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
                      <span>24/7 Auto Payout</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateTo('/sell-egg')}
                      className="bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>SELL NOW</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                </div>

                {/* 3. Syed poultry farm */}
                <div className="flex-1 min-w-[270px] sm:min-w-[290px] md:min-w-0 snap-start bg-gradient-to-b from-white to-[#fafbf7] border border-[#28734a]/20 hover:border-teal-400 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[9.5px] font-black bg-teal-100 text-teal-900 border border-teal-300 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        🥉 #3 INSTANT CASHOUT
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400 text-xs">★</span>
                        <span className="font-manrope font-black text-xs text-[#0d2c20]">5.0</span>
                        <span className="text-[9.5px] font-bold text-slate-400">(5,805 trades)</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-1 mb-1">
                      <h4 className="font-manrope font-black text-sm text-[#0d2c20] tracking-tight truncate">
                        Syed poultry farm
                      </h4>
                      <i className="fa-solid fa-circle-check text-blue-500 text-xs flex-shrink-0" title="Verified Merchant"></i>
                    </div>

                    <div className="mb-2.5">
                      <span className="inline-flex items-center gap-1 text-[9.5px] font-black text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg uppercase tracking-wider">
                        <span>🥚</span>
                        <span>Egg (Hen) Buyer</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#f8f7f0] border border-[#e2ede0] flex items-center justify-between mb-3 shadow-inner">
                    <div>
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Official Buying Rate</span>
                      <span className="font-mono font-black text-[#15803d] text-sm leading-tight block mt-0.5">
                        33.00 Rs <span className="text-[9.5px] font-bold text-slate-400">/ unit</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-wider block">Trade Limits</span>
                      <span className="font-mono text-[#0d2c20] font-bold text-xs leading-tight block mt-0.5">
                        1 - 10000 Rs
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#28734a]/10">
                    <span className="text-[8.5px] font-bold text-slate-500 uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
                      <span>24/7 Auto Payout</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => navigateTo('/sell-egg')}
                      className="bg-gradient-to-r from-[#153d2b] to-[#1e523a] hover:from-[#1b4b35] hover:to-[#256648] text-[#c9f36a] font-manrope font-black text-xs px-4 py-2 rounded-xl uppercase tracking-wider shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>SELL NOW</span>
                      <i className="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 9. VIP SUPPORT & OFFICIAL COMMUNITY DESK             */}
        {/* ==================================================== */}
        <div className="z-10 relative">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-manrope font-black text-xs text-[#153d2b] uppercase tracking-widest flex items-center gap-2">
              <i className="fa-solid fa-headset text-emerald-600"></i>
              <span>Support &amp; Community</span>
            </h3>
            <span className="text-[7.5px] bg-[#c9f36a]/25 text-[#0d2c20] border border-[#c9f36a]/50 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] animate-ping"></span>
              <span>24/7 HELPDESK</span>
            </span>
          </div>

          <div className="vip-conic-wrapper">
            <div className="vip-conic-beam"></div>

            <div className="vip-conic-inner p-4 sm:p-5 relative">
              <div className="relative z-10 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-xs text-emerald-600 shadow-sm">
                      <i className="fa-solid fa-shield-heart text-emerald-600 text-xs"></i>
                    </div>
                    <div>
                      <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider leading-none">
                        Official Help Desk
                      </h4>
                      <span className="text-[8px] font-bold text-[#15803d] tracking-widest uppercase block mt-0.5">
                        Instant Support &amp; Community
                      </span>
                    </div>
                  </div>
                  <span className="text-[7.5px] font-black bg-gradient-to-r from-emerald-500 via-[#16a34a] to-[#15803d] text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9f36a] animate-pulse"></span>
                    <span>Verified</span>
                  </span>
                </div>

                {/* 2x2 Grid of 4 Support Modules */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {/* WhatsApp Live Chat */}
                  <div className="bg-white border border-emerald-200/80 rounded-2xl p-3 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-black text-[#15803d] uppercase tracking-wider block leading-tight">WhatsApp</span>
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Live Chat</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#16a34a] flex items-center justify-center text-xs shadow-inner">
                        <i className="fa-brands fa-whatsapp"></i>
                      </div>
                    </div>
                    <a
                      href={getWhatsAppSupportUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-[#25D366] to-[#128C7E] text-white font-manrope font-black text-[9.5px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <i className="fa-brands fa-whatsapp text-xs"></i>
                      <span>Chat Now</span>
                    </a>
                  </div>

                  {/* Call Helpline */}
                  <div className="bg-white border border-sky-200 rounded-2xl p-3 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-black text-sky-900 uppercase tracking-wider block leading-tight">Call Helpline</span>
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Voice Support</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xs shadow-inner animate-pulse">
                        <i className="fa-solid fa-phone-volume text-[10px]"></i>
                      </div>
                    </div>
                    <a
                      href={`tel:${platformSettings?.communityLinks?.supportPhone || '+923412017923'}`}
                      className="w-full bg-gradient-to-r from-sky-600 to-blue-700 text-white font-manrope font-black text-[9.5px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <i className="fa-solid fa-phone text-[9.5px]"></i>
                      <span>Call Now</span>
                    </a>
                  </div>

                  {/* WhatsApp Group */}
                  <div className="bg-white border border-amber-200 rounded-2xl p-3 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-black text-amber-900 uppercase tracking-wider block leading-tight">WhatsApp Group</span>
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Community</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xs shadow-inner">
                        <i className="fa-solid fa-users text-[10px]"></i>
                      </div>
                    </div>
                    <a
                      href={platformSettings?.communityLinks?.whatsappGroup || 'https://chat.whatsapp.com/alrehman-meta-eggs-official'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-manrope font-black text-[9.5px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <i className="fa-solid fa-user-group text-[9.5px]"></i>
                      <span>Join Group</span>
                    </a>
                  </div>

                  {/* WhatsApp Channel */}
                  <div className="bg-white border border-purple-200 rounded-2xl p-3 flex flex-col justify-between gap-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[9.5px] font-black text-purple-900 uppercase tracking-wider block leading-tight">WhatsApp Channel</span>
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Official News</span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs shadow-inner">
                        <i className="fa-solid fa-bullhorn text-[10px]"></i>
                      </div>
                    </div>
                    <a
                      href={platformSettings?.communityLinks?.whatsappChannel || 'https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-manrope font-black text-[9.5px] py-2 px-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all uppercase tracking-wider"
                    >
                      <i className="fa-solid fa-bell text-[9.5px]"></i>
                      <span>Follow Channel</span>
                    </a>
                  </div>
                </div>

                {/* Direct In-App Live Support Chat Trigger */}
                <button
                  type="button"
                  onClick={() => setIsSupportModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#0d2c20] via-[#153d2b] to-[#0d2c20] text-[#c9f36a] border border-[#c9f36a]/40 font-manrope font-black text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-comments text-xs"></i>
                  <span>Open In-App Support Chat &amp; Helpdesk</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>

                <div className="bg-white/80 border border-[#28734a]/15 rounded-xl p-2 flex items-center justify-between text-[8px] text-[#153d2b] font-medium shadow-xs">
                  <span className="flex items-center gap-1.5 font-bold">
                    <i className="fa-solid fa-circle-check text-[#16a34a]"></i>
                    <span>Official AL Rehman Helpdesk • 24/7 Verified Support</span>
                  </span>
                  <span className="text-[#15803d] font-bold uppercase tracking-wider">Instant Reply</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* MODAL 1: HARVEST COOLDOWN COUNTDOWN MODAL            */}
      {/* ==================================================== */}
      {isCooldownModalOpen && (
        <div className="fixed inset-0 bg-[#082013]/95 z-[999999] flex flex-col items-center justify-center gap-5 px-6">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-amber-500/20 rounded-full animate-pulse"></div>
            <div className="absolute inset-[-10px] border border-amber-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center p-3 shadow-2xl relative z-10 border-2 border-amber-300">
              <i className="fa-solid fa-hourglass-half text-amber-500 text-3xl animate-spin" style={{ animationDuration: '4s' }}></i>
              <span className="text-[8px] font-black text-amber-600 mt-2 uppercase tracking-widest leading-none">Cooldown</span>
            </div>
          </div>

          <div className="text-center max-w-xs space-y-1.5">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[9px] font-black uppercase mb-1 cursor-pointer transition-all active:scale-95 ${
              isAutoHarvestEnabled
                ? 'bg-emerald-500/20 text-[#c9f36a] border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]'
            }`}
            onClick={() => toggleAutoHarvest()}
            title="Click to toggle Auto-Harvest ON/OFF"
            >
              <i className={`fa-solid ${isAutoHarvestEnabled ? 'fa-robot text-[#c9f36a]' : 'fa-hand text-rose-400'}`}></i>
              <span>{isAutoHarvestEnabled ? '🟢 Auto-Harvest: ON (Green)' : '🔴 Auto-Harvest: OFF (Red)'}</span>
            </div>
            <h3 className="font-manrope font-black text-white text-base tracking-widest uppercase">
              Harvest Cooldown Active
            </h3>
            <p className="text-[10.5px] text-white/70 font-medium">
              Your active flock is currently nesting. Your next batch of organic eggs will be ready in:
            </p>
          </div>

          {/* Live Dynamic Countdown Digital Clock */}
          <div className="bg-black/60 border border-white/20 px-6 py-2.5 rounded-2xl shadow-inner">
            <span className="font-mono font-bold text-2xl text-[#c9f36a] tracking-widest">
              {remainingTimeStr}
            </span>
          </div>

          <p className={`text-[9.5px] text-center max-w-xs font-medium ${
            isAutoHarvestEnabled ? 'text-emerald-300/80' : 'text-rose-300/80'
          }`}>
            {isAutoHarvestEnabled
              ? '💡 Auto-Deposit Active: You don\'t need to manually click. Fresh eggs will automatically deposit into your vault every 24 hours!'
              : '⚠️ Manual Mode: Auto-deposit is paused. You must manually click to collect eggs when the timer completes.'}
          </p>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 w-full max-w-xs mt-2">
            <button
              type="button"
              onClick={() => {
                setIsCooldownModalOpen(false);
                navigateTo('MY_FARM');
              }}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-[#16a34a] text-white font-manrope font-black text-[10px] tracking-widest uppercase rounded-xl shadow transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fa-solid fa-wheat-awn"></i>
              <span>View Flock in My Farm</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCooldownModalOpen(false)}
              className="w-full py-2 px-4 bg-white/20 hover:bg-white/30 text-white font-manrope font-black text-[10px] tracking-widest uppercase rounded-xl transition-all active:scale-95 border border-white/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 2: HARVEST CELEBRATION MODAL                   */}
      {/* ==================================================== */}
      {isHarvestCelebrationOpen && (
        <div className="fixed inset-0 bg-[#082013]/90 backdrop-blur-md z-[999999] flex flex-col items-center justify-center gap-5 px-6 animate-fadeIn">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-[#c9f36a]/30 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
            <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center p-3 shadow-2xl relative z-10 border-4 border-[#c9f36a]">
              <img src={henImg} className="w-16 h-16 object-contain animate-bounce" alt="Hen" />
            </div>
            <div className="absolute -top-3 bg-gradient-to-r from-[#153d2b] to-[#1e523a] text-[#c9f36a] border border-[#c9f36a]/50 font-black text-sm px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
              <span>+{harvestYieldAmount}</span>
              <img src={logoImg} className="w-4 h-4 object-contain" alt="Egg" />
              <span>Eggs</span>
            </div>
          </div>

          <div className="text-center max-w-xs space-y-1">
            <h3 className="font-manrope font-black text-white text-lg tracking-wide uppercase">
              Harvest Successful!
            </h3>
            <p className="text-xs text-white/80 font-medium">
              +{harvestYieldAmount} fresh organic eggs added to your Egg Vault. Total Vault: {Math.floor(Number(eggVault || 0))} Eggs.
            </p>
          </div>

          <div className="flex gap-2 w-full max-w-xs mt-2">
            <button
              type="button"
              onClick={() => {
                setIsHarvestCelebrationOpen(false);
                navigateTo('/sell-egg');
              }}
              className="flex-1 py-2.5 bg-[#c9f36a] text-[#0d2c20] font-manrope font-black text-xs uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <i className="fa-solid fa-coins"></i>
              <span>Sell Eggs Now</span>
            </button>
            <button
              type="button"
              onClick={() => setIsHarvestCelebrationOpen(false)}
              className="py-2.5 px-4 bg-white/20 text-white font-manrope font-black text-xs uppercase tracking-wider rounded-xl border border-white/30 active:scale-95 transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 3: ALL HISTORY LOGS MODAL (BUY, SALE, TRX)     */}
      {/* ==================================================== */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-[#082013]/85 backdrop-blur-md z-[999999] flex items-center justify-center p-3">
          <div className="relative w-full max-w-[440px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#082013] via-[#0d2c20] to-[#153d2b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/40 text-teal-300 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </div>
                <div>
                  <h3 className="font-manrope font-black text-sm uppercase tracking-wide">All History Logs</h3>
                  <span className="text-[8.5px] text-white/70 block">Buy • Harvest • P2P Liquidation</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 border-b border-slate-200">
              {['ALL', 'BUY', 'HARVEST', 'SELL'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setHistoryTab(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    historyTab === tab
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="p-3 overflow-y-auto space-y-2 flex-1">
              {filteredHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <i className="fa-solid fa-folder-open text-3xl mb-2 block text-slate-300"></i>
                  <p className="text-xs font-bold">No history records found in this category.</p>
                </div>
              ) : (
                filteredHistory.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 hover:bg-white flex items-center justify-between gap-2 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs flex-shrink-0 ${
                          item.category === 'BUY'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.category === 'HARVEST'
                            ? 'bg-lime-100 text-lime-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        <i
                          className={`fa-solid ${
                            item.category === 'BUY'
                              ? 'fa-cart-shopping'
                              : item.category === 'HARVEST'
                              ? 'fa-egg'
                              : 'fa-hand-holding-dollar'
                          }`}
                        ></i>
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-manrope font-black text-xs text-slate-800 truncate">
                          {item.title}
                        </h5>
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 mt-0.5">
                          <span>{new Date(item.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">{item.channel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-black text-xs text-slate-900 block">
                        {item.category === 'SELL' ? '+' : item.category === 'BUY' ? '-' : '+'}
                        {item.unit === 'PKR' ? `Rs. ${Number(item.amount).toLocaleString()}` : `${item.amount} Eggs`}
                      </span>
                      <span
                        className={`inline-block text-[8px] font-black uppercase px-2 py-0.5 rounded mt-0.5 ${
                          item.status === 'Pending'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : item.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500">
                Total Records: {filteredHistory.length}
              </span>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(false)}
                className="py-1.5 px-4 bg-slate-800 text-white font-manrope font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 4: MY FARM ACTIVE ASSETS MODAL                 */}
      {/* ==================================================== */}
      {isMyFarmModalOpen && (
        <div className="fixed inset-0 bg-[#082013]/85 backdrop-blur-md z-[999999] flex items-center justify-center p-3">
          <div className="relative w-full max-w-[420px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="bg-gradient-to-r from-[#082013] via-[#0d2c20] to-[#153d2b] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-lime-500/20 border border-lime-400/40 text-lime-300 flex items-center justify-center text-sm">
                  <i className="fa-solid fa-egg"></i>
                </div>
                <div>
                  <h3 className="font-manrope font-black text-sm uppercase tracking-wide">My Farm Coop</h3>
                  <span className="text-[8.5px] text-white/70 block">
                    {totalActiveUnits} Active Hen Units Producing Daily Yield
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMyFarmModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
              {activeAssets.map((asset, idx) => {
                const totalDays = Number(asset.termDays) || 120;
                const units = Number(asset.units) || 1;
                const purchaseTs = asset.purchaseDate || asset.purchasedAt ? new Date(asset.purchaseDate || asset.purchasedAt).getTime() : Date.now();
                const calendarElapsed = Math.max(0, Math.floor((Date.now() - purchaseTs) / (24 * 60 * 60 * 1000)));
                const harvestElapsed = asset.daysElapsed !== undefined ? Number(asset.daysElapsed) : (asset.daysRemaining !== undefined ? Math.max(0, totalDays - Number(asset.daysRemaining)) : 0);
                const daysElapsed = Math.min(totalDays, Math.max(harvestElapsed, calendarElapsed));
                const daysRemaining = Math.max(0, totalDays - daysElapsed);
                const progressPct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
                const isCompleted = daysRemaining === 0 || asset.status === 'completed';

                return (
                  <div
                    key={asset.id || idx}
                    className="p-3 rounded-2xl border border-emerald-200/80 bg-emerald-50/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-white border border-emerald-300 p-1 flex items-center justify-center shadow-xs">
                          <img src={henImg} className="w-8 h-8 object-contain" alt="Hen" />
                        </div>
                        <div>
                          <h4 className="font-manrope font-black text-xs text-slate-900 uppercase">
                            {asset.name || 'AL Rehman Meta Eggs'}
                          </h4>
                          <span className="text-[9px] font-bold text-emerald-700 block">
                            Flock: {units} Hen(s) • +{units} Egg/day
                          </span>
                          <span className="text-[8px] text-slate-400 block mt-0.5">
                            Purchased: {new Date(purchaseTs).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[8px] font-black uppercase text-slate-400 block">
                          Day {daysElapsed}/{totalDays}
                        </span>
                        <span className="font-mono font-black text-xs text-slate-800 block">
                          {isCompleted ? 'Completed' : `${daysRemaining}d Left`}
                        </span>
                        <span className={`inline-block mt-0.5 text-[8px] font-black px-1.5 py-0.2 rounded uppercase ${
                          isCompleted ? 'bg-amber-100 text-amber-800' : 'text-emerald-700 bg-emerald-200/80'
                        }`}>
                          {isCompleted ? 'Completed' : 'Active'}
                        </span>
                      </div>
                    </div>
                    {/* Mini Progress */}
                    <div className="w-full h-1.5 bg-emerald-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#153d2b] rounded-full transition-all"
                        style={{ width: `${Math.max(5, progressPct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsMyFarmModalOpen(false);
                  navigateTo('/buy-asset');
                }}
                className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-[#16a34a] text-white font-manrope font-black text-xs uppercase tracking-wider rounded-xl shadow cursor-pointer text-center"
              >
                + Add More Hens
              </button>
              <button
                type="button"
                onClick={() => setIsMyFarmModalOpen(false)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-manrope font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL 5: OFFICIAL COMMUNITY POPUP                    */}
      {/* ==================================================== */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 bg-[#082013]/80 backdrop-blur-md z-[9999999] flex items-center justify-center p-3.5">
          <div className="relative w-full max-w-[395px] bg-white rounded-[26px] shadow-2xl overflow-hidden z-10 border border-[#c9f36a]/40">
            <div className="relative bg-gradient-to-br from-[#082013] via-[#0d2c20] to-[#153d2b] text-white p-4 overflow-hidden">
              <div className="flex items-center justify-between relative z-10 mb-2.5">
                <div className="inline-flex items-center gap-1.5 bg-black/45 border border-[#c9f36a]/40 px-2.5 py-1 rounded-full shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9f36a] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9f36a]"></span>
                  </span>
                  <span className="text-[9px] font-black text-[#c9f36a] uppercase tracking-wider">OFFICIAL COMMUNITY</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCommunityModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xs transition-all cursor-pointer"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#16a34a]/30 to-transparent border border-[#c9f36a]/60 p-1 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <img src={henImg} className="w-full h-full object-contain" alt="Hen" />
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border border-[#0d2c20] flex items-center justify-center text-[7px] text-white font-black">
                    ✓
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-poppins font-black text-base text-white tracking-wide uppercase leading-tight truncate">
                      AL Rehman Meta Eggs
                    </h3>
                    <i className="fa-solid fa-circle-check text-[#c9f36a] text-xs"></i>
                  </div>
                  <p className="text-[10px] text-white/80 font-medium leading-tight mt-0.5">
                    Daily Yield Signals &amp; Verified Poultry Network
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3 bg-gradient-to-b from-[#fbfdf9] via-white to-[#f4f7f1]">
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-1.5 px-1 shadow-xs">
                  <span className="block text-emerald-600 text-[10px]"><i className="fa-solid fa-bolt"></i></span>
                  <span className="font-poppins font-black text-[10px] text-[#0d2c20] block leading-tight">FAST SIGNALS</span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">Daily Alerts</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-1.5 px-1 shadow-xs">
                  <span className="block text-amber-500 text-[10px]"><i className="fa-solid fa-shield-halved"></i></span>
                  <span className="font-poppins font-black text-[10px] text-[#0d2c20] block leading-tight">SAFE CASHOUT</span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">JazzCash / Easy</span>
                </div>
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl py-1.5 px-1 shadow-xs">
                  <span className="block text-blue-500 text-[10px]"><i className="fa-solid fa-gift"></i></span>
                  <span className="font-poppins font-black text-[10px] text-[#0d2c20] block leading-tight">BOUNTIES</span>
                  <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-tighter">Bikes &amp; iPhones</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                <a
                  href="https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#25D366] via-[#20ba5a] to-[#128C7E] text-white rounded-xl p-2.5 flex flex-col justify-between group shadow"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center text-base text-white">
                      <i className="fa-brands fa-whatsapp"></i>
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-wider bg-white/20 text-white px-1.5 py-0.5 rounded">
                      GROUP
                    </span>
                  </div>
                  <div>
                    <span className="font-poppins font-black text-xs uppercase tracking-wide block leading-tight">
                      JOIN GROUP
                    </span>
                    <span className="text-[8.5px] font-bold text-white/90 block mt-0.5">Live Signals</span>
                  </div>
                </a>

                <a
                  href="https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-[#082013] via-[#0d2c20] to-[#164e33] text-white rounded-xl p-2.5 border border-[#c9f36a]/50 flex flex-col justify-between group shadow"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="w-7 h-7 rounded-lg bg-[#c9f36a]/20 border border-[#c9f36a]/40 flex items-center justify-center text-sm text-[#c9f36a]">
                      <i className="fa-solid fa-bullhorn"></i>
                    </div>
                    <span className="text-[7.5px] font-black uppercase tracking-wider bg-[#c9f36a]/20 text-[#c9f36a] px-1.5 py-0.5 rounded">
                      NEWS
                    </span>
                  </div>
                  <div>
                    <span className="font-poppins font-black text-xs uppercase tracking-wide block leading-tight text-[#c9f36a]">
                      JOIN CHANNEL
                    </span>
                    <span className="text-[8.5px] font-bold text-white/80 block mt-0.5">Admin Alerts</span>
                  </div>
                </a>
              </div>

              <button
                type="button"
                onClick={() => setIsCommunityModalOpen(false)}
                className="w-full py-2.5 text-center font-manrope font-black text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all uppercase tracking-wider cursor-pointer"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP 24/7 Live Support Chat & WhatsApp Modal */}
      <SupportChatModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </AppShell>
  );
}
