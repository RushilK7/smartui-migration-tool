import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { execSync } from 'child_process';

export default class Version extends Command {
  static override description = 'Show version information and check for updates';

  static override flags = {
    help: Flags.help({ char: 'h' }),
    check: Flags.boolean({
      char: 'c',
      description: 'Check for available updates',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Version);
    const packageJson = require('../../package.json');
    
    console.log(chalk.cyan.bold('SmartUI Migration Tool'));
    console.log(chalk.white(`Version: ${chalk.green.bold(packageJson.version)}`));
    console.log(chalk.white(`Node.js: ${chalk.green.bold(process.version)}`));
    console.log(chalk.white(`Platform: ${chalk.green.bold(process.platform)} ${chalk.green.bold(process.arch)}`));
    
    if (flags.check) {
      console.log(chalk.yellow('\n🔍 Checking for updates...'));
      
      try {
        // Check for updates using npm
        const latestVersion = execSync('npm view smartui-migration-tool version', { 
          encoding: 'utf8',
          stdio: 'pipe'
        }).trim();
        
        const currentVersion = packageJson.version;
        
        if (latestVersion === currentVersion) {
          console.log(chalk.green('✅ You are running the latest version!'));
        } else {
          console.log(chalk.yellow(`📦 New version available: ${chalk.green.bold(latestVersion)}`));
          console.log(chalk.white(`   Current version: ${chalk.gray(currentVersion)}`));
          console.log(chalk.cyan('\n💡 To update, run: smartui-migrator update'));
        }
      } catch (error) {
        console.log(chalk.red('❌ Failed to check for updates'));
        console.log(chalk.gray('   Make sure you have internet connection'));
        console.log(chalk.cyan('\n💡 To update manually, run: npm update -g smartui-migration-tool'));
      }
    } else {
      console.log(chalk.cyan('\n💡 To check for updates, run: smartui-migrator version --check'));
    }
    
    console.log(chalk.gray('\nFor more information, visit: https://github.com/RushilK7/smartui-migration-tool'));
  }
}
