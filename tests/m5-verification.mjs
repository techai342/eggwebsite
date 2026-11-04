// tests/m5-verification.mjs
// Verification suite for Milestone M5: User Dashboard & Production Engine

import fs from 'fs';
import path from 'path';

console.log('===============================================================');
console.log('   MILESTONE M5: USER DASHBOARD & PRODUCTION ENGINE AUDIT      ');
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
const dashboardPath = path.join(rootDir, 'src/pages/DashboardPage.jsx');
const dashboardExists = fs.existsSync(dashboardPath);

assert('DashboardPage.jsx exists in src/pages/', dashboardExists);

if (dashboardExists) {
  const code = fs.readFileSync(dashboardPath, 'utf8');

  // SUITE 1: Structure & Context Integration
  console.log('--- SUITE 1: Component Structure & State Integration ---');
  assert('DashboardPage has substantial size (> 10KB)', code.length > 10000, `Actual: ${code.length} bytes`);
  assert('Imports and uses useFarm from FarmContext', code.includes("useFarm") && code.includes("from '../context/FarmContext'"));
  assert('Wraps layout in AppShell with currentRoute="/dashboard"', code.includes('<AppShell') && code.includes('currentRoute="/dashboard"'));
  assert('Imports essential assets (henImg, logoImg, eggImg)', code.includes('henImg') && code.includes('logoImg') && code.includes('eggImg'));
  assert('Binds user, balance, eggVault, activeAssets from useFarm',
    code.includes('user') &&
    code.includes('balance') &&
    code.includes('eggVault') &&
    code.includes('activeAssets')
  );
  assert('Integrates harvestEggs and resetCooldown methods', code.includes('harvestEggs') && code.includes('resetCooldown'));
  assert('Integrates VERIFIED_MERCHANTS from context', code.includes('VERIFIED_MERCHANTS'));

  // SUITE 2: Canopy Header & Earnings Vault
  console.log('\n--- SUITE 2: Signature Canopy Header & Earnings Vault ---');
  assert('Farmer profile shows user icon (fa-user-circle) & verified badge', code.includes('fa-user-circle') && code.includes('fa-circle-check'));
  assert('Displays Welcome, Farmer greeting', code.includes('Welcome, Farmer'));
  assert('Displays username fallback mrsaqib242', code.includes('mrsaqib242'));
  assert('Displays Account ID #1197 fallback', code.includes('#1197'));
  assert('Displays 100% SECURE security badge', code.includes('100% SECURE'));
  assert('Earnings Vault displays Instant Sellable Poultry Eggs', code.includes('Instant Sellable Poultry Eggs'));
  assert('Earnings Vault calculates live PKR value (eggVault * 30)', code.includes('eggVault') && (code.includes('* 30') || code.includes('* 32')));
  assert('Provides quick BUY Hens action pill linking to /buy-asset', code.includes("navigateTo('/buy-asset')") && code.includes('BUY Hens'));
  assert('Provides quick SELL Eggs action pill linking to /sell-egg', code.includes("navigateTo('/sell-egg')") && code.includes('SELL Eggs'));

  // SUITE 3: Live Notice Marquee Ticker
  console.log('\n--- SUITE 3: Live Notice Marquee Ticker ---');
  assert('Notice marquee element exists with bullhorn icon', code.includes('<marquee') && code.includes('fa-bullhorn'));
  assert('Marquee announces AL Rehman Meta Eggs yield & P2P system',
    code.includes('Welcome to AL Rehman Meta Eggs') &&
    code.includes('Invest in Premium Hens') &&
    code.includes('Secure P2P Trading System')
  );
  assert('Includes Official App Download strip (5 MB APK)', code.includes('Official App Download') && code.includes('5 MB'));

  // SUITE 4: Dynamic Farm Production & Live Orbit Harvest Nexus
  console.log('\n--- SUITE 4: Farm Production & Orbit Harvest Nexus ---');
  assert('Includes traveling border patrol egg node (box-border-patrol)', code.includes('box-border-patrol') && code.includes('borderPatrolLoop'));
  assert('Status beacon features animated equalizer bars (liveEqualizerBar)', code.includes('liveEqualizerBar'));
  assert('Displays My Egg Vault and daily Production Rate (+Egg/day)', code.includes('My Egg Vault') && code.includes('Production Rate'));
  assert('Central Harvest Nexus includes concentric radar pulses (eco-radar-pulse)', code.includes('eco-radar-pulse'));
  assert('Central Harvest Nexus includes rotating dashed orbit (eco-orbit-track)', code.includes('eco-orbit-track'));
  assert('Orbit track features counter-rotating satellites (eco-satellite-counter)', code.includes('eco-satellite-counter'));
  assert('Central hub contains 3D hen mascot with breathing float (eco-animal-breath)', code.includes('eco-animal-breath'));
  assert('Contains BUY AL REHMAN META EGGS and SELL EGG action buttons',
    code.includes('BUY AL REHMAN META EGGS') &&
    code.includes('SELL EGG')
  );
  assert('Harvest button triggers harvestEggs and manages cooldown', code.includes('handleHarvestClick') && code.includes('harvestEggs'));

  // SUITE 5: Farm Overview Live Analytics Grid
  console.log('\n--- SUITE 5: Farm Overview Live Analytics Grid ---');
  assert('Contains 4 metric cards: Bought Units, Egg Sale, Total Buy, Total Sales',
    code.includes('Total Hens Bought') &&
    code.includes('Total Egg Sale') &&
    code.includes('TOTAL BUY') &&
    code.includes('TOTAL SALES')
  );
  assert('Connects to analytics state (totalBuyVolumePkr, totalSalesPkr)',
    code.includes('totalBuyVolumePkr') &&
    code.includes('totalSalesPkr')
  );

  // SUITE 6: 6-Tile Bento Quick Menu
  console.log('\n--- SUITE 6: 6-Tile Bento Quick Menu ---');
  assert('Tile 1: Product Reward (Prizes & Gifts)', code.includes('Product Reward') && code.includes('Prizes & Gifts'));
  assert('Tile 2: Rewards (Team Rewards)', code.includes('Rewards') && code.includes('Team Rewards'));
  assert('Tile 3: All History (Buy • Sale • Trx)', code.includes('All History') && code.includes('Buy • Sale • Trx'));
  assert('Tile 4: My Farm (Active Units)', code.includes('My Farm') && code.includes('Active Units'));
  assert('Tile 5: Team (Network)', code.includes('Team') && code.includes('Network'));
  assert('Tile 6: Password (Change Pin) navigating to /change-password', code.includes('Password') && code.includes("navigateTo('/change-password')"));

  // SUITE 7: VIP Referral & Squad Hub
  console.log('\n--- SUITE 7: VIP Referral & Squad Hub ---');
  assert('Features rotating conic laser beam wrapper (vip-conic-wrapper, vip-conic-beam)',
    code.includes('vip-conic-wrapper') &&
    code.includes('vip-conic-beam')
  );
  assert('Displays Farmer Invite Code (mrsaqib242)', code.includes('Farmer Invite Code') && code.includes('mrsaqib242'));
  assert('Provides 1-tap COPY button with clipboard integration', code.includes('handleCopyInvitationCode') && code.includes('COPY'));
  assert('Provides 1-tap WhatsApp Share button with wa.me link', code.includes('whatsappShareUrl') || code.includes('https://wa.me/'));
  assert('Displays Total Squad and Active Team telemetry hubs', code.includes('Total Squad') && code.includes('Active Team'));
  assert('Includes Squad Conversion Rate progress meter', code.includes('Squad Conversion Rate'));

  // SUITE 8: Interactive P2P Trade Theater
  console.log('\n--- SUITE 8: Interactive P2P Trade Theater ---');
  assert('Contains P2P stage wrapper (.p2p-stage-wrap)', code.includes('p2p-stage-wrap'));
  assert('Contains Member Cottage with chimney smoke animation', code.includes('p2p-cottage') && code.includes('p2p-chimney-smoke'));
  assert('Features animated SVG farmer actor stepping out with eggs', code.includes('p2p-member-actor') && code.includes('<svg'));
  assert('Features center marketplace trade counter with balance readout', code.includes('p2p-counter') && code.includes('p2p-counter-label'));
  assert('Simulates handover egg and cash banknotes', code.includes('p2p-handover-egg') && code.includes('p2p-handover-cash'));
  assert('Displays floating payout success banner', code.includes('p2p-payout-banner'));
  assert('Features Official Buyer Store with awning, sign, and SVG merchant actor',
    code.includes('p2p-shop') &&
    code.includes('p2p-shop-awning') &&
    code.includes('p2p-merchant-actor')
  );

  // SUITE 9: Top Verified Buyers Live Carousel
  console.log('\n--- SUITE 9: Top Verified Buyers Live Carousel ---');
  assert('Contains Sonica FORM STORE card with Rs 32 rate', code.includes('Sonica FORM STORE') && code.includes('32.00 Rs'));
  assert('Contains Usmaina Poltry Farm card with Rs 30 rate', code.includes('Usmaina Poltry Farm') && code.includes('30.00 Rs'));
  assert('Contains Syed poultry farm card with Rs 33 rate', code.includes('Syed poultry farm') && code.includes('33.00 Rs'));
  assert('Every buyer card has direct SELL NOW trigger navigating to /sell-egg',
    code.includes('SELL NOW') &&
    code.includes("navigateTo('/sell-egg')")
  );

  // SUITE 10: VIP Support & Community Desk
  console.log('\n--- SUITE 10: VIP Support & Community Desk ---');
  assert('Provides WhatsApp Live Chat direct button', code.includes('wa.me/+923237574209') || code.includes('Chat Now'));
  assert('Provides Call Helpline button with phone number (+923412017923)', code.includes('tel:+923412017923') || code.includes('+923412017923'));
  assert('Provides WhatsApp Group and Channel links', code.includes('https://whatsapp.com/channel/'));

  // SUITE 11: Modals
  console.log('\n--- SUITE 11: Interactive Modals ---');
  assert('Harvest Cooldown Modal with live countdown clock', code.includes('isCooldownModalOpen') && code.includes('remainingTimeStr'));
  assert('Cooldown Modal includes Simulate 24h Pass / Reset Cooldown test tool', code.includes('handleResetCooldownAndHarvest') || code.includes('resetCooldown'));
  assert('Harvest Celebration Modal with animated hen and eggs collected count', code.includes('isHarvestCelebrationOpen') && code.includes('harvestYieldAmount'));
  assert('All History Modal with tabbed filters (ALL, BUY, HARVEST, SELL)', code.includes('isHistoryModalOpen') && code.includes('filteredHistory'));
  assert('My Farm active flock modal with unit counts and term', code.includes('isMyFarmModalOpen'));
  assert('Official Community popup with join buttons', code.includes('isCommunityModalOpen'));
}

console.log('\n===============================================================');
console.log(`TOTAL M5 AUDIT CHECKS: ${totalChecks} | PASSED: ${passedChecks} | FAILED: ${failedChecks}`);
console.log('===============================================================\n');

if (failedChecks > 0) {
  process.exit(1);
} else {
  console.log('ALL M5 VERIFICATION CHECKS PASSED WITH 100% SUCCESS!\n');
}
