import { AnalysisResult } from '../types';
/**
 * FileSelector module for interactive file selection during migration
 * Provides granular control over which files to migrate for targeted POCs
 */
export declare class FileSelector {
    /**
     * Prompts user to choose migration scope (all files or selective)
     * @param analysisResult - The analysis result containing file information
     * @returns Promise<string> - The chosen migration scope ('all', 'select', or 'cancel')
     */
    static promptMigrationScope(analysisResult: AnalysisResult): Promise<string>;
    /**
     * Prompts user to select specific files for migration
     * @param analysisResult - The analysis result containing all proposed changes
     * @returns Promise<string[]> - Array of selected file paths
     */
    static promptFileSelection(analysisResult: AnalysisResult): Promise<string[]>;
    /**
     * Groups proposed changes by their type for better organization
     * @param changes - Array of proposed changes
     * @returns Object with grouped changes by type
     */
    private static groupChangesByType;
    /**
     * Builds the choices array for the inquirer checkbox prompt
     * @param groupedChanges - Changes grouped by type
     * @returns Array of choices with separators
     */
    private static buildChoicesArray;
    /**
     * Formats a file choice for display in the checkbox prompt
     * @param change - The proposed change
     * @returns Formatted display string
     */
    private static formatFileChoice;
    /**
     * Gets the default selections (all files selected by default)
     * @param changes - Array of proposed changes
     * @returns Array of file paths that should be selected by default
     */
    private static getDefaultSelections;
    /**
     * Displays a summary of the selected files
     * @param selectedFiles - Array of selected file paths
     * @param analysisResult - The original analysis result
     */
    static displaySelectionSummary(selectedFiles: string[], analysisResult: AnalysisResult): void;
    /**
     * Filters the analysis result to only include selected files
     * @param analysisResult - The original analysis result
     * @param selectedFiles - Array of selected file paths
     * @returns Filtered analysis result
     */
    static filterAnalysisResult(analysisResult: AnalysisResult, selectedFiles: string[]): AnalysisResult;
}
//# sourceMappingURL=FileSelector.d.ts.map