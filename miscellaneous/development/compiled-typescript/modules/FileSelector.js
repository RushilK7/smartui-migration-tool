"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileSelector = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * FileSelector module for interactive file selection during migration
 * Provides granular control over which files to migrate for targeted POCs
 */
class FileSelector {
    /**
     * Prompts user to choose migration scope (all files or selective)
     * @param analysisResult - The analysis result containing file information
     * @returns Promise<string> - The chosen migration scope ('all', 'select', or 'cancel')
     */
    static async promptMigrationScope(analysisResult) {
        const totalFiles = analysisResult.filesToCreate + analysisResult.filesToModify;
        const { migrationScope } = await inquirer_1.default.prompt([
            {
                type: 'list',
                name: 'migrationScope',
                message: 'What would you like to do next?',
                choices: [
                    {
                        name: `Migrate all ${analysisResult.filesToModify} modified and ${analysisResult.filesToCreate} new files`,
                        value: 'all'
                    },
                    {
                        name: 'Select a specific subset of files to migrate (for a targeted POC)',
                        value: 'select'
                    },
                    new inquirer_1.default.Separator(),
                    {
                        name: 'Cancel migration',
                        value: 'cancel'
                    },
                ],
            },
        ]);
        return migrationScope;
    }
    /**
     * Prompts user to select specific files for migration
     * @param analysisResult - The analysis result containing all proposed changes
     * @returns Promise<string[]> - Array of selected file paths
     */
    static async promptFileSelection(analysisResult) {
        // Group changes by type for better organization
        const groupedChanges = this.groupChangesByType(analysisResult.changes);
        // Build choices array with separators and grouped files
        const choices = this.buildChoicesArray(groupedChanges);
        const { selectedFiles } = await inquirer_1.default.prompt([
            {
                type: 'checkbox',
                name: 'selectedFiles',
                message: 'Use the <space> key to select/deselect files for migration. Press <enter> to confirm.',
                choices: choices,
                default: this.getDefaultSelections(analysisResult.changes), // All files selected by default
                validate: (input) => {
                    if (input.length === 0) {
                        return 'Please select at least one file to migrate.';
                    }
                    return true;
                }
            },
        ]);
        return selectedFiles;
    }
    /**
     * Groups proposed changes by their type for better organization
     * @param changes - Array of proposed changes
     * @returns Object with grouped changes by type
     */
    static groupChangesByType(changes) {
        const grouped = {
            'Configuration Files': [],
            'Source Code Files': [],
            'CI/CD Files': [],
            'Package Files': [],
            'Other Files': []
        };
        changes.forEach(change => {
            if (change.type === 'INFO') {
                // Skip info/warning changes as they're not selectable files
                return;
            }
            const filePath = change.filePath.toLowerCase();
            if (filePath.includes('.smartui.json') || filePath.includes('.percy.yml') ||
                filePath.includes('.applitools') || filePath.includes('applitools.config')) {
                grouped['Configuration Files'].push(change);
            }
            else if (filePath.includes('.cy.') || filePath.includes('.spec.') ||
                filePath.includes('.test.') || filePath.includes('.js') ||
                filePath.includes('.ts') || filePath.includes('.java') ||
                filePath.includes('.py') || filePath.includes('.robot')) {
                grouped['Source Code Files'].push(change);
            }
            else if (filePath.includes('.github') || filePath.includes('.gitlab') ||
                filePath.includes('ci/') || filePath.includes('workflows/') ||
                filePath.includes('.yml') || filePath.includes('.yaml')) {
                grouped['CI/CD Files'].push(change);
            }
            else if (filePath.includes('package.json') || filePath.includes('pom.xml') ||
                filePath.includes('build.gradle') || filePath.includes('requirements.txt')) {
                grouped['Package Files'].push(change);
            }
            else {
                grouped['Other Files'].push(change);
            }
        });
        return grouped;
    }
    /**
     * Builds the choices array for the inquirer checkbox prompt
     * @param groupedChanges - Changes grouped by type
     * @returns Array of choices with separators
     */
    static buildChoicesArray(groupedChanges) {
        const choices = [];
        // Add each group with separator
        Object.entries(groupedChanges).forEach(([groupName, changes]) => {
            if (changes.length > 0) {
                // Add separator for the group
                choices.push(new inquirer_1.default.Separator(`--- ${groupName} ---`));
                // Add files in this group
                changes.forEach(change => {
                    const displayName = this.formatFileChoice(change);
                    choices.push({
                        name: displayName,
                        value: change.filePath,
                        short: change.filePath
                    });
                });
            }
        });
        return choices;
    }
    /**
     * Formats a file choice for display in the checkbox prompt
     * @param change - The proposed change
     * @returns Formatted display string
     */
    static formatFileChoice(change) {
        const typeIcon = change.type === 'CREATE' ? '🆕' : '✏️';
        const typeLabel = change.type === 'CREATE' ? 'CREATE' : 'MODIFY';
        return `${typeIcon} ${chalk_1.default.gray(change.filePath)} ${chalk_1.default.dim(`(${typeLabel})`)}`;
    }
    /**
     * Gets the default selections (all files selected by default)
     * @param changes - Array of proposed changes
     * @returns Array of file paths that should be selected by default
     */
    static getDefaultSelections(changes) {
        return changes
            .filter(change => change.type !== 'INFO') // Exclude info/warning changes
            .map(change => change.filePath);
    }
    /**
     * Displays a summary of the selected files
     * @param selectedFiles - Array of selected file paths
     * @param analysisResult - The original analysis result
     */
    static displaySelectionSummary(selectedFiles, analysisResult) {
        const totalFiles = analysisResult.filesToCreate + analysisResult.filesToModify;
        const selectedCount = selectedFiles.length;
        console.log(chalk_1.default.blue(`\n📋 Migration Selection Summary:`));
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(chalk_1.default.green(`✅ Selected: ${selectedCount} files`));
        console.log(chalk_1.default.gray(`📊 Total available: ${totalFiles} files`));
        if (selectedCount < totalFiles) {
            console.log(chalk_1.default.yellow(`⚠️  Skipping: ${totalFiles - selectedCount} files`));
        }
        console.log(chalk_1.default.blue(`\n🚀 Proceeding with migration for ${selectedCount} selected files...`));
    }
    /**
     * Filters the analysis result to only include selected files
     * @param analysisResult - The original analysis result
     * @param selectedFiles - Array of selected file paths
     * @returns Filtered analysis result
     */
    static filterAnalysisResult(analysisResult, selectedFiles) {
        const filteredChanges = analysisResult.changes.filter(change => selectedFiles.includes(change.filePath) || change.type === 'INFO');
        // Recalculate statistics
        const filesToCreate = filteredChanges.filter(change => change.type === 'CREATE').length;
        const filesToModify = filteredChanges.filter(change => change.type === 'MODIFY').length;
        return {
            ...analysisResult,
            filesToCreate,
            filesToModify,
            changes: filteredChanges
        };
    }
}
exports.FileSelector = FileSelector;
//# sourceMappingURL=FileSelector.js.map