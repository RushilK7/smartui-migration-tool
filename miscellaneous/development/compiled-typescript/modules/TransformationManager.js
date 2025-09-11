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
exports.TransformationManager = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const Logger_1 = require("../utils/Logger");
const ProgressManager_1 = require("../utils/ProgressManager");
class TransformationManager {
    constructor(projectPath, verbose = false, selectedFiles = []) {
        this.projectPath = projectPath;
        this.verbose = verbose;
        this.selectedFiles = selectedFiles;
    }
    /**
     * Execute the transformation with user confirmation and backup options
     */
    async executeTransformation(detectionResult, preview, options) {
        Logger_1.logger.verbose('Starting transformation execution...');
        const result = {
            success: true,
            filesCreated: [],
            filesModified: [],
            filesBackedUp: [],
            errors: [],
            warnings: []
        };
        // Show backup recommendation
        this.showBackupRecommendation();
        // Get user confirmation
        if (!options.dryRun) {
            const confirmed = await this.getUserConfirmation(preview, options);
            if (!confirmed) {
                console.log(chalk_1.default.yellow('Transformation cancelled by user.'));
                return result;
            }
        }
        // Create backups if requested
        if (options.createBackup && !options.dryRun) {
            await this.createBackups(preview, result);
        }
        // Execute transformations
        try {
            // Create progress bar for transformation
            const totalFiles = preview.configChanges.length + preview.codeChanges.length + preview.executionChanges.length;
            const progress = ProgressManager_1.ProgressManager.createTransformProgress(totalFiles, this.verbose);
            // Transform configurations
            progress.update(0, { title: 'Transforming configuration files' });
            await this.executeConfigTransformation(detectionResult, preview.configChanges, options, result);
            // Transform code
            progress.update(preview.configChanges.length, { title: 'Transforming code files' });
            await this.executeCodeTransformation(detectionResult, preview.codeChanges, options, result);
            // Transform execution files
            progress.update(preview.configChanges.length + preview.codeChanges.length, { title: 'Transforming execution files' });
            await this.executeExecutionTransformation(detectionResult, preview.executionChanges, options, result);
            progress.complete({ title: 'Transformation completed successfully' });
        }
        catch (error) {
            result.success = false;
            result.errors.push(`Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            Logger_1.logger.verbose(`Transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        // Show transformation summary
        this.showTransformationSummary(result);
        // Show current state of the code
        await this.showCurrentCodeState();
        return result;
    }
    /**
     * Show backup recommendation
     */
    showBackupRecommendation() {
        console.log(chalk_1.default.yellow.bold('\n🛡️  BACKUP RECOMMENDATION'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(chalk_1.default.yellow('⚠️  IMPORTANT: Before proceeding with the transformation, we strongly recommend:'));
        console.log(chalk_1.default.white('   1. Creating a backup of your project directory'));
        console.log(chalk_1.default.white('   2. Committing your current changes to version control'));
        console.log(chalk_1.default.white('   3. Testing the transformation on a copy first'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(chalk_1.default.blue('💡 For POC purposes, consider running this on a test directory first.'));
        console.log(chalk_1.default.blue('   Once you\'re confident with the results, you can run it on your real project.'));
        console.log(chalk_1.default.gray('─'.repeat(50)));
    }
    /**
     * Get user confirmation for the transformation
     */
    async getUserConfirmation(preview, options) {
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        console.log(chalk_1.default.bold.blue('\n🤔 TRANSFORMATION CONFIRMATION'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        // Show detailed summary
        console.log(chalk_1.default.white(`\nThe migration will:`));
        console.log(chalk_1.default.white(`  • Modify ${preview.totalFiles} files`));
        console.log(chalk_1.default.white(`  • Migrate ${preview.totalSnapshots} snapshots`));
        console.log(chalk_1.default.white(`  • Create ${preview.configChanges.filter(c => c.changeType === 'CREATE').length} new files`));
        console.log(chalk_1.default.white(`  • Modify ${preview.configChanges.filter(c => c.changeType === 'MODIFY').length + preview.codeChanges.length + preview.executionChanges.length} existing files`));
        if (preview.warnings.length > 0) {
            console.log(chalk_1.default.yellow(`  • ${preview.warnings.length} warnings to review`));
        }
        // Show detailed file breakdown
        console.log(chalk_1.default.bold('\n📋 File Breakdown:'));
        if (preview.configChanges.length > 0) {
            console.log(chalk_1.default.blue(`  Configuration files (${preview.configChanges.length}):`));
            preview.configChanges.forEach(change => {
                const icon = change.changeType === 'CREATE' ? '➕' : '✏️';
                console.log(chalk_1.default.blue(`    ${icon} ${change.filePath} (${change.changes.length} changes)`));
            });
        }
        if (preview.codeChanges.length > 0) {
            console.log(chalk_1.default.green(`  Code files (${preview.codeChanges.length}):`));
            preview.codeChanges.forEach(change => {
                console.log(chalk_1.default.green(`    ✏️  ${change.filePath} (${change.changes.length} changes)`));
            });
        }
        if (preview.executionChanges.length > 0) {
            console.log(chalk_1.default.magenta(`  Execution files (${preview.executionChanges.length}):`));
            preview.executionChanges.forEach(change => {
                console.log(chalk_1.default.magenta(`    ✏️  ${change.filePath} (${change.changes.length} changes)`));
            });
        }
        // Show backup recommendation
        if (!options.createBackup) {
            console.log(chalk_1.default.bold.yellow('\n⚠️  BACKUP RECOMMENDATION'));
            console.log(chalk_1.default.yellow('We strongly recommend creating backups before transformation.'));
            console.log(chalk_1.default.yellow('Use --backup flag to automatically create backups.'));
            console.log(chalk_1.default.yellow('This ensures you can restore your original files if needed.'));
        }
        // Show POC recommendation
        console.log(chalk_1.default.bold.cyan('\n💡 POC RECOMMENDATION'));
        console.log(chalk_1.default.cyan('For Proof of Concept (POC) purposes:'));
        console.log(chalk_1.default.cyan('  1. Test the migration on a copy of your project first'));
        console.log(chalk_1.default.cyan('  2. Verify the results in the copied directory'));
        console.log(chalk_1.default.cyan('  3. Once confident, run it on your real project directory'));
        console.log(chalk_1.default.cyan('  4. Always keep backups of your original files'));
        // Get confirmation with options
        const answer = await inquirer.default.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: [
                    {
                        name: '✅ Proceed with transformation (recommended with --backup)',
                        value: 'proceed'
                    },
                    {
                        name: '📋 Show detailed changes for each file',
                        value: 'detailed'
                    },
                    {
                        name: '❌ Cancel transformation',
                        value: 'cancel'
                    }
                ],
                default: 'proceed'
            }
        ]);
        if (answer['action'] === 'detailed') {
            await this.showDetailedChanges(preview);
            return await this.getUserConfirmation(preview, options);
        }
        if (answer['action'] === 'cancel') {
            return false;
        }
        // Final confirmation
        const finalAnswer = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Are you absolutely sure you want to proceed with the transformation?',
                default: false
            }
        ]);
        if (!finalAnswer['proceed']) {
            return false;
        }
        // File-by-file confirmation if requested
        if (options.confirmEachFile) {
            const allChanges = [...preview.configChanges, ...preview.codeChanges, ...preview.executionChanges];
            for (const change of allChanges) {
                const fileQuestion = {
                    type: 'confirm',
                    name: 'proceed',
                    message: `Transform ${change.filePath}? (${change.changeType}, ${change.changes.length} changes)`,
                    default: true,
                };
                const fileAnswer = await inquirer.default.prompt([fileQuestion]);
                if (!fileAnswer['proceed']) {
                    console.log(chalk_1.default.yellow(`Skipping ${change.filePath}`));
                    continue;
                }
            }
        }
        return true;
    }
    /**
     * Show detailed changes for each file
     */
    async showDetailedChanges(preview) {
        console.log(chalk_1.default.bold.blue('\n📋 DETAILED CHANGES'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        const allChanges = [
            ...preview.configChanges.map(c => ({ ...c, type: 'Configuration' })),
            ...preview.codeChanges.map(c => ({ ...c, type: 'Code' })),
            ...preview.executionChanges.map(c => ({ ...c, type: 'Execution' }))
        ];
        for (const change of allChanges) {
            console.log(chalk_1.default.bold(`\n📄 ${change.filePath} (${change.type})`));
            console.log(chalk_1.default.gray(`Change Type: ${change.changeType}`));
            console.log(chalk_1.default.gray(`Total Changes: ${change.changes.length}`));
            if (change.changes.length > 0) {
                console.log(chalk_1.default.gray('\nChanges:'));
                change.changes.forEach((changeDetail, index) => {
                    const lineNum = changeDetail.lineNumber;
                    const changeTypeIcon = changeDetail.changeType === 'ADD' ? '+' :
                        changeDetail.changeType === 'DELETE' ? '-' : '~';
                    const changeColor = changeDetail.changeType === 'ADD' ? chalk_1.default.green :
                        changeDetail.changeType === 'DELETE' ? chalk_1.default.red : chalk_1.default.yellow;
                    console.log(chalk_1.default.gray(`  ${index + 1}. Line ${lineNum}: ${changeTypeIcon} ${changeDetail.description}`));
                    // Show before/after for modifications
                    if (changeDetail.changeType === 'MODIFY') {
                        if (changeDetail.originalLine) {
                            console.log(chalk_1.default.red(`     - ${changeDetail.originalLine}`));
                        }
                        if (changeDetail.newLine) {
                            console.log(chalk_1.default.green(`     + ${changeDetail.newLine}`));
                        }
                    }
                    else if (changeDetail.changeType === 'ADD' && changeDetail.newLine) {
                        console.log(chalk_1.default.green(`     + ${changeDetail.newLine}`));
                    }
                    else if (changeDetail.changeType === 'DELETE' && changeDetail.originalLine) {
                        console.log(chalk_1.default.red(`     - ${changeDetail.originalLine}`));
                    }
                });
            }
            if (change.warnings.length > 0) {
                console.log(chalk_1.default.yellow('\nWarnings:'));
                change.warnings.forEach(warning => {
                    console.log(chalk_1.default.yellow(`  • ${warning}`));
                });
            }
        }
        console.log(chalk_1.default.gray('\n' + '='.repeat(50)));
    }
    /**
     * Create backups of files that will be modified
     */
    async createBackups(preview, result) {
        console.log(chalk_1.default.blue('\n📦 Creating backups...'));
        const allChanges = [...preview.configChanges, ...preview.codeChanges, ...preview.executionChanges];
        const backupDir = path_1.default.join(this.projectPath, '.smartui-backup');
        try {
            await fs_1.promises.mkdir(backupDir, { recursive: true });
            for (const change of allChanges) {
                if (change.changeType === 'MODIFY' && change.originalContent) {
                    const backupPath = path_1.default.join(backupDir, `${change.filePath}.backup`);
                    const backupDirPath = path_1.default.dirname(backupPath);
                    await fs_1.promises.mkdir(backupDirPath, { recursive: true });
                    await fs_1.promises.writeFile(backupPath, change.originalContent, 'utf-8');
                    result.filesBackedUp.push(change.filePath);
                    console.log(chalk_1.default.green(`  ✅ Backed up: ${change.filePath}`));
                }
            }
            console.log(chalk_1.default.green(`\n✅ Created ${result.filesBackedUp.length} backup files in .smartui-backup/`));
        }
        catch (error) {
            const errorMsg = `Failed to create backups: ${error instanceof Error ? error.message : 'Unknown error'}`;
            result.warnings.push(errorMsg);
            console.log(chalk_1.default.yellow(`⚠️  ${errorMsg}`));
        }
    }
    /**
     * Execute configuration transformations
     */
    async executeConfigTransformation(detectionResult, configChanges, options, result) {
        // Filter changes by selected files
        const changesToProcess = this.selectedFiles.length > 0
            ? configChanges.filter(change => this.selectedFiles.includes(change.filePath) || this.selectedFiles.includes('.smartui.json'))
            : configChanges;
        if (changesToProcess.length === 0)
            return;
        console.log(chalk_1.default.blue('\n📁 Transforming configuration files...'));
        // Create progress bar for individual file processing
        const fileProgress = ProgressManager_1.ProgressManager.createFileProgress(changesToProcess.length, this.verbose);
        for (let i = 0; i < changesToProcess.length; i++) {
            const change = changesToProcess[i];
            if (!change)
                continue;
            fileProgress.update(i, { title: `Processing ${change.filePath}` });
            try {
                if (options.dryRun) {
                    console.log(chalk_1.default.gray(`  [DRY RUN] Would ${change.changeType.toLowerCase()} ${change.filePath}`));
                    continue;
                }
                const filePath = path_1.default.join(this.projectPath, change.filePath);
                const fileDir = path_1.default.dirname(filePath);
                await fs_1.promises.mkdir(fileDir, { recursive: true });
                await fs_1.promises.writeFile(filePath, change.newContent, 'utf-8');
                if (change.changeType === 'CREATE') {
                    result.filesCreated.push(change.filePath);
                }
                else {
                    result.filesModified.push(change.filePath);
                }
                console.log(chalk_1.default.green(`  ✅ ${change.changeType === 'CREATE' ? 'Created' : 'Modified'}: ${change.filePath}`));
            }
            catch (error) {
                const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors.push(errorMsg);
                console.log(chalk_1.default.red(`  ❌ ${errorMsg}`));
            }
        }
        fileProgress.complete({ title: 'Configuration files processed' });
    }
    /**
     * Execute code transformations
     */
    async executeCodeTransformation(detectionResult, codeChanges, options, result) {
        // Filter changes by selected files
        const changesToProcess = this.selectedFiles.length > 0
            ? codeChanges.filter(change => this.selectedFiles.includes(change.filePath))
            : codeChanges;
        if (changesToProcess.length === 0)
            return;
        console.log(chalk_1.default.green('\n💻 Transforming code files...'));
        // Create progress bar for individual file processing
        const fileProgress = ProgressManager_1.ProgressManager.createFileProgress(changesToProcess.length, this.verbose);
        for (let i = 0; i < changesToProcess.length; i++) {
            const change = changesToProcess[i];
            if (!change)
                continue;
            fileProgress.update(i, { title: `Processing ${change.filePath}` });
            try {
                if (options.dryRun) {
                    console.log(chalk_1.default.gray(`  [DRY RUN] Would modify ${change.filePath} (${change.changes.length} changes)`));
                    continue;
                }
                const filePath = path_1.default.join(this.projectPath, change.filePath);
                await fs_1.promises.writeFile(filePath, change.newContent, 'utf-8');
                result.filesModified.push(change.filePath);
                console.log(chalk_1.default.green(`  ✅ Modified: ${change.filePath} (${change.changes.length} changes)`));
            }
            catch (error) {
                const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors.push(errorMsg);
                console.log(chalk_1.default.red(`  ❌ ${errorMsg}`));
            }
        }
        fileProgress.complete({ title: 'Code files processed' });
    }
    /**
     * Execute execution file transformations
     */
    async executeExecutionTransformation(detectionResult, executionChanges, options, result) {
        // Filter changes by selected files
        const changesToProcess = this.selectedFiles.length > 0
            ? executionChanges.filter(change => this.selectedFiles.includes(change.filePath))
            : executionChanges;
        if (changesToProcess.length === 0)
            return;
        console.log(chalk_1.default.magenta('\n⚙️  Transforming execution files...'));
        // Create progress bar for individual file processing
        const fileProgress = ProgressManager_1.ProgressManager.createFileProgress(changesToProcess.length, this.verbose);
        for (let i = 0; i < changesToProcess.length; i++) {
            const change = changesToProcess[i];
            if (!change)
                continue;
            fileProgress.update(i, { title: `Processing ${change.filePath}` });
            try {
                if (options.dryRun) {
                    console.log(chalk_1.default.gray(`  [DRY RUN] Would modify ${change.filePath} (${change.changes.length} changes)`));
                    continue;
                }
                const filePath = path_1.default.join(this.projectPath, change.filePath);
                await fs_1.promises.writeFile(filePath, change.newContent, 'utf-8');
                result.filesModified.push(change.filePath);
                console.log(chalk_1.default.green(`  ✅ Modified: ${change.filePath} (${change.changes.length} changes)`));
            }
            catch (error) {
                const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                result.errors.push(errorMsg);
                console.log(chalk_1.default.red(`  ❌ ${errorMsg}`));
            }
        }
        fileProgress.complete({ title: 'Execution files processed' });
    }
    /**
     * Show transformation summary
     */
    showTransformationSummary(result) {
        console.log(chalk_1.default.bold.blue('\n📊 TRANSFORMATION SUMMARY'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        if (result.success) {
            console.log(chalk_1.default.green('✅ Transformation completed successfully!'));
        }
        else {
            console.log(chalk_1.default.red('❌ Transformation completed with errors'));
        }
        // Detailed file statistics
        console.log(chalk_1.default.bold('\n📁 File Statistics:'));
        console.log(chalk_1.default.white(`  • Files created: ${chalk_1.default.bold(result.filesCreated.length)}`));
        console.log(chalk_1.default.white(`  • Files modified: ${chalk_1.default.bold(result.filesModified.length)}`));
        console.log(chalk_1.default.white(`  • Files backed up: ${chalk_1.default.bold(result.filesBackedUp.length)}`));
        console.log(chalk_1.default.white(`  • Total files processed: ${chalk_1.default.bold(result.filesCreated.length + result.filesModified.length)}`));
        // Show created files
        if (result.filesCreated.length > 0) {
            console.log(chalk_1.default.bold.green('\n📄 Files Created:'));
            result.filesCreated.forEach(file => {
                console.log(chalk_1.default.green(`  ➕ ${file}`));
            });
        }
        // Show modified files
        if (result.filesModified.length > 0) {
            console.log(chalk_1.default.bold.blue('\n✏️  Files Modified:'));
            result.filesModified.forEach(file => {
                console.log(chalk_1.default.blue(`  ✏️  ${file}`));
            });
        }
        // Show backed up files
        if (result.filesBackedUp.length > 0) {
            console.log(chalk_1.default.bold.yellow('\n📦 Files Backed Up:'));
            result.filesBackedUp.forEach(file => {
                console.log(chalk_1.default.yellow(`  📦 ${file}`));
            });
        }
        // Show errors
        if (result.errors.length > 0) {
            console.log(chalk_1.default.bold.red('\n❌ Errors:'));
            result.errors.forEach(error => {
                console.log(chalk_1.default.red(`  • ${error}`));
            });
        }
        // Show warnings
        if (result.warnings.length > 0) {
            console.log(chalk_1.default.bold.yellow('\n⚠️  Warnings:'));
            result.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
        }
        // Current state information
        console.log(chalk_1.default.bold.cyan('\n📋 Current State of Your Code:'));
        console.log(chalk_1.default.cyan('  • All visual testing code has been migrated to SmartUI'));
        console.log(chalk_1.default.cyan('  • Configuration files have been updated'));
        console.log(chalk_1.default.cyan('  • Dependencies have been modified'));
        console.log(chalk_1.default.cyan('  • CI/CD scripts have been updated'));
        // Next steps
        console.log(chalk_1.default.bold.green('\n🚀 Next Steps:'));
        console.log(chalk_1.default.green('  1. Install SmartUI dependencies: npm install @lambdatest/smartui-cli'));
        console.log(chalk_1.default.green('  2. Configure your SmartUI credentials'));
        console.log(chalk_1.default.green('  3. Update your test environment variables'));
        console.log(chalk_1.default.green('  4. Run your migrated tests with SmartUI'));
        console.log(chalk_1.default.green('  5. Check the SmartUI Dashboard for test results'));
        // Backup information
        if (result.filesBackedUp.length > 0) {
            console.log(chalk_1.default.bold.yellow('\n🛡️  Backup Information:'));
            console.log(chalk_1.default.yellow(`  • ${result.filesBackedUp.length} files backed up to .smartui-backup/`));
            console.log(chalk_1.default.yellow('  • Original files are safely preserved'));
            console.log(chalk_1.default.yellow('  • You can restore files if needed'));
            console.log(chalk_1.default.yellow('  • Keep backups until you\'re confident everything works'));
        }
        // POC guidance
        console.log(chalk_1.default.bold.cyan('\n💡 POC Guidance:'));
        console.log(chalk_1.default.cyan('  • Test the migrated code in a development environment first'));
        console.log(chalk_1.default.cyan('  • Verify all tests run successfully with SmartUI'));
        console.log(chalk_1.default.cyan('  • Check that visual comparisons work as expected'));
        console.log(chalk_1.default.cyan('  • Once confident, deploy to your production environment'));
        // Support information
        console.log(chalk_1.default.bold.blue('\n🆘 Support:'));
        console.log(chalk_1.default.blue('  • Documentation: https://github.com/lambdatest/smartui-migration-tool'));
        console.log(chalk_1.default.blue('  • Issues: https://github.com/lambdatest/smartui-migration-tool/issues'));
        console.log(chalk_1.default.blue('  • SmartUI Docs: https://www.lambdatest.com/smart-ui'));
        console.log(chalk_1.default.gray('\n' + '='.repeat(50)));
    }
    /**
     * Show current state of the code after transformation
     */
    async showCurrentCodeState() {
        console.log(chalk_1.default.bold.cyan('\n📋 CURRENT STATE OF YOUR CODE'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        try {
            // Check for SmartUI configuration
            const smartuiConfigPath = path_1.default.join(this.projectPath, '.smartui.json');
            const configExists = await fs_1.promises.access(smartuiConfigPath).then(() => true).catch(() => false);
            if (configExists) {
                console.log(chalk_1.default.green('✅ SmartUI configuration file (.smartui.json) is present'));
                try {
                    const configContent = await fs_1.promises.readFile(smartuiConfigPath, 'utf-8');
                    const config = JSON.parse(configContent);
                    console.log(chalk_1.default.gray(`   • Project: ${config.project || 'Not specified'}`));
                    console.log(chalk_1.default.gray(`   • Build Name: ${config.buildName || 'Not specified'}`));
                    console.log(chalk_1.default.gray(`   • Branch: ${config.branch || 'Not specified'}`));
                }
                catch (error) {
                    console.log(chalk_1.default.yellow('⚠️  SmartUI configuration file exists but could not be parsed'));
                }
            }
            else {
                console.log(chalk_1.default.yellow('⚠️  SmartUI configuration file (.smartui.json) not found'));
            }
            // Check package.json for SmartUI dependencies
            const packageJsonPath = path_1.default.join(this.projectPath, 'package.json');
            const packageExists = await fs_1.promises.access(packageJsonPath).then(() => true).catch(() => false);
            if (packageExists) {
                try {
                    const packageContent = await fs_1.promises.readFile(packageJsonPath, 'utf-8');
                    const packageJson = JSON.parse(packageContent);
                    const hasSmartUIDep = packageJson.dependencies &&
                        (packageJson.dependencies['@lambdatest/smartui-cli'] ||
                            packageJson.dependencies['@lambdatest/smartui']);
                    if (hasSmartUIDep) {
                        console.log(chalk_1.default.green('✅ SmartUI dependencies are present in package.json'));
                    }
                    else {
                        console.log(chalk_1.default.yellow('⚠️  SmartUI dependencies not found in package.json'));
                        console.log(chalk_1.default.cyan('   Run: npm install @lambdatest/smartui-cli'));
                    }
                }
                catch (error) {
                    console.log(chalk_1.default.yellow('⚠️  Could not read package.json'));
                }
            }
            // Check for test files that might have been migrated
            const testFiles = await this.findTestFiles();
            if (testFiles.length > 0) {
                console.log(chalk_1.default.green(`✅ Found ${testFiles.length} test files that may have been migrated`));
                testFiles.slice(0, 5).forEach(file => {
                    console.log(chalk_1.default.gray(`   • ${file}`));
                });
                if (testFiles.length > 5) {
                    console.log(chalk_1.default.gray(`   • ... and ${testFiles.length - 5} more files`));
                }
            }
            // Check for backup directory
            const backupDir = path_1.default.join(this.projectPath, '.smartui-backup');
            const backupExists = await fs_1.promises.access(backupDir).then(() => true).catch(() => false);
            if (backupExists) {
                console.log(chalk_1.default.green('✅ Backup directory (.smartui-backup) exists'));
                try {
                    const backupFiles = await fs_1.promises.readdir(backupDir);
                    console.log(chalk_1.default.gray(`   • ${backupFiles.length} backup files available`));
                }
                catch (error) {
                    console.log(chalk_1.default.yellow('⚠️  Could not read backup directory'));
                }
            }
        }
        catch (error) {
            console.log(chalk_1.default.red('❌ Error checking current state:'), error);
        }
        console.log(chalk_1.default.gray('\n' + '='.repeat(50)));
    }
    /**
     * Find test files in the project
     */
    async findTestFiles() {
        const testFiles = [];
        const testPatterns = [
            '**/*.test.js',
            '**/*.test.ts',
            '**/*.spec.js',
            '**/*.spec.ts',
            '**/cypress/**/*.js',
            '**/cypress/**/*.ts',
            '**/tests/**/*.js',
            '**/tests/**/*.ts',
            '**/test/**/*.js',
            '**/test/**/*.ts'
        ];
        try {
            const { glob } = await Promise.resolve().then(() => __importStar(require('fast-glob')));
            for (const pattern of testPatterns) {
                const files = await glob(pattern, { cwd: this.projectPath });
                testFiles.push(...files);
            }
        }
        catch (error) {
            // Fallback to basic file system search
            try {
                const files = await fs_1.promises.readdir(this.projectPath, { recursive: true });
                testFiles.push(...files.filter(file => typeof file === 'string' &&
                    (file.includes('.test.') || file.includes('.spec.') || file.includes('cypress'))));
            }
            catch (error) {
                // Ignore errors in fallback
            }
        }
        return [...new Set(testFiles)]; // Remove duplicates
    }
}
exports.TransformationManager = TransformationManager;
//# sourceMappingURL=TransformationManager.js.map