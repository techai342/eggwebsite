// tests/tier4-real-world-scenarios/t4-scenario1-full-farmer-journey.test.mjs
// Tier 4 - Real-World Application Scenario 1: Standard Farmer Complete Lifecycle

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 4: Scenario 1 - Standard Commercial Farmer Complete Lifecycle', () => {
  it('TC-T4-SCENARIO-01: Simulates complete 120-day commercial journey (Rs. 5,000 -> 10 Hens -> 1,200 Eggs -> Split Payouts -> Rs. 39,000 Net -> Security Update)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Stage 1: Onboarding & Authentication
    const login = engine.login('mrsaqib242', 'password123');
    expect(login.success).toBe(true);
    expect(engine.user.accountId).toBe('#1197');

    // Stage 2: Initial Capital Deployment (10 Hens @ Rs. 500 = Rs. 5,000)
    const buy = engine.buyFarmAsset({ units: 10, methodCode: '1000' }); // Easypisa
    expect(buy.success).toBe(true);
    expect(buy.cost).toBe(5000);
    expect(buy.dailyYield).toBe(10);
    expect(buy.fullTermEggs).toBe(1200);
    expect(engine.activeAssets.length).toBe(1);

    // Stage 3: 120-Day Production Cycle Simulation
    const sim = engine.simulateDays(120);
    expect(sim.daysSimulated).toBe(120);
    expect(sim.totalHarvested).toBe(1200);
    expect(engine.eggVault).toBe(1200);

    // Stage 4A: P2P Liquidation Phase 1 (600 eggs to Sonica @ Rs 32 = Rs 19,200 via JazzCash)
    const sell1 = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 600,
      method: 'Jazzcash',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: '03211234567'
    });
    expect(sell1.success).toBe(true);
    expect(sell1.pkrAmount).toBe(19200);
    expect(engine.eggVault).toBe(600);
    expect(engine.balance).toBe(19200);

    // Stage 4B: P2P Liquidation Phase 2 (Remaining 600 eggs to Syed @ Rs 33 = Rs 19,800 via Meezan Bank)
    const sell2 = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 600,
      method: 'All Bank Pakistan',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: 'PK36MEZN0001234567890123',
      bankName: 'MEEZAN'
    });
    expect(sell2.success).toBe(true);
    expect(sell2.pkrAmount).toBe(19800);
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(39000); // 19200 + 19800

    // Stage 5: Security Hardening (Rotate Password)
    const pwdChange = engine.changePassword('password123', 'SecureFarmer2026!', 'SecureFarmer2026!');
    expect(pwdChange.success).toBe(true);

    engine.logout();
    const reAuth = engine.login('mrsaqib242', 'SecureFarmer2026!');
    expect(reAuth.success).toBe(true);

    // Stage 6: Final Financial Reconciliation & Analytics Verification
    const analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(10);
    expect(analytics.totalBuyVolumePkr).toBe(5000);
    expect(analytics.totalEggsSold).toBe(1200);
    expect(analytics.totalSalesPkr).toBe(39000);
    expect(analytics.currentBalance).toBe(39000);
    expect(analytics.currentEggVault).toBe(0);
    expect(analytics.withdrawalsCount).toBe(2);

    // Verify 780% Gross Return (39000 / 5000 = 7.8x)
    const roi = (analytics.totalSalesPkr / analytics.totalBuyVolumePkr) * 100;
    expect(roi).toBe(780);
  });
});
