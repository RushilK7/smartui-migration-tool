import { Command, Flags } from '@oclif/core';
import chalk from 'chalk';
import { ASCIILogos } from '../utils/ascii-logos';

export default class Help extends Command {
  static override description = 'Show detailed help and documentation';

  static override flags = {
    help: Flags.help({ char: 'h' }),
    command: Flags.string({
      char: 'c',
      description: 'Show help for a specific command',
    }),
  };

  async run(): Promise<void> {
    const { flags } = await this.parse(Help);
    
    // Display bold ASCII logo
    console.log(chalk.cyan(ASCIILogos.getBoldLogo()));
    
    if (flags.command) {
      // Show help for specific command
      console.log(chalk.cyan.bold(`📚 Help for: smartui-migrator ${flags.command}\n`));
      
      switch (flags.command.toLowerCase()) {
        case 'init':
          this.showInitHelp();
          break;
        case 'version':
          this.showVersionHelp();
          break;
        case 'update':
          this.showUpdateHelp();
          break;
        case 'uninstall':
          this.showUninstallHelp();
          break;
        case 'migrate':
          this.showMigrateHelp();
          break;
        default:
          console.log(chalk.red(`❌ Unknown command: ${flags.command}`));
          console.log(chalk.cyan('\n💡 Available commands: init, version, update, uninstall, migrate'));
      }
    } else {
      // Show general help
      this.showGeneralHelp();
    }
  }

  private showGeneralHelp(): void {
    console.log(chalk.cyan.bold('\n📚 SmartUI Migration Tool - Help & Documentation\n'));
    
    console.log(chalk.white('SmartUI Migration Tool is the most comprehensive automation platform'));
    console.log(chalk.white('for migrating visual testing frameworks from Percy, Applitools, and'));
    console.log(chalk.white('Sauce Labs to SmartUI.\n'));

    console.log(chalk.green.bold('🚀 AVAILABLE COMMANDS:\n'));
    
    console.log(chalk.cyan('  smartui-migrator'));
    console.log(chalk.gray('    Show SmartUI Migration Tool information and usage'));
    console.log(chalk.gray('    This is the default command when no arguments are provided\n'));

    console.log(chalk.cyan('  smartui-migrator init [path]'));
    console.log(chalk.gray('    Initialize automated migration in current or specified directory'));
    console.log(chalk.gray('    Examples:'));
    console.log(chalk.gray('      smartui-migrator init              # Current directory'));
    console.log(chalk.gray('      smartui-migrator init ./my-project # Specific directory'));
    console.log(chalk.gray('      smartui-migrator init --auto       # Fully automated mode\n'));

    console.log(chalk.cyan('  smartui-migrator help [command]'));
    console.log(chalk.gray('    Show detailed help and documentation'));
    console.log(chalk.gray('    Examples:'));
    console.log(chalk.gray('      smartui-migrator help              # General help'));
    console.log(chalk.gray('      smartui-migrator help init         # Help for init command\n'));

    console.log(chalk.cyan('  smartui-migrator version [--check]'));
    console.log(chalk.gray('    Show version information and check for updates'));
    console.log(chalk.gray('    Examples:'));
    console.log(chalk.gray('      smartui-migrator version           # Show current version'));
    console.log(chalk.gray('      smartui-migrator version --check   # Check for updates\n'));

    console.log(chalk.cyan('  smartui-migrator update [--force]'));
    console.log(chalk.gray('    Update to the latest version'));
    console.log(chalk.gray('    Examples:'));
    console.log(chalk.gray('      smartui-migrator update            # Update to latest'));
    console.log(chalk.gray('      smartui-migrator update --force    # Force update\n'));

    console.log(chalk.cyan('  smartui-migrator uninstall [--force]'));
    console.log(chalk.gray('    Remove SmartUI Migration Tool from your system'));
    console.log(chalk.gray('    Examples:'));
    console.log(chalk.gray('      smartui-migrator uninstall        # Interactive uninstall'));
    console.log(chalk.gray('      smartui-migrator uninstall --force # Skip confirmation\n'));

    console.log(chalk.green.bold('\n🔧 COMMON FLAGS:\n'));
    
    console.log(chalk.white('  --help, -h'));
    console.log(chalk.gray('    Show help for the current command\n'));

    console.log(chalk.white('  --auto, -a'));
    console.log(chalk.gray('    Enable fully automated mode (no user interaction)\n'));

    console.log(chalk.white('  --dry-run, -d'));
    console.log(chalk.gray('    Preview changes without making modifications\n'));

    console.log(chalk.white('  --backup, -b'));
    console.log(chalk.gray('    Create backup before transformation (default: true)\n'));

    console.log(chalk.white('  --verbose, -v'));
    console.log(chalk.gray('    Show detailed logs and progress\n'));

    console.log(chalk.white('  --force, -f'));
    console.log(chalk.gray('    Skip confirmation prompts\n'));

    console.log(chalk.green.bold('\n📖 QUICK START GUIDE:\n'));
    
    console.log(chalk.white('  1. Navigate to your project directory'));
    console.log(chalk.white('  2. Run: ') + chalk.cyan('smartui-migrator init'));
    console.log(chalk.white('  3. Follow the automated migration process'));
    console.log(chalk.white('  4. Your tests are now SmartUI-ready!\n'));

    console.log(chalk.green.bold('\n🆘 SUPPORT & DOCUMENTATION:\n'));
    
    console.log(chalk.white('  📚 Documentation: ') + chalk.blue('https://github.com/RushilK7/smartui-migration-tool'));
    console.log(chalk.white('  🐛 Issues & Bugs: ') + chalk.blue('https://github.com/RushilK7/smartui-migration-tool/issues'));
    console.log(chalk.white('  🌐 SmartUI Docs: ') + chalk.blue('https://www.lambdatest.com/smart-ui'));
    console.log(chalk.white('  📦 NPM Package: ') + chalk.blue('https://www.npmjs.com/package/smartui-migration-tool\n'));

    const packageJson = require('../../package.json');
    console.log(chalk.gray(`SmartUI Migration Tool v${packageJson.version} | Made with ❤️ by LambdaTest\n`));
  }

  private showInitHelp(): void {
    console.log(chalk.cyan.bold('🚀 INIT COMMAND\n'));
    
    console.log(chalk.white('Initialize automated migration in current or specified directory.\n'));
    
    console.log(chalk.green.bold('USAGE:\n'));
    console.log(chalk.white('  smartui-migrator init [path] [flags]\n'));
    
    console.log(chalk.green.bold('ARGUMENTS:\n'));
    console.log(chalk.white('  path    Path to the project directory (default: current directory)\n'));
    
    console.log(chalk.green.bold('FLAGS:\n'));
    console.log(chalk.white('  --auto, -a        Fully automated mode - no user interaction required'));
    console.log(chalk.white('  --dry-run, -d     Preview changes without making modifications'));
    console.log(chalk.white('  --backup, -b      Create backup before transformation (default: true)'));
    console.log(chalk.white('  --verbose, -v     Show detailed logs and progress'));
    console.log(chalk.white('  --help, -h        Show help for this command\n'));
    
    console.log(chalk.green.bold('EXAMPLES:\n'));
    console.log(chalk.white('  smartui-migrator init                    # Current directory'));
    console.log(chalk.white('  smartui-migrator init ./my-project       # Specific directory'));
    console.log(chalk.white('  smartui-migrator init --auto             # Fully automated'));
    console.log(chalk.white('  smartui-migrator init --dry-run          # Preview only'));
    console.log(chalk.white('  smartui-migrator init --verbose          # Detailed logs\n'));
  }

  private showVersionHelp(): void {
    console.log(chalk.cyan.bold('📋 VERSION COMMAND\n'));
    
    console.log(chalk.white('Show version information and check for updates.\n'));
    
    console.log(chalk.green.bold('USAGE:\n'));
    console.log(chalk.white('  smartui-migrator version [flags]\n'));
    
    console.log(chalk.green.bold('FLAGS:\n'));
    console.log(chalk.white('  --check, -c       Check for available updates'));
    console.log(chalk.white('  --help, -h        Show help for this command\n'));
    
    console.log(chalk.green.bold('EXAMPLES:\n'));
    console.log(chalk.white('  smartui-migrator version           # Show current version'));
    console.log(chalk.white('  smartui-migrator version --check   # Check for updates\n'));
  }

  private showUpdateHelp(): void {
    console.log(chalk.cyan.bold('🔄 UPDATE COMMAND\n'));
    
    console.log(chalk.white('Update SmartUI Migration Tool to the latest version.\n'));
    
    console.log(chalk.green.bold('USAGE:\n'));
    console.log(chalk.white('  smartui-migrator update [flags]\n'));
    
    console.log(chalk.green.bold('FLAGS:\n'));
    console.log(chalk.white('  --force, -f       Force update even if already on latest version'));
    console.log(chalk.white('  --check, -c       Only check for updates without installing'));
    console.log(chalk.white('  --help, -h        Show help for this command\n'));
    
    console.log(chalk.green.bold('EXAMPLES:\n'));
    console.log(chalk.white('  smartui-migrator update            # Update to latest'));
    console.log(chalk.white('  smartui-migrator update --force    # Force update'));
    console.log(chalk.white('  smartui-migrator update --check    # Check only\n'));
  }

  private showUninstallHelp(): void {
    console.log(chalk.cyan.bold('🗑️ UNINSTALL COMMAND\n'));
    
    console.log(chalk.white('Remove SmartUI Migration Tool from your system.\n'));
    
    console.log(chalk.green.bold('USAGE:\n'));
    console.log(chalk.white('  smartui-migrator uninstall [flags]\n'));
    
    console.log(chalk.green.bold('FLAGS:\n'));
    console.log(chalk.white('  --force, -f       Skip confirmation prompt'));
    console.log(chalk.white('  --help, -h        Show help for this command\n'));
    
    console.log(chalk.green.bold('EXAMPLES:\n'));
    console.log(chalk.white('  smartui-migrator uninstall        # Interactive uninstall'));
    console.log(chalk.white('  smartui-migrator uninstall --force # Skip confirmation\n'));
  }

  private showMigrateHelp(): void {
    console.log(chalk.cyan.bold('🔄 MIGRATE COMMAND\n'));
    
    console.log(chalk.white('Legacy command for advanced migration options.\n'));
    console.log(chalk.yellow('💡 For most users, use: smartui-migrator init\n'));
    
    console.log(chalk.green.bold('USAGE:\n'));
    console.log(chalk.white('  smartui-migrator migrate [path] [flags]\n'));
    
    console.log(chalk.green.bold('FLAGS:\n'));
    console.log(chalk.white('  --auto, -a        Fully automated mode'));
    console.log(chalk.white('  --dry-run, -d     Preview changes without making modifications'));
    console.log(chalk.white('  --backup, -b      Create backup before transformation'));
    console.log(chalk.white('  --verbose, -v     Show detailed logs and progress'));
    console.log(chalk.white('  --help, -h        Show help for this command\n'));
  }
}
