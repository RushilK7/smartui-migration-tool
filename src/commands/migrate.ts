import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { InteractiveCLI } from '../cli';
import { Scanner } from '../modules/Scanner';
import { ConfigTransformer } from '../modules/ConfigTransformer';
import { CodeTransformer } from '../modules/CodeTransformer';
import { JavaCodeTransformer } from '../modules/JavaCodeTransformer';
import { PythonCodeTransformer } from '../modules/PythonCodeTransformer';
import { ExecutionTransformer } from '../modules/ExecutionTransformer';
import { StorybookTransformer } from '../modules/StorybookTransformer';
import { AnalysisReporter } from '../modules/AnalysisReporter';
import { ReportRenderer } from '../modules/ReportRenderer';
import { FileSelector } from '../modules/FileSelector';
import { Reporter } from '../modules/Reporter';
import { DetectionResult, FinalReportData, TransformationPreview } from '../types';
import { ChangePreviewer } from '../modules/ChangePreviewer';
import { TransformationManager } from '../modules/TransformationManager';
import { logger } from '../utils/Logger';
import path from 'path';

/**
 * Main migration command for the SmartUI Migration Tool
 * This is the primary entry point that orchestrates the entire migration process
 */
export default class Migrate extends Command {
  static override description = 'Migrate your visual testing suite to LambdaTest SmartUI';

  static override examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --project-path ./my-project',
    '<%= config.bin %> <%= command.id %> --dry-run',
    '<%= config.bin %> <%= command.id %> --preview-only',
    '<%= config.bin %> <%= command.id %> --confirm-each --backup',
  ];

  static override flags = {
    'project-path': Flags.string({
      char: 'p',
      description: 'Path to the project to migrate',
      default: process.cwd(),
    }),
    'dry-run': Flags.boolean({
      char: 'd',
      description: 'Perform a dry run without making actual changes',
      default: false,
    }),
    'backup': Flags.boolean({
      char: 'b',
      description: 'Create backups before making changes',
      default: true,
    }),
    'verbose': Flags.boolean({
      char: 'v',
      description: 'Enable verbose output',
      default: false,
    }),
    'yes': Flags.boolean({
      char: 'y',
      description: 'Skip interactive prompts and proceed automatically (for CI/CD)',
      default: false,
    }),
    'preview-only': Flags.boolean({
      description: 'Show preview of changes without applying them',
      default: false,
    }),
    'confirm-each': Flags.boolean({
      description: 'Ask for confirmation before transforming each file',
      default: false,
    }),
  };

  static override args = {
    framework: Args.string({
      description: 'Specific framework to migrate (percy, applitools, sauce-labs)',
      required: false,
    }),
  };

  public async run(): Promise<void> {
    const { args, flags } = await this.parse();

    try {
      // Initialize logger with verbose flag
      const verbose = flags['verbose'] as boolean;
      logger.setVerbose(verbose);
      
      if (verbose) {
        logger.verbose('SmartUI Migration Tool started in verbose mode');
        logger.verbose(`Project path: ${flags['project-path']}`);
        logger.verbose(`Dry run: ${flags['dry-run']}`);
        logger.verbose(`Auto confirm: ${flags['yes']}`);
      }

      // Initialize interactive CLI with automation flag and project path
      const isAutomated = flags['yes'] as boolean;
      const projectPath = path.resolve(flags['project-path'] as string);
      const interactiveCLI = new InteractiveCLI(isAutomated, projectPath);

      // Run the interactive workflow
      const shouldProceed = await interactiveCLI.runWorkflow();

      if (!shouldProceed) {
        // User chose to exit or there was an error
        this.exit(0);
        return;
      }

      // Show initial info
      InteractiveCLI.showInfo('Starting SmartUI Migration Tool...');
      InteractiveCLI.showInfo(`Project path: ${flags['project-path']}`);
      
      if (flags['dry-run']) {
        InteractiveCLI.showWarning('Running in dry-run mode - no changes will be made');
      }

      if (flags['backup']) {
        InteractiveCLI.showInfo('Backups will be created before making changes');
      }

      if (isAutomated) {
        InteractiveCLI.showInfo('🤖 Running in automated mode (CI/CD)');
      }

      // Show loading animation
      await InteractiveCLI.showSpinner('Initializing migration process...');

      // Initialize modules (projectPath already resolved above)
      const scanner = new Scanner(projectPath, verbose);
      const configTransformer = new ConfigTransformer(projectPath);
      const codeTransformer = new CodeTransformer(projectPath);
      const javaCodeTransformer = new JavaCodeTransformer(projectPath);
      const pythonCodeTransformer = new PythonCodeTransformer(projectPath);
      const executionTransformer = new ExecutionTransformer(projectPath);
      const storybookTransformer = new StorybookTransformer(projectPath);
      const reporter = new Reporter(projectPath);

      InteractiveCLI.showSuccess('Migration modules initialized');

      // Step 1: Scan the project with advanced detection
      InteractiveCLI.showInfo('Step 1: Scanning project for existing visual testing frameworks...');
      await InteractiveCLI.showSpinner('Intelligently analyzing project...');
      
      logger.verbose('Starting advanced project scan');
      const detectionResult: DetectionResult = await scanner.scan();
      logger.verbose(`Advanced scan completed - Platform: ${detectionResult.platform}, Framework: ${detectionResult.framework}, Language: ${detectionResult.language}`);
      InteractiveCLI.showSuccess('Project scan completed');

      // Display evidence-based analysis report
      this.displayEvidenceBasedAnalysis(detectionResult);

      // User confirmation after evidence display
      if (!isAutomated) {
        const inquirer = await import('inquirer');
        const question = {
          type: 'confirm' as const,
          name: 'proceed',
          message: '? Does this look correct?',
          default: true,
        };

        const answers = await inquirer.default.prompt([question]);

        if (!answers['proceed']) {
          InteractiveCLI.showInfo('Migration cancelled by user.');
          return;
        }
      }

      // Step 2: Generate pre-migration analysis report
      InteractiveCLI.showInfo('Step 2: Generating pre-migration analysis report...');
      await InteractiveCLI.showSpinner('Simulating migration and generating preview...');
      
      const analysisReporter = new AnalysisReporter(projectPath);
      const analysisResult = await analysisReporter.analyze(detectionResult);
      
      // Stop spinner and render the analysis report
      InteractiveCLI.showSuccess('Analysis completed');
      ReportRenderer.renderAnalysisReport(analysisResult);

      // Step 2.5: Advanced file selection
      InteractiveCLI.showInfo('Step 2.5: Advanced file selection...');
      
      // Prompt user for migration scope
      const migrationScope = await FileSelector.promptMigrationScope(analysisResult);
      
      let finalAnalysisResult = analysisResult;
      let selectedFiles: string[] = [];
      
      if (migrationScope === 'cancel') {
        InteractiveCLI.showInfo('Migration cancelled by user.');
        return;
      } else if (migrationScope === 'select') {
        // Prompt user to select specific files
        selectedFiles = await FileSelector.promptFileSelection(analysisResult);
        
        // Filter the analysis result to only include selected files
        finalAnalysisResult = FileSelector.filterAnalysisResult(analysisResult, selectedFiles);
        
        // Display selection summary
        FileSelector.displaySelectionSummary(selectedFiles, analysisResult);
      } else {
        // Use all files
        selectedFiles = analysisResult.changes
          .filter(change => change.type !== 'INFO')
          .map(change => change.filePath);
        
        InteractiveCLI.showInfo(`Proceeding with migration for all ${selectedFiles.length} files...`);
      }

      // Step 3: Generate transformation preview
      InteractiveCLI.showInfo('Step 3: Generating transformation preview...');
      await InteractiveCLI.showSpinner('Analyzing changes that will be made...');
      
      // Initialize change previewer with selected files
      const changePreviewer = new ChangePreviewer(projectPath, verbose, selectedFiles);
      
      // Generate comprehensive preview
      const transformationPreview: TransformationPreview = await changePreviewer.generatePreview(detectionResult);
      
      InteractiveCLI.showSuccess('Transformation preview generated');
      
      // Display the preview
      changePreviewer.displayPreview(transformationPreview);
      
      // Handle preview-only mode
      if (flags['preview-only']) {
        console.log(chalk.blue('\n🔍 Preview mode - no changes will be made'));
        console.log(chalk.white('Use --no-preview-only to apply the transformations'));
        return;
      }

      // Step 4: Execute transformation with user confirmation
      InteractiveCLI.showInfo('Step 4: Executing transformation...');
      
      // Initialize transformation manager with selected files
      const transformationManager = new TransformationManager(projectPath, verbose, selectedFiles);
      
      // Set transformation options
      const transformationOptions = {
        createBackup: flags['backup'] as boolean,
        confirmEachFile: flags['confirm-each'] as boolean,
        dryRun: flags['dry-run'] as boolean
      };
      
      // Execute the transformation
      const transformationResult = await transformationManager.executeTransformation(
        detectionResult,
        transformationPreview,
        transformationOptions
      );
      
      if (!transformationResult.success) {
        InteractiveCLI.showError('Transformation failed. Please check the errors above.');
        this.exit(1);
        return;
      }
      
      InteractiveCLI.showSuccess('Transformation completed successfully');

      // Step 5: Generate report
      InteractiveCLI.showInfo('Step 5: Generating migration report...');
      await InteractiveCLI.showSpinner('Creating comprehensive migration report...');
      
      // Create final report data using transformation results
      const finalReportData: FinalReportData = {
        detectionResult,
        filesCreated: transformationResult.filesCreated,
        filesModified: transformationResult.filesModified,
        snapshotCount: transformationPreview.totalSnapshots,
        warnings: transformationResult.warnings.map(warning => ({ message: warning })),
        migrationStartTime: new Date(), // This should be set at the beginning of migration
        migrationEndTime: new Date(),
        totalFilesProcessed: transformationResult.filesCreated.length + transformationResult.filesModified.length
      };
      
      // Generate the report
      const reportContent = await reporter.generateReport(finalReportData);
      
      // Write the report to MIGRATION_REPORT.md
      const reportPath = path.join(projectPath, 'MIGRATION_REPORT.md');
      await fs.writeFile(reportPath, reportContent, 'utf-8');
      
      InteractiveCLI.showSuccess('Migration report generated');

      // Final success message
      console.log('\n' + '='.repeat(60));
      InteractiveCLI.showSuccess('Migration completed successfully!');
      console.log('='.repeat(60) + '\n');

      console.log(chalk.green('✅ Migration complete! A detailed summary has been saved to MIGRATION_REPORT.md\n'));
      
      // Show backup information if backups were created
      if (transformationResult.filesBackedUp.length > 0) {
        console.log(chalk.yellow('🛡️  Backup Information:'));
        console.log(chalk.white(`  • ${transformationResult.filesBackedUp.length} files backed up to .smartui-backup/`));
        console.log(chalk.white('  • Original files are safely preserved'));
        console.log(chalk.white('  • You can restore files if needed\n'));
      }
      
      if (verbose) {
        logger.verbose('Migration completed successfully');
        logger.verbose(`Total files processed: ${transformationResult.filesCreated.length + transformationResult.filesModified.length}`);
        logger.verbose(`Snapshots migrated: ${transformationPreview.totalSnapshots}`);
        logger.verbose(`Warnings generated: ${transformationResult.warnings.length}`);
        logger.verbose(`Files backed up: ${transformationResult.filesBackedUp.length}`);
      }
      
      InteractiveCLI.showInfo('Next steps:');
      console.log(chalk.white('  1. Review the MIGRATION_REPORT.md file for detailed information'));
      console.log(chalk.white('  2. Install SmartUI dependencies: npm install @lambdatest/smartui-cli'));
      console.log(chalk.white('  3. Configure your SmartUI credentials'));
      console.log(chalk.white('  4. Run your migrated tests with SmartUI'));
      console.log(chalk.white('  5. Check the SmartUI Dashboard for test results'));
      
      if (transformationResult.filesBackedUp.length > 0) {
        console.log(chalk.white('  6. Keep the .smartui-backup/ folder until you\'re confident everything works'));
      }
      
      console.log(chalk.white('\n💡 For POC purposes, you can test the migration on a copy of your project first.'));
      console.log(chalk.white('   Once confident, run it on your real project directory.\n'));

    } catch (error) {
      InteractiveCLI.showError(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.exit(1);
    }
  }

  /**
   * Display evidence-based analysis report from the advanced scanner
   */
  private displayEvidenceBasedAnalysis(detectionResult: DetectionResult): void {
    const { platform, framework, language, files, evidence } = detectionResult;
    
    // Main detection summary with evidence
    console.log(chalk.green('✅ Analysis Complete!'));
    console.log('');
    
    // Platform detection evidence
    const platformEvidence = evidence.platform;
    console.log(chalk.white(`- Detected Platform: ${chalk.bold(platform)} ${chalk.gray(`(Evidence: Found '${platformEvidence.match}' in ${platformEvidence.source})`)}`));
    
    // Framework detection evidence
    const frameworkEvidence = evidence.framework;
    const frameworkFileCount = frameworkEvidence.files.length;
    console.log(chalk.white(`- Detected Framework: ${chalk.bold(framework)} ${chalk.gray(`(Evidence: Matched signatures in ${frameworkFileCount} files)`)}`));
    
    console.log('');
    
    // Show source files that were found
    if (files.source.length > 0) {
      console.log(chalk.white.bold(`Our deep content search found visual testing patterns in the following ${files.source.length} files:`));
      files.source.forEach((file: string) => {
        console.log(chalk.dim(`  - ${file}`));
      });
      console.log('');
    }
    
    // Show additional file counts
    if (files.config.length > 0) {
      console.log(chalk.blue(`📁 Configuration files: ${files.config.length} found`));
    }
    
    if (files.ci.length > 0) {
      console.log(chalk.blue(`🔄 CI/CD files: ${files.ci.length} found`));
    }
    
    console.log(''); // Add spacing
  }
}
