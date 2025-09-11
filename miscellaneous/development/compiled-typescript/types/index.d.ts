/**
 * Shared type definitions for the SmartUI Migration Tool
 */
export declare class PlatformNotDetectedError extends Error {
    constructor(message?: string);
}
export declare class MultiplePlatformsDetectedError extends Error {
    constructor(message?: string);
}
export interface MultiDetectionResult {
    platforms: DetectedPlatform[];
    frameworks: DetectedFramework[];
    languages: DetectedLanguage[];
    totalDetections: number;
}
export interface DetectedPlatform {
    name: 'Percy' | 'Applitools' | 'Sauce Labs Visual';
    confidence: 'high' | 'medium' | 'low';
    evidence: {
        source: string;
        match: string;
        files: string[];
    };
    frameworks: string[];
    languages: string[];
}
export interface DetectedFramework {
    name: 'Cypress' | 'Playwright' | 'Selenium' | 'Storybook' | 'Jest' | 'Robot Framework' | 'Appium';
    confidence: 'high' | 'medium' | 'low';
    evidence: {
        files: string[];
        signatures: string[];
    };
    platforms: string[];
    languages: string[];
}
export interface DetectedLanguage {
    name: 'JavaScript/TypeScript' | 'Java' | 'Python';
    confidence: 'high' | 'medium' | 'low';
    evidence: {
        files: string[];
        extensions: string[];
    };
    platforms: string[];
    frameworks: string[];
}
export declare class MismatchedSignalsError extends Error {
    constructor(message: string);
}
export interface AnchorResult {
    platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual' | 'unknown';
    magicStrings: string[];
    framework?: 'Cypress' | 'Selenium' | 'Playwright' | 'Storybook' | 'Robot Framework' | 'Appium';
    language?: 'JavaScript/TypeScript' | 'Java' | 'Python';
    evidence?: {
        source: string;
        match: string;
    };
}
export interface DetectionEvidence {
    platform: {
        source: string;
        match: string;
    };
    framework: {
        files: string[];
        signatures: string[];
    };
}
export interface DetectionResult {
    platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual';
    framework: 'Cypress' | 'Selenium' | 'Playwright' | 'Storybook' | 'Robot Framework' | 'Appium';
    language: 'JavaScript/TypeScript' | 'Java' | 'Python';
    testType: 'e2e' | 'storybook' | 'appium';
    files: {
        config: string[];
        source: string[];
        ci: string[];
        packageManager: string[];
    };
    evidence: DetectionEvidence;
}
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
    migrationTime: number;
    successRate: number;
}
export interface ConfigTransformationResult {
    content: string;
    warnings: TransformationWarning[];
}
export interface CodeTransformationResult {
    content: string;
    warnings: TransformationWarning[];
    snapshotCount: number;
}
export interface ProposedChange {
    filePath: string;
    type: 'CREATE' | 'MODIFY' | 'INFO';
    description: string;
}
export interface AnalysisResult {
    filesToCreate: number;
    filesToModify: number;
    snapshotCount: number;
    warnings: TransformationWarning[];
    changes: ProposedChange[];
}
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
export interface ChangePreview {
    filePath: string;
    changeType: 'CREATE' | 'MODIFY' | 'DELETE';
    originalContent?: string;
    newContent: string;
    changes: ChangeDetail[];
    warnings: string[];
}
export interface ChangeDetail {
    lineNumber: number;
    originalLine: string;
    newLine: string;
    changeType: 'ADD' | 'MODIFY' | 'DELETE';
    description: string;
}
export interface TransformationPreview {
    configChanges: ChangePreview[];
    codeChanges: ChangePreview[];
    executionChanges: ChangePreview[];
    totalFiles: number;
    totalSnapshots: number;
    warnings: string[];
}
//# sourceMappingURL=index.d.ts.map