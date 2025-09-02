import * as yaml from 'js-yaml';
import { TransformationWarning } from '../types';

/**
 * ExecutionTransformer module for transforming test execution commands in package.json and CI/CD files
 * Handles command replacement and environment variable migration for SmartUI integration
 */
export class ExecutionTransformer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Transforms package.json scripts to use SmartUI CLI
   * @param sourceContent - The package.json content as a string
   * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
   * @returns Object containing transformed content and warnings
   */
  public transformPackageJson(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): { content: string, warnings: TransformationWarning[] } {
    const warnings: TransformationWarning[] = [];

    try {
      // Parse the package.json content
      const packageJson = JSON.parse(sourceContent);

      if (!packageJson.scripts) {
        warnings.push({
          message: 'No scripts section found in package.json',
          details: 'The package.json file does not contain a scripts section to transform.'
        });
        return { content: sourceContent, warnings };
      }

      // Transform scripts based on platform
      const transformedScripts = this.transformScripts(packageJson.scripts, platform, warnings);

      // Create the transformed package.json
      const transformedPackageJson = {
        ...packageJson,
        scripts: transformedScripts
      };

      // Stringify with proper formatting
      const transformedContent = JSON.stringify(transformedPackageJson, null, 2);

      return { content: transformedContent, warnings };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      warnings.push({
        message: `Failed to parse package.json: ${errorMessage}`,
        details: 'The package.json file may be malformed or contain invalid JSON.'
      });

      return { content: sourceContent, warnings };
    }
  }

  /**
   * Transforms CI/CD YAML files to use SmartUI CLI
   * @param sourceContent - The YAML content as a string
   * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
   * @returns Object containing transformed content and warnings
   */
  public transformCiYaml(sourceContent: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): { content: string, warnings: TransformationWarning[] } {
    const warnings: TransformationWarning[] = [];

    try {
      // Parse the YAML content
      const yamlDoc = yaml.load(sourceContent) as any;

      if (!yamlDoc) {
        warnings.push({
          message: 'Failed to parse YAML content',
          details: 'The YAML file may be empty or malformed.'
        });
        return { content: sourceContent, warnings };
      }

      // Transform the YAML document
      const transformedYaml = this.transformYamlDocument(yamlDoc, platform, warnings);

      // Stringify with proper formatting
      const transformedContent = yaml.dump(transformedYaml, {
        indent: 2,
        lineWidth: -1,
        noRefs: true,
        sortKeys: false
      });

      return { content: transformedContent, warnings };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      warnings.push({
        message: `Failed to parse YAML content: ${errorMessage}`,
        details: 'The YAML file may be malformed or contain invalid syntax.'
      });

      return { content: sourceContent, warnings };
    }
  }

  /**
   * Transforms scripts object in package.json
   * @param scripts - The scripts object from package.json
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed scripts object
   */
  private transformScripts(scripts: { [key: string]: string }, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): { [key: string]: string } {
    const transformedScripts: { [key: string]: string } = {};

    for (const [scriptName, scriptCommand] of Object.entries(scripts)) {
      const transformedCommand = this.transformScriptCommand(scriptCommand, platform, warnings);
      transformedScripts[scriptName] = transformedCommand;
    }

    return transformedScripts;
  }

  /**
   * Transforms a single script command
   * @param command - The script command string
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed command string
   */
  private transformScriptCommand(command: string, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): string {
    switch (platform) {
      case 'Percy':
        return this.transformPercyCommand(command, warnings);
      case 'Applitools':
        return this.transformApplitoolsCommand(command, warnings);
      case 'Sauce Labs Visual':
        return this.transformSauceLabsCommand(command, warnings);
      default:
        return command;
    }
  }

  /**
   * Transforms Percy commands
   * @param command - The command string
   * @param warnings - Array to collect warnings
   * @returns The transformed command
   */
  private transformPercyCommand(command: string, warnings: TransformationWarning[]): string {
    // Replace percy exec with npx smartui exec
    if (command.includes('percy exec')) {
      return command.replace(/percy exec/g, 'npx smartui exec');
    }
    // Replace percy app:exec with npx smartui exec (Appium-specific)
    if (command.includes('percy app:exec')) {
      return command.replace(/percy app:exec/g, 'npx smartui exec');
    }
    return command;
  }

  /**
   * Transforms Applitools commands
   * @param command - The command string
   * @param warnings - Array to collect warnings
   * @returns The transformed command
   */
  private transformApplitoolsCommand(command: string, warnings: TransformationWarning[]): string {
    // Prepend npx smartui exec to test commands
    if (this.isTestCommand(command)) {
      return `npx smartui exec -- ${command}`;
    }
    return command;
  }

  /**
   * Transforms Sauce Labs commands
   * @param command - The command string
   * @param warnings - Array to collect warnings
   * @returns The transformed command
   */
  private transformSauceLabsCommand(command: string, warnings: TransformationWarning[]): string {
    // Prepend npx smartui exec to test commands
    if (this.isTestCommand(command)) {
      return `npx smartui exec -- ${command}`;
    }
    return command;
  }

  /**
   * Checks if a command is a test command that should be wrapped
   * @param command - The command string
   * @returns True if this is a test command
   */
  private isTestCommand(command: string): boolean {
    const testCommands = [
      'cypress run',
      'cypress open',
      'playwright test',
      'jest',
      'mocha',
      'jasmine',
      'karma',
      'mvn test',
      'gradle test',
      'pytest',
      'python -m pytest',
      'robot',
      'npm test',
      'yarn test'
    ];

    return testCommands.some(testCmd => command.includes(testCmd));
  }

  /**
   * Transforms a YAML document for CI/CD
   * @param yamlDoc - The parsed YAML document
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed YAML document
   */
  private transformYamlDocument(yamlDoc: any, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): any {
    const transformedDoc = JSON.parse(JSON.stringify(yamlDoc)); // Deep clone

    // Transform jobs and steps
    this.transformYamlJobs(transformedDoc, platform, warnings);

    return transformedDoc;
  }

  /**
   * Transforms jobs in YAML document
   * @param yamlDoc - The YAML document
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   */
  private transformYamlJobs(yamlDoc: any, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): void {
    // Handle GitHub Actions structure
    if (yamlDoc.jobs) {
      for (const jobName in yamlDoc.jobs) {
        const job = yamlDoc.jobs[jobName];
        if (job.steps) {
          this.transformYamlSteps(job.steps, platform, warnings);
        }
        if (job.env) {
          this.transformYamlEnvironment(job.env, platform, warnings);
        }
      }
    }

    // Handle other CI/CD structures (GitLab CI, etc.)
    if (yamlDoc.stages) {
      for (const stageName in yamlDoc.stages) {
        const stage = yamlDoc.stages[stageName];
        if (stage.script) {
          this.transformYamlScript(stage.script, platform, warnings);
        }
        if (stage.variables) {
          this.transformYamlEnvironment(stage.variables, platform, warnings);
        }
      }
    }
  }

  /**
   * Transforms steps in YAML jobs
   * @param steps - The steps array
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   */
  private transformYamlSteps(steps: any[], platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): void {
    for (const step of steps) {
      if (step.run) {
        step.run = this.transformYamlRunCommand(step.run, platform, warnings);
      }
      if (step.env) {
        this.transformYamlEnvironment(step.env, platform, warnings);
      }
    }
  }

  /**
   * Transforms run commands in YAML steps
   * @param runCommand - The run command (string or array)
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed run command
   */
  private transformYamlRunCommand(runCommand: string | string[], platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): string | string[] {
    if (typeof runCommand === 'string') {
      return this.transformScriptCommand(runCommand, platform, warnings);
    } else if (Array.isArray(runCommand)) {
      return runCommand.map(cmd => this.transformScriptCommand(cmd, platform, warnings));
    }
    return runCommand;
  }

  /**
   * Transforms script commands in YAML
   * @param script - The script command
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   * @returns The transformed script command
   */
  private transformYamlScript(script: string | string[], platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): string | string[] {
    if (typeof script === 'string') {
      return this.transformScriptCommand(script, platform, warnings);
    } else if (Array.isArray(script)) {
      return script.map(cmd => this.transformScriptCommand(cmd, platform, warnings));
    }
    return script;
  }

  /**
   * Transforms environment variables in YAML
   * @param env - The environment variables object
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   */
  private transformYamlEnvironment(env: { [key: string]: any }, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): void {
    // Comment out old secrets
    this.commentOutOldSecrets(env, platform, warnings);

    // Add new SmartUI secrets
    this.addSmartUISecrets(env, platform, warnings);
  }

  /**
   * Comments out old platform secrets
   * @param env - The environment variables object
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   */
  private commentOutOldSecrets(env: { [key: string]: any }, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): void {
    const secretKeys = this.getOldSecretKeys(platform);

    for (const key of secretKeys) {
      if (env[key]) {
        // Comment out the old secret
        env[`# MIGRATION-NOTE: ${key}`] = env[key];
        delete env[key];
      }
    }
  }

  /**
   * Adds new SmartUI secrets
   * @param env - The environment variables object
   * @param platform - The source platform
   * @param warnings - Array to collect warnings
   */
  private addSmartUISecrets(env: { [key: string]: any }, platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', warnings: TransformationWarning[]): void {
    // Add SmartUI secrets with placeholders
    env['# MIGRATION-NOTE: The following secrets must be configured in your CI provider\'s settings.'] = '';
    env['PROJECT_TOKEN'] = '${{ secrets.SMARTUI_PROJECT_TOKEN }}';
    env['LT_USERNAME'] = '${{ secrets.LT_USERNAME }}';
    env['LT_ACCESS_KEY'] = '${{ secrets.LT_ACCESS_KEY }}';
  }

  /**
   * Gets the old secret keys for a platform
   * @param platform - The source platform
   * @returns Array of secret keys
   */
  private getOldSecretKeys(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): string[] {
    switch (platform) {
      case 'Percy':
        return ['PERCY_TOKEN', 'PERCY_PROJECT'];
      case 'Applitools':
        return ['APPLITOOLS_API_KEY', 'APPLITOOLS_BATCH_ID', 'APPLITOOLS_BATCH_NAME'];
      case 'Sauce Labs Visual':
        return ['SAUCE_USERNAME', 'SAUCE_ACCESS_KEY', 'SAUCE_REGION'];
      default:
        return [];
    }
  }
}