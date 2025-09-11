import { DetectionResult, TransformationPreview } from '../types';
export interface TransformationOptions {
    createBackup: boolean;
    confirmEachFile: boolean;
    dryRun: boolean;
}
export interface TransformationResult {
    success: boolean;
    filesCreated: string[];
    filesModified: string[];
    filesBackedUp: string[];
    errors: string[];
    warnings: string[];
}
export declare class TransformationManager {
    private projectPath;
    private verbose;
    private selectedFiles;
    constructor(projectPath: string, verbose?: boolean, selectedFiles?: string[]);
    /**
     * Execute the transformation with user confirmation and backup options
     */
    executeTransformation(detectionResult: DetectionResult, preview: TransformationPreview, options: TransformationOptions): Promise<TransformationResult>;
    /**
     * Show backup recommendation
     */
    private showBackupRecommendation;
    /**
     * Get user confirmation for the transformation
     */
    private getUserConfirmation;
    /**
     * Show detailed changes for each file
     */
    private showDetailedChanges;
    /**
     * Create backups of files that will be modified
     */
    private createBackups;
    /**
     * Execute configuration transformations
     */
    private executeConfigTransformation;
    /**
     * Execute code transformations
     */
    private executeCodeTransformation;
    /**
     * Execute execution file transformations
     */
    private executeExecutionTransformation;
    /**
     * Show transformation summary
     */
    private showTransformationSummary;
    /**
     * Show current state of the code after transformation
     */
    private showCurrentCodeState;
    /**
     * Find test files in the project
     */
    private findTestFiles;
}
//# sourceMappingURL=TransformationManager.d.ts.map