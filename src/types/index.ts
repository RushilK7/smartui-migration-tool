/**
 * Shared type definitions for the SmartUI Migration Tool
 */

// Custom error classes for scanner
export class PlatformNotDetectedError extends Error {
  constructor(message: string = 'Could not detect a supported visual testing platform. Please run this tool from the root of your project.') {
    super(message);
    this.name = 'PlatformNotDetectedError';
  }
}

export class MultiplePlatformsDetectedError extends Error {
  constructor(message: string = 'Multiple visual testing platforms were detected. The migration tool supports migrating from only one platform at a time.') {
    super(message);
    this.name = 'MultiplePlatformsDetectedError';
  }
}

// Detection result interface for scanner output
export interface DetectionResult {
  platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual';
  framework: 'Cypress' | 'Selenium' | 'Playwright' | 'Storybook' | 'Robot Framework' | 'Appium';
  language: 'JavaScript/TypeScript' | 'Java' | 'Python';
  testType: 'e2e' | 'storybook' | 'appium';
  files: {
    config: string[];      // Paths to config files like .percy.yml
    source: string[];      // Paths to test script files
    ci: string[];          // Paths to CI/CD files
    packageManager: string[]; // Path to package.json, pom.xml, etc.
  };
}

// Type definitions for scan results (legacy - keeping for backward compatibility)
export interface ScanResult {
  frameworks: {
    percy?: PercyDetection;
    applitools?: ApplitoolsDetection;
    sauceLabs?: SauceLabsDetection;
  };
  projectType: 'react' | 'vue' | 'angular' | 'vanilla' | 'unknown';
  testFramework: 'jest' | 'cypress' | 'playwright' | 'puppeteer' | 'unknown';
  packageManager: 'npm' | 'yarn' | 'pnpm';
}

export interface PercyDetection {
  configFiles: string[];
  testFiles: string[];
  dependencies: string[];
}

export interface ApplitoolsDetection {
  configFiles: string[];
  testFiles: string[];
  dependencies: string[];
}

export interface SauceLabsDetection {
  configFiles: string[];
  testFiles: string[];
  dependencies: string[];
}

// Type definitions for configuration transformation
export interface TransformResult {
  transformedConfigs: SmartUIConfig[];
  backupFiles: string[];
  newFiles: string[];
}

export interface SmartUIConfig {
  projectName: string;
  buildName: string;
  browsers: BrowserConfig[];
  viewports: ViewportConfig[];
  ignoreRegions: IgnoreRegion[];
  fullPage: boolean;
  captureBeyondViewport: boolean;
}

export interface BrowserConfig {
  name: string;
  width: number;
  height: number;
}

export interface ViewportConfig {
  width: number;
  height: number;
}

export interface IgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Type definitions for code transformation
export interface CodeTransformResult {
  transformedFiles: TransformedFile[];
  backupFiles: string[];
  errors: TransformationError[];
  warnings: TransformationWarning[];
}

export interface TransformedFile {
  originalPath: string;
  transformedPath: string;
  backupPath: string;
  changes: CodeChange[];
  framework: 'percy' | 'applitools' | 'sauceLabs';
}

export interface CodeChange {
  type: 'import' | 'function_call' | 'configuration' | 'assertion';
  originalCode: string;
  transformedCode: string;
  lineNumber: number;
  description: string;
}

export interface TransformationError {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface TransformationWarning {
  message: string;
  details?: string;
  file?: string;
  line?: number;
}

// Type definitions for execution transformation
export interface ExecutionTransformResult {
  packageJsonChanges: PackageJsonTransform;
  ciConfigChanges: CIConfigTransform[];
  dependencyChanges: DependencyUpdate;
  newScripts: SmartUIScript[];
  backupFiles: string[];
}

export interface PackageJsonTransform {
  originalScripts: Record<string, string>;
  transformedScripts: Record<string, string>;
  addedScripts: Record<string, string>;
  removedScripts: string[];
  dependencyChanges: {
    added: string[];
    removed: string[];
    updated: string[];
  };
}

export interface CIConfigTransform {
  file: string;
  originalContent: string;
  transformedContent: string;
  changes: CIConfigChange[];
  platform: 'github' | 'gitlab' | 'jenkins' | 'azure' | 'circleci';
}

export interface CIConfigChange {
  type: 'step' | 'environment' | 'script' | 'dependency';
  original: string;
  transformed: string;
  description: string;
}

export interface DependencyUpdate {
  removed: string[];
  added: string[];
  updated: string[];
  smartUIDependencies: string[];
}

export interface SmartUIScript {
  name: string;
  command: string;
  description: string;
  category: 'test' | 'build' | 'deploy' | 'utility';
}

// Type definitions for reporting
export interface ReportResult {
  consoleOutput: string;
  htmlReport: string;
  jsonReport: string;
  markdownReport: string;
  statistics: MigrationStatistics;
}

export interface MigrationResult {
  scanResult: ScanResult;
  configTransform: TransformResult;
  codeTransform: CodeTransformResult;
  executionTransform: ExecutionTransformResult;
  startTime: Date;
  endTime: Date;
  success: boolean;
  errors: string[];
  warnings: string[];
}

export interface MigrationStatistics {
  totalFiles: number;
  transformedFiles: number;
  backupFiles: number;
  newFiles: number;
  removedFiles: number;
  frameworksDetected: string[];
  testFilesFound: number;
  configFilesFound: number;
  dependenciesUpdated: number;
  scriptsUpdated: number;
  ciConfigsUpdated: number;
  migrationTime: number; // in milliseconds
  successRate: number; // percentage
}

// --- ConfigTransformer Module Types ---
export interface ConfigTransformationResult {
  content: string; // The string content of the new .smartui.json file
  warnings: TransformationWarning[];
}

export interface CodeTransformationResult {
  content: string; // The transformed code as a string
  warnings: TransformationWarning[];
  snapshotCount: number; // The number of snapshot commands found and transformed
}

// Pre-migration analysis interfaces
export interface ProposedChange {
  filePath: string;
  type: 'CREATE' | 'MODIFY' | 'INFO'; // CREATE for new files, MODIFY for existing files, INFO for warnings
  description: string;
}

export interface AnalysisResult {
  filesToCreate: number;
  filesToModify: number;
  snapshotCount: number;
  warnings: TransformationWarning[];
  changes: ProposedChange[];
}

// Final report data interface for post-migration reporting
export interface FinalReportData {
  detectionResult: DetectionResult;
  filesCreated: string[];
  filesModified: string[];
  snapshotCount: number;
  warnings: TransformationWarning[];
  migrationStartTime: Date;
  migrationEndTime: Date;
  totalFilesProcessed: number;
}
