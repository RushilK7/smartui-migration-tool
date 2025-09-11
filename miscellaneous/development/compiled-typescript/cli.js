"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InteractiveCLI = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const ora_1 = __importDefault(require("ora"));
const chalk_1 = __importDefault(require("chalk"));
const welcome_1 = require("./utils/welcome");
const Scanner_1 = require("./modules/Scanner");
const types_1 = require("./types");
const Logger_1 = require("./utils/Logger");
/**
 * Interactive CLI workflow for the SmartUI Migration Tool
 * Provides a human-first experience with clear feedback and user control
 */
class InteractiveCLI {
    constructor(isAutomated = false, projectPath = process.cwd()) {
        this.isAutomated = isAutomated;
        this.projectPath = projectPath;
    }
    /**
     * Main interactive workflow that guides the user through the migration process
     */
    async runWorkflow() {
        try {
            // Display welcome screen
            await welcome_1.WelcomeScreen.display();
            // Start project scanning with spinner
            const spinner = (0, ora_1.default)({
                text: 'Scanning your project for visual tests...',
                spinner: 'dots',
                color: 'cyan',
            });
            spinner.start();
            // Perform actual project scanning
            const detectionResult = await this.scanProject();
            // Stop spinner with success message
            spinner.succeed(chalk_1.default.green('✅ Project analysis complete.'));
            // Display detection results
            this.displayDetectionResults(detectionResult);
            // If automated mode, skip interactive prompts
            if (this.isAutomated) {
                console.log(chalk_1.default.blue('🤖 Automated mode: Proceeding with migration...'));
                return true;
            }
            // Present interactive menu to user
            const shouldProceed = await this.presentUserChoice();
            return shouldProceed;
        }
        catch (error) {
            if (error instanceof types_1.PlatformNotDetectedError) {
                console.error(chalk_1.default.red('❌ Platform Detection Error:'));
                console.error(chalk_1.default.red(error.message));
                return false;
            }
            if (error instanceof types_1.MultiplePlatformsDetectedError) {
                // Re-throw the error so it can be handled by the migrate command
                throw error;
            }
            console.error(chalk_1.default.red('❌ An error occurred during the interactive workflow:'));
            console.error(chalk_1.default.red(error instanceof Error ? error.message : 'Unknown error'));
            return false;
        }
    }
    /**
     * Performs actual project scanning using the Scanner module
     */
    async scanProject() {
        // Get verbose flag from logger instance
        const verbose = Logger_1.logger['isVerbose'] || false;
        const scanner = new Scanner_1.Scanner(this.projectPath, verbose);
        return await scanner.scan();
    }
    /**
     * Displays the detection results in a clean, readable format with evidence
     */
    displayDetectionResults(detectionResult) {
        const { platform, framework, language, files, evidence } = detectionResult;
        // Main detection summary with evidence
        console.log(chalk_1.default.green('✅ Analysis Complete!'));
        console.log('');
        // Platform detection evidence
        const platformEvidence = evidence.platform;
        console.log(chalk_1.default.white(`- Detected Platform: ${chalk_1.default.bold(platform)} ${chalk_1.default.gray(`(Evidence: Found '${platformEvidence.match}' in ${platformEvidence.source})`)}`));
        // Framework detection evidence
        const frameworkEvidence = evidence.framework;
        const frameworkFileCount = frameworkEvidence.files.length;
        console.log(chalk_1.default.white(`- Detected Framework: ${chalk_1.default.bold(framework)} ${chalk_1.default.gray(`(Evidence: Matched signatures in ${frameworkFileCount} files)`)}`));
        console.log('');
        // Show source files that were found
        if (files.source.length > 0) {
            console.log(chalk_1.default.white.bold(`Our deep content search found visual testing patterns in the following ${files.source.length} files:`));
            files.source.forEach((file) => {
                console.log(chalk_1.default.dim(`  - ${file}`));
            });
            console.log('');
        }
        // Show additional file counts
        if (files.config.length > 0) {
            console.log(chalk_1.default.blue(`📁 Configuration files: ${files.config.length} found`));
        }
        if (files.ci.length > 0) {
            console.log(chalk_1.default.blue(`🔄 CI/CD files: ${files.ci.length} found`));
        }
        console.log(''); // Add spacing
    }
    /**
     * Presents the user with a choice menu using inquirer
     */
    async presentUserChoice() {
        const question = {
            type: 'confirm',
            name: 'proceed',
            message: '? Does this look correct?',
            default: true,
        };
        const answers = await inquirer_1.default.prompt([question]);
        if (answers['proceed']) {
            console.log(chalk_1.default.green('🚀 Proceeding with migration...'));
            return true;
        }
        else {
            console.log(chalk_1.default.yellow('👋 Migration cancelled. Goodbye!'));
            return false;
        }
    }
    /**
     * Displays a loading spinner with custom message
     */
    static async showSpinner(message, duration = 2000) {
        const spinner = (0, ora_1.default)({
            text: message,
            spinner: 'dots',
            color: 'cyan',
        });
        spinner.start();
        await new Promise(resolve => setTimeout(resolve, duration));
        spinner.succeed(chalk_1.default.green(`✅ ${message.replace('...', ' complete.')}`));
    }
    /**
     * Displays a success message with consistent formatting
     */
    static showSuccess(message) {
        console.log(chalk_1.default.green(`✅ ${message}`));
    }
    /**
     * Displays a warning message with consistent formatting
     */
    static showWarning(message) {
        console.log(chalk_1.default.yellow(`⚠️  ${message}`));
    }
    /**
     * Displays an error message with consistent formatting
     */
    static showError(message) {
        console.log(chalk_1.default.red(`❌ ${message}`));
    }
    /**
     * Displays an info message with consistent formatting
     */
    static showInfo(message) {
        console.log(chalk_1.default.blue(`ℹ️  ${message}`));
    }
}
exports.InteractiveCLI = InteractiveCLI;
//# sourceMappingURL=cli.js.map