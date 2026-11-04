// tests/tier4-real-world-scenarios/t4-scenario2-micro-compounder.test.mjs
// Tier 4 - Real-World Application Scenario 2: Micro-Investor Compounding Strategy

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 4: Scenario 2 - Micro-Investor Yield Compounding Strategy', () => {
  it('TC-T4-SCENARIO-02: Starts with 1 Hen (Rs. 500) -> 17-Day Harvest -> Breakeven Sale -> Reinvests in 2nd Hen -> Scales Production to 2x', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Initial micro-investment: 1 Hen (Rs. 500)
    const buy1 = engine.buyFarmAsset({ units: 1, methodCode: '1001' }); // JazzCash
    expect(buy1.success).toBe(true);
    expect(engine.activeAssets.length).toBe(1);
    expect(engine.getAnalytics().totalUnitsBought).toBe(1);

    // 2. Production phase 1: 17 days of yield (+1 egg/day) = 17 eggs
    const sim1 = engine.simulateDays(17);
    expect(sim1.totalHarvested).toBe(17);
    expect(engine.eggVault).toBe(17);

    // 3. Breakeven sale: Liquidate 17 eggs to Syed poultry farm @ Rs 33 = Rs. 561 PKR
    const sell1 = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 17,
      method: 'EasyPaisa',
      accountTitle: 'Micro Farmer',
      accountNumber: '03001234567'
    });
    expect(sell1.success).toBe(true);
    expect(sell1.pkrAmount).toBe(561); // 17 * 33
    expect(engine.balance).toBe(561);
    expect(engine.eggVault).toBe(0);

    // Breakeven check: Rs. 561 payout > Rs. 500 capital
    expect(engine.balance).toBeGreaterThan(500);

    // 4. Compounding Reinvestment: Purchase 2nd Hen Unit (Rs. 500)
    const buy2 = engine.buyFarmAsset({ units: 1, methodCode: '1000' });
    expect(buy2.success).toBe(true);
    expect(engine.activeAssets.length).toBe(2);

    // Production rate is now doubled to +2 Eggs/day
    const newFlockSize = engine.getAnalytics().totalUnitsBought;
    expect(newFlockSize).toBe(2);

    // 5. Production phase 2: 15 days with doubled flock (+2 eggs/day) = 30 eggs
    const sim2 = engine.simulateDays(15);
    expect(sim2.totalHarvested).toBe(30);
    expect(engine.eggVault).toBe(30);

    // 6. Liquidate 30 eggs to Sonica @ Rs 32 = Rs. 960 PKR
    const sell2 = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 30,
      method: 'EasyPaisa',
      accountTitle: 'Micro Farmer',
      accountNumber: '03001234567'
    });
    expect(sell2.success).toBe(true);
    expect(sell2.pkrAmount).toBe(960);

    // Final ledger state: 2 hen purchases, 2 sales
    expect(engine.activeAssets.length).toBe(2);
    expect(engine.withdrawals.length).toBe(2);
    expect(engine.getAnalytics().totalEggsSold).toBe(47); // 17 + 30
    expect(engine.getAnalytics().totalSalesPkr).toBe(1521); // 561 + 960
  });
});
