// tests/m4-verification.mjs
// Milestone M4: Interactive Authentication & Security Pages Verification Suite

import fs from 'fs';
import path from 'path';
import { MockLocalStorage } from './helpers/mock-storage.mjs';
import { FarmEngine } from './helpers/farm-engine.mjs';

console.log('===============================================================');
console.log('  MILESTONE M4: AUTHENTICATION & SECURITY PAGES VERIFICATION  ');
console.log('===============================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;

function assert(description, condition, details = '') {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`[PASS] ${description}`);
  } else {
    failedChecks++;
    console.error(`[FAIL] ${description}`);
    if (details) console.error(`       Details: ${details}`);
  }
}

const rootDir = path.resolve('D:/allakermegg');

// -------------------------------------------------------------
// SUITE 1: File Existence & Consolidation
// -------------------------------------------------------------
console.log('--- SUITE 1: Component Files & Stylesheet Existence ---');
const loginPath = path.join(rootDir, 'src/pages/LoginPage.jsx');
const changePassPath = path.join(rootDir, 'src/pages/ChangePasswordPage.jsx');
const rawacssPath = path.join(rootDir, 'src/rawafiles.css');

assert('LoginPage.jsx exists in src/pages/', fs.existsSync(loginPath));
assert('ChangePasswordPage.jsx exists in src/pages/', fs.existsSync(changePassPath));
assert('rawafiles.css exists in src/', fs.existsSync(rawacssPath));

const loginCode = fs.readFileSync(loginPath, 'utf8');
const changePassCode = fs.readFileSync(changePassPath, 'utf8');
const rawacssCode = fs.readFileSync(rawacssPath, 'utf8');

// -------------------------------------------------------------
// SUITE 2: LoginPage.jsx Specification & Template Fidelity
// -------------------------------------------------------------
console.log('\n--- SUITE 2: LoginPage.jsx Fidelity & Structure Audit ---');
assert('Contains downward curved arched canopy header (.full-green-header)', loginCode.includes('full-green-header'));
assert('Includes top nav row with back button and home button', loginCode.includes('top-nav-row') && loginCode.includes('back-circle-btn') && loginCode.includes('home-circle-btn'));
assert('Includes live cloud status badge with AL REHMAN META EGGS FARM CLOUD', loginCode.includes('live-cloud-badge') && loginCode.includes('AL REHMAN META EGGS FARM CLOUD') && loginCode.includes('live-dot'));
assert('Includes Smart Poultry Ecosystem tag', loginCode.includes('Smart Poultry Ecosystem') && loginCode.includes('hero-sub-tag'));
assert('Includes AL REHMAN META EGGS brand and HARVEST APP sub-header', loginCode.includes('AL REHMAN META EGGS') && loginCode.includes('HARVEST APP'));
assert('Includes 3D mascot avatar box with rotating dashed ring (.avatar-dashed-ring)', loginCode.includes('hero-avatar-box') && loginCode.includes('avatar-dashed-ring'));
assert('Renders hen mascot image and egg logo satellite badge', loginCode.includes('henImg') && loginCode.includes('logoImg') && loginCode.includes('egg-mini-tag'));
assert('Renders 3 Benefit chips: Daily Eggs, Fast Cashout, 100% Organic', 
  loginCode.includes('Daily Eggs') && loginCode.includes('Fast Cashout') && loginCode.includes('100% Organic')
);
assert('Includes continuous white form body (.full-form-body)', loginCode.includes('full-form-body'));
assert('Includes Farmer Access headline and fingerprint icon badge', loginCode.includes('Farmer Access') && loginCode.includes('fa-fingerprint'));
assert('Provides Farmer Username input with lead icon (fa-user) and name="username"', 
  loginCode.includes('name="username"') && loginCode.includes('fa-user') && loginCode.includes('Farmer Username')
);
assert('Provides Secret Farm Password input with lead icon (fa-lock) and name="password"', 
  loginCode.includes('name="password"') && loginCode.includes('fa-lock') && loginCode.includes('Secret Farm Password')
);
assert('Includes interactive password eye toggle button (showPassword state & icons)', 
  loginCode.includes('pass-eye-toggle') && loginCode.includes('showPassword') && loginCode.includes('fa-eye')
);
assert('Includes Keep Signed In checkbox with name="remember"', loginCode.includes('name="remember"') && loginCode.includes('Keep Signed In'));
assert('Includes Forgot Pass? link/action', loginCode.includes('Forgot Pass'));
assert('Provides High-Impact submit CTA button (.btn-farm-enter) with Enter Farm Coop', 
  loginCode.includes('btn-farm-enter') && loginCode.includes('Enter Farm Coop') && loginCode.includes('enter-capsule-icon')
);
assert('Supports loading state during form authentication submission', loginCode.includes('Entering Coop...') || loginCode.includes('loading'));
assert('Includes bottom register strip (New to the Farm? Register)', loginCode.includes('bottom-register-strip') && loginCode.includes('New to the Farm?') && loginCode.includes('Register'));
assert('Includes 256-Bit Encrypted Verified Poultry Cloud SSL footer badge', loginCode.includes('card-ssl-status') && loginCode.includes('256-Bit Encrypted'));
assert('Integrates with useFarm() hook and calls login()', loginCode.includes('useFarm') && loginCode.includes('login('));
assert('Navigates to /dashboard on successful login', loginCode.includes('/dashboard'));

// -------------------------------------------------------------
// SUITE 3: ChangePasswordPage.jsx Specification & Template Fidelity
// -------------------------------------------------------------
console.log('\n--- SUITE 3: ChangePasswordPage.jsx Fidelity & Structure Audit ---');
assert('Wrapped inside AppShell with currentRoute="/change-password"', changePassCode.includes('AppShell') && changePassCode.includes('/change-password'));
assert('Displays Security Settings header with 256-Bit SSL badge', changePassCode.includes('Security Settings') && changePassCode.includes('256-Bit SSL'));
assert('Renders main 3D card (.card-farm-3d) with floating lock illustration (.anim-float)', 
  changePassCode.includes('card-farm-3d') && changePassCode.includes('anim-float') && changePassCode.includes('fa-lock')
);
assert('Includes diagonal shine sweep overlay (.shine-sweep)', changePassCode.includes('shine-sweep'));
assert('Displays title Change Your Password and descriptive text', changePassCode.includes('Change Your Password') && changePassCode.includes('Create a strong, unique password'));
assert('Provides Current Password field (id="current_password", fa-lock-open)', 
  changePassCode.includes('current_password') && changePassCode.includes('fa-lock-open')
);
assert('Provides New Password field (id="password", fa-key)', 
  changePassCode.includes('id="password"') && changePassCode.includes('fa-key')
);
assert('Provides Confirm Password field (id="password_confirmation", fa-shield-halved)', 
  changePassCode.includes('password_confirmation') && changePassCode.includes('fa-shield-halved')
);
assert('Includes independent eye visibility toggles for all 3 password fields', 
  changePassCode.includes('showCurrent') && changePassCode.includes('showNew') && changePassCode.includes('showConfirm')
);
assert('Provides Update Password submit button with checkmark icon', 
  changePassCode.includes('Update Password') && changePassCode.includes('fa-circle-check')
);
assert('Includes footer trust info protecting digital assets', changePassCode.includes('Your security and digital assets are fully protected'));
assert('Integrates with useFarm() hook and calls changePassword()', changePassCode.includes('useFarm') && changePassCode.includes('changePassword('));

// -------------------------------------------------------------
// SUITE 4: Functional State Engine Authentication & Security Lifecycle
// -------------------------------------------------------------
console.log('\n--- SUITE 4: State Engine Auth & Security Functional Verification ---');

const storage = new MockLocalStorage();
const engine = new FarmEngine(storage);

// 1. Initial State
assert('Default initial user is mrsaqib242 with Account #1197', engine.user.username === 'mrsaqib242' && engine.user.accountId === '#1197');

// 2. Login with standard credentials
const login1 = engine.login('mrsaqib242', 'password123');
assert('Login succeeds with username mrsaqib242 and password123', login1.success === true && engine.user.isLoggedIn === true);

// 3. Login with admin email
const login2 = engine.login('admin@gmail.com', 'password123');
assert('Login succeeds with admin email admin@gmail.com and password123', login2.success === true && engine.user.isLoggedIn === true);

// 4. Login with invalid password
const loginFail = engine.login('mrsaqib242', 'badpass999');
assert('Login fails cleanly with invalid password', loginFail.success === false && loginFail.message.includes('Invalid credentials'));

// 5. Change Password Validation Checks
const cpMissing = engine.changePassword('', '', '');
assert('Rejects empty password fields', cpMissing.success === false);

const cpWrongCurrent = engine.changePassword('wrong_current', 'newpass123', 'newpass123');
assert('Rejects change password when current password is wrong', cpWrongCurrent.success === false && cpWrongCurrent.message.includes('Current password'));

const cpShort = engine.changePassword('password123', '12345', '12345');
assert('Rejects new password shorter than 6 characters', cpShort.success === false && cpShort.message.includes('6 characters'));

const cpMismatch = engine.changePassword('password123', 'newpass123', 'mismatch456');
assert('Rejects when new password and confirm password do not match', cpMismatch.success === false && cpMismatch.message.includes('not match'));

// 6. Successful Password Rotation
const cpSuccess = engine.changePassword('password123', 'secureFarmPass2026', 'secureFarmPass2026');
assert('Accepts valid password update and returns success', cpSuccess.success === true && cpSuccess.message.includes('Password updated successfully'));

// 7. Verify new credentials work and old credentials fail
const oldPassTry = engine.login('mrsaqib242', 'password123');
assert('Old password rejected after rotation', oldPassTry.success === false);

const newPassTry = engine.login('mrsaqib242', 'secureFarmPass2026');
assert('New password successfully authenticates user', newPassTry.success === true && engine.user.isLoggedIn === true);

// 8. Session Persistence across engine reload
const reloadedEngine = new FarmEngine(storage);
assert('Updated credentials persist across storage reload', reloadedEngine.credentials.password === 'secureFarmPass2026');

// -------------------------------------------------------------
// SUMMARY
// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL AUDIT CHECKS: ${totalChecks}`);
console.log(`PASSED: ${passedChecks}`);
console.log(`FAILED: ${failedChecks}`);
console.log('===============================================================');

if (failedChecks === 0) {
  console.log('\n>>> SUCCESS: ALL MILESTONE M4 CHECKS PASSED WITH 100% ACCURACY <<<\n');
  process.exit(0);
} else {
  console.error(`\n>>> FAILURE: ${failedChecks} AUDIT CHECKS FAILED <<<\n`);
  process.exit(1);
}
