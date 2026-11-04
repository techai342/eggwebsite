import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';

// Verified Merchants Catalog from rawafiles and reference engine
export const VERIFIED_MERCHANTS = [
  { id: '1', name: 'Sonica FORM STORE', rate: 32, rating: 5.0, trades: 6141, success: '97%', min: 1, max: 10000 },
  { id: '2', name: 'Usmaina Poltry Farm', rate: 30, rating: 4.0, trades: 1657, success: '100%', min: 1, max: 10000 },
  { id: '3', name: 'Syed poultry farm', rate: 33, rating: 5.0, trades: 5805, success: '100%', min: 1, max: 10000 }
];

// Payment Gateways for VIP Farm Asset acquisition
export const PAYMENT_GATEWAYS = [
  { code: '1000', name: 'Easypisa', currency: 'Pk', limitMin: 1.0, limitMax: 1000000.0, fee: 0 },
  { code: '1001', name: 'Jazz cash', currency: 'Pk', limitMin: 1.0, limitMax: 1000000.0, fee: 0 }
];

// Payout Methods for Egg Liquidation & Cashout
export const PAYOUT_METHODS = [
  { code: '1', name: 'Jazzcash', transferTime: '5-10 Min Transfer' },
  { code: '2', name: 'EasyPaisa', transferTime: '5-10 Min Transfer' },
  { code: '3', name: 'All Bank Pakistan', transferTime: '5-10 Min Transfer', supportedBanks: ['UBL', 'HBL', 'MEEZAN', 'Habib', 'Alfalah', 'Allied', 'Faisal'] }
];

// Standard VIP Farm Asset Specifications
export const ASSET_SPEC = {
  name: 'AL Rehman Meta Eggs',
  unitPrice: 500,
  dailyYieldPerUnit: 1,
  termDays: 120,
  totalYieldPerUnit: 120
};

// Storage Keys for Browser Persistence & Test Suite Cross-Compatibility
export const STORAGE_KEY_PRIMARY = 'alrehman_meta_eggs_state';
export const STORAGE_KEY_SECONDARY = 'alrehman_farm_data';

// Default Initial State if no persistence exists in storage
const DEFAULT_INITIAL_STATE = {
  user: {
    username: 'mrsaqib242',
    email: 'admin@gmail.com',
    name: 'Farmer Saqib',
    accountId: '#1197',
    upliner: 'N/A',
    isLoggedIn: true,
    password: 'password123',
    token: 'jwt_seed_session_1197'
  },
  credentials: {
    username: 'mrsaqib242',
    email: 'admin@gmail.com',
    password: 'password123'
  },
  balance: 1500.00,
  eggVault: 18,
  activeAssets: [
    {
      id: 'asset-1',
      name: 'AL Rehman Meta Eggs',
      units: 1,
      unitCost: 500,
      totalCost: 500,
      dailyYield: 1,
      termDays: 120,
      daysRemaining: 115,
      purchaseDate: '2026-10-30T10:00:00.000Z',
      gateway: 'Easypisa'
    }
  ],
  transactions: [
    {
      id: 'TRX-INIT-1',
      type: 'BUY',
      description: 'Purchased 1x AL Rehman Meta Eggs Units',
      amount: 500,
      unit: 'PKR',
      date: '2026-10-30T10:00:00.000Z',
      status: 'Completed',
      gateway: 'Easypisa'
    },
    {
      id: 'TRX-INIT-2',
      type: 'HARVEST',
      description: 'Collected 24h daily harvest from 1 active hens',
      amount: 1,
      unit: 'Egg',
      date: '2026-11-03T09:00:00.000Z',
      status: 'Completed'
    }
  ],
  withdrawals: [
    {
      id: 'WD-INIT-1',
      store: 'Sonica FORM STORE',
      eggs: 10,
      rate: 32,
      amountPkr: 320,
      method: 'EasyPaisa',
      accountTitle: 'Saqib Ali',
      accountNumber: '03001234567',
      bankName: null,
      date: '2026-11-01T14:30:00.000Z',
      status: 'Completed'
    }
  ],
  // 25 hours ago allows immediate harvest on first user action
  lastHarvest: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
  cooldownActive: false
};

// Safe localStorage loader supporting corruption resilience
function loadInitialState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_INITIAL_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PRIMARY) || window.localStorage.getItem(STORAGE_KEY_SECONDARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return {
          user: parsed.user || DEFAULT_INITIAL_STATE.user,
          credentials: parsed.credentials || DEFAULT_INITIAL_STATE.credentials,
          balance: typeof parsed.balance === 'number' ? parsed.balance : DEFAULT_INITIAL_STATE.balance,
          eggVault: typeof parsed.eggVault === 'number' ? parsed.eggVault : DEFAULT_INITIAL_STATE.eggVault,
          activeAssets: Array.isArray(parsed.activeAssets) ? parsed.activeAssets : DEFAULT_INITIAL_STATE.activeAssets,
          transactions: Array.isArray(parsed.transactions) ? parsed.transactions : DEFAULT_INITIAL_STATE.transactions,
          withdrawals: Array.isArray(parsed.withdrawals) ? parsed.withdrawals : DEFAULT_INITIAL_STATE.withdrawals,
          lastHarvest: parsed.lastHarvest || DEFAULT_INITIAL_STATE.lastHarvest,
          cooldownActive: parsed.cooldownActive !== undefined ? Boolean(parsed.cooldownActive) : DEFAULT_INITIAL_STATE.cooldownActive
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse farm state from localStorage, falling back to defaults:', err);
  }
  return DEFAULT_INITIAL_STATE;
}

export const FarmContext = createContext(null);

export function FarmProvider({ children, includeToastContainer = true }) {
  const initial = useMemo(() => loadInitialState(), []);

  const [user, setUser] = useState(initial.user);
  const [credentials, setCredentials] = useState(initial.credentials);
  const [balance, setBalance] = useState(initial.balance);
  const [eggVault, setEggVault] = useState(initial.eggVault);
  const [activeAssets, setActiveAssets] = useState(initial.activeAssets);
  const [transactions, setTransactions] = useState(initial.transactions);
  const [withdrawals, setWithdrawals] = useState(initial.withdrawals);
  const [lastHarvest, setLastHarvest] = useState(initial.lastHarvest);
  const [cooldownActive, setCooldownActive] = useState(initial.cooldownActive);
  const [toasts, setToasts] = useState([]);

  // Persist combined snapshot to both localStorage keys
  const persistState = useCallback((patch = {}) => {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const snapshot = {
        user: patch.user !== undefined ? patch.user : user,
        credentials: patch.credentials !== undefined ? patch.credentials : credentials,
        balance: patch.balance !== undefined ? patch.balance : balance,
        eggVault: patch.eggVault !== undefined ? patch.eggVault : eggVault,
        activeAssets: patch.activeAssets !== undefined ? patch.activeAssets : activeAssets,
        transactions: patch.transactions !== undefined ? patch.transactions : transactions,
        withdrawals: patch.withdrawals !== undefined ? patch.withdrawals : withdrawals,
        lastHarvest: patch.lastHarvest !== undefined ? patch.lastHarvest : lastHarvest,
        cooldownActive: patch.cooldownActive !== undefined ? patch.cooldownActive : cooldownActive
      };
      const raw = JSON.stringify(snapshot);
      window.localStorage.setItem(STORAGE_KEY_PRIMARY, raw);
      window.localStorage.setItem(STORAGE_KEY_SECONDARY, raw);
    } catch (err) {
      console.warn('Error saving state to localStorage:', err);
    }
  }, [user, credentials, balance, eggVault, activeAssets, transactions, withdrawals, lastHarvest, cooldownActive]);

  // Initial sync check on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = window.localStorage.getItem(STORAGE_KEY_PRIMARY) || window.localStorage.getItem(STORAGE_KEY_SECONDARY);
      if (!existing) {
        persistState();
      }
    }
  }, [persistState]);

  // Toast notification management
  const showToast = useCallback((type, message, duration = 3000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const newToast = { id, type: type || 'info', message, duration };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cooldown calculation helper
  const cooldownHoursRemaining = useMemo(() => {
    if (!cooldownActive || !lastHarvest) return 0;
    const last = new Date(lastHarvest).getTime();
    const now = Date.now();
    const hoursPassed = (now - last) / (1000 * 60 * 60);
    if (hoursPassed < 24) {
      return Math.ceil(24 - hoursPassed);
    }
    return 0;
  }, [cooldownActive, lastHarvest]);

  // Farmer Authentication
  const login = useCallback((usernameOrEmail, password) => {
    if (!usernameOrEmail || !password) {
      const msg = 'Username/Email and password are required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const trimmedInput = String(usernameOrEmail).trim().toLowerCase();
    const matchesUsername = trimmedInput === String(credentials.username).toLowerCase();
    const matchesEmail = trimmedInput === String(credentials.email).toLowerCase();
    const matchesPassword = password === credentials.password;

    if ((matchesUsername || matchesEmail) && matchesPassword) {
      const updatedUser = {
        ...user,
        username: credentials.username,
        email: credentials.email,
        name: user.name || 'Farmer Saqib',
        accountId: user.accountId || '#1197',
        upliner: user.upliner || 'N/A',
        isLoggedIn: true,
        token: `jwt_session_${Date.now()}`
      };
      setUser(updatedUser);
      persistState({ user: updatedUser });
      const msg = 'Login successful. Entering farm coop...';
      showToast('success', msg);
      return { success: true, message: msg };
    }

    const msg = 'Invalid credentials. Please verify username and secret password.';
    showToast('error', msg);
    return { success: false, message: msg };
  }, [credentials, user, persistState, showToast]);

  const logout = useCallback(() => {
    const updatedUser = {
      ...user,
      isLoggedIn: false,
      token: null
    };
    setUser(updatedUser);
    persistState({ user: updatedUser });
    const msg = 'You have been logged out successfully.';
    showToast('info', msg);
    return { success: true, message: msg };
  }, [user, persistState, showToast]);

  // Security Credentials Management
  const changePassword = useCallback((currentPassword, newPassword, confirmPassword) => {
    if (!currentPassword || !newPassword) {
      const msg = 'All password fields are required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (confirmPassword !== undefined && !confirmPassword) {
      const msg = 'All password fields are required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (currentPassword !== credentials.password) {
      const msg = 'Current password does not match existing records.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (newPassword.length < 6) {
      const msg = 'New password must be at least 6 characters.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      const msg = 'New password and confirm password do not match.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const updatedCreds = { ...credentials, password: newPassword };
    const updatedUser = { ...user, password: newPassword };

    setCredentials(updatedCreds);
    setUser(updatedUser);
    persistState({ credentials: updatedCreds, user: updatedUser });

    const msg = 'Password updated successfully. Protected by 256-bit SSL.';
    showToast('success', msg);
    return { success: true, message: msg };
  }, [credentials, user, persistState, showToast]);

  // VIP Farm Asset Acquisition
  const buyFarmAsset = useCallback(({ units, gateway, methodCode }) => {
    const qty = Number(units);
    if (!Number.isInteger(qty) || qty <= 0) {
      const msg = 'Units must be a positive integer.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (qty > 1000) {
      const msg = 'Maximum purchase limit per transaction is 1,000 units.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const validGateway = PAYMENT_GATEWAYS.find(
      (g) =>
        g.code === String(methodCode) ||
        (gateway && g.name.toLowerCase() === String(gateway).toLowerCase()) ||
        (gateway && String(gateway).toLowerCase().replace(/\s+/g, '') === g.name.toLowerCase().replace(/\s+/g, ''))
    );

    if (!validGateway) {
      const msg = 'Invalid payment gateway selected. Choose Easypisa or Jazz cash.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const cost = qty * ASSET_SPEC.unitPrice;
    const dailyYield = qty * ASSET_SPEC.dailyYieldPerUnit;
    const fullTermEggs = qty * ASSET_SPEC.totalYieldPerUnit;

    const newAsset = {
      id: `ASSET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: ASSET_SPEC.name,
      units: qty,
      unitCost: ASSET_SPEC.unitPrice,
      totalCost: cost,
      dailyYield: dailyYield,
      termDays: ASSET_SPEC.termDays,
      daysRemaining: ASSET_SPEC.termDays,
      purchaseDate: new Date().toISOString(),
      gateway: validGateway.name
    };

    const newTrx = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'BUY',
      description: `Purchased ${qty}x ${ASSET_SPEC.name} Units`,
      amount: cost,
      unit: 'PKR',
      date: new Date().toISOString(),
      status: 'Completed',
      gateway: validGateway.name
    };

    const updatedAssets = [...activeAssets, newAsset];
    const updatedTransactions = [newTrx, ...transactions];

    setActiveAssets(updatedAssets);
    setTransactions(updatedTransactions);
    persistState({ activeAssets: updatedAssets, transactions: updatedTransactions });

    const msg = `Successfully acquired ${qty} VIP Farm Units via ${validGateway.name}!`;
    showToast('success', msg);
    return {
      success: true,
      asset: newAsset,
      cost,
      dailyYield,
      fullTermEggs,
      message: msg
    };
  }, [activeAssets, transactions, persistState, showToast]);

  // 24-Hour Egg Harvest Engine
  const harvestEggs = useCallback((currentTime = new Date()) => {
    const current = new Date(currentTime);

    if (cooldownActive && lastHarvest) {
      const last = new Date(lastHarvest).getTime();
      const curTime = current.getTime();
      const hoursPassed = (curTime - last) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        const remainingHours = Math.ceil(24 - hoursPassed);
        const msg = `Harvest cooldown active. Please wait ${remainingHours} hour(s) before next collection.`;
        showToast('warning', msg);
        return {
          success: false,
          eggsCollected: 0,
          message: msg
        };
      }
    }

    const totalActiveUnits = activeAssets.reduce((sum, a) => sum + (Number(a.units) || 0), 0);
    if (totalActiveUnits === 0) {
      const msg = 'No active hen units available in your coop to produce eggs.';
      showToast('error', msg);
      return {
        success: false,
        eggsCollected: 0,
        message: msg
      };
    }

    const eggsYield = totalActiveUnits * ASSET_SPEC.dailyYieldPerUnit;
    const newVault = eggVault + eggsYield;
    const isoTime = current.toISOString();

    const newTrx = {
      id: `HRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'HARVEST',
      description: `Collected 24h daily harvest from ${totalActiveUnits} active hens`,
      amount: eggsYield,
      unit: 'Egg',
      date: isoTime,
      status: 'Completed'
    };

    const updatedTransactions = [newTrx, ...transactions];

    setEggVault(newVault);
    setLastHarvest(isoTime);
    setCooldownActive(true);
    setTransactions(updatedTransactions);

    persistState({
      eggVault: newVault,
      lastHarvest: isoTime,
      cooldownActive: true,
      transactions: updatedTransactions
    });

    const msg = `Harvested ${eggsYield} fresh eggs into your vault!`;
    showToast('success', msg);
    return {
      success: true,
      eggsCollected: eggsYield,
      eggVault: newVault,
      message: msg
    };
  }, [activeAssets, cooldownActive, lastHarvest, eggVault, transactions, persistState, showToast]);

  const resetCooldown = useCallback(() => {
    setCooldownActive(false);
    persistState({ cooldownActive: false });
  }, [persistState]);

  // Egg Liquidation & P2P Cashout
  const sellEggs = useCallback(({ storeId, storeName, rate, eggs, method, accountTitle, accountNumber, bankName }) => {
    const qty = Number(eggs);
    if (!Number.isFinite(qty) || qty <= 0) {
      const msg = 'Egg amount must be a positive number.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    if (qty > eggVault) {
      const msg = `Insufficient eggs in vault. Requested: ${qty}, Available: ${eggVault}`;
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    const merchant = VERIFIED_MERCHANTS.find(
      (m) =>
        (storeId && m.id === String(storeId)) ||
        (storeName && m.name.toLowerCase() === String(storeName).toLowerCase())
    );

    if (!merchant) {
      const msg = 'Invalid or unverified merchant store selected.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    if (qty < merchant.min || qty > merchant.max) {
      const msg = `Store trading limits violated. Must be between ${merchant.min} and ${merchant.max} eggs.`;
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    if (!accountTitle || !accountNumber) {
      const msg = 'Account title and account number are required for payout.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    const payoutMethod = PAYOUT_METHODS.find(
      (m) =>
        (method && m.name.toLowerCase() === String(method).toLowerCase()) ||
        (method && m.code === String(method))
    );

    if (!payoutMethod) {
      const msg = 'Invalid payout method selected.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    if (payoutMethod.name === 'All Bank Pakistan' && !bankName) {
      const msg = 'Bank name selection is required for bank transfer.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    const pkrGross = qty * merchant.rate;
    const pkrNet = pkrGross; // 0% transaction fee

    const newVault = eggVault - qty;
    const newBalance = balance + pkrNet;

    const withdrawalRecord = {
      id: `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      store: merchant.name,
      eggs: qty,
      rate: merchant.rate,
      amountPkr: pkrNet,
      method: payoutMethod.name,
      accountTitle,
      accountNumber,
      bankName: bankName || null,
      date: new Date().toISOString(),
      status: 'Completed'
    };

    const newTrx = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'SELL',
      description: `Sold ${qty} eggs to ${merchant.name} via ${payoutMethod.name}`,
      amount: pkrNet,
      unit: 'PKR',
      date: new Date().toISOString(),
      status: 'Completed'
    };

    const updatedWithdrawals = [withdrawalRecord, ...withdrawals];
    const updatedTransactions = [newTrx, ...transactions];

    setEggVault(newVault);
    setBalance(newBalance);
    setWithdrawals(updatedWithdrawals);
    setTransactions(updatedTransactions);

    persistState({
      eggVault: newVault,
      balance: newBalance,
      withdrawals: updatedWithdrawals,
      transactions: updatedTransactions
    });

    const msg = `Successfully sold ${qty} eggs for Rs. ${pkrNet.toFixed(2)} PKR!`;
    showToast('success', msg);
    return {
      success: true,
      pkrAmount: pkrNet,
      eggsSold: qty,
      rate: merchant.rate,
      eggVault: newVault,
      balance: newBalance,
      withdrawal: withdrawalRecord,
      message: msg
    };
  }, [eggVault, balance, withdrawals, transactions, persistState, showToast]);

  // Production Simulation Helper
  const simulateDays = useCallback((daysCount) => {
    let totalHarvested = 0;
    const totalActiveUnits = activeAssets.reduce((sum, a) => sum + a.units, 0);

    for (let day = 1; day <= daysCount; day++) {
      if (totalActiveUnits > 0) {
        const yieldPerDay = totalActiveUnits * ASSET_SPEC.dailyYieldPerUnit;
        totalHarvested += yieldPerDay;
      }
    }

    const newVault = eggVault + totalHarvested;
    setEggVault(newVault);
    persistState({ eggVault: newVault });
    return { daysSimulated: daysCount, totalHarvested, newVault };
  }, [activeAssets, eggVault, persistState]);

  // Farm Analytics Aggregator
  const analytics = useMemo(() => {
    const totalUnitsBought = activeAssets.reduce((sum, a) => sum + (Number(a.units) || 0), 0);
    const totalBuyVolumePkr = activeAssets.reduce(
      (sum, a) => sum + (Number(a.totalCost) || (Number(a.units) || 0) * (Number(a.unitCost) || 500)),
      0
    );
    const totalEggsSold = withdrawals.reduce((sum, w) => sum + (Number(w.eggs) || 0), 0);
    const totalSalesPkr = withdrawals.reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0);

    return {
      totalUnitsBought,
      totalBuyVolumePkr,
      totalEggsSold,
      totalSalesPkr,
      currentEggVault: eggVault,
      currentBalance: balance,
      activeAssetsCount: activeAssets.length,
      withdrawalsCount: withdrawals.length,
      transactionsCount: transactions.length
    };
  }, [activeAssets, withdrawals, eggVault, balance, transactions]);

  // Routing Helper & State (Hash + Path support for SPA zero-config routing)
  const getInitialRoute = () => {
    if (typeof window === 'undefined') return '/';
    const hash = window.location.hash.replace(/^#\/?/, '/');
    if (hash && hash !== '/') {
      return hash.startsWith('/') ? hash : '/' + hash;
    }
    const path = window.location.pathname;
    if (path && path !== '/' && path !== '/index.html') {
      return path;
    }
    return '/';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);

  const navigateTo = useCallback((targetPath) => {
    let cleanPath = targetPath || '/';
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;

    setCurrentRoute(cleanPath);
    if (typeof window !== 'undefined') {
      if (cleanPath === '/') {
        window.history.pushState({}, '', '/');
        if (window.location.hash) {
          window.location.hash = '';
        }
      } else {
        window.location.hash = '#' + cleanPath;
        window.history.pushState({}, '', cleanPath);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleRouteChange = () => {
      const hash = window.location.hash.replace(/^#\/?/, '/');
      if (hash && hash !== '/') {
        setCurrentRoute(hash.startsWith('/') ? hash : '/' + hash);
      } else {
        const path = window.location.pathname;
        if (path && path !== '/' && path !== '/index.html') {
          setCurrentRoute(path);
        } else {
          setCurrentRoute('/');
        }
      }
    };

    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const getAnalytics = useCallback(() => analytics, [analytics]);

  const contextValue = useMemo(() => ({
    user,
    setUser,
    credentials,
    setCredentials,
    balance,
    setBalance,
    eggVault,
    setEggVault,
    activeAssets,
    setActiveAssets,
    transactions,
    setTransactions,
    withdrawals,
    setWithdrawals,
    lastHarvest,
    setLastHarvest,
    cooldownActive,
    setCooldownActive,
    cooldownHoursRemaining,
    currentRoute,
    setCurrentRoute,
    navigateTo,
    toasts,
    showToast,
    removeToast,
    login,
    logout,
    changePassword,
    buyFarmAsset,
    harvestEggs,
    resetCooldown,
    sellEggs,
    simulateDays,
    getAnalytics,
    analytics,
    VERIFIED_MERCHANTS,
    PAYMENT_GATEWAYS,
    PAYOUT_METHODS,
    ASSET_SPEC
  }), [
    user,
    credentials,
    balance,
    eggVault,
    activeAssets,
    transactions,
    withdrawals,
    lastHarvest,
    cooldownActive,
    cooldownHoursRemaining,
    currentRoute,
    navigateTo,
    toasts,
    showToast,
    removeToast,
    login,
    logout,
    changePassword,
    buyFarmAsset,
    harvestEggs,
    resetCooldown,
    sellEggs,
    simulateDays,
    getAnalytics,
    analytics
  ]);

  return (
    <FarmContext.Provider value={contextValue}>
      {children}
      {includeToastContainer && <ToastContainer />}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
}
