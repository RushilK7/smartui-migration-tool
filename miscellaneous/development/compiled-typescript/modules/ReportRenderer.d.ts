import { AnalysisResult } from '../types';
/**
 * ReportRenderer module for displaying analysis results in a professional table format
 * Uses cli-table3 for table rendering and chalk for color coding
 */
export declare class ReportRenderer {
    /**
     * Renders the analysis result as a formatted table
     * @param analysisResult - The analysis result to display
     */
    static renderAnalysisReport(analysisResult: AnalysisResult): void;
    /**
     * Renders the summary statistics
     * @param analysisResult - The analysis result
     */
    private static renderSummary;
    /**
     * Renders the changes table
     * @param changes - Array of proposed changes
     */
    private static renderChangesTable;
    /**
     * Renders warnings section
     * @param warnings - Array of warnings
     */
    private static renderWarnings;
    /**
     * Gets the appropriate color function for a change type
     * @param changeType - The type of change
     * @returns Chalk color function
     */
    private static getChangeTypeColor;
    /**
     * Gets the display text for a change type
     * @param changeType - The type of change
     * @returns Display text
     */
    private static getChangeTypeText;
}
//# sourceMappingURL=ReportRenderer.d.ts.map