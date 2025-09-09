import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/Logger';

/**
 * C# Code Transformer for converting Applitools/Percy/Sauce Labs to SmartUI
 */

export interface CSharpTransformationResult {
  success: boolean;
  changes: CSharpChange[];
  errors: string[];
}

export interface CSharpChange {
  type: 'import' | 'variable' | 'method_call' | 'class_instantiation' | 'using_statement';
  line: number;
  oldCode: string;
  newCode: string;
  description: string;
}

export class CSharpCodeTransformer {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Transform C# code from Applitools to SmartUI
   */
  public async transformFile(filePath: string, platform: string, framework: string): Promise<CSharpTransformationResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const lines = content.split('\n');
      const changes: CSharpChange[] = [];
      const errors: string[] = [];

      if (this.verbose) logger.debug(`Transforming C# file: ${filePath}`);

      // Transform based on platform
      switch (platform) {
        case 'Applitools':
          await this.transformApplitoolsCode(lines, changes, errors, framework);
          break;
        case 'Percy':
          await this.transformPercyCode(lines, changes, errors, framework);
          break;
        case 'Sauce Labs':
          await this.transformSauceLabsCode(lines, changes, errors, framework);
          break;
        default:
          errors.push(`Unsupported platform: ${platform}`);
      }

      if (changes.length > 0) {
        const transformedContent = this.applyChanges(lines, changes);
        await fs.writeFile(filePath, transformedContent, 'utf-8');
        
        if (this.verbose) logger.debug(`Applied ${changes.length} changes to ${filePath}`);
      }

      return {
        success: errors.length === 0,
        changes,
        errors
      };

    } catch (error) {
      return {
        success: false,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Transform Applitools C# code to SmartUI
   */
  private async transformApplitoolsCode(
    lines: string[],
    changes: CSharpChange[],
    errors: string[],
    framework: string
  ): Promise<void> {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmedLine = line.trim();

      // Transform using statements
      if (trimmedLine.startsWith('using Applitools')) {
        const newUsing = this.transformApplitoolsUsing(trimmedLine, framework);
        if (newUsing) {
          changes.push({
            type: 'using_statement',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newUsing),
            description: `Replace Applitools using statement with SmartUI`
          });
        }
      }

      // Transform class declarations
      if (trimmedLine.includes('Eyes') && !trimmedLine.includes('SmartUI')) {
        const newClass = this.transformApplitoolsClass(trimmedLine, framework);
        if (newClass) {
          changes.push({
            type: 'class_instantiation',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newClass),
            description: `Replace Applitools Eyes class with SmartUI`
          });
        }
      }

      // Transform variable declarations
      if (trimmedLine.includes('Eyes eyes') || trimmedLine.includes('Eyes eyes =')) {
        const newVariable = this.transformApplitoolsVariable(trimmedLine, framework);
        if (newVariable) {
          changes.push({
            type: 'variable',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newVariable),
            description: `Replace Applitools Eyes variable with SmartUI`
          });
        }
      }

      // Transform method calls
      if (trimmedLine.includes('eyes.') && !trimmedLine.includes('SmartUI')) {
        const newMethodCall = this.transformApplitoolsMethodCall(trimmedLine, framework);
        if (newMethodCall) {
          changes.push({
            type: 'method_call',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newMethodCall),
            description: `Replace Applitools method call with SmartUI`
          });
        }
      }
    }
  }

  /**
   * Transform Percy C# code to SmartUI
   */
  private async transformPercyCode(
    lines: string[],
    changes: CSharpChange[],
    errors: string[],
    framework: string
  ): Promise<void> {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmedLine = line.trim();

      // Transform using statements
      if (trimmedLine.startsWith('using Percy')) {
        const newUsing = this.transformPercyUsing(trimmedLine, framework);
        if (newUsing) {
          changes.push({
            type: 'using_statement',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newUsing),
            description: `Replace Percy using statement with SmartUI`
          });
        }
      }

      // Transform method calls
      if (trimmedLine.includes('percy.') || trimmedLine.includes('Percy.')) {
        const newMethodCall = this.transformPercyMethodCall(trimmedLine, framework);
        if (newMethodCall) {
          changes.push({
            type: 'method_call',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newMethodCall),
            description: `Replace Percy method call with SmartUI`
          });
        }
      }
    }
  }

  /**
   * Transform Sauce Labs C# code to SmartUI
   */
  private async transformSauceLabsCode(
    lines: string[],
    changes: CSharpChange[],
    errors: string[],
    framework: string
  ): Promise<void> {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line) continue;
      const trimmedLine = line.trim();

      // Transform using statements
      if (trimmedLine.startsWith('using SauceLabs')) {
        const newUsing = this.transformSauceLabsUsing(trimmedLine, framework);
        if (newUsing) {
          changes.push({
            type: 'using_statement',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newUsing),
            description: `Replace Sauce Labs using statement with SmartUI`
          });
        }
      }

      // Transform method calls
      if (trimmedLine.includes('sauce.') || trimmedLine.includes('SauceLabs.')) {
        const newMethodCall = this.transformSauceLabsMethodCall(trimmedLine, framework);
        if (newMethodCall) {
          changes.push({
            type: 'method_call',
            line: i + 1,
            oldCode: line,
            newCode: line.replace(trimmedLine, newMethodCall),
            description: `Replace Sauce Labs method call with SmartUI`
          });
        }
      }
    }
  }

  // Applitools transformation methods

  private transformApplitoolsUsing(usingStatement: string, framework: string): string | null {
    if (usingStatement.includes('Applitools.Eyes')) {
      return 'using LambdaTest.SmartUI;';
    }
    if (usingStatement.includes('Applitools.Selenium')) {
      return 'using LambdaTest.SmartUI;';
    }
    if (usingStatement.includes('Applitools.Playwright')) {
      return 'using LambdaTest.SmartUI;';
    }
    return null;
  }

  private transformApplitoolsClass(classDeclaration: string, framework: string): string | null {
    if (classDeclaration.includes('Eyes eyes')) {
      return classDeclaration.replace('Eyes eyes', 'SmartUI eyes');
    }
    if (classDeclaration.includes('Eyes eyes =')) {
      return classDeclaration.replace('Eyes eyes =', 'SmartUI eyes =');
    }
    return null;
  }

  private transformApplitoolsVariable(variableDeclaration: string, framework: string): string | null {
    if (variableDeclaration.includes('Eyes eyes')) {
      return variableDeclaration.replace('Eyes eyes', 'SmartUI eyes');
    }
    return null;
  }

  private transformApplitoolsMethodCall(methodCall: string, framework: string): string | null {
    // Transform eyes.Open() to SmartUI initialization
    if (methodCall.includes('eyes.Open(')) {
      return methodCall.replace('eyes.Open(', 'eyes = new SmartUI(');
    }

    // Transform eyes.Check() to SmartUI snapshot
    if (methodCall.includes('eyes.Check(')) {
      const snapshotName = this.extractSnapshotName(methodCall);
      if (framework === 'Playwright') {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      } else {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      }
    }

    // Transform eyes.Close() to SmartUI cleanup
    if (methodCall.includes('eyes.Close()')) {
      return '// SmartUI cleanup handled automatically';
    }

    return null;
  }

  // Percy transformation methods

  private transformPercyUsing(usingStatement: string, framework: string): string | null {
    if (usingStatement.includes('Percy')) {
      return 'using LambdaTest.SmartUI;';
    }
    return null;
  }

  private transformPercyMethodCall(methodCall: string, framework: string): string | null {
    // Transform percy.snapshot() to SmartUI snapshot
    if (methodCall.includes('percy.snapshot(') || methodCall.includes('Percy.snapshot(')) {
      const snapshotName = this.extractSnapshotName(methodCall);
      if (framework === 'Playwright') {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      } else {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      }
    }

    return null;
  }

  // Sauce Labs transformation methods

  private transformSauceLabsUsing(usingStatement: string, framework: string): string | null {
    if (usingStatement.includes('SauceLabs')) {
      return 'using LambdaTest.SmartUI;';
    }
    return null;
  }

  private transformSauceLabsMethodCall(methodCall: string, framework: string): string | null {
    // Transform sauce.screenshot() to SmartUI snapshot
    if (methodCall.includes('sauce.screenshot(') || methodCall.includes('SauceLabs.screenshot(')) {
      const snapshotName = this.extractSnapshotName(methodCall);
      if (framework === 'Playwright') {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      } else {
        return `SmartUISnapshot.SmartUISnapshot(driver, "${snapshotName}");`;
      }
    }

    return null;
  }

  // Helper methods

  private extractSnapshotName(methodCall: string): string {
    // Extract snapshot name from method call
    const match = methodCall.match(/["']([^"']+)["']/);
    return match ? match[1] || 'snapshot' : 'snapshot';
  }

  private applyChanges(lines: string[], changes: CSharpChange[]): string {
    // Sort changes by line number in descending order to avoid index issues
    const sortedChanges = changes.sort((a, b) => b.line - a.line);

    for (const change of sortedChanges) {
      const lineIndex = change.line - 1;
      if (lineIndex >= 0 && lineIndex < lines.length) {
        lines[lineIndex] = change.newCode;
      }
    }

    return lines.join('\n');
  }

  /**
   * Get import mappings for C# projects
   */
  public getImportMappings(platform: string, framework: string): { [key: string]: string } {
    const mappings: { [key: string]: string } = {};

    switch (platform) {
      case 'Applitools':
        mappings['Applitools.Eyes'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Selenium'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Playwright'] = 'LambdaTest.SmartUI';
        break;
      case 'Percy':
        mappings['Percy'] = 'LambdaTest.SmartUI';
        break;
      case 'Sauce Labs':
        mappings['SauceLabs'] = 'LambdaTest.SmartUI';
        break;
    }

    return mappings;
  }

  /**
   * Get method mappings for C# projects
   */
  public getMethodMappings(platform: string, framework: string): { [key: string]: string } {
    const mappings: { [key: string]: string } = {};

    switch (platform) {
      case 'Applitools':
        mappings['eyes.Open'] = 'new SmartUI';
        mappings['eyes.Check'] = 'SmartUISnapshot.SmartUISnapshot';
        mappings['eyes.Close'] = '// SmartUI cleanup';
        break;
      case 'Percy':
        mappings['percy.snapshot'] = 'SmartUISnapshot.SmartUISnapshot';
        mappings['Percy.snapshot'] = 'SmartUISnapshot.SmartUISnapshot';
        break;
      case 'Sauce Labs':
        mappings['sauce.screenshot'] = 'SmartUISnapshot.SmartUISnapshot';
        mappings['SauceLabs.screenshot'] = 'SmartUISnapshot.SmartUISnapshot';
        break;
    }

    return mappings;
  }
}
