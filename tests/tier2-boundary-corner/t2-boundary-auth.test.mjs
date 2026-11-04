// tests/tier2-boundary-corner/t2-boundary-auth.test.mjs
// Tier 2 - Boundary & Corner Cases: Authentication Inputs, Edge Injections, & Storage Corruption

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 2: Authentication Input & Session Corruption Boundaries', () => {
  it('TC-T2-AUTH-01: Rejects login with empty username string', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('', 'password123');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
    expect(engine.user.isLoggedIn).toBe(false);
  });

  it('TC-T2-AUTH-02: Rejects login with empty password string', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.login('mrsaqib242', '');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
    expect(engine.user.isLoggedIn).toBe(false);
  });

  it('TC-T2-AUTH-03: Rejects SQL / injection-like input strings cleanly without system panic', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const injectionPayloads = [
      "' OR '1'='1",
      "admin' --",
      "<script>alert(1)</script>",
      "{{7*7}}"
    ];

    for (const payload of injectionPayloads) {
      const res = engine.login(payload, payload);
      expect(res.success).toBe(false);
      expect(engine.user.isLoggedIn).toBe(false);
    }
  });

  it('TC-T2-AUTH-04: Gracefully handles corrupt / non-JSON data in localStorage without throwing', () => {
    const storage = new MockLocalStorage({
      alrehman_meta_eggs_state: 'INVALID_CORRUPT_JSON_DATA_---{[[}}'
    });

    // Initializing engine should recover gracefully with default initial state
    let engine;
    expect(() => {
      engine = new FarmEngine(storage);
    }).not = undefined; // won't throw

    engine = new FarmEngine(storage);
    expect(engine.user.isLoggedIn).toBe(false);
    expect(engine.eggVault).toBe(0);
    expect(engine.balance).toBe(0);
  });

  it('TC-T2-AUTH-05: Handles idempotent logout when user is already logged out', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    expect(engine.user.isLoggedIn).toBe(false);
    const res = engine.logout();
    expect(res.success).toBe(true);
    expect(engine.user.isLoggedIn).toBe(false);
    expect(engine.user.token).toBe(null);
  });
});
