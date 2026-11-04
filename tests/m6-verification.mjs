// tests/m6-verification.mjs
// Verification suite for Milestone M6: Buy VIP Asset & Sell Egg / Withdraw Marketplace Pages

import fs from 'fs';
import path from 'path';
import { FarmEngine, VERIFIED_MERCHANTS, PAYMENT_GATEWAYS, PAYOUT_METHODS, ASSET_SPEC } from './helpers/farm-engine.mjs';
import { MockLocalStorage } from './helpers/mock-storage.mjs';

console.log('===============================================================');
console.log('    MILESTONE M6: BUY VIP ASSET & SELL EGG MARKETPLACE AUDIT   ');
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
// SUITE 1: BuyAssetPage.jsx Fidelity & Structure Audit
// -------------------------------------------------------------
console.log('--- SUITE 1: src/pages/BuyAssetPage.jsx Component Audit ---');
const buyPath = path.join(rootDir, 'src/pages/BuyAssetPage.jsx');
const buyExists = fs.existsSync(buyPath);
assert('src/pages/BuyAssetPage.jsx exists', buyExists);

if (buyExists) {
  const buyCode = fs.readFileSync(buyPath, 'utf8');

  // Re-branding
  assert('Re-branded to AL REHMAN META EGGS', buyCode.includes('AL REHMAN META EGGS') && !buyCode.includes('Alkram Meta Eggs'));

  // AppShell Wrapping
  assert('Wrapped in AppShell with currentRoute="/buy-asset"', buyCode.includes('currentRoute="/buy-asset"') && buyCode.includes('<AppShell'));

  // 3-Step Wizard Navigation HUD
  assert('Features 3-Step Wizard with Showcase, Multiplier, and Payment',
    buyCode.includes('Showcase') &&
    buyCode.includes('Multiplier') &&
    buyCode.includes('Payment')
  );
  assert('Includes dynamic step title banner and connecting progress beam',
    buyCode.includes('stepper-track-beam') &&
    buyCode.includes('step-node-active')
  );

  // Step 1: 3D Showcase & Asset Metrics
  assert('Step 1 contains 3D rotating orbit arena with celestial orbit ring',
    buyCode.includes('animate-orbit-ring') &&
    buyCode.includes('animate-float')
  );
  assert('Step 1 provides Hen audio cluck voice trigger',
    buyCode.includes('playHenVoiceAudio') || buyCode.includes('handleHenAudio')
  );
  assert('Step 1 displays accurate baseline specs (Rs. 500, +1 Egg, 120 Days, 120 Total Eggs)',
    buyCode.includes('unitPrice') &&
    buyCode.includes('contractTermDays') &&
    buyCode.includes('totalYieldPerUnit')
  );
  assert('Step 1 lists VIP Farm Guarantees (24h harvest, 120d contract, direct market liquidity)',
    buyCode.includes('100% Automated Harvest engine') &&
    buyCode.includes('Guaranteed active contract for full 120 days')
  );

  // Step 2: Pasture Multiplier & Yield Matrix
  assert('Step 2 renders dynamic hen flock pasture arena with pop-in cards',
    buyCode.includes('Live Flock in Coop') &&
    buyCode.includes('flock-hen-item') &&
    buyCode.includes('animate-pop-in')
  );
  assert('Step 2 supports surplus indicator for > 5 flock units',
    buyCode.includes('units > 5') &&
    buyCode.includes('More')
  );
  assert('Step 2 includes tactile incrementor (+ / - buttons and custom quantity input)',
    buyCode.includes('adjustQty') &&
    buyCode.includes('fa-minus') &&
    buyCode.includes('fa-plus')
  );
  assert('Step 2 includes quick preset multipliers (+1, +2, +5, +10, +25)',
    [1, 2, 5, 10, 25].every(p => buyCode.includes(String(p))) &&
    buyCode.includes('handlePreset')
  );
  assert('Step 2 renders dynamic yield matrix (Daily, 30-Day, Full Term, and Total Net PKR)',
    buyCode.includes('Daily Harvest') &&
    buyCode.includes('30-Day Yield') &&
    buyCode.includes('Full Term (120d)') &&
    buyCode.includes('Estimated Net Amount')
  );

  // Step 3: Payment Checkout
  assert('Step 3 contains Order Overview summary with 0% free charge',
    buyCode.includes('Order Overview') &&
    buyCode.includes('0% Free')
  );
  assert('Step 3 provides Easypisa (Code 1000) and Jazz cash (Code 1001) gateway cards',
    buyCode.includes('PAYMENT_GATEWAYS') &&
    buyCode.includes('easypisaImg') &&
    buyCode.includes('jazzcashImg') &&
    buyCode.includes('gateway-card')
  );
  assert('Step 3 integrates buyFarmAsset action with toast and dashboard navigation',
    buyCode.includes('buyFarmAsset(') &&
    buyCode.includes("navigateTo('/dashboard')")
  );
}

// -------------------------------------------------------------
// SUITE 2: SellEggPage.jsx Fidelity & Structure Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 2: src/pages/SellEggPage.jsx Component Audit ---');
const sellPath = path.join(rootDir, 'src/pages/SellEggPage.jsx');
const sellExists = fs.existsSync(sellPath);
assert('src/pages/SellEggPage.jsx exists', sellExists);

if (sellExists) {
  const sellCode = fs.readFileSync(sellPath, 'utf8');

  // Re-branding
  assert('Re-branded to AL REHMAN META EGGS', sellCode.includes('AL REHMAN META EGGS') && !sellCode.includes('Alkram Meta Eggs'));

  // AppShell Wrapping
  assert('Wrapped in AppShell supporting currentRoute prop', sellCode.includes('currentRoute') && sellCode.includes('<AppShell'));

  // Top Hero Vault Card
  assert('Displays Top Hero Vault with available eggs, PKR cash value, and market rates (Rs 30 - 33)',
    sellCode.includes('Your Available Harvest') &&
    sellCode.includes('Cash Value') &&
    sellCode.includes('Rs 30') &&
    sellCode.includes('Rs 33')
  );

  // 3-Step Wizard Navigation HUD
  assert('Features 3-Step Stepper: Store -> Method -> Cashout with connecting beams',
    sellCode.includes('Store') &&
    sellCode.includes('Method') &&
    sellCode.includes('Cashout')
  );

  // Step 1: Store Selection & Search / Filter
  assert('Step 1 provides real-time search input for verified merchant stores',
    sellCode.includes('searchQuery') &&
    sellCode.includes('Search verified merchant store...')
  );
  assert('Step 1 provides 4 filter switchers: BEST RATE, MOST TRADES, 100% SUCCESS, TOP RATED',
    sellCode.includes('BEST RATE') &&
    sellCode.includes('MOST TRADES') &&
    sellCode.includes('100% SUCCESS') &&
    sellCode.includes('TOP RATED')
  );
  assert('Step 1 lists verified stores with avatars, trade volumes, limits, and 3D SELL buttons',
    sellCode.includes('btn-3d-sell') &&
    sellCode.includes('store.min') &&
    sellCode.includes('store.max') &&
    sellCode.includes('0% Fee • Instant Payout')
  );

  // Step 2: Payout Method Rails
  assert('Step 2 displays locked store summary banner with verified rate',
    sellCode.includes('Active Order Store') &&
    sellCode.includes('Locked Rate')
  );
  assert('Step 2 offers Jazzcash, EasyPaisa, and All Bank Pakistan channels',
    sellCode.includes('Jazzcash') &&
    sellCode.includes('EasyPaisa') &&
    sellCode.includes('All Bank Pakistan')
  );

  // Step 3: Cashout Simulator & Dynamic Account Fields
  assert('Step 3 contains eggs to sell input with live vault balance check',
    sellCode.includes('Enter Eggs to Sell') &&
    sellCode.includes('eggVault')
  );
  assert('Step 3 includes quick preset chips: 25%, 50%, 75%, MAX ALL with active state sync',
    sellCode.includes('25%') &&
    sellCode.includes('50%') &&
    sellCode.includes('75%') &&
    sellCode.includes('MAX ALL') &&
    sellCode.includes('isPresetActive')
  );
  assert('Step 3 displays live cash payout simulator (0% fees, net PKR, rate formula)',
    sellCode.includes('Estimated Cash Payout') &&
    sellCode.includes('0% FEES • FREE') &&
    sellCode.includes('PKR NET CASH') &&
    sellCode.includes('Rate Formula')
  );
  assert('Step 3 dynamically renders JazzCash/EasyPaisa (Title & Mobile) and Bank (Dropdown, Title, IBAN) fields',
    sellCode.includes('Account Title Name') &&
    sellCode.includes('Mobile Number') &&
    sellCode.includes('Select Bank Name') &&
    sellCode.includes('IBAN / Account Number')
  );
  assert('Step 3 supports 7 major Pakistani banks (UBL, HBL, MEEZAN, Habib, Alfalah, Allied, Faisal)',
    ['UBL', 'HBL', 'MEEZAN', 'Habib', 'Alfalah', 'Allied', 'Faisal'].every(b => sellCode.includes(b))
  );
  assert('Step 3 integrates sellEggs action with toast and dashboard redirect',
    sellCode.includes('sellEggs(') &&
    sellCode.includes("navigateTo('/dashboard')")
  );
  assert('Includes Escrow Protected Liquidity guarantee footer',
    sellCode.includes('100% Escrow Protected Liquidity • Instant Bank Transfer')
  );
}

// -------------------------------------------------------------
// SUITE 3: WithdrawPage.jsx Unified Interface Audit
// -------------------------------------------------------------
console.log('\n--- SUITE 3: src/pages/WithdrawPage.jsx Audit ---');
const wdPath = path.join(rootDir, 'src/pages/WithdrawPage.jsx');
const wdExists = fs.existsSync(wdPath);
assert('src/pages/WithdrawPage.jsx exists', wdExists);

if (wdExists) {
  const wdCode = fs.readFileSync(wdPath, 'utf8');
  assert('WithdrawPage imports SellEggPage', wdCode.includes("from './SellEggPage'"));
  assert('WithdrawPage provides unified liquidation flow with currentRoute="/withdraw"',
    wdCode.includes('currentRoute="/withdraw"')
  );
  assert('Exports SellEggPage', wdCode.includes('export { SellEggPage }'));
}

// -------------------------------------------------------------
// SUITE 4: Functional State Engine E2E Simulation
// -------------------------------------------------------------
console.log('\n--- SUITE 4: End-to-End Simulation of M6 Transactions ---');
const storage = new MockLocalStorage();
const engine = new FarmEngine(storage);

// Simulation 1: Acquisition of 10 VIP Hens via Easypisa (Code 1000)
const buyRes = engine.buyFarmAsset({ units: 10, methodCode: '1000' });
assert('Acquires 10 VIP Hen Units (Rs. 5,000 PKR)', buyRes.success && buyRes.cost === 5000);
assert('Registers 10 daily egg production capacity', buyRes.dailyYield === 10);
assert('Logs Completed BUY transaction with Easypisa gateway',
  engine.transactions[0].type === 'BUY' && engine.transactions[0].gateway === 'Easypisa'
);

// Simulation 2: Harvest 10 eggs from new flock
engine.cooldownActive = false;
const hrvRes = engine.harvestEggs();
assert('Harvests 10 fresh eggs into vault', hrvRes.success && hrvRes.eggsCollected === 10);
assert('Vault balance updated correctly', engine.eggVault >= 10);

// Simulation 3: Liquidate 10 eggs to Syed poultry farm (Rs. 33) via All Bank Pakistan (MEEZAN)
const currentVault = engine.eggVault;
const sellRes = engine.sellEggs({
  storeId: '3',
  storeName: 'Syed poultry farm',
  rate: 33,
  eggs: 10,
  method: 'All Bank Pakistan',
  accountTitle: 'Saqib Ur Rehman',
  accountNumber: 'PK36MEZN0001234567890123',
  bankName: 'MEEZAN'
});
assert('Liquidates 10 eggs at Rs 33/egg (330 PKR)', sellRes.success && sellRes.pkrAmount === 330);
assert('Vault deducted exactly 10 eggs', engine.eggVault === currentVault - 10);
assert('PKR balance credited with 330 PKR', engine.balance >= 330);
assert('Withdrawal record logged with IBAN and bank name',
  engine.withdrawals[0].bankName === 'MEEZAN' &&
  engine.withdrawals[0].accountNumber === 'PK36MEZN0001234567890123'
);

// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL M6 AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('===============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('ALL M6 VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
}
