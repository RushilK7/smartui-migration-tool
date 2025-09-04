import chalk from 'chalk';
import { promises as fs } from 'fs';
import path from 'path';
import { DetectionResult } from '../types';
import { logger } from '../utils/Logger';
import { ProgressManager } from '../utils/ProgressManager';
import { ConfigTransformer } from './ConfigTransformer';
import { CodeTransformer } from './CodeTransformer';
import { JavaCodeTransformer } from './JavaCodeTransformer';
import { PythonCodeTransformer } from './PythonCodeTransformer';
import { ExecutionTransformer } from './ExecutionTransformer';
import { StorybookTransformer } from './StorybookTransformer';

export interface ChangePreview {
  filePath: string;
  changeType: 'CREATE' | 'MODIFY' | 'DELETE';
  originalContent?: string;
  newContent: string;
  changes: ChangeDetail[];
  warnings: string[];
}

export interface ChangeDetail {
  lineNumber: number;
  originalLine: string;
  newLine: string;
  changeType: 'ADD' | 'MODIFY' | 'DELETE';
  description: string;
}

export interface TransformationPreview {
  configChanges: ChangePreview[];
  codeChanges: ChangePreview[];
  executionChanges: ChangePreview[];
  totalFiles: number;
  totalSnapshots: number;
  warnings: string[];
}

export class ChangePreviewer {
  private projectPath: string;
  private verbose: boolean;
  private selectedFiles: string[];

  constructor(projectPath: string, verbose: boolean = false, selectedFiles: string[] = []) {
    this.projectPath = projectPath;
    this.verbose = verbose;
    this.selectedFiles = selectedFiles;
  }

  /**
   * Generate a comprehensive preview of all changes that will be made
   */
  async generatePreview(detectionResult: DetectionResult): Promise<TransformationPreview> {
    logger.verbose('Generating transformation preview...');
    
    const configChanges: ChangePreview[] = [];
    const codeChanges: ChangePreview[] = [];
    const executionChanges: ChangePreview[] = [];
    const allWarnings: string[] = [];
    let totalSnapshots = 0;

    // Create progress bar for preview generation
    const totalSteps = 3;
    const progress = ProgressManager.createPreviewProgress(totalSteps, this.verbose);

    // Preview configuration changes
    progress.update(1, { title: 'Analyzing configuration changes' });
    if (detectionResult.files.config.length > 0) {
      const configPreview = await this.previewConfigChanges(detectionResult);
      configChanges.push(...configPreview.changes);
      allWarnings.push(...configPreview.warnings);
    }

    // Preview code changes
    progress.update(2, { title: 'Analyzing code changes' });
    if (detectionResult.files.source.length > 0) {
      const codePreview = await this.previewCodeChanges(detectionResult);
      codeChanges.push(...codePreview.changes);
      totalSnapshots += codePreview.totalSnapshots;
      allWarnings.push(...codePreview.warnings);
    }

    // Preview execution changes
    progress.update(3, { title: 'Analyzing execution changes' });
    const executionPreview = await this.previewExecutionChanges(detectionResult);
    executionChanges.push(...executionPreview.changes);
    allWarnings.push(...executionPreview.warnings);

    const totalFiles = configChanges.length + codeChanges.length + executionChanges.length;

    progress.complete({ title: 'Preview generation completed' });
    logger.verbose(`Preview generated: ${totalFiles} files, ${totalSnapshots} snapshots`);

    return {
      configChanges,
      codeChanges,
      executionChanges,
      totalFiles,
      totalSnapshots,
      warnings: allWarnings
    };
  }

  /**
   * Preview configuration file changes
   */
  private async previewConfigChanges(detectionResult: DetectionResult): Promise<{ changes: ChangePreview[], warnings: string[] }> {
    const changes: ChangePreview[] = [];
    const warnings: string[] = [];

    try {
      const configTransformer = new ConfigTransformer(this.projectPath);

      // Preview .smartui.json creation
      const smartUIConfig = this.generateSmartUIConfig(detectionResult);
      changes.push({
        filePath: '.smartui.json',
        changeType: 'CREATE',
        newContent: smartUIConfig,
        changes: [{
          lineNumber: 1,
          originalLine: '',
          newLine: smartUIConfig,
          changeType: 'ADD',
          description: 'Create SmartUI configuration file'
        }],
        warnings: []
      });

      // Preview existing config file modifications (filter by selected files)
      const configFilesToProcess = this.selectedFiles.length > 0 
        ? detectionResult.files.config.filter(file => this.selectedFiles.includes(file) || this.selectedFiles.includes('.smartui.json'))
        : detectionResult.files.config;
        
      for (const configFile of configFilesToProcess) {
        try {
          const configFilePath = path.join(this.projectPath, configFile);
          
          // Check if file exists
          try {
            await fs.access(configFilePath);
          } catch (error) {
            const errorMsg = `Config file not found: ${configFile}`;
            warnings.push(errorMsg);
            logger.verbose(errorMsg);
            continue;
          }
          
          const originalContent = await fs.readFile(configFilePath, 'utf-8');
          
          let transformedContent: string;
          let configWarnings: string[] = [];

          if (detectionResult.platform === 'Percy') {
            const result = configTransformer.transformPercyConfig(originalContent);
            transformedContent = result.content;
            configWarnings = result.warnings.map(w => w.message);
          } else if (detectionResult.platform === 'Applitools') {
            const result = configTransformer.transformApplitoolsConfig(originalContent);
            transformedContent = result.content;
            configWarnings = result.warnings.map(w => w.message);
          } else if (detectionResult.platform === 'Sauce Labs Visual') {
            const result = configTransformer.transformSauceLabsConfig(originalContent, configFilePath);
            transformedContent = result.content;
            configWarnings = result.warnings.map(w => w.message);
          } else {
            continue;
          }

          const changeDetails = this.generateDiff(originalContent, transformedContent, 'Configuration transformation');
          
          changes.push({
            filePath: configFile,
            changeType: 'MODIFY',
            originalContent,
            newContent: transformedContent,
            changes: changeDetails,
            warnings: configWarnings
          });

          warnings.push(...configWarnings);
        } catch (error) {
          const errorMsg = `Failed to preview config file ${configFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          warnings.push(errorMsg);
          logger.verbose(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to preview configuration changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
      warnings.push(errorMsg);
      logger.verbose(errorMsg);
    }

    return { changes, warnings };
  }

  /**
   * Preview code file changes
   */
  private async previewCodeChanges(detectionResult: DetectionResult): Promise<{ changes: ChangePreview[], totalSnapshots: number, warnings: string[] }> {
    const changes: ChangePreview[] = [];
    const warnings: string[] = [];
    let totalSnapshots = 0;

    try {
      const codeTransformer = new CodeTransformer(this.projectPath);
      const javaCodeTransformer = new JavaCodeTransformer(this.projectPath);
      const pythonCodeTransformer = new PythonCodeTransformer(this.projectPath);

      // Filter source files by selected files
      const sourceFilesToProcess = this.selectedFiles.length > 0 
        ? detectionResult.files.source.filter(file => this.selectedFiles.includes(file))
        : detectionResult.files.source;

      for (const sourceFile of sourceFilesToProcess) {
        try {
          const sourceFilePath = path.join(this.projectPath, sourceFile);
          
          // Check if file exists
          try {
            await fs.access(sourceFilePath);
          } catch (error) {
            const errorMsg = `Source file not found: ${sourceFile}`;
            warnings.push(errorMsg);
            logger.verbose(errorMsg);
            continue;
          }
          
          const originalContent = await fs.readFile(sourceFilePath, 'utf-8');
          
          let transformedContent: string;
          let codeWarnings: string[] = [];
          let snapshotCount = 0;

          if (detectionResult.language === 'Python') {
            const result = pythonCodeTransformer.transform(originalContent, sourceFile, detectionResult.platform);
            transformedContent = result.content;
            codeWarnings = result.warnings.map(w => w.message);
            snapshotCount = result.snapshotCount;
          } else if (detectionResult.language === 'Java') {
            const result = javaCodeTransformer.transform(originalContent, detectionResult.platform);
            transformedContent = result.content;
            codeWarnings = result.warnings.map(w => w.message);
            snapshotCount = result.snapshotCount;
          } else if (detectionResult.language === 'JavaScript/TypeScript') {
            if (detectionResult.platform === 'Percy') {
              const result = codeTransformer.transformPercy(originalContent);
              transformedContent = result.content;
              codeWarnings = result.warnings.map(w => w.message);
              snapshotCount = result.snapshotCount;
            } else if (detectionResult.platform === 'Applitools') {
              const framework = detectionResult.framework === 'Cypress' ? 'Cypress' : 'Playwright';
              const result = codeTransformer.transformApplitools(originalContent, framework);
              transformedContent = result.content;
              codeWarnings = result.warnings.map(w => w.message);
              snapshotCount = result.snapshotCount;
            } else if (detectionResult.platform === 'Sauce Labs Visual') {
              const result = codeTransformer.transformSauceLabs(originalContent);
              transformedContent = result.content;
              codeWarnings = result.warnings.map(w => w.message);
              snapshotCount = result.snapshotCount;
            } else {
              continue;
            }
          } else {
            continue;
          }

          totalSnapshots += snapshotCount;

          const changeDetails = this.generateDiff(originalContent, transformedContent, `Code transformation (${snapshotCount} snapshots)`);
          
          changes.push({
            filePath: sourceFile,
            changeType: 'MODIFY',
            originalContent,
            newContent: transformedContent,
            changes: changeDetails,
            warnings: codeWarnings
          });

          warnings.push(...codeWarnings);
        } catch (error) {
          const errorMsg = `Failed to preview code file ${sourceFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          warnings.push(errorMsg);
          logger.verbose(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to preview code changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
      warnings.push(errorMsg);
      logger.verbose(errorMsg);
    }

    return { changes, totalSnapshots, warnings };
  }

  /**
   * Preview execution file changes
   */
  private async previewExecutionChanges(detectionResult: DetectionResult): Promise<{ changes: ChangePreview[], warnings: string[] }> {
    const changes: ChangePreview[] = [];
    const warnings: string[] = [];

    try {
      const executionTransformer = new ExecutionTransformer(this.projectPath);
      const storybookTransformer = new StorybookTransformer(this.projectPath);

      // Filter package files by selected files
      const packageFilesToProcess = this.selectedFiles.length > 0 
        ? detectionResult.files.packageManager.filter(file => this.selectedFiles.includes(file))
        : detectionResult.files.packageManager;

      // Preview package.json changes
      for (const packageFile of packageFilesToProcess) {
        try {
          const packageFilePath = path.join(this.projectPath, packageFile);
          const originalContent = await fs.readFile(packageFilePath, 'utf-8');
          
          let transformedContent: string;
          let executionWarnings: string[] = [];

          if (detectionResult.testType === 'storybook') {
            const result = storybookTransformer.transformPackageJsonScripts(originalContent, detectionResult.platform);
            transformedContent = result.content;
            executionWarnings = result.warnings.map(w => w.message);
          } else {
            // Use ConfigTransformer for complete package.json transformation (dependencies + scripts)
            const configTransformer = new ConfigTransformer(this.projectPath);
            // Create a temporary package.json to test transformation
            const tempPackageJson = JSON.parse(originalContent);
            configTransformer.transformDependencies(tempPackageJson, detectionResult);
            configTransformer.transformScripts(tempPackageJson, detectionResult);
            transformedContent = JSON.stringify(tempPackageJson, null, 2);
            executionWarnings = [];
          }

          const changeDetails = this.generateDiff(originalContent, transformedContent, 'Package.json script transformation');
          
          changes.push({
            filePath: packageFile,
            changeType: 'MODIFY',
            originalContent,
            newContent: transformedContent,
            changes: changeDetails,
            warnings: executionWarnings
          });

          warnings.push(...executionWarnings);
        } catch (error) {
          const errorMsg = `Failed to preview package file ${packageFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          warnings.push(errorMsg);
          logger.verbose(errorMsg);
        }
      }

      // Filter CI files by selected files
      const ciFilesToProcess = this.selectedFiles.length > 0 
        ? detectionResult.files.ci.filter(file => this.selectedFiles.includes(file))
        : detectionResult.files.ci;

      // Preview CI/CD changes
      for (const ciFile of ciFilesToProcess) {
        try {
          const ciFilePath = path.join(this.projectPath, ciFile);
          const originalContent = await fs.readFile(ciFilePath, 'utf-8');
          
          const result = executionTransformer.transformCiYaml(originalContent, detectionResult.platform);
          const transformedContent = result.content;
          const executionWarnings = result.warnings.map(w => w.message);

          const changeDetails = this.generateDiff(originalContent, transformedContent, 'CI/CD configuration transformation');
          
          changes.push({
            filePath: ciFile,
            changeType: 'MODIFY',
            originalContent,
            newContent: transformedContent,
            changes: changeDetails,
            warnings: executionWarnings
          });

          warnings.push(...executionWarnings);
        } catch (error) {
          const errorMsg = `Failed to preview CI file ${ciFile}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          warnings.push(errorMsg);
          logger.verbose(errorMsg);
        }
      }
    } catch (error) {
      const errorMsg = `Failed to preview execution changes: ${error instanceof Error ? error.message : 'Unknown error'}`;
      warnings.push(errorMsg);
      logger.verbose(errorMsg);
    }

    return { changes, warnings };
  }

  /**
   * Generate a diff between original and transformed content
   */
  private generateDiff(originalContent: string, transformedContent: string, description: string): ChangeDetail[] {
    const changes: ChangeDetail[] = [];

    try {
      // Handle empty or null content
      const original = originalContent || '';
      const transformed = transformedContent || '';

      // If content is identical, return empty changes
      if (original === transformed) {
        return changes;
      }

      const originalLines = original.split('\n');
      const transformedLines = transformed.split('\n');
      const maxLines = Math.max(originalLines.length, transformedLines.length);
      
      for (let i = 0; i < maxLines; i++) {
        const originalLine = originalLines[i] || '';
        const transformedLine = transformedLines[i] || '';

        if (originalLine !== transformedLine) {
          if (originalLine === '') {
            changes.push({
              lineNumber: i + 1,
              originalLine: '',
              newLine: transformedLine,
              changeType: 'ADD',
              description: `Add line: ${transformedLine.substring(0, 50)}${transformedLine.length > 50 ? '...' : ''}`
            });
          } else if (transformedLine === '') {
            changes.push({
              lineNumber: i + 1,
              originalLine,
              newLine: '',
              changeType: 'DELETE',
              description: `Remove line: ${originalLine.substring(0, 50)}${originalLine.length > 50 ? '...' : ''}`
            });
          } else {
            changes.push({
              lineNumber: i + 1,
              originalLine,
              newLine: transformedLine,
              changeType: 'MODIFY',
              description: `Modify line: ${originalLine.substring(0, 30)}... → ${transformedLine.substring(0, 30)}...`
            });
          }
        }
      }

      // If no line-by-line changes found but content is different, add a summary change
      if (changes.length === 0 && original !== transformed) {
        changes.push({
          lineNumber: 1,
          originalLine: original.substring(0, 100) + (original.length > 100 ? '...' : ''),
          newLine: transformed.substring(0, 100) + (transformed.length > 100 ? '...' : ''),
          changeType: 'MODIFY',
          description: description
        });
      }
    } catch (error) {
      // Fallback for any diff generation errors
      logger.verbose(`Error generating diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
      changes.push({
        lineNumber: 1,
        originalLine: 'Error generating diff',
        newLine: 'Error generating diff',
        changeType: 'MODIFY',
        description: description
      });
    }

    return changes;
  }

  /**
   * Generate SmartUI configuration content
   */
  private generateSmartUIConfig(detectionResult: DetectionResult): string {
    const config = {
      smartui: {
        project: {
          name: detectionResult.platform === 'Percy' ? 'Percy Migration' : 
                detectionResult.platform === 'Applitools' ? 'Applitools Migration' : 'Sauce Labs Migration',
          framework: detectionResult.framework.toLowerCase(),
          language: detectionResult.language.toLowerCase()
        },
        settings: {
          browsers: ['chrome', 'firefox', 'safari'],
          viewports: [
            { width: 1920, height: 1080 },
            { width: 1366, height: 768 },
            { width: 375, height: 667 }
          ]
        }
      }
    };

    return JSON.stringify(config, null, 2);
  }

  /**
   * Display the preview in a user-friendly format
   */
  displayPreview(preview: TransformationPreview): void {
    console.log(chalk.bold.blue('\n📋 TRANSFORMATION PREVIEW'));
    console.log(chalk.gray('='.repeat(60)));
    
    // Summary
    console.log(chalk.white.bold('\n📊 Summary:'));
    console.log(chalk.white(`  • Total files to be modified: ${chalk.bold(preview.totalFiles)}`));
    console.log(chalk.white(`  • Total snapshots to migrate: ${chalk.bold(preview.totalSnapshots)}`));
    console.log(chalk.white(`  • Configuration files: ${chalk.bold(preview.configChanges.length)}`));
    console.log(chalk.white(`  • Code files: ${chalk.bold(preview.codeChanges.length)}`));
    console.log(chalk.white(`  • Execution files: ${chalk.bold(preview.executionChanges.length)}`));
    
    if (preview.warnings.length > 0) {
      console.log(chalk.yellow(`  • Warnings: ${chalk.bold(preview.warnings.length)}`));
    }

    // Configuration changes
    if (preview.configChanges.length > 0) {
      console.log(chalk.blue('\n📁 Configuration Changes:'));
      preview.configChanges.forEach(change => {
        this.displayFileChange(change);
      });
    }

    // Code changes
    if (preview.codeChanges.length > 0) {
      console.log(chalk.green('\n💻 Code Changes:'));
      preview.codeChanges.forEach(change => {
        this.displayFileChange(change);
      });
    }

    // Execution changes
    if (preview.executionChanges.length > 0) {
      console.log(chalk.magenta('\n⚙️  Execution Changes:'));
      preview.executionChanges.forEach(change => {
        this.displayFileChange(change);
      });
    }

    // Warnings
    if (preview.warnings.length > 0) {
      console.log(chalk.yellow('\n⚠️  Warnings:'));
      preview.warnings.forEach(warning => {
        console.log(chalk.yellow(`  • ${warning}`));
      });
    }

    console.log(chalk.gray('\n' + '='.repeat(60)));
  }

  /**
   * Display individual file change with detailed information
   */
  private displayFileChange(change: ChangePreview): void {
    const changeIcon = change.changeType === 'CREATE' ? '➕' : 
                      change.changeType === 'MODIFY' ? '✏️ ' : '🗑️ ';
    
    console.log(chalk.white(`\n${changeIcon} ${chalk.bold(change.filePath)}`));
    
    if (change.changeType === 'CREATE') {
      console.log(chalk.green(`    ${chalk.bold('CREATE')} - New file will be created`));
      // Show preview of new file content
      if (change.newContent) {
        const preview = change.newContent.length > 200 ? 
          change.newContent.substring(0, 200) + '...' : 
          change.newContent;
        console.log(chalk.gray(`    Preview: ${preview}`));
      }
    } else {
      console.log(chalk.blue(`    ${chalk.bold('MODIFY')} - ${change.changes.length} changes will be made`));
      
      // Show detailed changes with line-by-line diffs
      console.log(chalk.gray('    Detailed Changes:'));
      change.changes.forEach((changeDetail, index) => {
        const lineNum = changeDetail.lineNumber;
        const changeTypeIcon = changeDetail.changeType === 'ADD' ? '+' : 
                              changeDetail.changeType === 'DELETE' ? '-' : '~';
        const changeColor = changeDetail.changeType === 'ADD' ? chalk.green :
                           changeDetail.changeType === 'DELETE' ? chalk.red : chalk.yellow;
        
        console.log(chalk.gray(`      ${index + 1}. Line ${lineNum}: ${changeTypeIcon} ${changeDetail.description}`));
        
        // Show before/after for modifications
        if (changeDetail.changeType === 'MODIFY') {
          if (changeDetail.originalLine) {
            console.log(chalk.red(`         - ${changeDetail.originalLine.substring(0, 60)}${changeDetail.originalLine.length > 60 ? '...' : ''}`));
          }
          if (changeDetail.newLine) {
            console.log(chalk.green(`         + ${changeDetail.newLine.substring(0, 60)}${changeDetail.newLine.length > 60 ? '...' : ''}`));
          }
        } else if (changeDetail.changeType === 'ADD' && changeDetail.newLine) {
          console.log(chalk.green(`         + ${changeDetail.newLine.substring(0, 60)}${changeDetail.newLine.length > 60 ? '...' : ''}`));
        } else if (changeDetail.changeType === 'DELETE' && changeDetail.originalLine) {
          console.log(chalk.red(`         - ${changeDetail.originalLine.substring(0, 60)}${changeDetail.originalLine.length > 60 ? '...' : ''}`));
        }
      });
    }

    // Show warnings for this file
    if (change.warnings.length > 0) {
      console.log(chalk.yellow(`    ⚠️  ${change.warnings.length} warning(s):`));
      change.warnings.forEach(warning => {
        console.log(chalk.yellow(`      • ${warning}`));
      });
    }
  }
}
