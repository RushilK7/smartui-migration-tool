import { DetectionResult, ScanResult } from '../types';
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
    scanProject(): Promise<ScanResult>;
    /**
     * Detects Percy configuration and test files
     */
    private detectPercy;
    /**
     * Detects Applitools configuration and test files
     */
    private detectApplitools;
    /**
     * Detects Sauce Labs configuration and test files
     */
    private detectSauceLabs;
}
//# sourceMappingURL=ScannerOld.d.ts.map