// tests/helpers/assertions.mjs
// Lightweight, zero-dependency assertion and test harness for Node.js ESM

let currentSuite = '';
let suitePassed = 0;
let suiteFailed = 0;
const results = [];

export function describe(title, fn) {
  currentSuite = title;
  console.log(`\n\x1b[1m\x1b[36m▶ ${title}\x1b[0m`);
  try {
    fn();
  } catch (err) {
    console.error(`\x1b[31mSuite error in "${title}":\x1b[0m`, err);
  }
}

export async function describeAsync(title, fn) {
  currentSuite = title;
  console.log(`\n\x1b[1m\x1b[36m▶ ${title}\x1b[0m`);
  try {
    await fn();
  } catch (err) {
    console.error(`\x1b[31mSuite error in "${title}":\x1b[0m`, err);
  }
}

export function it(testName, fn) {
  try {
    fn();
    suitePassed++;
    results.push({ suite: currentSuite, test: testName, status: 'pass' });
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
  } catch (err) {
    suiteFailed++;
    results.push({ suite: currentSuite, test: testName, status: 'fail', error: err });
    console.log(`  \x1b[31m✖\x1b[0m ${testName}`);
    console.log(`    \x1b[31m${err.message}\x1b[0m`);
  }
}

export async function itAsync(testName, fn) {
  try {
    await fn();
    suitePassed++;
    results.push({ suite: currentSuite, test: testName, status: 'pass' });
    console.log(`  \x1b[32m✔\x1b[0m ${testName}`);
  } catch (err) {
    suiteFailed++;
    results.push({ suite: currentSuite, test: testName, status: 'fail', error: err });
    console.log(`  \x1b[31m✖\x1b[0m ${testName}`);
    console.log(`    \x1b[31m${err.message}\x1b[0m`);
  }
}

export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected strictly [${expected}] (${typeof expected}), but received [${actual}] (${typeof actual})`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected structure:\n${b}\nReceived:\n${a}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} > ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new Error(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} < ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected) {
      if (!(actual <= expected)) {
        throw new Error(`Expected ${actual} <= ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, but received [${actual}]`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, but received [${actual}]`);
      }
    },
    toContain(expected) {
      if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string to contain "${expected}", but did not.`);
        }
      } else if (Array.isArray(actual)) {
        const found = actual.some(item => {
          if (typeof item === 'object' && typeof expected === 'object') {
            return JSON.stringify(item).includes(JSON.stringify(expected).replace(/^\{|\}$/g, ''));
          }
          return item === expected;
        });
        if (!found) {
          throw new Error(`Expected array to contain item, but it was not found.`);
        }
      } else {
        throw new Error(`toContain only supports strings and arrays, got ${typeof actual}`);
      }
    },
    toThrow(expectedMessageSubstring) {
      if (typeof actual !== 'function') {
        throw new Error(`toThrow requires a function target, received ${typeof actual}`);
      }
      let threw = false;
      let errorThrown = null;
      try {
        actual();
      } catch (err) {
        threw = true;
        errorThrown = err;
      }
      if (!threw) {
        throw new Error(`Expected function to throw an error, but it did not throw.`);
      }
      if (expectedMessageSubstring && !errorThrown.message.includes(expectedMessageSubstring)) {
        throw new Error(`Expected error message to include "${expectedMessageSubstring}", but received "${errorThrown.message}"`);
      }
    }
  };
}

export function getTestSummary() {
  return {
    passed: suitePassed,
    failed: suiteFailed,
    total: suitePassed + suiteFailed,
    results: [...results]
  };
}

export function resetTestSummary() {
  suitePassed = 0;
  suiteFailed = 0;
  results.length = 0;
}
