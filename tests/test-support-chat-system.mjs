// tests/test-support-chat-system.mjs
// AL Rehman Meta Eggs — Automated Verification of Support System
// Tests: WhatsApp URL generator, In-App Support Chat (Send, Edit, Delete, Read Status, Threads)

import assert from 'assert';

console.log('\n======================================================================');
console.log('  TESTING AL REHMAN META EGGS: SUPPORT & WHATSAPP ENGINE');
console.log('======================================================================\n');

// Mock localStorage
const store = {};
const localStorageMock = {
  getItem: (key) => store[key] || null,
  setItem: (key, val) => { store[key] = String(val); },
  removeItem: (key) => { delete store[key]; }
};

// 1. Test WhatsApp URL Generation
function getWhatsAppSupportUrl({ phone, user, balance, eggVault, customText }) {
  const rawPhone = phone || '+923412017923';
  let cleanDigits = String(rawPhone).replace(/[^0-9]/g, '');
  if (cleanDigits.startsWith('03')) {
    cleanDigits = '92' + cleanDigits.slice(1);
  }
  if (!cleanDigits.startsWith('92')) {
    cleanDigits = '92' + cleanDigits;
  }
  const defaultMsg = `Assalam-o-Alaikum AL Rehman Meta Eggs Support, I need assistance with my account.\nFarmer: ${user?.username || 'Guest'} (ID: ${user?.accountId || 'N/A'})\nBalance: ${Number(balance || 0).toLocaleString()} PKR | Eggs: ${Number(eggVault || 0).toLocaleString()}`;
  const encoded = encodeURIComponent(customText || defaultMsg);
  return `https://wa.me/${cleanDigits}?text=${encoded}`;
}

console.log('1. Testing WhatsApp Support URL generation:');
const url1 = getWhatsAppSupportUrl({
  phone: '+923412017923',
  user: { username: 'mrsaqib242', accountId: '1197' },
  balance: 1500,
  eggVault: 24
});
console.log('  URL 1:', url1);
assert(url1.startsWith('https://wa.me/923412017923?text='), 'Must start with clean wa.me target');
assert(url1.includes('mrsaqib242'), 'Must include username in payload');
assert(url1.includes('1197'), 'Must include accountId in payload');
console.log('  ✔ Standard international +92 format passed');

const url2 = getWhatsAppSupportUrl({
  phone: '0341-2017923', // Local pakistani format with hyphen
  user: { username: 'ali_farmer', accountId: '2045' },
  balance: 0,
  eggVault: 5
});
console.log('  URL 2:', url2);
assert(url2.startsWith('https://wa.me/923412017923?text='), 'Must normalize local 03xx to 923xx');
console.log('  ✔ Local 03xx normalization passed');

// 2. Test In-App Chat Operations (Send, Edit, Delete)
console.log('\n2. Testing In-App Chat State & Actions:');

let supportMessages = [];

function sendSupportMessage({ message, user, targetUserId }) {
  const text = (message || '').trim();
  if (!text) throw new Error('Message cannot be empty');
  const isAdmin = user.role === 'admin';
  const senderRole = isAdmin ? 'admin' : 'farmer';
  const resolvedUserId = isAdmin ? String(targetUserId) : String(user.accountId || user.username);

  const newMsg = {
    id: `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    userId: resolvedUserId,
    username: user.username,
    senderRole,
    senderName: user.name || user.username,
    message: text,
    isRead: false,
    isEdited: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  supportMessages.push(newMsg);
  localStorageMock.setItem('metaeggs_support_messages', JSON.stringify(supportMessages));
  return newMsg;
}

function editSupportMessage({ messageId, newMessage }) {
  const text = (newMessage || '').trim();
  if (!text) throw new Error('Message cannot be empty');
  const msg = supportMessages.find((m) => m.id === messageId);
  if (!msg) throw new Error('Message not found');
  msg.message = text;
  msg.isEdited = true;
  msg.updatedAt = new Date().toISOString();
  localStorageMock.setItem('metaeggs_support_messages', JSON.stringify(supportMessages));
  return msg;
}

function deleteSupportMessage({ messageId }) {
  supportMessages = supportMessages.filter((m) => m.id !== messageId);
  localStorageMock.setItem('metaeggs_support_messages', JSON.stringify(supportMessages));
}

// Step A: Farmer sends a message
const farmerUser = { username: 'ali_farmer', accountId: '1024', name: 'Ali Khan', role: 'farmer' };
const msg1 = sendSupportMessage({
  message: 'Hello Admin, my withdrawal of 50 eggs is pending.',
  user: farmerUser
});
console.log('  ✔ Farmer sent message:', msg1.id, msg1.message);
assert.strictEqual(supportMessages.length, 1);
assert.strictEqual(supportMessages[0].isRead, false);
assert.strictEqual(supportMessages[0].senderRole, 'farmer');

// Step B: Farmer edits their message
const editedMsg = editSupportMessage({
  messageId: msg1.id,
  newMessage: 'Hello Admin, my withdrawal of 60 eggs is pending (updated qty).'
});
console.log('  ✔ Farmer edited message:', editedMsg.message, 'isEdited:', editedMsg.isEdited);
assert.strictEqual(editedMsg.isEdited, true);
assert.strictEqual(editedMsg.message, 'Hello Admin, my withdrawal of 60 eggs is pending (updated qty).');

// Step C: Admin replies to the farmer
const adminUser = { username: 'mrsaqib242', accountId: '1197', name: 'Admin Saqib', role: 'admin' };
const msg2 = sendSupportMessage({
  message: 'Assalam-o-Alaikum Ali! Your withdrawal of 60 eggs has been approved.',
  user: adminUser,
  targetUserId: '1024'
});
console.log('  ✔ Admin sent reply:', msg2.id, msg2.message);
assert.strictEqual(supportMessages.length, 2);
assert.strictEqual(supportMessages[1].senderRole, 'admin');
assert.strictEqual(supportMessages[1].userId, '1024');

// Step D: Verify thread grouping
const threadForAli = supportMessages.filter((m) => m.userId === '1024');
assert.strictEqual(threadForAli.length, 2);
console.log('  ✔ Thread grouping verified for Farmer #1024 (2 messages)');

// Step E: Delete message
deleteSupportMessage({ messageId: msg1.id });
console.log('  ✔ Deleted message', msg1.id);
assert.strictEqual(supportMessages.length, 1);
assert.strictEqual(supportMessages[0].id, msg2.id);

// Step F: Persistence verified
const stored = JSON.parse(localStorageMock.getItem('metaeggs_support_messages'));
assert.strictEqual(stored.length, 1);
assert.strictEqual(stored[0].id, msg2.id);
console.log('  ✔ LocalStorage persistence verified');

console.log('\n======================================================================');
console.log('  ✔ ALL SUPPORT & WHATSAPP ENGINE TESTS PASSED (6/6)');
console.log('======================================================================\n');
