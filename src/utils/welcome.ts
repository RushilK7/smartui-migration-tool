import chalk from 'chalk';
import figlet from 'figlet';
import { promisify } from 'util';

const figletAsync = promisify(figlet);

/**
 * Welcome screen utility for displaying the SmartUI Migration Tool introduction
 */
export class WelcomeScreen {
  /**
   * Displays the welcome screen with SmartUI branding
   */
  public static async display(): Promise<void> {
    // Clear the console for a clean start
    console.clear();

    try {
      // Generate the main title using figlet
      const title = await figletAsync('SmartUI');

      // Display the title with brand colors
      console.log(chalk.hex('#00D4AA').bold(title));
      
      // Display the tagline
      console.log(chalk.hex('#1E40AF').bold('\n  Begin your journey with SmartUI\n'));
      
      // Add a subtle separator line
      console.log(chalk.gray('─'.repeat(60)));
      
      // Display version and description
      console.log(chalk.white('\n  SmartUI Migration Tool v1.1.1'));
      console.log(chalk.gray('  Migrate your visual testing suite to LambdaTest SmartUI\n'));
      
      // Add a brief pause for visual impact
      await this.sleep(1500);
      
    } catch (error) {
      // Fallback if figlet fails
      console.log(chalk.hex('#00D4AA').bold('\n  ╔══════════════════════════════════════╗'));
      console.log(chalk.hex('#00D4AA').bold('  ║              SmartUI                ║'));
      console.log(chalk.hex('#00D4AA').bold('  ╚══════════════════════════════════════╝'));
      console.log(chalk.hex('#1E40AF').bold('\n  Begin your journey with SmartUI\n'));
      await this.sleep(1500);
    }
  }

  /**
   * Displays a loading message with animation
   */
  public static async showLoading(message: string): Promise<void> {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;
    
    const interval = setInterval(() => {
      process.stdout.write(`\r${chalk.cyan(frames[i])} ${chalk.white(message)}`);
      i = (i + 1) % frames.length;
    }, 100);

    // Return a promise that resolves after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r'); // Clear the line
        resolve();
      }, 2000);
    });
  }

  /**
   * Displays a success message
   */
  public static showSuccess(message: string): void {
    console.log(chalk.green('✓'), chalk.white(message));
  }

  /**
   * Displays a warning message
   */
  public static showWarning(message: string): void {
    console.log(chalk.yellow('⚠'), chalk.white(message));
  }

  /**
   * Displays an error message
   */
  public static showError(message: string): void {
    console.log(chalk.red('✗'), chalk.white(message));
  }

  /**
   * Displays an info message
   */
  public static showInfo(message: string): void {
    console.log(chalk.blue('ℹ'), chalk.white(message));
  }

  /**
   * Utility function to create a delay
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
