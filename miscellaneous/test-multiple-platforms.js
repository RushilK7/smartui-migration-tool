#!/usr/bin/env node

// Test script to verify the Scanner detects multiple platforms error
const { Scanner } = require('./lib/modules/Scanner');
const fs = require('fs').promises;
const path = require('path');

async function createMockMultiplePlatformsProject() {
  const testDir = path.join(__dirname, 'test-multiple-platforms');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create a mock package.json with BOTH Percy and Applitools dependencies
    const packageJson = {
      name: 'test-multiple-platforms',
      version: '1.0.0',
      dependencies: {
        '@percy/cypress': '^1.0.0',
        '@applitools/eyes-cypress': '^1.0.0',
        'cypress': '^10.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock project:', error);
    return null;
  }
}

async function testMultiplePlatformsError() {
  console.log('Testing Multiple Platforms Error...\n');
  
  const testDir = await createMockMultiplePlatformsProject();
  if (!testDir) {
    console.log('❌ Failed to create mock project');
    return;
  }
  
  try {
    const scanner = new Scanner(testDir);
    const result = await scanner.scan();
    
    console.log('❌ Expected error but got result:', result);
    
  } catch (error) {
    if (error.name === 'MultiplePlatformsDetectedError') {
      console.log('✅ Correctly detected multiple platforms error!');
      console.log('Error message:', error.message);
    } else {
      console.log('❌ Unexpected error type:', error.name);
      console.log('Error message:', error.message);
    }
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

testMultiplePlatformsError().catch(console.error);
