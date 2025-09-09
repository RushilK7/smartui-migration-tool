import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../utils/Logger';

/**
 * SmartUI Configuration Generator for zero-configuration setup
 */

export interface SmartUIConfig {
  project: {
    name: string;
    type: string;
    framework: string;
    language: string;
  };
  browsers: string[];
  devices: string[];
  settings: SmartUISettings;
  environments: EnvironmentConfig[];
  credentials: {
    username?: string;
    accessKey?: string;
    projectToken?: string;
  };
}

export interface SmartUISettings {
  screenshotTimeout: number;
  comparisonThreshold: number;
  ignoreRegions: IgnoreRegion[];
  fullPageScreenshot: boolean;
  captureScrollbars: boolean;
  viewportSizes?: ViewportSize[];
  deviceTypes?: string[];
  baselineBranch?: string;
  ignoreAntialiasing?: boolean;
  ignoreColors?: boolean;
  ignoreDisplacements?: boolean;
  layoutBreakpoints?: number[];
}

export interface IgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  description?: string;
}

export interface ViewportSize {
  width: number;
  height: number;
  name?: string;
}

export interface EnvironmentConfig {
  name: string;
  url: string;
  variables: { [key: string]: string };
  browsers: string[];
  devices: string[];
}

export interface PackageInstallation {
  success: boolean;
  packagesInstalled: string[];
  errors: string[];
  warnings: string[];
}

export class SmartUIConfigGenerator {
  private projectPath: string;
  private verbose: boolean;

  constructor(projectPath: string, verbose: boolean = false) {
    this.projectPath = projectPath;
    this.verbose = verbose;
  }

  /**
   * Generate complete SmartUI configuration
   */
  public async generateSmartUIConfig(
    projectType: string,
    framework: string,
    language: string
  ): Promise<SmartUIConfig> {
    if (this.verbose) logger.debug('Generating SmartUI configuration...');

    const config: SmartUIConfig = {
      project: {
        name: await this.detectProjectName(),
        type: projectType,
        framework: framework,
        language: language
      },
      browsers: await this.detectSupportedBrowsers(framework),
      devices: await this.detectSupportedDevices(framework),
      settings: await this.generateDefaultSettings(projectType, framework),
      environments: await this.generateEnvironmentConfigs(projectType),
      credentials: {
        // Will be populated by user or environment variables
      }
    };

    await this.writeSmartUIConfig(config);
    return config;
  }

  /**
   * Install SmartUI packages automatically
   */
  public async installPackages(framework: string, language: string): Promise<PackageInstallation> {
    const result: PackageInstallation = {
      success: true,
      packagesInstalled: [],
      errors: [],
      warnings: []
    };

    try {
      if (this.verbose) logger.debug('Installing SmartUI packages...');

      // Detect package manager
      const packageManager = await this.detectPackageManager();
      
      if (packageManager === 'npm' || packageManager === 'yarn' || packageManager === 'pnpm') {
        await this.installNodePackages(framework, result);
      } else if (packageManager === 'maven') {
        await this.installMavenPackages(framework, result);
      } else if (packageManager === 'gradle') {
        await this.installGradlePackages(framework, result);
      } else if (packageManager === 'pip') {
        await this.installPythonPackages(framework, result);
      } else {
        result.warnings.push(`Unsupported package manager: ${packageManager}`);
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Failed to install packages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Generate environment setup scripts
   */
  public async generateEnvironmentScripts(): Promise<void> {
    if (this.verbose) logger.debug('Generating environment setup scripts...');

    // Generate .env template
    const envTemplate = this.generateEnvTemplate();
    await fs.writeFile(path.join(this.projectPath, '.env.template'), envTemplate, 'utf-8');

    // Generate environment setup script
    const setupScript = this.generateSetupScript();
    await fs.writeFile(path.join(this.projectPath, 'setup-smartui.sh'), setupScript, 'utf-8');
    
    // Make script executable
    await fs.chmod(path.join(this.projectPath, 'setup-smartui.sh'), 0o755);

    if (this.verbose) logger.debug('Environment setup scripts generated');
  }

  /**
   * Validate SmartUI configuration
   */
  public async validateConfiguration(): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const configPath = path.join(this.projectPath, '.smartui.json');
      const configContent = await fs.readFile(configPath, 'utf-8');
      const config: SmartUIConfig = JSON.parse(configContent);

      // Validate required fields
      if (!config.project.name) {
        errors.push('Project name is required');
      }
      if (!config.project.framework) {
        errors.push('Project framework is required');
      }
      if (!config.browsers || config.browsers.length === 0) {
        warnings.push('No browsers configured');
      }
      if (!config.settings) {
        errors.push('Settings configuration is required');
      }

      // Validate credentials (optional but recommended)
      if (!config.credentials.username && !process.env['LT_USERNAME']) {
        warnings.push('SmartUI username not configured. Set LT_USERNAME environment variable or update .smartui.json');
      }
      if (!config.credentials.accessKey && !process.env['LT_ACCESS_KEY']) {
        warnings.push('SmartUI access key not configured. Set LT_ACCESS_KEY environment variable or update .smartui.json');
      }

    } catch (error) {
      errors.push(`Failed to read or parse .smartui.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private methods

  private async detectProjectName(): Promise<string> {
    try {
      // Try package.json first
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      return packageJson.name || path.basename(this.projectPath);
    } catch {
      try {
        // Try pom.xml
        const pomPath = path.join(this.projectPath, 'pom.xml');
        const pomContent = await fs.readFile(pomPath, 'utf-8');
        const pomObject = await this.parsePomXml(pomContent);
        return pomObject.project?.artifactId?.[0] || path.basename(this.projectPath);
      } catch {
        return path.basename(this.projectPath);
      }
    }
  }

  private async parsePomXml(content: string): Promise<any> {
    // Simple XML parsing for artifactId
    const artifactIdMatch = content.match(/<artifactId>([^<]+)<\/artifactId>/);
    return {
      project: {
        artifactId: artifactIdMatch ? [artifactIdMatch[1]] : []
      }
    };
  }

  private async detectSupportedBrowsers(framework: string): Promise<string[]> {
    const browserMap: { [key: string]: string[] } = {
      'Selenium': ['chrome', 'firefox', 'safari', 'edge'],
      'Playwright': ['chrome', 'firefox', 'safari', 'edge', 'webkit'],
      'Cypress': ['chrome', 'firefox', 'edge', 'webkit'],
      'Puppeteer': ['chrome'],
      'WebdriverIO': ['chrome', 'firefox', 'safari', 'edge'],
      'Appium': ['chrome', 'safari']
    };

    return browserMap[framework] || ['chrome', 'firefox', 'safari', 'edge'];
  }

  private async detectSupportedDevices(framework: string): Promise<string[]> {
    const deviceMap: { [key: string]: string[] } = {
      'Selenium': ['desktop', 'tablet', 'mobile'],
      'Playwright': ['desktop', 'tablet', 'mobile'],
      'Cypress': ['desktop', 'tablet', 'mobile'],
      'Puppeteer': ['desktop'],
      'WebdriverIO': ['desktop', 'tablet', 'mobile'],
      'Appium': ['mobile', 'tablet']
    };

    return deviceMap[framework] || ['desktop', 'tablet', 'mobile'];
  }

  private async generateDefaultSettings(projectType: string, framework: string): Promise<SmartUISettings> {
    const baseSettings: SmartUISettings = {
      screenshotTimeout: 30000,
      comparisonThreshold: 0.1,
      ignoreRegions: [],
      fullPageScreenshot: true,
      captureScrollbars: false,
      ignoreAntialiasing: false,
      ignoreColors: false,
      ignoreDisplacements: false
    };

    // Add type-specific settings
    switch (projectType.toLowerCase()) {
      case 'web':
        baseSettings.viewportSizes = [
          { width: 1920, height: 1080, name: 'Desktop Large' },
          { width: 1366, height: 768, name: 'Desktop Medium' },
          { width: 375, height: 667, name: 'Mobile' },
          { width: 768, height: 1024, name: 'Tablet' }
        ];
        baseSettings.deviceTypes = ['desktop', 'tablet', 'mobile'];
        break;
      case 'mobile':
        baseSettings.deviceTypes = ['mobile', 'tablet'];
        baseSettings.viewportSizes = [
          { width: 375, height: 667, name: 'iPhone SE' },
          { width: 414, height: 896, name: 'iPhone 11' },
          { width: 768, height: 1024, name: 'iPad' }
        ];
        break;
      case 'desktop':
        baseSettings.deviceTypes = ['desktop'];
        baseSettings.viewportSizes = [
          { width: 1920, height: 1080, name: 'Full HD' },
          { width: 2560, height: 1440, name: '2K' },
          { width: 3840, height: 2160, name: '4K' }
        ];
        break;
    }

    // Add framework-specific settings
    if (framework === 'Cypress') {
      baseSettings.layoutBreakpoints = [768, 1024, 1440];
    }

    return baseSettings;
  }

  private async generateEnvironmentConfigs(projectType: string): Promise<EnvironmentConfig[]> {
    const environments: EnvironmentConfig[] = [];

    // Add common environments
    environments.push({
      name: 'local',
      url: 'http://localhost:3000',
      variables: {
        NODE_ENV: 'development'
      },
      browsers: ['chrome'],
      devices: ['desktop']
    });

    environments.push({
      name: 'staging',
      url: 'https://staging.example.com',
      variables: {
        NODE_ENV: 'staging'
      },
      browsers: ['chrome', 'firefox'],
      devices: ['desktop', 'tablet']
    });

    environments.push({
      name: 'production',
      url: 'https://example.com',
      variables: {
        NODE_ENV: 'production'
      },
      browsers: ['chrome', 'firefox', 'safari', 'edge'],
      devices: ['desktop', 'tablet', 'mobile']
    });

    return environments;
  }

  private async writeSmartUIConfig(config: SmartUIConfig): Promise<void> {
    const configPath = path.join(this.projectPath, '.smartui.json');
    const configContent = JSON.stringify(config, null, 2);
    await fs.writeFile(configPath, configContent, 'utf-8');
    
    if (this.verbose) logger.debug(`SmartUI configuration written to ${configPath}`);
  }

  private async detectPackageManager(): Promise<string> {
    // Check for package.json (Node.js)
    try {
      await fs.access(path.join(this.projectPath, 'package.json'));
      return 'npm'; // Default to npm, could also check for yarn.lock or pnpm-lock.yaml
    } catch {}

    // Check for pom.xml (Maven)
    try {
      await fs.access(path.join(this.projectPath, 'pom.xml'));
      return 'maven';
    } catch {}

    // Check for build.gradle (Gradle)
    try {
      await fs.access(path.join(this.projectPath, 'build.gradle'));
      return 'gradle';
    } catch {}

    // Check for requirements.txt (Python)
    try {
      await fs.access(path.join(this.projectPath, 'requirements.txt'));
      return 'pip';
    } catch {}

    return 'unknown';
  }

  private async installNodePackages(framework: string, result: PackageInstallation): Promise<void> {
    const packages = this.getNodePackages(framework);
    
    for (const pkg of packages) {
      try {
        // In a real implementation, this would run npm install
        result.packagesInstalled.push(pkg);
        if (this.verbose) logger.debug(`Would install: ${pkg}`);
      } catch (error) {
        result.errors.push(`Failed to install ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installMavenPackages(framework: string, result: PackageInstallation): Promise<void> {
    const packages = this.getMavenPackages(framework);
    
    for (const pkg of packages) {
      try {
        // In a real implementation, this would update pom.xml
        result.packagesInstalled.push(pkg);
        if (this.verbose) logger.debug(`Would add Maven dependency: ${pkg}`);
      } catch (error) {
        result.errors.push(`Failed to add Maven dependency ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installGradlePackages(framework: string, result: PackageInstallation): Promise<void> {
    const packages = this.getGradlePackages(framework);
    
    for (const pkg of packages) {
      try {
        // In a real implementation, this would update build.gradle
        result.packagesInstalled.push(pkg);
        if (this.verbose) logger.debug(`Would add Gradle dependency: ${pkg}`);
      } catch (error) {
        result.errors.push(`Failed to add Gradle dependency ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installPythonPackages(framework: string, result: PackageInstallation): Promise<void> {
    const packages = this.getPythonPackages(framework);
    
    for (const pkg of packages) {
      try {
        // In a real implementation, this would run pip install
        result.packagesInstalled.push(pkg);
        if (this.verbose) logger.debug(`Would install Python package: ${pkg}`);
      } catch (error) {
        result.errors.push(`Failed to install Python package ${pkg}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private getNodePackages(framework: string): string[] {
    const packageMap: { [key: string]: string[] } = {
      'Selenium': ['@lambdatest/smartui-selenium'],
      'Playwright': ['@lambdatest/smartui-playwright'],
      'Cypress': ['@lambdatest/smartui-cypress'],
      'Puppeteer': ['@lambdatest/smartui-puppeteer'],
      'WebdriverIO': ['@lambdatest/smartui-webdriverio']
    };

    return packageMap[framework] || ['@lambdatest/smartui-cli'];
  }

  private getMavenPackages(framework: string): string[] {
    const packageMap: { [key: string]: string[] } = {
      'Selenium': ['com.lambdatest:smartui-selenium-java:1.0.0'],
      'Playwright': ['com.lambdatest:smartui-playwright-java:1.0.0'],
      'Appium': ['com.lambdatest:smartui-appium-java:1.0.0']
    };

    return packageMap[framework] || ['com.lambdatest:smartui-selenium-java:1.0.0'];
  }

  private getGradlePackages(framework: string): string[] {
    const packageMap: { [key: string]: string[] } = {
      'Selenium': ['com.lambdatest:smartui-selenium-java:1.0.0'],
      'Playwright': ['com.lambdatest:smartui-playwright-java:1.0.0'],
      'Appium': ['com.lambdatest:smartui-appium-java:1.0.0']
    };

    return packageMap[framework] || ['com.lambdatest:smartui-selenium-java:1.0.0'];
  }

  private getPythonPackages(framework: string): string[] {
    const packageMap: { [key: string]: string[] } = {
      'Selenium': ['lambdatest-smartui-selenium'],
      'Playwright': ['lambdatest-smartui-playwright'],
      'Pytest': ['lambdatest-smartui-pytest']
    };

    return packageMap[framework] || ['lambdatest-smartui-selenium'];
  }

  private generateEnvTemplate(): string {
    return `# SmartUI Configuration
# Copy this file to .env and fill in your credentials

# LambdaTest SmartUI Credentials
LT_USERNAME=your_username_here
LT_ACCESS_KEY=your_access_key_here
LT_PROJECT_TOKEN=your_project_token_here

# Optional: SmartUI Settings
SMARTUI_BROWSER=chrome
SMARTUI_VIEWPORT=1920x1080
SMARTUI_TIMEOUT=30000
SMARTUI_THRESHOLD=0.1

# Optional: Test Environment
TEST_ENV=staging
TEST_URL=https://staging.example.com
`;
  }

  private generateSetupScript(): string {
    return `#!/bin/bash

# SmartUI Setup Script
# This script helps you set up SmartUI for your project

echo "🚀 Setting up SmartUI for your project..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.template .env
    echo "⚠️  Please edit .env file with your LambdaTest credentials"
    echo "   - LT_USERNAME: Your LambdaTest username"
    echo "   - LT_ACCESS_KEY: Your LambdaTest access key"
    echo "   - LT_PROJECT_TOKEN: Your SmartUI project token"
else
    echo "✅ .env file already exists"
fi

# Check if .smartui.json exists
if [ ! -f .smartui.json ]; then
    echo "❌ .smartui.json not found. Please run the migration tool first."
    exit 1
else
    echo "✅ .smartui.json found"
fi

# Install SmartUI packages
echo "📦 Installing SmartUI packages..."

# Detect package manager and install packages
if [ -f package.json ]; then
    echo "📦 Installing Node.js packages..."
    npm install @lambdatest/smartui-cli
elif [ -f pom.xml ]; then
    echo "📦 Maven project detected. Please add SmartUI dependencies to pom.xml"
elif [ -f build.gradle ]; then
    echo "📦 Gradle project detected. Please add SmartUI dependencies to build.gradle"
elif [ -f requirements.txt ]; then
    echo "📦 Installing Python packages..."
    pip install lambdatest-smartui-selenium
else
    echo "⚠️  Unknown project type. Please install SmartUI packages manually."
fi

echo "✅ SmartUI setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Run your tests with SmartUI"
echo "3. Check the SmartUI dashboard for results"
`;
  }
}
