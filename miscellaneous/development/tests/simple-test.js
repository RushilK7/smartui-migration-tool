#!/usr/bin/env node

/**
 * Simple Test Script
 * 
 * This script performs a basic test of the SmartUI Migration Tool CLI
 * to ensure it's working correctly.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function createTestProject() {
  const projectPath = path.join(__dirname, 'fixtures', 'simple-test');
  
  // Clean up existing project
  try {
    await fs.rm(projectPath, { recursive: true, force: true });
  } catch (error) {
    // Directory doesn't exist, that's fine
  }
  
  await fs.mkdir(projectPath, { recursive: true });
  
  // Create a simple test project
  await fs.writeFile(path.join(projectPath, 'package.json'), JSON.stringify({
    name: 'simple-test-project',
    dependencies: {
      '@percy/cypress': '^3.1.0'
    }
  }), 'utf-8');

  await fs.mkdir(path.join(projectPath, 'cypress', 'e2e'), { recursive: true });
  await fs.writeFile(path.join(projectPath, 'cypress/e2e/test.js'), `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`, 'utf-8');
  
  return projectPath;
}

async function runCLI(projectPath) {
  return new Promise((resolve, reject) => {
    const cliPath = path.join(__dirname, '..', 'bin', 'run');
    const child = spawn('node', [cliPath, 'migrate', '--yes'], {
      cwd: projectPath,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      resolve({
        code,
        stdout,
        stderr
      });
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

async function runTest() {
  console.log('🧪 Running Simple Test...');
  
  try {
    const projectPath = await createTestProject();
    console.log('✅ Test project created');
    
    const result = await runCLI(projectPath);
    console.log('✅ CLI execution completed');
    
    if (result.code === 0) {
      console.log('✅ Test PASSED - CLI executed successfully');
      console.log('📊 Output:', result.stdout.substring(0, 200) + '...');
    } else {
      console.log('❌ Test FAILED - CLI returned error code:', result.code);
      console.log('📊 Error:', result.stderr.substring(0, 200) + '...');
    }
    
    // Clean up
    await fs.rm(projectPath, { recursive: true, force: true });
    console.log('✅ Test project cleaned up');
    
  } catch (error) {
    console.error('❌ Test FAILED with error:', error.message);
  }
}

// Run the test
if (require.main === module) {
  runTest();
}

module.exports = { runTest };
