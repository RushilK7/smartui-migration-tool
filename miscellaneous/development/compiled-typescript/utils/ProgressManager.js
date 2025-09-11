"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressManager = void 0;
const cli_progress_1 = __importDefault(require("cli-progress"));
const chalk_1 = __importDefault(require("chalk"));
class ProgressManager {
    constructor(verbose = false) {
        this.progressBar = null;
        this.currentValue = 0;
        this.startTime = 0;
        this.verbose = verbose;
    }
    /**
     * Start a new progress bar
     */
    start(options) {
        if (this.progressBar) {
            this.stop();
        }
        this.currentValue = 0;
        this.startTime = Date.now();
        // Create progress bar with custom format
        const format = options.format || this.getDefaultFormat(options);
        this.progressBar = new cli_progress_1.default.SingleBar({
            format: format,
            barCompleteChar: '█',
            barIncompleteChar: '░',
            hideCursor: true,
            clearOnComplete: false,
            stopOnComplete: true
        }, cli_progress_1.default.Presets.shades_classic);
        // Start the progress bar
        this.progressBar.start(options.total, 0, {
            title: options.title,
            percentage: 0,
            eta: 'N/A',
            speed: 'N/A'
        });
        if (this.verbose) {
            console.log(chalk_1.default.blue(`\n🔄 Starting: ${options.title}`));
        }
    }
    /**
     * Update progress bar
     */
    update(value, payload) {
        if (!this.progressBar)
            return;
        this.currentValue = value;
        const elapsed = Date.now() - this.startTime;
        const percentage = Math.round((value / this.progressBar.getTotal()) * 100);
        // Calculate ETA
        let eta = 'N/A';
        if (value > 0) {
            const rate = value / elapsed;
            const remaining = (this.progressBar.getTotal() - value) / rate;
            eta = this.formatTime(remaining);
        }
        // Calculate speed
        const speed = value > 0 ? `${(value / (elapsed / 1000)).toFixed(1)}/s` : 'N/A';
        this.progressBar.update(value, {
            percentage,
            eta,
            speed,
            ...payload
        });
    }
    /**
     * Increment progress bar
     */
    increment(step = 1, payload) {
        if (!this.progressBar)
            return;
        this.update(this.currentValue + step, payload);
    }
    /**
     * Set progress bar to a specific value
     */
    setValue(value, payload) {
        this.update(value, payload);
    }
    /**
     * Stop the progress bar
     */
    stop() {
        if (this.progressBar) {
            this.progressBar.stop();
            this.progressBar = null;
        }
    }
    /**
     * Complete the progress bar
     */
    complete(payload) {
        if (!this.progressBar)
            return;
        const total = this.progressBar.getTotal();
        this.update(total, {
            percentage: 100,
            eta: '0s',
            speed: 'N/A',
            ...payload
        });
        this.stop();
    }
    /**
     * Get default format for progress bar
     */
    getDefaultFormat(options) {
        const parts = [
            '{title}',
            '|{bar}|',
            '{percentage}%',
            '({value}/{total})'
        ];
        if (options.showEta) {
            parts.push('ETA: {eta}');
        }
        if (options.showSpeed) {
            parts.push('Speed: {speed}');
        }
        return parts.join(' ');
    }
    /**
     * Format time in milliseconds to human readable format
     */
    formatTime(ms) {
        if (ms < 1000) {
            return `${Math.round(ms)}ms`;
        }
        else if (ms < 60000) {
            return `${Math.round(ms / 1000)}s`;
        }
        else {
            const minutes = Math.floor(ms / 60000);
            const seconds = Math.round((ms % 60000) / 1000);
            return `${minutes}m ${seconds}s`;
        }
    }
    /**
     * Create a progress bar for file processing
     */
    static createFileProgress(totalFiles, verbose = false) {
        const progress = new ProgressManager(verbose);
        progress.start({
            title: 'Processing files',
            total: totalFiles,
            showPercentage: true,
            showEta: true,
            showSpeed: true,
            format: '{title} |{bar}| {percentage}% ({value}/{total}) ETA: {eta} Speed: {speed}'
        });
        return progress;
    }
    /**
     * Create a progress bar for scanning phase
     */
    static createScanProgress(totalSteps, verbose = false) {
        const progress = new ProgressManager(verbose);
        progress.start({
            title: 'Scanning project',
            total: totalSteps,
            showPercentage: true,
            showEta: true,
            format: '{title} |{bar}| {percentage}% ({value}/{total}) ETA: {eta}'
        });
        return progress;
    }
    /**
     * Create a progress bar for transformation phase
     */
    static createTransformProgress(totalFiles, verbose = false) {
        const progress = new ProgressManager(verbose);
        progress.start({
            title: 'Transforming files',
            total: totalFiles,
            showPercentage: true,
            showEta: true,
            showSpeed: true,
            format: '{title} |{bar}| {percentage}% ({value}/{total}) ETA: {eta} Speed: {speed}'
        });
        return progress;
    }
    /**
     * Create a progress bar for preview generation
     */
    static createPreviewProgress(totalFiles, verbose = false) {
        const progress = new ProgressManager(verbose);
        progress.start({
            title: 'Generating preview',
            total: totalFiles,
            showPercentage: true,
            showEta: true,
            format: '{title} |{bar}| {percentage}% ({value}/{total}) ETA: {eta}'
        });
        return progress;
    }
}
exports.ProgressManager = ProgressManager;
//# sourceMappingURL=ProgressManager.js.map