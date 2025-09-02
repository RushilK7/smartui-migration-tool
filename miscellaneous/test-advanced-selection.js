#!/usr/bin/env node

// Test script to verify advanced file selection functionality
const fs = require('fs').promises;
const path = require('path');

async function createMockProjectForAdvancedSelection() {
  const testDir = path.join(__dirname, 'test-advanced-selection');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create package.json with Percy scripts
    const packageJson = {
      name: 'test-advanced-selection',
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
    
    // Create multiple Cypress test files
    await fs.mkdir(path.join(testDir, 'cypress', 'e2e'), { recursive: true });
    
    // Test file 1: Homepage tests
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'homepage.cy.js'),
      `import '@percy/cypress';

describe('Homepage Visual Tests', () => {
  it('should capture homepage', () => {
    cy.visit('/');
    cy.percySnapshot('Homepage');
  });
  
  it('should capture homepage with mobile view', () => {
    cy.visit('/');
    cy.viewport(375, 667);
    cy.percySnapshot('Homepage Mobile');
  });
});`
    );
    
    // Test file 2: Login tests
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'login.cy.js'),
      `import '@percy/cypress';

describe('Login Visual Tests', () => {
  it('should capture login page', () => {
    cy.visit('/login');
    cy.percySnapshot('Login Page');
  });
  
  it('should capture login form', () => {
    cy.visit('/login');
    cy.get('#login-form').should('be.visible');
    cy.percySnapshot('Login Form');
  });
});`
    );
    
    // Test file 3: Dashboard tests
    await fs.writeFile(
      path.join(testDir, 'cypress', 'e2e', 'dashboard.cy.js'),
      `import '@percy/cypress';

describe('Dashboard Visual Tests', () => {
  it('should capture dashboard', () => {
    cy.visit('/dashboard');
    cy.percySnapshot('Dashboard', {
      widths: [1280, 375],
      ignore: ['.dynamic-content']
    });
  });
  
  it('should capture dashboard with data', () => {
    cy.visit('/dashboard');
    cy.get('[data-testid="dashboard-content"]').should('be.visible');
    cy.percySnapshot('Dashboard with Data');
  });
});`
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock project:', error);
    return null;
  }
}

async function testAdvancedFileSelection() {
  console.log('Testing Advanced File Selection Functionality...\n');
  
  const testDir = await createMockProjectForAdvancedSelection();
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
    console.log('  • cypress/e2e/homepage.cy.js (2 snapshots)');
    console.log('  • cypress/e2e/login.cy.js (2 snapshots)');
    console.log('  • cypress/e2e/dashboard.cy.js (2 snapshots)');
    
    console.log('\n🚀 To test the advanced file selection, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate');
    console.log('\n   (Do NOT use --yes flag to see the interactive prompts)');
    
    console.log('\n📋 Expected Workflow:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Cypress)');
    console.log('  3. ✅ Analysis report displayed with 6 files total');
    console.log('  4. ✅ Migration scope prompt:');
    console.log('     • "Migrate all 5 modified and 1 new files"');
    console.log('     • "Select a specific subset of files to migrate (for a targeted POC)"');
    console.log('     • "Cancel migration"');
    console.log('  5. ✅ If "Select subset" chosen:');
    console.log('     • Interactive checkbox with grouped files:');
    console.log('     • --- Configuration Files ---');
    console.log('     • 🆕 .smartui.json (CREATE)');
    console.log('     • --- Source Code Files ---');
    console.log('     • ✏️ cypress/e2e/homepage.cy.js (MODIFY)');
    console.log('     • ✏️ cypress/e2e/login.cy.js (MODIFY)');
    console.log('     • ✏️ cypress/e2e/dashboard.cy.js (MODIFY)');
    console.log('     • --- Package Files ---');
    console.log('     • ✏️ package.json (MODIFY)');
    console.log('     • --- CI/CD Files ---');
    console.log('     • ✏️ .github/workflows/visual-tests.yml (MODIFY)');
    console.log('  6. ✅ Selection summary displayed');
    console.log('  7. ✅ Migration proceeds with selected files only');
    
    console.log('\n🔍 Test Scenarios:');
    console.log('  📋 Scenario 1: Select all files');
    console.log('    • Choose "Migrate all files"');
    console.log('    • Should proceed with all 6 files');
    console.log('  📋 Scenario 2: Select subset for POC');
    console.log('    • Choose "Select subset"');
    console.log('    • Select only homepage.cy.js and package.json');
    console.log('    • Should proceed with 3 files (2 selected + .smartui.json)');
    console.log('  📋 Scenario 3: Cancel migration');
    console.log('    • Choose "Cancel migration"');
    console.log('    • Should exit gracefully');
    
    console.log('\n📊 Expected Analysis Results:');
    console.log('  • Files to create: 1 (.smartui.json)');
    console.log('  • Files to modify: 5 (3 test files + package.json + CI/CD)');
    console.log('  • Snapshots to migrate: 6 (2 per test file)');
    console.log('  • Warnings: 1 (Percy CSS warning)');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testAdvancedFileSelection().catch(console.error);
