/**
 * Welcome screen utility for displaying the SmartUI Migration Tool introduction
 */
export declare class WelcomeScreen {
    /**
     * Displays the welcome screen with SmartUI branding
     */
    static display(): Promise<void>;
    /**
     * Displays a loading message with animation
     */
    static showLoading(message: string): Promise<void>;
    /**
     * Displays a success message
     */
    static showSuccess(message: string): void;
    /**
     * Displays a warning message
     */
    static showWarning(message: string): void;
    /**
     * Displays an error message
     */
    static showError(message: string): void;
    /**
     * Displays an info message
     */
    static showInfo(message: string): void;
    /**
     * Utility function to create a delay
     */
    private static sleep;
}
//# sourceMappingURL=welcome.d.ts.map