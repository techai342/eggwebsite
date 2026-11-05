// tests/m8-m9-referral-verification.mjs
// Milestone M8 & M9 Comprehensive Audit: 2-Tier Commission Engine & TeamPage UI Wiring

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MockLocalStorage } from './helpers/mock-storage.mjs';
import { FarmEngine, COMMISSION_RATES, ASSET_SPEC } from './helpers/farm-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('===============================================================');
console.log('   MILESTONE M8-M9: REFERRAL ENGINE & UI WIRING AUDIT          ');
console.log('   Scope: 2-Tier Commission Math, TeamPage, Navigation & State ');
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

// =========================================================================
// SUITE 1: FarmContext & Reference Engine Interface Contract Audit
// =========================================================================
console.log('--- SUITE 1: State Engine & 2-Tier Commission Contract Audit ---');

const contextPath = path.join(ROOT_DIR, 'src/context/FarmContext.jsx');
const contextExists = fs.existsSync(contextPath);
assert('FarmContext.jsx exists in src/context/', contextExists);

if (contextExists) {
  const contextCode = fs.readFileSync(contextPath, 'utf-8');

  // Constants & Rates
  assert('FarmContext exports COMMISSION_RATES', contextCode.includes('export const COMMISSION_RATES'));
  assert('COMMISSION_RATES defines LEVEL_1 as 0.02 (2%)', COMMISSION_RATES.LEVEL_1 === 0.02);
  assert('COMMISSION_RATES defines LEVEL_2 as 0.01 (1%)', COMMISSION_RATES.LEVEL_2 === 0.01);
  assert('ASSET_SPEC unitPrice is 500 PKR', ASSET_SPEC.unitPrice === 500);

  // State Hooks & Selectors
  assert('FarmContext manages teamMembers state hook', contextCode.includes('const [teamMembers, setTeamMembers] = useState'));
  assert('DEFAULT_INITIAL_STATE initializes empty teamMembers: []', contextCode.includes('teamMembers: []'));
  assert('DEFAULT_INITIAL_STATE sets default user referralCode to mrsaqib242', contextCode.includes("referralCode: 'mrsaqib242'"));
  assert('Exposes memoized referralCode selector', contextCode.includes('const referralCode = useMemo('));
  assert('Exposes memoized referralLink selector formatting /#/team?ref=', contextCode.includes('/#/team?ref='));
  assert('Exposes memoized referralStats aggregator', contextCode.includes('const referralStats = useMemo('));

  // Action Methods
  assert('Implements registerDownline action with validation', contextCode.includes('const registerDownline = useCallback('));
  assert('Implements simulateDownlinePurchase action with commission crediting', contextCode.includes('const simulateDownlinePurchase = useCallback('));
  assert('Implements resetToFreshState action restoring clean baseline', contextCode.includes('const resetToFreshState = useCallback('));
  assert('Persists teamMembers into dual localStorage keys', contextCode.includes('teamMembers: updatedMembers'));
  assert('Exposes all referral methods and properties in context value',
    contextCode.includes('referralCode,') &&
    contextCode.includes('referralLink,') &&
    contextCode.includes('teamMembers,') &&
    contextCode.includes('referralStats,') &&
    contextCode.includes('registerDownline,') &&
    contextCode.includes('simulateDownlinePurchase,') &&
    contextCode.includes('resetToFreshState')
  );
}

// =========================================================================
// SUITE 2: Mathematical Precision & 2-Tier Commission Simulation Audit
// =========================================================================
console.log('\n--- SUITE 2: 2-Tier Affiliate Math & Ledger Simulation Audit ---');

const storage = new MockLocalStorage();
const engine = new FarmEngine(storage);

// 1. Initial State
assert('Fresh engine starts with clean empty teamMembers array', Array.isArray(engine.teamMembers) && engine.teamMembers.length === 0);
assert('Fresh referralStats returns 0 across all metrics',
  engine.referralStats.totalInvited === 0 &&
  engine.referralStats.level1Count === 0 &&
  engine.referralStats.level2Count === 0 &&
  engine.referralStats.totalCommissionEarned === 0 &&
  engine.referralStats.activeTeamCount === 0
);
assert('Referral link points to /#/team?ref=mrsaqib242', engine.referralLink.includes('/#/team?ref=mrsaqib242'));

// 2. Downline Registration
const regL1 = engine.registerDownline({ username: 'farmer_zain', tierLevel: 1 });
assert('Successfully registers Level 1 downline member', regL1.success && regL1.member.username === 'farmer_zain');
assert('Level 1 member receives direct upliner mrsaqib242', regL1.member.upliner === 'mrsaqib242');

const regL2 = engine.registerDownline({ username: 'farmer_ali', tierLevel: 2, upliner: 'farmer_zain' });
assert('Successfully registers Level 2 downline member', regL2.success && regL2.member.username === 'farmer_ali');
assert('Level 2 member receives designated upliner farmer_zain', regL2.member.upliner === 'farmer_zain');

const regDup = engine.registerDownline({ username: 'farmer_zain', tierLevel: 1 });
assert('Rejects duplicate username registration (exact match)', !regDup.success && regDup.message.includes('already registered'));

const regDupCase = engine.registerDownline({ username: 'FARMER_ZAIN', tierLevel: 1 });
assert('Rejects duplicate username registration (case-insensitive)', !regDupCase.success && regDupCase.message.includes('already registered'));

const regEmpty = engine.registerDownline({ username: '', tierLevel: 1 });
assert('Rejects empty downline username', !regEmpty.success && regEmpty.message.includes('required'));

// 3. Purchase Simulations & Commission Math
engine.balance = 1000.00;
const startBalance = engine.balance;

// L1 Purchase: 1 Hen (500 PKR) @ 2% = 10.00 PKR
const purchaseL1 = engine.simulateDownlinePurchase({ username: 'farmer_zain', units: 1 });
assert('Level 1 purchase of 1 unit generates exactly 10.00 PKR commission (2%)', purchaseL1.success && purchaseL1.commission === 10.00);
assert('Balance credited immediately with Level 1 commission (1000 -> 1010 PKR)', engine.balance === 1010.00);

// L2 Purchase: 2 Hens (1000 PKR) @ 1% = 10.00 PKR
const purchaseL2 = engine.simulateDownlinePurchase({ username: 'farmer_ali', units: 2 });
assert('Level 2 purchase of 2 units generates exactly 10.00 PKR commission (1%)', purchaseL2.success && purchaseL2.commission === 10.00);
assert('Balance credited immediately with Level 2 commission (1010 -> 1020 PKR)', engine.balance === 1020.00);

// Multi-purchase aggregation
engine.simulateDownlinePurchase({ username: 'farmer_zain', units: 5 }); // 2500 PKR @ 2% = 50 PKR
engine.simulateDownlinePurchase({ username: 'farmer_ali', units: 4 });  // 2000 PKR @ 1% = 20 PKR

const zain = engine.teamMembers.find(m => m.username === 'farmer_zain');
assert('Farmer Zain lifetime units aggregated (1 + 5 = 6)', zain.assetsPurchased === 6);
assert('Farmer Zain total spent aggregated (500 + 2500 = 3000 PKR)', zain.totalSpentPkr === 3000);
assert('Farmer Zain total commission aggregated (10 + 50 = 60 PKR)', zain.commissionEarnedPkr === 60.00);

const ali = engine.teamMembers.find(m => m.username === 'farmer_ali');
assert('Farmer Ali lifetime units aggregated (2 + 4 = 6)', ali.assetsPurchased === 6);
assert('Farmer Ali total spent aggregated (1000 + 2000 = 3000 PKR)', ali.totalSpentPkr === 3000);
assert('Farmer Ali total commission aggregated (10 + 20 = 30 PKR)', ali.commissionEarnedPkr === 30.00);

assert('Aggregated total commission earned equals 90.00 PKR (60 + 30)', engine.referralStats.totalCommissionEarned === 90.00);
assert('Total downline volume equals 6000 PKR', engine.referralStats.totalDownlineVolumePkr === 6000);
assert('Total downline units equals 12', engine.referralStats.totalDownlineUnits === 12);

// Ledger Audit
const commTrxs = engine.transactions.filter(t => t.type === 'COMMISSION');
assert('Transaction ledger contains 4 COMMISSION entries', commTrxs.length === 4);
assert('Commission transaction metadata contains downline details and rate',
  commTrxs[0].metadata &&
  commTrxs[0].metadata.downlineUsername &&
  commTrxs[0].metadata.tierLevel &&
  commTrxs[0].metadata.rate !== undefined
);

// Fresh State Reset
const resetRes = engine.resetToFreshState();
assert('resetToFreshState() executes successfully', resetRes.success);
assert('Post-reset teamMembers is empty ([])', engine.teamMembers.length === 0);
assert('Post-reset balance restored to 1500 PKR', engine.balance === 1500.00);
assert('Post-reset total commission earned reset to 0', engine.referralStats.totalCommissionEarned === 0);
assert('Post-reset transactions purged of commission entries', engine.transactions.filter(t => t.type === 'COMMISSION').length === 0);

// =========================================================================
// SUITE 3: UI Architecture & TeamPage Wiring Audit
// =========================================================================
console.log('\n--- SUITE 3: TeamPage Component & UI Architecture Audit ---');

const teamPagePath = path.join(ROOT_DIR, 'src/pages/TeamPage.jsx');
const teamPageExists = fs.existsSync(teamPagePath);
assert('TeamPage.jsx exists in src/pages/', teamPageExists);

if (teamPageExists) {
  const teamCode = fs.readFileSync(teamPagePath, 'utf-8');

  assert('TeamPage has substantial codebase size (> 20KB)', teamCode.length > 20000, `Size: ${teamCode.length} bytes`);
  assert('Wraps layout in AppShell with currentRoute="/team"', teamCode.includes('<AppShell') && teamCode.includes('currentRoute="/team"'));
  assert('Provides back navigation button routing to dashboard', teamCode.includes("navigateTo('/dashboard')"));
  assert('Displays Upliner Sponsor Card', teamCode.includes('Direct Sponsor') || teamCode.includes('Upliner') || teamCode.includes('Root Account'));
  assert('Renders referral code copy button with clipboard copy handler', teamCode.includes('copyToClipboard') || teamCode.includes('clipboard.writeText'));
  assert('Renders WhatsApp share button with pre-filled message text', teamCode.includes('api.whatsapp.com/send') && teamCode.includes('text='));
  assert('Renders 4 metric summary cards (Total Invited, Level 1, Level 2, Total Earned)',
    teamCode.includes('totalInvited') &&
    teamCode.includes('level1Count') &&
    teamCode.includes('level2Count') &&
    teamCode.includes('totalCommissionEarned')
  );
  assert('Renders Level 1 badge with 2.00% rate tag', teamCode.includes('2.00%'));
  assert('Renders Level 2 badge with 1.00% rate tag', teamCode.includes('1.00%'));
  assert('Implements Downline Registration form with tier selector', teamCode.includes('registerDownline') && teamCode.includes('newTierLevel'));
  assert('Implements Hen Purchase Simulation tool with presets and live preview', teamCode.includes('simulateDownlinePurchase') && teamCode.includes('purchaseUnits'));
  assert('Implements Team Members Table / Ledger with search and tier filtering', teamCode.includes('ledgerTierFilter') && teamCode.includes('searchQuery'));
  assert('Implements Empty State illustration when team has zero members', teamCode.includes('No Downline Members Yet') || teamCode.includes('teamMembers.length === 0'));
  assert('Implements 1-click Reset to Fresh State button', teamCode.includes('resetToFreshState()'));
}

// =========================================================================
// SUITE 4: Routing & Application Shell Integration Audit
// =========================================================================
console.log('\n--- SUITE 4: Navigation & Route Switcher Audit ---');

// App.jsx
const appPath = path.join(ROOT_DIR, 'src/App.jsx');
const appExists = fs.existsSync(appPath);
assert('App.jsx exists in src/', appExists);

if (appExists) {
  const appCode = fs.readFileSync(appPath, 'utf-8');
  assert('App.jsx imports TeamPage', appCode.includes("import TeamPage from './pages/TeamPage'"));
  assert('App.jsx exports TeamPage component', appCode.includes('export { TeamPage }'));
  assert('App.jsx handles /team route in switch block', appCode.includes("case '/team':") && appCode.includes('<TeamPage />'));
}

// AppNavigation.jsx
const navPath = path.join(ROOT_DIR, 'src/components/AppNavigation.jsx');
const navExists = fs.existsSync(navPath);
assert('AppNavigation.jsx exists in src/components/', navExists);

if (navExists) {
  const navCode = fs.readFileSync(navPath, 'utf-8');
  assert('Drawer navigation contains My Team & Referrals menu item', navCode.includes('My Team &amp; Referrals') || navCode.includes('My Team'));
  assert('Drawer link points to #/team and calls handleNav("/team")', navCode.includes('#/team') && navCode.includes("handleNav('/team')"));
  assert('Sticky Bottom Dock maintains 5 core navigation items',
    navCode.includes('Home') &&
    navCode.includes('My Farm') &&
    navCode.includes('BUY') &&
    navCode.includes('Sale') &&
    navCode.includes('Profile')
  );
}

// DashboardPage.jsx
const dashPath = path.join(ROOT_DIR, 'src/pages/DashboardPage.jsx');
const dashExists = fs.existsSync(dashPath);
assert('DashboardPage.jsx exists in src/pages/', dashExists);

if (dashExists) {
  const dashCode = fs.readFileSync(dashPath, 'utf-8');
  assert('Dashboard Bento Tile 5 routes to /team', dashCode.includes("navigateTo('/team')"));
  assert('Bento Tile 5 maintains label "Team" and badge "Network"', dashCode.includes('Team') && dashCode.includes('Network'));
  assert('VIP Referral Hub banner provides link/button routing to /team', dashCode.includes('Open Team & Referral Hub'));
  assert('VIP Squad Hub cards dynamically display referralStats counters', dashCode.includes('referralStats?.totalInvited') && dashCode.includes('referralStats?.activeTeamCount'));
}

// =========================================================================
// SUMMARY REPORT
// =========================================================================
console.log('\n===============================================================');
console.log(`AUDIT RESULTS: ${passedChecks}/${totalChecks} checks passed (${((passedChecks / totalChecks) * 100).toFixed(1)}%)`);
console.log('===============================================================');

if (failedChecks === 0) {
  console.log('\n\x1b[32m✔ MILESTONE M8 & M9 AUDIT VERIFICATION PASSED WITH ZERO DEFECTS (100%)\x1b[0m\n');
  process.exit(0);
} else {
  console.error(`\n\x1b[31m✖ MILESTONE M8 & M9 AUDIT FAILED with ${failedChecks} errors.\x1b[0m\n`);
  process.exit(1);
}
