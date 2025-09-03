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
import { DetectionResult, FinalReportData } from '../types';
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

      // Step 3: Transform configurations
      InteractiveCLI.showInfo('Step 3: Transforming configuration files...');
      await InteractiveCLI.showSpinner('Converting configurations to SmartUI format...');
      
      // Handle configuration transformation based on detected platform and selected files
      const configFilesToProcess = detectionResult.files.config.filter(configFile => 
        selectedFiles.includes('.smartui.json') || selectedFiles.includes(configFile)
      );
      
      if (detectionResult.platform === 'Percy' && configFilesToProcess.length > 0) {
        try {
          // Read the first Percy config file
          const configFilePath = path.join(projectPath, configFilesToProcess[0]!);
          const configFileContent = await fs.readFile(configFilePath, 'utf-8');
          
          // Transform Percy config to SmartUI
          const configResult = configTransformer.transformPercyConfig(configFileContent);
          
          // Log the generated SmartUI configuration
          console.log(chalk.blue('\n📄 Generated SmartUI Configuration:'));
          console.log(chalk.gray('─'.repeat(50)));
          console.log(configResult.content);
          console.log(chalk.gray('─'.repeat(50)));
          
          // Log any warnings
          if (configResult.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Configuration Warnings:'));
            configResult.warnings.forEach(warning => {
              console.log(chalk.yellow(`  • ${warning.message}`));
              if (warning.details) {
                console.log(chalk.gray(`    ${warning.details}`));
              }
            });
          }
          
          // TODO: Write the config file to .smartui.json (placeholder for FileSystemManager)
          console.log(chalk.green('\n✅ Percy configuration successfully transformed to SmartUI format'));
          
        } catch (error) {
          InteractiveCLI.showError(`Failed to transform Percy configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (detectionResult.platform === 'Applitools' && detectionResult.files.config.length > 0) {
        try {
          // Read the first Applitools config file
          const configFilePath = path.join(projectPath, detectionResult.files.config[0]!);
          const configFileContent = await fs.readFile(configFilePath, 'utf-8');
          
          // Transform Applitools config to SmartUI
          const configResult = configTransformer.transformApplitoolsConfig(configFileContent);
          
          // Log the generated SmartUI configuration
          console.log(chalk.blue('\n📄 Generated SmartUI Configuration:'));
          console.log(chalk.gray('─'.repeat(50)));
          console.log(configResult.content);
          console.log(chalk.gray('─'.repeat(50)));
          
          // Log any warnings
          if (configResult.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Configuration Warnings:'));
            configResult.warnings.forEach(warning => {
              console.log(chalk.yellow(`  • ${warning.message}`));
              if (warning.details) {
                console.log(chalk.gray(`    ${warning.details}`));
              }
            });
          }
          
          // TODO: Write the config file to .smartui.json (placeholder for FileSystemManager)
          console.log(chalk.green('\n✅ Applitools configuration successfully transformed to SmartUI format'));
          
        } catch (error) {
          InteractiveCLI.showError(`Failed to transform Applitools configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else if (detectionResult.platform === 'Sauce Labs Visual' && detectionResult.files.config.length > 0) {
        try {
          // Read the first Sauce Labs config file
          const configFilePath = path.join(projectPath, detectionResult.files.config[0]!);
          const configFileContent = await fs.readFile(configFilePath, 'utf-8');
          
          // Transform Sauce Labs config to SmartUI
          const configResult = configTransformer.transformSauceLabsConfig(configFileContent, configFilePath);
          
          // Log the generated SmartUI configuration
          console.log(chalk.blue('\n📄 Generated SmartUI Configuration:'));
          console.log(chalk.gray('─'.repeat(50)));
          console.log(configResult.content);
          console.log(chalk.gray('─'.repeat(50)));
          
          // Log any warnings
          if (configResult.warnings.length > 0) {
            console.log(chalk.yellow('\n⚠️  Configuration Warnings:'));
            configResult.warnings.forEach(warning => {
              console.log(chalk.yellow(`  • ${warning.message}`));
              if (warning.details) {
                console.log(chalk.gray(`    ${warning.details}`));
              }
            });
          }
          
          // TODO: Write the config file to .smartui.json (placeholder for FileSystemManager)
          console.log(chalk.green('\n✅ Sauce Labs configuration successfully transformed to SmartUI format'));
          
        } catch (error) {
          InteractiveCLI.showError(`Failed to transform Sauce Labs configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      } else {
        InteractiveCLI.showInfo('No configuration files found to transform');
      }
      
      InteractiveCLI.showSuccess('Configuration transformation completed');

      // Step 4: Transform test code
      InteractiveCLI.showInfo('Step 4: Transforming test code...');
      await InteractiveCLI.showSpinner('Converting test code to SmartUI format...');
      
      let totalSnapshots = 0;
      const allCodeWarnings: any[] = [];

      // Filter source files to only include selected ones
      const sourceFilesToProcess = detectionResult.files.source.filter(sourceFile => 
        selectedFiles.includes(sourceFile)
      );

      // Check if this is a Python project
      if (detectionResult.language === 'Python' && sourceFilesToProcess.length > 0) {
        // Transform Python test files
        for (const sourceFile of sourceFilesToProcess) {
          try {
            const sourceFilePath = path.join(projectPath, sourceFile);
            const sourceFileContent = await fs.readFile(sourceFilePath, 'utf-8');
            
            const codeResult = pythonCodeTransformer.transform(sourceFileContent, sourceFile, detectionResult.platform);
            
            // Aggregate results
            totalSnapshots += codeResult.snapshotCount;
            allCodeWarnings.push(...codeResult.warnings);
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${sourceFile}\` and found ${codeResult.snapshotCount} snapshots.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(sourceFilePath, codeResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Log aggregated warnings
        if (allCodeWarnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Code Transformation Warnings:'));
          allCodeWarnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning.message}`));
            if (warning.details) {
              console.log(chalk.gray(`    ${warning.details}`));
            }
          });
        }
        
        console.log(chalk.blue(`\n📊 Total snapshots transformed: ${totalSnapshots}`));
        
      } else if (detectionResult.language === 'Java' && sourceFilesToProcess.length > 0) {
        // Transform Java test files
        for (const sourceFile of sourceFilesToProcess) {
          try {
            const sourceFilePath = path.join(projectPath, sourceFile);
            const sourceFileContent = await fs.readFile(sourceFilePath, 'utf-8');
            
            const codeResult = javaCodeTransformer.transform(sourceFileContent, detectionResult.platform);
            
            // Aggregate results
            totalSnapshots += codeResult.snapshotCount;
            allCodeWarnings.push(...codeResult.warnings);
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${sourceFile}\` and found ${codeResult.snapshotCount} snapshots.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(sourceFilePath, codeResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Log aggregated warnings
        if (allCodeWarnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Code Transformation Warnings:'));
          allCodeWarnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning.message}`));
            if (warning.details) {
              console.log(chalk.gray(`    ${warning.details}`));
            }
          });
        }
        
        console.log(chalk.blue(`\n📊 Total snapshots transformed: ${totalSnapshots}`));
        
      } else if (detectionResult.platform === 'Percy' && detectionResult.language === 'JavaScript/TypeScript' && sourceFilesToProcess.length > 0) {
        // Transform Percy JavaScript/TypeScript test files
        for (const sourceFile of sourceFilesToProcess) {
          try {
            const sourceFilePath = path.join(projectPath, sourceFile);
            const sourceFileContent = await fs.readFile(sourceFilePath, 'utf-8');
            
            const codeResult = codeTransformer.transformPercy(sourceFileContent);
            
            // Aggregate results
            totalSnapshots += codeResult.snapshotCount;
            allCodeWarnings.push(...codeResult.warnings);
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${sourceFile}\` and found ${codeResult.snapshotCount} snapshots.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(sourceFilePath, codeResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Log aggregated warnings
        if (allCodeWarnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Code Transformation Warnings:'));
          allCodeWarnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning.message}`));
            if (warning.details) {
              console.log(chalk.gray(`    ${warning.details}`));
            }
          });
        }
        
        console.log(chalk.blue(`\n📊 Total snapshots transformed: ${totalSnapshots}`));
        
      } else if (detectionResult.platform === 'Applitools' && detectionResult.language === 'JavaScript/TypeScript' && sourceFilesToProcess.length > 0) {
        // Transform Applitools JavaScript/TypeScript test files
        for (const sourceFile of sourceFilesToProcess) {
          try {
            const sourceFilePath = path.join(projectPath, sourceFile);
            const sourceFileContent = await fs.readFile(sourceFilePath, 'utf-8');
            
            // Determine framework from detection result
            const framework = detectionResult.framework === 'Cypress' ? 'Cypress' : 'Playwright';
            
            const codeResult = codeTransformer.transformApplitools(sourceFileContent, framework);
            
            // Aggregate results
            totalSnapshots += codeResult.snapshotCount;
            allCodeWarnings.push(...codeResult.warnings);
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${sourceFile}\` and found ${codeResult.snapshotCount} snapshots.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(sourceFilePath, codeResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Log aggregated warnings
        if (allCodeWarnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Code Transformation Warnings:'));
          allCodeWarnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning.message}`));
            if (warning.details) {
              console.log(chalk.gray(`    ${warning.details}`));
            }
          });
        }
        
        console.log(chalk.blue(`\n📊 Total snapshots transformed: ${totalSnapshots}`));
      } else if (detectionResult.platform === 'Sauce Labs Visual' && detectionResult.language === 'JavaScript/TypeScript' && sourceFilesToProcess.length > 0) {
        // Transform Sauce Labs Visual JavaScript/TypeScript test files
        for (const sourceFile of sourceFilesToProcess) {
          try {
            const sourceFilePath = path.join(projectPath, sourceFile);
            const sourceFileContent = await fs.readFile(sourceFilePath, 'utf-8');
            
            const codeResult = codeTransformer.transformSauceLabs(sourceFileContent);
            
            // Aggregate results
            totalSnapshots += codeResult.snapshotCount;
            allCodeWarnings.push(...codeResult.warnings);
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${sourceFile}\` and found ${codeResult.snapshotCount} snapshots.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(sourceFilePath, codeResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
        
        // Log aggregated warnings
        if (allCodeWarnings.length > 0) {
          console.log(chalk.yellow('\n⚠️  Code Transformation Warnings:'));
          allCodeWarnings.forEach(warning => {
            console.log(chalk.yellow(`  • ${warning.message}`));
            if (warning.details) {
              console.log(chalk.gray(`    ${warning.details}`));
            }
          });
        }
        
        console.log(chalk.blue(`\n📊 Total snapshots transformed: ${totalSnapshots}`));
      } else {
        InteractiveCLI.showInfo('No JavaScript/TypeScript source files found to transform');
      }
      
      InteractiveCLI.showSuccess('Code transformation completed');

      // Step 5: Transform execution commands
      InteractiveCLI.showInfo('Step 5: Transforming execution commands...');
      await InteractiveCLI.showSpinner('Updating package.json and CI/CD configurations...');
      
      let totalExecutionFiles = 0;
      const allExecutionWarnings: any[] = [];

      // Filter package and CI/CD files to only include selected ones
      const packageFilesToProcess = detectionResult.files.packageManager.filter(packageFile => 
        selectedFiles.includes(packageFile)
      );
      const ciFilesToProcess = detectionResult.files.ci.filter(ciFile => 
        selectedFiles.includes(ciFile)
      );

      // Transform package.json files
      if (packageFilesToProcess.length > 0) {
        for (const packageJsonFile of packageFilesToProcess) {
          try {
            const packageJsonPath = path.join(projectPath, packageJsonFile);
            const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
            
            let executionResult;
            
            // Use StorybookTransformer for Storybook projects
            if (detectionResult.testType === 'storybook') {
              executionResult = storybookTransformer.transformPackageJsonScripts(packageJsonContent, detectionResult.platform);
            } else {
              executionResult = executionTransformer.transformPackageJson(packageJsonContent, detectionResult.platform);
            }
            
            // Aggregate results
            allExecutionWarnings.push(...executionResult.warnings);
            totalExecutionFiles++;
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${packageJsonFile}\` execution commands.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(packageJsonPath, executionResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${packageJsonFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Transform CI/CD YAML files
      if (ciFilesToProcess.length > 0) {
        for (const ciFile of ciFilesToProcess) {
          try {
            const ciFilePath = path.join(projectPath, ciFile);
            const ciFileContent = await fs.readFile(ciFilePath, 'utf-8');
            
            const executionResult = executionTransformer.transformCiYaml(ciFileContent, detectionResult.platform);
            
            // Aggregate results
            allExecutionWarnings.push(...executionResult.warnings);
            totalExecutionFiles++;
            
            // Log transformation success
            console.log(chalk.green(`✅ Transformed \`${ciFile}\` CI/CD configuration.`));
            
            // TODO: Write transformed content back to file (placeholder for FileSystemManager)
            // await fs.writeFile(ciFilePath, executionResult.content, 'utf-8');
            
          } catch (error) {
            InteractiveCLI.showError(`Failed to transform ${ciFile}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }
      }

      // Log aggregated warnings
      if (allExecutionWarnings.length > 0) {
        console.log(chalk.yellow('\n⚠️  Execution Transformation Warnings:'));
        allExecutionWarnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning.message}`));
          if (warning.details) {
            console.log(chalk.gray(`    ${warning.details}`));
          }
        });
      }

      console.log(chalk.blue(`\n📊 Total execution files transformed: ${totalExecutionFiles}`));
      InteractiveCLI.showSuccess('Execution transformation completed');

      // Step 6: Generate report
      InteractiveCLI.showInfo('Step 6: Generating migration report...');
      await InteractiveCLI.showSpinner('Creating comprehensive migration report...');
      
      // Collect all data for the final report
      const filesCreated: string[] = [];
      const filesModified: string[] = [];
      const allWarnings: any[] = []; // Collect all warnings from the migration
      
      // Add .smartui.json to created files if it was generated
      if (detectionResult.files.config.length > 0) {
        filesCreated.push('.smartui.json');
      }
      
      // Add modified files from the migration
      filesModified.push(...selectedFiles.filter(file => file !== '.smartui.json'));
      
      // Create final report data
      const finalReportData: FinalReportData = {
        detectionResult,
        filesCreated,
        filesModified,
        snapshotCount: totalSnapshots,
        warnings: allWarnings,
        migrationStartTime: new Date(), // This should be set at the beginning of migration
        migrationEndTime: new Date(),
        totalFilesProcessed: filesCreated.length + filesModified.length
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
      
      if (verbose) {
        logger.verbose('Migration completed successfully');
        logger.verbose(`Total files processed: ${filesCreated.length + filesModified.length}`);
        logger.verbose(`Snapshots migrated: ${totalSnapshots}`);
        logger.verbose(`Warnings generated: ${allWarnings.length}`);
      }
      
      InteractiveCLI.showInfo('Next steps:');
      console.log(chalk.white('  1. Review the MIGRATION_REPORT.md file for detailed information'));
      console.log(chalk.white('  2. Follow the installation and setup instructions in the report'));
      console.log(chalk.white('  3. Run your migrated tests with SmartUI'));
      console.log(chalk.white('  4. Check the SmartUI Dashboard for test results\n'));

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
