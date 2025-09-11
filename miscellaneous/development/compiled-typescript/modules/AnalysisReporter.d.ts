import { DetectionResult, AnalysisResult } from '../types';
/**
 * AnalysisReporter module for performing virtual migrations and generating pre-migration analysis reports
 * This module orchestrates all transformers in read-only mode to preview proposed changes
 */
export declare class AnalysisReporter {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Performs a virtual migration analysis to preview all proposed changes
     * @param detectionResult - The result from the Scanner module
     * @returns AnalysisResult containing all proposed changes and statistics
     */
    analyze(detectionResult: DetectionResult): Promise<AnalysisResult>;
    /**
     * Analyzes configuration transformation
     * @param detectionResult - The detection result
     * @param configTransformer - The config transformer instance
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    private analyzeConfigurationTransformation;
    /**
     * Analyzes code transformation
     * @param detectionResult - The detection result
     * @param codeTransformer - The JS/TS code transformer
     * @param javaCodeTransformer - The Java code transformer
     * @param pythonCodeTransformer - The Python code transformer
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    private analyzeCodeTransformation;
    /**
     * Analyzes execution transformation
     * @param detectionResult - The detection result
     * @param executionTransformer - The execution transformer instance
     * @param storybookTransformer - The storybook transformer instance
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    private analyzeExecutionTransformation;
}
//# sourceMappingURL=AnalysisReporter.d.ts.map