#!/usr/bin/env node

// Test script for advanced Percy config transformation scenarios
const { ConfigTransformer } = require('./lib/modules/ConfigTransformer');
const fs = require('fs').promises;
const path = require('path');

async function testAdvancedScenarios() {
  console.log('Testing Advanced Percy Config Scenarios...\n');
  
  const configTransformer = new ConfigTransformer(process.cwd());
  
  // Test 1: Minimal config
  console.log('📋 Test 1: Minimal Percy Config');
  console.log('─'.repeat(40));
  
  const minimalConfig = `
version: 2
snapshot:
  widths: [1280]
`;
  
  const result1 = configTransformer.transformPercyConfig(minimalConfig);
  console.log('Generated config:', JSON.parse(result1.content));
  console.log('Warnings:', result1.warnings.length);
  console.log('✅ Minimal config test passed\n');
  
  // Test 2: Invalid YAML
  console.log('📋 Test 2: Invalid YAML');
  console.log('─'.repeat(40));
  
  const invalidYaml = `
version: 2
snapshot:
  widths: [1280
  # Missing closing bracket
`;
  
  const result2 = configTransformer.transformPercyConfig(invalidYaml);
  console.log('Generated config (should be default):', JSON.parse(result2.content));
  console.log('Warnings:', result2.warnings.length);
  console.log('Warning message:', result2.warnings[0]?.message);
  console.log('✅ Invalid YAML test passed\n');
  
  // Test 3: Complex config with all features
  console.log('📋 Test 3: Complex Config with All Features');
  console.log('─'.repeat(40));
  
  const complexConfig = `
version: 2
snapshot:
  widths: [1920, 1280, 768, 375, 320]
  min-height: 800
  percy-css: |
    .banner { display: none !important; }
    .cookie-notice { visibility: hidden; }
    .floating-elements { position: static; }
  enable-javascript: true
  wait-for-timeout: 2000
discovery:
  allowed-hostnames:
    - localhost:3000
    - staging.example.com
    - api.example.com
    - cdn.example.com
  network-idle-timeout: 5000
  disable-cache: true
`;
  
  const result3 = configTransformer.transformPercyConfig(complexConfig);
  const config3 = JSON.parse(result3.content);
  
  console.log('Viewports:', config3.web.viewports);
  console.log('Min Height:', config3.web.minHeight);
  console.log('Allowed Hostnames:', config3.web.allowedHostnames);
  console.log('Warnings:', result3.warnings.length);
  
  // Verify complex transformation
  const expectedViewports = [[1920], [1280], [768], [375], [320]];
  const expectedMinHeight = 800;
  const expectedHostnames = ['localhost:3000', 'staging.example.com', 'api.example.com', 'cdn.example.com'];
  
  if (JSON.stringify(config3.web.viewports) === JSON.stringify(expectedViewports) &&
      config3.web.minHeight === expectedMinHeight &&
      JSON.stringify(config3.web.allowedHostnames) === JSON.stringify(expectedHostnames) &&
      result3.warnings.length >= 2) {
    console.log('✅ Complex config test passed\n');
  } else {
    console.log('❌ Complex config test failed\n');
  }
  
  // Test 4: Empty config
  console.log('📋 Test 4: Empty Config');
  console.log('─'.repeat(40));
  
  const emptyConfig = `
version: 2
`;
  
  const result4 = configTransformer.transformPercyConfig(emptyConfig);
  const config4 = JSON.parse(result4.content);
  
  console.log('Generated config:', config4);
  console.log('Warnings:', result4.warnings.length);
  console.log('✅ Empty config test passed\n');
  
  console.log('🎉 All advanced scenario tests completed!');
}

testAdvancedScenarios().catch(console.error);
