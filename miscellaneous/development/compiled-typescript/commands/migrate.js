"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const cli_1 = require("../cli");
const Scanner_1 = require("../modules/Scanner");
const ConfigTransformer_1 = require("../modules/ConfigTransformer");
const CodeTransformer_1 = require("../modules/CodeTransformer");
const JavaCodeTransformer_1 = require("../modules/JavaCodeTransformer");
const PythonCodeTransformer_1 = require("../modules/PythonCodeTransformer");
const ExecutionTransformer_1 = require("../modules/ExecutionTransformer");
const StorybookTransformer_1 = require("../modules/StorybookTransformer");
const AnalysisReporter_1 = require("../modules/AnalysisReporter");
const ReportRenderer_1 = require("../modules/ReportRenderer");
const FileSelector_1 = require("../modules/FileSelector");
const Reporter_1 = require("../modules/Reporter");
const ChangePreviewer_1 = require("../modules/ChangePreviewer");
const TransformationManager_1 = require("../modules/TransformationManager");
const MultiDetectionSelector_1 = require("../modules/MultiDetectionSelector");
const Logger_1 = require("../utils/Logger");
const path_1 = __importDefault(require("path"));
/**
 * Main migration command for the SmartUI Migration Tool
 * This is the primary entry point that orchestrates the entire migration process
 */
class Migrate extends core_1.Command {
    async run() {
        const { args, flags } = await this.parse();
        try {
            // Check if interactive mode is requested
            const interactiveMode = flags['interactive'];
            let finalFlags = flags;
            if (interactiveMode) {
                finalFlags = await this.selectFlagsInteractively(flags);
            }
            // Initialize logger with verbose flag
            const verbose = finalFlags['verbose'];
            Logger_1.logger.setVerbose(verbose);
            if (verbose) {
                Logger_1.logger.verbose('SmartUI Migration Tool started in verbose mode');
                Logger_1.logger.verbose(`Project path: ${finalFlags['project-path']}`);
                Logger_1.logger.verbose(`Dry run: ${finalFlags['dry-run']}`);
                Logger_1.logger.verbose(`Auto confirm: ${finalFlags['yes']}`);
                Logger_1.logger.verbose(`Backup: ${finalFlags['backup']}`);
                Logger_1.logger.verbose(`Interactive mode: ${interactiveMode}`);
            }
            // Initialize interactive CLI with automation flag and project path
            const isAutomated = finalFlags['yes'];
            const projectPath = path_1.default.resolve(finalFlags['project-path']);
            const interactiveCLI = new cli_1.InteractiveCLI(isAutomated, projectPath);
            // Show initial info
            cli_1.InteractiveCLI.showInfo('Starting SmartUI Migration Tool...');
            cli_1.InteractiveCLI.showInfo(`Project path: ${finalFlags['project-path']}`);
            if (finalFlags['dry-run']) {
                cli_1.InteractiveCLI.showWarning('Running in dry-run mode - no changes will be made');
            }
            if (finalFlags['backup']) {
                cli_1.InteractiveCLI.showInfo('Backups will be created before making changes');
            }
            if (isAutomated) {
                cli_1.InteractiveCLI.showInfo('🤖 Running in automated mode (CI/CD)');
            }
            // Show loading animation
            await cli_1.InteractiveCLI.showSpinner('Initializing migration process...');
            // Initialize modules (projectPath already resolved above)
            const scanner = new Scanner_1.Scanner(projectPath, verbose);
            const configTransformer = new ConfigTransformer_1.ConfigTransformer(projectPath);
            const codeTransformer = new CodeTransformer_1.CodeTransformer(projectPath);
            const javaCodeTransformer = new JavaCodeTransformer_1.JavaCodeTransformer(projectPath);
            const pythonCodeTransformer = new PythonCodeTransformer_1.PythonCodeTransformer(projectPath);
            const executionTransformer = new ExecutionTransformer_1.ExecutionTransformer(projectPath);
            const storybookTransformer = new StorybookTransformer_1.StorybookTransformer(projectPath);
            const reporter = new Reporter_1.Reporter(projectPath);
            cli_1.InteractiveCLI.showSuccess('Migration modules initialized');
            // Step 1: Scan the project with advanced detection
            cli_1.InteractiveCLI.showInfo('Step 1: Scanning project for existing visual testing frameworks...');
            await cli_1.InteractiveCLI.showSpinner('Intelligently analyzing project...');
            Logger_1.logger.verbose('Starting advanced project scan');
            let detectionResult;
            try {
                // Try normal scan first
                detectionResult = await scanner.scan();
                Logger_1.logger.verbose(`Advanced scan completed - Platform: ${detectionResult.platform}, Framework: ${detectionResult.framework}, Language: ${detectionResult.language}`);
                cli_1.InteractiveCLI.showSuccess('Project scan completed');
            }
            catch (error) {
                // If multiple platforms detected, use multi-detection
                if (error.name === 'MultiplePlatformsDetectedError') {
                    Logger_1.logger.verbose('Multiple platforms detected, switching to multi-detection mode');
                    cli_1.InteractiveCLI.showInfo('Multiple visual testing setups detected. Let me show you what was found...');
                    const multiDetectionResult = await scanner.scanMultiDetection();
                    // Display detection matrix
                    MultiDetectionSelector_1.MultiDetectionSelector.displayDetectionMatrix(multiDetectionResult);
                    // Get user selection
                    const userSelection = await MultiDetectionSelector_1.MultiDetectionSelector.getUserSelection(multiDetectionResult);
                    // Confirm selection
                    const confirmed = await MultiDetectionSelector_1.MultiDetectionSelector.confirmSelection(userSelection);
                    if (!confirmed) {
                        cli_1.InteractiveCLI.showWarning('Migration cancelled by user');
                        this.exit(0);
                        return;
                    }
                    // Convert selection to DetectionResult format
                    detectionResult = this.convertSelectionToDetectionResult(userSelection, multiDetectionResult);
                    cli_1.InteractiveCLI.showSuccess('Selection confirmed, proceeding with migration');
                }
                else {
                    throw error;
                }
            }
            // Skip interactive workflow if we already have detection result from multi-detection
            // The runWorkflow is mainly for scanning, which we've already done
            let shouldProceed = true;
            if (!isAutomated) {
                // Show a simple confirmation prompt instead of full workflow
                const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
                const answer = await inquirer.default.prompt([
                    {
                        type: 'confirm',
                        name: 'proceed',
                        message: 'Do you want to proceed with the migration?',
                        default: true
                    }
                ]);
                shouldProceed = answer.proceed;
            }
            if (!shouldProceed) {
                // User chose to exit
                this.exit(0);
                return;
            }
            // Display evidence-based analysis report
            this.displayEvidenceBasedAnalysis(detectionResult);
            // User confirmation after evidence display
            if (!isAutomated) {
                const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
                const question = {
                    type: 'confirm',
                    name: 'proceed',
                    message: '? Does this look correct?',
                    default: true,
                };
                const answers = await inquirer.default.prompt([question]);
                if (!answers['proceed']) {
                    cli_1.InteractiveCLI.showInfo('Migration cancelled by user.');
                    return;
                }
            }
            // Step 2: Generate pre-migration analysis report
            cli_1.InteractiveCLI.showInfo('Step 2: Generating pre-migration analysis report...');
            await cli_1.InteractiveCLI.showSpinner('Simulating migration and generating preview...');
            const analysisReporter = new AnalysisReporter_1.AnalysisReporter(projectPath);
            const analysisResult = await analysisReporter.analyze(detectionResult);
            // Stop spinner and render the analysis report
            cli_1.InteractiveCLI.showSuccess('Analysis completed');
            ReportRenderer_1.ReportRenderer.renderAnalysisReport(analysisResult);
            // Step 2.5: Advanced file selection
            cli_1.InteractiveCLI.showInfo('Step 2.5: Advanced file selection...');
            // Prompt user for migration scope
            const migrationScope = await FileSelector_1.FileSelector.promptMigrationScope(analysisResult);
            let finalAnalysisResult = analysisResult;
            let selectedFiles = [];
            if (migrationScope === 'cancel') {
                cli_1.InteractiveCLI.showInfo('Migration cancelled by user.');
                return;
            }
            else if (migrationScope === 'select') {
                // Prompt user to select specific files
                selectedFiles = await FileSelector_1.FileSelector.promptFileSelection(analysisResult);
                // Filter the analysis result to only include selected files
                finalAnalysisResult = FileSelector_1.FileSelector.filterAnalysisResult(analysisResult, selectedFiles);
                // Display selection summary
                FileSelector_1.FileSelector.displaySelectionSummary(selectedFiles, analysisResult);
            }
            else {
                // Use all files
                selectedFiles = analysisResult.changes
                    .filter(change => change.type !== 'INFO')
                    .map(change => change.filePath);
                cli_1.InteractiveCLI.showInfo(`Proceeding with migration for all ${selectedFiles.length} files...`);
            }
            // Step 3: Generate transformation preview
            cli_1.InteractiveCLI.showInfo('Step 3: Generating transformation preview...');
            await cli_1.InteractiveCLI.showSpinner('Analyzing changes that will be made...');
            // Initialize change previewer with selected files
            const changePreviewer = new ChangePreviewer_1.ChangePreviewer(projectPath, verbose, selectedFiles);
            // Generate comprehensive preview
            const transformationPreview = await changePreviewer.generatePreview(detectionResult);
            cli_1.InteractiveCLI.showSuccess('Transformation preview generated');
            // Display the preview
            changePreviewer.displayPreview(transformationPreview);
            // Handle preview-only mode
            if (finalFlags['preview-only']) {
                console.log(chalk_1.default.blue('\n🔍 Preview mode - no changes will be made'));
                console.log(chalk_1.default.white('Use --no-preview-only to apply the transformations'));
                return;
            }
            // Step 4: Execute transformation with user confirmation
            cli_1.InteractiveCLI.showInfo('Step 4: Executing transformation...');
            // Initialize transformation manager with selected files
            const transformationManager = new TransformationManager_1.TransformationManager(projectPath, verbose, selectedFiles);
            // Set transformation options
            const transformationOptions = {
                createBackup: finalFlags['backup'],
                confirmEachFile: finalFlags['confirm-each'],
                dryRun: finalFlags['dry-run']
            };
            // Execute the transformation
            const transformationResult = await transformationManager.executeTransformation(detectionResult, transformationPreview, transformationOptions);
            if (!transformationResult.success) {
                cli_1.InteractiveCLI.showError('Transformation failed. Please check the errors above.');
                this.exit(1);
                return;
            }
            cli_1.InteractiveCLI.showSuccess('Transformation completed successfully');
            // Step 5: Generate report
            cli_1.InteractiveCLI.showInfo('Step 5: Generating migration report...');
            await cli_1.InteractiveCLI.showSpinner('Creating comprehensive migration report...');
            // Create final report data using transformation results
            const finalReportData = {
                detectionResult,
                filesCreated: transformationResult.filesCreated,
                filesModified: transformationResult.filesModified,
                snapshotCount: transformationPreview.totalSnapshots,
                warnings: transformationResult.warnings.map(warning => ({ message: warning })),
                migrationStartTime: new Date(), // This should be set at the beginning of migration
                migrationEndTime: new Date(),
                totalFilesProcessed: transformationResult.filesCreated.length + transformationResult.filesModified.length
            };
            // Generate the report
            const reportContent = await reporter.generateReport(finalReportData);
            // Write the report to MIGRATION_REPORT.md
            const reportPath = path_1.default.join(projectPath, 'MIGRATION_REPORT.md');
            await fs_1.promises.writeFile(reportPath, reportContent, 'utf-8');
            cli_1.InteractiveCLI.showSuccess('Migration report generated');
            // Final success message
            console.log('\n' + '='.repeat(60));
            cli_1.InteractiveCLI.showSuccess('Migration completed successfully!');
            console.log('='.repeat(60) + '\n');
            console.log(chalk_1.default.green('✅ Migration complete! A detailed summary has been saved to MIGRATION_REPORT.md\n'));
            // Show backup information if backups were created
            if (transformationResult.filesBackedUp.length > 0) {
                console.log(chalk_1.default.yellow('🛡️  Backup Information:'));
                console.log(chalk_1.default.white(`  • ${transformationResult.filesBackedUp.length} files backed up to .smartui-backup/`));
                console.log(chalk_1.default.white('  • Original files are safely preserved'));
                console.log(chalk_1.default.white('  • You can restore files if needed\n'));
            }
            if (verbose) {
                Logger_1.logger.verbose('Migration completed successfully');
                Logger_1.logger.verbose(`Total files processed: ${transformationResult.filesCreated.length + transformationResult.filesModified.length}`);
                Logger_1.logger.verbose(`Snapshots migrated: ${transformationPreview.totalSnapshots}`);
                Logger_1.logger.verbose(`Warnings generated: ${transformationResult.warnings.length}`);
                Logger_1.logger.verbose(`Files backed up: ${transformationResult.filesBackedUp.length}`);
            }
            cli_1.InteractiveCLI.showInfo('Next steps:');
            console.log(chalk_1.default.white('  1. Review the MIGRATION_REPORT.md file for detailed information'));
            console.log(chalk_1.default.white('  2. Install SmartUI dependencies: npm install @lambdatest/smartui-cli'));
            console.log(chalk_1.default.white('  3. Configure your SmartUI credentials'));
            console.log(chalk_1.default.white('  4. Run your migrated tests with SmartUI'));
            console.log(chalk_1.default.white('  5. Check the SmartUI Dashboard for test results'));
            if (transformationResult.filesBackedUp.length > 0) {
                console.log(chalk_1.default.white('  6. Keep the .smartui-backup/ folder until you\'re confident everything works'));
            }
            console.log(chalk_1.default.white('\n💡 For POC purposes, you can test the migration on a copy of your project first.'));
            console.log(chalk_1.default.white('   Once confident, run it on your real project directory.\n'));
        }
        catch (error) {
            cli_1.InteractiveCLI.showError(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.exit(1);
        }
    }
    /**
     * Display evidence-based analysis report from the advanced scanner
     */
    displayEvidenceBasedAnalysis(detectionResult) {
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
     * Interactive flag selection method
     * Allows users to select flags through a menu system
     */
    async selectFlagsInteractively(initialFlags) {
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        console.log(chalk_1.default.bold.blue('\n🎛️  INTERACTIVE FLAG SELECTION'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        console.log(chalk_1.default.white('Select your preferred options for the migration:'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        const questions = [
            {
                type: 'confirm',
                name: 'backup',
                message: '🛡️  Create backups before making changes?',
                default: initialFlags['backup'],
            },
            {
                type: 'confirm',
                name: 'dryRun',
                message: '🔍 Perform a dry run (no actual changes)?',
                default: initialFlags['dry-run'],
            },
            {
                type: 'confirm',
                name: 'verbose',
                message: '📝 Enable verbose output for debugging?',
                default: initialFlags['verbose'],
            },
            {
                type: 'confirm',
                name: 'yes',
                message: '🤖 Skip interactive prompts (automated mode for CI/CD)?',
                default: initialFlags['yes'],
            },
            {
                type: 'confirm',
                name: 'previewOnly',
                message: '👀 Show preview only (no transformation)?',
                default: initialFlags['preview-only'],
            },
            {
                type: 'confirm',
                name: 'confirmEach',
                message: '✅ Ask for confirmation before transforming each file?',
                default: initialFlags['confirm-each'],
            }
        ];
        const answers = await inquirer.default.prompt(questions);
        // Create final flags object
        const finalFlags = {
            ...initialFlags,
            'backup': answers.backup,
            'dry-run': answers.dryRun,
            'verbose': answers.verbose,
            'yes': answers.yes,
            'preview-only': answers.previewOnly,
            'confirm-each': answers.confirmEach,
        };
        // Show selected options
        console.log(chalk_1.default.bold.green('\n✅ Selected Options:'));
        console.log(chalk_1.default.gray('='.repeat(30)));
        console.log(chalk_1.default.white(`🛡️  Backup: ${answers.backup ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.white(`🔍 Dry Run: ${answers.dryRun ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.white(`📝 Verbose: ${answers.verbose ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.white(`🤖 Automated: ${answers.yes ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.white(`👀 Preview Only: ${answers.previewOnly ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.white(`✅ Confirm Each: ${answers.confirmEach ? '✅ Yes' : '❌ No'}`));
        console.log(chalk_1.default.gray('='.repeat(30)));
        // Validate flag combinations
        this.validateFlagCombinations(finalFlags);
        return finalFlags;
    }
    /**
     * Validate flag combinations and show warnings
     */
    validateFlagCombinations(flags) {
        const warnings = [];
        // Check for conflicting flags
        if (flags['dry-run'] && flags['preview-only']) {
            warnings.push('Both --dry-run and --preview-only are enabled. Preview-only will take precedence.');
        }
        if (flags['yes'] && flags['confirm-each']) {
            warnings.push('Automated mode (--yes) is enabled but --confirm-each is also set. Confirm-each will be ignored.');
        }
        if (flags['dry-run'] && !flags['backup']) {
            warnings.push('Dry run is enabled but backup is disabled. Consider enabling backup for safety.');
        }
        if (flags['preview-only'] && flags['backup']) {
            warnings.push('Preview-only mode is enabled but backup is also set. Backup will not be needed.');
        }
        // Show warnings if any
        if (warnings.length > 0) {
            console.log(chalk_1.default.bold.yellow('\n⚠️  Flag Combination Warnings:'));
            warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
            console.log('');
        }
        // Show recommendations
        const recommendations = [];
        if (!flags['backup'] && !flags['dry-run'] && !flags['preview-only']) {
            recommendations.push('Consider enabling backup for safety before making changes.');
        }
        if (!flags['verbose'] && !flags['yes']) {
            recommendations.push('Enable verbose mode for detailed output during migration.');
        }
        if (flags['yes'] && !flags['backup']) {
            recommendations.push('Automated mode is enabled. Consider enabling backup for safety.');
        }
        if (recommendations.length > 0) {
            console.log(chalk_1.default.bold.cyan('\n💡 Recommendations:'));
            recommendations.forEach(rec => {
                console.log(chalk_1.default.cyan(`  • ${rec}`));
            });
            console.log('');
        }
    }
    /**
     * Convert user selection to DetectionResult format
     */
    convertSelectionToDetectionResult(selection, multiResult) {
        // Default values
        let platform = 'Percy';
        let framework = 'Cypress';
        let language = 'JavaScript/TypeScript';
        let testType = 'e2e';
        // Use selected platform if available
        if (selection.platform) {
            platform = selection.platform.name;
            if (selection.platform.frameworks.length > 0) {
                framework = selection.platform.frameworks[0];
            }
            if (selection.platform.languages.length > 0) {
                language = selection.platform.languages[0];
            }
        }
        // Use selected framework if available
        if (selection.framework) {
            framework = selection.framework.name;
            if (selection.framework.platforms.length > 0) {
                platform = selection.framework.platforms[0];
            }
            if (selection.framework.languages.length > 0) {
                language = selection.framework.languages[0];
            }
        }
        // Use selected language if available
        if (selection.language) {
            language = selection.language.name;
            if (selection.language.platforms.length > 0) {
                platform = selection.language.platforms[0];
            }
            if (selection.language.frameworks.length > 0) {
                framework = selection.language.frameworks[0];
            }
        }
        // Determine test type based on framework
        if (framework === 'Storybook') {
            testType = 'storybook';
        }
        else if (framework === 'Appium') {
            testType = 'appium';
        }
        else {
            testType = 'e2e';
        }
        return {
            platform,
            framework,
            language,
            testType,
            files: {
                config: [],
                source: [],
                ci: [],
                packageManager: []
            },
            evidence: {
                platform: {
                    source: 'user selection',
                    match: 'selected from multiple detections'
                },
                framework: {
                    files: [],
                    signatures: []
                }
            }
        };
    }
}
Migrate.description = 'Migrate your visual testing suite to LambdaTest SmartUI';
Migrate.examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --interactive',
    '<%= config.bin %> <%= command.id %> --project-path ./my-project',
    '<%= config.bin %> <%= command.id %> --dry-run',
    '<%= config.bin %> <%= command.id %> --preview-only',
    '<%= config.bin %> <%= command.id %> --confirm-each --backup',
    '<%= config.bin %> <%= command.id %> --interactive --project-path ./my-project',
];
Migrate.flags = {
    'project-path': core_1.Flags.string({
        char: 'p',
        description: 'Path to the project to migrate',
        default: process.cwd(),
    }),
    'dry-run': core_1.Flags.boolean({
        char: 'd',
        description: 'Perform a dry run without making actual changes',
        default: false,
    }),
    'backup': core_1.Flags.boolean({
        char: 'b',
        description: 'Create backups before making changes',
        default: true,
    }),
    'verbose': core_1.Flags.boolean({
        char: 'v',
        description: 'Enable verbose output',
        default: false,
    }),
    'yes': core_1.Flags.boolean({
        char: 'y',
        description: 'Skip interactive prompts and proceed automatically (for CI/CD)',
        default: false,
    }),
    'interactive': core_1.Flags.boolean({
        char: 'i',
        description: 'Interactive mode - select flags through menu system',
        default: false,
    }),
    'preview-only': core_1.Flags.boolean({
        description: 'Show preview of changes without applying them',
        default: false,
    }),
    'confirm-each': core_1.Flags.boolean({
        description: 'Ask for confirmation before transforming each file',
        default: false,
    }),
};
Migrate.args = {
    framework: core_1.Args.string({
        description: 'Specific framework to migrate (percy, applitools, sauce-labs)',
        required: false,
    }),
};
exports.default = Migrate;
//# sourceMappingURL=migrate.js.map