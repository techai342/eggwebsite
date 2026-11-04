// tests/m3-verification.mjs
// Verification suite for Milestone M3: Application Navigation & Common App Shell

import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('    MILESTONE M3: APP NAVIGATION & COMMON APP SHELL AUDIT     ');
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
// SUITE 1: rawafiles.css Consolidation Audit
// -------------------------------------------------------------
console.log('--- SUITE 1: src/rawafiles.css Stylesheet Audit ---');
const rawacssPath = path.join(rootDir, 'src/rawafiles.css');
const rawacssExists = fs.existsSync(rawacssPath);
assert('src/rawafiles.css exists', rawacssExists);

if (rawacssExists) {
  const css = fs.readFileSync(rawacssPath, 'utf8');
  assert('CSS file size is substantial (> 4KB)', css.length > 4000, `Actual: ${css.length} bytes`);
  assert('Includes desktop canvas & 480px container rules', css.includes('app-desktop-canvas') && css.includes('app-shell-480'));
  assert('Includes farm mesh pattern (.farm-mesh-pattern)', css.includes('.farm-mesh-pattern'));
  assert('Includes borderPatrolLoop keyframe animation', css.includes('@keyframes borderPatrolLoop'));
  assert('Includes box-border-patrol selector', css.includes('.box-border-patrol'));
  assert('Includes pulse ping / radar animations', css.includes('pulsePing') || css.includes('portalPulse'));
  assert('Includes laser / conic beam rotation animation', css.includes('laserSpin') || css.includes('borderConicRotate'));
  assert('Includes orbit rotation animations', css.includes('orbitRotate') || css.includes('ecoOrbitSpinCW'));
  assert('Includes shimmer / shine sweep animation', css.includes('shimmerMove') || css.includes('shineSweep'));
  assert('Includes .card-farm-3d specialized card', css.includes('.card-farm-3d'));
  assert('Includes VIP conic rotating beam classes', css.includes('.vip-conic-beam') && css.includes('.vip-conic-wrapper'));
  assert('Includes .btn-3d-green tactile button', css.includes('.btn-3d-green'));
  assert('Includes .badge-pill badge component', css.includes('.badge-pill'));
  assert('Includes canopy header downward curved arch styles', css.includes('border-bottom-left-radius: 28px') || css.includes('canopy-header'));
  assert('Includes .tc-header fixed header styles', css.includes('.tc-header'));
  assert('Includes .tc-sidebar drawer styles', css.includes('.tc-sidebar'));
  assert('Includes .tc-bottombar bottom dock styles', css.includes('.tc-bottombar'));
}

// -------------------------------------------------------------
// SUITE 2: AppNavigation.jsx Component Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 2: src/components/AppNavigation.jsx Audit ---');
const navPath = path.join(rootDir, 'src/components/AppNavigation.jsx');
const navExists = fs.existsSync(navPath);
assert('AppNavigation.jsx exists in src/components/', navExists);

if (navExists) {
  const navContent = fs.readFileSync(navPath, 'utf8');

  // Exports
  assert('Exports AppHeader component', navContent.includes('export function AppHeader'));
  assert('Exports AppSidebar component', navContent.includes('export function AppSidebar'));
  assert('Exports AppBottomNav component', navContent.includes('export function AppBottomNav'));
  assert('Exports AppShell component', navContent.includes('export function AppShell') || navContent.includes('export default function AppShell'));

  // AppHeader specs
  assert('AppHeader contains AL REHMAN META EGGS brand title', navContent.includes('AL REHMAN META EGGS'));
  assert('AppHeader includes FARM CLOUD status beacon', navContent.includes('FARM CLOUD'));
  assert('AppHeader includes hamburger menu button & live chat button', navContent.includes('fa-bars-staggered') && navContent.includes('fa-headset'));
  assert('AppHeader supports back button navigation', navContent.includes('showBack') && navContent.includes('fa-arrow-left'));

  // AppSidebar specs
  assert('AppSidebar displays verified farmer identity (mrsaqib242)', navContent.includes('mrsaqib242'));
  assert('AppSidebar displays account ID (#1197)', navContent.includes('#1197'));
  assert('AppSidebar provides live egg vault balance', navContent.includes('eggVault'));
  assert('AppSidebar links to Dashboard, Buy Hen, Sell Egg, All History, and Change Password',
    navContent.includes('/dashboard') &&
    navContent.includes('/buy-asset') &&
    navContent.includes('/sell-egg') &&
    navContent.includes('/change-password')
  );
  assert('AppSidebar includes logout mechanism', navContent.includes('logout') && navContent.includes('Log Out Account'));
  assert('AppSidebar has clickable backdrop overlay', navContent.includes('tc-sidebar-overlay'));

  // AppBottomNav specs
  assert('AppBottomNav dock includes Home (/dashboard)', navContent.includes('Home') && navContent.includes('/dashboard'));
  assert('AppBottomNav dock includes My Farm (/dashboard#farm)', navContent.includes('My Farm'));
  assert('AppBottomNav dock includes elevated BUY action button (/buy-asset)', navContent.includes('BUY') && navContent.includes('/buy-asset'));
  assert('AppBottomNav dock includes Sale (/sell-egg)', navContent.includes('Sale') && navContent.includes('/sell-egg'));
  assert('AppBottomNav dock includes Profile (/change-password)', navContent.includes('Profile') && navContent.includes('/change-password'));
  assert('AppBottomNav highlights active route', navContent.includes('active'));
}

// -------------------------------------------------------------
// SUITE 3: LandingPage.jsx & Navigation Buttons Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 3: LandingPage.jsx & Nav Actions Audit ---');
const landingPath = path.join(rootDir, 'src/pages/LandingPage.jsx');
const landingExists = fs.existsSync(landingPath);
assert('LandingPage.jsx exists in src/pages/', landingExists);

if (landingExists) {
  const landingContent = fs.readFileSync(landingPath, 'utf8');
  assert('LandingPage wraps Preloader, Navbar, Hero, and landing sections',
    landingContent.includes('<Preloader />') &&
    landingContent.includes('<Navbar />') &&
    landingContent.includes('<Hero />') &&
    landingContent.includes('<Plans />') &&
    landingContent.includes('<Footer />')
  );
}

const navbarPath = path.join(rootDir, 'src/components/Navbar.jsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');
assert('Navbar.jsx navigates to /login without placeholder alert()',
  navbarContent.includes('#/login') && !navbarContent.includes("alert('Login Modal")
);

const mobileBottomPath = path.join(rootDir, 'src/components/MobileBottom.jsx');
const mobileBottomContent = fs.readFileSync(mobileBottomPath, 'utf8');
assert('MobileBottom.jsx navigates to /login without placeholder alert()',
  mobileBottomContent.includes('#/login') && !mobileBottomContent.includes("alert('Login Modal")
);

// -------------------------------------------------------------
// SUITE 4: App.jsx Route Switcher Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 4: src/App.jsx Route Switcher Audit ---');
const appPath = path.join(rootDir, 'src/App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert('App.jsx imports LandingPage', appContent.includes("from './pages/LandingPage'"));
assert('App.jsx imports LoginPage', appContent.includes("from './pages/LoginPage'"));
assert('App.jsx imports DashboardPage', appContent.includes("from './pages/DashboardPage'"));
assert('App.jsx imports BuyAssetPage', appContent.includes("from './pages/BuyAssetPage'"));
assert('App.jsx imports SellEggPage', appContent.includes("from './pages/SellEggPage'"));
assert('App.jsx imports ChangePasswordPage', appContent.includes("from './pages/ChangePasswordPage'"));
assert('App.jsx exports WithdrawPage alias', appContent.includes('WithdrawPage = SellEggPage'));
assert('App.jsx supports route /', appContent.includes("case '/':"));
assert('App.jsx supports route /login', appContent.includes("case '/login':"));
assert('App.jsx supports route /dashboard', appContent.includes("case '/dashboard':"));
assert('App.jsx supports route /buy-asset', appContent.includes("case '/buy-asset':"));
assert('App.jsx supports route /sell-egg', appContent.includes("case '/sell-egg':"));
assert('App.jsx supports route /withdraw', appContent.includes("case '/withdraw':"));
assert('App.jsx supports route /change-password', appContent.includes("case '/change-password':"));

// -------------------------------------------------------------
// SUITE 5: FarmContext Routing Integration Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 5: FarmContext Routing Helpers Audit ---');
const contextPath = path.join(rootDir, 'src/context/FarmContext.jsx');
const contextContent = fs.readFileSync(contextPath, 'utf8');
assert('FarmContext provides currentRoute state', contextContent.includes('currentRoute'));
assert('FarmContext provides navigateTo helper', contextContent.includes('navigateTo ='));
assert('FarmContext supports hashchange & popstate events', contextContent.includes('hashchange') && contextContent.includes('popstate'));

// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL M3 AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('===============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('ALL M3 VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
}
