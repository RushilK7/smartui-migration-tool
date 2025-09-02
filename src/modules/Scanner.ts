import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import { DetectionResult, PlatformNotDetectedError, MultiplePlatformsDetectedError } from '../types';

/**
 * Scanner module for analyzing user's project structure and dependencies
 * Responsible for detecting existing visual testing frameworks and configurations
 */
export class Scanner {
  private projectPath: string;
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

  constructor(projectPath: string) {
    this.projectPath = projectPath;
  }

  /**
   * Scans the project for existing visual testing frameworks
   * @returns Promise<DetectionResult> - Analysis results
   */
  public async scan(): Promise<DetectionResult> {
    try {
      // Priority 1: Dependency Analysis (Most Reliable)
      const dependencyResult = await this.analyzeDependencies();
      if (dependencyResult) {
        return dependencyResult;
      }

      // Priority 2: Configuration File Analysis (Fallback)
      const configResult = await this.analyzeConfigurationFiles();
      if (configResult) {
        return configResult;
      }

      // No platform detected
      throw new PlatformNotDetectedError();

    } catch (error) {
      if (error instanceof PlatformNotDetectedError || error instanceof MultiplePlatformsDetectedError) {
        throw error;
      }
      throw new Error(`Scanner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Priority 1: Analyze dependencies in package.json, pom.xml, requirements.txt
   */
  private async analyzeDependencies(): Promise<DetectionResult | null> {
    const detectedPlatforms: DetectionResult[] = [];

    // Check JavaScript/TypeScript projects
    const jsResult = await this.analyzeJavaScriptDependencies();
    if (jsResult) detectedPlatforms.push(jsResult);

    // Check Java projects
    const javaResult = await this.analyzeJavaDependencies();
    if (javaResult) detectedPlatforms.push(javaResult);

    // Check Python projects
    const pythonResult = await this.analyzePythonDependencies();
    if (pythonResult) detectedPlatforms.push(pythonResult);

    if (detectedPlatforms.length === 0) {
      return null;
    }

    if (detectedPlatforms.length > 1) {
      throw new MultiplePlatformsDetectedError();
    }

    return detectedPlatforms[0]!;
  }

  /**
   * Analyze JavaScript/TypeScript dependencies in package.json
   */
  private async analyzeJavaScriptDependencies(): Promise<DetectionResult | null> {
    const packageJsonPath = path.join(this.projectPath, 'package.json');
    
    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const detectedPlatforms: DetectionResult[] = [];

      // Check for Percy dependencies
      if (dependencies['@percy/cypress']) {
        detectedPlatforms.push(await this.createDetectionResult('Percy', 'Cypress', 'JavaScript/TypeScript'));
      }
      if (dependencies['@percy/playwright']) {
        detectedPlatforms.push(await this.createDetectionResult('Percy', 'Playwright', 'JavaScript/TypeScript'));
      }
      if (dependencies['@percy/storybook']) {
        const hasStorybookDir = await this.hasDirectory('.storybook');
        if (hasStorybookDir) {
          detectedPlatforms.push(await this.createDetectionResult('Percy', 'Storybook', 'JavaScript/TypeScript'));
        }
      }

      // Check for Applitools dependencies
      if (dependencies['@applitools/eyes-cypress']) {
        detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Cypress', 'JavaScript/TypeScript'));
      }
      if (dependencies['@applitools/eyes-playwright']) {
        detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Playwright', 'JavaScript/TypeScript'));
      }
      if (dependencies['@applitools/eyes-storybook']) {
        const hasStorybookDir = await this.hasDirectory('.storybook');
        if (hasStorybookDir) {
          detectedPlatforms.push(await this.createDetectionResult('Applitools', 'Storybook', 'JavaScript/TypeScript'));
        }
      }

      // Check for Sauce Labs dependencies
      if (dependencies['@saucelabs/cypress-visual-plugin']) {
        detectedPlatforms.push(await this.createDetectionResult('Sauce Labs Visual', 'Cypress', 'JavaScript/TypeScript'));
      }
      if (dependencies['screener-storybook']) {
        const hasStorybookDir = await this.hasDirectory('.storybook');
        if (hasStorybookDir) {
          detectedPlatforms.push(await this.createDetectionResult('Sauce Labs Visual', 'Storybook', 'JavaScript/TypeScript'));
        }
      }

      // Check for multiple platforms within JavaScript/TypeScript
      if (detectedPlatforms.length > 1) {
        throw new MultiplePlatformsDetectedError();
      }

      // Return first detected platform (or null if none)
      return detectedPlatforms.length > 0 ? detectedPlatforms[0]! : null;

    } catch (error) {
      // Re-throw MultiplePlatformsDetectedError if it was thrown
      if (error instanceof MultiplePlatformsDetectedError) {
        throw error;
      }
      // package.json doesn't exist or is invalid
    }

    return null;
  }

  /**
   * Analyze Java dependencies in pom.xml
   */
  private async analyzeJavaDependencies(): Promise<DetectionResult | null> {
    const pomXmlPath = path.join(this.projectPath, 'pom.xml');
    
    try {
      const pomXmlContent = await fs.readFile(pomXmlPath, 'utf-8');
      const parser = new XMLParser();
      const pomXml = parser.parse(pomXmlContent);

      // Check for Applitools dependencies
      if (this.hasMavenDependency(pomXml, 'eyes-selenium-java5')) {
        return await this.createDetectionResult('Applitools', 'Selenium', 'Java');
      }

      // Check for Sauce Labs dependencies
      if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
        return await this.createDetectionResult('Sauce Labs Visual', 'Selenium', 'Java');
      }

      // Check for Appium Java projects
      const hasAppiumClient = this.hasMavenDependency(pomXml, 'appium-java-client', 'io.appium');
      if (hasAppiumClient) {
        // Check for Percy Appium
        if (this.hasMavenDependency(pomXml, 'percy-appium-java', 'io.percy')) {
          return await this.createDetectionResult('Percy', 'Appium', 'Java');
        }
        // Check for Applitools Appium
        if (this.hasMavenDependency(pomXml, 'eyes-appium-java5', 'com.applitools')) {
          return await this.createDetectionResult('Applitools', 'Appium', 'Java');
        }
        // Check for Sauce Labs Appium
        if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
          return await this.createDetectionResult('Sauce Labs Visual', 'Appium', 'Java');
        }
      }

    } catch (error) {
      // pom.xml doesn't exist or is invalid
    }

    return null;
  }

  /**
   * Analyze Python dependencies in requirements.txt
   */
  private async analyzePythonDependencies(): Promise<DetectionResult | null> {
    const requirementsPath = path.join(this.projectPath, 'requirements.txt');
    
    try {
      const requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
      const lines = requirementsContent.split('\n').map(line => line.trim());

      // Check for Appium Python projects
      const hasAppiumClient = lines.some(line => line.includes('Appium-Python-Client'));
      if (hasAppiumClient) {
        // Check for Percy Appium
        if (lines.some(line => line.includes('percy-appium-app'))) {
          return await this.createDetectionResult('Percy', 'Appium', 'Python');
        }
        // Check for Applitools Appium
        if (lines.some(line => line.includes('eyes-selenium'))) {
          return await this.createDetectionResult('Applitools', 'Appium', 'Python');
        }
        // Check for Sauce Labs Appium
        if (lines.some(line => line.includes('saucelabs_visual'))) {
          return await this.createDetectionResult('Sauce Labs Visual', 'Appium', 'Python');
        }
      }

      // Check for Sauce Labs Robot Framework
      if (lines.some(line => line.includes('saucelabs_visual'))) {
        const hasRobotFiles = await this.hasFiles('**/*.robot');
        if (hasRobotFiles) {
          return await this.createDetectionResult('Sauce Labs Visual', 'Robot Framework', 'Python');
        }
      }

    } catch (error) {
      // requirements.txt doesn't exist
    }

    return null;
  }

  /**
   * Priority 2: Analyze configuration files as fallback
   */
  private async analyzeConfigurationFiles(): Promise<DetectionResult | null> {
    // Check for Percy config files
    const percyConfigs = await fg(['.percy.yml', '.percy.js', 'percy.config.js'], {
      cwd: this.projectPath,
      ignore: this.ignorePatterns
    });

    if (percyConfigs.length > 0) {
      // Try to determine framework from config or project structure
      const framework = await this.detectFrameworkFromStructure();
      return await this.createDetectionResult('Percy', framework, 'JavaScript/TypeScript');
    }

    // Check for Applitools config files
    const applitoolsConfigs = await fg(['applitools.config.js', 'applitools.config.ts'], {
      cwd: this.projectPath,
      ignore: this.ignorePatterns
    });

    if (applitoolsConfigs.length > 0) {
      const framework = await this.detectFrameworkFromStructure();
      return await this.createDetectionResult('Applitools', framework, 'JavaScript/TypeScript');
    }

    // Check for Sauce Labs config files
    const sauceConfigs = await fg(['saucectl.yml', 'sauce.config.js'], {
      cwd: this.projectPath,
      ignore: this.ignorePatterns
    });

    if (sauceConfigs.length > 0) {
      const framework = await this.detectFrameworkFromStructure();
      return await this.createDetectionResult('Sauce Labs Visual', framework, 'JavaScript/TypeScript');
    }

    return null;
  }

  /**
   * Detect framework from project structure
   */
  private async detectFrameworkFromStructure(): Promise<'Cypress' | 'Playwright' | 'Selenium' | 'Storybook'> {
    // Check for Cypress
    const cypressFiles = await fg(['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.json'], {
      cwd: this.projectPath,
      ignore: this.ignorePatterns
    });
    if (cypressFiles.length > 0) return 'Cypress';

    // Check for Playwright
    const playwrightFiles = await fg(['playwright.config.js', 'playwright.config.ts', 'tests/**/*.spec.js', 'tests/**/*.spec.ts'], {
      cwd: this.projectPath,
      ignore: this.ignorePatterns
    });
    if (playwrightFiles.length > 0) return 'Playwright';

    // Check for Storybook
    const storybookDir = await this.hasDirectory('.storybook');
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
    language: DetectionResult['language']
  ): Promise<DetectionResult> {
    const files = await this.collectFilePaths(platform, framework);
    
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
  private async collectFilePaths(platform: string, framework: string): Promise<DetectionResult['files']> {
    const configPatterns = this.getConfigPatterns(platform);
    const sourcePatterns = this.getSourcePatterns(framework);
    const ciPatterns = this.getCIPatterns();
    const packageManagerPatterns = this.getPackageManagerPatterns();

    const [config, source, ci, packageManager] = await Promise.all([
      fg(configPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
      fg(sourcePatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
      fg(ciPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
      fg(packageManagerPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns })
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
  private async hasDirectory(dirName: string): Promise<boolean> {
    try {
      const dirPath = path.join(this.projectPath, dirName);
      const stats = await fs.stat(dirPath);
      return stats.isDirectory();
    } catch {
      return false;
    }
  }

  /**
   * Check if files matching pattern exist
   */
  private async hasFiles(pattern: string): Promise<boolean> {
    const files = await fg([pattern], {
      cwd: this.projectPath,
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
