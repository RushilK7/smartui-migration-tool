import { FinalReportData } from '../types';
/**
 * Reporter module for generating migration summary reports
 * Provides detailed feedback on the migration process and results
 */
export declare class Reporter {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Generates a comprehensive migration report
     * @param reportData - Final report data containing all migration information
     * @returns Promise<string> - Generated Markdown report content
     */
    generateReport(reportData: FinalReportData): Promise<string>;
    /**
     * Generates console output report
     */
    private generateConsoleReport;
    /**
     * Generates HTML report
     */
    private generateHTMLReport;
    /**
     * Generates JSON report
     */
    private generateJSONReport;
    /**
     * Generates markdown report
     */
    private generateMarkdownReport;
    /**
     * Generates Appium-specific next steps
     */
    private generateAppiumNextSteps;
    /**
     * Generates standard next steps for non-Appium projects
     */
    private generateStandardNextSteps;
    /**
     * Generates the report header with title and timestamp
     */
    private generateReportHeader;
    /**
     * Generates the migration summary table
     */
    private generateMigrationSummaryTable;
    /**
     * Generates the files changed section
     */
    private generateFilesChangedSection;
    /**
     * Generates the warnings section
     */
    private generateWarningsSection;
    /**
     * Generates the next steps section based on detection result
     */
    private generateNextStepsSection;
    /**
     * Generates the install dependencies step
     */
    private generateInstallDependenciesStep;
    /**
     * Generates the configure secrets step
     */
    private generateConfigureSecretsStep;
    /**
     * Generates the run tests step
     */
    private generateRunTestsStep;
    /**
     * Generates additional notes based on test type
     */
    private generateAdditionalNotes;
    /**
     * Gets a display-friendly test type string
     */
    private getTestTypeDisplay;
    /**
     * Calculates migration statistics
     */
    private calculateStatistics;
}
//# sourceMappingURL=Reporter.d.ts.map