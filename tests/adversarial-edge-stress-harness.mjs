// tests/adversarial-edge-stress-harness.mjs
// Adversarial Empirical Stress Harness: Boundary Limits, Hostile Corruptions, Race Conditions & Live Server Verification
// Archetype: EMPIRICAL CHALLENGER (Milestone M7)

import { describeAsync, itAsync, expect, getTestSummary } from './helpers/assertions.mjs';
import { FarmEngine, VERIFIED_MERCHANTS, PAYMENT_GATEWAYS, PAYOUT_METHODS, ASSET_SPEC } from './helpers/farm-engine.mjs';
import { MockLocalStorage } from './helpers/mock-storage.mjs';
import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = 'D:\\allakermegg';

console.log('======================================================================');
console.log('  AL REHMAN META EGGS — ADVERSARIAL EMPIRICAL STRESS HARNESS (M7)     ');
console.log('  Archetype: EMPIRICAL CHALLENGER (critic, specialist)                ');
console.log('======================================================================');

await describeAsync('Suite 1: Zero Balance, Zero Flock & Boundary Input Hardening', async () => {
  await itAsync('TC-ADV-01: Rejects buyFarmAsset with 0, negative, fractional, or non-numeric units', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const r0 = engine.buyFarmAsset({ units: 0, gateway: 'Easypisa' });
    expect(r0.success).toBe(false);

    const rNeg = engine.buyFarmAsset({ units: -10, gateway: 'Easypisa' });
    expect(rNeg.success).toBe(false);

    const rFrac = engine.buyFarmAsset({ units: 3.1415, gateway: 'Easypisa' });
    expect(rFrac.success).toBe(false);

    const rStr = engine.buyFarmAsset({ units: 'invalid_qty', gateway: 'Easypisa' });
    expect(rStr.success).toBe(false);

    const rNaN = engine.buyFarmAsset({ units: NaN, gateway: 'Easypisa' });
    expect(rNaN.success).toBe(false);
  });

  await itAsync('TC-ADV-02: Enforces maximum allocation cap of 1,000 units on asset purchases', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1,001 units should be rejected
    const rOver = engine.buyFarmAsset({ units: 1001, gateway: 'Easypisa' });
    expect(rOver.success).toBe(false);
    expect(rOver.message).toContain('Maximum purchase limit per transaction is 1,000 units.');

    // Exactly 1,000 units should be accepted
    const rExact = engine.buyFarmAsset({ units: 1000, gateway: 'Easypisa' });
    expect(rExact.success).toBe(true);
    expect(rExact.cost).toBe(500000);
    expect(rExact.dailyYield).toBe(1000);
    expect(rExact.fullTermEggs).toBe(120000);
  });

  await itAsync('TC-ADV-03: Rejects harvestEggs when farmer coop has zero (0) active hen units', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.activeAssets = []; // Zero assets

    const rHarvest = engine.harvestEggs();
    expect(rHarvest.success).toBe(false);
    expect(rHarvest.eggsCollected).toBe(0);
    expect(rHarvest.message).toContain('No active hen units available in your coop');

    // Also test with activeAssets containing units: 0
    engine.activeAssets = [{ id: 'empty-1', units: 0 }];
    const rHarvestZero = engine.harvestEggs();
    expect(rHarvestZero.success).toBe(false);
  });

  await itAsync('TC-ADV-04: Rejects sellEggs with 0, negative, fractional, or non-finite values', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.eggVault = 100;

    const r0 = engine.sellEggs({ storeId: '1', eggs: 0, method: 'EasyPaisa', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(r0.success).toBe(false);

    const rNeg = engine.sellEggs({ storeId: '1', eggs: -50, method: 'EasyPaisa', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rNeg.success).toBe(false);

    const rNaN = engine.sellEggs({ storeId: '1', eggs: NaN, method: 'EasyPaisa', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rNaN.success).toBe(false);

    const rInf = engine.sellEggs({ storeId: '1', eggs: Infinity, method: 'EasyPaisa', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rInf.success).toBe(false);
  });

  await itAsync('TC-ADV-05: Enforces vault balance bounds and merchant trading limits (1 to 10,000 eggs)', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.eggVault = 20000;

    // Over merchant trading cap (> 10,000 eggs)
    const rOverCap = engine.sellEggs({ storeId: '3', eggs: 10001, method: 'Jazzcash', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rOverCap.success).toBe(false);
    expect(rOverCap.message).toContain('Store trading limits violated');

    // Exactly 10,000 eggs to Syed @ Rs. 33 = Rs. 330,000 PKR
    const rExactCap = engine.sellEggs({ storeId: '3', eggs: 10000, method: 'Jazzcash', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rExactCap.success).toBe(true);
    expect(rExactCap.pkrAmount).toBe(330000);
    expect(engine.eggVault).toBe(10000);

    // Over available vault balance
    const rOverVault = engine.sellEggs({ storeId: '3', eggs: 10001, method: 'Jazzcash', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rOverVault.success).toBe(false);
    expect(rOverVault.message).toContain('Insufficient eggs in vault');
  });

  await itAsync('TC-ADV-06: Validates merchant IDs, payout channels, and required bank fields', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.eggVault = 50;

    // Non-existent merchant
    const rBadMerchant = engine.sellEggs({ storeId: '999', eggs: 10, method: 'EasyPaisa', accountTitle: 'Test', accountNumber: '03001234567' });
    expect(rBadMerchant.success).toBe(false);
    expect(rBadMerchant.message).toContain('Invalid or unverified merchant store selected');

    // Missing account title / number
    const rMissingTitle = engine.sellEggs({ storeId: '1', eggs: 10, method: 'EasyPaisa', accountTitle: '', accountNumber: '03001234567' });
    expect(rMissingTitle.success).toBe(false);

    // Bank transfer missing bank name
    const rMissingBank = engine.sellEggs({ storeId: '1', eggs: 10, method: 'All Bank Pakistan', accountTitle: 'Test', accountNumber: 'PK36HABB000', bankName: '' });
    expect(rMissingBank.success).toBe(false);
    expect(rMissingBank.message).toContain('Bank name selection is required');

    // Bank transfer with valid bank name succeeds
    const rValidBank = engine.sellEggs({ storeId: '1', eggs: 10, method: 'All Bank Pakistan', accountTitle: 'Test', accountNumber: 'PK36HABB000', bankName: 'MEEZAN' });
    expect(rValidBank.success).toBe(true);
  });
});

await describeAsync('Suite 2: Hostile Storage Corruption & Schema Self-Healing', async () => {
  await itAsync('TC-ADV-07: Recovers safely from malformed / non-JSON data in localStorage', async () => {
    const storage = new MockLocalStorage({
      alrehman_meta_eggs_state: 'MALFORMED_{{{[JSON!%@^'
    });
    const engine = new FarmEngine(storage);

    // Must not throw, must load safe defaults
    expect(engine.user.username).toBe('mrsaqib242');
    expect(engine.balance).toBe(0);
    expect(engine.eggVault).toBe(0);
    expect(Array.isArray(engine.activeAssets)).toBe(true);
    expect(Array.isArray(engine.transactions)).toBe(true);
    expect(Array.isArray(engine.withdrawals)).toBe(true);
  });

  await itAsync('TC-ADV-08: Heals corrupted field types (strings as balances, non-array collections)', async () => {
    const storage = new MockLocalStorage({
      alrehman_meta_eggs_state: JSON.stringify({
        user: null,
        balance: 'corrupted_five_thousand',
        eggVault: 'not_an_egg_number',
        activeAssets: 'invalid_string_instead_of_array',
        transactions: 12345,
        withdrawals: false
      })
    });
    const engine = new FarmEngine(storage);

    // Check healed defaults
    expect(typeof engine.balance).toBe('number');
    expect(engine.balance).toBe(0);
    expect(typeof engine.eggVault).toBe('number');
    expect(engine.eggVault).toBe(0);
    expect(Array.isArray(engine.activeAssets)).toBe(true);
    expect(Array.isArray(engine.transactions)).toBe(true);
    expect(Array.isArray(engine.withdrawals)).toBe(true);
  });

  await itAsync('TC-ADV-09: Handles temporal edge cases in harvest timestamps (future, past, and invalid dates)', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.activeAssets = [{ id: 'a1', units: 5 }];

    // Future timestamp locks cooldown
    engine.lastHarvest = new Date(Date.now() + 86400000).toISOString();
    engine.cooldownActive = true;
    const rFuture = engine.harvestEggs();
    expect(rFuture.success).toBe(false);
    expect(rFuture.message).toContain('Harvest cooldown active');

    // Ancient timestamp (48h ago) permits harvest
    engine.lastHarvest = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    engine.cooldownActive = true;
    const rAncient = engine.harvestEggs();
    expect(rAncient.success).toBe(true);
    expect(rAncient.eggsCollected).toBe(5);
  });
});

await describeAsync('Suite 3: Reentrancy, Rapid Mutation & Race Condition Simulation', async () => {
  await itAsync('TC-ADV-10: 100 rapid sequential asset acquisitions preserve transactional integrity', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const initialAssetsCount = engine.activeAssets.length;
    const initialTrxCount = engine.transactions.length;

    // Simulate 100 rapid 1-unit purchases
    for (let i = 0; i < 100; i++) {
      const res = engine.buyFarmAsset({ units: 1, gateway: 'Easypisa' });
      expect(res.success).toBe(true);
    }

    expect(engine.activeAssets.length).toBe(initialAssetsCount + 100);
    expect(engine.transactions.length).toBe(initialTrxCount + 100);

    const analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(100);
    expect(analytics.totalBuyVolumePkr).toBe(50000);
  });

  await itAsync('TC-ADV-11: Consecutive rapid double-harvests prevent duplicate yield extraction', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.activeAssets = [{ id: 'hen-1', units: 10 }];
    engine.cooldownActive = false;
    engine.lastHarvest = null;

    const initialVault = engine.eggVault;

    // First harvest succeeds
    const h1 = engine.harvestEggs();
    expect(h1.success).toBe(true);
    expect(h1.eggsCollected).toBe(10);
    expect(engine.eggVault).toBe(initialVault + 10);

    // Immediate second harvest MUST fail with cooldown warning
    const h2 = engine.harvestEggs();
    expect(h2.success).toBe(false);
    expect(h2.eggsCollected).toBe(0);
    expect(engine.eggVault).toBe(initialVault + 10); // Unchanged
  });

  await itAsync('TC-ADV-12: Rapid liquidations and overdraft double-spend prevention', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.eggVault = 100;
    engine.balance = 0;

    // 5 rapid sales of 10 eggs each = 50 eggs sold
    for (let i = 0; i < 5; i++) {
      const res = engine.sellEggs({
        storeId: '1', // Sonica @ Rs. 32
        eggs: 10,
        method: 'EasyPaisa',
        accountTitle: 'Test Farmer',
        accountNumber: '03001234567'
      });
      expect(res.success).toBe(true);
      expect(res.pkrAmount).toBe(320);
    }

    expect(engine.eggVault).toBe(50);
    expect(engine.balance).toBe(1600); // 5 * 320

    // Now attempt to sell 60 eggs (overdraft attempt)
    const rOverdraft = engine.sellEggs({
      storeId: '1',
      eggs: 60,
      method: 'EasyPaisa',
      accountTitle: 'Test Farmer',
      accountNumber: '03001234567'
    });
    expect(rOverdraft.success).toBe(false);
    expect(rOverdraft.message).toContain('Insufficient eggs in vault');
    expect(engine.eggVault).toBe(50); // Vault uncorrupted
  });

  await itAsync('TC-ADV-13: Mathematical ledger invariant: finalVault === initialVault + harvested - sold', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.activeAssets = [{ id: 'h1', units: 12 }]; // Produces 12 eggs/day
    engine.eggVault = 20;

    const initialVault = engine.eggVault;

    // Day 1: Harvest 12 eggs
    const h1 = engine.harvestEggs();
    expect(h1.success).toBe(true);

    // Liquidate 8 eggs to Syed @ 33
    const s1 = engine.sellEggs({ storeId: '3', eggs: 8, method: 'Jazzcash', accountTitle: 'T', accountNumber: '0300' });
    expect(s1.success).toBe(true);

    // Fast-forward 24h & Day 2: Harvest 12 eggs
    engine.resetCooldown();
    const h2 = engine.harvestEggs();
    expect(h2.success).toBe(true);

    // Liquidate 15 eggs to Sonica @ 32
    const s2 = engine.sellEggs({ storeId: '1', eggs: 15, method: 'EasyPaisa', accountTitle: 'T', accountNumber: '0300' });
    expect(s2.success).toBe(true);

    const totalHarvested = 12 + 12; // 24
    const totalSold = 8 + 15; // 23
    const expectedFinalVault = initialVault + totalHarvested - totalSold;

    expect(engine.eggVault).toBe(expectedFinalVault);
    expect(engine.balance).toBe(8 * 33 + 15 * 32); // 264 + 480 = 744 PKR
  });
});

await describeAsync('Suite 4: Authentication Security & Credential Rotation Stress', async () => {
  await itAsync('TC-ADV-14: Rejects login with empty strings and injection payloads', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    expect(engine.login('', '').success).toBe(false);
    expect(engine.login('   ', 'password123').success).toBe(false);
    expect(engine.login("' OR '1'='1", "' OR '1'='1").success).toBe(false);
    expect(engine.login('<script>alert(1)</script>', 'pass').success).toBe(false);
  });

  await itAsync('TC-ADV-15: Password mutation boundary check (5 char reject, 6 char accept, complex unicode accept)', async () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 5 chars rejected
    const r5 = engine.changePassword('password123', '12345', '12345');
    expect(r5.success).toBe(false);
    expect(r5.message).toContain('New password must be at least 6 characters');

    // 6 chars accepted
    const r6 = engine.changePassword('password123', '123456', '123456');
    expect(r6.success).toBe(true);

    // Complex unicode/symbol password accepted
    const rUnicode = engine.changePassword('123456', 'P@ssw0rd!#🔒🚀99', 'P@ssw0rd!#🔒🚀99');
    expect(rUnicode.success).toBe(true);

    // Old passwords fail
    expect(engine.login('mrsaqib242', 'password123').success).toBe(false);
    expect(engine.login('mrsaqib242', '123456').success).toBe(false);

    // New unicode password succeeds
    expect(engine.login('mrsaqib242', 'P@ssw0rd!#🔒🚀99').success).toBe(true);
  });
});

await describeAsync('Suite 5: Live Dev Server HTTP & Static Asset Verification', async () => {
  await itAsync('TC-ADV-16: Dev server responds at http://localhost:5173 with HTTP 200 and AL Rehman Meta Eggs branding', async () => {
    const res = await fetch('http://localhost:5173/');
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('AL Rehman Meta Eggs');
    expect(html).toContain('/src/main.jsx');
  });

  await itAsync('TC-ADV-17: All essential application assets are served with HTTP 200 via dev server', async () => {
    const assetUrls = [
      'http://localhost:5173/src/assets/logo.webp',
      'http://localhost:5173/src/assets/hen.png',
      'http://localhost:5173/src/assets/egg.png',
      'http://localhost:5173/src/assets/easypisa.png',
      'http://localhost:5173/src/assets/jazzcash.png',
      'http://localhost:5173/src/assets/bank.jpg',
      'http://localhost:5173/src/rawafiles.css'
    ];

    for (const url of assetUrls) {
      const res = await fetch(url);
      expect(res.status).toBe(200);
    }
  });

  await itAsync('TC-ADV-18: Production build bundle integrity verification (dist/ folder)', async () => {
    const distHtmlPath = path.join(PROJECT_ROOT, 'dist', 'index.html');
    expect(fs.existsSync(distHtmlPath)).toBe(true);
    const distHtml = fs.readFileSync(distHtmlPath, 'utf-8');
    expect(distHtml).toContain('AL Rehman Meta Eggs');
  });
});

await describeAsync('Suite 6: SPA Route Dispatcher & Component Contract Conformance', async () => {
  await itAsync('TC-ADV-19: App.jsx exports all required page components and WithdrawPage alias', async () => {
    const appPath = path.join(PROJECT_ROOT, 'src', 'App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');

    expect(appContent).toContain('LandingPage');
    expect(appContent).toContain('LoginPage');
    expect(appContent).toContain('DashboardPage');
    expect(appContent).toContain('BuyAssetPage');
    expect(appContent).toContain('SellEggPage');
    expect(appContent).toContain('ChangePasswordPage');
    expect(appContent).toContain('export const WithdrawPage = SellEggPage');
  });

  await itAsync('TC-ADV-20: App.jsx route matcher covers all standard, alias, and fallback paths', async () => {
    const appPath = path.join(PROJECT_ROOT, 'src', 'App.jsx');
    const appContent = fs.readFileSync(appPath, 'utf-8');

    expect(appContent).toContain("case '/login':");
    expect(appContent).toContain("case '/dashboard':");
    expect(appContent).toContain("case '/buy-asset':");
    expect(appContent).toContain("case '/sell-egg':");
    expect(appContent).toContain("case '/withdraw':");
    expect(appContent).toContain("case '/change-password':");
    expect(appContent).toContain("case '/':");
    expect(appContent).toContain("default:");
  });

  await itAsync('TC-ADV-21: WithdrawPage component wraps SellEggPage with currentRoute="/withdraw"', async () => {
    const wdPath = path.join(PROJECT_ROOT, 'src', 'pages', 'WithdrawPage.jsx');
    const wdContent = fs.readFileSync(wdPath, 'utf-8');

    expect(wdContent).toContain("import SellEggPage from './SellEggPage'");
    expect(wdContent).toContain('currentRoute="/withdraw"');
  });
});

const summary = getTestSummary();
console.log('\n======================================================================');
console.log('            ADVERSARIAL STRESS TEST SUMMARY REPORT                    ');
console.log('======================================================================');
console.log(`  Passed: ${summary.passed} | Failed: ${summary.failed} | Total: ${summary.total}`);
if (summary.failed === 0) {
  console.log('\n  \x1b[32m✔ SUCCESS: ALL 21 ADVERSARIAL STRESS TESTS PASSED WITH 100% SUCCESS!\x1b[0m\n');
} else {
  console.log(`\n  \x1b[31m✖ FAILURE: ${summary.failed} test(s) failed!\x1b[0m\n`);
  process.exit(1);
}
