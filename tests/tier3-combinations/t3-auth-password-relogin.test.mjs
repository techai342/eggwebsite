// tests/tier3-combinations/t3-auth-password-relogin.test.mjs
// Tier 3 - Cross-Feature Combination: Change Password -> Invalidate Session -> Re-authenticate with New Password

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 3: Password Rotation & Session Lifecycle Integration', () => {
  it('TC-T3-AUTH-01: Rotates credentials, invalidates session, verifies rejection of old password, and succeeds with new password', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // 1. Initial login
    const loginInitial = engine.login('mrsaqib242', 'password123');
    expect(loginInitial.success).toBe(true);

    // 2. Buy asset and establish user state
    engine.buyFarmAsset({ units: 3, methodCode: '1000' });
    expect(engine.activeAssets.length).toBe(1);

    // 3. Change password
    const newPass = 'MetaEggMaster2026!';
    const changeRes = engine.changePassword('password123', newPass, newPass);
    expect(changeRes.success).toBe(true);

    // 4. Terminate session
    engine.logout();
    expect(engine.user.isLoggedIn).toBe(false);

    // 5. Old password attempt MUST fail
    const oldAttempt = engine.login('mrsaqib242', 'password123');
    expect(oldAttempt.success).toBe(false);
    expect(engine.user.isLoggedIn).toBe(false);

    // 6. New password attempt MUST succeed
    const newAttempt = engine.login('mrsaqib242', newPass);
    expect(newAttempt.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.username).toBe('mrsaqib242');

    // 7. Verify asset state preserved
    expect(engine.activeAssets.length).toBe(1);
    expect(engine.activeAssets[0].units).toBe(3);
  });

  it('TC-T3-AUTH-02: Rotates password via admin email identifier and preserves withdrawal history across sessions', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Login with admin email
    engine.login('admin@gmail.com', 'password123');

    // Seed mock withdrawal
    engine.eggVault = 10;
    engine.sellEggs({
      storeId: '2',
      storeName: 'Usmaina Poltry Farm',
      eggs: 10,
      method: 'EasyPaisa',
      accountTitle: 'Admin Farmer',
      accountNumber: '03009998877'
    });
    expect(engine.withdrawals.length).toBe(1);

    // Change password
    engine.changePassword('password123', 'AdminNewKey999', 'AdminNewKey999');
    engine.logout();

    // Re-login with admin email and new password
    const relogin = engine.login('admin@gmail.com', 'AdminNewKey999');
    expect(relogin.success).toBe(true);

    // Verify withdrawal records intact
    expect(engine.withdrawals.length).toBe(1);
    expect(engine.withdrawals[0].amountPkr).toBe(300);
  });
});
