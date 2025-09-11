import { TransformationWarning } from '../types';
/**
 * ExecutionTransformer module for transforming test execution commands in package.json and CI/CD files
 * Handles command replacement and environment variable migration for SmartUI integration
 */
export declare class ExecutionTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms package.json scripts to use SmartUI CLI
     * @param sourceContent - The package.json content as a string
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns Object containing transformed content and warnings
     */
    transformPackageJson(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): {
        content: string;
        warnings: TransformationWarning[];
    };
    /**
     * Transforms CI/CD YAML files to use SmartUI CLI
     * @param sourceContent - The YAML content as a string
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns Object containing transformed content and warnings
     */
    transformCiYaml(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): {
        content: string;
        warnings: TransformationWarning[];
    };
    /**
     * Transforms scripts object in package.json
     * @param scripts - The scripts object from package.json
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed scripts object
     */
    private transformScripts;
    /**
     * Transforms a single script command
     * @param command - The script command string
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed command string
     */
    private transformScriptCommand;
    /**
     * Transforms Percy commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformPercyCommand;
    /**
     * Transforms Applitools commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformApplitoolsCommand;
    /**
     * Transforms Sauce Labs commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformSauceLabsCommand;
    /**
     * Checks if a command is a test command that should be wrapped
     * @param command - The command string
     * @returns True if this is a test command
     */
    private isTestCommand;
    /**
     * Transforms a YAML document for CI/CD
     * @param yamlDoc - The parsed YAML document
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed YAML document
     */
    private transformYamlDocument;
    /**
     * Transforms jobs in YAML document
     * @param yamlDoc - The YAML document
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     */
    private transformYamlJobs;
    /**
     * Transforms steps in YAML jobs
     * @param steps - The steps array
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     */
    private transformYamlSteps;
    /**
     * Transforms run commands in YAML steps
     * @param runCommand - The run command (string or array)
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed run command
     */
    private transformYamlRunCommand;
    /**
     * Transforms script commands in YAML
     * @param script - The script command
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed script command
     */
    private transformYamlScript;
    /**
     * Transforms environment variables in YAML
     * @param env - The environment variables object
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     */
    private transformYamlEnvironment;
    /**
     * Comments out old platform secrets
     * @param env - The environment variables object
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     */
    private commentOutOldSecrets;
    /**
     * Adds new SmartUI secrets
     * @param env - The environment variables object
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     */
    private addSmartUISecrets;
    /**
     * Gets the old secret keys for a platform
     * @param platform - The source platform
     * @returns Array of secret keys
     */
    private getOldSecretKeys;
}
//# sourceMappingURL=ExecutionTransformer.d.ts.map