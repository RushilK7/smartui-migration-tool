"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const types_1 = require("../types");
/**
 * Scanner module for analyzing user's project structure and dependencies
 * Responsible for detecting existing visual testing frameworks and configurations
 */
class Scanner {
    constructor(projectPath) {
        this.ignorePatterns = [
            'node_modules/**',
            '.git/**',
            'dist/**',
            'build/**',
            '.next/**',
            'coverage/**',
            '.nyc_output/**',
            '*.log',
            '.DS_Store'
        ];
        this.projectPath = projectPath;
    }
    /**
     * Scans the project for existing visual testing frameworks
     * @returns Promise<DetectionResult> - Analysis results
     */
    async scan() {
        try {
            // Priority 1: Dependency Analysis (Most Reliable)
            const dependencyResult = await this.analyzeDependencies();
            if (dependencyResult) {
                return dependencyResult;
            }
            // Priority 2: Configuration File Analysis (Fallback)
            const configResult = await this.analyzeConfigurationFiles();
            if (configResult) {
                return configResult;
            }
            // No platform detected
            throw new types_1.PlatformNotDetectedError();
        }
        catch (error) {
            if (error instanceof types_1.PlatformNotDetectedError || error instanceof types_1.MultiplePlatformsDetectedError) {
                throw error;
            }
            throw new Error(`Scanner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    // Legacy method for backward compatibility
    async scanProject() {
        // TODO: Implement project scanning logic
        throw new Error('Scanner.scanProject() not implemented yet');
    }
    /**
     * Detects Percy configuration and test files
     */
    async detectPercy() {
        // TODO: Implement Percy detection
        throw new Error('Percy detection not implemented yet');
    }
    /**
     * Detects Applitools configuration and test files
     */
    async detectApplitools() {
        // TODO: Implement Applitools detection
        throw new Error('Applitools detection not implemented yet');
    }
    /**
     * Detects Sauce Labs configuration and test files
     */
    async detectSauceLabs() {
        // TODO: Implement Sauce Labs detection
        throw new Error('Sauce Labs detection not implemented yet');
    }
}
exports.Scanner = Scanner;
//# sourceMappingURL=ScannerOld.js.map