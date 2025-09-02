#!/usr/bin/env node

// Test script to verify the Scanner detects Percy projects
const { Scanner } = require('./lib/modules/Scanner');
const fs = require('fs').promises;
const path = require('path');

async function createMockPercyProject() {
  const testDir = path.join(__dirname, 'test-percy-project');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a mock package.json with Percy dependency
    const packageJson = {
      name: 'test-percy-project',
      version: '1.0.0',
      dependencies: {
        '@percy/cypress': '^1.0.0',
        'cypress': '^10.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create a mock cypress directory
    await fs.mkdir(path.join(testDir, 'cypress'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'cypress', 'test.spec.js'),
      '// Mock Cypress test file'
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock project:', error);
    return null;
  }
}

async function testPercyDetection() {
  console.log('Testing Percy Detection...\n');
  
  const testDir = await createMockPercyProject();
  if (!testDir) {
    console.log('❌ Failed to create mock project');
    return;
  }
  
  try {
    const scanner = new Scanner(testDir);
    const result = await scanner.scan();
    
    console.log('✅ Percy detection successful!');
    console.log('Detection Result:', JSON.stringify(result, null, 2));
    
    // Verify the detection
    if (result.platform === 'Percy' && result.framework === 'Cypress') {
      console.log('✅ Correctly detected Percy + Cypress!');
    } else {
      console.log('❌ Detection incorrect:', result.platform, result.framework);
    }
    
  } catch (error) {
    console.log('❌ Scanner error:', error.message);
    console.log('Error type:', error.constructor.name);
  } finally {
    // Clean up
    try {
      await fs.rm(testDir, { recursive: true, force: true });
      console.log('🧹 Cleaned up test directory');
    } catch (cleanupError) {
      console.log('⚠️  Cleanup warning:', cleanupError.message);
    }
  }
}

testPercyDetection().catch(console.error);
