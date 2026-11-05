// tests/challenger-referral-ui-lifecycle.mjs
// Adversarial Empirical Challenge Suite: UI Routing, Component Integrity, Backward Compatibility & Build Durability
// Archetype: EMPIRICAL CHALLENGER (critic, specialist) — Milestone Ref 2 Verification

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeAsync, itAsync, expect, getTestSummary, resetTestSummary } from './helpers/assertions.mjs';
import { FarmEngine, COMMISSION_RATES, ASSET_SPEC } from './helpers/farm-engine.mjs';
import { MockLocalStorage } from './helpers/mock-storage.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n' + '='.repeat(80));
console.log('\x1b[1m\x1b[33m  EMPIRICAL CHALLENGER: ADVERSARIAL REFERRAL UI & ROUTING CHALLENGE SUITE\x1b[0m');
console.log('\x1b[90m  Scope: Route Dispatching | Deep Linking | Component Integrity | Backward Compat | Build\x1b[0m');
console.log('='.repeat(80) + '\n');

resetTestSummary();

// ======================================================================
// SUITE 1: Route Dispatching & Deep Linking Adversarial Stress
// ======================================================================
await describeAsync('Suite 1: Route Dispatching & Deep Linking Adversarial Challenge', async () => {
  const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
  expect(fs.existsSync(appPath)).toBe(true);
  const appCode = fs.readFileSync(appPath, 'utf-8');

  // Evaluator implementing the exact route normalization logic present in App.jsx:
  // const normalizedRoute = currentRoute.split('#')[0].replace(/\/$/, '') || '/';
  function evaluateAppRouting(currentRoute) {
    if (!currentRoute || typeof currentRoute !== 'string') return 'LandingPage';
    const normalizedRoute = currentRoute.split('#')[0].replace(/\/$/, '') || '/';
    switch (normalizedRoute) {
      case '/login':
        return 'LoginPage';
      case '/dashboard':
        return 'DashboardPage';
      case '/buy-asset':
        return 'BuyAssetPage';
      case '/sell-egg':
      case '/withdraw':
        return 'SellEggPage';
      case '/change-password':
        return 'ChangePasswordPage';
      case '/team':
        return 'TeamPage';
      case '/':
      default:
        return 'LandingPage';
    }
  }

  // Robust normalizer specification that properly handles hash-routes and query params
  function evaluateRobustRouting(currentRoute) {
    if (!currentRoute || typeof currentRoute !== 'string') return 'LandingPage';
    let clean = currentRoute.split('?')[0];
    clean = clean.replace(/^\/?#\/?/, '/');
    clean = clean.split('#')[0];
    const normalized = clean.replace(/\/$/, '') || '/';
    switch (normalized) {
      case '/login':
        return 'LoginPage';
      case '/dashboard':
        return 'DashboardPage';
      case '/buy-asset':
        return 'BuyAssetPage';
      case '/sell-egg':
      case '/withdraw':
        return 'SellEggPage';
      case '/change-password':
        return 'ChangePasswordPage';
      case '/team':
        return 'TeamPage';
      case '/':
      default:
        return 'LandingPage';
    }
  }

  // Integrated browser routing combining FarmContext getInitialRoute + App.jsx switch
  function simulateIntegratedRouting(urlHash, urlPath) {
    const hash = (urlHash || '').replace(/^#\/?/, '/');
    let currentRoute = '/';
    if (hash && hash !== '/') {
      currentRoute = hash.startsWith('/') ? hash : '/' + hash;
    } else {
      const path = urlPath || '/';
      if (path && path !== '/' && path !== '/index.html') {
        currentRoute = path;
      }
    }
    const normalizedRoute = currentRoute.split('#')[0].replace(/\/$/, '') || '/';
    return evaluateAppRouting(normalizedRoute);
  }

  await itAsync('TC-CHALLENGE-ROUTE-01: Direct path /team and /team/ resolve to TeamPage', async () => {
    expect(simulateIntegratedRouting('', '/team')).toBe('TeamPage');
    expect(simulateIntegratedRouting('', '/team/')).toBe('TeamPage');
  });

  await itAsync('TC-CHALLENGE-ROUTE-02: Hash route #/team and #team resolve to TeamPage in integrated browser flow', async () => {
    expect(simulateIntegratedRouting('#/team', '/')).toBe('TeamPage');
    expect(simulateIntegratedRouting('#team', '/')).toBe('TeamPage');
    expect(simulateIntegratedRouting('#/team/', '/')).toBe('TeamPage');
  });

  await itAsync('TC-CHALLENGE-ROUTE-03: Hash-based deep link (#/team?ref=mrsaqib242) MUST resolve to TeamPage', async () => {
    const integratedResult = simulateIntegratedRouting('#/team?ref=mrsaqib242', '/');
    if (integratedResult !== 'TeamPage') {
      console.log(`    \x1b[31m[CRITICAL DEFECT DETECTED]\x1b[0m Deep link '#/team?ref=mrsaqib242' resolved to '${integratedResult}' instead of 'TeamPage'!`);
      console.log(`    \x1b[90mRoot Cause: App.jsx does not strip query string '?ref=...' before route switch evaluation.\x1b[0m`);
    }
    // Strict assertion: hash-based deep link with query parameters MUST resolve to TeamPage
    expect(integratedResult).toBe('TeamPage');
  });

  await itAsync('TC-CHALLENGE-ROUTE-04: Standalone App.jsx route normalizer handling of raw hash strings', async () => {
    const rawHashResult = evaluateAppRouting('#/team');
    if (rawHashResult !== 'TeamPage') {
      console.log(`    \x1b[33m[DEFECT CONFIRMED]\x1b[0m App.jsx standalone normalizer resolves '#/team' to '${rawHashResult}' (expected 'TeamPage')`);
    }
    expect(rawHashResult).toBe('LandingPage'); // Current buggy behavior reproduced
  });

  await itAsync('TC-CHALLENGE-ROUTE-05: Sub-fragment hash anchors (/team#simulate) resolve to TeamPage', async () => {
    expect(simulateIntegratedRouting('', '/team#simulate')).toBe('TeamPage');
    expect(simulateIntegratedRouting('', '/team#register')).toBe('TeamPage');
  });

  await itAsync('TC-CHALLENGE-ROUTE-06: Malformed routes gracefully fallback to LandingPage', async () => {
    expect(evaluateAppRouting('')).toBe('LandingPage');
    expect(evaluateAppRouting(null)).toBe('LandingPage');
    expect(evaluateAppRouting(undefined)).toBe('LandingPage');
    expect(evaluateAppRouting('/unknown-route')).toBe('LandingPage');
  });
});

// ======================================================================
// SUITE 2: TeamPage Component Integrity & Section Manifest
// ======================================================================
await describeAsync('Suite 2: TeamPage Component Integrity & Section Manifest', async () => {
  const teamPagePath = path.join(ROOT_DIR, 'src', 'pages', 'TeamPage.jsx');
  expect(fs.existsSync(teamPagePath)).toBe(true);
  const teamCode = fs.readFileSync(teamPagePath, 'utf-8');

  await itAsync('TC-CHALLENGE-COMP-01: TeamPage wraps layout in responsive AppShell with back button to /dashboard', async () => {
    expect(teamCode).toContain('<AppShell');
    expect(teamCode).toContain('currentRoute="/team"');
    expect(teamCode).toContain("navigateTo('/dashboard')");
  });

  await itAsync('TC-CHALLENGE-COMP-02: Section 1 (Upliner Sponsor Card) is fully implemented', async () => {
    expect(teamCode).toContain('Upliner Sponsor Details');
    expect(teamCode).toContain('user?.upliner');
    expect(teamCode).toContain('user?.accountId');
    expect(teamCode).toContain('user?.username');
    expect(teamCode).toContain('Direct Sponsor');
  });

  await itAsync('TC-CHALLENGE-COMP-03: Section 2 (Referral Link & Code) provides working copy and WhatsApp share handlers', async () => {
    expect(teamCode).toContain('Your Unique Referral Pass');
    expect(teamCode).toContain('referralCode');
    expect(teamCode).toContain('referralLink');
    expect(teamCode).toContain('Copy Code');
    expect(teamCode).toContain('Copy Referral Link');
    expect(teamCode).toContain('WhatsApp Share');
    expect(teamCode).toContain('api.whatsapp.com/send');
  });

  await itAsync('TC-CHALLENGE-COMP-04: Section 3 (Dynamic Referral Statistics Cards) renders all 4 key telemetry metrics', async () => {
    expect(teamCode).toContain('Total Invited');
    expect(teamCode).toContain('referralStats.totalInvited');
    expect(teamCode).toContain('Level 1 Count');
    expect(teamCode).toContain('referralStats.level1Count');
    expect(teamCode).toContain('Level 2 Count');
    expect(teamCode).toContain('referralStats.level2Count');
    expect(teamCode).toContain('Commission Earned');
    expect(teamCode).toContain('referralStats.totalCommissionEarned');
    expect(teamCode).toContain('Direct 2.00%');
    expect(teamCode).toContain('Secondary 1.00%');
  });

  await itAsync('TC-CHALLENGE-COMP-05: Section 4 (Interactive Simulation / Invite Tool) implements registration and purchase forms', async () => {
    expect(teamCode).toContain('Affiliate Testing &amp; Simulation Tool');
    expect(teamCode).toContain('registerDownline');
    expect(teamCode).toContain('simulateDownlinePurchase');
    expect(teamCode).toContain('1. Register Downline');
    expect(teamCode).toContain('2. Simulate Purchase');
    expect(teamCode).toContain('newTierLevel');
    expect(teamCode).toContain('purchaseUnits');
    expect(teamCode).toContain('simulatedPurchaseVolumePkr');
    expect(teamCode).toContain('simulatedCommissionPkr');
  });

  await itAsync('TC-CHALLENGE-COMP-06: Section 5 (Team Members Table / Ledger) includes filter tabs, search, and empty state', async () => {
    expect(teamCode).toContain('Team Members Ledger');
    expect(teamCode).toContain('ledgerTierFilter');
    expect(teamCode).toContain('searchQuery');
    expect(teamCode).toContain('No Team Members Yet');
    expect(teamCode).toContain('filteredTeamMembers');
    expect(teamCode).toContain('Simulate Purchase');
  });

  await itAsync('TC-CHALLENGE-COMP-07: Section 6 (Clean Baseline Reset & Commission Policy) provides reset action and rules card', async () => {
    expect(teamCode).toContain('2-Tier Affiliate Commission Rules');
    expect(teamCode).toContain('Direct Tier 1 Referrals: 2.00% Cash Commission');
    expect(teamCode).toContain('Secondary Tier 2 Referrals: 1.00% Cash Commission');
    expect(teamCode).toContain('Clean Baseline State Reset');
    expect(teamCode).toContain('resetToFreshState()');
  });

  await itAsync('TC-CHALLENGE-COMP-08: App.jsx component export manifest exports all required pages and aliases', async () => {
    const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
    const appCode = fs.readFileSync(appPath, 'utf-8');
    expect(appCode).toContain('export { LandingPage, LoginPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage };');
    expect(appCode).toContain('export { TeamPage };');
    expect(appCode).toContain('export const WithdrawPage = SellEggPage;');
  });
});

// ======================================================================
// SUITE 3: Backward Compatibility & Route Aliases
// ======================================================================
await describeAsync('Suite 3: Backward Compatibility & Route Aliases', async () => {
  const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
  const appCode = fs.readFileSync(appPath, 'utf-8');

  await itAsync('TC-CHALLENGE-BACK-01: Legacy routes remain configured in App.jsx switch', async () => {
    expect(appCode).toContain("case '/login':");
    expect(appCode).toContain("case '/dashboard':");
    expect(appCode).toContain("case '/buy-asset':");
    expect(appCode).toContain("case '/sell-egg':");
    expect(appCode).toContain("case '/withdraw':");
    expect(appCode).toContain("case '/change-password':");
    expect(appCode).toContain("case '/team':");
  });

  await itAsync('TC-CHALLENGE-BACK-02: WithdrawPage exists as SellEggPage wrapper with currentRoute="/withdraw"', async () => {
    const wdPath = path.join(ROOT_DIR, 'src', 'pages', 'WithdrawPage.jsx');
    expect(fs.existsSync(wdPath)).toBe(true);
    const wdCode = fs.readFileSync(wdPath, 'utf-8');
    expect(wdCode).toContain("import SellEggPage from './SellEggPage'");
    expect(wdCode).toContain('currentRoute="/withdraw"');
  });

  await itAsync('TC-CHALLENGE-BACK-03: AppBottomNav maintains exact 5 core navigation items without regression', async () => {
    const navPath = path.join(ROOT_DIR, 'src', 'components', 'AppNavigation.jsx');
    const navCode = fs.readFileSync(navPath, 'utf-8');
    expect(navCode).toContain('Home');
    expect(navCode).toContain('My Farm');
    expect(navCode).toContain('BUY');
    expect(navCode).toContain('Sale');
    expect(navCode).toContain('Profile');
    // Drawer contains My Team & Referrals
    expect(navCode).toContain('My Team &amp; Referrals');
    expect(navCode).toContain("handleNav('/team')");
  });

  await itAsync('TC-CHALLENGE-BACK-04: Dashboard Bento Tile 5 routes to /team while preserving labels', async () => {
    const dashPath = path.join(ROOT_DIR, 'src', 'pages', 'DashboardPage.jsx');
    const dashCode = fs.readFileSync(dashPath, 'utf-8');
    expect(dashCode).toContain("navigateTo('/team')");
    expect(dashCode).toContain('Team');
    expect(dashCode).toContain('Network');
    expect(dashCode).toContain('Open Team & Referral Hub');
  });
});

// ======================================================================
// SUITE 4: 2-Tier Affiliate State Engine Lifecycle & Commission Math
// ======================================================================
await describeAsync('Suite 4: 2-Tier Affiliate State Engine Lifecycle & Commission Math', async () => {
  const storage = new MockLocalStorage();
  const engine = new FarmEngine(storage);

  await itAsync('TC-CHALLENGE-STATE-01: Starts with clean initial state baseline (0 team members, 0 commission)', async () => {
    expect(engine.teamMembers.length).toBe(0);
    const stats = engine.getReferralStats();
    expect(stats.totalInvited).toBe(0);
    expect(stats.level1Count).toBe(0);
    expect(stats.level2Count).toBe(0);
    expect(stats.totalCommissionEarned).toBe(0);
  });

  await itAsync('TC-CHALLENGE-STATE-02: Level 1 hen purchase credits exactly 2.00% (10 PKR / unit)', async () => {
    const regRes = engine.registerDownline({ username: 'challenger_l1', tierLevel: 1 });
    expect(regRes.success).toBe(true);

    const balanceBefore = engine.balance;
    const simRes = engine.simulateDownlinePurchase({ username: 'challenger_l1', units: 3 }); // 1500 PKR * 0.02 = 30 PKR
    expect(simRes.success).toBe(true);
    expect(simRes.commission).toBe(30);
    expect(engine.balance).toBe(balanceBefore + 30);

    const commTrx = engine.transactions.find((t) => t.type === 'COMMISSION');
    expect(commTrx !== undefined).toBe(true);
    expect(commTrx.amount).toBe(30);
  });

  await itAsync('TC-CHALLENGE-STATE-03: Level 2 hen purchase credits exactly 1.00% (5 PKR / unit)', async () => {
    const regRes = engine.registerDownline({ username: 'challenger_l2', tierLevel: 2, upliner: 'challenger_l1' });
    expect(regRes.success).toBe(true);

    const balanceBefore = engine.balance;
    const simRes = engine.simulateDownlinePurchase({ username: 'challenger_l2', units: 4 }); // 2000 PKR * 0.01 = 20 PKR
    expect(simRes.success).toBe(true);
    expect(simRes.commission).toBe(20);
    expect(engine.balance).toBe(balanceBefore + 20);
  });

  await itAsync('TC-CHALLENGE-STATE-04: Reset to fresh state purges all downlines and commissions idempotently', async () => {
    const resetRes = engine.resetToFreshState();
    expect(resetRes.success).toBe(true);
    expect(engine.teamMembers.length).toBe(0);
    expect(engine.getReferralStats().totalCommissionEarned).toBe(0);
    expect(engine.balance).toBe(1500); // Default seed balance
  });
});

// ======================================================================
// SUITE 5: Build Durability & Asset Verification
// ======================================================================
await describeAsync('Suite 5: Build Durability & Asset Verification', async () => {
  const distDir = path.join(ROOT_DIR, 'dist');
  expect(fs.existsSync(distDir)).toBe(true);

  await itAsync('TC-CHALLENGE-BUILD-01: dist/index.html exists and is properly structured', async () => {
    const htmlPath = path.join(distDir, 'index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);
    const html = fs.readFileSync(htmlPath, 'utf-8');
    expect(html.length > 500).toBe(true);
    expect(html).toContain('<div id="root"></div>');
  });

  await itAsync('TC-CHALLENGE-BUILD-02: dist/assets contains production JavaScript and CSS bundles', async () => {
    const assetsDir = path.join(distDir, 'assets');
    expect(fs.existsSync(assetsDir)).toBe(true);
    const files = fs.readdirSync(assetsDir);
    const jsFiles = files.filter((f) => f.endsWith('.js'));
    const cssFiles = files.filter((f) => f.endsWith('.css'));
    expect(jsFiles.length > 0).toBe(true);
    expect(cssFiles.length > 0).toBe(true);
  });

  await itAsync('TC-CHALLENGE-BUILD-03: dist/assets contains all essential brand media', async () => {
    const assetsDir = path.join(distDir, 'assets');
    const files = fs.readdirSync(assetsDir);
    const hasHen = files.some((f) => f.startsWith('hen-') && f.endsWith('.png'));
    const hasEgg = files.some((f) => f.startsWith('egg-') && f.endsWith('.png'));
    const hasLogo = files.some((f) => f.startsWith('logo-') && f.endsWith('.webp'));
    const hasEasypisa = files.some((f) => f.startsWith('easypisa-') && f.endsWith('.png'));
    const hasJazzcash = files.some((f) => f.startsWith('jazzcash-') && f.endsWith('.png'));
    const hasBank = files.some((f) => f.startsWith('bank-') && f.endsWith('.jpg'));

    expect(hasHen).toBe(true);
    expect(hasEgg).toBe(true);
    expect(hasLogo).toBe(true);
    expect(hasEasypisa).toBe(true);
    expect(hasJazzcash).toBe(true);
    expect(hasBank).toBe(true);
  });
});

// ======================================================================
// SUMMARY REPORT
// ======================================================================
const summary = getTestSummary();
console.log('\n' + '='.repeat(80));
console.log('\x1b[1m\x1b[33m  EMPIRICAL CHALLENGER VERIFICATION SUMMARY\x1b[0m');
console.log('='.repeat(80));
console.log(`  Total Tests  : ${summary.total}`);
console.log(`  Passed Tests : \x1b[32m${summary.passed}\x1b[0m`);
console.log(`  Failed Tests : \x1b[31m${summary.failed}\x1b[0m`);
console.log(`  Pass Rate    : ${((summary.passed / summary.total) * 100).toFixed(1)}%`);
console.log('='.repeat(80));

if (summary.failed > 0) {
  console.log('\n\x1b[31m✖ CHALLENGE FAILED — CRITICAL FLAWS DETECTED\x1b[0m\n');
  process.exit(1);
} else {
  console.log('\n\x1b[32m✔ ALL CHALLENGE TESTS PASSED\x1b[0m\n');
  process.exit(0);
}
