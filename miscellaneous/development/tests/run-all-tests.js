#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * 
 * This script runs all test suites for the SmartUI Migration Tool CLI:
 * - Advanced CLI scenarios
 * - False positive prevention
 * - Edge cases and complex scenarios
 */

const chalk = require('chalk').default || require('chalk');
const { spawn } = require('child_process');
const path = require('path');

class ComprehensiveTestRunner {
  constructor() {
    this.testSuites = [
      {
        name: 'Advanced CLI Scenarios',
        file: path.join(__dirname, 'test-advanced-cli-scenarios.js'),
        description: 'Tests non-standard file structures, custom naming, mixed frameworks, and error conditions'
      },
      {
        name: 'False Positive Prevention',
        file: path.join(__dirname, 'test-false-positive-prevention.js'),
        description: 'Tests that the tool does not incorrectly detect patterns in its own source code'
      },
      {
        name: 'Edge Cases and Complex Scenarios',
        file: path.join(__dirname, 'test-edge-cases.js'),
        description: 'Tests malformed files, special characters, unicode, symlinks, and other edge cases'
      }
    ];
    this.results = [];
  }

  async runTestSuite(suite) {
    console.log(chalk.bold.blue(`\n🧪 Running Test Suite: ${suite.name}`));
    console.log(chalk.gray(`📝 ${suite.description}`));
    console.log(chalk.gray('─'.repeat(80)));

    return new Promise((resolve) => {
      const child = spawn('node', [suite.file], {
        stdio: 'inherit'
      });

      child.on('close', (code) => {
        const result = {
          name: suite.name,
          status: code === 0 ? 'PASS' : 'FAIL',
          code
        };
        this.results.push(result);
        resolve(result);
      });

      child.on('error', (error) => {
        const result = {
          name: suite.name,
          status: 'FAIL',
          error: error.message
        };
        this.results.push(result);
        resolve(result);
      });
    });
  }

  async runAllTestSuites() {
    console.log(chalk.bold.blue('\n🚀 SmartUI Migration Tool - Comprehensive Test Suite'));
    console.log(chalk.gray('='.repeat(80)));
    console.log(chalk.gray('Testing advanced CLI scenarios, false positive prevention, and edge cases'));
    console.log(chalk.gray('='.repeat(80)));

    const startTime = Date.now();

    for (const suite of this.testSuites) {
      await this.runTestSuite(suite);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    this.printSummary(duration);
  }

  printSummary(duration) {
    console.log(chalk.bold.blue('\n📊 Comprehensive Test Summary'));
    console.log(chalk.gray('='.repeat(80)));

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;

    console.log(chalk.green(`✅ Passed: ${passed}`));
    console.log(chalk.red(`❌ Failed: ${failed}`));
    console.log(chalk.blue(`📊 Total: ${total}`));
    console.log(chalk.gray(`⏱️  Duration: ${duration}s`));

    console.log(chalk.gray('\n' + '─'.repeat(80)));

    // Detailed results
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? 
        chalk.green('✅ PASS') : 
        chalk.red('❌ FAIL');
      console.log(`${status} ${result.name}`);
    });

    console.log(chalk.gray('\n' + '='.repeat(80)));

    if (failed === 0) {
      console.log(chalk.green.bold('🎉 All test suites passed!'));
      console.log(chalk.gray('The SmartUI Migration Tool CLI is working correctly for all advanced scenarios.'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test suite(s) failed!`));
      console.log(chalk.gray('Please review the failed tests above and fix any issues.'));
      process.exit(1);
    }
  }
}

// Run all test suites
if (require.main === module) {
  const runner = new ComprehensiveTestRunner();
  runner.runAllTestSuites().catch(error => {
    console.error(chalk.red('Test runner failed:'), error);
    process.exit(1);
  });
}

module.exports = ComprehensiveTestRunner;
