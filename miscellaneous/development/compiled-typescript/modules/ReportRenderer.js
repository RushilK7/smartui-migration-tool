"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportRenderer = void 0;
const cli_table3_1 = __importDefault(require("cli-table3"));
const chalk_1 = __importDefault(require("chalk"));
/**
 * ReportRenderer module for displaying analysis results in a professional table format
 * Uses cli-table3 for table rendering and chalk for color coding
 */
class ReportRenderer {
    /**
     * Renders the analysis result as a formatted table
     * @param analysisResult - The analysis result to display
     */
    static renderAnalysisReport(analysisResult) {
        // Print header
        console.log(chalk_1.default.blue.bold('\n📊 Migration Analysis Report'));
        console.log(chalk_1.default.gray('─'.repeat(60)));
        // Print summary statistics
        this.renderSummary(analysisResult);
        // Print changes table
        this.renderChangesTable(analysisResult.changes);
        // Print warnings if any
        if (analysisResult.warnings.length > 0) {
            this.renderWarnings(analysisResult.warnings);
        }
    }
    /**
     * Renders the summary statistics
     * @param analysisResult - The analysis result
     */
    static renderSummary(analysisResult) {
        console.log(chalk_1.default.white('\n📈 Summary:'));
        console.log(chalk_1.default.green(`  • Files to create: ${analysisResult.filesToCreate}`));
        console.log(chalk_1.default.yellow(`  • Files to modify: ${analysisResult.filesToModify}`));
        console.log(chalk_1.default.blue(`  • Snapshots to migrate: ${analysisResult.snapshotCount}`));
        console.log(chalk_1.default.red(`  • Warnings: ${analysisResult.warnings.length}`));
        console.log('');
    }
    /**
     * Renders the changes table
     * @param changes - Array of proposed changes
     */
    static renderChangesTable(changes) {
        if (changes.length === 0) {
            console.log(chalk_1.default.yellow('No changes detected.'));
            return;
        }
        // Create table with appropriate headers and column widths
        const table = new cli_table3_1.default({
            head: [
                chalk_1.default.white.bold('File Path'),
                chalk_1.default.white.bold('Change Type'),
                chalk_1.default.white.bold('Description')
            ],
            colWidths: [30, 12, 50],
            style: {
                head: [],
                border: ['gray']
            }
        });
        // Add rows to table
        changes.forEach(change => {
            const changeTypeColor = this.getChangeTypeColor(change.type);
            const changeTypeText = this.getChangeTypeText(change.type);
            table.push([
                chalk_1.default.gray(change.filePath),
                changeTypeColor(changeTypeText),
                chalk_1.default.white(change.description)
            ]);
        });
        console.log(chalk_1.default.white.bold('\n📋 Proposed Changes:'));
        console.log(table.toString());
    }
    /**
     * Renders warnings section
     * @param warnings - Array of warnings
     */
    static renderWarnings(warnings) {
        console.log(chalk_1.default.yellow.bold('\n⚠️  Warnings:'));
        warnings.forEach((warning, index) => {
            console.log(chalk_1.default.yellow(`  ${index + 1}. ${warning.message}`));
            if (warning.details) {
                console.log(chalk_1.default.gray(`     ${warning.details}`));
            }
        });
        console.log('');
    }
    /**
     * Gets the appropriate color function for a change type
     * @param changeType - The type of change
     * @returns Chalk color function
     */
    static getChangeTypeColor(changeType) {
        switch (changeType) {
            case 'CREATE':
                return chalk_1.default.green.bold;
            case 'MODIFY':
                return chalk_1.default.yellow.bold;
            case 'INFO':
                return chalk_1.default.blue.bold;
            default:
                return chalk_1.default.white;
        }
    }
    /**
     * Gets the display text for a change type
     * @param changeType - The type of change
     * @returns Display text
     */
    static getChangeTypeText(changeType) {
        switch (changeType) {
            case 'CREATE':
                return 'CREATE';
            case 'MODIFY':
                return 'MODIFY';
            case 'INFO':
                return 'INFO';
            default:
                return 'UNKNOWN';
        }
    }
}
exports.ReportRenderer = ReportRenderer;
//# sourceMappingURL=ReportRenderer.js.map