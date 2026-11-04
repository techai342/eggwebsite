// tests/tier2-boundary-corner/t2-boundary-harvest.test.mjs
// Tier 2 - Boundary & Corner Cases: Harvest Cooldown Violations & Zero Flock Scenarios

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 2: Harvest Engine Cooldown & Flock Scenarios', () => {
  it('TC-T2-HRV-01: Rejects harvest when user has zero (0) active hen units', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    expect(engine.activeAssets.length).toBe(0);
    const res = engine.harvestEggs(new Date());

    expect(res.success).toBe(false);
    expect(res.eggsCollected).toBe(0);
    expect(res.message).toContain('No active hen units');
    expect(engine.eggVault).toBe(0);
  });

  it('TC-T2-HRV-02: Rejects harvest immediately after a previous harvest (0 seconds elapsed)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 2, methodCode: '1000' });
    const t0 = new Date('2026-11-04T10:00:00Z');
    engine.harvestEggs(t0);

    // Immediate second call
    const res = engine.harvestEggs(t0);
    expect(res.success).toBe(false);
    expect(res.message).toContain('Harvest cooldown active');
  });

  it('TC-T2-HRV-03: Rejects harvest at 23 hours and 59 minutes (boundary cooldown test)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 3, methodCode: '1000' });
    const t0 = new Date('2026-11-04T10:00:00Z');
    engine.harvestEggs(t0);

    // 23h 59m later
    const tBoundary = new Date(t0.getTime() + (23 * 60 + 59) * 60 * 1000);
    const res = engine.harvestEggs(tBoundary);

    expect(res.success).toBe(false);
    expect(res.message).toContain('Harvest cooldown active');
  });

  it('TC-T2-HRV-04: Permits harvest at exactly 24 hours (boundary unlock test)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 3, methodCode: '1000' });
    const t0 = new Date('2026-11-04T10:00:00Z');
    engine.harvestEggs(t0);
    expect(engine.eggVault).toBe(3);

    // Exactly 24 hours later
    const t24 = new Date(t0.getTime() + 24 * 60 * 60 * 1000);
    const res = engine.harvestEggs(t24);

    expect(res.success).toBe(true);
    expect(res.eggsCollected).toBe(3);
    expect(engine.eggVault).toBe(6);
  });

  it('TC-T2-HRV-05: Permits harvest after 48 hours and collects current 24h batch', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 5, methodCode: '1000' });
    const t0 = new Date('2026-11-04T10:00:00Z');
    engine.harvestEggs(t0);

    // 48 hours later
    const t48 = new Date(t0.getTime() + 48 * 60 * 60 * 1000);
    const res = engine.harvestEggs(t48);

    expect(res.success).toBe(true);
    expect(res.eggsCollected).toBe(5);
    expect(engine.eggVault).toBe(10);
  });
});
