import { TransformationWarning } from '../types';
/**
 * StorybookTransformer module for transforming Storybook-specific configurations and scripts
 * Handles package.json script transformation and Storybook-specific configuration adjustments
 */
export declare class StorybookTransformer {
    private projectPath;
    constructor(projectPath: string);
    /**
     * Transforms package.json scripts for Storybook visual testing
     * @param sourceContent - The package.json content as a string
     * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
     * @returns Object containing transformed content and warnings
     */
    transformPackageJsonScripts(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): {
        content: string;
        warnings: TransformationWarning[];
    };
    /**
     * Transforms Storybook scripts in package.json
     * @param scripts - The scripts object from package.json
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed scripts object
     */
    private transformStorybookScripts;
    /**
     * Transforms a single Storybook script command
     * @param command - The script command string
     * @param platform - The source platform
     * @param warnings - Array to collect warnings
     * @returns The transformed command string
     */
    private transformStorybookCommand;
    /**
     * Transforms Percy Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformPercyStorybookCommand;
    /**
     * Transforms Applitools Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformApplitoolsStorybookCommand;
    /**
     * Transforms Sauce Labs Storybook commands
     * @param command - The command string
     * @param warnings - Array to collect warnings
     * @returns The transformed command
     */
    private transformSauceLabsStorybookCommand;
    /**
     * Checks for and handles Storybook-specific configuration files
     * @param platform - The source platform
     * @returns Array of proposed changes for configuration files
     */
    analyzeStorybookConfigurations(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): Promise<{
        changes: Array<{
            filePath: string;
            type: 'MODIFY' | 'DELETE';
            description: string;
        }>;
        warnings: TransformationWarning[];
    }>;
    /**
     * Counts the number of Storybook scripts that would be transformed
     * @param sourceContent - The package.json content as a string
     * @param platform - The source platform
     * @returns Number of scripts that would be transformed
     */
    countStorybookScripts(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): number;
}
//# sourceMappingURL=StorybookTransformer.d.ts.map