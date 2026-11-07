import React, { useState, useMemo } from 'react';
import { useFarm, VERIFIED_MERCHANTS, PAYOUT_METHODS } from '../context/FarmContext';
import { AppShell } from '../components/AppNavigation';
import logoImg from '../assets/logo.webp';
import easypisaImg from '../assets/easypisa.png';
import jazzcashImg from '../assets/jazzcash.png';
import bankImg from '../assets/bank.jpg';
import '../rawafiles.css';

export default function SellEggPage({ currentRoute = '/sell-egg' }) {
  const {
    user,
    eggVault,
    sellEggs,
    navigateTo,
    showToast,
    platformSettings,
    withdrawals = [],
    syncWithSupabase,
    isLiveSyncing
  } = useFarm();

  // User's persistent withdrawals across refresh
  const myWithdrawals = useMemo(() => {
    if (!Array.isArray(withdrawals)) return [];
    return withdrawals.filter((w) => {
      return (
        (user?.username && String(w.username).toLowerCase() === String(user.username).toLowerCase()) ||
        (user?.id && String(w.userId) === String(user.id)) ||
        (user?.accountId && String(w.userId) === String(user.accountId))
      );
    });
  }, [withdrawals, user]);

  // Dynamic Verified Merchant Stores computed from Platform Settings
  const dynamicMerchants = useMemo(() => {
    return VERIFIED_MERCHANTS.map((m) => {
      const storeKey = m.id === '1' ? 'sonica' : m.id === '2' ? 'usmaina' : m.id === '3' ? 'syed' : m.id;
      const dynamicRate = Number(
        platformSettings?.marketRates?.eggRates?.[storeKey] ||
        platformSettings?.marketRates?.eggRates?.[m.id] ||
        platformSettings?.eggBasePrice ||
        m.rate
      );
      const minEggs = Number(platformSettings?.minWithdrawalEggs ?? m.min ?? 1);
      const maxEggs = Number(platformSettings?.maxWithdrawalEggs ?? m.max ?? 10000);
      return {
        ...m,
        rate: dynamicRate,
        min: minEggs,
        max: maxEggs
      };
    });
  }, [platformSettings]);

  // Minimum withdrawal limits
  const minWithdrawalPkr = Number(platformSettings?.minWithdrawalPkr ?? 30);
  const minWithdrawalEggs = Number(platformSettings?.minWithdrawalEggs ?? 1);

  // 3-Step Wizard Navigation State
  const [currentStep, setCurrentStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('price'); // 'price', 'trades', 'success', 'rating'

  // Selected order state
  const [selectedStoreId, setSelectedStoreId] = useState(dynamicMerchants[0]?.id || '1');
  const [selectedMethodCode, setSelectedMethodCode] = useState('2'); // 1: Jazzcash, 2: EasyPaisa, 3: Bank
  const [eggsToSell, setEggsToSell] = useState(() => (eggVault > 0 ? Math.floor(eggVault) : 0));
  const [accountTitle, setAccountTitle] = useState(user?.name || user?.username || '');
  const [accountNumber, setAccountNumber] = useState(user?.phone || '');
  const [bankName, setBankName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store lookup
  const selectedStore = dynamicMerchants.find((m) => m.id === String(selectedStoreId)) || dynamicMerchants[0];
  const selectedMethod = PAYOUT_METHODS.find((p) => p.code === String(selectedMethodCode)) || PAYOUT_METHODS[1];

  // Filtering and sorting stores
  const filteredStores = useMemo(() => {
    let list = [...dynamicMerchants];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((m) => m.name.toLowerCase().includes(q));
    }

    // Sort by selected filter tab
    if (activeFilter === 'price') {
      list.sort((a, b) => b.rate - a.rate);
    } else if (activeFilter === 'trades') {
      list.sort((a, b) => b.trades - a.trades);
    } else if (activeFilter === 'success') {
      list.sort((a, b) => parseInt(b.success, 10) - parseInt(a.success, 10));
    } else if (activeFilter === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [dynamicMerchants, searchQuery, activeFilter]);

  // Derived calculations
  const sellerRate = selectedStore?.rate || 30;
  const qty = parseFloat(eggsToSell) || 0;
  const estimatedPayout = qty * sellerRate;

  // Preset percentage calculation
  const handlePreset = (pct) => {
    const total = Math.floor(eggVault || 0);
    if (total <= 0) {
      showToast('info', 'Your Egg Vault is currently empty (0 Eggs). Please harvest flock eggs or buy hens first.');
      setEggsToSell(0);
      return;
    }
    if (pct === 1.0) {
      setEggsToSell(total);
    } else {
      const target = Math.max(1, Math.floor(total * pct));
      setEggsToSell(target);
    }
  };

  const isPresetActive = (pct) => {
    const total = Math.floor(eggVault || 0);
    if (total <= 0 || qty <= 0) return false;
    const target = pct === 1.0 ? total : Math.max(1, Math.floor(total * pct));
    return qty === target;
  };

  // Step 1 -> Step 2
  const handleSelectStore = (store) => {
    setSelectedStoreId(store.id);
    if (eggVault > 0 && (!eggsToSell || eggsToSell <= 0)) {
      setEggsToSell(Math.floor(eggVault));
    }
    setCurrentStep(2);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Step 2 -> Step 3
  const handleSelectMethod = (method) => {
    setSelectedMethodCode(method.code);
    setCurrentStep(3);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Final submit
  const handleConfirmCashout = (e) => {
    e.preventDefault();
    if (qty <= 0) {
      showToast('error', 'Please enter a valid egg quantity to liquidate.');
      return;
    }
    if (qty > eggVault) {
      showToast('error', `Cannot liquidate ${qty} eggs. Only ${eggVault} available in vault.`);
      return;
    }
    if (qty < selectedStore.min || qty > selectedStore.max) {
      showToast('error', `Quantity must be between ${selectedStore.min} and ${selectedStore.max} eggs.`);
      return;
    }
    if (estimatedPayout < minWithdrawalPkr) {
      showToast('error', `Minimum withdrawal amount is Rs. ${minWithdrawalPkr} PKR. Current total: Rs. ${estimatedPayout.toFixed(2)} PKR.`);
      return;
    }
    if (!accountTitle.trim() || !accountNumber.trim()) {
      showToast('error', 'Account title and account number are required.');
      return;
    }
    if (selectedMethod.name === 'All Bank Pakistan' && !bankName) {
      showToast('error', 'Bank name selection is required for bank transfer.');
      return;
    }

    setIsSubmitting(true);
    const res = sellEggs({
      storeId: selectedStore.id,
      storeName: selectedStore.name,
      rate: selectedStore.rate,
      eggs: qty,
      method: selectedMethod.name,
      accountTitle: accountTitle.trim(),
      accountNumber: accountNumber.trim(),
      bankName: selectedMethod.name === 'All Bank Pakistan' ? bankName : undefined
    });

    setIsSubmitting(false);
    if (res.success) {
      navigateTo('/dashboard');
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      title="AL REHMAN META EGGS"
      showBack={true}
      onBack={() => {
        if (currentStep > 1) {
          setCurrentStep(currentStep - 1);
        } else {
          navigateTo('/dashboard');
        }
      }}
    >
      <div className="px-3.5 pt-2 pb-6 space-y-3">
        {/* ==================================================== */}
        {/* 1. VIP TACTILE 3-STEP PROGRESS HUD                   */}
        {/* ==================================================== */}
        <div className="bg-white/95 backdrop-blur-md border border-[#e2ede0] rounded-2xl p-3 shadow-[0_4px_20px_-4px_rgba(21,61,43,0.06)] mb-3">
          <div className="flex items-center justify-between relative px-2">
            {/* Step 1 Node */}
            <div
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => setCurrentStep(1)}
            >
              <div
                className={`step-num w-7 h-7 rounded-full font-poppins font-black text-[11px] flex items-center justify-center transition-all ${
                  currentStep === 1
                    ? 'bg-gradient-to-br from-farm-forest to-farm-deep text-farm-lime border border-farm-lime/40 shadow-md'
                    : 'bg-emerald-500 text-white border-emerald-500'
                }`}
              >
                {currentStep > 1 ? <i className="fas fa-check text-[10px]"></i> : '1'}
              </div>
              <span
                className={`text-[8px] font-black mt-1 uppercase tracking-wider ${
                  currentStep >= 1 ? 'text-farm-forest' : 'text-slate-400'
                }`}
              >
                Store
              </span>
            </div>

            {/* Connecting Beam 1 */}
            <div className="flex-1 h-1 bg-[#e2ede0] mx-2 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-farm-forest to-farm-lime transition-all duration-300"
                style={{ width: currentStep >= 2 ? '100%' : '0%' }}
              ></div>
            </div>

            {/* Step 2 Node */}
            <div
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => {
                if (currentStep >= 2) setCurrentStep(2);
              }}
            >
              <div
                className={`step-num w-7 h-7 rounded-full font-poppins font-black text-[11px] flex items-center justify-center transition-all ${
                  currentStep === 2
                    ? 'bg-gradient-to-br from-farm-forest to-farm-deep text-farm-lime border border-farm-lime/40 shadow-md'
                    : currentStep > 2
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-[#f1f5ef] text-slate-400 border border-[#e2ede0]'
                }`}
              >
                {currentStep > 2 ? <i className="fas fa-check text-[10px]"></i> : '2'}
              </div>
              <span
                className={`text-[8px] font-black mt-1 uppercase tracking-wider ${
                  currentStep >= 2 ? 'text-farm-forest' : 'text-slate-400'
                }`}
              >
                Method
              </span>
            </div>

            {/* Connecting Beam 2 */}
            <div className="flex-1 h-1 bg-[#e2ede0] mx-2 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-farm-forest to-farm-lime transition-all duration-300"
                style={{ width: currentStep >= 3 ? '100%' : '0%' }}
              ></div>
            </div>

            {/* Step 3 Node */}
            <div
              className="flex flex-col items-center z-10 cursor-pointer"
              onClick={() => {
                if (currentStep >= 3) setCurrentStep(3);
              }}
            >
              <div
                className={`step-num w-7 h-7 rounded-full font-poppins font-black text-[11px] flex items-center justify-center transition-all ${
                  currentStep === 3
                    ? 'bg-gradient-to-br from-farm-forest to-farm-deep text-farm-lime border border-farm-lime/40 shadow-md'
                    : 'bg-[#f1f5ef] text-slate-400 border border-[#e2ede0]'
                }`}
              >
                3
              </div>
              <span
                className={`text-[8px] font-black mt-1 uppercase tracking-wider ${
                  currentStep === 3 ? 'text-farm-forest' : 'text-slate-400'
                }`}
              >
                Cashout
              </span>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* STEP 1: STORE SELECTION VIEW                         */}
        {/* ==================================================== */}
        {currentStep === 1 && (
          <div className="space-y-3 step-pane-active">
            {/* HERO HARVEST VAULT CARD */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d2c20] via-[#153d2b] to-[#1c4e37] p-4 text-white shadow-[0_12px_30px_-5px_rgba(13,44,32,0.35)] border border-white/10">
              {/* Subtle Glow Ring */}
              <div className="absolute -right-8 -top-8 w-36 h-36 bg-farm-lime/20 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-farm-amber/20 rounded-full blur-2xl pointer-events-none"></div>

              {/* Top Row: Badge & Type */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-farm-lime animate-ping"></span>
                  <span className="text-[9px] font-black text-farm-lime uppercase tracking-widest">
                    LIVE P2P MARKET
                  </span>
                </div>
                <div className="text-[9px] font-black text-white/70 uppercase tracking-widest flex items-center gap-1">
                  <i className="fa-solid fa-scale-balanced text-farm-gold"></i> Instant Cashout
                </div>
              </div>

              {/* Middle Row: Balance Display & 3D Egg Mascot */}
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-emerald-200/80 block mb-0.5">
                    Your Available Harvest
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-poppins font-black text-2xl tracking-tight text-white drop-shadow-sm">
                      {Number(eggVault || 0).toLocaleString()}
                    </span>
                    <span className="font-poppins font-black text-xs text-farm-lime uppercase">
                      Eggs
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-farm-gold">
                    <i className="fa-solid fa-coins"></i>
                    <span>≈ PKR {(Number(eggVault || 0) * 30).toLocaleString()} Cash Value</span>
                  </div>
                </div>

                {/* 3D Mascot Floating Art */}
                <div className="relative w-16 h-16 flex-shrink-0 animate-float">
                  <div className="absolute inset-0 bg-farm-lime/20 rounded-full blur-md"></div>
                  <img
                    src={logoImg}
                    className="w-full h-full object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)]"
                    alt="Egg"
                  />
                </div>
              </div>

              {/* Bottom Live Market Statistics Bar */}
              <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/10 text-center relative z-10">
                <div className="bg-black/20 rounded-xl py-1.5 px-1 border border-white/5">
                  <span className="text-[7.5px] font-extrabold text-white/60 uppercase tracking-wider block">
                    Stores Online
                  </span>
                  <strong className="font-poppins font-black text-white text-[11px] block mt-0.5">
                    3 Verified
                  </strong>
                </div>
                <div className="bg-black/20 rounded-xl py-1.5 px-1 border border-white/5">
                  <span className="text-[7.5px] font-extrabold text-farm-lime uppercase tracking-wider block">
                    Best Rate
                  </span>
                  <strong className="font-poppins font-black text-farm-lime text-[11px] block mt-0.5">
                    Rs 30
                  </strong>
                </div>
                <div className="bg-black/20 rounded-xl py-1.5 px-1 border border-white/5">
                  <span className="text-[7.5px] font-extrabold text-farm-gold uppercase tracking-wider block">
                    Max Rate
                  </span>
                  <strong className="font-poppins font-black text-farm-gold text-[11px] block mt-0.5">
                    Rs 33
                  </strong>
                </div>
              </div>
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-farm-forest text-xs pointer-events-none">
                <i className="fa-solid fa-magnifying-glass"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search verified merchant store..."
                className="w-full bg-white/95 border border-[#e2ede0] text-farm-deep text-xs font-bold pl-10 pr-10 py-3 rounded-2xl outline-none focus:border-farm-leaf focus:bg-white shadow-[0_4px_16px_rgba(21,61,43,0.03)] focus:shadow-[0_0_0_3px_rgba(201,243,106,0.35)] transition-all placeholder:text-slate-400"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[9px] font-black text-farm-leaf bg-[#f1f5ef] px-2 py-0.5 rounded-full border border-[#e2ede0]">
                {filteredStores.length} Stores
              </span>
            </div>

            {/* SORT & FILTER SWITCHERS */}
            <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none flex-shrink-0">
              <button
                type="button"
                onClick={() => setActiveFilter('price')}
                className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                  activeFilter === 'price'
                    ? 'bg-farm-forest text-farm-lime border border-farm-forest'
                    : 'bg-white hover:bg-[#f1f5ef] text-slate-600 border border-[#e2ede0]'
                }`}
              >
                <i className="fa-solid fa-bolt-lightning text-farm-lime text-[10px]"></i>
                <span>BEST RATE</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('trades')}
                className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                  activeFilter === 'trades'
                    ? 'bg-farm-forest text-farm-lime border border-farm-forest'
                    : 'bg-white hover:bg-[#f1f5ef] text-slate-600 border border-[#e2ede0]'
                }`}
              >
                <i className="fa-solid fa-fire text-amber-500 text-[10px]"></i>
                <span>MOST TRADES</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('success')}
                className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                  activeFilter === 'success'
                    ? 'bg-farm-forest text-farm-lime border border-farm-forest'
                    : 'bg-white hover:bg-[#f1f5ef] text-slate-600 border border-[#e2ede0]'
                }`}
              >
                <i className="fa-solid fa-shield-halved text-emerald-500 text-[10px]"></i>
                <span>100% SUCCESS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveFilter('rating')}
                className={`filter-btn flex-shrink-0 px-3.5 py-1.5 rounded-full text-[9px] font-black tracking-wider uppercase transition-all shadow-sm active:scale-95 flex items-center gap-1.5 ${
                  activeFilter === 'rating'
                    ? 'bg-farm-forest text-farm-lime border border-farm-forest'
                    : 'bg-white hover:bg-[#f1f5ef] text-slate-600 border border-[#e2ede0]'
                }`}
              >
                <i className="fa-solid fa-star text-farm-gold text-[10px]"></i>
                <span>TOP RATED</span>
              </button>
            </div>

            {/* Merchant Stores Listing Cards */}
            <div className="space-y-3">
              {filteredStores.map((store) => {
                const initials = store.name
                  .split(' ')
                  .map((w) => w[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase();

                return (
                  <div key={store.id} className="trader-item">
                    <div className="bg-white/95 backdrop-blur-md border border-[#e2ede0] hover:border-farm-leaf rounded-3xl p-4 shadow-[0_4px_20px_-4px_rgba(21,61,43,0.06)] hover:shadow-[0_8px_24px_-4px_rgba(21,61,43,0.12)] transition-all duration-300 space-y-3.5 group">
                      {/* Store Header & Reputation */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          {/* 3D Squircle Avatar with Online Beacon */}
                          <div className="relative">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-farm-forest to-[#1c4e37] text-farm-lime flex items-center justify-center font-poppins font-black text-sm shadow-[0_4px_12px_rgba(21,61,43,0.25)] border border-farm-lime/30">
                              {initials}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-poppins font-black text-xs text-farm-deep tracking-wide group-hover:text-farm-leaf transition-colors leading-tight">
                                {store.name}
                              </h4>
                              <i
                                className="fa-solid fa-circle-check text-emerald-500 text-[11px]"
                                title="Verified Merchant"
                              ></i>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 mt-1 uppercase tracking-wider">
                              <span className="text-farm-gold flex items-center gap-0.5">
                                <i className="fa-solid fa-star text-[9px]"></i> {store.rating.toFixed(1)}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span>{store.trades.toLocaleString()} Trades</span>
                              <span className="text-slate-300">•</span>
                              <span className="text-emerald-600 font-extrabold">{store.success} Fill</span>
                            </div>
                          </div>
                        </div>

                        {/* Available Limits Pill */}
                        <div className="text-right flex-shrink-0">
                          <span className="block text-[7.5px] font-black text-slate-400 uppercase tracking-widest">
                            Order Limits
                          </span>
                          <span className="inline-block mt-0.5 bg-[#f1f5ef] border border-[#e2ede0] text-farm-forest text-[9px] font-black px-2 py-0.5 rounded-lg">
                            {store.min} - {store.max} Egg
                          </span>
                        </div>
                      </div>

                      {/* Price Tag & 3D Sell Action Bar */}
                      <div className="flex items-center justify-between bg-[#f8faf7] border border-[#e8ece5] rounded-2xl p-3">
                        <div>
                          <div className="font-poppins font-black text-lg text-farm-deep leading-tight">
                            Rs {store.rate}
                            <span className="text-[10px] font-bold text-slate-400">/egg</span>
                          </div>
                          <div className="text-[8px] font-extrabold text-emerald-600 uppercase tracking-wider mt-0.5 flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-[8px]"></i> 0% Fee • Instant Payout
                          </div>
                        </div>

                        {/* 3D Tactile Sell Button */}
                        <button
                          type="button"
                          onClick={() => handleSelectStore(store)}
                          className="btn-3d-sell text-white font-poppins font-black text-[10px] tracking-widest uppercase rounded-xl px-4 py-2.5 text-center flex items-center justify-center gap-2"
                        >
                          <img
                            src={logoImg}
                            className="w-4 h-4 object-contain inline-block drop-shadow-sm"
                            alt="Sell"
                          />
                          <span>SELL</span>
                          <i className="fa-solid fa-chevron-right text-[8px]"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredStores.length === 0 && (
                <div className="bg-white rounded-2xl p-8 text-center text-slate-400 border border-[#e2ede0]">
                  <i className="fa-solid fa-store-slash text-3xl mb-2 text-slate-300"></i>
                  <p className="text-xs font-bold">No verified merchant stores found matching your search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 2: PAYOUT METHOD SELECTION                      */}
        {/* ==================================================== */}
        {currentStep === 2 && (
          <div className="space-y-3 step-pane-active">
            {/* Back Button & Subheader */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-farm-leaf hover:text-farm-forest text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <i className="fa-solid fa-arrow-left-long text-xs"></i> <span>Choose Store</span>
              </button>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Step 2 of 3
              </span>
            </div>

            {/* Selected Store Summary Lock Card */}
            <div className="bg-gradient-to-br from-[#0d2c20] to-[#153d2b] text-white border border-white/10 rounded-2xl p-3.5 shadow-md flex items-center justify-between">
              <div>
                <span className="text-white/60 block uppercase font-extrabold text-[8px] tracking-widest">
                  Active Order Store
                </span>
                <strong className="text-white font-poppins font-black text-xs flex items-center gap-1 mt-0.5">
                  {selectedStore.name}
                  <i className="fa-solid fa-circle-check text-farm-lime text-[10px]"></i>
                </strong>
              </div>
              <div className="text-right">
                <span className="text-white/60 block uppercase font-extrabold text-[8px] tracking-widest">
                  Locked Rate
                </span>
                <strong className="text-farm-lime font-poppins font-black text-xs block mt-0.5">
                  Rs {selectedStore.rate.toFixed(2)} / egg
                </strong>
              </div>
            </div>

            {/* Payment Methods Header */}
            <div className="px-1 pt-1">
              <h3 className="font-poppins font-black text-xs text-farm-deep uppercase tracking-wider">
                Select Payout Account Method:
              </h3>
              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                Cash will be transferred directly to this chosen account.
              </p>
            </div>

            {/* Methods Listing Cards */}
            <div className="space-y-2.5">
              {PAYOUT_METHODS.map((method) => {
                let iconSrc = easypisaImg;
                if (method.name === 'Jazzcash') iconSrc = jazzcashImg;
                if (method.name === 'All Bank Pakistan') iconSrc = bankImg;

                return (
                  <div
                    key={method.code}
                    onClick={() => handleSelectMethod(method)}
                    className="method-card cursor-pointer border border-[#e2ede0] hover:border-farm-leaf bg-white/95 rounded-2xl p-3.5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={iconSrc}
                        className="w-12 h-12 object-cover rounded-xl shadow-sm border border-[#e2ede0] group-hover:scale-105 transition-transform"
                        alt={method.name}
                      />
                      <div>
                        <span className="block text-xs font-black text-farm-deep uppercase tracking-wide group-hover:text-farm-leaf transition-colors leading-tight">
                          {method.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] text-emerald-700 font-black bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <i className="fa-solid fa-bolt text-[7px]"></i> INSTANT 0s
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold">{method.transferTime}</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-[#f1f5ef] border border-[#e2ede0] flex items-center justify-center text-xs text-slate-400 group-hover:bg-farm-forest group-hover:text-farm-lime group-hover:border-farm-forest transition-all">
                      <i className="fas fa-chevron-right text-[10px]"></i>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* STEP 3: QUANTITY & CASHOUT SIMULATOR                 */}
        {/* ==================================================== */}
        {currentStep === 3 && (
          <div className="space-y-3.5 step-pane-active">
            {/* Back Button & Subheader */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="text-farm-leaf hover:text-farm-forest text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors"
              >
                <i className="fa-solid fa-arrow-left-long text-xs"></i> <span>Choose Method</span>
              </button>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                Step 3 of 3
              </span>
            </div>

            {/* Summary HUD of Selected Order */}
            <div className="bg-white/95 border border-[#e2ede0] rounded-2xl p-3 shadow-sm grid grid-cols-2 gap-2 text-[10px]">
              <div className="bg-[#f8faf7] p-2.5 rounded-xl border border-[#e8ece5]">
                <span className="text-slate-400 block uppercase font-extrabold text-[8px] tracking-wider">
                  Merchant Store
                </span>
                <strong className="text-farm-deep text-xs font-black flex items-center gap-1 mt-0.5 truncate">
                  {selectedStore.name}
                </strong>
              </div>
              <div className="bg-[#f8faf7] p-2.5 rounded-xl border border-[#e8ece5]">
                <span className="text-slate-400 block uppercase font-extrabold text-[8px] tracking-wider">
                  Payout Method
                </span>
                <strong className="text-farm-deep text-xs font-black flex items-center gap-1 mt-0.5 truncate">
                  {selectedMethod.name}
                </strong>
              </div>
            </div>

            {/* Main Cashout Form & Simulator Card */}
            <form onSubmit={handleConfirmCashout} className="space-y-4">
              <div className="bg-white/95 backdrop-blur-md border border-[#e2ede0] rounded-3xl p-4 shadow-[0_8px_30px_-6px_rgba(21,61,43,0.08)] space-y-4">
                {/* Empty Vault Guidance Alert */}
                {eggVault <= 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-2.5 text-amber-800">
                    <i className="fa-solid fa-triangle-exclamation text-amber-600 mt-0.5 text-sm flex-shrink-0"></i>
                    <div className="text-[11px] leading-tight space-y-2">
                      <div>
                        <strong className="block font-black text-amber-900 mb-0.5">Egg Vault is Empty (0 Eggs)</strong>
                        <span>Apke paas filhal sell karne ke liye ande nahi hain. Cashout lene ke liye pehle My Farm me daily harvest karein ya Buy Hen se hen khareedein.</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => navigateTo('/my-farm')}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-[9px] uppercase shadow-sm transition-colors"
                        >
                          Go to My Farm
                        </button>
                        <button
                          type="button"
                          onClick={() => navigateTo('/buy-asset')}
                          className="px-2.5 py-1 bg-farm-forest hover:bg-farm-deep text-farm-lime font-bold rounded-lg text-[9px] uppercase shadow-sm transition-colors"
                        >
                          Buy Hen Asset
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1. Harvest Quantity to Liquidate */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black text-farm-forest uppercase tracking-widest">
                      Enter Eggs to Sell:
                    </label>
                    <span className="text-[9px] font-bold text-slate-500">
                      Balance:{' '}
                      <strong className="text-farm-forest font-black">
                        {Number(eggVault || 0).toLocaleString()}
                      </strong>
                    </span>
                  </div>

                  <div className="relative w-full">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-farm-leaf text-sm pointer-events-none">
                      <i className="fa-solid fa-cubes"></i>
                    </span>
                    <input
                      type="number"
                      step="any"
                      value={eggsToSell}
                      onChange={(e) => setEggsToSell(e.target.value)}
                      placeholder="0.00"
                      required
                      min={eggVault > 0 ? selectedStore.min : 0}
                      max={eggVault > 0 ? Math.min(selectedStore.max, Math.floor(eggVault)) : 0}
                      disabled={eggVault <= 0}
                      className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-sm font-black pl-11 pr-20 py-3.5 rounded-2xl outline-none focus:border-farm-leaf focus:bg-white shadow-[0_4px_12px_rgba(21,61,43,0.02)] focus:shadow-[0_0_0_3px_rgba(201,243,106,0.35)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Eggs
                    </span>
                  </div>

                  {/* Quick Preset Quantity Chips */}
                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto scrollbar-none">
                    <button
                      type="button"
                      onClick={() => handlePreset(0.25)}
                      className={`btn-preset-qty flex-1 py-1.5 px-2 border rounded-xl text-[9px] font-black uppercase transition-colors ${
                        isPresetActive(0.25)
                          ? 'bg-farm-forest text-farm-lime border-farm-forest'
                          : 'bg-[#f1f5ef] hover:bg-farm-forest hover:text-farm-lime border-[#e2ede0] text-farm-forest'
                      }`}
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(0.50)}
                      className={`btn-preset-qty flex-1 py-1.5 px-2 border rounded-xl text-[9px] font-black uppercase transition-colors ${
                        isPresetActive(0.50)
                          ? 'bg-farm-forest text-farm-lime border-farm-forest'
                          : 'bg-[#f1f5ef] hover:bg-farm-forest hover:text-farm-lime border-[#e2ede0] text-farm-forest'
                      }`}
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(0.75)}
                      className={`btn-preset-qty flex-1 py-1.5 px-2 border rounded-xl text-[9px] font-black uppercase transition-colors ${
                        isPresetActive(0.75)
                          ? 'bg-farm-forest text-farm-lime border-farm-forest'
                          : 'bg-[#f1f5ef] hover:bg-farm-forest hover:text-farm-lime border-[#e2ede0] text-farm-forest'
                      }`}
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreset(1.00)}
                      className={`btn-preset-qty flex-1 py-1.5 px-2 border rounded-xl text-[9px] font-black uppercase transition-colors ${
                        isPresetActive(1.00)
                          ? 'bg-farm-forest text-farm-lime border-farm-forest'
                          : 'bg-[#f1f5ef] hover:bg-farm-forest hover:text-farm-lime border-[#e2ede0] text-farm-forest'
                      }`}
                    >
                      MAX ALL
                    </button>
                  </div>

                  {/* Order Limit Warning Banner */}
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-1 pt-0.5">
                    <span>Limit: {selectedStore.min} - {selectedStore.max} Eggs</span>
                    {qty > 0 && (qty > eggVault || qty < selectedStore.min || qty > selectedStore.max) && (
                      <span className="text-amber-600 font-extrabold flex items-center gap-1">
                        <i className="fa-solid fa-triangle-exclamation"></i>
                        {qty > eggVault
                          ? 'Exceeds Vault Balance'
                          : qty < selectedStore.min
                          ? 'Below Minimum Limit'
                          : 'Exceeds Store Maximum'}
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Interactive Cash Payout Simulator Readout */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0d2c20] via-[#153d2b] to-[#1c4e37] p-4 text-white shadow-lg border border-white/10">
                  <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-farm-lime/20 rounded-full blur-xl pointer-events-none"></div>

                  <div className="flex items-center justify-between relative z-10 mb-2">
                    <span className="text-[8.5px] font-black uppercase tracking-widest text-emerald-200">
                      Estimated Cash Payout
                    </span>
                    <span className="bg-black/30 px-2 py-0.5 rounded-full text-[8px] font-black text-farm-lime border border-white/10">
                      0% FEES • FREE
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between relative z-10">
                    <div className="font-poppins font-black text-2xl text-farm-lime tracking-tight drop-shadow-sm">
                      Rs {estimatedPayout.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <span className="text-[9px] font-extrabold text-white/70 uppercase tracking-widest">
                      PKR NET CASH
                    </span>
                  </div>

                  {/* Live Calculation Breakdown */}
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[9px] font-bold text-white/70 relative z-10">
                    <span>Rate Formula</span>
                    <span className="text-farm-gold font-extrabold">
                      {qty} Eggs × Rs {selectedStore.rate.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 3. Dynamic Gateway Fields (Viser-Form) */}
                <div className="custom-fields pt-1">
                  <div className="text-[9px] font-black text-farm-forest uppercase tracking-widest mb-1 pb-1 border-b border-[#e2ede0]">
                    Your Payout Account Information
                  </div>

                  {/* JazzCash Fields */}
                  {selectedMethod.name === 'Jazzcash' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          Account Title Name
                        </label>
                        <input
                          type="text"
                          value={accountTitle}
                          onChange={(e) => setAccountTitle(e.target.value)}
                          placeholder="e.g. Farmer Saqib"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          JazzCash Mobile Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 03001234567"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                    </div>
                  )}

                  {/* EasyPaisa Fields */}
                  {selectedMethod.name === 'EasyPaisa' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          EasyPaisa Mobile Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. 03001234567"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          Account Title Name
                        </label>
                        <input
                          type="text"
                          value={accountTitle}
                          onChange={(e) => setAccountTitle(e.target.value)}
                          placeholder="e.g. Farmer Saqib"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                    </div>
                  )}

                  {/* All Bank Pakistan Fields */}
                  {selectedMethod.name === 'All Bank Pakistan' && (
                    <div className="space-y-3 pt-2">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          Select Bank Name
                        </label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf cursor-pointer"
                        >
                          {['UBL', 'HBL', 'MEEZAN', 'Habib', 'Alfalah', 'Allied', 'Faisal'].map((b) => (
                            <option key={b} value={b}>
                              {b} Bank
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          Account Title Name
                        </label>
                        <input
                          type="text"
                          value={accountTitle}
                          onChange={(e) => setAccountTitle(e.target.value)}
                          placeholder="e.g. Saqib Ur Rehman"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase text-farm-forest mb-1">
                          IBAN / Account Number
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder="e.g. PK36MEZN0001234567890123"
                          required
                          className="w-full bg-[#f8faf7] border border-[#e2ede0] text-farm-deep text-xs font-bold px-3.5 py-2.5 rounded-xl outline-none focus:border-farm-leaf"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Grand 3D Confirmation CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || eggVault <= 0 || qty <= 0}
                  className="w-full btn-3d-sell text-white font-poppins font-black text-xs tracking-widest uppercase py-4 rounded-2xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2.5 shimmer-active disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <img
                    src={logoImg}
                    className="w-5 h-5 object-contain inline-block drop-shadow-md"
                    alt="Sell"
                  />
                  <span>
                    {isSubmitting
                      ? 'PROCESSING LIQUIDATION...'
                      : eggVault <= 0
                      ? 'VAULT EMPTY • HARVEST FIRST'
                      : 'CONFIRM & RECEIVE CASH'}
                  </span>
                  <i className="fa-solid fa-circle-arrow-right text-xs"></i>
                </button>

                {/* P2P Guarantee Shield Footer */}
                <div className="flex items-center justify-center gap-2 text-[9px] font-bold text-slate-400 pt-1 text-center">
                  <i className="fa-solid fa-shield-check text-emerald-600 text-xs"></i>
                  <span>100% Escrow Protected Liquidity • Instant Bank Transfer</span>
                </div>
              </div>
            </form>
          </div>
        )}
        {/* ============================================================== */}
        {/* MY WITHDRAWAL & CASHOUT ORDERS (PERSISTENT ACROSS REFRESH)     */}
        {/* ============================================================== */}
        <div className="mt-8 pt-5 border-t-2 border-emerald-900/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm shadow-xs border border-amber-200">
                <i className="fa-solid fa-hand-holding-dollar"></i>
              </span>
              <div>
                <h3 className="font-manrope font-black text-xs md:text-sm text-[#0d2c20] uppercase tracking-wide">
                  My Withdrawal &amp; Cashout Orders
                </h3>
                <span className="text-[8px] md:text-[9px] font-bold text-slate-500 block">
                  P2P Liquidation History • Database Synced
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={async () => {
                if (syncWithSupabase) {
                  await syncWithSupabase();
                  showToast('info', 'Withdrawal records refreshed from database.');
                }
              }}
              disabled={isLiveSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 font-manrope font-extrabold text-[9px] uppercase tracking-wider shadow-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              title="Refresh Withdrawal Status"
            >
              <i className={`fa-solid fa-arrows-rotate text-[10px] ${isLiveSyncing ? 'animate-spin' : ''}`}></i>
              <span>{isLiveSyncing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>

          {myWithdrawals.length === 0 ? (
            <div className="bg-white/80 border border-dashed border-[#ccdcc8] rounded-2xl p-6 text-center text-slate-400">
              <i className="fa-solid fa-money-bill-transfer text-3xl mb-2 text-slate-300"></i>
              <p className="text-xs font-bold text-slate-600">No withdrawal records found</p>
              <p className="text-[9.5px] text-slate-400 mt-0.5">
                Sell your eggs to verified merchant stores to cash out directly to Easypisa, JazzCash, or Bank.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {myWithdrawals.map((wd) => {
                const isPending = wd.status === 'Pending';
                const isCompleted = wd.status === 'Completed' || wd.status === 'Approved';
                const isRejected = wd.status === 'Rejected';

                return (
                  <div
                    key={wd.id}
                    className={`rounded-2xl p-3.5 border transition-all ${
                      isPending
                        ? 'bg-gradient-to-br from-amber-500/10 via-amber-50/80 to-white border-amber-300 shadow-sm'
                        : isCompleted
                        ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-50/50 to-white border-emerald-300 shadow-sm'
                        : 'bg-gradient-to-br from-rose-500/10 via-rose-50/50 to-white border-rose-300 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs font-black shadow-xs">
                          🥚
                        </span>
                        <div>
                          <strong className="font-manrope font-black text-xs text-[#0d2c20] block">
                            Sold {wd.eggs} Eggs
                          </strong>
                          <span className="text-[8.5px] font-bold text-slate-500">
                            to {wd.store || 'Verified Store'} (@ Rs. {wd.rate}/egg)
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="font-manrope font-black text-xs text-emerald-800">
                          +Rs. {Number(wd.amountPkr || 0).toLocaleString()} PKR
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
                          <span>{isPending ? 'Processing' : isCompleted ? 'Completed' : 'Rejected'}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9.5px] text-slate-600 py-2">
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Payout Method</span>
                        <strong className="text-slate-800 block truncate">
                          {wd.method} {wd.bankName ? `(${wd.bankName})` : ''}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[7.5px] uppercase font-bold">Account</span>
                        <span className="font-mono font-bold text-slate-800 block truncate">
                          {wd.accountTitle} • {wd.accountNumber}
                        </span>
                      </div>
                      <div className="col-span-2 text-[8px] text-slate-400 pt-0.5">
                        <span>Date: {new Date(wd.date || Date.now()).toLocaleString()}</span>
                      </div>
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
