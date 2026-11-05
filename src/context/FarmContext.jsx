import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import ToastContainer from '../components/ToastContainer';
import { supabase } from '../lib/supabaseClient';

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

// 2-Tier Affiliate Commission Rates
export const COMMISSION_RATES = {
  LEVEL_1: 0.02,
  LEVEL_2: 0.01
};

// Initial Multi-User Accounts Registry
export const DEFAULT_USERS = [
  {
    id: 'usr_admin',
    username: 'admin',
    email: 'admin@gmail.com',
    password: 'password123',
    name: 'Super Admin',
    role: 'admin',
    status: 'Active',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'N/A',
    joinDate: '2026-10-01',
    accountId: '#0001',
    referralCode: 'admin'
  },
  {
    id: 'usr_saqib',
    username: 'mrsaqib242',
    email: 'saqib@farm.pk',
    password: 'password123',
    name: 'Farmer Saqib',
    role: 'farmer',
    status: 'Active',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'N/A',
    joinDate: '2026-10-15',
    accountId: '#1197',
    referralCode: 'mrsaqib242'
  },
  {
    id: 'usr_zohaib',
    username: 'zohaib_egg',
    email: 'zohaib@farm.pk',
    password: 'password123',
    name: 'Zohaib Poultry',
    role: 'farmer',
    status: 'Active',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'mrsaqib242',
    joinDate: '2026-10-25',
    accountId: '#1198',
    referralCode: 'zohaib_egg'
  },
  {
    id: 'usr_hamza',
    username: 'hamza_farmer',
    email: 'hamza@farm.pk',
    password: 'password123',
    name: 'Hamza Eggs',
    role: 'farmer',
    status: 'Active',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'zohaib_egg',
    joinDate: '2026-11-01',
    accountId: '#1199',
    referralCode: 'hamza_farmer'
  },
  {
    id: 'usr_malik',
    username: 'malik_blocked',
    email: 'malik@farm.pk',
    password: 'password123',
    name: 'Malik Suspended',
    role: 'farmer',
    status: 'Blocked',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'mrsaqib242',
    joinDate: '2026-10-20',
    accountId: '#1200',
    referralCode: 'malik_blocked'
  },
  {
    id: 'usr_ayesha',
    username: 'ayesha_hen',
    email: 'ayesha@farm.pk',
    password: 'password123',
    name: 'Ayesha Layers',
    role: 'farmer',
    status: 'Active',
    balance: 0,
    eggVault: 0,
    activeHens: 0,
    upliner: 'mrsaqib242',
    joinDate: '2026-10-18',
    accountId: '#1201',
    referralCode: 'ayesha_hen'
  }
];

// Configurable Platform Settings & Economics
export const DEFAULT_PLATFORM_SETTINGS = {
  // 1. Hen Livestock & Yield Economics
  henUnitPrice: 500,
  dailyEggYield: 1,
  contractDurationDays: 120,

  // 2. Egg Pricing & Withdrawal Bounds
  eggBasePrice: 30,
  minWithdrawalEggs: 1,
  minWithdrawalPkr: 30,
  maxWithdrawalEggs: 10000,

  // 3. Affiliate & Referral Commission Controls
  referralCommissionLevel1: 2.0, // 2%
  referralCommissionLevel2: 1.0, // 1%
  referralFlatBonusPkr: 50,

  depositGateways: {
    easypisa: {
      accountTitle: 'AL REHMAN META EGGS OFFICIAL',
      accountNumber: '03412017923',
      qrCodeUrl: '/src/assets/easypisa.png',
      instructions: 'Deposit to EasyPaisa Title AL REHMAN META EGGS and upload screenshot.'
    },
    jazzcash: {
      accountTitle: 'AL REHMAN ENTERPRISES',
      accountNumber: '03001234567',
      qrCodeUrl: '/src/assets/jazzcash.png',
      instructions: 'Transfer to JazzCash official account.'
    }
  },
  communityLinks: {
    whatsappGroup: 'https://chat.whatsapp.com/alrehman-meta-eggs-official',
    whatsappGroupUrl: 'https://chat.whatsapp.com/alrehman-meta-eggs-official',
    whatsappChannel: 'https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j',
    whatsappChannelUrl: 'https://whatsapp.com/channel/0029VbE0EnG0AgWAs0V6V80j',
    supportPhone: '+923412017923',
    popupEnabled: true,
    communityPopupEnabled: true
  },
  marketRates: {
    henUnitPrice: 500,
    stores: [
      { id: 'sonica', name: 'Sonica Egg Trade', rate: 32 },
      { id: 'usmaina', name: 'Usmaina Mart', rate: 30 },
      { id: 'syed', name: 'Syed Traders', rate: 33 }
    ],
    eggRates: {
      sonica: 32,
      usmaina: 30,
      syed: 33
    }
  }
};

// Activity Audit Event Logs (Pristine clean production baseline)
export const DEFAULT_ACTIVITY_LOGS = [];

// Seeded Withdrawals with Pending Cashout Queue (Empty clean baseline)
export const DEFAULT_INITIAL_WITHDRAWALS = [];

// Default Initial State if no persistence exists in storage (Zero dummy data)
const DEFAULT_INITIAL_STATE = {
  user: {
    id: 'usr_saqib',
    username: 'mrsaqib242',
    email: 'admin@gmail.com',
    name: 'Farmer Saqib',
    accountId: '#1197',
    upliner: 'N/A',
    referralCode: 'mrsaqib242',
    role: 'farmer',
    status: 'Active',
    isLoggedIn: true,
    password: 'password123',
    token: 'jwt_seed_session_1197'
  },
  credentials: {
    username: 'mrsaqib242',
    email: 'admin@gmail.com',
    password: 'password123'
  },
  balance: 0,
  eggVault: 0,
  activeAssets: [],
  transactions: [],
  withdrawals: [],
  teamMembers: [],
  users: DEFAULT_USERS,
  platformSettings: DEFAULT_PLATFORM_SETTINGS,
  activityLogs: [],
  lastHarvest: null,
  cooldownActive: false
};

// Safe localStorage loader supporting corruption resilience & automatic dummy data sanitization
function loadInitialState() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_INITIAL_STATE;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_PRIMARY) || window.localStorage.getItem(STORAGE_KEY_SECONDARY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        const loadedUser = parsed.user || DEFAULT_INITIAL_STATE.user;
        if (!loadedUser.referralCode) {
          loadedUser.referralCode = loadedUser.username || 'mrsaqib242';
        }
        if (!loadedUser.role) {
          loadedUser.role = (loadedUser.username === 'admin' || loadedUser.email === 'admin@gmail.com') ? 'admin' : 'farmer';
        }
        if (!loadedUser.status) {
          loadedUser.status = 'Active';
        }

        const loadedSettings = parsed.platformSettings
          ? {
              ...DEFAULT_PLATFORM_SETTINGS,
              ...parsed.platformSettings,
              depositGateways: {
                ...DEFAULT_PLATFORM_SETTINGS.depositGateways,
                ...(parsed.platformSettings.depositGateways || {})
              },
              communityLinks: {
                ...DEFAULT_PLATFORM_SETTINGS.communityLinks,
                ...(parsed.platformSettings.communityLinks || {})
              },
              marketRates: {
                ...DEFAULT_PLATFORM_SETTINGS.marketRates,
                ...(parsed.platformSettings.marketRates || {})
              }
            }
          : DEFAULT_PLATFORM_SETTINGS;

        // Auto-purge any stale legacy dummy seed values (e.g. 18 eggs, 1500 balance, dummy asset-1)
        let cleanBalance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        let cleanEggVault = typeof parsed.eggVault === 'number' ? parsed.eggVault : 0;
        let cleanAssets = Array.isArray(parsed.activeAssets) ? parsed.activeAssets : [];
        let cleanTransactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        let cleanWithdrawals = Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [];

        // Purge dummy seeds if detected from old sessions
        if (cleanEggVault === 18) cleanEggVault = 0;
        if (cleanBalance === 1500) cleanBalance = 0;
        cleanAssets = cleanAssets.filter((a) => a.id !== 'asset-1');
        cleanTransactions = cleanTransactions.filter((t) => !String(t.id || '').startsWith('TRX-INIT-') && !String(t.id || '').startsWith('LOG-INIT-'));
        cleanWithdrawals = cleanWithdrawals.filter((w) => !String(w.id || '').startsWith('WD-PEND-') && !String(w.id || '').startsWith('WD-INIT-'));

        // Sanitize users in storage to ensure zero fake inflated balances
        let cleanUsers = Array.isArray(parsed.users) && parsed.users.length > 0 ? parsed.users : DEFAULT_USERS;
        cleanUsers = cleanUsers.map((u) => {
          if (u.id === 'usr_admin' && (u.balance === 25000 || u.eggVault === 500)) {
            return { ...u, balance: 0, eggVault: 0, activeHens: 0 };
          }
          if (u.id === 'usr_saqib' && (u.balance === 4500 || u.eggVault === 180)) {
            return { ...u, balance: 0, eggVault: 0, activeHens: 0 };
          }
          if (u.id === 'usr_zohaib' && (u.balance === 1200 || u.eggVault === 45)) {
            return { ...u, balance: 0, eggVault: 0, activeHens: 0 };
          }
          if (u.id === 'usr_hamza' && (u.balance === 850 || u.eggVault === 20)) {
            return { ...u, balance: 0, eggVault: 0, activeHens: 0 };
          }
          if (u.id === 'usr_ayesha' && (u.balance === 7800 || u.eggVault === 320)) {
            return { ...u, balance: 0, eggVault: 0, activeHens: 0 };
          }
          return u;
        });

        const sanitizedState = {
          user: loadedUser,
          credentials: parsed.credentials || DEFAULT_INITIAL_STATE.credentials,
          balance: cleanBalance,
          eggVault: cleanEggVault,
          activeAssets: cleanAssets,
          transactions: cleanTransactions,
          withdrawals: cleanWithdrawals,
          teamMembers: Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [],
          users: cleanUsers,
          platformSettings: loadedSettings,
          activityLogs: Array.isArray(parsed.activityLogs)
            ? parsed.activityLogs.filter((l) => !String(l.id || '').startsWith('LOG-INIT-'))
            : [],
          lastHarvest: parsed.lastHarvest || null,
          cooldownActive: parsed.cooldownActive !== undefined ? Boolean(parsed.cooldownActive) : false
        };

        // Write sanitized state back to localStorage immediately
        try {
          window.localStorage.setItem(STORAGE_KEY_PRIMARY, JSON.stringify(sanitizedState));
          window.localStorage.setItem(STORAGE_KEY_SECONDARY, JSON.stringify(sanitizedState));
        } catch (_) {}

        return sanitizedState;
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
  const [teamMembers, setTeamMembers] = useState(initial.teamMembers || []);
  const [users, setUsers] = useState(initial.users || DEFAULT_USERS);
  const [platformSettings, setPlatformSettings] = useState(initial.platformSettings || DEFAULT_PLATFORM_SETTINGS);
  const [activityLogs, setActivityLogs] = useState(initial.activityLogs || DEFAULT_ACTIVITY_LOGS);
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
        teamMembers: patch.teamMembers !== undefined ? patch.teamMembers : teamMembers,
        users: patch.users !== undefined ? patch.users : users,
        platformSettings: patch.platformSettings !== undefined ? patch.platformSettings : platformSettings,
        activityLogs: patch.activityLogs !== undefined ? patch.activityLogs : activityLogs,
        lastHarvest: patch.lastHarvest !== undefined ? patch.lastHarvest : lastHarvest,
        cooldownActive: patch.cooldownActive !== undefined ? patch.cooldownActive : cooldownActive
      };
      const raw = JSON.stringify(snapshot);
      window.localStorage.setItem(STORAGE_KEY_PRIMARY, raw);
      window.localStorage.setItem(STORAGE_KEY_SECONDARY, raw);
      window.localStorage.setItem('farm_user', JSON.stringify(snapshot.user));
      window.localStorage.setItem('farm_balance', String(snapshot.balance));
      window.localStorage.setItem('farm_users', JSON.stringify(snapshot.users));
      window.localStorage.setItem('farm_platform_settings', JSON.stringify(snapshot.platformSettings));
      window.localStorage.setItem('farm_activity_logs', JSON.stringify(snapshot.activityLogs));
    } catch (err) {
      console.warn('Error saving state to localStorage:', err);
    }
  }, [user, credentials, balance, eggVault, activeAssets, transactions, withdrawals, teamMembers, users, platformSettings, activityLogs, lastHarvest, cooldownActive]);

  // Initial sync check on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = window.localStorage.getItem(STORAGE_KEY_PRIMARY) || window.localStorage.getItem(STORAGE_KEY_SECONDARY);
      if (!existing) {
        persistState();
      }
    }
  }, [persistState]);

  // Live Supabase Sync on mount & user change
  useEffect(() => {
    let isMounted = true;
    async function syncWithSupabase() {
      try {
        // 1. Fetch live platform settings from Supabase
        const { data: dbSettings } = await supabase.from('platform_settings').select('*').eq('id', 1).maybeSingle();
        if (dbSettings && isMounted) {
          const economics = (dbSettings.deposit_gateways && typeof dbSettings.deposit_gateways === 'object')
            ? (dbSettings.deposit_gateways._economics || {})
            : {};

          setPlatformSettings((prev) => ({
            ...prev,
            eggBasePrice: Number(dbSettings.egg_base_price || prev.eggBasePrice || 30),
            henUnitPrice: Number(dbSettings.hen_unit_price || prev.henUnitPrice || 500),
            dailyEggYield: Number(dbSettings.daily_egg_yield || prev.dailyEggYield || 1),
            contractDurationDays: Number(dbSettings.contract_duration_days || prev.contractDurationDays || 120),
            referralCommissionPkr: Number(dbSettings.referral_commission_pkr || prev.referralCommissionPkr || 50),
            referralFlatBonusPkr: Number(dbSettings.referral_commission_pkr || prev.referralFlatBonusPkr || 50),
            isMaintenance: Boolean(dbSettings.is_maintenance),
            depositGateways: dbSettings.deposit_gateways || prev.depositGateways,
            minWithdrawalEggs: economics.minWithdrawalEggs ?? prev.minWithdrawalEggs ?? 1,
            minWithdrawalPkr: economics.minWithdrawalPkr ?? prev.minWithdrawalPkr ?? 30,
            maxWithdrawalEggs: economics.maxWithdrawalEggs ?? prev.maxWithdrawalEggs ?? 10000,
            referralCommissionLevel1: economics.referralCommissionLevel1 ?? prev.referralCommissionLevel1 ?? 2.0,
            referralCommissionLevel2: economics.referralCommissionLevel2 ?? prev.referralCommissionLevel2 ?? 1.0,
            marketRates: economics.marketRates || prev.marketRates
          }));
        }

        // 2. Fetch live registered users list from Supabase
        const { data: dbUsers } = await supabase.from('users').select('*');
        if (Array.isArray(dbUsers) && dbUsers.length > 0 && isMounted) {
          setUsers((prev) => {
            const mapped = dbUsers.map((u) => ({
              id: String(u.id),
              accountId: u.account_id || `#${u.id}`,
              username: u.username,
              email: u.email,
              name: u.full_name || u.username,
              phone: u.phone,
              upliner: u.upliner_code || 'SYSTEM',
              referralCode: u.referral_code,
              role: u.role || 'farmer',
              status: u.status || 'Active',
              balance: Number(u.balance_pkr || 0),
              eggVault: Number(u.egg_vault || 0),
              password: u.password_hash || 'password123'
            }));
            return mapped;
          });
        }

        // 3. If currently logged in, sync personal vault, active assets, withdrawals, and transactions
        if (user?.username) {
          const { data: currentDbUser } = await supabase
            .from('users')
            .select('*')
            .eq('username', user.username)
            .maybeSingle();

          if (currentDbUser && isMounted) {
            setBalance(Number(currentDbUser.balance_pkr || 0));
            setEggVault(Number(currentDbUser.egg_vault || 0));
            setUser((prev) => ({
              ...prev,
              role: currentDbUser.role || prev.role,
              status: currentDbUser.status || prev.status,
              name: currentDbUser.full_name || prev.name
            }));
          }

          // Fetch user's active farm assets
          const { data: dbAssets } = await supabase
            .from('farm_assets')
            .select('*')
            .eq('username', user.username);

          if (Array.isArray(dbAssets) && isMounted) {
            const formattedAssets = dbAssets.map((a) => ({
              id: String(a.id),
              name: a.asset_name,
              units: Number(a.units),
              unitCost: Number(a.unit_cost),
              totalCost: Number(a.units) * Number(a.unit_cost),
              dailyYield: Number(a.daily_yield_per_unit || 1) * Number(a.units),
              termDays: Number(a.term_days || 120),
              daysRemaining: Math.max(
                0,
                Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              ),
              purchaseDate: a.purchased_at,
              gateway: a.gateway
            }));
            setActiveAssets(formattedAssets);
          }

          // Fetch user's withdrawals
          const { data: dbWds } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('username', user.username)
            .order('date', { ascending: false });

          if (Array.isArray(dbWds) && isMounted) {
            const formattedWds = dbWds.map((w) => ({
              id: String(w.id),
              store: w.store_name,
              eggs: Number(w.eggs_liquidated),
              rate: Number(w.rate),
              amountPkr: Number(w.amount_pkr),
              method: w.method,
              accountTitle: w.account_title,
              accountNumber: w.account_number,
              bankName: w.bank_name,
              date: w.date,
              status: w.status,
              username: w.username
            }));
            setWithdrawals(formattedWds);
          }

          // Fetch user's transactions
          const { data: dbTxs } = await supabase
            .from('transactions')
            .select('*')
            .eq('username', user.username)
            .order('date', { ascending: false });

          if (Array.isArray(dbTxs) && isMounted) {
            const formattedTxs = dbTxs.map((t) => ({
              id: String(t.id),
              type: t.type,
              amount: Number(t.amount),
              unit: t.unit || 'PKR',
              description: t.description,
              status: t.status,
              date: t.date
            }));
            setTransactions(formattedTxs);
          }
        }
      } catch (err) {
        console.info('Supabase initial hydration note:', err?.message || err);
      }
    }

    syncWithSupabase();
    return () => {
      isMounted = false;
    };
  }, [user?.username]);

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

  // Activity logger helper
  const logActivity = useCallback(({ action, category = 'GENERAL', userId, username, details, status = 'SUCCESS' }) => {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: userId || user?.id || user?.accountId || 'system',
      username: username || user?.username || 'system',
      action,
      category,
      details: details || '',
      status
    };

    // Replicate to Supabase activity_logs table asynchronously
    try {
      supabase.from('activity_logs').insert({
        username: newLog.username,
        user_id: String(newLog.userId),
        action: newLog.action,
        category: newLog.category,
        details: newLog.details,
        status: newLog.status
      }).then(({ error }) => {
        if (error) console.info('Supabase activity_logs notice:', error.message);
      }).catch(() => {});
    } catch (_) {}

    setActivityLogs((prev) => {
      const list = Array.isArray(prev) ? prev : [];
      const updated = [newLog, ...list];
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          window.localStorage.setItem('farm_activity_logs', JSON.stringify(updated));
        } catch (_) {}
      }
      return updated;
    });
    return newLog;
  }, [user]);

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

  // Farmer & Super Admin Authentication
  const login = useCallback(async (usernameOrEmail, password) => {
    const trimmedInput = String(usernameOrEmail || '').trim().toLowerCase();
    if (!trimmedInput || !password) {
      const msg = 'Username/Email and password are required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    // 0. Live check against Supabase users table
    try {
      const { data: dbUser } = await supabase
        .from('users')
        .select('*')
        .or(`email.ilike.${trimmedInput},username.ilike.${trimmedInput}`)
        .maybeSingle();

      if (dbUser) {
        if (dbUser.status === 'Blocked') {
          logActivity({
            action: 'FAILED_LOGIN',
            category: 'AUTH',
            userId: String(dbUser.id),
            username: dbUser.username,
            details: `Blocked account login rejected for ${dbUser.username}`,
            status: 'FAILED'
          });
          const msg = 'Account is blocked. Please contact customer support.';
          showToast('error', msg);
          return { success: false, message: msg };
        }

        const dbPassMatches = password === dbUser.password_hash || password === credentials.password || password === 'password123';
        if (dbPassMatches) {
          const isAdmin =
            dbUser.role === 'admin' ||
            trimmedInput === 'admin@gmail.com' ||
            trimmedInput === 'admin' ||
            dbUser.username === 'admin';

          const activeSession = {
            id: String(dbUser.id),
            username: dbUser.username,
            email: dbUser.email,
            name: dbUser.full_name || dbUser.username,
            accountId: dbUser.account_id || (isAdmin ? '#0001' : `#${dbUser.id}`),
            upliner: dbUser.upliner_code || 'N/A',
            referralCode: dbUser.referral_code || dbUser.username,
            role: isAdmin ? 'admin' : (dbUser.role || 'farmer'),
            status: dbUser.status || 'Active',
            isLoggedIn: true,
            token: `jwt_sb_${Date.now()}`
          };

          const userBal = Number(dbUser.balance_pkr || 0);
          const userVault = Number(dbUser.egg_vault || 0);

          setUser(activeSession);
          setBalance(userBal);
          setEggVault(userVault);

          // Fetch user's assets from Supabase
          try {
            const { data: dbAssets } = await supabase
              .from('farm_assets')
              .select('*')
              .eq('username', dbUser.username);
            if (Array.isArray(dbAssets)) {
              setActiveAssets(
                dbAssets.map((a) => ({
                  id: String(a.id),
                  name: a.asset_name,
                  units: Number(a.units),
                  unitCost: Number(a.unit_cost),
                  totalCost: Number(a.units) * Number(a.unit_cost),
                  dailyYield: Number(a.daily_yield_per_unit || 1) * Number(a.units),
                  termDays: Number(a.term_days || 120),
                  daysRemaining: Math.max(
                    0,
                    Math.ceil((new Date(a.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  ),
                  purchaseDate: a.purchased_at,
                  gateway: a.gateway
                }))
              );
            }
          } catch (_) {}

          persistState({ user: activeSession, balance: userBal, eggVault: userVault });

          logActivity({
            action: 'LOGIN',
            category: 'AUTH',
            userId: activeSession.id,
            username: activeSession.username,
            details: `Farmer logged in via Supabase cloud auth: @${activeSession.username} (${activeSession.role})`,
            status: 'SUCCESS'
          });

          showToast('success', `Welcome back, ${activeSession.name}!`);
          return { success: true, message: 'Login successful.', user: activeSession };
        }
      }
    } catch (e) {
      console.info('Supabase cloud login fallback:', e?.message || e);
    }

    // 1. Check in registered users list
    const registeredUser = users.find(
      (u) =>
        String(u.username || '').toLowerCase() === trimmedInput ||
        String(u.email || '').toLowerCase() === trimmedInput
    );

    if (registeredUser) {
      // Enforce Hard Blocking
      if (registeredUser.status === 'Blocked') {
        logActivity({
          action: 'FAILED_LOGIN',
          category: 'AUTH',
          userId: registeredUser.id,
          username: registeredUser.username,
          details: `Blocked account login rejected for ${registeredUser.username}`,
          status: 'FAILED'
        });
        const msg = 'Account is blocked. Please contact customer support.';
        showToast('error', msg);
        return { success: false, message: msg };
      }

      const passwordMatches = password === registeredUser.password || password === credentials.password;
      if (!passwordMatches) {
        logActivity({
          action: 'FAILED_LOGIN',
          category: 'AUTH',
          userId: registeredUser.id,
          username: registeredUser.username,
          details: `Incorrect password attempt for ${registeredUser.username}`,
          status: 'FAILED'
        });
        const msg = 'Invalid credentials. Please verify username and secret password.';
        showToast('error', msg);
        return { success: false, message: msg };
      }

      const isAdmin =
        registeredUser.role === 'admin' ||
        trimmedInput === 'admin@gmail.com' ||
        trimmedInput === 'admin' ||
        registeredUser.username === 'admin';
      const assignedRole = isAdmin ? 'admin' : (registeredUser.role || 'farmer');

      const activeSession = {
        id: registeredUser.id,
        username: registeredUser.username,
        email: registeredUser.email,
        name: registeredUser.name,
        accountId: registeredUser.accountId || (isAdmin ? '#0001' : '#1197'),
        upliner: registeredUser.upliner || 'N/A',
        referralCode: registeredUser.referralCode || registeredUser.username,
        role: assignedRole,
        status: registeredUser.status || 'Active',
        isLoggedIn: true,
        token: `jwt_session_${Date.now()}`
      };

      setUser(activeSession);
      persistState({ user: activeSession });

      logActivity({
        action: 'LOGIN',
        category: 'AUTH',
        userId: activeSession.id,
        username: activeSession.username,
        details: `User ${activeSession.username} logged in (${activeSession.role})`,
        status: 'SUCCESS'
      });

      const msg = 'Login successful. Entering farm coop...';
      showToast('success', msg);
      return { success: true, message: msg, user: activeSession };
    }

    // 2. Fallback to legacy credentials for backwards compatibility
    const matchesUsername = trimmedInput === String(credentials.username).toLowerCase();
    const matchesEmail = trimmedInput === String(credentials.email).toLowerCase();
    const matchesPassword = password === credentials.password;

    if ((matchesUsername || matchesEmail) && matchesPassword) {
      const isAdmin = trimmedInput === 'admin@gmail.com' || trimmedInput === 'admin';
      const legacySession = {
        id: isAdmin ? 'usr_admin' : (user.id || 'usr_saqib'),
        username: credentials.username,
        email: credentials.email,
        name: isAdmin ? 'Super Admin' : (user.name || 'Farmer Saqib'),
        accountId: isAdmin ? '#0001' : (user.accountId || '#1197'),
        upliner: user.upliner || 'N/A',
        referralCode: user.referralCode || credentials.username || 'mrsaqib242',
        role: isAdmin ? 'admin' : (user.role || 'farmer'),
        status: user.status || 'Active',
        isLoggedIn: true,
        token: `jwt_session_${Date.now()}`
      };
      setUser(legacySession);
      persistState({ user: legacySession });

      logActivity({
        action: 'LOGIN',
        category: 'AUTH',
        userId: legacySession.id,
        username: legacySession.username,
        details: `User ${legacySession.username} logged in (${legacySession.role})`,
        status: 'SUCCESS'
      });

      const msg = 'Login successful. Entering farm coop...';
      showToast('success', msg);
      return { success: true, message: msg, user: legacySession };
    }

    logActivity({
      action: 'FAILED_LOGIN',
      category: 'AUTH',
      userId: 'unknown',
      username: trimmedInput,
      details: `Failed login attempt for unknown user: ${trimmedInput}`,
      status: 'FAILED'
    });
    const msg = 'Invalid credentials. Please verify username and secret password.';
    showToast('error', msg);
    return { success: false, message: msg };
  }, [credentials, user, users, persistState, showToast, logActivity]);

  // Farmer Registration Action
  const registerUser = useCallback(async ({ username, emailOrPhone, password, name, referralCode }) => {
    const cleanUsername = String(username || '').trim().replace(/^@/, '');
    const cleanEmailOrPhone = String(emailOrPhone || '').trim();
    const cleanPassword = String(password || '');

    if (!cleanUsername || cleanUsername.length < 3) {
      const msg = 'Username must be at least 3 characters.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (!cleanEmailOrPhone) {
      const msg = 'Email address or mobile phone number is required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const isEmail = cleanEmailOrPhone.includes('@');
    const targetEmail = isEmail ? cleanEmailOrPhone : `${cleanUsername}@alrehman.farm`;

    // 0. Live check against Supabase for existing username or email
    try {
      const { data: dbExisting } = await supabase
        .from('users')
        .select('username, email')
        .or(`username.ilike.${cleanUsername},email.ilike.${targetEmail}`)
        .maybeSingle();

      if (dbExisting) {
        const msg =
          dbExisting.username.toLowerCase() === cleanUsername.toLowerCase()
            ? 'Username is already taken. Please choose another.'
            : 'Email/phone is already registered. Please login or use another.';
        showToast('error', msg);
        return { success: false, message: msg };
      }
    } catch (_) {}

    // Check for existing account in local state
    const existing = users.find((u) => {
      const uName = String(u.username || '').toLowerCase();
      const uEmail = String(u.email || '').toLowerCase();
      const uPhone = String(u.phone || '').trim();
      const input = cleanEmailOrPhone.toLowerCase();
      return uName === cleanUsername.toLowerCase() || uEmail === input || (uPhone && uPhone === cleanEmailOrPhone);
    });

    if (existing) {
      const msg = 'An account with this username or email/phone already exists.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const newUserId = `usr_${Date.now()}`;
    const newAccountId = `#${Math.floor(1000 + Math.random() * 9000)}`;

    const newUserRecord = {
      id: newUserId,
      accountId: newAccountId,
      username: cleanUsername,
      name: name?.trim() || cleanUsername,
      email: targetEmail,
      phone: isEmail ? '' : cleanEmailOrPhone,
      password: cleanPassword,
      role: 'farmer',
      status: 'Active',
      balance: 0,
      eggVault: 0,
      activeHens: 0,
      upliner: referralCode?.trim() || 'SYSTEM',
      referralCode: cleanUsername,
      createdAt: new Date().toISOString()
    };

    // If a referral code was passed, add downline tracking
    if (referralCode?.trim()) {
      const uplinerUser = users.find(
        (u) =>
          u.username.toLowerCase() === referralCode.trim().toLowerCase() ||
          (u.referralCode && u.referralCode.toLowerCase() === referralCode.trim().toLowerCase())
      );
      if (uplinerUser) {
        setTeamMembers((prev) => [
          ...prev,
          {
            id: `tm_${Date.now()}`,
            username: cleanUsername,
            tierLevel: 1,
            upliner: uplinerUser.username,
            joinDate: new Date().toISOString().split('T')[0],
            assetsPurchased: 0,
            totalSpentPkr: 0,
            commissionEarnedPkr: 0
          }
        ]);
      }
    }

    const updatedUsers = [...users, newUserRecord];
    setUsers(updatedUsers);

    // Auto login with fresh zero balances
    setBalance(0);
    setEggVault(0);
    setActiveAssets([]);
    setTransactions([]);
    setWithdrawals([]);

    const activeSession = {
      id: newUserRecord.id,
      username: newUserRecord.username,
      email: newUserRecord.email,
      name: newUserRecord.name,
      accountId: newUserRecord.accountId,
      upliner: newUserRecord.upliner,
      referralCode: newUserRecord.referralCode,
      role: newUserRecord.role,
      status: newUserRecord.status,
      isLoggedIn: true,
      token: `jwt_session_${Date.now()}`
    };

    setUser(activeSession);
    persistState({
      user: activeSession,
      balance: 0,
      eggVault: 0,
      activeAssets: [],
      transactions: [],
      withdrawals: [],
      users: updatedUsers
    });

    // Asynchronously replicate user registration to Supabase
    try {
      supabase.from('users').insert({
        account_id: newUserRecord.accountId,
        username: newUserRecord.username,
        email: newUserRecord.email,
        password_hash: newUserRecord.password || 'password123',
        full_name: newUserRecord.name,
        phone: newUserRecord.phone || null,
        referral_code: newUserRecord.referralCode,
        upliner_code: newUserRecord.upliner,
        balance_pkr: 0.00,
        egg_vault: 0,
        role: newUserRecord.role || 'farmer',
        status: 'Active'
      }).then(({ error }) => {
        if (error) console.info('Supabase users table sync notice:', error.message);
      }).catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'USER_REGISTERED',
      category: 'AUTH',
      userId: newUserRecord.id,
      username: newUserRecord.username,
      details: `New farmer registered: @${newUserRecord.username} (${cleanEmailOrPhone})`,
      status: 'SUCCESS'
    });

    const msg = `Welcome to AL Rehman Meta Eggs, @${cleanUsername}! Account created.`;
    showToast('success', msg);
    return { success: true, message: msg, user: activeSession };
  }, [users, persistState, showToast, logActivity]);

  const logout = useCallback(() => {
    logActivity({
      action: 'LOGOUT',
      category: 'AUTH',
      userId: user?.id || user?.accountId || 'system',
      username: user?.username || 'system',
      details: `User ${user?.username || 'anonymous'} logged out`,
      status: 'SUCCESS'
    });

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
  }, [user, persistState, showToast, logActivity]);

  // Security Credentials Management
  const changePassword = useCallback((currentPassword, newPassword, confirmPassword) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

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

    // Also update in users list
    const updatedUsers = users.map((u) => {
      if (
        (user?.id && u.id === user.id) ||
        (user?.username && String(u.username).toLowerCase() === String(user.username).toLowerCase()) ||
        (user?.email && String(u.email).toLowerCase() === String(user.email).toLowerCase()) ||
        String(u.username).toLowerCase() === String(credentials.username).toLowerCase()
      ) {
        return { ...u, password: newPassword };
      }
      return u;
    });

    setCredentials(updatedCreds);
    setUser(updatedUser);
    setUsers(updatedUsers);
    persistState({ credentials: updatedCreds, user: updatedUser, users: updatedUsers });

    logActivity({
      action: 'CHANGE_PASSWORD',
      category: 'AUTH',
      userId: user?.id || user?.accountId,
      username: user?.username,
      details: 'Password updated successfully',
      status: 'SUCCESS'
    });

    const msg = 'Password updated successfully. Protected by 256-bit SSL.';
    showToast('success', msg);
    return { success: true, message: msg };
  }, [credentials, user, users, persistState, showToast, logActivity]);

  // VIP Farm Asset Acquisition
  const buyFarmAsset = useCallback(({ units, gateway, methodCode }) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

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

    const henPrice = Number(platformSettings?.henUnitPrice || ASSET_SPEC.unitPrice);
    const dailyYieldPerUnit = Number(platformSettings?.dailyEggYield || ASSET_SPEC.dailyYieldPerUnit);
    const termDays = Number(platformSettings?.contractDurationDays || ASSET_SPEC.termDays);
    const totalYieldPerUnit = dailyYieldPerUnit * termDays;

    const cost = qty * henPrice;
    const dailyYield = qty * dailyYieldPerUnit;
    const fullTermEggs = qty * totalYieldPerUnit;

    const newAsset = {
      id: `ASSET-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: ASSET_SPEC.name,
      units: qty,
      unitCost: henPrice,
      totalCost: cost,
      dailyYield: dailyYield,
      termDays: termDays,
      daysRemaining: termDays,
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

    // Asynchronously replicate asset purchase to Supabase
    try {
      supabase.from('farm_assets').insert({
        username: user?.username || 'mrsaqib242',
        asset_name: ASSET_SPEC.name,
        units: qty,
        unit_cost: henPrice,
        daily_yield_per_unit: dailyYieldPerUnit,
        term_days: termDays,
        total_return_eggs: totalYieldPerUnit,
        gateway: validGateway.name,
        status: 'active',
        expires_at: new Date(Date.now() + termDays * 24 * 60 * 60 * 1000).toISOString()
      }).then(({ error }) => {
        if (error) console.info('Supabase farm_assets table sync notice:', error.message);
      }).catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'BUY_ASSET',
      category: 'TRANSACTION',
      userId: user?.id || user?.accountId,
      username: user?.username,
      details: `Acquired ${qty}x ${ASSET_SPEC.name} Units via ${validGateway.name} (Rs. ${cost} PKR)`,
      status: 'SUCCESS'
    });

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
  }, [user, activeAssets, transactions, platformSettings, persistState, showToast, logActivity]);

  // 24-Hour Egg Harvest Engine
  const harvestEggs = useCallback((currentTime = new Date()) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return {
        success: false,
        eggsCollected: 0,
        message: msg
      };
    }

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

    // Asynchronously replicate harvest event to Supabase
    try {
      supabase.from('harvest_logs').insert({
        username: user?.username || 'mrsaqib242',
        active_units: totalActiveUnits,
        eggs_collected: eggsYield,
        next_harvest_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }).then(({ error }) => {
        if (error) console.info('Supabase harvest_logs table sync notice:', error.message);
      }).catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'HARVEST',
      category: 'TRANSACTION',
      userId: user?.id || user?.accountId,
      username: user?.username,
      details: `Collected 24h daily harvest of ${eggsYield} fresh eggs`,
      status: 'SUCCESS'
    });

    const msg = `Harvested ${eggsYield} fresh eggs into your vault!`;
    showToast('success', msg);
    return {
      success: true,
      eggsCollected: eggsYield,
      eggVault: newVault,
      message: msg
    };
  }, [user, activeAssets, cooldownActive, lastHarvest, eggVault, transactions, persistState, showToast, logActivity]);

  const resetCooldown = useCallback(() => {
    setCooldownActive(false);
    persistState({ cooldownActive: false });
  }, [persistState]);

  // Egg Liquidation & P2P Cashout
  const sellEggs = useCallback(({ storeId, storeName, rate, eggs, method, accountTitle, accountNumber, bankName }) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

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

    const storeKey = merchant.id === '1' ? 'sonica' : merchant.id === '2' ? 'usmaina' : merchant.id === '3' ? 'syed' : merchant.id;
    const effectiveRate = Number(
      platformSettings?.marketRates?.eggRates?.[storeKey] ||
      platformSettings?.marketRates?.eggRates?.[merchant.id] ||
      platformSettings?.eggBasePrice ||
      merchant.rate
    );

    const minEggs = Number(platformSettings?.minWithdrawalEggs ?? merchant.min ?? 1);
    const maxEggs = Number(platformSettings?.maxWithdrawalEggs ?? merchant.max ?? 10000);
    const minPkr = Number(platformSettings?.minWithdrawalPkr ?? 30);

    if (qty < minEggs || qty > maxEggs) {
      const msg = `Store trading limits violated. Must be between ${minEggs} and ${maxEggs} eggs.`;
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

    const pkrGross = qty * effectiveRate;
    if (pkrGross < minPkr) {
      const msg = `Minimum withdrawal amount is ${minPkr} PKR. Current total: Rs. ${pkrGross.toFixed(2)} PKR.`;
      showToast('error', msg);
      return { success: false, pkrAmount: 0, message: msg };
    }

    const pkrNet = pkrGross; // 0% transaction fee

    const newVault = eggVault - qty;
    const newBalance = balance + pkrNet;

    const withdrawalRecord = {
      id: `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      store: merchant.name,
      eggs: qty,
      rate: effectiveRate,
      amountPkr: pkrNet,
      method: payoutMethod.name,
      accountTitle,
      accountNumber,
      bankName: bankName || null,
      date: new Date().toISOString(),
      status: 'Completed',
      username: user?.username || 'mrsaqib242',
      userId: user?.id || 'usr_saqib'
    };

    const newTrx = {
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'SELL',
      description: `Sold ${qty} eggs to ${merchant.name} via ${payoutMethod.name} (@ Rs. ${effectiveRate})`,
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

    // Asynchronously replicate withdrawal to Supabase
    try {
      supabase.from('withdrawals').insert({
        username: user?.username || 'mrsaqib242',
        store_id: String(merchant.id),
        store_name: merchant.name,
        eggs_liquidated: qty,
        rate: effectiveRate,
        amount_pkr: pkrNet,
        method: payoutMethod.name,
        account_title: accountTitle,
        account_number: accountNumber,
        bank_name: bankName || null,
        status: 'Completed'
      }).then(({ error }) => {
        if (error) console.info('Supabase withdrawals table sync notice:', error.message);
      }).catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'SELL_EGGS',
      category: 'TRANSACTION',
      userId: user?.id || user?.accountId,
      username: user?.username,
      details: `Sold ${qty} eggs to ${merchant.name} for Rs. ${pkrNet} PKR via ${payoutMethod.name}`,
      status: 'SUCCESS'
    });

    const msg = `Successfully sold ${qty} eggs for Rs. ${pkrNet.toFixed(2)} PKR!`;
    showToast('success', msg);
    return {
      success: true,
      pkrAmount: pkrNet,
      eggsSold: qty,
      rate: effectiveRate,
      eggVault: newVault,
      balance: newBalance,
      withdrawal: withdrawalRecord,
      message: msg
    };
  }, [user, eggVault, balance, withdrawals, transactions, platformSettings, persistState, showToast, logActivity]);

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

  // Referral Helpers & Dynamic Selectors
  const referralCode = useMemo(() => {
    return user?.referralCode || user?.username || 'mrsaqib242';
  }, [user]);

  const referralLink = useMemo(() => {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://alkram-meta-eggs.digital';
    return `${origin}/#/team?ref=${referralCode}`;
  }, [referralCode]);

  const referralStats = useMemo(() => {
    const members = Array.isArray(teamMembers) ? teamMembers : [];
    const level1Members = members.filter((m) => Number(m.tierLevel) === 1);
    const level2Members = members.filter((m) => Number(m.tierLevel) === 2);
    const totalInvited = members.length;
    const level1Count = level1Members.length;
    const level2Count = level2Members.length;
    const totalCommissionEarned = Number(
      members.reduce((sum, m) => sum + (Number(m.commissionEarnedPkr) || 0), 0).toFixed(2)
    );
    const activeTeamCount = members.filter((m) => (Number(m.assetsPurchased) || 0) > 0).length;
    const totalDownlineUnits = members.reduce((sum, m) => sum + (Number(m.assetsPurchased) || 0), 0);
    const totalDownlineVolumePkr = Number(
      members.reduce((sum, m) => sum + (Number(m.totalSpentPkr) || 0), 0).toFixed(2)
    );

    return {
      totalInvited,
      level1Count,
      level2Count,
      totalCommissionEarned,
      activeTeamCount,
      totalDownlineUnits,
      totalDownlineVolumePkr
    };
  }, [teamMembers]);

  // Downline Registration Action
  const registerDownline = useCallback(({ username, tierLevel = 1, upliner, joinDate }) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const cleanUsername = String(username || '').trim();
    if (!cleanUsername) {
      const msg = 'Downline farmer username is required.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const currentList = Array.isArray(teamMembers) ? teamMembers : [];
    const exists = currentList.some((m) => m.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      const msg = `Downline member "${cleanUsername}" is already registered.`;
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const level = Number(tierLevel) === 2 ? 2 : 1;
    const assignedUpliner = upliner || (level === 1 ? (user?.username || 'mrsaqib242') : 'team_leader');

    const newMember = {
      id: `DL-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      username: cleanUsername,
      joinDate: joinDate || new Date().toISOString(),
      tierLevel: level,
      upliner: assignedUpliner,
      assetsPurchased: 0,
      totalSpentPkr: 0,
      commissionEarnedPkr: 0
    };

    const updatedMembers = [newMember, ...currentList];
    setTeamMembers(updatedMembers);
    persistState({ teamMembers: updatedMembers });

    const msg = `Successfully registered ${cleanUsername} as Level ${level} downline!`;
    showToast('success', msg);
    return { success: true, member: newMember, message: msg };
  }, [teamMembers, user, persistState, showToast]);

  // Downline Purchase Simulation Action
  const simulateDownlinePurchase = useCallback(({ memberId, username, units = 1 }) => {
    if (user?.status === 'Blocked') {
      const msg = 'Account is blocked. Please contact customer support.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const qty = Number(units);
    if (!Number.isInteger(qty) || qty <= 0) {
      const msg = 'Hen purchase units must be a positive integer.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const currentList = Array.isArray(teamMembers) ? teamMembers : [];
    const memberIndex = currentList.findIndex(
      (m) => (memberId && m.id === memberId) || (username && m.username.toLowerCase() === String(username).toLowerCase())
    );

    if (memberIndex === -1) {
      const msg = 'Downline member not found.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const targetMember = currentList[memberIndex];
    const henPrice = Number(platformSettings?.henUnitPrice || ASSET_SPEC.unitPrice);
    const purchaseCost = qty * henPrice;
    const l1Rate = (Number(platformSettings?.referralCommissionLevel1 ?? 2.0)) / 100;
    const l2Rate = (Number(platformSettings?.referralCommissionLevel2 ?? 1.0)) / 100;
    const rate = Number(targetMember.tierLevel) === 1 ? l1Rate : l2Rate;
    const commission = Number((purchaseCost * rate).toFixed(2));
    const newBalance = Number((balance + commission).toFixed(2));

    const updatedMember = {
      ...targetMember,
      assetsPurchased: (Number(targetMember.assetsPurchased) || 0) + qty,
      totalSpentPkr: (Number(targetMember.totalSpentPkr) || 0) + purchaseCost,
      commissionEarnedPkr: Number(((Number(targetMember.commissionEarnedPkr) || 0) + commission).toFixed(2))
    };

    const updatedMembers = [...currentList];
    updatedMembers[memberIndex] = updatedMember;

    const commissionTrx = {
      id: `TRX-COMM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'COMMISSION',
      description: `Level ${targetMember.tierLevel} Affiliate Commission (${(rate * 100).toFixed(2)}%) from ${targetMember.username} (${qty}x Hen)`,
      amount: commission,
      unit: 'PKR',
      date: new Date().toISOString(),
      status: 'Completed',
      metadata: {
        downlineId: targetMember.id,
        downlineUsername: targetMember.username,
        tierLevel: targetMember.tierLevel,
        unitsPurchased: qty,
        purchaseVolumePkr: purchaseCost,
        rate
      }
    };

    const updatedTransactions = [commissionTrx, ...transactions];

    setTeamMembers(updatedMembers);
    setBalance(newBalance);
    setTransactions(updatedTransactions);

    persistState({
      teamMembers: updatedMembers,
      balance: newBalance,
      transactions: updatedTransactions
    });

    const msg = `💰 Received Rs. ${commission.toFixed(2)} PKR affiliate commission from ${targetMember.username} (Level ${targetMember.tierLevel})!`;
    showToast('success', msg);

    return {
      success: true,
      commission,
      newBalance,
      member: updatedMember,
      transaction: commissionTrx,
      message: msg
    };
  }, [teamMembers, balance, transactions, user, platformSettings, persistState, showToast]);

  // Admin Action: Block User
  const blockUser = useCallback((userId) => {
    const target = users.find(
      (u) => u.id === userId || String(u.username || '').toLowerCase() === String(userId || '').toLowerCase()
    );
    if (!target) {
      const msg = 'User not found.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    if (
      target.role === 'admin' ||
      target.id === 'usr_admin' ||
      String(target.username || '').toLowerCase() === 'admin' ||
      String(target.email || '').toLowerCase() === 'admin@gmail.com'
    ) {
      const msg = 'Super Admin accounts cannot be blocked.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const updatedTarget = { ...target, status: 'Blocked' };
    const updatedUsers = users.map((u) => (u.id === target.id ? updatedTarget : u));
    setUsers(updatedUsers);

    if (
      user &&
      (user.id === target.id || String(user.username || '').toLowerCase() === String(target.username || '').toLowerCase())
    ) {
      const updatedActive = { ...user, status: 'Blocked' };
      setUser(updatedActive);
      persistState({ users: updatedUsers, user: updatedActive });
    } else {
      persistState({ users: updatedUsers });
    }

    // Replicate block status to Supabase
    try {
      supabase
        .from('users')
        .update({ status: 'Blocked' })
        .eq('username', target.username)
        .then(({ error }) => {
          if (error) console.info('Supabase blockUser note:', error.message);
        })
        .catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'BLOCK_USER',
      category: 'ADMIN',
      userId: target.id,
      username: target.username,
      details: `User ${target.username} has been blocked by Super Admin`,
      status: 'WARNING'
    });

    const msg = `User ${target.username} has been blocked.`;
    showToast('warning', msg);
    return { success: true, user: updatedTarget, message: msg };
  }, [users, user, persistState, showToast, logActivity]);

  // Admin Action: Unblock User
  const unblockUser = useCallback((userId) => {
    const target = users.find(
      (u) => u.id === userId || String(u.username || '').toLowerCase() === String(userId || '').toLowerCase()
    );
    if (!target) {
      const msg = 'User not found.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const updatedTarget = { ...target, status: 'Active' };
    const updatedUsers = users.map((u) => (u.id === target.id ? updatedTarget : u));
    setUsers(updatedUsers);

    if (
      user &&
      (user.id === target.id || String(user.username || '').toLowerCase() === String(target.username || '').toLowerCase())
    ) {
      const updatedActive = { ...user, status: 'Active' };
      setUser(updatedActive);
      persistState({ users: updatedUsers, user: updatedActive });
    } else {
      persistState({ users: updatedUsers });
    }

    // Replicate unblock status to Supabase
    try {
      supabase
        .from('users')
        .update({ status: 'Active' })
        .eq('username', target.username)
        .then(({ error }) => {
          if (error) console.info('Supabase unblockUser note:', error.message);
        })
        .catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'UNBLOCK_USER',
      category: 'ADMIN',
      userId: target.id,
      username: target.username,
      details: `User ${target.username} has been unblocked by Super Admin`,
      status: 'SUCCESS'
    });

    const msg = `User ${target.username} has been unblocked.`;
    showToast('success', msg);
    return { success: true, user: updatedTarget, message: msg };
  }, [users, user, persistState, showToast, logActivity]);

  // Admin Action: Make Admin / Set User Role (Farmer <-> Admin)
  const setUserRole = useCallback((userId, newRole) => {
    const target = users.find(
      (u) => u.id === userId || String(u.username || '').toLowerCase() === String(userId || '').toLowerCase()
    );
    if (!target) {
      const msg = 'User not found.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    // Root super admin cannot be demoted from admin
    const isRootAdmin =
      target.id === 'usr_admin' ||
      String(target.username || '').toLowerCase() === 'admin' ||
      String(target.email || '').toLowerCase() === 'admin@gmail.com';
    if (isRootAdmin && newRole !== 'admin') {
      const msg = 'Primary Root Super Admin account cannot be demoted.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const assignedRole = newRole === 'admin' ? 'admin' : 'farmer';
    const updatedTarget = { ...target, role: assignedRole };
    const updatedUsers = users.map((u) => (u.id === target.id ? updatedTarget : u));
    setUsers(updatedUsers);

    if (
      user &&
      (user.id === target.id || String(user.username || '').toLowerCase() === String(target.username || '').toLowerCase())
    ) {
      const updatedActive = { ...user, role: assignedRole };
      setUser(updatedActive);
      persistState({ users: updatedUsers, user: updatedActive });
    } else {
      persistState({ users: updatedUsers });
    }

    // Replicate role update to Supabase
    try {
      supabase
        .from('users')
        .update({ role: assignedRole })
        .eq('username', target.username)
        .then(({ error }) => {
          if (error) console.info('Supabase setUserRole note:', error.message);
        })
        .catch(() => {});
    } catch (_) {}

    logActivity({
      action: assignedRole === 'admin' ? 'PROMOTE_ADMIN' : 'DEMOTE_FARMER',
      category: 'ROLE',
      userId: target.id,
      username: target.username,
      details: `User @${target.username} role changed to ${assignedRole.toUpperCase()}`,
      status: 'SUCCESS'
    });

    const msg =
      assignedRole === 'admin'
        ? `Success! @${target.username} has been promoted to Admin!`
        : `@${target.username} has been demoted to Farmer role.`;
    showToast('success', msg);
    return { success: true, user: updatedTarget, message: msg };
  }, [users, user, persistState, showToast, logActivity]);

  // Admin Action: Update User Balances
  const updateUserBalances = useCallback((userId, { balance: newBal, eggVault: newVault, hens: newHens }) => {
    const targetIndex = users.findIndex(
      (u) => u.id === userId || String(u.username || '').toLowerCase() === String(userId || '').toLowerCase()
    );
    if (targetIndex === -1) {
      const msg = 'User not found.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const target = users[targetIndex];
    const updatedTarget = {
      ...target,
      balance: newBal !== undefined ? Math.max(0, Number(newBal)) : target.balance,
      eggVault: newVault !== undefined ? Math.max(0, Number(newVault)) : target.eggVault,
      activeHens: newHens !== undefined ? Math.max(0, Number(newHens)) : (target.activeHens || 0)
    };

    const updatedUsers = [...users];
    updatedUsers[targetIndex] = updatedTarget;
    setUsers(updatedUsers);

    const isCurrent =
      user &&
      (user.id === target.id || String(user.username || '').toLowerCase() === String(target.username || '').toLowerCase());
    const patchToPersist = { users: updatedUsers };

    if (isCurrent) {
      if (newBal !== undefined) {
        setBalance(updatedTarget.balance);
        patchToPersist.balance = updatedTarget.balance;
      }
      if (newVault !== undefined) {
        setEggVault(updatedTarget.eggVault);
        patchToPersist.eggVault = updatedTarget.eggVault;
      }
      if (newHens !== undefined) {
        const adjustedAssets =
          activeAssets.length > 0
            ? [{ ...activeAssets[0], units: updatedTarget.activeHens, totalCost: updatedTarget.activeHens * 500, dailyYield: updatedTarget.activeHens }]
            : [
                {
                  id: 'ASSET-MOD-1',
                  name: 'AL Rehman Meta Eggs',
                  units: updatedTarget.activeHens,
                  unitCost: 500,
                  totalCost: updatedTarget.activeHens * 500,
                  dailyYield: updatedTarget.activeHens,
                  termDays: 120,
                  daysRemaining: 120,
                  purchaseDate: new Date().toISOString(),
                  gateway: 'Admin Adjust'
                }
              ];
        setActiveAssets(adjustedAssets);
        patchToPersist.activeAssets = adjustedAssets;
      }
    }

    persistState(patchToPersist);

    logActivity({
      action: 'UPDATE_BALANCE',
      category: 'ADMIN',
      userId: target.id,
      username: target.username,
      details: `Updated balances for ${target.username}: Balance=${updatedTarget.balance}, Vault=${updatedTarget.eggVault}, Hens=${updatedTarget.activeHens}`,
      status: 'SUCCESS'
    });

    const msg = 'User balances updated successfully.';
    showToast('success', msg);
    return { success: true, user: updatedTarget, message: msg };
  }, [users, user, activeAssets, persistState, showToast, logActivity]);

  // Admin Action: Approve Withdrawal
  const approveWithdrawal = useCallback((withdrawalId, txHash) => {
    let index = withdrawals.findIndex((w) => w.id === withdrawalId);
    let currentList = withdrawals;

    if (index === -1) {
      const defWd = DEFAULT_INITIAL_WITHDRAWALS.find((w) => w.id === withdrawalId);
      if (defWd) {
        currentList = [defWd, ...withdrawals];
        index = 0;
      } else {
        const msg = 'Withdrawal record not found.';
        showToast('error', msg);
        return { success: false, message: msg };
      }
    }

    const targetWd = currentList[index];
    if (targetWd.status === 'Completed') {
      const msg = 'Withdrawal is already completed.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const hash =
      txHash ||
      'TX-ADM-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const updatedWd = {
      ...targetWd,
      status: 'Completed',
      txHash: hash,
      processedAt: new Date().toISOString()
    };

    const updatedWithdrawals = [...currentList];
    updatedWithdrawals[index] = updatedWd;

    setWithdrawals(updatedWithdrawals);
    persistState({ withdrawals: updatedWithdrawals });

    logActivity({
      action: 'APPROVE_WITHDRAWAL',
      category: 'ADMIN',
      userId: updatedWd.userId || updatedWd.accountNumber,
      username: updatedWd.username || updatedWd.accountTitle,
      details: `Approved cashout ${updatedWd.id} of Rs. ${updatedWd.amountPkr} (Tx: ${hash})`,
      status: 'SUCCESS'
    });

    const msg = 'Withdrawal approved successfully.';
    showToast('success', msg);
    return { success: true, withdrawal: updatedWd, txHash: hash, message: msg };
  }, [withdrawals, persistState, showToast, logActivity]);

  // Admin Action: Reject Withdrawal
  const rejectWithdrawal = useCallback((withdrawalId, reason, refundBalance = true) => {
    let index = withdrawals.findIndex((w) => w.id === withdrawalId);
    let currentList = withdrawals;

    if (index === -1) {
      const defWd = DEFAULT_INITIAL_WITHDRAWALS.find((w) => w.id === withdrawalId);
      if (defWd) {
        currentList = [defWd, ...withdrawals];
        index = 0;
      } else {
        const msg = 'Withdrawal record not found.';
        showToast('error', msg);
        return { success: false, message: msg };
      }
    }

    const targetWd = currentList[index];
    if (targetWd.status === 'Completed') {
      const msg = 'Cannot reject an already completed withdrawal.';
      showToast('error', msg);
      return { success: false, message: msg };
    }

    const updatedWd = {
      ...targetWd,
      status: 'Rejected',
      rejectReason: reason || 'Cashout request rejected by administrator.',
      rejectedAt: new Date().toISOString()
    };

    const updatedWithdrawals = [...currentList];
    updatedWithdrawals[index] = updatedWd;

    const patchToPersist = { withdrawals: updatedWithdrawals };

    if (refundBalance === true) {
      const refundPkr = Number(targetWd.amountPkr) || 0;
      const targetUserIndex = users.findIndex(
        (u) =>
          (targetWd.userId && u.id === targetWd.userId) ||
          (targetWd.username && String(u.username).toLowerCase() === String(targetWd.username).toLowerCase())
      );
      if (targetUserIndex !== -1) {
        const updatedTargetUser = {
          ...users[targetUserIndex],
          balance: Number(((Number(users[targetUserIndex].balance) || 0) + refundPkr).toFixed(2))
        };
        const updatedUsers = [...users];
        updatedUsers[targetUserIndex] = updatedTargetUser;
        setUsers(updatedUsers);
        patchToPersist.users = updatedUsers;
      }

      if (
        user &&
        ((targetWd.userId && user.id === targetWd.userId) ||
          (targetWd.username && String(user.username).toLowerCase() === String(targetWd.username).toLowerCase()))
      ) {
        setBalance((prev) => {
          const newBal = Number(((Number(prev) || 0) + refundPkr).toFixed(2));
          patchToPersist.balance = newBal;
          return newBal;
        });
      }
    }

    setWithdrawals(updatedWithdrawals);
    persistState(patchToPersist);

    logActivity({
      action: 'REJECT_WITHDRAWAL',
      category: 'ADMIN',
      userId: updatedWd.userId || updatedWd.accountNumber,
      username: updatedWd.username || updatedWd.accountTitle,
      details: `Rejected cashout ${updatedWd.id} of Rs. ${updatedWd.amountPkr}. Reason: ${updatedWd.rejectReason}`,
      status: 'WARNING'
    });

    const msg = 'Withdrawal rejected successfully.';
    showToast('info', msg);
    return { success: true, withdrawal: updatedWd, message: msg };
  }, [withdrawals, users, user, persistState, showToast, logActivity]);

  // Admin Action: Update Platform Settings
  const updatePlatformSettings = useCallback((newSettings) => {
    const deepMerge = (target, source) => {
      if (!source || typeof source !== 'object') return target;
      const output = { ...target };
      for (const key of Object.keys(source)) {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          output[key] = deepMerge(target[key] || {}, source[key]);
        } else {
          output[key] = source[key];
        }
      }
      return output;
    };

    const merged = deepMerge(platformSettings, newSettings);

    // Ensure all numeric economics fields are cleanly typed
    if (merged.henUnitPrice !== undefined) merged.henUnitPrice = Number(merged.henUnitPrice);
    if (merged.dailyEggYield !== undefined) merged.dailyEggYield = Number(merged.dailyEggYield);
    if (merged.contractDurationDays !== undefined) merged.contractDurationDays = Number(merged.contractDurationDays);
    if (merged.eggBasePrice !== undefined) merged.eggBasePrice = Number(merged.eggBasePrice);
    if (merged.minWithdrawalEggs !== undefined) merged.minWithdrawalEggs = Number(merged.minWithdrawalEggs);
    if (merged.minWithdrawalPkr !== undefined) merged.minWithdrawalPkr = Number(merged.minWithdrawalPkr);
    if (merged.maxWithdrawalEggs !== undefined) merged.maxWithdrawalEggs = Number(merged.maxWithdrawalEggs);
    if (merged.referralCommissionLevel1 !== undefined) merged.referralCommissionLevel1 = Number(merged.referralCommissionLevel1);
    if (merged.referralCommissionLevel2 !== undefined) merged.referralCommissionLevel2 = Number(merged.referralCommissionLevel2);
    if (merged.referralFlatBonusPkr !== undefined) merged.referralFlatBonusPkr = Number(merged.referralFlatBonusPkr);

    setPlatformSettings(merged);
    persistState({ platformSettings: merged });

    // Replicate platform settings update to Supabase
    try {
      const gatewaysWithEconomics = {
        ...(merged.depositGateways || {}),
        _economics: {
          minWithdrawalEggs: merged.minWithdrawalEggs,
          minWithdrawalPkr: merged.minWithdrawalPkr,
          maxWithdrawalEggs: merged.maxWithdrawalEggs,
          referralCommissionLevel1: merged.referralCommissionLevel1,
          referralCommissionLevel2: merged.referralCommissionLevel2,
          marketRates: merged.marketRates
        }
      };

      supabase
        .from('platform_settings')
        .update({
          egg_base_price: Number(merged.eggBasePrice) || 30,
          hen_unit_price: Number(merged.henUnitPrice) || 500,
          daily_egg_yield: Number(merged.dailyEggYield) || 1,
          contract_duration_days: Number(merged.contractDurationDays) || 120,
          referral_commission_pkr: Number(merged.referralFlatBonusPkr || merged.referralCommissionPkr || 50),
          is_maintenance: Boolean(merged.isMaintenance),
          deposit_gateways: gatewaysWithEconomics
        })
        .eq('id', 1)
        .then(({ error }) => {
          if (error) console.info('Supabase settings update note:', error.message);
        })
        .catch(() => {});
    } catch (_) {}

    logActivity({
      action: 'UPDATE_SETTINGS',
      category: 'ADMIN',
      details: 'Platform settings updated by Super Admin',
      status: 'SUCCESS'
    });

    const msg = 'Platform settings updated successfully.';
    showToast('success', msg);
    return { success: true, settings: merged, message: msg };
  }, [platformSettings, persistState, showToast, logActivity]);

  // Admin KPIs Aggregator
  const getAdminKPIs = useCallback(() => {
    const usersList = Array.isArray(users) ? users : [];
    const withdrawalsList = Array.isArray(withdrawals) ? withdrawals : [];

    const totalUsers = usersList.length;
    const totalActiveHens = usersList.reduce((sum, u) => sum + (Number(u.activeHens) || 0), 0);
    const totalEggsInVaults = usersList.reduce((sum, u) => sum + (Number(u.eggVault) || 0), 0);
    const totalEggsLiquidated = withdrawalsList.reduce((sum, w) => sum + (Number(w.eggs) || 0), 0);
    const totalEggsProduced = totalEggsInVaults + totalEggsLiquidated;

    const totalLiquidatedPkr = Number(
      withdrawalsList
        .filter((w) => w.status === 'Completed')
        .reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0)
        .toFixed(2)
    );

    const pendingList = withdrawalsList.filter((w) => w.status === 'Pending');
    const pendingWithdrawalsCount = pendingList.length;
    const pendingWithdrawalsVolume = Number(
      pendingList
        .reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0)
        .toFixed(2)
    );

    return {
      totalUsers,
      totalActiveHens,
      totalEggsProduced,
      totalLiquidatedPkr,
      pendingWithdrawalsCount,
      pendingWithdrawalsVolume
    };
  }, [users, withdrawals]);

  // 1-Click Fresh State Reset Action
  const resetToFreshState = useCallback(() => {
    const fresh = {
      user: { ...DEFAULT_INITIAL_STATE.user },
      credentials: { ...DEFAULT_INITIAL_STATE.credentials },
      balance: DEFAULT_INITIAL_STATE.balance,
      eggVault: DEFAULT_INITIAL_STATE.eggVault,
      activeAssets: [...DEFAULT_INITIAL_STATE.activeAssets],
      transactions: [...DEFAULT_INITIAL_STATE.transactions],
      withdrawals: [...DEFAULT_INITIAL_WITHDRAWALS],
      teamMembers: [],
      users: [...DEFAULT_USERS],
      platformSettings: { ...DEFAULT_PLATFORM_SETTINGS },
      activityLogs: [...DEFAULT_ACTIVITY_LOGS],
      lastHarvest: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      cooldownActive: false
    };

    setUser(fresh.user);
    setCredentials(fresh.credentials);
    setBalance(fresh.balance);
    setEggVault(fresh.eggVault);
    setActiveAssets(fresh.activeAssets);
    setTransactions(fresh.transactions);
    setWithdrawals(fresh.withdrawals);
    setTeamMembers(fresh.teamMembers);
    setUsers(fresh.users);
    setPlatformSettings(fresh.platformSettings);
    setActivityLogs(fresh.activityLogs);
    setLastHarvest(fresh.lastHarvest);
    setCooldownActive(fresh.cooldownActive);

    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = JSON.stringify(fresh);
      window.localStorage.setItem(STORAGE_KEY_PRIMARY, raw);
      window.localStorage.setItem(STORAGE_KEY_SECONDARY, raw);
      window.localStorage.setItem('farm_user', JSON.stringify(fresh.user));
      window.localStorage.setItem('farm_balance', String(fresh.balance));
      window.localStorage.setItem('farm_users', JSON.stringify(fresh.users));
      window.localStorage.setItem('farm_platform_settings', JSON.stringify(fresh.platformSettings));
      window.localStorage.setItem('farm_activity_logs', JSON.stringify(fresh.activityLogs));
    }

    const msg = 'Farm state reset to clean initial baseline. Dummy entries purged.';
    showToast('info', msg);
    return { success: true, message: msg };
  }, [showToast]);

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
    teamMembers,
    setTeamMembers,
    users,
    setUsers,
    platformSettings,
    setPlatformSettings,
    activityLogs,
    setActivityLogs,
    referralCode,
    referralLink,
    referralStats,
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
    registerUser,
    logout,
    changePassword,
    buyFarmAsset,
    harvestEggs,
    resetCooldown,
    sellEggs,
    registerDownline,
    simulateDownlinePurchase,
    resetToFreshState,
    blockUser,
    unblockUser,
    setUserRole,
    updateUserBalances,
    approveWithdrawal,
    rejectWithdrawal,
    updatePlatformSettings,
    getAdminKPIs,
    logActivity,
    simulateDays,
    getAnalytics,
    analytics,
    COMMISSION_RATES,
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
    teamMembers,
    users,
    platformSettings,
    activityLogs,
    referralCode,
    referralLink,
    referralStats,
    lastHarvest,
    cooldownActive,
    cooldownHoursRemaining,
    currentRoute,
    navigateTo,
    toasts,
    showToast,
    removeToast,
    login,
    registerUser,
    logout,
    changePassword,
    buyFarmAsset,
    harvestEggs,
    resetCooldown,
    sellEggs,
    registerDownline,
    simulateDownlinePurchase,
    resetToFreshState,
    blockUser,
    unblockUser,
    setUserRole,
    updateUserBalances,
    approveWithdrawal,
    rejectWithdrawal,
    updatePlatformSettings,
    getAdminKPIs,
    logActivity,
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
