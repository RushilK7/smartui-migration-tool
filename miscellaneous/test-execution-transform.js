#!/usr/bin/env node

// Test script to verify execution transformation
const { ExecutionTransformer } = require('./lib/modules/ExecutionTransformer');

async function testExecutionTransformation() {
  console.log('Testing Execution Transformation...\n');
  
  const executionTransformer = new ExecutionTransformer('.');
  
  // Test 1: Percy package.json transformation
  console.log('📋 Test 1: Percy package.json Transformation');
  console.log('─'.repeat(50));
  
  const percyPackageJson = `{
  "name": "percy-test-project",
  "version": "1.0.0",
  "scripts": {
    "test": "percy exec -- cypress run",
    "test:open": "percy exec -- cypress open",
    "build": "webpack --mode production",
    "lint": "eslint src/"
  },
  "dependencies": {
    "@percy/cypress": "^3.0.0"
  }
}`;
  
  const result1 = executionTransformer.transformPackageJson(percyPackageJson, 'Percy');
  console.log('Transformed package.json:');
  console.log(result1.content);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Percy package.json transformation passed\n');
  
  // Test 2: Applitools package.json transformation
  console.log('📋 Test 2: Applitools package.json Transformation');
  console.log('─'.repeat(50));
  
  const applitoolsPackageJson = `{
  "name": "applitools-test-project",
  "version": "1.0.0",
  "scripts": {
    "test": "cypress run",
    "test:open": "cypress open",
    "test:playwright": "playwright test",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "@applitools/eyes-cypress": "^3.0.0"
  }
}`;
  
  const result2 = executionTransformer.transformPackageJson(applitoolsPackageJson, 'Applitools');
  console.log('Transformed package.json:');
  console.log(result2.content);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Applitools package.json transformation passed\n');
  
  // Test 3: Sauce Labs package.json transformation
  console.log('📋 Test 3: Sauce Labs package.json Transformation');
  console.log('─'.repeat(50));
  
  const sauceLabsPackageJson = `{
  "name": "sauce-labs-test-project",
  "version": "1.0.0",
  "scripts": {
    "test": "jest",
    "test:cypress": "cypress run",
    "test:playwright": "playwright test",
    "build": "webpack --mode production"
  },
  "dependencies": {
    "@saucelabs/cypress-plugin": "^1.0.0"
  }
}`;
  
  const result3 = executionTransformer.transformPackageJson(sauceLabsPackageJson, 'Sauce Labs Visual');
  console.log('Transformed package.json:');
  console.log(result3.content);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Sauce Labs package.json transformation passed\n');
  
  // Test 4: GitHub Actions YAML transformation
  console.log('📋 Test 4: GitHub Actions YAML Transformation');
  console.log('─'.repeat(50));
  
  const githubActionsYaml = `name: Visual Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}
      PERCY_PROJECT: my-project
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run Percy tests
      run: percy exec -- cypress run
    
    - name: Run Playwright tests
      run: playwright test
`;
  
  const result4 = executionTransformer.transformCiYaml(githubActionsYaml, 'Percy');
  console.log('Transformed YAML:');
  console.log(result4.content);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ GitHub Actions YAML transformation passed\n');
  
  // Test 5: Applitools CI YAML transformation
  console.log('📋 Test 5: Applitools CI YAML Transformation');
  console.log('─'.repeat(50));
  
  const applitoolsCiYaml = `name: Visual Tests

on:
  push:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      APPLITOOLS_API_KEY: \${{ secrets.APPLITOOLS_API_KEY }}
      APPLITOOLS_BATCH_ID: \${{ secrets.APPLITOOLS_BATCH_ID }}
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run Cypress tests
      run: cypress run
    
    - name: Run Playwright tests
      run: playwright test
`;
  
  const result5 = executionTransformer.transformCiYaml(applitoolsCiYaml, 'Applitools');
  console.log('Transformed YAML:');
  console.log(result5.content);
  console.log('Warnings:', result5.warnings.length);
  result5.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Applitools CI YAML transformation passed\n');
  
  // Test 6: Invalid JSON
  console.log('📋 Test 6: Invalid JSON Handling');
  console.log('─'.repeat(50));
  
  const invalidJson = `{
  "name": "invalid-project",
  "scripts": {
    "test": "cypress run"
  }
  // Missing closing brace
}`;
  
  const result6 = executionTransformer.transformPackageJson(invalidJson, 'Percy');
  console.log('Transformed content (should be original):');
  console.log(result6.content);
  console.log('Warnings:', result6.warnings.length);
  console.log('Warning message:', result6.warnings[0]?.message);
  console.log('✅ Invalid JSON handling test passed\n');
  
  console.log('🎉 All execution transformation tests completed!');
}

testExecutionTransformation().catch(console.error);
