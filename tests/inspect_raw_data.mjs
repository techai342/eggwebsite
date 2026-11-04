import fs from 'fs';
import path from 'path';

const rawDir = path.resolve('D:/allakermegg/rawafiles');

console.log('=== FORENSIC EXTRACTION OF RAWAFILES ===\n');

// 1. Inspect Sell Egg / Withdraw HTML for Merchant Stores
const sellHtml = fs.readFileSync(path.join(rawDir, 'Sell Egg - Alkram Meta Eggssale.html'), 'utf8');
const sellLines = sellHtml.split(/\r?\n/);

console.log('--- 1. MERCHANT STORES DATA ATTRIBUTES ---');
for (let i = 0; i < sellLines.length; i++) {
  const line = sellLines[i];
  if (line.includes('select-seller-btn')) {
    console.log(`Line ${i + 1}:`);
    // Extract attributes
    const idMatch = line.match(/data-id="([^"]+)"/);
    const storeMatch = line.match(/data-store="([^"]+)"/);
    const rateMatch = line.match(/data-rate="([^"]+)"/);
    const minMatch = line.match(/data-min="([^"]+)"/);
    const maxMatch = line.match(/data-max="([^"]+)"/);
    console.log(`  id: ${idMatch ? idMatch[1] : 'N/A'}`);
    console.log(`  store: ${storeMatch ? storeMatch[1] : 'N/A'}`);
    console.log(`  rate: ${rateMatch ? rateMatch[1] : 'N/A'}`);
    console.log(`  min: ${minMatch ? minMatch[1] : 'N/A'}`);
    console.log(`  max: ${maxMatch ? maxMatch[1] : 'N/A'}`);
  }
}

// Extract merchant ratings, completed orders, and badges
console.log('\n--- 2. MERCHANT CARDS METRICS & RATINGS ---');
for (let i = 0; i < sellLines.length; i++) {
  if (sellLines[i].includes('Sonica FORM STORE') || sellLines[i].includes('Usmaina Poltry Farm') || sellLines[i].includes('Syed poultry farm')) {
    console.log(`\nStore at line ${i + 1}: ${sellLines[i].trim()}`);
    // Print subsequent 35 lines
    for (let j = i + 1; j <= i + 35 && j < sellLines.length; j++) {
      const l = sellLines[j].trim();
      if (l.includes('Orders') || l.includes('rating') || l.includes('text-[#fbbf24]') || l.includes('text-emerald-400') || l.includes('badge') || l.includes('Rs.') || l.includes('select-seller-btn')) {
        console.log(`  [L${j + 1}] ${l}`);
      }
    }
  }
}

// 3. Inspect Payout channels and Bank dropdown in Sell HTML
console.log('\n--- 3. PAYOUT CHANNELS & BANK LIST ---');
for (let i = 0; i < sellLines.length; i++) {
  if (sellLines[i].includes('data-method') || sellLines[i].includes('select-method-btn') || sellLines[i].includes('chooseMethod')) {
    console.log(`Method at L${i + 1}: ${sellLines[i].trim()}`);
  }
  if (sellLines[i].includes('<select') || sellLines[i].includes('name="bank') || sellLines[i].includes('id="bank')) {
    console.log(`Bank select at L${i + 1}: ${sellLines[i].trim()}`);
    for (let j = i + 1; j <= i + 25 && j < sellLines.length; j++) {
      if (sellLines[j].includes('option')) {
        console.log(`  Option L${j + 1}: ${sellLines[j].trim()}`);
      }
      if (sellLines[j].includes('</select>')) break;
    }
  }
}

// 4. Inspect Gateways in Buy Asset HTML
console.log('\n--- 4. GATEWAYS IN BUY ASSET HTML ---');
const buyHtml = fs.readFileSync(path.join(rawDir, 'Buy Alkram Meta Eggs - VIP Farm Asset.html'), 'utf8');
const buyLines = buyHtml.split(/\r?\n/);
for (let i = 0; i < buyLines.length; i++) {
  const line = buyLines[i];
  if (line.includes('data-method') || line.includes('gateway-card') || line.includes('chooseGateway')) {
    console.log(`Gateway at L${i + 1}: ${line.trim()}`);
    for (let j = i + 1; j <= i + 15 && j < buyLines.length; j++) {
      const sub = buyLines[j].trim();
      if (sub.includes('Easypisa') || sub.includes('Jazzcash') || sub.includes('1000') || sub.includes('1001') || sub.includes('Limit') || sub.includes('Charge')) {
        console.log(`  [L${j + 1}] ${sub}`);
      }
      if (sub.includes('</div>') && j > i + 10) break;
    }
  }
}

// 5. Inspect Dashboard HTML for verified merchants carousel
console.log('\n--- 5. DASHBOARD VERIFIED BUYERS CAROUSEL ---');
const dashHtml = fs.readFileSync(path.join(rawDir, 'Alkram Meta Eggs _ Dashboard.html'), 'utf8');
const dashLines = dashHtml.split(/\r?\n/);
for (let i = 0; i < dashLines.length; i++) {
  if (dashLines[i].includes('Top Verified Buyers') || dashLines[i].includes('Verified Buyers') || (dashLines[i].includes('Sonica') && i < 2500)) {
    console.log(`Dash L${i + 1}: ${dashLines[i].trim()}`);
    for (let j = i + 1; j <= i + 40 && j < dashLines.length; j++) {
      const sub = dashLines[j].trim();
      if (sub.includes('Sonica') || sub.includes('Usmaina') || sub.includes('Syed') || sub.includes('Rs.') || sub.includes('Rate') || sub.includes('Trades')) {
        console.log(`  [Dash L${j + 1}] ${sub}`);
      }
    }
    break;
  }
}
