// tests/challenger-referral-math-stress.mjs
// Adversarial Challenger Stress Harness for AL Rehman Meta Eggs 2-Tier Referral & Commission Engine
// Empirically verifies high-volume downlines, exact mathematical precision, boundary inputs,
// state invariants, ledger auditability, and fresh reset purity.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MockLocalStorage } from './helpers/mock-storage.mjs';
import { FarmEngine, COMMISSION_RATES, ASSET_SPEC } from './helpers/farm-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('='.repeat(75));
console.log('   ADVERSARIAL CHALLENGER STRESS HARNESS: 2-TIER COMMISSION & REFERRALS');
console.log('   Empirical Verification, High-Volume Downlines & Boundary Stress');
console.log('='.repeat(75) + '\n');

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;

function assert(title, condition, details = '') {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  \x1b[32m✔\x1b[0m [PASS] ${title}`);
  } else {
    failedAssertions++;
    console.error(`  \x1b[31m✖\x1b[0m [FAIL] ${title}`);
    if (details) console.error(`         \x1b[90m${details}\x1b[0m`);
  }
}

async function runAdversarialStressHarness() {
  const harnessStartTime = Date.now();

  // =========================================================================
  // SUITE 1: High-Volume Downline Registration Stress (70 Members across L1 & L2)
  // =========================================================================
  console.log('\n\x1b[1m\x1b[35m=== SUITE 1: High-Volume Downline Registration Stress (70 Members) ===\x1b[0m');

  const storage1 = new MockLocalStorage();
  const engine1 = new FarmEngine(storage1);
  engine1.resetToFreshState(); // Establish fresh production baseline

  assert('Baseline teamMembers starts strictly empty', engine1.teamMembers.length === 0);
  assert('Baseline initial balance is exactly 1500.00 PKR', engine1.balance === 1500.00);

  const L1_TARGET_COUNT = 40;
  const L2_TARGET_COUNT = 30;
  const TOTAL_MEMBERS = L1_TARGET_COUNT + L2_TARGET_COUNT;

  let l1RegistrationSuccesses = 0;
  let l2RegistrationSuccesses = 0;

  // Register 40 Level 1 Members
  for (let i = 1; i <= L1_TARGET_COUNT; i++) {
    const username = `stress_l1_farmer_${String(i).padStart(3, '0')}`;
    const res = engine1.registerDownline({
      username,
      tierLevel: 1,
      joinDate: new Date(Date.now() - (TOTAL_MEMBERS - i) * 60000).toISOString()
    });
    if (res.success && res.member && res.member.tierLevel === 1) {
      l1RegistrationSuccesses++;
    }
  }

  assert(
    `Successfully registered ${L1_TARGET_COUNT} Level 1 downline members in high volume`,
    l1RegistrationSuccesses === L1_TARGET_COUNT,
    `Registered: ${l1RegistrationSuccesses}/${L1_TARGET_COUNT}`
  );

  // Register 30 Level 2 Members (associated with various Level 1 upliners)
  for (let i = 1; i <= L2_TARGET_COUNT; i++) {
    const username = `stress_l2_farmer_${String(i).padStart(3, '0')}`;
    const uplinerIdx = ((i - 1) % L1_TARGET_COUNT) + 1;
    const upliner = `stress_l1_farmer_${String(uplinerIdx).padStart(3, '0')}`;
    const res = engine1.registerDownline({
      username,
      tierLevel: 2,
      upliner,
      joinDate: new Date(Date.now() - (L2_TARGET_COUNT - i) * 60000).toISOString()
    });
    if (res.success && res.member && res.member.tierLevel === 2 && res.member.upliner === upliner) {
      l2RegistrationSuccesses++;
    }
  }

  assert(
    `Successfully registered ${L2_TARGET_COUNT} Level 2 downline members with designated upliners`,
    l2RegistrationSuccesses === L2_TARGET_COUNT,
    `Registered: ${l2RegistrationSuccesses}/${L2_TARGET_COUNT}`
  );

  const statsAfterReg = engine1.getReferralStats();
  assert('Aggregated totalInvited equals exactly 70', statsAfterReg.totalInvited === TOTAL_MEMBERS);
  assert('Aggregated level1Count equals exactly 40', statsAfterReg.level1Count === L1_TARGET_COUNT);
  assert('Aggregated level2Count equals exactly 30', statsAfterReg.level2Count === L2_TARGET_COUNT);
  assert('Pre-purchase activeTeamCount is 0', statsAfterReg.activeTeamCount === 0);
  assert('Pre-purchase totalDownlineUnits is 0', statsAfterReg.totalDownlineUnits === 0);
  assert('Pre-purchase totalDownlineVolumePkr is 0', statsAfterReg.totalDownlineVolumePkr === 0);
  assert('Pre-purchase totalCommissionEarned is 0', statsAfterReg.totalCommissionEarned === 0);

  // =========================================================================
  // SUITE 2: Exact Mathematical Precision & High-Volume Purchase Execution
  // =========================================================================
  console.log('\n\x1b[1m\x1b[35m=== SUITE 2: 2-Tier Mathematical Precision & High-Volume Purchases ===\x1b[0m');

  // We will simulate purchases across all 70 members using distinct unit quantities:
  // e.g. units = (index % 10) + 1 (1 to 10 units each)
  // Plus special whale purchases on selected members (50, 100, 250 units)
  let expectedTotalL1Commission = 0;
  let expectedTotalL2Commission = 0;
  let expectedTotalVolume = 0;
  let expectedTotalUnits = 0;
  let simulatedPurchaseCount = 0;

  for (let i = 0; i < engine1.teamMembers.length; i++) {
    const member = engine1.teamMembers[i];
    // Stagger unit quantities: 1 to 10 units, with every 10th member buying 50 units
    let unitsToBuy = (i % 10) + 1;
    if (i % 15 === 0) unitsToBuy = 50;
    if (i === 1) unitsToBuy = 100;
    if (i === 45) unitsToBuy = 250;

    const cost = unitsToBuy * ASSET_SPEC.unitPrice;
    const rate = member.tierLevel === 1 ? COMMISSION_RATES.LEVEL_1 : COMMISSION_RATES.LEVEL_2;
    const expectedCommission = Number((cost * rate).toFixed(2));

    const preBalance = engine1.balance;
    const res = engine1.simulateDownlinePurchase({
      memberId: member.id,
      units: unitsToBuy
    });

    assert(
      `Purchase simulation succeeds for member ${member.username} (${unitsToBuy} units @ Level ${member.tierLevel})`,
      res.success === true && res.commission === expectedCommission
    );

    assert(
      `Balance increment matches exact commission for ${member.username}`,
      Math.abs(engine1.balance - (preBalance + expectedCommission)) < 0.000001
    );

    if (member.tierLevel === 1) {
      expectedTotalL1Commission += expectedCommission;
    } else {
      expectedTotalL2Commission += expectedCommission;
    }
    expectedTotalVolume += cost;
    expectedTotalUnits += unitsToBuy;
    simulatedPurchaseCount++;
  }

  const expectedCombinedCommission = Number((expectedTotalL1Commission + expectedTotalL2Commission).toFixed(2));
  const statsAfterPurchases = engine1.getReferralStats();

  assert(
    `Total simulated purchases completed: ${simulatedPurchaseCount}/${TOTAL_MEMBERS}`,
    simulatedPurchaseCount === TOTAL_MEMBERS
  );
  assert(
    `All ${TOTAL_MEMBERS} downlines are now recognized as activeTeamCount`,
    statsAfterPurchases.activeTeamCount === TOTAL_MEMBERS
  );
  assert(
    `Aggregated totalDownlineUnits matches expected sum (${expectedTotalUnits})`,
    statsAfterPurchases.totalDownlineUnits === expectedTotalUnits
  );
  assert(
    `Aggregated totalDownlineVolumePkr matches exact expected volume (${expectedTotalVolume} PKR)`,
    statsAfterPurchases.totalDownlineVolumePkr === expectedTotalVolume
  );
  assert(
    `Aggregated totalCommissionEarned matches exact mathematical sum (${expectedCombinedCommission} PKR)`,
    statsAfterPurchases.totalCommissionEarned === expectedCombinedCommission
  );

  const expectedFinalBalance = Number((1500.00 + expectedCombinedCommission).toFixed(2));
  assert(
    `Wallet balance strictly matches initial (1500.00) + totalCommissionEarned (${expectedFinalBalance} PKR)`,
    engine1.balance === expectedFinalBalance
  );

  // Floating-point drift check: ensure balance has no floating point representation error
  const cents = Math.round(engine1.balance * 100);
  assert(
    'Wallet balance maintains strict 2-decimal financial precision without floating point drift',
    Math.abs(engine1.balance - (cents / 100)) < 0.000001
  );

  // Whale Purchase Stress: 10,000 units on Level 1 (5,000,000 PKR volume)
  const whaleResL1 = engine1.simulateDownlinePurchase({
    username: 'stress_l1_farmer_001',
    units: 10000
  });
  assert('Whale purchase (10,000 units) on Level 1 succeeds', whaleResL1.success === true);
  assert(
    'Whale purchase Level 1 commission is exactly 100,000.00 PKR (2% of 5,000,000)',
    whaleResL1.commission === 100000.00
  );

  // Whale Purchase Stress: 10,000 units on Level 2 (5,000,000 PKR volume)
  const whaleResL2 = engine1.simulateDownlinePurchase({
    username: 'stress_l2_farmer_001',
    units: 10000
  });
  assert('Whale purchase (10,000 units) on Level 2 succeeds', whaleResL2.success === true);
  assert(
    'Whale purchase Level 2 commission is exactly 50,000.00 PKR (1% of 5,000,000)',
    whaleResL2.commission === 50000.00
  );

  // Consecutive multi-purchases on the same member
  const multiMember = engine1.teamMembers.find(m => m.username === 'stress_l1_farmer_002');
  const prevAssets = multiMember.assetsPurchased;
  const prevSpent = multiMember.totalSpentPkr;
  const prevComm = multiMember.commissionEarnedPkr;

  engine1.simulateDownlinePurchase({ memberId: multiMember.id, units: 3 }); // 1500 cost -> 30 PKR
  engine1.simulateDownlinePurchase({ memberId: multiMember.id, units: 7 }); // 3500 cost -> 70 PKR

  assert(
    'Member cumulative assetsPurchased aggregates accurately across consecutive purchases',
    multiMember.assetsPurchased === prevAssets + 10
  );
  assert(
    'Member cumulative totalSpentPkr aggregates accurately across consecutive purchases',
    multiMember.totalSpentPkr === prevSpent + 5000
  );
  assert(
    'Member cumulative commissionEarnedPkr aggregates accurately across consecutive purchases',
    multiMember.commissionEarnedPkr === prevComm + 100
  );

  // =========================================================================
  // SUITE 3: Boundary Inputs & Hostile Attack Resilience
  // =========================================================================
  console.log('\n\x1b[1m\x1b[35m=== SUITE 3: Boundary Inputs & Hostile Attack Resilience ===\x1b[0m');

  const boundaryStorage = new MockLocalStorage();
  const boundaryEngine = new FarmEngine(boundaryStorage);

  // Test Boundary Units for simulateDownlinePurchase
  boundaryEngine.registerDownline({ username: 'valid_test_farmer', tierLevel: 1 });

  const invalidUnitInputs = [
    { label: 'Zero units (0)', val: 0 },
    { label: 'Negative units (-1)', val: -1 },
    { label: 'Negative units (-50)', val: -50 },
    { label: 'Float non-integer (1.5)', val: 1.5 },
    { label: 'Float non-integer (0.01)', val: 0.01 },
    { label: 'Float non-integer (9.9999)', val: 9.9999 },
    { label: 'String float ("2.5")', val: '2.5' },
    { label: 'String non-numeric ("ten")', val: 'ten' },
    { label: 'Empty string ("")', val: '' },
    { label: 'NaN', val: NaN },
    { label: 'Infinity', val: Infinity },
    { label: '-Infinity', val: -Infinity },
    { label: 'null', val: null },
    { label: 'Object ({})', val: {} },
    { label: 'Array ([1, 2])', val: [1, 2] }
  ];

  for (const item of invalidUnitInputs) {
    const res = boundaryEngine.simulateDownlinePurchase({
      username: 'valid_test_farmer',
      units: item.val
    });
    assert(
      `Rejects invalid unit input: ${item.label}`,
      res.success === false && res.message.includes('positive integer')
    );
  }

  // Verify ES6 default parameter fallback (units = 1) when omitted or undefined
  const defaultResOmitted = boundaryEngine.simulateDownlinePurchase({
    username: 'valid_test_farmer'
  });
  assert(
    'Defaults units to 1 and succeeds when units parameter is omitted',
    defaultResOmitted.success === true && defaultResOmitted.commission === 10.00
  );

  const defaultResUndefined = boundaryEngine.simulateDownlinePurchase({
    username: 'valid_test_farmer',
    units: undefined
  });
  assert(
    'Defaults units to 1 and succeeds when units is explicitly undefined',
    defaultResUndefined.success === true && defaultResUndefined.commission === 10.00
  );

  // Non-existent member rejection
  const nonExistentRes = boundaryEngine.simulateDownlinePurchase({
    username: 'non_existent_farmer_xyz',
    units: 5
  });
  assert(
    'Rejects purchase simulation for non-existent member username',
    nonExistentRes.success === false && nonExistentRes.message.includes('not found')
  );

  const nonExistentIdRes = boundaryEngine.simulateDownlinePurchase({
    memberId: 'DL-FAKE-999999',
    units: 5
  });
  assert(
    'Rejects purchase simulation for non-existent member ID',
    nonExistentIdRes.success === false && nonExistentIdRes.message.includes('not found')
  );

  // Empty / Whitespace Username Registration
  const emptyUsernames = ['', '   ', '\t', '\n', null, undefined];
  for (const emptyVal of emptyUsernames) {
    const res = boundaryEngine.registerDownline({ username: emptyVal });
    assert(
      `Rejects empty or whitespace username (${JSON.stringify(emptyVal)})`,
      res.success === false && res.message.includes('username is required')
    );
  }

  // Duplicate Username Rejection (Case-Insensitive & Trimmed)
  boundaryEngine.registerDownline({ username: 'Captain_Poultry', tierLevel: 1 });

  const duplicateAttempts = [
    { label: 'Exact match', val: 'Captain_Poultry' },
    { label: 'Lowercase match', val: 'captain_poultry' },
    { label: 'Uppercase match', val: 'CAPTAIN_POULTRY' },
    { label: 'Mixed case with padding', val: '   Captain_POULTRY   ' }
  ];

  for (const dup of duplicateAttempts) {
    const res = boundaryEngine.registerDownline({ username: dup.val });
    assert(
      `Rejects case-insensitive duplicate username: ${dup.label}`,
      res.success === false && res.message.includes('already registered')
    );
  }

  // Hostile Injection Payloads
  const hostilePayloads = [
    { label: 'SQL Injection: Robert\'); DROP TABLE users;--', str: 'Robert\'); DROP TABLE users;--' },
    { label: 'SQL Injection: \' OR 1=1 --', str: '\' OR 1=1 --' },
    { label: 'XSS: <script>alert("PWNED")</script>', str: '<script>alert("PWNED")</script>' },
    { label: 'XSS Image onerror: <img src=x onerror=alert(1)>', str: '<img src=x onerror=alert(1)>' },
    { label: 'HTML Entities: &lt;b&gt;admin&lt;/b&gt;', str: '&lt;b&gt;admin&lt;/b&gt;' },
    { label: 'Control characters & newlines: farmer\r\n\x00\x1b', str: 'farmer\r\n\x00\x1b' },
    { label: 'Emoji & Unicode: 🐔_MetaFarmer_💎_99', str: '🐔_MetaFarmer_💎_99' },
    { label: 'Path Traversal: ../../../../etc/passwd', str: '../../../../etc/passwd' }
  ];

  for (const h of hostilePayloads) {
    const res = boundaryEngine.registerDownline({ username: h.str, tierLevel: 1 });
    assert(
      `Handles hostile input without crash or exception: ${h.label}`,
      res.success === true && res.member && res.member.username === h.str.trim()
    );

    // Verify purchase simulation on hostile name also works safely
    const simRes = boundaryEngine.simulateDownlinePurchase({
      username: h.str.trim(),
      units: 2
    });
    assert(
      `Executes purchase safely for hostile name (${h.label})`,
      simRes.success === true && simRes.commission === 20.00
    );
  }

  // Verify persistence after hostile payloads does not corrupt JSON serialization
  assert(
    'Storage serializes and deserializes hostile strings cleanly without JSON syntax error',
    (() => {
      try {
        const raw = boundaryStorage.getItem('alrehman_meta_eggs_state');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed.teamMembers) && parsed.teamMembers.length > 5;
      } catch (err) {
        return false;
      }
    })()
  );

  // =========================================================================
  // SUITE 4: State Invariants, Ledger Auditability & Fresh Reset Purity
  // =========================================================================
  console.log('\n\x1b[1m\x1b[35m=== SUITE 4: State Invariants, Ledger Auditability & Fresh Reset ===\x1b[0m');

  // Verify Ledger Auditability on engine1 (which executed high volume purchases)
  const commissionTransactions = engine1.transactions.filter(t => t.type === 'COMMISSION');
  // Total purchases executed in engine1 = 70 baseline + 2 whale + 2 multi = 74
  assert(
    'Every executed purchase generated an audit transaction with type: "COMMISSION"',
    commissionTransactions.length === 74,
    `Found ${commissionTransactions.length} COMMISSION transactions, expected 74`
  );

  let ledgerSumPkr = 0;
  let allLedgerMetadataValid = true;

  for (const trx of commissionTransactions) {
    ledgerSumPkr += trx.amount;
    const meta = trx.metadata;
    if (!meta || !meta.downlineId || !meta.downlineUsername || !meta.tierLevel || !meta.unitsPurchased || !meta.rate) {
      allLedgerMetadataValid = false;
    }
  }

  const roundedLedgerSum = Number(ledgerSumPkr.toFixed(2));
  assert(
    'Sum of all COMMISSION transactions exactly matches total referral commission earned',
    roundedLedgerSum === engine1.getReferralStats().totalCommissionEarned,
    `Ledger sum: ${roundedLedgerSum}, ReferralStats: ${engine1.getReferralStats().totalCommissionEarned}`
  );

  assert('All commission transaction ledger entries contain complete audit metadata', allLedgerMetadataValid);

  // Rehydration parity check: create a fresh engine pointing to engine1's storage
  const rehydratedEngine = new FarmEngine(storage1);
  assert(
    'Rehydrated engine restores exact balance from storage',
    rehydratedEngine.balance === engine1.balance
  );
  assert(
    'Rehydrated engine restores exact teamMembers count (70)',
    rehydratedEngine.teamMembers.length === 70
  );
  assert(
    'Rehydrated engine restores exact commission transaction count (74)',
    rehydratedEngine.transactions.filter(t => t.type === 'COMMISSION').length === 74
  );
  assert(
    'Rehydrated engine referralStats matches original engine referralStats exactly',
    JSON.stringify(rehydratedEngine.getReferralStats()) === JSON.stringify(engine1.getReferralStats())
  );

  // 1-Click 'Reset to Fresh State' Verification
  const resetResult = engine1.resetToFreshState();
  assert('resetToFreshState() executes and returns success message', resetResult.success === true);

  assert('Post-reset teamMembers is completely purged (length 0)', engine1.teamMembers.length === 0);
  assert('Post-reset balance is restored to clean 1500.00 PKR baseline', engine1.balance === 1500.00);
  assert('Post-reset eggVault is restored to clean 18 eggs', engine1.eggVault === 18);
  assert('Post-reset activeAssets has exactly 1 initial seed asset', engine1.activeAssets.length === 1);
  assert(
    'Post-reset transactions has exactly 2 initial seed transactions (zero COMMISSION entries)',
    engine1.transactions.length === 2 && !engine1.transactions.some(t => t.type === 'COMMISSION')
  );

  const statsPostReset = engine1.getReferralStats();
  assert('Post-reset referralStats.totalInvited is 0', statsPostReset.totalInvited === 0);
  assert('Post-reset referralStats.level1Count is 0', statsPostReset.level1Count === 0);
  assert('Post-reset referralStats.level2Count is 0', statsPostReset.level2Count === 0);
  assert('Post-reset referralStats.totalCommissionEarned is 0', statsPostReset.totalCommissionEarned === 0);
  assert('Post-reset referralStats.activeTeamCount is 0', statsPostReset.activeTeamCount === 0);
  assert('Post-reset referralStats.totalDownlineUnits is 0', statsPostReset.totalDownlineUnits === 0);
  assert('Post-reset referralStats.totalDownlineVolumePkr is 0', statsPostReset.totalDownlineVolumePkr === 0);

  // Rehydration after reset check: confirms persistent storage was purged
  const postResetRehydrated = new FarmEngine(storage1);
  assert(
    'Post-reset storage rehydration has 0 team members',
    postResetRehydrated.teamMembers.length === 0
  );
  assert(
    'Post-reset storage rehydration has 1500.00 balance',
    postResetRehydrated.balance === 1500.00
  );
  assert(
    'Post-reset storage rehydration has 0 COMMISSION transactions',
    postResetRehydrated.transactions.filter(t => t.type === 'COMMISSION').length === 0
  );

  // =========================================================================
  // SUITE 5: Static Contract & Source AST Alignment
  // =========================================================================
  console.log('\n\x1b[1m\x1b[35m=== SUITE 5: Static Contract & Source AST Alignment ===\x1b[0m');

  const contextCode = fs.readFileSync(path.join(ROOT_DIR, 'src/context/FarmContext.jsx'), 'utf-8');
  const teamPageCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/TeamPage.jsx'), 'utf-8');
  const appCode = fs.readFileSync(path.join(ROOT_DIR, 'src/App.jsx'), 'utf-8');
  const navCode = fs.readFileSync(path.join(ROOT_DIR, 'src/components/AppNavigation.jsx'), 'utf-8');
  const dashCode = fs.readFileSync(path.join(ROOT_DIR, 'src/pages/DashboardPage.jsx'), 'utf-8');

  // FarmContext AST Alignment
  assert(
    'FarmContext.jsx exports COMMISSION_RATES with LEVEL_1 = 0.02 and LEVEL_2 = 0.01',
    contextCode.includes('export const COMMISSION_RATES = {') &&
    contextCode.includes('LEVEL_1: 0.02') &&
    contextCode.includes('LEVEL_2: 0.01')
  );
  assert(
    'FarmContext.jsx initializes teamMembers as clean empty array in DEFAULT_INITIAL_STATE',
    contextCode.includes('teamMembers: []')
  );
  assert(
    'FarmContext.jsx registerDownline prevents case-insensitive duplicate registrations',
    contextCode.includes('m.username.toLowerCase() === cleanUsername.toLowerCase()')
  );
  assert(
    'FarmContext.jsx simulateDownlinePurchase strictly validates positive integer units',
    contextCode.includes('!Number.isInteger(qty) || qty <= 0')
  );
  assert(
    'FarmContext.jsx uses .toFixed(2) rounding for commission calculation',
    contextCode.includes('Number((purchaseCost * rate).toFixed(2))')
  );
  assert(
    'FarmContext.jsx uses .toFixed(2) rounding for wallet balance credit',
    contextCode.includes('Number((balance + commission).toFixed(2))')
  );
  assert(
    'FarmContext.jsx resetToFreshState restores clean teamMembers: [] and baseline balance',
    contextCode.includes('teamMembers: []') && contextCode.includes('balance: DEFAULT_INITIAL_STATE.balance')
  );

  // TeamPage AST Alignment
  assert(
    'TeamPage.jsx imports COMMISSION_RATES and ASSET_SPEC from FarmContext',
    teamPageCode.includes('import { useFarm, COMMISSION_RATES, ASSET_SPEC } from \'../context/FarmContext\';')
  );
  assert(
    'TeamPage.jsx implements 1-tap clipboard copy with fallback',
    teamPageCode.includes('navigator.clipboard.writeText') && teamPageCode.includes('document.execCommand')
  );
  assert(
    'TeamPage.jsx implements WhatsApp sharing action with pre-filled referral link',
    teamPageCode.includes('https://api.whatsapp.com/send?text=')
  );
  assert(
    'TeamPage.jsx renders Upliner Sponsor Card',
    teamPageCode.includes('Upliner Sponsor Details')
  );
  assert(
    'TeamPage.jsx provides Register Downline and Simulate Purchase tabs',
    teamPageCode.includes('REGISTER') && teamPageCode.includes('PURCHASE')
  );
  assert(
    'TeamPage.jsx includes 1-click Reset to Fresh State button with confirmation dialog',
    teamPageCode.includes('handleResetToFresh') && teamPageCode.includes('window.confirm')
  );

  // App Routing & Dashboard Integration
  assert(
    'src/App.jsx routes /team to TeamPage',
    appCode.includes("case '/team':") && appCode.includes('<TeamPage />')
  );
  assert(
    'src/App.jsx exports TeamPage component',
    appCode.includes('export { TeamPage };')
  );
  assert(
    'src/components/AppNavigation.jsx drawer includes link to /team',
    navCode.includes('href="#/team"') && navCode.includes('handleNav(\'/team\')')
  );
  assert(
    'src/pages/DashboardPage.jsx Bento Tile 5 routes to /team with "Team" and "Network" labels',
    dashCode.includes("navigateTo('/team')") &&
    dashCode.includes('Team') &&
    dashCode.includes('Network')
  );

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  const duration = ((Date.now() - harnessStartTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(75));
  console.log('   ADVERSARIAL CHALLENGER STRESS HARNESS EXECUTION SUMMARY');
  console.log('='.repeat(75));
  console.log(` Total Assertions : ${totalAssertions}`);
  console.log(` Passed           : \x1b[32m${passedAssertions}\x1b[0m`);
  console.log(` Failed           : ${failedAssertions > 0 ? `\x1b[31m${failedAssertions}\x1b[0m` : '\x1b[90m0\x1b[0m'}`);
  console.log(` Duration         : ${duration}s`);
  console.log('='.repeat(75));

  if (failedAssertions === 0) {
    console.log(`\n\x1b[1m\x1b[42m\x1b[30m  ALL 5 SUITES PASSED  \x1b[0m \x1b[32mZero vulnerabilities or math precision defects found!\x1b[0m\n`);
    return true;
  } else {
    console.log(`\n\x1b[1m\x1b[41m\x1b[37m  FAILURES DETECTED  \x1b[0m \x1b[31m${failedAssertions} assertion(s) failed!\x1b[0m\n`);
    return false;
  }
}

runAdversarialStressHarness().then(success => {
  if (!success) {
    process.exit(1);
  }
}).catch(err => {
  console.error('Unhandled fatal error in stress harness:', err);
  process.exit(1);
});
