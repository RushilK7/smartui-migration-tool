import { ScanResult, TransformResult, ConfigTransformationResult } from '../types';
/**
 * ConfigTransformer module for transforming configuration files
 * Handles conversion of Percy, Applitools, and Sauce Labs configs to SmartUI format
 */
export declare class ConfigTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms configuration files to SmartUI format
     * @param scanResult - Results from project scanning
     * @returns Promise<TransformResult> - Transformation results
     */
    transformConfigs(scanResult: ScanResult): Promise<TransformResult>;
    /**
     * Transforms Sauce Labs configuration to SmartUI format
     * @param fileContent - Content of the Sauce Labs config file
     * @param filePath - Path to the config file (used to determine file type)
     * @returns ConfigTransformationResult - Transformation result with content and warnings
     */
    transformSauceLabsConfig(fileContent: string, filePath: string): ConfigTransformationResult;
    /**
     * Creates SmartUI configuration file
     */
    private createSmartUIConfig;
    /**
     * Transforms Percy configuration to SmartUI format
     * @param fileContent - Content of the Percy config file (YAML or JSON)
     * @returns ConfigTransformationResult - Transformation result with content and warnings
     */
    transformPercyConfig(fileContent: string): ConfigTransformationResult;
    /**
     * Transforms Applitools configuration to SmartUI format using AST parsing
     * @param fileContent - Content of the Applitools config file (JavaScript)
     * @returns ConfigTransformationResult - Transformation result with content and warnings
     */
    transformApplitoolsConfig(fileContent: string): ConfigTransformationResult;
    /**
     * Extracts an object literal from an AST ObjectExpression node
     * @param objectExpression - The AST ObjectExpression node
     * @returns The extracted JavaScript object
     */
    private extractObjectFromAST;
    /**
     * Extracts a value from an AST node
     * @param node - The AST node
     * @returns The extracted JavaScript value
     */
    private extractValueFromAST;
    /**
     * Processes the browser array to separate desktop and mobile configurations
     * @param browserArray - The browser array from Applitools config
     * @returns Object containing separated web and mobile configurations
     */
    private processBrowserArray;
    /**
     * Handles non-mappable Applitools properties and generates warnings
     * @param configObject - The parsed Applitools configuration object
     * @param warnings - Array to add warnings to
     */
    private handleNonMappableProperties;
    /**
     * Parses JavaScript/TypeScript configuration files using AST
     * @param fileContent - Content of the JavaScript/TypeScript file
     * @returns The extracted configuration object
     */
    private parseJavaScriptConfig;
    /**
     * Processes saucectl.yml configuration
     * @param configObject - The parsed YAML configuration
     * @param smartUIConfig - The SmartUI configuration object to populate
     * @param warnings - Array to add warnings to
     */
    private processSauceCtlConfig;
    /**
     * Processes JavaScript/TypeScript Sauce Labs configuration
     * @param configObject - The parsed JavaScript configuration
     * @param smartUIConfig - The SmartUI configuration object to populate
     * @param warnings - Array to add warnings to
     */
    private processJavaScriptSauceConfig;
    /**
     * Parses screen resolution string into numeric array
     * @param resolution - Resolution string like "1920x1080"
     * @returns Array of [width, height] or null if invalid
     */
    private parseScreenResolution;
    /**
     * Handles non-mappable Sauce Labs build metadata properties
     * @param configObject - The parsed Sauce Labs configuration object
     * @param warnings - Array to add warnings to
     */
    private handleSauceLabsNonMappableProperties;
}
//# sourceMappingURL=ConfigTransformer.d.ts.map