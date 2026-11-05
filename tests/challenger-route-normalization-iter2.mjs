// tests/challenger-route-normalization-iter2.mjs
// Adversarial Empirical Challenge Suite: Route Normalization & Component Dispatch Remediation
// Archetype: EMPIRICAL CHALLENGER (critic, specialist) — Milestone Ref 2 Iteration 2

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describeAsync, itAsync, expect, getTestSummary, resetTestSummary } from './helpers/assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('\n' + '='.repeat(80));
console.log('\x1b[1m\x1b[36m  EMPIRICAL CHALLENGER (ITERATION 2): ADVERSARIAL ROUTE NORMALIZATION HARNESS\x1b[0m');
console.log('\x1b[90m  Validating remediation of deep links, query string stripping, and route dispatching\x1b[0m');
console.log('='.repeat(80) + '\n');

resetTestSummary();

// Read App.jsx source directly
const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
expect(fs.existsSync(appPath)).toBe(true);
const appCode = fs.readFileSync(appPath, 'utf-8');

// Dynamically extract the normalization code from App.jsx to test the REAL implementation
const normMatch = appCode.match(/let cleanRoute = [^;]+;[\s\S]+?const normalizedRoute = [^;]+;/);
if (!normMatch) {
  throw new Error('Failed to extract normalization logic from App.jsx');
}

const normalizeRouteFromApp = new Function('currentRoute', `
  ${normMatch[0]};
  return normalizedRoute;
`);

// Function modeling the exact switch statement in App.jsx
function dispatchAppRoute(currentRoute) {
  const normalizedRoute = normalizeRouteFromApp(currentRoute);
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

// Emulate FarmContext getInitialRoute + App.jsx dispatch
function simulateBrowserLifecycle(hash, pathname) {
  const h = (hash || '').replace(/^#\/?/, '/');
  let currentRoute = '/';
  if (h && h !== '/') {
    currentRoute = h.startsWith('/') ? h : '/' + h;
  } else {
    const p = pathname || '/';
    if (p && p !== '/' && p !== '/index.html') {
      currentRoute = p;
    }
  }
  return {
    rawCurrentRoute: currentRoute,
    normalizedRoute: normalizeRouteFromApp(currentRoute),
    dispatchedPage: dispatchAppRoute(currentRoute)
  };
}

// ======================================================================
// SUITE 1: Deep Link Normalization & Referral Query Parameter Stress
// ======================================================================
await describeAsync('Suite 1: Deep Link Normalization & Referral Query Parameter Stress', async () => {
  const referralDeepLinks = [
    { input: '/#/team?ref=mrsaqib242', desc: 'Standard platform referral URL (#/team?ref=...)' },
    { input: '/team?ref=mrsaqib242', desc: 'Direct pathname with query (/team?ref=...)' },
    { input: '#team?ref=mrsaqib242', desc: 'Hash without leading slash (#team?ref=...)' },
    { input: 'team?ref=mrsaqib242', desc: 'Naked route with query (team?ref=...)' },
    { input: '/team/?ref=mrsaqib242', desc: 'Trailing slash before query (/team/?ref=...)' },
    { input: '#/team/?ref=mrsaqib242', desc: 'Hash trailing slash with query (#/team/?ref=...)' },
    { input: '/team?ref=mrsaqib242&tier=1&utm_source=whatsapp', desc: 'Multi-parameter query string' },
    { input: '/team?ref=', desc: 'Empty parameter value' },
    { input: '/team?', desc: 'Trailing question mark only' },
    { input: '/team??ref=123', desc: 'Double question mark' },
    { input: '/team?ref=mr%20saqib', desc: 'URL encoded parameter value' },
    { input: '/team#simulate', desc: 'In-page anchor fragment (/team#simulate)' },
    { input: '/team#simulate?ref=mrsaqib242', desc: 'In-page anchor before query' },
    { input: '/team?ref=mrsaqib242#simulate', desc: 'Query string before in-page anchor' },
    { input: '/#/team?ref=mrsaqib242#simulate', desc: 'Full SPA hash with query and sub-anchor' },
    { input: '//team?ref=mrsaqib242', desc: 'Double leading slash malformed route (graceful fallback)', expectedRoute: '//team', expectedPage: 'LandingPage' },
    { input: '/team/', desc: 'Clean path with trailing slash' },
    { input: '/team', desc: 'Clean path' },
    { input: '#/team', desc: 'Clean hash path' },
    { input: '#team', desc: 'Naked hash' },
    { input: 'team', desc: 'Naked path string' }
  ];

  for (const tc of referralDeepLinks) {
    const expectedPage = tc.expectedPage || 'TeamPage';
    const expectedRoute = tc.expectedRoute || '/team';
    await itAsync(`Should resolve ${tc.desc} to ${expectedPage}`, async () => {
      const normalized = normalizeRouteFromApp(tc.input);
      const dispatched = dispatchAppRoute(tc.input);
      expect(normalized).toBe(expectedRoute);
      expect(dispatched).toBe(expectedPage);
    });
  }
});

// ======================================================================
// SUITE 2: Standard Application Route Preservation & Aliases
// ======================================================================
await describeAsync('Suite 2: Standard Application Route Preservation & Aliases', async () => {
  const standardRoutes = [
    // LoginPage
    { input: '/login', expectedRoute: '/login', expectedPage: 'LoginPage' },
    { input: '/login/', expectedRoute: '/login', expectedPage: 'LoginPage' },
    { input: '#/login', expectedRoute: '/login', expectedPage: 'LoginPage' },
    { input: '/login?redirect=team', expectedRoute: '/login', expectedPage: 'LoginPage' },
    { input: '#login?redirect=team', expectedRoute: '/login', expectedPage: 'LoginPage' },
    // DashboardPage
    { input: '/dashboard', expectedRoute: '/dashboard', expectedPage: 'DashboardPage' },
    { input: '/dashboard/', expectedRoute: '/dashboard', expectedPage: 'DashboardPage' },
    { input: '#/dashboard', expectedRoute: '/dashboard', expectedPage: 'DashboardPage' },
    { input: '/dashboard?tab=analytics', expectedRoute: '/dashboard', expectedPage: 'DashboardPage' },
    { input: '/dashboard#harvest-nexus', expectedRoute: '/dashboard', expectedPage: 'DashboardPage' },
    // BuyAssetPage
    { input: '/buy-asset', expectedRoute: '/buy-asset', expectedPage: 'BuyAssetPage' },
    { input: '/buy-asset/', expectedRoute: '/buy-asset', expectedPage: 'BuyAssetPage' },
    { input: '#/buy-asset', expectedRoute: '/buy-asset', expectedPage: 'BuyAssetPage' },
    { input: '/buy-asset?gateway=easypisa', expectedRoute: '/buy-asset', expectedPage: 'BuyAssetPage' },
    // SellEggPage
    { input: '/sell-egg', expectedRoute: '/sell-egg', expectedPage: 'SellEggPage' },
    { input: '/sell-egg/', expectedRoute: '/sell-egg', expectedPage: 'SellEggPage' },
    { input: '#/sell-egg', expectedRoute: '/sell-egg', expectedPage: 'SellEggPage' },
    { input: '/sell-egg?merchant=sonica', expectedRoute: '/sell-egg', expectedPage: 'SellEggPage' },
    // WithdrawPage (resolves to SellEggPage as per project contract)
    { input: '/withdraw', expectedRoute: '/withdraw', expectedPage: 'SellEggPage' },
    { input: '/withdraw/', expectedRoute: '/withdraw', expectedPage: 'SellEggPage' },
    { input: '#/withdraw', expectedRoute: '/withdraw', expectedPage: 'SellEggPage' },
    { input: '/withdraw?method=jazzcash', expectedRoute: '/withdraw', expectedPage: 'SellEggPage' },
    // ChangePasswordPage
    { input: '/change-password', expectedRoute: '/change-password', expectedPage: 'ChangePasswordPage' },
    { input: '/change-password/', expectedRoute: '/change-password', expectedPage: 'ChangePasswordPage' },
    { input: '#/change-password', expectedRoute: '/change-password', expectedPage: 'ChangePasswordPage' },
    { input: '/change-password?notice=expired', expectedRoute: '/change-password', expectedPage: 'ChangePasswordPage' },
    // LandingPage (Default / Fallback)
    { input: '/', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '/?', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '/?welcome=true', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '#/', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '#', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '', expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: null, expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: undefined, expectedRoute: '/', expectedPage: 'LandingPage' },
    { input: '/unknown-route', expectedRoute: '/unknown-route', expectedPage: 'LandingPage' },
    { input: '/random/deep/path', expectedRoute: '/random/deep/path', expectedPage: 'LandingPage' }
  ];

  for (const tc of standardRoutes) {
    await itAsync(`Should resolve '${tc.input}' to ${tc.expectedPage}`, async () => {
      const normalized = normalizeRouteFromApp(tc.input);
      const dispatched = dispatchAppRoute(tc.input);
      expect(normalized).toBe(tc.expectedRoute);
      expect(dispatched).toBe(tc.expectedPage);
    });
  }
});

// ======================================================================
// SUITE 3: Full Browser Hash & Path Lifecycle Simulation
// ======================================================================
await describeAsync('Suite 3: Full Browser Hash & Path Lifecycle Simulation', async () => {
  await itAsync('Browser hash #/team?ref=mrsaqib242 routes through FarmContext to TeamPage', async () => {
    const res = simulateBrowserLifecycle('#/team?ref=mrsaqib242', '/');
    expect(res.rawCurrentRoute).toBe('/team?ref=mrsaqib242');
    expect(res.normalizedRoute).toBe('/team');
    expect(res.dispatchedPage).toBe('TeamPage');
  });

  await itAsync('Browser hash #team?ref=mrsaqib242 routes through FarmContext to TeamPage', async () => {
    const res = simulateBrowserLifecycle('#team?ref=mrsaqib242', '/');
    expect(res.rawCurrentRoute).toBe('/team?ref=mrsaqib242');
    expect(res.normalizedRoute).toBe('/team');
    expect(res.dispatchedPage).toBe('TeamPage');
  });

  await itAsync('Browser pathname /team routes through FarmContext to TeamPage', async () => {
    const res = simulateBrowserLifecycle('', '/team');
    expect(res.rawCurrentRoute).toBe('/team');
    expect(res.normalizedRoute).toBe('/team');
    expect(res.dispatchedPage).toBe('TeamPage');
  });

  await itAsync('Browser pathname /team/ routes through FarmContext to TeamPage', async () => {
    const res = simulateBrowserLifecycle('', '/team/');
    expect(res.rawCurrentRoute).toBe('/team/');
    expect(res.normalizedRoute).toBe('/team');
    expect(res.dispatchedPage).toBe('TeamPage');
  });

  await itAsync('Browser index.html default fallback routes to LandingPage', async () => {
    const res = simulateBrowserLifecycle('', '/index.html');
    expect(res.rawCurrentRoute).toBe('/');
    expect(res.normalizedRoute).toBe('/');
    expect(res.dispatchedPage).toBe('LandingPage');
  });
});

// ======================================================================
// SUITE 4: Static Code Inspection & Export Contract Audit
// ======================================================================
await describeAsync('Suite 4: Static Code Inspection & Export Contract Audit', async () => {
  await itAsync('App.jsx must export all 7 primary components and WithdrawPage alias', async () => {
    expect(appCode).toContain('export { LandingPage, LoginPage, DashboardPage, BuyAssetPage, SellEggPage, ChangePasswordPage };');
    expect(appCode).toContain('export { TeamPage };');
    expect(appCode).toContain('export const WithdrawPage = SellEggPage;');
  });

  await itAsync('App.jsx must import TeamPage from ./pages/TeamPage', async () => {
    expect(appCode).toContain("import TeamPage from './pages/TeamPage';");
  });

  await itAsync('All imported page component files must exist and be non-empty', async () => {
    const pageFiles = [
      'LandingPage.jsx',
      'LoginPage.jsx',
      'DashboardPage.jsx',
      'BuyAssetPage.jsx',
      'SellEggPage.jsx',
      'ChangePasswordPage.jsx',
      'TeamPage.jsx'
    ];

    for (const f of pageFiles) {
      const fullPath = path.join(ROOT_DIR, 'src', 'pages', f);
      expect(fs.existsSync(fullPath)).toBe(true);
      const stat = fs.statSync(fullPath);
      expect(stat.size > 100).toBe(true);
    }
  });
});

console.log('\n' + '='.repeat(80));
const summary = getTestSummary();
console.log(`\x1b[1m  ADVERSARIAL ROUTE VERIFICATION SUMMARY: ${summary.passed}/${summary.total} Passed (${summary.failed} Failed)\x1b[0m`);
console.log('='.repeat(80) + '\n');

if (summary.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
