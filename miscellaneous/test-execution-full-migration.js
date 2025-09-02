#!/usr/bin/env node

// Test script to verify full migration workflow with execution transformation
const fs = require('fs').promises;
const path = require('path');

async function createMockProjectWithExecution() {
  const testDir = path.join(__dirname, 'test-execution-migration');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create package.json with Percy scripts
    const packageJson = {
      name: 'test-execution-migration',
      version: '1.0.0',
      scripts: {
        'test': 'percy exec -- cypress run',
        'test:open': 'percy exec -- cypress open',
        'test:playwright': 'playwright test',
        'build': 'webpack --mode production'
      },
      dependencies: {
        '@percy/cypress': '^3.0.0',
        'cypress': '^12.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create GitHub Actions workflow
    const githubWorkflow = `name: Visual Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    env:
      PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}
      PERCY_PROJECT: my-project
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Run Percy tests
      run: percy exec -- cypress run
    
    - name: Run Playwright tests
      run: playwright test
`;
    
    await fs.mkdir(path.join(testDir, '.github', 'workflows'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, '.github', 'workflows', 'visual-tests.yml'),
      githubWorkflow
    );
    
    // Create .percy.yml config
    const percyConfig = `
version: 2
snapshot:
  widths: [1280, 375]
  min-height: 1024
  percy-css: |
    .dynamic-content { display: none; }
`;
    
    await fs.writeFile(
      path.join(testDir, '.percy.yml'),
      percyConfig
    );
    
    // Create Cypress test file
    await fs.mkdir(path.join(testDir, 'cypress', 'e2e'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'visual.cy.js'),
      `import '@percy/cypress';

describe('Visual Tests', () => {
  it('should capture homepage', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });
  
  it('should capture login page', () => {
    cy.visit('/login');
    cy.percySnapshot('Login Page');
  });
});`
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock project:', error);
    return null;
  }
}

async function testFullExecutionMigration() {
  console.log('Testing Full Execution Migration Workflow...\n');
  
  const testDir = await createMockProjectWithExecution();
  if (!testDir) {
    console.log('❌ Failed to create mock project');
    return;
  }
  
  try {
    console.log('📁 Created mock project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • package.json (with Percy scripts)');
    console.log('  • .github/workflows/visual-tests.yml (GitHub Actions)');
    console.log('  • .percy.yml (Percy configuration)');
    console.log('  • cypress/e2e/visual.cy.js (Cypress tests)');
    
    console.log('\n🚀 To test the full migration workflow, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected behavior:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Cypress)');
    console.log('  3. ✅ Configuration transformation (.percy.yml → .smartui.json)');
    console.log('  4. ✅ Code transformation (cy.percySnapshot → smartuiSnapshot)');
    console.log('  5. ✅ Execution transformation (package.json + CI/CD)');
    console.log('  6. ✅ Generated .smartui.json content logged');
    console.log('  7. ✅ Interactive prompt (unless --yes flag used)');
    
    console.log('\n🔍 Expected Execution Transformations:');
    console.log('  • package.json: percy exec -- cypress run → npx smartui exec -- cypress run');
    console.log('  • package.json: playwright test → npx smartui exec -- playwright test');
    console.log('  • CI/CD: percy exec -- cypress run → npx smartui exec -- cypress run');
    console.log('  • CI/CD: PERCY_TOKEN → # MIGRATION-NOTE: PERCY_TOKEN');
    console.log('  • CI/CD: Add PROJECT_TOKEN, LT_USERNAME, LT_ACCESS_KEY');
    
    console.log('\n📊 Expected Results:');
    console.log('  • Total snapshots transformed: 2');
    console.log('  • Files processed: 4 (config, source, package.json, CI/CD)');
    console.log('  • Warnings: 0 (all transformations supported)');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testFullExecutionMigration().catch(console.error);
