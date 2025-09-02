import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import mockFs from 'mock-fs';

const execAsync = promisify(exec);

describe('Integration Tests', () => {
  const fixturesDir = path.join(__dirname, 'fixtures');
  const tempDir = path.join(__dirname, 'temp');

  beforeEach(async () => {
    // Create temp directory for each test
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
    mockFs.restore();
  });

  describe('Percy Cypress JavaScript Migration', () => {
    it('should successfully migrate Percy Cypress project', async () => {
      const fixturePath = path.join(fixturesDir, 'percy-cypress-js');
      const tempPath = path.join(tempDir, 'percy-cypress-js');

      // Copy fixture to temp directory
      await fs.cp(fixturePath, tempPath, { recursive: true });

      // Mock the migration process
      const { Scanner } = await import('../src/modules/Scanner');
      const { ConfigTransformer } = await import('../src/modules/ConfigTransformer');
      const { CodeTransformer } = await import('../src/modules/CodeTransformer');
      const { ExecutionTransformer } = await import('../src/modules/ExecutionTransformer');

      const scanner = new Scanner();
      const configTransformer = new ConfigTransformer();
      const codeTransformer = new CodeTransformer();
      const executionTransformer = new ExecutionTransformer();

      // Step 1: Scan the project
      const detectionResult = await scanner.scan(tempPath);
      expect(detectionResult.platform).toBe('Percy');
      expect(detectionResult.framework).toBe('Cypress');
      expect(detectionResult.language).toBe('JavaScript/TypeScript');
      expect(detectionResult.testType).toBe('e2e');

      // Step 2: Transform configuration
      const percyConfigPath = path.join(tempPath, '.percy.yml');
      const percyConfigContent = await fs.readFile(percyConfigPath, 'utf-8');
      const configResult = configTransformer.transformConfig('.percy.yml', percyConfigContent, detectionResult);
      
      expect(configResult.content).toContain('SmartUI');
      expect(configResult.warnings).toHaveLength(0);

      // Step 3: Transform code
      const testFilePath = path.join(tempPath, 'cypress/e2e/test.cy.js');
      const testFileContent = await fs.readFile(testFilePath, 'utf-8');
      const codeResult = codeTransformer.transformCode('cypress/e2e/test.cy.js', testFileContent, detectionResult);
      
      expect(codeResult.content).toContain('smartui.snapshot');
      expect(codeResult.content).not.toContain('cy.percySnapshot');
      expect(codeResult.snapshotCount).toBe(3);

      // Step 4: Transform execution
      const packageJsonPath = path.join(tempPath, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const executionResult = executionTransformer.transformPackageJson(packageJsonContent, detectionResult.platform);
      
      expect(executionResult.content).toContain('npx smartui exec');
      expect(executionResult.content).not.toContain('percy exec');
      expect(executionResult.warnings).toHaveLength(0);

      // Verify all transformations were applied
      expect(configResult.content).toMatchSnapshot('percy-config-transformation');
      expect(codeResult.content).toMatchSnapshot('percy-code-transformation');
      expect(executionResult.content).toMatchSnapshot('percy-execution-transformation');
    });
  });

  describe('Applitools Selenium Java Migration', () => {
    it('should successfully migrate Applitools Selenium Java project', async () => {
      const fixturePath = path.join(fixturesDir, 'applitools-selenium-java');
      const tempPath = path.join(tempDir, 'applitools-selenium-java');

      // Copy fixture to temp directory
      await fs.cp(fixturePath, tempPath, { recursive: true });

      // Mock the migration process
      const { Scanner } = await import('../src/modules/Scanner');
      const { JavaCodeTransformer } = await import('../src/modules/JavaCodeTransformer');
      const { ExecutionTransformer } = await import('../src/modules/ExecutionTransformer');

      const scanner = new Scanner();
      const javaCodeTransformer = new JavaCodeTransformer();
      const executionTransformer = new ExecutionTransformer();

      // Step 1: Scan the project
      const detectionResult = await scanner.scan(tempPath);
      expect(detectionResult.platform).toBe('Applitools');
      expect(detectionResult.framework).toBe('Selenium');
      expect(detectionResult.language).toBe('Java');
      expect(detectionResult.testType).toBe('e2e');

      // Step 2: Transform Java code
      const testFilePath = path.join(tempPath, 'src/test/java/Test.java');
      const testFileContent = await fs.readFile(testFilePath, 'utf-8');
      const codeResult = javaCodeTransformer.transformJavaFile('src/test/java/Test.java', testFileContent, detectionResult);
      
      expect(codeResult.content).toContain('SmartUISnapshot');
      expect(codeResult.content).not.toContain('eyes.check');
      expect(codeResult.snapshotCount).toBe(2);

      // Step 3: Transform execution (pom.xml)
      const pomPath = path.join(tempPath, 'pom.xml');
      const pomContent = await fs.readFile(pomPath, 'utf-8');
      const executionResult = executionTransformer.transformPackageJson(pomContent, detectionResult.platform);
      
      // For Java projects, we don't transform pom.xml in the same way
      expect(executionResult.content).toBe(pomContent);

      // Verify transformations were applied
      expect(codeResult.content).toMatchSnapshot('applitools-java-transformation');
    });
  });

  describe('Error Handling in Integration', () => {
    it('should handle missing files gracefully', async () => {
      const tempPath = path.join(tempDir, 'empty-project');
      await fs.mkdir(tempPath, { recursive: true });

      const { Scanner } = await import('../src/modules/Scanner');
      const scanner = new Scanner();

      await expect(scanner.scan(tempPath)).rejects.toThrow('No visual testing platform detected');
    });

    it('should handle corrupted configuration files', async () => {
      const tempPath = path.join(tempDir, 'corrupted-project');
      await fs.mkdir(tempPath, { recursive: true });

      // Create corrupted package.json
      await fs.writeFile(path.join(tempPath, 'package.json'), 'invalid json');

      const { Scanner } = await import('../src/modules/Scanner');
      const scanner = new Scanner();

      await expect(scanner.scan(tempPath)).rejects.toThrow('Failed to parse package.json');
    });

    it('should handle multiple platforms gracefully', async () => {
      const tempPath = path.join(tempDir, 'multiple-platforms');
      await fs.mkdir(tempPath, { recursive: true });

      // Create package.json with multiple platforms
      const packageJson = {
        dependencies: {
          '@percy/cypress': '^1.0.0',
          '@applitools/eyes-cypress': '^1.0.0'
        }
      };
      await fs.writeFile(path.join(tempPath, 'package.json'), JSON.stringify(packageJson, null, 2));

      const { Scanner } = await import('../src/modules/Scanner');
      const scanner = new Scanner();

      await expect(scanner.scan(tempPath)).rejects.toThrow('Multiple visual testing platforms detected');
    });
  });

  describe('File System Operations', () => {
    it('should handle file system errors gracefully', async () => {
      // Mock file system to throw errors
      mockFs({
        '/test-project': {
          'package.json': mockFs.file({
            content: 'invalid json',
            throw: new Error('Permission denied')
          })
        }
      });

      const { Scanner } = await import('../src/modules/Scanner');
      const scanner = new Scanner();

      await expect(scanner.scan('/test-project')).rejects.toThrow();
    });

    it('should handle missing directories', async () => {
      const { Scanner } = await import('../src/modules/Scanner');
      const scanner = new Scanner();

      await expect(scanner.scan('/non-existent-directory')).rejects.toThrow();
    });
  });

  describe('End-to-End Migration Workflow', () => {
    it('should complete full migration workflow for Percy Cypress project', async () => {
      const fixturePath = path.join(fixturesDir, 'percy-cypress-js');
      const tempPath = path.join(tempDir, 'full-migration-test');

      // Copy fixture to temp directory
      await fs.cp(fixturePath, tempPath, { recursive: true });

      // Import all required modules
      const { Scanner } = await import('../src/modules/Scanner');
      const { ConfigTransformer } = await import('../src/modules/ConfigTransformer');
      const { CodeTransformer } = await import('../src/modules/CodeTransformer');
      const { ExecutionTransformer } = await import('../src/modules/ExecutionTransformer');
      const { Reporter } = await import('../src/modules/Reporter');

      // Initialize all transformers
      const scanner = new Scanner();
      const configTransformer = new ConfigTransformer();
      const codeTransformer = new CodeTransformer();
      const executionTransformer = new ExecutionTransformer();
      const reporter = new Reporter(tempPath);

      // Step 1: Scan project
      const detectionResult = await scanner.scan(tempPath);
      expect(detectionResult.platform).toBe('Percy');

      // Step 2: Transform all files
      const filesToTransform = [
        ...detectionResult.files.config,
        ...detectionResult.files.source,
        ...detectionResult.files.ci,
        ...detectionResult.files.packageManager
      ];

      let totalSnapshots = 0;
      const allWarnings: any[] = [];

      for (const file of filesToTransform) {
        const filePath = path.join(tempPath, file);
        const content = await fs.readFile(filePath, 'utf-8');

        if (detectionResult.files.config.includes(file)) {
          const result = configTransformer.transformConfig(file, content, detectionResult);
          allWarnings.push(...result.warnings);
        } else if (detectionResult.files.source.includes(file)) {
          const result = codeTransformer.transformCode(file, content, detectionResult);
          totalSnapshots += result.snapshotCount;
          allWarnings.push(...result.warnings);
        } else if (detectionResult.files.packageManager.includes(file)) {
          const result = executionTransformer.transformPackageJson(content, detectionResult.platform);
          allWarnings.push(...result.warnings);
        }
      }

      // Step 3: Generate report
      const reportData = {
        detectionResult,
        filesCreated: ['.smartui.json'],
        filesModified: filesToTransform,
        snapshotCount: totalSnapshots,
        warnings: allWarnings,
        migrationStartTime: new Date(),
        migrationEndTime: new Date(),
        totalFilesProcessed: filesToTransform.length + 1
      };

      const reportContent = await reporter.generateReport(reportData);
      expect(reportContent).toContain('# 🚀 SmartUI Migration Report');
      expect(reportContent).toContain('Percy');
      expect(reportContent).toContain('Cypress');
      expect(reportContent).toContain('JavaScript/TypeScript');

      // Verify the complete workflow
      expect(totalSnapshots).toBe(3);
      expect(allWarnings).toHaveLength(0);
      expect(reportContent).toMatchSnapshot('full-migration-report');
    });
  });
});
