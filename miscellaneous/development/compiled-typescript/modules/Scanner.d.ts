import { DetectionResult, MultiDetectionResult } from '../types';
/**
 * Scanner module for analyzing user's project structure and dependencies
 * Implements "Anchor and Search" strategy for intelligent, content-aware detection
 */
export declare class Scanner {
    private projectPath;
    private verbose;
    private multiDetectionMode;
    private ignorePatterns;
    private readonly platformMagicStrings;
    private readonly frameworkSignatures;
    constructor(projectPath: string, verbose?: boolean);
    /**
     * Set multi-detection mode
     */
    setMultiDetectionMode(enabled: boolean): void;
    /**
     * Multi-detection scanning method that collects all detected platforms/frameworks
     */
    scanMultiDetection(): Promise<MultiDetectionResult>;
    /**
     * Scans the project for existing visual testing frameworks using "Anchor and Search" strategy
     * @returns Promise<DetectionResult> - Analysis results
     */
    scan(): Promise<DetectionResult>;
    /**
     * Phase 1: Find Anchor - Fast, high-confidence detection through dependencies and config files
     */
    private findAnchor;
    /**
     * Find anchor through JavaScript/TypeScript dependencies
     */
    private findJavaScriptAnchor;
    /**
     * Find anchor through Java dependencies
     */
    private findJavaAnchor;
    /**
     * Find anchor through Python dependencies
     */
    private findPythonAnchor;
    /**
     * Find anchor through configuration files
     */
    private findConfigAnchor;
    /**
     * Phase 2: Deep Content Search - Find source files containing magic strings
     */
    private deepContentSearch;
    /**
     * Detect framework using weighted signature patterns
     */
    private detectFramework;
    /**
     * Get context-aware error message for mismatched signals
     */
    private getMismatchedSignalsErrorMessage;
    /**
     * Determine platform from content when no anchor is found
     */
    private determinePlatformFromContent;
    /**
     * Create final DetectionResult with all collected information
     */
    private createDetectionResult;
    /**
     * Determine framework, language, and test type based on platform and source files
     */
    private determineFrameworkAndLanguage;
    /**
     * Determine language from source file extensions
     */
    private determineLanguageFromSourceFiles;
    /**
     * Determine test type based on framework
     */
    private determineTestType;
    /**
     * Get configuration file patterns based on platform
     */
    private getConfigPatterns;
    /**
     * Get CI/CD file patterns
     */
    private getCIPatterns;
    /**
     * Get package manager file patterns
     */
    private getPackageManagerPatterns;
    /**
     * Check if Maven dependency exists in pom.xml
     */
    private hasMavenDependency;
    /**
     * Extract dependencies from pom.xml structure
     */
    private extractDependencies;
    /**
     * Find all platform anchors without throwing errors for multiple detections
     */
    private findAllAnchors;
    /**
     * Find all frameworks without throwing errors
     */
    private findAllFrameworks;
    /**
     * Find all languages without throwing errors
     */
    private findAllLanguages;
    /**
     * Find all JavaScript/TypeScript platforms without throwing errors
     */
    private findAllJavaScriptPlatforms;
}
//# sourceMappingURL=Scanner.d.ts.map