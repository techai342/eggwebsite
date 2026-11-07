import React, { useState } from 'react';
import { useFarm, PAYMENT_GATEWAYS, ASSET_SPEC } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import { uploadToImageKit } from '../services/imagekit';
import henImg from '../assets/hen.png';
import easypisaImg from '../assets/easypisa.png';
import jazzcashImg from '../assets/jazzcash.png';
import '../rawafiles.css';

/**
 * Web Audio Synthesized Hen Cluck Generator
 * Generates an authentic rural pasture cluck tone without requiring external audio assets.
 */
function playHenVoiceAudio() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Sequence of 2 rapid melodic clucks
    const clucks = [
      { start: 0, freq1: 460, freq2: 320, dur: 0.11 },
      { start: 0.12, freq1: 580, freq2: 290, dur: 0.16 }
    ];

    clucks.forEach(({ start, freq1, freq2, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq1, ctx.currentTime + start);
      osc.frequency.exponentialRampToValueAtTime(freq2, ctx.currentTime + start + dur);

      gain.gain.setValueAtTime(0.25, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });
  } catch (err) {
    console.debug('Audio context notice:', err);
  }
}

export default function BuyAssetPage() {
  const {
    buyFarmAsset,
    submitDepositRequest,
    navigateTo,
    showToast,
    platformSettings,
    user,
    getWhatsAppSupportUrl,
    depositRequests = [],
    syncWithSupabase,
    isLiveSyncing
  } = useFarm();

  // Wizard state: Step 1 (Showcase), Step 2 (Multiplier), Step 3 (Payment)
  const [currentStep, setCurrentStep] = useState(1);
  const [units, setUnits] = useState(1);
  const [selectedGatewayCode, setSelectedGatewayCode] = useState(PAYMENT_GATEWAYS[0]?.code || '1000');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Manual payment submission state
  const [senderAccountTitle, setSenderAccountTitle] = useState('');
  const [senderAccountNumber, setSenderAccountNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [depositSubmitted, setDepositSubmitted] = useState(false);
  const [submittedDepositDetails, setSubmittedDepositDetails] = useState(null);

  // User's persistent deposit requests & orders across refresh
  const myDeposits = useMemo(() => {
    if (!Array.isArray(depositRequests)) return [];
    return depositRequests.filter((d) => {
      return (
        (user?.id && String(d.userId) === String(user.id)) ||
        (user?.accountId && String(d.userId) === String(user.accountId)) ||
        (user?.username && String(d.username).toLowerCase() === String(user.username).toLowerCase())
      );
    });
  }, [depositRequests, user]);

  // Payment Proof Screenshot state (ImageKit CDN integration)
  const [proofScreenshot, setProofScreenshot] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [isUploadingProof, setIsUploadingProof] = useState(false);

  const handleProofFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Image size must be less than 5 MB.');
      return;
    }

    // Local preview for instant responsive feedback
    const localUrl = URL.createObjectURL(file);
    setProofPreview(localUrl);
    setProofFileName(file.name);
    setIsUploadingProof(true);

    try {
      showToast('info', 'Uploading screenshot to ImageKit Cloud CDN...');
      const uploadRes = await uploadToImageKit(
        file,
        `receipt_${user?.username || 'farmer'}_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
      );

      if (uploadRes.success && uploadRes.url) {
        setProofScreenshot(uploadRes.url);
        showToast('success', 'Screenshot converted to ImageKit CDN URL successfully!');
      } else {
        showToast('error', uploadRes.error || 'Failed to upload screenshot.');
        setProofPreview('');
        setProofFileName('');
      }
    } catch (err) {
      showToast('error', err?.message || 'Error uploading receipt.');
      setProofPreview('');
      setProofFileName('');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleRemoveProof = () => {
    setProofScreenshot('');
    setProofPreview('');
    setProofFileName('');
  };

  // Dynamic economic calculations
  const unitPrice = Number(platformSettings?.henUnitPrice || ASSET_SPEC.unitPrice); // Dynamic Hen Price
  const dailyPerUnit = Number(platformSettings?.dailyEggYield || ASSET_SPEC.dailyYieldPerUnit); // Dynamic Daily Yield
  const contractTermDays = Number(platformSettings?.contractDurationDays || ASSET_SPEC.termDays); // Dynamic Contract Term
  const totalYieldPerUnit = dailyPerUnit * contractTermDays;
  const totalCost = units * unitPrice;
  const projDaily = units * dailyPerUnit;
  const projMonthly = units * dailyPerUnit * 30;
  const projFullTerm = units * totalYieldPerUnit;

  // Selected gateway object
  const selectedGateway = PAYMENT_GATEWAYS.find((g) => g.code === selectedGatewayCode) || PAYMENT_GATEWAYS[0];

  // Dynamic Gateway Details from Super Admin Platform Settings
  const gwKey = selectedGateway?.name?.toLowerCase().includes('jazz') ? 'jazzcash' : 'easypisa';
  const gwConfig = platformSettings?.depositGateways?.[gwKey] ||
                   platformSettings?.depositGateways?.[gwKey === 'easypisa' ? 'easypaisa' : 'jazzcash'] ||
                   {};

  const activeAccountTitle = gwConfig.accountTitle || gwConfig.title || 'AL Rehman Meta Eggs';
  const activeAccountNumber = gwConfig.accountNumber || gwConfig.number || (gwKey === 'jazzcash' ? '03001234567' : '03412017923');
  const activeInstructions = gwConfig.instructions || '';

  // Step change with smooth scroll
  const goToStep = (step) => {
    setCurrentStep(step);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Adjust quantity via +/- stepper
  const adjustQty = (delta) => {
    const next = Math.max(1, Math.min(1000, Number(units) + delta));
    setUnits(next);
  };

  // Set quantity from quick presets
  const handlePreset = (presetVal) => {
    setUnits(presetVal);
  };

  // Audio voice trigger
  const handleHenAudio = () => {
    setIsAudioPlaying(true);
    playHenVoiceAudio();
    setTimeout(() => {
      setIsAudioPlaying(false);
    }, 1800);
  };

  // Copy helper with feedback
  const handleCopy = (text, fieldName) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedField(fieldName);
    showToast('info', `${fieldName} copied to clipboard!`);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Manual payment submission handler
  const handleSubmitDeposit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedGateway) {
      showToast('error', 'Please select a valid payment gateway.');
      return;
    }
    if (!transactionId || !transactionId.trim()) {
      showToast('error', 'Please enter your Transaction ID (TID / Ref No).');
      return;
    }
    if (!senderAccountNumber || !senderAccountNumber.trim()) {
      showToast('error', 'Please enter your sender mobile / account number.');
      return;
    }

    if (isUploadingProof) {
      showToast('info', 'Please wait! Payment screenshot is currently uploading to ImageKit Cloud CDN...');
      return;
    }

    if (!proofScreenshot && !proofPreview) {
      showToast('error', 'Payment screenshot / receipt is required! Please attach your receipt before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitDepositRequest({
        units: Number(units),
        gateway: selectedGateway.name,
        methodCode: selectedGateway.code,
        senderAccountTitle: senderAccountTitle.trim() || user?.name || user?.username || 'Farmer',
        senderAccountNumber: senderAccountNumber.trim(),
        transactionId: transactionId.trim(),
        proofScreenshot: proofScreenshot || null
      });

      setIsSubmitting(false);
      if (res?.success) {
        setSubmittedDepositDetails(res.deposit);
        setDepositSubmitted(true);
      }
    } catch (err) {
      setIsSubmitting(false);
      showToast('error', err?.message || 'Failed to submit deposit request.');
    }
  };

  // Instant direct purchase (Demo / Fallback / Tests)
  const handleConfirmPurchase = (e) => {
    e.preventDefault();
    if (!selectedGateway) {
      showToast('error', 'Please select a valid payment gateway to complete checkout.');
      return;
    }

    setIsSubmitting(true);
    const res = buyFarmAsset({
      units: Number(units),
      gateway: selectedGateway.name,
      methodCode: selectedGateway.code
    });

    setIsSubmitting(false);
    if (res.success) {
      navigateTo('/dashboard');
    }
  };

  return (
    <AppShell
      currentRoute="/buy-asset"
      title="AL REHMAN META EGGS"
      showBack={true}
      onBack={() => {
        if (currentStep > 1) {
          goToStep(currentStep - 1);
        } else {
          navigateTo('/dashboard');
        }
      }}
    >
      <div className="px-3.5 pt-2 pb-6 space-y-3.5">
        {/* Top Breadcrumb & Asset Badge Panel */}
        <div className="flex items-center justify-between gap-3 bg-white/90 backdrop-blur-md border border-[#e2ede0] rounded-2xl p-2.5 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (currentStep > 1) goToStep(currentStep - 1);
                else navigateTo('/dashboard');
              }}
              className="w-9 h-9 bg-[#f0f7ee] hover:bg-[#e4f1e1] text-[#153d2b] rounded-xl flex items-center justify-center text-xs border border-[#d2e4cf] shadow-sm active:scale-95 transition-all flex-shrink-0"
              title="Back"
              aria-label="Back"
            >
              <i className="fas fa-arrow-left"></i>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <h2 className="font-manrope font-black text-xs text-[#0d2c20] tracking-wide uppercase leading-none truncate">
                  Buy VIP Asset &amp; Plan
                </h2>
              </div>
              <span className="text-[8px] font-extrabold text-[#28734a] uppercase tracking-wider block mt-1 leading-none">
                Automated 24h Yield Engine
              </span>
            </div>
          </div>

          {/* Instant Activation Chip */}
          <div className="flex-shrink-0 bg-gradient-to-r from-[#153d2b] to-[#0d2c20] text-white px-2.5 py-1.5 rounded-xl border border-[#c9f36a]/30 shadow-sm flex items-center gap-1.5">
            <i className="fa-solid fa-bolt-lightning text-[#c9f36a] text-[10px] animate-pulse"></i>
            <span className="text-[8.5px] font-manrope font-black tracking-wider text-white">
              Instant Live
            </span>
          </div>
        </div>

        {/* VIP ANIMATED 3-STEP PROGRESS STEPPER HUD */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#e2ede0] p-3 shadow-sm">
          {/* Dynamic Active Step Title Banner */}
          <div className="text-center mb-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#153d2b] to-[#0d2c20] text-[#c9f36a] border border-[#c9f36a]/30 text-[8.5px] font-manrope font-black uppercase tracking-wider shadow-sm transition-all">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c9f36a] animate-ping"></span>
              <span>
                {currentStep === 1 && 'Step 1: Showcase & Overview'}
                {currentStep === 2 && 'Step 2: Customize Flock Multiplier'}
                {currentStep === 3 && 'Step 3: Payment Gateway Checkout'}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between relative px-2">
            {/* Progress Connecting Track with Animated Neon Shimmer Flow */}
            <div className="absolute left-8 right-8 top-[18px] h-1.5 bg-[#e8efe6] z-0 rounded-full overflow-hidden">
              <div
                className="h-full stepper-track-beam transition-all duration-500 rounded-full shadow-xs"
                style={{
                  width: currentStep === 1 ? '15%' : currentStep === 2 ? '55%' : '100%'
                }}
              ></div>
            </div>

            {/* Step 1 Node */}
            <div
              className="relative z-10 flex flex-col items-center cursor-pointer"
              onClick={() => goToStep(1)}
            >
              <div
                className={`w-9 h-9 rounded-full border-2 shadow-md flex items-center justify-center text-xs font-manrope font-black transition-all ${
                  currentStep === 1
                    ? 'bg-[#153d2b] text-[#c9f36a] border-white step-node-active'
                    : 'bg-[#153d2b] text-[#c9f36a] border-white'
                }`}
              >
                <i className={`text-[11px] ${currentStep > 1 ? 'fa-solid fa-check' : 'fa-solid fa-gem'}`}></i>
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-[#153d2b] mt-1.5">
                Showcase
              </span>
            </div>

            {/* Step 2 Node */}
            <div
              className="relative z-10 flex flex-col items-center cursor-pointer"
              onClick={() => goToStep(2)}
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center text-xs font-manrope font-black ${
                  currentStep === 2
                    ? 'bg-[#153d2b] text-[#c9f36a] border-white shadow-md step-node-active'
                    : currentStep > 2
                    ? 'bg-[#153d2b] text-[#c9f36a] border-white shadow-md'
                    : 'bg-white text-slate-400 border-slate-200 shadow-sm'
                }`}
              >
                <i className={`text-[11px] ${currentStep > 2 ? 'fa-solid fa-check' : 'fa-solid fa-layer-group'}`}></i>
              </div>
              <span
                className={`text-[8px] uppercase tracking-wider mt-1.5 ${
                  currentStep >= 2 ? 'text-[#153d2b] font-black' : 'text-slate-400 font-bold'
                }`}
              >
                Multiplier
              </span>
            </div>

            {/* Step 3 Node */}
            <div
              className="relative z-10 flex flex-col items-center cursor-pointer"
              onClick={() => goToStep(3)}
            >
              <div
                className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center text-xs font-manrope font-black ${
                  currentStep === 3
                    ? 'bg-[#153d2b] text-[#c9f36a] border-white shadow-md step-node-active'
                    : 'bg-white text-slate-400 border-slate-200 shadow-sm'
                }`}
              >
                <i className="fa-solid fa-shield-halved text-[11px]"></i>
              </div>
              <span
                className={`text-[8px] uppercase tracking-wider mt-1.5 ${
                  currentStep === 3 ? 'text-[#153d2b] font-black' : 'text-slate-400 font-bold'
                }`}
              >
                Payment
              </span>
            </div>
          </div>
        </div>

        {/* =============================================================== */}
        {/* STEP 1: ASSET SHOWCASE ARENA & DETAILS                          */}
        {/* =============================================================== */}
        {currentStep === 1 && (
          <div className="space-y-3.5 step-pane-active">
            {/* 3D HERO ASSET SHOWCASE */}
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#061a0f] via-[#0d2c20] to-[#153d2b] p-4 pt-5 pb-5 text-white shadow-2xl border border-[#1e523a] text-center">
              {/* Ambient Glow Orbs */}
              <div className="absolute -right-12 -top-12 w-44 h-44 bg-[#c9f36a]/20 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute -left-12 -bottom-12 w-44 h-44 bg-[#f59e0b]/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Top Sub-Header & Live Audio Cluck Trigger */}
              <div className="flex items-center justify-between relative z-10 mb-2 px-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#c9f36a]/15 border border-[#c9f36a]/35 text-[#c9f36a] text-[8px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c9f36a] animate-ping"></span>
                  GEN-3 High Yield Livestock
                </span>

                <button
                  type="button"
                  onClick={handleHenAudio}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[#c9f36a] text-[8px] font-black uppercase tracking-wider transition-all active:scale-95"
                  title="Listen to farm hen sound"
                >
                  <i className={`fa-solid fa-volume-high text-[9px] ${isAudioPlaying ? 'fa-beat text-[#fbbf24]' : ''}`}></i>
                  <span>Voice</span>
                </button>
              </div>

              {/* Title Banner */}
              <div className="relative z-10 mb-3">
                <h2 className="font-manrope font-black text-xl text-white tracking-wide uppercase leading-tight">
                  AL REHMAN META EGGS
                </h2>
                <p className="text-[8.5px] font-medium text-emerald-200/80 uppercase tracking-widest mt-0.5">
                  Automated Daily Passive Yield Protocol
                </p>
              </div>

              {/* The 3D Rotating Orbit Arena */}
              <div className="relative w-44 h-44 mx-auto my-1 flex items-center justify-center">
                {/* Celestial Orbit Ring */}
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#c9f36a]/35 animate-orbit-ring">
                  {/* Orbiting Sparkle Star 1 */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#c9f36a] shadow-[0_0_12px_#c9f36a] flex items-center justify-center text-[7px] text-[#0d2c20]">
                    <i className="fa-solid fa-star"></i>
                  </div>
                  {/* Orbiting Sparkle Star 2 */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 rounded-full bg-[#f59e0b] shadow-[0_0_10px_#f59e0b] flex items-center justify-center text-[6px] text-white">
                    <i className="fa-solid fa-egg"></i>
                  </div>
                </div>

                {/* Ambient Glow Core Behind Hen */}
                <div className="absolute w-32 h-32 rounded-full bg-gradient-to-tr from-[#1b5037] via-[#28734a] to-[#c9f36a]/30 blur-md opacity-75"></div>

                {/* Inner Circular Pod */}
                <div className="relative w-32 h-32 rounded-full bg-gradient-to-b from-[#153d2b] to-[#0a2316] border-2 border-[#c9f36a]/60 shadow-inner flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={henImg}
                    className="w-24 h-24 object-contain filter drop-shadow-[0_12px_16px_rgba(0,0,0,0.5)] animate-float"
                    alt="AL Rehman Meta Eggs"
                  />
                </div>

                {/* Floating Daily Badge Left */}
                <div
                  className="absolute -left-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-float"
                  style={{ animationDelay: '1.5s' }}
                >
                  <span className="text-xs">🎁</span>
                  <div className="text-left">
                    <span className="text-[6.5px] font-bold text-slate-300 uppercase block leading-none">Daily</span>
                    <span className="text-[9px] font-black font-manrope text-[#c9f36a] block leading-none mt-0.5">
                      +{dailyPerUnit} Egg
                    </span>
                  </div>
                </div>

                {/* Floating Contract Badge Right */}
                <div
                  className="absolute -right-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md border border-white/20 text-white px-2 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-float"
                  style={{ animationDelay: '2.5s' }}
                >
                  <span className="text-xs">⏳</span>
                  <div className="text-left">
                    <span className="text-[6.5px] font-bold text-slate-300 uppercase block leading-none">Term</span>
                    <span className="text-[9px] font-black font-manrope text-[#fbbf24] block leading-none mt-0.5">
                      {contractTermDays} Days
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit Cost & Yield Summary Strip */}
              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between px-2">
                <div className="text-left">
                  <span className="block text-[7.5px] font-bold uppercase tracking-widest text-emerald-200/70">
                    Plan Unit Cost
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <strong className="font-manrope font-black text-lg text-white">
                      Rs. {unitPrice}
                    </strong>
                    <span className="text-[8px] font-bold text-[#c9f36a] uppercase">/ Unit</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block text-[7.5px] font-bold uppercase tracking-widest text-emerald-200/70">
                    Total Returns
                  </span>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-[#c9f36a]/20 border border-[#c9f36a]/40 text-[#c9f36a] text-[8.5px] font-black font-manrope">
                    {totalYieldPerUnit} Total Eggs
                  </span>
                </div>
              </div>
            </div>

            {/* 2 Mini Highlight Feature Tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="farm-card-3d p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#153d2b] flex items-center justify-center text-xs flex-shrink-0">
                  <i className="fa-solid fa-egg text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[7.5px] font-extrabold uppercase text-slate-400 block leading-none">Daily Profit</span>
                  <strong className="font-manrope font-black text-xs text-[#0d2c20] block mt-1 leading-none">
                    Instant Harvest
                  </strong>
                </div>
              </div>

              <div className="farm-card-3d p-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-xs flex-shrink-0">
                  <i className="fa-solid fa-coins text-sm"></i>
                </div>
                <div className="min-w-0">
                  <span className="text-[7.5px] font-extrabold uppercase text-slate-400 block leading-none">Market Sale</span>
                  <strong className="font-manrope font-black text-xs text-[#0d2c20] block mt-1 leading-none">
                    Instant Cash
                  </strong>
                </div>
              </div>
            </div>

            {/* STEP 1 PRIMARY CTA: BUY PLAN NOW */}
            <button
              type="button"
              onClick={() => goToStep(2)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#153d2b] via-[#28734a] to-[#153d2b] text-[#c9f36a] font-manrope font-black text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 group shimmer-active"
            >
              <span>Buy Plan Now (Rs. {unitPrice})</span>
              <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
            </button>

            {/* VIP Farm Guarantees */}
            <div className="bg-white/90 backdrop-blur-sm rounded-[24px] border border-[#e2ede0] p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-[#153d2b] flex items-center justify-center text-xs">
                  <i className="fa-solid fa-shield-check"></i>
                </span>
                <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider">
                  VIP Farm Guarantees
                </h4>
              </div>
              <div className="space-y-2 text-[8px] font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>100% Automated Harvest engine with 24-hour cycle</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Guaranteed active contract for full {contractTermDays} days</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  <span>Instant withdrawable PKR liquidity via direct market sale</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP 2: QUANTITY MULTIPLIER & LIVE YIELD SIMULATOR              */}
        {/* =============================================================== */}
        {currentStep === 2 && (
          <div className="space-y-3.5 step-pane-active">
            {/* Back Navigation to Step 1 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="inline-flex items-center gap-1.5 text-[8.5px] font-manrope font-black uppercase tracking-wider text-slate-500 hover:text-[#153d2b] transition-all py-1"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
                <span>Back to Showcase</span>
              </button>
              <span className="text-[8px] font-extrabold text-[#28734a] bg-emerald-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Step 2 of 3
              </span>
            </div>

            {/* Selected Asset Mini Badge */}
            <div className="farm-card-3d p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#153d2b] to-[#0a2316] border border-[#c9f36a]/50 flex items-center justify-center flex-shrink-0 p-1 shadow-sm">
                <img src={henImg} className="w-full h-full object-contain" alt="AL Rehman Meta Eggs" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-manrope font-black text-xs text-[#0d2c20] uppercase truncate">
                  AL REHMAN META EGGS
                </h4>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                  Unit Price: <strong className="text-[#153d2b]">Rs. {unitPrice}</strong>
                </span>
              </div>
              <span className="px-2 py-1 rounded-xl bg-emerald-100 text-[#153d2b] text-[8px] font-black uppercase">
                Selected
              </span>
            </div>

            {/* LIVE DYNAMIC HEN FLOCK PASTURE ARENA */}
            <div className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#f2faf0] via-[#ffffff] to-[#e8f5e6] border-2 border-[#b5dbb1] p-3.5 shadow-sm text-center">
              {/* Top Pasture HUD Bar */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[8.5px] font-manrope font-black text-[#153d2b] uppercase tracking-wider">
                    Live Flock in Coop
                  </span>
                </div>
                <span className="text-[8px] font-manrope font-black uppercase tracking-wider text-[#153d2b] bg-white border border-[#c4e3c0] px-2.5 py-0.5 rounded-full shadow-2xs">
                  {units} AL Rehman Meta Eggs in Flock
                </span>
              </div>

              {/* Dynamic Animated Flock Container */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 py-1.5 min-h-[76px]">
                {Array.from({ length: Math.min(units, 5) }).map((_, idx) => (
                  <div
                    key={`hen-${idx}`}
                    className="flock-hen-item relative flex flex-col items-center animate-pop-in"
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <div
                      className="relative w-12 h-12 rounded-2xl bg-gradient-to-b from-white to-[#edf7ec] border-2 border-[#a8dba2] p-1 shadow-md flex items-center justify-center animate-float"
                      style={{ animationDuration: `${3.5 + idx * 0.35}s` }}
                    >
                      <img src={henImg} className="w-full h-full object-contain filter drop-shadow-sm" alt="Hen" />
                      <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 px-1 rounded-full bg-[#153d2b] text-[#c9f36a] text-[7.5px] font-manrope font-black flex items-center justify-center shadow-xs">
                        #{idx + 1}
                      </span>
                    </div>
                    <span className="text-[7.5px] font-extrabold text-[#153d2b] mt-1 font-manrope leading-none">
                      +{dailyPerUnit} Egg
                    </span>
                  </div>
                ))}

                {units > 5 && (
                  <div
                    className="flock-surplus-item relative flex flex-col items-center animate-pop-in"
                    style={{ animationDelay: '0.35s' }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#153d2b] via-[#28734a] to-[#153d2b] border-2 border-[#c9f36a] p-1 shadow-md flex flex-col items-center justify-center text-white animate-float"
                      style={{ animationDuration: '4.2s' }}
                    >
                      <span className="font-manrope font-black text-xs text-[#c9f36a] leading-none">
                        +{units - 5}
                      </span>
                      <span className="text-[6.5px] font-extrabold text-white uppercase tracking-tighter block mt-0.5 leading-none">
                        More
                      </span>
                    </div>
                    <span className="text-[7.5px] font-black text-[#28734a] mt-1 font-manrope leading-none">
                      Active
                    </span>
                  </div>
                )}
              </div>

              {/* Flock Footer Guarantee Note */}
              <div className="mt-1 pt-2 border-t border-[#d8edd6] flex items-center justify-between text-[7.5px] font-extrabold uppercase tracking-wider text-slate-400 px-1">
                <span>Combined Livestock Power</span>
                <span className="text-emerald-700 font-black">
                  <i className="fa-solid fa-sparkles text-amber-500 mr-1"></i>
                  Synchronized Harvest
                </span>
              </div>
            </div>

            {/* Custom Stepper Multiplier HUD */}
            <div className="farm-card-3d p-4">
              <div className="text-center mb-3">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block">
                  Select Units Multiplier
                </span>
                <h3 className="font-manrope font-black text-sm text-[#0d2c20] uppercase tracking-tight mt-0.5">
                  How many units would you like?
                </h3>
              </div>

              {/* Tactile Incrementor */}
              <div className="flex items-center justify-between bg-[#f8faf7] border border-[#e2ede0] rounded-2xl p-2 mb-3">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="w-12 h-12 bg-white hover:bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center text-sm font-black border border-[#d6e5d3] shadow-sm active:scale-90 transition-all outline-none"
                  aria-label="Decrease units"
                >
                  <i className="fa-solid fa-minus"></i>
                </button>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="number"
                      value={units}
                      min="1"
                      max="1000"
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val)) {
                          setUnits(Math.max(1, Math.min(1000, val)));
                        }
                      }}
                      className="bg-transparent border-none text-center text-[#0d2c20] font-manrope font-black text-2xl w-24 outline-none p-0 focus:ring-0"
                    />
                    <span className="font-manrope font-extrabold text-xs text-slate-400 uppercase">Units</span>
                  </div>
                  <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-widest block -mt-1">
                    Custom Amount
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="w-12 h-12 bg-white hover:bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-sm font-black border border-[#d6e5d3] shadow-sm active:scale-90 transition-all outline-none"
                  aria-label="Increase units"
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </div>

              {/* Quick Preset Badges */}
              <div className="grid grid-cols-5 gap-1.5 mb-3.5">
                {[1, 2, 5, 10, 25].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePreset(preset)}
                    className={`py-1.5 rounded-xl border text-[9px] font-manrope font-black tracking-wider transition-all ${
                      units === preset
                        ? 'bg-[#153d2b] text-[#c9f36a] border-[#153d2b] shadow-sm'
                        : 'bg-white text-slate-600 border-[#e2ede0] hover:border-[#153d2b]'
                    }`}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Real-Time Projected Yield Matrix */}
              <div className="grid grid-cols-3 gap-2 bg-[#f4f8f3] border border-[#dbe8d8] rounded-2xl p-3 mb-3">
                <div className="text-center">
                  <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
                    Daily Harvest
                  </span>
                  <strong className="font-manrope font-black text-sm text-[#153d2b] block mt-1 leading-none">
                    +{projDaily}
                  </strong>
                  <span className="text-[7px] font-bold text-[#28734a] uppercase block mt-0.5 leading-none">
                    Egg/Day
                  </span>
                </div>

                <div className="text-center border-x border-[#dbe8d8] px-1">
                  <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
                    30-Day Yield
                  </span>
                  <strong className="font-manrope font-black text-sm text-[#0d2c20] block mt-1 leading-none">
                    +{projMonthly}
                  </strong>
                  <span className="text-[7px] font-bold text-amber-600 uppercase block mt-0.5 leading-none">
                    Egg Total
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-[7px] font-extrabold text-slate-400 uppercase tracking-widest block leading-none">
                    Full Term ({contractTermDays}d)
                  </span>
                  <strong className="font-manrope font-black text-sm text-[#28734a] block mt-1 leading-none">
                    +{projFullTerm}
                  </strong>
                  <span className="text-[7px] font-bold text-emerald-600 uppercase block mt-0.5 leading-none">
                    Total Eggs
                  </span>
                </div>
              </div>

              {/* Net Estimated Amount */}
              <div className="bg-gradient-to-br from-[#f8faf7] to-[#eef6ed] border-2 border-dashed border-[#b6d6b2] rounded-2xl p-3 text-center">
                <span className="text-[8px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Estimated Net Amount
                </span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-manrope font-black text-xl text-[#153d2b]">Rs.</span>
                  <strong className="font-manrope font-black text-2xl text-[#153d2b] tracking-tight">
                    {totalCost.toLocaleString()}
                  </strong>
                  <span className="text-xs font-bold text-[#28734a] uppercase">PKR</span>
                </div>
              </div>
            </div>

            {/* STEP 2 PRIMARY CTA: CONTINUE TO PAYMENT */}
            <button
              type="button"
              onClick={() => goToStep(3)}
              className="w-full relative overflow-hidden bg-gradient-to-r from-[#153d2b] via-[#28734a] to-[#153d2b] text-[#c9f36a] font-manrope font-black text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 group shimmer-active"
            >
              <span>Continue to Payment</span>
              <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
            </button>
          </div>
        )}

        {/* =============================================================== */}
        {/* STEP 3: PAYMENT GATEWAY SELECTOR & FINAL CHECKOUT               */}
        {/* =============================================================== */}
        {currentStep === 3 && (
          <div className="space-y-3.5 step-pane-active">
            {/* Back Navigation to Step 2 */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => goToStep(2)}
                className="inline-flex items-center gap-1.5 text-[8.5px] font-manrope font-black uppercase tracking-wider text-slate-500 hover:text-[#153d2b] transition-all py-1"
              >
                <i className="fa-solid fa-arrow-left text-xs"></i>
                <span>Back to Quantity</span>
              </button>
              <span className="text-[8px] font-extrabold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Final Step 3
              </span>
            </div>

            {/* Order Summary Box */}
            <div className="farm-card-3d p-3.5">
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400 block mb-2">
                Order Overview
              </span>
              <div className="flex items-center justify-between text-xs font-manrope font-black text-[#0d2c20] pb-2 border-b border-[#e2ede0]">
                <span>
                  AL REHMAN META EGGS ({units} {units > 1 ? 'Units' : 'Unit'})
                </span>
                <span className="text-[#153d2b]">Rs. {totalCost.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase mt-2">
                <span>Processing Charge</span>
                <span className="text-emerald-700 font-extrabold">0% Free</span>
              </div>
            </div>

            {/* Payment Gateway Selector Arena */}
            <div className="farm-card-3d p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#153d2b] to-[#c9f36a] rounded-full"></span>
                  <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider leading-none">
                    Select Gateway
                  </h3>
                </div>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <i className="fa-solid fa-lock text-[#28734a]"></i> 256-Bit SSL
                </span>
              </div>

              {/* Gateway List Cards */}
              <div className="space-y-2.5">
                {PAYMENT_GATEWAYS.map((gw) => {
                  const isSelected = selectedGatewayCode === gw.code;
                  const isEasyPaisa = gw.code === '1000';
                  const iconSrc = isEasyPaisa ? easypisaImg : jazzcashImg;

                  return (
                    <div
                      key={gw.code}
                      onClick={() => setSelectedGatewayCode(gw.code)}
                      className={`gateway-card p-3 flex items-center gap-3 cursor-pointer ${
                        isSelected ? 'selected' : ''
                      }`}
                    >
                      {/* Gateway Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-slate-50 border border-[#e2ede0] flex items-center justify-center text-base text-[#153d2b] flex-shrink-0 overflow-hidden p-1 shadow-sm">
                        <img src={iconSrc} className="w-full h-full object-contain" alt={gw.name} />
                      </div>

                      {/* Gateway Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-manrope font-black text-xs text-[#0d2c20] tracking-tight leading-tight truncate">
                            {gw.name}
                          </h4>
                          <span className="text-[7.5px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-[#153d2b]">
                            Fast
                          </span>
                        </div>
                        <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5 truncate">
                          Limit: {gw.limitMin.toFixed(2)} - {gw.limitMax.toLocaleString(undefined, { minimumFractionDigits: 2 })} {gw.currency}
                        </p>
                      </div>

                      {/* Selection Checkmark Indicator */}
                      <div
                        className={`gw-check-circle w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all flex-shrink-0 ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white'
                            : 'border-slate-300 text-transparent'
                        }`}
                      >
                        <i className="fa-solid fa-check"></i>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* If Deposit was Submitted: Display Confirmation Card */}
            {depositSubmitted ? (
              <div className="farm-card-3d p-4 bg-gradient-to-b from-[#f2f9f0] to-[#e4f2e1] border-2 border-emerald-500/40 text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl mx-auto shadow-md animate-bounce">
                  <i className="fa-solid fa-check"></i>
                </div>
                <div>
                  <span className="text-[8px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 rounded-full">
                    Deposit Request Under Review
                  </span>
                  <h3 className="font-manrope font-black text-sm text-[#0d2c20] mt-1">
                    Deposit Successfully Submitted!
                  </h3>
                  <p className="text-[10px] text-slate-600 mt-0.5 leading-snug">
                    Admin is verifying your transaction. Your {units}x Hens will be activated on your farm as soon as verified.
                  </p>
                </div>

                <div className="bg-white/80 border border-[#d2e4cf] rounded-xl p-2.5 text-left text-xs space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Livestock Units:</span>
                    <strong className="text-[#0d2c20] font-black">{units}x Hens</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Amount Paid:</span>
                    <strong className="text-emerald-700 font-black">Rs. {totalCost.toLocaleString()} PKR</strong>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Payment Gateway:</span>
                    <span className="font-bold text-slate-700">{selectedGateway?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Transaction ID (TID):</span>
                    <code className="font-mono font-bold text-amber-700 bg-amber-50 px-1 rounded">{transactionId}</code>
                  </div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500">Current Status:</span>
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-amber-100 text-amber-800 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                      Pending Approval
                    </span>
                  </div>

                  {submittedDepositDetails?.proofScreenshot && (
                    <div className="flex justify-between items-center text-[10px] pt-1.5 border-t border-slate-100">
                      <span className="text-slate-500">Receipt Proof:</span>
                      <a
                        href={submittedDepositDetails.proofScreenshot}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[9.5px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1"
                      >
                        <i className="fa-solid fa-receipt text-emerald-600"></i>
                        <span>View ImageKit Receipt</span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateTo('/dashboard')}
                    className="w-full py-3 bg-[#153d2b] hover:bg-[#1f553c] text-[#c9f36a] rounded-xl font-manrope font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-gauge-high"></i>
                    <span>View in Dashboard</span>
                  </button>

                  <a
                    href={getWhatsAppSupportUrl(
                      `Assalam-o-Alaikum Admin! Maine abhi AL Rehman Meta Eggs mein ${units} Hens ka deposit submit kiya hai (Rs. ${totalCost} via ${selectedGateway?.name}). Mera TID: ${transactionId}. Kindly verify ker k activate ker dein!`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-manrope font-bold text-[11px] uppercase tracking-wider transition-all shadow flex items-center justify-center gap-2"
                  >
                    <i className="fa-brands fa-whatsapp text-sm"></i>
                    <span>Fast Approval via WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                {/* Official Admin Payment Details Box */}
                <div className="farm-card-3d p-3.5 bg-gradient-to-br from-[#fcfdfc] to-[#f2f8f0] border border-[#d6e8d2]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#28734a] bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Admin Payment Receiver
                    </span>
                    <span className="text-[8px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                      Verified Account
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Account Title */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#e2ede0]">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-400 block leading-tight">
                          Account Title
                        </span>
                        <strong className="font-manrope font-black text-xs text-[#0d2c20]">
                          {activeAccountTitle}
                        </strong>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
                        {selectedGateway?.name}
                      </span>
                    </div>

                    {/* Account Number with 1-Click Copy */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#e2ede0]">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-slate-400 block leading-tight">
                          {selectedGateway?.name} Number
                        </span>
                        <span className="font-mono font-black text-sm text-[#153d2b] tracking-wider">
                          {activeAccountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeAccountNumber, 'Account Number')}
                        className="px-2.5 py-1.5 bg-[#f0f7ee] hover:bg-[#e4f1e1] text-[#153d2b] text-[10px] font-black rounded-lg border border-[#cbe0c8] transition-all flex items-center gap-1 active:scale-95"
                      >
                        <i className={`fa-solid ${copiedField === 'Account Number' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                        <span>{copiedField === 'Account Number' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Amount to Send with 1-Click Copy */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-200">
                      <div>
                        <span className="text-[8px] font-extrabold uppercase text-amber-700 block leading-tight">
                          Exact Amount to Transfer
                        </span>
                        <div className="font-manrope font-black text-base text-[#0d2c20]">
                          Rs. {totalCost.toLocaleString()}{' '}
                          <span className="text-[10px] font-bold text-slate-500">PKR</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(String(totalCost), 'Amount')}
                        className="px-2.5 py-1.5 bg-white hover:bg-amber-100/50 text-amber-900 text-[10px] font-black rounded-lg border border-amber-300 transition-all flex items-center gap-1 active:scale-95"
                      >
                        <i className={`fa-solid ${copiedField === 'Amount' ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                        <span>{copiedField === 'Amount' ? 'Copied!' : 'Copy Amount'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[8.5px] text-slate-500 font-medium mt-2 leading-relaxed bg-[#f6faf5] p-2 rounded-lg border border-[#e4eee1]">
                    <i className="fa-solid fa-circle-info text-emerald-600 mr-1"></i>
                    {activeInstructions ? (
                      <span>{activeInstructions}</span>
                    ) : (
                      <span>
                        Oper diye gaye number per <strong>Rs. {totalCost.toLocaleString()}</strong> transfer karein. Transfer ke baad SMS ya receipt se <strong>Transaction ID (TID)</strong> neechay enter ker k submit karein.
                      </span>
                    )}
                  </p>
                </div>

                {/* Sender Verification Input Fields */}
                <div className="farm-card-3d p-3.5 space-y-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-gradient-to-b from-[#153d2b] to-[#c9f36a] rounded-full"></span>
                    <h3 className="font-manrope font-black text-xs text-[#0d2c20] uppercase tracking-wider">
                      Payment Verification Details
                    </h3>
                  </div>

                  {/* Sender Name */}
                  <div>
                    <label className="block text-[8.5px] font-extrabold uppercase text-slate-500 mb-1">
                      Sender Account Name / Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Ali"
                      value={senderAccountTitle}
                      onChange={(e) => setSenderAccountTitle(e.target.value)}
                      className="w-full bg-[#f8faf7] border border-[#d6e5d3] focus:border-[#153d2b] rounded-xl px-3 py-2 text-xs font-bold text-[#0d2c20] outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Sender Mobile / Account Number */}
                  <div>
                    <label className="block text-[8.5px] font-extrabold uppercase text-slate-500 mb-1">
                      Sender Mobile / Account Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 03412345678"
                      value={senderAccountNumber}
                      onChange={(e) => setSenderAccountNumber(e.target.value)}
                      className="w-full bg-[#f8faf7] border border-[#d6e5d3] focus:border-[#153d2b] rounded-xl px-3 py-2 text-xs font-bold text-[#0d2c20] outline-none transition-all placeholder:text-slate-400"
                    />
                  </div>

                  {/* Transaction ID (TID) */}
                  <div>
                    <label className="block text-[8.5px] font-extrabold uppercase text-slate-500 mb-1">
                      Transaction ID (TID / Ref No) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1029384756 or TRX-8829"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full bg-[#f8faf7] border border-[#d6e5d3] focus:border-[#153d2b] rounded-xl px-3 py-2 text-xs font-bold font-mono text-[#0d2c20] outline-none transition-all placeholder:text-slate-400"
                    />
                    <span className="text-[7.5px] text-slate-400 font-semibold block mt-0.5">
                      Enter the 10-12 digit Transaction ID received in Easypisa / JazzCash SMS.
                    </span>
                  </div>

                  {/* Payment Receipt / Proof Screenshot (ImageKit Cloud CDN) */}
                  <div className="pt-0.5">
                    <label className="flex items-center justify-between text-[8.5px] font-extrabold uppercase text-slate-500 mb-1">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-camera text-emerald-600"></i>
                        <span>Payment Screenshot / Receipt</span>
                      </span>
                      <span className="text-[7.5px] font-bold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <i className="fa-solid fa-cloud-arrow-up text-[8px]"></i>
                        <span>ImageKit CDN</span>
                      </span>
                    </label>

                    {proofPreview ? (
                      <div className="relative rounded-xl border-2 border-emerald-400 bg-emerald-50/70 p-2.5 flex items-center gap-2.5 shadow-sm">
                        <img
                          src={proofPreview}
                          alt="Receipt Preview"
                          className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shadow-xs flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[11px] font-black text-emerald-900 truncate">
                            <i className="fa-solid fa-circle-check text-emerald-600 text-xs"></i>
                            <span className="truncate">{proofFileName || 'Receipt Attached'}</span>
                          </div>
                          <span className="text-[8px] text-slate-500 block truncate mt-0.5 font-mono">
                            {isUploadingProof ? 'Uploading to ImageKit Cloud CDN...' : (proofScreenshot || 'Uploaded to ImageKit CDN')}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveProof}
                          className="px-2 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[8.5px] font-bold uppercase transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove Screenshot"
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div className="relative border-2 border-dashed border-[#c5d8c1] hover:border-[#153d2b] bg-[#f8faf7] hover:bg-[#eef5ec] rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all group overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileSelect}
                          disabled={isUploadingProof}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
                        />
                        <div className="w-8 h-8 rounded-full bg-emerald-100 group-hover:bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs transition-colors">
                          {isUploadingProof ? (
                            <i className="fa-solid fa-circle-notch fa-spin text-emerald-700"></i>
                          ) : (
                            <i className="fa-solid fa-cloud-arrow-up text-emerald-700"></i>
                          )}
                        </div>
                        <div className="text-center pointer-events-none">
                          <span className="text-[10.5px] font-black text-slate-800 block">
                            {isUploadingProof ? 'Uploading to ImageKit...' : 'Upload Payment Screenshot / Receipt'}
                          </span>
                          <span className="text-[7.5px] font-extrabold text-amber-700 uppercase tracking-wider block mt-0.5">
                            * Required for Quick Verification
                          </span>
                        </div>
                        <span className="text-[7.5px] text-slate-400 text-center pointer-events-none">
                          Tap anywhere to select Easypisa / JazzCash receipt • Auto-converted to ImageKit CDN URL
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Primary Action: Submit Manual Deposit for Admin Review */}
                <button
                  type="button"
                  onClick={handleSubmitDeposit}
                  disabled={isSubmitting}
                  className="w-full relative overflow-hidden bg-gradient-to-r from-[#153d2b] via-[#28734a] to-[#153d2b] text-[#c9f36a] font-manrope font-black text-xs tracking-widest uppercase py-4 rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-95 transition-all flex items-center justify-center gap-2 group shimmer-active disabled:opacity-70 cursor-pointer"
                >
                  <i className="fa-solid fa-paper-plane text-xs group-hover:scale-110 transition-transform"></i>
                  <span>
                    {isSubmitting
                      ? 'Submitting Deposit...'
                      : `Submit Deposit for Approval (Rs. ${totalCost.toLocaleString()})`}
                  </span>
                  <i className="fa-solid fa-arrow-right text-xs"></i>
                </button>

                {/* Instant Purchase Fallback / Demo Activation */}
                <div className="pt-1 text-center">
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="text-[9px] font-extrabold text-slate-400 hover:text-emerald-700 uppercase tracking-wider underline transition-colors"
                  >
                    Instant Direct Purchase (Demo / Simulation)
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* MY DEPOSIT ORDERS & PAYMENT HISTORY (PERSISTENT ACROSS REFRESH)*/}
        {/* ============================================================== */}
        <div className="mt-8 pt-5 border-t-2 border-emerald-900/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm shadow-xs border border-emerald-200">
                <i className="fa-solid fa-clock-rotate-left"></i>
              </span>
              <div>
                <h3 className="font-manrope font-black text-xs md:text-sm text-[#0d2c20] uppercase tracking-wide">
                  My Deposit Orders &amp; History
                </h3>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 block">
                  Live Status • Auto-Synced with Database
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (syncWithSupabase) {
                  await syncWithSupabase();
                  showToast('info', 'Deposit records refreshed from database.');
                }
              }}
              disabled={isLiveSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-manrope font-extrabold text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh Deposit Status"
            >
              <i className={`fa-solid fa-arrows-rotate text-[10px] ${isLiveSyncing ? 'animate-spin' : ''}`}></i>
              <span>{isLiveSyncing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>

          {myDeposits.length === 0 ? (
            <div className="bg-white/80 border border-dashed border-[#ccdcc8] rounded-2xl p-6 text-center text-slate-400">
              <i className="fa-solid fa-receipt text-3xl mb-2 text-slate-300"></i>
              <p className="text-xs font-bold text-slate-600">No deposit orders found</p>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                Submit a deposit above to buy hens and your order will show here with real-time approval status.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myDeposits.map((dep) => {
                const isPending = dep.status === 'Pending';
                const isCompleted = dep.status === 'Completed' || dep.status === 'Approved';
                const isRejected = dep.status === 'Rejected';

                return (
                  <div
                    key={dep.id || dep.dbId}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      isPending
                        ? 'bg-gradient-to-br from-amber-500/10 via-amber-50/80 to-white border-amber-300 shadow-sm'
                        : isCompleted
                        ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white border-emerald-300 shadow-sm'
                        : 'bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white border-rose-300 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Units, Gateway & Status Badge */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-emerald-800 text-[#c9f36a] flex items-center justify-center text-xs font-black shadow-xs">
                          🐔
                        </span>
                        <div>
                          <strong className="font-manrope font-black text-xs text-[#0d2c20] block">
                            {dep.units}x Hens
                          </strong>
                          <span className="text-[8.5px] font-bold text-slate-500">
                            via {dep.gateway}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="font-manrope font-black text-xs text-emerald-800">
                          Rs. {Number(dep.amountPkr || 0).toLocaleString()} PKR
                        </span>
                        <span
                          className={`mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          {isPending && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>}
                          {isCompleted && <i className="fa-solid fa-circle-check text-[9px] text-emerald-600"></i>}
                          {isRejected && <i className="fa-solid fa-circle-xmark text-[9px] text-rose-600"></i>}
                          <span>{isPending ? 'Pending Approval' : isCompleted ? 'Approved & Credited' : 'Rejected'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[9.5px] text-slate-600 py-2 border-b border-black/5">
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Transaction ID (TID)</span>
                        <code className="font-mono font-bold text-amber-800 bg-amber-50 px-1 py-0.5 rounded border border-amber-200/60 block truncate">
                          {dep.transactionId || 'N/A'}
                        </code>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Sender Title</span>
                        <strong className="text-slate-800 block truncate">
                          {dep.senderAccountTitle || 'Farmer'} ({dep.senderAccountNumber || ''})
                        </strong>
                      </div>
                      <div className="col-span-2 flex items-center justify-between text-[8px] text-slate-400 pt-0.5">
                        <span>Submitted: {new Date(dep.createdAt || Date.now()).toLocaleString()}</span>
                        {dep.proofScreenshot && (
                          <a
                            href={dep.proofScreenshot}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
                          >
                            <i className="fa-solid fa-receipt text-emerald-600"></i>
                            <span>View Proof Receipt</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Admin Notes if rejected */}
                    {isRejected && dep.adminNotes && (
                      <div className="mt-2 p-2 rounded-xl bg-rose-50 border border-rose-200 text-[9px] text-rose-800">
                        <strong className="block font-black text-rose-900">Reason:</strong>
                        <span>{dep.adminNotes}</span>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex items-center gap-2">
                      {isPending && (
                        <a
                          href={getWhatsAppSupportUrl(
                            `Assalam-o-Alaikum Admin! Maine AL Rehman Meta Eggs pe ${dep.units}x Hens ka deposit submit kiya tha (Rs. ${dep.amountPkr} via ${dep.gateway}, TID: ${dep.transactionId}). Kindly approve ker k hens credit ker dein!`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-manrope font-bold text-[9.5px] uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <i className="fa-brands fa-whatsapp text-xs"></i>
                          <span>Fast Track on WhatsApp</span>
                        </a>
                      )}

                      {isCompleted && (
                        <button
                          type="button"
                          onClick={() => navigateTo('/my-farm')}
                          className="flex-1 py-2 bg-gradient-to-r from-[#153d2b] to-[#28734a] text-[#c9f36a] rounded-xl font-manrope font-black text-[9.5px] uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <i className="fa-solid fa-egg text-xs"></i>
                          <span>View Flock in My Farm</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
