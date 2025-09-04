import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { execSync } from 'child_process';
import inquirer from 'inquirer';

export default class Uninstall extends Command {
  static override description = 'Uninstall SmartUI Migration Tool from your system';

  static override flags = {
    help: Flags.help({ char: 'h' }),
    force: Flags.boolean({
      char: 'f',
      description: 'Skip confirmation prompt',
      default: false,
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Uninstall);
    const packageJson = require('../../package.json');
    const currentVersion = packageJson.version;

    console.log(chalk.red.bold('🗑️ SmartUI Migration Tool - Uninstall\n'));
    console.log(chalk.white(`Current version: ${chalk.gray(currentVersion)}`));
    console.log(chalk.white(`Installation path: ${chalk.gray(process.argv[0])}\n`));

    // Show what will be removed
    console.log(chalk.yellow('📋 This will remove:'));
    console.log(chalk.white('  • SmartUI Migration Tool binary'));
    console.log(chalk.white('  • All associated files and dependencies'));
    console.log(chalk.white('  • Global npm package installation\n'));

    // Show what will NOT be removed
    console.log(chalk.green('✅ This will NOT remove:'));
    console.log(chalk.white('  • Your migrated projects'));
    console.log(chalk.white('  • SmartUI configuration files'));
    console.log(chalk.white('  • Backup files created during migration'));
    console.log(chalk.white('  • Any other global npm packages\n'));

    // Confirmation prompt
    if (!flags.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Are you sure you want to uninstall SmartUI Migration Tool?',
          default: false,
        },
      ]);

      if (!confirm) {
        console.log(chalk.blue('\n✅ Uninstall cancelled. SmartUI Migration Tool remains installed.'));
        return;
      }
    }

    try {
      console.log(chalk.yellow('\n🔄 Uninstalling SmartUI Migration Tool...\n'));

      // Check if running as root (not recommended)
      if (process.getuid && process.getuid() === 0) {
        console.log(chalk.yellow('⚠️ Warning: Running as root. This is not recommended.'));
        console.log(chalk.gray('   Consider using a Node.js version manager like nvm.\n'));
      }

      // Uninstall the package
      console.log(chalk.blue('🗑️ Removing package...'));
      execSync('npm uninstall -g smartui-migration-tool', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });

      // Verify the uninstall
      console.log(chalk.blue('\n🔍 Verifying uninstallation...'));
      
      try {
        execSync('smartui-migrator --version', { 
          encoding: 'utf8',
          stdio: 'pipe'
        });
        
        console.log(chalk.yellow('\n⚠️ Uninstall completed, but command still available'));
        console.log(chalk.gray('   This may be due to caching or multiple installations'));
        console.log(chalk.cyan('\n💡 Try restarting your terminal or check your PATH'));
        
      } catch (error) {
        console.log(chalk.green('\n✅ Uninstall successful!'));
        console.log(chalk.white('   SmartUI Migration Tool has been removed from your system'));
      }

      // Show next steps
      console.log(chalk.cyan('\n📋 Next Steps:'));
      console.log(chalk.white('  • Your migrated projects remain unchanged'));
      console.log(chalk.white('  • SmartUI configurations are preserved'));
      console.log(chalk.white('  • You can reinstall anytime with: npm install -g smartui-migration-tool'));
      
      console.log(chalk.cyan('\n💡 Thank you for using SmartUI Migration Tool!'));
      console.log(chalk.gray('   Visit https://www.lambdatest.com/smart-ui for SmartUI documentation'));

    } catch (error) {
      console.error(chalk.red('\n❌ Uninstall failed:'));
      
      if (error instanceof Error) {
        if (error.message.includes('EACCES')) {
          console.error(chalk.red('   Permission denied. Try running with sudo or use a Node.js version manager.'));
          console.error(chalk.cyan('\n💡 Alternative: npm uninstall -g smartui-migration-tool'));
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
          console.error(chalk.red('   Network error. Check your internet connection.'));
          console.error(chalk.cyan('\n💡 Try again later or check npm registry status.'));
        } else {
          console.error(chalk.red(`   ${error.message}`));
        }
      } else {
        console.error(chalk.red('   Unknown error occurred'));
      }
      
      console.error(chalk.cyan('\n💡 For manual uninstall: npm uninstall -g smartui-migration-tool'));
      this.exit(1);
    }
  }
}
