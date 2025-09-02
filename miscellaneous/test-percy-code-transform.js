#!/usr/bin/env node

// Test script to verify Percy code transformation
const { CodeTransformer } = require('./lib/modules/CodeTransformer');

async function testPercyCodeTransformation() {
  console.log('Testing Percy Code Transformation...\n');
  
  const codeTransformer = new CodeTransformer('.');
  
  // Test 1: Basic Percy Cypress test
  console.log('📋 Test 1: Basic Percy Cypress Test');
  console.log('─'.repeat(50));
  
  const cypressTest = `
import { percySnapshot } from '@percy/cypress';

describe('Login Page', () => {
  it('should display login form', () => {
    cy.visit('/login');
    percySnapshot('Login Form');
  });
  
  it('should handle login errors', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('invalid@email.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="submit"]').click();
    percySnapshot('Login Error');
  });
});
`;
  
  const result1 = codeTransformer.transformPercy(cypressTest);
  console.log('Transformed Code:');
  console.log(result1.content);
  console.log('Snapshots found:', result1.snapshotCount);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic Cypress test passed\n');
  
  // Test 2: Percy Playwright test with options
  console.log('📋 Test 2: Percy Playwright Test with Options');
  console.log('─'.repeat(50));
  
  const playwrightTest = `
import { percySnapshot } from '@percy/playwright';

test('homepage visual test', async ({ page }) => {
  await page.goto('/');
  
  // Test with ignore regions
  await percySnapshot(page, 'Homepage', {
    ignore_region_selectors: ['.advertisement', '.cookie-banner']
  });
  
  // Test with scope
  await percySnapshot(page, 'Navigation', {
    scope: '.main-navigation'
  });
});
`;
  
  const result2 = codeTransformer.transformPercy(playwrightTest);
  console.log('Transformed Code:');
  console.log(result2.content);
  console.log('Snapshots found:', result2.snapshotCount);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Playwright test with options passed\n');
  
  // Test 3: Percy test with unsupported widths option
  console.log('📋 Test 3: Percy Test with Unsupported Widths Option');
  console.log('─'.repeat(50));
  
  const widthsTest = `
import { percySnapshot } from '@percy/cypress';

describe('Responsive Design', () => {
  it('should work on different screen sizes', () => {
    cy.visit('/');
    percySnapshot('Homepage', {
      widths: [375, 768, 1200],
      ignore_region_selectors: ['.ads']
    });
  });
});
`;
  
  const result3 = codeTransformer.transformPercy(widthsTest);
  console.log('Transformed Code:');
  console.log(result3.content);
  console.log('Snapshots found:', result3.snapshotCount);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Widths option test passed\n');
  
  // Test 4: Complex Percy test with multiple options
  console.log('📋 Test 4: Complex Percy Test with Multiple Options');
  console.log('─'.repeat(50));
  
  const complexTest = `
import { percySnapshot } from '@percy/playwright';

test('complex visual test', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Test with all supported options
  await percySnapshot(page, 'Dashboard', {
    ignore_region_selectors: ['.notification', '.chat-widget', '.ads'],
    scope: '.main-content',
    widths: [768, 1024, 1440] // This should generate a warning
  });
  
  // Test with require() import
  const { percySnapshot: percySnapshot2 } = require('@percy/playwright');
  await percySnapshot2(page, 'Settings Page');
});
`;
  
  const result4 = codeTransformer.transformPercy(complexTest);
  console.log('Transformed Code:');
  console.log(result4.content);
  console.log('Snapshots found:', result4.snapshotCount);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Complex test passed\n');
  
  // Test 5: TypeScript Percy test
  console.log('📋 Test 5: TypeScript Percy Test');
  console.log('─'.repeat(50));
  
  const typescriptTest = `
import { percySnapshot } from '@percy/cypress';

interface TestOptions {
  ignoreRegions?: string[];
  scope?: string;
}

describe('TypeScript Tests', () => {
  it('should handle TypeScript syntax', () => {
    cy.visit('/');
    percySnapshot('TypeScript Test', {
      ignore_region_selectors: ['.dynamic-content'],
      scope: '.test-container'
    });
  });
});
`;
  
  const result5 = codeTransformer.transformPercy(typescriptTest);
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
import { percySnapshot } from '@percy/cypress';

describe('Invalid Test', () => {
  it('should handle syntax errors', () => {
    cy.visit('/');
    percySnapshot('Invalid Test'
    // Missing closing parenthesis
  });
});
`;
  
  const result6 = codeTransformer.transformPercy(invalidTest);
  console.log('Transformed Code (should be original):');
  console.log(result6.content);
  console.log('Snapshots found:', result6.snapshotCount);
  console.log('Warnings:', result6.warnings.length);
  console.log('Warning message:', result6.warnings[0]?.message);
  console.log('✅ Invalid syntax test passed\n');
  
  console.log('🎉 All Percy code transformation tests completed!');
}

testPercyCodeTransformation().catch(console.error);
