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
    
    // Main confirmation
    const mainQuestion = {
      type: 'confirm' as const,
      name: 'proceed',
      message: `Do you want to proceed with transforming ${preview.totalFiles} files?`,
      default: false,
    };

    const mainAnswer = await inquirer.default.prompt([mainQuestion]);
    
    if (!mainAnswer['proceed']) {
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
        const errorMsg = `Failed to transform ${change.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
        const errorMsg = `Failed to transform ${change.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
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
        const errorMsg = `Failed to transform ${change.filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`;
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

    console.log(chalk.white(`\n📁 Files created: ${chalk.bold(result.filesCreated.length)}`));
    result.filesCreated.forEach(file => {
      console.log(chalk.green(`  ➕ ${file}`));
    });

    console.log(chalk.white(`\n✏️  Files modified: ${chalk.bold(result.filesModified.length)}`));
    result.filesModified.forEach(file => {
      console.log(chalk.blue(`  ✏️  ${file}`));
    });

    if (result.filesBackedUp.length > 0) {
      console.log(chalk.white(`\n📦 Files backed up: ${chalk.bold(result.filesBackedUp.length)}`));
      result.filesBackedUp.forEach(file => {
        console.log(chalk.yellow(`  📦 ${file}`));
      });
    }

    if (result.errors.length > 0) {
      console.log(chalk.red(`\n❌ Errors: ${chalk.bold(result.errors.length)}`));
      result.errors.forEach(error => {
        console.log(chalk.red(`  ❌ ${error}`));
      });
    }

    if (result.warnings.length > 0) {
      console.log(chalk.yellow(`\n⚠️  Warnings: ${chalk.bold(result.warnings.length)}`));
      result.warnings.forEach(warning => {
        console.log(chalk.yellow(`  ⚠️  ${warning}`));
      });
    }

    console.log(chalk.gray('\n' + '='.repeat(50)));
    
    // Show next steps
    if (result.success) {
      console.log(chalk.green.bold('\n🎉 Next Steps:'));
      console.log(chalk.white('  1. Review the transformed files'));
      console.log(chalk.white('  2. Install SmartUI dependencies: npm install @lambdatest/smartui-cli'));
      console.log(chalk.white('  3. Configure your SmartUI credentials'));
      console.log(chalk.white('  4. Run your tests with SmartUI'));
      console.log(chalk.white('  5. Check the SmartUI Dashboard for results'));
      
      if (result.filesBackedUp.length > 0) {
        console.log(chalk.yellow('\n🛡️  Backup Information:'));
        console.log(chalk.white('  • Original files are backed up in .smartui-backup/'));
        console.log(chalk.white('  • You can restore files if needed'));
      }
    }
  }
}
