import { CodeTransformer } from '../src/modules/CodeTransformer';
import { DetectionResult } from '../src/types';

describe('CodeTransformer', () => {
  let transformer: CodeTransformer;

  beforeEach(() => {
    transformer = new CodeTransformer();
  });

  describe('Percy JavaScript/TypeScript Transformation', () => {
    it('should transform Percy Cypress commands', () => {
      const sourceCode = `
describe('My Test Suite', () => {
  it('should take a snapshot', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
    cy.percySnapshot('Homepage', { widths: [1280, 375] });
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.cy.js', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Percy Playwright commands', () => {
      const sourceCode = `
import { test } from '@playwright/test';

test('should take a snapshot', async ({ page }) => {
  await page.goto('/');
  await page.percySnapshot('Homepage');
  await page.percySnapshot('Homepage', { widths: [1280, 375] });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Playwright',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.spec.ts', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Percy Selenium commands', () => {
      const sourceCode = `
const { Builder } = require('selenium-webdriver');
const percy = require('@percy/selenium-webdriver');

describe('My Test Suite', () => {
  it('should take a snapshot', async () => {
    const driver = await new Builder().forBrowser('chrome').build();
    await driver.get('/');
    await percy.screenshot(driver, 'Homepage');
    await percy.screenshot(driver, 'Homepage', { widths: [1280, 375] });
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Selenium',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.js', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Applitools JavaScript/TypeScript Transformation', () => {
    it('should transform Applitools Cypress commands', () => {
      const sourceCode = `
describe('My Test Suite', () => {
  it('should take a snapshot', () => {
    cy.visit('/');
    cy.eyesOpen({ appName: 'My App', testName: 'My Test' });
    cy.eyesCheckWindow('Homepage');
    cy.eyesCheckWindow('Homepage', { tag: 'homepage', target: 'window' });
    cy.eyesClose();
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.cy.js', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Applitools Playwright commands', () => {
      const sourceCode = `
import { test } from '@playwright/test';
import { Eyes } from '@applitools/eyes-playwright';

test('should take a snapshot', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My App', 'My Test');
  await page.goto('/');
  await eyes.check('Homepage');
  await eyes.check('Homepage', { tag: 'homepage', target: 'window' });
  await eyes.close();
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Playwright',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.spec.ts', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Sauce Labs JavaScript/TypeScript Transformation', () => {
    it('should transform Sauce Labs Cypress commands', () => {
      const sourceCode = `
describe('My Test Suite', () => {
  it('should take a snapshot', () => {
    cy.visit('/');
    cy.screenerStep('Homepage');
    cy.screenerStep('Homepage', { state: 'homepage' });
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Sauce Labs Visual',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.cy.js', sourceCode, detectionResult);

      expect(result.content).toMatchSnapshot();
      expect(result.snapshotCount).toBe(2);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JavaScript syntax', () => {
      const invalidCode = `
describe('My Test Suite', () => {
  it('should take a snapshot', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage';
    // Missing closing parenthesis
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.cy.js', invalidCode, detectionResult);

      expect(result.content).toBe(invalidCode);
      expect(result.snapshotCount).toBe(0);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Failed to parse JavaScript');
    });

    it('should handle empty file', () => {
      const emptyCode = '';

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.cy.js', emptyCode, detectionResult);

      expect(result.content).toBe(emptyCode);
      expect(result.snapshotCount).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle unsupported file type', () => {
      const sourceCode = 'console.log("test");';

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.txt', sourceCode, detectionResult);

      expect(result.content).toBe(sourceCode);
      expect(result.snapshotCount).toBe(0);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Import Transformation', () => {
    it('should transform Percy imports', () => {
      const sourceCode = `
import { Builder } from 'selenium-webdriver';
import percy from '@percy/selenium-webdriver';

describe('My Test Suite', () => {
  it('should take a snapshot', async () => {
    const driver = await new Builder().forBrowser('chrome').build();
    await percy.screenshot(driver, 'Homepage');
  });
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Selenium',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.js', sourceCode, detectionResult);

      expect(result.content).toContain('@lambdatest/smartui-selenium');
      expect(result.content).not.toContain('@percy/selenium-webdriver');
      expect(result.snapshotCount).toBe(1);
    });

    it('should transform Applitools imports', () => {
      const sourceCode = `
import { Eyes } from '@applitools/eyes-playwright';

test('should take a snapshot', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.check('Homepage');
});
`;

      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Playwright',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCode('test.spec.ts', sourceCode, detectionResult);

      expect(result.content).toContain('@lambdatest/smartui-playwright');
      expect(result.content).not.toContain('@applitools/eyes-playwright');
      expect(result.snapshotCount).toBe(1);
    });
  });
});
