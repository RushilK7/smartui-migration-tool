/**
 * Smart Pattern Recognition Engine
 * Phase 1: Advanced AST Parser Infrastructure
 */

import { 
  UniversalASTNode, 
  ASTNodeType, 
  SupportedLanguage, 
  SupportedFramework, 
  SupportedPlatform,
  PatternMatcher,
  ASTAnalysisResult
} from '../types/ASTTypes';

export interface PatternMatch {
  pattern: string;
  node: UniversalASTNode;
  confidence: number;
  context: string[];
  extractedData: Record<string, any>;
  suggestions: string[];
}

export interface RecognitionResult {
  matches: PatternMatch[];
  frameworks: SupportedFramework[];
  platforms: SupportedPlatform[];
  confidence: number;
  suggestions: string[];
  metadata: RecognitionMetadata;
}

export interface RecognitionMetadata {
  totalPatterns: number;
  matchedPatterns: number;
  averageConfidence: number;
  processingTime: number;
  memoryUsage: number;
}

export class SmartPatternRecognitionEngine {
  private patternMatchers: PatternMatcher[] = [];
  private visualTestPatterns: Map<string, RegExp> = new Map();
  private frameworkPatterns: Map<SupportedFramework, RegExp[]> = new Map();
  private platformPatterns: Map<SupportedPlatform, RegExp[]> = new Map();

  constructor() {
    this.initializePatterns();
  }

  private initializePatterns(): void {
    this.initializeVisualTestPatterns();
    this.initializeFrameworkPatterns();
    this.initializePlatformPatterns();
  }

  private initializeVisualTestPatterns(): void {
    // Percy Patterns
    this.visualTestPatterns.set('percy_snapshot', /percy\.snapshot\([^)]+\)/g);
    this.visualTestPatterns.set('percy_cypress', /cy\.percySnapshot\([^)]+\)/g);
    this.visualTestPatterns.set('percy_playwright', /@percy\.playwright/g);
    this.visualTestPatterns.set('percy_selenium', /percy\.selenium/g);
    this.visualTestPatterns.set('percy_storybook', /@percy\.storybook/g);

    // Applitools Patterns
    this.visualTestPatterns.set('applitools_eyes', /eyes\.check\([^)]+\)/g);
    this.visualTestPatterns.set('applitools_checkWindow', /eyes\.checkWindow\([^)]+\)/g);
    this.visualTestPatterns.set('applitools_checkElement', /eyes\.checkElement\([^)]+\)/g);
    this.visualTestPatterns.set('applitools_eyes_open', /eyes\.open\([^)]+\)/g);
    this.visualTestPatterns.set('applitools_eyes_close', /eyes\.close\([^)]+\)/g);
    this.visualTestPatterns.set('applitools_eyes_abort', /eyes\.abort\([^)]+\)/g);

    // Sauce Labs Patterns
    this.visualTestPatterns.set('sauce_visual', /sauce\.visual\([^)]+\)/g);
    this.visualTestPatterns.set('sauce_screenshot', /driver\.takeScreenshot\([^)]+\)/g);
    this.visualTestPatterns.set('sauce_visual_check', /sauce\.visual\.check\([^)]+\)/g);

    // Generic Visual Testing Patterns
    this.visualTestPatterns.set('visual_test', /visual.*test|test.*visual/gi);
    this.visualTestPatterns.set('screenshot', /screenshot|snapshot/gi);
    this.visualTestPatterns.set('visual_regression', /visual.*regression|regression.*visual/gi);
  }

  private initializeFrameworkPatterns(): void {
    // React Patterns
    this.frameworkPatterns.set('react', [
      /import.*React/gi,
      /from\s+['"]react['"]/gi,
      /<[A-Z][a-zA-Z]*\s*\/?>/g,
      /useState|useEffect|useContext/gi,
      /\.jsx|\.tsx/gi
    ]);

    // Angular Patterns
    this.frameworkPatterns.set('angular', [
      /@Component/gi,
      /@Injectable/gi,
      /@NgModule/gi,
      /from\s+['"]@angular/gi,
      /\.component\.ts|\.service\.ts|\.module\.ts/gi
    ]);

    // Vue Patterns
    this.frameworkPatterns.set('vue', [
      /<template>/gi,
      /<script.*setup/gi,
      /from\s+['"]vue['"]/gi,
      /\.vue/gi,
      /defineComponent|ref|reactive/gi
    ]);

    // Cypress Patterns
    this.frameworkPatterns.set('cypress', [
      /cy\./gi,
      /describe\(|it\(|before\(|after\(/gi,
      /cypress/gi,
      /\.cy\./gi
    ]);

    // Playwright Patterns
    this.frameworkPatterns.set('playwright', [
      /page\./gi,
      /browser\./gi,
      /context\./gi,
      /playwright/gi,
      /@playwright/gi
    ]);

    // Selenium Patterns
    this.frameworkPatterns.set('selenium', [
      /driver\./gi,
      /WebDriver/gi,
      /selenium/gi,
      /By\./gi,
      /findElement/gi
    ]);

    // Jest Patterns
    this.frameworkPatterns.set('jest', [
      /jest/gi,
      /describe\(|it\(|test\(|expect\(/gi,
      /\.test\.|\.spec\./gi,
      /jest\.config/gi
    ]);

    // Mocha Patterns
    this.frameworkPatterns.set('mocha', [
      /mocha/gi,
      /describe\(|it\(|before\(|after\(/gi,
      /\.test\.|\.spec\./gi,
      /mocha\.config/gi
    ]);

    // Jasmine Patterns
    this.frameworkPatterns.set('jasmine', [
      /jasmine/gi,
      /describe\(|it\(|beforeEach\(|afterEach\(/gi,
      /\.test\.|\.spec\./gi,
      /jasmine\.config/gi
    ]);
  }

  private initializePlatformPatterns(): void {
    // Percy Platform Patterns
    this.platformPatterns.set('percy', [
      /percy/gi,
      /@percy/gi,
      /percy\.io/gi,
      /percy-snapshot/gi
    ]);

    // Applitools Platform Patterns
    this.platformPatterns.set('applitools', [
      /applitools/gi,
      /eyes/gi,
      /@applitools/gi,
      /applitools\.io/gi
    ]);

    // Sauce Labs Platform Patterns
    this.platformPatterns.set('sauce-labs', [
      /sauce/gi,
      /sauce-labs/gi,
      /saucelabs/gi,
      /sauce\.io/gi
    ]);
  }

  recognize(ast: UniversalASTNode): RecognitionResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    const matches: PatternMatch[] = [];
    const frameworks: Set<SupportedFramework> = new Set();
    const platforms: Set<SupportedPlatform> = new Set();

    // Analyze the AST for patterns
    this.analyzeAST(ast, matches, frameworks, platforms);

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    const confidence = this.calculateOverallConfidence(matches);
    const suggestions = this.generateSuggestions(matches, frameworks, platforms);

    return {
      matches,
      frameworks: Array.from(frameworks),
      platforms: Array.from(platforms),
      confidence,
      suggestions,
      metadata: {
        totalPatterns: this.visualTestPatterns.size + 
                      Array.from(this.frameworkPatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0) +
                      Array.from(this.platformPatterns.values()).reduce((sum, patterns) => sum + patterns.length, 0),
        matchedPatterns: matches.length,
        averageConfidence: confidence,
        processingTime: endTime - startTime,
        memoryUsage: endMemory - startMemory
      }
    };
  }

  private analyzeAST(ast: UniversalASTNode, matches: PatternMatch[], frameworks: Set<SupportedFramework>, platforms: Set<SupportedPlatform>): void {
    // Analyze current node
    this.analyzeNode(ast, matches, frameworks, platforms);

    // Recursively analyze children
    if (ast.children) {
      ast.children.forEach(child => this.analyzeAST(child, matches, frameworks, platforms));
    }
  }

  private analyzeNode(node: UniversalASTNode, matches: PatternMatch[], frameworks: Set<SupportedFramework>, platforms: Set<SupportedPlatform>): void {
    // Check visual test patterns
    this.checkVisualTestPatterns(node, matches, platforms);

    // Check framework patterns
    this.checkFrameworkPatterns(node, matches, frameworks);

    // Check platform patterns
    this.checkPlatformPatterns(node, matches, platforms);

    // Check language-specific patterns
    this.checkLanguageSpecificPatterns(node, matches);
  }

  private checkVisualTestPatterns(node: UniversalASTNode, matches: PatternMatch[], platforms: Set<SupportedPlatform>): void {
    this.visualTestPatterns.forEach((pattern, patternName) => {
      const match = pattern.exec(node.raw);
      if (match) {
        const confidence = this.calculatePatternConfidence(patternName, node);
        const extractedData = this.extractVisualTestData(patternName, match, node);
        const context = this.extractContext(node);

        matches.push({
          pattern: patternName,
          node,
          confidence,
          context,
          extractedData,
          suggestions: this.generateVisualTestSuggestions(patternName, node)
        });

        // Determine platform based on pattern
        if (patternName.startsWith('percy')) {
          platforms.add('percy');
        } else if (patternName.startsWith('applitools')) {
          platforms.add('applitools');
        } else if (patternName.startsWith('sauce')) {
          platforms.add('sauce-labs');
        }
      }
    });
  }

  private checkFrameworkPatterns(node: UniversalASTNode, matches: PatternMatch[], frameworks: Set<SupportedFramework>): void {
    this.frameworkPatterns.forEach((patterns, framework) => {
      patterns.forEach(pattern => {
        const match = pattern.exec(node.raw);
        if (match) {
          const confidence = this.calculateFrameworkConfidence(framework, node);
          const extractedData = this.extractFrameworkData(framework, match, node);
          const context = this.extractContext(node);

          matches.push({
            pattern: `framework_${framework}`,
            node,
            confidence,
            context,
            extractedData,
            suggestions: this.generateFrameworkSuggestions(framework, node)
          });

          frameworks.add(framework);
        }
      });
    });
  }

  private checkPlatformPatterns(node: UniversalASTNode, matches: PatternMatch[], platforms: Set<SupportedPlatform>): void {
    this.platformPatterns.forEach((patterns, platform) => {
      patterns.forEach(pattern => {
        const match = pattern.exec(node.raw);
        if (match) {
          const confidence = this.calculatePlatformConfidence(platform, node);
          const extractedData = this.extractPlatformData(platform, match, node);
          const context = this.extractContext(node);

          matches.push({
            pattern: `platform_${platform}`,
            node,
            confidence,
            context,
            extractedData,
            suggestions: this.generatePlatformSuggestions(platform, node)
          });

          platforms.add(platform);
        }
      });
    });
  }

  private checkLanguageSpecificPatterns(node: UniversalASTNode, matches: PatternMatch[]): void {
    // Language-specific pattern recognition
    switch (node.language) {
      case 'javascript':
      case 'typescript':
        this.checkJavaScriptPatterns(node, matches);
        break;
      case 'python':
        this.checkPythonPatterns(node, matches);
        break;
      case 'java':
        this.checkJavaPatterns(node, matches);
        break;
      case 'csharp':
        this.checkCSharpPatterns(node, matches);
        break;
    }
  }

  private checkJavaScriptPatterns(node: UniversalASTNode, matches: PatternMatch[]): void {
    // ES6+ patterns
    if (node.type === 'arrow-function') {
      matches.push({
        pattern: 'es6_arrow_function',
        node,
        confidence: 0.9,
        context: ['es6', 'arrow-function'],
        extractedData: { type: 'arrow-function' },
        suggestions: ['Consider using async/await for better readability']
      });
    }

    // Async/await patterns
    if (node.raw.includes('async') && node.raw.includes('await')) {
      matches.push({
        pattern: 'async_await',
        node,
        confidence: 0.95,
        context: ['async', 'await', 'promise'],
        extractedData: { type: 'async-await' },
        suggestions: ['Good use of async/await pattern']
      });
    }

    // Destructuring patterns
    if (node.type === 'destructuring') {
      matches.push({
        pattern: 'destructuring',
        node,
        confidence: 0.8,
        context: ['destructuring', 'es6'],
        extractedData: { type: 'destructuring' },
        suggestions: ['Consider using object destructuring for cleaner code']
      });
    }
  }

  private checkPythonPatterns(node: UniversalASTNode, matches: PatternMatch[]): void {
    // Python-specific patterns
    if (node.raw.includes('def ') && node.raw.includes('self')) {
      matches.push({
        pattern: 'python_method',
        node,
        confidence: 0.9,
        context: ['python', 'method', 'class'],
        extractedData: { type: 'method' },
        suggestions: ['Consider using type hints for better code documentation']
      });
    }

    // Decorator patterns
    if (node.raw.includes('@')) {
      matches.push({
        pattern: 'python_decorator',
        node,
        confidence: 0.85,
        context: ['python', 'decorator'],
        extractedData: { type: 'decorator' },
        suggestions: ['Consider using functools.wraps for decorator metadata']
      });
    }
  }

  private checkJavaPatterns(node: UniversalASTNode, matches: PatternMatch[]): void {
    // Java-specific patterns
    if (node.raw.includes('@Test')) {
      matches.push({
        pattern: 'java_test',
        node,
        confidence: 0.95,
        context: ['java', 'test', 'junit'],
        extractedData: { type: 'test' },
        suggestions: ['Consider using JUnit 5 annotations for better test organization']
      });
    }

    // Annotation patterns
    if (node.raw.includes('@') && !node.raw.includes('@Test')) {
      matches.push({
        pattern: 'java_annotation',
        node,
        confidence: 0.8,
        context: ['java', 'annotation'],
        extractedData: { type: 'annotation' },
        suggestions: ['Consider using custom annotations for better code organization']
      });
    }
  }

  private checkCSharpPatterns(node: UniversalASTNode, matches: PatternMatch[]): void {
    // C#-specific patterns
    if (node.raw.includes('[Test]') || node.raw.includes('[TestMethod]')) {
      matches.push({
        pattern: 'csharp_test',
        node,
        confidence: 0.95,
        context: ['csharp', 'test', 'nunit', 'mstest'],
        extractedData: { type: 'test' },
        suggestions: ['Consider using NUnit 3 attributes for better test organization']
      });
    }

    // Attribute patterns
    if (node.raw.includes('[') && node.raw.includes(']')) {
      matches.push({
        pattern: 'csharp_attribute',
        node,
        confidence: 0.8,
        context: ['csharp', 'attribute'],
        extractedData: { type: 'attribute' },
        suggestions: ['Consider using custom attributes for better code organization']
      });
    }
  }

  private calculatePatternConfidence(patternName: string, node: UniversalASTNode): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on pattern specificity
    if (patternName.includes('percy') || patternName.includes('applitools') || patternName.includes('sauce')) {
      confidence += 0.3;
    }

    // Increase confidence based on node type
    if (node.type === 'call' || node.type === 'function') {
      confidence += 0.2;
    }

    // Increase confidence based on context
    if (node.metadata.context.includes('test') || node.metadata.context.includes('visual')) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private calculateFrameworkConfidence(framework: SupportedFramework, node: UniversalASTNode): number {
    let confidence = 0.6; // Base confidence for framework detection

    // Increase confidence based on node type
    if (node.type === 'import' || node.type === 'call') {
      confidence += 0.2;
    }

    // Increase confidence based on framework specificity
    if (framework === 'react' && node.raw.includes('JSX')) {
      confidence += 0.2;
    }

    if (framework === 'angular' && node.raw.includes('@Component')) {
      confidence += 0.2;
    }

    return Math.min(1.0, confidence);
  }

  private calculatePlatformConfidence(platform: SupportedPlatform, node: UniversalASTNode): number {
    let confidence = 0.7; // Base confidence for platform detection

    // Increase confidence based on node type
    if (node.type === 'call' || node.type === 'import') {
      confidence += 0.2;
    }

    // Increase confidence based on platform specificity
    if (platform === 'percy' && node.raw.includes('percy.snapshot')) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private extractVisualTestData(patternName: string, match: RegExpExecArray, node: UniversalASTNode): Record<string, any> {
    const data: Record<string, any> = {
      pattern: patternName,
      match: match[0],
      fullMatch: match[0],
      groups: match.slice(1)
    };

    // Extract specific data based on pattern type
    if (patternName.includes('percy')) {
      data['platform'] = 'percy';
      data['function'] = 'snapshot';
    } else if (patternName.includes('applitools')) {
      data['platform'] = 'applitools';
      data['function'] = 'check';
    } else if (patternName.includes('sauce')) {
      data['platform'] = 'sauce-labs';
      data['function'] = 'visual';
    }

    return data;
  }

  private extractFrameworkData(framework: SupportedFramework, match: RegExpExecArray, node: UniversalASTNode): Record<string, any> {
    return {
      framework,
      match: match[0],
      fullMatch: match[0],
      groups: match.slice(1)
    };
  }

  private extractPlatformData(platform: SupportedPlatform, match: RegExpExecArray, node: UniversalASTNode): Record<string, any> {
    return {
      platform,
      match: match[0],
      fullMatch: match[0],
      groups: match.slice(1)
    };
  }

  private extractContext(node: UniversalASTNode): string[] {
    const context: string[] = [];

    // Add node type context
    context.push(node.type);

    // Add language context
    context.push(node.language);

    // Add framework context
    if (node.framework) {
      context.push(node.framework);
    }

    // Add platform context
    if (node.platform) {
      context.push(node.platform);
    }

    // Add metadata context
    context.push(...node.metadata.context);

    return context;
  }

  private generateVisualTestSuggestions(patternName: string, node: UniversalASTNode): string[] {
    const suggestions: string[] = [];

    if (patternName.includes('percy')) {
      suggestions.push('Consider migrating to SmartUI for better performance');
      suggestions.push('Update Percy configuration to SmartUI format');
    } else if (patternName.includes('applitools')) {
      suggestions.push('Consider migrating to SmartUI for better pricing');
      suggestions.push('Update Applitools Eyes configuration to SmartUI format');
    } else if (patternName.includes('sauce')) {
      suggestions.push('Consider migrating to SmartUI for better reliability');
      suggestions.push('Update Sauce Labs configuration to SmartUI format');
    }

    return suggestions;
  }

  private generateFrameworkSuggestions(framework: SupportedFramework, node: UniversalASTNode): string[] {
    const suggestions: string[] = [];

    switch (framework) {
      case 'react':
        suggestions.push('Consider using React Testing Library for better testing');
        suggestions.push('Use TypeScript for better type safety');
        break;
      case 'angular':
        suggestions.push('Consider using Angular Testing utilities');
        suggestions.push('Use Angular CLI for better project management');
        break;
      case 'vue':
        suggestions.push('Consider using Vue Test Utils for testing');
        suggestions.push('Use Composition API for better code organization');
        break;
      case 'cypress':
        suggestions.push('Consider using Page Object Model for better test organization');
        suggestions.push('Use custom commands for reusable test logic');
        break;
      case 'playwright':
        suggestions.push('Consider using Page Object Model for better test organization');
        suggestions.push('Use fixtures for better test setup');
        break;
    }

    return suggestions;
  }

  private generatePlatformSuggestions(platform: SupportedPlatform, node: UniversalASTNode): string[] {
    const suggestions: string[] = [];

    switch (platform) {
      case 'percy':
        suggestions.push('Consider migrating to SmartUI for better performance and pricing');
        suggestions.push('Update Percy configuration to SmartUI format');
        break;
      case 'applitools':
        suggestions.push('Consider migrating to SmartUI for better pricing and reliability');
        suggestions.push('Update Applitools configuration to SmartUI format');
        break;
      case 'sauce-labs':
        suggestions.push('Consider migrating to SmartUI for better reliability and performance');
        suggestions.push('Update Sauce Labs configuration to SmartUI format');
        break;
    }

    return suggestions;
  }

  private calculateOverallConfidence(matches: PatternMatch[]): number {
    if (matches.length === 0) return 0;

    const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
    return totalConfidence / matches.length;
  }

  private generateSuggestions(matches: PatternMatch[], frameworks: Set<SupportedFramework>, platforms: Set<SupportedPlatform>): string[] {
    const suggestions: string[] = [];

    // Add platform migration suggestions
    if (platforms.size > 0) {
      suggestions.push('Consider migrating to SmartUI for better performance, pricing, and reliability');
    }

    // Add framework-specific suggestions
    frameworks.forEach(framework => {
      suggestions.push(`Consider using ${framework} best practices for better code organization`);
    });

    // Add general suggestions
    suggestions.push('Consider adding comprehensive test coverage');
    suggestions.push('Consider using TypeScript for better type safety');
    suggestions.push('Consider implementing CI/CD for automated testing');

    return suggestions;
  }

  // Public methods for external use
  addPatternMatcher(matcher: PatternMatcher): void {
    this.patternMatchers.push(matcher);
  }

  removePatternMatcher(patternId: string): void {
    this.patternMatchers = this.patternMatchers.filter(matcher => 
      matcher.patterns && matcher.patterns[0] && matcher.patterns[0].source !== patternId
    );
  }

  getPatternMatchers(): PatternMatcher[] {
    return [...this.patternMatchers];
  }

  getVisualTestPatterns(): Map<string, RegExp> {
    return new Map(this.visualTestPatterns);
  }

  getFrameworkPatterns(): Map<SupportedFramework, RegExp[]> {
    return new Map(this.frameworkPatterns);
  }

  getPlatformPatterns(): Map<SupportedPlatform, RegExp[]> {
    return new Map(this.platformPatterns);
  }
}
