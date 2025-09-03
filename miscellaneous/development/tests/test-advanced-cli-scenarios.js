#!/usr/bin/env node

/**
 * Advanced CLI Test Scenarios
 * 
 * This script tests the SmartUI Migration Tool CLI with various advanced and complex scenarios:
 * - Non-standard file structures
 * - Custom naming conventions
 * - Mixed framework projects
 * - Edge cases and error conditions
 * - False positive prevention
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk').default || require('chalk');

class AdvancedCLITester {
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

  async createTestProject(projectName, structure) {
    const projectPath = path.join(__dirname, 'fixtures', projectName);
    
    // Clean up existing project
    try {
      await fs.rm(projectPath, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist, that's fine
    }
    
    await fs.mkdir(projectPath, { recursive: true });
    
    // Create the project structure
    for (const [filePath, content] of Object.entries(structure)) {
      const fullPath = path.join(projectPath, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    }
    
    return projectPath;
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

  async testNonStandardFileStructure() {
    const projectPath = await this.createTestProject('non-standard-structure', {
      'package.json': JSON.stringify({
        name: 'non-standard-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'automation/visual-tests/login-flow.spec.js': `
describe('Login Flow Tests', () => {
  it('should complete login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
    
    // Take visual snapshot
    cy.percySnapshot('Login Flow - Dashboard');
  });
});`,
      'qa/regression/visual-checks.spec.js': `
describe('Regression Visual Tests', () => {
  it('should verify homepage layout', () => {
    cy.visit('http://localhost:3000');
    cy.percySnapshot('Homepage Layout');
  });
});`,
      'tests/e2e/custom-names/user-authentication.cy.js': `
describe('User Authentication', () => {
  it('should handle login errors', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('invalid@example.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.percySnapshot('Login Error State');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check if the tool detected the non-standard structure
    const hasEvidence = result.stdout.includes('Evidence: Found');
    const hasSourceFiles = result.stdout.includes('automation/visual-tests/login-flow.spec.js') ||
                          result.stdout.includes('qa/regression/visual-checks.spec.js') ||
                          result.stdout.includes('tests/e2e/custom-names/user-authentication.cy.js');

    if (!hasEvidence || !hasSourceFiles) {
      throw new Error('Failed to detect non-standard file structure or missing evidence display');
    }

    return {
      details: 'Successfully detected Percy platform and Cypress framework in non-standard directory structure'
    };
  }

  async testMixedFrameworkProject() {
    const projectPath = await this.createTestProject('mixed-framework-project', {
      'package.json': JSON.stringify({
        name: 'mixed-framework-project',
        dependencies: {
          '@percy/cypress': '^3.1.0',
          '@playwright/test': '^1.40.0'
        }
      }),
      'cypress/e2e/percy-tests.cy.js': `
describe('Percy Cypress Tests', () => {
  it('should test login page', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`,
      'playwright/percy-tests.spec.js': `
import { test, expect } from '@playwright/test';

test('should test dashboard page', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');
  await page.percySnapshot('Dashboard Page');
});`,
      'tests/applitools-selenium.js': `
const { Builder, By } = require('selenium-webdriver');
const { Eyes } = require('@applitools/eyes-selenium');

async function testLogin() {
  const driver = await new Builder().forBrowser('chrome').build();
  const eyes = new Eyes();
  
  try {
    await eyes.open(driver, 'Login Test', 'Login Page');
    await driver.get('http://localhost:3000/login');
    await eyes.check('Login Page');
    await eyes.close();
  } finally {
    await driver.quit();
  }
}`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect Percy as the primary platform
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasFrameworkDetection = result.stdout.includes('Detected Framework:');

    if (!hasPercyDetection || !hasFrameworkDetection) {
      throw new Error('Failed to detect platform and framework in mixed project');
    }

    return {
      details: 'Successfully detected Percy platform in mixed framework project'
    };
  }

  async testCustomNamingConventions() {
    const projectPath = await this.createTestProject('custom-naming-project', {
      'package.json': JSON.stringify({
        name: 'custom-naming-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'my-custom-tests/visual-validation/user-login-flow.js': `
describe('User Login Flow Validation', () => {
  it('should validate login process', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    cy.percySnapshot('Login Process Validation');
  });
});`,
      'test-suite/ui-checks/page-layouts.js': `
describe('Page Layout Checks', () => {
  it('should check homepage layout', () => {
    cy.visit('http://localhost:3000');
    cy.percySnapshot('Homepage Layout Check');
  });
});`,
      'automation/visual-regression/component-tests.js': `
describe('Component Visual Regression', () => {
  it('should test header component', () => {
    cy.visit('http://localhost:3000');
    cy.get('[data-testid="header"]').should('be.visible');
    cy.percySnapshot('Header Component');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check if custom file names were detected
    const hasCustomFiles = result.stdout.includes('my-custom-tests/visual-validation/user-login-flow.js') ||
                          result.stdout.includes('test-suite/ui-checks/page-layouts.js') ||
                          result.stdout.includes('automation/visual-regression/component-tests.js');

    if (!hasCustomFiles) {
      throw new Error('Failed to detect files with custom naming conventions');
    }

    return {
      details: 'Successfully detected files with custom naming conventions and directory structures'
    };
  }

  async testMismatchedSignalsError() {
    const projectPath = await this.createTestProject('mismatched-signals-project', {
      'package.json': JSON.stringify({
        name: 'mismatched-signals-project',
        dependencies: {
          'cypress': '^12.0.0'
          // No Percy dependency
        }
      }),
      'cypress/e2e/test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Take visual snapshot without Percy dependency
    cy.percySnapshot('Login Flow - Dashboard');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    // Should fail with MismatchedSignalsError
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with MismatchedSignalsError but it succeeded');
    }

    const hasMismatchedError = result.stderr.includes('Found Percy API calls in your code, but no Percy dependency was found');
    
    if (!hasMismatchedError) {
      throw new Error('Expected MismatchedSignalsError but got different error');
    }

    return {
      details: 'Successfully detected and reported mismatched signals error'
    };
  }

  async testEmptyProject() {
    const projectPath = await this.createTestProject('empty-project', {
      'package.json': JSON.stringify({
        name: 'empty-project',
        dependencies: {
          'react': '^18.0.0'
        }
      })
    });

    const result = await this.runCLI(projectPath);
    
    // Should fail with PlatformNotDetectedError
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with PlatformNotDetectedError but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected PlatformNotDetectedError but got different error');
    }

    return {
      details: 'Successfully detected and reported empty project error'
    };
  }

  async testMultiplePlatformsError() {
    const projectPath = await this.createTestProject('multiple-platforms-project', {
      'package.json': JSON.stringify({
        name: 'multiple-platforms-project',
        dependencies: {
          '@percy/cypress': '^3.1.0',
          '@applitools/eyes-cypress': '^1.0.0'
        }
      }),
      'cypress/e2e/test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
    cy.eyes.check('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    // Should fail with MultiplePlatformsDetectedError
    if (result.code === 0) {
      throw new Error('Expected CLI to fail with MultiplePlatformsDetectedError but it succeeded');
    }

    const hasMultiplePlatformsError = result.stderr.includes('Multiple visual testing platforms were detected');
    
    if (!hasMultiplePlatformsError) {
      throw new Error('Expected MultiplePlatformsDetectedError but got different error');
    }

    return {
      details: 'Successfully detected and reported multiple platforms error'
    };
  }

  async testVerboseMode() {
    const projectPath = await this.createTestProject('verbose-test-project', {
      'package.json': JSON.stringify({
        name: 'verbose-test-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath, ['--verbose']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for verbose output
    const hasVerboseOutput = result.stdout.includes('Starting advanced project scan') ||
                            result.stdout.includes('Determined platform from content');

    if (!hasVerboseOutput) {
      throw new Error('Verbose mode did not produce expected debug output');
    }

    return {
      details: 'Successfully ran in verbose mode with debug output'
    };
  }

  async testDryRunMode() {
    const projectPath = await this.createTestProject('dry-run-project', {
      'package.json': JSON.stringify({
        name: 'dry-run-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath, ['--dry-run']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for dry-run indication
    const hasDryRunWarning = result.stdout.includes('Running in dry-run mode');

    if (!hasDryRunWarning) {
      throw new Error('Dry-run mode did not show expected warning');
    }

    return {
      details: 'Successfully ran in dry-run mode with appropriate warnings'
    };
  }

  async runAllTests() {
    console.log(chalk.bold.blue('\n🚀 Advanced CLI Test Suite'));
    console.log(chalk.gray('='.repeat(60)));

    await this.runTest('Non-Standard File Structure', () => this.testNonStandardFileStructure());
    await this.runTest('Mixed Framework Project', () => this.testMixedFrameworkProject());
    await this.runTest('Custom Naming Conventions', () => this.testCustomNamingConventions());
    await this.runTest('Mismatched Signals Error', () => this.testMismatchedSignalsError());
    await this.runTest('Empty Project Error', () => this.testEmptyProject());
    await this.runTest('Multiple Platforms Error', () => this.testMultiplePlatformsError());
    await this.runTest('Verbose Mode', () => this.testVerboseMode());
    await this.runTest('Dry Run Mode', () => this.testDryRunMode());

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
      console.log(chalk.green.bold('🎉 All tests passed!'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test(s) failed!`));
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new AdvancedCLITester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('Test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = AdvancedCLITester;
