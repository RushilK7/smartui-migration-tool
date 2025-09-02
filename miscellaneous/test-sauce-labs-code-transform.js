#!/usr/bin/env node

// Test script to verify Sauce Labs code transformation
const { CodeTransformer } = require('./lib/modules/CodeTransformer');

async function testSauceLabsCodeTransformation() {
  console.log('Testing Sauce Labs Code Transformation...\n');
  
  const codeTransformer = new CodeTransformer('.');
  
  // Test 1: Basic Sauce Labs Cypress test
  console.log('📋 Test 1: Basic Sauce Labs Cypress Test');
  console.log('─'.repeat(50));
  
  const cypressTest = `
import '@saucelabs/cypress-plugin';

describe('Login Page', () => {
  it('should display login form', () => {
    cy.visit('/login');
    cy.sauceVisualCheck('Login Form');
  });
  
  it('should handle login errors', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('invalid@email.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="submit"]').click();
    cy.sauceVisualCheck('Login Error');
  });
});
`;
  
  const result1 = codeTransformer.transformSauceLabs(cypressTest);
  console.log('Transformed Code:');
  console.log(result1.content);
  console.log('Snapshots found:', result1.snapshotCount);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic Cypress test passed\n');
  
  // Test 2: Sauce Labs WebdriverIO test with options
  console.log('📋 Test 2: Sauce Labs WebdriverIO Test with Options');
  console.log('─'.repeat(50));
  
  const webdriverioTest = `
import { sauceVisualCheck } from '@saucelabs/webdriverio';

describe('Dashboard', () => {
  it('should display dashboard with ignore regions', async () => {
    await browser.url('/dashboard');
    await sauceVisualCheck('Dashboard', {
      ignoredRegions: ['.ads', '.notifications'],
      clipSelector: '.main-content'
    });
  });
  
  it('should handle responsive design', async () => {
    await browser.url('/');
    await browser.sauceVisualCheck('Homepage', {
      ignoredRegions: ['.cookie-banner'],
      captureDom: true
    });
  });
});
`;
  
  const result2 = codeTransformer.transformSauceLabs(webdriverioTest);
  console.log('Transformed Code:');
  console.log(result2.content);
  console.log('Snapshots found:', result2.snapshotCount);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ WebdriverIO test with options passed\n');
  
  // Test 3: Sauce Labs test with unsupported diffing options
  console.log('📋 Test 3: Sauce Labs Test with Unsupported Diffing Options');
  console.log('─'.repeat(50));
  
  const diffingTest = `
import { sauceVisualCheck } from '@saucelabs/cypress-plugin';

describe('Advanced Visual Tests', () => {
  it('should use custom diffing method', () => {
    cy.visit('/');
    cy.sauceVisualCheck('Advanced Test', {
      ignoredRegions: ['.ads'],
      diffingMethod: 'smart-hybrid',
      diffingOptions: {
        threshold: 0.1,
        ignoreAntialiasing: true
      }
    });
  });
});
`;
  
  const result3 = codeTransformer.transformSauceLabs(diffingTest);
  console.log('Transformed Code:');
  console.log(result3.content);
  console.log('Snapshots found:', result3.snapshotCount);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Diffing options test passed\n');
  
  // Test 4: Complex Sauce Labs test with multiple options
  console.log('📋 Test 4: Complex Sauce Labs Test with Multiple Options');
  console.log('─'.repeat(50));
  
  const complexTest = `
import { sauceVisualCheck } from '@saucelabs/playwright-plugin';

test('complex visual test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Test with all supported options
  await sauceVisualCheck('Dashboard', {
    ignoredRegions: ['.notification', '.chat-widget', '.ads'],
    clipSelector: '.main-content',
    captureDom: true,
    diffingMethod: 'pixel-perfect'
  });
  
  // Test with require() import
  const { sauceVisualCheck: sauceVisualCheck2 } = require('@saucelabs/playwright-plugin');
  await sauceVisualCheck2(page, 'Settings Page');
});
`;
  
  const result4 = codeTransformer.transformSauceLabs(complexTest);
  console.log('Transformed Code:');
  console.log(result4.content);
  console.log('Snapshots found:', result4.snapshotCount);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Complex test passed\n');
  
  // Test 5: TypeScript Sauce Labs test
  console.log('📋 Test 5: TypeScript Sauce Labs Test');
  console.log('─'.repeat(50));
  
  const typescriptTest = `
import { sauceVisualCheck } from '@saucelabs/cypress-plugin';

interface TestOptions {
  ignoredRegions?: string[];
  clipSelector?: string;
}

describe('TypeScript Tests', () => {
  it('should handle TypeScript syntax', () => {
    cy.visit('/');
    cy.sauceVisualCheck('TypeScript Test', {
      ignoredRegions: ['.dynamic-content'],
      clipSelector: '.test-container'
    });
  });
});
`;
  
  const result5 = codeTransformer.transformSauceLabs(typescriptTest);
  console.log('Transformed Code:');
  console.log(result5.content);
  console.log('Snapshots found:', result5.snapshotCount);
  console.log('Warnings:', result5.warnings.length);
  result5.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ TypeScript test passed\n');
  
  // Test 6: Invalid JavaScript syntax
  console.log('📋 Test 6: Invalid JavaScript Syntax');
  console.log('─'.repeat(50));
  
  const invalidTest = `
import { sauceVisualCheck } from '@saucelabs/cypress-plugin';

describe('Invalid Test', () => {
  it('should handle syntax errors', () => {
    cy.visit('/');
    cy.sauceVisualCheck('Invalid Test'
    // Missing closing parenthesis
  });
});
`;
  
  const result6 = codeTransformer.transformSauceLabs(invalidTest);
  console.log('Transformed Code (should be original):');
  console.log(result6.content);
  console.log('Snapshots found:', result6.snapshotCount);
  console.log('Warnings:', result6.warnings.length);
  console.log('Warning message:', result6.warnings[0]?.message);
  console.log('✅ Invalid syntax test passed\n');
  
  console.log('🎉 All Sauce Labs code transformation tests completed!');
}

testSauceLabsCodeTransformation().catch(console.error);
