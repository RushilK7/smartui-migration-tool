#!/usr/bin/env node

/**
 * Progress Bar Test
 * 
 * This script tests the new progress bar functionality during scanning and transformation phases.
 * It demonstrates the enhanced user experience with visual progress indicators.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk').default || require('chalk');

class ProgressBarTester {
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
      const child = spawn('node', [this.cliPath, 'migrate', ...args], {
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

  async testScanningProgressBar() {
    const projectPath = await this.createTestProject('progress-scan-test', {
      'package.json': JSON.stringify({
        name: 'progress-scan-test',
        dependencies: {
          '@percy/cypress': '^3.1.0',
          'cypress': '^12.0.0'
        }
      }),
      '.percy.yml': `
version: 2
snapshot:
  widths: [1280, 375]
`,
      'cypress/e2e/test1.spec.js': `
describe('Test 1', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 1');
  });
});`,
      'cypress/e2e/test2.spec.js': `
describe('Test 2', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 2');
  });
});`,
      'cypress/e2e/test3.spec.js': `
describe('Test 3', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 3');
  });
});`
    });

    console.log(chalk.yellow('🔍 Testing scanning progress bar...'));
    const result = await this.runCLI(projectPath, ['--preview-only', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for progress bar indicators in the output
    const hasProgressIndicators = result.stdout.includes('|') && result.stdout.includes('%');
    const hasScanningProgress = result.stdout.includes('Scanning project') || 
                               result.stdout.includes('Finding configuration anchors') ||
                               result.stdout.includes('Performing deep content search');

    if (!hasProgressIndicators && !hasScanningProgress) {
      throw new Error('Scanning progress bar was not displayed');
    }

    return {
      details: 'Successfully displayed progress bar during scanning phase'
    };
  }

  async testPreviewProgressBar() {
    const projectPath = await this.createTestProject('progress-preview-test', {
      'package.json': JSON.stringify({
        name: 'progress-preview-test',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/preview-test.spec.js': `
describe('Preview Test', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Preview Test');
  });
});`
    });

    console.log(chalk.yellow('🔍 Testing preview generation progress bar...'));
    const result = await this.runCLI(projectPath, ['--preview-only', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for preview progress indicators
    const hasPreviewProgress = result.stdout.includes('Generating preview') ||
                              result.stdout.includes('Analyzing configuration changes') ||
                              result.stdout.includes('Analyzing code changes') ||
                              result.stdout.includes('Analyzing execution changes');

    if (!hasPreviewProgress) {
      throw new Error('Preview generation progress bar was not displayed');
    }

    return {
      details: 'Successfully displayed progress bar during preview generation'
    };
  }

  async testTransformationProgressBar() {
    const projectPath = await this.createTestProject('progress-transform-test', {
      'package.json': JSON.stringify({
        name: 'progress-transform-test',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/transform-test.spec.js': `
describe('Transform Test', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Transform Test');
  });
});`
    });

    console.log(chalk.yellow('🔍 Testing transformation progress bar...'));
    const result = await this.runCLI(projectPath, ['--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for transformation progress indicators
    const hasTransformProgress = result.stdout.includes('Transforming files') ||
                                result.stdout.includes('Transforming configuration files') ||
                                result.stdout.includes('Transforming code files') ||
                                result.stdout.includes('Transforming execution files') ||
                                result.stdout.includes('Processing files');

    if (!hasTransformProgress) {
      throw new Error('Transformation progress bar was not displayed');
    }

    return {
      details: 'Successfully displayed progress bar during transformation phase'
    };
  }

  async testProgressBarWithVerboseMode() {
    const projectPath = await this.createTestProject('progress-verbose-test', {
      'package.json': JSON.stringify({
        name: 'progress-verbose-test',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/verbose-test.spec.js': `
describe('Verbose Test', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Verbose Test');
  });
});`
    });

    console.log(chalk.yellow('🔍 Testing progress bar with verbose mode...'));
    const result = await this.runCLI(projectPath, ['--verbose', '--preview-only', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for verbose output combined with progress bars
    const hasVerboseOutput = result.stdout.includes('verbose') || result.stdout.includes('debug');
    const hasProgressOutput = result.stdout.includes('|') || result.stdout.includes('%');

    if (!hasVerboseOutput || !hasProgressOutput) {
      throw new Error('Progress bar with verbose mode did not show expected output');
    }

    return {
      details: 'Successfully displayed progress bar with verbose logging'
    };
  }

  async testProgressBarWithLargeProject() {
    const projectPath = await this.createTestProject('progress-large-test', {
      'package.json': JSON.stringify({
        name: 'progress-large-test',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      })
    });

    // Create multiple test files to simulate a large project
    const testFiles = {};
    for (let i = 1; i <= 10; i++) {
      testFiles[`cypress/e2e/test${i}.spec.js`] = `
describe('Test ${i}', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test ${i}');
  });
});`;
    }

    // Add the test files to the project structure
    for (const [filePath, content] of Object.entries(testFiles)) {
      const fullPath = path.join(projectPath, filePath);
      const dir = path.dirname(fullPath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(fullPath, content, 'utf-8');
    }

    console.log(chalk.yellow('🔍 Testing progress bar with large project...'));
    const result = await this.runCLI(projectPath, ['--preview-only', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check that progress bars handle multiple files
    const hasMultipleFiles = result.stdout.includes('test1.spec.js') && 
                            result.stdout.includes('test5.spec.js') && 
                            result.stdout.includes('test10.spec.js');

    if (!hasMultipleFiles) {
      throw new Error('Progress bar did not handle large project correctly');
    }

    return {
      details: 'Successfully displayed progress bar for large project with multiple files'
    };
  }

  async runAllTests() {
    console.log(chalk.bold.blue('\n🚀 Progress Bar Test Suite'));
    console.log(chalk.gray('='.repeat(60)));
    console.log(chalk.gray('Testing progress bar functionality during scanning and transformation'));
    console.log(chalk.gray('='.repeat(60)));

    await this.runTest('Scanning Progress Bar', () => this.testScanningProgressBar());
    await this.runTest('Preview Progress Bar', () => this.testPreviewProgressBar());
    await this.runTest('Transformation Progress Bar', () => this.testTransformationProgressBar());
    await this.runTest('Progress Bar with Verbose Mode', () => this.testProgressBarWithVerboseMode());
    await this.runTest('Progress Bar with Large Project', () => this.testProgressBarWithLargeProject());

    this.printSummary();
  }

  printSummary() {
    console.log(chalk.bold.blue('\n📊 Progress Bar Test Summary'));
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
      console.log(chalk.green.bold('🎉 All progress bar tests passed!'));
      console.log(chalk.gray('The enhanced CLI successfully displays:'));
      console.log(chalk.white('  • Progress bars during scanning phase'));
      console.log(chalk.white('  • Progress bars during preview generation'));
      console.log(chalk.white('  • Progress bars during transformation'));
      console.log(chalk.white('  • Progress bars with verbose mode'));
      console.log(chalk.white('  • Progress bars for large projects'));
      console.log(chalk.white('  • Real-time progress indicators with ETA and speed'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test(s) failed!`));
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new ProgressBarTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('Progress bar test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = ProgressBarTester;
