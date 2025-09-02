#!/usr/bin/env node

// Test script to verify Storybook migration functionality
const fs = require('fs').promises;
const path = require('path');

async function createMockStorybookProject() {
  const testDir = path.join(__dirname, 'test-storybook-migration');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create package.json with Percy Storybook scripts
    const packageJson = {
      name: 'test-storybook-migration',
      version: '1.0.0',
      scripts: {
        'storybook': 'start-storybook -p 6006',
        'build-storybook': 'build-storybook',
        'test:visual': 'percy storybook --build-dir=storybook-static',
        'test:visual:ci': 'percy storybook --build-dir=storybook-static --parallel=3'
      },
      dependencies: {
        '@percy/storybook': '^3.0.0',
        '@storybook/react': '^6.5.0',
        'react': '^18.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create .storybook directory with main.js
    await fs.mkdir(path.join(testDir, '.storybook'), { recursive: true });
    const storybookMain = `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-docs'
  ],
  framework: '@storybook/react'
};`;
    
    await fs.writeFile(
      path.join(testDir, '.storybook', 'main.js'),
      storybookMain
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
    
    // Create GitHub Actions workflow
    const githubWorkflow = `name: Storybook Visual Tests

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
      PERCY_PROJECT: my-storybook-project
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm install
    
    - name: Build Storybook
      run: npm run build-storybook
    
    - name: Run Percy Storybook tests
      run: npm run test:visual:ci
`;
    
    await fs.mkdir(path.join(testDir, '.github', 'workflows'), { recursive: true });
    await fs.writeFile(
      path.join(testDir, '.github', 'workflows', 'storybook-visual-tests.yml'),
      githubWorkflow
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Storybook project:', error);
    return null;
  }
}

async function testStorybookMigration() {
  console.log('Testing Storybook Migration Functionality...\n');
  
  const testDir = await createMockStorybookProject();
  if (!testDir) {
    console.log('❌ Failed to create mock Storybook project');
    return;
  }
  
  try {
    console.log('📁 Created mock Storybook project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • package.json (with Percy Storybook scripts)');
    console.log('  • .storybook/main.js (Storybook configuration)');
    console.log('  • .percy.yml (Percy configuration)');
    console.log('  • .github/workflows/storybook-visual-tests.yml (GitHub Actions)');
    
    console.log('\n🚀 To test the Storybook migration, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected Workflow:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Storybook)');
    console.log('  3. ✅ Analysis report displayed with Storybook-specific changes');
    console.log('  4. ✅ Migration scope prompt');
    console.log('  5. ✅ File selection (if subset chosen)');
    console.log('  6. ✅ Storybook-specific transformations applied');
    
    console.log('\n🔍 Expected Analysis Report:');
    console.log('  📊 Migration Analysis Report');
    console.log('  ────────────────────────────────────────────────────────────');
    console.log('  📈 Summary:');
    console.log('    • Files to create: 1 (.smartui.json)');
    console.log('    • Files to modify: 3 (package.json, CI/CD, config)');
    console.log('    • Snapshots to migrate: 0 (Storybook uses component stories)');
    console.log('    • Warnings: 1 (Percy CSS warning)');
    console.log('');
    console.log('  📋 Proposed Changes:');
    console.log('    ┌──────────────────────────────┬────────────┬──────────────────────────────────────────────────┐');
    console.log('    │ File Path                    │ Change Type│ Description                                      │');
    console.log('    ├──────────────────────────────┼────────────┼──────────────────────────────────────────────────┤');
    console.log('    │ .smartui.json                │ CREATE     │ Generated SmartUI configuration from .percy.yml  │');
    console.log('    │ package.json                 │ MODIFY     │ Replace \'percy storybook\' command with \'smartui-storybook\' │');
    console.log('    │ .github/workflows/storybook-... │ MODIFY     │ Update CI/CD commands and environment variables │');
    console.log('    │ .percy.yml                   │ MODIFY     │ Configuration file will be updated with migration notes │');
    console.log('    └──────────────────────────────┴────────────┴──────────────────────────────────────────────────┘');
    
    console.log('\n🔍 Expected Transformations:');
    console.log('  • Configuration: .percy.yml → .smartui.json');
    console.log('  • Scripts: percy storybook → smartui-storybook');
    console.log('  • CI/CD: percy storybook → smartui-storybook');
    console.log('  • CI/CD: PERCY_TOKEN → # MIGRATION-NOTE: PERCY_TOKEN');
    console.log('  • CI/CD: Add PROJECT_TOKEN, LT_USERNAME, LT_ACCESS_KEY');
    
    console.log('\n📊 Expected Results:');
    console.log('  • Test type: storybook (detected correctly)');
    console.log('  • Platform: Percy (detected correctly)');
    console.log('  • Framework: Storybook (detected correctly)');
    console.log('  • Language: JavaScript/TypeScript (detected correctly)');
    console.log('  • Files processed: 4 (config, package.json, CI/CD, config notes)');
    console.log('  • Warnings: 1 (Percy CSS warning)');
    console.log('  • Storybook-specific transformations applied');
    
    console.log('\n🎯 Test Scenarios:');
    console.log('  📋 Scenario 1: Percy Storybook Project');
    console.log('    • Should detect testType: storybook');
    console.log('    • Should transform percy storybook → smartui-storybook');
    console.log('    • Should handle Storybook-specific configurations');
    console.log('  📋 Scenario 2: Applitools Storybook Project');
    console.log('    • Should detect @applitools/eyes-storybook dependency');
    console.log('    • Should transform eyes-storybook → smartui-storybook');
    console.log('  📋 Scenario 3: Sauce Labs Storybook Project');
    console.log('    • Should detect screener-storybook dependency');
    console.log('    • Should transform screener-storybook → smartui-storybook');
    console.log('    • Should handle screener.config.js renaming');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testStorybookMigration().catch(console.error);
