import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';

export default class Update extends Command {
  static override description = 'Update SmartUI Migration Tool to the latest version';

  static override flags = {
    help: Flags.help({ char: 'h' }),
    force: Flags.boolean({
      char: 'f',
      description: 'Force update even if already on latest version',
      default: false,
    }),
    check: Flags.boolean({
      char: 'c',
      description: 'Only check for updates without installing',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Update);
    const packageJson = require('../../package.json');
    const currentVersion = packageJson.version;

    console.log(chalk.cyan.bold('🔄 SmartUI Migration Tool - Update\n'));
    console.log(chalk.white(`Current version: ${chalk.green.bold(currentVersion)}\n`));

    try {
      // Check for updates
      console.log(chalk.yellow('🔍 Checking for updates...'));
      
      const latestVersion = execSync('npm view smartui-migration-tool version', { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).trim();

      console.log(chalk.white(`Latest version: ${chalk.green.bold(latestVersion)}\n`));

      if (latestVersion === currentVersion && !flags.force) {
        console.log(chalk.green('✅ You are already running the latest version!'));
        
        if (!flags.check) {
          console.log(chalk.cyan('\n💡 To force update, run: smartui-migrator update --force'));
        }
        return;
      }

      if (flags.check) {
        console.log(chalk.yellow('📦 Update available!'));
        console.log(chalk.cyan('\n💡 To install the update, run: smartui-migrator update'));
        return;
      }

      // Perform the update
      console.log(chalk.yellow('📦 Updating SmartUI Migration Tool...\n'));

      // Check if running as root (not recommended)
      if (process.getuid && process.getuid() === 0) {
        console.log(chalk.yellow('⚠️ Warning: Running as root. This is not recommended.'));
        console.log(chalk.gray('   Consider using a Node.js version manager like nvm.\n'));
      }

      // Update the package
      console.log(chalk.blue('🔄 Installing latest version...'));
      execSync('npm update -g smartui-migration-tool', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });

      // Verify the update
      console.log(chalk.blue('\n🔍 Verifying installation...'));
      const newVersion = execSync('smartui-migrator version', { 
        encoding: 'utf8',
        stdio: 'pipe'
      }).match(/Version: (.+)/)?.[1]?.trim();

      if (newVersion && newVersion !== currentVersion) {
        console.log(chalk.green('\n✅ Update successful!'));
        console.log(chalk.white(`   Previous version: ${chalk.gray(currentVersion)}`));
        console.log(chalk.white(`   New version: ${chalk.green.bold(newVersion)}`));
        
        // Show what's new
        console.log(chalk.cyan('\n🎉 What\'s new in this version:'));
        console.log(chalk.white('   • Enhanced package.json transformation'));
        console.log(chalk.white('   • Improved CI/CD pipeline migration'));
        console.log(chalk.white('   • Better error handling and logging'));
        console.log(chalk.white('   • New CLI commands and improved UX'));
        
        console.log(chalk.cyan('\n💡 To get started, run: smartui-migrator'));
        
      } else {
        console.log(chalk.yellow('\n⚠️ Update completed, but version verification failed'));
        console.log(chalk.gray('   The tool may have been updated successfully'));
        console.log(chalk.cyan('\n💡 Try running: smartui-migrator version'));
      }

    } catch (error) {
      console.error(chalk.red('\n❌ Update failed:'));
      
      if (error instanceof Error) {
        if (error.message.includes('EACCES')) {
          console.error(chalk.red('   Permission denied. Try running with sudo or use a Node.js version manager.'));
          console.error(chalk.cyan('\n💡 Alternative: npm install -g smartui-migration-tool@latest'));
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
          console.error(chalk.red('   Network error. Check your internet connection.'));
          console.error(chalk.cyan('\n💡 Try again later or check npm registry status.'));
        } else {
          console.error(chalk.red(`   ${error.message}`));
        }
      } else {
        console.error(chalk.red('   Unknown error occurred'));
      }
      
      console.error(chalk.cyan('\n💡 For manual update: npm install -g smartui-migration-tool@latest'));
      this.exit(1);
    }
  }
}
