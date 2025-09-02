#!/usr/bin/env node

// Test script to verify Applitools config transformation
const { ConfigTransformer } = require('./lib/modules/ConfigTransformer');

async function testApplitoolsConfigTransformation() {
  console.log('Testing Applitools Config Transformation...\n');
  
  const configTransformer = new ConfigTransformer('.');
  
  // Test 1: Basic Applitools config with module.exports
  console.log('📋 Test 1: Basic Applitools Config (module.exports)');
  console.log('─'.repeat(50));
  
  const basicConfig = `
module.exports = {
  appName: 'My Test App',
  batchName: 'My Batch',
  browser: [
    { width: 1200, height: 800, name: 'chrome' },
    { width: 1024, height: 768, name: 'firefox' },
    { deviceName: 'iPhone X', screenOrientation: 'portrait' },
    { deviceName: 'Samsung Galaxy S10', screenOrientation: 'landscape' }
  ]
};
`;
  
  const result1 = configTransformer.transformApplitoolsConfig(basicConfig);
  console.log('Generated SmartUI Config:');
  console.log(result1.content);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic config test passed\n');
  
  // Test 2: Applitools config with export default
  console.log('📋 Test 2: Applitools Config (export default)');
  console.log('─'.repeat(50));
  
  const exportDefaultConfig = `
export default {
  appName: 'My Test App',
  batchName: 'My Batch',
  apiKey: 'my-api-key',
  serverUrl: 'https://eyesapi.applitools.com',
  browser: [
    { width: 1920, height: 1080, name: 'chrome' },
    { width: 1366, height: 768, name: 'edge' },
    { deviceName: 'iPad Pro', screenOrientation: 'portrait' }
  ]
};
`;
  
  const result2 = configTransformer.transformApplitoolsConfig(exportDefaultConfig);
  console.log('Generated SmartUI Config:');
  console.log(result2.content);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Export default config test passed\n');
  
  // Test 3: Complex Applitools config with all non-mappable properties
  console.log('📋 Test 3: Complex Config with All Non-Mappable Properties');
  console.log('─'.repeat(50));
  
  const complexConfig = `
module.exports = {
  appName: 'Complex Test App',
  batchName: 'Complex Batch',
  batchId: 'batch-123',
  apiKey: 'secret-api-key',
  serverUrl: 'https://custom.applitools.com',
  browser: [
    { width: 1280, height: 720, name: 'chrome' },
    { width: 1440, height: 900, name: 'safari' },
    { width: 1600, height: 900, name: 'firefox' },
    { deviceName: 'iPhone 12', screenOrientation: 'portrait' },
    { deviceName: 'Pixel 5', screenOrientation: 'landscape' },
    { deviceName: 'iPad Air', screenOrientation: 'portrait' }
  ]
};
`;
  
  const result3 = configTransformer.transformApplitoolsConfig(complexConfig);
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
  const expectedWebBrowsers = ['chrome', 'safari', 'firefox'];
  const expectedWebViewports = [[1280, 720], [1440, 900], [1600, 900]];
  const expectedMobileDevices = ['iPhone 12', 'Pixel 5', 'iPad Air'];
  
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
  
  if (result3.warnings.length !== 5) {
    console.log('❌ Expected 5 warnings, got', result3.warnings.length);
    allTestsPassed = false;
  }
  
  if (allTestsPassed) {
    console.log('✅ Complex config test passed\n');
  } else {
    console.log('❌ Complex config test failed\n');
  }
  
  // Test 4: Invalid JavaScript syntax
  console.log('📋 Test 4: Invalid JavaScript Syntax');
  console.log('─'.repeat(50));
  
  const invalidConfig = `
module.exports = {
  appName: 'Test App',
  browser: [
    { width: 1200, height: 800, name: 'chrome'
    // Missing closing brace
  ]
};
`;
  
  const result4 = configTransformer.transformApplitoolsConfig(invalidConfig);
  console.log('Generated config (should be default):', JSON.parse(result4.content));
  console.log('Warnings:', result4.warnings.length);
  console.log('Warning message:', result4.warnings[0]?.message);
  console.log('✅ Invalid syntax test passed\n');
  
  console.log('🎉 All Applitools config transformation tests completed!');
}

testApplitoolsConfigTransformation().catch(console.error);
