import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import figlet from 'figlet';

export default class Welcome extends Command {
  static override description = 'Show welcome screen with SmartUI Migration Tool information';

  static override flags = {
    help: Flags.help({ char: 'h' }),
  };

  async run(): Promise<void> {
    // Clear screen and show ASCII logo
    console.clear();
    
    // ASCII Art Logo
    console.log(chalk.cyan(figlet.textSync('SmartUI', { 
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })));
    
    console.log(chalk.cyan(figlet.textSync('Migration Tool', { 
      font: 'ANSI Shadow',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    })));

    console.log(chalk.yellow('\n🚀 Automated Visual Testing Migration Platform'));
    console.log(chalk.gray('Transform your Percy, Applitools, and Sauce Labs tests to SmartUI\n'));

    // Main description
    console.log(chalk.white.bold('Welcome to SmartUI Migration Tool!'));
    console.log(chalk.gray('The most comprehensive automation platform for migrating visual testing frameworks.\n'));

    // Recommended commands
    console.log(chalk.green.bold('📋 RECOMMENDED COMMANDS:\n'));
    
    console.log(chalk.cyan('  smartui-migrator init'));
    console.log(chalk.gray('    └─ Start automated migration in current directory'));
    console.log(chalk.gray('    └─ Detects and transforms Percy/Applitools/Sauce Labs to SmartUI'));
    console.log(chalk.gray('    └─ Zero-intervention migration for most projects\n'));

    console.log(chalk.cyan('  smartui-migrator init <path>'));
    console.log(chalk.gray('    └─ Start automated migration in specified directory'));
    console.log(chalk.gray('    └─ Example: smartui-migrator init ./my-project\n'));

    console.log(chalk.cyan('  smartui-migrator help'));
    console.log(chalk.gray('    └─ Show detailed help and all available commands'));
    console.log(chalk.gray('    └─ Get comprehensive documentation\n'));

    console.log(chalk.cyan('  smartui-migrator version'));
    console.log(chalk.gray('    └─ Check current version and update information'));
    console.log(chalk.gray('    └─ Verify you have the latest features\n'));

    console.log(chalk.cyan('  smartui-migrator update'));
    console.log(chalk.gray('    └─ Automatically update to the latest version'));
    console.log(chalk.gray('    └─ Get new features and improvements\n'));

    console.log(chalk.cyan('  smartui-migrator uninstall'));
    console.log(chalk.gray('    └─ Remove SmartUI Migration Tool from your system'));
    console.log(chalk.gray('    └─ Clean uninstallation with confirmation\n'));

    // Features overview
    console.log(chalk.green.bold('\n✨ KEY FEATURES:\n'));
    
    console.log(chalk.white('  🔍 Intelligent Detection'));
    console.log(chalk.gray('    • Automatically detects Percy, Applitools, Sauce Labs projects'));
    console.log(chalk.gray('    • Supports Cypress, Playwright, Selenium, Puppeteer, WebdriverIO'));
    console.log(chalk.gray('    • Advanced framework signature recognition\n'));

    console.log(chalk.white('  🔄 Complete Transformation'));
    console.log(chalk.gray('    • Package.json dependencies and scripts'));
    console.log(chalk.gray('    • CI/CD pipeline configurations'));
    console.log(chalk.gray('    • Environment variables and secrets'));
    console.log(chalk.gray('    • Code imports and function calls\n'));

    console.log(chalk.white('  🛡️ Safe & Reliable'));
    console.log(chalk.gray('    • Automatic backup creation'));
    console.log(chalk.gray('    • Dry-run mode for testing'));
    console.log(chalk.gray('    • Comprehensive error handling'));
    console.log(chalk.gray('    • Rollback capabilities\n'));

    console.log(chalk.white('  🚀 Zero-Intervention'));
    console.log(chalk.gray('    • 95% automation for most projects'));
    console.log(chalk.gray('    • Smart defaults and intelligent choices'));
    console.log(chalk.gray('    • Minimal user interaction required\n'));

    // Quick start
    console.log(chalk.green.bold('\n🚀 QUICK START:\n'));
    console.log(chalk.white('  1. Navigate to your project directory'));
    console.log(chalk.white('  2. Run: ') + chalk.cyan('smartui-migrator init'));
    console.log(chalk.white('  3. Follow the automated migration process'));
    console.log(chalk.white('  4. Your tests are now SmartUI-ready!\n'));

    // Support information
    console.log(chalk.green.bold('\n🆘 SUPPORT & DOCUMENTATION:\n'));
    console.log(chalk.white('  📚 Documentation: ') + chalk.blue('https://github.com/RushilK7/smartui-migration-tool'));
    console.log(chalk.white('  🐛 Issues & Bugs: ') + chalk.blue('https://github.com/RushilK7/smartui-migration-tool/issues'));
    console.log(chalk.white('  🌐 SmartUI Docs: ') + chalk.blue('https://www.lambdatest.com/smart-ui'));
    console.log(chalk.white('  📦 NPM Package: ') + chalk.blue('https://www.npmjs.com/package/smartui-migration-tool\n'));

    // Version info
    const packageJson = require('../../package.json');
    console.log(chalk.gray(`SmartUI Migration Tool v${packageJson.version} | Made with ❤️ by LambdaTest\n`));
  }
}
