import * as fs from 'fs/promises';
import * as path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { logger } from '../utils/Logger';

/**
 * C# Project File Transformer for converting .csproj dependencies
 */

export interface CsprojTransformationResult {
  success: boolean;
  changes: CsprojChange[];
  errors: string[];
}

export interface CsprojChange {
  type: 'package_reference' | 'using_statement' | 'property';
  oldValue: string;
  newValue: string;
  description: string;
}

export class CsprojTransformer {
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Transform .csproj file dependencies
   */
  public async transformCsprojFile(
    filePath: string,
    platform: string,
    framework: string
  ): Promise<CsprojTransformationResult> {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const changes: CsprojChange[] = [];
      const errors: string[] = [];

      if (this.verbose) logger.debug(`Transforming .csproj file: ${filePath}`);

      // Parse XML content
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        preserveOrder: true
      });
      
      const csprojXml = parser.parse(content);
      
      // Transform package references
      await this.transformPackageReferences(csprojXml, platform, framework, changes, errors);
      
      // Transform properties
      await this.transformProperties(csprojXml, platform, framework, changes, errors);

      if (changes.length > 0) {
        // Build XML back
        const builder = new XMLBuilder({
          ignoreAttributes: false,
          attributeNamePrefix: '@_',
          preserveOrder: true,
          format: true,
          indentBy: '  '
        });
        
        const transformedContent = builder.build(csprojXml);
        await fs.writeFile(filePath, transformedContent, 'utf-8');
        
        if (this.verbose) logger.debug(`Applied ${changes.length} changes to ${filePath}`);
      }

      return {
        success: errors.length === 0,
        changes,
        errors
      };

    } catch (error) {
      return {
        success: false,
        changes: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Transform package references based on platform
   */
  private async transformPackageReferences(
    csprojXml: any,
    platform: string,
    framework: string,
    changes: CsprojChange[],
    errors: string[]
  ): Promise<void> {
    const packageMappings = this.getPackageMappings(platform, framework);
    
    // Find all ItemGroup elements
    const itemGroups = this.findItemGroups(csprojXml);
    
    for (const itemGroup of itemGroups) {
      if (itemGroup.PackageReference) {
        const packageRefs = Array.isArray(itemGroup.PackageReference) 
          ? itemGroup.PackageReference 
          : [itemGroup.PackageReference];
        
        for (const packageRef of packageRefs) {
          if (packageRef.include) {
            const oldInclude = packageRef.include;
            
            // Check if this package needs to be replaced
            for (const [oldPackage, newPackage] of Object.entries(packageMappings)) {
              if (oldInclude.includes(oldPackage)) {
                packageRef.include = newPackage;
                packageRef.version = this.getSmartUIVersion(framework);
                
                changes.push({
                  type: 'package_reference',
                  oldValue: oldInclude,
                  newValue: newPackage,
                  description: `Replace ${oldPackage} with SmartUI package`
                });
                
                if (this.verbose) logger.debug(`Replaced package: ${oldInclude} -> ${newPackage}`);
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Transform project properties
   */
  private async transformProperties(
    csprojXml: any,
    platform: string,
    framework: string,
    changes: CsprojChange[],
    errors: string[]
  ): Promise<void> {
    // Add SmartUI specific properties if needed
    const project = csprojXml.Project;
    if (project && project.PropertyGroup) {
      const propertyGroups = Array.isArray(project.PropertyGroup) 
        ? project.PropertyGroup 
        : [project.PropertyGroup];
      
      for (const propertyGroup of propertyGroups) {
        // Add SmartUI configuration properties
        if (!propertyGroup.SmartUIConfig) {
          propertyGroup.SmartUIConfig = 'true';
          changes.push({
            type: 'property',
            oldValue: '',
            newValue: 'SmartUIConfig',
            description: 'Add SmartUI configuration property'
          });
        }
      }
    }
  }

  /**
   * Find all ItemGroup elements in the project
   */
  private findItemGroups(csprojXml: any): any[] {
    const itemGroups: any[] = [];
    
    if (csprojXml.Project && csprojXml.Project.ItemGroup) {
      const groups = Array.isArray(csprojXml.Project.ItemGroup) 
        ? csprojXml.Project.ItemGroup 
        : [csprojXml.Project.ItemGroup];
      
      itemGroups.push(...groups);
    }
    
    return itemGroups;
  }

  /**
   * Get package mappings for different platforms
   */
  private getPackageMappings(platform: string, framework: string): { [key: string]: string } {
    const mappings: { [key: string]: string } = {};

    switch (platform) {
      case 'Applitools':
        mappings['Applitools.Eyes'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Selenium'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Playwright'] = 'LambdaTest.SmartUI';
        mappings['Applitools'] = 'LambdaTest.SmartUI';
        break;
      case 'Percy':
        mappings['Percy'] = 'LambdaTest.SmartUI';
        mappings['percy'] = 'LambdaTest.SmartUI';
        break;
      case 'Sauce Labs':
        mappings['SauceLabs'] = 'LambdaTest.SmartUI';
        mappings['Sauce'] = 'LambdaTest.SmartUI';
        break;
    }

    return mappings;
  }

  /**
   * Get SmartUI package version based on framework
   */
  private getSmartUIVersion(framework: string): string {
    switch (framework) {
      case 'Playwright':
        return '1.0.0';
      case 'Selenium':
        return '1.0.0';
      default:
        return '1.0.0';
    }
  }

  /**
   * Get dependency mappings for C# projects
   */
  public getDependencyMappings(platform: string, framework: string): { [key: string]: string } {
    const mappings: { [key: string]: string } = {};

    switch (platform) {
      case 'Applitools':
        mappings['Applitools.Eyes'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Selenium'] = 'LambdaTest.SmartUI';
        mappings['Applitools.Playwright'] = 'LambdaTest.SmartUI';
        break;
      case 'Percy':
        mappings['Percy'] = 'LambdaTest.SmartUI';
        break;
      case 'Sauce Labs':
        mappings['SauceLabs'] = 'LambdaTest.SmartUI';
        break;
    }

    return mappings;
  }

  /**
   * Get environment variable mappings for C# projects
   */
  public getEnvironmentMappings(platform: string): { [key: string]: string } {
    const mappings: { [key: string]: string } = {};

    switch (platform) {
      case 'Applitools':
        mappings['APPLITOOLS_API_KEY'] = 'LT_ACCESS_KEY';
        mappings['APPLITOOLS_SERVER_URL'] = 'LT_SMARTUI_ENDPOINT';
        break;
      case 'Percy':
        mappings['PERCY_TOKEN'] = 'LT_ACCESS_KEY';
        break;
      case 'Sauce Labs':
        mappings['SAUCE_USERNAME'] = 'LT_USERNAME';
        mappings['SAUCE_ACCESS_KEY'] = 'LT_ACCESS_KEY';
        break;
    }

    return mappings;
  }

  /**
   * Generate SmartUI configuration for C# projects
   */
  public generateSmartUIConfig(platform: string, framework: string): any {
    return {
      project: {
        name: 'csharp-project',
        type: 'web',
        framework: framework,
        language: 'C#'
      },
      browsers: ['chrome', 'firefox', 'safari', 'edge'],
      devices: ['desktop', 'tablet', 'mobile'],
      settings: {
        screenshotTimeout: 30000,
        comparisonThreshold: 0.1,
        fullPageScreenshot: true
      },
      environments: {
        development: {
          baseUrl: 'http://localhost:3000',
          envVars: this.getEnvironmentMappings(platform)
        }
      }
    };
  }
}
