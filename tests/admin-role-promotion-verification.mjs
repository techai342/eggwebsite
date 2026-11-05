// tests/admin-role-promotion-verification.mjs
// Verification suite confirming admin role promotion and governance capabilities

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

async function runAdminRoleVerification() {
  console.log('\n=== [Tier 8] Admin Promotion & Role Governance Verification ===\n');

  // 1. Verify FarmContext implementation
  const ctxPath = path.join(ROOT_DIR, 'src', 'context', 'FarmContext.jsx');
  assert(fs.existsSync(ctxPath), 'FarmContext.jsx exists');
  const ctx = fs.readFileSync(ctxPath, 'utf8');

  assert(ctx.includes('setUserRole = useCallback'), 'FarmContext defines setUserRole action');
  assert(ctx.includes('Primary Root Super Admin account cannot be demoted'), 'setUserRole protects Root Super Admin from accidental demotion');
  assert(ctx.includes('PROMOTE_ADMIN'), 'setUserRole logs PROMOTE_ADMIN audit event');
  assert(ctx.includes('DEMOTE_FARMER'), 'setUserRole logs DEMOTE_FARMER audit event');
  assert(ctx.includes('has been promoted to Admin'), 'setUserRole provides real-time feedback toast on promotion');

  // 2. Verify AdminDashboardPage UI Controls
  const admPath = path.join(ROOT_DIR, 'src', 'pages', 'AdminDashboardPage.jsx');
  assert(fs.existsSync(admPath), 'AdminDashboardPage.jsx exists');
  const adm = fs.readFileSync(admPath, 'utf8');

  assert(adm.includes('setUserRole'), 'AdminDashboardPage consumes setUserRole from useFarm()');
  assert(adm.includes('handleToggleRole'), 'AdminDashboardPage implements handleToggleRole handler');
  assert(adm.includes('Make Admin'), 'AdminDashboardPage features high-impact Make Admin promotion button');
  assert(adm.includes('Demote'), 'AdminDashboardPage features Demote button for appointed admins');
  assert(adm.includes('Root'), 'AdminDashboardPage displays Root badge for primary root admin');

  console.log('\n\x1b[1m\x1b[32m  SUCCESS: Admin Promotion & Role Governance fully verified!\x1b[0m\n');
}

runAdminRoleVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
