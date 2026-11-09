// tests/helpers/farm-engine.mjs
// Reference Engine implementing the FarmContext interface contract and business rules

export const VERIFIED_MERCHANTS = [
  { id: '1', name: 'Sonica FORM STORE', rate: 32, rating: 5.0, trades: 6141, success: '97%', min: 1, max: 10000 },
  { id: '2', name: 'Usmaina Poltry Farm', rate: 30, rating: 4.0, trades: 1657, success: '100%', min: 1, max: 10000 },
  { id: '3', name: 'Syed poultry farm', rate: 33, rating: 5.0, trades: 5805, success: '100%', min: 1, max: 10000 }
];

export const PAYMENT_GATEWAYS = [
  { code: '1000', name: 'Easypisa', currency: 'Pk', limitMin: 1.0, limitMax: 1000000.0, fee: 0 },
  { code: '1001', name: 'Jazz cash', currency: 'Pk', limitMin: 1.0, limitMax: 1000000.0, fee: 0 }
];

export const PAYOUT_METHODS = [
  { code: '1', name: 'Jazzcash', transferTime: '5-10 Min Transfer' },
  { code: '2', name: 'EasyPaisa', transferTime: '5-10 Min Transfer' },
  { code: '3', name: 'All Bank Pakistan', transferTime: '5-10 Min Transfer', supportedBanks: ['UBL', 'HBL', 'MEEZAN', 'Habib', 'Alfalah', 'Allied', 'Faisal'] }
];

export const ASSET_SPEC = {
  name: 'AL Rehman Meta Eggs',
  unitPrice: 500,
  dailyYieldPerUnit: 1,
  termDays: 120,
  totalYieldPerUnit: 120
};

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
    balance: 25000,
    eggVault: 500,
    activeHens: 10,
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
    balance: 4500,
    eggVault: 180,
    activeHens: 5,
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
    balance: 1200,
    eggVault: 45,
    activeHens: 2,
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
    balance: 850,
    eggVault: 20,
    activeHens: 1,
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
    balance: 7800,
    eggVault: 320,
    activeHens: 8,
    upliner: 'mrsaqib242',
    joinDate: '2026-10-18',
    accountId: '#1201',
    referralCode: 'ayesha_hen'
  }
];

// Configurable Platform Settings
export const DEFAULT_PLATFORM_SETTINGS = {
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

// Activity Audit Event Logs
export const DEFAULT_ACTIVITY_LOGS = [
  {
    id: 'LOG-INIT-1',
    timestamp: '2026-11-05T04:00:00.000Z',
    userId: 'usr_admin',
    username: 'admin',
    action: 'LOGIN',
    category: 'AUTH',
    details: 'Super Admin logged in to Platform Control Center',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-INIT-2',
    timestamp: '2026-11-05T03:30:00.000Z',
    userId: 'usr_saqib',
    username: 'mrsaqib242',
    action: 'LOGIN',
    category: 'AUTH',
    details: 'Farmer Saqib entered farm coop',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-INIT-3',
    timestamp: '2026-11-04T18:15:00.000Z',
    userId: 'usr_zohaib',
    username: 'zohaib_egg',
    action: 'BUY_ASSET',
    category: 'TRANSACTION',
    details: 'Acquired 2x AL Rehman Meta Eggs Units via Jazz cash (Rs. 1,000 PKR)',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-INIT-4',
    timestamp: '2026-11-03T09:00:00.000Z',
    userId: 'usr_saqib',
    username: 'mrsaqib242',
    action: 'HARVEST',
    category: 'TRANSACTION',
    details: 'Collected 24h daily harvest from active hens',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-INIT-5',
    timestamp: '2026-10-29T10:05:00.000Z',
    userId: 'usr_malik',
    username: 'malik_blocked',
    action: 'BLOCK_USER',
    category: 'ADMIN',
    details: 'Super Admin placed account on suspension',
    status: 'WARNING'
  }
];

// Seeded Withdrawals with Pending Cashout Queue
export const DEFAULT_INITIAL_WITHDRAWALS = [
  {
    id: 'WD-PEND-1',
    store: 'Usmaina Poltry Farm',
    eggs: 50,
    rate: 30,
    amountPkr: 1500,
    method: 'Jazzcash',
    accountTitle: 'Hamza Tariq',
    accountNumber: '03001234567',
    bankName: null,
    date: '2026-11-04T16:20:00.000Z',
    status: 'Pending',
    username: 'hamza_farmer',
    userId: 'usr_hamza'
  },
  {
    id: 'WD-PEND-2',
    store: 'Sonica FORM STORE',
    eggs: 25,
    rate: 32,
    amountPkr: 800,
    method: 'EasyPaisa',
    accountTitle: 'Zohaib Khan',
    accountNumber: '03459876543',
    bankName: null,
    date: '2026-11-04T18:45:00.000Z',
    status: 'Pending',
    username: 'zohaib_egg',
    userId: 'usr_zohaib'
  },
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
    status: 'Completed',
    username: 'mrsaqib242',
    userId: 'usr_saqib'
  }
];

export class FarmEngine {
  constructor(storage, options = {}) {
    this.storage = storage;
    this.options = options;
    this.storageKey = options.storageKey || 'alrehman_meta_eggs_state';
    this.loadState();
  }

  loadState() {
    const raw = this.storage.getItem(this.storageKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.user = parsed.user || this.getDefaultUser();
        if (!this.user.referralCode) {
          this.user.referralCode = this.user.username || 'mrsaqib242';
        }
        if (!this.user.role) {
          this.user.role = (this.user.username === 'admin' || this.user.email === 'admin@gmail.com') ? 'admin' : 'farmer';
        }
        if (!this.user.status) {
          this.user.status = 'Active';
        }
        this.balance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        this.eggVault = typeof parsed.eggVault === 'number' ? parsed.eggVault : 0;
        this.activeAssets = Array.isArray(parsed.activeAssets) ? parsed.activeAssets : [];
        this.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        this.withdrawals = Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [];
        this.teamMembers = Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [];
        this.users = Array.isArray(parsed.users) ? parsed.users : this.getDefaultUsers();
        this.platformSettings = parsed.platformSettings || this.getDefaultPlatformSettings();
        this.activityLogs = Array.isArray(parsed.activityLogs) ? parsed.activityLogs : this.getDefaultActivityLogs();
        this.lastHarvest = parsed.lastHarvest || null;
        this.cooldownActive = Boolean(parsed.cooldownActive);
        this.credentials = parsed.credentials || {
          username: 'mrsaqib242',
          email: 'admin@gmail.com',
          password: 'password123'
        };
        return;
      } catch (e) {
        // Fallback on parse error
      }
    }

    this.user = this.getDefaultUser();
    this.balance = 0;
    this.eggVault = 0;
    this.activeAssets = [];
    this.transactions = [];
    this.withdrawals = this.options?.seedWithdrawals ? [...DEFAULT_INITIAL_WITHDRAWALS] : [];
    this.teamMembers = [];
    this.users = this.getDefaultUsers();
    this.platformSettings = this.getDefaultPlatformSettings();
    this.activityLogs = this.getDefaultActivityLogs();
    this.lastHarvest = null;
    this.cooldownActive = false;
    this.credentials = {
      username: 'mrsaqib242',
      email: 'admin@gmail.com',
      password: 'password123'
    };
    this.saveState();
  }

  saveState() {
    const payload = {
      user: this.user,
      balance: this.balance,
      eggVault: this.eggVault,
      activeAssets: this.activeAssets,
      transactions: this.transactions,
      withdrawals: this.withdrawals,
      teamMembers: this.teamMembers,
      users: this.users,
      platformSettings: this.platformSettings,
      activityLogs: this.activityLogs,
      lastHarvest: this.lastHarvest,
      cooldownActive: this.cooldownActive,
      credentials: this.credentials
    };
    this.storage.setItem(this.storageKey, JSON.stringify(payload));
  }

  getDefaultUser() {
    return {
      id: 'usr_saqib',
      username: 'mrsaqib242',
      email: 'saqib@farm.pk',
      name: 'Farmer Saqib',
      accountId: '#1197',
      upliner: 'N/A',
      referralCode: 'mrsaqib242',
      role: 'farmer',
      status: 'Active',
      isLoggedIn: false,
      token: null
    };
  }

  getDefaultUsers() {
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }

  getDefaultPlatformSettings() {
    return JSON.parse(JSON.stringify(DEFAULT_PLATFORM_SETTINGS));
  }

  getDefaultActivityLogs() {
    return JSON.parse(JSON.stringify(DEFAULT_ACTIVITY_LOGS));
  }

  logActivity({ action, category = 'GENERAL', userId, username, details, status = 'SUCCESS' }) {
    const newLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId: userId || this.user?.id || this.user?.accountId || 'system',
      username: username || this.user?.username || 'system',
      action,
      category,
      details: details || '',
      status
    };
    this.activityLogs = [newLog, ...(Array.isArray(this.activityLogs) ? this.activityLogs : [])];
    this.saveState();
    return newLog;
  }

  get referralCode() {
    return this.user?.referralCode || this.user?.username || 'mrsaqib242';
  }

  get referralLink() {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://alkram-meta-eggs.digital';
    return `${origin}/#/register?ref=${this.referralCode}`;
  }

  get referralStats() {
    return this.getReferralStats();
  }

  login(usernameOrEmail, password) {
    const cleanInput = String(usernameOrEmail || '').trim();
    if (!cleanInput || !password) {
      return { success: false, message: 'Username/Email and password are required.' };
    }

    const cleanLower = cleanInput.toLowerCase();

    // Find in multi-user accounts list if available
    const matchedUser = Array.isArray(this.users)
      ? this.users.find(
          (u) =>
            (u.username && u.username.toLowerCase() === cleanLower) ||
            (u.email && u.email.toLowerCase() === cleanLower)
        )
      : null;

    // Check if matched user is blocked
    if (matchedUser && matchedUser.status === 'Blocked') {
      this.logActivity({
        action: 'FAILED_LOGIN',
        category: 'AUTH',
        userId: matchedUser.id,
        username: matchedUser.username,
        details: 'Login rejected: account is blocked',
        status: 'WARNING'
      });
      return { success: false, message: 'Account is blocked. Please contact customer support.' };
    }

    // Validate against legacy credentials or multi-user entry
    const isLegacyUser = cleanLower === 'mrsaqib242' || cleanLower === 'admin@gmail.com' || cleanLower === 'admin';
    const isLegacyValid = isLegacyUser && password === this.credentials.password;
    const isUserValid = matchedUser && (matchedUser.password === password || (isLegacyUser && password === this.credentials.password));

    if (isUserValid || isLegacyValid) {
      const role = matchedUser?.role || ((cleanLower === 'admin@gmail.com' || cleanLower === 'admin') ? 'admin' : 'farmer');
      this.user = {
        id: matchedUser?.id || (role === 'admin' ? 'usr_admin' : 'usr_saqib'),
        username: matchedUser?.username || (cleanLower === 'admin' ? 'admin' : (cleanLower === 'admin@gmail.com' ? 'admin' : this.credentials.username)),
        email: matchedUser?.email || (role === 'admin' ? 'admin@gmail.com' : this.credentials.email),
        name: matchedUser?.name || (role === 'admin' ? 'Super Admin' : 'Farmer Saqib'),
        accountId: matchedUser?.accountId || '#1197',
        upliner: matchedUser?.upliner || 'N/A',
        referralCode: matchedUser?.referralCode || this.user?.referralCode || this.credentials.username || 'mrsaqib242',
        role,
        status: matchedUser?.status || 'Active',
        isLoggedIn: true,
        token: `jwt_session_${Date.now()}`
      };

      this.logActivity({
        action: 'LOGIN',
        category: 'AUTH',
        userId: this.user.id,
        username: this.user.username,
        details: `User logged in with role ${this.user.role}`,
        status: 'SUCCESS'
      });

      this.saveState();
      return { success: true, message: 'Login successful. Entering farm coop...', user: this.user };
    }

    this.logActivity({
      action: 'FAILED_LOGIN',
      category: 'AUTH',
      userId: matchedUser?.id || 'unknown',
      username: usernameOrEmail,
      details: 'Invalid credentials provided',
      status: 'FAILED'
    });

    return { success: false, message: 'Invalid credentials. Please verify username and secret password.' };
  }

  logout() {
    const loggedOutUsername = this.user?.username || 'user';
    const loggedOutId = this.user?.id || 'unknown';
    this.user = {
      username: '',
      name: '',
      accountId: '',
      upliner: '',
      role: 'farmer',
      status: 'Active',
      isLoggedIn: false,
      token: null
    };
    this.logActivity({
      action: 'LOGOUT',
      category: 'AUTH',
      userId: loggedOutId,
      username: loggedOutUsername,
      details: 'User logged out',
      status: 'SUCCESS'
    });
    this.saveState();
    return { success: true, message: 'You have been logged out successfully.' };
  }

  changePassword(currentPassword, newPassword, confirmPassword) {
    if (this.user?.status === 'Blocked') {
      return { success: false, message: 'Account is blocked. Action prohibited.' };
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, message: 'All password fields are required.' };
    }

    if (currentPassword !== this.credentials.password) {
      return { success: false, message: 'Current password does not match existing records.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters.' };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, message: 'New password and confirm password do not match.' };
    }

    this.credentials.password = newPassword;
    if (this.user) {
      this.user.password = newPassword;
    }
    if (Array.isArray(this.users)) {
      const targetUsername = this.user?.username || 'mrsaqib242';
      const targetId = this.user?.id || 'usr_saqib';
      this.users = this.users.map((u) => {
        if (
          u.username === targetUsername ||
          u.id === targetId ||
          u.username === 'admin' ||
          u.email === 'admin@gmail.com' ||
          u.username === this.credentials.username
        ) {
          return { ...u, password: newPassword };
        }
        return u;
      });
    }

    this.logActivity({
      action: 'CHANGE_PASSWORD',
      category: 'SECURITY',
      userId: this.user?.id,
      username: this.user?.username,
      details: 'Password updated successfully',
      status: 'SUCCESS'
    });

    this.saveState();
    return { success: true, message: 'Password updated successfully. Protected by 256-bit SSL.' };
  }

  buyFarmAsset({ units, gateway, methodCode }) {
    if (this.user?.status === 'Blocked') {
      return { success: false, message: 'Account is blocked. Cannot purchase assets.' };
    }

    const qty = Number(units);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { success: false, message: 'Units must be a positive integer.' };
    }

    if (qty > 1000) {
      return { success: false, message: 'Maximum purchase limit per transaction is 1,000 units.' };
    }

    const validGateway = PAYMENT_GATEWAYS.find(g => g.code === String(methodCode) || g.name.toLowerCase() === String(gateway).toLowerCase());
    if (!validGateway) {
      return { success: false, message: 'Invalid payment gateway selected. Choose Easypisa or Jazz cash.' };
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

    this.activeAssets.push(newAsset);

    this.transactions.push({
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'BUY',
      description: `Purchased ${qty}x ${ASSET_SPEC.name} Units`,
      amount: cost,
      unit: 'PKR',
      date: new Date().toISOString(),
      status: 'Completed',
      gateway: validGateway.name
    });

    this.saveState();
    return {
      success: true,
      asset: newAsset,
      cost,
      dailyYield,
      fullTermEggs,
      message: `Successfully acquired ${qty} VIP Farm Units via ${validGateway.name}!`
    };
  }

  harvestEggs(currentTime = new Date()) {
    if (this.user?.status === 'Blocked') {
      return { success: false, eggsCollected: 0, message: 'Account is blocked. Cannot harvest eggs.' };
    }

    if (this.cooldownActive && this.lastHarvest) {
      const last = new Date(this.lastHarvest).getTime();
      const current = new Date(currentTime).getTime();
      const hoursPassed = (current - last) / (1000 * 60 * 60);
      if (hoursPassed < 24) {
        const remainingHours = Math.ceil(24 - hoursPassed);
        return {
          success: false,
          eggsCollected: 0,
          message: `Harvest cooldown active. Please wait ${remainingHours} hour(s) before next collection.`
        };
      }
    }

    const totalActiveUnits = this.activeAssets.reduce((sum, a) => sum + a.units, 0);
    if (totalActiveUnits === 0) {
      return {
        success: false,
        eggsCollected: 0,
        message: 'No active hen units available in your coop to produce eggs.'
      };
    }

    const eggsYield = totalActiveUnits * ASSET_SPEC.dailyYieldPerUnit;
    this.eggVault += eggsYield;
    this.lastHarvest = new Date(currentTime).toISOString();
    this.cooldownActive = true;

    this.transactions.push({
      id: `HRV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'HARVEST',
      description: `Collected 24h daily harvest from ${totalActiveUnits} active hens`,
      amount: eggsYield,
      unit: 'Egg',
      date: new Date(currentTime).toISOString(),
      status: 'Completed'
    });

    this.saveState();
    return {
      success: true,
      eggsCollected: eggsYield,
      eggVault: this.eggVault,
      message: `Harvested ${eggsYield} fresh eggs into your vault!`
    };
  }

  resetCooldown() {
    this.cooldownActive = false;
    this.saveState();
  }

  sellEggs({ storeId, storeName, rate, eggs, method, accountTitle, accountNumber, bankName }) {
    if (this.user?.status === 'Blocked') {
      return { success: false, pkrAmount: 0, message: 'Account is blocked. Cannot trade eggs.' };
    }

    const qty = Number(eggs);
    if (!Number.isFinite(qty) || qty <= 0) {
      return { success: false, pkrAmount: 0, message: 'Egg amount must be a positive number.' };
    }

    if (qty > this.eggVault) {
      return {
        success: false,
        pkrAmount: 0,
        message: `Insufficient eggs in vault. Requested: ${qty}, Available: ${this.eggVault}`
      };
    }

    const merchant = VERIFIED_MERCHANTS.find(m => m.id === String(storeId) || m.name.toLowerCase() === String(storeName).toLowerCase());
    if (!merchant) {
      return { success: false, pkrAmount: 0, message: 'Invalid or unverified merchant store selected.' };
    }

    if (qty < merchant.min || qty > merchant.max) {
      return {
        success: false,
        pkrAmount: 0,
        message: `Store trading limits violated. Must be between ${merchant.min} and ${merchant.max} eggs.`
      };
    }

    if (!accountTitle || !accountNumber) {
      return { success: false, pkrAmount: 0, message: 'Account title and account number are required for payout.' };
    }

    const payoutMethod = PAYOUT_METHODS.find(m => m.name.toLowerCase() === String(method).toLowerCase() || m.code === String(method));
    if (!payoutMethod) {
      return { success: false, pkrAmount: 0, message: 'Invalid payout method selected.' };
    }

    if (payoutMethod.name === 'All Bank Pakistan' && !bankName) {
      return { success: false, pkrAmount: 0, message: 'Bank name selection is required for bank transfer.' };
    }

    const pkrGross = qty * merchant.rate;
    const pkrNet = pkrGross; // 0% fees

    this.eggVault -= qty;
    this.balance += pkrNet;

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
      status: 'Completed',
      username: this.user?.username || 'mrsaqib242',
      userId: this.user?.id || 'usr_saqib'
    };

    this.withdrawals.push(withdrawalRecord);

    this.transactions.push({
      id: `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'SELL',
      description: `Sold ${qty} eggs to ${merchant.name} via ${payoutMethod.name}`,
      amount: pkrNet,
      unit: 'PKR',
      date: new Date().toISOString(),
      status: 'Completed'
    });

    this.saveState();
    return {
      success: true,
      pkrAmount: pkrNet,
      eggsSold: qty,
      rate: merchant.rate,
      eggVault: this.eggVault,
      balance: this.balance,
      withdrawal: withdrawalRecord,
      message: `Successfully sold ${qty} eggs for Rs. ${pkrNet.toFixed(2)} PKR!`
    };
  }

  simulateDays(daysCount) {
    let totalHarvested = 0;
    const totalActiveUnits = this.activeAssets.reduce((sum, a) => sum + a.units, 0);

    for (let day = 1; day <= daysCount; day++) {
      if (totalActiveUnits > 0) {
        const yieldPerDay = totalActiveUnits * ASSET_SPEC.dailyYieldPerUnit;
        this.eggVault += yieldPerDay;
        totalHarvested += yieldPerDay;
      }
    }

    this.saveState();
    return { daysSimulated: daysCount, totalHarvested, newVault: this.eggVault };
  }

  getAnalytics() {
    const totalUnitsBought = this.activeAssets.reduce((sum, a) => sum + a.units, 0);
    const totalBuyVolumePkr = this.activeAssets.reduce((sum, a) => sum + a.totalCost, 0);
    const totalEggsSold = this.withdrawals.reduce((sum, w) => sum + w.eggs, 0);
    const totalSalesPkr = this.withdrawals.reduce((sum, w) => sum + w.amountPkr, 0);

    return {
      totalUnitsBought,
      totalBuyVolumePkr,
      totalEggsSold,
      totalSalesPkr,
      currentEggVault: this.eggVault,
      currentBalance: this.balance,
      activeAssetsCount: this.activeAssets.length,
      withdrawalsCount: this.withdrawals.length,
      transactionsCount: this.transactions.length
    };
  }

  getReferralStats() {
    const members = Array.isArray(this.teamMembers) ? this.teamMembers : [];
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
  }

  registerDownline({ username, tierLevel = 1, upliner, joinDate }) {
    if (this.user?.status === 'Blocked') {
      return { success: false, message: 'Account is blocked. Cannot register downline.' };
    }

    const cleanUsername = String(username || '').trim();
    if (!cleanUsername) {
      return { success: false, message: 'Downline farmer username is required.' };
    }

    const currentList = Array.isArray(this.teamMembers) ? this.teamMembers : [];
    const exists = currentList.some((m) => m.username.toLowerCase() === cleanUsername.toLowerCase());
    if (exists) {
      return { success: false, message: `Downline member "${cleanUsername}" is already registered.` };
    }

    const level = Number(tierLevel) === 2 ? 2 : 1;
    const assignedUpliner = upliner || (level === 1 ? (this.user?.username || 'mrsaqib242') : 'team_leader');

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

    this.teamMembers.unshift(newMember);
    this.saveState();

    return {
      success: true,
      member: newMember,
      message: `Successfully registered ${cleanUsername} as Level ${level} downline!`
    };
  }

  simulateDownlinePurchase({ memberId, username, units = 1 }) {
    if (this.user?.status === 'Blocked') {
      return { success: false, message: 'Account is blocked. Cannot process team purchase.' };
    }

    const qty = Number(units);
    if (!Number.isInteger(qty) || qty <= 0) {
      return { success: false, message: 'Hen purchase units must be a positive integer.' };
    }

    const currentList = Array.isArray(this.teamMembers) ? this.teamMembers : [];
    const memberIndex = currentList.findIndex(
      (m) => (memberId && m.id === memberId) || (username && m.username.toLowerCase() === String(username).toLowerCase())
    );

    if (memberIndex === -1) {
      return { success: false, message: 'Downline member not found.' };
    }

    const targetMember = currentList[memberIndex];
    const purchaseCost = qty * ASSET_SPEC.unitPrice;
    const rate = Number(targetMember.tierLevel) === 1 ? COMMISSION_RATES.LEVEL_1 : COMMISSION_RATES.LEVEL_2;
    const commission = Number((purchaseCost * rate).toFixed(2));
    this.balance = Number((this.balance + commission).toFixed(2));

    targetMember.assetsPurchased = (Number(targetMember.assetsPurchased) || 0) + qty;
    targetMember.totalSpentPkr = (Number(targetMember.totalSpentPkr) || 0) + purchaseCost;
    targetMember.commissionEarnedPkr = Number(((Number(targetMember.commissionEarnedPkr) || 0) + commission).toFixed(2));

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

    this.transactions.unshift(commissionTrx);
    this.saveState();

    return {
      success: true,
      commission,
      newBalance: this.balance,
      member: targetMember,
      transaction: commissionTrx,
      message: `💰 Received Rs. ${commission.toFixed(2)} PKR affiliate commission from ${targetMember.username} (Level ${targetMember.tierLevel})!`
    };
  }

  // Admin Actions
  blockUser(userId) {
    const userIdx = this.users.findIndex(u => u.id === userId || u.username === userId);
    if (userIdx === -1) {
      return { success: false, message: `User ${userId} not found.` };
    }
    this.users[userIdx].status = 'Blocked';
    if (this.user && (this.user.id === userId || this.user.username === userId)) {
      this.user.status = 'Blocked';
    }
    this.logActivity({
      action: 'BLOCK_USER',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: `Blocked user ${this.users[userIdx].username} (${userId})`,
      status: 'WARNING'
    });
    this.saveState();
    return { success: true, user: this.users[userIdx], message: `User ${this.users[userIdx].username} has been blocked.` };
  }

  unblockUser(userId) {
    const userIdx = this.users.findIndex(u => u.id === userId || u.username === userId);
    if (userIdx === -1) {
      return { success: false, message: `User ${userId} not found.` };
    }
    this.users[userIdx].status = 'Active';
    if (this.user && (this.user.id === userId || this.user.username === userId)) {
      this.user.status = 'Active';
    }
    this.logActivity({
      action: 'UNBLOCK_USER',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: `Unblocked user ${this.users[userIdx].username} (${userId})`,
      status: 'SUCCESS'
    });
    this.saveState();
    return { success: true, user: this.users[userIdx], message: `User ${this.users[userIdx].username} has been unblocked.` };
  }

  updateUserBalances(userId, { balance, eggVault, hens }) {
    const userIdx = this.users.findIndex(u => u.id === userId || u.username === userId);
    if (userIdx === -1) {
      return { success: false, message: `User ${userId} not found.` };
    }
    const target = this.users[userIdx];
    if (typeof balance === 'number') target.balance = balance;
    if (typeof eggVault === 'number') target.eggVault = eggVault;
    if (typeof hens === 'number') target.activeHens = hens;

    if (this.user && (this.user.id === userId || this.user.username === userId)) {
      if (typeof balance === 'number') this.balance = balance;
      if (typeof eggVault === 'number') this.eggVault = eggVault;
    }
    this.logActivity({
      action: 'UPDATE_USER_BALANCES',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: `Updated balances for ${target.username}: Balance=${target.balance}, Eggs=${target.eggVault}, Hens=${target.activeHens}`,
      status: 'SUCCESS'
    });
    this.saveState();
    return { success: true, user: target, message: `Balances updated for ${target.username}.` };
  }

  approveWithdrawal(withdrawalId, txHash) {
    let wIdx = this.withdrawals.findIndex(w => w.id === withdrawalId);
    if (wIdx === -1) {
      const seedW = DEFAULT_INITIAL_WITHDRAWALS.find(w => w.id === withdrawalId);
      if (seedW) {
        this.withdrawals.unshift({ ...seedW });
        wIdx = 0;
      } else {
        return { success: false, message: `Withdrawal ${withdrawalId} not found.` };
      }
    }
    const finalTxHash = txHash || `TX-ADM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.withdrawals[wIdx].status = 'Completed';
    this.withdrawals[wIdx].txHash = finalTxHash;
    this.withdrawals[wIdx].approvedAt = new Date().toISOString();

    this.logActivity({
      action: 'APPROVE_WITHDRAWAL',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: `Approved withdrawal ${withdrawalId} (Rs. ${this.withdrawals[wIdx].amountPkr}) with hash ${finalTxHash}`,
      status: 'SUCCESS'
    });
    this.saveState();
    return { success: true, withdrawal: this.withdrawals[wIdx], message: `Withdrawal ${withdrawalId} approved.` };
  }

  rejectWithdrawal(withdrawalId, reason, refundBalance = true) {
    let wIdx = this.withdrawals.findIndex(w => w.id === withdrawalId);
    if (wIdx === -1) {
      const seedW = DEFAULT_INITIAL_WITHDRAWALS.find(w => w.id === withdrawalId);
      if (seedW) {
        this.withdrawals.unshift({ ...seedW });
        wIdx = 0;
      } else {
        return { success: false, message: `Withdrawal ${withdrawalId} not found.` };
      }
    }
    const w = this.withdrawals[wIdx];
    w.status = 'Rejected';
    w.rejectReason = reason || 'Admin rejected request';
    w.rejectedAt = new Date().toISOString();

    if (refundBalance) {
      if (this.user && (this.user.id === w.userId || this.user.username === w.username)) {
        this.balance += w.amountPkr;
      }
      const uIdx = this.users.findIndex(u => u.id === w.userId || u.username === w.username);
      if (uIdx !== -1) {
        this.users[uIdx].balance = (this.users[uIdx].balance || 0) + w.amountPkr;
      }
    }

    this.logActivity({
      action: 'REJECT_WITHDRAWAL',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: `Rejected withdrawal ${withdrawalId}: ${w.rejectReason}${refundBalance ? ' (Refunded)' : ''}`,
      status: 'WARNING'
    });
    this.saveState();
    return { success: true, withdrawal: w, message: `Withdrawal ${withdrawalId} rejected.` };
  }

  updatePlatformSettings(newSettings = {}) {
    this.platformSettings = {
      ...this.platformSettings,
      ...newSettings,
      depositGateways: {
        ...(this.platformSettings?.depositGateways || {}),
        ...(newSettings.depositGateways || {})
      },
      communityLinks: {
        ...(this.platformSettings?.communityLinks || {}),
        ...(newSettings.communityLinks || {})
      },
      marketRates: {
        ...(this.platformSettings?.marketRates || {}),
        ...(newSettings.marketRates || {})
      }
    };
    this.logActivity({
      action: 'UPDATE_SETTINGS',
      category: 'ADMIN',
      userId: this.user?.id || 'usr_admin',
      username: this.user?.username || 'admin',
      details: 'Updated platform settings configuration',
      status: 'SUCCESS'
    });
    this.saveState();
    return { success: true, settings: this.platformSettings, message: 'Platform settings updated successfully.' };
  }

  getAdminKPIs() {
    const userList = Array.isArray(this.users) ? this.users : [];
    const totalUsers = userList.length;
    const totalActiveHens = userList.reduce((sum, u) => sum + (Number(u.activeHens) || 0), 0);
    const totalEggsProduced = userList.reduce((sum, u) => sum + (Number(u.eggVault) || 0), 0) + (this.eggVault || 0);

    const mergedWithdrawals = [...this.withdrawals];
    for (const item of DEFAULT_INITIAL_WITHDRAWALS) {
      if (!mergedWithdrawals.some(w => w.id === item.id)) {
        mergedWithdrawals.push(item);
      }
    }

    const pendingWithdrawals = mergedWithdrawals.filter(w => w.status === 'Pending');
    const completedWithdrawals = mergedWithdrawals.filter(w => w.status === 'Completed');

    const pendingWithdrawalsCount = pendingWithdrawals.length;
    const pendingWithdrawalsVolume = pendingWithdrawals.reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0);
    const totalLiquidatedPkr = completedWithdrawals.reduce((sum, w) => sum + (Number(w.amountPkr) || 0), 0);

    return {
      totalUsers,
      totalActiveHens,
      totalEggsProduced,
      totalLiquidatedPkr,
      pendingWithdrawalsCount,
      pendingWithdrawalsVolume
    };
  }

  seedPendingWithdrawals() {
    for (const item of DEFAULT_INITIAL_WITHDRAWALS) {
      if (!this.withdrawals.some(w => w.id === item.id)) {
        this.withdrawals.push({ ...item });
      }
    }
    this.saveState();
    return this.withdrawals;
  }

  resetToFreshState() {
    this.user = {
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
    };
    this.credentials = {
      username: 'mrsaqib242',
      email: 'admin@gmail.com',
      password: 'password123'
    };
    this.balance = 1500.00;
    this.eggVault = 18;
    this.activeAssets = [
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
    ];
    this.transactions = [
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
    ];
    this.withdrawals = [
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
    ];
    this.teamMembers = [];
    this.users = this.getDefaultUsers();
    this.platformSettings = this.getDefaultPlatformSettings();
    this.activityLogs = this.getDefaultActivityLogs();
    this.lastHarvest = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    this.cooldownActive = false;

    this.saveState();
    return {
      success: true,
      message: 'Farm state reset to clean initial baseline. Dummy entries purged.'
    };
  }
}
