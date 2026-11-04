// tests/tier3-combinations/t3-multi-merchant-liquidation.test.mjs
// Tier 3 - Cross-Feature Combination: Multi-Merchant Split Liquidation & Diverse Payout Channels

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 3: Multi-Merchant Liquidation & Payout Diversity', () => {
  it('TC-T3-MKT-01: Liquidates a 100-egg vault across all 3 verified merchants using 3 distinct payout channels', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial state: 100 eggs in vault
    engine.eggVault = 100;
    expect(engine.balance).toBe(0);

    // Sale 1: 40 eggs to Sonica @ Rs 32 via EasyPaisa
    const s1 = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 40,
      method: 'EasyPaisa',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: '03412017923'
    });
    expect(s1.success).toBe(true);
    expect(s1.pkrAmount).toBe(1280); // 40 * 32
    expect(engine.eggVault).toBe(60);
    expect(engine.balance).toBe(1280);

    // Sale 2: 30 eggs to Usmaina @ Rs 30 via JazzCash
    const s2 = engine.sellEggs({
      storeId: '2',
      storeName: 'Usmaina Poltry Farm',
      eggs: 30,
      method: 'Jazzcash',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: '03219876543'
    });
    expect(s2.success).toBe(true);
    expect(s2.pkrAmount).toBe(900); // 30 * 30
    expect(engine.eggVault).toBe(30);
    expect(engine.balance).toBe(2180); // 1280 + 900

    // Sale 3: 30 eggs to Syed @ Rs 33 via All Bank Pakistan (Meezan)
    const s3 = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 30,
      method: 'All Bank Pakistan',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: 'PK36MEZN0001234567890123',
      bankName: 'MEEZAN'
    });
    expect(s3.success).toBe(true);
    expect(s3.pkrAmount).toBe(990); // 30 * 33
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(3170); // 2180 + 990

    // Verify Withdrawals Ledger
    expect(engine.withdrawals.length).toBe(3);
    expect(engine.withdrawals[0].method).toBe('EasyPaisa');
    expect(engine.withdrawals[1].method).toBe('Jazzcash');
    expect(engine.withdrawals[2].method).toBe('All Bank Pakistan');

    // Verify Farm Analytics
    const analytics = engine.getAnalytics();
    expect(analytics.totalEggsSold).toBe(100);
    expect(analytics.totalSalesPkr).toBe(3170);
    expect(analytics.currentEggVault).toBe(0);
  });
});
