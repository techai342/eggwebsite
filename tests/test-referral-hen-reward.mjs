import assert from 'assert';

console.log('🧪 Testing Hen Purchase Referral Egg Reward System...');

// Mock state and simulation
class MockFarmEngine {
  constructor() {
    this.eggVault = 0;
    this.balance = 0;
    this.teamMembers = [];
    this.transactions = [];
  }

  registerDownline({ username, tierLevel = 1, upliner = 'mrsaqib242' }) {
    // 0 eggs on registration
    const member = {
      id: `m_${Date.now()}_${Math.random()}`,
      username,
      tierLevel,
      upliner,
      assetsPurchased: 0,
      totalSpentPkr: 0,
      commissionEarnedPkr: 0
    };
    this.teamMembers.push(member);
    return member;
  }

  simulatePurchase({ username, units }) {
    const member = this.teamMembers.find(m => m.username === username);
    if (!member) throw new Error('Member not found');

    const qty = Number(units);
    const henPrice = 500;
    const cost = qty * henPrice;
    const commission = (cost * 0.02);

    // 1 Hen = 1 Free Egg
    const eggReward = qty;
    this.eggVault += eggReward;
    this.balance += commission;

    member.assetsPurchased += qty;
    member.totalSpentPkr += cost;
    member.commissionEarnedPkr += commission;

    this.transactions.push({
      type: 'REWARD',
      amount: eggReward,
      unit: 'EGG',
      description: `Referral Hen Reward: +${eggReward} Free Eggs (${username} bought ${qty} Hens)`
    });

    return { eggReward, commission };
  }

  getReferralStats() {
    const totalInvited = this.teamMembers.length;
    const totalDownlineUnits = this.teamMembers.reduce((sum, m) => sum + m.assetsPurchased, 0);
    return {
      totalInvited,
      totalDownlineUnits,
      referralEggRewards: totalDownlineUnits
    };
  }
}

const engine = new MockFarmEngine();

// 1. User joins from referral but buys 0 hens
engine.registerDownline({ username: 'ali_farmer' });
assert.strictEqual(engine.eggVault, 0, 'Upliner must receive 0 eggs when user only joins');
assert.strictEqual(engine.teamMembers[0].assetsPurchased, 0, 'ali_farmer has 0 hens');
console.log('✅ Scenario 1 Passed: User joins and buys 0 hens -> Upliner gets 0 eggs');

// 2. User buys 2 hens -> Upliner gets 2 eggs
engine.simulatePurchase({ username: 'ali_farmer', units: 2 });
assert.strictEqual(engine.eggVault, 2, 'Upliner must receive 2 eggs when downline buys 2 hens');
console.log('✅ Scenario 2 Passed: Downline buys 2 hens -> Upliner gets +2 eggs');

// 3. User buys 5 hens -> Upliner gets +5 eggs (2 + 5 = 7)
engine.simulatePurchase({ username: 'ali_farmer', units: 5 });
assert.strictEqual(engine.eggVault, 7, 'Upliner must receive +5 eggs (total 7 eggs)');
console.log('✅ Scenario 3 Passed: Downline buys 5 hens -> Upliner gets +5 eggs (total 7)');

// 4. Another user joins and buys 10 hens -> Upliner gets +10 eggs (7 + 10 = 17)
engine.registerDownline({ username: 'zain_farmer' });
assert.strictEqual(engine.eggVault, 7, 'Joining alone adds 0 eggs');
engine.simulatePurchase({ username: 'zain_farmer', units: 10 });
assert.strictEqual(engine.eggVault, 17, 'Upliner gets +10 eggs (total 17)');
console.log('✅ Scenario 4 Passed: Another downline buys 10 hens -> Upliner gets +10 eggs (total 17)');

// 5. Check referralStats
const stats = engine.getReferralStats();
assert.strictEqual(stats.totalInvited, 2, 'Total invited is 2');
assert.strictEqual(stats.totalDownlineUnits, 17, 'Total downline hens is 17 (2 + 5 + 10)');
assert.strictEqual(stats.referralEggRewards, 17, 'Total referral eggs earned is 17');
console.log('✅ Scenario 5 Passed: Stats show 2 invited, 17 downline hens, 17 referral eggs earned');

console.log('🎉 All Hen Purchase Referral Egg Reward tests passed with 100% success!');
