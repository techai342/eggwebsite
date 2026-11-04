// tests/m2-verification.mjs
// Verification suite for Milestone M2: Shared State Management & Asset Pipeline

import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('       MILESTONE M2: STATE MANAGEMENT & ASSETS AUDIT          ');
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

// 1. Gateway Assets Audit in src/assets and public/assets
console.log('--- SUITE 1: Gateway Assets Pipeline ---');
const requiredAssets = [
  { relPath: 'src/assets/easypisa.png', minSize: 5000 },
  { relPath: 'src/assets/jazzcash.png', minSize: 10000 },
  { relPath: 'src/assets/bank.jpg', minSize: 10000 },
  { relPath: 'public/assets/easypisa.png', minSize: 5000 },
  { relPath: 'public/assets/jazzcash.png', minSize: 10000 },
  { relPath: 'public/assets/bank.jpg', minSize: 10000 },
];

requiredAssets.forEach(({ relPath, minSize }) => {
  const fullPath = path.join(rootDir, relPath);
  const exists = fs.existsSync(fullPath);
  const size = exists ? fs.statSync(fullPath).size : 0;
  assert(`Asset ${relPath} exists and has valid size (>= ${minSize} bytes)`, exists && size >= minSize, `Actual size: ${size} bytes`);
});

// 2. FarmContext.jsx Code & Interface Contracts Audit
console.log('\n--- SUITE 2: FarmContext.jsx Interface Contract Audit ---');
const contextPath = path.join(rootDir, 'src/context/FarmContext.jsx');
const contextExists = fs.existsSync(contextPath);
assert('FarmContext.jsx exists in src/context/', contextExists);

if (contextExists) {
  const content = fs.readFileSync(contextPath, 'utf8');

  // Exports
  assert('Exports FarmProvider component', content.includes('export function FarmProvider'));
  assert('Exports useFarm custom hook', content.includes('export function useFarm'));
  assert('Exports FarmContext', content.includes('export const FarmContext'));
  assert('Exports VERIFIED_MERCHANTS catalog', content.includes('export const VERIFIED_MERCHANTS'));
  assert('Exports PAYMENT_GATEWAYS catalog', content.includes('export const PAYMENT_GATEWAYS'));
  assert('Exports PAYOUT_METHODS catalog', content.includes('export const PAYOUT_METHODS'));
  assert('Exports ASSET_SPEC', content.includes('export const ASSET_SPEC'));

  // LocalStorage Persistence Keys
  assert('Persists to alrehman_meta_eggs_state', content.includes('alrehman_meta_eggs_state'));
  assert('Persists to alrehman_farm_data', content.includes('alrehman_farm_data'));

  // Core Methods
  assert('Implements login method', content.includes('login ='));
  assert('Implements logout method', content.includes('logout ='));
  assert('Implements changePassword method', content.includes('changePassword ='));
  assert('Implements buyFarmAsset method', content.includes('buyFarmAsset ='));
  assert('Implements harvestEggs method', content.includes('harvestEggs ='));
  assert('Implements sellEggs method', content.includes('sellEggs ='));
  assert('Implements showToast method', content.includes('showToast ='));
  assert('Implements removeToast method', content.includes('removeToast ='));

  // Default seed values
  assert('Seeds Account ID #1197', content.includes('#1197'));
  assert('Seeds username mrsaqib242', content.includes('mrsaqib242'));
  assert('Seeds balance 1500', content.includes('1500'));
  assert('Seeds egg vault count 18', content.includes('18'));
  assert('Seeds activeAssets with AL Rehman Meta Eggs', content.includes('AL Rehman Meta Eggs'));
}

// 3. ToastContainer.jsx Audit
console.log('\n--- SUITE 3: ToastContainer.jsx Component Audit ---');
const toastPath = path.join(rootDir, 'src/components/ToastContainer.jsx');
const toastExists = fs.existsSync(toastPath);
assert('ToastContainer.jsx exists in src/components/', toastExists);

if (toastExists) {
  const content = fs.readFileSync(toastPath, 'utf8');
  assert('ToastContainer is default export', content.includes('export default function ToastContainer'));
  assert('Supports success, error, warning toast types', content.includes('success') && content.includes('error') && content.includes('warning'));
  assert('Uses accessible alert role', content.includes('role="alert"'));
  assert('Includes dismiss button', content.includes('fa-xmark'));
}

// 4. Main App Integration Audit
console.log('\n--- SUITE 4: Root Application Context Wiring ---');
const mainPath = path.join(rootDir, 'src/main.jsx');
const mainContent = fs.readFileSync(mainPath, 'utf8');
assert('main.jsx imports FarmProvider', mainContent.includes("from './context/FarmContext'"));
assert('main.jsx wraps App inside FarmProvider', mainContent.includes('<FarmProvider>'));

// -------------------------------------------------------------
console.log('\n===============================================================');
console.log(`TOTAL M2 AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('===============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('ALL M2 VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
}
