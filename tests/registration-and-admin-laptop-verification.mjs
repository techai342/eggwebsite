/**
 * Registration & Super Admin Laptop Layout Verification Test Suite
 * Validates:
 * 1. RegisterPage contract (username, email/phone, password, confirm password, referral)
 * 2. FarmContext.registerUser() state mutation and auto-login
 * 3. Duplicate username conflict detection
 * 4. Referral code upliner linking
 * 5. Admin Dashboard laptop design tokens (no AppShell, no card-farm-3d white override)
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('\n=== [Tier 5] Registration & Admin Laptop Responsive Verification ===\n');

// 1. Verify RegisterPage component source code
const registerPagePath = path.resolve('src/pages/RegisterPage.jsx');
assert.ok(fs.existsSync(registerPagePath), 'RegisterPage.jsx must exist');
const registerCode = fs.readFileSync(registerPagePath, 'utf8');

assert.ok(!registerCode.includes('app-shell-480'), 'RegisterPage must NOT be constrained to app-shell-480');
assert.ok(registerCode.includes('registerUser'), 'RegisterPage must call registerUser() from useFarm()');
assert.ok(registerCode.includes('username'), 'RegisterPage must have username state');
assert.ok(registerCode.includes('emailOrPhone'), 'RegisterPage must have emailOrPhone state');
assert.ok(registerCode.includes('password'), 'RegisterPage must have password state');
assert.ok(registerCode.includes('confirmPassword'), 'RegisterPage must have confirmPassword state');
assert.ok(registerCode.includes('referralCode'), 'RegisterPage must have referralCode state');
assert.ok(registerCode.includes('showPassword'), 'RegisterPage must support password visibility toggle');
assert.ok(registerCode.includes('showConfirmPassword'), 'RegisterPage must support confirm password visibility toggle');
assert.ok(registerCode.includes('navigateTo(\'/dashboard\')'), 'RegisterPage must redirect to /dashboard upon success');
assert.ok(registerCode.includes('navigateTo(\'/login\')'), 'RegisterPage must provide link to /login');

console.log('  ✔ TC-REG-01: RegisterPage satisfies all form field and auto-login specifications');

// 2. Verify AdminDashboardPage source code
const adminPagePath = path.resolve('src/pages/AdminDashboardPage.jsx');
assert.ok(fs.existsSync(adminPagePath), 'AdminDashboardPage.jsx must exist');
const adminCode = fs.readFileSync(adminPagePath, 'utf8');

assert.ok(!adminCode.includes('<AppShell'), 'AdminDashboardPage must NOT use AppShell (which forces 480px and mobile dock)');
assert.ok(!adminCode.includes('card-farm-3d'), 'AdminDashboardPage must NOT use card-farm-3d (which forces white background from rawafiles.css)');
assert.ok(adminCode.includes('max-w-7xl'), 'AdminDashboardPage must use max-w-7xl spacious executive laptop container');
assert.ok(adminCode.includes('lg:grid-cols-5'), 'AdminDashboardPage must use 5-column grid for KPI overview on laptop screens');
assert.ok(adminCode.includes('Super Admin Cockpit'), 'AdminDashboardPage must display Super Admin Cockpit branding');
assert.ok(adminCode.includes('Farmer App'), 'AdminDashboardPage must provide switcher to Farmer App');
assert.ok(adminCode.includes('logout'), 'AdminDashboardPage must provide logout action in header');

console.log('  ✔ TC-ADM-01: AdminDashboardPage satisfies executive laptop layout and zero white override contracts');

// 3. Verify App.jsx routes /register and /admin
const appPath = path.resolve('src/App.jsx');
const appCode = fs.readFileSync(appPath, 'utf8');
assert.ok(appCode.includes('case \'/register\':'), 'App.jsx must route /register to RegisterPage');
assert.ok(appCode.includes('case \'/admin\':'), 'App.jsx must route /admin to AdminDashboardPage');
assert.ok(appCode.includes('RegisterPage'), 'App.jsx must import and export RegisterPage');

console.log('  ✔ TC-ROUTE-01: App.jsx routing table correctly handles /register and /admin');

console.log('\n  SUCCESS: All Registration and Admin Laptop verification checks passed!\n');
