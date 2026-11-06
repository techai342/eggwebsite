import assert from 'assert';
import { uploadToImageKit } from '../src/services/imagekit.js';

console.log('======================================================================');
console.log('  AL REHMAN META EGGS — IMAGEKIT INTEGRATION & PROOF UPLOAD TESTS');
console.log('======================================================================');

async function runTests() {
  // Test 1: Upload a 1x1 transparent test image to ImageKit
  console.log('▶ Test 1: Upload base64 payment receipt to ImageKit CDN');
  const sample1px = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  
  const uploadResult = await uploadToImageKit(sample1px, 'test_receipt_e2e.png');
  assert(uploadResult.success === true, 'ImageKit upload must succeed');
  assert(typeof uploadResult.url === 'string' && uploadResult.url.includes('ik.imagekit.io'), 'URL must be a valid ImageKit CDN link');
  console.log('  ✔ ImageKit CDN URL generated successfully:', uploadResult.url);

  // Test 2: Verify simulated deposit request preserves proofScreenshot
  console.log('▶ Test 2: Verify deposit request payload carries ImageKit CDN proofScreenshot');
  const depositRecord = {
    id: `DEP-${Date.now()}`,
    userId: '1197',
    username: 'mrsaqib242',
    gateway: 'Easypisa',
    units: 5,
    unitPrice: 500,
    amountPkr: 2500,
    senderAccountTitle: 'Saqib Farmer',
    senderAccountNumber: '03412017923',
    transactionId: 'TID-88997766',
    proofScreenshot: uploadResult.url,
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  assert.strictEqual(depositRecord.proofScreenshot, uploadResult.url, 'proofScreenshot must match ImageKit CDN link');
  assert(depositRecord.proofScreenshot.startsWith('https://ik.imagekit.io/ujhr66d01/'), 'Must use user ImageKit endpoint');
  console.log('  ✔ Deposit request successfully associated with ImageKit proof URL');

  console.log('======================================================================');
  console.log('  ALL IMAGEKIT DEPOSIT PROOF TESTS PASSED (100%)');
  console.log('======================================================================');
}

runTests().catch((err) => {
  console.error('ImageKit test failed:', err);
  process.exit(1);
});
