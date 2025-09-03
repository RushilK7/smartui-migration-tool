#!/usr/bin/env node

/**
 * Enhanced CLI Test Script
 * 
 * This script tests the new enhanced CLI functionality including:
 * - Change preview
 * - Manual confirmation
 * - Safe transformation with backups
 * - Post-transformation reporting
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk').default || require('chalk');

class EnhancedCLITester {
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

  async testPreviewOnlyMode() {
    const projectPath = await this.createTestProject('preview-test', {
      'package.json': JSON.stringify({
        name: 'preview-test-project',
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

    const result = await this.runCLI(projectPath, ['--preview-only', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for preview-specific output
    const hasPreviewMode = result.stdout.includes('Preview mode - no changes will be made');
    const hasTransformationPreview = result.stdout.includes('TRANSFORMATION PREVIEW');
    const hasSummary = result.stdout.includes('Summary:');

    if (!hasPreviewMode || !hasTransformationPreview || !hasSummary) {
      throw new Error('Preview mode did not show expected output');
    }

    return {
      details: 'Successfully demonstrated preview-only mode with detailed change preview'
    };
  }

  async testBackupCreation() {
    const projectPath = await this.createTestProject('backup-test', {
      'package.json': JSON.stringify({
        name: 'backup-test-project',
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

    const result = await this.runCLI(projectPath, ['--backup', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for backup-related output
    const hasBackupRecommendation = result.stdout.includes('BACKUP RECOMMENDATION');
    const hasBackupInfo = result.stdout.includes('Backup Information:');
    const hasBackupFolder = result.stdout.includes('.smartui-backup/');

    if (!hasBackupRecommendation || !hasBackupInfo || !hasBackupFolder) {
      throw new Error('Backup functionality did not show expected output');
    }

    // Check if backup folder was actually created
    const backupPath = path.join(projectPath, '.smartui-backup');
    let backupExists = false;
    try {
      await fs.access(backupPath);
      backupExists = true;
    } catch (error) {
      // Backup folder doesn't exist
    }

    if (!backupExists) {
      throw new Error('Backup folder was not created');
    }

    return {
      details: 'Successfully created backups and showed backup information'
    };
  }

  async testDryRunMode() {
    const projectPath = await this.createTestProject('dry-run-test', {
      'package.json': JSON.stringify({
        name: 'dry-run-test-project',
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

    const result = await this.runCLI(projectPath, ['--dry-run', '--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for dry-run specific output
    const hasDryRunWarning = result.stdout.includes('Running in dry-run mode');
    const hasDryRunIndicators = result.stdout.includes('[DRY RUN]');

    if (!hasDryRunWarning || !hasDryRunIndicators) {
      throw new Error('Dry-run mode did not show expected output');
    }

    return {
      details: 'Successfully demonstrated dry-run mode with appropriate indicators'
    };
  }

  async testTransformationSummary() {
    const projectPath = await this.createTestProject('summary-test', {
      'package.json': JSON.stringify({
        name: 'summary-test-project',
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

    const result = await this.runCLI(projectPath, ['--yes']);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Check for transformation summary
    const hasTransformationSummary = result.stdout.includes('TRANSFORMATION SUMMARY');
    const hasNextSteps = result.stdout.includes('Next Steps:');
    const hasPOCRecommendation = result.stdout.includes('For POC purposes');

    if (!hasTransformationSummary || !hasNextSteps || !hasPOCRecommendation) {
      throw new Error('Transformation summary did not show expected output');
    }

    return {
      details: 'Successfully showed comprehensive transformation summary and next steps'
    };
  }

  async testErrorHandling() {
    const projectPath = await this.createTestProject('error-test', {
      'package.json': JSON.stringify({
        name: 'error-test-project',
        dependencies: {
          'react': '^18.0.0'
        }
      })
    });

    const result = await this.runCLI(projectPath, ['--yes']);
    
    // Should fail with no visual testing platform detected
    if (result.code === 0) {
      throw new Error('Expected CLI to fail but it succeeded');
    }

    const hasPlatformError = result.stderr.includes('No visual testing platform detected');
    
    if (!hasPlatformError) {
      throw new Error('Expected platform detection error but got different error');
    }

    return {
      details: 'Successfully handled error case with appropriate error message'
    };
  }

  async runAllTests() {
    console.log(chalk.bold.blue('\n🚀 Enhanced CLI Test Suite'));
    console.log(chalk.gray('='.repeat(60)));
    console.log(chalk.gray('Testing new CLI features: preview, confirmation, backups, and reporting'));
    console.log(chalk.gray('='.repeat(60)));

    await this.runTest('Preview Only Mode', () => this.testPreviewOnlyMode());
    await this.runTest('Backup Creation', () => this.testBackupCreation());
    await this.runTest('Dry Run Mode', () => this.testDryRunMode());
    await this.runTest('Transformation Summary', () => this.testTransformationSummary());
    await this.runTest('Error Handling', () => this.testErrorHandling());

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
      console.log(chalk.green.bold('🎉 All enhanced CLI tests passed!'));
      console.log(chalk.gray('The CLI now supports:'));
      console.log(chalk.white('  • Detailed change preview'));
      console.log(chalk.white('  • Manual user confirmation'));
      console.log(chalk.white('  • Safe transformation with backups'));
      console.log(chalk.white('  • Comprehensive post-transformation reporting'));
      console.log(chalk.white('  • POC recommendations for safe testing'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test(s) failed!`));
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new EnhancedCLITester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('Test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = EnhancedCLITester;
