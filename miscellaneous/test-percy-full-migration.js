#!/usr/bin/env node

// Test script to verify full migration workflow with Percy code transformation
const fs = require('fs').promises;
const path = require('path');

async function createMockPercyProject() {
  const testDir = path.join(__dirname, 'test-percy-migration');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create package.json with Percy dependency
    const packageJson = {
      name: 'test-percy-migration',
      version: '1.0.0',
      dependencies: {
        '@percy/cypress': '^1.0.0',
        'cypress': '^12.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create .percy.yml
    const percyConfig = `
version: 2
snapshot:
  widths: [1280, 768, 375]
  min-height: 600
discovery:
  allowed-hostnames:
    - localhost
    - example.com
`;
    
    await fs.writeFile(
      path.join(testDir, '.percy.yml'),
      percyConfig
    );
    
    // Create Cypress test files
    await fs.mkdir(path.join(testDir, 'cypress', 'e2e'), { recursive: true });
    
    // Test file 1: Basic Percy test
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'login.cy.js'),
      `import { percySnapshot } from '@percy/cypress';

describe('Login Page', () => {
  it('should display login form', () => {
    cy.visit('/login');
    percySnapshot('Login Form');
  });
  
  it('should handle login errors', () => {
    cy.visit('/login');
    cy.get('[data-testid="email"]').type('invalid@email.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="submit"]').click();
    percySnapshot('Login Error');
  });
});`
    );
    
    // Test file 2: Percy test with options
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'dashboard.cy.js'),
      `import { percySnapshot } from '@percy/cypress';

describe('Dashboard', () => {
  it('should display dashboard with ignore regions', () => {
    cy.visit('/dashboard');
    percySnapshot('Dashboard', {
      ignore_region_selectors: ['.ads', '.notifications'],
      scope: '.main-content'
    });
  });
  
  it('should handle responsive design', () => {
    cy.visit('/');
    percySnapshot('Homepage', {
      widths: [375, 768, 1200],
      ignore_region_selectors: ['.cookie-banner']
    });
  });
});`
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Percy project:', error);
    return null;
  }
}

async function testFullPercyMigration() {
  console.log('Testing Full Percy Migration Workflow...\n');
  
  const testDir = await createMockPercyProject();
  if (!testDir) {
    console.log('❌ Failed to create mock Percy project');
    return;
  }
  
  try {
    console.log('📁 Created mock Percy project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • package.json (with @percy/cypress dependency)');
    console.log('  • .percy.yml (with configuration)');
    console.log('  • cypress/e2e/login.cy.js (with basic Percy snapshots)');
    console.log('  • cypress/e2e/dashboard.cy.js (with Percy options)');
    
    console.log('\n🚀 To test the full migration workflow, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected behavior:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Cypress)');
    console.log('  3. ✅ Configuration transformation (Percy → SmartUI)');
    console.log('  4. ✅ Code transformation (percySnapshot → smartuiSnapshot)');
    console.log('  5. ✅ Generated .smartui.json content logged');
    console.log('  6. ✅ Warnings about percy-css and widths options');
    console.log('  7. ✅ Interactive prompt (unless --yes flag used)');
    
    console.log('\n🔍 Expected Code Transformations:');
    console.log('  • Import: @percy/cypress → @lambdatest/smartui-cypress');
    console.log('  • Function: percySnapshot → smartuiSnapshot');
    console.log('  • Options: ignore_region_selectors → ignoreDOM.cssSelector');
    console.log('  • Options: scope → element.cssSelector');
    console.log('  • Warning: widths option not supported (per-snapshot)');
    
    console.log('\n📊 Expected Results:');
    console.log('  • Total snapshots transformed: 4');
    console.log('  • Files processed: 2 (login.cy.js, dashboard.cy.js)');
    console.log('  • Warnings: 1 (widths option)');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testFullPercyMigration().catch(console.error);
