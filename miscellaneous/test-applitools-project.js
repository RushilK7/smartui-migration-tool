#!/usr/bin/env node

// Test script to verify the Scanner detects Applitools projects
const { Scanner } = require('./lib/modules/Scanner');
const fs = require('fs').promises;
const path = require('path');

async function createMockApplitoolsProject() {
  const testDir = path.join(__dirname, 'test-applitools-project');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a mock package.json with Applitools dependency
    const packageJson = {
      name: 'test-applitools-project',
      version: '1.0.0',
      dependencies: {
        '@applitools/eyes-playwright': '^1.0.0',
        'playwright': '^1.30.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create a mock tests directory
    await fs.mkdir(path.join(testDir, 'tests'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'tests', 'visual.spec.ts'),
      '// Mock Playwright test file'
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock project:', error);
    return null;
  }
}

async function testApplitoolsDetection() {
  console.log('Testing Applitools Detection...\n');
  
  const testDir = await createMockApplitoolsProject();
  if (!testDir) {
    console.log('❌ Failed to create mock project');
    return;
  }
  
  try {
    const scanner = new Scanner(testDir);
    const result = await scanner.scan();
    
    console.log('✅ Applitools detection successful!');
    console.log('Detection Result:', JSON.stringify(result, null, 2));
    
    // Verify the detection
    if (result.platform === 'Applitools' && result.framework === 'Playwright') {
      console.log('✅ Correctly detected Applitools + Playwright!');
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

testApplitoolsDetection().catch(console.error);
