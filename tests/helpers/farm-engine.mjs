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
        this.balance = typeof parsed.balance === 'number' ? parsed.balance : 0;
        this.eggVault = typeof parsed.eggVault === 'number' ? parsed.eggVault : 0;
        this.activeAssets = Array.isArray(parsed.activeAssets) ? parsed.activeAssets : [];
        this.transactions = Array.isArray(parsed.transactions) ? parsed.transactions : [];
        this.withdrawals = Array.isArray(parsed.withdrawals) ? parsed.withdrawals : [];
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
      isLoggedIn: false,
      token: null
    };
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
}
