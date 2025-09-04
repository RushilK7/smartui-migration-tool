/**
 * DependencyMapper - Single source of truth for dependency transformations
 * Maps source platform dependencies to SmartUI equivalents
 */

export interface DependencyMapping {
  [sourcePackage: string]: string;
}

export interface PlatformMappings {
  [platform: string]: DependencyMapping;
}

/**
 * Complete dependency mapping for all supported platforms and frameworks
 */
export const DEPENDENCY_MAPPINGS: PlatformMappings = {
  // Percy dependencies
  'Percy': {
    // Core CLI
    '@percy/cli': '@lambdatest/smartui-cli',
    
    // Framework-specific packages
    '@percy/cypress': '@lambdatest/smartui-cypress',
    '@percy/playwright': '@lambdatest/smartui-playwright',
    '@percy/selenium-webdriver': '@lambdatest/smartui-selenium',
    '@percy/storybook': '@lambdatest/smartui-storybook',
    '@percy/appium-app': '@lambdatest/smartui-appium',
    '@percy/automate': '@lambdatest/smartui-automate',
    '@percy/puppeteer': '@lambdatest/smartui-puppeteer',
    
    // Legacy packages
    '@percy/agent': '@lambdatest/smartui-cli',
    '@percy/sdk': '@lambdatest/smartui-cli',
  },

  // Applitools dependencies
  'Applitools': {
    // Core packages
    '@applitools/eyes-selenium': '@lambdatest/smartui-selenium',
    '@applitools/eyes-cypress': '@lambdatest/smartui-cypress',
    '@applitools/eyes-playwright': '@lambdatest/smartui-playwright',
    '@applitools/eyes-storybook': '@lambdatest/smartui-storybook',
    '@applitools/eyes-webdriverio': '@lambdatest/smartui-webdriverio',
    '@applitools/eyes-puppeteer': '@lambdatest/smartui-puppeteer',
    
    // Core SDK
    '@applitools/eyes': '@lambdatest/smartui-cli',
    '@applitools/eyes-api': '@lambdatest/smartui-cli',
  },

  // Sauce Labs dependencies
  'Sauce Labs Visual': {
    // Core packages
    '@saucelabs/cypress-plugin': '@lambdatest/smartui-cypress',
    '@saucelabs/cypress-visual-plugin': '@lambdatest/smartui-cypress',
    '@saucelabs/webdriverio': '@lambdatest/smartui-selenium',
    '@saucelabs/playwright-plugin': '@lambdatest/smartui-playwright',
    '@saucelabs/sauce-cypress-runner': '@lambdatest/smartui-cypress',
    '@saucelabs/sauce-playwright-runner': '@lambdatest/smartui-playwright',
    
    // Core CLI
    'saucectl': '@lambdatest/smartui-cli',
  }
};

/**
 * Environment variable mappings for CI/CD transformation
 */
export const ENV_VAR_MAPPINGS: { [platform: string]: { [oldVar: string]: string } } = {
  'Percy': {
    'PERCY_TOKEN': 'PROJECT_TOKEN',
    'PERCY_BRANCH': 'LT_BRANCH',
    'PERCY_PROJECT': 'LT_PROJECT',
  },
  'Applitools': {
    'APPLITOOLS_API_KEY': 'PROJECT_TOKEN',
    'APPLITOOLS_BATCH_ID': 'LT_BATCH_ID',
    'APPLITOOLS_BRANCH_NAME': 'LT_BRANCH',
  },
  'Sauce Labs Visual': {
    'SAUCE_USERNAME': 'LT_USERNAME',
    'SAUCE_ACCESS_KEY': 'LT_ACCESS_KEY',
    'SAUCE_REGION': 'LT_REGION',
  }
};

/**
 * Get dependency mappings for a specific platform
 */
export function getDependencyMappings(platform: string): DependencyMapping {
  return DEPENDENCY_MAPPINGS[platform] || {};
}

/**
 * Get environment variable mappings for a specific platform
 */
export function getEnvVarMappings(platform: string): { [oldVar: string]: string } {
  return ENV_VAR_MAPPINGS[platform] || {};
}

/**
 * Check if a package is a source platform package
 */
export function isSourcePackage(packageName: string, platform: string): boolean {
  const mappings = getDependencyMappings(platform);
  return packageName in mappings;
}

/**
 * Get the SmartUI equivalent for a source package
 */
export function getSmartUIPackage(sourcePackage: string, platform: string): string | null {
  const mappings = getDependencyMappings(platform);
  return mappings[sourcePackage] || null;
}

/**
 * Get all source packages for a platform
 */
export function getSourcePackages(platform: string): string[] {
  const mappings = getDependencyMappings(platform);
  return Object.keys(mappings);
}

/**
 * Get all SmartUI packages for a platform
 */
export function getSmartUIPackages(platform: string): string[] {
  const mappings = getDependencyMappings(platform);
  return Object.values(mappings);
}
