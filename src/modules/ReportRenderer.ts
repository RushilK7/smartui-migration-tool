import Table from 'cli-table3';
import chalk from 'chalk';
import { AnalysisResult, ProposedChange } from '../types';

/**
 * ReportRenderer module for displaying analysis results in a professional table format
 * Uses cli-table3 for table rendering and chalk for color coding
 */
export class ReportRenderer {
  /**
   * Renders the analysis result as a formatted table
   * @param analysisResult - The analysis result to display
   */
  public static renderAnalysisReport(analysisResult: AnalysisResult): void {
    // Print header
    console.log(chalk.blue.bold('\n📊 Migration Analysis Report'));
    console.log(chalk.gray('─'.repeat(60)));

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
  private static renderSummary(analysisResult: AnalysisResult): void {
    console.log(chalk.white('\n📈 Summary:'));
    console.log(chalk.green(`  • Files to create: ${analysisResult.filesToCreate}`));
    console.log(chalk.yellow(`  • Files to modify: ${analysisResult.filesToModify}`));
    console.log(chalk.blue(`  • Snapshots to migrate: ${analysisResult.snapshotCount}`));
    console.log(chalk.red(`  • Warnings: ${analysisResult.warnings.length}`));
    console.log('');
  }

  /**
   * Renders the changes table
   * @param changes - Array of proposed changes
   */
  private static renderChangesTable(changes: ProposedChange[]): void {
    if (changes.length === 0) {
      console.log(chalk.yellow('No changes detected.'));
      return;
    }

    // Create table with appropriate headers and column widths
    const table = new Table({
      head: [
        chalk.white.bold('File Path'),
        chalk.white.bold('Change Type'),
        chalk.white.bold('Description')
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
        chalk.gray(change.filePath),
        changeTypeColor(changeTypeText),
        chalk.white(change.description)
      ]);
    });

    console.log(chalk.white.bold('\n📋 Proposed Changes:'));
    console.log(table.toString());
  }

  /**
   * Renders warnings section
   * @param warnings - Array of warnings
   */
  private static renderWarnings(warnings: any[]): void {
    console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
    warnings.forEach((warning, index) => {
      console.log(chalk.yellow(`  ${index + 1}. ${warning.message}`));
      if (warning.details) {
        console.log(chalk.gray(`     ${warning.details}`));
      }
    });
    console.log('');
  }

  /**
   * Gets the appropriate color function for a change type
   * @param changeType - The type of change
   * @returns Chalk color function
   */
  private static getChangeTypeColor(changeType: 'CREATE' | 'MODIFY' | 'INFO'): (text: string) => string {
    switch (changeType) {
      case 'CREATE':
        return chalk.green.bold;
      case 'MODIFY':
        return chalk.yellow.bold;
      case 'INFO':
        return chalk.blue.bold;
      default:
        return chalk.white;
    }
  }

  /**
   * Gets the display text for a change type
   * @param changeType - The type of change
   * @returns Display text
   */
  private static getChangeTypeText(changeType: 'CREATE' | 'MODIFY' | 'INFO'): string {
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
