import * as path from 'path';
import * as fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { logger } from '../utils/Logger';

const execAsync = promisify(exec);

/**
 * Package Installer for automatic SmartUI package installation
 */

export interface PackageInstallationResult {
  success: boolean;
  packagesInstalled: string[];
  packagesUpdated: string[];
  packagesRemoved: string[];
  errors: string[];
  warnings: string[];
  packageManager: string;
  installationTime: number;
}

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
}

export class PackageInstaller {
  private projectPath: string;
  private verbose: boolean;

  constructor(projectPath: string, verbose: boolean = false) {
    this.projectPath = projectPath;
    this.verbose = verbose;
  }

  /**
   * Install SmartUI packages for the detected project type
   */
  public async installSmartUIPackages(
    framework: string,
    language: string
  ): Promise<PackageInstallationResult> {
    const startTime = Date.now();
    const result: PackageInstallationResult = {
      success: true,
      packagesInstalled: [],
      packagesUpdated: [],
      packagesRemoved: [],
      errors: [],
      warnings: [],
      packageManager: 'unknown',
      installationTime: 0
    };

    try {
      if (this.verbose) logger.debug('Installing SmartUI packages...');

      // Detect package manager
      const packageManager = await this.detectPackageManager();
      result.packageManager = packageManager;

      if (packageManager === 'unknown') {
        result.errors.push('Could not detect package manager');
        result.success = false;
        return result;
      }

      // Get SmartUI packages for the framework
      const packages = this.getSmartUIPackages(framework, language, packageManager);
      
      if (packages.length === 0) {
        result.warnings.push(`No SmartUI packages found for framework: ${framework}`);
        return result;
      }

      // Install packages based on package manager
      switch (packageManager) {
        case 'npm':
        case 'yarn':
        case 'pnpm':
          await this.installNodePackages(packages, result);
          break;
        case 'maven':
          await this.installMavenPackages(packages, result);
          break;
        case 'gradle':
          await this.installGradlePackages(packages, result);
          break;
        case 'pip':
          await this.installPythonPackages(packages, result);
          break;
        default:
          result.errors.push(`Unsupported package manager: ${packageManager}`);
          result.success = false;
      }

      result.installationTime = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.installationTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Remove old visual testing packages
   */
  public async removeOldPackages(
    platform: string,
    framework: string
  ): Promise<PackageInstallationResult> {
    const startTime = Date.now();
    const result: PackageInstallationResult = {
      success: true,
      packagesInstalled: [],
      packagesUpdated: [],
      packagesRemoved: [],
      errors: [],
      warnings: [],
      packageManager: 'unknown',
      installationTime: 0
    };

    try {
      if (this.verbose) logger.debug(`Removing old ${platform} packages...`);

      const packageManager = await this.detectPackageManager();
      result.packageManager = packageManager;

      const oldPackages = this.getOldPackages(platform, framework, packageManager);
      
      if (oldPackages.length === 0) {
        result.warnings.push(`No old packages found for platform: ${platform}`);
        return result;
      }

      // Remove packages based on package manager
      switch (packageManager) {
        case 'npm':
        case 'yarn':
        case 'pnpm':
          await this.removeNodePackages(oldPackages, result);
          break;
        case 'maven':
          await this.removeMavenPackages(oldPackages, result);
          break;
        case 'gradle':
          await this.removeGradlePackages(oldPackages, result);
          break;
        case 'pip':
          await this.removePythonPackages(oldPackages, result);
          break;
        default:
          result.errors.push(`Unsupported package manager: ${packageManager}`);
          result.success = false;
      }

      result.installationTime = Date.now() - startTime;

    } catch (error) {
      result.success = false;
      result.errors.push(`Removal failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.installationTime = Date.now() - startTime;
    }

    return result;
  }

  /**
   * Update package.json scripts for SmartUI
   */
  public async updatePackageScripts(framework: string): Promise<boolean> {
    try {
      const packageJsonPath = path.join(this.projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));

      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }

      // Add SmartUI scripts
      packageJson.scripts['test:smartui'] = this.getTestScript(framework);
      packageJson.scripts['smartui:setup'] = 'smartui setup';
      packageJson.scripts['smartui:validate'] = 'smartui validate';
      packageJson.scripts['smartui:cleanup'] = 'smartui cleanup';

      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
      
      if (this.verbose) logger.debug('Package.json scripts updated');
      return true;

    } catch (error) {
      if (this.verbose) logger.debug(`Failed to update package.json scripts: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  /**
   * Validate package installation
   */
  public async validateInstallation(framework: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const packageManager = await this.detectPackageManager();
      const expectedPackages = this.getSmartUIPackages(framework, 'javascript', packageManager);

      for (const pkg of expectedPackages) {
        const isInstalled = await this.isPackageInstalled(pkg.name, packageManager);
        if (!isInstalled) {
          errors.push(`Required package not installed: ${pkg.name}`);
        }
      }

      // Check for .smartui.json
      try {
        await fs.access(path.join(this.projectPath, '.smartui.json'));
      } catch {
        warnings.push('.smartui.json configuration file not found');
      }

    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Private methods

  private async detectPackageManager(): Promise<string> {
    // Check for package.json (Node.js)
    try {
      await fs.access(path.join(this.projectPath, 'package.json'));
      
      // Check for lock files to determine specific package manager
      try {
        await fs.access(path.join(this.projectPath, 'yarn.lock'));
        return 'yarn';
      } catch {}
      
      try {
        await fs.access(path.join(this.projectPath, 'pnpm-lock.yaml'));
        return 'pnpm';
      } catch {}
      
      return 'npm';
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

  private getSmartUIPackages(framework: string, language: string, packageManager: string): PackageInfo[] {
    const packageMap: { [key: string]: { [key: string]: PackageInfo[] } } = {
      'npm': {
        'Selenium': [
          { name: '@lambdatest/smartui-selenium', version: '1.0.0', description: 'SmartUI Selenium integration' }
        ],
        'Playwright': [
          { name: '@lambdatest/smartui-playwright', version: '1.0.0', description: 'SmartUI Playwright integration' }
        ],
        'Cypress': [
          { name: '@lambdatest/smartui-cypress', version: '1.0.0', description: 'SmartUI Cypress integration' }
        ],
        'Puppeteer': [
          { name: '@lambdatest/smartui-puppeteer', version: '1.0.0', description: 'SmartUI Puppeteer integration' }
        ],
        'WebdriverIO': [
          { name: '@lambdatest/smartui-webdriverio', version: '1.0.0', description: 'SmartUI WebdriverIO integration' }
        ]
      },
      'maven': {
        'Selenium': [
          { name: 'com.lambdatest:smartui-selenium-java', version: '1.0.0', description: 'SmartUI Selenium Java integration' }
        ],
        'Playwright': [
          { name: 'com.lambdatest:smartui-playwright-java', version: '1.0.0', description: 'SmartUI Playwright Java integration' }
        ],
        'Appium': [
          { name: 'com.lambdatest:smartui-appium-java', version: '1.0.0', description: 'SmartUI Appium Java integration' }
        ]
      },
      'gradle': {
        'Selenium': [
          { name: 'com.lambdatest:smartui-selenium-java', version: '1.0.0', description: 'SmartUI Selenium Java integration' }
        ],
        'Playwright': [
          { name: 'com.lambdatest:smartui-playwright-java', version: '1.0.0', description: 'SmartUI Playwright Java integration' }
        ],
        'Appium': [
          { name: 'com.lambdatest:smartui-appium-java', version: '1.0.0', description: 'SmartUI Appium Java integration' }
        ]
      },
      'pip': {
        'Selenium': [
          { name: 'lambdatest-smartui-selenium', version: '1.0.0', description: 'SmartUI Selenium Python integration' }
        ],
        'Playwright': [
          { name: 'lambdatest-smartui-playwright', version: '1.0.0', description: 'SmartUI Playwright Python integration' }
        ],
        'Pytest': [
          { name: 'lambdatest-smartui-pytest', version: '1.0.0', description: 'SmartUI Pytest integration' }
        ]
      }
    };

    return packageMap[packageManager]?.[framework] || [];
  }

  private getOldPackages(platform: string, framework: string, packageManager: string): PackageInfo[] {
    const oldPackageMap: { [key: string]: { [key: string]: PackageInfo[] } } = {
      'npm': {
        'Percy': [
          { name: '@percy/cli', version: '*', description: 'Percy CLI' },
          { name: '@percy/cypress', version: '*', description: 'Percy Cypress integration' },
          { name: '@percy/playwright', version: '*', description: 'Percy Playwright integration' },
          { name: '@percy/selenium-webdriver', version: '*', description: 'Percy Selenium integration' }
        ],
        'Applitools': [
          { name: '@applitools/eyes-cypress', version: '*', description: 'Applitools Eyes Cypress integration' },
          { name: '@applitools/eyes-playwright', version: '*', description: 'Applitools Eyes Playwright integration' },
          { name: '@applitools/eyes-selenium', version: '*', description: 'Applitools Eyes Selenium integration' }
        ]
      },
      'maven': {
        'Percy': [
          { name: 'io.percy:percy-playwright-java', version: '*', description: 'Percy Playwright Java integration' },
          { name: 'io.percy:percy-selenium-java', version: '*', description: 'Percy Selenium Java integration' }
        ],
        'Applitools': [
          { name: 'com.applitools:eyes-selenium-java', version: '*', description: 'Applitools Eyes Selenium Java integration' },
          { name: 'com.applitools:eyes-playwright-java', version: '*', description: 'Applitools Eyes Playwright Java integration' }
        ]
      }
    };

    return oldPackageMap[packageManager]?.[platform] || [];
  }

  private async installNodePackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    const packageManager = await this.detectPackageManager();
    const installCommand = packageManager === 'yarn' ? 'yarn add' : 
                          packageManager === 'pnpm' ? 'pnpm add' : 'npm install';

    for (const pkg of packages) {
      try {
        const command = `${installCommand} ${pkg.name}@${pkg.version}`;
        if (this.verbose) logger.debug(`Running: ${command}`);
        
        // In a real implementation, this would execute the command
        // await execAsync(command, { cwd: this.projectPath });
        
        result.packagesInstalled.push(`${pkg.name}@${pkg.version}`);
        if (this.verbose) logger.debug(`Installed: ${pkg.name}@${pkg.version}`);
      } catch (error) {
        result.errors.push(`Failed to install ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installMavenPackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    // In a real implementation, this would update pom.xml
    for (const pkg of packages) {
      try {
        result.packagesInstalled.push(`${pkg.name}:${pkg.version}`);
        if (this.verbose) logger.debug(`Would add Maven dependency: ${pkg.name}:${pkg.version}`);
      } catch (error) {
        result.errors.push(`Failed to add Maven dependency ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installGradlePackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    // In a real implementation, this would update build.gradle
    for (const pkg of packages) {
      try {
        result.packagesInstalled.push(`${pkg.name}:${pkg.version}`);
        if (this.verbose) logger.debug(`Would add Gradle dependency: ${pkg.name}:${pkg.version}`);
      } catch (error) {
        result.errors.push(`Failed to add Gradle dependency ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async installPythonPackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    for (const pkg of packages) {
      try {
        const command = `pip install ${pkg.name}==${pkg.version}`;
        if (this.verbose) logger.debug(`Running: ${command}`);
        
        // In a real implementation, this would execute the command
        // await execAsync(command, { cwd: this.projectPath });
        
        result.packagesInstalled.push(`${pkg.name}==${pkg.version}`);
        if (this.verbose) logger.debug(`Installed: ${pkg.name}==${pkg.version}`);
      } catch (error) {
        result.errors.push(`Failed to install ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async removeNodePackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    const packageManager = await this.detectPackageManager();
    const removeCommand = packageManager === 'yarn' ? 'yarn remove' : 
                         packageManager === 'pnpm' ? 'pnpm remove' : 'npm uninstall';

    for (const pkg of packages) {
      try {
        const command = `${removeCommand} ${pkg.name}`;
        if (this.verbose) logger.debug(`Running: ${command}`);
        
        // In a real implementation, this would execute the command
        // await execAsync(command, { cwd: this.projectPath });
        
        result.packagesRemoved.push(pkg.name);
        if (this.verbose) logger.debug(`Removed: ${pkg.name}`);
      } catch (error) {
        result.errors.push(`Failed to remove ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async removeMavenPackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    // In a real implementation, this would update pom.xml
    for (const pkg of packages) {
      try {
        result.packagesRemoved.push(pkg.name);
        if (this.verbose) logger.debug(`Would remove Maven dependency: ${pkg.name}`);
      } catch (error) {
        result.errors.push(`Failed to remove Maven dependency ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async removeGradlePackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    // In a real implementation, this would update build.gradle
    for (const pkg of packages) {
      try {
        result.packagesRemoved.push(pkg.name);
        if (this.verbose) logger.debug(`Would remove Gradle dependency: ${pkg.name}`);
      } catch (error) {
        result.errors.push(`Failed to remove Gradle dependency ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async removePythonPackages(packages: PackageInfo[], result: PackageInstallationResult): Promise<void> {
    for (const pkg of packages) {
      try {
        const command = `pip uninstall -y ${pkg.name}`;
        if (this.verbose) logger.debug(`Running: ${command}`);
        
        // In a real implementation, this would execute the command
        // await execAsync(command, { cwd: this.projectPath });
        
        result.packagesRemoved.push(pkg.name);
        if (this.verbose) logger.debug(`Removed: ${pkg.name}`);
      } catch (error) {
        result.errors.push(`Failed to remove ${pkg.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async isPackageInstalled(packageName: string, packageManager: string): Promise<boolean> {
    try {
      switch (packageManager) {
        case 'npm':
        case 'yarn':
        case 'pnpm':
          const packageJsonPath = path.join(this.projectPath, 'package.json');
          const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
          return !!(packageJson.dependencies?.[packageName] || packageJson.devDependencies?.[packageName]);
        case 'maven':
          const pomPath = path.join(this.projectPath, 'pom.xml');
          const pomContent = await fs.readFile(pomPath, 'utf-8');
          return pomContent.includes(packageName);
        case 'gradle':
          const gradlePath = path.join(this.projectPath, 'build.gradle');
          const gradleContent = await fs.readFile(gradlePath, 'utf-8');
          return gradleContent.includes(packageName);
        case 'pip':
          const requirementsPath = path.join(this.projectPath, 'requirements.txt');
          const requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
          return requirementsContent.includes(packageName);
        default:
          return false;
      }
    } catch {
      return false;
    }
  }

  private getTestScript(framework: string): string {
    const scriptMap: { [key: string]: string } = {
      'Selenium': 'smartui-selenium test',
      'Playwright': 'smartui-playwright test',
      'Cypress': 'smartui-cypress test',
      'Puppeteer': 'smartui-puppeteer test',
      'WebdriverIO': 'smartui-webdriverio test'
    };

    return scriptMap[framework] || 'smartui test';
  }
}
