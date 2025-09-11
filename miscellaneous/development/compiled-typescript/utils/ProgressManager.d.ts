export interface ProgressOptions {
    title: string;
    total: number;
    showPercentage?: boolean;
    showEta?: boolean;
    showSpeed?: boolean;
    format?: string;
}
export declare class ProgressManager {
    private progressBar;
    private currentValue;
    private startTime;
    private verbose;
    constructor(verbose?: boolean);
    /**
     * Start a new progress bar
     */
    start(options: ProgressOptions): void;
    /**
     * Update progress bar
     */
    update(value: number, payload?: any): void;
    /**
     * Increment progress bar
     */
    increment(step?: number, payload?: any): void;
    /**
     * Set progress bar to a specific value
     */
    setValue(value: number, payload?: any): void;
    /**
     * Stop the progress bar
     */
    stop(): void;
    /**
     * Complete the progress bar
     */
    complete(payload?: any): void;
    /**
     * Get default format for progress bar
     */
    private getDefaultFormat;
    /**
     * Format time in milliseconds to human readable format
     */
    private formatTime;
    /**
     * Create a progress bar for file processing
     */
    static createFileProgress(totalFiles: number, verbose?: boolean): ProgressManager;
    /**
     * Create a progress bar for scanning phase
     */
    static createScanProgress(totalSteps: number, verbose?: boolean): ProgressManager;
    /**
     * Create a progress bar for transformation phase
     */
    static createTransformProgress(totalFiles: number, verbose?: boolean): ProgressManager;
    /**
     * Create a progress bar for preview generation
     */
    static createPreviewProgress(totalFiles: number, verbose?: boolean): ProgressManager;
}
//# sourceMappingURL=ProgressManager.d.ts.map