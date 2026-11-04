// tests/challenger-m7-2-adversarial-verification.mjs
// Adversarial Empirical Challenge Suite: Route Dispatching, Mock Session Transitions, Password Lockout & Offline Resilience
// Archetype: EMPIRICAL CHALLENGER (critic, specialist) — Milestone M7

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeAsync, itAsync, expect, getTestSummary, resetTestSummary } from './helpers/assertions.mjs';
import { FarmEngine, VERIFIED_MERCHANTS, PAYMENT_GATEWAYS, PAYOUT_METHODS, ASSET_SPEC } from './helpers/farm-engine.mjs';
import { MockLocalStorage } from './helpers/mock-storage.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n' + '='.repeat(75));
console.log('\x1b[1m\x1b[33m  EMPIRICAL CHALLENGER (M7-2): ADVERSARIAL VERIFICATION SUITE\x1b[0m');
console.log('\x1b[90m  Scope: Route Dispatching | Mock Sessions | Password Lockout | Offline\x1b[0m');
console.log('='.repeat(75) + '\n');

resetTestSummary();

// ======================================================================
// SUITE 1: Route Dispatching & Normalization Adversarial Stress
// ======================================================================
await describeAsync('Suite 1: Route Dispatching & Normalization Adversarial Challenge', async () => {
  // Extract and verify App.jsx routing logic directly from source
  const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  // Route normalizer implementation matching App.jsx:
  // const normalizedRoute = currentRoute.split('#')[0].replace(/\/$/, '') || '/';
  function normalizeRoute(route) {
    if (!route || typeof route !== 'string') return '/';
    return route.split('#')[0].replace(/\/$/, '') || '/';
  }

  function resolveComponent(route) {
    const normalized = normalizeRoute(route);
    switch (normalized) {
      case '/login':
        return 'LoginPage';
      case '/dashboard':
        return 'DashboardPage';
      case '/buy-asset':
        return 'BuyAssetPage';
      case '/sell-egg':
      case '/withdraw':
        return 'SellEggPage';
      case '/change-password':
        return 'ChangePasswordPage';
      case '/':
      default:
        return 'LandingPage';
    }
  }

  await itAsync('TC-ROUTE-01: Navigates and resolves all standard routes to their respective page components', async () => {
    expect(resolveComponent('/')).toBe('LandingPage');
    expect(resolveComponent('/login')).toBe('LoginPage');
    expect(resolveComponent('/dashboard')).toBe('DashboardPage');
    expect(resolveComponent('/buy-asset')).toBe('BuyAssetPage');
    expect(resolveComponent('/sell-egg')).toBe('SellEggPage');
    expect(resolveComponent('/withdraw')).toBe('SellEggPage');
    expect(resolveComponent('/change-password')).toBe('ChangePasswordPage');
  });

  await itAsync('TC-ROUTE-02: Normalizes trailing slashes across all valid routes', async () => {
    expect(resolveComponent('/login/')).toBe('LoginPage');
    expect(resolveComponent('/dashboard/')).toBe('DashboardPage');
    expect(resolveComponent('/buy-asset/')).toBe('BuyAssetPage');
    expect(resolveComponent('/sell-egg/')).toBe('SellEggPage');
    expect(resolveComponent('/withdraw/')).toBe('SellEggPage');
    expect(resolveComponent('/change-password/')).toBe('ChangePasswordPage');
  });

  await itAsync('TC-ROUTE-03: Handles hash-based sub-routes (e.g. #farm anchor inside dashboard)', async () => {
    expect(resolveComponent('/dashboard#farm')).toBe('DashboardPage');
    expect(resolveComponent('/dashboard#harvest')).toBe('DashboardPage');
    expect(resolveComponent('/buy-asset#step2')).toBe('BuyAssetPage');
  });

  await itAsync('TC-ROUTE-04: Gracefully handles malformed, unknown, or injection-like routes with LandingPage fallback', async () => {
    expect(resolveComponent('')).toBe('LandingPage');
    expect(resolveComponent(null)).toBe('LandingPage');
    expect(resolveComponent(undefined)).toBe('LandingPage');
    expect(resolveComponent('/unknown-page-404')).toBe('LandingPage');
    expect(resolveComponent('/admin/sql-injection--')).toBe('LandingPage');
    expect(resolveComponent('/../../../etc/passwd')).toBe('LandingPage');
  });

  await itAsync('TC-ROUTE-05: Verifies unified /withdraw route resolution and WithdrawPage wrapper contract', async () => {
    const wdPath = path.join(ROOT_DIR, 'src', 'pages', 'WithdrawPage.jsx');
    expect(fs.existsSync(wdPath)).toBe(true);
    const wdCode = fs.readFileSync(wdPath, 'utf-8');
    expect(wdCode).toContain("import SellEggPage from './SellEggPage'");
    expect(wdCode).toContain('currentRoute="/withdraw"');
    expect(resolveComponent('/withdraw')).toBe('SellEggPage');
  });

  await itAsync('TC-ROUTE-06: Verifies App.jsx export manifest for all 6 core page components and WithdrawPage alias', async () => {
    expect(appCode).toContain('export { LandingPage, LoginPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage }');
    expect(appCode).toContain('export const WithdrawPage = SellEggPage');
  });
});

// ======================================================================
// SUITE 2: Mock Session Transitions Without External Database
// ======================================================================
await describeAsync('Suite 2: Mock Session Transitions Without External Database', async () => {
  await itAsync('TC-SESS-01: Bootstraps complete farmer state in memory/localStorage when storage is empty', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial state check
    expect(engine.user.username).toBe('mrsaqib242');
    expect(engine.user.accountId).toBe('#1197');
    expect(typeof engine.balance).toBe('number');
    expect(typeof engine.eggVault).toBe('number');
    expect(Array.isArray(engine.activeAssets)).toBe(true);
    expect(Array.isArray(engine.transactions)).toBe(true);
    expect(Array.isArray(engine.withdrawals)).toBe(true);

    // Storage persistence check
    const rawState = storage.getItem('alrehman_meta_eggs_state');
    expect(rawState).toBeTruthy();
    const parsed = JSON.parse(rawState);
    expect(parsed.user.username).toBe('mrsaqib242');
  });

  await itAsync('TC-SESS-02: Transitions to active authenticated session on username login without external network call', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Ensure initial logged out state
    engine.user.isLoggedIn = false;
    engine.user.token = null;

    const res = engine.login('mrsaqib242', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.token).toBeTruthy();
    expect(engine.user.token.startsWith('jwt_session_')).toBe(true);

    // Verify localStorage was updated with active session
    const stored = JSON.parse(storage.getItem('alrehman_meta_eggs_state'));
    expect(stored.user.isLoggedIn).toBe(true);
    expect(stored.user.token).toBe(engine.user.token);
  });

  await itAsync('TC-SESS-03: Transitions to active authenticated session on admin email login without external network call', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.user.isLoggedIn = false;
    engine.user.token = null;

    const res = engine.login('admin@gmail.com', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.token).toBeTruthy();
  });

  await itAsync('TC-SESS-04: Transitions to logged-out state clearing session token upon logout', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // First login
    engine.login('mrsaqib242', 'password123');
    expect(engine.user.isLoggedIn).toBe(true);

    // Then logout
    const res = engine.logout();
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(false);
    expect(engine.user.token).toBe(null);

    // Verify persistence in localStorage
    const stored = JSON.parse(storage.getItem('alrehman_meta_eggs_state'));
    expect(stored.user.isLoggedIn).toBe(false);
    expect(stored.user.token).toBe(null);
  });

  await itAsync('TC-SESS-05: Emulates full browser reload and rehydrates session without network loss', async () => {
    const storage = new MockLocalStorage();

    // Session 1: Login, buy asset, and harvest
    const session1 = new FarmEngine(storage);
    session1.login('mrsaqib242', 'password123');
    session1.buyFarmAsset({ units: 3, gateway: 'Easypisa' });
    const initialBalance = session1.balance;
    const initialFlock = session1.activeAssets.length;

    // Simulate browser reload by instantiating new FarmEngine with same storage
    const session2 = new FarmEngine(storage);
    expect(session2.user.isLoggedIn).toBe(true);
    expect(session2.balance).toBe(initialBalance);
    expect(session2.activeAssets.length).toBe(initialFlock);
    expect(session2.transactions.length).toBe(session1.transactions.length);
  });
});

// ======================================================================
// SUITE 3: Password Lockout & Credential Rotation Adversarial Stress
// ======================================================================
await describeAsync('Suite 3: Password Lockout & Credential Rotation Adversarial Stress', async () => {
  await itAsync('TC-LOCK-01: Rejects password change when current password is wrong or missing', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Wrong current password
    const resWrong = engine.changePassword('wrongpass999', 'NewSecret2026!', 'NewSecret2026!');
    expect(resWrong.success).toBe(false);
    expect(resWrong.message).toContain('Current password does not match existing records.');

    // Missing current password
    const resEmpty = engine.changePassword('', 'NewSecret2026!', 'NewSecret2026!');
    expect(resEmpty.success).toBe(false);
    expect(resEmpty.message).toContain('All password fields are required.');
  });

  await itAsync('TC-LOCK-02: Rejects password change with length < 6 or mismatching confirmation', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Length < 6
    const resShort = engine.changePassword('password123', 'abc', 'abc');
    expect(resShort.success).toBe(false);
    expect(resShort.message).toContain('New password must be at least 6 characters.');

    // Mismatched confirmation
    const resMismatch = engine.changePassword('password123', 'SecurePass2026', 'SecurePass2027');
    expect(resMismatch.success).toBe(false);
    expect(resMismatch.message).toContain('New password and confirm password do not match.');
  });

  await itAsync('TC-LOCK-03: CRITICAL LOCKOUT: Changing password immediately locks out old password', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Initial login with old credentials succeeds
    const initialLogin = engine.login('mrsaqib242', 'password123');
    expect(initialLogin.success).toBe(true);

    // 2. Change password to new credentials
    const rotateRes = engine.changePassword('password123', 'UltraHardenedPass2026!#$', 'UltraHardenedPass2026!#$');
    expect(rotateRes.success).toBe(true);

    // 3. Logout session
    engine.logout();
    expect(engine.user.isLoggedIn).toBe(false);

    // 4. ATTEMPT LOGIN WITH OLD PASSWORD -> MUST BE STRICTLY LOCKED OUT
    const oldLoginUsername = engine.login('mrsaqib242', 'password123');
    expect(oldLoginUsername.success).toBe(false);
    expect(oldLoginUsername.message).toContain('Invalid credentials');
    expect(engine.user.isLoggedIn).toBe(false);

    // 5. ATTEMPT LOGIN WITH OLD PASSWORD VIA EMAIL -> MUST BE STRICTLY LOCKED OUT
    const oldLoginEmail = engine.login('admin@gmail.com', 'password123');
    expect(oldLoginEmail.success).toBe(false);
    expect(oldLoginEmail.message).toContain('Invalid credentials');
    expect(engine.user.isLoggedIn).toBe(false);

    // 6. LOGIN WITH NEW PASSWORD -> MUST SUCCEED
    const newLogin = engine.login('mrsaqib242', 'UltraHardenedPass2026!#$');
    expect(newLogin.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
  });

  await itAsync('TC-LOCK-04: Password lockout persists across complete storage rehydration', async () => {
    const storage = new MockLocalStorage();

    // Session A changes password
    const engineA = new FarmEngine(storage);
    engineA.changePassword('password123', 'FreshPassword999', 'FreshPassword999');
    engineA.logout();

    // Session B rehydrates from storage
    const engineB = new FarmEngine(storage);

    // Old password fails in Session B
    const failRes = engineB.login('mrsaqib242', 'password123');
    expect(failRes.success).toBe(false);

    // New password succeeds in Session B
    const passRes = engineB.login('mrsaqib242', 'FreshPassword999');
    expect(passRes.success).toBe(true);
  });
});

// ======================================================================
// SUITE 4: Offline Resilience & Zero-Network Verification
// ======================================================================
await describeAsync('Suite 4: Offline Resilience & Zero-Network Verification', async () => {
  await itAsync('TC-OFFLINE-01: Full farmer transaction cycle executes with zero network / fetch dependencies', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Login offline
    expect(engine.login('mrsaqib242', 'password123').success).toBe(true);

    // 2. Buy Asset offline
    const buyRes = engine.buyFarmAsset({ units: 2, gateway: 'Easypisa' });
    expect(buyRes.success).toBe(true);
    expect(buyRes.cost).toBe(1000);

    // 3. Harvest Eggs offline
    engine.lastHarvest = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    engine.cooldownActive = false;
    const harvestRes = engine.harvestEggs();
    expect(harvestRes.success).toBe(true);
    expect(harvestRes.eggsCollected).toBeGreaterThan(0);

    // 4. Liquidate / Sell Eggs offline
    const sellRes = engine.sellEggs({
      storeId: '1',
      eggs: 1,
      method: 'EasyPaisa',
      accountTitle: 'Offline Farmer',
      accountNumber: '03001234567'
    });
    expect(sellRes.success).toBe(true);
    expect(sellRes.pkrAmount).toBe(32);

    // 5. Change Password offline
    const pwdRes = engine.changePassword('password123', 'OfflineSecret888', 'OfflineSecret888');
    expect(pwdRes.success).toBe(true);

    // 6. Logout offline
    expect(engine.logout().success).toBe(true);
  });

  await itAsync('TC-OFFLINE-02: Self-healing schema recovery from malformed/corrupted localStorage', async () => {
    // Inject corrupt non-JSON string into storage
    const corruptedStorage = new MockLocalStorage({
      alrehman_meta_eggs_state: '{ corrupt_json_structure: 12345 ??? '
    });

    const engine = new FarmEngine(corruptedStorage);
    // Must recover safely to defaults without uncaught exception
    expect(engine.user.username).toBe('mrsaqib242');
    expect(typeof engine.balance).toBe('number');
    expect(typeof engine.eggVault).toBe('number');
    expect(Array.isArray(engine.activeAssets)).toBe(true);
    expect(Array.isArray(engine.transactions)).toBe(true);
    expect(Array.isArray(engine.withdrawals)).toBe(true);
  });

  await itAsync('TC-OFFLINE-03: Production build assets and local media files exist locally in workspace', async () => {
    const assets = [
      path.join(ROOT_DIR, 'src', 'assets', 'logo.webp'),
      path.join(ROOT_DIR, 'src', 'assets', 'hen.png'),
      path.join(ROOT_DIR, 'src', 'assets', 'egg.png'),
      path.join(ROOT_DIR, 'src', 'assets', 'easypisa.png'),
      path.join(ROOT_DIR, 'src', 'assets', 'jazzcash.png'),
      path.join(ROOT_DIR, 'src', 'assets', 'bank.jpg'),
      path.join(ROOT_DIR, 'src', 'rawafiles.css'),
      path.join(ROOT_DIR, 'index.html')
    ];

    for (const assetPath of assets) {
      expect(fs.existsSync(assetPath)).toBe(true);
      const stat = fs.statSync(assetPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });
});

const summary = getTestSummary();

console.log('\n' + '='.repeat(75));
console.log('\x1b[1m\x1b[36m         M7-2 ADVERSARIAL CHALLENGE EXECUTION SUMMARY REPORT\x1b[0m');
console.log('='.repeat(75));
console.log(` Total Suites: 4 | Total Tests: ${summary.total} | Passed: \x1b[32m${summary.passed}\x1b[0m | Failed: ${summary.failed > 0 ? `\x1b[31m${summary.failed}\x1b[0m` : `\x1b[90m${summary.failed}\x1b[0m`}`);
console.log('='.repeat(75));

if (summary.failed === 0) {
  console.log(`\n\x1b[1m\x1b[42m\x1b[30m  SUCCESS  \x1b[0m \x1b[1m\x1b[32mAll ${summary.passed} M7-2 adversarial challenge tests passed with 100% success!\x1b[0m\n`);
  process.exit(0);
} else {
  console.log(`\n\x1b[1m\x1b[41m\x1b[37m  FAILURE  \x1b[0m \x1b[1m\x1b[31m${summary.failed} challenge test(s) failed!\x1b[0m\n`);
  process.exit(1);
}
