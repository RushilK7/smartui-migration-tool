import { promises as fs } from 'fs';
import path from 'path';
import fg from 'fast-glob';
import yaml from 'js-yaml';
import { XMLParser } from 'fast-xml-parser';
import { DetectionResult, AnchorResult, PlatformNotDetectedError, MultiplePlatformsDetectedError } from '../types';
import { logger } from '../utils/Logger';

/**
 * Scanner module for analyzing user's project structure and dependencies
 * Implements "Anchor and Search" strategy for intelligent, content-aware detection
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

  // Magic strings for each platform to search in source code
  private readonly platformMagicStrings = {
    'Percy': [
      'percySnapshot',
      'percyScreenshot',
      'percy.capture',
      'percy.snapshot',
      'percy.screenshot',
      '@percy/cypress',
      '@percy/playwright',
      '@percy/storybook',
      // Framework-specific patterns for Percy projects
      'cy.visit',
      'cy.get',
      'cy.click',
      'page.goto',
      'page.click',
      'page.fill',
      'export default',
      'export const',
      'title:'
    ],
    'Applitools': [
      'eyes.check',
      'eyes.open',
      'eyes.close',
      'eyes.checkWindow',
      'eyes.checkElement',
      '@applitools/eyes',
      'eyes.selenium',
      'eyes.playwright'
    ],
    'Sauce Labs Visual': [
      'sauceVisualCheck',
      'sauceVisualSnapshot',
      'sauce.visual',
      'screener.snapshot',
      'screener.check',
      'saucelabs_visual',
      'SauceVisual',
      'check_page',
      'snapshot'
    ]
  };

  // Framework signature patterns with weights for intelligent framework detection
  private readonly frameworkSignatures = {
    Cypress: [
      { pattern: /cy\.(visit|get|contains|click|type|find|should|wait|intercept|request)\(/, weight: 0.9 },
      { pattern: /Cypress\.Commands\.add/, weight: 0.8 },
      { pattern: /cypress\.config\./, weight: 0.7 },
      { pattern: /cy\.(on|off|window|document)\(/, weight: 0.6 },
      { pattern: /describe\s*\(\s*['"]/, weight: 0.3 }, // Weak signal, also in Mocha/Jest
      { pattern: /it\s*\(\s*['"]/, weight: 0.3 },         // Weak signal, also in Mocha/Jest
    ],
    Playwright: [
      { pattern: /page\.(goto|click|fill|locator|getByRole|getByText|getByLabel)\(/, weight: 0.9 },
      { pattern: /expect\s*\(\s*page\s*\)/, weight: 0.8 },
      { pattern: /test\s*\(\s*['"]/, weight: 0.5 },     // Stronger signal than 'it'
      { pattern: /browser\.(newPage|close)\(/, weight: 0.7 },
      { pattern: /context\.(newPage|close)\(/, weight: 0.6 },
      { pattern: /playwright\.config\./, weight: 0.7 },
    ],
    Selenium: [
      { pattern: /new ChromeDriver\(\)/, weight: 0.7 },
      { pattern: /new FirefoxDriver\(\)/, weight: 0.7 },
      { pattern: /new EdgeDriver\(\)/, weight: 0.7 },
      { pattern: /WebDriverWait\s*\(/, weight: 0.6 },
      { pattern: /By\.(id|cssSelector|xpath|className|tagName)\(/, weight: 0.5 },
      { pattern: /driver\.(findElement|findElements)\(/, weight: 0.6 },
      { pattern: /Actions\s*\(/, weight: 0.5 },
      { pattern: /JavascriptExecutor/, weight: 0.4 },
    ],
    'Robot Framework': [
      { pattern: /Open Browser/, weight: 0.8 },
      { pattern: /Click Element/, weight: 0.7 },
      { pattern: /Input Text/, weight: 0.7 },
      { pattern: /Get Text/, weight: 0.6 },
      { pattern: /Wait Until Element Is Visible/, weight: 0.6 },
      { pattern: /Robot Framework/, weight: 0.5 },
    ],
    Appium: [
      { pattern: /driver\.findElementBy/, weight: 0.8 },
      { pattern: /MobileElement/, weight: 0.7 },
      { pattern: /AppiumDriver/, weight: 0.7 },
      { pattern: /DesiredCapabilities/, weight: 0.6 },
      { pattern: /TouchAction/, weight: 0.6 },
      { pattern: /appium/, weight: 0.5 },
    ],
    Storybook: [
      { pattern: /\.stories\.(js|ts|jsx|tsx)/, weight: 0.9 },
      { pattern: /export default.*title:/, weight: 0.8 },
      { pattern: /export const.*=.*\(\)/, weight: 0.7 },
      { pattern: /\.add\(/, weight: 0.6 },
      { pattern: /Storybook/, weight: 0.5 },
    ]
  };

  constructor(projectPath: string, verbose: boolean = false) {
    this.projectPath = projectPath;
    this.verbose = verbose;
  }

  /**
   * Scans the project for existing visual testing frameworks using "Anchor and Search" strategy
   * @returns Promise<DetectionResult> - Analysis results
   */
  public async scan(): Promise<DetectionResult> {
    try {
      // Standardize on absolute paths - resolve the user-provided path immediately
      const absoluteScanPath = path.resolve(this.projectPath);
      logger.debug(`Resolved target directory to absolute path: ${absoluteScanPath}`);

      // Phase 1: Find Anchor (Fast, high-confidence detection)
      logger.debug('Phase 1: Finding anchor through dependency and config analysis');
      const anchorResult = await this.findAnchor(absoluteScanPath);
      logger.debug(`Anchor result: platform=${anchorResult.platform}, magicStrings=${anchorResult.magicStrings.join(', ')}`);

      // Phase 2: Deep Content Search
      let magicStrings = anchorResult.magicStrings;
      
      // Handle "No Anchor" fallback - perform cold search with all possible magic strings
      if (anchorResult.platform === 'unknown') {
        logger.debug('No anchor found, performing cold search with all magic strings');
        magicStrings = [
          ...this.platformMagicStrings.Percy,
          ...this.platformMagicStrings.Applitools,
          ...this.platformMagicStrings['Sauce Labs Visual']
        ];
      } else if (!anchorResult.framework || !anchorResult.language) {
        // We have a platform anchor but no framework info - use broader magic strings for better detection
        logger.debug('Platform anchor found but no framework info, using broader magic strings');
        magicStrings = [
          ...anchorResult.magicStrings,
          ...this.platformMagicStrings[anchorResult.platform]
        ];
      }

      logger.debug('Phase 2: Performing deep content search');
      const sourceFiles = await this.deepContentSearch(absoluteScanPath, magicStrings);
      logger.debug(`Deep search found ${sourceFiles.length} source files with magic strings`);

      // If we found source files but no anchor, determine platform from content
      let detectedPlatform = anchorResult.platform;
      if (anchorResult.platform === 'unknown' && sourceFiles.length > 0) {
        detectedPlatform = await this.determinePlatformFromContent(absoluteScanPath, sourceFiles);
        logger.debug(`Determined platform from content: ${detectedPlatform}`);
      }

      // If still no platform detected, throw error
      if (detectedPlatform === 'unknown') {
        logger.debug('No platform detected through any method');
      throw new PlatformNotDetectedError();
      }

      // Construct final DetectionResult
      const result = await this.createDetectionResult(detectedPlatform, absoluteScanPath, sourceFiles, anchorResult);
      logger.debug(`Final detection result: platform=${result.platform}, framework=${result.framework}, sourceFiles=${result.files.source.length}`);
      
      return result;

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
   * Phase 1: Find Anchor - Fast, high-confidence detection through dependencies and config files
   */
  private async findAnchor(absoluteScanPath: string): Promise<AnchorResult> {
    logger.debug('Searching for dependency files (package.json, pom.xml, requirements.txt)');
    
    const detectedAnchors: AnchorResult[] = [];

    // Check JavaScript/TypeScript projects
    logger.debug('Checking JavaScript/TypeScript dependencies...');
    const jsAnchor = await this.findJavaScriptAnchor(absoluteScanPath);
    if (jsAnchor.platform !== 'unknown') {
      logger.debug(`JavaScript/TypeScript anchor found: ${jsAnchor.platform}`);
      detectedAnchors.push(jsAnchor);
    }

    // Check Java projects
    logger.debug('Checking Java dependencies...');
    const javaAnchor = await this.findJavaAnchor(absoluteScanPath);
    if (javaAnchor.platform !== 'unknown') {
      logger.debug(`Java anchor found: ${javaAnchor.platform}`);
      detectedAnchors.push(javaAnchor);
    }

    // Check Python projects
    logger.debug('Checking Python dependencies...');
    const pythonAnchor = await this.findPythonAnchor(absoluteScanPath);
    if (pythonAnchor.platform !== 'unknown') {
      logger.debug(`Python anchor found: ${pythonAnchor.platform}`);
      detectedAnchors.push(pythonAnchor);
    }

    // Check configuration files as fallback
    logger.debug('Checking configuration files...');
    const configAnchor = await this.findConfigAnchor(absoluteScanPath);
    if (configAnchor.platform !== 'unknown') {
      logger.debug(`Config anchor found: ${configAnchor.platform}`);
      detectedAnchors.push(configAnchor);
    }

    // Check for multiple platforms
    if (detectedAnchors.length > 1) {
      const platforms = detectedAnchors.map(anchor => anchor.platform);
      logger.debug(`Multiple platforms detected: ${platforms.join(', ')}`);
      throw new MultiplePlatformsDetectedError();
    }

    if (detectedAnchors.length === 1) {
      return detectedAnchors[0]!;
    }

    logger.debug('No anchor found through any method');
    return { platform: 'unknown', magicStrings: [] };
  }

  /**
   * Find anchor through JavaScript/TypeScript dependencies
   */
  private async findJavaScriptAnchor(absoluteScanPath: string): Promise<AnchorResult> {
    const packageJsonPath = path.join(absoluteScanPath, 'package.json');
    
    try {
      logger.debug(`Attempting to read file: ${packageJsonPath}`);
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      logger.debug(`Successfully read package.json.`);
      
      const packageJson = JSON.parse(packageJsonContent);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      const detectedPlatforms: AnchorResult[] = [];

      // Check for Percy dependencies
      if (dependencies['@percy/cypress']) {
        logger.debug(`Found '@percy/cypress' dependency`);
        detectedPlatforms.push({ platform: 'Percy', magicStrings: ['percySnapshot', 'percyScreenshot'], framework: 'Cypress', language: 'JavaScript/TypeScript' });
      }
      
      if (dependencies['@percy/playwright']) {
        logger.debug(`Found '@percy/playwright' dependency`);
        detectedPlatforms.push({ platform: 'Percy', magicStrings: ['percySnapshot', 'percyScreenshot'], framework: 'Playwright', language: 'JavaScript/TypeScript' });
      }
      
      if (dependencies['@percy/storybook']) {
        logger.debug(`Found '@percy/storybook' dependency`);
        detectedPlatforms.push({ platform: 'Percy', magicStrings: ['percySnapshot', 'percyScreenshot', 'export default', 'export const', 'title:'], framework: 'Storybook', language: 'JavaScript/TypeScript' });
      }

      // Check for Applitools dependencies
      if (dependencies['@applitools/eyes-cypress']) {
        logger.debug(`Found '@applitools/eyes-cypress' dependency`);
        detectedPlatforms.push({ platform: 'Applitools', magicStrings: ['eyes.check', 'eyes.open', 'eyes.close'], framework: 'Cypress', language: 'JavaScript/TypeScript' });
      }
      
      if (dependencies['@applitools/eyes-playwright']) {
        logger.debug(`Found '@applitools/eyes-playwright' dependency`);
        detectedPlatforms.push({ platform: 'Applitools', magicStrings: ['eyes.check', 'eyes.open', 'eyes.close'], framework: 'Playwright', language: 'JavaScript/TypeScript' });
      }
      
      if (dependencies['@applitools/eyes-storybook']) {
        logger.debug(`Found '@applitools/eyes-storybook' dependency`);
        detectedPlatforms.push({ platform: 'Applitools', magicStrings: ['eyes.check', 'eyes.open', 'eyes.close'], framework: 'Storybook', language: 'JavaScript/TypeScript' });
      }

      // Check for Sauce Labs dependencies
      if (dependencies['@saucelabs/cypress-visual-plugin']) {
        logger.debug(`Found '@saucelabs/cypress-visual-plugin' dependency`);
        detectedPlatforms.push({ platform: 'Sauce Labs Visual', magicStrings: ['sauceVisualCheck', 'sauceVisualSnapshot'], framework: 'Cypress', language: 'JavaScript/TypeScript' });
      }
      
      if (dependencies['screener-storybook']) {
        logger.debug(`Found 'screener-storybook' dependency`);
        detectedPlatforms.push({ platform: 'Sauce Labs Visual', magicStrings: ['screener.snapshot', 'screener.check'], framework: 'Storybook', language: 'JavaScript/TypeScript' });
      }

      // Check for multiple platforms within JavaScript/TypeScript
      if (detectedPlatforms.length > 1) {
        const platforms = detectedPlatforms.map(p => p.platform);
        logger.debug(`Multiple platforms detected in JavaScript/TypeScript: ${platforms.join(', ')}`);
        throw new MultiplePlatformsDetectedError();
      }

      if (detectedPlatforms.length === 1) {
        return detectedPlatforms[0]!;
      }

    } catch (error: any) {
      if (error instanceof MultiplePlatformsDetectedError) {
        throw error; // Re-throw multiple platform detection errors
      }
      logger.debug(`Could not read ${packageJsonPath}. Reason: ${error.message}`);
    }

    return { platform: 'unknown', magicStrings: [] };
  }

  /**
   * Find anchor through Java dependencies
   */
  private async findJavaAnchor(absoluteScanPath: string): Promise<AnchorResult> {
    const pomXmlPath = path.join(absoluteScanPath, 'pom.xml');
    
    try {
      logger.debug(`Attempting to read file: ${pomXmlPath}`);
      const pomXmlContent = await fs.readFile(pomXmlPath, 'utf-8');
      logger.debug(`Successfully read pom.xml.`);
      
      const parser = new XMLParser();
      const pomXml = parser.parse(pomXmlContent);

      // Check for Applitools dependencies
      if (this.hasMavenDependency(pomXml, 'eyes-selenium-java5')) {
        logger.debug(`Found 'eyes-selenium-java5' dependency`);
        return { platform: 'Applitools', magicStrings: ['eyes.check', 'eyes.open', 'eyes.close', 'new ChromeDriver', 'By.id', 'WebDriver'], framework: 'Selenium', language: 'Java' };
      }

      // Check for Sauce Labs dependencies
      if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
        logger.debug(`Found 'java-client' from 'com.saucelabs.visual' dependency`);
        return { platform: 'Sauce Labs Visual', magicStrings: ['sauceVisualCheck', 'sauceVisualSnapshot'], framework: 'Selenium', language: 'Java' };
      }

    } catch (error: any) {
      logger.debug(`Could not read ${pomXmlPath}. Reason: ${error.message}`);
    }

    return { platform: 'unknown', magicStrings: [] };
  }

  /**
   * Find anchor through Python dependencies
   */
  private async findPythonAnchor(absoluteScanPath: string): Promise<AnchorResult> {
    const requirementsPath = path.join(absoluteScanPath, 'requirements.txt');
    
    try {
      logger.debug(`Attempting to read file: ${requirementsPath}`);
      const requirementsContent = await fs.readFile(requirementsPath, 'utf-8');
      logger.debug(`Successfully read requirements.txt.`);
      
      const lines = requirementsContent.split('\n').map(line => line.trim());

      // Check for Sauce Labs dependencies
      if (lines.some(line => line.includes('saucelabs_visual'))) {
        logger.debug(`Found 'saucelabs_visual' dependency`);
        return { platform: 'Sauce Labs Visual', magicStrings: ['SauceVisual', 'check_page', 'snapshot', 'saucelabs_visual'], framework: 'Selenium', language: 'Python' };
      }

    } catch (error: any) {
      logger.debug(`Could not read ${requirementsPath}. Reason: ${error.message}`);
    }

    return { platform: 'unknown', magicStrings: [] };
  }

  /**
   * Find anchor through configuration files
   */
  private async findConfigAnchor(absoluteScanPath: string): Promise<AnchorResult> {
    // Check for Percy config files
    const percyConfigs = await fg(['.percy.yml', '.percy.js', '.percyrc', 'percy.config.js'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (percyConfigs.length > 0) {
      logger.debug(`Found Percy config files: ${percyConfigs.join(', ')}`);
      return { platform: 'Percy', magicStrings: ['percySnapshot', 'percyScreenshot'] };
    }

    // Check for Applitools config files
    const applitoolsConfigs = await fg(['applitools.config.js', 'applitools.config.ts', 'applitools.config.json'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (applitoolsConfigs.length > 0) {
      logger.debug(`Found Applitools config files: ${applitoolsConfigs.join(', ')}`);
      return { platform: 'Applitools', magicStrings: ['eyes.check', 'eyes.open', 'eyes.close'] };
    }

    // Check for Sauce Labs config files
    const sauceConfigs = await fg(['saucectl.yml', 'sauce.config.js', 'sauce.config.ts', 'sauce.config.json'], {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    if (sauceConfigs.length > 0) {
      logger.debug(`Found Sauce Labs config files: ${sauceConfigs.join(', ')}`);
      return { platform: 'Sauce Labs Visual', magicStrings: ['sauceVisualCheck', 'sauceVisualSnapshot'] };
    }

    return { platform: 'unknown', magicStrings: [] };
  }

  /**
   * Phase 2: Deep Content Search - Find source files containing magic strings
   */
  private async deepContentSearch(absoluteScanPath: string, magicStrings: string[]): Promise<string[]> {
    logger.debug(`Searching for source files containing magic strings: ${magicStrings.join(', ')}`);
    
    // Get all potential source files
    const sourcePatterns = [
      '**/*.js',
      '**/*.ts',
      '**/*.jsx',
      '**/*.tsx',
      '**/*.py',
      '**/*.java',
      '**/*.robot'
    ];

    const sourceFiles = await fg(sourcePatterns, {
      cwd: absoluteScanPath,
      ignore: this.ignorePatterns
    });

    logger.debug(`Found ${sourceFiles.length} potential source files to search`);

    const matchingFiles: string[] = [];

    // Search each file for magic strings
    for (const filePath of sourceFiles) {
      try {
        const fullPath = path.join(absoluteScanPath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Check if any magic string is found in the content
        const hasMagicString = magicStrings.some(magicString => content.includes(magicString));
        
        if (hasMagicString) {
          logger.debug(`Found magic string in file: ${filePath}`);
          matchingFiles.push(filePath);
        }
      } catch (error: any) {
        logger.debug(`Could not read file ${filePath}. Reason: ${error.message}`);
        // Continue to next file without crashing
      }
    }

    logger.debug(`Deep content search completed. Found ${matchingFiles.length} files with magic strings`);
    return matchingFiles;
  }

  /**
   * Detect framework using weighted signature patterns
   */
  private async detectFramework(absoluteScanPath: string, sourceFiles: string[]): Promise<DetectionResult['framework']> {
    logger.debug(`Detecting framework from ${sourceFiles.length} source files`);
    
    // Initialize score map for each framework
    const scores: Record<string, number> = {
      'Cypress': 0,
      'Playwright': 0,
      'Selenium': 0,
      'Robot Framework': 0,
      'Appium': 0,
      'Storybook': 0
    };

    // Analyze each source file
    for (const filePath of sourceFiles) {
      try {
        const fullPath = path.join(absoluteScanPath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        logger.debug(`Analyzing file: ${filePath} (${content.length} characters)`);
        
        // Check each framework's signatures
        for (const [frameworkName, signatures] of Object.entries(this.frameworkSignatures)) {
          for (const signature of signatures) {
            const matches = content.match(signature.pattern);
            if (matches && scores[frameworkName] !== undefined) {
              scores[frameworkName] += signature.weight;
              logger.debug(`Found ${frameworkName} signature in ${filePath}: ${signature.pattern} (weight: ${signature.weight}, matches: ${matches.length})`);
            }
          }
        }
      } catch (error: any) {
        logger.debug(`Could not read file ${filePath} for framework detection. Reason: ${error.message}`);
        // Continue to next file without crashing
      }
    }

    // Find the framework with the highest score
    const bestFramework = Object.entries(scores).reduce((a, b) => {
      const scoreA = scores[a[0]] || 0;
      const scoreB = scores[b[0]] || 0;
      return scoreA > scoreB ? a : b;
    });

    logger.debug(`Framework detection scores: ${JSON.stringify(scores)}`);
    
    if (bestFramework[1] > 0) {
      logger.debug(`Detected framework: ${bestFramework[0]} (score: ${bestFramework[1]})`);
      return bestFramework[0] as DetectionResult['framework'];
    }

    logger.debug('No framework signatures detected, defaulting to Selenium');
    return 'Selenium'; // Default fallback
  }

  /**
   * Determine platform from content when no anchor is found
   */
  private async determinePlatformFromContent(absoluteScanPath: string, sourceFiles: string[]): Promise<AnchorResult['platform']> {
    logger.debug('Determining platform from content analysis');
    
    const platformScores: Record<string, number> = {
      'Percy': 0,
      'Applitools': 0,
      'Sauce Labs Visual': 0
    };

    // Analyze each source file to score platforms
    for (const filePath of sourceFiles) {
      try {
        const fullPath = path.join(absoluteScanPath, filePath);
        const content = await fs.readFile(fullPath, 'utf-8');
        
        // Score each platform based on magic strings found
        for (const [platform, magicStrings] of Object.entries(this.platformMagicStrings)) {
          const matches = magicStrings.filter(magicString => content.includes(magicString));
          if (platformScores[platform] !== undefined) {
            platformScores[platform] += matches.length;
          }
        }
      } catch (error: any) {
        logger.debug(`Could not read file ${filePath} for platform determination. Reason: ${error.message}`);
      }
    }

    // Find the platform with the highest score
    const bestPlatform = Object.entries(platformScores).reduce((a, b) => {
      const scoreA = platformScores[a[0]] || 0;
      const scoreB = platformScores[b[0]] || 0;
      return scoreA > scoreB ? a : b;
    });

    if (bestPlatform[1] > 0) {
      logger.debug(`Platform determined from content: ${bestPlatform[0]} (score: ${bestPlatform[1]})`);
      return bestPlatform[0] as AnchorResult['platform'];
    }

    return 'unknown';
  }

  /**
   * Create final DetectionResult with all collected information
   */
  private async createDetectionResult(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', absoluteScanPath: string, sourceFiles: string[], anchorResult?: AnchorResult): Promise<DetectionResult> {
    // Use framework and language from anchor result if available, otherwise use framework signature detection
    let framework: DetectionResult['framework'];
    let language: DetectionResult['language'];
    let testType: DetectionResult['testType'];

    if (anchorResult?.framework && anchorResult?.language) {
      framework = anchorResult.framework;
      language = anchorResult.language;
      testType = this.determineTestType(framework);
      logger.debug(`Using framework from anchor: ${framework}`);
    } else {
      // Use framework signature detection for more accurate framework identification
      framework = await this.detectFramework(absoluteScanPath, sourceFiles);
      language = this.determineLanguageFromSourceFiles(sourceFiles);
      testType = this.determineTestType(framework);
      logger.debug(`Using framework from signature detection: ${framework}`);
    }
    
    // Collect other file types
    const configPatterns = this.getConfigPatterns(platform);
    const ciPatterns = this.getCIPatterns();
    const packageManagerPatterns = this.getPackageManagerPatterns();

    const [config, ci, packageManager] = await Promise.all([
      fg(configPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns }),
      fg(ciPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns }),
      fg(packageManagerPatterns, { cwd: absoluteScanPath, ignore: this.ignorePatterns })
    ]);

    return {
      platform,
      framework,
      language,
      testType,
      files: {
      config,
        source: sourceFiles,
      ci,
      packageManager
      }
    };
  }

  /**
   * Determine framework, language, and test type based on platform and source files
   */
  private determineFrameworkAndLanguage(platform: 'Percy' | 'Applitools' | 'Sauce Labs Visual', sourceFiles: string[]): {
    framework: DetectionResult['framework'];
    language: DetectionResult['language'];
    testType: DetectionResult['testType'];
  } {
    // Analyze source file extensions to determine language
    const hasJsFiles = sourceFiles.some(file => /\.(js|ts|jsx|tsx)$/.test(file));
    const hasJavaFiles = sourceFiles.some(file => /\.java$/.test(file));
    const hasPythonFiles = sourceFiles.some(file => /\.py$/.test(file));
    const hasRobotFiles = sourceFiles.some(file => /\.robot$/.test(file));

    // Determine framework based on file patterns and platform
    let framework: DetectionResult['framework'] = 'Selenium';
    let language: DetectionResult['language'] = 'JavaScript/TypeScript';
    let testType: DetectionResult['testType'] = 'e2e';

    if (hasJsFiles) {
      language = 'JavaScript/TypeScript';
      if (sourceFiles.some(file => file.includes('cypress'))) {
        framework = 'Cypress';
      } else if (sourceFiles.some(file => file.includes('playwright'))) {
        framework = 'Playwright';
      } else if (sourceFiles.some(file => file.includes('storybook'))) {
        framework = 'Storybook';
        testType = 'storybook';
      } else {
        framework = 'Selenium';
      }
    } else if (hasJavaFiles) {
      language = 'Java';
      framework = 'Selenium';
    } else if (hasPythonFiles) {
      language = 'Python';
      if (hasRobotFiles) {
        framework = 'Robot Framework';
      } else if (sourceFiles.some(file => file.includes('appium'))) {
        framework = 'Appium';
        testType = 'appium';
      } else {
        framework = 'Selenium';
      }
    }

    return { framework, language, testType };
  }

  /**
   * Determine language from source file extensions
   */
  private determineLanguageFromSourceFiles(sourceFiles: string[]): DetectionResult['language'] {
    const hasJsFiles = sourceFiles.some(file => /\.(js|ts|jsx|tsx)$/.test(file));
    const hasJavaFiles = sourceFiles.some(file => /\.java$/.test(file));
    const hasPythonFiles = sourceFiles.some(file => /\.py$/.test(file));
    const hasRobotFiles = sourceFiles.some(file => /\.robot$/.test(file));

    if (hasJavaFiles) {
      return 'Java';
    } else if (hasPythonFiles || hasRobotFiles) {
      return 'Python';
    } else {
      return 'JavaScript/TypeScript'; // Default for JS/TS files
    }
  }

  /**
   * Determine test type based on framework
   */
  private determineTestType(framework: DetectionResult['framework']): DetectionResult['testType'] {
    switch (framework) {
      case 'Storybook':
        return 'storybook';
      case 'Appium':
        return 'appium';
      default:
        return 'e2e';
    }
  }

  /**
   * Get configuration file patterns based on platform
   */
  private getConfigPatterns(platform: string): string[] {
    switch (platform) {
      case 'Percy':
        return ['.percy.yml', '.percy.js', '.percyrc', 'percy.config.js', 'percy.config.ts'];
      case 'Applitools':
        return ['applitools.config.js', 'applitools.config.ts', 'applitools.config.json'];
      case 'Sauce Labs Visual':
        return ['saucectl.yml', 'sauce.config.js', 'sauce.config.ts', 'sauce.config.json'];
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
    return [
      'package.json',
      'package-lock.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'pom.xml',
      'requirements.txt',
      'Pipfile',
      'poetry.lock'
    ];
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
      if (section) {
        // Handle both single dependency object and array of dependencies
        const deps = Array.isArray(section) ? section : [section];
        deps.forEach((dep: any) => {
          if (dep && dep.artifactId) {
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