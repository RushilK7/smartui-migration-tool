import { CodeTransformationResult } from '../types';
/**
 * PythonCodeTransformer module for transforming Python test code from visual testing platforms to SmartUI
 * Supports both standard Python (.py) files and Robot Framework (.robot) files
 */
export declare class PythonCodeTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms Python source code from visual testing platforms to SmartUI format
     * @param sourceCode - The Python source code to transform
     * @param filePath - The file path to determine if it's a .py or .robot file
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transform(sourceCode: string, filePath: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): CodeTransformationResult;
    /**
     * Transforms standard Python (.py) files
     * @param sourceCode - The Python source code
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns CodeTransformationResult
     */
    private transformPythonFile;
    /**
     * Transforms Robot Framework (.robot) files
     * @param sourceCode - The Robot Framework source code
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns CodeTransformationResult
     */
    private transformRobotFramework;
    /**
     * Transforms Python import statements
     * @param sourceCode - The Python source code
     * @param platform - The source platform
     * @returns The transformed code
     */
    private transformPythonImports;
    /**
     * Gets import mappings for the current platform
     * @param platform - The source platform
     * @returns Object mapping old imports to new imports
     */
    private getPythonImportMappings;
    /**
     * Transforms Percy Python method calls
     * @param sourceCode - The Python source code
     * @returns The transformed code
     */
    private transformPercyPythonMethods;
    /**
     * Transforms Applitools Python method calls
     * @param sourceCode - The Python source code
     * @returns The transformed code
     */
    private transformApplitoolsPythonMethods;
    /**
     * Transforms Sauce Labs Python method calls
     * @param sourceCode - The Python source code
     * @returns The transformed code
     */
    private transformSauceLabsPythonMethods;
    /**
     * Counts Percy snapshots in Python code
     * @param sourceCode - The Python source code
     * @returns The number of snapshots found
     */
    private countPercySnapshots;
    /**
     * Counts Applitools snapshots in Python code
     * @param sourceCode - The Python source code
     * @returns The number of snapshots found
     */
    private countApplitoolsSnapshots;
    /**
     * Counts Sauce Labs snapshots in Python code
     * @param sourceCode - The Python source code
     * @returns The number of snapshots found
     */
    private countSauceLabsSnapshots;
    /**
     * Transforms Appium-specific code patterns
     * @param sourceCode - The Python source code
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed code
     */
    private transformAppiumSpecificCode;
    /**
     * Transforms Percy Appium-specific commands
     * @param sourceCode - The Python source code
     * @param warnings - Array to collect warnings
     * @returns The transformed code
     */
    private transformPercyAppiumCommands;
    /**
     * Transforms Percy Appium-specific options
     * @param options - The options string
     * @param warnings - Array to collect warnings
     * @returns The transformed options string
     */
    private transformPercyAppiumOptions;
    /**
     * Preserves native context switching calls
     * @param sourceCode - The Python source code
     * @param warnings - Array to collect warnings
     * @returns The code with preserved context switching
     */
    private preserveNativeContextSwitching;
}
//# sourceMappingURL=PythonCodeTransformer.d.ts.map