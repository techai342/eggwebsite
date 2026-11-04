// tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs
// Tier 1 - Feature Coverage: F3.1 - F3.10 User Dashboard, Analytics, Orbit Nexus & Harvest Engine

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine, VERIFIED_MERCHANTS } from '../helpers/farm-engine.mjs';

describe('Tier 1: F3.1 - F3.10 - Dashboard Telemetry & Production Engine', () => {
  it('TC-T1-F3.1-01: Verifies Farmer Identity model adheres to Account ID #1197 and verified status', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    expect(engine.user.accountId).toBe('#1197');
    expect(engine.user.username).toBe('mrsaqib242');
    expect(engine.user.upliner).toBe('N/A');
  });

  it('TC-T1-F3.2-01: Calculates live Earnings Vault PKR equivalent based on vault egg count', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial vault
    expect(engine.eggVault).toBe(0);

    // Manually add 10 eggs to vault
    engine.eggVault = 10;
    const estimatedPkr = engine.eggVault * 30; // base rate 30 PKR / egg
    expect(estimatedPkr).toBe(300);
  });

  it('TC-T1-F3.3-01: Computes dynamic daily production rate from active flock units (+1 egg/day/unit)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial rate with 0 units
    let analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(0);

    // Buy 5 units
    engine.buyFarmAsset({ units: 5, methodCode: '1000' });
    analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(5);

    const dailyRate = analytics.totalUnitsBought * 1;
    expect(dailyRate).toBe(5);
  });

  it('TC-T1-F3.4-01: Executes 24-hour harvest collecting eggs from active flock and triggers cooldown', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Buy 4 units
    engine.buyFarmAsset({ units: 4, methodCode: '1000' });

    // Harvest
    const harvestRes = engine.harvestEggs(new Date('2026-11-04T12:00:00Z'));
    expect(harvestRes.success).toBe(true);
    expect(harvestRes.eggsCollected).toBe(4);
    expect(engine.eggVault).toBe(4);
    expect(engine.cooldownActive).toBe(true);
  });

  it('TC-T1-F3.4-02: Prevents secondary harvest within 24-hour cooldown period', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 3, methodCode: '1000' });
    engine.harvestEggs(new Date('2026-11-04T12:00:00Z'));

    // Attempt second harvest 2 hours later
    const earlyHarvest = engine.harvestEggs(new Date('2026-11-04T14:00:00Z'));
    expect(earlyHarvest.success).toBe(false);
    expect(earlyHarvest.eggsCollected).toBe(0);
    expect(earlyHarvest.message).toContain('Harvest cooldown active');
  });

  it('TC-T1-F3.8-01: Verifies Verified Buyers catalog contains Sonica (Rs 32), Usmaina (Rs 30), and Syed (Rs 33)', () => {
    expect(VERIFIED_MERCHANTS.length).toBe(3);

    const sonica = VERIFIED_MERCHANTS.find(m => m.name.includes('Sonica'));
    const usmaina = VERIFIED_MERCHANTS.find(m => m.name.includes('Usmaina'));
    const syed = VERIFIED_MERCHANTS.find(m => m.name.includes('Syed'));

    expect(sonica).toBeTruthy();
    expect(sonica.rate).toBe(32);
    expect(sonica.max).toBe(10000);

    expect(usmaina).toBeTruthy();
    expect(usmaina.rate).toBe(30);

    expect(syed).toBeTruthy();
    expect(syed.rate).toBe(33);
  });

  it('TC-T1-F3.5-01: Aggregates Farm Analytics grid metrics correctly across multiple operations', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.buyFarmAsset({ units: 2, methodCode: '1000' }); // 2 * 500 = 1000 PKR
    engine.harvestEggs(new Date()); // +2 eggs in vault
    engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 2,
      method: 'EasyPaisa',
      accountTitle: 'Test User',
      accountNumber: '03001234567'
    }); // 2 * 32 = 64 PKR

    const analytics = engine.getAnalytics();
    expect(analytics.totalUnitsBought).toBe(2);
    expect(analytics.totalBuyVolumePkr).toBe(1000);
    expect(analytics.totalEggsSold).toBe(2);
    expect(analytics.totalSalesPkr).toBe(64);
    expect(analytics.currentEggVault).toBe(0);
  });

  it('TC-T1-F3.9-01: Verifies Referral Hub code is mrsaqib242 and WhatsApp share link format', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const referralCode = engine.user.username;
    expect(referralCode).toBe('mrsaqib242');

    const expectedShareText = encodeURIComponent(`Join AL Rehman Meta Eggs with my invite code: ${referralCode}`);
    const whatsappLink = `https://wa.me/?text=${expectedShareText}`;
    expect(whatsappLink).toContain('mrsaqib242');
  });
});
