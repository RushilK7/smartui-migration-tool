"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorybookTransformer = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
/**
 * StorybookTransformer module for transforming Storybook-specific configurations and scripts
 * Handles package.json script transformation and Storybook-specific configuration adjustments
 */
class StorybookTransformer {
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    /**
     * Transforms package.json scripts for Storybook visual testing
     * @param sourceContent - The package.json content as a string
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns Object containing transformed content and warnings
     */
    transformPackageJsonScripts(sourceContent, platform) {
        const warnings = [];
        try {
            // Parse the package.json content
            const packageJson = JSON.parse(sourceContent);
            if (!packageJson.scripts) {
                warnings.push({
                    message: 'No scripts section found in package.json',
                    details: 'The package.json file does not contain a scripts section to transform.'
                });
                return { content: sourceContent, warnings };
            }
            // Transform scripts based on platform
            const transformedScripts = this.transformStorybookScripts(packageJson.scripts, platform, warnings);
            // Create the transformed package.json
            const transformedPackageJson = {
                ...packageJson,
                scripts: transformedScripts
            };
            // Stringify with proper formatting
            const transformedContent = JSON.stringify(transformedPackageJson, null, 2);
            return { content: transformedContent, warnings };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            warnings.push({
                message: `Failed to parse package.json: ${errorMessage}`,
                details: 'The package.json file may be malformed or contain invalid JSON.'
            });
            return { content: sourceContent, warnings };
        }
    }
    /**
     * Transforms Storybook scripts in package.json
     * @param scripts - The scripts object from package.json
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed scripts object
     */
    transformStorybookScripts(scripts, platform, warnings) {
        const transformedScripts = {};
        for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
            const transformedCommand = this.transformStorybookCommand(scriptCommand, platform, warnings);
            transformedScripts[scriptName] = transformedCommand;
        }
        return transformedScripts;
    }
    /**
     * Transforms a single Storybook script command
     * @param command - The script command string
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed command string
     */
    transformStorybookCommand(command, platform, warnings) {
        switch (platform) {
            case 'Percy':
                return this.transformPercyStorybookCommand(command, warnings);
            case 'Applitools':
                return this.transformApplitoolsStorybookCommand(command, warnings);
            case 'Sauce Labs Visual':
                return this.transformSauceLabsStorybookCommand(command, warnings);
            default:
                return command;
        }
    }
    /**
     * Transforms Percy Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    transformPercyStorybookCommand(command, warnings) {
        // Replace percy storybook with smartui-storybook
        if (command.includes('percy storybook')) {
            return command.replace(/percy storybook/g, 'smartui-storybook');
        }
        return command;
    }
    /**
     * Transforms Applitools Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    transformApplitoolsStorybookCommand(command, warnings) {
        // Replace eyes-storybook with smartui-storybook
        if (command.includes('eyes-storybook')) {
            return command.replace(/eyes-storybook/g, 'smartui-storybook');
        }
        return command;
    }
    /**
     * Transforms Sauce Labs Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    transformSauceLabsStorybookCommand(command, warnings) {
        // Replace screener-storybook with smartui-storybook
        if (command.includes('screener-storybook')) {
            return command.replace(/screener-storybook/g, 'smartui-storybook');
        }
        return command;
    }
    /**
     * Checks for and handles Storybook-specific configuration files
     * @param platform - The source platform
     * @returns Array of proposed changes for configuration files
     */
    async analyzeStorybookConfigurations(platform) {
        const changes = [];
        const warnings = [];
        try {
            // Check for Sauce Labs screener.config.js file
            if (platform === 'Sauce Labs Visual') {
                const screenerConfigPath = path_1.default.join(this.projectPath, 'screener.config.js');
                try {
                    await fs_1.promises.access(screenerConfigPath);
                    changes.push({
                        filePath: 'screener.config.js',
                        type: 'DELETE',
                        description: 'Rename screener.config.js to screener.config.js.bak (no longer needed for SmartUI)'
                    });
                }
                catch (error) {
                    // File doesn't exist, which is fine
                }
            }
            // Check for Applitools Storybook-specific configurations
            if (platform === 'Applitools') {
                const applitoolsConfigPath = path_1.default.join(this.projectPath, 'applitools.config.js');
                try {
                    const configContent = await fs_1.promises.readFile(applitoolsConfigPath, 'utf-8');
                    // Check for Storybook-specific properties
                    if (configContent.includes('storybookUrl') || configContent.includes('storybook')) {
                        warnings.push({
                            message: 'Storybook-specific configuration detected in applitools.config.js',
                            details: 'Properties like storybookUrl and component-specific browser configurations are not used by smartui-storybook and will be ignored.'
                        });
                    }
                }
                catch (error) {
                    // File doesn't exist, which is fine
                }
            }
        }
        catch (error) {
            warnings.push({
                message: `Error analyzing Storybook configurations: ${error instanceof Error ? error.message : 'Unknown error'}`,
                details: 'Some configuration files may not be accessible or may contain unexpected content.'
            });
        }
        return { changes, warnings };
    }
    /**
     * Counts the number of Storybook scripts that would be transformed
     * @param sourceContent - The package.json content as a string
     * @param platform - The source platform
     * @returns Number of scripts that would be transformed
     */
    countStorybookScripts(sourceContent, platform) {
        try {
            const packageJson = JSON.parse(sourceContent);
            if (!packageJson.scripts) {
                return 0;
            }
            let count = 0;
            const scripts = packageJson.scripts;
            for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
                if (typeof scriptCommand === 'string') {
                    switch (platform) {
                        case 'Percy':
                            if (scriptCommand.includes('percy storybook')) {
                                count++;
                            }
                            break;
                        case 'Applitools':
                            if (scriptCommand.includes('eyes-storybook')) {
                                count++;
                            }
                            break;
                        case 'Sauce Labs Visual':
                            if (scriptCommand.includes('screener-storybook')) {
                                count++;
                            }
                            break;
                    }
                }
            }
            return count;
        }
        catch (error) {
            return 0;
        }
    }
}
exports.StorybookTransformer = StorybookTransformer;
//# sourceMappingURL=StorybookTransformer.js.map