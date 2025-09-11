"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangePreviewer = void 0;
const chalk_1 = __importDefault(require("chalk"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const Logger_1 = require("../utils/Logger");
const ProgressManager_1 = require("../utils/ProgressManager");
const ConfigTransformer_1 = require("./ConfigTransformer");
const CodeTransformer_1 = require("./CodeTransformer");
const JavaCodeTransformer_1 = require("./JavaCodeTransformer");
const PythonCodeTransformer_1 = require("./PythonCodeTransformer");
const ExecutionTransformer_1 = require("./ExecutionTransformer");
const StorybookTransformer_1 = require("./StorybookTransformer");
class ChangePreviewer {
    constructor(projectPath, verbose = false, selectedFiles = []) {
        this.projectPath = projectPath;
        this.verbose = verbose;
        this.selectedFiles = selectedFiles;
    }
    /**
     * Generate a comprehensive preview of all changes that will be made
     */
    async generatePreview(detectionResult) {
        Logger_1.logger.verbose('Generating transformation preview...');
        const configChanges = [];
        const codeChanges = [];
        const executionChanges = [];
        const allWarnings = [];
        let totalSnapshots = 0;
        // Create progress bar for preview generation
        const totalSteps = 3;
        const progress = ProgressManager_1.ProgressManager.createPreviewProgress(totalSteps, this.verbose);
        // Preview configuration changes
        progress.update(1, { title: 'Analyzing configuration changes' });
        if (detectionResult.files.config.length > 0) {
            const configPreview = await this.previewConfigChanges(detectionResult);
            configChanges.push(...configPreview.changes);
            allWarnings.push(...configPreview.warnings);
        }
        // Preview code changes
        progress.update(2, { title: 'Analyzing code changes' });
        if (detectionResult.files.source.length > 0) {
            const codePreview = await this.previewCodeChanges(detectionResult);
            codeChanges.push(...codePreview.changes);
            totalSnapshots += codePreview.totalSnapshots;
            allWarnings.push(...codePreview.warnings);
        }
        // Preview execution changes
        progress.update(3, { title: 'Analyzing execution changes' });
        const executionPreview = await this.previewExecutionChanges(detectionResult);
        executionChanges.push(...executionPreview.changes);
        allWarnings.push(...executionPreview.warnings);
        const totalFiles = configChanges.length + codeChanges.length + executionChanges.length;
        progress.complete({ title: 'Preview generation completed' });
        Logger_1.logger.verbose(`Preview generated: ${totalFiles} files, ${totalSnapshots} snapshots`);
        return {
            configChanges,
            codeChanges,
            executionChanges,
            totalFiles,
            totalSnapshots,
            warnings: allWarnings
        };
    }
    /**
     * Preview configuration file changes
     */
    async previewConfigChanges(detectionResult) {
        const changes = [];
        const warnings = [];
        try {
            const configTransformer = new ConfigTransformer_1.ConfigTransformer(this.projectPath);
            // Preview .smartui.json creation
            const smartUIConfig = this.generateSmartUIConfig(detectionResult);
            changes.push({
                filePath: '.smartui.json',
                changeType: 'CREATE',
                newContent: smartUIConfig,
                changes: [{
                        lineNumber: 1,
                        originalLine: '',
                        newLine: smartUIConfig,
                        changeType: 'ADD',
                        description: 'Create SmartUI configuration file'
                    }],
                warnings: []
            });
            // Preview existing config file modifications (filter by selected files)
            const configFilesToProcess = this.selectedFiles.length > 0
                ? detectionResult.files.config.filter(file => this.selectedFiles.includes(file) || this.selectedFiles.includes('.smartui.json'))
                : detectionResult.files.config;
            for (const configFile of configFilesToProcess) {
                try {
                    const configFilePath = path_1.default.join(this.projectPath, configFile);
                    // Check if file exists
                    try {
                        await fs_1.promises.access(configFilePath);
                    }
                    catch (error) {
                        const errorMsg = `Config file not found: ${configFile}`;
                        warnings.push(errorMsg);
                        Logger_1.logger.verbose(errorMsg);
                        continue;
                    }
                    const originalContent = await fs_1.promises.readFile(configFilePath, 'utf-8');
                    let transformedContent;
                    let configWarnings = [];
                    if (detectionResult.platform === 'Percy') {
                        const result = configTransformer.transformPercyConfig(originalContent);
                        transformedContent = result.content;
                        configWarnings = result.warnings.map(w => w.message);
                    }
                    else if (detectionResult.platform === 'Applitools') {
                        const result = configTransformer.transformApplitoolsConfig(originalContent);
                        transformedContent = result.content;
                        configWarnings = result.warnings.map(w => w.message);
                    }
                    else if (detectionResult.platform === 'Sauce Labs Visual') {
                        const result = configTransformer.transformSauceLabsConfig(originalContent, configFilePath);
                        transformedContent = result.content;
                        configWarnings = result.warnings.map(w => w.message);
                    }
                    else {
                        continue;
                    }
                    const changeDetails = this.generateDiff(originalContent, transformedContent, 'Configuration transformation');
                    changes.push({
                        filePath: configFile,
                        changeType: 'MODIFY',
                        originalContent,
                        newContent: transformedContent,
                        changes: changeDetails,
                        warnings: configWarnings
                    });
                    warnings.push(...configWarnings);
                }
                catch (error) {
                    const errorMsg = `Failed to preview config file ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    warnings.push(errorMsg);
                    Logger_1.logger.verbose(errorMsg);
                }
            }
        }
        catch (error) {
            const errorMsg = `Failed to preview configuration changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
            warnings.push(errorMsg);
            Logger_1.logger.verbose(errorMsg);
        }
        return { changes, warnings };
    }
    /**
     * Preview code file changes
     */
    async previewCodeChanges(detectionResult) {
        const changes = [];
        const warnings = [];
        let totalSnapshots = 0;
        try {
            const codeTransformer = new CodeTransformer_1.CodeTransformer(this.projectPath);
            const javaCodeTransformer = new JavaCodeTransformer_1.JavaCodeTransformer(this.projectPath);
            const pythonCodeTransformer = new PythonCodeTransformer_1.PythonCodeTransformer(this.projectPath);
            // Filter source files by selected files
            const sourceFilesToProcess = this.selectedFiles.length > 0
                ? detectionResult.files.source.filter(file => this.selectedFiles.includes(file))
                : detectionResult.files.source;
            for (const sourceFile of sourceFilesToProcess) {
                try {
                    const sourceFilePath = path_1.default.join(this.projectPath, sourceFile);
                    // Check if file exists
                    try {
                        await fs_1.promises.access(sourceFilePath);
                    }
                    catch (error) {
                        const errorMsg = `Source file not found: ${sourceFile}`;
                        warnings.push(errorMsg);
                        Logger_1.logger.verbose(errorMsg);
                        continue;
                    }
                    const originalContent = await fs_1.promises.readFile(sourceFilePath, 'utf-8');
                    let transformedContent;
                    let codeWarnings = [];
                    let snapshotCount = 0;
                    if (detectionResult.language === 'Python') {
                        const result = pythonCodeTransformer.transform(originalContent, sourceFile, detectionResult.platform);
                        transformedContent = result.content;
                        codeWarnings = result.warnings.map(w => w.message);
                        snapshotCount = result.snapshotCount;
                    }
                    else if (detectionResult.language === 'Java') {
                        const result = javaCodeTransformer.transform(originalContent, detectionResult.platform);
                        transformedContent = result.content;
                        codeWarnings = result.warnings.map(w => w.message);
                        snapshotCount = result.snapshotCount;
                    }
                    else if (detectionResult.language === 'JavaScript/TypeScript') {
                        if (detectionResult.platform === 'Percy') {
                            const result = codeTransformer.transformPercy(originalContent);
                            transformedContent = result.content;
                            codeWarnings = result.warnings.map(w => w.message);
                            snapshotCount = result.snapshotCount;
                        }
                        else if (detectionResult.platform === 'Applitools') {
                            const framework = detectionResult.framework === 'Cypress' ? 'Cypress' : 'Playwright';
                            const result = codeTransformer.transformApplitools(originalContent, framework);
                            transformedContent = result.content;
                            codeWarnings = result.warnings.map(w => w.message);
                            snapshotCount = result.snapshotCount;
                        }
                        else if (detectionResult.platform === 'Sauce Labs Visual') {
                            const result = codeTransformer.transformSauceLabs(originalContent);
                            transformedContent = result.content;
                            codeWarnings = result.warnings.map(w => w.message);
                            snapshotCount = result.snapshotCount;
                        }
                        else {
                            continue;
                        }
                    }
                    else {
                        continue;
                    }
                    totalSnapshots += snapshotCount;
                    const changeDetails = this.generateDiff(originalContent, transformedContent, `Code transformation (${snapshotCount} snapshots)`);
                    changes.push({
                        filePath: sourceFile,
                        changeType: 'MODIFY',
                        originalContent,
                        newContent: transformedContent,
                        changes: changeDetails,
                        warnings: codeWarnings
                    });
                    warnings.push(...codeWarnings);
                }
                catch (error) {
                    const errorMsg = `Failed to preview code file ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    warnings.push(errorMsg);
                    Logger_1.logger.verbose(errorMsg);
                }
            }
        }
        catch (error) {
            const errorMsg = `Failed to preview code changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
            warnings.push(errorMsg);
            Logger_1.logger.verbose(errorMsg);
        }
        return { changes, totalSnapshots, warnings };
    }
    /**
     * Preview execution file changes
     */
    async previewExecutionChanges(detectionResult) {
        const changes = [];
        const warnings = [];
        try {
            const executionTransformer = new ExecutionTransformer_1.ExecutionTransformer(this.projectPath);
            const storybookTransformer = new StorybookTransformer_1.StorybookTransformer(this.projectPath);
            // Filter package files by selected files
            const packageFilesToProcess = this.selectedFiles.length > 0
                ? detectionResult.files.packageManager.filter(file => this.selectedFiles.includes(file))
                : detectionResult.files.packageManager;
            // Preview package.json changes
            for (const packageFile of packageFilesToProcess) {
                try {
                    const packageFilePath = path_1.default.join(this.projectPath, packageFile);
                    const originalContent = await fs_1.promises.readFile(packageFilePath, 'utf-8');
                    let transformedContent;
                    let executionWarnings = [];
                    if (detectionResult.testType === 'storybook') {
                        const result = storybookTransformer.transformPackageJsonScripts(originalContent, detectionResult.platform);
                        transformedContent = result.content;
                        executionWarnings = result.warnings.map(w => w.message);
                    }
                    else {
                        const result = executionTransformer.transformPackageJson(originalContent, detectionResult.platform);
                        transformedContent = result.content;
                        executionWarnings = result.warnings.map(w => w.message);
                    }
                    const changeDetails = this.generateDiff(originalContent, transformedContent, 'Package.json script transformation');
                    changes.push({
                        filePath: packageFile,
                        changeType: 'MODIFY',
                        originalContent,
                        newContent: transformedContent,
                        changes: changeDetails,
                        warnings: executionWarnings
                    });
                    warnings.push(...executionWarnings);
                }
                catch (error) {
                    const errorMsg = `Failed to preview package file ${packageFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    warnings.push(errorMsg);
                    Logger_1.logger.verbose(errorMsg);
                }
            }
            // Filter CI files by selected files
            const ciFilesToProcess = this.selectedFiles.length > 0
                ? detectionResult.files.ci.filter(file => this.selectedFiles.includes(file))
                : detectionResult.files.ci;
            // Preview CI/CD changes
            for (const ciFile of ciFilesToProcess) {
                try {
                    const ciFilePath = path_1.default.join(this.projectPath, ciFile);
                    const originalContent = await fs_1.promises.readFile(ciFilePath, 'utf-8');
                    const result = executionTransformer.transformCiYaml(originalContent, detectionResult.platform);
                    const transformedContent = result.content;
                    const executionWarnings = result.warnings.map(w => w.message);
                    const changeDetails = this.generateDiff(originalContent, transformedContent, 'CI/CD configuration transformation');
                    changes.push({
                        filePath: ciFile,
                        changeType: 'MODIFY',
                        originalContent,
                        newContent: transformedContent,
                        changes: changeDetails,
                        warnings: executionWarnings
                    });
                    warnings.push(...executionWarnings);
                }
                catch (error) {
                    const errorMsg = `Failed to preview CI file ${ciFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
                    warnings.push(errorMsg);
                    Logger_1.logger.verbose(errorMsg);
                }
            }
        }
        catch (error) {
            const errorMsg = `Failed to preview execution changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
            warnings.push(errorMsg);
            Logger_1.logger.verbose(errorMsg);
        }
        return { changes, warnings };
    }
    /**
     * Generate a diff between original and transformed content
     */
    generateDiff(originalContent, transformedContent, description) {
        const changes = [];
        try {
            // Handle empty or null content
            const original = originalContent || '';
            const transformed = transformedContent || '';
            // If content is identical, return empty changes
            if (original === transformed) {
                return changes;
            }
            const originalLines = original.split('\n');
            const transformedLines = transformed.split('\n');
            const maxLines = Math.max(originalLines.length, transformedLines.length);
            for (let i = 0; i < maxLines; i++) {
                const originalLine = originalLines[i] || '';
                const transformedLine = transformedLines[i] || '';
                if (originalLine !== transformedLine) {
                    if (originalLine === '') {
                        changes.push({
                            lineNumber: i + 1,
                            originalLine: '',
                            newLine: transformedLine,
                            changeType: 'ADD',
                            description: `Add line: ${transformedLine.substring(0, 50)}${transformedLine.length > 50 ? '...' : ''}`
                        });
                    }
                    else if (transformedLine === '') {
                        changes.push({
                            lineNumber: i + 1,
                            originalLine,
                            newLine: '',
                            changeType: 'DELETE',
                            description: `Remove line: ${originalLine.substring(0, 50)}${originalLine.length > 50 ? '...' : ''}`
                        });
                    }
                    else {
                        changes.push({
                            lineNumber: i + 1,
                            originalLine,
                            newLine: transformedLine,
                            changeType: 'MODIFY',
                            description: `Modify line: ${originalLine.substring(0, 30)}... → ${transformedLine.substring(0, 30)}...`
                        });
                    }
                }
            }
            // If no line-by-line changes found but content is different, add a summary change
            if (changes.length === 0 && original !== transformed) {
                changes.push({
                    lineNumber: 1,
                    originalLine: original.substring(0, 100) + (original.length > 100 ? '...' : ''),
                    newLine: transformed.substring(0, 100) + (transformed.length > 100 ? '...' : ''),
                    changeType: 'MODIFY',
                    description: description
                });
            }
        }
        catch (error) {
            // Fallback for any diff generation errors
            Logger_1.logger.verbose(`Error generating diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
            changes.push({
                lineNumber: 1,
                originalLine: 'Error generating diff',
                newLine: 'Error generating diff',
                changeType: 'MODIFY',
                description: description
            });
        }
        return changes;
    }
    /**
     * Generate SmartUI configuration content
     */
    generateSmartUIConfig(detectionResult) {
        const config = {
            smartui: {
                project: {
                    name: detectionResult.platform === 'Percy' ? 'Percy Migration' :
                        detectionResult.platform === 'Applitools' ? 'Applitools Migration' : 'Sauce Labs Migration',
                    framework: detectionResult.framework.toLowerCase(),
                    language: detectionResult.language.toLowerCase()
                },
                settings: {
                    browsers: ['chrome', 'firefox', 'safari'],
                    viewports: [
                        { width: 1920, height: 1080 },
                        { width: 1366, height: 768 },
                        { width: 375, height: 667 }
                    ]
                }
            }
        };
        return JSON.stringify(config, null, 2);
    }
    /**
     * Display the preview in a user-friendly format
     */
    displayPreview(preview) {
        console.log(chalk_1.default.bold.blue('\n📋 TRANSFORMATION PREVIEW'));
        console.log(chalk_1.default.gray('='.repeat(60)));
        // Summary
        console.log(chalk_1.default.white.bold('\n📊 Summary:'));
        console.log(chalk_1.default.white(`  • Total files to be modified: ${chalk_1.default.bold(preview.totalFiles)}`));
        console.log(chalk_1.default.white(`  • Total snapshots to migrate: ${chalk_1.default.bold(preview.totalSnapshots)}`));
        console.log(chalk_1.default.white(`  • Configuration files: ${chalk_1.default.bold(preview.configChanges.length)}`));
        console.log(chalk_1.default.white(`  • Code files: ${chalk_1.default.bold(preview.codeChanges.length)}`));
        console.log(chalk_1.default.white(`  • Execution files: ${chalk_1.default.bold(preview.executionChanges.length)}`));
        if (preview.warnings.length > 0) {
            console.log(chalk_1.default.yellow(`  • Warnings: ${chalk_1.default.bold(preview.warnings.length)}`));
        }
        // Configuration changes
        if (preview.configChanges.length > 0) {
            console.log(chalk_1.default.blue('\n📁 Configuration Changes:'));
            preview.configChanges.forEach(change => {
                this.displayFileChange(change);
            });
        }
        // Code changes
        if (preview.codeChanges.length > 0) {
            console.log(chalk_1.default.green('\n💻 Code Changes:'));
            preview.codeChanges.forEach(change => {
                this.displayFileChange(change);
            });
        }
        // Execution changes
        if (preview.executionChanges.length > 0) {
            console.log(chalk_1.default.magenta('\n⚙️  Execution Changes:'));
            preview.executionChanges.forEach(change => {
                this.displayFileChange(change);
            });
        }
        // Warnings
        if (preview.warnings.length > 0) {
            console.log(chalk_1.default.yellow('\n⚠️  Warnings:'));
            preview.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`  • ${warning}`));
            });
        }
        console.log(chalk_1.default.gray('\n' + '='.repeat(60)));
    }
    /**
     * Display individual file change with detailed information
     */
    displayFileChange(change) {
        const changeIcon = change.changeType === 'CREATE' ? '➕' :
            change.changeType === 'MODIFY' ? '✏️ ' : '🗑️ ';
        console.log(chalk_1.default.white(`\n${changeIcon} ${chalk_1.default.bold(change.filePath)}`));
        if (change.changeType === 'CREATE') {
            console.log(chalk_1.default.green(`    ${chalk_1.default.bold('CREATE')} - New file will be created`));
            // Show preview of new file content
            if (change.newContent) {
                const preview = change.newContent.length > 200 ?
                    change.newContent.substring(0, 200) + '...' :
                    change.newContent;
                console.log(chalk_1.default.gray(`    Preview: ${preview}`));
            }
        }
        else {
            console.log(chalk_1.default.blue(`    ${chalk_1.default.bold('MODIFY')} - ${change.changes.length} changes will be made`));
            // Show detailed changes with line-by-line diffs
            console.log(chalk_1.default.gray('    Detailed Changes:'));
            change.changes.forEach((changeDetail, index) => {
                const lineNum = changeDetail.lineNumber;
                const changeTypeIcon = changeDetail.changeType === 'ADD' ? '+' :
                    changeDetail.changeType === 'DELETE' ? '-' : '~';
                const changeColor = changeDetail.changeType === 'ADD' ? chalk_1.default.green :
                    changeDetail.changeType === 'DELETE' ? chalk_1.default.red : chalk_1.default.yellow;
                console.log(chalk_1.default.gray(`      ${index + 1}. Line ${lineNum}: ${changeTypeIcon} ${changeDetail.description}`));
                // Show before/after for modifications
                if (changeDetail.changeType === 'MODIFY') {
                    if (changeDetail.originalLine) {
                        console.log(chalk_1.default.red(`         - ${changeDetail.originalLine.substring(0, 60)}${changeDetail.originalLine.length > 60 ? '...' : ''}`));
                    }
                    if (changeDetail.newLine) {
                        console.log(chalk_1.default.green(`         + ${changeDetail.newLine.substring(0, 60)}${changeDetail.newLine.length > 60 ? '...' : ''}`));
                    }
                }
                else if (changeDetail.changeType === 'ADD' && changeDetail.newLine) {
                    console.log(chalk_1.default.green(`         + ${changeDetail.newLine.substring(0, 60)}${changeDetail.newLine.length > 60 ? '...' : ''}`));
                }
                else if (changeDetail.changeType === 'DELETE' && changeDetail.originalLine) {
                    console.log(chalk_1.default.red(`         - ${changeDetail.originalLine.substring(0, 60)}${changeDetail.originalLine.length > 60 ? '...' : ''}`));
                }
            });
        }
        // Show warnings for this file
        if (change.warnings.length > 0) {
            console.log(chalk_1.default.yellow(`    ⚠️  ${change.warnings.length} warning(s):`));
            change.warnings.forEach(warning => {
                console.log(chalk_1.default.yellow(`      • ${warning}`));
            });
        }
    }
}
exports.ChangePreviewer = ChangePreviewer;
//# sourceMappingURL=ChangePreviewer.js.map