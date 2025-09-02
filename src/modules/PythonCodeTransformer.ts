import { CodeTransformationResult, TransformationWarning } from '../types';

/**
 * PythonCodeTransformer module for transforming Python test code from visual testing platforms to SmartUI
 * Supports both standard Python (.py) files and Robot Framework (.robot) files
 */
export class PythonCodeTransformer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Transforms Python source code from visual testing platforms to SmartUI format
   * @param sourceCode - The Python source code to transform
   * @param filePath - The file path to determine if it's a .py or .robot file
   * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
   * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
   */
  public transform(sourceCode: string, filePath: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): CodeTransformationResult {
    const warnings: TransformationWarning[] = [];
    let snapshotCount = 0;

    try {
      // Determine file type and apply appropriate transformation
      if (filePath.endsWith('.robot')) {
        return this.transformRobotFramework(sourceCode, platform, warnings);
      } else if (filePath.endsWith('.py')) {
        return this.transformPythonFile(sourceCode, platform, warnings);
      } else {
        warnings.push({
          message: `Unsupported file type: ${filePath}`,
          details: 'Only .py and .robot files are supported for Python transformation.'
        });
        return {
          content: sourceCode,
          warnings,
          snapshotCount: 0
        };
      }
    } catch (error) {
      // Handle transformation errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown transformation error';
      warnings.push({
        message: `Failed to transform Python source code: ${errorMessage}`,
        details: 'The Python file may contain unsupported syntax or be malformed.'
      });

      return {
        content: sourceCode, // Return original code on error
        warnings,
        snapshotCount: 0
      };
    }
  }

  /**
   * Transforms standard Python (.py) files
   * @param sourceCode - The Python source code
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns CodeTransformationResult
   */
  private transformPythonFile(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): CodeTransformationResult {
    let transformedCode = sourceCode;
    let snapshotCount = 0;

    // Transform import statements
    transformedCode = this.transformPythonImports(transformedCode, platform);

    // Transform method calls based on platform
    switch (platform) {
      case 'Percy':
        transformedCode = this.transformPercyPythonMethods(transformedCode);
        snapshotCount = this.countPercySnapshots(sourceCode);
        break;
      case 'Applitools':
        transformedCode = this.transformApplitoolsPythonMethods(transformedCode);
        snapshotCount = this.countApplitoolsSnapshots(sourceCode);
        break;
      case 'Sauce Labs Visual':
        transformedCode = this.transformSauceLabsPythonMethods(transformedCode);
        snapshotCount = this.countSauceLabsSnapshots(sourceCode);
        break;
    }

    // Apply Appium-specific transformations if needed
    transformedCode = this.transformAppiumSpecificCode(transformedCode, platform, warnings);

    return {
      content: transformedCode,
      warnings,
      snapshotCount
    };
  }

  /**
   * Transforms Robot Framework (.robot) files
   * @param sourceCode - The Robot Framework source code
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns CodeTransformationResult
   */
  private transformRobotFramework(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): CodeTransformationResult {
    let transformedCode = sourceCode;
    let snapshotCount = 0;

    // Robot Framework transformation is primarily for Sauce Labs Visual
    if (platform === 'Sauce Labs Visual') {
      // Replace Visual Snapshot keyword with SmartUI Snapshot
      const visualSnapshotRegex = /(\s*)Visual Snapshot\s+(.+)/g;
      transformedCode = transformedCode.replace(visualSnapshotRegex, (match, indent, args) => {
        snapshotCount++;
        return `${indent}SmartUI Snapshot    ${args}`;
      });

      // Remove Create Visual Build keyword
      transformedCode = transformedCode.replace(/^(\s*)Create Visual Build.*$/gm, '');

      // Remove Finish Visual Build keyword
      transformedCode = transformedCode.replace(/^(\s*)Finish Visual Build.*$/gm, '');
    } else {
      warnings.push({
        message: `Robot Framework transformation not yet implemented for ${platform}`,
        details: 'Currently only Sauce Labs Visual Robot Framework files are supported.'
      });
    }

    return {
      content: transformedCode,
      warnings,
      snapshotCount
    };
  }

  /**
   * Transforms Python import statements
   * @param sourceCode - The Python source code
   * @param platform - The source platform
   * @returns The transformed code
   */
  private transformPythonImports(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): string {
    let transformedCode = sourceCode;

    const importMappings = this.getPythonImportMappings(platform);
    
    for (const [oldImport, newImport] of Object.entries(importMappings)) {
      // Handle different import patterns
      const patterns = [
        // from module import class
        new RegExp(`from\\s+${oldImport.replace(/\./g, '\\.')}\\s+import\\s+(\\w+)`, 'g'),
        // import module
        new RegExp(`import\\s+${oldImport.replace(/\./g, '\\.')}`, 'g')
      ];

      patterns.forEach(pattern => {
        transformedCode = transformedCode.replace(pattern, (match, importName) => {
          if (importName) {
            return `from ${newImport} import ${importName}`;
          } else {
            return `import ${newImport}`;
          }
        });
      });
    }

    return transformedCode;
  }

  /**
   * Gets import mappings for the current platform
   * @param platform - The source platform
   * @returns Object mapping old imports to new imports
   */
  private getPythonImportMappings(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): { [key: string]: string } {
    switch (platform) {
      case 'Percy':
        return {
          'percy': 'lambdatest_selenium_driver',
          'percy.selenium': 'lambdatest_selenium_driver'
        };
      case 'Applitools':
        return {
          'applitools.selenium': 'lambdatest_selenium_driver',
          'applitools': 'lambdatest_selenium_driver'
        };
      case 'Sauce Labs Visual':
        return {
          'saucelabs_visual': 'lambdatest_selenium_driver',
          'saucelabs': 'lambdatest_selenium_driver'
        };
      default:
        return {};
    }
  }

  /**
   * Transforms Percy Python method calls
   * @param sourceCode - The Python source code
   * @returns The transformed code
   */
  private transformPercyPythonMethods(sourceCode: string): string {
    // Transform percy.snapshot("name") to SmartUISnapshot.smartui_snapshot(driver, name="name")
    const percySnapshotRegex = /(\w+)\.snapshot\s*\(\s*["']([^"']+)["']\s*\)/g;
    return sourceCode.replace(percySnapshotRegex, 'SmartUISnapshot.smartui_snapshot(driver, name="$2")');
  }

  /**
   * Transforms Applitools Python method calls
   * @param sourceCode - The Python source code
   * @returns The transformed code
   */
  private transformApplitoolsPythonMethods(sourceCode: string): string {
    let transformedCode = sourceCode;

    // Remove eyes.open() calls
    transformedCode = transformedCode.replace(/(\w+)\.open\s*\([^)]*\)\s*;?\s*/g, '');

    // Remove eyes.close() calls
    transformedCode = transformedCode.replace(/(\w+)\.close\s*\(\s*\)\s*;?\s*/g, '');

    // Transform eyes.check() calls
    // Simple case: eyes.check("name")
    transformedCode = transformedCode.replace(/(\w+)\.check\s*\(\s*["']([^"']+)["']\s*\)/g, 'SmartUISnapshot.smartui_snapshot(driver, name="$2")');

    // Complex case: eyes.check_window()
    transformedCode = transformedCode.replace(/(\w+)\.check_window\s*\(\s*\)/g, 'SmartUISnapshot.smartui_snapshot(driver, name="Full Page")');

    // Case: eyes.check_region()
    transformedCode = transformedCode.replace(/(\w+)\.check_region\s*\([^)]+\)/g, 'SmartUISnapshot.smartui_snapshot(driver, name="Region")');

    return transformedCode;
  }

  /**
   * Transforms Sauce Labs Python method calls
   * @param sourceCode - The Python source code
   * @returns The transformed code
   */
  private transformSauceLabsPythonMethods(sourceCode: string): string {
    // Transform visual.sauce_visual_check("name") to SmartUISnapshot.smartui_snapshot(driver, name="name")
    const sauceVisualCheckRegex = /(\w+)\.sauce_visual_check\s*\(\s*["']([^"']+)["']\s*\)/g;
    return sourceCode.replace(sauceVisualCheckRegex, 'SmartUISnapshot.smartui_snapshot(driver, name="$2")');
  }

  /**
   * Counts Percy snapshots in Python code
   * @param sourceCode - The Python source code
   * @returns The number of snapshots found
   */
  private countPercySnapshots(sourceCode: string): number {
    const percySnapshotRegex = /(\w+)\.snapshot\s*\(\s*["']([^"']+)["']\s*\)/g;
    const matches = sourceCode.match(percySnapshotRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Counts Applitools snapshots in Python code
   * @param sourceCode - The Python source code
   * @returns The number of snapshots found
   */
  private countApplitoolsSnapshots(sourceCode: string): number {
    const applitoolsCheckRegex = /(\w+)\.(check|check_window|check_region)\s*\(/g;
    const matches = sourceCode.match(applitoolsCheckRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Counts Sauce Labs snapshots in Python code
   * @param sourceCode - The Python source code
   * @returns The number of snapshots found
   */
  private countSauceLabsSnapshots(sourceCode: string): number {
    const sauceVisualCheckRegex = /(\w+)\.sauce_visual_check\s*\(\s*["']([^"']+)["']\s*\)/g;
    const matches = sourceCode.match(sauceVisualCheckRegex);
    return matches ? matches.length : 0;
  }

  /**
   * Transforms Appium-specific code patterns
   * @param sourceCode - The Python source code
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
   * @param sourceCode - The Python source code
   * @param warnings - Array to collect warnings
   * @returns The transformed code
   */
  private transformPercyAppiumCommands(sourceCode: string, warnings: TransformationWarning[]): string {
    let transformedCode = sourceCode;

    // Transform percy_screenshot to smartui.snapshot
    const percyScreenshotRegex = /(\w+)\.percy_screenshot\s*\(\s*["']([^"']+)["'](?:\s*,\s*([^)]+))?\s*\)/g;
    transformedCode = transformedCode.replace(percyScreenshotRegex, (match, driverVar, name, options) => {
      // Parse and transform options
      const transformedOptions = this.transformPercyAppiumOptions(options, warnings);
      return `smartui.snapshot(${driverVar}, name="${name}"${transformedOptions})`;
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

    let transformedOptions = ', options={';
    const optionPairs: string[] = [];

    // Parse device_name
    const deviceNameMatch = options.match(/device_name\s*=\s*["']([^"']+)["']/);
    if (deviceNameMatch) {
      optionPairs.push(`"device_name": "${deviceNameMatch[1]}"`);
    }

    // Parse orientation
    const orientationMatch = options.match(/orientation\s*=\s*["']([^"']+)["']/);
    if (orientationMatch) {
      optionPairs.push(`"orientation": "${orientationMatch[1]}"`);
    }

    // Parse full_screen
    const fullScreenMatch = options.match(/full_screen\s*=\s*(True|False)/);
    if (fullScreenMatch) {
      optionPairs.push(`"full_screen": ${fullScreenMatch[1]}`);
    }

    // Parse ignore_region_appium_elements
    const ignoreElementsMatch = options.match(/ignore_region_appium_elements\s*=\s*\[([^\]]+)\]/);
    if (ignoreElementsMatch) {
      optionPairs.push(`"ignore_elements": [${ignoreElementsMatch[1]}]`);
    }

    if (optionPairs.length > 0) {
      transformedOptions += optionPairs.join(', ') + '}';
    } else {
      transformedOptions = '';
    }

    return transformedOptions;
  }

  /**
   * Preserves native context switching calls
   * @param sourceCode - The Python source code
   * @param warnings - Array to collect warnings
   * @returns The code with preserved context switching
   */
  private preserveNativeContextSwitching(sourceCode: string, warnings: TransformationWarning[]): string {
    // This method ensures that context switching calls are preserved
    // The regex patterns should not match or modify these calls
    const contextSwitchRegex = /(\w+)\.switch_to\.context\s*\(\s*["']NATIVE_APP["']\s*\)/g;
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
