import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import { DetectionResult, PlatformNotDetectedError, MultiplePlatformsDetectedError } from '../types';
import { logger } from '../utils/Logger';

/**
 * Scanner module for analyzing user's project structure and dependencies
 * Responsible for detecting existing visual testing frameworks and configurations
 */
export class Scanner {
  private projectPath: string;
  private verbose: boolean;
  private ignorePatterns = [
    'node_modules/**',
    '.git/**',
    'dist/**',
    'build/**',
    '.next/**',
    'coverage/**',
    '.nyc_output/**',
    '*.log',
    '.DS_Store'
  ];

  constructor(projectPath: string, verbose: boolean = false) {
    this.projectPath = projectPath;
    this.verbose = verbose;
  }

  /**
   * Scans the project for existing visual testing frameworks
   * @returns Promise<DetectionResult> - Analysis results
   */
  public async scan(): Promise<DetectionResult> {
    try {
      // Standardize on absolute paths - resolve the user-provided path immediately
      const absoluteScanPath = path.resolve(this.projectPath);
      logger.debug(`Resolved target directory to absolute path: ${absoluteScanPath}`);

      // Priority 1: Dependency Analysis (Most Reliable)
      logger.debug('Starting Priority 1: Dependency Analysis');
      const dependencyResult = await this.analyzeDependencies(absoluteScanPath);
      if (dependencyResult) {
        logger.debug('Dependency analysis successful - platform detected');
        return dependencyResult;
      }
      logger.debug('Dependency analysis completed - no platform detected');

      // Priority 2: Configuration File Analysis (Fallback)
      logger.debug('Starting Priority 2: Configuration File Analysis');
      const configResult = await this.analyzeConfigurationFiles(absoluteScanPath);
      if (configResult) {
        logger.debug('Configuration analysis successful - platform detected');
        return configResult;
      }
      logger.debug('Configuration analysis completed - no platform detected');

      // No platform detected
      logger.debug('No platform detected through any analysis method');
      throw new PlatformNotDetectedError();

    } catch (error) {
      if (error instanceof PlatformNotDetectedError || error instanceof MultiplePlatformsDetectedError) {
        logger.debug(`Platform detection error: ${error.message}`);
        throw error;
      }
      logger.debug(`Scanner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error(`Scanner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Priority 1: Analyze dependencies in package.json, pom.xml, requirements.txt
   */
  private async analyzeDependencies(absoluteScanPath: string): Promise<DetectionResult | null> {
    logger.debug('Searching for dependency files (package.json, pom.xml, requirements.txt)');
    const detectedPlatforms: DetectionResult[] = [];

    // Check JavaScript/TypeScript projects
    logger.debug('Checking JavaScript/TypeScript dependencies...');
    const jsResult = await this.analyzeJavaScriptDependencies(absoluteScanPath);
    if (jsResult) {
      logger.debug(`JavaScript/TypeScript analysis result: ${jsResult.platform} detected`);
      detectedPlatforms.push(jsResult);
    } else {
      logger.debug('No JavaScript/TypeScript platform detected');
    }

    // Check Java projects
    logger.debug('Checking Java dependencies...');
    const javaResult = await this.analyzeJavaDependencies(absoluteScanPath);
    if (javaResult) {
      logger.debug(`Java analysis result: ${javaResult.platform} detected`);
      detectedPlatforms.push(javaResult);
    } else {
      logger.debug('No Java platform detected');
    }

    // Check Python projects
    logger.debug('Checking Python dependencies...');
    const pythonResult = await this.analyzePythonDependencies(absoluteScanPath);
    if (pythonResult) {
      logger.debug(`Python analysis result: ${pythonResult.platform} detected`);
      detectedPlatforms.push(pythonResult);
    } else {
      logger.debug('No Python platform detected');
    }

    if (detectedPlatforms.length === 0) {
      logger.debug('No platforms detected through dependency analysis');
      return null;
    }

    if (detectedPlatforms.length > 1) {
      logger.debug(`Multiple platforms detected: ${detectedPlatforms.map(p => p.platform).join(', ')}`);
      throw new MultiplePlatformsDetectedError();
    }

    logger.debug(`Single platform detected: ${detectedPlatforms[0]!.platform}`);
    return detectedPlatforms[0]!;
  }

  /**
   * Analyze JavaScript/TypeScript dependencies in package.json
   */
  private async analyzeJavaScriptDependencies(absoluteScanPath: string): Promise<DetectionResult | null> {
    const packageJsonPath = path.join(absoluteScanPath, 'package.json');
    
    // Implement resilient file reading with comprehensive error handling
    let packageJsonContent: string | null = null;
    
    try {
      logger.debug(`Attempting to read file: ${packageJsonPath}`);
      packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      logger.debug(`Successfully read package.json.`);
    } catch (error: any) {
      logger.debug(`Could not read ${packageJsonPath}. Reason: ${error.message}`);
      // Continue to the next check without crashing
      return null;
    }

    if (packageJsonContent) {
      try {
        const packageJson = JSON.parse(packageJsonContent);
        const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

        const detectedPlatforms: DetectionResult[] = [];

        // Check for Percy dependencies
        logger.debug('Checking package.json for Percy dependencies...');
        if (dependencies['@percy/cypress']) {
          logger.debug(`Result: Found '@percy/cypress'. Platform detected as Percy.`);
          detectedPlatforms.push(await this.createDetectionResult('Percy', 'Cypress', 'JavaScript/TypeScript', absoluteScanPath));
        } else {
          logger.debug(`Result: No '@percy/cypress' dependency found.`);
        }
        
        if (dependencies['@percy/playwright']) {
          logger.debug(`Result: Found '@percy/playwright'. Platform detected as Percy.`);
          detectedPlatforms.push(await this.createDetectionResult('Percy', 'Playwright', 'JavaScript/TypeScript', absoluteScanPath));
        } else {
          logger.debug(`Result: No '@percy/playwright' dependency found.`);
        }
        
        if (dependencies['@percy/storybook']) {
          logger.debug(`Result: Found '@percy/storybook' dependency. Checking for .storybook directory...`);
          const hasStorybookDir = await this.hasDirectory(absoluteScanPath, '.storybook');
          if (hasStorybookDir) {
            logger.debug(`Result: Found .storybook directory. Platform detected as Percy.`);
            detectedPlatforms.push(await this.createDetectionResult('Percy', 'Storybook', 'JavaScript/TypeScript', absoluteScanPath));
          } else {
            logger.debug(`Result: No .storybook directory found.`);
          }
        } else {
          logger.debug(`Result: No '@percy/storybook' dependency found.`);
        }

        // Check for Applitools dependencies
        logger.debug('Checking package.json for Applitools dependencies...');
        if (dependencies['@applitools/eyes-cypress']) {
          logger.debug(`Result: Found '@applitools/eyes-cypress'. Platform detected as Applitools.`);
          detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Cypress', 'JavaScript/TypeScript', absoluteScanPath));
        } else {
          logger.debug(`Result: No '@applitools/eyes-cypress' dependency found.`);
        }
        
        if (dependencies['@applitools/eyes-playwright']) {
          logger.debug(`Result: Found '@applitools/eyes-playwright'. Platform detected as Applitools.`);
          detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Playwright', 'JavaScript/TypeScript', absoluteScanPath));
        } else {
          logger.debug(`Result: No '@applitools/eyes-playwright' dependency found.`);
        }
        
        if (dependencies['@applitools/eyes-storybook']) {
          logger.debug(`Result: Found '@applitools/eyes-storybook' dependency. Checking for .storybook directory...`);
          const hasStorybookDir = await this.hasDirectory(absoluteScanPath, '.storybook');
          if (hasStorybookDir) {
            logger.debug(`Result: Found .storybook directory. Platform detected as Applitools.`);
            detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Storybook', 'JavaScript/TypeScript', absoluteScanPath));
          } else {
            logger.debug(`Result: No .storybook directory found.`);
          }
        } else {
          logger.debug(`Result: No '@applitools/eyes-storybook' dependency found.`);
        }

        // Check for Sauce Labs dependencies
        logger.debug('Checking package.json for Sauce Labs dependencies...');
        if (dependencies['@saucelabs/cypress-visual-plugin']) {
          logger.debug(`Result: Found '@saucelabs/cypress-visual-plugin'. Platform detected as Sauce Labs Visual.`);
          detectedPlatforms.push(await this.createDetectionResult('Sauce Labs Visual', 'Cypress', 'JavaScript/TypeScript', absoluteScanPath));
        } else {
          logger.debug(`Result: No '@saucelabs/cypress-visual-plugin' dependency found.`);
        }
        
        if (dependencies['screener-storybook']) {
          logger.debug(`Result: Found 'screener-storybook' dependency. Checking for .storybook directory...`);
          const hasStorybookDir = await this.hasDirectory(absoluteScanPath, '.storybook');
          if (hasStorybookDir) {
            logger.debug(`Result: Found .storybook directory. Platform detected as Sauce Labs Visual.`);
            detectedPlatforms.push(await this.createDetectionResult('Sauce Labs Visual', 'Storybook', 'JavaScript/TypeScript', absoluteScanPath));
          } else {
            logger.debug(`Result: No .storybook directory found.`);
          }
        } else {
          logger.debug(`Result: No 'screener-storybook' dependency found.`);
        }

        // Check for multiple platforms within JavaScript/TypeScript
        if (detectedPlatforms.length > 1) {
          logger.debug(`Multiple platforms detected in JavaScript/TypeScript: ${detectedPlatforms.map(p => p.platform).join(', ')}`);
          throw new MultiplePlatformsDetectedError();
        }

        // Return first detected platform (or null if none)
        if (detectedPlatforms.length > 0) {
          logger.debug(`JavaScript/TypeScript analysis completed: ${detectedPlatforms[0]!.platform} detected`);
          return detectedPlatforms[0]!;
        } else {
          logger.debug('JavaScript/TypeScript analysis completed: No platforms detected');
          return null;
        }
      } catch (error: any) {
        logger.debug(`Could not parse package.json content. Reason: ${error.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * Analyze Java dependencies in pom.xml
   */
  private async analyzeJavaDependencies(absoluteScanPath: string): Promise<DetectionResult | null> {
    const pomXmlPath = path.join(absoluteScanPath, 'pom.xml');
    
    // Implement resilient file reading with comprehensive error handling
    let pomXmlContent: string | null = null;
    
    try {
      logger.debug(`Attempting to read file: ${pomXmlPath}`);
      pomXmlContent = await fs.readFile(pomXmlPath, 'utf-8');
      logger.debug(`Successfully read pom.xml.`);
    } catch (error: any) {
      logger.debug(`Could not read ${pomXmlPath}. Reason: ${error.message}`);
      // Continue to the next check without crashing
      return null;
    }

    if (pomXmlContent) {
      try {
        const parser = new XMLParser();
        const pomXml = parser.parse(pomXmlContent);

        // Check for Applitools dependencies
        logger.debug('Checking pom.xml for Applitools dependencies...');
        if (this.hasMavenDependency(pomXml, 'eyes-selenium-java5')) {
          logger.debug(`Result: Found 'eyes-selenium-java5'. Platform detected as Applitools.`);
          return await this.createDetectionResult('Applitools', 'Selenium', 'Java', absoluteScanPath);
        } else {
          logger.debug(`Result: No 'eyes-selenium-java5' dependency found.`);
        }

        // Check for Sauce Labs dependencies
        logger.debug('Checking pom.xml for Sauce Labs dependencies...');
        if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
          logger.debug(`Result: Found 'java-client' from 'com.saucelabs.visual'. Platform detected as Sauce Labs Visual.`);
          return await this.createDetectionResult('Sauce Labs Visual', 'Selenium', 'Java', absoluteScanPath);
        } else {
          logger.debug(`Result: No 'java-client' from 'com.saucelabs.visual' dependency found.`);
        }

        // Check for Appium Java projects
        logger.debug('Checking pom.xml for Appium dependencies...');
        const hasAppiumClient = this.hasMavenDependency(pomXml, 'appium-java-client', 'io.appium');
        if (hasAppiumClient) {
          logger.debug(`Result: Found 'appium-java-client'. Checking for visual testing platforms...`);
          
          // Check for Percy Appium
          if (this.hasMavenDependency(pomXml, 'percy-appium-java', 'io.percy')) {
            logger.debug(`Result: Found 'percy-appium-java'. Platform detected as Percy.`);
            return await this.createDetectionResult('Percy', 'Appium', 'Java', absoluteScanPath);
          } else {
            logger.debug(`Result: No 'percy-appium-java' dependency found.`);
          }
          
          // Check for Applitools Appium
          if (this.hasMavenDependency(pomXml, 'eyes-appium-java5', 'com.applitools')) {
            logger.debug(`Result: Found 'eyes-appium-java5'. Platform detected as Applitools.`);
            return await this.createDetectionResult('Applitools', 'Appium', 'Java', absoluteScanPath);
          } else {
            logger.debug(`Result: No 'eyes-appium-java5' dependency found.`);
          }
          
          // Check for Sauce Labs Appium
          if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
            logger.debug(`Result: Found 'java-client' from 'com.saucelabs.visual'. Platform detected as Sauce Labs Visual.`);
            return await this.createDetectionResult('Sauce Labs Visual', 'Appium', 'Java', absoluteScanPath);
          } else {
            logger.debug(`Result: No 'java-client' from 'com.saucelabs.visual' dependency found.`);
          }
        } else {
          logger.debug(`Result: No 'appium-java-client' dependency found.`);
        }

        logger.debug('Java analysis completed: No platforms detected');
      } catch (error: any) {
        logger.debug(`Could not parse pom.xml content. Reason: ${error.message}`);
        return null;
      }
    }

    return null;
  }

  /**
   * Analyze Python dependencies in requirements.txt
   */
  private async analyzePythonDependencies(absoluteScanPath: string): Promise<DetectionResult | null> {
    const requirementsPath = path.join(absoluteScanPath, 'requirements.txt');
    
    // Implement resilient file reading with comprehensive error handling
    let requirementsContent: string | null = null;
    
    try {
      logger.debug(`Attempting to read file: ${requirementsPath}`);
      requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
      logger.debug(`Successfully read requirements.txt.`);
    } catch (error: any) {
      logger.debug(`Could not read ${requirementsPath}. Reason: ${error.message}`);
      // Continue to the next check without crashing
      return null;
    }

    if (requirementsContent) {
      const lines = requirementsContent.split('\n').map(line => line.trim());

      // Check for Appium Python projects
      logger.debug('Checking requirements.txt for Appium dependencies...');
      const hasAppiumClient = lines.some(line => line.includes('Appium-Python-Client'));
      if (hasAppiumClient) {
        logger.debug(`Result: Found 'Appium-Python-Client'. Checking for visual testing platforms...`);
        
        // Check for Percy Appium
        if (lines.some(line => line.includes('percy-appium-app'))) {
          logger.debug(`Result: Found 'percy-appium-app'. Platform detected as Percy.`);
          return await this.createDetectionResult('Percy', 'Appium', 'Python', absoluteScanPath);
        } else {
          logger.debug(`Result: No 'percy-appium-app' dependency found.`);
        }
        
        // Check for Applitools Appium
        if (lines.some(line => line.includes('eyes-selenium'))) {
          logger.debug(`Result: Found 'eyes-selenium'. Platform detected as Applitools.`);
          return await this.createDetectionResult('Applitools', 'Appium', 'Python', absoluteScanPath);
        } else {
          logger.debug(`Result: No 'eyes-selenium' dependency found.`);
        }
        
        // Check for Sauce Labs Appium
        if (lines.some(line => line.includes('saucelabs_visual'))) {
          logger.debug(`Result: Found 'saucelabs_visual'. Platform detected as Sauce Labs Visual.`);
          return await this.createDetectionResult('Sauce Labs Visual', 'Appium', 'Python', absoluteScanPath);
        } else {
          logger.debug(`Result: No 'saucelabs_visual' dependency found.`);
        }
      } else {
        logger.debug(`Result: No 'Appium-Python-Client' dependency found.`);
      }

      // Check for Sauce Labs Robot Framework
      logger.debug('Checking requirements.txt for Robot Framework dependencies...');
      if (lines.some(line => line.includes('saucelabs_visual'))) {
        logger.debug(`Result: Found 'saucelabs_visual'. Checking for Robot Framework files...`);
        const hasRobotFiles = await this.hasFiles(absoluteScanPath, '**/*.robot');
        if (hasRobotFiles) {
          logger.debug(`Result: Found .robot files. Platform detected as Sauce Labs Visual.`);
          return await this.createDetectionResult('Sauce Labs Visual', 'Robot Framework', 'Python', absoluteScanPath);
        } else {
          logger.debug(`Result: No .robot files found.`);
        }
      } else {
        logger.debug(`Result: No 'saucelabs_visual' dependency found.`);
      }

      logger.debug('Python analysis completed: No platforms detected');
    }

    return null;
  }

  /**
   * Priority 2: Analyze configuration files as fallback
   */
  private async analyzeConfigurationFiles(absoluteScanPath: string): Promise<DetectionResult | null> {
    logger.debug('Searching for configuration files (.percy.yml, applitools.config.js, etc.)');
    
    // Check for Percy config files
    logger.debug('Searching for Percy configuration files...');
    const percyConfigs = await fg(['.percy.yml', '.percy.js', 'percy.config.js'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (percyConfigs.length > 0) {
      logger.debug(`Found Percy config files: ${percyConfigs.join(', ')}`);
      // Try to determine framework from config or project structure
      const framework = await this.detectFrameworkFromStructure(absoluteScanPath);
      logger.debug(`Detected framework from structure: ${framework}`);
      return await this.createDetectionResult('Percy', framework, 'JavaScript/TypeScript', absoluteScanPath);
    } else {
      logger.debug('No Percy configuration files found.');
    }

    // Check for Applitools config files
    logger.debug('Searching for Applitools configuration files...');
    const applitoolsConfigs = await fg(['applitools.config.js', 'applitools.config.ts'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (applitoolsConfigs.length > 0) {
      logger.debug(`Found Applitools config files: ${applitoolsConfigs.join(', ')}`);
      const framework = await this.detectFrameworkFromStructure(absoluteScanPath);
      logger.debug(`Detected framework from structure: ${framework}`);
      return await this.createDetectionResult('Applitools', framework, 'JavaScript/TypeScript', absoluteScanPath);
    } else {
      logger.debug('No Applitools configuration files found.');
    }

    // Check for Sauce Labs config files
    logger.debug('Searching for Sauce Labs configuration files...');
    const sauceConfigs = await fg(['saucectl.yml', 'sauce.config.js'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (sauceConfigs.length > 0) {
      logger.debug(`Found Sauce Labs config files: ${sauceConfigs.join(', ')}`);
      const framework = await this.detectFrameworkFromStructure(absoluteScanPath);
      logger.debug(`Detected framework from structure: ${framework}`);
      return await this.createDetectionResult('Sauce Labs Visual', framework, 'JavaScript/TypeScript', absoluteScanPath);
    } else {
      logger.debug('No Sauce Labs configuration files found.');
    }

    logger.debug('Configuration file analysis completed: No platforms detected');
    return null;
  }

  /**
   * Detect framework from project structure
   */
  private async detectFrameworkFromStructure(absoluteScanPath: string): Promise<'Cypress' | 'Playwright' | 'Selenium' | 'Storybook'> {
    // Check for Cypress
    const cypressFiles = await fg(['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.json'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });
    if (cypressFiles.length > 0) return 'Cypress';

    // Check for Playwright
    const playwrightFiles = await fg(['playwright.config.js', 'playwright.config.ts', 'tests/**/*.spec.js', 'tests/**/*.spec.ts'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });
    if (playwrightFiles.length > 0) return 'Playwright';

    // Check for Storybook
    const storybookDir = await this.hasDirectory(absoluteScanPath, '.storybook');
    if (storybookDir) return 'Storybook';

    // Default to Selenium for Java projects
    return 'Selenium';
  }

  /**
   * Create a DetectionResult with file paths
   */
  private async createDetectionResult(
    platform: DetectionResult['platform'],
    framework: DetectionResult['framework'],
    language: DetectionResult['language'],
    absoluteScanPath: string
  ): Promise<DetectionResult> {
    const files = await this.collectFilePaths(absoluteScanPath, platform, framework);
    
    // Determine test type based on framework
    let testType: DetectionResult['testType'] = 'e2e';
    if (framework === 'Storybook') {
      testType = 'storybook';
    } else if (framework === 'Appium') {
      testType = 'appium';
    }
    
    return {
      platform,
      framework,
      language,
      testType,
      files
    };
  }

  /**
   * Collect relevant file paths based on platform and framework
   */
  private async collectFilePaths(absoluteScanPath: string, platform: string, framework: string): Promise<DetectionResult['files']> {
    const configPatterns = this.getConfigPatterns(platform);
    const sourcePatterns = this.getSourcePatterns(framework);
    const ciPatterns = this.getCIPatterns();
    const packageManagerPatterns = this.getPackageManagerPatterns();

    const [config, source, ci, packageManager] = await Promise.all([
      fg(configPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns }),
      fg(sourcePatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns }),
      fg(ciPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns }),
      fg(packageManagerPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns })
    ]);

    return {
      config,
      source,
      ci,
      packageManager
    };
  }

  /**
   * Get configuration file patterns based on platform
   */
  private getConfigPatterns(platform: string): string[] {
    switch (platform) {
      case 'Percy':
        return ['.percy.yml', '.percy.js', 'percy.config.js', 'percy.config.ts'];
      case 'Applitools':
        return ['applitools.config.js', 'applitools.config.ts'];
      case 'Sauce Labs Visual':
        return ['saucectl.yml', 'sauce.config.js', 'sauce.config.ts'];
      default:
        return [];
    }
  }

  /**
   * Get source file patterns based on framework
   */
  private getSourcePatterns(framework: string): string[] {
    switch (framework) {
      case 'Cypress':
        return ['cypress/**/*.js', 'cypress/**/*.ts', 'cypress/**/*.spec.js', 'cypress/**/*.spec.ts'];
      case 'Playwright':
        return ['tests/**/*.js', 'tests/**/*.ts', 'tests/**/*.spec.js', 'tests/**/*.spec.ts', 'e2e/**/*.js', 'e2e/**/*.ts'];
      case 'Selenium':
        return ['src/**/*.java', 'test/**/*.java', '**/*Test.java', '**/*Tests.java'];
      case 'Storybook':
        return ['.storybook/**/*.js', '.storybook/**/*.ts', 'stories/**/*.js', 'stories/**/*.ts'];
      case 'Robot Framework':
        return ['**/*.robot'];
      default:
        return [];
    }
  }

  /**
   * Get CI/CD file patterns
   */
  private getCIPatterns(): string[] {
    return [
      '.github/workflows/**/*.yml',
      '.github/workflows/**/*.yaml',
      '.gitlab-ci.yml',
      'Jenkinsfile',
      'azure-pipelines.yml',
      '.circleci/config.yml'
    ];
  }

  /**
   * Get package manager file patterns
   */
  private getPackageManagerPatterns(): string[] {
    return ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'pom.xml', 'requirements.txt'];
  }

  /**
   * Check if a directory exists
   */
  private async hasDirectory(absoluteScanPath: string, dirName: string): Promise<boolean> {
    try {
      const dirPath = path.join(absoluteScanPath, dirName);
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if files matching pattern exist
   */
  private async hasFiles(absoluteScanPath: string, pattern: string): Promise<boolean> {
    const files = await fg([pattern], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });
    return files.length > 0;
  }

  /**
   * Check if Maven dependency exists in pom.xml
   */
  private hasMavenDependency(pomXml: any, artifactId: string, groupId?: string): boolean {
    const dependencies = this.extractDependencies(pomXml);
    
    return dependencies.some((dep: any) => {
      const matchesArtifact = dep.artifactId === artifactId;
      const matchesGroup = !groupId || dep.groupId === groupId;
      return matchesArtifact && matchesGroup;
    });
  }

  /**
   * Extract dependencies from pom.xml structure
   */
  private extractDependencies(pomXml: any): any[] {
    const dependencies: any[] = [];
    
    const extractFromSection = (section: any) => {
      if (section && Array.isArray(section)) {
        section.forEach((dep: any) => {
          if (dep.artifactId) {
            dependencies.push(dep);
          }
        });
      }
    };

    // Check project.dependencies.dependency
    if (pomXml.project?.dependencies?.dependency) {
      extractFromSection(pomXml.project.dependencies.dependency);
    }

    // Check project.dependencyManagement.dependencies.dependency
    if (pomXml.project?.dependencyManagement?.dependencies?.dependency) {
      extractFromSection(pomXml.project.dependencyManagement.dependencies.dependency);
    }

    return dependencies;
  }
}
