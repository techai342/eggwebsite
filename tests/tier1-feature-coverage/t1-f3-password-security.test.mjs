// tests/tier1-feature-coverage/t1-f3-password-security.test.mjs
// Tier 1 - Feature Coverage: F2.5 - F2.6 Password Security Management

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 1: F2.5 - F2.6 - Password Security Management', () => {
  it('TC-T1-F2.6-01: Successfully updates farmer password when matching all security criteria', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'SuperSecretPass2026!', 'SuperSecretPass2026!');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Password updated successfully');
  });

  it('TC-T1-F2.6-02: Rejects password update when current password is invalid', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('incorrectCurrent', 'SuperSecretPass2026!', 'SuperSecretPass2026!');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Current password does not match');
  });

  it('TC-T1-F2.6-03: Rejects password update when confirm password does not match new password', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'NewValidPass123', 'MismatchedConfirm123');
    expect(res.success).toBe(false);
    expect(res.message).toContain('do not match');
  });

  it('TC-T1-F2.6-04: Enforces minimum password length policy (>= 6 characters)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', '12345', '12345');
    expect(res.success).toBe(false);
    expect(res.message).toContain('at least 6 characters');
  });

  it('TC-T1-F2.6-05: Verifies that after password change, new password works for login and old password fails', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.changePassword('password123', 'MyNewFarmPass2026', 'MyNewFarmPass2026');
    engine.logout();

    // Old password must fail
    const oldLogin = engine.login('mrsaqib242', 'password123');
    expect(oldLogin.success).toBe(false);

    // New password must succeed
    const newLogin = engine.login('mrsaqib242', 'MyNewFarmPass2026');
    expect(newLogin.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
  });

  it('TC-T1-F2.5-01: Verifies field completeness check (all three password fields required)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('', 'NewPass123', 'NewPass123');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
  });
});
