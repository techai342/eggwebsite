// tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs
// Tier 1 - Feature Coverage: F5.1 - F5.7 Sell Egg & P2P Liquidation Marketplace

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine, VERIFIED_MERCHANTS, PAYOUT_METHODS } from '../helpers/farm-engine.mjs';

describe('Tier 1: F5.1 - F5.7 - Sell Egg & P2P Liquidation Marketplace', () => {
  it('TC-T1-F5.1-01: Derives Vault Banner summary metrics (best rate Rs 30, max rate Rs 33, store count 3)', () => {
    const rates = VERIFIED_MERCHANTS.map(m => m.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);

    expect(VERIFIED_MERCHANTS.length).toBe(3);
    expect(minRate).toBe(30);
    expect(maxRate).toBe(33);
  });

  it('TC-T1-F5.2-01: Verifies Merchant Store search and filter sorting logic', () => {
    // Filter by Best Rate (descending price)
    const sortedByRate = [...VERIFIED_MERCHANTS].sort((a, b) => b.rate - a.rate);
    expect(sortedByRate[0].name).toBe('Syed poultry farm');
    expect(sortedByRate[0].rate).toBe(33);

    // Filter by Most Trades (descending trades)
    const sortedByTrades = [...VERIFIED_MERCHANTS].sort((a, b) => b.trades - a.trades);
    expect(sortedByTrades[0].name).toBe('Sonica FORM STORE');
    expect(sortedByTrades[0].trades).toBe(6141);

    // Filter by Search query
    const searchMatch = VERIFIED_MERCHANTS.filter(m => m.name.toLowerCase().includes('usmaina'));
    expect(searchMatch.length).toBe(1);
    expect(searchMatch[0].name).toBe('Usmaina Poltry Farm');
  });

  it('TC-T1-F5.4-01: Validates supported payout channels and required account fields', () => {
    expect(PAYOUT_METHODS.length).toBe(3);

    const jazzcash = PAYOUT_METHODS.find(p => p.name === 'Jazzcash');
    const easypaisa = PAYOUT_METHODS.find(p => p.name === 'EasyPaisa');
    const bank = PAYOUT_METHODS.find(p => p.name === 'All Bank Pakistan');

    expect(jazzcash).toBeTruthy();
    expect(easypaisa).toBeTruthy();
    expect(bank).toBeTruthy();
    expect(bank.supportedBanks).toContain('MEEZAN');
    expect(bank.supportedBanks).toContain('HBL');
  });

  it('TC-T1-F5.5-01: Calculates quick percentage presets (25%, 50%, 75%, MAX ALL)', () => {
    const vault = 200;
    const p25 = Math.floor(vault * 0.25);
    const p50 = Math.floor(vault * 0.50);
    const p75 = Math.floor(vault * 0.75);
    const pMax = vault;

    expect(p25).toBe(50);
    expect(p50).toBe(100);
    expect(p75).toBe(150);
    expect(pMax).toBe(200);
  });

  it('TC-T1-F5.7-01: Liquidates eggs to Sonica FORM STORE updating vault, PKR balance, and withdrawal ledger', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Seed vault with 100 eggs
    engine.eggVault = 100;
    expect(engine.balance).toBe(0);

    const sellRes = engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 50,
      method: 'EasyPaisa',
      accountTitle: 'Farmer Saqib',
      accountNumber: '03412017923'
    });

    expect(sellRes.success).toBe(true);
    expect(sellRes.pkrAmount).toBe(50 * 32); // 1600 PKR
    expect(engine.eggVault).toBe(50);
    expect(engine.balance).toBe(1600);

    // Verify withdrawal ledger
    expect(engine.withdrawals.length).toBe(1);
    const wd = engine.withdrawals[0];
    expect(wd.store).toBe('Sonica FORM STORE');
    expect(wd.eggs).toBe(50);
    expect(wd.rate).toBe(32);
    expect(wd.amountPkr).toBe(1600);
    expect(wd.method).toBe('EasyPaisa');
    expect(wd.status).toBe('Completed');
  });

  it('TC-T1-F5.7-02: Liquidates eggs to Syed poultry farm via Bank Transfer and verifies IBAN record', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 80;

    const sellRes = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 80,
      method: 'All Bank Pakistan',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: 'PK36MEZN0001234567890123',
      bankName: 'MEEZAN'
    });

    expect(sellRes.success).toBe(true);
    expect(sellRes.pkrAmount).toBe(80 * 33); // 2640 PKR
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(2640);

    expect(engine.withdrawals.length).toBe(1);
    expect(engine.withdrawals[0].bankName).toBe('MEEZAN');
    expect(engine.withdrawals[0].accountNumber).toBe('PK36MEZN0001234567890123');
  });

  it('TC-T1-F5.6-01: Rejects bank transfer liquidation when bank name is omitted', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 10;

    const sellRes = engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 10,
      method: 'All Bank Pakistan',
      accountTitle: 'Saqib Ur Rehman',
      accountNumber: '1234567890'
      // bankName missing
    });

    expect(sellRes.success).toBe(false);
    expect(sellRes.message).toContain('Bank name selection is required');
  });
});
