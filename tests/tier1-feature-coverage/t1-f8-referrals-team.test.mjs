// tests/tier1-feature-coverage/t1-f8-referrals-team.test.mjs
// Tier 1 - Feature Coverage: F8.1 - F8.7 Referrals, Team Hub, 2-Tier Commission Engine & Clean Reset

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from '../helpers/assertions.mjs';
import { MockLocalStorage } from '../helpers/mock-storage.mjs';
import { FarmEngine, COMMISSION_RATES, ASSET_SPEC } from '../helpers/farm-engine.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');

describe('Tier 1: F8.1 - Referral Code & Link Normalization', () => {
  it('TC-T1-F8.1-01: Referral code generation (mrsaqib242) and referral link URL structure (/#/team?ref=mrsaqib242)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Verify default referral code
    expect(engine.referralCode).toBe('mrsaqib242');
    expect(engine.user.referralCode).toBe('mrsaqib242');

    // Verify link structure conforms to /#/team?ref=mrsaqib242
    const link = engine.referralLink;
    expect(link).toContain('/#/team?ref=mrsaqib242');

    // Verify dynamic fallback if user referralCode is updated
    engine.user.referralCode = 'farmer_vip_007';
    expect(engine.referralCode).toBe('farmer_vip_007');
    expect(engine.referralLink).toContain('/#/team?ref=farmer_vip_007');
  });

  it('TC-T1-F8.1-02: Clean initial state verification (empty teamMembers: [], 0 total commissions earned, default seed balance)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Initial state must be pristine
    expect(Array.isArray(engine.teamMembers)).toBe(true);
    expect(engine.teamMembers.length).toBe(0);

    const stats = engine.referralStats;
    expect(stats.totalInvited).toBe(0);
    expect(stats.level1Count).toBe(0);
    expect(stats.level2Count).toBe(0);
    expect(stats.totalCommissionEarned).toBe(0);
    expect(stats.activeTeamCount).toBe(0);
    expect(stats.totalDownlineUnits).toBe(0);
    expect(stats.totalDownlineVolumePkr).toBe(0);

    // Verify resetToFreshState restores default seed baseline with empty teamMembers
    engine.resetToFreshState();
    expect(engine.teamMembers.length).toBe(0);
    expect(engine.balance).toBe(1500.00);
    expect(engine.eggVault).toBe(18);
    expect(engine.activeAssets.length).toBe(1);
    expect(engine.transactions.filter(t => t.type === 'COMMISSION').length).toBe(0);
    expect(engine.referralStats.totalCommissionEarned).toBe(0);
  });
});

describe('Tier 1: F8.2 - Downline Registration & Hierarchy Engine', () => {
  it('TC-T1-F8.2-01: Level 1 downline registration, initial 0 assets, direct upliner assignment', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    const regRes = engine.registerDownline({
      username: 'farmer_ahmed',
      tierLevel: 1
    });

    expect(regRes.success).toBe(true);
    expect(regRes.member.username).toBe('farmer_ahmed');
    expect(regRes.member.tierLevel).toBe(1);
    expect(regRes.member.upliner).toBe('mrsaqib242');
    expect(regRes.member.assetsPurchased).toBe(0);
    expect(regRes.member.totalSpentPkr).toBe(0);
    expect(regRes.member.commissionEarnedPkr).toBe(0);
    expect(regRes.member.id).toBeTruthy();
    expect(regRes.member.joinDate).toBeTruthy();

    expect(engine.teamMembers.length).toBe(1);
    const stats = engine.referralStats;
    expect(stats.totalInvited).toBe(1);
    expect(stats.level1Count).toBe(1);
    expect(stats.level2Count).toBe(0);
    expect(stats.activeTeamCount).toBe(0);
  });

  it('TC-T1-F8.2-02: Level 2 downline registration with designated secondary upliner', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Register Level 1 sponsor first
    engine.registerDownline({ username: 'farmer_ahmed', tierLevel: 1 });

    // Register Level 2 downline under farmer_ahmed
    const regResL2 = engine.registerDownline({
      username: 'farmer_bilal',
      tierLevel: 2,
      upliner: 'farmer_ahmed'
    });

    expect(regResL2.success).toBe(true);
    expect(regResL2.member.username).toBe('farmer_bilal');
    expect(regResL2.member.tierLevel).toBe(2);
    expect(regResL2.member.upliner).toBe('farmer_ahmed');
    expect(regResL2.member.assetsPurchased).toBe(0);
    expect(regResL2.member.totalSpentPkr).toBe(0);
    expect(regResL2.member.commissionEarnedPkr).toBe(0);

    // Register secondary Level 2 with omitted upliner (defaults to 'team_leader')
    const regResL2Default = engine.registerDownline({
      username: 'farmer_tariq',
      tierLevel: 2
    });
    expect(regResL2Default.success).toBe(true);
    expect(regResL2Default.member.upliner).toBe('team_leader');

    expect(engine.teamMembers.length).toBe(3);
    const stats = engine.referralStats;
    expect(stats.totalInvited).toBe(3);
    expect(stats.level1Count).toBe(1);
    expect(stats.level2Count).toBe(2);
  });

  it('TC-T1-F8.2-03: Rejection of duplicate downline usernames', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    engine.registerDownline({ username: 'farmer_ahmed', tierLevel: 1 });
    expect(engine.teamMembers.length).toBe(1);

    // Exact duplicate username
    const dupExact = engine.registerDownline({ username: 'farmer_ahmed', tierLevel: 1 });
    expect(dupExact.success).toBe(false);
    expect(dupExact.message).toContain('already registered');

    // Case-insensitive duplicate username
    const dupCase = engine.registerDownline({ username: 'FARMER_AHMED', tierLevel: 2 });
    expect(dupCase.success).toBe(false);
    expect(dupCase.message).toContain('already registered');

    // Empty username rejection
    const emptyName = engine.registerDownline({ username: '   ', tierLevel: 1 });
    expect(emptyName.success).toBe(false);
    expect(emptyName.message).toContain('username is required');

    // Verify team members collection remains untouched
    expect(engine.teamMembers.length).toBe(1);
  });
});

describe('Tier 1: F8.3 - 2-Tier Commission Engine & Multi-Purchase Aggregation', () => {
  it('TC-T1-F8.3-01: Level 1 downline hen purchase of 1 unit (500 PKR) credits exactly 2.00% (10.00 PKR) to upliner balance', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.balance = 1000.00;

    engine.registerDownline({ username: 'farmer_ahmed', tierLevel: 1 });
    expect(COMMISSION_RATES.LEVEL_1).toBe(0.02);

    const initialBalance = engine.balance;
    const purchaseRes = engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: 1 });

    expect(purchaseRes.success).toBe(true);
    // 1 unit * 500 PKR * 0.02 = 10.00 PKR
    expect(purchaseRes.commission).toBe(10.00);
    expect(purchaseRes.newBalance).toBe(1010.00);
    expect(engine.balance).toBe(1010.00);

    // Verify member record updates
    const member = engine.teamMembers.find(m => m.username === 'farmer_ahmed');
    expect(member.assetsPurchased).toBe(1);
    expect(member.totalSpentPkr).toBe(500);
    expect(member.commissionEarnedPkr).toBe(10.00);

    // Verify transaction ledger
    const trx = engine.transactions[0];
    expect(trx.type).toBe('COMMISSION');
    expect(trx.amount).toBe(10.00);
    expect(trx.unit).toBe('PKR');
    expect(trx.status).toBe('Completed');
    expect(trx.metadata.tierLevel).toBe(1);
    expect(trx.metadata.unitsPurchased).toBe(1);
    expect(trx.metadata.purchaseVolumePkr).toBe(500);
    expect(trx.metadata.rate).toBe(0.02);
  });

  it('TC-T1-F8.3-02: Level 2 downline hen purchase of 2 units (1,000 PKR) credits exactly 1.00% (10.00 PKR) to upliner balance', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.balance = 2000.00;

    engine.registerDownline({ username: 'farmer_bilal', tierLevel: 2, upliner: 'farmer_ahmed' });
    expect(COMMISSION_RATES.LEVEL_2).toBe(0.01);

    const initialBalance = engine.balance;
    const purchaseRes = engine.simulateDownlinePurchase({ username: 'farmer_bilal', units: 2 });

    expect(purchaseRes.success).toBe(true);
    // 2 units * 500 PKR = 1000 PKR * 0.01 = 10.00 PKR
    expect(purchaseRes.commission).toBe(10.00);
    expect(purchaseRes.newBalance).toBe(2010.00);
    expect(engine.balance).toBe(2010.00);

    // Verify member record updates
    const member = engine.teamMembers.find(m => m.username === 'farmer_bilal');
    expect(member.assetsPurchased).toBe(2);
    expect(member.totalSpentPkr).toBe(1000);
    expect(member.commissionEarnedPkr).toBe(10.00);

    // Verify transaction ledger
    const trx = engine.transactions[0];
    expect(trx.type).toBe('COMMISSION');
    expect(trx.amount).toBe(10.00);
    expect(trx.unit).toBe('PKR');
    expect(trx.status).toBe('Completed');
    expect(trx.metadata.tierLevel).toBe(2);
    expect(trx.metadata.unitsPurchased).toBe(2);
    expect(trx.metadata.purchaseVolumePkr).toBe(1000);
    expect(trx.metadata.rate).toBe(0.01);
  });

  it('TC-T1-F8.3-03: Multi-purchase aggregation: updates member assetsPurchased, totalSpentPkr, commissionEarnedPkr, referralStats aggregator, and appends COMMISSION type entry in transactions ledger', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);
    engine.balance = 500.00;

    engine.registerDownline({ username: 'farmer_ahmed', tierLevel: 1 });
    engine.registerDownline({ username: 'farmer_bilal', tierLevel: 2, upliner: 'farmer_ahmed' });
    engine.registerDownline({ username: 'farmer_tariq', tierLevel: 1 });

    // Purchase 1: farmer_ahmed buys 1 hen (500 PKR, L1 @ 2% = 10 PKR)
    engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: 1 });
    // Purchase 2: farmer_ahmed buys 3 hens (1500 PKR, L1 @ 2% = 30 PKR)
    engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: 3 });
    // Purchase 3: farmer_bilal buys 2 hens (1000 PKR, L2 @ 1% = 10 PKR)
    engine.simulateDownlinePurchase({ username: 'farmer_bilal', units: 2 });
    // Purchase 4: farmer_bilal buys 4 hens (2000 PKR, L2 @ 1% = 20 PKR)
    engine.simulateDownlinePurchase({ username: 'farmer_bilal', units: 4 });

    // Total expected commissions: 10 + 30 + 10 + 20 = 70 PKR
    expect(engine.balance).toBe(570.00);

    // Verify farmer_ahmed lifetime metrics
    const ahmed = engine.teamMembers.find(m => m.username === 'farmer_ahmed');
    expect(ahmed.assetsPurchased).toBe(4);
    expect(ahmed.totalSpentPkr).toBe(2000);
    expect(ahmed.commissionEarnedPkr).toBe(40.00);

    // Verify farmer_bilal lifetime metrics
    const bilal = engine.teamMembers.find(m => m.username === 'farmer_bilal');
    expect(bilal.assetsPurchased).toBe(6);
    expect(bilal.totalSpentPkr).toBe(3000);
    expect(bilal.commissionEarnedPkr).toBe(30.00);

    // Verify farmer_tariq remains inactive (0 purchases)
    const tariq = engine.teamMembers.find(m => m.username === 'farmer_tariq');
    expect(tariq.assetsPurchased).toBe(0);
    expect(tariq.totalSpentPkr).toBe(0);
    expect(tariq.commissionEarnedPkr).toBe(0);

    // Verify referralStats aggregator
    const stats = engine.referralStats;
    expect(stats.totalInvited).toBe(3);
    expect(stats.level1Count).toBe(2);
    expect(stats.level2Count).toBe(1);
    expect(stats.activeTeamCount).toBe(2); // ahmed and bilal active
    expect(stats.totalDownlineUnits).toBe(10); // 4 + 6
    expect(stats.totalDownlineVolumePkr).toBe(5000); // 2000 + 3000
    expect(stats.totalCommissionEarned).toBe(70.00);

    // Verify transactions ledger
    const commissionTrxs = engine.transactions.filter(t => t.type === 'COMMISSION');
    expect(commissionTrxs.length).toBe(4);
    const totalTrxCommission = commissionTrxs.reduce((sum, t) => sum + t.amount, 0);
    expect(totalTrxCommission).toBe(70.00);

    // Adversarial edge cases: Rejection of invalid units and unknown member
    const invalidZero = engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: 0 });
    expect(invalidZero.success).toBe(false);
    expect(invalidZero.message).toContain('positive integer');

    const invalidNegative = engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: -3 });
    expect(invalidNegative.success).toBe(false);

    const invalidNonInteger = engine.simulateDownlinePurchase({ username: 'farmer_ahmed', units: 2.5 });
    expect(invalidNonInteger.success).toBe(false);

    const nonExistent = engine.simulateDownlinePurchase({ username: 'ghost_farmer', units: 1 });
    expect(nonExistent.success).toBe(false);
    expect(nonExistent.message).toContain('not found');
  });
});

describe('Tier 1: F8.4 - Fresh State Reset & Production Baseline Integrity', () => {
  it('TC-T1-F8.4-01: 1-click \'Reset to Fresh State\' clears test session entries, restores clean initial baseline (teamMembers: [], default balance, default seed assets)', () => {
    const storage = new MockLocalStorage();
    const engine = new FarmEngine(storage);

    // Populate transient test downlines and simulated transactions
    engine.registerDownline({ username: 'temp_farmer_1', tierLevel: 1 });
    engine.registerDownline({ username: 'temp_farmer_2', tierLevel: 2 });
    engine.simulateDownlinePurchase({ username: 'temp_farmer_1', units: 5 });
    expect(engine.teamMembers.length).toBe(2);
    expect(engine.referralStats.totalCommissionEarned).toBe(50.00);

    // Trigger 1-click Reset to Fresh State
    const resetRes = engine.resetToFreshState();
    expect(resetRes.success).toBe(true);
    expect(resetRes.message).toContain('clean initial baseline');

    // Invariants check after reset
    expect(engine.teamMembers.length).toBe(0);
    expect(engine.balance).toBe(1500.00);
    expect(engine.eggVault).toBe(18);
    expect(engine.activeAssets.length).toBe(1);
    expect(engine.transactions.filter(t => t.type === 'COMMISSION').length).toBe(0);

    const stats = engine.referralStats;
    expect(stats.totalInvited).toBe(0);
    expect(stats.level1Count).toBe(0);
    expect(stats.level2Count).toBe(0);
    expect(stats.totalCommissionEarned).toBe(0);
    expect(stats.activeTeamCount).toBe(0);
    expect(stats.totalDownlineUnits).toBe(0);
    expect(stats.totalDownlineVolumePkr).toBe(0);

    // Persistence cross-check: reload new engine instance from storage
    const reloaded = new FarmEngine(storage);
    expect(reloaded.teamMembers.length).toBe(0);
    expect(reloaded.balance).toBe(1500.00);
    expect(reloaded.referralStats.totalCommissionEarned).toBe(0);
  });
});

describe('Tier 1: F8.5 - Route, Component & Navigation Integration Audit', () => {
  it('TC-T1-F8.5-01: Route & Component verification ensuring src/pages/TeamPage.jsx exists and is exported from src/App.jsx, src/App.jsx handles /team, AppNavigation.jsx has /team link, and DashboardPage.jsx Bento Tile 5 routes to /team', () => {
    // 1. TeamPage.jsx exists and has substantial content
    const teamPagePath = path.join(ROOT_DIR, 'src/pages/TeamPage.jsx');
    expect(fs.existsSync(teamPagePath)).toBe(true);
    const teamPageCode = fs.readFileSync(teamPagePath, 'utf-8');
    expect(teamPageCode.length > 5000).toBe(true);
    expect(teamPageCode).toContain('export default function TeamPage');
    expect(teamPageCode).toContain('COMMISSION_RATES');
    expect(teamPageCode).toContain('registerDownline');
    expect(teamPageCode).toContain('simulateDownlinePurchase');
    expect(teamPageCode).toContain('resetToFreshState');

    // 2. src/App.jsx imports, exports, and handles /team
    const appPath = path.join(ROOT_DIR, 'src/App.jsx');
    expect(fs.existsSync(appPath)).toBe(true);
    const appCode = fs.readFileSync(appPath, 'utf-8');
    expect(appCode).toContain("import TeamPage from './pages/TeamPage'");
    expect(appCode).toContain('export { TeamPage }');
    expect(appCode).toContain("case '/team':");
    expect(appCode).toContain('<TeamPage />');

    // 3. src/components/AppNavigation.jsx contains /team route contract
    const navPath = path.join(ROOT_DIR, 'src/components/AppNavigation.jsx');
    expect(fs.existsSync(navPath)).toBe(true);
    const navCode = fs.readFileSync(navPath, 'utf-8');
    expect(navCode).toContain('/team');

    // 4. src/pages/DashboardPage.jsx Bento Tile 5 and VIP Referral Hub route to /team
    const dashPath = path.join(ROOT_DIR, 'src/pages/DashboardPage.jsx');
    expect(fs.existsSync(dashPath)).toBe(true);
    const dashCode = fs.readFileSync(dashPath, 'utf-8');
    expect(dashCode).toContain("navigateTo('/team')");
    expect(dashCode).toContain('Team');
    expect(dashCode).toContain('Network');
    expect(dashCode).toContain('Open Team & Referral Hub');
  });
});
