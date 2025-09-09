import { Command, Flags, Args } from '@oclif/core';
import chalk from 'chalk';
import { promises as fs } from 'fs';
import { CLIUtils } from '../utils/CLIUtils';
import { Scanner } from '../modules/ScannerNew';
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
import { DetectionResult, FinalReportData, TransformationPreview, MultiDetectionResult, DetectedPlatform, DetectedFramework, DetectedLanguage } from '../types';
import { ChangePreviewer } from '../modules/ChangePreviewer';
import { TransformationManager } from '../modules/TransformationManager';
import { MultiDetectionSelector } from '../modules/MultiDetectionSelector';
import { ReportGenerator } from '../modules/ReportGenerator';
import { SmartUIConfigGenerator } from '../modules/SmartUIConfigGenerator';
import { EnvironmentManager } from '../modules/EnvironmentManager';
import { PackageInstaller } from '../modules/PackageInstaller';
import { MigrationValidator } from '../modules/MigrationValidator';
import { RollbackManager } from '../modules/RollbackManager';
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
    '<%= config.bin %> <%= command.id %> --interactive',
    '<%= config.bin %> <%= command.id %> --project-path ./my-project',
    '<%= config.bin %> <%= command.id %> --dry-run',
    '<%= config.bin %> <%= command.id %> --preview-only',
    '<%= config.bin %> <%= command.id %> --confirm-each --backup',
    '<%= config.bin %> <%= command.id %> --interactive --project-path ./my-project',
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
    'interactive': Flags.boolean({
      char: 'i',
      description: 'Interactive mode - select flags through menu system',
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
    'auto': Flags.boolean({
      char: 'a',
      description: 'Fully automated mode - no user interaction required (migrate all files automatically)',
      default: false,
    }),
    'report-format': Flags.string({
      char: 'r',
      description: 'Generate comprehensive migration report in specified format (json, markdown, html)',
      options: ['json', 'markdown', 'html'],
      default: 'markdown',
    }),
    'report-output': Flags.string({
      description: 'Output path for migration report (default: migration-report-{timestamp}.{format})',
    }),
    'auto-setup': Flags.boolean({
      char: 's',
      description: 'Automatically setup SmartUI configuration and install packages',
      default: false,
    }),
    'ci-type': Flags.string({
      description: 'Generate CI/CD configuration for specified type (github-actions, jenkins, gitlab-ci, azure-devops, circleci, travis-ci)',
      options: ['github-actions', 'jenkins', 'gitlab-ci', 'azure-devops', 'circleci', 'travis-ci'],
    }),
    'validate-setup': Flags.boolean({
      char: 'v',
      description: 'Validate SmartUI setup after migration',
      default: false,
    }),
    'create-checkpoint': Flags.boolean({
      description: 'Create rollback checkpoint before migration',
      default: true,
    }),
    'run-tests': Flags.boolean({
      description: 'Run migrated tests after migration',
      default: false,
    }),
    'test-connectivity': Flags.boolean({
      description: 'Test SmartUI connectivity after migration',
      default: false,
    }),
    'rollback': Flags.string({
      description: 'Rollback to specific checkpoint (use checkpoint ID)',
    }),
    'list-checkpoints': Flags.boolean({
      description: 'List available rollback checkpoints',
      default: false,
    }),
    'complete': Flags.boolean({
      char: 'c',
      description: 'Complete migration with all features enabled (auto-setup, validation, testing, connectivity)',
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
      // Handle rollback and checkpoint operations
      if (flags['rollback']) {
        await this.handleRollback(flags['project-path'] || process.cwd(), flags['rollback'], flags['verbose'] || false);
        return;
      }

      if (flags['list-checkpoints']) {
        await this.handleListCheckpoints(flags['project-path'] || process.cwd(), flags['verbose'] || false);
        return;
      }

      // Check if complete mode is requested
      const completeMode = flags['complete'] as boolean;
      const autoMode = flags['auto'] as boolean;
      const interactiveMode = flags['interactive'] as boolean;
      let finalFlags = flags;
      
      if (completeMode) {
        // Set all features for complete migration
        finalFlags = {
          ...flags,
          'auto': true,
          'backup': true,
          'dry-run': false,
          'verbose': true,
          'yes': true,
          'preview-only': false,
          'confirm-each': false,
          'auto-setup': true,
          'validate-setup': true,
          'run-tests': true,
          'test-connectivity': true,
          'create-checkpoint': true,
          'report-format': 'html'
        };
        
        console.log(chalk.blue.bold('\n🚀 COMPLETE MIGRATION MODE ENABLED'));
        console.log(chalk.gray('='.repeat(60)));
        console.log(chalk.white('Full-featured migration with all capabilities:'));
        console.log(chalk.white('  • Auto-detection and transformation'));
        console.log(chalk.white('  • SmartUI configuration generation'));
        console.log(chalk.white('  • Package installation'));
        console.log(chalk.white('  • CI/CD setup'));
        console.log(chalk.white('  • Validation and testing'));
        console.log(chalk.white('  • Connectivity testing'));
        console.log(chalk.white('  • Rollback checkpoint creation'));
        console.log(chalk.white('  • Comprehensive reporting'));
        console.log(chalk.gray('='.repeat(60)));
      } else if (autoMode) {
        // Set smart defaults for fully automated mode
        finalFlags = {
          ...flags,
          'backup': true,
          'dry-run': false,
          'verbose': flags['verbose'] || false, // Keep verbose if explicitly set
          'yes': true,
          'preview-only': false,
          'confirm-each': false,
        };
        console.log(chalk.green.bold('\n🤖 AUTO MODE ENABLED'));
        console.log(chalk.gray('='.repeat(50)));
        console.log(chalk.white('Fully automated migration with smart defaults:'));
        console.log(chalk.white('  • Backup: Enabled'));
        console.log(chalk.white('  • Dry run: Disabled'));
        console.log(chalk.white('  • Verbose: Disabled'));
        console.log(chalk.white('  • Auto confirm: Enabled'));
        console.log(chalk.white('  • Preview only: Disabled'));
        console.log(chalk.white('  • Confirm each file: Disabled'));
        console.log(chalk.gray('='.repeat(50)));
      } else if (interactiveMode) {
        finalFlags = await this.selectFlagsInteractively(flags);
      }

      // Initialize logger with verbose flag
      const verbose = finalFlags['verbose'] as boolean;
      logger.setVerbose(verbose);
      
      if (verbose) {
        logger.verbose('SmartUI Migration Tool started in verbose mode');
        logger.verbose(`Project path: ${finalFlags['project-path']}`);
        logger.verbose(`Dry run: ${finalFlags['dry-run']}`);
        logger.verbose(`Auto confirm: ${finalFlags['yes']}`);
        logger.verbose(`Backup: ${finalFlags['backup']}`);
        logger.verbose(`Auto mode: ${autoMode}`);
        logger.verbose(`Interactive mode: ${interactiveMode}`);
      }

      // Initialize interactive CLI with automation flag and project path
      const isAutomated = finalFlags['yes'] as boolean;
      const projectPath = path.resolve(finalFlags['project-path'] as string);
      // Show initial info
      CLIUtils.showInfo('Starting SmartUI Migration Tool...');
      CLIUtils.showInfo(`Project path: ${finalFlags['project-path']}`);
      
      if (finalFlags['dry-run']) {
        CLIUtils.showWarning('Running in dry-run mode - no changes will be made');
      }

      if (finalFlags['backup']) {
        CLIUtils.showInfo('Backups will be created before making changes');
      }

      if (isAutomated) {
        CLIUtils.showInfo('🤖 Running in automated mode (CI/CD)');
      }

      // Show loading animation
      await CLIUtils.showSpinner('Initializing migration process...');

      // Initialize modules (projectPath already resolved above)
      const scanner = new Scanner(projectPath);
      const configTransformer = new ConfigTransformer(projectPath);
      const codeTransformer = new CodeTransformer(projectPath);
      const javaCodeTransformer = new JavaCodeTransformer(projectPath);
      const pythonCodeTransformer = new PythonCodeTransformer(projectPath);
      const executionTransformer = new ExecutionTransformer(projectPath);
      const storybookTransformer = new StorybookTransformer(projectPath);
      const reporter = new Reporter(projectPath);

      CLIUtils.showSuccess('Migration modules initialized');

      // Step 1: Scan the project with advanced detection
      CLIUtils.showInfo('Step 1: Scanning project for existing visual testing frameworks...');
      await CLIUtils.showSpinner('Intelligently analyzing project...');
      
      logger.verbose('Starting advanced project scan');
      let detectionResult: DetectionResult;
      
      try {
        // Try normal scan first
        detectionResult = await scanner.scan();
        logger.verbose(`Advanced scan completed - Platform: ${detectionResult.platform}, Framework: ${detectionResult.framework}, Language: ${detectionResult.language}`);
      CLIUtils.showSuccess('Project scan completed');
      } catch (error: any) {
        // If multiple platforms detected, use multi-detection
        if (error.name === 'MultiplePlatformsDetectedError') {
          logger.verbose('Multiple platforms detected, switching to multi-detection mode');
          CLIUtils.showInfo('Multiple visual testing setups detected. Let me show you what was found...');
          
          // For now, we'll use the first detected platform
          // TODO: Implement proper multi-detection selection
          detectionResult = await scanner.scan();
          
          // Confirm the detected platform
          const inquirer = await import('inquirer');
          const { confirmed } = await inquirer.default.prompt([
            {
              type: 'confirm',
              name: 'confirmed',
              message: `Detected ${detectionResult.platform} ${detectionResult.framework} project in ${detectionResult.language}. Proceed with migration?`,
              default: true
            }
          ]);
          
          if (!confirmed) {
            CLIUtils.showWarning('Migration cancelled by user');
            this.exit(0);
            return;
          }
          
          CLIUtils.showSuccess('Selection confirmed, proceeding with migration');
        } else {
          throw error;
        }
      }

      // Skip interactive workflow if we already have detection result from multi-detection
      // The runWorkflow is mainly for scanning, which we've already done
      let shouldProceed = true;
      
      if (!isAutomated) {
        // Show a simple confirmation prompt instead of full workflow
        const inquirer = await import('inquirer');
        const answer = await inquirer.default.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'Do you want to proceed with the migration?',
            default: true
          }
        ]);
        shouldProceed = answer.proceed;
      }

      if (!shouldProceed) {
        // User chose to exit
        this.exit(0);
        return;
      }

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
          CLIUtils.showInfo('Migration cancelled by user.');
          return;
        }
      }

      // Step 2: Generate pre-migration analysis report
      CLIUtils.showInfo('Step 2: Generating pre-migration analysis report...');
      await CLIUtils.showSpinner('Simulating migration and generating preview...');
      
      const analysisReporter = new AnalysisReporter(projectPath);
      const analysisResult = await analysisReporter.analyze(detectionResult);
      
      // Stop spinner and render the analysis report
      CLIUtils.showSuccess('Analysis completed');
      ReportRenderer.renderAnalysisReport(analysisResult);

      // Step 2.5: Advanced file selection
      CLIUtils.showInfo('Step 2.5: Advanced file selection...');
      
      let finalAnalysisResult = analysisResult;
      let selectedFiles: string[] = [];
      
      if (autoMode) {
        // Auto mode: migrate all files automatically
        CLIUtils.showInfo('Auto mode: Migrating all files automatically');
        selectedFiles = analysisResult.changes
          .filter(change => change.type !== 'INFO')
          .map(change => change.filePath);
        finalAnalysisResult = analysisResult;
        CLIUtils.showInfo(`Proceeding with migration for all ${selectedFiles.length} files...`);
      } else {
        // Interactive mode: prompt user for migration scope
        const migrationScope = await FileSelector.promptMigrationScope(analysisResult);
      
      if (migrationScope === 'cancel') {
        CLIUtils.showInfo('Migration cancelled by user.');
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
        
        CLIUtils.showInfo(`Proceeding with migration for all ${selectedFiles.length} files...`);
        }
      }

      // Step 3: Generate transformation preview
      CLIUtils.showInfo('Step 3: Generating transformation preview...');
      await CLIUtils.showSpinner('Analyzing changes that will be made...');
      
      // Initialize change previewer with selected files
      const changePreviewer = new ChangePreviewer(projectPath, verbose, selectedFiles);
      
      // Generate comprehensive preview
      const transformationPreview: TransformationPreview = await changePreviewer.generatePreview(detectionResult);
      
      CLIUtils.showSuccess('Transformation preview generated');
      
      // Display the preview
      changePreviewer.displayPreview(transformationPreview);
      
      // Handle preview-only mode
      if (finalFlags['preview-only']) {
        console.log(chalk.blue('\n🔍 Preview mode - no changes will be made'));
        console.log(chalk.white('Use --no-preview-only to apply the transformations'));
        return;
      }

      // Step 4: Execute transformation with user confirmation
      CLIUtils.showInfo('Step 4: Executing transformation...');
      
      // Initialize transformation manager with selected files
      const transformationManager = new TransformationManager(projectPath, verbose, selectedFiles);
      
      // Set transformation options
      const transformationOptions = {
        createBackup: finalFlags['backup'] as boolean,
        confirmEachFile: finalFlags['confirm-each'] as boolean,
        dryRun: finalFlags['dry-run'] as boolean,
        yes: finalFlags['yes'] as boolean
      };
      
      // Execute the transformation
      const transformationResult = await transformationManager.executeTransformation(
        detectionResult,
        transformationPreview,
        transformationOptions
      );
      
      if (!transformationResult.success) {
        CLIUtils.showError('Transformation failed. Please check the errors above.');
        this.exit(1);
        return;
      }
      
      CLIUtils.showSuccess('Transformation completed successfully');

      // Step 5: Generate report
      CLIUtils.showInfo('Step 5: Generating migration report...');
      await CLIUtils.showSpinner('Creating comprehensive migration report...');
      
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
      
      CLIUtils.showSuccess('Migration report generated');

      // Generate comprehensive migration report if requested
      if (flags['report-format']) {
        try {
          const transformationManager = new TransformationManager(projectPath, verbose, selectedFiles);
          const changeTracker = transformationManager.getChangeTracker();
          transformationManager.completeMigration();
          
          const migrationReport = changeTracker.generateReport(
            projectPath,
            detectionResult.platform,
            detectionResult.framework,
            detectionResult.language
          );
          
          const reportGenerator = new ReportGenerator(changeTracker, verbose);
          const reportOptions = {
            format: flags['report-format'] as 'json' | 'markdown' | 'html',
            outputPath: flags['report-output'],
            includeDetails: true,
            includeCodeDiffs: true,
            includeRecommendations: true,
            includeValidationResults: true
          };
          
          const reportResult = await reportGenerator.generateReport(migrationReport, reportOptions);
          
          if (reportResult.success) {
            console.log(chalk.green(`📊 Comprehensive migration report generated: ${reportResult.outputPath}`));
            console.log(chalk.gray(`   Format: ${reportResult.format.toUpperCase()}, Size: ${Math.round(reportResult.size / 1024)}KB`));
          } else {
            console.log(chalk.yellow(`⚠️  Failed to generate comprehensive report: ${reportResult.error}`));
          }
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Failed to generate comprehensive report: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      // Create checkpoint before migration if requested
      let checkpointId: string | undefined;
      if (flags['create-checkpoint']) {
        try {
          console.log(chalk.blue('💾 Creating rollback checkpoint...'));
          const rollbackManager = new RollbackManager(projectPath, verbose);
          const checkpoint = await rollbackManager.createCheckpoint(
            projectPath,
            `Migration checkpoint - ${detectionResult.platform} to SmartUI`,
            {
              platform: detectionResult.platform,
              framework: detectionResult.framework,
              language: detectionResult.language
            }
          );
          checkpointId = checkpoint.id;
          console.log(chalk.green(`  ✅ Checkpoint created: ${checkpointId}`));
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Failed to create checkpoint: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      // Zero-configuration SmartUI setup
      if (finalFlags['auto-setup']) {
        try {
          console.log(chalk.blue('\n🔧 Setting up SmartUI configuration...'));
          
          // Generate SmartUI configuration
          const configGenerator = new SmartUIConfigGenerator(projectPath, verbose);
          const smartUIConfig = await configGenerator.generateSmartUIConfig(
            'web', // Default project type
            detectionResult.framework,
            detectionResult.language
          );
          
          console.log(chalk.green('  ✅ Generated .smartui.json configuration'));
          
          // Install SmartUI packages
          console.log(chalk.blue('📦 Installing SmartUI packages...'));
          const packageInstaller = new PackageInstaller(projectPath, verbose);
          const installResult = await packageInstaller.installSmartUIPackages(
            detectionResult.framework,
            detectionResult.language
          );
          
          if (installResult.success) {
            console.log(chalk.green(`  ✅ Installed ${installResult.packagesInstalled.length} SmartUI packages`));
            if (installResult.packagesInstalled.length > 0) {
              console.log(chalk.gray(`     Packages: ${installResult.packagesInstalled.join(', ')}`));
            }
          } else {
            console.log(chalk.yellow(`  ⚠️  Package installation had issues: ${installResult.errors.join(', ')}`));
          }
          
          // Generate environment scripts
          console.log(chalk.blue('📝 Generating environment setup scripts...'));
          await configGenerator.generateEnvironmentScripts();
          console.log(chalk.green('  ✅ Generated environment setup scripts'));
          
          // Setup CI/CD if requested
          if (finalFlags['ci-type']) {
            console.log(chalk.blue(`🔧 Setting up ${finalFlags['ci-type']} configuration...`));
            const envManager = new EnvironmentManager(projectPath, verbose);
            await envManager.setupCIEnvironment(finalFlags['ci-type']);
            console.log(chalk.green(`  ✅ Generated ${finalFlags['ci-type']} configuration`));
          }
          
          // Validate setup if requested
          if (finalFlags['validate-setup']) {
            console.log(chalk.blue('🔍 Validating SmartUI setup...'));
            const validation = await configGenerator.validateConfiguration();
            if (validation.valid) {
              console.log(chalk.green('  ✅ SmartUI setup validation passed'));
            } else {
              console.log(chalk.yellow(`  ⚠️  Validation warnings: ${validation.warnings.join(', ')}`));
              if (validation.errors.length > 0) {
                console.log(chalk.red(`  ❌ Validation errors: ${validation.errors.join(', ')}`));
              }
            }
          }
          
        } catch (error) {
          console.log(chalk.yellow(`⚠️  SmartUI setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      // Phase 4: Validation and Testing
      if (finalFlags['validate-setup'] || finalFlags['run-tests'] || finalFlags['test-connectivity']) {
        try {
          console.log(chalk.blue('\n🔍 Running post-migration validation and testing...'));
          
          const validator = new MigrationValidator(projectPath, verbose);
          
          // Run comprehensive validation
          if (finalFlags['validate-setup']) {
            console.log(chalk.blue('📋 Validating migration...'));
            const validation = await validator.validateTransformation();
            
            if (validation.valid) {
              console.log(chalk.green(`  ✅ Migration validation passed (Score: ${validation.score}/100)`));
            } else {
              console.log(chalk.yellow(`  ⚠️  Migration validation completed with issues (Score: ${validation.score}/100)`));
              
              if (validation.errors.length > 0) {
                console.log(chalk.red(`  ❌ Errors (${validation.errors.length}):`));
                validation.errors.forEach(error => {
                  console.log(chalk.red(`     - ${error.message}`));
                  if (error.suggestion) {
                    console.log(chalk.gray(`       Suggestion: ${error.suggestion}`));
                  }
                });
              }
              
              if (validation.warnings.length > 0) {
                console.log(chalk.yellow(`  ⚠️  Warnings (${validation.warnings.length}):`));
                validation.warnings.forEach(warning => {
                  console.log(chalk.yellow(`     - ${warning.message}`));
                  if (warning.suggestion) {
                    console.log(chalk.gray(`       Suggestion: ${warning.suggestion}`));
                  }
                });
              }
            }
          }
          
          // Test SmartUI connectivity
          if (finalFlags['test-connectivity']) {
            console.log(chalk.blue('🌐 Testing SmartUI connectivity...'));
            const connectivity = await validator.testSmartUIConnectivity();
            
            if (connectivity.connected) {
              console.log(chalk.green(`  ✅ SmartUI connectivity test passed (${connectivity.latency}ms)`));
            } else {
              console.log(chalk.red(`  ❌ SmartUI connectivity test failed: ${connectivity.error}`));
            }
          }
          
          // Run migrated tests
          if (finalFlags['run-tests']) {
            console.log(chalk.blue('🧪 Running migrated tests...'));
            const testResult = await validator.runMigratedTests();
            
            if (testResult.success) {
              console.log(chalk.green(`  ✅ Tests passed: ${testResult.testsPassed}/${testResult.testsRun}`));
              if (testResult.coverage) {
                console.log(chalk.gray(`     Coverage: ${testResult.coverage.lines}% lines, ${testResult.coverage.functions}% functions`));
              }
            } else {
              console.log(chalk.red(`  ❌ Tests failed: ${testResult.testsFailed}/${testResult.testsRun}`));
              if (testResult.errors.length > 0) {
                testResult.errors.forEach(error => console.log(chalk.red(`     - ${error}`)));
              }
            }
          }
          
        } catch (error) {
          console.log(chalk.yellow(`⚠️  Validation and testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      // Final success message
      console.log('\n' + '='.repeat(60));
      CLIUtils.showSuccess('Migration completed successfully!');
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
      
      CLIUtils.showInfo('Next steps:');
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
      CLIUtils.showError(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  /**
   * Interactive flag selection method
   * Allows users to select flags through a menu system
   */
  private async selectFlagsInteractively(initialFlags: any): Promise<any> {
    const inquirer = await import('inquirer');
    
    console.log(chalk.bold.blue('\n🎛️  INTERACTIVE FLAG SELECTION'));
    console.log(chalk.gray('='.repeat(50)));
    console.log(chalk.white('Select your preferred options for the migration:'));
    console.log(chalk.gray('='.repeat(50)));

    const questions = [
      {
        type: 'confirm',
        name: 'backup',
        message: '🛡️  Create backups before making changes?',
        default: initialFlags['backup'] as boolean,
      },
      {
        type: 'confirm',
        name: 'dryRun',
        message: '🔍 Perform a dry run (no actual changes)?',
        default: initialFlags['dry-run'] as boolean,
      },
      {
        type: 'confirm',
        name: 'verbose',
        message: '📝 Enable verbose output for debugging?',
        default: initialFlags['verbose'] as boolean,
      },
      {
        type: 'confirm',
        name: 'yes',
        message: '🤖 Skip interactive prompts (automated mode for CI/CD)?',
        default: initialFlags['yes'] as boolean,
      },
      {
        type: 'confirm',
        name: 'previewOnly',
        message: '👀 Show preview only (no transformation)?',
        default: initialFlags['preview-only'] as boolean,
      },
      {
        type: 'confirm',
        name: 'confirmEach',
        message: '✅ Ask for confirmation before transforming each file?',
        default: initialFlags['confirm-each'] as boolean,
      }
    ];

    const answers = await (inquirer.default as any).prompt(questions);

    // Create final flags object
    const finalFlags = {
      ...initialFlags,
      'backup': answers.backup,
      'dry-run': answers.dryRun,
      'verbose': answers.verbose,
      'yes': answers.yes,
      'preview-only': answers.previewOnly,
      'confirm-each': answers.confirmEach,
    };

    // Show selected options
    console.log(chalk.bold.green('\n✅ Selected Options:'));
    console.log(chalk.gray('='.repeat(30)));
    console.log(chalk.white(`🛡️  Backup: ${answers.backup ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.white(`🔍 Dry Run: ${answers.dryRun ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.white(`📝 Verbose: ${answers.verbose ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.white(`🤖 Automated: ${answers.yes ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.white(`👀 Preview Only: ${answers.previewOnly ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.white(`✅ Confirm Each: ${answers.confirmEach ? '✅ Yes' : '❌ No'}`));
    console.log(chalk.gray('='.repeat(30)));

    // Validate flag combinations
    this.validateFlagCombinations(finalFlags);

    return finalFlags;
  }

  /**
   * Validate flag combinations and show warnings
   */
  private validateFlagCombinations(flags: any): void {
    const warnings: string[] = [];

    // Check for conflicting flags
    if (flags['dry-run'] && flags['preview-only']) {
      warnings.push('Both --dry-run and --preview-only are enabled. Preview-only will take precedence.');
    }

    if (flags['yes'] && flags['confirm-each']) {
      warnings.push('Automated mode (--yes) is enabled but --confirm-each is also set. Confirm-each will be ignored.');
    }

    if (flags['dry-run'] && !flags['backup']) {
      warnings.push('Dry run is enabled but backup is disabled. Consider enabling backup for safety.');
    }

    if (flags['preview-only'] && flags['backup']) {
      warnings.push('Preview-only mode is enabled but backup is also set. Backup will not be needed.');
    }

    // Show warnings if any
    if (warnings.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Flag Combination Warnings:'));
      warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
      console.log('');
    }

    // Show recommendations
    const recommendations: string[] = [];

    if (!flags['backup'] && !flags['dry-run'] && !flags['preview-only']) {
      recommendations.push('Consider enabling backup for safety before making changes.');
    }

    if (!flags['verbose'] && !flags['yes']) {
      recommendations.push('Enable verbose mode for detailed output during migration.');
    }

    if (flags['yes'] && !flags['backup']) {
      recommendations.push('Automated mode is enabled. Consider enabling backup for safety.');
    }

    if (recommendations.length > 0) {
      console.log(chalk.bold.cyan('\n💡 Recommendations:'));
      recommendations.forEach(rec => {
        console.log(chalk.cyan(`  • ${rec}`));
      });
      console.log('');
    }
  }

  /**
   * Convert user selection to DetectionResult format
   */
  private convertSelectionToDetectionResult(
    selection: { platform?: any; framework?: any; language?: any },
    multiResult: MultiDetectionResult
  ): DetectionResult {
    // Default values
    let platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual' = 'Percy';
    let framework: 'Cypress' | 'Selenium' | 'Playwright' | 'Storybook' | 'Robot Framework' | 'Appium' = 'Cypress';
    let language: 'JavaScript/TypeScript' | 'Java' | 'Python' = 'JavaScript/TypeScript';
    let testType: 'e2e' | 'storybook' | 'appium' = 'e2e';

    // Use selected platform if available
    if (selection.platform) {
      platform = selection.platform.name;
      if (selection.platform.frameworks.length > 0) {
        framework = selection.platform.frameworks[0] as any;
      }
      if (selection.platform.languages.length > 0) {
        language = selection.platform.languages[0] as any;
      }
    }

    // Use selected framework if available
    if (selection.framework) {
      framework = selection.framework.name;
      if (selection.framework.platforms.length > 0) {
        platform = selection.framework.platforms[0] as any;
      }
      if (selection.framework.languages.length > 0) {
        language = selection.framework.languages[0] as any;
      }
    }

    // Use selected language if available
    if (selection.language) {
      language = selection.language.name;
      if (selection.language.platforms.length > 0) {
        platform = selection.language.platforms[0] as any;
      }
      if (selection.language.frameworks.length > 0) {
        framework = selection.language.frameworks[0] as any;
      }
    }

    // Determine test type based on framework
    if (framework === 'Storybook') {
      testType = 'storybook';
    } else if (framework === 'Appium') {
      testType = 'appium';
            } else {
      testType = 'e2e';
    }

    return {
      platform,
      framework,
      language,
      testType,
      files: {
        config: [],
        source: [],
        ci: [],
        packageManager: []
      },
      evidence: {
        platform: {
          source: 'user selection',
          match: 'selected from multiple detections'
        },
        framework: {
          files: [],
          signatures: []
        }
      }
    };
  }

  /**
   * Handle rollback to a specific checkpoint
   */
  private async handleRollback(projectPath: string, checkpointId: string, verbose: boolean): Promise<void> {
    try {
      console.log(chalk.blue(`🔄 Rolling back to checkpoint: ${checkpointId}`));
      
      const rollbackManager = new RollbackManager(projectPath, verbose);
      const result = await rollbackManager.rollbackToCheckpoint(checkpointId);
      
      if (result.success) {
        console.log(chalk.green(`✅ Rollback successful: ${result.message}`));
        console.log(chalk.gray(`   Restored ${result.restoredFiles.length} files`));
        console.log(chalk.gray(`   Duration: ${result.duration}ms`));
        
        if (result.errors.length > 0) {
          console.log(chalk.yellow(`⚠️  Rollback completed with ${result.errors.length} errors:`));
          result.errors.forEach(error => console.log(chalk.red(`   - ${error}`)));
        }
      } else {
        console.log(chalk.red(`❌ Rollback failed: ${result.message}`));
        if (result.errors.length > 0) {
          result.errors.forEach(error => console.log(chalk.red(`   - ${error}`)));
        }
        this.exit(1);
      }
    } catch (error) {
      console.log(chalk.red(`❌ Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      this.exit(1);
    }
  }

  /**
   * Handle listing available checkpoints
   */
  private async handleListCheckpoints(projectPath: string, verbose: boolean): Promise<void> {
    try {
      console.log(chalk.blue('📋 Available checkpoints:'));
      
      const rollbackManager = new RollbackManager(projectPath, verbose);
      const checkpoints = await rollbackManager.listCheckpoints();
      
      if (checkpoints.length === 0) {
        console.log(chalk.yellow('   No checkpoints found'));
        return;
      }
      
      checkpoints.forEach((checkpoint, index) => {
        const timestamp = checkpoint.timestamp.toLocaleString();
        const filesCount = checkpoint.metadata.filesCount;
        const totalSize = Math.round(checkpoint.metadata.totalSize / 1024);
        
        console.log(chalk.white(`   ${index + 1}. ${checkpoint.id}`));
        console.log(chalk.gray(`      Description: ${checkpoint.description}`));
        console.log(chalk.gray(`      Created: ${timestamp}`));
        console.log(chalk.gray(`      Files: ${filesCount}, Size: ${totalSize}KB`));
        console.log(chalk.gray(`      Platform: ${checkpoint.metadata.platform}, Framework: ${checkpoint.metadata.framework}`));
        console.log('');
      });
      
      console.log(chalk.gray(`Use --rollback <checkpoint-id> to rollback to a specific checkpoint`));

    } catch (error) {
      console.log(chalk.red(`❌ Failed to list checkpoints: ${error instanceof Error ? error.message : 'Unknown error'}`));
      this.exit(1);
    }
  }
}
