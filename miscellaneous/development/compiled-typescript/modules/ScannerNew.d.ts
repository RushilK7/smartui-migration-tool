import { DetectionResult } from '../types';
/**
 * Scanner module for analyzing user's project structure and dependencies
 * Responsible for detecting existing visual testing frameworks and configurations
 */
export declare class Scanner {
    private projectPath;
    private ignorePatterns;
    constructor(projectPath: string);
    /**
     * Scans the project for existing visual testing frameworks
     * @returns Promise<DetectionResult> - Analysis results
     */
    scan(): Promise<DetectionResult>;
    /**
     * Priority 1: Analyze dependencies in package.json, pom.xml, requirements.txt
     */
    private analyzeDependencies;
    /**
     * Analyze JavaScript/TypeScript dependencies in package.json
     */
    private analyzeJavaScriptDependencies;
    /**
     * Analyze Java dependencies in pom.xml
     */
    private analyzeJavaDependencies;
    /**
     * Analyze Python dependencies in requirements.txt
     */
    private analyzePythonDependencies;
    /**
     * Priority 2: Analyze configuration files as fallback
     */
    private analyzeConfigurationFiles;
    /**
     * Detect framework from project structure
     */
    private detectFrameworkFromStructure;
    /**
     * Create a DetectionResult with file paths
     */
    private createDetectionResult;
    /**
     * Collect relevant file paths based on platform and framework
     */
    private collectFilePaths;
    /**
     * Get configuration file patterns based on platform
     */
    private getConfigPatterns;
    /**
     * Get source file patterns based on framework
     */
    private getSourcePatterns;
    /**
     * Get CI/CD file patterns
     */
    private getCIPatterns;
    /**
     * Get package manager file patterns
     */
    private getPackageManagerPatterns;
    /**
     * Check if a directory exists
     */
    private hasDirectory;
    /**
     * Check if files matching pattern exist
     */
    private hasFiles;
    /**
     * Check if Maven dependency exists in pom.xml
     */
    private hasMavenDependency;
    /**
     * Extract dependencies from pom.xml structure
     */
    private extractDependencies;
}
//# sourceMappingURL=ScannerNew.d.ts.map