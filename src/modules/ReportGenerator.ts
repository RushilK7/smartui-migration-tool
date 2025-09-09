import * as path from 'path';
import * as fs from 'fs/promises';
import { ChangeTracker, MigrationReport, ChangeDetail, FileChange, DependencyChange, ValidationResult, Recommendation } from './ChangeTracker';
import { logger } from '../utils/Logger';

/**
 * Report generation system for comprehensive migration reporting
 */

export interface ReportOptions {
  format: 'json' | 'markdown' | 'html' | 'pdf';
  outputPath?: string;
  includeDetails?: boolean;
  includeCodeDiffs?: boolean;
  includeRecommendations?: boolean;
  includeValidationResults?: boolean;
}

export interface ReportGenerationResult {
  success: boolean;
  outputPath: string;
  format: string;
  size: number;
  error?: string;
}

export class ReportGenerator {
  private changeTracker: ChangeTracker;
  private verbose: boolean;

  constructor(changeTracker: ChangeTracker, verbose: boolean = false) {
    this.changeTracker = changeTracker;
    this.verbose = verbose;
  }

  /**
   * Generate comprehensive migration report
   */
  public async generateReport(
    report: MigrationReport,
    options: ReportOptions
  ): Promise<ReportGenerationResult> {
    try {
      const outputPath = options.outputPath || this.generateDefaultOutputPath(report, options.format);
      
      if (this.verbose) logger.debug(`Generating ${options.format.toUpperCase()} report: ${outputPath}`);
      
      let result: ReportGenerationResult;
      
      switch (options.format) {
        case 'json':
          result = await this.generateJSONReport(report, outputPath);
          break;
        case 'markdown':
          result = await this.generateMarkdownReport(report, outputPath, options);
          break;
        case 'html':
          result = await this.generateHTMLReport(report, outputPath, options);
          break;
        case 'pdf':
          result = await this.generatePDFReport(report, outputPath, options);
          break;
        default:
          throw new Error(`Unsupported report format: ${options.format}`);
      }
      
      if (this.verbose) logger.debug(`Report generated successfully: ${result.outputPath} (${result.size} bytes)`);
      return result;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`Failed to generate report: ${errorMessage}`);
      
      return {
        success: false,
        outputPath: '',
        format: options.format,
        size: 0,
        error: errorMessage
      };
    }
  }

  /**
   * Generate multiple report formats
   */
  public async generateMultipleFormats(
    report: MigrationReport,
    baseOutputPath: string,
    formats: string[] = ['json', 'markdown', 'html']
  ): Promise<ReportGenerationResult[]> {
    const results: ReportGenerationResult[] = [];
    
    for (const format of formats) {
      const options: ReportOptions = {
        format: format as any,
        outputPath: this.generateFormatSpecificPath(baseOutputPath, format),
        includeDetails: true,
        includeCodeDiffs: true,
        includeRecommendations: true,
        includeValidationResults: true
      };
      
      const result = await this.generateReport(report, options);
      results.push(result);
    }
    
    return results;
  }

  /**
   * Generate executive summary report
   */
  public async generateExecutiveSummary(
    report: MigrationReport,
    outputPath: string
  ): Promise<ReportGenerationResult> {
    const summary = this.createExecutiveSummary(report);
    const markdown = this.formatExecutiveSummary(summary);
    
    try {
      await fs.writeFile(outputPath, markdown, 'utf-8');
      const stats = await fs.stat(outputPath);
      
      return {
        success: true,
        outputPath,
        format: 'markdown',
        size: stats.size
      };
    } catch (error) {
      return {
        success: false,
        outputPath: '',
        format: 'markdown',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate detailed change log
   */
  public async generateChangeLog(
    report: MigrationReport,
    outputPath: string
  ): Promise<ReportGenerationResult> {
    const changeLog = this.createDetailedChangeLog(report);
    const markdown = this.formatChangeLog(changeLog);
    
    try {
      await fs.writeFile(outputPath, markdown, 'utf-8');
      const stats = await fs.stat(outputPath);
      
      return {
        success: true,
        outputPath,
        format: 'markdown',
        size: stats.size
      };
    } catch (error) {
      return {
        success: false,
        outputPath: '',
        format: 'markdown',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Private methods

  private async generateJSONReport(report: MigrationReport, outputPath: string): Promise<ReportGenerationResult> {
    const jsonContent = JSON.stringify(report, null, 2);
    await fs.writeFile(outputPath, jsonContent, 'utf-8');
    const stats = await fs.stat(outputPath);
    
    return {
      success: true,
      outputPath,
      format: 'json',
      size: stats.size
    };
  }

  private async generateMarkdownReport(
    report: MigrationReport, 
    outputPath: string, 
    options: ReportOptions
  ): Promise<ReportGenerationResult> {
    const markdown = this.createMarkdownReport(report, options);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    const stats = await fs.stat(outputPath);
    
    return {
      success: true,
      outputPath,
      format: 'markdown',
      size: stats.size
    };
  }

  private async generateHTMLReport(
    report: MigrationReport, 
    outputPath: string, 
    options: ReportOptions
  ): Promise<ReportGenerationResult> {
    const html = this.createHTMLReport(report, options);
    await fs.writeFile(outputPath, html, 'utf-8');
    const stats = await fs.stat(outputPath);
    
    return {
      success: true,
      outputPath,
      format: 'html',
      size: stats.size
    };
  }

  private async generatePDFReport(
    report: MigrationReport, 
    outputPath: string, 
    options: ReportOptions
  ): Promise<ReportGenerationResult> {
    // For now, generate HTML and note that PDF conversion would require additional libraries
    const html = this.createHTMLReport(report, options);
    const htmlPath = outputPath.replace('.pdf', '.html');
    
    await fs.writeFile(htmlPath, html, 'utf-8');
    const stats = await fs.stat(htmlPath);
    
    return {
      success: true,
      outputPath: htmlPath,
      format: 'html',
      size: stats.size,
      error: 'PDF conversion not implemented. Generated HTML version instead.'
    };
  }

  private generateDefaultOutputPath(report: MigrationReport, format: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const projectName = path.basename(report.metadata.projectPath);
    return `migration-report-${projectName}-${timestamp}.${format}`;
  }

  private generateFormatSpecificPath(basePath: string, format: string): string {
    const ext = path.extname(basePath);
    const base = basePath.replace(ext, '');
    return `${base}.${format}`;
  }

  private createMarkdownReport(report: MigrationReport, options: ReportOptions): string {
    const { summary, fileChanges, dependencyChanges, scriptChanges, validationResults, recommendations, metadata } = report;
    
    let markdown = `# SmartUI Migration Report\n\n`;
    
    // Header
    markdown += `**Migration Date:** ${metadata.migrationDate.toLocaleString()}\n`;
    markdown += `**Tool Version:** ${metadata.toolVersion}\n`;
    markdown += `**Project:** ${metadata.projectPath}\n`;
    markdown += `**Platform:** ${metadata.platform} | **Framework:** ${metadata.framework} | **Language:** ${metadata.language}\n\n`;
    
    // Executive Summary
    markdown += `## 📊 Executive Summary\n\n`;
    markdown += `| Metric | Value |\n`;
    markdown += `|--------|-------|\n`;
    markdown += `| Total Files | ${summary.totalFiles} |\n`;
    markdown += `| Files Modified | ${summary.filesModified} |\n`;
    markdown += `| Files Created | ${summary.filesCreated} |\n`;
    markdown += `| Snapshots Migrated | ${summary.snapshotsMigrated} |\n`;
    markdown += `| Dependencies Changed | ${summary.dependenciesChanged} |\n`;
    markdown += `| Migration Time | ${Math.round(summary.migrationTime / 1000)}s |\n`;
    markdown += `| Success Rate | ${summary.successRate}% |\n\n`;
    
    // File Changes
    if (fileChanges.length > 0 && options.includeDetails) {
      markdown += `## 📁 File Changes\n\n`;
      fileChanges.forEach(fileChange => {
        markdown += `### ${fileChange.filePath}\n`;
        markdown += `- **Type:** ${fileChange.changeType}\n`;
        markdown += `- **Risk Level:** ${this.getRiskEmoji(fileChange.riskLevel)} ${fileChange.riskLevel}\n`;
        markdown += `- **Changes:** ${fileChange.changes.length}\n`;
        if (fileChange.snapshotCount) markdown += `- **Snapshots:** ${fileChange.snapshotCount}\n`;
        if (fileChange.dependencyCount) markdown += `- **Dependencies:** ${fileChange.dependencyCount}\n`;
        markdown += `- **Summary:** ${fileChange.summary}\n\n`;
        
        if (options.includeCodeDiffs && fileChange.changes.length > 0) {
          markdown += `#### Detailed Changes\n\n`;
          fileChange.changes.forEach(change => {
            markdown += `- **Line ${change.lineNumber || 'N/A'}:** ${change.description}\n`;
            if (change.originalContent && change.newContent) {
              markdown += `  - **Before:** \`${change.originalContent.trim()}\`\n`;
              markdown += `  - **After:** \`${change.newContent.trim()}\`\n`;
            }
          });
          markdown += `\n`;
        }
      });
    }
    
    // Dependency Changes
    if (dependencyChanges.length > 0) {
      markdown += `## 📦 Dependency Changes\n\n`;
      markdown += `| Type | Package | Old Version | New Version | Reason |\n`;
      markdown += `|------|---------|-------------|-------------|--------|\n`;
      dependencyChanges.forEach(depChange => {
        markdown += `| ${depChange.type} | ${depChange.package} | ${depChange.oldVersion || 'N/A'} | ${depChange.newVersion || 'N/A'} | ${depChange.reason} |\n`;
      });
      markdown += `\n`;
    }
    
    // Script Changes
    if (scriptChanges.length > 0) {
      markdown += `## 🔧 Script Changes\n\n`;
      scriptChanges.forEach(scriptChange => {
        markdown += `### ${scriptChange.filePath} - ${scriptChange.scriptName}\n`;
        markdown += `- **Type:** ${scriptChange.changeType}\n`;
        markdown += `- **Description:** ${scriptChange.description}\n`;
        if (scriptChange.oldScript && scriptChange.newScript) {
          markdown += `- **Before:** \`${scriptChange.oldScript}\`\n`;
          markdown += `- **After:** \`${scriptChange.newScript}\`\n`;
        }
        markdown += `\n`;
      });
    }
    
    // Validation Results
    if (validationResults.length > 0 && options.includeValidationResults) {
      markdown += `## ✅ Validation Results\n\n`;
      const successCount = validationResults.filter(vr => vr.type === 'SUCCESS').length;
      const warningCount = validationResults.filter(vr => vr.type === 'WARNING').length;
      const errorCount = validationResults.filter(vr => vr.type === 'ERROR').length;
      
      markdown += `- ✅ **Success:** ${successCount}\n`;
      markdown += `- ⚠️ **Warnings:** ${warningCount}\n`;
      markdown += `- ❌ **Errors:** ${errorCount}\n\n`;
      
      if (warningCount > 0 || errorCount > 0) {
        markdown += `### Issues Found\n\n`;
        validationResults
          .filter(vr => vr.type !== 'SUCCESS')
          .forEach(result => {
            markdown += `- **${this.getValidationEmoji(result.type)} ${result.type}:** ${result.message}\n`;
            if (result.filePath) markdown += `  - *File:* ${result.filePath}\n`;
            if (result.suggestion) markdown += `  - *Suggestion:* ${result.suggestion}\n`;
          });
        markdown += `\n`;
      }
    }
    
    // Recommendations
    if (recommendations.length > 0 && options.includeRecommendations) {
      markdown += `## 💡 Recommendations\n\n`;
      recommendations.forEach(rec => {
        markdown += `### ${this.getRecommendationEmoji(rec.type)} ${rec.title} (${rec.priority})\n`;
        markdown += `${rec.description}\n`;
        if (rec.action) markdown += `\n**Action:** ${rec.action}\n`;
        markdown += `\n`;
      });
    }
    
    // Next Steps
    markdown += `## 🚀 Next Steps\n\n`;
    markdown += `1. **Install SmartUI Dependencies:** Run \`npm install @lambdatest/smartui-cli\` or equivalent for your package manager\n`;
    markdown += `2. **Configure SmartUI:** Set up your SmartUI credentials and project configuration\n`;
    markdown += `3. **Update Environment Variables:** Configure your CI/CD environment with SmartUI tokens\n`;
    markdown += `4. **Test Migration:** Run your migrated tests to verify functionality\n`;
    markdown += `5. **Check SmartUI Dashboard:** Verify test results in the SmartUI dashboard\n\n`;
    
    markdown += `## 📞 Support\n\n`;
    markdown += `- **Documentation:** https://github.com/lambdatest/smartui-migration-tool\n`;
    markdown += `- **Issues:** https://github.com/lambdatest/smartui-migration-tool/issues\n`;
    markdown += `- **SmartUI Docs:** https://www.lambdatest.com/smart-ui\n\n`;
    
    return markdown;
  }

  private createHTMLReport(report: MigrationReport, options: ReportOptions): string {
    const { summary, fileChanges, dependencyChanges, scriptChanges, validationResults, recommendations, metadata } = report;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SmartUI Migration Report</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            background: #f8f9fa;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 40px; 
            border-radius: 10px; 
            margin-bottom: 30px; 
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.1em; opacity: 0.9; }
        .summary { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
            gap: 20px; 
            margin: 30px 0; 
        }
        .summary-item { 
            background: white; 
            padding: 25px; 
            border-radius: 10px; 
            text-align: center; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.2s;
        }
        .summary-item:hover { transform: translateY(-2px); }
        .summary-item h3 { 
            margin: 0 0 10px 0; 
            color: #667eea; 
            font-size: 0.9em;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .summary-item p { 
            margin: 0; 
            font-size: 2em; 
            font-weight: bold; 
            color: #2c3e50; 
        }
        .section { 
            background: white; 
            margin: 30px 0; 
            border-radius: 10px; 
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .section-header { 
            background: #f8f9fa; 
            padding: 20px; 
            border-bottom: 1px solid #e9ecef; 
            font-size: 1.3em; 
            font-weight: 600;
        }
        .section-content { padding: 20px; }
        .file-change { 
            background: #f8f9fa; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border-left: 4px solid #667eea; 
        }
        .file-change h3 { margin: 0 0 10px 0; color: #2c3e50; }
        .file-change .meta { 
            display: flex; 
            gap: 20px; 
            margin: 10px 0; 
            font-size: 0.9em; 
            color: #6c757d;
        }
        .validation-success { color: #28a745; }
        .validation-warning { color: #ffc107; }
        .validation-error { color: #dc3545; }
        .recommendation { 
            background: #fff3cd; 
            padding: 20px; 
            margin: 15px 0; 
            border-radius: 8px; 
            border-left: 4px solid #ffc107; 
        }
        .recommendation h3 { margin: 0 0 10px 0; color: #856404; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0; 
        }
        th, td { 
            padding: 12px; 
            text-align: left; 
            border-bottom: 1px solid #dee2e6; 
        }
        th { 
            background-color: #f8f9fa; 
            font-weight: 600;
            color: #495057;
        }
        .risk-low { color: #28a745; }
        .risk-medium { color: #ffc107; }
        .risk-high { color: #dc3545; }
        .next-steps { 
            background: #e7f3ff; 
            padding: 25px; 
            border-radius: 10px; 
            margin: 30px 0; 
        }
        .next-steps h2 { color: #0056b3; margin-bottom: 15px; }
        .next-steps ol { padding-left: 20px; }
        .next-steps li { margin: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 SmartUI Migration Report</h1>
            <p>Migration completed on ${metadata.migrationDate.toLocaleString()}</p>
            <p>Tool Version: ${metadata.toolVersion} | Platform: ${metadata.platform} | Framework: ${metadata.framework}</p>
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
            <div class="section-header">📁 File Changes</div>
            <div class="section-content">
                ${fileChanges.map(fc => `
                <div class="file-change">
                    <h3>${fc.filePath}</h3>
                    <div class="meta">
                        <span><strong>Type:</strong> ${fc.changeType}</span>
                        <span><strong>Risk:</strong> <span class="risk-${fc.riskLevel.toLowerCase()}">${fc.riskLevel}</span></span>
                        <span><strong>Changes:</strong> ${fc.changes.length}</span>
                        ${fc.snapshotCount ? `<span><strong>Snapshots:</strong> ${fc.snapshotCount}</span>` : ''}
                    </div>
                    <p>${fc.summary}</p>
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${dependencyChanges.length > 0 ? `
        <div class="section">
            <div class="section-header">📦 Dependency Changes</div>
            <div class="section-content">
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Package</th>
                            <th>Old Version</th>
                            <th>New Version</th>
                            <th>Reason</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${dependencyChanges.map(dc => `
                        <tr>
                            <td>${dc.type}</td>
                            <td>${dc.package}</td>
                            <td>${dc.oldVersion || 'N/A'}</td>
                            <td>${dc.newVersion || 'N/A'}</td>
                            <td>${dc.reason}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        ` : ''}
        
        ${validationResults.length > 0 ? `
        <div class="section">
            <div class="section-header">✅ Validation Results</div>
            <div class="section-content">
                ${validationResults.map(vr => `
                <p class="validation-${vr.type.toLowerCase()}">
                    <strong>${vr.type}:</strong> ${vr.message}
                    ${vr.suggestion ? `<br><em>Suggestion:</em> ${vr.suggestion}` : ''}
                </p>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        ${recommendations.length > 0 ? `
        <div class="section">
            <div class="section-header">💡 Recommendations</div>
            <div class="section-content">
                ${recommendations.map(rec => `
                <div class="recommendation">
                    <h3>${rec.title} (${rec.priority})</h3>
                    <p>${rec.description}</p>
                    ${rec.action ? `<p><strong>Action:</strong> ${rec.action}</p>` : ''}
                </div>
                `).join('')}
            </div>
        </div>
        ` : ''}
        
        <div class="next-steps">
            <h2>🚀 Next Steps</h2>
            <ol>
                <li><strong>Install SmartUI Dependencies:</strong> Run <code>npm install @lambdatest/smartui-cli</code> or equivalent for your package manager</li>
                <li><strong>Configure SmartUI:</strong> Set up your SmartUI credentials and project configuration</li>
                <li><strong>Update Environment Variables:</strong> Configure your CI/CD environment with SmartUI tokens</li>
                <li><strong>Test Migration:</strong> Run your migrated tests to verify functionality</li>
                <li><strong>Check SmartUI Dashboard:</strong> Verify test results in the SmartUI dashboard</li>
            </ol>
        </div>
    </div>
</body>
</html>`;
  }

  private createExecutiveSummary(report: MigrationReport): any {
    return {
      project: report.metadata.projectPath,
      platform: report.metadata.platform,
      framework: report.metadata.framework,
      language: report.metadata.language,
      migrationDate: report.metadata.migrationDate,
      successRate: report.summary.successRate,
      totalFiles: report.summary.totalFiles,
      filesModified: report.summary.filesModified,
      snapshotsMigrated: report.summary.snapshotsMigrated,
      migrationTime: report.summary.migrationTime,
      validationErrors: report.summary.validationErrors,
      validationWarnings: report.summary.validationWarnings
    };
  }

  private formatExecutiveSummary(summary: any): string {
    return `# SmartUI Migration Executive Summary

## Project Overview
- **Project:** ${summary.project}
- **Platform:** ${summary.platform}
- **Framework:** ${summary.framework}
- **Language:** ${summary.language}
- **Migration Date:** ${summary.migrationDate.toLocaleString()}

## Migration Results
- **Success Rate:** ${summary.successRate}%
- **Total Files:** ${summary.totalFiles}
- **Files Modified:** ${summary.filesModified}
- **Snapshots Migrated:** ${summary.snapshotsMigrated}
- **Migration Time:** ${Math.round(summary.migrationTime / 1000)}s

## Validation Status
- **Errors:** ${summary.validationErrors}
- **Warnings:** ${summary.validationWarnings}

## Recommendation
${summary.successRate >= 95 ? '✅ Migration completed successfully with high confidence.' : 
  summary.successRate >= 80 ? '⚠️ Migration completed with some issues that need attention.' : 
  '❌ Migration completed with significant issues that require immediate attention.'}
`;
  }

  private createDetailedChangeLog(report: MigrationReport): any {
    return {
      metadata: report.metadata,
      changes: report.fileChanges.flatMap(fc => fc.changes),
      dependencies: report.dependencyChanges,
      scripts: report.scriptChanges
    };
  }

  private formatChangeLog(changeLog: any): string {
    let markdown = `# Detailed Change Log\n\n`;
    markdown += `**Project:** ${changeLog.metadata.projectPath}\n`;
    markdown += `**Date:** ${changeLog.metadata.migrationDate.toLocaleString()}\n\n`;
    
    markdown += `## All Changes\n\n`;
    changeLog.changes.forEach((change: ChangeDetail, index: number) => {
      markdown += `### Change ${index + 1}: ${change.filePath}\n`;
      markdown += `- **Type:** ${change.changeType}\n`;
      markdown += `- **Line:** ${change.lineNumber || 'N/A'}\n`;
      markdown += `- **Description:** ${change.description}\n`;
      markdown += `- **Risk:** ${change.riskLevel}\n`;
      markdown += `- **Timestamp:** ${change.timestamp.toLocaleString()}\n\n`;
    });
    
    return markdown;
  }

  private getRiskEmoji(riskLevel: string): string {
    switch (riskLevel) {
      case 'LOW': return '🟢';
      case 'MEDIUM': return '🟡';
      case 'HIGH': return '🔴';
      default: return '⚪';
    }
  }

  private getValidationEmoji(type: string): string {
    switch (type) {
      case 'SUCCESS': return '✅';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      default: return 'ℹ️';
    }
  }

  private getRecommendationEmoji(type: string): string {
    switch (type) {
      case 'ACTION': return '🎯';
      case 'OPTIMIZATION': return '⚡';
      case 'SECURITY': return '🔒';
      case 'PERFORMANCE': return '🚀';
      default: return '💡';
    }
  }
}
