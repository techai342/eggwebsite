# Test Infrastructure Specification: AL Rehman Meta Eggs

**Project**: AL Rehman Meta Eggs  
**Version**: 1.0.0  
**Test Suite Archetype**: Comprehensive Requirement-Driven Opaque-Box E2E Testing Framework  
**Runner**: Pure ECMAScript (ESM) Node.js Test Engine  

---

## 1. Test Philosophy

The testing framework for AL Rehman Meta Eggs adheres to strict **opaque-box, requirement-driven verification**:
1. **Behavior-Centric, Not Implementation-Coupled**: Tests verify observable functional contracts, state transitions, yield calculations, and interface behaviors defined in `PROJECT.md` and `ORIGINAL_REQUEST.md`.
2. **Deterministic Authoritative Oracles**: Expected mathematical outputs (daily yield rates, 30-day and 120-day returns, store payout calculations, 0% fees) are derived directly from the surveyed financial rules of the platform:
   - Hen Asset Unit Cost: `Rs. 500 PKR`
   - Daily Yield: `+1 Egg/day` per active unit
   - Contract Term: `120 Days` (120 Eggs total yield per unit)
   - Store Liquidation Rates: Sonica FORM STORE (`Rs. 32/egg`), Usmaina Poltry Farm (`Rs. 30/egg`), Syed poultry farm (`Rs. 33/egg`)
   - Merchant Trading Limits: `1 - 10,000 Eggs`
   - Gateways: Easypisa (`1000`), JazzCash (`1001`), Bank Transfer (Supported: UBL, HBL, MEEZAN, Habib, Alfalah, Allied, Faisal)
3. **Progressive Testability & Isolation**: Tests run in self-contained execution sandboxes with zero side effects. Each test manages its own state or in-memory persistence layer without cross-test leakage.
4. **Zero-Bloat Self-Contained Execution**: Built with standard Node.js modern ESM modules (`node:assert`, `node:test`, modern async fetch) without requiring third-party testing bloat or complex external dependencies.

---

## 2. Feature Inventory Mapping

| Feature ID | Feature Name | Description | Test Tier | Primary Test Suite |
|---|---|---|---|---|
| **F1.1** | Architecture & System Overview Doc | Comprehensive system explanation doc (business model, yield economics) | Tier 1 | `tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs` |
| **F1.2** | AL Rehman Meta Eggs Re-branding | Re-branding across headers, titles, cards, footers to "AL Rehman Meta Eggs" | Tier 1 | `tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs` |
| **F1.3** | Responsive Viewport Shell | Mobile-first 480px app container centered on desktop with #eef2ea background | Tier 1 | `tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs` |
| **F1.4** | Top Navigation Header | Canopy bar with status badge, farmer title, back button, and drawer toggle | Tier 1 | `tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs` |
| **F1.5** | Sticky Bottom Navigation Dock | 5-item fixed dock: Home, Sale, Buy (center elevated), My Farm, Profile | Tier 1 | `tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs` |
| **F2.1** | Farmer Login Screen | Full-page 480px login view with arched green gradient canopy and 3 benefit pills | Tier 1 | `tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs` |
| **F2.2** | Password Visibility Toggle | Interactive eye toggle button showing/hiding password input | Tier 1 | `tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs` |
| **F2.3** | Default Credentials & Remember Me | Mock credentials (`admin@gmail.com` / `password123` or `mrsaqib242`) | Tier 1 | `tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs` |
| **F2.4** | Client-Side Session State | LocalStorage persistence of login status, username, and account ID | Tier 1, 3 | `tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs` |
| **F2.5** | Change Password Form | Current password, new password, confirm password fields with eye toggles | Tier 1 | `tests/tier1-feature-coverage/t1-f3-password-security.test.mjs` |
| **F2.6** | Password Validation & Update | Validates current password and updates credentials in local state | Tier 1, 2 | `tests/tier1-feature-coverage/t1-f3-password-security.test.mjs` |
| **F2.7** | Logout Mechanism | Clears active session and redirects to login screen | Tier 1, 3 | `tests/tier1-feature-coverage/t1-f2-auth-session.test.mjs` |
| **F3.1** | Farmer Identity & Account Bar | Farmer avatar, username, verified badge, Upliner, Account ID #1197 | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.2** | Earnings Vault | Live Egg vault count and estimated PKR value with quick Buy/Sell action pills | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.3** | Live Production Orbit Nexus | Orbiting egg satellite, live production rate (+1 Egg/day/unit), active counter | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.4** | 24-Hour Harvest Engine & Cooldown | Interactive harvest collection and 24-hour countdown cooldown modal | Tier 1, 2 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.5** | Farm Analytics Grid | Metric cards for Total Units Bought, Buy Volume, Total Eggs Sold, Sales PKR | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.6** | Bento Quick Menu | 6 quick action tiles: Product Reward, Rewards, All History, My Farm, Team, Password | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.7** | Interactive P2P Trade Theater | Animated farm cottage, farmer walking with eggs, merchant counter, trade animation | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.8** | Top Verified Buyers Live Carousel | Live merchant rates for Sonica (Rs 32), Usmaina (Rs 30), Syed (Rs 33) | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.9** | VIP Referral Hub & WhatsApp Share | Copyable referral code with toast alert and pre-filled WhatsApp share link | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F3.10**| Official WhatsApp Community Modal | Welcome popup with WhatsApp Group and Channel links | Tier 1 | `tests/tier1-feature-coverage/t1-f4-dashboard-telemetry.test.mjs` |
| **F4.1** | 3-Step Buy Asset Wizard HUD | Stepper track: Step 1 (Showcase) -> Step 2 (Multiplier) -> Step 3 (Payment) | Tier 1 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F4.2** | 3D Asset Showcase & Audio | Orbiting Hen mascot arena, plan metrics (Rs 500, +1 Egg/day, 120d, 120 total eggs) | Tier 1 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F4.3** | Pasture Flock Multiplier HUD | Dynamic hen cards pasture (1-5 hens + excess tag), quantity incrementor, presets | Tier 1 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F4.4** | Real-Time Projected Yield Matrix | Dynamic calculation of daily harvest, 30d yield, 120d yield, and net PKR cost | Tier 1 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F4.5** | Payment Gateway Checkout | Easypisa (Code 1000) & JazzCash (Code 1001) selectors with 0% fee checkout | Tier 1 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F4.6** | Asset Purchase State Update | LocalStorage update adding purchased units to active assets and logging transaction | Tier 1, 3 | `tests/tier1-feature-coverage/t1-f5-buy-asset-wizard.test.mjs` |
| **F5.1** | Harvest Liquidation Vault Banner | Egg balance, PKR cash value, store count, best rate, max rate | Tier 1 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.2** | Merchant Store Search & Filters | Search by name and filter by Best Rate, Most Trades, 100% Success, Top Rated | Tier 1 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.3** | Verified Store Listing Cards | Merchant cards (Sonica, Usmaina, Syed) with ratings, trade history, limits | Tier 1 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.4** | Payout Method Selector | JazzCash, EasyPaisa, All Bank Pakistan selection with instant transfer tags | Tier 1 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.5** | Quantity & Cashout Simulator | Egg input, presets (25%, 50%, 75%, MAX ALL), live PKR payout readout | Tier 1, 2 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.6** | Dynamic Payout Form Fields | Tailored account fields for JazzCash/EasyPaisa (Name, Phone) and Bank (IBAN) | Tier 1 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F5.7** | Egg Liquidation & Withdrawal Update | Deducts eggs from vault, credits PKR, records withdrawal transaction | Tier 1, 3 | `tests/tier1-feature-coverage/t1-f6-sell-egg-p2p.test.mjs` |
| **F6.1** | Transaction & Withdrawal History Log | Filterable history table showing Date, Type, Gateway/Merchant, Amount, Status | Tier 1 | `tests/tier1-feature-coverage/t1-f7-history-toasts.test.mjs` |
| **F6.2** | Toast Notification Feedback System | Non-blocking toasts for purchases, sales, logins, logouts, copies, errors | Tier 1 | `tests/tier1-feature-coverage/t1-f7-history-toasts.test.mjs` |

---

## 3. Test Architecture

### 3.1 Directory Layout
```
D:\allakermegg\tests/
├── helpers/
│   ├── assertions.mjs                 # Unified assertion and TAP/colored output formatter
│   ├── farm-engine.mjs                # Authoritative reference engine implementing contract rules
│   └── mock-storage.mjs               # In-memory localStorage mock for state lifecycle isolation
├── tier1-feature-coverage/
│   ├── t1-f1-branding-docs.test.mjs   # Covers F1.1 - F1.5 (>=5 test cases)
│   ├── t1-f2-auth-session.test.mjs    # Covers F2.1 - F2.4, F2.7 (>=5 test cases)
│   ├── t1-f3-password-security.test.mjs# Covers F2.5 - F2.6 (>=5 test cases)
│   ├── t1-f4-dashboard-telemetry.test.mjs # Covers F3.1 - F3.10 (>=5 test cases)
│   ├── t1-f5-buy-asset-wizard.test.mjs # Covers F4.1 - F4.6 (>=5 test cases)
│   ├── t1-f6-sell-egg-p2p.test.mjs    # Covers F5.1 - F5.7 (>=5 test cases)
│   └── t1-f7-history-toasts.test.mjs  # Covers F6.1 - F6.2 (>=5 test cases)
├── tier2-boundary-corner/
│   ├── t2-boundary-asset-buy.test.mjs # Purchase limits, zero, negative, overflow (>=5 tests)
│   ├── t2-boundary-egg-sell.test.mjs  # Sell limits, empty vault, non-existent stores (>=5 tests)
│   ├── t2-boundary-password.test.mjs  # Password edge cases, mismatch, short length (>=5 tests)
│   ├── t2-boundary-harvest.test.mjs   # Cooldown violations, 0 active units (>=5 tests)
│   └── t2-boundary-auth.test.mjs      # Corrupt sessions, invalid users, empty fields (>=5 tests)
├── tier3-combinations/
│   ├── t3-lifecycle-buy-harvest-sell.test.mjs # Buy -> Harvest -> Sell -> Cashout sequence
│   ├── t3-auth-password-relogin.test.mjs      # Change password -> Invalidate -> Re-authenticate
│   ├── t3-multi-asset-yield-aggregate.test.mjs# Staggered multi-unit buys & aggregate yield
│   └── t3-multi-merchant-liquidation.test.mjs # Split selling across Sonica & Syed stores
├── tier4-real-world-scenarios/
│   ├── t4-scenario1-full-farmer-journey.test.mjs # New user -> Rs. 5,000 for 10 hens -> 120d yield -> EasyPaisa & Bank cashout
│   ├── t4-scenario2-micro-compounder.test.mjs    # 1 hen micro-investor compounding daily yield into additional hens
│   ├── t4-scenario3-whale-syndicate.test.mjs     # 50 hens bulk syndicate -> 1,500 eggs batch dump -> bank IBAN payout
│   └── t4-scenario4-security-recovery.test.mjs   # Account security rotation -> credential audit -> transaction ledger check
└── run-all-tests.mjs                             # Master test suite runner
```

### 3.2 State Engine Contract (`FarmEngine`)
The test suite utilizes `tests/helpers/farm-engine.mjs` as the strict reference implementation of the `FarmContext` state contract:
- **`user`**: `{ username, name, accountId, upliner, isLoggedIn, token }`
- **`balance`**: `number` (liquid PKR balance)
- **`eggVault`**: `number` (unharvested / harvestable egg count)
- **`activeAssets`**: Array of hen plans with `{ id, name, units, unitCost, dailyYield, termDays, purchaseDate }`
- **`transactions`**: Ledger of purchases, egg harvests, and sales
- **`withdrawals`**: Records of P2P liquidation cashout requests
- **`lastHarvest`**: ISO timestamp of last collection
- **`cooldownActive`**: Boolean flag indicating 24h cooldown status

---

## 4. Real-World Application Scenarios (Tier 4)

### Scenario 1: Standard Farmer Complete Lifecycle
1. **Registration & Onboarding**: Farmer authenticates with default credentials (`mrsaqib242` / `password123`).
2. **Initial Capital Deployment**: Farmer purchases 10 Hen Units (Rs. 5,000 PKR) using EasyPaisa.
3. **Yield Maturation Simulation**: 120-day production cycle generates 1,200 eggs.
4. **P2P Liquidation**:
   - Liquidates 600 eggs to Sonica FORM STORE @ Rs. 32 = Rs. 19,200 PKR via JazzCash.
   - Liquidates 600 eggs to Syed poultry farm @ Rs. 33 = Rs. 19,800 PKR via Meezan Bank IBAN.
5. **Security Hardening**: Updates password to `SecureFarmer2026!`, verifies session integrity.
6. **Financial Reconciliation**: Total cashout Rs. 39,000 PKR on Rs. 5,000 initial investment (780% gross return).

### Scenario 2: Micro-Investor Compounding Strategy
1. **Entry**: Farmer starts with 1 Hen Unit (Rs. 500 PKR).
2. **Phase 1 Harvest**: 17 days of production yields 17 eggs.
3. **Liquidation**: Sells 17 eggs to Syed poultry farm @ Rs. 33 = Rs. 561 PKR.
4. **Reinvestment**: Reinvests Rs. 500 into a 2nd Hen Unit.
5. **Scaled Production**: Production rate doubles to +2 Eggs/day.

### Scenario 3: Whale Agribusiness Syndicate
1. **Bulk Purchase**: Purchases 50 Hen Units (Rs. 25,000 PKR).
2. **Batch Production**: 30 days of production yields 1,500 eggs.
3. **Limit & Liquidation Validation**: Sells 1,500 eggs to Syed poultry farm @ Rs. 33 = Rs. 49,500 PKR.
4. **Payout Verification**: Form validates All Bank Pakistan (HBL) with IBAN `PK36HABB0000001234567890`.

### Scenario 4: Credential Compromise & Security Recovery
1. **Authentication**: Farmer logs in and checks active assets.
2. **Security Rotation**: Changes password from `password123` to `NewFarmerPass99#`.
3. **Session Invalidation**: Logs out; validates that old password fails authentication.
4. **Re-Authentication**: Logs in with new password; verifies all asset records, egg vault, and ledger are completely intact.

---

## 5. Coverage Thresholds

| Metric | Threshold Target | Status |
|---|---|---|
| Tier 1: Feature Coverage | >= 5 test cases per feature category (>= 35 total) | **Mandatory** |
| Tier 2: Boundary & Corner Cases | >= 5 test cases per category (>= 25 total) | **Mandatory** |
| Tier 3: Cross-Feature Combinations | Pairwise & end-to-end integration flows (>= 10 total) | **Mandatory** |
| Tier 4: Real-World Scenarios | 4 complete multi-stage user lifecycles | **Mandatory** |
| Overall Pass Rate | **100% Pass** (Exit Code 0) | **Mandatory** |

---

## 6. How to Run the Test Suite

Execute the master runner via Node.js from the project root:

```powershell
cd D:\allakermegg
node tests/run-all-tests.mjs
```

Or run any individual test tier directly:
```powershell
node tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs
node tests/tier2-boundary-corner/t2-boundary-asset-buy.test.mjs
node tests/tier3-combinations/t3-lifecycle-buy-harvest-sell.test.mjs
node tests/tier4-real-world-scenarios/t4-scenario1-full-farmer-journey.test.mjs
```
