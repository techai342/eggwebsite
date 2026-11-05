import assert from 'assert';
import { ASSET_SPEC, PAYMENT_GATEWAYS } from './helpers/farm-engine.mjs';

console.log('======================================================================');
console.log('  AL REHMAN META EGGS — MANUAL DEPOSITS & ADMIN APPROVAL TEST SUITE');
console.log('======================================================================');

// Lightweight test engine simulating FarmContext deposit workflow
function createTestFarmEngine() {
  let user = {
    id: 'USR-TEST-001',
    username: 'testfarmer',
    name: 'Test Farmer',
    email: 'farmer@test.com',
    role: 'farmer',
    activeHens: 0,
    balance: 0,
    eggVault: 0
  };

  let users = [
    { ...user },
    {
      id: 'USR-ADMIN-001',
      username: 'mrsaqib242',
      name: 'Super Admin',
      email: 'admin@gmail.com',
      role: 'admin',
      activeHens: 5,
      balance: 10000,
      eggVault: 200
    }
  ];

  let activeAssets = [];
  let depositRequests = [];
  let transactions = [];
  let platformSettings = {
    henUnitPrice: 500,
    dailyEggYield: 1,
    contractDurationDays: 120
  };

  function submitDepositRequest({ units, gateway, senderAccountTitle, senderAccountNumber, transactionId }) {
    if (!units || units <= 0) return { success: false, message: 'Invalid units' };
    if (!transactionId) return { success: false, message: 'Missing TID' };

    const unitPrice = platformSettings.henUnitPrice;
    const amountPkr = units * unitPrice;
    const reqId = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newDeposit = {
      id: reqId,
      userId: user.id,
      username: user.username,
      gateway: gateway || 'Easypisa',
      units: Number(units),
      unitPrice,
      amountPkr,
      senderAccountTitle: senderAccountTitle || 'Valued Farmer',
      senderAccountNumber: senderAccountNumber || '',
      transactionId: String(transactionId).trim(),
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    depositRequests.unshift(newDeposit);
    transactions.unshift({
      id: `TRX-${Date.now()}`,
      type: 'BUY',
      description: `Deposit Request: ${units}x Hens via ${gateway} (TID: ${transactionId})`,
      amount: amountPkr,
      status: 'Pending',
      depositId: reqId
    });

    return { success: true, deposit: newDeposit };
  }

  function approveDepositRequest({ depositId }) {
    const idx = depositRequests.findIndex((d) => d.id === depositId);
    if (idx === -1) return { success: false, message: 'Not found' };

    const target = depositRequests[idx];
    if (target.status === 'Completed') return { success: false, message: 'Already approved' };

    const qty = Number(target.units);
    const newAsset = {
      id: `ASSET-${Date.now()}`,
      name: ASSET_SPEC.name,
      units: qty,
      unitCost: target.unitPrice,
      totalCost: target.amountPkr,
      dailyYield: qty * platformSettings.dailyEggYield,
      termDays: platformSettings.contractDurationDays,
      status: 'active'
    };

    target.status = 'Completed';
    target.approvedAt = new Date().toISOString();

    // Credit livestock units
    if (user.id === target.userId) {
      activeAssets.push(newAsset);
      user.activeHens += qty;
    }

    const uIdx = users.findIndex((u) => u.id === target.userId);
    if (uIdx !== -1) {
      users[uIdx].activeHens = (users[uIdx].activeHens || 0) + qty;
    }

    return { success: true, message: 'Approved' };
  }

  function rejectDepositRequest({ depositId, reason }) {
    const idx = depositRequests.findIndex((d) => d.id === depositId);
    if (idx === -1) return { success: false, message: 'Not found' };

    const target = depositRequests[idx];
    target.status = 'Rejected';
    target.adminNotes = reason || 'Payment unverified';
    target.rejectedAt = new Date().toISOString();

    return { success: true, message: 'Rejected' };
  }

  return {
    getUser: () => user,
    getUsers: () => users,
    getActiveAssets: () => activeAssets,
    getDepositRequests: () => depositRequests,
    getTransactions: () => transactions,
    submitDepositRequest,
    approveDepositRequest,
    rejectDepositRequest
  };
}

async function runManualDepositTests() {
  const engine = createTestFarmEngine();

  // Test 1: Submit manual deposit
  console.log('▶ Test 1: Farmer submits manual deposit request via Easypisa');
  const res1 = engine.submitDepositRequest({
    units: 3,
    gateway: 'Easypisa',
    senderAccountTitle: 'Muhammad Ali',
    senderAccountNumber: '03412017923',
    transactionId: 'TID-1029384756'
  });

  assert.strictEqual(res1.success, true, 'Deposit submission should succeed');
  assert.strictEqual(res1.deposit.status, 'Pending', 'Initial status must be Pending');
  assert.strictEqual(res1.deposit.units, 3, 'Units must match 3');
  assert.strictEqual(res1.deposit.amountPkr, 1500, '3 Hens @ 500 PKR = 1500 PKR');
  assert.strictEqual(engine.getUser().activeHens, 0, 'Hens must NOT be credited yet while Pending');
  assert.strictEqual(engine.getActiveAssets().length, 0, 'No active assets created while Pending');
  console.log('  ✔ Submission created Pending order for 3 Hens (Rs. 1,500) with TID #TID-1029384756');

  // Test 2: Admin approves deposit request
  console.log('▶ Test 2: Super Admin approves the deposit request');
  const depId = res1.deposit.id;
  const appRes = engine.approveDepositRequest({ depositId: depId });
  assert.strictEqual(appRes.success, true, 'Admin approval must succeed');

  const updatedDep = engine.getDepositRequests().find((d) => d.id === depId);
  assert.strictEqual(updatedDep.status, 'Completed', 'Status must transition to Completed');
  assert.ok(updatedDep.approvedAt, 'Approved timestamp must be set');
  assert.strictEqual(engine.getUser().activeHens, 3, 'Farmer activeHens must increase to 3');
  assert.strictEqual(engine.getActiveAssets().length, 1, 'Active livestock contract must be created');
  assert.strictEqual(engine.getActiveAssets()[0].units, 3, 'Asset units must be 3');
  console.log('  ✔ Admin approved: Status Completed, 3 Hens activated, daily yield live');

  // Test 3: Idempotent re-approval protection
  console.log('▶ Test 3: Re-approval of already completed deposit is rejected');
  const reAppRes = engine.approveDepositRequest({ depositId: depId });
  assert.strictEqual(reAppRes.success, false, 'Cannot re-approve already completed deposit');
  console.log('  ✔ Protected against duplicate approval');

  // Test 4: Rejection workflow
  console.log('▶ Test 4: Submission and Rejection of invalid deposit');
  const res2 = engine.submitDepositRequest({
    units: 5,
    gateway: 'JazzCash',
    senderAccountTitle: 'Fake User',
    senderAccountNumber: '03000000000',
    transactionId: 'FAKE-TID-999'
  });

  const depId2 = res2.deposit.id;
  const rejRes = engine.rejectDepositRequest({
    depositId: depId2,
    reason: 'Transaction ID not found in JazzCash statement'
  });

  assert.strictEqual(rejRes.success, true, 'Rejection must succeed');
  const rejDep = engine.getDepositRequests().find((d) => d.id === depId2);
  assert.strictEqual(rejDep.status, 'Rejected');
  assert.strictEqual(rejDep.adminNotes, 'Transaction ID not found in JazzCash statement');
  assert.strictEqual(engine.getUser().activeHens, 3, 'Hens count unchanged after rejection');
  console.log('  ✔ Admin rejected with reason: Hens count remained unchanged');

  console.log('\n======================================================================');
  console.log('  ALL MANUAL DEPOSIT & ADMIN APPROVAL TESTS PASSED (100%)');
  console.log('======================================================================');
}

runManualDepositTests().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
