import chalk from 'chalk';
import ora, { Ora, Spinner } from 'ora';
import { logger } from '../utils/Logger';

/**
 * UI Polish module for enhanced CLI output and user experience
 */

export interface ProgressOptions {
  text: string;
  spinner?: Spinner;
  color?: string;
  interval?: number;
}

export interface TableOptions {
  headers: string[];
  rows: string[][];
  columnWidths?: number[];
  alignment?: ('left' | 'center' | 'right')[];
  colors?: string[];
}

export class UIPolish {
  private verbose: boolean;
  private currentSpinner: Ora | null = null;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Enhanced progress spinner with better styling
   */
  public createProgressSpinner(options: ProgressOptions): Ora {
    const spinnerOptions: any = {
      text: options.text,
      spinner: options.spinner || 'dots',
      color: options.color || 'blue',
      interval: options.interval || 100
    };

    const spinner = ora(spinnerOptions);
    this.currentSpinner = spinner;
    return spinner;
  }

  /**
   * Enhanced success message with styling
   */
  public showSuccess(message: string, details?: string[]): void {
    console.log(chalk.green.bold('✅'), chalk.white.bold(message));
    
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(chalk.gray(`   ${detail}`));
      });
    }
  }

  /**
   * Enhanced error message with styling
   */
  public showError(message: string, details?: string[]): void {
    console.log(chalk.red.bold('❌'), chalk.white.bold(message));
    
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(chalk.red(`   ${detail}`));
      });
    }
  }

  /**
   * Enhanced warning message with styling
   */
  public showWarning(message: string, details?: string[]): void {
    console.log(chalk.yellow.bold('⚠️'), chalk.white.bold(message));
    
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(chalk.yellow(`   ${detail}`));
      });
    }
  }

  /**
   * Enhanced info message with styling
   */
  public showInfo(message: string, details?: string[]): void {
    console.log(chalk.blue.bold('ℹ️'), chalk.white.bold(message));
    
    if (details && details.length > 0) {
      details.forEach(detail => {
        console.log(chalk.gray(`   ${detail}`));
      });
    }
  }

  /**
   * Create a beautiful table
   */
  public createTable(options: TableOptions): void {
    const { headers, rows, columnWidths, alignment, colors } = options;
    
    // Calculate column widths if not provided
    const widths = columnWidths || this.calculateColumnWidths(headers, rows);
    const alignments = alignment || headers.map(() => 'left');
    const headerColors = colors || headers.map(() => 'white');
    
    // Create separator line
    const separator = '─'.repeat(widths.reduce((sum, width) => sum + width + 3, 0));
    
    // Print header
    console.log(chalk.gray('┌' + separator + '┐'));
    let headerRow = '│';
    headers.forEach((header, index) => {
      const paddedHeader = this.padText(header, widths[index] || header.length, alignments[index] || 'left');
      const colorName = headerColors[index] || 'white';
      let coloredHeader: string;
      
      if (colorName === 'white') {
        coloredHeader = chalk.white(paddedHeader);
      } else if (colorName === 'red') {
        coloredHeader = chalk.red(paddedHeader);
      } else if (colorName === 'green') {
        coloredHeader = chalk.green(paddedHeader);
      } else if (colorName === 'blue') {
        coloredHeader = chalk.blue(paddedHeader);
      } else if (colorName === 'yellow') {
        coloredHeader = chalk.yellow(paddedHeader);
      } else {
        coloredHeader = chalk.white(paddedHeader);
      }
      
      headerRow += ` ${chalk.bold(coloredHeader)} │`;
    });
    console.log(headerRow);
    console.log(chalk.gray('├' + separator + '┤'));
    
    // Print rows
    rows.forEach((row, rowIndex) => {
      let rowText = '│';
      row.forEach((cell, cellIndex) => {
        const paddedCell = this.padText(cell, widths[cellIndex] || cell.length, alignments[cellIndex] || 'left');
        const cellColor = colors && colors[cellIndex] ? colors[cellIndex] : 'white';
        let coloredCell: string;
        
        if (cellColor === 'white') {
          coloredCell = chalk.white(paddedCell);
        } else if (cellColor === 'red') {
          coloredCell = chalk.red(paddedCell);
        } else if (cellColor === 'green') {
          coloredCell = chalk.green(paddedCell);
        } else if (cellColor === 'blue') {
          coloredCell = chalk.blue(paddedCell);
        } else if (cellColor === 'yellow') {
          coloredCell = chalk.yellow(paddedCell);
        } else {
          coloredCell = chalk.white(paddedCell);
        }
        
        rowText += ` ${coloredCell} │`;
      });
      console.log(rowText);
    });
    
    console.log(chalk.gray('└' + separator + '┘'));
  }

  /**
   * Create a progress bar
   */
  public createProgressBar(total: number, current: number, text: string): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round((current / total) * 20);
    const empty = 20 - filled;
    
    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const progressText = `${text} |${bar}| ${percentage}% (${current}/${total})`;
    
    process.stdout.write(`\r${chalk.blue(progressText)}`);
    
    if (current === total) {
      process.stdout.write('\n');
    }
  }

  /**
   * Create a section header
   */
  public createSectionHeader(title: string, subtitle?: string): void {
    console.log('\n' + chalk.blue.bold('='.repeat(60)));
    console.log(chalk.blue.bold(`  ${title}`));
    if (subtitle) {
      console.log(chalk.gray(`  ${subtitle}`));
    }
    console.log(chalk.blue.bold('='.repeat(60)));
  }

  /**
   * Create a feature list
   */
  public createFeatureList(features: string[], title: string = 'Features'): void {
    console.log(chalk.blue.bold(`\n${title}:`));
    features.forEach((feature, index) => {
      console.log(chalk.gray(`  ${index + 1}.`), chalk.white(feature));
    });
  }

  /**
   * Create a status summary
   */
  public createStatusSummary(stats: {
    total: number;
    completed: number;
    failed: number;
    warnings: number;
  }): void {
    const { total, completed, failed, warnings } = stats;
    const successRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    console.log(chalk.blue.bold('\n📊 Status Summary:'));
    console.log(chalk.green(`  ✅ Completed: ${completed}/${total} (${successRate}%)`));
    
    if (failed > 0) {
      console.log(chalk.red(`  ❌ Failed: ${failed}`));
    }
    
    if (warnings > 0) {
      console.log(chalk.yellow(`  ⚠️  Warnings: ${warnings}`));
    }
  }

  /**
   * Create a loading animation
   */
  public createLoadingAnimation(text: string, duration: number = 2000): Promise<void> {
    return new Promise((resolve) => {
      const spinner = this.createProgressSpinner({ text });
      spinner.start();
      
      setTimeout(() => {
        spinner.stop();
        resolve();
      }, duration);
    });
  }

  /**
   * Create a countdown timer
   */
  public createCountdown(seconds: number, text: string = 'Starting in'): Promise<void> {
    return new Promise((resolve) => {
      let remaining = seconds;
      
      const interval = setInterval(() => {
        process.stdout.write(`\r${chalk.yellow(`${text}: ${remaining}s`)}`);
        remaining--;
        
        if (remaining < 0) {
          clearInterval(interval);
          process.stdout.write('\n');
          resolve();
        }
      }, 1000);
    });
  }

  /**
   * Create a confirmation prompt with styling
   */
  public createConfirmationPrompt(question: string, defaultValue: boolean = true): string {
    const defaultText = defaultValue ? 'Y/n' : 'y/N';
    const prompt = `${chalk.blue.bold('?')} ${chalk.white(question)} ${chalk.gray(`(${defaultText})`)}`;
    
    return prompt;
  }

  /**
   * Create a file tree display
   */
  public createFileTree(files: string[], rootPath: string = ''): void {
    console.log(chalk.blue.bold('\n📁 File Structure:'));
    
    const tree = this.buildFileTree(files, rootPath);
    this.printFileTree(tree, '');
  }

  /**
   * Create a performance summary
   */
  public createPerformanceSummary(metrics: {
    totalOperations: number;
    averageDuration: number;
    totalMemoryUsage: number;
    cacheStats: { size: number; hitRate: number; expired: number };
  }): void {
    console.log(chalk.blue.bold('\n⚡ Performance Summary:'));
    console.log(chalk.white(`  Operations: ${metrics.totalOperations}`));
    console.log(chalk.white(`  Average Duration: ${metrics.averageDuration}ms`));
    console.log(chalk.white(`  Memory Usage: ${metrics.totalMemoryUsage}KB`));
    console.log(chalk.white(`  Cache Size: ${metrics.cacheStats.size} entries`));
    console.log(chalk.white(`  Cache Hit Rate: ${metrics.cacheStats.hitRate}%`));
  }

  // Private methods

  private calculateColumnWidths(headers: string[], rows: string[][]): number[] {
    const widths: number[] = [];
    
    headers.forEach((header, index) => {
      let maxWidth = header.length;
      
      rows.forEach(row => {
        if (row[index]) {
          maxWidth = Math.max(maxWidth, row[index].length);
        }
      });
      
      widths.push(Math.min(maxWidth + 2, 50)); // Cap at 50 characters
    });
    
    return widths;
  }

  private padText(text: string, width: number, alignment: 'left' | 'center' | 'right'): string {
    if (text.length >= width) {
      return text.substring(0, width - 3) + '...';
    }
    
    const padding = width - text.length;
    
    switch (alignment) {
      case 'center':
        const leftPad = Math.floor(padding / 2);
        const rightPad = padding - leftPad;
        return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
      case 'right':
        return ' '.repeat(padding) + text;
      default: // left
        return text + ' '.repeat(padding);
    }
  }

  private buildFileTree(files: string[], rootPath: string): any {
    const tree: any = {};
    
    files.forEach(file => {
      const relativePath = rootPath ? file.replace(rootPath + '/', '') : file;
      const parts = relativePath.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = 'file';
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      });
    });
    
    return tree;
  }

  private printFileTree(tree: any, prefix: string): void {
    const keys = Object.keys(tree).sort();
    
    keys.forEach((key, index) => {
      const isLast = index === keys.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const nextPrefix = prefix + (isLast ? '    ' : '│   ');
      
      if (tree[key] === 'file') {
        console.log(prefix + connector + chalk.white(key));
      } else {
        console.log(prefix + connector + chalk.blue(key) + '/');
        this.printFileTree(tree[key], nextPrefix);
      }
    });
  }

  /**
   * Stop current spinner
   */
  public stopSpinner(): void {
    if (this.currentSpinner) {
      this.currentSpinner.stop();
      this.currentSpinner = null;
    }
  }

  /**
   * Clear screen
   */
  public clearScreen(): void {
    console.clear();
  }

  /**
   * Create a banner
   */
  public createBanner(text: string): void {
    const banner = `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ${text.padEnd(58)}  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
    console.log(chalk.blue.bold(banner));
  }
}
