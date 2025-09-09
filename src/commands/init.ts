import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import path from 'path';
import { promises as fs } from 'fs';
import figlet from 'figlet';
import Migrate from './migrate';

export default class Init extends Command {
  static override description = 'Initialize automated migration in current or specified directory';

  static override examples = [
    '$ smartui-migrator init',
    '$ smartui-migrator init ./my-project',
    '$ smartui-migrator init --auto',
    '$ smartui-migrator init --dry-run',
  ];

  static override flags = {
    help: Flags.help({ char: 'h' }),
    auto: Flags.boolean({
      char: 'a',
      description: 'Fully automated mode - no user interaction required',
      default: false,
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Preview changes without making modifications',
      default: false,
    }),
    backup: Flags.boolean({
      char: 'b',
      description: 'Create backup before transformation',
      default: true,
    }),
    verbose: Flags.boolean({
      char: 'v',
      description: 'Show detailed logs and progress',
      default: false,
    }),
  };

  static override args = {
    path: Args.string({
      description: 'Path to the project directory to migrate',
      required: false,
      default: '.',
    }),
  };

  async run(): Promise<void> {
    const { args, flags } = await this.parse(Init);
    
    // Resolve the project path
    const projectPath = path.resolve(args.path);
    
    // Validate the path exists
    try {
      const stats = await fs.stat(projectPath);
      if (!stats.isDirectory()) {
        this.error(chalk.red(`❌ Path "${projectPath}" is not a directory`));
      }
    } catch (error) {
      this.error(chalk.red(`❌ Path "${projectPath}" does not exist`));
    }

    // Display ASCII logo
    console.log(chalk.cyan.bold(figlet.textSync('SmartUI', { 
      font: 'ANSI Shadow',
      horizontalLayout: 'fitted',
      verticalLayout: 'fitted'
    })));
    console.log(chalk.cyan.bold('Migration Tool - Init Mode\n'));
    console.log(chalk.white(`📁 Project Directory: ${chalk.green(projectPath)}`));
    
    if (flags.auto) {
      console.log(chalk.yellow('🤖 Mode: Fully Automated (Zero Intervention)'));
    } else {
      console.log(chalk.blue('👤 Mode: Interactive (Guided Migration)'));
    }
    
    if (flags['dry-run']) {
      console.log(chalk.magenta('🔍 Mode: Dry Run (Preview Only)'));
    }
    
    if (flags.backup) {
      console.log(chalk.green('🛡️ Backup: Enabled'));
    }
    
    if (flags.verbose) {
      console.log(chalk.gray('📝 Verbose: Enabled'));
    }
    
    console.log(chalk.gray('\n' + '─'.repeat(60) + '\n'));

    // Check if package.json exists
    const packageJsonPath = path.join(projectPath, 'package.json');
    try {
      await fs.access(packageJsonPath);
      console.log(chalk.green('✅ Found package.json - Ready for migration\n'));
    } catch (error) {
      console.log(chalk.yellow('⚠️ No package.json found - Limited migration capabilities\n'));
    }

    // Show what will be detected and transformed
    console.log(chalk.cyan.bold('🔍 What will be detected:'));
    console.log(chalk.white('  • Visual testing frameworks (Percy, Applitools, Sauce Labs)'));
    console.log(chalk.white('  • Test frameworks (Cypress, Playwright, Selenium, etc.)'));
    console.log(chalk.white('  • Configuration files and dependencies'));
    console.log(chalk.white('  • CI/CD pipeline configurations\n'));

    console.log(chalk.cyan.bold('🔄 What will be transformed:'));
    console.log(chalk.white('  • Package.json dependencies and scripts'));
    console.log(chalk.white('  • Code imports and function calls'));
    console.log(chalk.white('  • CI/CD YAML files and environment variables'));
    console.log(chalk.white('  • Configuration files\n'));

    // Start the migration process
    console.log(chalk.green.bold('🚀 Starting migration process...\n'));
    
    try {
      // Import migration modules directly
      console.log(chalk.cyan('🔍 Starting migration process...'));
      
      const { Scanner } = await import('../modules/ScannerNew');
      const { ChangePreviewer } = await import('../modules/ChangePreviewer');
      const { TransformationManager } = await import('../modules/TransformationManager');
      const { ReportGenerator } = await import('../modules/ReportGenerator');
      const { ChangeTracker } = await import('../modules/ChangeTracker');
      const { CLIUtils } = await import('../utils/CLIUtils');
      
      // Initialize modules
      const scanner = new Scanner(projectPath);
      const changePreviewer = new ChangePreviewer(projectPath, flags.verbose);
      const transformationManager = new TransformationManager(projectPath);
      const changeTracker = new ChangeTracker();
      const reportGenerator = new ReportGenerator(changeTracker);
      
      // Step 1: Scan project
      console.log(chalk.cyan('🔍 Scanning project for visual testing frameworks...'));
      const detectionResult = await scanner.scan();
      
      if (!detectionResult) {
        throw new Error('Could not detect a supported visual testing platform. Please run this tool from the root of your project.');
      }
      
      console.log(chalk.green(`✅ Detected: ${detectionResult.platform} ${detectionResult.framework} project in ${detectionResult.language}`));
      
      // Step 2: Generate preview
      console.log(chalk.cyan('\n📋 Generating transformation preview...'));
      const preview = await changePreviewer.generatePreview(detectionResult);
      
      // Step 3: Execute transformation
      console.log(chalk.cyan('\n🔄 Executing transformation...'));
      const transformationResult = await transformationManager.executeTransformation(
        detectionResult,
        preview,
        {
          dryRun: flags['dry-run'],
          createBackup: flags.backup,
          confirmEachFile: false,
          yes: flags.auto
        }
      );
      
      // Step 4: Generate report
      console.log(chalk.cyan('\n📊 Generating migration report...'));
      const reportData = {
        detectionResult,
        preview,
        transformationResult,
        projectPath,
        timestamp: new Date().toISOString(),
        summary: {
          totalFiles: transformationResult.filesModified.length,
          filesModified: transformationResult.filesModified.length,
          filesCreated: 0,
          filesDeleted: 0,
          snapshotsMigrated: 0, // Will be calculated from actual changes
          warnings: preview.codeChanges.reduce((sum, change) => sum + change.warnings.length, 0),
          errors: 0,
          duration: 0,
          dependenciesChanged: 0,
          scriptsChanged: 0,
          validationErrors: 0,
          validationWarnings: 0,
          environmentChanges: 0,
          migrationTime: 0,
          successRate: 100
        },
        fileChanges: [],
        dependencyChanges: [],
        scriptChanges: [],
        environmentChanges: [],
        codeChanges: preview.codeChanges,
        executionChanges: preview.executionChanges,
        configChanges: preview.configChanges,
        validationResults: [],
        recommendations: [],
        metadata: {
          toolVersion: '1.5.1',
          migrationType: 'init',
          timestamp: new Date().toISOString(),
          migrationDate: new Date(),
          projectPath: projectPath,
          platform: detectionResult.platform,
          framework: detectionResult.framework,
          language: detectionResult.language,
          totalChanges: transformationResult.filesModified.length
        }
      };
      
      await reportGenerator.generateReport(reportData, {
        format: 'markdown',
        includeDetails: true
      });
      
      console.log(chalk.green('\n✅ Migration completed successfully!'));
      console.log(chalk.cyan('💡 Check the generated migration report for details.'));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Migration failed:'));
      console.error(chalk.red(error instanceof Error ? error.message : 'Unknown error'));
      this.exit(1);
    }
  }
}
