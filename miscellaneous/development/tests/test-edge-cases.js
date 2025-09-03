#!/usr/bin/env node

/**
 * Edge Cases and Complex Scenarios Test
 * 
 * This script tests the SmartUI Migration Tool with various edge cases
 * and complex scenarios that might occur in real-world projects.
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const chalk = require('chalk').default || require('chalk');

class EdgeCasesTester {
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

  async testMalformedPackageJson() {
    const projectPath = await this.createTestProject('malformed-package-json', {
      'package.json': `{
        "name": "malformed-project",
        "dependencies": {
          "@percy/cypress": "^3.1.0"
        }
        // Missing closing brace
      `,
      'cypress/e2e/test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should still detect the platform despite malformed package.json
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');

    if (!hasPercyDetection) {
      throw new Error('Failed to detect platform with malformed package.json');
    }

    return {
      details: 'Successfully handled malformed package.json and still detected platform'
    };
  }

  async testEmptyFiles() {
    const projectPath = await this.createTestProject('empty-files', {
      'package.json': JSON.stringify({
        name: 'empty-files-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/empty-test.js': '',
      'cypress/e2e/valid-test.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and only process the valid test file
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasValidFile = result.stdout.includes('cypress/e2e/valid-test.js');
    const hasEmptyFile = result.stdout.includes('cypress/e2e/empty-test.js');

    if (!hasPercyDetection || !hasValidFile || hasEmptyFile) {
      throw new Error('Failed to handle empty files correctly');
    }

    return {
      details: 'Successfully handled empty files and only processed valid test files'
    };
  }

  async testVeryLongFileNames() {
    const projectPath = await this.createTestProject('long-file-names', {
      'package.json': JSON.stringify({
        name: 'long-file-names-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/very-long-file-name-that-exceeds-normal-limits-and-tests-login-functionality.spec.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle long file names
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasLongFileName = result.stdout.includes('very-long-file-name-that-exceeds-normal-limits-and-tests-login-functionality.spec.js');

    if (!hasPercyDetection || !hasLongFileName) {
      throw new Error('Failed to handle very long file names');
    }

    return {
      details: 'Successfully handled very long file names'
    };
  }

  async testSpecialCharactersInFileNames() {
    const projectPath = await this.createTestProject('special-characters', {
      'package.json': JSON.stringify({
        name: 'special-characters-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/test-with-special-chars-@#$%.spec.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle special characters
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasSpecialCharFile = result.stdout.includes('test-with-special-chars-@#$%.spec.js');

    if (!hasPercyDetection || !hasSpecialCharFile) {
      throw new Error('Failed to handle special characters in file names');
    }

    return {
      details: 'Successfully handled special characters in file names'
    };
  }

  async testNestedDirectoryStructure() {
    const projectPath = await this.createTestProject('nested-directories', {
      'package.json': JSON.stringify({
        name: 'nested-directories-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'tests/integration/e2e/visual/regression/login/authentication/flow.spec.js': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle deeply nested directories
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasNestedFile = result.stdout.includes('tests/integration/e2e/visual/regression/login/authentication/flow.spec.js');

    if (!hasPercyDetection || !hasNestedFile) {
      throw new Error('Failed to handle deeply nested directory structure');
    }

    return {
      details: 'Successfully handled deeply nested directory structure'
    };
  }

  async testMixedFileExtensions() {
    const projectPath = await this.createTestProject('mixed-extensions', {
      'package.json': JSON.stringify({
        name: 'mixed-extensions-project',
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
});`,
      'cypress/e2e/test.ts': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`,
      'cypress/e2e/test.jsx': `
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle mixed file extensions
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasJsFile = result.stdout.includes('cypress/e2e/test.js');
    const hasTsFile = result.stdout.includes('cypress/e2e/test.ts');
    const hasJsxFile = result.stdout.includes('cypress/e2e/test.jsx');

    if (!hasPercyDetection || !hasJsFile || !hasTsFile || !hasJsxFile) {
      throw new Error('Failed to handle mixed file extensions');
    }

    return {
      details: 'Successfully handled mixed file extensions (.js, .ts, .jsx)'
    };
  }

  async testLargeFileHandling() {
    const projectPath = await this.createTestProject('large-file', {
      'package.json': JSON.stringify({
        name: 'large-file-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      })
    });

    // Create a large test file (simulate with repeated content)
    const largeTestContent = `
describe('Large Test Suite', () => {
${Array.from({ length: 100 }, (_, i) => `
  it('should test scenario ${i}', () => {
    cy.visit('http://localhost:3000/test-${i}');
    cy.get('[data-testid="element-${i}"]').should('be.visible');
    cy.percySnapshot('Test Scenario ${i}');
  });`).join('')}
});`;

    await fs.writeFile(path.join(projectPath, 'cypress/e2e/large-test.js'), largeTestContent, 'utf-8');

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle large files
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasLargeFile = result.stdout.includes('cypress/e2e/large-test.js');

    if (!hasPercyDetection || !hasLargeFile) {
      throw new Error('Failed to handle large files');
    }

    return {
      details: 'Successfully handled large test files with many test cases'
    };
  }

  async testUnicodeCharacters() {
    const projectPath = await this.createTestProject('unicode-characters', {
      'package.json': JSON.stringify({
        name: 'unicode-characters-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      }),
      'cypress/e2e/测试-登录.spec.js': `
describe('登录测试', () => {
  it('应该成功登录', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('登录页面');
  });
});`
    });

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle unicode characters
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasUnicodeFile = result.stdout.includes('测试-登录.spec.js');

    if (!hasPercyDetection || !hasUnicodeFile) {
      throw new Error('Failed to handle unicode characters in file names and content');
    }

    return {
      details: 'Successfully handled unicode characters in file names and content'
    };
  }

  async testSymlinks() {
    const projectPath = await this.createTestProject('symlinks', {
      'package.json': JSON.stringify({
        name: 'symlinks-project',
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

    // Create a symlink to the test file
    try {
      await fs.symlink(
        path.join(projectPath, 'cypress/e2e/test.js'),
        path.join(projectPath, 'cypress/e2e/test-link.js')
      );
    } catch (error) {
      // Symlinks might not be supported on this platform, skip this test
      return {
        details: 'Skipped symlink test (not supported on this platform)'
      };
    }

    const result = await this.runCLI(projectPath);
    
    if (result.code !== 0) {
      throw new Error(`CLI failed with code ${result.code}: ${result.stderr}`);
    }

    // Should detect the platform and handle symlinks
    const hasPercyDetection = result.stdout.includes('Detected Platform: Percy');
    const hasOriginalFile = result.stdout.includes('cypress/e2e/test.js');

    if (!hasPercyDetection || !hasOriginalFile) {
      throw new Error('Failed to handle symlinks');
    }

    return {
      details: 'Successfully handled symlinks'
    };
  }

  async runAllTests() {
    console.log(chalk.bold.blue('\n🔬 Edge Cases and Complex Scenarios Test Suite'));
    console.log(chalk.gray('='.repeat(60)));

    await this.runTest('Malformed Package.json', () => this.testMalformedPackageJson());
    await this.runTest('Empty Files', () => this.testEmptyFiles());
    await this.runTest('Very Long File Names', () => this.testVeryLongFileNames());
    await this.runTest('Special Characters in File Names', () => this.testSpecialCharactersInFileNames());
    await this.runTest('Nested Directory Structure', () => this.testNestedDirectoryStructure());
    await this.runTest('Mixed File Extensions', () => this.testMixedFileExtensions());
    await this.runTest('Large File Handling', () => this.testLargeFileHandling());
    await this.runTest('Unicode Characters', () => this.testUnicodeCharacters());
    await this.runTest('Symlinks', () => this.testSymlinks());

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
      console.log(chalk.green.bold('🎉 All edge case tests passed!'));
    } else {
      console.log(chalk.red.bold(`💥 ${failed} test(s) failed!`));
      process.exit(1);
    }
  }
}

// Run the tests
if (require.main === module) {
  const tester = new EdgeCasesTester();
  tester.runAllTests().catch(error => {
    console.error(chalk.red('Test suite failed:'), error);
    process.exit(1);
  });
}

module.exports = EdgeCasesTester;
