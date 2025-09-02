#!/usr/bin/env node

// Test script to verify Percy config transformation
const { ConfigTransformer } = require('./lib/modules/ConfigTransformer');
const fs = require('fs').promises;
const path = require('path');

async function createMockPercyConfig() {
  const testDir = path.join(__dirname, 'test-percy-config');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a mock .percy.yml file
    const percyConfig = `
version: 2
snapshot:
  widths: [1280, 768, 375]
  min-height: 600
  percy-css: |
    .ads { display: none; }
    .popup { visibility: hidden; }
  enable-javascript: true
discovery:
  allowed-hostnames:
    - localhost
    - example.com
    - staging.example.com
`;

    await fs.writeFile(
      path.join(testDir, '.percy.yml'),
      percyConfig
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Percy config:', error);
    return null;
  }
}

async function testPercyConfigTransformation() {
  console.log('Testing Percy Config Transformation...\n');
  
  const testDir = await createMockPercyConfig();
  if (!testDir) {
    console.log('❌ Failed to create mock Percy config');
    return;
  }
  
  try {
    const configTransformer = new ConfigTransformer(testDir);
    
    // Read the Percy config file
    const configFilePath = path.join(testDir, '.percy.yml');
    const configFileContent = await fs.readFile(configFilePath, 'utf-8');
    
    console.log('📄 Original Percy Configuration:');
    console.log('─'.repeat(50));
    console.log(configFileContent);
    console.log('─'.repeat(50));
    
    // Transform the config
    const result = configTransformer.transformPercyConfig(configFileContent);
    
    console.log('\n✅ Transformation completed successfully!');
    console.log('\n📄 Generated SmartUI Configuration:');
    console.log('─'.repeat(50));
    console.log(result.content);
    console.log('─'.repeat(50));
    
    // Display warnings
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Configuration Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`     ${warning.details}`);
        }
      });
    } else {
      console.log('\n✅ No warnings generated');
    }
    
    // Verify the transformation
    const smartUIConfig = JSON.parse(result.content);
    
    console.log('\n🔍 Transformation Verification:');
    console.log(`  • Viewports: ${JSON.stringify(smartUIConfig.web.viewports)}`);
    console.log(`  • Min Height: ${smartUIConfig.web.minHeight}`);
    console.log(`  • Allowed Hostnames: ${JSON.stringify(smartUIConfig.web.allowedHostnames)}`);
    console.log(`  • Warnings Count: ${result.warnings.length}`);
    
    // Expected results
    const expectedViewports = [[1280], [768], [375]];
    const expectedMinHeight = 600;
    const expectedHostnames = ['localhost', 'example.com', 'staging.example.com'];
    
    let allTestsPassed = true;
    
    if (JSON.stringify(smartUIConfig.web.viewports) !== JSON.stringify(expectedViewports)) {
      console.log('❌ Viewports transformation failed');
      allTestsPassed = false;
    }
    
    if (smartUIConfig.web.minHeight !== expectedMinHeight) {
      console.log('❌ Min height transformation failed');
      allTestsPassed = false;
    }
    
    if (JSON.stringify(smartUIConfig.web.allowedHostnames) !== JSON.stringify(expectedHostnames)) {
      console.log('❌ Allowed hostnames transformation failed');
      allTestsPassed = false;
    }
    
    if (result.warnings.length !== 2) {
      console.log('❌ Expected 2 warnings, got', result.warnings.length);
      allTestsPassed = false;
    }
    
    if (allTestsPassed) {
      console.log('\n🎉 All transformation tests passed!');
    } else {
      console.log('\n❌ Some transformation tests failed');
    }
    
  } catch (error) {
    console.log('❌ Transformation error:', error.message);
  } finally {
    // Clean up
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      console.log('\n🧹 Cleaned up test directory');
    } catch (cleanupError) {
      console.log('\n⚠️  Cleanup warning:', cleanupError.message);
    }
  }
}

testPercyConfigTransformation().catch(console.error);
