import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * Change tracking system for comprehensive migration reporting
 */

export interface ChangeDetail {
  filePath: string;
  changeType: 'ADD' | 'MODIFY' | 'DELETE' | 'RENAME';
  lineNumber?: number | undefined;
  originalContent?: string | undefined;
  newContent?: string | undefined;
  description: string;
  timestamp: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface FileChange {
  filePath: string;
  changeType: 'ADD' | 'MODIFY' | 'DELETE' | 'RENAME';
  changes: ChangeDetail[];
  summary: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  snapshotCount?: number | undefined;
  dependencyCount?: number | undefined;
}

export interface DependencyChange {
  type: 'ADD' | 'REMOVE' | 'UPDATE';
  package: string;
  oldVersion?: string | undefined;
  newVersion?: string | undefined;
  reason: string;
  filePath: string;
  timestamp: Date;
}

export interface ScriptChange {
  filePath: string;
  scriptName: string;
  oldScript?: string | undefined;
  newScript?: string | undefined;
  changeType: 'ADD' | 'MODIFY' | 'DELETE';
  description: string;
  timestamp: Date;
}

export interface ValidationResult {
  type: 'SUCCESS' | 'WARNING' | 'ERROR';
  message: string;
  filePath?: string | undefined;
  suggestion?: string | undefined;
  timestamp: Date;
}

export interface Recommendation {
  type: 'ACTION' | 'OPTIMIZATION' | 'SECURITY' | 'PERFORMANCE';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  action?: string | undefined;
}

export interface MigrationSummary {
  totalFiles: number;
  filesModified: number;
  filesCreated: number;
  filesDeleted: number;
  snapshotsMigrated: number;
  dependenciesChanged: number;
  scriptsChanged: number;
  validationErrors: number;
  validationWarnings: number;
  migrationTime: number;
  successRate: number;
}

export interface ReportMetadata {
  toolVersion: string;
  migrationDate: Date;
  projectPath: string;
  platform: string;
  framework: string;
  language: string;
  totalChanges: number;
}

export interface MigrationReport {
  summary: MigrationSummary;
  fileChanges: FileChange[];
  dependencyChanges: DependencyChange[];
  scriptChanges: ScriptChange[];
  validationResults: ValidationResult[];
  recommendations: Recommendation[];
  metadata: ReportMetadata;
}

export class ChangeTracker {
  private changes: ChangeDetail[] = [];
  private fileChanges: Map<string, FileChange> = new Map();
  private dependencyChanges: DependencyChange[] = [];
  private scriptChanges: ScriptChange[] = [];
  private validationResults: ValidationResult[] = [];
  private recommendations: Recommendation[] = [];
  private startTime: Date = new Date();
  private endTime?: Date | undefined;

  /**
   * Track a file change
   */
  public trackFileChange(
    filePath: string,
    changeType: 'ADD' | 'MODIFY' | 'DELETE' | 'RENAME',
    originalContent?: string,
    newContent?: string,
    description?: string,
    lineNumber?: number,
    snapshotCount?: number,
    dependencyCount?: number
  ): void {
    const change: ChangeDetail = {
      filePath,
      changeType,
      lineNumber,
      originalContent,
      newContent,
      description: description || this.generateDescription(changeType, filePath),
      timestamp: new Date(),
      riskLevel: this.assessRiskLevel(changeType, filePath, originalContent, newContent)
    };

    this.changes.push(change);
    this.updateFileChange(filePath, change, snapshotCount, dependencyCount);
  }

  /**
   * Track a dependency change
   */
  public trackDependencyChange(
    type: 'ADD' | 'REMOVE' | 'UPDATE',
    packageName: string,
    oldVersion?: string,
    newVersion?: string,
    reason?: string,
    filePath?: string
  ): void {
    const change: DependencyChange = {
      type,
      package: packageName,
      oldVersion,
      newVersion,
      reason: reason || this.generateDependencyReason(type, packageName),
      filePath: filePath || 'package.json',
      timestamp: new Date()
    };

    this.dependencyChanges.push(change);
  }

  /**
   * Track a script change
   */
  public trackScriptChange(
    filePath: string,
    scriptName: string,
    changeType: 'ADD' | 'MODIFY' | 'DELETE',
    oldScript?: string,
    newScript?: string,
    description?: string
  ): void {
    const change: ScriptChange = {
      filePath,
      scriptName,
      oldScript,
      newScript,
      changeType,
      description: description || this.generateScriptDescription(changeType, scriptName),
      timestamp: new Date()
    };

    this.scriptChanges.push(change);
  }

  /**
   * Add validation result
   */
  public addValidationResult(
    type: 'SUCCESS' | 'WARNING' | 'ERROR',
    message: string,
    filePath?: string,
    suggestion?: string
  ): void {
    const result: ValidationResult = {
      type,
      message,
      filePath,
      suggestion,
      timestamp: new Date()
    };

    this.validationResults.push(result);
  }

  /**
   * Add recommendation
   */
  public addRecommendation(
    type: 'ACTION' | 'OPTIMIZATION' | 'SECURITY' | 'PERFORMANCE',
    title: string,
    description: string,
    priority: 'LOW' | 'MEDIUM' | 'HIGH',
    action?: string
  ): void {
    const recommendation: Recommendation = {
      type,
      title,
      description,
      priority,
      action
    };

    this.recommendations.push(recommendation);
  }

  /**
   * Mark migration as complete
   */
  public completeMigration(): void {
    this.endTime = new Date();
  }

  /**
   * Generate comprehensive migration report
   */
  public generateReport(projectPath: string, platform: string, framework: string, language: string): MigrationReport {
    const migrationTime = this.endTime ? 
      this.endTime.getTime() - this.startTime.getTime() : 
      Date.now() - this.startTime.getTime();

    const summary: MigrationSummary = {
      totalFiles: this.fileChanges.size,
      filesModified: Array.from(this.fileChanges.values()).filter(fc => fc.changeType === 'MODIFY').length,
      filesCreated: Array.from(this.fileChanges.values()).filter(fc => fc.changeType === 'ADD').length,
      filesDeleted: Array.from(this.fileChanges.values()).filter(fc => fc.changeType === 'DELETE').length,
      snapshotsMigrated: Array.from(this.fileChanges.values()).reduce((sum, fc) => sum + (fc.snapshotCount || 0), 0),
      dependenciesChanged: this.dependencyChanges.length,
      scriptsChanged: this.scriptChanges.length,
      validationErrors: this.validationResults.filter(vr => vr.type === 'ERROR').length,
      validationWarnings: this.validationResults.filter(vr => vr.type === 'WARNING').length,
      migrationTime,
      successRate: this.calculateSuccessRate()
    };

    const metadata: ReportMetadata = {
      toolVersion: '1.1.3',
      migrationDate: this.startTime,
      projectPath,
      platform,
      framework,
      language,
      totalChanges: this.changes.length
    };

    return {
      summary,
      fileChanges: Array.from(this.fileChanges.values()),
      dependencyChanges: this.dependencyChanges,
      scriptChanges: this.scriptChanges,
      validationResults: this.validationResults,
      recommendations: this.recommendations,
      metadata
    };
  }

  /**
   * Export report to JSON
   */
  public async exportToJSON(report: MigrationReport, outputPath: string): Promise<void> {
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');
  }

  /**
   * Export report to Markdown
   */
  public async exportToMarkdown(report: MigrationReport, outputPath: string): Promise<void> {
    const markdown = this.generateMarkdownReport(report);
    await fs.writeFile(outputPath, markdown, 'utf-8');
  }

  /**
   * Export report to HTML
   */
  public async exportToHTML(report: MigrationReport, outputPath: string): Promise<void> {
    const html = this.generateHTMLReport(report);
    await fs.writeFile(outputPath, html, 'utf-8');
  }

  /**
   * Get all changes for a specific file
   */
  public getFileChanges(filePath: string): FileChange | undefined {
    return this.fileChanges.get(filePath);
  }

  /**
   * Get all changes
   */
  public getAllChanges(): ChangeDetail[] {
    return [...this.changes];
  }

  /**
   * Clear all tracked changes
   */
  public clear(): void {
    this.changes = [];
    this.fileChanges.clear();
    this.dependencyChanges = [];
    this.scriptChanges = [];
    this.validationResults = [];
    this.recommendations = [];
    this.startTime = new Date();
    this.endTime = undefined;
  }

  // Private helper methods

  private updateFileChange(
    filePath: string, 
    change: ChangeDetail, 
    snapshotCount?: number, 
    dependencyCount?: number
  ): void {
    const existing = this.fileChanges.get(filePath);
    
    if (existing) {
      existing.changes.push(change);
      existing.riskLevel = this.getHighestRiskLevel(existing.riskLevel, change.riskLevel);
      if (snapshotCount) existing.snapshotCount = (existing.snapshotCount || 0) + snapshotCount;
      if (dependencyCount) existing.dependencyCount = (existing.dependencyCount || 0) + dependencyCount;
    } else {
      const fileChange: FileChange = {
        filePath,
        changeType: change.changeType,
        changes: [change],
        summary: this.generateFileSummary(change),
        riskLevel: change.riskLevel,
        snapshotCount,
        dependencyCount
      };
      
      this.fileChanges.set(filePath, fileChange);
    }
  }

  private generateDescription(changeType: string, filePath: string): string {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    
    switch (changeType) {
      case 'ADD':
        return `Created new file: ${fileName}`;
      case 'MODIFY':
        return `Modified file: ${fileName}`;
      case 'DELETE':
        return `Deleted file: ${fileName}`;
      case 'RENAME':
        return `Renamed file: ${fileName}`;
      default:
        return `Changed file: ${fileName}`;
    }
  }

  private generateDependencyReason(type: string, packageName: string): string {
    switch (type) {
      case 'ADD':
        return `Added SmartUI dependency: ${packageName}`;
      case 'REMOVE':
        return `Removed old dependency: ${packageName}`;
      case 'UPDATE':
        return `Updated dependency: ${packageName}`;
      default:
        return `Modified dependency: ${packageName}`;
    }
  }

  private generateScriptDescription(changeType: string, scriptName: string): string {
    switch (changeType) {
      case 'ADD':
        return `Added new script: ${scriptName}`;
      case 'MODIFY':
        return `Modified script: ${scriptName}`;
      case 'DELETE':
        return `Deleted script: ${scriptName}`;
      default:
        return `Changed script: ${scriptName}`;
    }
  }

  private generateFileSummary(change: ChangeDetail): string {
    return `${change.changeType} - ${change.description}`;
  }

  private assessRiskLevel(
    changeType: string, 
    filePath: string, 
    originalContent?: string, 
    newContent?: string
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    const fileName = path.basename(filePath);
    const fileExt = path.extname(filePath);
    
    // High risk: Core configuration files
    if (['package.json', 'pom.xml', 'requirements.txt', '.env', 'config.json'].includes(fileName)) {
      return 'HIGH';
    }
    
    // Medium risk: Test files and scripts
    if (fileExt === '.java' || fileExt === '.js' || fileExt === '.ts' || fileName.includes('test')) {
      return 'MEDIUM';
    }
    
    // Low risk: Documentation and other files
    return 'LOW';
  }

  private getHighestRiskLevel(level1: string, level2: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const levels: { [key: string]: number } = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    const level1Value = levels[level1] || 1;
    const level2Value = levels[level2] || 1;
    return level1Value >= level2Value ? level1 as 'LOW' | 'MEDIUM' | 'HIGH' : level2 as 'LOW' | 'MEDIUM' | 'HIGH';
  }

  private calculateSuccessRate(): number {
    const totalValidations = this.validationResults.length;
    if (totalValidations === 0) return 100;
    
    const errors = this.validationResults.filter(vr => vr.type === 'ERROR').length;
    return Math.round(((totalValidations - errors) / totalValidations) * 100);
  }

  private generateMarkdownReport(report: MigrationReport): string {
    const { summary, fileChanges, dependencyChanges, scriptChanges, validationResults, recommendations, metadata } = report;
    
    let markdown = `# SmartUI Migration Report\n\n`;
    markdown += `**Migration Date:** ${metadata.migrationDate.toISOString()}\n`;
    markdown += `**Tool Version:** ${metadata.toolVersion}\n`;
    markdown += `**Project:** ${metadata.projectPath}\n`;
    markdown += `**Platform:** ${metadata.platform}\n`;
    markdown += `**Framework:** ${metadata.framework}\n`;
    markdown += `**Language:** ${metadata.language}\n\n`;
    
    markdown += `## Summary\n\n`;
    markdown += `- **Total Files:** ${summary.totalFiles}\n`;
    markdown += `- **Files Modified:** ${summary.filesModified}\n`;
    markdown += `- **Files Created:** ${summary.filesCreated}\n`;
    markdown += `- **Snapshots Migrated:** ${summary.snapshotsMigrated}\n`;
    markdown += `- **Dependencies Changed:** ${summary.dependenciesChanged}\n`;
    markdown += `- **Migration Time:** ${Math.round(summary.migrationTime / 1000)}s\n`;
    markdown += `- **Success Rate:** ${summary.successRate}%\n\n`;
    
    if (fileChanges.length > 0) {
      markdown += `## File Changes\n\n`;
      fileChanges.forEach(fileChange => {
        markdown += `### ${fileChange.filePath}\n`;
        markdown += `- **Type:** ${fileChange.changeType}\n`;
        markdown += `- **Risk Level:** ${fileChange.riskLevel}\n`;
        if (fileChange.snapshotCount) markdown += `- **Snapshots:** ${fileChange.snapshotCount}\n`;
        markdown += `- **Changes:** ${fileChange.changes.length}\n\n`;
      });
    }
    
    if (dependencyChanges.length > 0) {
      markdown += `## Dependency Changes\n\n`;
      dependencyChanges.forEach(depChange => {
        markdown += `- **${depChange.type}:** ${depChange.package}`;
        if (depChange.oldVersion && depChange.newVersion) {
          markdown += ` (${depChange.oldVersion} → ${depChange.newVersion})`;
        }
        markdown += `\n`;
      });
      markdown += `\n`;
    }
    
    if (validationResults.length > 0) {
      markdown += `## Validation Results\n\n`;
      validationResults.forEach(result => {
        markdown += `- **${result.type}:** ${result.message}\n`;
        if (result.suggestion) markdown += `  - *Suggestion:* ${result.suggestion}\n`;
      });
      markdown += `\n`;
    }
    
    if (recommendations.length > 0) {
      markdown += `## Recommendations\n\n`;
      recommendations.forEach(rec => {
        markdown += `### ${rec.title} (${rec.priority})\n`;
        markdown += `${rec.description}\n\n`;
      });
    }
    
    return markdown;
  }

  private generateHTMLReport(report: MigrationReport): string {
    const { summary, fileChanges, dependencyChanges, validationResults, recommendations, metadata } = report;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartUI Migration Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { background: #f4f4f4; padding: 20px; border-radius: 5px; margin-bottom: 30px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .summary-item { background: #e8f4fd; padding: 15px; border-radius: 5px; text-align: center; }
        .summary-item h3 { margin: 0; color: #2c5aa0; }
        .summary-item p { margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #1a365d; }
        .section { margin: 30px 0; }
        .file-change { background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4299e1; }
        .validation-success { color: #38a169; }
        .validation-warning { color: #d69e2e; }
        .validation-error { color: #e53e3e; }
        .recommendation { background: #fff5cd; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #d69e2e; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SmartUI Migration Report</h1>
        <p><strong>Migration Date:</strong> ${metadata.migrationDate.toISOString()}</p>
        <p><strong>Tool Version:</strong> ${metadata.toolVersion}</p>
        <p><strong>Project:</strong> ${metadata.projectPath}</p>
        <p><strong>Platform:</strong> ${metadata.platform} | <strong>Framework:</strong> ${metadata.framework} | <strong>Language:</strong> ${metadata.language}</p>
    </div>
    
    <div class="summary">
        <div class="summary-item">
            <h3>Total Files</h3>
            <p>${summary.totalFiles}</p>
        </div>
        <div class="summary-item">
            <h3>Files Modified</h3>
            <p>${summary.filesModified}</p>
        </div>
        <div class="summary-item">
            <h3>Snapshots Migrated</h3>
            <p>${summary.snapshotsMigrated}</p>
        </div>
        <div class="summary-item">
            <h3>Success Rate</h3>
            <p>${summary.successRate}%</p>
        </div>
    </div>
    
    ${fileChanges.length > 0 ? `
    <div class="section">
        <h2>File Changes</h2>
        ${fileChanges.map(fc => `
        <div class="file-change">
            <h3>${fc.filePath}</h3>
            <p><strong>Type:</strong> ${fc.changeType} | <strong>Risk:</strong> ${fc.riskLevel} | <strong>Changes:</strong> ${fc.changes.length}</p>
            ${fc.snapshotCount ? `<p><strong>Snapshots:</strong> ${fc.snapshotCount}</p>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${validationResults.length > 0 ? `
    <div class="section">
        <h2>Validation Results</h2>
        ${validationResults.map(vr => `
        <p class="validation-${vr.type.toLowerCase()}">
            <strong>${vr.type}:</strong> ${vr.message}
            ${vr.suggestion ? `<br><em>Suggestion:</em> ${vr.suggestion}` : ''}
        </p>
        `).join('')}
    </div>
    ` : ''}
    
    ${recommendations.length > 0 ? `
    <div class="section">
        <h2>Recommendations</h2>
        ${recommendations.map(rec => `
        <div class="recommendation">
            <h3>${rec.title} (${rec.priority})</h3>
            <p>${rec.description}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>`;
  }
}
