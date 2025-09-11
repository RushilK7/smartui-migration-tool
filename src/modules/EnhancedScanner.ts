/**
 * Enhanced Scanner with AST Integration
 * Phase 1: Advanced AST Parser Infrastructure
 */

import { promises as fs } from 'fs';
import { join, extname } from 'path';
import { 
  UniversalASTNode, 
  ASTParserConfig, 
  ASTAnalysisResult,
  SupportedLanguage,
  SupportedFramework,
  SupportedPlatform
} from '../types/ASTTypes';
import { ASTEnhancementEngine } from './ASTEnhancementEngine';
import { SmartPatternRecognitionEngine, RecognitionResult } from './PatternRecognitionEngine';

export interface EnhancedDetectionResult {
  language: SupportedLanguage;
  framework: SupportedFramework;
  platform: SupportedPlatform;
  confidence: number;
  astAnalysis: ASTAnalysisResult;
  patternRecognition: RecognitionResult;
  files: {
    source: string[];
    test: string[];
    config: string[];
    other: string[];
  };
  metadata: {
    totalFiles: number;
    totalLines: number;
    complexity: number;
    maintainability: number;
    testability: number;
    processingTime: number;
    memoryUsage: number;
  };
}

export class EnhancedScanner {
  private astEngine: ASTEnhancementEngine;
  private patternEngine: SmartPatternRecognitionEngine;
  private supportedExtensions: Map<string, SupportedLanguage> = new Map();

  constructor() {
    this.astEngine = new ASTEnhancementEngine();
    this.patternEngine = new SmartPatternRecognitionEngine();
    this.initializeSupportedExtensions();
  }

  private initializeSupportedExtensions(): void {
    // JavaScript/TypeScript
    this.supportedExtensions.set('.js', 'javascript');
    this.supportedExtensions.set('.jsx', 'javascript');
    this.supportedExtensions.set('.ts', 'typescript');
    this.supportedExtensions.set('.tsx', 'typescript');
    this.supportedExtensions.set('.mjs', 'javascript');
    this.supportedExtensions.set('.cjs', 'javascript');

    // Python
    this.supportedExtensions.set('.py', 'python');
    this.supportedExtensions.set('.pyi', 'python');

    // Java
    this.supportedExtensions.set('.java', 'java');

    // C#
    this.supportedExtensions.set('.cs', 'csharp');
  }

  async scanProject(projectPath: string): Promise<EnhancedDetectionResult> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      // Get all files in the project
      const files = await this.getAllFiles(projectPath);
      
      // Categorize files
      const categorizedFiles = this.categorizeFiles(files);
      
      // Analyze each file with AST
      const astResults = await this.analyzeFiles(categorizedFiles, projectPath);
      
      // Combine results
      const combinedResult = this.combineResults(astResults, categorizedFiles);
      
      // Detect language, framework, and platform
      const detection = this.detectProjectType(combinedResult);
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;

      return {
        language: detection.language,
        framework: detection.framework,
        platform: detection.platform,
        confidence: detection.confidence,
        astAnalysis: combinedResult.astAnalysis,
        patternRecognition: combinedResult.patternRecognition,
        files: categorizedFiles,
        metadata: {
          totalFiles: files.length,
          totalLines: combinedResult.totalLines,
          complexity: combinedResult.astAnalysis.complexity,
          maintainability: combinedResult.astAnalysis.maintainability,
          testability: combinedResult.astAnalysis.testability,
          processingTime: endTime - startTime,
          memoryUsage: endMemory - startMemory
        }
      };
    } catch (error) {
      throw new Error(`Enhanced scanning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getAllFiles(projectPath: string): Promise<string[]> {
    const files: string[] = [];
    
    const scanDirectory = async (dir: string): Promise<void> => {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = join(dir, entry.name);
          
          if (entry.isDirectory()) {
            // Skip node_modules, .git, and other common directories
            if (this.shouldSkipDirectory(entry.name)) {
              continue;
            }
            await scanDirectory(fullPath);
          } else if (entry.isFile()) {
            const ext = extname(entry.name);
            if (this.supportedExtensions.has(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip directories that can't be read
        console.warn(`Skipping directory ${dir}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    await scanDirectory(projectPath);
    return files;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = [
      'node_modules',
      '.git',
      '.svn',
      '.hg',
      '.bzr',
      'dist',
      'build',
      'out',
      'target',
      'bin',
      'obj',
      '.vscode',
      '.idea',
      '.vs',
      'coverage',
      '.nyc_output',
      'tmp',
      'temp',
      '.cache',
      '.parcel-cache',
      '.next',
      '.nuxt',
      '.vuepress',
      '.docusaurus'
    ];
    
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  private categorizeFiles(files: string[]): {
    source: string[];
    test: string[];
    config: string[];
    other: string[];
  } {
    const categorized = {
      source: [] as string[],
      test: [] as string[],
      config: [] as string[],
      other: [] as string[]
    };

    files.forEach(file => {
      const fileName = file.toLowerCase();
      
      if (this.isTestFile(fileName)) {
        categorized.test.push(file);
      } else if (this.isConfigFile(fileName)) {
        categorized.config.push(file);
      } else if (this.isSourceFile(fileName)) {
        categorized.source.push(file);
      } else {
        categorized.other.push(file);
      }
    });

    return categorized;
  }

  private isTestFile(fileName: string): boolean {
    const testPatterns = [
      '.test.',
      '.spec.',
      'test/',
      'tests/',
      '__tests__/',
      'test_',
      'spec_',
      '.test.js',
      '.spec.js',
      '.test.ts',
      '.spec.ts',
      '.test.py',
      '.spec.py',
      'test.java',
      'spec.java'
    ];
    
    return testPatterns.some(pattern => fileName.includes(pattern));
  }

  private isConfigFile(fileName: string): boolean {
    const configPatterns = [
      'package.json',
      'tsconfig.json',
      'webpack.config',
      'rollup.config',
      'vite.config',
      'next.config',
      'nuxt.config',
      'vue.config',
      'angular.json',
      'pom.xml',
      'build.gradle',
      'requirements.txt',
      'setup.py',
      'pyproject.toml',
      'csproj',
      'sln',
      '.eslintrc',
      '.prettierrc',
      'babel.config',
      'jest.config',
      'cypress.config',
      'playwright.config',
      'karma.conf',
      'protractor.conf'
    ];
    
    return configPatterns.some(pattern => fileName.includes(pattern));
  }

  private isSourceFile(fileName: string): boolean {
    const sourceExtensions = [
      '.js', '.jsx', '.ts', '.tsx',
      '.py', '.pyi',
      '.java',
      '.cs'
    ];
    
    return sourceExtensions.some(ext => fileName.endsWith(ext));
  }

  private async analyzeFiles(categorizedFiles: any, projectPath: string): Promise<{
    astAnalysis: ASTAnalysisResult;
    patternRecognition: RecognitionResult;
    totalLines: number;
  }> {
    let totalLines = 0;
    const allNodes: UniversalASTNode[] = [];
    const allPatterns: RecognitionResult[] = [];

    // Analyze source files
    for (const file of categorizedFiles.source) {
      try {
        const result = await this.analyzeFile(file, projectPath);
        if (result) {
          allNodes.push(result.ast);
          allPatterns.push(result.patterns);
          totalLines += this.countLines(result.ast.raw);
        }
      } catch (error) {
        console.warn(`Failed to analyze file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Analyze test files
    for (const file of categorizedFiles.test) {
      try {
        const result = await this.analyzeFile(file, projectPath);
        if (result) {
          allNodes.push(result.ast);
          allPatterns.push(result.patterns);
          totalLines += this.countLines(result.ast.raw);
        }
      } catch (error) {
        console.warn(`Failed to analyze test file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Combine AST analysis results
    const combinedASTAnalysis = this.combineASTAnalysis(allNodes);
    
    // Combine pattern recognition results
    const combinedPatternRecognition = this.combinePatternRecognition(allPatterns);

    return {
      astAnalysis: combinedASTAnalysis,
      patternRecognition: combinedPatternRecognition,
      totalLines
    };
  }

  private async analyzeFile(filePath: string, projectPath: string): Promise<{
    ast: UniversalASTNode;
    patterns: RecognitionResult;
  } | null> {
    try {
      const code = await fs.readFile(filePath, 'utf-8');
      const ext = extname(filePath);
      const language = this.supportedExtensions.get(ext);
      
      if (!language) {
        return null;
      }

      // Parse with AST
      const astConfig: ASTParserConfig = {
        language,
        includeComments: true,
        includeWhitespace: false,
        strictMode: false,
        experimentalFeatures: true,
        sourceType: 'module'
      };

      const parseResult = this.astEngine.parse(code, astConfig);
      if (!parseResult.success || !parseResult.ast) {
        return null;
      }

      // Analyze with pattern recognition
      const patterns = this.patternEngine.recognize(parseResult.ast);

      return {
        ast: parseResult.ast,
        patterns
      };
    } catch (error) {
      console.warn(`Failed to analyze file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  }

  private countLines(code: string): number {
    return code.split('\n').length;
  }

  private combineASTAnalysis(nodes: UniversalASTNode[]): ASTAnalysisResult {
    if (nodes.length === 0) {
      return this.getEmptyAnalysis();
    }

    const allNodes: UniversalASTNode[] = [];
    const imports: UniversalASTNode[] = [];
    const exports: UniversalASTNode[] = [];
    const functions: UniversalASTNode[] = [];
    const classes: UniversalASTNode[] = [];
    const variables: UniversalASTNode[] = [];
    const decorators: UniversalASTNode[] = [];
    const annotations: UniversalASTNode[] = [];
    const visualTests: UniversalASTNode[] = [];
    const testFiles: UniversalASTNode[] = [];
    const dependencies: string[] = [];
    const frameworks: SupportedFramework[] = [];
    const platforms: SupportedPlatform[] = [];

    nodes.forEach(node => {
      allNodes.push(node);
      
      // Categorize nodes
      switch (node.type) {
        case 'import':
          imports.push(node);
          break;
        case 'export':
          exports.push(node);
          break;
        case 'function':
        case 'arrow-function':
        case 'async-function':
        case 'generator':
          functions.push(node);
          break;
        case 'class':
          classes.push(node);
          break;
        case 'variable':
          variables.push(node);
          break;
        case 'decorator':
          decorators.push(node);
          break;
        case 'annotation':
          annotations.push(node);
          break;
      }

      // Detect visual tests
      if (this.isVisualTestNode(node)) {
        visualTests.push(node);
      }

      // Detect test files
      if (this.isTestNode(node)) {
        testFiles.push(node);
      }

      // Extract dependencies
      if (node.type === 'import' && node.raw) {
        const dep = this.extractDependency(node.raw);
        if (dep) {
          dependencies.push(dep);
        }
      }
    });

    return {
      nodes: allNodes,
      imports,
      exports,
      functions,
      classes,
      variables,
      decorators,
      annotations,
      visualTests,
      testFiles,
      dependencies: [...new Set(dependencies)],
      frameworks: [...new Set(frameworks)],
      platforms: [...new Set(platforms)],
      complexity: this.calculateComplexity(allNodes),
      maintainability: this.calculateMaintainability(allNodes),
      testability: this.calculateTestability(allNodes)
    };
  }

  private combinePatternRecognition(results: RecognitionResult[]): RecognitionResult {
    if (results.length === 0) {
      return {
        matches: [],
        frameworks: [],
        platforms: [],
        confidence: 0,
        suggestions: [],
        metadata: {
          totalPatterns: 0,
          matchedPatterns: 0,
          averageConfidence: 0,
          processingTime: 0,
          memoryUsage: 0
        }
      };
    }

    const allMatches = results.flatMap(r => r.matches);
    const allFrameworks = [...new Set(results.flatMap(r => r.frameworks))];
    const allPlatforms = [...new Set(results.flatMap(r => r.platforms))];
    const allSuggestions = [...new Set(results.flatMap(r => r.suggestions))];
    
    const averageConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;

    return {
      matches: allMatches,
      frameworks: allFrameworks,
      platforms: allPlatforms,
      confidence: averageConfidence,
      suggestions: allSuggestions,
      metadata: {
        totalPatterns: results.reduce((sum, r) => sum + r.metadata.totalPatterns, 0),
        matchedPatterns: allMatches.length,
        averageConfidence,
        processingTime: results.reduce((sum, r) => sum + r.metadata.processingTime, 0),
        memoryUsage: results.reduce((sum, r) => sum + r.metadata.memoryUsage, 0)
      }
    };
  }

  private combineResults(analysis: any, files: any): any {
    return {
      astAnalysis: analysis.astAnalysis,
      patternRecognition: analysis.patternRecognition,
      totalLines: analysis.totalLines
    };
  }

  private detectProjectType(combinedResult: any): {
    language: SupportedLanguage;
    framework: SupportedFramework;
    platform: SupportedPlatform;
    confidence: number;
  } {
    // Detect language based on file extensions and AST analysis
    const language = this.detectLanguage(combinedResult.astAnalysis);
    
    // Detect framework based on pattern recognition
    const framework = this.detectFramework(combinedResult.patternRecognition);
    
    // Detect platform based on pattern recognition
    const platform = this.detectPlatform(combinedResult.patternRecognition);
    
    // Calculate overall confidence
    const confidence = this.calculateDetectionConfidence(combinedResult);

    return {
      language,
      framework,
      platform,
      confidence
    };
  }

  private detectLanguage(astAnalysis: ASTAnalysisResult): SupportedLanguage {
    // Simple language detection based on file analysis
    // In a real implementation, this would be more sophisticated
    if (astAnalysis.nodes.some(node => node.language === 'typescript')) {
      return 'typescript';
    }
    if (astAnalysis.nodes.some(node => node.language === 'python')) {
      return 'python';
    }
    if (astAnalysis.nodes.some(node => node.language === 'java')) {
      return 'java';
    }
    if (astAnalysis.nodes.some(node => node.language === 'csharp')) {
      return 'csharp';
    }
    return 'javascript';
  }

  private detectFramework(patternRecognition: RecognitionResult): SupportedFramework {
    if (patternRecognition.frameworks.length > 0) {
      return patternRecognition.frameworks[0]!;
    }
    return 'cypress'; // Default fallback
  }

  private detectPlatform(patternRecognition: RecognitionResult): SupportedPlatform {
    if (patternRecognition.platforms.length > 0) {
      return patternRecognition.platforms[0]!;
    }
    return 'percy'; // Default fallback
  }

  private calculateDetectionConfidence(combinedResult: any): number {
    const astConfidence = combinedResult.astAnalysis.nodes.length > 0 ? 0.8 : 0.2;
    const patternConfidence = combinedResult.patternRecognition.confidence;
    
    return (astConfidence + patternConfidence) / 2;
  }

  private isVisualTestNode(node: UniversalASTNode): boolean {
    const visualTestPatterns = [
      /percy/i,
      /applitools/i,
      /eyes/i,
      /sauce/i,
      /visual/i,
      /screenshot/i,
      /snapshot/i
    ];

    return visualTestPatterns.some(pattern => pattern.test(node.raw));
  }

  private isTestNode(node: UniversalASTNode): boolean {
    const testPatterns = [
      /test/i,
      /spec/i,
      /describe/i,
      /it\(/i,
      /expect\(/i
    ];

    return testPatterns.some(pattern => pattern.test(node.raw));
  }

  private extractDependency(importStatement: string): string | null {
    const match = importStatement.match(/from\s+['"]([^'"]+)['"]/);
    if (match) {
      return match[1] || null;
    }
    
    const requireMatch = importStatement.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      return requireMatch[1] || null;
    }
    
    return null;
  }

  private calculateComplexity(nodes: UniversalASTNode[]): number {
    let complexity = 0;
    nodes.forEach(node => {
      switch (node.type) {
        case 'loop':
        case 'conditional':
        case 'try-catch':
        case 'switch':
          complexity += 2;
          break;
        case 'function':
        case 'class':
          complexity += 1;
          break;
      }
    });
    return complexity;
  }

  private calculateMaintainability(nodes: UniversalASTNode[]): number {
    const totalNodes = nodes.length;
    const complexNodes = nodes.filter(node => 
      ['loop', 'conditional', 'try-catch', 'switch'].includes(node.type)
    ).length;
    
    return Math.max(0, 100 - (complexNodes / totalNodes) * 100);
  }

  private calculateTestability(nodes: UniversalASTNode[]): number {
    const functions = nodes.filter(node => 
      ['function', 'arrow-function', 'async-function', 'generator'].includes(node.type)
    ).length;
    
    const testFiles = nodes.filter(node => this.isTestNode(node)).length;
    
    return Math.min(100, (testFiles / Math.max(1, functions)) * 100);
  }

  private getEmptyAnalysis(): ASTAnalysisResult {
    return {
      nodes: [],
      imports: [],
      exports: [],
      functions: [],
      classes: [],
      variables: [],
      decorators: [],
      annotations: [],
      visualTests: [],
      testFiles: [],
      dependencies: [],
      frameworks: [],
      platforms: [],
      complexity: 0,
      maintainability: 0,
      testability: 0
    };
  }
}
