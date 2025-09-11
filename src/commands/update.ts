import { Command } from '@oclif/core';
import chalk from 'chalk';
import { ASCIILogos } from '../utils/ascii-logos';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export default class Update extends Command {
  static description = 'Update SmartUI Migration Tool to the latest version';

  static flags = {};

  static args = {};

  async run(): Promise<void> {
    // Display minimal ASCII logo
    console.log(chalk.cyan(ASCIILogos.getMinimalLogo()));
    
    // Get current version
    const currentVersion = '1.6.0';
    
    // Check latest version from npmjs
    console.log(chalk.blue.bold('\n🔍 CHECKING FOR UPDATES...'));
    
    let latestVersion = 'Unknown';
    let updateAvailable = false;
    
    try {
      const npmInfo = execSync('npm view smartui-migration-tool version', { 
        encoding: 'utf8',
        timeout: 10000 
      }).trim();
      latestVersion = npmInfo;
      updateAvailable = currentVersion !== latestVersion;
    } catch (error) {
      console.log(chalk.red.bold('\n❌ ERROR:'));
      console.log(chalk.red('  Could not check latest version from npmjs.'));
      console.log(chalk.yellow('\n💡 TIP:'));
      console.log(chalk.yellow('  Check your internet connection and try again.'));
      process.exit(1);
    }
    
    // Display version information
    console.log(chalk.green.bold('\n📦 VERSION INFORMATION:'));
    console.log(chalk.white(`  Current Version: ${chalk.cyan.bold(currentVersion)}`));
    console.log(chalk.white(`  Latest Version:  ${chalk.cyan.bold(latestVersion)}`));
    
    if (!updateAvailable) {
      console.log(chalk.green.bold('\n✅ UP TO DATE:'));
      console.log(chalk.white('  You are already running the latest version!'));
      console.log(chalk.yellow('\n💡 TIP:'));
      console.log(chalk.yellow('  Run "smartui-migrator --version" to check version info.'));
      process.exit(0);
    }
    
    // Ask for confirmation
    console.log(chalk.yellow.bold('\n🔄 UPDATE AVAILABLE:'));
    console.log(chalk.white(`  A newer version (${latestVersion}) is available!`));
    console.log(chalk.white(`  Current: ${currentVersion} → Latest: ${latestVersion}`));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Update to latest version?',
        default: true,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('\n⏹️  Update cancelled by user.'));
      process.exit(0);
    }
    
    // Start update process
    console.log(chalk.green.bold('\n🚀 UPDATING...'));
    console.log(chalk.white('  Installing latest version...'));
    
    try {
      // Update the package
      execSync('npm install -g smartui-migration-tool@latest', { 
        stdio: 'inherit',
        timeout: 60000 
      });
      
      console.log(chalk.green.bold('\n✅ UPDATE SUCCESSFUL!'));
      console.log(chalk.white(`  Updated to version ${latestVersion}`));
      
      // Verify installation
      console.log(chalk.blue.bold('\n🔍 VERIFYING INSTALLATION...'));
      const newVersion = execSync('smartui-migrator --version', { 
        encoding: 'utf8',
        timeout: 5000 
      });
      
      console.log(chalk.green.bold('\n🎉 UPDATE COMPLETED!'));
      console.log(chalk.white('  SmartUI Migration Tool has been successfully updated.'));
      console.log(chalk.white('  You can now use the latest features and improvements.'));
      
      // Show what's new
      console.log(chalk.cyan.bold('\n✨ WHAT\'S NEW:'));
      console.log(chalk.white('  • Enhanced AI-powered code analysis'));
      console.log(chalk.white('  • Improved pattern recognition'));
      console.log(chalk.white('  • Better error handling and recovery'));
      console.log(chalk.white('  • Performance optimizations'));
      console.log(chalk.white('  • Bug fixes and stability improvements'));
      
      // Next steps
      console.log(chalk.yellow.bold('\n🎯 NEXT STEPS:'));
      console.log(chalk.white('  • Run "smartui-migrator" to see the overview'));
      console.log(chalk.white('  • Run "smartui-migrator init" to start migration'));
      console.log(chalk.white('  • Run "smartui-migrator --help" for detailed help'));
      
    } catch (error) {
      console.log(chalk.red.bold('\n❌ UPDATE FAILED:'));
      console.log(chalk.red('  Could not update SmartUI Migration Tool.'));
      console.log(chalk.yellow('\n💡 TROUBLESHOOTING:'));
      console.log(chalk.yellow('  • Check your internet connection'));
      console.log(chalk.yellow('  • Ensure you have npm permissions'));
      console.log(chalk.yellow('  • Try running: npm install -g smartui-migration-tool@latest'));
      console.log(chalk.yellow('  • Check for any error messages above'));
      process.exit(1);
    }
    
    // Footer
    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.gray('Update completed successfully!'));
    console.log(chalk.gray('='.repeat(60)));
  }
}