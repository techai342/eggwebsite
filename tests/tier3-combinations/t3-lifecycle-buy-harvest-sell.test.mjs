// tests/tier3-combinations/t3-lifecycle-buy-harvest-sell.test.mjs
// Tier 3 - Cross-Feature Combination: Buy Asset -> Harvest Egg -> Sell Egg -> Cashout Workflow

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 3: End-to-End Asset Adoption, Harvest & Liquidation Loop', () => {
  it('TC-T3-CYCLE-01: Executes complete primary lifecycle: Buy -> Harvest -> Liquidate -> Verify Ledger', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Authenticate
    const loginRes = engine.login('mrsaqib242', 'password123');
    expect(loginRes.success).toBe(true);

    // 2. Buy 5 Hen Units via Easypisa
    const buyRes = engine.buyFarmAsset({ units: 5, methodCode: '1000' });
    expect(buyRes.success).toBe(true);
    expect(buyRes.cost).toBe(2500);
    expect(engine.activeAssets.length).toBe(1);
    expect(engine.activeAssets[0].units).toBe(5);

    // 3. Harvest 24h yield
    const t0 = new Date('2026-11-04T08:00:00Z');
    const harvestRes = engine.harvestEggs(t0);
    expect(harvestRes.success).toBe(true);
    expect(harvestRes.eggsCollected).toBe(5);
    expect(engine.eggVault).toBe(5);

    // 4. Liquidate all 5 eggs to Syed poultry farm @ Rs 33 via JazzCash
    const sellRes = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 5,
      method: 'Jazzcash',
      accountTitle: 'Farmer Saqib',
      accountNumber: '03219876543'
    });

    expect(sellRes.success).toBe(true);
    expect(sellRes.pkrAmount).toBe(165); // 5 * 33
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(165);

    // 5. Verify transactions ledger
    expect(engine.transactions.length).toBe(3);
    expect(engine.transactions[0].type).toBe('BUY');
    expect(engine.transactions[1].type).toBe('HARVEST');
    expect(engine.transactions[2].type).toBe('SELL');

    // 6. Verify withdrawals ledger
    expect(engine.withdrawals.length).toBe(1);
    expect(engine.withdrawals[0].store).toBe('Syed poultry farm');
    expect(engine.withdrawals[0].amountPkr).toBe(165);
    expect(engine.withdrawals[0].method).toBe('Jazzcash');
  });

  it('TC-T3-CYCLE-02: Executes consecutive multi-day production and partial liquidation cycle', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Setup: 4 active hens
    engine.buyFarmAsset({ units: 4, methodCode: '1001' });

    // Day 1 Harvest
    const day1 = new Date('2026-11-04T08:00:00Z');
    engine.harvestEggs(day1);
    expect(engine.eggVault).toBe(4);

    // Day 2 Harvest (24h later)
    const day2 = new Date('2026-11-05T08:00:00Z');
    engine.harvestEggs(day2);
    expect(engine.eggVault).toBe(8);

    // Partial sale: Liquidate 5 eggs to Sonica @ Rs 32
    const sellRes = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 5,
      method: 'EasyPaisa',
      accountTitle: 'Saqib',
      accountNumber: '03001112233'
    });

    expect(sellRes.success).toBe(true);
    expect(sellRes.pkrAmount).toBe(160); // 5 * 32
    expect(engine.eggVault).toBe(3); // 8 - 5 = 3 remaining
    expect(engine.balance).toBe(160);
  });
});
