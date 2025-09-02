#!/usr/bin/env node

// Test script to verify full migration workflow with Percy config
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
        'cypress': '^10.0.0'
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
  percy-css: |
    .ads { display: none; }
    .popup { visibility: hidden; }
  enable-javascript: true
discovery:
  allowed-hostnames:
    - localhost
    - example.com
`;
    
    await fs.writeFile(
      path.join(testDir, '.percy.yml'),
      percyConfig
    );
    
    // Create a simple Cypress test file
    await fs.mkdir(path.join(testDir, 'cypress'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'cypress', 'test.spec.js'),
      `// Mock Cypress test file
describe('Homepage', () => {
  it('should take a snapshot', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });
});`
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Percy project:', error);
    return null;
  }
}

async function testFullMigration() {
  console.log('Testing Full Migration Workflow...\n');
  
  const testDir = await createMockPercyProject();
  if (!testDir) {
    console.log('❌ Failed to create mock Percy project');
    return;
  }
  
  try {
    console.log('📁 Created mock Percy project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • package.json (with @percy/cypress dependency)');
    console.log('  • .percy.yml (with full configuration)');
    console.log('  • cypress/test.spec.js (with Percy snapshot)');
    
    console.log('\n🚀 To test the full migration workflow, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected behavior:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Cypress)');
    console.log('  3. ✅ Configuration transformation (Percy → SmartUI)');
    console.log('  4. ✅ Generated .smartui.json content logged');
    console.log('  5. ✅ Warnings about percy-css and enable-javascript');
    console.log('  6. ✅ Interactive prompt (unless --yes flag used)');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testFullMigration().catch(console.error);
