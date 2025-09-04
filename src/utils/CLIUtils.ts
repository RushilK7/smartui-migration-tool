import chalk from 'chalk';
import ora from 'ora';

/**
 * Utility class for CLI operations
 * Replaces InteractiveCLI functionality
 */
export class CLIUtils {
  /**
   * Displays a loading spinner with custom message
   */
  public static async showSpinner(message: string, duration: number = 2000): Promise<void> {
    const spinner = ora({
      text: message,
      spinner: 'dots',
      color: 'cyan',
    });

    spinner.start();
    await new Promise(resolve => setTimeout(resolve, duration));
    spinner.succeed(chalk.green(`✅ ${message.replace('...', ' complete.')}`));
  }

  /**
   * Displays a success message with consistent formatting
   */
  public static showSuccess(message: string): void {
    console.log(chalk.green(`✅ ${message}`));
  }

  /**
   * Displays a warning message with consistent formatting
   */
  public static showWarning(message: string): void {
    console.log(chalk.yellow(`⚠️  ${message}`));
  }

  /**
   * Displays an error message with consistent formatting
   */
  public static showError(message: string): void {
    console.log(chalk.red(`❌ ${message}`));
  }

  /**
   * Displays an info message with consistent formatting
   */
  public static showInfo(message: string): void {
    console.log(chalk.blue(`ℹ️  ${message}`));
  }
}
