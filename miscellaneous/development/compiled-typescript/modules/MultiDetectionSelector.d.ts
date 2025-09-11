import { MultiDetectionResult, DetectedPlatform, DetectedFramework, DetectedLanguage } from '../types';
/**
 * MultiDetectionSelector handles the selection process when multiple platforms,
 * frameworks, or languages are detected in a project
 */
export declare class MultiDetectionSelector {
    /**
     * Display detected platforms, frameworks, and languages in a matrix format
     */
    static displayDetectionMatrix(result: MultiDetectionResult): void;
    /**
     * Get user selection for which platform/framework/language to migrate
     */
    static getUserSelection(result: MultiDetectionResult): Promise<{
        platform?: DetectedPlatform;
        framework?: DetectedFramework;
        language?: DetectedLanguage;
    }>;
    /**
     * Display the selected option and confirm with user
     */
    static confirmSelection(selection: {
        platform?: DetectedPlatform;
        framework?: DetectedFramework;
        language?: DetectedLanguage;
    }): Promise<boolean>;
    /**
     * Get confidence color for display
     */
    private static getConfidenceColor;
    /**
     * Get confidence icon for display
     */
    private static getConfidenceIcon;
}
//# sourceMappingURL=MultiDetectionSelector.d.ts.map