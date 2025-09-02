import { parse } from 'java-parser';
import { CodeTransformationResult, TransformationWarning } from '../types';

/**
 * JavaCodeTransformer module for transforming Java test code from visual testing platforms to SmartUI
 * Uses java-parser for AST-based transformation of Java source code
 */
export class JavaCodeTransformer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Transforms Java source code from visual testing platforms to SmartUI format
   * @param sourceCode - The Java source code to transform
   * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
   * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
   */
  public transform(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): CodeTransformationResult {
    const warnings: TransformationWarning[] = [];
    let snapshotCount = 0;

    try {
      // For now, use regex-based transformation as a fallback
      // This ensures the tool works even if the Java parser has issues
      const transformedCode = this.transformWithRegex(sourceCode, platform, warnings);
      
      // Count snapshots using regex
      snapshotCount = this.countSnapshotsWithRegex(sourceCode, platform);

      return {
        content: transformedCode,
        warnings,
        snapshotCount
      };

    } catch (error) {
      // Handle transformation errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown transformation error';
      warnings.push({
        message: `Failed to transform Java source code: ${errorMessage}`,
        details: 'The Java file may contain unsupported syntax or be malformed.'
      });

      return {
        content: sourceCode, // Return original code on error
        warnings,
        snapshotCount: 0
      };
    }
  }

  /**
   * Transforms Java code using regex patterns
   * @param sourceCode - The original Java source code
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @param snapshotCount - Reference to snapshot count
   * @returns The transformed Java code
   */
  private transformWithRegex(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): string {
    let transformedCode = sourceCode;

    // Transform import statements
    transformedCode = this.transformImports(transformedCode, platform);

    // Transform method calls based on platform
    switch (platform) {
      case 'Percy':
        transformedCode = this.transformPercyMethods(transformedCode);
        break;
      case 'Applitools':
        transformedCode = this.transformApplitoolsMethods(transformedCode);
        break;
      case 'Sauce Labs Visual':
        transformedCode = this.transformSauceLabsMethods(transformedCode);
        break;
    }

    return transformedCode;
  }

  /**
   * Transforms import statements
   * @param sourceCode - The Java source code
   * @param platform - The source platform
   * @returns The transformed code
   */
  private transformImports(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): string {
    let transformedCode = sourceCode;

    const importMappings = this.getImportMappings(platform);
    
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      const importRegex = new RegExp(`import\\s+${oldImport.replace(/\./g, '\\.')};`, 'g');
      transformedCode = transformedCode.replace(importRegex, `import ${newImport};`);
    }

    return transformedCode;
  }

  /**
   * Gets import mappings for the current platform
   * @param platform - The source platform
   * @returns Object mapping old imports to new imports
   */
  private getImportMappings(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): { [key: string]: string } {
    switch (platform) {
      case 'Percy':
        return {
          'io.percy.selenium.Percy': 'io.github.lambdatest.SmartUISnapshot',
          'io.percy.selenium': 'io.github.lambdatest.SmartUISnapshot'
        };
      case 'Applitools':
        return {
          'com.applitools.eyes.selenium.Eyes': 'io.github.lambdatest.SmartUISnapshot',
          'com.applitools.eyes.selenium': 'io.github.lambdatest.SmartUISnapshot',
          'com.applitools.eyes': 'io.github.lambdatest.SmartUISnapshot'
        };
      case 'Sauce Labs Visual':
        return {
          'com.saucelabs.visual.VisualApi': 'io.github.lambdatest.SmartUISnapshot',
          'com.saucelabs.visual': 'io.github.lambdatest.SmartUISnapshot'
        };
      default:
        return {};
    }
  }

  /**
   * Transforms Percy method calls
   * @param sourceCode - The Java source code
   * @returns The transformed code
   */
  private transformPercyMethods(sourceCode: string): string {
    // Transform percy.snapshot("name") to SmartUISnapshot.smartuiSnapshot(driver, "name")
    const percySnapshotRegex = /(\w+)\.snapshot\s*\(\s*"([^"]+)"\s*\)/g;
    return sourceCode.replace(percySnapshotRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
  }

  /**
   * Transforms Applitools method calls
   * @param sourceCode - The Java source code
   * @returns The transformed code
   */
  private transformApplitoolsMethods(sourceCode: string): string {
    let transformedCode = sourceCode;

    // Remove eyes.open() calls
    transformedCode = transformedCode.replace(/(\w+)\.open\s*\([^)]*\)\s*;?\s*/g, '');

    // Remove eyes.close() and eyes.closeAsync() calls
    transformedCode = transformedCode.replace(/(\w+)\.(close|closeAsync)\s*\(\s*\)\s*;?\s*/g, '');

    // Transform eyes.check() calls
    // Simple case: eyes.check("name")
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*"([^"]+)"\s*\)/g, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');

    // Complex case: eyes.check(Target.window().fully())
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*Target\.window\(\)\.fully\(\)\s*\)/g, 'SmartUISnapshot.smartuiSnapshot(driver, "Full Page")');

    // Case: eyes.check(Target.window())
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*Target\.window\(\)\s*\)/g, 'SmartUISnapshot.smartuiSnapshot(driver, "Full Page")');

    // Case: eyes.check(Target.region(...))
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*Target\.region\([^)]+\)[^)]*\)/g, 'SmartUISnapshot.smartuiSnapshot(driver, "Region")');

    // Case: eyes.check(Target.layout(...))
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*Target\.layout\([^)]+\)[^)]*\)/g, 'SmartUISnapshot.smartuiSnapshot(driver, "Layout")');

    return transformedCode;
  }

  /**
   * Transforms Sauce Labs method calls
   * @param sourceCode - The Java source code
   * @returns The transformed code
   */
  private transformSauceLabsMethods(sourceCode: string): string {
    // Transform visual.sauceVisualCheck("name") to SmartUISnapshot.smartuiSnapshot(driver, "name")
    const sauceVisualCheckRegex = /(\w+)\.sauceVisualCheck\s*\(\s*"([^"]+)"\s*\)/g;
    return sourceCode.replace(sauceVisualCheckRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
  }

  /**
   * Counts snapshots using regex patterns
   * @param sourceCode - The Java source code
   * @param platform - The source platform
   * @returns The number of snapshots found
   */
  private countSnapshotsWithRegex(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): number {
    let count = 0;

    switch (platform) {
      case 'Percy':
        const percySnapshotRegex = /(\w+)\.snapshot\s*\(\s*"([^"]+)"\s*\)/g;
        const percyMatches = sourceCode.match(percySnapshotRegex);
        count = percyMatches ? percyMatches.length : 0;
        break;
      case 'Applitools':
        const applitoolsCheckRegex = /(\w+)\.check\s*\(/g;
        const applitoolsMatches = sourceCode.match(applitoolsCheckRegex);
        count = applitoolsMatches ? applitoolsMatches.length : 0;
        break;
      case 'Sauce Labs Visual':
        const sauceVisualCheckRegex = /(\w+)\.sauceVisualCheck\s*\(\s*"([^"]+)"\s*\)/g;
        const sauceMatches = sourceCode.match(sauceVisualCheckRegex);
        count = sauceMatches ? sauceMatches.length : 0;
        break;
    }

    return count;
  }
}

/**
 * Visitor class for traversing and transforming Java CST nodes
 */
class JavaTransformationVisitor {
  private platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual';
  private warnings: TransformationWarning[];
  private snapshotCount: number;
  private layoutAssertions: Array<{ selector: string, line: number }>;

  constructor(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]) {
    this.platform = platform;
    this.warnings = warnings;
    this.snapshotCount = 0;
    this.layoutAssertions = [];
  }

  /**
   * Main visit method that dispatches to specific node visitors
   * @param node - The CST node to visit
   * @returns The transformed node
   */
  visit(node: any): any {
    if (!node) return node;

    const nodeType = node.name || node.constructor.name;
    
    switch (nodeType) {
      case 'CompilationUnit':
        return this.visitCompilationUnit(node);
      case 'ImportDeclaration':
        return this.visitImportDeclaration(node);
      case 'MethodInvocation':
        return this.visitMethodInvocation(node);
      case 'ExpressionStatement':
        return this.visitExpressionStatement(node);
      default:
        // For other node types, recursively visit children
        return this.visitChildren(node);
    }
  }

  /**
   * Visits a compilation unit (the root of a Java file)
   * @param node - The compilation unit node
   * @returns The transformed compilation unit
   */
  private visitCompilationUnit(node: any): any {
    const transformedNode = { ...node };
    
    // Visit all children
    if (node.children) {
      transformedNode.children = node.children.map((child: any) => this.visit(child));
    }
    
    return transformedNode;
  }

  /**
   * Visits an import declaration node
   * @param node - The import declaration node
   * @returns The transformed import declaration
   */
  private visitImportDeclaration(node: any): any {
    const transformedNode = { ...node };
    
    // Transform import statements based on platform
    if (node.children && node.children.qualifiedName) {
      const qualifiedName = this.extractQualifiedName(node.children.qualifiedName);
      
      if (this.shouldTransformImport(qualifiedName)) {
        const newImport = this.getSmartUIImport();
        transformedNode.children.qualifiedName = this.createQualifiedNameNode(newImport);
      }
    }
    
    return transformedNode;
  }

  /**
   * Visits a method invocation node
   * @param node - The method invocation node
   * @returns The transformed method invocation
   */
  private visitMethodInvocation(node: any): any {
    const methodName = this.extractMethodName(node);
    const className = this.extractClassName(node);
    
    // Check if this is a visual testing method call
    if (this.isVisualTestingMethod(methodName, className)) {
      return this.transformVisualTestingMethod(node);
    }
    
    return this.visitChildren(node);
  }

  /**
   * Visits an expression statement node
   * @param node - The expression statement node
   * @returns The transformed expression statement
   */
  private visitExpressionStatement(node: any): any {
    const transformedNode = { ...node };
    
    // Visit the expression
    if (node.children && node.children.expression) {
      transformedNode.children.expression = this.visit(node.children.expression);
    }
    
    return transformedNode;
  }

  /**
   * Recursively visits all children of a node
   * @param node - The node to visit
   * @returns The transformed node
   */
  private visitChildren(node: any): any {
    if (!node.children) return node;
    
    const transformedNode = { ...node };
    transformedNode.children = {};
    
    for (const [key, value] of Object.entries(node.children)) {
      if (Array.isArray(value)) {
        transformedNode.children[key] = value.map((item: any) => this.visit(item));
      } else if (value && typeof value === 'object') {
        transformedNode.children[key] = this.visit(value);
      } else {
        transformedNode.children[key] = value;
      }
    }
    
    return transformedNode;
  }

  /**
   * Extracts the qualified name from an import declaration
   * @param qualifiedNameNode - The qualified name node
   * @returns The qualified name as a string
   */
  private extractQualifiedName(qualifiedNameNode: any): string {
    if (!qualifiedNameNode) return '';
    
    // Traverse the qualified name structure to build the full name
    let name = '';
    let current = qualifiedNameNode;
    
    while (current) {
      if (current.children && current.children.Identifier) {
        name += current.children.Identifier[0].image;
        if (current.children.DOT) {
          name += '.';
        }
      }
      current = current.children?.qualifiedName;
    }
    
    return name;
  }

  /**
   * Checks if an import should be transformed
   * @param qualifiedName - The qualified name of the import
   * @returns True if the import should be transformed
   */
  private shouldTransformImport(qualifiedName: string): boolean {
    const importMappings = this.getImportMappings();
    return Object.keys(importMappings).some(oldImport => qualifiedName.startsWith(oldImport));
  }

  /**
   * Gets the SmartUI import for the current platform
   * @returns The SmartUI import string
   */
  private getSmartUIImport(): string {
    return 'io.github.lambdatest.SmartUISnapshot';
  }

  /**
   * Gets the import mappings for the current platform
   * @returns Object mapping old imports to new imports
   */
  private getImportMappings(): { [key: string]: string } {
    switch (this.platform) {
      case 'Percy':
        return {
          'io.percy.selenium.Percy': 'io.github.lambdatest.SmartUISnapshot',
          'io.percy.selenium': 'io.github.lambdatest.SmartUISnapshot'
        };
      case 'Applitools':
        return {
          'com.applitools.eyes.selenium.Eyes': 'io.github.lambdatest.SmartUISnapshot',
          'com.applitools.eyes.selenium': 'io.github.lambdatest.SmartUISnapshot',
          'com.applitools.eyes': 'io.github.lambdatest.SmartUISnapshot'
        };
      case 'Sauce Labs Visual':
        return {
          'com.saucelabs.visual.VisualApi': 'io.github.lambdatest.SmartUISnapshot',
          'com.saucelabs.visual': 'io.github.lambdatest.SmartUISnapshot'
        };
      default:
        return {};
    }
  }

  /**
   * Creates a qualified name node for the new import
   * @param qualifiedName - The qualified name string
   * @returns The qualified name node
   */
  private createQualifiedNameNode(qualifiedName: string): any {
    // This is a simplified implementation
    // In a real implementation, you would properly construct the CST node
    return {
      name: 'QualifiedName',
      children: {
        Identifier: [{ image: qualifiedName }]
      }
    };
  }

  /**
   * Extracts the method name from a method invocation node
   * @param node - The method invocation node
   * @returns The method name
   */
  private extractMethodName(node: any): string {
    if (node.children && node.children.Identifier) {
      const methodName = node.children.Identifier[0].image;
      console.log(`Extracted method name: ${methodName}`);
      return methodName;
    }
    console.log('No method name found in node:', JSON.stringify(node, null, 2));
    return '';
  }

  /**
   * Extracts the class name from a method invocation node
   * @param node - The method invocation node
   * @returns The class name
   */
  private extractClassName(node: any): string {
    if (node.children && node.children.primary) {
      const primary = node.children.primary[0];
      if (primary.children && primary.children.Identifier) {
        const className = primary.children.Identifier[0].image;
        console.log(`Extracted class name: ${className}`);
        return className;
      }
    }
    console.log('No class name found in node:', JSON.stringify(node, null, 2));
    return '';
  }

  /**
   * Checks if a method call is a visual testing method
   * @param methodName - The method name
   * @param className - The class name
   * @returns True if this is a visual testing method
   */
  private isVisualTestingMethod(methodName: string, className: string): boolean {
    // Debug logging
    console.log(`Checking method: ${className}.${methodName} for platform: ${this.platform}`);
    
    switch (this.platform) {
      case 'Percy':
        return (className === 'percy' && methodName === 'snapshot') ||
               (className === 'Percy' && methodName === 'snapshot');
      case 'Applitools':
        return (className === 'eyes' && (methodName === 'open' || methodName === 'close' || methodName === 'closeAsync' || methodName === 'check')) ||
               (className === 'Eyes' && (methodName === 'open' || methodName === 'close' || methodName === 'closeAsync' || methodName === 'check'));
      case 'Sauce Labs Visual':
        return (className === 'visual' && methodName === 'sauceVisualCheck') ||
               (className === 'VisualApi' && methodName === 'sauceVisualCheck');
      default:
        return false;
    }
  }

  /**
   * Transforms a visual testing method call
   * @param node - The method invocation node
   * @returns The transformed method invocation
   */
  private transformVisualTestingMethod(node: any): any {
    const methodName = this.extractMethodName(node);
    
    switch (this.platform) {
      case 'Percy':
        return this.transformPercyMethod(node, methodName);
      case 'Applitools':
        return this.transformApplitoolsMethod(node, methodName);
      case 'Sauce Labs Visual':
        return this.transformSauceLabsMethod(node, methodName);
      default:
        return node;
    }
  }

  /**
   * Transforms Percy method calls
   * @param node - The method invocation node
   * @param methodName - The method name
   * @returns The transformed method invocation
   */
  private transformPercyMethod(node: any, methodName: string): any {
    if (methodName === 'snapshot') {
      this.snapshotCount++;
      return this.createSmartUISnapshotCall(node);
    }
    return node;
  }

  /**
   * Transforms Applitools method calls
   * @param node - The method invocation node
   * @param methodName - The method name
   * @returns The transformed method invocation (or null for removed methods)
   */
  private transformApplitoolsMethod(node: any, methodName: string): any {
    if (methodName === 'open' || methodName === 'close' || methodName === 'closeAsync') {
      // Remove these method calls
      return null;
    } else if (methodName === 'check') {
      this.snapshotCount++;
      return this.createSmartUISnapshotCall(node);
    }
    return node;
  }

  /**
   * Transforms Sauce Labs method calls
   * @param node - The method invocation node
   * @param methodName - The method name
   * @returns The transformed method invocation
   */
  private transformSauceLabsMethod(node: any, methodName: string): any {
    if (methodName === 'sauceVisualCheck') {
      this.snapshotCount++;
      return this.createSmartUISnapshotCall(node);
    }
    return node;
  }

  /**
   * Creates a SmartUI snapshot method call
   * @param originalNode - The original method invocation node
   * @returns The transformed method invocation node
   */
  private createSmartUISnapshotCall(originalNode: any): any {
    // Extract arguments from the original call
    const args = this.extractMethodArguments(originalNode);
    const snapshotName = this.extractSnapshotName(args);
    const options = this.extractOptions(args);
    
    // Create the new SmartUI method call
    return {
      name: 'MethodInvocation',
      children: {
        primary: [{
          name: 'Primary',
          children: {
            Identifier: [{ image: 'SmartUISnapshot' }]
          }
        }],
        DOT: [{ image: '.' }],
        Identifier: [{ image: 'smartuiSnapshot' }],
        LPAREN: [{ image: '(' }],
        arguments: this.createSmartUIArguments(snapshotName, options),
        RPAREN: [{ image: ')' }]
      }
    };
  }

  /**
   * Extracts method arguments from a method invocation node
   * @param node - The method invocation node
   * @returns Array of argument nodes
   */
  private extractMethodArguments(node: any): any[] {
    if (node.children && node.children.arguments) {
      return node.children.arguments;
    }
    return [];
  }

  /**
   * Extracts the snapshot name from method arguments
   * @param args - Array of argument nodes
   * @returns The snapshot name
   */
  private extractSnapshotName(args: any[]): string {
    if (args.length > 0) {
      const firstArg = args[0];
      if (firstArg.children && firstArg.children.Literal) {
        return firstArg.children.Literal[0].image.replace(/"/g, '');
      }
    }
    return 'Untitled Snapshot';
  }

  /**
   * Extracts options from method arguments
   * @param args - Array of argument nodes
   * @returns The options object
   */
  private extractOptions(args: any[]): any {
    // This is a simplified implementation
    // In a real implementation, you would parse the complex argument structures
    return {};
  }

  /**
   * Creates SmartUI method arguments
   * @param snapshotName - The snapshot name
   * @param options - The options object
   * @returns Array of argument nodes
   */
  private createSmartUIArguments(snapshotName: string, options: any): any[] {
    const args = [
      {
        name: 'Primary',
        children: {
          Identifier: [{ image: 'driver' }]
        }
      },
      {
        name: 'Literal',
        children: {
          StringLiteral: [{ image: `"${snapshotName}"` }]
        }
      }
    ];
    
    // Add options if present
    if (Object.keys(options).length > 0) {
      args.push(this.createOptionsHashMap(options));
    }
    
    return args;
  }

  /**
   * Creates a HashMap for options
   * @param options - The options object
   * @returns The HashMap node
   */
  private createOptionsHashMap(options: any): any {
    return {
      name: 'ClassInstanceCreationExpression',
      children: {
        NEW: [{ image: 'new' }],
        Identifier: [{ image: 'HashMap' }],
        LPAREN: [{ image: '(' }],
        RPAREN: [{ image: ')' }]
      }
    };
  }

  /**
   * Gets the snapshot count
   * @returns The number of snapshots found and transformed
   */
  public getSnapshotCount(): number {
    return this.snapshotCount;
  }

  /**
   * Transforms Appium-specific code patterns
   * @param sourceCode - The Java source code
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed code
   */
  private transformAppiumSpecificCode(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): string {
    let transformedCode = sourceCode;

    // Transform Percy Appium-specific commands
    if (platform === 'Percy') {
      transformedCode = this.transformPercyAppiumCommands(transformedCode, warnings);
    }

    // Preserve native context switching calls
    transformedCode = this.preserveNativeContextSwitching(transformedCode, warnings);

    return transformedCode;
  }

  /**
   * Transforms Percy Appium-specific commands
   * @param sourceCode - The Java source code
   * @param warnings - Array to collect warnings
   * @returns The transformed code
   */
  private transformPercyAppiumCommands(sourceCode: string, warnings: TransformationWarning[]): string {
    let transformedCode = sourceCode;

    // Transform percy.screenshot to SmartUISnapshot.smartuiSnapshot
    const percyScreenshotRegex = /(\w+)\.screenshot\s*\(\s*["']([^"']+)["'](?:\s*,\s*([^)]+))?\s*\)/g;
    transformedCode = transformedCode.replace(percyScreenshotRegex, (match, percyVar, name, options) => {
      // Parse and transform options
      const transformedOptions = this.transformPercyAppiumOptions(options, warnings);
      return `SmartUISnapshot.smartuiSnapshot(driver, "${name}"${transformedOptions});`;
    });

    return transformedCode;
  }

  /**
   * Transforms Percy Appium-specific options
   * @param options - The options string
   * @param warnings - Array to collect warnings
   * @returns The transformed options string
   */
  private transformPercyAppiumOptions(options: string, warnings: TransformationWarning[]): string {
    if (!options) return '';

    let transformedOptions = ', options';
    const optionPairs: string[] = [];

    // Parse deviceName
    const deviceNameMatch = options.match(/deviceName\s*:\s*["']([^"']+)["']/);
    if (deviceNameMatch) {
      optionPairs.push(`"deviceName": "${deviceNameMatch[1]}"`);
    }

    // Parse orientation
    const orientationMatch = options.match(/orientation\s*:\s*["']([^"']+)["']/);
    if (orientationMatch) {
      optionPairs.push(`"orientation": "${orientationMatch[1]}"`);
    }

    // Parse fullScreen
    const fullScreenMatch = options.match(/fullScreen\s*:\s*(true|false)/);
    if (fullScreenMatch) {
      optionPairs.push(`"fullScreen": ${fullScreenMatch[1]}`);
    }

    // Parse ignoreRegionAppiumElements
    const ignoreElementsMatch = options.match(/ignoreRegionAppiumElements\s*:\s*\[([^\]]+)\]/);
    if (ignoreElementsMatch) {
      optionPairs.push(`"ignoreElements": [${ignoreElementsMatch[1]}]`);
    }

    if (optionPairs.length > 0) {
      transformedOptions += ` = Map.of(${optionPairs.join(', ')})`;
    } else {
      transformedOptions = '';
    }

    return transformedOptions;
  }

  /**
   * Preserves native context switching calls
   * @param sourceCode - The Java source code
   * @param warnings - Array to collect warnings
   * @returns The code with preserved context switching
   */
  private preserveNativeContextSwitching(sourceCode: string, warnings: TransformationWarning[]): string {
    // This method ensures that context switching calls are preserved
    // The regex patterns should not match or modify these calls
    const contextSwitchRegex = /(\w+)\.context\s*\(\s*["']NATIVE_APP["']\s*\)/g;
    const matches = sourceCode.match(contextSwitchRegex);
    
    if (matches && matches.length > 0) {
      warnings.push({
        message: `Found ${matches.length} native context switching call(s)`,
        details: 'Native context switching calls have been preserved to maintain hybrid app testing functionality.'
      });
    }

    return sourceCode; // Return unchanged to preserve context switching
  }
}
