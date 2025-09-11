import { DetectionResult } from '../types';
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
export declare class ChangePreviewer {
    private projectPath;
    private verbose;
    private selectedFiles;
    constructor(projectPath: string, verbose?: boolean, selectedFiles?: string[]);
    /**
     * Generate a comprehensive preview of all changes that will be made
     */
    generatePreview(detectionResult: DetectionResult): Promise<TransformationPreview>;
    /**
     * Preview configuration file changes
     */
    private previewConfigChanges;
    /**
     * Preview code file changes
     */
    private previewCodeChanges;
    /**
     * Preview execution file changes
     */
    private previewExecutionChanges;
    /**
     * Generate a diff between original and transformed content
     */
    private generateDiff;
    /**
     * Generate SmartUI configuration content
     */
    private generateSmartUIConfig;
    /**
     * Display the preview in a user-friendly format
     */
    displayPreview(preview: TransformationPreview): void;
    /**
     * Display individual file change with detailed information
     */
    private displayFileChange;
}
//# sourceMappingURL=ChangePreviewer.d.ts.map