import { CodeTransformationResult } from '../types';
/**
 * CodeTransformer module for transforming test code from visual testing platforms to SmartUI
 * Uses Abstract Syntax Trees (AST) for safe and accurate code transformation
 */
export declare class CodeTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms Percy JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformPercy(sourceCode: string): CodeTransformationResult;
    /**
     * Transforms Percy import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    private transformPercyImport;
    /**
     * Transforms Percy require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    private transformPercyRequire;
    /**
     * Transforms percySnapshot calls to smartuiSnapshot calls
     * @param path - The AST path for the percySnapshot call
     * @param warnings - Array to add warnings to
     */
    private transformPercySnapshot;
    /**
     * Transforms Percy snapshot options to SmartUI options
     * @param optionsNode - The AST node for the options object
     * @param warnings - Array to add warnings to
     * @param snapshotPath - The AST path for the snapshot call (for adding comments)
     */
    private transformPercySnapshotOptions;
    /**
     * Adds a warning comment above the snapshot call
     * @param snapshotPath - The AST path for the snapshot call
     */
    private addWarningComment;
    /**
     * Transforms Applitools JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @param framework - The testing framework (Cypress or Playwright)
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformApplitools(sourceCode: string, framework: 'Cypress' | 'Playwright'): CodeTransformationResult;
    /**
     * Transforms Applitools import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    private transformApplitoolsImport;
    /**
     * Transforms Applitools require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    private transformApplitoolsRequire;
    /**
     * Checks if a call is an eyes.open() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.open() call
     */
    private isEyesOpenCall;
    /**
     * Checks if a call is an eyes.close() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.close() call
     */
    private isEyesCloseCall;
    /**
     * Checks if a call is an eyes.check() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.check() call
     */
    private isEyesCheckCall;
    /**
     * Transforms eyes.check() calls to smartuiSnapshot calls
     * @param callNode - The AST node for the eyes.check() call
     * @param warnings - Array to add warnings to
     * @param framework - The testing framework
     */
    private transformEyesCheckToSmartUISnapshot;
    /**
     * Parses arguments from eyes.check() calls
     * @param callNode - The AST node for the eyes.check() call
     * @param warnings - Array to add warnings to
     * @returns Object containing snapshot name, options, and layout flag
     */
    private parseEyesCheckArguments;
    /**
     * Parses Applitools options object
     * @param optionsNode - The AST node for the options object
     * @param options - The options object to populate
     * @param warnings - Array to add warnings to
     */
    private parseApplitoolsOptions;
    /**
     * Creates a smartuiSnapshot call AST node
     * @param snapshotName - The name of the snapshot
     * @param options - The options object
     * @param framework - The testing framework
     * @returns The AST node for the smartuiSnapshot call
     */
    private createSmartUISnapshotCall;
    /**
     * Injects layout emulation with functional assertions
     * @param originalCall - The original eyes.check() call
     * @param smartUISnapshotCall - The new smartuiSnapshot call
     * @param framework - The testing framework
     * @param warnings - Array to add warnings to
     */
    private injectLayoutEmulation;
    /**
     * Transforms Sauce Labs Visual JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformSauceLabs(sourceCode: string): CodeTransformationResult;
    /**
     * Transforms Sauce Labs import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    private transformSauceLabsImport;
    /**
     * Transforms Sauce Labs require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    private transformSauceLabsRequire;
    /**
     * Checks if a call is a sauceVisualCheck call
     * @param callNode - The AST node for the call expression
     * @returns True if this is a sauceVisualCheck call
     */
    private isSauceVisualCheckCall;
    /**
     * Transforms sauceVisualCheck calls to smartuiSnapshot calls
     * @param callNode - The AST node for the sauceVisualCheck call
     * @param warnings - Array to add warnings to
     */
    private transformSauceVisualCheckToSmartUISnapshot;
    /**
     * Parses arguments from sauceVisualCheck calls
     * @param callNode - The AST node for the sauceVisualCheck call
     * @param warnings - Array to add warnings to
     * @returns Object containing snapshot name and options
     */
    private parseSauceVisualCheckArguments;
    /**
     * Parses Sauce Labs options object
     * @param optionsNode - The AST node for the options object
     * @param options - The options object to populate
     * @param warnings - Array to add warnings to
     */
    private parseSauceLabsOptions;
    /**
     * Creates a smartuiSnapshot call AST node from Sauce Labs options
     * @param snapshotName - The name of the snapshot
     * @param options - The options object
     * @returns The AST node for the smartuiSnapshot call
     */
    private createSmartUISnapshotCallFromSauceLabs;
}
//# sourceMappingURL=CodeTransformer.d.ts.map