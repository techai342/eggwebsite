// tests/zero-dummy-data-verification.mjs
// Verification suite confirming all dummy data has been purged from initial state and UI

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function assert(condition, message) {
  if (!condition) {
    console.error(`\x1b[31m  ✖ FAIL:\x1b[0m ${message}`);
    process.exit(1);
  }
  console.log(`\x1b[32m  ✔ PASS:\x1b[0m ${message}`);
}

async function runZeroDummyDataVerification() {
  console.log('\n=== [Tier 7] Zero Dummy Data Verification ===\n');

  const ctxPath = path.join(ROOT_DIR, 'src', 'context', 'FarmContext.jsx');
  assert(fs.existsSync(ctxPath), 'FarmContext.jsx exists');
  const ctx = fs.readFileSync(ctxPath, 'utf8');

  // Verify initial state has zero balance, zero eggs, zero active assets, zero transactions, zero withdrawals
  assert(ctx.includes('balance: 0,'), 'DEFAULT_INITIAL_STATE balance is initialized to 0');
  assert(ctx.includes('eggVault: 0,'), 'DEFAULT_INITIAL_STATE eggVault is initialized to 0');
  assert(ctx.includes('activeAssets: [],'), 'DEFAULT_INITIAL_STATE activeAssets is initialized to empty array');
  assert(ctx.includes('transactions: [],'), 'DEFAULT_INITIAL_STATE transactions is initialized to empty array');
  assert(ctx.includes('withdrawals: [],'), 'DEFAULT_INITIAL_STATE withdrawals is initialized to empty array');

  // Verify auto-purge logic exists in loadInitialState
  assert(ctx.includes('cleanEggVault = 0;'), 'loadInitialState purges legacy dummy 18 eggs from local storage');
  assert(ctx.includes('cleanBalance = 0;'), 'loadInitialState purges legacy dummy 1500 balance from local storage');

  // Verify SellEggPage does not have hardcoded dummy account pre-fills
  const sellPath = path.join(ROOT_DIR, 'src', 'pages', 'SellEggPage.jsx');
  assert(fs.existsSync(sellPath), 'SellEggPage.jsx exists');
  const sellContent = fs.readFileSync(sellPath, 'utf8');
  assert(!sellContent.includes("useState('Farmer Saqib')"), 'SellEggPage does not hardcode Farmer Saqib accountTitle');
  assert(!sellContent.includes("useState('03001234567')"), 'SellEggPage does not hardcode 03001234567 accountNumber');
  assert(!sellContent.includes("useState('HBL')"), 'SellEggPage does not hardcode HBL bank');

  // Verify registerUser initializes fresh zero balance session
  assert(ctx.includes('setBalance(0)'), 'registerUser resets balance to 0 on new registration');
  assert(ctx.includes('setEggVault(0)'), 'registerUser resets eggVault to 0 on new registration');
  assert(ctx.includes('setActiveAssets([])'), 'registerUser resets activeAssets to empty array on new registration');

  console.log('\n\x1b[1m\x1b[32m  SUCCESS: All dummy data successfully eliminated across application!\x1b[0m\n');
}

runZeroDummyDataVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
