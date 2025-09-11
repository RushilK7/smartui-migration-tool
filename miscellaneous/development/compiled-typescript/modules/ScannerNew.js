"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scanner = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const fast_xml_parser_1 = require("fast-xml-parser");
const types_1 = require("../types");
/**
 * Scanner module for analyzing user's project structure and dependencies
 * Responsible for detecting existing visual testing frameworks and configurations
 */
class Scanner {
    constructor(projectPath) {
        this.ignorePatterns = [
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
        this.projectPath = projectPath;
    }
    /**
     * Scans the project for existing visual testing frameworks
     * @returns Promise<DetectionResult> - Analysis results
     */
    async scan() {
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
            throw new types_1.PlatformNotDetectedError();
        }
        catch (error) {
            if (error instanceof types_1.PlatformNotDetectedError || error instanceof types_1.MultiplePlatformsDetectedError) {
                throw error;
            }
            throw new Error(`Scanner error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Priority 1: Analyze dependencies in package.json, pom.xml, requirements.txt
     */
    async analyzeDependencies() {
        const detectedPlatforms = [];
        // Check JavaScript/TypeScript projects
        const jsResult = await this.analyzeJavaScriptDependencies();
        if (jsResult)
            detectedPlatforms.push(jsResult);
        // Check Java projects
        const javaResult = await this.analyzeJavaDependencies();
        if (javaResult)
            detectedPlatforms.push(javaResult);
        // Check Python projects
        const pythonResult = await this.analyzePythonDependencies();
        if (pythonResult)
            detectedPlatforms.push(pythonResult);
        if (detectedPlatforms.length === 0) {
            return null;
        }
        if (detectedPlatforms.length > 1) {
            throw new types_1.MultiplePlatformsDetectedError();
        }
        return detectedPlatforms[0];
    }
    /**
     * Analyze JavaScript/TypeScript dependencies in package.json
     */
    async analyzeJavaScriptDependencies() {
        const packageJsonPath = path_1.default.join(this.projectPath, 'package.json');
        try {
            const packageJsonContent = await fs_1.promises.readFile(packageJsonPath, 'utf-8');
            const packageJson = JSON.parse(packageJsonContent);
            const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
            // Check for Percy dependencies
            if (dependencies['@percy/cypress']) {
                return await this.createDetectionResult('Percy', 'Cypress', 'JavaScript/TypeScript');
            }
            if (dependencies['@percy/playwright']) {
                return await this.createDetectionResult('Percy', 'Playwright', 'JavaScript/TypeScript');
            }
            if (dependencies['@percy/storybook']) {
                const hasStorybookDir = await this.hasDirectory('.storybook');
                if (hasStorybookDir) {
                    return await this.createDetectionResult('Percy', 'Storybook', 'JavaScript/TypeScript');
                }
            }
            // Check for Applitools dependencies
            if (dependencies['@applitools/eyes-cypress']) {
                return await this.createDetectionResult('Applitools', 'Cypress', 'JavaScript/TypeScript');
            }
            if (dependencies['@applitools/eyes-playwright']) {
                return await this.createDetectionResult('Applitools', 'Playwright', 'JavaScript/TypeScript');
            }
            // Check for Sauce Labs dependencies
            if (dependencies['@saucelabs/cypress-visual-plugin']) {
                return await this.createDetectionResult('Sauce Labs Visual', 'Cypress', 'JavaScript/TypeScript');
            }
        }
        catch (error) {
            // package.json doesn't exist or is invalid
        }
        return null;
    }
    /**
     * Analyze Java dependencies in pom.xml
     */
    async analyzeJavaDependencies() {
        const pomXmlPath = path_1.default.join(this.projectPath, 'pom.xml');
        try {
            const pomXmlContent = await fs_1.promises.readFile(pomXmlPath, 'utf-8');
            const parser = new fast_xml_parser_1.XMLParser();
            const pomXml = parser.parse(pomXmlContent);
            // Check for Applitools dependencies
            if (this.hasMavenDependency(pomXml, 'eyes-selenium-java5')) {
                return await this.createDetectionResult('Applitools', 'Selenium', 'Java');
            }
            // Check for Sauce Labs dependencies
            if (this.hasMavenDependency(pomXml, 'java-client', 'com.saucelabs.visual')) {
                return await this.createDetectionResult('Sauce Labs Visual', 'Selenium', 'Java');
            }
        }
        catch (error) {
            // pom.xml doesn't exist or is invalid
        }
        return null;
    }
    /**
     * Analyze Python dependencies in requirements.txt
     */
    async analyzePythonDependencies() {
        const requirementsPath = path_1.default.join(this.projectPath, 'requirements.txt');
        try {
            const requirementsContent = await fs_1.promises.readFile(requirementsPath, 'utf-8');
            const lines = requirementsContent.split('\n').map(line => line.trim());
            // Check for Sauce Labs Robot Framework
            if (lines.some(line => line.includes('saucelabs_visual'))) {
                const hasRobotFiles = await this.hasFiles('**/*.robot');
                if (hasRobotFiles) {
                    return await this.createDetectionResult('Sauce Labs Visual', 'Robot Framework', 'Python');
                }
            }
        }
        catch (error) {
            // requirements.txt doesn't exist
        }
        return null;
    }
    /**
     * Priority 2: Analyze configuration files as fallback
     */
    async analyzeConfigurationFiles() {
        // Check for Percy config files
        const percyConfigs = await (0, fast_glob_1.default)(['.percy.yml', '.percy.js', 'percy.config.js'], {
            cwd: this.projectPath,
            ignore: this.ignorePatterns
        });
        if (percyConfigs.length > 0) {
            // Try to determine framework from config or project structure
            const framework = await this.detectFrameworkFromStructure();
            return await this.createDetectionResult('Percy', framework, 'JavaScript/TypeScript');
        }
        // Check for Applitools config files
        const applitoolsConfigs = await (0, fast_glob_1.default)(['applitools.config.js', 'applitools.config.ts'], {
            cwd: this.projectPath,
            ignore: this.ignorePatterns
        });
        if (applitoolsConfigs.length > 0) {
            const framework = await this.detectFrameworkFromStructure();
            return await this.createDetectionResult('Applitools', framework, 'JavaScript/TypeScript');
        }
        // Check for Sauce Labs config files
        const sauceConfigs = await (0, fast_glob_1.default)(['saucectl.yml', 'sauce.config.js'], {
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
    async detectFrameworkFromStructure() {
        // Check for Cypress
        const cypressFiles = await (0, fast_glob_1.default)(['cypress/**/*.js', 'cypress/**/*.ts', 'cypress.json'], {
            cwd: this.projectPath,
            ignore: this.ignorePatterns
        });
        if (cypressFiles.length > 0)
            return 'Cypress';
        // Check for Playwright
        const playwrightFiles = await (0, fast_glob_1.default)(['playwright.config.js', 'playwright.config.ts', 'tests/**/*.spec.js', 'tests/**/*.spec.ts'], {
            cwd: this.projectPath,
            ignore: this.ignorePatterns
        });
        if (playwrightFiles.length > 0)
            return 'Playwright';
        // Check for Storybook
        const storybookDir = await this.hasDirectory('.storybook');
        if (storybookDir)
            return 'Storybook';
        // Default to Selenium for Java projects
        return 'Selenium';
    }
    /**
     * Create a DetectionResult with file paths
     */
    async createDetectionResult(platform, framework, language) {
        const files = await this.collectFilePaths(platform, framework);
        // Determine test type based on framework
        let testType = 'e2e';
        if (framework === 'Storybook') {
            testType = 'storybook';
        }
        else if (framework === 'Appium') {
            testType = 'appium';
        }
        return {
            platform,
            framework,
            language,
            testType,
            files,
            evidence: {
                platform: {
                    source: 'legacy-scanner',
                    match: 'legacy-detection'
                },
                framework: {
                    files: files.source,
                    signatures: []
                }
            }
        };
    }
    /**
     * Collect relevant file paths based on platform and framework
     */
    async collectFilePaths(platform, framework) {
        const configPatterns = this.getConfigPatterns(platform);
        const sourcePatterns = this.getSourcePatterns(framework);
        const ciPatterns = this.getCIPatterns();
        const packageManagerPatterns = this.getPackageManagerPatterns();
        const [config, source, ci, packageManager] = await Promise.all([
            (0, fast_glob_1.default)(configPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
            (0, fast_glob_1.default)(sourcePatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
            (0, fast_glob_1.default)(ciPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns }),
            (0, fast_glob_1.default)(packageManagerPatterns, { cwd: this.projectPath, ignore: this.ignorePatterns })
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
    getConfigPatterns(platform) {
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
    getSourcePatterns(framework) {
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
    getCIPatterns() {
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
    getPackageManagerPatterns() {
        return ['package.json', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'pom.xml', 'requirements.txt'];
    }
    /**
     * Check if a directory exists
     */
    async hasDirectory(dirName) {
        try {
            const dirPath = path_1.default.join(this.projectPath, dirName);
            const stats = await fs_1.promises.stat(dirPath);
            return stats.isDirectory();
        }
        catch {
            return false;
        }
    }
    /**
     * Check if files matching pattern exist
     */
    async hasFiles(pattern) {
        const files = await (0, fast_glob_1.default)([pattern], {
            cwd: this.projectPath,
            ignore: this.ignorePatterns
        });
        return files.length > 0;
    }
    /**
     * Check if Maven dependency exists in pom.xml
     */
    hasMavenDependency(pomXml, artifactId, groupId) {
        const dependencies = this.extractDependencies(pomXml);
        return dependencies.some((dep) => {
            const matchesArtifact = dep.artifactId === artifactId;
            const matchesGroup = !groupId || dep.groupId === groupId;
            return matchesArtifact && matchesGroup;
        });
    }
    /**
     * Extract dependencies from pom.xml structure
     */
    extractDependencies(pomXml) {
        const dependencies = [];
        const extractFromSection = (section) => {
            if (section && Array.isArray(section)) {
                section.forEach((dep) => {
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
exports.Scanner = Scanner;
//# sourceMappingURL=ScannerNew.js.map