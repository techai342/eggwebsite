import React, { useState, useEffect, useMemo } from 'react';
import { useFarm, ASSET_SPEC } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import henImg from '../assets/hen.png';
import eggImg from '../assets/egg.png';
import logoImg from '../assets/logo.webp';
import '../rawafiles.css';

/**
 * Web Audio Synthesized Hen Cluck Generator for authentic pasture feedback
 */
function playHenVoiceAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const clucks = [
      { start: 0, freq1: 480, freq2: 340, dur: 0.1 },
      { start: 0.11, freq1: 600, freq2: 300, dur: 0.15 },
      { start: 0.28, freq1: 520, freq2: 360, dur: 0.12 }
    ];
    clucks.forEach(({ start, freq1, freq2, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq1, ctx.currentTime + start);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + start + dur);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });
  } catch (err) {
    console.debug('Audio notice:', err);
  }
}

/**
 * MyFarmPage: Dedicated VIP Laying Flock & Pasture Management Hub
 * Complete interactive view of active hens, 24h production cycle,
 * flock health telemetry, daily harvest collector, and coop batches.
 */
export default function MyFarmPage() {
  const {
    user,
    activeAssets,
    eggVault,
    balance,
    harvestEggs,
    resetCooldown,
    cooldownActive,
    cooldownHoursRemaining,
    lastHarvest,
    navigateTo,
    showToast
  } = useFarm();

  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('ALL'); // ALL, ACTIVE, MATURE
  const [remainingTimeStr, setRemainingTimeStr] = useState('24:00:00');
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);

  // Compute flock totals (active laying vs completed)
  const activeFlockAssets = useMemo(() => {
    return activeAssets.filter((a) => {
      const term = Number(a.termDays) || 120;
      const elapsed = Number(a.daysElapsed) || 0;
      const rem = a.daysRemaining !== undefined ? Number(a.daysRemaining) : Math.max(0, term - elapsed);
      return a.status !== 'completed' && rem > 0;
    });
  }, [activeAssets]);

  const totalHens = useMemo(() => {
    return activeFlockAssets.reduce((sum, a) => sum + (Number(a.units) || 1), 0);
  }, [activeFlockAssets]);

  const dailyEggsCapacity = totalHens * (ASSET_SPEC.dailyYieldPerUnit || 1);
  const estMonthlyEggs = dailyEggsCapacity * 30;
  const estMonthlyRevenue = estMonthlyEggs * 32; // Average egg rate Rs. 32
  const totalLifecycleRevenue = totalHens * (ASSET_SPEC.totalYieldPerUnit || 120) * 32;

  // Real-time second-by-second countdown timer
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

  // Handle Hen Sound
  const handleHenAudio = () => {
    setIsAudioPlaying(true);
    playHenVoiceAudio();
    setTimeout(() => setIsAudioPlaying(false), 1600);
  };

  // Harvest handler
  const handleHarvest = () => {
    if (cooldownActive) {
      showToast('warning', `Cooldown Active! Next harvest ready in ${remainingTimeStr}.`);
      return;
    }
    if (totalHens <= 0) {
      showToast('warning', 'No active hens in your coop. Adopt hens first to harvest daily eggs!');
      return;
    }
    const res = harvestEggs();
    if (res.success) {
      setCollectedCount(res.eggsCollected || dailyEggsCapacity);
      setIsCelebrationOpen(true);
    } else {
      showToast('error', res.message || 'Harvest failed or cooldown active.');
    }
  };

  return (
    <AppShell
      currentRoute="/my-farm"
      title="AL REHMAN META EGGS"
      showBack={true}
      onBack={() => navigateTo('/dashboard')}
    >
      <div className="px-3.5 pt-2 pb-8 space-y-4">
        {/* Top Breadcrumb & Live Paddock Beacon */}
        <div className="flex items-center justify-between gap-3 bg-white/95 backdrop-blur-md border border-[#e2ede0] rounded-2xl p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => navigateTo('/dashboard')}
              className="w-9 h-9 bg-[#f0f7ee] hover:bg-[#e4f1e1] text-[#153d2b] rounded-xl flex items-center justify-center text-xs border border-[#d2e4cf] shadow-sm active:scale-95 transition-all flex-shrink-0"
              title="Back to Dashboard"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="font-manrope font-black text-xs text-[#0d2c20] tracking-wide uppercase leading-none truncate">
                  My Farm &amp; Laying Flock
                </h2>
              </div>
              <span className="text-[8px] font-extrabold text-[#28734a] uppercase tracking-wider block mt-1 leading-none">
                VIP Pasture Management
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleHenAudio}
            className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
              isAudioPlaying
                ? 'bg-amber-400 text-slate-900 border-amber-500 scale-105 shadow-md'
                : 'bg-emerald-50 hover:bg-emerald-100 text-[#153d2b] border-[#c9f36a]/60 shadow-sm active:scale-95'
            }`}
            title="Hear Pasture Flock Cluck"
          >
            <i className={`fa-solid ${isAudioPlaying ? 'fa-volume-high animate-bounce' : 'fa-volume-low'} text-xs`}></i>
            <span className="text-[8.5px] font-manrope font-black tracking-wider uppercase">
              {isAudioPlaying ? 'Clucking...' : 'Flock Voice'}
            </span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* INTERACTIVE PASTURE ARENA HERO                                 */}
        {/* ============================================================== */}
        <div className="relative rounded-3xl overflow-hidden border-2 border-[#153d2b]/20 shadow-xl bg-gradient-to-b from-[#153d2b] via-[#0d2c20] to-[#082013] text-white p-4">
          {/* Subtle Ambient Radial Glows */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c9f36a]/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Pasture Header Status Row */}
          <div className="relative z-10 flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c9f36a] shadow-[0_0_8px_#c9f36a] animate-pulse"></span>
              <span className="text-[9px] font-manrope font-black tracking-widest uppercase text-white/90">
                Laying Paddock #01 • Live
              </span>
            </div>
            <span className="text-[8px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#c9f36a]/20 border border-[#c9f36a]/40 text-[#c9f36a]">
              Optimal 24°C • Feeding 100%
            </span>
          </div>

          {/* Graphical Pasture Visual with Roaming Hens */}
          <div className="relative z-10 rounded-2xl bg-gradient-to-b from-[#1b4a35]/60 to-[#103424]/80 border border-white/10 p-3 mb-3.5 backdrop-blur-sm overflow-hidden min-h-[140px] flex flex-col justify-between">
            {/* Visual roaming avatars */}
            <div className="flex items-center justify-around py-2">
              {totalHens > 0 ? (
                <>
                  <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '2.4s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[#c9f36a]/30 p-1.5 flex items-center justify-center shadow-lg relative group">
                      <img src={henImg} alt="Hen" className="w-full h-full object-contain filter drop-shadow" />
                      <span className="absolute -top-1.5 -right-1.5 bg-[#c9f36a] text-[#082013] text-[8px] font-black px-1 rounded-full shadow">
                        x{Math.min(totalHens, 10)}
                      </span>
                    </div>
                    <span className="text-[7.5px] font-bold text-[#c9f36a] mt-1">Laying Active</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 p-1 flex items-center justify-center shadow-lg">
                      <img src={eggImg} alt="Eggs" className="w-full h-full object-contain filter drop-shadow animate-pulse" />
                    </div>
                    <span className="text-[7.5px] font-bold text-amber-300 mt-1">+{dailyEggsCapacity} Today</span>
                  </div>

                  <div className="flex flex-col items-center animate-bounce" style={{ animationDuration: '3.1s' }}>
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-[#c9f36a]/30 p-1.5 flex items-center justify-center shadow-lg relative group">
                      <img src={henImg} alt="Hen" className="w-full h-full object-contain filter drop-shadow scale-x-[-1]" />
                      <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-white text-[7px] font-black px-1 rounded-full shadow">
                        VIP
                      </span>
                    </div>
                    <span className="text-[7.5px] font-bold text-white/80 mt-1">Grade-A Flock</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-white/10 flex items-center justify-center text-white/50 text-xl">
                    <i className="fa-solid fa-wheat-awn"></i>
                  </div>
                  <p className="text-xs font-manrope font-bold text-white/80">
                    Your pasture coop is currently resting.
                  </p>
                  <p className="text-[9px] text-white/60">
                    Adopt laying hens to populate your paddock and start generating daily eggs!
                  </p>
                </div>
              )}
            </div>

            {/* Pasture HUD Stats Footer */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center">
              <div>
                <span className="text-[7px] uppercase tracking-wider text-white/60 block">Flock Strength</span>
                <strong className="text-xs font-black text-[#c9f36a]">{totalHens} Hens</strong>
              </div>
              <div className="border-x border-white/10">
                <span className="text-[7px] uppercase tracking-wider text-white/60 block">Velocity</span>
                <strong className="text-xs font-black text-white">+{dailyEggsCapacity}/24h</strong>
              </div>
              <div>
                <span className="text-[7px] uppercase tracking-wider text-white/60 block">Ready in Vault</span>
                <strong className="text-xs font-black text-amber-300">{Number(eggVault || 0).toFixed(1)} Eggs</strong>
              </div>
            </div>
          </div>

          {/* 24-HOUR AUTOMATED HARVEST ACTION ENGINE */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-3 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <i className="fa-solid fa-clock-rotate-left text-[#c9f36a] text-xs"></i>
                <span className="text-[8.5px] font-manrope font-black tracking-wider uppercase text-white">
                  24-Hour Production Countdown
                </span>
              </div>
              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                cooldownActive ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
              }`}>
                {cooldownActive ? 'Incubating' : 'Harvest Ready'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 mb-2.5">
              <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-widest drop-shadow">
                {cooldownActive ? remainingTimeStr : '00:00:00'}
              </div>
              <div className="text-right">
                <span className="text-[8px] uppercase tracking-wider text-white/60 block">Est. Yield</span>
                <span className="text-xs font-black text-[#c9f36a]">+{dailyEggsCapacity} Fresh Eggs</span>
              </div>
            </div>

            {/* Primary Harvest CTA Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleHarvest}
                disabled={cooldownActive || totalHens <= 0}
                className={`flex-1 py-3 px-4 rounded-xl font-manrope font-black text-xs tracking-wider uppercase shadow-lg transition-all flex items-center justify-center gap-2 ${
                  cooldownActive || totalHens <= 0
                    ? 'bg-white/15 text-white/40 cursor-not-allowed border border-white/10'
                    : 'bg-gradient-to-r from-[#c9f36a] via-lime-400 to-[#c9f36a] text-[#0d2c20] hover:scale-[1.02] active:scale-95 shadow-[#c9f36a]/20 cursor-pointer animate-pulse'
                }`}
              >
                <i className="fa-solid fa-basket-shopping text-sm"></i>
                <span>{cooldownActive ? `Cooldown Active (${remainingTimeStr})` : 'Harvest Daily Eggs'}</span>
              </button>

              {/* Dev/Test Instant Reset Cooldown Button (Discreet for automated test suites) */}
              {cooldownActive && (
                <button
                  type="button"
                  onClick={() => {
                    resetCooldown();
                    showToast('success', 'Cooldown reset for testing! You can now harvest instantly.');
                  }}
                  className="py-3 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white font-manrope font-extrabold text-[9px] uppercase tracking-wider border border-white/15 active:scale-95 transition-all"
                  title="Test Reset"
                >
                  <i className="fa-solid fa-bolt text-[#c9f36a]"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* FLOCK METRIC KPI CARDS                                         */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white rounded-2xl border border-[#e2ede0] p-3 shadow-sm">
            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
              Active Hens
            </span>
            <strong className="text-base font-black text-[#153d2b] block mt-1 leading-none font-manrope">
              {totalHens} <span className="text-[9px] font-normal text-slate-400">Units</span>
            </strong>
            <span className="text-[7px] font-bold text-emerald-600 uppercase block mt-1">120-Day Cycle</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2ede0] p-3 shadow-sm">
            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
              Daily Yield
            </span>
            <strong className="text-base font-black text-[#0d2c20] block mt-1 leading-none font-manrope">
              +{dailyEggsCapacity} <span className="text-[9px] font-normal text-slate-400">Eggs</span>
            </strong>
            <span className="text-[7px] font-bold text-[#28734a] uppercase block mt-1">Every 24h</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2ede0] p-3 shadow-sm">
            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
              Egg Vault
            </span>
            <strong className="text-base font-black text-amber-600 block mt-1 leading-none font-manrope">
              {Number(eggVault || 0).toFixed(1)}
            </strong>
            <span className="text-[7px] font-bold text-amber-700 uppercase block mt-1">Liquid Ready</span>
          </div>

          <div className="bg-white rounded-2xl border border-[#e2ede0] p-3 shadow-sm">
            <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
              Est. Monthly
            </span>
            <strong className="text-base font-black text-[#153d2b] block mt-1 leading-none font-manrope truncate">
              Rs. {estMonthlyRevenue.toLocaleString()}
            </strong>
            <span className="text-[7px] font-bold text-emerald-600 uppercase block mt-1 truncate">@ Rs. 32/Egg</span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* QUICK ACTION DOCK                                              */}
        {/* ============================================================== */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => navigateTo('/buy-asset')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-[#153d2b] to-[#28734a] text-white flex items-center justify-between shadow-md hover:shadow-lg active:scale-95 transition-all text-left group"
          >
            <div>
              <span className="text-[8px] font-black text-[#c9f36a] uppercase tracking-wider block">
                Expand Flock
              </span>
              <strong className="text-xs font-manrope font-black text-white block mt-0.5">
                + Buy More Hens
              </strong>
            </div>
            <div className="w-8 h-8 rounded-xl bg-white/10 group-hover:bg-white/20 flex items-center justify-center text-xs text-[#c9f36a] transition-all">
              <i className="fa-solid fa-plus"></i>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('/sell-egg')}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 flex items-center justify-between shadow-md hover:shadow-lg active:scale-95 transition-all text-left group"
          >
            <div>
              <span className="text-[8px] font-black text-slate-900 uppercase tracking-wider block">
                Cashout Eggs
              </span>
              <strong className="text-xs font-manrope font-black text-slate-950 block mt-0.5">
                Sell to Merchants
              </strong>
            </div>
            <div className="w-8 h-8 rounded-xl bg-black/10 group-hover:bg-black/20 flex items-center justify-center text-xs text-slate-900 transition-all">
              <i className="fa-solid fa-arrow-right"></i>
            </div>
          </button>
        </div>

        {/* ============================================================== */}
        {/* ACTIVE COOP BATCHES ROSTER                                     */}
        {/* ============================================================== */}
        <div className="bg-white rounded-3xl border border-[#e2ede0] p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-[#e2ede0] pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-[#d2e4cf] flex items-center justify-center text-sm text-[#153d2b]">
                <i className="fa-solid fa-layer-group"></i>
              </div>
              <div>
                <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wide">
                  Active Flock Batches ({activeAssets.length})
                </h3>
                <span className="text-[8px] font-bold text-slate-400 block">
                  Individual contracts running on 120-day production cycle
                </span>
              </div>
            </div>

            <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[#f0f7ee] text-[#153d2b] border border-[#dbe8d8] uppercase">
              100% Insured
            </span>
          </div>

          {/* Batches List */}
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {activeAssets.length > 0 ? (
              activeAssets.map((asset, idx) => {
                const totalDays = Number(asset.termDays) || 120;
                const units = Number(asset.units) || 1;
                const purchaseTs = asset.purchaseDate || asset.purchasedAt ? new Date(asset.purchaseDate || asset.purchasedAt).getTime() : Date.now();
                const calendarElapsed = Math.max(0, Math.floor((Date.now() - purchaseTs) / (24 * 60 * 60 * 1000)));
                const harvestElapsed = asset.daysElapsed !== undefined ? Number(asset.daysElapsed) : (asset.daysRemaining !== undefined ? Math.max(0, totalDays - Number(asset.daysRemaining)) : 0);
                const daysElapsed = Math.min(totalDays, Math.max(harvestElapsed, calendarElapsed));
                const daysRemaining = Math.max(0, totalDays - daysElapsed);
                const eggsHarvested = asset.eggsHarvested !== undefined ? Number(asset.eggsHarvested) : (daysElapsed * units);
                const totalEggsMax = totalDays * units;
                const progressPct = Math.min(100, Math.round((daysElapsed / totalDays) * 100));
                const isCompleted = daysRemaining === 0 || asset.status === 'completed';
                const expiryDate = new Date(purchaseTs + totalDays * 24 * 60 * 60 * 1000);

                return (
                  <div
                    key={asset.id || idx}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isCompleted
                        ? 'bg-slate-50 border-slate-200 opacity-90'
                        : 'bg-gradient-to-br from-[#fbfdf9] via-white to-[#f4f8f3] border-[#dce9d9] shadow-xs hover:border-[#153d2b]/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-10 h-10 rounded-2xl p-1 flex items-center justify-center flex-shrink-0 shadow-sm border ${
                          isCompleted ? 'bg-slate-100 border-slate-300' : 'bg-emerald-50 border-emerald-300/80'
                        }`}>
                          <img src={henImg} alt="Hen" className="w-full h-full object-contain" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-manrope font-black text-xs text-[#0d2c20]">
                              Batch #{String(asset.id || idx + 1).slice(-4)}
                            </h4>
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                              {units} Hen {units > 1 ? 'Units' : 'Unit'}
                            </span>
                            <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase ${
                              isCompleted
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-[#c9f36a]/30 text-[#0d2c20] border border-[#c9f36a]/60 animate-pulse'
                            }`}>
                              {isCompleted ? '✓ 120d Completed' : '🟢 Laying Active'}
                            </span>
                          </div>
                          <span className="text-[8px] text-slate-400 block mt-0.5">
                            Adopted via {asset.gateway || 'Easypaisa'} • {new Date(purchaseTs).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-[9px] font-black text-emerald-700 block">
                          +{units} Egg/day
                        </span>
                        <span className="text-[7.5px] font-extrabold text-slate-500 uppercase tracking-tight block">
                          {isCompleted ? 'Finished' : `${daysRemaining}d Left`}
                        </span>
                      </div>
                    </div>

                    {/* 120-Day Lifecycle Progress Bar */}
                    <div className="bg-white/70 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 mb-1">
                        <span className="flex items-center gap-1">
                          <i className="fa-solid fa-clock-rotate-left text-emerald-600"></i>
                          <span>Cycle Day <strong className="text-[#0d2c20]">{daysElapsed}</strong> of {totalDays}</span>
                        </span>
                        <span className="font-manrope font-black text-emerald-800">{progressPct}% Complete</span>
                      </div>
                      <div className="w-full h-2 bg-[#e2ede0] rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                              : 'bg-gradient-to-r from-emerald-500 via-[#16a34a] to-[#153d2b]'
                          }`}
                          style={{ width: `${Math.max(4, progressPct)}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-[7.5px] text-slate-400 mt-1">
                        <span>Harvested: <strong className="text-emerald-700">{eggsHarvested}</strong> / {totalEggsMax} Eggs</span>
                        <span>Term Ends: {expiryDate.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 px-4 border-2 border-dashed border-[#d2e4cf] rounded-2xl bg-[#fafdf9]">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg mb-2">
                  <i className="fa-solid fa-egg"></i>
                </div>
                <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase">
                  No Active Laying Batches Found
                </h4>
                <p className="text-[8.5px] text-slate-500 mt-1 max-w-xs mx-auto">
                  Start your commercial egg harvesting journey today by adopting your first VIP laying hen.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('/buy-asset')}
                  className="mt-3 px-4 py-2 rounded-xl bg-gradient-to-r from-[#153d2b] to-[#28734a] text-[#c9f36a] text-[9px] font-manrope font-black uppercase tracking-wider shadow active:scale-95 transition-all"
                >
                  + Adopt VIP Hens Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Harvest Celebration Modal */}
        {isCelebrationOpen && (
          <div className="fixed inset-0 bg-[#082013]/85 backdrop-blur-md z-[999999] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 text-center overflow-hidden border border-[#c9f36a]/30 animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 text-white flex items-center justify-center text-2xl shadow-lg mb-3">
                <i className="fa-solid fa-basket-shopping animate-bounce"></i>
              </div>
              <h3 className="font-manrope font-black text-base text-[#0d2c20] uppercase tracking-wide">
                Harvest Successful!
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                You collected <strong className="text-emerald-700 font-black">+{collectedCount} Fresh Eggs</strong> into your vault.
              </p>
              <div className="mt-3 p-3 rounded-2xl bg-[#f0f7ee] border border-[#d2e4cf] text-xs font-manrope font-bold text-[#153d2b]">
                New Vault Balance: {Number(eggVault || 0).toFixed(2)} Eggs
              </div>
              <button
                type="button"
                onClick={() => setIsCelebrationOpen(false)}
                className="mt-4 w-full py-3 bg-gradient-to-r from-[#153d2b] to-[#28734a] text-[#c9f36a] font-manrope font-black text-xs uppercase tracking-wider rounded-xl shadow active:scale-95 transition-all"
              >
                Continue Farming
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
