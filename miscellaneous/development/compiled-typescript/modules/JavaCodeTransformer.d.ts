import { CodeTransformationResult } from '../types';
/**
 * JavaCodeTransformer module for transforming Java test code from visual testing platforms to SmartUI
 * Uses java-parser for AST-based transformation of Java source code
 */
export declare class JavaCodeTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms Java source code from visual testing platforms to SmartUI format
     * @param sourceCode - The Java source code to transform
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transform(sourceCode: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): CodeTransformationResult;
    /**
     * Transforms Java code using regex patterns
     * @param sourceCode - The original Java source code
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @param snapshotCount - Reference to snapshot count
     * @returns The transformed Java code
     */
    private transformWithRegex;
    /**
     * Transforms import statements
     * @param sourceCode - The Java source code
     * @param platform - The source platform
     * @returns The transformed code
     */
    private transformImports;
    /**
     * Gets import mappings for the current platform
     * @param platform - The source platform
     * @returns Object mapping old imports to new imports
     */
    private getImportMappings;
    /**
     * Transforms Percy method calls
     * @param sourceCode - The Java source code
     * @returns The transformed code
     */
    private transformPercyMethods;
    /**
     * Transforms Applitools method calls
     * @param sourceCode - The Java source code
     * @returns The transformed code
     */
    private transformApplitoolsMethods;
    /**
     * Transforms Sauce Labs method calls
     * @param sourceCode - The Java source code
     * @returns The transformed code
     */
    private transformSauceLabsMethods;
    /**
     * Counts snapshots using regex patterns
     * @param sourceCode - The Java source code
     * @param platform - The source platform
     * @returns The number of snapshots found
     */
    private countSnapshotsWithRegex;
}
//# sourceMappingURL=JavaCodeTransformer.d.ts.map