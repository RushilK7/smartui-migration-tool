import { promises as fs } from 'fs';
import path from 'path';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';
import { logger } from '../utils/Logger';

export interface PomTransformationResult {
  success: boolean;
  originalContent: string;
  newContent: string;
  changes: PomChange[];
  error?: string;
}

export interface PomChange {
  type: 'DEPENDENCY_UPDATE' | 'DEPENDENCY_ADD' | 'DEPENDENCY_REMOVE' | 'PLUGIN_UPDATE';
  groupId: string;
  artifactId: string;
  oldVersion?: string;
  newVersion?: string;
  description: string;
}

/**
 * PomTransformer module for transforming Maven POM.xml files from visual testing platforms to SmartUI
 * Handles dependency updates, plugin configurations, and build profile modifications
 */
export class PomTransformer {
  private projectPath: string;

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Transforms POM.xml file from visual testing platforms to SmartUI
   * @param platform - The source platform (Percy, Applitools, or Sauce Labs Visual)
   * @returns PomTransformationResult - Transformation result with changes and new content
   */
  public async transformPomXml(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual'): Promise<PomTransformationResult> {
    const pomPath = path.join(this.projectPath, 'pom.xml');
    
    try {
      logger.debug(`Transforming POM.xml for platform: ${platform}`);
      
      const pomContent = await fs.readFile(pomPath, 'utf-8');
      const pomObject = await this.parsePomXml(pomContent);
      
      const changes: PomChange[] = [];
      
      // Transform dependencies
      const dependencyChanges = this.transformDependencies(pomObject, platform);
      changes.push(...dependencyChanges);
      
      // Transform plugins
      const pluginChanges = this.transformPlugins(pomObject, platform);
      changes.push(...pluginChanges);
      
      // Generate new POM content
      const newPomContent = await this.generatePomXml(pomObject);
      
      logger.debug(`POM.xml transformation completed. ${changes.length} changes made.`);
      
      return {
        success: true,
        originalContent: pomContent,
        newContent: newPomContent,
        changes
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(`POM.xml transformation failed: ${errorMessage}`);
      
      return {
        success: false,
        originalContent: '',
        newContent: '',
        changes: [],
        error: errorMessage
      };
    }
  }

  /**
   * Parse POM.xml content into JavaScript object
   */
  private async parsePomXml(content: string): Promise<any> {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      parseAttributeValue: true,
      trimValues: true
    });
    
    return parser.parse(content);
  }

  /**
   * Generate POM.xml content from JavaScript object
   */
  private async generatePomXml(pomObject: any): Promise<string> {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      textNodeName: '#text',
      format: true,
      indentBy: '  ',
      suppressEmptyNode: false,
      suppressBooleanAttributes: false,
      suppressUnpairedNode: false,
      unpairedTags: ['br', 'hr', 'img', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']
    });
    
    return builder.build(pomObject);
  }

  /**
   * Transform dependencies in POM.xml
   */
  private transformDependencies(pomObject: any, platform: string): PomChange[] {
    const changes: PomChange[] = [];
    
    // Handle main dependencies
    if (pomObject.project.dependencies?.dependency) {
      const dependencies = Array.isArray(pomObject.project.dependencies.dependency) 
        ? pomObject.project.dependencies.dependency 
        : [pomObject.project.dependencies.dependency];
      
      for (const dep of dependencies) {
        const change = this.transformDependency(dep, platform);
        if (change) {
          changes.push(change);
        }
      }
    }
    
    // Handle dependency management dependencies
    if (pomObject.project.dependencyManagement?.dependencies?.dependency) {
      const dependencies = Array.isArray(pomObject.project.dependencyManagement.dependencies.dependency) 
        ? pomObject.project.dependencyManagement.dependencies.dependency 
        : [pomObject.project.dependencyManagement.dependencies.dependency];
      
      for (const dep of dependencies) {
        const change = this.transformDependency(dep, platform);
        if (change) {
          changes.push(change);
        }
      }
    }
    
    return changes;
  }

  /**
   * Transform a single dependency
   */
  private transformDependency(dep: any, platform: string): PomChange | null {
    const groupId = dep.groupId?.['#text'] || dep.groupId;
    const artifactId = dep.artifactId?.['#text'] || dep.artifactId;
    const version = dep.version?.['#text'] || dep.version;
    
    if (!groupId || !artifactId) {
      return null;
    }
    
    const sourceDependency = this.getSourceDependency(groupId, artifactId, platform);
    if (!sourceDependency) {
      return null;
    }
    
    const smartUIDependency = this.getSmartUIDependency(sourceDependency, platform);
    if (!smartUIDependency) {
      return null;
    }
    
    // Update the dependency
    dep.groupId = smartUIDependency.groupId;
    dep.artifactId = smartUIDependency.artifactId;
    dep.version = smartUIDependency.version;
    
    return {
      type: 'DEPENDENCY_UPDATE',
      groupId: smartUIDependency.groupId,
      artifactId: smartUIDependency.artifactId,
      oldVersion: version,
      newVersion: smartUIDependency.version,
      description: `Updated ${groupId}:${artifactId} to ${smartUIDependency.groupId}:${smartUIDependency.artifactId}`
    };
  }

  /**
   * Transform plugins in POM.xml
   */
  private transformPlugins(pomObject: any, platform: string): PomChange[] {
    const changes: PomChange[] = [];
    
    // Handle build plugins
    if (pomObject.project.build?.plugins?.plugin) {
      const plugins = Array.isArray(pomObject.project.build.plugins.plugin) 
        ? pomObject.project.build.plugins.plugin 
        : [pomObject.project.build.plugins.plugin];
      
      for (const plugin of plugins) {
        const change = this.transformPlugin(plugin, platform);
        if (change) {
          changes.push(change);
        }
      }
    }
    
    // Handle plugin management plugins
    if (pomObject.project.build?.pluginManagement?.plugins?.plugin) {
      const plugins = Array.isArray(pomObject.project.build.pluginManagement.plugins.plugin) 
        ? pomObject.project.build.pluginManagement.plugins.plugin 
        : [pomObject.project.build.pluginManagement.plugins.plugin];
      
      for (const plugin of plugins) {
        const change = this.transformPlugin(plugin, platform);
        if (change) {
          changes.push(change);
        }
      }
    }
    
    return changes;
  }

  /**
   * Transform a single plugin
   */
  private transformPlugin(plugin: any, platform: string): PomChange | null {
    const groupId = plugin.groupId?.['#text'] || plugin.groupId;
    const artifactId = plugin.artifactId?.['#text'] || plugin.artifactId;
    const version = plugin.version?.['#text'] || plugin.version;
    
    if (!groupId || !artifactId) {
      return null;
    }
    
    const sourcePlugin = this.getSourcePlugin(groupId, artifactId, platform);
    if (!sourcePlugin) {
      return null;
    }
    
    const smartUIPlugin = this.getSmartUIPlugin(sourcePlugin, platform);
    if (!smartUIPlugin) {
      return null;
    }
    
    // Update the plugin
    plugin.groupId = smartUIPlugin.groupId;
    plugin.artifactId = smartUIPlugin.artifactId;
    plugin.version = smartUIPlugin.version;
    
    return {
      type: 'PLUGIN_UPDATE',
      groupId: smartUIPlugin.groupId,
      artifactId: smartUIPlugin.artifactId,
      oldVersion: version,
      newVersion: smartUIPlugin.version,
      description: `Updated plugin ${groupId}:${artifactId} to ${smartUIPlugin.groupId}:${smartUIPlugin.artifactId}`
    };
  }

  /**
   * Check if dependency is a source dependency for the given platform
   */
  private getSourceDependency(groupId: string, artifactId: string, platform: string): any | null {
    const sourceDependencies: { [key: string]: Array<{ groupId: string; artifactId: string }> } = {
      'Percy': [
        { groupId: 'io.percy', artifactId: 'percy-playwright-java' },
        { groupId: 'io.percy', artifactId: 'percy-selenium-java' },
        { groupId: 'io.percy', artifactId: 'percy-appium-app' }
      ],
      'Applitools': [
        { groupId: 'com.applitools', artifactId: 'eyes-selenium-java3' },
        { groupId: 'com.applitools', artifactId: 'eyes-selenium-java4' },
        { groupId: 'com.applitools', artifactId: 'eyes-selenium-java5' },
        { groupId: 'com.applitools', artifactId: 'eyes-playwright-java' }
      ],
      'Sauce Labs Visual': [
        { groupId: 'com.saucelabs.visual', artifactId: 'java-client' },
        { groupId: 'com.saucelabs', artifactId: 'sauce-java' }
      ]
    };

    const platformDeps = sourceDependencies[platform] || [];
    return platformDeps.find((dep: { groupId: string; artifactId: string }) => 
      groupId === dep.groupId && artifactId === dep.artifactId
    ) || null;
  }

  /**
   * Get SmartUI equivalent dependency
   */
  private getSmartUIDependency(sourceDependency: any, platform: string): any | null {
    const smartUIDependencies: { [key: string]: { [key: string]: { groupId: string; artifactId: string; version: string } } } = {
      'Percy': {
        'percy-playwright-java': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-playwright-java',
          version: '1.0.0'
        },
        'percy-selenium-java': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        },
        'percy-appium-app': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-appium-java',
          version: '1.0.0'
        }
      },
      'Applitools': {
        'eyes-selenium-java3': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        },
        'eyes-selenium-java4': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        },
        'eyes-selenium-java5': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        },
        'eyes-playwright-java': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-playwright-java',
          version: '1.0.0'
        }
      },
      'Sauce Labs Visual': {
        'java-client': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        },
        'sauce-java': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-selenium-java',
          version: '1.0.0'
        }
      }
    };

    const platformDeps = smartUIDependencies[platform] || {};
    return platformDeps[sourceDependency.artifactId] || null;
  }

  /**
   * Check if plugin is a source plugin for the given platform
   */
  private getSourcePlugin(groupId: string, artifactId: string, platform: string): any | null {
    const sourcePlugins: { [key: string]: Array<{ groupId: string; artifactId: string }> } = {
      'Percy': [
        { groupId: 'io.percy', artifactId: 'percy-maven-plugin' }
      ],
      'Applitools': [
        { groupId: 'com.applitools', artifactId: 'eyes-maven-plugin' }
      ],
      'Sauce Labs Visual': [
        { groupId: 'com.saucelabs', artifactId: 'sauce-maven-plugin' }
      ]
    };

    const platformPlugins = sourcePlugins[platform] || [];
    return platformPlugins.find((plugin: { groupId: string; artifactId: string }) => 
      groupId === plugin.groupId && artifactId === plugin.artifactId
    ) || null;
  }

  /**
   * Get SmartUI equivalent plugin
   */
  private getSmartUIPlugin(sourcePlugin: any, platform: string): any | null {
    const smartUIPlugins: { [key: string]: { [key: string]: { groupId: string; artifactId: string; version: string } } } = {
      'Percy': {
        'percy-maven-plugin': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-maven-plugin',
          version: '1.0.0'
        }
      },
      'Applitools': {
        'eyes-maven-plugin': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-maven-plugin',
          version: '1.0.0'
        }
      },
      'Sauce Labs Visual': {
        'sauce-maven-plugin': {
          groupId: 'com.lambdatest',
          artifactId: 'smartui-maven-plugin',
          version: '1.0.0'
        }
      }
    };

    const platformPlugins = smartUIPlugins[platform] || {};
    return platformPlugins[sourcePlugin.artifactId] || null;
  }
}
