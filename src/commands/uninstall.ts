import { Command } from '@oclif/core';
import chalk from 'chalk';
import { ASCIILogos } from '../utils/ascii-logos';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export default class Uninstall extends Command {
  static description = 'Uninstall SmartUI Migration Tool from your system';

  static flags = {};

  static args = {};

  async run(): Promise<void> {
    // Display minimal ASCII logo
    console.log(chalk.cyan(ASCIILogos.getMinimalLogo()));
    
    // Warning message
    console.log(chalk.red.bold('\n⚠️  UNINSTALL WARNING:'));
    console.log(chalk.red('  This will completely remove SmartUI Migration Tool from your system.'));
    console.log(chalk.red('  All configuration files and data will be lost.'));
    
    // Ask for confirmation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to uninstall SmartUI Migration Tool?',
        default: false,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.green.bold('\n✅ UNINSTALL CANCELLED:'));
      console.log(chalk.white('  SmartUI Migration Tool will remain installed.'));
      console.log(chalk.yellow('\n💡 TIP:'));
      console.log(chalk.yellow('  Run "smartui-migrator --help" to see available commands.'));
      process.exit(0);
    }
    
    // Second confirmation
    const { finalConfirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'finalConfirm',
        message: 'This action cannot be undone. Continue with uninstall?',
        default: false,
      },
    ]);
    
    if (!finalConfirm) {
      console.log(chalk.green.bold('\n✅ UNINSTALL CANCELLED:'));
      console.log(chalk.white('  SmartUI Migration Tool will remain installed.'));
      process.exit(0);
    }
    
    // Start uninstall process
    console.log(chalk.yellow.bold('\n🗑️  UNINSTALLING...'));
    console.log(chalk.white('  Removing SmartUI Migration Tool...'));
    
    try {
      // Uninstall the package
      execSync('npm uninstall -g smartui-migration-tool', { 
        stdio: 'inherit',
        timeout: 30000 
      });
      
      console.log(chalk.green.bold('\n✅ UNINSTALL SUCCESSFUL!'));
      console.log(chalk.white('  SmartUI Migration Tool has been removed from your system.'));
      
      // Show what was removed
      console.log(chalk.blue.bold('\n📋 REMOVED COMPONENTS:'));
      console.log(chalk.white('  • CLI executable (smartui-migrator)'));
      console.log(chalk.white('  • Core migration modules'));
      console.log(chalk.white('  • AI-powered analysis tools'));
      console.log(chalk.white('  • Pattern recognition engines'));
      console.log(chalk.white('  • Configuration files'));
      
      // Show impact
      console.log(chalk.yellow.bold('\n⚠️  IMPACT:'));
      console.log(chalk.white('  • You can no longer run "smartui-migrator" commands'));
      console.log(chalk.white('  • All migration capabilities are removed'));
      console.log(chalk.white('  • Configuration data is lost'));
      console.log(chalk.white('  • You can reinstall anytime with: npm install -g smartui-migration-tool'));
      
      // Alternative tools
      console.log(chalk.cyan.bold('\n🔄 ALTERNATIVES:'));
      console.log(chalk.white('  • Manual migration to SmartUI'));
      console.log(chalk.white('  • Other migration tools'));
      console.log(chalk.white('  • LambdaTest support team'));
      
      // Reinstall instructions
      console.log(chalk.green.bold('\n🔄 TO REINSTALL:'));
      console.log(chalk.white('  npm install -g smartui-migration-tool'));
      console.log(chalk.white('  smartui-migrator --version'));
      
      // Feedback request
      console.log(chalk.magenta.bold('\n💬 FEEDBACK:'));
      console.log(chalk.white('  We\'d love to hear why you uninstalled the tool.'));
      console.log(chalk.white('  Please share your feedback at:'));
      console.log(chalk.cyan('  https://github.com/RushilK7/smartui-migration-tool/issues'));
      
    } catch (error) {
      console.log(chalk.red.bold('\n❌ UNINSTALL FAILED:'));
      console.log(chalk.red('  Could not uninstall SmartUI Migration Tool.'));
      console.log(chalk.yellow('\n💡 TROUBLESHOOTING:'));
      console.log(chalk.yellow('  • Check if the tool is installed globally'));
      console.log(chalk.yellow('  • Try running: npm uninstall -g smartui-migration-tool'));
      console.log(chalk.yellow('  • Check for any error messages above'));
      console.log(chalk.yellow('  • Contact support if issues persist'));
      process.exit(1);
    }
    
    // Footer
    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.gray('Uninstall completed successfully!'));
    console.log(chalk.gray('Thank you for using SmartUI Migration Tool!'));
    console.log(chalk.gray('='.repeat(60)));
  }
}