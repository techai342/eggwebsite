// tests/tier2-boundary-corner/t2-boundary-asset-buy.test.mjs
// Tier 2 - Boundary & Corner Cases: VIP Asset Purchase Limits & Zero/Negative Inputs

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 2: Asset Purchase Boundary & Input Edge Cases', () => {
  it('TC-T2-BUY-01: Rejects purchasing zero (0) units', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 0, methodCode: '1000' });
    expect(res.success).toBe(false);
    expect(res.message).toContain('positive integer');
    expect(engine.activeAssets.length).toBe(0);
  });

  it('TC-T2-BUY-02: Rejects purchasing negative units (-5)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: -5, methodCode: '1000' });
    expect(res.success).toBe(false);
    expect(res.message).toContain('positive integer');
    expect(engine.activeAssets.length).toBe(0);
  });

  it('TC-T2-BUY-03: Rejects fractional / non-integer quantities (3.5 units)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 3.5, methodCode: '1000' });
    expect(res.success).toBe(false);
    expect(res.message).toContain('positive integer');
  });

  it('TC-T2-BUY-04: Enforces upper limit boundary (rejects 1001 units)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 1001, methodCode: '1000' });
    expect(res.success).toBe(false);
    expect(res.message).toContain('Maximum purchase limit');
  });

  it('TC-T2-BUY-05: Accepts exact boundary upper limit (1,000 units = Rs. 500,000)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 1000, methodCode: '1000' });
    expect(res.success).toBe(true);
    expect(res.cost).toBe(500000);
    expect(res.dailyYield).toBe(1000);
    expect(res.fullTermEggs).toBe(120000);
  });

  it('TC-T2-BUY-06: Accepts exact boundary lower limit (1 unit = Rs. 500)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 1, methodCode: '1001' });
    expect(res.success).toBe(true);
    expect(res.cost).toBe(500);
    expect(res.dailyYield).toBe(1);
    expect(res.fullTermEggs).toBe(120);
  });

  it('TC-T2-BUY-07: Rejects transaction when unknown gateway code is supplied', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.buyFarmAsset({ units: 2, methodCode: '9999' });
    expect(res.success).toBe(false);
    expect(res.message).toContain('Invalid payment gateway');
  });
});
