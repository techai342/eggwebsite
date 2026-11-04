// tests/tier2-boundary-corner/t2-boundary-password.test.mjs
// Tier 2 - Boundary & Corner Cases: Password Validation, Empty Fields, & Special Characters

import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine } from '../helpers/farm-engine.mjs';

describe('Tier 2: Password Mutation Boundary Cases', () => {
  it('TC-T2-PWD-01: Rejects password update when current password field is empty', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('', 'NewPass123', 'NewPass123');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
  });

  it('TC-T2-PWD-02: Rejects password update when new password field is empty', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', '', '');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
  });

  it('TC-T2-PWD-03: Rejects password update when confirmation field is empty', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'NewPass123', '');
    expect(res.success).toBe(false);
    expect(res.message).toContain('required');
  });

  it('TC-T2-PWD-04: Rejects boundary length of 5 characters (< 6)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'abc12', 'abc12');
    expect(res.success).toBe(false);
    expect(res.message).toContain('at least 6 characters');
  });

  it('TC-T2-PWD-05: Accepts exact boundary length of 6 characters (>= 6)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'abc123', 'abc123');
    expect(res.success).toBe(true);
    expect(res.message).toContain('Password updated successfully');
  });

  it('TC-T2-PWD-06: Accepts passwords with complex special and unicode characters', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const complexPass = 'P@$$w0rd!#%^&*()_+=~`{}[]:;"\'<>,.?/|\\';
    const res = engine.changePassword('password123', complexPass, complexPass);
    expect(res.success).toBe(true);

    engine.logout();
    const loginRes = engine.login('mrsaqib242', complexPass);
    expect(loginRes.success).toBe(true);
  });

  it('TC-T2-PWD-07: Rejects when new password and confirmation differ by single character', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const res = engine.changePassword('password123', 'CorrectPassword123', 'CorrectPassword124');
    expect(res.success).toBe(false);
    expect(res.message).toContain('do not match');
  });
});
