// tests/tier2-boundary-corner/t2-boundary-egg-sell.test.mjs
// Tier 2 - Boundary & Corner Cases: Egg Liquidation Limits & Vault Balance Checks

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 2: Egg Selling Boundary & Balance Limits', () => {
  it('TC-T2-SELL-01: Rejects liquidation of zero (0) eggs', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 100;
    const res = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 0,
      method: 'EasyPaisa',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('positive number');
    expect(engine.eggVault).toBe(100);
  });

  it('TC-T2-SELL-02: Rejects liquidation of negative (-10) eggs', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 100;
    const res = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: -10,
      method: 'EasyPaisa',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('positive number');
  });

  it('TC-T2-SELL-03: Rejects liquidation when requesting more eggs than available in vault', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 15;
    const res = engine.sellEggs({
      storeId: '2',
      storeName: 'Usmaina Poltry Farm',
      eggs: 20,
      method: 'Jazzcash',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('Insufficient eggs in vault');
    expect(res.message).toContain('Available: 15');
    expect(engine.eggVault).toBe(15);
    expect(engine.balance).toBe(0);
  });

  it('TC-T2-SELL-04: Accepts exact 100% liquidation of entire egg vault balance', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 77;
    const res = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 77,
      method: 'EasyPaisa',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(true);
    expect(res.pkrAmount).toBe(77 * 33); // 2541 PKR
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(2541);
  });

  it('TC-T2-SELL-05: Enforces merchant maximum trading limit (rejects > 10,000 eggs)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 15000;
    const res = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 10001,
      method: 'Jazzcash',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('Store trading limits violated');
  });

  it('TC-T2-SELL-06: Accepts exact merchant maximum trading limit (10,000 eggs)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 10000;
    const res = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 10000,
      method: 'EasyPaisa',
      accountTitle: 'Bulk Trader',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(true);
    expect(res.pkrAmount).toBe(320000);
    expect(engine.eggVault).toBe(0);
  });

  it('TC-T2-SELL-07: Rejects liquidation targeting non-existent merchant store ID', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 50;
    const res = engine.sellEggs({
      storeId: '9999',
      storeName: 'Ghost Merchant',
      eggs: 10,
      method: 'EasyPaisa',
      accountTitle: 'Test',
      accountNumber: '03001234567'
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('Invalid or unverified merchant store');
  });

  it('TC-T2-SELL-08: Rejects liquidation with missing account number or title', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 20;
    const res = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 10,
      method: 'EasyPaisa',
      accountTitle: '',
      accountNumber: ''
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('Account title and account number are required');
  });
});
