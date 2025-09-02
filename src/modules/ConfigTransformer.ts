import { ScanResult, TransformResult, SmartUIConfig, PercyDetection, ApplitoolsDetection, SauceLabsDetection, ConfigTransformationResult, TransformationWarning } from '../types';
import yaml from 'js-yaml';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * ConfigTransformer module for transforming configuration files
 * Handles conversion of Percy, Applitools, and Sauce Labs configs to SmartUI format
 */
export class ConfigTransformer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Transforms configuration files to SmartUI format
   * @param scanResult - Results from project scanning
   * @returns Promise<TransformResult> - Transformation results
   */
  public async transformConfigs(scanResult: ScanResult): Promise<TransformResult> {
    // TODO: Implement configuration transformation logic
    throw new Error('ConfigTransformer.transformConfigs() not implemented yet');
  }





  /**
   * Transforms Sauce Labs configuration to SmartUI format
   * @param fileContent - Content of the Sauce Labs config file
   * @param filePath - Path to the config file (used to determine file type)
   * @returns ConfigTransformationResult - Transformation result with content and warnings
   */
  public transformSauceLabsConfig(fileContent: string, filePath: string): ConfigTransformationResult {
    const warnings: TransformationWarning[] = [];
    
    try {
      let configObject: any = null;
      
      // Determine file type and parse accordingly
      if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        // Parse YAML file (saucectl.yml)
        configObject = yaml.load(fileContent) as any;
      } else if (filePath.endsWith('.js') || filePath.endsWith('.ts')) {
        // Parse JavaScript/TypeScript file using AST
        configObject = this.parseJavaScriptConfig(fileContent);
      } else {
        throw new Error(`Unsupported file type: ${filePath}`);
      }
      
      if (!configObject) {
        throw new Error('Could not parse Sauce Labs configuration file');
      }
      
      // Initialize SmartUI configuration
      const smartUIConfig: any = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          browsers: [],
          viewports: []
        },
        mobile: {
          devices: [],
          orientation: 'portrait'
        }
      };
      
      // Process configuration based on file type
      if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) {
        this.processSauceCtlConfig(configObject, smartUIConfig, warnings);
      } else {
        this.processJavaScriptSauceConfig(configObject, smartUIConfig, warnings);
      }
      
      // Handle non-mappable build metadata properties
      this.handleSauceLabsNonMappableProperties(configObject, warnings);
      
      // Generate the JSON content
      const content = JSON.stringify(smartUIConfig, null, 2);
      
      return {
        content,
        warnings
      };
      
    } catch (error) {
      // Handle parsing errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      warnings.push({
        message: `Failed to parse Sauce Labs configuration: ${errorMessage}`,
        details: 'The configuration file may be malformed or use unsupported syntax.'
      });
      
      // Return a default SmartUI configuration
      const defaultConfig = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          browsers: ['chrome', 'firefox', 'safari'],
          viewports: [[1280, 720], [768, 1024], [375, 667]]
        },
        mobile: {
          devices: ['iPhone X', 'Samsung Galaxy S10'],
          orientation: 'portrait'
        }
      };
      
      return {
        content: JSON.stringify(defaultConfig, null, 2),
        warnings
      };
    }
  }

  /**
   * Creates SmartUI configuration file
   */
  private async createSmartUIConfig(config: SmartUIConfig): Promise<void> {
    // TODO: Implement SmartUI config file creation
    throw new Error('SmartUI config creation not implemented yet');
  }

  /**
   * Transforms Percy configuration to SmartUI format
   * @param fileContent - Content of the Percy config file (YAML or JSON)
   * @returns ConfigTransformationResult - Transformation result with content and warnings
   */
  public transformPercyConfig(fileContent: string): ConfigTransformationResult {
    const warnings: TransformationWarning[] = [];
    
    try {
      // Parse the Percy configuration (YAML or JSON)
      const percyConfig = yaml.load(fileContent) as any;
      
      // Initialize SmartUI configuration
      const smartUIConfig: any = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          viewports: [],
          minHeight: undefined,
          allowedHostnames: []
        }
      };

      // Map snapshot.widths to web.viewports
      if (percyConfig.snapshot?.widths && Array.isArray(percyConfig.snapshot.widths)) {
        smartUIConfig.web.viewports = percyConfig.snapshot.widths.map((width: number) => [width]);
      }

      // Map discovery.allowed-hostnames to allowedHostnames
      if (percyConfig.discovery?.['allowed-hostnames'] && Array.isArray(percyConfig.discovery['allowed-hostnames'])) {
        smartUIConfig.web.allowedHostnames = percyConfig.discovery['allowed-hostnames'];
      }

      // Map snapshot.min-height to web.minHeight
      if (percyConfig.snapshot?.['min-height'] !== undefined) {
        smartUIConfig.web.minHeight = percyConfig.snapshot['min-height'];
      }

      // Handle Percy-specific features that don't have direct SmartUI equivalents
      if (percyConfig.snapshot?.['percy-css']) {
        warnings.push({
          message: 'Percy-specific CSS was detected. This will be emulated during code transformation by injecting styles before the snapshot.',
          details: 'The percy-css property from Percy config will be handled during test code transformation.'
        });
      }

      // Handle other Percy-specific features
      if (percyConfig.snapshot?.['enable-javascript']) {
        warnings.push({
          message: 'Percy JavaScript execution setting detected. SmartUI handles JavaScript execution differently.',
          details: 'JavaScript execution is controlled at the test level in SmartUI, not globally in configuration.'
        });
      }

      // Generate the JSON content
      const content = JSON.stringify(smartUIConfig, null, 2);

      return {
        content,
        warnings
      };

    } catch (error) {
      // Handle parsing errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      warnings.push({
        message: `Failed to parse Percy configuration: ${errorMessage}`,
        details: 'The configuration file may be malformed or use unsupported syntax.'
      });

      // Return a default SmartUI configuration
      const defaultConfig = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          viewports: [[1280], [768], [375]],
          minHeight: 600,
          allowedHostnames: []
        }
      };

      return {
        content: JSON.stringify(defaultConfig, null, 2),
        warnings
      };
    }
  }

  /**
   * Transforms Applitools configuration to SmartUI format using AST parsing
   * @param fileContent - Content of the Applitools config file (JavaScript)
   * @returns ConfigTransformationResult - Transformation result with content and warnings
   */
  public transformApplitoolsConfig(fileContent: string): ConfigTransformationResult {
    const warnings: TransformationWarning[] = [];
    
    try {
      // Parse the JavaScript file using AST (SECURE - no code execution)
      const ast = parse(fileContent, {
        sourceType: 'module',
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        plugins: ['objectRestSpread', 'functionBind', 'exportDefaultFrom']
      });

      let configObject: any = null;

      // Traverse the AST to find the configuration object
      const self = this;
      traverse(ast, {
        // Handle module.exports = { ... }
        AssignmentExpression(path) {
          if (
            t.isMemberExpression(path.node.left) &&
            t.isIdentifier(path.node.left.object, { name: 'module' }) &&
            t.isIdentifier(path.node.left.property, { name: 'exports' }) &&
            t.isObjectExpression(path.node.right)
          ) {
            configObject = self.extractObjectFromAST(path.node.right);
          }
        },
        // Handle export default { ... }
        ExportDefaultDeclaration(path) {
          if (t.isObjectExpression(path.node.declaration)) {
            configObject = self.extractObjectFromAST(path.node.declaration);
          }
        }
      });

      if (!configObject) {
        throw new Error('Could not find configuration object in Applitools config file');
      }

      // Initialize SmartUI configuration
      const smartUIConfig: any = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          browsers: [],
          viewports: []
        },
        mobile: {
          devices: [],
          orientation: 'portrait'
        }
      };

      // Process browser array to separate desktop and mobile configurations
      if (configObject.browser && Array.isArray(configObject.browser)) {
        const { webBrowsers, webViewports, mobileDevices } = this.processBrowserArray(configObject.browser);
        smartUIConfig.web.browsers = webBrowsers;
        smartUIConfig.web.viewports = webViewports;
        smartUIConfig.mobile.devices = mobileDevices;
      }

      // Handle non-mappable properties and generate warnings
      this.handleNonMappableProperties(configObject, warnings);

      // Generate the JSON content
      const content = JSON.stringify(smartUIConfig, null, 2);

      return {
        content,
        warnings
      };

    } catch (error) {
      // Handle parsing errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
      warnings.push({
        message: `Failed to parse Applitools configuration: ${errorMessage}`,
        details: 'The configuration file may be malformed or use unsupported syntax.'
      });

      // Return a default SmartUI configuration
      const defaultConfig = {
        version: '1.0',
        projectName: 'migrated-project',
        web: {
          browsers: ['chrome', 'firefox', 'safari'],
          viewports: [[1280, 720], [768, 1024], [375, 667]]
        },
        mobile: {
          devices: ['iPhone X', 'Samsung Galaxy S10'],
          orientation: 'portrait'
        }
      };

      return {
        content: JSON.stringify(defaultConfig, null, 2),
        warnings
      };
    }
  }

  /**
   * Extracts an object literal from an AST ObjectExpression node
   * @param objectExpression - The AST ObjectExpression node
   * @returns The extracted JavaScript object
   */
  private extractObjectFromAST(objectExpression: t.ObjectExpression): any {
    const result: any = {};

    objectExpression.properties.forEach(prop => {
      if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
        const key = prop.key.name;
        result[key] = this.extractValueFromAST(prop.value);
      } else if (t.isObjectProperty(prop) && t.isStringLiteral(prop.key)) {
        const key = prop.key.value;
        result[key] = this.extractValueFromAST(prop.value);
      }
    });

    return result;
  }

  /**
   * Extracts a value from an AST node
   * @param node - The AST node
   * @returns The extracted JavaScript value
   */
  private extractValueFromAST(node: t.Node): any {
    if (t.isStringLiteral(node)) {
      return node.value;
    } else if (t.isNumericLiteral(node)) {
      return node.value;
    } else if (t.isBooleanLiteral(node)) {
      return node.value;
    } else if (t.isNullLiteral(node)) {
      return null;
    } else if (t.isArrayExpression(node)) {
      return node.elements.map(element => {
        if (element && !t.isSpreadElement(element)) {
          return this.extractValueFromAST(element);
        }
        return undefined;
      }).filter(val => val !== undefined);
    } else if (t.isObjectExpression(node)) {
      return this.extractObjectFromAST(node);
    } else if (t.isIdentifier(node)) {
      // Handle common identifiers that might be used in configs
      switch (node.name) {
        case 'true': return true;
        case 'false': return false;
        case 'null': return null;
        default: return node.name; // Return as string for unknown identifiers
      }
    }
    return undefined;
  }

  /**
   * Processes the browser array to separate desktop and mobile configurations
   * @param browserArray - The browser array from Applitools config
   * @returns Object containing separated web and mobile configurations
   */
  private processBrowserArray(browserArray: any[]): { webBrowsers: string[], webViewports: number[][], mobileDevices: string[] } {
    const webBrowsers: string[] = [];
    const webViewports: number[][] = [];
    const mobileDevices: string[] = [];

    browserArray.forEach(browser => {
      if (typeof browser === 'object' && browser !== null) {
        // Desktop browser object: { width, height, name }
        if (browser.width && browser.height && browser.name) {
          // Add browser name (avoid duplicates)
          if (!webBrowsers.includes(browser.name)) {
            webBrowsers.push(browser.name);
          }
          // Add viewport dimensions
          webViewports.push([browser.width, browser.height]);
        }
        // Mobile device object: { deviceName, screenOrientation }
        else if (browser.deviceName) {
          mobileDevices.push(browser.deviceName);
        }
      }
    });

    return { webBrowsers, webViewports, mobileDevices };
  }

  /**
   * Handles non-mappable Applitools properties and generates warnings
   * @param configObject - The parsed Applitools configuration object
   * @param warnings - Array to add warnings to
   */
  private handleNonMappableProperties(configObject: any, warnings: TransformationWarning[]): void {
    const nonMappableProperties = [
      {
        key: 'appName',
        message: 'appName is configured on the SmartUI dashboard or via CLI arguments, not in the config file. This setting was not migrated.',
        details: 'Set the app name when running SmartUI tests using CLI arguments or dashboard configuration.'
      },
      {
        key: 'batchName',
        message: 'batchName is configured on the SmartUI dashboard or via CLI arguments, not in the config file. This setting was not migrated.',
        details: 'Set the batch name when running SmartUI tests using CLI arguments or dashboard configuration.'
      },
      {
        key: 'batchId',
        message: 'batchId is automatically generated by SmartUI and cannot be pre-configured. This setting was not migrated.',
        details: 'SmartUI will automatically generate batch IDs for test runs.'
      },
      {
        key: 'apiKey',
        message: 'apiKey should be set via environment variables or CLI arguments for security. This setting was not migrated.',
        details: 'Set the API key using the SMARTUI_API_KEY environment variable or CLI arguments.'
      },
      {
        key: 'storybookUrl',
        message: 'storybookUrl is not used by smartui-storybook. This setting was not migrated.',
        details: 'SmartUI Storybook integration automatically detects the Storybook server URL and does not require explicit configuration.'
      },
      {
        key: 'storybook',
        message: 'Storybook-specific configuration properties are not used by smartui-storybook. These settings were not migrated.',
        details: 'SmartUI Storybook integration uses standard Storybook configuration and does not require additional setup.'
      },
      {
        key: 'serverUrl',
        message: 'serverUrl is configured via CLI arguments or environment variables. This setting was not migrated.',
        details: 'Set the server URL using CLI arguments or environment variables when running SmartUI tests.'
      }
    ];

    nonMappableProperties.forEach(prop => {
      if (configObject[prop.key] !== undefined) {
        warnings.push({
          message: prop.message,
          details: prop.details
        });
      }
    });
  }

  /**
   * Parses JavaScript/TypeScript configuration files using AST
   * @param fileContent - Content of the JavaScript/TypeScript file
   * @returns The extracted configuration object
   */
  private parseJavaScriptConfig(fileContent: string): any {
    const ast = parse(fileContent, {
      sourceType: 'module',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: ['objectRestSpread', 'functionBind', 'exportDefaultFrom', 'typescript']
    });

    let configObject: any = null;

    // Traverse the AST to find the configuration object
    const self = this;
    traverse(ast, {
      // Handle module.exports = { ... }
      AssignmentExpression(path) {
        if (
          t.isMemberExpression(path.node.left) &&
          t.isIdentifier(path.node.left.object, { name: 'module' }) &&
          t.isIdentifier(path.node.left.property, { name: 'exports' }) &&
          t.isObjectExpression(path.node.right)
        ) {
          configObject = self.extractObjectFromAST(path.node.right);
        }
      },
      // Handle export default { ... }
      ExportDefaultDeclaration(path) {
        if (t.isObjectExpression(path.node.declaration)) {
          configObject = self.extractObjectFromAST(path.node.declaration);
        }
      }
    });

    return configObject;
  }

  /**
   * Processes saucectl.yml configuration
   * @param configObject - The parsed YAML configuration
   * @param smartUIConfig - The SmartUI configuration object to populate
   * @param warnings - Array to add warnings to
   */
  private processSauceCtlConfig(configObject: any, smartUIConfig: any, warnings: TransformationWarning[]): void {
    // Process suites for browser and device configurations
    if (configObject.suites && Array.isArray(configObject.suites)) {
      configObject.suites.forEach((suite: any) => {
        if (suite.settings) {
          // Handle single browser configuration
          if (suite.settings.browserName) {
            const browserName = suite.settings.browserName;
            if (!smartUIConfig.web.browsers.includes(browserName)) {
              smartUIConfig.web.browsers.push(browserName);
            }
            
            if (suite.settings.screenResolution) {
              const resolution = this.parseScreenResolution(suite.settings.screenResolution);
              if (resolution) {
                smartUIConfig.web.viewports.push(resolution);
              }
            }
          }
          
          // Handle browsers array configuration
          if (suite.settings.browsers && Array.isArray(suite.settings.browsers)) {
            suite.settings.browsers.forEach((browser: any) => {
              if (browser.browserName && !smartUIConfig.web.browsers.includes(browser.browserName)) {
                smartUIConfig.web.browsers.push(browser.browserName);
              }
              
              if (browser.screenResolution) {
                const resolution = this.parseScreenResolution(browser.screenResolution);
                if (resolution) {
                  smartUIConfig.web.viewports.push(resolution);
                }
              }
            });
          }
          
          // Handle single device configuration
          if (suite.settings.deviceName) {
            smartUIConfig.mobile.devices.push(suite.settings.deviceName);
          }
          
          // Handle devices array configuration
          if (suite.settings.devices && Array.isArray(suite.settings.devices)) {
            suite.settings.devices.forEach((device: any) => {
              if (device.deviceName) {
                smartUIConfig.mobile.devices.push(device.deviceName);
              }
            });
          }
        }
      });
    }
    
    // Process global settings if available
    if (configObject.settings) {
      if (configObject.settings.browserName && !smartUIConfig.web.browsers.includes(configObject.settings.browserName)) {
        smartUIConfig.web.browsers.push(configObject.settings.browserName);
      }
      
      if (configObject.settings.screenResolution) {
        const resolution = this.parseScreenResolution(configObject.settings.screenResolution);
        if (resolution) {
          smartUIConfig.web.viewports.push(resolution);
        }
      }
      
      if (configObject.settings.deviceName) {
        smartUIConfig.mobile.devices.push(configObject.settings.deviceName);
      }
    }
  }

  /**
   * Processes JavaScript/TypeScript Sauce Labs configuration
   * @param configObject - The parsed JavaScript configuration
   * @param smartUIConfig - The SmartUI configuration object to populate
   * @param warnings - Array to add warnings to
   */
  private processJavaScriptSauceConfig(configObject: any, smartUIConfig: any, warnings: TransformationWarning[]): void {
    // Look for saucelabs or sauceVisual properties in nested structures
    let sauceConfig: any = null;
    
    // Check for direct saucelabs/sauceVisual properties
    if (configObject.saucelabs) {
      sauceConfig = configObject.saucelabs;
    } else if (configObject.sauceVisual) {
      sauceConfig = configObject.sauceVisual;
    } else if (configObject.e2e && configObject.e2e.saucelabs) {
      sauceConfig = configObject.e2e.saucelabs;
    } else if (configObject.use && configObject.use.sauceVisual) {
      sauceConfig = configObject.use.sauceVisual;
    } else {
      // Fallback to root object
      sauceConfig = configObject;
    }
    
    if (!sauceConfig) {
      return;
    }
    
    // Process single browser/device configurations
    if (sauceConfig.browserName) {
      smartUIConfig.web.browsers.push(sauceConfig.browserName);
    }
    
    if (sauceConfig.screenResolution) {
      const resolution = this.parseScreenResolution(sauceConfig.screenResolution);
      if (resolution) {
        smartUIConfig.web.viewports.push(resolution);
      }
    }
    
    if (sauceConfig.deviceName) {
      smartUIConfig.mobile.devices.push(sauceConfig.deviceName);
    }
    
    // Process arrays of configurations
    if (sauceConfig.browsers && Array.isArray(sauceConfig.browsers)) {
      sauceConfig.browsers.forEach((browser: any) => {
        if (browser.browserName && !smartUIConfig.web.browsers.includes(browser.browserName)) {
          smartUIConfig.web.browsers.push(browser.browserName);
        }
        if (browser.screenResolution) {
          const resolution = this.parseScreenResolution(browser.screenResolution);
          if (resolution) {
            smartUIConfig.web.viewports.push(resolution);
          }
        }
      });
    }
    
    if (sauceConfig.devices && Array.isArray(sauceConfig.devices)) {
      sauceConfig.devices.forEach((device: any) => {
        if (device.deviceName) {
          smartUIConfig.mobile.devices.push(device.deviceName);
        }
      });
    }
  }

  /**
   * Parses screen resolution string into numeric array
   * @param resolution - Resolution string like "1920x1080"
   * @returns Array of [width, height] or null if invalid
   */
  private parseScreenResolution(resolution: string): number[] | null {
    if (typeof resolution !== 'string') {
      return null;
    }
    
    const match = resolution.match(/^(\d+)x(\d+)$/);
    if (match && match[1] && match[2]) {
      const width = parseInt(match[1], 10);
      const height = parseInt(match[2], 10);
      if (!isNaN(width) && !isNaN(height)) {
        return [width, height];
      }
    }
    
    return null;
  }

  /**
   * Handles non-mappable Sauce Labs build metadata properties
   * @param configObject - The parsed Sauce Labs configuration object
   * @param warnings - Array to add warnings to
   */
  private handleSauceLabsNonMappableProperties(configObject: any, warnings: TransformationWarning[]): void {
    const nonMappableProperties = [
      {
        key: 'build',
        message: "Sauce Labs' `build` property was detected. In SmartUI, the build name is typically set via the `--buildName` CLI flag or an environment variable in your CI/CD pipeline.",
        details: 'Set the build name when running SmartUI tests using CLI arguments or environment variables.'
      },
      {
        key: 'name',
        message: "Sauce Labs' `name` property was detected. In SmartUI, the test name is typically set via the `--testName` CLI flag or environment variable.",
        details: 'Set the test name when running SmartUI tests using CLI arguments or environment variables.'
      },
      {
        key: 'tags',
        message: "Sauce Labs' `tags` property was detected. In SmartUI, tags are typically set via the `--tags` CLI flag or environment variable.",
        details: 'Set tags when running SmartUI tests using CLI arguments or environment variables.'
      },
      {
        key: 'region',
        message: "Sauce Labs' `region` property was detected. In SmartUI, the region is typically set via the `--region` CLI flag or environment variable.",
        details: 'Set the region when running SmartUI tests using CLI arguments or environment variables.'
      },
      {
        key: 'username',
        message: "Sauce Labs' `username` property was detected. In SmartUI, authentication is typically handled via API keys set as environment variables.",
        details: 'Set the API key using the SMARTUI_API_KEY environment variable or CLI arguments.'
      },
      {
        key: 'accessKey',
        message: "Sauce Labs' `accessKey` property was detected. In SmartUI, authentication is typically handled via API keys set as environment variables.",
        details: 'Set the API key using the SMARTUI_API_KEY environment variable or CLI arguments.'
      }
    ];

    // Check root level properties
    nonMappableProperties.forEach(prop => {
      if (configObject[prop.key] !== undefined) {
        warnings.push({
          message: prop.message,
          details: prop.details
        });
      }
    });

    // Check metadata section (for YAML configs)
    if (configObject.metadata) {
      nonMappableProperties.forEach(prop => {
        if (configObject.metadata[prop.key] !== undefined) {
          warnings.push({
            message: prop.message,
            details: prop.details
          });
        }
      });
    }

    // Check settings section
    if (configObject.settings) {
      nonMappableProperties.forEach(prop => {
        if (configObject.settings[prop.key] !== undefined) {
          warnings.push({
            message: prop.message,
            details: prop.details
          });
        }
      });
    }

    // Check nested saucelabs/sauceVisual properties (for JS configs)
    const sauceConfig = configObject.saucelabs || configObject.sauceVisual || 
                       (configObject.e2e && configObject.e2e.saucelabs) ||
                       (configObject.use && configObject.use.sauceVisual);
    
    if (sauceConfig) {
      nonMappableProperties.forEach(prop => {
        if (sauceConfig[prop.key] !== undefined) {
          warnings.push({
            message: prop.message,
            details: prop.details
          });
        }
      });
    }
  }
}


