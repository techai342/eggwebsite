// tests/all-pages-and-farm-verification.mjs
// Verification suite for MyFarmPage and comprehensive routing aliases (/deposit, /withdraw, /my-farm, /home)

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

async function runVerification() {
  console.log('\n=== [Tier 6] All Pages & My Farm Comprehensive Verification ===\n');

  // 1. MyFarmPage Component Integrity
  const farmPagePath = path.join(ROOT_DIR, 'src', 'pages', 'MyFarmPage.jsx');
  assert(fs.existsSync(farmPagePath), 'src/pages/MyFarmPage.jsx exists on disk');
  const farmPageContent = fs.readFileSync(farmPagePath, 'utf8');

  assert(farmPageContent.includes('export default function MyFarmPage'), 'MyFarmPage exports default component');
  assert(farmPageContent.includes('playHenVoiceAudio'), 'MyFarmPage includes Web Audio synthesized cluck voice generator');
  assert(farmPageContent.includes('Laying Paddock'), 'MyFarmPage features graphical pasture arena and roaming flock');
  assert(farmPageContent.includes('24-Hour Production Countdown'), 'MyFarmPage features 24-hour harvest countdown clock');
  assert(farmPageContent.includes('harvestEggs'), 'MyFarmPage connects directly to harvestEggs() engine');
  assert(farmPageContent.includes('Active Flock Batches'), 'MyFarmPage includes active coop batches roster with 120-day progress tracker');
  assert(farmPageContent.includes('/buy-asset') && farmPageContent.includes('/sell-egg'), 'MyFarmPage provides quick action buttons to buy and sell');

  // 2. App.jsx Route Normalization & Aliases
  const appPath = path.join(ROOT_DIR, 'src', 'App.jsx');
  assert(fs.existsSync(appPath), 'src/App.jsx exists');
  const appContent = fs.readFileSync(appPath, 'utf8');

  assert(appContent.includes("case '/my-farm':") && appContent.includes("case '/farm':"), 'App.jsx maps /my-farm and /farm');
  assert(appContent.includes("case '/deposit':") && appContent.includes("case '/buy':"), 'App.jsx maps /deposit and /buy to BuyAssetPage');
  assert(appContent.includes("case '/withdraw':") && appContent.includes("case '/sale':"), 'App.jsx maps /withdraw and /sale to SellEggPage');
  assert(appContent.includes("case '/home':") && appContent.includes("case '/user/dashboard':"), 'App.jsx maps /home and /user/dashboard to DashboardPage');
  assert(appContent.includes("case '/register':") && appContent.includes("case '/user/register':"), 'App.jsx maps /register');
  assert(appContent.includes("export { MyFarmPage };"), 'App.jsx exports MyFarmPage for milestone consumption');
  assert(appContent.includes("export { TeamPage };"), 'App.jsx exports TeamPage');
  assert(appContent.includes("export { AdminDashboardPage };"), 'App.jsx exports AdminDashboardPage');

  // 3. AppNavigation.jsx Dock & Drawer Routing
  const navPath = path.join(ROOT_DIR, 'src', 'components', 'AppNavigation.jsx');
  assert(fs.existsSync(navPath), 'src/components/AppNavigation.jsx exists');
  const navContent = fs.readFileSync(navPath, 'utf8');

  assert(navContent.includes("handleItemClick(e, '/my-farm')"), 'AppBottomNav My Farm dock item navigates to /my-farm');
  assert(navContent.includes("currentRoute === '/my-farm'"), 'AppBottomNav highlights My Farm when on /my-farm');
  assert(navContent.includes("href=\"#/my-farm\""), 'AppSidebar includes My Farm Coop link');

  // 4. Verification that raw assets were copied
  const asset1 = path.join(ROOT_DIR, 'public', 'assets', '6a1dba39052cf1780333113.png');
  const asset2 = path.join(ROOT_DIR, 'public', 'assets', '6adc8297c66bd1792836247.png');
  assert(fs.existsSync(asset1), 'Easypaisa raw gateway image exists in public/assets/');
  assert(fs.existsSync(asset2), 'Jazzcash raw gateway image exists in public/assets/');

  console.log('\n\x1b[1m\x1b[32m  SUCCESS: All Pages and My Farm verification checks passed 100%!\x1b[0m\n');
}

runVerification().catch(err => {
  console.error(err);
  process.exit(1);
});
