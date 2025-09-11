"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalysisReporter = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const ConfigTransformer_1 = require("./ConfigTransformer");
const CodeTransformer_1 = require("./CodeTransformer");
const JavaCodeTransformer_1 = require("./JavaCodeTransformer");
const PythonCodeTransformer_1 = require("./PythonCodeTransformer");
const ExecutionTransformer_1 = require("./ExecutionTransformer");
const StorybookTransformer_1 = require("./StorybookTransformer");
/**
 * AnalysisReporter module for performing virtual migrations and generating pre-migration analysis reports
 * This module orchestrates all transformers in read-only mode to preview proposed changes
 */
class AnalysisReporter {
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    /**
     * Performs a virtual migration analysis to preview all proposed changes
     * @param detectionResult - The result from the Scanner module
     * @returns AnalysisResult containing all proposed changes and statistics
     */
    async analyze(detectionResult) {
        const changes = [];
        const allWarnings = [];
        let totalSnapshots = 0;
        let filesToCreate = 0;
        let filesToModify = 0;
        try {
            // Initialize transformers
            const configTransformer = new ConfigTransformer_1.ConfigTransformer(this.projectPath);
            const codeTransformer = new CodeTransformer_1.CodeTransformer(this.projectPath);
            const javaCodeTransformer = new JavaCodeTransformer_1.JavaCodeTransformer(this.projectPath);
            const pythonCodeTransformer = new PythonCodeTransformer_1.PythonCodeTransformer(this.projectPath);
            const executionTransformer = new ExecutionTransformer_1.ExecutionTransformer(this.projectPath);
            const storybookTransformer = new StorybookTransformer_1.StorybookTransformer(this.projectPath);
            // Step 1: Analyze configuration transformation
            const configAnalysis = await this.analyzeConfigurationTransformation(detectionResult, configTransformer, changes, allWarnings);
            filesToCreate += configAnalysis.filesToCreate;
            filesToModify += configAnalysis.filesToModify;
            // Step 2: Analyze code transformation
            const codeAnalysis = await this.analyzeCodeTransformation(detectionResult, codeTransformer, javaCodeTransformer, pythonCodeTransformer, changes, allWarnings);
            filesToModify += codeAnalysis.filesToModify;
            totalSnapshots += codeAnalysis.snapshotCount;
            // Step 3: Analyze execution transformation
            const executionAnalysis = await this.analyzeExecutionTransformation(detectionResult, executionTransformer, storybookTransformer, changes, allWarnings);
            filesToModify += executionAnalysis.filesToModify;
            // Add warnings as INFO changes
            allWarnings.forEach(warning => {
                changes.push({
                    filePath: 'Migration Analysis',
                    type: 'INFO',
                    description: warning.message
                });
            });
            return {
                filesToCreate,
                filesToModify,
                snapshotCount: totalSnapshots,
                warnings: allWarnings,
                changes
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis';
            allWarnings.push({
                message: `Analysis failed: ${errorMessage}`,
                details: 'The migration analysis encountered an error and may be incomplete.'
            });
            return {
                filesToCreate,
                filesToModify,
                snapshotCount: totalSnapshots,
                warnings: allWarnings,
                changes
            };
        }
    }
    /**
     * Analyzes configuration transformation
     * @param detectionResult - The detection result
     * @param configTransformer - The config transformer instance
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    async analyzeConfigurationTransformation(detectionResult, configTransformer, changes, warnings) {
        let filesToCreate = 0;
        let filesToModify = 0;
        // Analyze config files
        for (const configFile of detectionResult.files.config) {
            try {
                const configFilePath = path_1.default.join(this.projectPath, configFile);
                const configContent = await fs_1.promises.readFile(configFilePath, 'utf-8');
                let configResult;
                if (detectionResult.platform === 'Percy') {
                    configResult = configTransformer.transformPercyConfig(configContent);
                }
                else if (detectionResult.platform === 'Applitools') {
                    configResult = configTransformer.transformApplitoolsConfig(configContent);
                }
                else if (detectionResult.platform === 'Sauce Labs Visual') {
                    configResult = configTransformer.transformSauceLabsConfig(configContent, configFile);
                }
                else {
                    throw new Error(`Unsupported platform: ${detectionResult.platform}`);
                }
                // Add warnings
                warnings.push(...configResult.warnings);
                // Record the creation of .smartui.json
                changes.push({
                    filePath: '.smartui.json',
                    type: 'CREATE',
                    description: `Generated SmartUI configuration from ${configFile}`
                });
                filesToCreate++;
                // Record modification of original config file (if it would be modified)
                if (configResult.warnings.length > 0) {
                    changes.push({
                        filePath: configFile,
                        type: 'MODIFY',
                        description: 'Configuration file will be updated with migration notes'
                    });
                    filesToModify++;
                }
            }
            catch (error) {
                warnings.push({
                    message: `Failed to analyze config file ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    details: 'The configuration file may be inaccessible or malformed.'
                });
            }
        }
        return { filesToCreate, filesToModify };
    }
    /**
     * Analyzes code transformation
     * @param detectionResult - The detection result
     * @param codeTransformer - The JS/TS code transformer
     * @param javaCodeTransformer - The Java code transformer
     * @param pythonCodeTransformer - The Python code transformer
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    async analyzeCodeTransformation(detectionResult, codeTransformer, javaCodeTransformer, pythonCodeTransformer, changes, warnings) {
        let filesToModify = 0;
        let totalSnapshots = 0;
        // Analyze source files based on language
        for (const sourceFile of detectionResult.files.source) {
            try {
                const sourceFilePath = path_1.default.join(this.projectPath, sourceFile);
                const sourceContent = await fs_1.promises.readFile(sourceFilePath, 'utf-8');
                let codeResult;
                let transformerName;
                // Choose appropriate transformer based on language
                if (detectionResult.language === 'Java') {
                    codeResult = javaCodeTransformer.transform(sourceContent, detectionResult.platform);
                    transformerName = 'Java Code Transformer';
                }
                else if (detectionResult.language === 'Python') {
                    codeResult = pythonCodeTransformer.transform(sourceContent, sourceFile, detectionResult.platform);
                    transformerName = 'Python Code Transformer';
                }
                else {
                    // JavaScript/TypeScript
                    if (detectionResult.platform === 'Percy') {
                        codeResult = codeTransformer.transformPercy(sourceContent);
                    }
                    else if (detectionResult.platform === 'Applitools') {
                        const framework = detectionResult.framework === 'Cypress' ? 'Cypress' : 'Playwright';
                        codeResult = codeTransformer.transformApplitools(sourceContent, framework);
                    }
                    else if (detectionResult.platform === 'Sauce Labs Visual') {
                        codeResult = codeTransformer.transformSauceLabs(sourceContent);
                    }
                    else {
                        continue; // Skip unsupported platform
                    }
                    transformerName = 'JavaScript/TypeScript Code Transformer';
                }
                // Add warnings
                warnings.push(...codeResult.warnings);
                // Record file modification
                if (codeResult.snapshotCount > 0 || codeResult.warnings.length > 0) {
                    changes.push({
                        filePath: sourceFile,
                        type: 'MODIFY',
                        description: `Transform ${codeResult.snapshotCount} snapshot(s) using ${transformerName}`
                    });
                    filesToModify++;
                }
                totalSnapshots += codeResult.snapshotCount;
            }
            catch (error) {
                warnings.push({
                    message: `Failed to analyze source file ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    details: 'The source file may be inaccessible or contain unsupported syntax.'
                });
            }
        }
        return { filesToModify, snapshotCount: totalSnapshots };
    }
    /**
     * Analyzes execution transformation
     * @param detectionResult - The detection result
     * @param executionTransformer - The execution transformer instance
     * @param storybookTransformer - The storybook transformer instance
     * @param changes - Array to collect proposed changes
     * @param warnings - Array to collect warnings
     * @returns Analysis statistics
     */
    async analyzeExecutionTransformation(detectionResult, executionTransformer, storybookTransformer, changes, warnings) {
        let filesToModify = 0;
        // Analyze package.json files
        for (const packageFile of detectionResult.files.packageManager) {
            try {
                const packageFilePath = path_1.default.join(this.projectPath, packageFile);
                const packageContent = await fs_1.promises.readFile(packageFilePath, 'utf-8');
                let executionResult;
                let description = 'Update test execution commands for SmartUI integration';
                // Use StorybookTransformer for Storybook projects
                if (detectionResult.testType === 'storybook') {
                    executionResult = storybookTransformer.transformPackageJsonScripts(packageContent, detectionResult.platform);
                    // Generate specific description for Storybook
                    const scriptCount = storybookTransformer.countStorybookScripts(packageContent, detectionResult.platform);
                    if (scriptCount > 0) {
                        const platformCommand = detectionResult.platform === 'Percy' ? 'percy storybook' :
                            detectionResult.platform === 'Applitools' ? 'eyes-storybook' : 'screener-storybook';
                        description = `Replace '${platformCommand}' command with 'smartui-storybook'`;
                    }
                }
                else {
                    executionResult = executionTransformer.transformPackageJson(packageContent, detectionResult.platform);
                }
                // Add warnings
                warnings.push(...executionResult.warnings);
                // Record file modification
                if (executionResult.warnings.length === 0) { // Only if transformation was successful
                    changes.push({
                        filePath: packageFile,
                        type: 'MODIFY',
                        description: description
                    });
                    filesToModify++;
                }
            }
            catch (error) {
                warnings.push({
                    message: `Failed to analyze package file ${packageFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    details: 'The package file may be inaccessible or malformed.'
                });
            }
        }
        // Analyze CI/CD files
        for (const ciFile of detectionResult.files.ci) {
            try {
                const ciFilePath = path_1.default.join(this.projectPath, ciFile);
                const ciContent = await fs_1.promises.readFile(ciFilePath, 'utf-8');
                const executionResult = executionTransformer.transformCiYaml(ciContent, detectionResult.platform);
                // Add warnings
                warnings.push(...executionResult.warnings);
                // Record file modification
                if (executionResult.warnings.length === 0) { // Only if transformation was successful
                    changes.push({
                        filePath: ciFile,
                        type: 'MODIFY',
                        description: 'Update CI/CD commands and environment variables for SmartUI'
                    });
                    filesToModify++;
                }
            }
            catch (error) {
                warnings.push({
                    message: `Failed to analyze CI file ${ciFile}: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    details: 'The CI/CD file may be inaccessible or malformed.'
                });
            }
        }
        return { filesToModify };
    }
}
exports.AnalysisReporter = AnalysisReporter;
//# sourceMappingURL=AnalysisReporter.js.map