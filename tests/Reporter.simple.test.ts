import { Reporter } from '../src/modules/Reporter';
import { FinalReportData } from '../src/types';

describe('Reporter - Simple Tests', () => {
  let reporter: Reporter;

  beforeEach(() => {
    reporter = new Reporter('/test-project');
  });

  it('should generate basic report', async () => {
    const reportData: FinalReportData = {
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
        },
        evidence: {
          platform: {
            source: 'package.json',
            match: '@percy/cypress'
          },
          framework: {
            files: ['cypress/e2e/test.cy.js'],
            signatures: ['/cy\\.visit/']
          }
        }
      },
      filesCreated: ['.smartui.json'],
      filesModified: ['cypress/e2e/test.cy.js', 'package.json'],
      snapshotCount: 3,
      warnings: [],
      migrationStartTime: new Date('2024-01-15T10:00:00Z'),
      migrationEndTime: new Date('2024-01-15T10:02:30Z'),
      totalFilesProcessed: 3
    };

    const result = await reporter.generateReport(reportData);

    expect(result).toContain('# 🚀 SmartUI Migration Report');
    expect(result).toContain('Percy');
    expect(result).toContain('Cypress');
    expect(result).toContain('JavaScript/TypeScript');
    expect(result).toContain('End-to-End Testing');
  });

  it('should generate report with warnings', async () => {
    const reportData: FinalReportData = {
      detectionResult: {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['.percy.yml'],
          source: ['cypress/e2e/test.cy.js'],
          ci: [],
          packageManager: ['package.json']
        },
        evidence: {
          platform: {
            source: 'package.json',
            match: '@percy/cypress'
          },
          framework: {
            files: ['cypress/e2e/test.cy.js'],
            signatures: ['/cy\\.visit/']
          }
        }
      },
      filesCreated: ['.smartui.json'],
      filesModified: ['cypress/e2e/test.cy.js'],
      snapshotCount: 2,
      warnings: [
        {
          message: 'Percy CSS configuration detected',
          details: 'The percy-css configuration has been emulated by injecting styles before each snapshot.'
        }
      ],
      migrationStartTime: new Date('2024-01-15T10:00:00Z'),
      migrationEndTime: new Date('2024-01-15T10:02:30Z'),
      totalFilesProcessed: 2
    };

    const result = await reporter.generateReport(reportData);

    expect(result).toContain('⚠️ Warnings & Manual Review Required');
    expect(result).toContain('Percy CSS configuration detected');
  });
});
