import fs from 'fs';
import path from 'path';

console.log('========================================================================');
console.log('   EMPIRICAL CHALLENGER (m1_2): LIFECYCLE CONTINUITY & UNIFICATION TEST   ');
console.log('========================================================================\n');

const rawDir = path.resolve('D:/allakermegg/rawafiles');
const explanationPath = path.resolve('D:/allakermegg/SYSTEM_EXPLANATION.md');
const explanationContent = fs.readFileSync(explanationPath, 'utf8');

const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  challenges: []
};

function test(name, condition, details = '', isFatalChallenge = false) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`[PASS] ${name}`);
  } else {
    testResults.failed++;
    console.log(`[CHALLENGE / FAIL] ${name}`);
    console.log(`  -> Details: ${details}`);
    testResults.challenges.push({ name, details, isFatal: isFatalChallenge });
  }
}

// --------------------------------------------------------------------------
// SUITE 1: EMPIRICAL AUDIT OF "SELL EGG" VS "WITHDRAW" UNIFICATION
// --------------------------------------------------------------------------
console.log('\n--- SUITE 1: Empirical Analysis of Sell Egg vs Withdraw ---');

const salePath = path.join(rawDir, 'Sell Egg - Alkram Meta Eggssale.html');
const widrawPath = path.join(rawDir, 'Sell Egg - Alkram Meta Eggswidraw.html');

const saleContent = fs.readFileSync(salePath, 'utf8');
const widrawContent = fs.readFileSync(widrawPath, 'utf8');

test('Both files originate from identical URL comment (https://alkram-eggs.com/user/withdraw)',
  saleContent.includes('<!-- saved from url=(0037)https://alkram-eggs.com/user/withdraw -->') &&
  widrawContent.includes('<!-- saved from url=(0037)https://alkram-eggs.com/user/withdraw -->'),
  'Origin URL mismatch'
);

test('Both files have identical <title> tag',
  saleContent.includes('<title>Sell Egg - Alkram Meta Eggs</title>') &&
  widrawContent.includes('<title>Sell Egg - Alkram Meta Eggs</title>'),
  'Title mismatch'
);

// Form comparison
function getWithdrawForm(html) {
  const match = html.match(/<form[^>]*id="withdrawForm"[^>]*>[\s\S]*?<\/form>/i);
  return match ? match[0] : null;
}

const saleForm = getWithdrawForm(saleContent);
const widrawForm = getWithdrawForm(widrawContent);

test('Both files contain <form id="withdrawForm"> submitting to /user/withdraw',
  saleForm && widrawForm &&
  saleForm.includes('action="https://alkram-eggs.com/user/withdraw"') &&
  widrawForm.includes('action="https://alkram-eggs.com/user/withdraw"'),
  'Withdraw form missing or action mismatch'
);

// Extract form input names
function getInputNames(formHtml) {
  const inputs = [...formHtml.matchAll(/name=["']([^"']*)["']/g)].map(m => m[1]);
  return [...new Set(inputs)].sort();
}

const saleInputs = getInputNames(saleForm);
const widrawInputs = getInputNames(widrawForm);

test('Both forms contain identical input parameters',
  JSON.stringify(saleInputs) === JSON.stringify(widrawInputs),
  `Inputs diff: sale=${JSON.stringify(saleInputs)}, widraw=${JSON.stringify(widrawInputs)}`
);

// Test worker claim of "byte-for-byte identical"
const isExactByteMatch = saleContent === widrawContent;
const isFormByteMatch = saleForm === widrawForm;
test('Worker claim check: Are files/forms strictly byte-for-byte identical?',
  isExactByteMatch,
  `sale.html is ${saleContent.length} bytes, widraw.html is ${widrawContent.length} bytes (delta: ${widrawContent.length - saleContent.length} bytes). ` +
  `The forms differ by ${widrawForm.length - saleForm.length} bytes due to live trade counter snapshots (Sonica: 6141 vs 8116 trades) and asset folder naming.`,
  false // Challenge finding, non-fatal to architecture but invalidates literal "byte-for-byte" wording
);

// --------------------------------------------------------------------------
// SUITE 2: DASHBOARD NAVIGATION GRAPH & EGRESS TO SELL/WITHDRAW
// --------------------------------------------------------------------------
console.log('\n--- SUITE 2: Dashboard Navigation Graph to Liquidation ---');

const dashPath = path.join(rawDir, 'Alkram Meta Eggs _ Dashboard.html');
const dashContent = fs.readFileSync(dashPath, 'utf8');

// Check all links to /user/withdraw on dashboard
const withdrawLinks = [...dashContent.matchAll(/<a[^>]*href=["']([^"']*withdraw[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
test('Dashboard contains >= 4 entry points routing directly to /user/withdraw',
  withdrawLinks.length >= 4,
  `Found ${withdrawLinks.length} withdraw links on Dashboard`
);

const linkTexts = withdrawLinks.map(m => m[2].replace(/<[^>]+>/g, '').trim().toUpperCase());
test('Dashboard links to /user/withdraw use both "SELL" and "SALE" nomenclature',
  linkTexts.some(t => t.includes('SELL')) && linkTexts.some(t => t.includes('SALE')),
  `Link texts found: ${JSON.stringify(linkTexts)}`
);

test('Dashboard contains NO distinct cash withdrawal link (proving single unified liquidation model)',
  !dashContent.match(/href=["'][^"']*(?:cash-withdraw|fiat-withdraw|payout-request)[^"']*["']/i),
  'Unexpected separate cash withdrawal link detected'
);

// --------------------------------------------------------------------------
// SUITE 3: LIFECYCLE STATE MACHINE & TRANSITION GRAPH AUDIT
// --------------------------------------------------------------------------
console.log('\n--- SUITE 3: Lifecycle State Machine & Transition Graph Audit ---');

// Check if SYSTEM_EXPLANATION.md contains Section 4.1 state diagram
test('Explanation contains State Machine diagram in Section 4.1',
  explanationContent.includes('### 4.1 System Lifecycle State Machine') &&
  explanationContent.includes('[State 0: Guest Visitor]') &&
  explanationContent.includes('[State 2: Authenticated Farmer Dashboard]'),
  'Missing Section 4.1 State Machine'
);

// Challenge: Topological inspection of state machine diagram in Section 4.1
// In Section 4.1: State 3, 4, 5 funnel into State 6, and State 6 exits to Logout -> State 1
// Does the diagram depict return paths from State 3, 4, 5, 6 back to State 2 (Dashboard)?
const section4_1 = explanationContent.slice(
  explanationContent.indexOf('### 4.1 System Lifecycle State Machine'),
  explanationContent.indexOf('### 4.2 Page 1: User Login')
);

const hasReturnToState2 = /State 2[\s\S]*?◄|Return to Dashboard|Dashboard[\s\S]*?◄[─-]+/.test(section4_1);
test('State Machine Diagram Challenge: Depicts bi-directional returns back to State 2 Dashboard',
  hasReturnToState2,
  'Section 4.1 state diagram depicts State 3, 4, 5 funneling into State 6 (Change Password) with no return arrow to State 2 (Dashboard). In reality, the dashboard is the central hub and users return to Dashboard from Buy, Harvest, Sell, or Change Password via bottom dock/back button.',
  false // Challenge / finding
);

// Check if State 4 (Harvest Nexus) is actually an internal dashboard component
test('Harvest Nexus architectural role: Internal dashboard component rather than external route',
  dashContent.includes('eco-orbit-track') && dashContent.includes('cooldownModal'),
  'Harvest Nexus and Cooldown Modal are embedded directly in Alkram Meta Eggs _ Dashboard.html'
);

// Check logout availability
const changePassContent = fs.readFileSync(path.join(rawDir, 'Alkram Meta Eggs _ Change Password.html'), 'utf8');
const buyContent = fs.readFileSync(path.join(rawDir, 'Buy Alkram Meta Eggs - VIP Farm Asset.html'), 'utf8');

test('Logout capability: Accessible via tc-sidebar drawer in sub-pages',
  changePassContent.includes('tc-sidebar-logout-btn') &&
  buyContent.includes('tc-sidebar-logout-btn') &&
  saleContent.includes('tc-sidebar-logout-btn'),
  'tc-sidebar-logout-btn missing from sub-pages'
);

// --------------------------------------------------------------------------
// SUITE 4: REQUIREMENT MATRIX & PROTOTYPE CONTRACT CONFORMANCE
// --------------------------------------------------------------------------
console.log('\n--- SUITE 4: Requirement Matrix & Interface Conformance ---');

const projectPath = path.resolve('D:/allakermegg/.agents/teamwork/PROJECT.md');
const projectContent = fs.readFileSync(projectPath, 'utf8');

test('PROJECT.md covers all 6 required pages in Milestone feature inventory',
  projectContent.includes('LoginPage') &&
  projectContent.includes('DashboardPage') &&
  projectContent.includes('BuyAssetPage') &&
  projectContent.includes('SellEggPage') &&
  projectContent.includes('ChangePasswordPage'),
  'Missing page component definitions in PROJECT.md'
);

test('FarmContext contract defines full transactional and session actions',
  projectContent.includes('login(') &&
  projectContent.includes('logout(') &&
  projectContent.includes('changePassword(') &&
  projectContent.includes('buyFarmAsset(') &&
  projectContent.includes('harvestEggs(') &&
  projectContent.includes('sellEggs('),
  'Missing core actions in FarmContext interface contract'
);

// --------------------------------------------------------------------------
// FINAL SUMMARY & VERDICT CALCULATION
// --------------------------------------------------------------------------
console.log('\n========================================================================');
console.log(`TOTAL AUDIT CHECKS: ${testResults.total} | PASSED: ${testResults.passed} | CHALLENGES: ${testResults.failed}`);
console.log('========================================================================\n');

if (testResults.challenges.length > 0) {
  console.log('CHALLENGE FINDINGS TO SURFACE IN REPORT:');
  testResults.challenges.forEach((c, i) => {
    console.log(`${i + 1}. [${c.isFatal ? 'FATAL' : 'ADVISORY'}] ${c.name}`);
    console.log(`   ${c.details}`);
  });
}
