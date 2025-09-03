#!/usr/bin/env node

/**
 * False Positive Prevention Test
 * 
 * This script tests that the SmartUI Migration Tool does not incorrectly
 * detect visual testing patterns in its own source code files.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk').default || require('chalk');

class FalsePositivePreventionTester {
  constructor() {
    this.testResults = [];
    this.cliPath = path.join(__dirname, '..', 'bin', 'run');
  }

  async runTest(testName, testFunction) {
    console.log(chalk.blue(`\n🧪 Running Test: ${testName}`));
    console.log(chalk.gray('─'.repeat(60)));
    
    try {
      const result = await testFunction();
      this.testResults.push({ name: testName, status: 'PASS', result });
      console.log(chalk.green(`✅ ${testName} - PASSED`));
      if (result.details) {
        console.log(chalk.gray(`   ${result.details}`));
      }
    } catch (error) {
      this.testResults.push({ name: testName, status: 'FAIL', error: error.message });
      console.log(chalk.red(`❌ ${testName} - FAILED`));
      console.log(chalk.red(`   Error: ${error.message}`));
    }
  }

  async runCLI(projectPath, args = []) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', [this.cliPath, 'migrate', ...args, '--yes'], {
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

  async testToolSourceCodeExclusion() {
    // Test that the tool doesn't detect patterns in its own source code
    const result = await this.runCLI(process.cwd());
    
    // Should fail with MismatchedSignalsError because it found Percy API calls in transformer files
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with MismatchedSignalsError but it succeeded');
    }

    const hasMismatchedError = result.stderr.includes('Found Percy API calls in your code, but no Percy dependency was found');
    
    if (!hasMismatchedError) {
      throw new Error('Expected MismatchedSignalsError but got different error');
    }

    return {
      details: 'Successfully detected mismatched signals error when tool files contain visual testing patterns'
    };
  }

  async testRegexPatternExclusion() {
    // Create a test project that contains regex patterns similar to the tool's own patterns
    const testProjectPath = path.join(__dirname, 'fixtures', 'regex-pattern-test');
    
    // Clean up existing project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    // Create a project with regex patterns but no actual visual testing
    await fs.writeFile(path.join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'regex-pattern-test',
      dependencies: {
        'react': '^18.0.0'
      }
    }), 'utf-8');

    await fs.mkdir(path.join(testProjectPath, 'src'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'src', 'regex-utils.js'), `
// Utility functions for regex pattern matching
const percySnapshotRegex = /(\\w+)\\.snapshot\\s*\\(\\s*"([^"]+)"\\s*\\)/g;
const eyesCheckRegex = /(\\w+)\\.check\\s*\\(\\s*"([^"]+)"\\s*\\)/g;
const sauceVisualCheckRegex = /(\\w+)\\.sauceVisualCheck\\s*\\(\\s*"([^"]+)"\\s*\\)/g;

function transformPercyCode(code) {
  return code.replace(percySnapshotRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

function transformApplitoolsCode(code) {
  return code.replace(eyesCheckRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

function transformSauceLabsCode(code) {
  return code.replace(sauceVisualCheckRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

module.exports = {
  transformPercyCode,
  transformApplitoolsCode,
  transformSauceLabsCode
};
`, 'utf-8');

    const result = await this.runCLI(testProjectPath);
    
    // Should fail with PlatformNotDetectedError since there are no actual visual testing calls
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with PlatformNotDetectedError but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected PlatformNotDetectedError but got different error');
    }

    return {
      details: 'Successfully ignored regex patterns without actual visual testing calls'
    };
  }

  async testDocumentationStringExclusion() {
    // Create a test project with documentation strings containing visual testing method names
    const testProjectPath = path.join(__dirname, 'fixtures', 'documentation-test');
    
    // Clean up existing project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    await fs.writeFile(path.join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'documentation-test',
      dependencies: {
        'react': '^18.0.0'
      }
    }), 'utf-8');

    await fs.mkdir(path.join(testProjectPath, 'docs'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'docs', 'api-reference.md'), `
# API Reference

## Visual Testing Methods

### Percy
- \`percySnapshot(name)\` - Takes a visual snapshot
- \`percyScreenshot(name)\` - Takes a screenshot

### Applitools
- \`eyes.check(name)\` - Checks visual elements
- \`eyes.open()\` - Opens eyes session
- \`eyes.close()\` - Closes eyes session

### Sauce Labs
- \`sauceVisualCheck(name)\` - Performs visual check
- \`screener.snapshot(name)\` - Takes snapshot

## Usage Examples

\`\`\`javascript
// Percy example
cy.percySnapshot('Login Page');

// Applitools example
eyes.check('Dashboard');

// Sauce Labs example
sauceVisualCheck('Homepage');
\`\`\`
`, 'utf-8');

    const result = await this.runCLI(testProjectPath);
    
    // Should fail with PlatformNotDetectedError since documentation strings are not actual code
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with PlatformNotDetectedError but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected PlatformNotDetectedError but got different error');
    }

    return {
      details: 'Successfully ignored documentation strings containing visual testing method names'
    };
  }

  async testCommentExclusion() {
    // Create a test project with comments containing visual testing method names
    const testProjectPath = path.join(__dirname, 'fixtures', 'comment-test');
    
    // Clean up existing project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    await fs.writeFile(path.join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'comment-test',
      dependencies: {
        'react': '^18.0.0'
      }
    }), 'utf-8');

    await fs.mkdir(path.join(testProjectPath, 'src'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'src', 'test-utils.js'), `
// Test utility functions
// TODO: Add visual testing support
// - percySnapshot('Login Page')
// - eyes.check('Dashboard')
// - sauceVisualCheck('Homepage')

function setupTest() {
  // Initialize test environment
  console.log('Setting up test environment');
}

function cleanupTest() {
  // Clean up test environment
  console.log('Cleaning up test environment');
}

module.exports = {
  setupTest,
  cleanupTest
};
`, 'utf-8');

    const result = await this.runCLI(testProjectPath);
    
    // Should fail with PlatformNotDetectedError since comments are not actual code
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with PlatformNotDetectedError but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected PlatformNotDetectedError but got different error');
    }

    return {
      details: 'Successfully ignored comments containing visual testing method names'
    };
  }

  async testStringLiteralExclusion() {
    // Create a test project with string literals containing visual testing method names
    const testProjectPath = path.join(__dirname, 'fixtures', 'string-literal-test');
    
    // Clean up existing project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    await fs.writeFile(path.join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'string-literal-test',
      dependencies: {
        'react': '^18.0.0'
      }
    }), 'utf-8');

    await fs.mkdir(path.join(testProjectPath, 'src'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'src', 'config.js'), `
// Configuration file
const config = {
  visualTestingMethods: [
    'percySnapshot',
    'eyes.check',
    'sauceVisualCheck'
  ],
  testCommands: {
    percy: 'cy.percySnapshot("Login Page")',
    applitools: 'eyes.check("Dashboard")',
    sauceLabs: 'sauceVisualCheck("Homepage")'
  }
};

module.exports = config;
`, 'utf-8');

    const result = await this.runCLI(testProjectPath);
    
    // Should fail with PlatformNotDetectedError since string literals are not actual code
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with PlatformNotDetectedError but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected PlatformNotDetectedError but got different error');
    }

    return {
      details: 'Successfully ignored string literals containing visual testing method names'
    };
  }

  async testActualVisualTestingDetection() {
    // Create a test project with actual visual testing calls to ensure they are still detected
    const testProjectPath = path.join(__dirname, 'fixtures', 'actual-visual-testing');
    
    // Clean up existing project
    try {
      await fs.rm(testProjectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(testProjectPath, { recursive: true });
    
    await fs.writeFile(path.join(testProjectPath, 'package.json'), JSON.stringify({
      name: 'actual-visual-testing',
      dependencies: {
        '@percy/cypress': '^3.1.0'
      }
    }), 'utf-8');

    await fs.mkdir(path.join(testProjectPath, 'cypress', 'e2e'), { recursive: true });
    await fs.writeFile(path.join(testProjectPath, 'cypress/e2e/test.js'), `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Take visual snapshot
    cy.percySnapshot('Login Flow - Dashboard');
  });
});`, 'utf-8');

    const result = await this.runCLI(testProjectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect Percy platform and Cypress framework
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasCypressDetection = result.stdout.includes('Detected Framework: Cypress');
    const hasSourceFile = result.stdout.includes('cypress/e2e/test.js');

    if (!hasPercyDetection || !hasCypressDetection || !hasSourceFile) {
      throw new Error('Failed to detect actual visual testing code');
    }

    return {
      details: 'Successfully detected actual visual testing code while ignoring false positives'
    };
  }

  async runAllTests() {
    console.log(chalk.bold.blue('\n🛡️ False Positive Prevention Test Suite'));
    console.log(chalk.gray('='.repeat(60)));

    await this.runTest('Tool Source Code Exclusion', () => this.testToolSourceCodeExclusion());
    await this.runTest('Regex Pattern Exclusion', () => this.testRegexPatternExclusion());
    await this.runTest('Documentation String Exclusion', () => this.testDocumentationStringExclusion());
    await this.runTest('Comment Exclusion', () => this.testCommentExclusion());
    await this.runTest('String Literal Exclusion', () => this.testStringLiteralExclusion());
    await this.runTest('Actual Visual Testing Detection', () => this.testActualVisualTestingDetection());

    this.printSummary();
  }

  printSummary() {
    console.log(chalk.bold.blue('\n📊 Test Summary'));
    console.log(chalk.gray('='.repeat(60)));

    const passed = this.testResults.filter(r => r.status === 'PASS').length;
    const failed = this.testResults.filter(r => r.status === 'FAIL').length;
    const total = this.testResults.length;

    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📊 Total: ${total}`));

    if (failed > 0) {
      console.log(chalk.red('\n❌ Failed Tests:'));
      this.testResults
        .filter(r => r.status === 'FAIL')
        .forEach(test => {
          console.log(chalk.red(`   • ${test.name}: ${test.error}`));
        });
    }

    console.log(chalk.gray('\n' + '='.repeat(60)));
    
    if (failed === 0) {
      console.log(chalk.green.bold('🎉 All false positive prevention tests passed!'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test(s) failed!`));
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new FalsePositivePreventionTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('Test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = FalsePositivePreventionTester;
