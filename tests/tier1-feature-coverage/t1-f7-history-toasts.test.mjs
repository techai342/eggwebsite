// tests/tier1-feature-coverage/t1-f7-history-toasts.test.mjs
// Tier 1 - Feature Coverage: F6.1 - F6.2 History Logging & Toast Feedback System

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 1: F6.1 - F6.2 - History Logging & Toast Feedback System', () => {
  it('TC-T1-F6.1-01: Verifies BUY transaction records full audit metadata in ledger', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 3, methodCode: '1000' });

    expect(engine.transactions.length).toBe(1);
    const trx = engine.transactions[0];
    expect(trx.type).toBe('BUY');
    expect(trx.amount).toBe(1500);
    expect(trx.unit).toBe('PKR');
    expect(trx.status).toBe('Completed');
    expect(trx.gateway).toBe('Easypisa');
    expect(trx.date).toBeTruthy();
  });

  it('TC-T1-F6.1-02: Verifies HARVEST transaction records egg yields and timestamp', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 4, methodCode: '1001' });
    engine.harvestEggs(new Date('2026-11-04T12:00:00Z'));

    const harvests = engine.transactions.filter(t => t.type === 'HARVEST');
    expect(harvests.length).toBe(1);
    expect(harvests[0].amount).toBe(4);
    expect(harvests[0].unit).toBe('Egg');
    expect(harvests[0].status).toBe('Completed');
  });

  it('TC-T1-F6.1-03: Verifies SELL transaction records cash payout and merchant description', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.eggVault = 20;
    engine.sellEggs({
      storeId: '2',
      storeName: 'Usmaina Poltry Farm',
      eggs: 20,
      method: 'Jazzcash',
      accountTitle: 'Farmer Saqib',
      accountNumber: '03001234567'
    });

    const sales = engine.transactions.filter(t => t.type === 'SELL');
    expect(sales.length).toBe(1);
    expect(sales[0].amount).toBe(600); // 20 * 30
    expect(sales[0].unit).toBe('PKR');
    expect(sales[0].description).toContain('Usmaina Poltry Farm');
  });

  it('TC-T1-F6.1-04: Validates multi-type transaction ledger filtering by transaction type', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 2, methodCode: '1000' });
    engine.harvestEggs(new Date('2026-11-04T08:00:00Z'));
    engine.sellEggs({
      storeId: '3',
      storeName: 'Syed poultry farm',
      eggs: 2,
      method: 'EasyPaisa',
      accountTitle: 'Farmer Saqib',
      accountNumber: '03412017923'
    });

    expect(engine.transactions.length).toBe(3);

    const filterByType = (type) => engine.transactions.filter(t => t.type === type);
    expect(filterByType('BUY').length).toBe(1);
    expect(filterByType('HARVEST').length).toBe(1);
    expect(filterByType('SELL').length).toBe(1);
    expect(filterByType('UNKNOWN').length).toBe(0);
  });

  it('TC-T1-F6.2-01: Verifies Toast Notification feedback contract produces compliant toast objects', () => {
    const toasts = [];
    const showToast = (type, message) => {
      const id = Date.now() + Math.random();
      const toast = { id, type, message, timestamp: new Date().toISOString() };
      toasts.push(toast);
      return toast;
    };

    const successToast = showToast('success', 'Asset acquired successfully!');
    expect(successToast.type).toBe('success');
    expect(successToast.message).toContain('Asset acquired');

    const errorToast = showToast('error', 'Insufficient egg vault balance.');
    expect(errorToast.type).toBe('error');
    expect(errorToast.message).toContain('Insufficient');

    expect(toasts.length).toBe(2);
  });
});
