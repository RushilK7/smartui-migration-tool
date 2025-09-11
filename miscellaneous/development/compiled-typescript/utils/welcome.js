"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeScreen = void 0;
const chalk_1 = __importDefault(require("chalk"));
const figlet_1 = __importDefault(require("figlet"));
const util_1 = require("util");
const figletAsync = (0, util_1.promisify)(figlet_1.default);
/**
 * Welcome screen utility for displaying the SmartUI Migration Tool introduction
 */
class WelcomeScreen {
    /**
     * Displays the welcome screen with SmartUI branding
     */
    static async display() {
        // Clear the console for a clean start
        console.clear();
        try {
            // Generate the main title using figlet
            const title = await figletAsync('SmartUI');
            // Display the title with brand colors
            console.log(chalk_1.default.hex('#00D4AA').bold(title));
            // Display the tagline
            console.log(chalk_1.default.hex('#1E40AF').bold('\n  Begin your journey with SmartUI\n'));
            // Add a subtle separator line
            console.log(chalk_1.default.gray('─'.repeat(60)));
            // Display version and description
            console.log(chalk_1.default.white('\n  SmartUI Migration Tool v1.0.0'));
            console.log(chalk_1.default.gray('  Migrate your visual testing suite to LambdaTest SmartUI\n'));
            // Add a brief pause for visual impact
            await this.sleep(1500);
        }
        catch (error) {
            // Fallback if figlet fails
            console.log(chalk_1.default.hex('#00D4AA').bold('\n  ╔══════════════════════════════════════╗'));
            console.log(chalk_1.default.hex('#00D4AA').bold('  ║              SmartUI                ║'));
            console.log(chalk_1.default.hex('#00D4AA').bold('  ╚══════════════════════════════════════╝'));
            console.log(chalk_1.default.hex('#1E40AF').bold('\n  Begin your journey with SmartUI\n'));
            await this.sleep(1500);
        }
    }
    /**
     * Displays a loading message with animation
     */
    static async showLoading(message) {
        const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        let i = 0;
        const interval = setInterval(() => {
            process.stdout.write(`\r${chalk_1.default.cyan(frames[i])} ${chalk_1.default.white(message)}`);
            i = (i + 1) % frames.length;
        }, 100);
        // Return a promise that resolves after a delay
        return new Promise((resolve) => {
            setTimeout(() => {
                clearInterval(interval);
                process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the line
                resolve();
            }, 2000);
        });
    }
    /**
     * Displays a success message
     */
    static showSuccess(message) {
        console.log(chalk_1.default.green('✓'), chalk_1.default.white(message));
    }
    /**
     * Displays a warning message
     */
    static showWarning(message) {
        console.log(chalk_1.default.yellow('⚠'), chalk_1.default.white(message));
    }
    /**
     * Displays an error message
     */
    static showError(message) {
        console.log(chalk_1.default.red('✗'), chalk_1.default.white(message));
    }
    /**
     * Displays an info message
     */
    static showInfo(message) {
        console.log(chalk_1.default.blue('ℹ'), chalk_1.default.white(message));
    }
    /**
     * Utility function to create a delay
     */
    static sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
exports.WelcomeScreen = WelcomeScreen;
//# sourceMappingURL=welcome.js.map