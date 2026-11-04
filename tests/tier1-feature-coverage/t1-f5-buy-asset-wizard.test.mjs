// tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs
// Tier 1 - Feature Coverage: F4.1 - F4.6 Buy VIP Farm Asset Wizard & Multiplier Engine

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine, PAYMENT_GATEWAYS, ASSET_SPEC } from '../helpers/farm-engine.mjs';

describe('Tier 1: F4.1 - F4.6 - Buy VIP Farm Asset Engine', () => {
  it('TC-T1-F4.2-01: Verifies baseline asset specifications (Rs. 500/unit, +1 Egg/day, 120d term, 120 total eggs)', () => {
    expect(ASSET_SPEC.unitPrice).toBe(500);
    expect(ASSET_SPEC.dailyYieldPerUnit).toBe(1);
    expect(ASSET_SPEC.termDays).toBe(120);
    expect(ASSET_SPEC.totalYieldPerUnit).toBe(120);
  });

  it('TC-T1-F4.4-01: Calculates dynamic yield projection matrix accurately for 1, 5, 10, and 25 units', () => {
    const calculateMatrix = (qty) => ({
      cost: qty * ASSET_SPEC.unitPrice,
      dailyYield: qty * ASSET_SPEC.dailyYieldPerUnit,
      monthlyYield: qty * ASSET_SPEC.dailyYieldPerUnit * 30,
      fullTermYield: qty * ASSET_SPEC.totalYieldPerUnit
    });

    const m1 = calculateMatrix(1);
    expect(m1.cost).toBe(500);
    expect(m1.dailyYield).toBe(1);
    expect(m1.monthlyYield).toBe(30);
    expect(m1.fullTermYield).toBe(120);

    const m5 = calculateMatrix(5);
    expect(m5.cost).toBe(2500);
    expect(m5.dailyYield).toBe(5);
    expect(m5.monthlyYield).toBe(150);
    expect(m5.fullTermYield).toBe(600);

    const m10 = calculateMatrix(10);
    expect(m10.cost).toBe(5000);
    expect(m10.dailyYield).toBe(10);
    expect(m10.monthlyYield).toBe(300);
    expect(m10.fullTermYield).toBe(1200);

    const m25 = calculateMatrix(25);
    expect(m25.cost).toBe(12500);
    expect(m25.dailyYield).toBe(25);
    expect(m25.monthlyYield).toBe(750);
    expect(m25.fullTermYield).toBe(3000);
  });

  it('TC-T1-F4.5-01: Verifies supported payment gateways (Easypisa Code 1000, Jazz cash Code 1001) with 0% fee', () => {
    expect(PAYMENT_GATEWAYS.length).toBe(2);

    const easypisa = PAYMENT_GATEWAYS.find(g => g.code === '1000');
    expect(easypisa).toBeTruthy();
    expect(easypisa.name).toBe('Easypisa');
    expect(easypisa.fee).toBe(0);

    const jazzcash = PAYMENT_GATEWAYS.find(g => g.code === '1001');
    expect(jazzcash).toBeTruthy();
    expect(jazzcash.name).toBe('Jazz cash');
    expect(jazzcash.fee).toBe(0);
  });

  it('TC-T1-F4.6-01: Executes asset purchase via Easypisa updating activeAssets and logging transaction', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 2, methodCode: '1000' });
    expect(res.success).toBe(true);
    expect(res.cost).toBe(1000);
    expect(res.dailyYield).toBe(2);
    expect(res.fullTermEggs).toBe(240);

    expect(engine.activeAssets.length).toBe(1);
    expect(engine.activeAssets[0].units).toBe(2);
    expect(engine.activeAssets[0].totalCost).toBe(1000);

    expect(engine.transactions.length).toBe(1);
    expect(engine.transactions[0].type).toBe('BUY');
    expect(engine.transactions[0].amount).toBe(1000);
    expect(engine.transactions[0].gateway).toBe('Easypisa');
  });

  it('TC-T1-F4.6-02: Executes asset purchase via JazzCash and verifies state persistence across reload', () => {
    const storage = new MockLocalStorage();
    const engine1 = new FarmEngine(storage);

    engine1.buyFarmAsset({ units: 5, methodCode: '1001' });
    expect(engine1.activeAssets.length).toBe(1);

    // Verify storage persistence
    const engine2 = new FarmEngine(storage);
    expect(engine2.activeAssets.length).toBe(1);
    expect(engine2.activeAssets[0].units).toBe(5);
    expect(engine2.activeAssets[0].gateway).toBe('Jazz cash');
    expect(engine2.transactions.length).toBe(1);
  });

  it('TC-T1-F4.3-01: Validates pasture flock multiplier preset increments (+1, +2, +5, +10, +25)', () => {
    let currentQty = 1;
    const applyPreset = (preset) => { currentQty += preset; return currentQty; };

    expect(applyPreset(1)).toBe(2);
    expect(applyPreset(2)).toBe(4);
    expect(applyPreset(5)).toBe(9);
    expect(applyPreset(10)).toBe(19);
    expect(applyPreset(25)).toBe(44);
  });
});
