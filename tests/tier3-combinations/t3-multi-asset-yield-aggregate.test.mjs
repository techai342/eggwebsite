// tests/tier3-combinations/t3-multi-asset-yield-aggregate.test.mjs
// Tier 3 - Cross-Feature Combination: Multiple VIP Asset Buys & Aggregate Daily Yield Engine

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 3: Multi-Asset Scalability & Yield Aggregation', () => {
  it('TC-T3-AGG-01: Aggregates flock size across staggered multi-gateway purchases and computes combined daily harvest rate', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Batch 1: 3 units via Easypisa (Rs. 1,500)
    const b1 = engine.buyFarmAsset({ units: 3, methodCode: '1000' });
    expect(b1.success).toBe(true);

    // Batch 2: 7 units via JazzCash (Rs. 3,500)
    const b2 = engine.buyFarmAsset({ units: 7, methodCode: '1001' });
    expect(b2.success).toBe(true);

    // Verify 2 assets
    expect(engine.activeAssets.length).toBe(2);

    // Verify total units
    const analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(10);
    expect(analytics.totalBuyVolumePkr).toBe(5000);

    // Verify combined daily rate
    const dailyRate = analytics.totalUnitsBought * 1;
    expect(dailyRate).toBe(10);

    // Harvest combined flock
    const harvestRes = engine.harvestEggs(new Date());
    expect(harvestRes.success).toBe(true);
    expect(harvestRes.eggsCollected).toBe(10);
    expect(engine.eggVault).toBe(10);
  });

  it('TC-T3-AGG-02: Simulates 10 days of aggregated flock yield and verifies cumulative production', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Buy 15 units total across 3 transactions
    engine.buyFarmAsset({ units: 5, methodCode: '1000' });
    engine.buyFarmAsset({ units: 5, methodCode: '1001' });
    engine.buyFarmAsset({ units: 5, methodCode: '1000' });

    expect(engine.activeAssets.length).toBe(3);

    // Simulate 10 days
    const simRes = engine.simulateDays(10);
    expect(simRes.daysSimulated).toBe(10);
    expect(simRes.totalHarvested).toBe(150); // 15 hens * 10 days = 150 eggs
    expect(engine.eggVault).toBe(150);

    // Verify storage persistence of aggregated state
    const reloaded = new FarmEngine(storage);
    expect(reloaded.eggVault).toBe(150);
    expect(reloaded.activeAssets.length).toBe(3);
  });
});
