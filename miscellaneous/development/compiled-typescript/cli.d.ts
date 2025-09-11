/**
 * Interactive CLI workflow for the SmartUI Migration Tool
 * Provides a human-first experience with clear feedback and user control
 */
export declare class InteractiveCLI {
    private isAutomated;
    private projectPath;
    constructor(isAutomated?: boolean, projectPath?: string);
    /**
     * Main interactive workflow that guides the user through the migration process
     */
    runWorkflow(): Promise<boolean>;
    /**
     * Performs actual project scanning using the Scanner module
     */
    private scanProject;
    /**
     * Displays the detection results in a clean, readable format with evidence
     */
    private displayDetectionResults;
    /**
     * Presents the user with a choice menu using inquirer
     */
    private presentUserChoice;
    /**
     * Displays a loading spinner with custom message
     */
    static showSpinner(message: string, duration?: number): Promise<void>;
    /**
     * Displays a success message with consistent formatting
     */
    static showSuccess(message: string): void;
    /**
     * Displays a warning message with consistent formatting
     */
    static showWarning(message: string): void;
    /**
     * Displays an error message with consistent formatting
     */
    static showError(message: string): void;
    /**
     * Displays an info message with consistent formatting
     */
    static showInfo(message: string): void;
}
//# sourceMappingURL=cli.d.ts.map