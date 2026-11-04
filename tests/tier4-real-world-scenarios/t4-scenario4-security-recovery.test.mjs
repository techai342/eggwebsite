// tests/tier4-real-world-scenarios/t4-scenario4-security-recovery.test.mjs
// Tier 4 - Real-World Application Scenario 4: Security Compromise & Forensic Ledger Audit

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 4: Scenario 4 - Security Compromise & Forensic Audit', () => {
  it('TC-T4-SCENARIO-04: Farmer detects suspicious access, changes credentials, logs out, re-authenticates with new password, and verifies 100% state integrity', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Existing established account state
    engine.login('mrsaqib242', 'password123');
    engine.buyFarmAsset({ units: 8, methodCode: '1000' });
    engine.eggVault = 55;
    engine.sellEggs({
      storeId: '1',
      storeName: 'Sonica FORM STORE',
      eggs: 20,
      method: 'EasyPaisa',
      accountTitle: 'Saqib',
      accountNumber: '03001234567'
    });

    const preAudit = engine.getAnalytics();
    const preAssetsCount = engine.activeAssets.length;
    const preTrxCount = engine.transactions.length;
    const preWdCount = engine.withdrawals.length;

    // 2. Security compromise response: Farmer changes password immediately
    const emergencyPass = 'UltraHardenedPass2026!#$';
    const pwdRes = engine.changePassword('password123', emergencyPass, emergencyPass);
    expect(pwdRes.success).toBe(true);

    // 3. Invalidate active session across all devices
    engine.logout();
    expect(engine.user.isLoggedIn).toBe(false);

    // 4. Verify breached old password fails
    const breachAttempt = engine.login('mrsaqib242', 'password123');
    expect(breachAttempt.success).toBe(false);

    // 5. Authorized re-authentication with new hardened credentials
    const validLogin = engine.login('mrsaqib242', emergencyPass);
    expect(validLogin.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);

    // 6. Forensic audit: Verify all assets, transactions, withdrawals, and balances remain intact
    const postAudit = engine.getAnalytics();
    expect(postAudit.totalUnitsBought).toBe(preAudit.totalUnitsBought);
    expect(postAudit.totalBuyVolumePkr).toBe(preAudit.totalBuyVolumePkr);
    expect(postAudit.totalEggsSold).toBe(preAudit.totalEggsSold);
    expect(postAudit.totalSalesPkr).toBe(preAudit.totalSalesPkr);
    expect(postAudit.currentEggVault).toBe(preAudit.currentEggVault);
    expect(postAudit.currentBalance).toBe(preAudit.currentBalance);

    expect(engine.activeAssets.length).toBe(preAssetsCount);
    expect(engine.transactions.length).toBe(preTrxCount);
    expect(engine.withdrawals.length).toBe(preWdCount);
  });
});
