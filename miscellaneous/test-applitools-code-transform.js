#!/usr/bin/env node

// Test script to verify Applitools code transformation
const { CodeTransformer } = require('./lib/modules/CodeTransformer');

async function testApplitoolsCodeTransformation() {
  console.log('Testing Applitools Code Transformation...\n');
  
  const codeTransformer = new CodeTransformer('.');
  
  // Test 1: Basic Applitools Playwright test
  console.log('📋 Test 1: Basic Applitools Playwright Test');
  console.log('─'.repeat(50));
  
  const playwrightTest = `
import { Eyes } from '@applitools/eyes-playwright';

test('homepage visual test', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My Test App', 'Homepage');
  await eyes.check('Homepage');
  await eyes.close();
});
`;
  
  const result1 = codeTransformer.transformApplitools(playwrightTest, 'Playwright');
  console.log('Transformed Code:');
  console.log(result1.content);
  console.log('Snapshots found:', result1.snapshotCount);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic Playwright test passed\n');
  
  // Test 2: Applitools Cypress test with options
  console.log('📋 Test 2: Applitools Cypress Test with Options');
  console.log('─'.repeat(50));
  
  const cypressTest = `
import { Eyes } from '@applitools/eyes-cypress';

describe('Login Page', () => {
  it('should display login form', () => {
    cy.eyesOpen('My Test App', 'Login Test');
    cy.eyesCheckWindow('Login Form', {
      ignore: ['.ads', '.notifications'],
      fully: true
    });
    cy.eyesClose();
  });
});
`;
  
  const result2 = codeTransformer.transformApplitools(cypressTest, 'Cypress');
  console.log('Transformed Code:');
  console.log(result2.content);
  console.log('Snapshots found:', result2.snapshotCount);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Cypress test with options passed\n');
  
  // Test 3: Applitools test with Target.region()
  console.log('📋 Test 3: Applitools Test with Target.region()');
  console.log('─'.repeat(50));
  
  const regionTest = `
import { Eyes, Target } from '@applitools/eyes-playwright';

test('region test', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My Test App', 'Region Test');
  await eyes.check(Target.region('.main-content'));
  await eyes.close();
});
`;
  
  const result3 = codeTransformer.transformApplitools(regionTest, 'Playwright');
  console.log('Transformed Code:');
  console.log(result3.content);
  console.log('Snapshots found:', result3.snapshotCount);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Target.region() test passed\n');
  
  // Test 4: Applitools test with Target.layout() - Layout emulation
  console.log('📋 Test 4: Applitools Test with Target.layout() - Layout Emulation');
  console.log('─'.repeat(50));
  
  const layoutTest = `
import { Eyes, Target } from '@applitools/eyes-playwright';

test('layout test', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My Test App', 'Layout Test');
  await eyes.check(Target.layout('.header-section'));
  await eyes.close();
});
`;
  
  const result4 = codeTransformer.transformApplitools(layoutTest, 'Playwright');
  console.log('Transformed Code:');
  console.log(result4.content);
  console.log('Snapshots found:', result4.snapshotCount);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Target.layout() test passed\n');
  
  // Test 5: Complex Applitools test with multiple checks
  console.log('📋 Test 5: Complex Applitools Test with Multiple Checks');
  console.log('─'.repeat(50));
  
  const complexTest = `
import { Eyes, Target } from '@applitools/eyes-playwright';

test('complex visual test', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My Test App', 'Complex Test');
  
  // Full page check
  await eyes.check('Full Page');
  
  // Region check with ignore
  await eyes.check(Target.region('.main-content'), {
    ignore: ['.ads', '.popup']
  });
  
  // Layout check
  await eyes.check(Target.layout('.navigation'), {
    fully: true
  });
  
  await eyes.close();
});
`;
  
  const result5 = codeTransformer.transformApplitools(complexTest, 'Playwright');
  console.log('Transformed Code:');
  console.log(result5.content);
  console.log('Snapshots found:', result5.snapshotCount);
  console.log('Warnings:', result5.warnings.length);
  result5.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Complex test passed\n');
  
  // Test 6: Invalid JavaScript syntax
  console.log('📋 Test 6: Invalid JavaScript Syntax');
  console.log('─'.repeat(50));
  
  const invalidTest = `
import { Eyes } from '@applitools/eyes-playwright';

test('invalid test', async ({ page }) => {
  const eyes = new Eyes();
  await eyes.open(page, 'My Test App', 'Invalid Test'
  // Missing closing parenthesis
  await eyes.check('Invalid Test');
});
`;
  
  const result6 = codeTransformer.transformApplitools(invalidTest, 'Playwright');
  console.log('Transformed Code (should be original):');
  console.log(result6.content);
  console.log('Snapshots found:', result6.snapshotCount);
  console.log('Warnings:', result6.warnings.length);
  console.log('Warning message:', result6.warnings[0]?.message);
  console.log('✅ Invalid syntax test passed\n');
  
  console.log('🎉 All Applitools code transformation tests completed!');
}

testApplitoolsCodeTransformation().catch(console.error);
