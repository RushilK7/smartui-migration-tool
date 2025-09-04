import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { DetectionResult, ChangePreview, TransformationPreview } from '../types';
import { logger } from '../utils/Logger';
import { ProgressManager } from '../utils/ProgressManager';

export interface TransformationOptions {
  createBackup: boolean;
  confirmEachFile: boolean;
  dryRun: boolean;
}

export interface TransformationResult {
  success: boolean;
  filesCreated: string[];
  filesModified: string[];
  filesBackedUp: string[];
  errors: string[];
  warnings: string[];
}

export class TransformationManager {
  private projectPath: string;
  private verbose: boolean;
  private selectedFiles: string[];

  constructor(projectPath: string, verbose: boolean = false, selectedFiles: string[] = []) {
    this.projectPath = projectPath;
    this.verbose = verbose;
    this.selectedFiles = selectedFiles;
  }

  /**
   * Execute the transformation with user confirmation and backup options
   */
  async executeTransformation(
    detectionResult: DetectionResult,
    preview: TransformationPreview,
    options: TransformationOptions
  ): Promise<TransformationResult> {
    logger.verbose('Starting transformation execution...');
    
    const result: TransformationResult = {
      success: true,
      filesCreated: [],
      filesModified: [],
      filesBackedUp: [],
      errors: [],
      warnings: []
    };

    // Show backup recommendation
    this.showBackupRecommendation();

    // Get user confirmation
    if (!options.dryRun) {
      const confirmed = await this.getUserConfirmation(preview, options);
      if (!confirmed) {
        console.log(chalk.yellow('Transformation cancelled by user.'));
        return result;
      }
    }

    // Create backups if requested
    if (options.createBackup && !options.dryRun) {
      await this.createBackups(preview, result);
    }

    // Execute transformations
    try {
      // Create progress bar for transformation
      const totalFiles = preview.configChanges.length + preview.codeChanges.length + preview.executionChanges.length;
      const progress = ProgressManager.createTransformProgress(totalFiles, this.verbose);

      // Transform configurations
      progress.update(0, { title: 'Transforming configuration files' });
      await this.executeConfigTransformation(detectionResult, preview.configChanges, options, result);
      
      // Transform code
      progress.update(preview.configChanges.length, { title: 'Transforming code files' });
      await this.executeCodeTransformation(detectionResult, preview.codeChanges, options, result);
      
      // Transform execution files
      progress.update(preview.configChanges.length + preview.codeChanges.length, { title: 'Transforming execution files' });
      await this.executeExecutionTransformation(detectionResult, preview.executionChanges, options, result);
      
      progress.complete({ title: 'Transformation completed successfully' });
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Transformation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      logger.verbose(`Transformation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Show transformation summary
    this.showTransformationSummary(result);

    // Show current state of the code
    await this.showCurrentCodeState();

    return result;
  }

  /**
   * Show backup recommendation
   */
  private showBackupRecommendation(): void {
    console.log(chalk.yellow.bold('\n🛡️  BACKUP RECOMMENDATION'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.yellow('⚠️  IMPORTANT: Before proceeding with the transformation, we strongly recommend:'));
    console.log(chalk.white('   1. Creating a backup of your project directory'));
    console.log(chalk.white('   2. Committing your current changes to version control'));
    console.log(chalk.white('   3. Testing the transformation on a copy first'));
    console.log(chalk.gray('─'.repeat(50)));
    console.log(chalk.blue('💡 For POC purposes, consider running this on a test directory first.'));
    console.log(chalk.blue('   Once you\'re confident with the results, you can run it on your real project.'));
    console.log(chalk.gray('─'.repeat(50)));
  }

  /**
   * Get user confirmation for the transformation
   */
  private async getUserConfirmation(preview: TransformationPreview, options: TransformationOptions): Promise<boolean> {
    const inquirer = await import('inquirer');
    
    console.log(chalk.bold.blue('\n🤔 TRANSFORMATION CONFIRMATION'));
    console.log(chalk.gray('='.repeat(50)));

    // Show detailed summary
    console.log(chalk.white(`\nThe migration will:`));
    console.log(chalk.white(`  • Modify ${preview.totalFiles} files`));
    console.log(chalk.white(`  • Migrate ${preview.totalSnapshots} snapshots`));
    console.log(chalk.white(`  • Create ${preview.configChanges.filter(c => c.changeType === 'CREATE').length} new files`));
    console.log(chalk.white(`  • Modify ${preview.configChanges.filter(c => c.changeType === 'MODIFY').length + preview.codeChanges.length + preview.executionChanges.length} existing files`));

    if (preview.warnings.length > 0) {
      console.log(chalk.yellow(`  • ${preview.warnings.length} warnings to review`));
    }

    // Show detailed file breakdown
    console.log(chalk.bold('\n📋 File Breakdown:'));
    if (preview.configChanges.length > 0) {
      console.log(chalk.blue(`  Configuration files (${preview.configChanges.length}):`));
      preview.configChanges.forEach(change => {
        const icon = change.changeType === 'CREATE' ? '➕' : '✏️';
        console.log(chalk.blue(`    ${icon} ${change.filePath} (${change.changes.length} changes)`));
      });
    }
    
    if (preview.codeChanges.length > 0) {
      console.log(chalk.green(`  Code files (${preview.codeChanges.length}):`));
      preview.codeChanges.forEach(change => {
        console.log(chalk.green(`    ✏️  ${change.filePath} (${change.changes.length} changes)`));
      });
    }
    
    if (preview.executionChanges.length > 0) {
      console.log(chalk.magenta(`  Execution files (${preview.executionChanges.length}):`));
      preview.executionChanges.forEach(change => {
        console.log(chalk.magenta(`    ✏️  ${change.filePath} (${change.changes.length} changes)`));
      });
    }

    // Show backup recommendation
    if (!options.createBackup) {
      console.log(chalk.bold.yellow('\n⚠️  BACKUP RECOMMENDATION'));
      console.log(chalk.yellow('We strongly recommend creating backups before transformation.'));
      console.log(chalk.yellow('Use --backup flag to automatically create backups.'));
      console.log(chalk.yellow('This ensures you can restore your original files if needed.'));
    }

    // Show POC recommendation
    console.log(chalk.bold.cyan('\n💡 POC RECOMMENDATION'));
    console.log(chalk.cyan('For Proof of Concept (POC) purposes:'));
    console.log(chalk.cyan('  1. Test the migration on a copy of your project first'));
    console.log(chalk.cyan('  2. Verify the results in the copied directory'));
    console.log(chalk.cyan('  3. Once confident, run it on your real project directory'));
    console.log(chalk.cyan('  4. Always keep backups of your original files'));

    // Get confirmation with options
    const answer = await inquirer.default.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          {
            name: '✅ Proceed with transformation (recommended with --backup)',
            value: 'proceed'
          },
          {
            name: '📋 Show detailed changes for each file',
            value: 'detailed'
          },
          {
            name: '❌ Cancel transformation',
            value: 'cancel'
          }
        ],
        default: 'proceed'
      }
    ]);

    if (answer['action'] === 'detailed') {
      await this.showDetailedChanges(preview);
      return await this.getUserConfirmation(preview, options);
    }

    if (answer['action'] === 'cancel') {
      return false;
    }

    // Final confirmation
    const finalAnswer = await inquirer.default.prompt([
      {
        type: 'confirm',
        name: 'proceed',
        message: 'Are you absolutely sure you want to proceed with the transformation?',
        default: false
      }
    ]);

    if (!finalAnswer['proceed']) {
      return false;
    }

    // File-by-file confirmation if requested
    if (options.confirmEachFile) {
      const allChanges = [...preview.configChanges, ...preview.codeChanges, ...preview.executionChanges];
      
      for (const change of allChanges) {
        const fileQuestion = {
          type: 'confirm' as const,
          name: 'proceed',
          message: `Transform ${change.filePath}? (${change.changeType}, ${change.changes.length} changes)`,
          default: true,
        };

        const fileAnswer = await inquirer.default.prompt([fileQuestion]);
        
        if (!fileAnswer['proceed']) {
          console.log(chalk.yellow(`Skipping ${change.filePath}`));
          continue;
        }
      }
    }

    return true;
  }

  /**
   * Show detailed changes for each file
   */
  private async showDetailedChanges(preview: TransformationPreview): Promise<void> {
    console.log(chalk.bold.blue('\n📋 DETAILED CHANGES'));
    console.log(chalk.gray('='.repeat(50)));

    const allChanges = [
      ...preview.configChanges.map(c => ({ ...c, type: 'Configuration' })),
      ...preview.codeChanges.map(c => ({ ...c, type: 'Code' })),
      ...preview.executionChanges.map(c => ({ ...c, type: 'Execution' }))
    ];

    for (const change of allChanges) {
      console.log(chalk.bold(`\n📄 ${change.filePath} (${change.type})`));
      console.log(chalk.gray(`Change Type: ${change.changeType}`));
      console.log(chalk.gray(`Total Changes: ${change.changes.length}`));
      
      if (change.changes.length > 0) {
        console.log(chalk.gray('\nChanges:'));
        change.changes.forEach((changeDetail, index) => {
          const lineNum = changeDetail.lineNumber;
          const changeTypeIcon = changeDetail.changeType === 'ADD' ? '+' : 
                                changeDetail.changeType === 'DELETE' ? '-' : '~';
          const changeColor = changeDetail.changeType === 'ADD' ? chalk.green :
                             changeDetail.changeType === 'DELETE' ? chalk.red : chalk.yellow;
          
          console.log(chalk.gray(`  ${index + 1}. Line ${lineNum}: ${changeTypeIcon} ${changeDetail.description}`));
          
          // Show before/after for modifications
          if (changeDetail.changeType === 'MODIFY') {
            if (changeDetail.originalLine) {
              console.log(chalk.red(`     - ${changeDetail.originalLine}`));
            }
            if (changeDetail.newLine) {
              console.log(chalk.green(`     + ${changeDetail.newLine}`));
            }
          } else if (changeDetail.changeType === 'ADD' && changeDetail.newLine) {
            console.log(chalk.green(`     + ${changeDetail.newLine}`));
          } else if (changeDetail.changeType === 'DELETE' && changeDetail.originalLine) {
            console.log(chalk.red(`     - ${changeDetail.originalLine}`));
          }
        });
      }
      
      if (change.warnings.length > 0) {
        console.log(chalk.yellow('\nWarnings:'));
        change.warnings.forEach(warning => {
          console.log(chalk.yellow(`  • ${warning}`));
        });
      }
    }

    console.log(chalk.gray('\n' + '='.repeat(50)));
  }

  /**
   * Create backups of files that will be modified
   */
  private async createBackups(preview: TransformationPreview, result: TransformationResult): Promise<void> {
    console.log(chalk.blue('\n📦 Creating backups...'));
    
    const allChanges = [...preview.configChanges, ...preview.codeChanges, ...preview.executionChanges];
    const backupDir = path.join(this.projectPath, '.smartui-backup');
    
    try {
      await fs.mkdir(backupDir, { recursive: true });
      
      for (const change of allChanges) {
        if (change.changeType === 'MODIFY' && change.originalContent) {
          const backupPath = path.join(backupDir, `${change.filePath}.backup`);
          const backupDirPath = path.dirname(backupPath);
          
          await fs.mkdir(backupDirPath, { recursive: true });
          await fs.writeFile(backupPath, change.originalContent, 'utf-8');
          
          result.filesBackedUp.push(change.filePath);
          console.log(chalk.green(`  ✅ Backed up: ${change.filePath}`));
        }
      }
      
      console.log(chalk.green(`\n✅ Created ${result.filesBackedUp.length} backup files in .smartui-backup/`));
      
    } catch (error) {
      const errorMsg = `Failed to create backups: ${error instanceof Error ? error.message : 'Unknown error'}`;
      result.warnings.push(errorMsg);
      console.log(chalk.yellow(`⚠️  ${errorMsg}`));
    }
  }

  /**
   * Execute configuration transformations
   */
  private async executeConfigTransformation(
    detectionResult: DetectionResult,
    configChanges: ChangePreview[],
    options: TransformationOptions,
    result: TransformationResult
  ): Promise<void> {
    // Filter changes by selected files
    const changesToProcess = this.selectedFiles.length > 0 
      ? configChanges.filter(change => this.selectedFiles.includes(change.filePath) || this.selectedFiles.includes('.smartui.json'))
      : configChanges;
      
    if (changesToProcess.length === 0) return;

    console.log(chalk.blue('\n📁 Transforming configuration files...'));

    // Create progress bar for individual file processing
    const fileProgress = ProgressManager.createFileProgress(changesToProcess.length, this.verbose);

    for (let i = 0; i < changesToProcess.length; i++) {
      const change = changesToProcess[i];
      if (!change) continue;
      
      fileProgress.update(i, { title: `Processing ${change.filePath}` });
      try {
        if (options.dryRun) {
          console.log(chalk.gray(`  [DRY RUN] Would ${change.changeType.toLowerCase()} ${change.filePath}`));
          continue;
        }

        const filePath = path.join(this.projectPath, change.filePath);
        const fileDir = path.dirname(filePath);
        
        await fs.mkdir(fileDir, { recursive: true });
        await fs.writeFile(filePath, change.newContent, 'utf-8');

        if (change.changeType === 'CREATE') {
          result.filesCreated.push(change.filePath);
        } else {
          result.filesModified.push(change.filePath);
        }

        console.log(chalk.green(`  ✅ ${change.changeType === 'CREATE' ? 'Created' : 'Modified'}: ${change.filePath}`));
        
      } catch (error) {
        const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.log(chalk.red(`  ❌ ${errorMsg}`));
      }
    }
    
    fileProgress.complete({ title: 'Configuration files processed' });
  }

  /**
   * Execute code transformations
   */
  private async executeCodeTransformation(
    detectionResult: DetectionResult,
    codeChanges: ChangePreview[],
    options: TransformationOptions,
    result: TransformationResult
  ): Promise<void> {
    // Filter changes by selected files
    const changesToProcess = this.selectedFiles.length > 0 
      ? codeChanges.filter(change => this.selectedFiles.includes(change.filePath))
      : codeChanges;
      
    if (changesToProcess.length === 0) return;

    console.log(chalk.green('\n💻 Transforming code files...'));

    // Create progress bar for individual file processing
    const fileProgress = ProgressManager.createFileProgress(changesToProcess.length, this.verbose);

    for (let i = 0; i < changesToProcess.length; i++) {
      const change = changesToProcess[i];
      if (!change) continue;
      
      fileProgress.update(i, { title: `Processing ${change.filePath}` });
      try {
        if (options.dryRun) {
          console.log(chalk.gray(`  [DRY RUN] Would modify ${change.filePath} (${change.changes.length} changes)`));
          continue;
        }

        const filePath = path.join(this.projectPath, change.filePath);
        await fs.writeFile(filePath, change.newContent, 'utf-8');

        result.filesModified.push(change.filePath);
        console.log(chalk.green(`  ✅ Modified: ${change.filePath} (${change.changes.length} changes)`));
        
      } catch (error) {
        const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.log(chalk.red(`  ❌ ${errorMsg}`));
      }
    }
    
    fileProgress.complete({ title: 'Code files processed' });
  }

  /**
   * Execute execution file transformations
   */
  private async executeExecutionTransformation(
    detectionResult: DetectionResult,
    executionChanges: ChangePreview[],
    options: TransformationOptions,
    result: TransformationResult
  ): Promise<void> {
    // Filter changes by selected files
    const changesToProcess = this.selectedFiles.length > 0 
      ? executionChanges.filter(change => this.selectedFiles.includes(change.filePath))
      : executionChanges;
      
    if (changesToProcess.length === 0) return;

    console.log(chalk.magenta('\n⚙️  Transforming execution files...'));

    // Create progress bar for individual file processing
    const fileProgress = ProgressManager.createFileProgress(changesToProcess.length, this.verbose);

    for (let i = 0; i < changesToProcess.length; i++) {
      const change = changesToProcess[i];
      if (!change) continue;
      
      fileProgress.update(i, { title: `Processing ${change.filePath}` });
      try {
        if (options.dryRun) {
          console.log(chalk.gray(`  [DRY RUN] Would modify ${change.filePath} (${change.changes.length} changes)`));
          continue;
        }

        const filePath = path.join(this.projectPath, change.filePath);
        await fs.writeFile(filePath, change.newContent, 'utf-8');

        result.filesModified.push(change.filePath);
        console.log(chalk.green(`  ✅ Modified: ${change.filePath} (${change.changes.length} changes)`));
        
      } catch (error) {
        const errorMsg = `Failed to transform ${change?.filePath || 'unknown file'}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.log(chalk.red(`  ❌ ${errorMsg}`));
      }
    }
    
    fileProgress.complete({ title: 'Execution files processed' });
  }

  /**
   * Show transformation summary
   */
  private showTransformationSummary(result: TransformationResult): void {
    console.log(chalk.bold.blue('\n📊 TRANSFORMATION SUMMARY'));
    console.log(chalk.gray('='.repeat(50)));
    
    if (result.success) {
      console.log(chalk.green('✅ Transformation completed successfully!'));
    } else {
      console.log(chalk.red('❌ Transformation completed with errors'));
    }

    // Detailed file statistics
    console.log(chalk.bold('\n📁 File Statistics:'));
    console.log(chalk.white(`  • Files created: ${chalk.bold(result.filesCreated.length)}`));
    console.log(chalk.white(`  • Files modified: ${chalk.bold(result.filesModified.length)}`));
    console.log(chalk.white(`  • Files backed up: ${chalk.bold(result.filesBackedUp.length)}`));
    console.log(chalk.white(`  • Total files processed: ${chalk.bold(result.filesCreated.length + result.filesModified.length)}`));

    // Show created files
    if (result.filesCreated.length > 0) {
      console.log(chalk.bold.green('\n📄 Files Created:'));
      result.filesCreated.forEach(file => {
        console.log(chalk.green(`  ➕ ${file}`));
      });
    }

    // Show modified files
    if (result.filesModified.length > 0) {
      console.log(chalk.bold.blue('\n✏️  Files Modified:'));
      result.filesModified.forEach(file => {
        console.log(chalk.blue(`  ✏️  ${file}`));
      });
    }

    // Show backed up files
    if (result.filesBackedUp.length > 0) {
      console.log(chalk.bold.yellow('\n📦 Files Backed Up:'));
      result.filesBackedUp.forEach(file => {
        console.log(chalk.yellow(`  📦 ${file}`));
      });
    }

    // Show errors
    if (result.errors.length > 0) {
      console.log(chalk.bold.red('\n❌ Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

    // Show warnings
    if (result.warnings.length > 0) {
      console.log(chalk.bold.yellow('\n⚠️  Warnings:'));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    // Current state information
    console.log(chalk.bold.cyan('\n📋 Current State of Your Code:'));
    console.log(chalk.cyan('  • All visual testing code has been migrated to SmartUI'));
    console.log(chalk.cyan('  • Configuration files have been updated'));
    console.log(chalk.cyan('  • Dependencies have been modified'));
    console.log(chalk.cyan('  • CI/CD scripts have been updated'));

    // Next steps
    console.log(chalk.bold.green('\n🚀 Next Steps:'));
    console.log(chalk.green('  1. Install SmartUI dependencies: npm install @lambdatest/smartui-cli'));
    console.log(chalk.green('  2. Configure your SmartUI credentials'));
    console.log(chalk.green('  3. Update your test environment variables'));
    console.log(chalk.green('  4. Run your migrated tests with SmartUI'));
    console.log(chalk.green('  5. Check the SmartUI Dashboard for test results'));

    // Backup information
    if (result.filesBackedUp.length > 0) {
      console.log(chalk.bold.yellow('\n🛡️  Backup Information:'));
      console.log(chalk.yellow(`  • ${result.filesBackedUp.length} files backed up to .smartui-backup/`));
      console.log(chalk.yellow('  • Original files are safely preserved'));
      console.log(chalk.yellow('  • You can restore files if needed'));
      console.log(chalk.yellow('  • Keep backups until you\'re confident everything works'));
    }

    // POC guidance
    console.log(chalk.bold.cyan('\n💡 POC Guidance:'));
    console.log(chalk.cyan('  • Test the migrated code in a development environment first'));
    console.log(chalk.cyan('  • Verify all tests run successfully with SmartUI'));
    console.log(chalk.cyan('  • Check that visual comparisons work as expected'));
    console.log(chalk.cyan('  • Once confident, deploy to your production environment'));

    // Support information
    console.log(chalk.bold.blue('\n🆘 Support:'));
    console.log(chalk.blue('  • Documentation: https://github.com/lambdatest/smartui-migration-tool'));
    console.log(chalk.blue('  • Issues: https://github.com/lambdatest/smartui-migration-tool/issues'));
    console.log(chalk.blue('  • SmartUI Docs: https://www.lambdatest.com/smart-ui'));

    console.log(chalk.gray('\n' + '='.repeat(50)));
  }

  /**
   * Show current state of the code after transformation
   */
  private async showCurrentCodeState(): Promise<void> {
    console.log(chalk.bold.cyan('\n📋 CURRENT STATE OF YOUR CODE'));
    console.log(chalk.gray('='.repeat(50)));

    try {
      // Check for SmartUI configuration
      const smartuiConfigPath = path.join(this.projectPath, '.smartui.json');
      const configExists = await fs.access(smartuiConfigPath).then(() => true).catch(() => false);
      
      if (configExists) {
        console.log(chalk.green('✅ SmartUI configuration file (.smartui.json) is present'));
        try {
          const configContent = await fs.readFile(smartuiConfigPath, 'utf-8');
          const config = JSON.parse(configContent);
          console.log(chalk.gray(`   • Project: ${config.project || 'Not specified'}`));
          console.log(chalk.gray(`   • Build Name: ${config.buildName || 'Not specified'}`));
          console.log(chalk.gray(`   • Branch: ${config.branch || 'Not specified'}`));
        } catch (error) {
          console.log(chalk.yellow('⚠️  SmartUI configuration file exists but could not be parsed'));
        }
      } else {
        console.log(chalk.yellow('⚠️  SmartUI configuration file (.smartui.json) not found'));
      }

      // Check package.json for SmartUI dependencies
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageExists = await fs.access(packageJsonPath).then(() => true).catch(() => false);
      
      if (packageExists) {
        try {
          const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
          const packageJson = JSON.parse(packageContent);
          const hasSmartUIDep = packageJson.dependencies && 
            (packageJson.dependencies['@lambdatest/smartui-cli'] || 
             packageJson.dependencies['@lambdatest/smartui']);
          
          if (hasSmartUIDep) {
            console.log(chalk.green('✅ SmartUI dependencies are present in package.json'));
          } else {
            console.log(chalk.yellow('⚠️  SmartUI dependencies not found in package.json'));
            console.log(chalk.cyan('   Run: npm install @lambdatest/smartui-cli'));
          }
        } catch (error) {
          console.log(chalk.yellow('⚠️  Could not read package.json'));
        }
      }

      // Check for test files that might have been migrated
      const testFiles = await this.findTestFiles();
      if (testFiles.length > 0) {
        console.log(chalk.green(`✅ Found ${testFiles.length} test files that may have been migrated`));
        testFiles.slice(0, 5).forEach(file => {
          console.log(chalk.gray(`   • ${file}`));
        });
        if (testFiles.length > 5) {
          console.log(chalk.gray(`   • ... and ${testFiles.length - 5} more files`));
        }
      }

      // Check for backup directory
      const backupDir = path.join(this.projectPath, '.smartui-backup');
      const backupExists = await fs.access(backupDir).then(() => true).catch(() => false);
      
      if (backupExists) {
        console.log(chalk.green('✅ Backup directory (.smartui-backup) exists'));
        try {
          const backupFiles = await fs.readdir(backupDir);
          console.log(chalk.gray(`   • ${backupFiles.length} backup files available`));
        } catch (error) {
          console.log(chalk.yellow('⚠️  Could not read backup directory'));
        }
      }

    } catch (error) {
      console.log(chalk.red('❌ Error checking current state:'), error);
    }

    console.log(chalk.gray('\n' + '='.repeat(50)));
  }

  /**
   * Find test files in the project
   */
  private async findTestFiles(): Promise<string[]> {
    const testFiles: string[] = [];
    const testPatterns = [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/cypress/**/*.js',
      '**/cypress/**/*.ts',
      '**/tests/**/*.js',
      '**/tests/**/*.ts',
      '**/test/**/*.js',
      '**/test/**/*.ts'
    ];

    try {
      const { glob } = await import('fast-glob');
      for (const pattern of testPatterns) {
        const files = await glob(pattern, { cwd: this.projectPath });
        testFiles.push(...files);
      }
    } catch (error) {
      // Fallback to basic file system search
      try {
        const files = await fs.readdir(this.projectPath, { recursive: true });
        testFiles.push(...files.filter(file => 
          typeof file === 'string' && 
          (file.includes('.test.') || file.includes('.spec.') || file.includes('cypress'))
        ));
      } catch (error) {
        // Ignore errors in fallback
      }
    }

    return [...new Set(testFiles)]; // Remove duplicates
  }
}
