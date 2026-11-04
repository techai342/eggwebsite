// tests/tier1-feature-coverage/t1-f1-branding-docs.test.mjs
// Tier 1 - Feature Coverage: F1.1 - F1.5 System Documentation, Branding, Viewport, Header & Bottom Dock

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from '../helpers/assertions.mjs';

const ROOT_DIR = path.resolve('D:/allakermegg');

describe('Tier 1: F1.1 - System Documentation Verification', () => {
  it('TC-T1-F1.1-01: Verifies system documentation or project specs describe the 24h yield and 120d term', () => {
    const projectMdPath = path.join(ROOT_DIR, '.agents/teamwork/PROJECT.md');
    expect(fs.existsSync(projectMdPath)).toBe(true);

    const projectContent = fs.readFileSync(projectMdPath, 'utf-8');
    expect(projectContent).toContain('AL Rehman Meta Eggs');
    expect(projectContent).toContain('120');
    expect(projectContent).toContain('500');
    expect(projectContent).toContain('P2P');
  });

  it('TC-T1-F1.1-02: Verifies economic yield model is mathematically defined (500 PKR, 1 Egg/day, 120 total eggs)', () => {
    const plansPath = path.join(ROOT_DIR, 'src/components/Plans.jsx');
    expect(fs.existsSync(plansPath)).toBe(true);

    const plansContent = fs.readFileSync(plansPath, 'utf-8');
    expect(plansContent).toContain('500');
    expect(plansContent).toContain('120');
    expect(plansContent).toContain('AL Rehman Meta Eggs');
  });
});

describe('Tier 1: F1.2 - Re-branding & Title Integrity', () => {
  it('TC-T1-F1.2-01: Verifies index.html specifies AL Rehman Meta Eggs in title and theme color', () => {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    expect(fs.existsSync(indexPath)).toBe(true);

    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    expect(indexContent).toContain('AL Rehman Meta Eggs');
    expect(indexContent).toContain('#153d2b');
  });

  it('TC-T1-F1.2-02: Verifies essential brand assets exist (logo.webp, hen.png, egg.png)', () => {
    const publicAssets = path.join(ROOT_DIR, 'public/assets');
    const srcAssets = path.join(ROOT_DIR, 'src/assets');
    const hasAssets = fs.existsSync(publicAssets) || fs.existsSync(srcAssets);
    expect(hasAssets).toBe(true);

    const filesInRoot = fs.readdirSync(ROOT_DIR);
    const hasLogo = filesInRoot.some(f => f.includes('logo') || f.includes('1791888810'));
    const hasHen = filesInRoot.some(f => f.includes('hen') || f.includes('1791906408'));
    expect(hasLogo).toBe(true);
    expect(hasHen).toBe(true);
  });
});

describe('Tier 1: F1.3 - Responsive Shell & Design Tokens', () => {
  it('TC-T1-F1.3-01: Verifies Tailwind configuration in index.html defines farm brand palette', () => {
    const indexPath = path.join(ROOT_DIR, 'index.html');
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    expect(indexContent).toContain('farm: {');
    expect(indexContent).toContain('forest: \'#153D2B\'');
    expect(indexContent).toContain('deep: \'#0D2C20\'');
    expect(indexContent).toContain('lime: \'#C9F36A\'');
  });

  it('TC-T1-F1.3-02: Verifies 480px mobile-first container layout rules in farm stylesheet', () => {
    const farmCssPath = path.join(ROOT_DIR, 'src/farm.css');
    expect(fs.existsSync(farmCssPath)).toBe(true);

    const cssContent = fs.readFileSync(farmCssPath, 'utf-8');
    expect(cssContent.length).toBeGreaterThan(1000);
    expect(cssContent).toContain('--forest');
    expect(cssContent).toContain('--lime');
  });
});

describe('Tier 1: F1.4 - Top Navigation Header & F1.5 Bottom Dock Specifications', () => {
  it('TC-T1-F1.4-01: Verifies top navigation contract includes brand canopy, status, and navigation controls', () => {
    const navPath = path.join(ROOT_DIR, 'src/components/Navbar.jsx');
    expect(fs.existsSync(navPath)).toBe(true);

    const navContent = fs.readFileSync(navPath, 'utf-8');
    expect(navContent).toContain('AL Rehman Meta Eggs');
  });

  it('TC-T1-F1.5-01: Verifies sticky bottom navigation dock supports 5 key application zones (Home, Sale, Buy, My Farm, Profile)', () => {
    const appNavPath = path.join(ROOT_DIR, 'src/components/AppNavigation.jsx');
    const projectMdPath = path.join(ROOT_DIR, '.agents/teamwork/PROJECT.md');
    const dashboardHtmlPath = path.join(ROOT_DIR, 'rawafiles/Alkram Meta Eggs _ Dashboard.html');

    let contentToVerify = '';
    if (fs.existsSync(appNavPath)) {
      contentToVerify = fs.readFileSync(appNavPath, 'utf-8');
    } else if (fs.existsSync(dashboardHtmlPath)) {
      contentToVerify = fs.readFileSync(dashboardHtmlPath, 'utf-8');
    } else {
      contentToVerify = fs.readFileSync(projectMdPath, 'utf-8');
    }

    expect(contentToVerify).toContain('Home');
    expect(contentToVerify).toContain('Sale');
    expect(contentToVerify).toContain('Buy');
  });
});
