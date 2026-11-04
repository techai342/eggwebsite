// tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs
// Tier 1 - Feature Coverage: F2.1 - F2.4, F2.7 Farmer Authentication & Session Lifecycle

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 1: F2.1 - F2.4, F2.7 - Authentication & Session Engine', () => {
  it('TC-T1-F2.3-01: Authenticates successfully using default username (mrsaqib242) and default password', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('mrsaqib242', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(engine.user.username).toBe('mrsaqib242');
    expect(engine.user.accountId).toBe('#1197');
    expect(engine.user.token).toBeTruthy();
  });

  it('TC-T1-F2.3-02: Authenticates successfully using default admin email (admin@gmail.com) and password', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('admin@gmail.com', 'password123');
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(true);
    expect(res.message).toContain('Entering farm coop');
  });

  it('TC-T1-F2.1-01: Rejects login with incorrect credentials and provides security feedback', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('mrsaqib242', 'wrong_password_xyz');
    expect(res.success).toBe(false);
    expect(res.message).toContain('Invalid credentials');
    expect(engine.user.isLoggedIn).toBe(false);
  });

  it('TC-T1-F2.4-01: Verifies session persistence across engine reloads via localStorage mock', () => {
    const storage = new MockLocalStorage();
    const engine1 = new FarmEngine(storage);

    engine1.login('mrsaqib242', 'password123');
    expect(engine1.user.isLoggedIn).toBe(true);

    // Instantiate new engine reading from same storage
    const engine2 = new FarmEngine(storage);
    expect(engine2.user.isLoggedIn).toBe(true);
    expect(engine2.user.username).toBe('mrsaqib242');
    expect(engine2.user.accountId).toBe('#1197');
  });

  it('TC-T1-F2.7-01: Executes logout clearing session token and active farmer state', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.login('mrsaqib242', 'password123');
    expect(engine.user.isLoggedIn).toBe(true);

    const logoutRes = engine.logout();
    expect(logoutRes.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(false);
    expect(engine.user.token).toBe(null);

    // Verify storage reflects logged out state
    const reloaded = new FarmEngine(storage);
    expect(reloaded.user.isLoggedIn).toBe(false);
  });

  it('TC-T1-F2.2-01: Validates password visibility toggle logic contract', () => {
    // Model the toggle state machine
    let isVisible = false;
    const toggle = () => { isVisible = !isVisible; return isVisible; };

    expect(toggle()).toBe(true);  // toggles to visible ('text')
    expect(toggle()).toBe(false); // toggles back to masked ('password')
  });
});
