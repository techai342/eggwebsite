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

export class FarmEngine {
  constructor(storage, options = {}) {
    this.storage = storage;
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
        this.balance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        this.eggVault = typeof parsed.eggVault === 'number' ? parsed.eggVault : 0;
        this.activeAssets = Array.isArray(parsed.activeAssets) ? parsed.activeAssets : [];
        this.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        this.withdrawals = Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [];
        this.teamMembers = Array.isArray(parsed.teamMembers) ? parsed.teamMembers : [];
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
    this.withdrawals = [];
    this.teamMembers = [];
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
      lastHarvest: this.lastHarvest,
      cooldownActive: this.cooldownActive,
      credentials: this.credentials
    };
    this.storage.setItem(this.storageKey, JSON.stringify(payload));
  }

  getDefaultUser() {
    return {
      username: 'mrsaqib242',
      name: 'Farmer Saqib',
      accountId: '#1197',
      upliner: 'N/A',
      referralCode: 'mrsaqib242',
      isLoggedIn: false,
      token: null
    };
  }

  get referralCode() {
    return this.user?.referralCode || this.user?.username || 'mrsaqib242';
  }

  get referralLink() {
    const origin = typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://alkram-meta-eggs.digital';
    return `${origin}/#/team?ref=${this.referralCode}`;
  }

  get referralStats() {
    return this.getReferralStats();
  }

  login(usernameOrEmail, password) {
    if (!usernameOrEmail || !password) {
      return { success: false, message: 'Username/Email and password are required.' };
    }

    const matchesUsername = usernameOrEmail === this.credentials.username;
    const matchesEmail = usernameOrEmail === this.credentials.email;
    const matchesPassword = password === this.credentials.password;

    if ((matchesUsername || matchesEmail) && matchesPassword) {
      this.user = {
        username: this.credentials.username,
        name: 'Farmer Saqib',
        accountId: '#1197',
        upliner: 'N/A',
        referralCode: this.user?.referralCode || this.credentials.username || 'mrsaqib242',
        isLoggedIn: true,
        token: `jwt_session_${Date.now()}`
      };
      this.saveState();
      return { success: true, message: 'Login successful. Entering farm coop...' };
    }

    return { success: false, message: 'Invalid credentials. Please verify username and secret password.' };
  }

  logout() {
    this.user = {
      username: '',
      name: '',
      accountId: '',
      upliner: '',
      isLoggedIn: false,
      token: null
    };
    this.saveState();
    return { success: true, message: 'You have been logged out successfully.' };
  }

  changePassword(currentPassword, newPassword, confirmPassword) {
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
    this.saveState();
    return { success: true, message: 'Password updated successfully. Protected by 256-bit SSL.' };
  }

  buyFarmAsset({ units, gateway, methodCode }) {
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
      status: 'Completed'
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

  resetToFreshState() {
    this.user = {
      username: 'mrsaqib242',
      email: 'admin@gmail.com',
      name: 'Farmer Saqib',
      accountId: '#1197',
      upliner: 'N/A',
      referralCode: 'mrsaqib242',
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
    this.lastHarvest = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    this.cooldownActive = false;

    this.saveState();
    return {
      success: true,
      message: 'Farm state reset to clean initial baseline. Dummy entries purged.'
    };
  }
}
