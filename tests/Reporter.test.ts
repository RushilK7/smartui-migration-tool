import { Reporter } from '../src/modules/Reporter';
import { FinalReportData, DetectionResult } from '../src/types';

describe('Reporter', () => {
  let reporter: Reporter;

  beforeEach(() => {
    reporter = new Reporter('/test-project');
  });

  describe('Report Generation', () => {
    it('should generate report for E2E Cypress project', async () => {
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
      };

      const result = await reporter.generateReport(reportData);

      expect(result).toMatchSnapshot();
    });

    it('should generate report for Storybook project', async () => {
      const reportData: FinalReportData = {
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
      };

      const result = await reporter.generateReport(reportData);

      expect(result).toMatchSnapshot();
    });

    it('should generate report for Appium Python project', async () => {
      const reportData: FinalReportData = {
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
      };

      const result = await reporter.generateReport(reportData);

      expect(result).toMatchSnapshot();
    });

    it('should generate report for Java project', async () => {
      const reportData: FinalReportData = {
        detectionResult: {
          platform: 'Applitools',
          framework: 'Selenium',
          language: 'Java',
          testType: 'e2e',
          files: {
            config: [],
            source: ['src/test/java/Test.java'],
            ci: ['.github/workflows/test.yml'],
            packageManager: ['pom.xml']
          }
        },
        filesCreated: ['.smartui.json'],
        filesModified: ['src/test/java/Test.java', 'pom.xml', '.github/workflows/test.yml'],
        snapshotCount: 2,
        warnings: [],
        migrationStartTime: new Date('2024-01-15T10:00:00Z'),
        migrationEndTime: new Date('2024-01-15T10:02:00Z'),
        totalFilesProcessed: 4
      };

      const result = await reporter.generateReport(reportData);

      expect(result).toMatchSnapshot();
    });
  });

  describe('Report Sections', () => {
    it('should generate proper header with timestamp and duration', () => {
      const startTime = new Date('2024-01-15T10:00:00Z');
      const endTime = new Date('2024-01-15T10:02:30Z');

      const header = reporter['generateReportHeader'](startTime, endTime);

      expect(header).toContain('# 🚀 SmartUI Migration Report');
      expect(header).toContain('**Generated:** 2024-01-15 10:02:30.000 UTC');
      expect(header).toContain('**Migration Duration:** 150 seconds');
    });

    it('should generate migration summary table', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const table = reporter['generateMigrationSummaryTable'](detectionResult, 5, 10);

      expect(table).toContain('## 📊 Migration Summary');
      expect(table).toContain('| **Source Platform** | Percy |');
      expect(table).toContain('| **Language** | JavaScript/TypeScript |');
      expect(table).toContain('| **Framework** | Cypress |');
      expect(table).toContain('| **Test Type** | End-to-End Testing |');
      expect(table).toContain('| **Files Processed** | 5 |');
      expect(table).toContain('| **Snapshots Migrated** | 10 |');
    });

    it('should generate files changed section with created and modified files', () => {
      const filesCreated = ['.smartui.json', 'new-config.js'];
      const filesModified = ['package.json', 'test.cy.js'];

      const section = reporter['generateFilesChangedSection'](filesCreated, filesModified);

      expect(section).toContain('## 📂 Files Modified / Created');
      expect(section).toContain('### ✅ Files Created');
      expect(section).toContain('- `.smartui.json`');
      expect(section).toContain('- `new-config.js`');
      expect(section).toContain('### 🔄 Files Modified');
      expect(section).toContain('- `package.json`');
      expect(section).toContain('- `test.cy.js`');
    });

    it('should generate files changed section with no files', () => {
      const section = reporter['generateFilesChangedSection']([], []);

      expect(section).toContain('## 📂 Files Modified / Created');
      expect(section).toContain('No files were created or modified during this migration.');
    });

    it('should generate warnings section with warnings', () => {
      const warnings = [
        {
          message: 'Percy CSS configuration detected',
          details: 'The percy-css configuration has been emulated by injecting styles before each snapshot.'
        },
        {
          message: 'Multiple platforms detected',
          details: 'Found both Percy and Applitools configurations. Please review the migration.'
        }
      ];

      const section = reporter['generateWarningsSection'](warnings);

      expect(section).toContain('## ⚠️ Warnings & Manual Review Required');
      expect(section).toContain('The following items require your attention:');
      expect(section).toContain('1. **Percy CSS configuration detected**');
      expect(section).toContain('   The percy-css configuration has been emulated by injecting styles before each snapshot.');
      expect(section).toContain('2. **Multiple platforms detected**');
      expect(section).toContain('   Found both Percy and Applitools configurations. Please review the migration.');
    });

    it('should generate warnings section with no warnings', () => {
      const section = reporter['generateWarningsSection']([]);

      expect(section).toContain('## ⚠️ Warnings & Manual Review Required');
      expect(section).toContain('✅ **No warnings were generated.**');
    });
  });

  describe('Next Steps Generation', () => {
    it('should generate next steps for JavaScript/TypeScript E2E project', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const steps = reporter['generateNextStepsSection'](detectionResult);

      expect(steps).toContain('## 🚀 Next Steps');
      expect(steps).toContain('### 1. Install Dependencies');
      expect(steps).toContain('npm install @lambdatest/smartui-cypress');
      expect(steps).toContain('### 2. Configure CI/CD Secrets');
      expect(steps).toContain('### 3. Run Your Migrated Tests');
      expect(steps).toContain('npx smartui exec -- npx cypress run');
    });

    it('should generate next steps for Storybook project', () => {
      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Storybook',
        language: 'JavaScript/TypeScript',
        testType: 'storybook',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const steps = reporter['generateNextStepsSection'](detectionResult);

      expect(steps).toContain('npm install @lambdatest/smartui-storybook');
      expect(steps).toContain('npx smartui exec -- npm run build-storybook');
      expect(steps).toContain('npx smartui-storybook');
    });

    it('should generate next steps for Python project', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Selenium',
        language: 'Python',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const steps = reporter['generateNextStepsSection'](detectionResult);

      expect(steps).toContain('pip install lambdatest-selenium-driver');
      expect(steps).toContain('npx smartui exec -- pytest');
    });

    it('should generate next steps for Java project', () => {
      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Selenium',
        language: 'Java',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const steps = reporter['generateNextStepsSection'](detectionResult);

      expect(steps).toContain('lambdatest-selenium-driver');
      expect(steps).toContain('npx smartui exec -- mvn test');
    });

    it('should generate next steps for Appium Python project', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Appium',
        language: 'Python',
        testType: 'appium',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const steps = reporter['generateNextStepsSection'](detectionResult);

      expect(steps).toContain('pip install lambdatest-appium-driver');
      expect(steps).toContain('npx smartui exec -- pytest');
      expect(steps).toContain('**Mobile Testing:**');
      expect(steps).toContain('**Native Context Switching:**');
    });
  });

  describe('Test Type Display', () => {
    it('should return correct display names for test types', () => {
      expect(reporter['getTestTypeDisplay']('e2e')).toBe('End-to-End Testing');
      expect(reporter['getTestTypeDisplay']('storybook')).toBe('Component Testing (Storybook)');
      expect(reporter['getTestTypeDisplay']('appium')).toBe('Mobile Testing (Appium)');
      expect(reporter['getTestTypeDisplay']('unknown')).toBe('unknown');
    });
  });
});
