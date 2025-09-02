#!/usr/bin/env node

// Test script to verify report generation functionality
const { Reporter } = require('./lib/modules/Reporter');
const { promises: fs } = require('fs');
const path = require('path');

async function testReportGeneration() {
  console.log('Testing Report Generation Functionality...\n');
  
  try {
    // Create a test directory
    const testDir = path.join(__dirname, 'test-report-generation');
    await fs.mkdir(testDir, { recursive: true });
    
    // Initialize the Reporter
    const reporter = new Reporter(testDir);
    
    // Create sample final report data for different scenarios
    const testScenarios = [
      {
        name: 'E2E Cypress Project',
        data: {
          detectionResult: {
            platform: 'Percy',
            framework: 'Cypress',
            language: 'JavaScript/TypeScript',
            testType: 'e2e',
            files: {
              config: ['.percy.yml'],
              source: ['cypress/e2e/test.cy.js'],
              ci: ['.github/workflows/test.yml'],
              packageManager: ['package.json']
            }
          },
          filesCreated: ['.smartui.json'],
          filesModified: ['cypress/e2e/test.cy.js', 'package.json', '.github/workflows/test.yml'],
          snapshotCount: 5,
          warnings: [
            {
              message: 'Percy CSS configuration detected',
              details: 'The percy-css configuration has been emulated by injecting styles before each snapshot. Please review the transformed code to ensure it meets your needs.'
            }
          ],
          migrationStartTime: new Date('2024-01-15T10:00:00Z'),
          migrationEndTime: new Date('2024-01-15T10:02:30Z'),
          totalFilesProcessed: 4
        }
      },
      {
        name: 'Storybook Project',
        data: {
          detectionResult: {
            platform: 'Applitools',
            framework: 'Storybook',
            language: 'JavaScript/TypeScript',
            testType: 'storybook',
            files: {
              config: ['applitools.config.js'],
              source: ['src/components/Button.stories.js'],
              ci: ['.github/workflows/storybook.yml'],
              packageManager: ['package.json']
            }
          },
          filesCreated: ['.smartui.json'],
          filesModified: ['package.json', '.github/workflows/storybook.yml'],
          snapshotCount: 0,
          warnings: [],
          migrationStartTime: new Date('2024-01-15T10:00:00Z'),
          migrationEndTime: new Date('2024-01-15T10:01:45Z'),
          totalFilesProcessed: 3
        }
      },
      {
        name: 'Appium Python Project',
        data: {
          detectionResult: {
            platform: 'Percy',
            framework: 'Appium',
            language: 'Python',
            testType: 'appium',
            files: {
              config: [],
              source: ['tests/test_mobile.py'],
              ci: ['.github/workflows/mobile.yml'],
              packageManager: ['requirements.txt']
            }
          },
          filesCreated: ['.smartui.json'],
          filesModified: ['tests/test_mobile.py', '.github/workflows/mobile.yml'],
          snapshotCount: 3,
          warnings: [
            {
              message: 'Found 2 native context switching call(s)',
              details: 'Native context switching calls have been preserved to maintain hybrid app testing functionality.'
            }
          ],
          migrationStartTime: new Date('2024-01-15T10:00:00Z'),
          migrationEndTime: new Date('2024-01-15T10:03:15Z'),
          totalFilesProcessed: 3
        }
      }
    ];
    
    // Generate reports for each scenario
    for (const scenario of testScenarios) {
      console.log(`🔍 Testing ${scenario.name}...`);
      
      const reportContent = await reporter.generateReport(scenario.data);
      
      // Write the report to a file
      const reportPath = path.join(testDir, `MIGRATION_REPORT_${scenario.name.replace(/\s+/g, '_')}.md`);
      await fs.writeFile(reportPath, reportContent, 'utf-8');
      
      console.log(`✅ Generated report: ${reportPath}`);
      
      // Display a preview of the report
      console.log('\n📄 Report Preview:');
      const lines = reportContent.split('\n');
      const previewLines = lines.slice(0, 20); // Show first 20 lines
      console.log(previewLines.join('\n'));
      if (lines.length > 20) {
        console.log(`... (${lines.length - 20} more lines)`);
      }
      console.log('\n' + '─'.repeat(60) + '\n');
    }
    
    console.log('✅ All report generation tests completed successfully!');
    console.log(`📁 Test reports saved in: ${testDir}`);
    console.log('\n📋 Generated Reports:');
    console.log('  • MIGRATION_REPORT_E2E_Cypress_Project.md');
    console.log('  • MIGRATION_REPORT_Storybook_Project.md');
    console.log('  • MIGRATION_REPORT_Appium_Python_Project.md');
    
    console.log('\n🔍 Expected Report Features:');
    console.log('  ✅ Professional header with timestamp and duration');
    console.log('  ✅ Migration summary table with all key metrics');
    console.log('  ✅ Files created/modified sections');
    console.log('  ✅ Warnings section (with or without warnings)');
    console.log('  ✅ Tailored next steps based on project type');
    console.log('  ✅ Language-specific installation commands');
    console.log('  ✅ Framework-specific test execution commands');
    console.log('  ✅ Additional notes for Appium/Storybook projects');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testReportGeneration().catch(console.error);
