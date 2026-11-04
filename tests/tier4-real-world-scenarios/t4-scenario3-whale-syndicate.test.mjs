// tests/tier4-real-world-scenarios/t4-scenario3-whale-syndicate.test.mjs
// Tier 4 - Real-World Application Scenario 3: Whale Agribusiness Syndicate

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 4: Scenario 3 - Whale Agribusiness Syndicate Bulk Production', () => {
  it('TC-T4-SCENARIO-03: Syndicate acquires 50 Hens (Rs. 25,000) -> 30-Day Run yields 1,500 Eggs -> Sells 1,500 to Syed @ Rs 33 -> Receives Rs. 49,500 Bank Transfer', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Bulk syndicate acquisition: 50 Hen Units (Rs. 25,000 PKR)
    const bulkBuy = engine.buyFarmAsset({ units: 50, methodCode: '1001' }); // JazzCash
    expect(bulkBuy.success).toBe(true);
    expect(bulkBuy.cost).toBe(25000);
    expect(bulkBuy.dailyYield).toBe(50);
    expect(bulkBuy.fullTermEggs).toBe(6000);

    // 2. 30-Day production run (50 hens * 30 days = 1,500 eggs)
    const sim = engine.simulateDays(30);
    expect(sim.daysSimulated).toBe(30);
    expect(sim.totalHarvested).toBe(1500);
    expect(engine.eggVault).toBe(1500);

    // 3. Bulk liquidation to Syed poultry farm @ Rs 33 with Bank Transfer (HBL)
    const bulkSell = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 1500,
      method: 'All Bank Pakistan',
      accountTitle: 'Rehman Agro Syndicate Corp',
      accountNumber: 'PK36HABB0000001234567890',
      bankName: 'HBL'
    });

    expect(bulkSell.success).toBe(true);
    expect(bulkSell.pkrAmount).toBe(49500); // 1500 * 33
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(49500);

    // Verify withdrawal record details
    expect(engine.withdrawals.length).toBe(1);
    const wd = engine.withdrawals[0];
    expect(wd.store).toBe('Syed poultry farm');
    expect(wd.eggs).toBe(1500);
    expect(wd.rate).toBe(33);
    expect(wd.amountPkr).toBe(49500);
    expect(wd.bankName).toBe('HBL');
    expect(wd.accountTitle).toBe('Rehman Agro Syndicate Corp');

    // Net Profit: Rs. 49,500 payout - Rs. 25,000 capital = Rs. 24,500 net profit in just 30 days
    const netProfit = engine.balance - bulkBuy.cost;
    expect(netProfit).toBe(24500);
  });
});
