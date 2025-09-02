import inquirer from 'inquirer';
import ora from 'ora';
import chalk from 'chalk';
import { WelcomeScreen } from './utils/welcome';
import { Scanner } from './modules/Scanner';
import { PlatformNotDetectedError, MultiplePlatformsDetectedError } from './types';

/**
 * Interactive CLI workflow for the SmartUI Migration Tool
 * Provides a human-first experience with clear feedback and user control
 */
export class InteractiveCLI {
  private isAutomated: boolean;
  private projectPath: string;

  constructor(isAutomated: boolean = false, projectPath: string = process.cwd()) {
    this.isAutomated = isAutomated;
    this.projectPath = projectPath;
  }

  /**
   * Main interactive workflow that guides the user through the migration process
   */
  public async runWorkflow(): Promise<boolean> {
    try {
      // Display welcome screen
      await WelcomeScreen.display();

      // Start project scanning with spinner
      const spinner = ora({
        text: 'Scanning your project for visual tests...',
        spinner: 'dots',
        color: 'cyan',
      });

      spinner.start();

      // Perform actual project scanning
      const detectionResult = await this.scanProject();

      // Stop spinner with success message
      spinner.succeed(chalk.green('✅ Project analysis complete.'));

      // Display detection results
      this.displayDetectionResults(detectionResult);

      // If automated mode, skip interactive prompts
      if (this.isAutomated) {
        console.log(chalk.blue('🤖 Automated mode: Proceeding with migration...'));
        return true;
      }

      // Present interactive menu to user
      const shouldProceed = await this.presentUserChoice();

      return shouldProceed;

    } catch (error) {
      if (error instanceof PlatformNotDetectedError) {
        console.error(chalk.red('❌ Platform Detection Error:'));
        console.error(chalk.red(error.message));
        return false;
      }
      
      if (error instanceof MultiplePlatformsDetectedError) {
        console.error(chalk.red('❌ Multiple Platforms Detected:'));
        console.error(chalk.red(error.message));
        return false;
      }

      console.error(chalk.red('❌ An error occurred during the interactive workflow:'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      return false;
    }
  }

  /**
   * Performs actual project scanning using the Scanner module
   */
  private async scanProject() {
    const scanner = new Scanner(this.projectPath);
    return await scanner.scan();
  }

  /**
   * Displays the detection results in a clean, readable format
   */
  private displayDetectionResults(detectionResult: any): void {
    const { platform, framework, language, files } = detectionResult;
    
    console.log(chalk.green(`✅ Detected ${platform} project using ${framework} and ${language}.`));
    
    if (files.config.length > 0) {
      console.log(chalk.blue(`📁 Configuration files: ${files.config.length} found`));
    }
    
    if (files.source.length > 0) {
      console.log(chalk.blue(`🧪 Test files: ${files.source.length} found`));
    }
    
    if (files.ci.length > 0) {
      console.log(chalk.blue(`🔄 CI/CD files: ${files.ci.length} found`));
    }
    
    console.log(''); // Add spacing
  }

  /**
   * Presents the user with a choice menu using inquirer
   */
  private async presentUserChoice(): Promise<boolean> {
    const question = {
      type: 'list' as const,
      name: 'action',
      message: '? What would you like to do?',
      choices: [
        {
          name: '🚀 Migrate to SmartUI',
          value: 'migrate',
          short: 'Migrate to SmartUI',
        },
        {
          name: '❌ Exit',
          value: 'exit',
          short: 'Exit',
        },
      ],
      default: 'migrate',
    };

    const answers = await inquirer.prompt([question]);

    switch (answers['action']) {
      case 'migrate':
        console.log(chalk.green('🚀 Proceeding with migration...'));
        return true;
      
      case 'exit':
        console.log(chalk.yellow('👋 Migration cancelled. Goodbye!'));
        return false;
      
      default:
        console.log(chalk.red('❌ Invalid choice. Exiting...'));
        return false;
    }
  }

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
