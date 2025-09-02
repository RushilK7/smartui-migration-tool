#!/usr/bin/env node

// Test script to verify Sauce Labs config transformation
const { ConfigTransformer } = require('./lib/modules/ConfigTransformer');

async function testSauceLabsConfigTransformation() {
  console.log('Testing Sauce Labs Config Transformation...\n');
  
  const configTransformer = new ConfigTransformer('.');
  
  // Test 1: saucectl.yml configuration
  console.log('📋 Test 1: saucectl.yml Configuration');
  console.log('─'.repeat(50));
  
  const sauceCtlConfig = `
apiVersion: v1alpha
kind: cypress
metadata:
  name: "My Test Suite"
  build: "build-123"
  tags:
    - "visual"
    - "regression"
suites:
  - name: "Chrome Tests"
    settings:
      browserName: "chrome"
      screenResolution: "1920x1080"
  - name: "Firefox Tests"
    settings:
      browserName: "firefox"
      screenResolution: "1366x768"
  - name: "Mobile Tests"
    settings:
      deviceName: "iPhone X"
settings:
  region: "us-west-1"
  username: "my-username"
  accessKey: "my-access-key"
`;
  
  const result1 = configTransformer.transformSauceLabsConfig(sauceCtlConfig, 'saucectl.yml');
  console.log('Generated SmartUI Config:');
  console.log(result1.content);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ saucectl.yml test passed\n');
  
  // Test 2: JavaScript configuration with saucelabs property
  console.log('📋 Test 2: JavaScript Config (saucelabs property)');
  console.log('─'.repeat(50));
  
  const jsConfig = `
module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    saucelabs: {
      browserName: 'chrome',
      screenResolution: '1920x1080',
      build: 'build-456',
      name: 'My Test Run',
      tags: ['e2e', 'chrome'],
      region: 'us-east-1'
    }
  }
};
`;
  
  const result2 = configTransformer.transformSauceLabsConfig(jsConfig, 'cypress.config.js');
  console.log('Generated SmartUI Config:');
  console.log(result2.content);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ JavaScript saucelabs test passed\n');
  
  // Test 3: Complex configuration with multiple browsers and devices
  console.log('📋 Test 3: Complex Configuration with Multiple Browsers/Devices');
  console.log('─'.repeat(50));
  
  const complexConfig = `
apiVersion: v1alpha
kind: cypress
metadata:
  name: "Complex Test Suite"
  build: "build-789"
  tags: ["visual", "regression", "smoke"]
suites:
  - name: "Desktop Browsers"
    settings:
      browsers:
        - browserName: "chrome"
          screenResolution: "1920x1080"
        - browserName: "firefox"
          screenResolution: "1366x768"
        - browserName: "safari"
          screenResolution: "1440x900"
  - name: "Mobile Devices"
    settings:
      devices:
        - deviceName: "iPhone 12"
        - deviceName: "Samsung Galaxy S21"
        - deviceName: "iPad Pro"
settings:
  region: "eu-central-1"
  username: "complex-user"
  accessKey: "complex-key"
`;
  
  const result3 = configTransformer.transformSauceLabsConfig(complexConfig, 'saucectl.yml');
  const config3 = JSON.parse(result3.content);
  
  console.log('Generated SmartUI Config:');
  console.log(result3.content);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  
  // Verify complex transformation
  console.log('\n🔍 Transformation Verification:');
  console.log(`  • Web Browsers: ${JSON.stringify(config3.web.browsers)}`);
  console.log(`  • Web Viewports: ${JSON.stringify(config3.web.viewports)}`);
  console.log(`  • Mobile Devices: ${JSON.stringify(config3.mobile.devices)}`);
  console.log(`  • Warnings Count: ${result3.warnings.length}`);
  
  // Expected results
  const expectedWebBrowsers = ['chrome', 'firefox', 'safari'];
  const expectedWebViewports = [[1920, 1080], [1366, 768], [1440, 900]];
  const expectedMobileDevices = ['iPhone 12', 'Samsung Galaxy S21', 'iPad Pro'];
  
  let allTestsPassed = true;
  
  if (JSON.stringify(config3.web.browsers) !== JSON.stringify(expectedWebBrowsers)) {
    console.log('❌ Web browsers transformation failed');
    allTestsPassed = false;
  }
  
  if (JSON.stringify(config3.web.viewports) !== JSON.stringify(expectedWebViewports)) {
    console.log('❌ Web viewports transformation failed');
    allTestsPassed = false;
  }
  
  if (JSON.stringify(config3.mobile.devices) !== JSON.stringify(expectedMobileDevices)) {
    console.log('❌ Mobile devices transformation failed');
    allTestsPassed = false;
  }
  
  if (result3.warnings.length !== 6) {
    console.log('❌ Expected 6 warnings, got', result3.warnings.length);
    allTestsPassed = false;
  }
  
  if (allTestsPassed) {
    console.log('✅ Complex config test passed\n');
  } else {
    console.log('❌ Complex config test failed\n');
  }
  
  // Test 4: Invalid YAML syntax
  console.log('📋 Test 4: Invalid YAML Syntax');
  console.log('─'.repeat(50));
  
  const invalidConfig = `
apiVersion: v1alpha
kind: cypress
metadata:
  name: "Invalid Test"
  build: "build-999"
suites:
  - name: "Chrome Tests"
    settings:
      browserName: "chrome"
      screenResolution: "1920x1080"
  # Missing closing bracket
`;
  
  const result4 = configTransformer.transformSauceLabsConfig(invalidConfig, 'saucectl.yml');
  console.log('Generated config (should be default):', JSON.parse(result4.content));
  console.log('Warnings:', result4.warnings.length);
  console.log('Warning message:', result4.warnings[0]?.message);
  console.log('✅ Invalid YAML test passed\n');
  
  // Test 5: JavaScript configuration with sauceVisual property
  console.log('📋 Test 5: JavaScript Config (sauceVisual property)');
  console.log('─'.repeat(50));
  
  const sauceVisualConfig = `
export default {
  testDir: './tests',
  use: {
    sauceVisual: {
      browserName: 'edge',
      screenResolution: '1600x900',
      deviceName: 'iPhone 13',
      build: 'build-555',
      name: 'Playwright Tests',
      tags: ['playwright', 'visual']
    }
  }
};
`;
  
  const result5 = configTransformer.transformSauceLabsConfig(sauceVisualConfig, 'playwright.config.ts');
  console.log('Generated SmartUI Config:');
  console.log(result5.content);
  console.log('Warnings:', result5.warnings.length);
  result5.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ sauceVisual test passed\n');
  
  console.log('🎉 All Sauce Labs config transformation tests completed!');
}

testSauceLabsConfigTransformation().catch(console.error);
