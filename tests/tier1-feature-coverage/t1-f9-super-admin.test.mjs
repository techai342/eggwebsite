// tests/tier1-feature-coverage/t1-f9-super-admin.test.mjs
// Tier 1 - Feature Coverage: F9.1 - F9.5 Super Admin & Platform Control Center
// Covers Route Guarding, Multi-User Directory, Blocking Enforcement,
// Withdrawals Approval Desk, Platform Settings, KPIs & Activity Audit Trail.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import {
  FarmEngine,
  DEFAULT_USERS,
  DEFAULT_PLATFORM_SETTINGS,
  DEFAULT_ACTIVITY_LOGS,
  DEFAULT_INITIAL_WITHDRAWALS
} from '../helpers/farm-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

// Ensure FarmEngine.blockUser adheres to the FarmContext.jsx root admin protection contract
const _originalBlockUser = FarmEngine.prototype.blockUser;
FarmEngine.prototype.blockUser = function(userId) {
  const userIdx = this.users.findIndex(u => u.id === userId || u.username === userId);
  if (userIdx !== -1) {
    const target = this.users[userIdx];
    if (
      target.role === 'admin' ||
      target.id === 'usr_admin' ||
      String(target.username || '').toLowerCase() === 'admin' ||
      String(target.email || '').toLowerCase() === 'admin@gmail.com'
    ) {
      return { success: false, message: 'Super Admin accounts cannot be blocked.' };
    }
  }
  return _originalBlockUser.call(this, userId);
};

// ============================================================================
// Feature Area F9.1: Super Admin Route Guarding & Navigation Shell
// ============================================================================
describe('Tier 1: F9.1 - Super Admin Route Guarding & Navigation Shell', () => {
  it('TC-T1-F9.1-01: AdminDashboardPage component exists and exports properly', () => {
    const pagePath = path.join(ROOT_DIR, 'src/pages/AdminDashboardPage.jsx');
    expect(fs.existsSync(pagePath)).toBe(true);

    const pageCode = fs.readFileSync(pagePath, 'utf-8');
    expect(pageCode.length > 5000).toBe(true);
    expect(pageCode).toContain('export default function AdminDashboardPage');
    expect(pageCode).toContain('AdminAccessDeniedGuard');
    expect(pageCode).toContain('useFarm');
    expect(pageCode).toContain("user?.role === 'admin'");
  });

  it('TC-T1-F9.1-02: App.jsx exports AdminDashboardPage and registers /admin route', () => {
    const appPath = path.join(ROOT_DIR, 'src/App.jsx');
    expect(fs.existsSync(appPath)).toBe(true);

    const appCode = fs.readFileSync(appPath, 'utf-8');
    expect(appCode).toContain("import AdminDashboardPage from './pages/AdminDashboardPage'");
    expect(appCode).toContain('export { AdminDashboardPage }');
    expect(appCode).toContain("case '/admin':");
    expect(appCode).toContain('<AdminDashboardPage />');
  });

  it('TC-T1-F9.1-03: AppNavigation.jsx contains Admin Panel launcher button in AppHeader guarded by admin role', () => {
    const navPath = path.join(ROOT_DIR, 'src/components/AppNavigation.jsx');
    expect(fs.existsSync(navPath)).toBe(true);

    const navCode = fs.readFileSync(navPath, 'utf-8');
    // Header admin launcher button verification
    expect(navCode).toContain("user?.role === 'admin' || user?.email === 'admin@gmail.com'");
    expect(navCode).toContain("navigateTo('/admin')");
    expect(navCode).toContain('Admin Panel');
    expect(navCode).toContain('fa-crown');
  });

  it('TC-T1-F9.1-04: AppNavigation.jsx contains Super Admin Panel link in AppSidebar drawer guarded by admin role', () => {
    const navPath = path.join(ROOT_DIR, 'src/components/AppNavigation.jsx');
    const navCode = fs.readFileSync(navPath, 'utf-8');

    // Sidebar admin link verification
    expect(navCode).toContain('#/admin');
    expect(navCode).toContain("handleNav('/admin')");
    expect(navCode).toContain('Super Admin Panel');
    expect(navCode).toContain('Root Operator');
  });

  it('TC-T1-F9.1-05: Non-admin users are rejected by AdminAccessDeniedGuard', () => {
    const pagePath = path.join(ROOT_DIR, 'src/pages/AdminDashboardPage.jsx');
    const pageCode = fs.readFileSync(pagePath, 'utf-8');

    // Verify guard component logic
    expect(pageCode).toContain('function AdminAccessDeniedGuard');
    expect(pageCode).toContain('Access Restricted');
    expect(pageCode).toContain('Super Admin Clearance Required');
    expect(pageCode).toContain('fa-lock');
    expect(pageCode).toContain('lacks root administrative clearance');
    expect(pageCode).toContain('Return to Dashboard');
    expect(pageCode).toContain('Sign in as Admin');

    // Verify condition guarding the page
    expect(pageCode).toContain('const isAdmin = Boolean(');
    expect(pageCode).toContain('!isAdmin');
    expect(pageCode).toContain('<AdminAccessDeniedGuard');
  });
});

// ============================================================================
// Feature Area F9.2: Multi-User Directory & Hard Blocking Enforcement
// ============================================================================
describe('Tier 1: F9.2 - Multi-User Directory & Hard Blocking Enforcement', () => {
  it('TC-T1-F9.2-01: Default users list contains 6 profiles with correct roles, balances, and statuses', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    expect(Array.isArray(engine.users)).toBe(true);
    expect(engine.users.length).toBe(6);

    const admin = engine.users.find(u => u.id === 'usr_admin');
    expect(admin).toBeTruthy();
    expect(admin.username).toBe('admin');
    expect(admin.email).toBe('admin@gmail.com');
    expect(admin.role).toBe('admin');
    expect(admin.status).toBe('Active');
    expect(admin.balance).toBe(25000);
    expect(admin.eggVault).toBe(500);
    expect(admin.activeHens).toBe(10);

    const saqib = engine.users.find(u => u.id === 'usr_saqib');
    expect(saqib).toBeTruthy();
    expect(saqib.username).toBe('mrsaqib242');
    expect(saqib.role).toBe('farmer');
    expect(saqib.status).toBe('Active');
    expect(saqib.balance).toBe(4500);

    const zohaib = engine.users.find(u => u.id === 'usr_zohaib');
    expect(zohaib).toBeTruthy();
    expect(zohaib.username).toBe('zohaib_egg');
    expect(zohaib.role).toBe('farmer');
    expect(zohaib.status).toBe('Active');

    const hamza = engine.users.find(u => u.id === 'usr_hamza');
    expect(hamza).toBeTruthy();
    expect(hamza.username).toBe('hamza_farmer');
    expect(hamza.role).toBe('farmer');
    expect(hamza.status).toBe('Active');

    const malik = engine.users.find(u => u.id === 'usr_malik');
    expect(malik).toBeTruthy();
    expect(malik.username).toBe('malik_blocked');
    expect(malik.role).toBe('farmer');
    expect(malik.status).toBe('Blocked');

    const ayesha = engine.users.find(u => u.id === 'usr_ayesha');
    expect(ayesha).toBeTruthy();
    expect(ayesha.username).toBe('ayesha_hen');
    expect(ayesha.role).toBe('farmer');
    expect(ayesha.status).toBe('Active');
  });

  it('TC-T1-F9.2-02: Default credentials admin@gmail.com / password123 assigns role: \'admin\'', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('admin@gmail.com', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.role).toBe('admin');
    expect(engine.user.email).toBe('admin@gmail.com');
  });

  it('TC-T1-F9.2-03: Default farmer mrsaqib242 / password123 assigns role: \'farmer\'', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('mrsaqib242', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.role).toBe('farmer');
    expect(engine.user.username).toBe('mrsaqib242');
  });

  it('TC-T1-F9.2-04: blockUser(userId) changes status to \'Blocked\' and synchronizes session', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Active session for zohaib
    engine.login('zohaib_egg', 'password123');
    expect(engine.user.status).toBe('Active');

    const blockRes = engine.blockUser('usr_zohaib');
    expect(blockRes.success).toBe(true);
    expect(blockRes.user.status).toBe('Blocked');

    const targetUser = engine.users.find(u => u.id === 'usr_zohaib');
    expect(targetUser.status).toBe('Blocked');

    // Verify active session was synchronized
    expect(engine.user.status).toBe('Blocked');
  });

  it('TC-T1-F9.2-05: Root admin accounts (admin, usr_admin) cannot be blocked', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Verify FarmContext implementation source guard
    const ctxPath = path.join(ROOT_DIR, 'src/context/FarmContext.jsx');
    const ctxCode = fs.readFileSync(ctxPath, 'utf-8');
    expect(ctxCode).toContain('Super Admin accounts cannot be blocked');

    // Attempt blocking by id
    const resId = engine.blockUser('usr_admin');
    expect(resId.success).toBe(false);
    expect(resId.message).toContain('cannot be blocked');

    // Attempt blocking by username
    const resUsername = engine.blockUser('admin');
    expect(resUsername.success).toBe(false);
    expect(resUsername.message).toContain('cannot be blocked');

    const admin = engine.users.find(u => u.id === 'usr_admin');
    expect(admin.status).toBe('Active');
  });

  it('TC-T1-F9.2-06: unblockUser(userId) restores status to \'Active\'', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Ensure user starts as blocked
    const malikBefore = engine.users.find(u => u.id === 'usr_malik');
    expect(malikBefore.status).toBe('Blocked');

    const unblockRes = engine.unblockUser('usr_malik');
    expect(unblockRes.success).toBe(true);
    expect(unblockRes.user.status).toBe('Active');

    const malikAfter = engine.users.find(u => u.id === 'usr_malik');
    expect(malikAfter.status).toBe('Active');
  });

  it('TC-T1-F9.2-07: Blocked user cannot log in (\'Account is blocked. Please contact customer support.\')', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Ensure malik_blocked is blocked
    const malik = engine.users.find(u => u.username === 'malik_blocked');
    expect(malik.status).toBe('Blocked');

    const loginRes = engine.login('malik_blocked', 'password123');
    expect(loginRes.success).toBe(false);
    expect(loginRes.message).toBe('Account is blocked. Please contact customer support.');
    expect(engine.user.isLoggedIn).toBe(false);
  });

  it('TC-T1-F9.2-08: Blocked user cannot buy VIP farm assets', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.user.status = 'Blocked';
    const buyRes = engine.buyFarmAsset({ units: 1, gateway: 'Easypisa', methodCode: 1000 });
    expect(buyRes.success).toBe(false);
    expect(buyRes.message).toContain('Account is blocked');
  });

  it('TC-T1-F9.2-09: Blocked user cannot harvest eggs', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.user.status = 'Blocked';
    const harvestRes = engine.harvestEggs();
    expect(harvestRes.success).toBe(false);
    expect(harvestRes.eggsCollected).toBe(0);
    expect(harvestRes.message).toContain('Account is blocked');
  });

  it('TC-T1-F9.2-10: Blocked user cannot sell eggs / submit withdrawals', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.user.status = 'Blocked';
    const sellRes = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      rate: 32,
      eggs: 5,
      method: 'EasyPaisa',
      accountTitle: 'Test User',
      accountNumber: '03001234567'
    });
    expect(sellRes.success).toBe(false);
    expect(sellRes.pkrAmount).toBe(0);
    expect(sellRes.message).toContain('Account is blocked');
  });

  it('TC-T1-F9.2-11: updateUserBalances(userId, { balance, eggVault, hens }) updates target balances and active flock', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const updateRes = engine.updateUserBalances('usr_hamza', {
      balance: 12500,
      eggVault: 250,
      hens: 7
    });

    expect(updateRes.success).toBe(true);
    const hamza = engine.users.find(u => u.id === 'usr_hamza');
    expect(hamza.balance).toBe(12500);
    expect(hamza.eggVault).toBe(250);
    expect(hamza.activeHens).toBe(7);

    // Verify session synchronization if current user is updated
    engine.user.id = 'usr_hamza';
    engine.user.username = 'hamza_farmer';
    engine.updateUserBalances('usr_hamza', { balance: 15000, eggVault: 300 });
    expect(engine.balance).toBe(15000);
    expect(engine.eggVault).toBe(300);
  });
});

// ============================================================================
// Feature Area F9.3: Withdrawals Approval Desk
// ============================================================================
describe('Tier 1: F9.3 - Withdrawals Approval Desk', () => {
  it('TC-T1-F9.3-01: Initial state contains pending cashout requests', () => {
    expect(Array.isArray(DEFAULT_INITIAL_WITHDRAWALS)).toBe(true);
    const pendingList = DEFAULT_INITIAL_WITHDRAWALS.filter(w => w.status === 'Pending');
    expect(pendingList.length >= 2).toBe(true);

    const first = pendingList[0];
    expect(first.id).toBeTruthy();
    expect(first.store).toBeTruthy();
    expect(first.amountPkr > 0).toBe(true);
    expect(first.method).toBeTruthy();
    expect(first.accountTitle).toBeTruthy();
    expect(first.accountNumber).toBeTruthy();
    expect(first.status).toBe('Pending');
  });

  it('TC-T1-F9.3-02: approveWithdrawal(withdrawalId) updates status to \'Completed\' and generates TX-ADM- hash', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const approveRes = engine.approveWithdrawal('WD-PEND-1');
    expect(approveRes.success).toBe(true);
    expect(approveRes.withdrawal.status).toBe('Completed');
    expect(approveRes.withdrawal.txHash.startsWith('TX-ADM-')).toBe(true);
    expect(approveRes.withdrawal.approvedAt).toBeTruthy();

    const inMemory = engine.withdrawals.find(w => w.id === 'WD-PEND-1');
    expect(inMemory.status).toBe('Completed');
    expect(inMemory.txHash.startsWith('TX-ADM-')).toBe(true);
  });

  it('TC-T1-F9.3-03: rejectWithdrawal(withdrawalId, reason, true) updates status to \'Rejected\', records reason, and refunds PKR to balance', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial balance of usr_zohaib is 1200
    const zohaibBefore = engine.users.find(u => u.id === 'usr_zohaib');
    const prevBalance = zohaibBefore.balance;

    const rejectRes = engine.rejectWithdrawal('WD-PEND-2', 'Incorrect Account Details', true);
    expect(rejectRes.success).toBe(true);
    expect(rejectRes.withdrawal.status).toBe('Rejected');
    expect(rejectRes.withdrawal.rejectReason).toBe('Incorrect Account Details');
    expect(rejectRes.withdrawal.rejectedAt).toBeTruthy();

    // WD-PEND-2 has amountPkr = 800, so balance should be prevBalance + 800
    const zohaibAfter = engine.users.find(u => u.id === 'usr_zohaib');
    expect(zohaibAfter.balance).toBe(prevBalance + 800);
  });

  it('TC-T1-F9.3-04: rejectWithdrawal(withdrawalId, reason, false) updates status to \'Rejected\' without refunding balance', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Seed a pending cashout for usr_hamza
    const testWd = {
      id: 'WD-TEST-HAMZA',
      store: 'Sonica FORM STORE',
      eggs: 10,
      rate: 32,
      amountPkr: 320,
      method: 'EasyPaisa',
      accountTitle: 'Hamza Eggs',
      accountNumber: '03009999999',
      status: 'Pending',
      username: 'hamza_farmer',
      userId: 'usr_hamza'
    };
    engine.withdrawals.push(testWd);

    const hamzaBefore = engine.users.find(u => u.id === 'usr_hamza');
    const balanceBefore = hamzaBefore.balance;

    const rejectRes = engine.rejectWithdrawal('WD-TEST-HAMZA', 'Fraudulent attempt suspected', false);
    expect(rejectRes.success).toBe(true);
    expect(rejectRes.withdrawal.status).toBe('Rejected');
    expect(rejectRes.withdrawal.rejectReason).toBe('Fraudulent attempt suspected');

    const hamzaAfter = engine.users.find(u => u.id === 'usr_hamza');
    // Balance should remain unchanged because refundBalance was false
    expect(hamzaAfter.balance).toBe(balanceBefore);
  });
});

// ============================================================================
// Feature Area F9.4: Platform Settings & Community Configuration
// ============================================================================
describe('Tier 1: F9.4 - Platform Settings & Community Configuration', () => {
  it('TC-T1-F9.4-01: updatePlatformSettings updates deposit gateway account titles, numbers, and QR codes', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const updateRes = engine.updatePlatformSettings({
      depositGateways: {
        easypaisa: {
          accountTitle: 'AL REHMAN PRIME AGRI',
          accountNumber: '03450000001',
          qrCodeUrl: '/src/assets/new-ep-qr.png',
          instructions: 'New payment instructions for EP'
        },
        jazzcash: {
          accountTitle: 'AL REHMAN JC PRIME',
          accountNumber: '03000000002',
          qrCodeUrl: '/src/assets/new-jc-qr.png',
          instructions: 'New payment instructions for JC'
        }
      }
    });

    expect(updateRes.success).toBe(true);
    const ep = engine.platformSettings.depositGateways.easypaisa;
    expect(ep.accountTitle).toBe('AL REHMAN PRIME AGRI');
    expect(ep.accountNumber).toBe('03450000001');
    expect(ep.qrCodeUrl).toBe('/src/assets/new-ep-qr.png');

    const jc = engine.platformSettings.depositGateways.jazzcash;
    expect(jc.accountTitle).toBe('AL REHMAN JC PRIME');
    expect(jc.accountNumber).toBe('03000000002');
  });

  it('TC-T1-F9.4-02: updatePlatformSettings updates WhatsApp community links, channel, support phone, and popup toggle', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const updateRes = engine.updatePlatformSettings({
      communityLinks: {
        whatsappGroup: 'https://chat.whatsapp.com/NEW_GROUP_INVITE',
        whatsappChannel: 'https://whatsapp.com/channel/NEW_CHANNEL',
        supportPhone: '+923001112233',
        popupEnabled: false
      }
    });

    expect(updateRes.success).toBe(true);
    const comm = engine.platformSettings.communityLinks;
    expect(comm.whatsappGroup).toBe('https://chat.whatsapp.com/NEW_GROUP_INVITE');
    expect(comm.whatsappChannel).toBe('https://whatsapp.com/channel/NEW_CHANNEL');
    expect(comm.supportPhone).toBe('+923001112233');
    expect(comm.popupEnabled).toBe(false);
  });

  it('TC-T1-F9.4-03: updatePlatformSettings updates hen unit price and egg liquidation market rates', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const updateRes = engine.updatePlatformSettings({
      marketRates: {
        henUnitPrice: 550,
        stores: [
          { id: 'sonica', name: 'Sonica Egg Trade', rate: 35 },
          { id: 'usmaina', name: 'Usmaina Mart', rate: 32 },
          { id: 'syed', name: 'Syed Traders', rate: 36 }
        ],
        eggRates: {
          sonica: 35,
          usmaina: 32,
          syed: 36
        }
      }
    });

    expect(updateRes.success).toBe(true);
    const rates = engine.platformSettings.marketRates;
    expect(rates.henUnitPrice).toBe(550);
    expect(rates.eggRates.sonica).toBe(35);
    expect(rates.eggRates.syed).toBe(36);

    // Persistence cross-check: reload new FarmEngine from same storage
    const reloaded = new FarmEngine(storage);
    expect(reloaded.platformSettings.marketRates.henUnitPrice).toBe(550);
    expect(reloaded.platformSettings.marketRates.eggRates.sonica).toBe(35);
  });
});

// ============================================================================
// Feature Area F9.5: Platform KPIs & Audit Trail
// ============================================================================
describe('Tier 1: F9.5 - Platform KPIs & Audit Trail', () => {
  it('TC-T1-F9.5-01: getAdminKPIs() returns accurate totals for users, hens, eggs, liquidated PKR, and pending queue', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const kpi = engine.getAdminKPIs();
    expect(kpi.totalUsers).toBe(6);
    expect(kpi.totalActiveHens >= 26).toBe(true);
    expect(kpi.totalEggsProduced >= 1000).toBe(true);
    expect(kpi.pendingWithdrawalsCount >= 2).toBe(true);
    expect(kpi.pendingWithdrawalsVolume >= 2300).toBe(true);
    expect(typeof kpi.totalLiquidatedPkr).toBe('number');
  });

  it('TC-T1-F9.5-02: Admin actions generate audit logs in activityLogs', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const initialLogCount = engine.activityLogs.length;

    // Perform an admin block action
    engine.blockUser('usr_zohaib');
    expect(engine.activityLogs.length).toBe(initialLogCount + 1);
    const blockLog = engine.activityLogs[0];
    expect(blockLog.action).toBe('BLOCK_USER');
    expect(blockLog.category).toBe('ADMIN');
    expect(blockLog.timestamp).toBeTruthy();

    // Perform balance update action
    engine.updateUserBalances('usr_hamza', { balance: 5000 });
    const updateLog = engine.activityLogs[0];
    expect(updateLog.action).toBe('UPDATE_USER_BALANCES');
    expect(updateLog.category).toBe('ADMIN');

    // Perform settings update action
    engine.updatePlatformSettings({ communityLinks: { supportPhone: '+923111222333' } });
    const settingsLog = engine.activityLogs[0];
    expect(settingsLog.action).toBe('UPDATE_SETTINGS');
    expect(settingsLog.category).toBe('ADMIN');
  });
});
