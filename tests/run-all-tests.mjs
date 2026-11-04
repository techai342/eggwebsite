// tests/run-all-tests.mjs
// Master Test Runner for AL Rehman Meta Eggs E2E Test Suite (Tiers 1-4)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getTestSummary, resetTestSummary } from './helpers/assertions.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const TIERS = [
  { id: 'Tier 1', name: 'Feature Coverage (F1.1 - F6.2)', dir: 'tier1-feature-coverage' },
  { id: 'Tier 2', name: 'Boundary & Corner Cases', dir: 'tier2-boundary-corner' },
  { id: 'Tier 3', name: 'Cross-Feature Combinations', dir: 'tier3-combinations' },
  { id: 'Tier 4', name: 'Real-World Application Scenarios', dir: 'tier4-real-world-scenarios' }
];

async function main() {
  const startTime = Date.now();

  console.log('\n' + '='.repeat(70));
  console.log('\x1b[1m\x1b[32m  AL REHMAN META EGGS — COMPREHENSIVE E2E TEST RUNNER\x1b[0m');
  console.log('\x1b[90m  Archetype: Requirement-Driven Opaque-Box E2E Testing Framework\x1b[0m');
  console.log('='.repeat(70) + '\n');

  let totalSuitesCount = 0;
  let totalTestsPassed = 0;
  let totalTestsFailed = 0;
  const tierReports = [];

  for (const tier of TIERS) {
    const tierPath = path.join(__dirname, tier.dir);
    if (!fs.existsSync(tierPath)) continue;

    const testFiles = fs.readdirSync(tierPath)
      .filter(file => file.endsWith('.test.mjs'))
      .sort();

    console.log(`\n\x1b[1m\x1b[35m=== [${tier.id}] ${tier.name} (${testFiles.length} Test Suites) ===\x1b[0m`);

    let tierPassed = 0;
    let tierFailed = 0;

    for (const file of testFiles) {
      const fullPath = path.join(tierPath, file);
      totalSuitesCount++;

      resetTestSummary();
      const fileUrl = new URL(`file:///${fullPath.replace(/\\/g, '/')}`).href;

      try {
        await import(fileUrl);
        const summary = getTestSummary();
        tierPassed += summary.passed;
        tierFailed += summary.failed;
      } catch (err) {
        console.error(`\x1b[31mCritical failure running ${file}:\x1b[0m`, err);
        tierFailed++;
      }
    }

    totalTestsPassed += tierPassed;
    totalTestsFailed += tierFailed;

    tierReports.push({
      tier: tier.id,
      name: tier.name,
      suites: testFiles.length,
      passed: tierPassed,
      failed: tierFailed,
      status: tierFailed === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m'
    });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(70));
  console.log('\x1b[1m\x1b[36m                   TEST EXECUTION SUMMARY REPORT\x1b[0m');
  console.log('='.repeat(70));
  console.log(' Tier        | Suites | Passed | Failed | Status');
  console.log('-'.repeat(70));

  for (const tr of tierReports) {
    const tierPadded = tr.tier.padEnd(10);
    const suitesPadded = String(tr.suites).padStart(6);
    const passedPadded = String(tr.passed).padStart(6);
    const failedPadded = String(tr.failed).padStart(6);
    console.log(` ${tierPadded} | ${suitesPadded} | \x1b[32m${passedPadded}\x1b[0m | ${tr.failed > 0 ? '\x1b[31m' : '\x1b[90m'}${failedPadded}\x1b[0m | ${tr.status}`);
  }

  console.log('='.repeat(70));
  console.log(`Total Suites: \x1b[1m${totalSuitesCount}\x1b[0m | Total Tests: \x1b[1m${totalTestsPassed + totalTestsFailed}\x1b[0m | Duration: \x1b[1m${duration}s\x1b[0m`);

  if (totalTestsFailed === 0) {
    console.log(`\n\x1b[1m\x1b[42m\x1b[30m  SUCCESS  \x1b[0m \x1b[1m\x1b[32mAll ${totalTestsPassed} E2E tests passed successfully with 100% pass rate!\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\n\x1b[1m\x1b[41m\x1b[37m  FAILURE  \x1b[0m \x1b[1m\x1b[31m${totalTestsFailed} test(s) failed out of ${totalTestsPassed + totalTestsFailed}.\x1b[0m\n`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal error in test runner:\x1b[0m', err);
  process.exit(1);
});
