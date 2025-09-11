/**
 * Advanced Pattern Matching Engine
 * Phase 2: Advanced Pattern Matching & Context Analysis
 */

import { 
  UniversalASTNode, 
  ASTNodeType,
  SupportedLanguage,
  SupportedFramework,
  SupportedPlatform
} from '../types/ASTTypes';
import { ContextInfo, ContextAnalysisResult } from './ContextAnalysisEngine';

export interface PatternMatch {
  id: string;
  pattern: string;
  type: PatternType;
  confidence: number;
  context: ContextInfo;
  node: UniversalASTNode;
  extractedData: Record<string, any>;
  suggestions: string[];
  transformations: TransformationSuggestion[];
  metadata: PatternMetadata;
}

export interface PatternType {
  category: 'visual-test' | 'framework' | 'platform' | 'language' | 'architecture' | 'anti-pattern' | 'best-practice';
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
}

export interface TransformationSuggestion {
  id: string;
  name: string;
  description: string;
  fromPattern: string;
  toPattern: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  code: string;
  validation: string;
  rollback: string;
}

export interface PatternMetadata {
  language: SupportedLanguage;
  framework: SupportedFramework | null;
  platform: SupportedPlatform | null;
  complexity: number;
  maintainability: number;
  testability: number;
  performance: number;
  security: number;
  accessibility: number;
  seo: number;
  mobile: number;
  desktop: number;
  crossBrowser: number;
  crossPlatform: number;
  internationalization: number;
  localization: number;
  documentation: number;
  versioning: number;
  deprecation: number;
  migration: number;
}

export interface PatternRule {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  patterns: RegExp[];
  conditions: PatternCondition[];
  actions: PatternAction[];
  metadata: PatternMetadata;
}

export interface PatternCondition {
  type: 'node-type' | 'content' | 'context' | 'dependency' | 'framework' | 'platform' | 'language' | 'complexity' | 'maintainability' | 'testability';
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'matches' | 'not-matches' | 'greater-than' | 'less-than' | 'greater-equals' | 'less-equals' | 'exists' | 'not-exists';
  value: any;
  weight: number;
}

export interface PatternAction {
  type: 'transform' | 'suggest' | 'warn' | 'error' | 'info' | 'optimize' | 'refactor' | 'migrate' | 'update' | 'deprecate';
  message: string;
  code: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
}

export interface PatternMatchingResult {
  matches: PatternMatch[];
  statistics: PatternStatistics;
  recommendations: Recommendation[];
  transformations: TransformationSuggestion[];
  metadata: PatternMatchingMetadata;
}

export interface PatternStatistics {
  totalPatterns: number;
  matchedPatterns: number;
  unmatchedPatterns: number;
  highConfidenceMatches: number;
  mediumConfidenceMatches: number;
  lowConfidenceMatches: number;
  criticalMatches: number;
  highPriorityMatches: number;
  mediumPriorityMatches: number;
  lowPriorityMatches: number;
  averageConfidence: number;
  averagePriority: number;
  processingTime: number;
  memoryUsage: number;
}

export interface Recommendation {
  id: string;
  type: 'optimization' | 'refactoring' | 'migration' | 'security' | 'performance' | 'accessibility' | 'maintainability' | 'testability';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  code: string;
  validation: string;
  rollback: string;
  dependencies: string[];
  prerequisites: string[];
  alternatives: string[];
  resources: string[];
  examples: string[];
  metadata: PatternMetadata;
}

export interface PatternMatchingMetadata {
  totalRules: number;
  activeRules: number;
  disabledRules: number;
  customRules: number;
  builtInRules: number;
  processingTime: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
  errorCount: number;
  warningCount: number;
  successRate: number;
}

export class AdvancedPatternMatcher {
  private rules: Map<string, PatternRule> = new Map();
  private cache: Map<string, PatternMatch[]> = new Map();
  private statistics: PatternStatistics;
  private metadata: PatternMatchingMetadata;

  constructor() {
    this.statistics = this.initializeStatistics();
    this.metadata = this.initializeMetadata();
    this.initializeBuiltInRules();
  }

  private initializeStatistics(): PatternStatistics {
    return {
      totalPatterns: 0,
      matchedPatterns: 0,
      unmatchedPatterns: 0,
      highConfidenceMatches: 0,
      mediumConfidenceMatches: 0,
      lowConfidenceMatches: 0,
      criticalMatches: 0,
      highPriorityMatches: 0,
      mediumPriorityMatches: 0,
      lowPriorityMatches: 0,
      averageConfidence: 0,
      averagePriority: 0,
      processingTime: 0,
      memoryUsage: 0
    };
  }

  private initializeMetadata(): PatternMatchingMetadata {
    return {
      totalRules: 0,
      activeRules: 0,
      disabledRules: 0,
      customRules: 0,
      builtInRules: 0,
      processingTime: 0,
      memoryUsage: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errorCount: 0,
      warningCount: 0,
      successRate: 0
    };
  }

  private initializeBuiltInRules(): void {
    // Visual Testing Patterns
    this.addRule({
      id: 'percy-snapshot',
      name: 'Percy Snapshot Pattern',
      description: 'Detects Percy snapshot calls',
      category: 'visual-test',
      subcategory: 'percy',
      severity: 'medium',
      priority: 3,
      patterns: [
        /percy\.snapshot\([^)]+\)/g,
        /cy\.percySnapshot\([^)]+\)/g,
        /@percy\.playwright/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /percy/i, weight: 1.0 }
      ],
      actions: [
        { type: 'transform', message: 'Transform Percy to SmartUI', code: 'smartui.snapshot($1)', confidence: 0.9, effort: 'low', impact: 'high', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('percy', 'visual-test')
    });

    this.addRule({
      id: 'applitools-eyes',
      name: 'Applitools Eyes Pattern',
      description: 'Detects Applitools Eyes calls',
      category: 'visual-test',
      subcategory: 'applitools',
      severity: 'medium',
      priority: 3,
      patterns: [
        /eyes\.check\([^)]+\)/g,
        /eyes\.checkWindow\([^)]+\)/g,
        /eyes\.checkElement\([^)]+\)/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /eyes/i, weight: 1.0 }
      ],
      actions: [
        { type: 'transform', message: 'Transform Applitools to SmartUI', code: 'smartui.check($1)', confidence: 0.9, effort: 'low', impact: 'high', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('applitools', 'visual-test')
    });

    this.addRule({
      id: 'sauce-labs-visual',
      name: 'Sauce Labs Visual Pattern',
      description: 'Detects Sauce Labs visual testing calls',
      category: 'visual-test',
      subcategory: 'sauce-labs',
      severity: 'medium',
      priority: 3,
      patterns: [
        /sauce\.visual\([^)]+\)/g,
        /driver\.takeScreenshot\([^)]+\)/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /sauce/i, weight: 1.0 }
      ],
      actions: [
        { type: 'transform', message: 'Transform Sauce Labs to SmartUI', code: 'smartui.visual($1)', confidence: 0.9, effort: 'low', impact: 'high', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('sauce-labs', 'visual-test')
    });

    // Framework Patterns
    this.addRule({
      id: 'react-hooks',
      name: 'React Hooks Pattern',
      description: 'Detects React hooks usage',
      category: 'framework',
      subcategory: 'react',
      severity: 'low',
      priority: 2,
      patterns: [
        /useState\(/g,
        /useEffect\(/g,
        /useContext\(/g,
        /useReducer\(/g
      ],
      conditions: [
        { type: 'framework', operator: 'equals', value: 'react', weight: 1.0 }
      ],
      actions: [
        { type: 'suggest', message: 'Consider using custom hooks for better reusability', code: '', confidence: 0.7, effort: 'medium', impact: 'medium', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('react', 'framework')
    });

    this.addRule({
      id: 'angular-decorators',
      name: 'Angular Decorators Pattern',
      description: 'Detects Angular decorators',
      category: 'framework',
      subcategory: 'angular',
      severity: 'low',
      priority: 2,
      patterns: [
        /@Component/g,
        /@Injectable/g,
        /@NgModule/g,
        /@Directive/g
      ],
      conditions: [
        { type: 'framework', operator: 'equals', value: 'angular', weight: 1.0 }
      ],
      actions: [
        { type: 'suggest', message: 'Consider using standalone components for better tree-shaking', code: '', confidence: 0.6, effort: 'high', impact: 'high', risk: 'medium' }
      ],
      metadata: this.createPatternMetadata('angular', 'framework')
    });

    // Anti-patterns
    this.addRule({
      id: 'console-log',
      name: 'Console.log Anti-pattern',
      description: 'Detects console.log statements in production code',
      category: 'anti-pattern',
      subcategory: 'debugging',
      severity: 'medium',
      priority: 2,
      patterns: [
        /console\.log\(/g,
        /console\.warn\(/g,
        /console\.error\(/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /console\.(log|warn|error)/, weight: 1.0 }
      ],
      actions: [
        { type: 'warn', message: 'Remove console statements from production code', code: '', confidence: 0.8, effort: 'low', impact: 'low', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('javascript', 'anti-pattern')
    });

    this.addRule({
      id: 'var-declaration',
      name: 'Var Declaration Anti-pattern',
      description: 'Detects var declarations instead of let/const',
      category: 'anti-pattern',
      subcategory: 'variable-declaration',
      severity: 'low',
      priority: 1,
      patterns: [
        /var\s+\w+/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /var\s+/, weight: 1.0 }
      ],
      actions: [
        { type: 'suggest', message: 'Use let or const instead of var', code: 'const $1', confidence: 0.9, effort: 'low', impact: 'low', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('javascript', 'anti-pattern')
    });

    // Best Practices
    this.addRule({
      id: 'async-await',
      name: 'Async/Await Best Practice',
      description: 'Detects async/await usage',
      category: 'best-practice',
      subcategory: 'asynchronous',
      severity: 'low',
      priority: 1,
      patterns: [
        /async\s+function/g,
        /await\s+/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /async|await/, weight: 1.0 }
      ],
      actions: [
        { type: 'info', message: 'Good use of async/await pattern', code: '', confidence: 0.8, effort: 'low', impact: 'low', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('javascript', 'best-practice')
    });

    this.addRule({
      id: 'destructuring',
      name: 'Destructuring Best Practice',
      description: 'Detects destructuring usage',
      category: 'best-practice',
      subcategory: 'es6',
      severity: 'low',
      priority: 1,
      patterns: [
        /const\s*{\s*\w+/g,
        /const\s*\[\s*\w+/g
      ],
      conditions: [
        { type: 'content', operator: 'matches', value: /const\s*[{\[]/, weight: 1.0 }
      ],
      actions: [
        { type: 'info', message: 'Good use of destructuring', code: '', confidence: 0.8, effort: 'low', impact: 'low', risk: 'low' }
      ],
      metadata: this.createPatternMetadata('javascript', 'best-practice')
    });
  }

  match(ast: UniversalASTNode, context: ContextAnalysisResult): PatternMatchingResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    const matches: PatternMatch[] = [];
    const recommendations: Recommendation[] = [];
    const transformations: TransformationSuggestion[] = [];

    // Check cache first
    const cacheKey = this.generateCacheKey(ast);
    if (this.cache.has(cacheKey)) {
      this.metadata.cacheHits++;
      return this.cache.get(cacheKey)!;
    }

    this.metadata.cacheMisses++;

    // Apply all rules
    this.rules.forEach((rule, ruleId) => {
      const ruleMatches = this.applyRule(rule, ast, context);
      matches.push(...ruleMatches);
    });

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(matches, context));

    // Generate transformations
    transformations.push(...this.generateTransformations(matches, context));

    // Update statistics
    this.updateStatistics(matches);

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    this.statistics.processingTime = endTime - startTime;
    this.statistics.memoryUsage = endMemory - startMemory;

    const result: PatternMatchingResult = {
      matches,
      statistics: this.statistics,
      recommendations,
      transformations,
      metadata: this.metadata
    };

    // Cache result
    this.cache.set(cacheKey, result);

    return result;
  }

  private applyRule(rule: PatternRule, ast: UniversalASTNode, context: ContextAnalysisResult): PatternMatch[] {
    const matches: PatternMatch[] = [];

    this.traverseAST(ast, (node) => {
      // Check if node matches any pattern
      for (const pattern of rule.patterns) {
        const match = pattern.exec(node.raw);
        if (match) {
          // Check conditions
          if (this.checkConditions(rule.conditions, node, context)) {
            const patternMatch = this.createPatternMatch(rule, node, match, context);
            matches.push(patternMatch);
          }
        }
      }
    });

    return matches;
  }

  private checkConditions(conditions: PatternCondition[], node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of conditions) {
      totalWeight += condition.weight;
      
      if (this.evaluateCondition(condition, node, context)) {
        matchedWeight += condition.weight;
      }
    }

    return matchedWeight / totalWeight >= 0.5; // At least 50% of conditions must match
  }

  private evaluateCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    switch (condition.type) {
      case 'node-type':
        return this.evaluateNodeTypeCondition(condition, node);
      case 'content':
        return this.evaluateContentCondition(condition, node);
      case 'context':
        return this.evaluateContextCondition(condition, node, context);
      case 'dependency':
        return this.evaluateDependencyCondition(condition, node, context);
      case 'framework':
        return this.evaluateFrameworkCondition(condition, node, context);
      case 'platform':
        return this.evaluatePlatformCondition(condition, node, context);
      case 'language':
        return this.evaluateLanguageCondition(condition, node, context);
      case 'complexity':
        return this.evaluateComplexityCondition(condition, node, context);
      case 'maintainability':
        return this.evaluateMaintainabilityCondition(condition, node, context);
      case 'testability':
        return this.evaluateTestabilityCondition(condition, node, context);
      default:
        return false;
    }
  }

  private evaluateNodeTypeCondition(condition: PatternCondition, node: UniversalASTNode): boolean {
    return this.compareValues(node.type, condition.operator, condition.value);
  }

  private evaluateContentCondition(condition: PatternCondition, node: UniversalASTNode): boolean {
    return this.compareValues(node.raw, condition.operator, condition.value);
  }

  private evaluateContextCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    // Implementation for context evaluation
    return true;
  }

  private evaluateDependencyCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    // Implementation for dependency evaluation
    return true;
  }

  private evaluateFrameworkCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    // Implementation for framework evaluation
    return true;
  }

  private evaluatePlatformCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    // Implementation for platform evaluation
    return true;
  }

  private evaluateLanguageCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    return this.compareValues(node.language, condition.operator, condition.value);
  }

  private evaluateComplexityCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    return this.compareValues(context.complexity.complexity, condition.operator, condition.value);
  }

  private evaluateMaintainabilityCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    return this.compareValues(context.maintainability.overall, condition.operator, condition.value);
  }

  private evaluateTestabilityCondition(condition: PatternCondition, node: UniversalASTNode, context: ContextAnalysisResult): boolean {
    return this.compareValues(context.testability.overall, condition.operator, condition.value);
  }

  private compareValues(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'not-equals':
        return actual !== expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'not-contains':
        return !String(actual).includes(String(expected));
      case 'matches':
        return new RegExp(expected).test(String(actual));
      case 'not-matches':
        return !new RegExp(expected).test(String(actual));
      case 'greater-than':
        return Number(actual) > Number(expected);
      case 'less-than':
        return Number(actual) < Number(expected);
      case 'greater-equals':
        return Number(actual) >= Number(expected);
      case 'less-equals':
        return Number(actual) <= Number(expected);
      case 'exists':
        return actual != null;
      case 'not-exists':
        return actual == null;
      default:
        return false;
    }
  }

  private createPatternMatch(rule: PatternRule, node: UniversalASTNode, match: RegExpExecArray, context: ContextAnalysisResult): PatternMatch {
    return {
      id: `${rule.id}_${node.id}_${Date.now()}`,
      pattern: rule.name,
      type: {
        category: rule.category as any,
        subcategory: rule.subcategory,
        severity: rule.severity,
        priority: rule.priority
      },
      confidence: this.calculateConfidence(rule, node, match, context),
      context: this.getNodeContext(node, context),
      node,
      extractedData: this.extractData(match, node),
      suggestions: this.generateSuggestions(rule, node, context),
      transformations: this.generateTransformations(rule, node, context),
      metadata: rule.metadata
    };
  }

  private calculateConfidence(rule: PatternRule, node: UniversalASTNode, match: RegExpExecArray, context: ContextAnalysisResult): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on pattern specificity
    if (rule.patterns.length === 1) {
      confidence += 0.2;
    }

    // Increase confidence based on conditions
    const conditionScore = this.calculateConditionScore(rule.conditions, node, context);
    confidence += conditionScore * 0.3;

    // Increase confidence based on context
    if (context.complexity.complexity > 0) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  private calculateConditionScore(conditions: PatternCondition[], node: UniversalASTNode, context: ContextAnalysisResult): number {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of conditions) {
      totalWeight += condition.weight;
      if (this.evaluateCondition(condition, node, context)) {
        matchedWeight += condition.weight;
      }
    }

    return totalWeight > 0 ? matchedWeight / totalWeight : 0;
  }

  private getNodeContext(node: UniversalASTNode, context: ContextAnalysisResult): ContextInfo {
    // Find the context for this node
    if (context.functionContexts.has(node.id)) {
      return context.functionContexts.get(node.id)!;
    }
    if (context.classContexts.has(node.id)) {
      return context.classContexts.get(node.id)!;
    }
    if (context.moduleContexts.has(node.id)) {
      return context.moduleContexts.get(node.id)!;
    }
    return context.globalContext;
  }

  private extractData(match: RegExpExecArray, node: UniversalASTNode): Record<string, any> {
    return {
      fullMatch: match[0],
      groups: match.slice(1),
      index: match.index,
      input: match.input
    };
  }

  private generateSuggestions(rule: PatternRule, node: UniversalASTNode, context: ContextAnalysisResult): string[] {
    const suggestions: string[] = [];

    for (const action of rule.actions) {
      if (action.type === 'suggest' || action.type === 'info') {
        suggestions.push(action.message);
      }
    }

    return suggestions;
  }

  private generateTransformations(rule: PatternRule, node: UniversalASTNode, context: ContextAnalysisResult): TransformationSuggestion[] {
    const transformations: TransformationSuggestion[] = [];

    for (const action of rule.actions) {
      if (action.type === 'transform') {
        transformations.push({
          id: `${rule.id}_transform_${Date.now()}`,
          name: action.message,
          description: action.message,
          fromPattern: rule.patterns[0].source,
          toPattern: action.code,
          confidence: action.confidence,
          effort: action.effort,
          impact: action.impact,
          risk: action.risk,
          code: action.code,
          validation: this.generateValidation(action.code),
          rollback: this.generateRollback(action.code)
        });
      }
    }

    return transformations;
  }

  private generateValidation(code: string): string {
    // Generate validation code for the transformation
    return `// Validation: Check if transformation was applied correctly`;
  }

  private generateRollback(code: string): string {
    // Generate rollback code for the transformation
    return `// Rollback: Revert transformation if needed`;
  }

  private generateRecommendations(matches: PatternMatch[], context: ContextAnalysisResult): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Group matches by category
    const matchesByCategory = this.groupMatchesByCategory(matches);

    // Generate recommendations for each category
    for (const [category, categoryMatches] of matchesByCategory) {
      const recommendation = this.createRecommendation(category, categoryMatches, context);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private groupMatchesByCategory(matches: PatternMatch[]): Map<string, PatternMatch[]> {
    const grouped = new Map<string, PatternMatch[]>();

    for (const match of matches) {
      const category = match.type.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(match);
    }

    return grouped;
  }

  private createRecommendation(category: string, matches: PatternMatch[], context: ContextAnalysisResult): Recommendation | null {
    if (matches.length === 0) return null;

    const firstMatch = matches[0];
    const priority = this.calculateRecommendationPriority(matches);
    const effort = this.calculateRecommendationEffort(matches);
    const impact = this.calculateRecommendationImpact(matches);
    const risk = this.calculateRecommendationRisk(matches);

    return {
      id: `rec_${category}_${Date.now()}`,
      type: category as any,
      title: this.generateRecommendationTitle(category, matches),
      description: this.generateRecommendationDescription(category, matches),
      priority,
      effort,
      impact,
      risk,
      confidence: this.calculateRecommendationConfidence(matches),
      code: this.generateRecommendationCode(category, matches),
      validation: this.generateRecommendationValidation(category, matches),
      rollback: this.generateRecommendationRollback(category, matches),
      dependencies: this.extractDependencies(matches),
      prerequisites: this.extractPrerequisites(matches),
      alternatives: this.generateAlternatives(category, matches),
      resources: this.generateResources(category, matches),
      examples: this.generateExamples(category, matches),
      metadata: firstMatch.metadata
    };
  }

  private calculateRecommendationPriority(matches: PatternMatch[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = matches.filter(m => m.type.severity === 'critical').length;
    const highCount = matches.filter(m => m.type.severity === 'high').length;
    const mediumCount = matches.filter(m => m.type.severity === 'medium').length;

    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    if (mediumCount > 3) return 'medium';
    return 'low';
  }

  private calculateRecommendationEffort(matches: PatternMatch[]): 'low' | 'medium' | 'high' {
    const highEffortCount = matches.filter(m => m.transformations.some(t => t.effort === 'high')).length;
    const mediumEffortCount = matches.filter(m => m.transformations.some(t => t.effort === 'medium')).length;

    if (highEffortCount > 2) return 'high';
    if (mediumEffortCount > 3) return 'medium';
    return 'low';
  }

  private calculateRecommendationImpact(matches: PatternMatch[]): 'low' | 'medium' | 'high' {
    const highImpactCount = matches.filter(m => m.transformations.some(t => t.impact === 'high')).length;
    const mediumImpactCount = matches.filter(m => m.transformations.some(t => t.impact === 'medium')).length;

    if (highImpactCount > 1) return 'high';
    if (mediumImpactCount > 2) return 'medium';
    return 'low';
  }

  private calculateRecommendationRisk(matches: PatternMatch[]): 'low' | 'medium' | 'high' {
    const highRiskCount = matches.filter(m => m.transformations.some(t => t.risk === 'high')).length;
    const mediumRiskCount = matches.filter(m => m.transformations.some(t => t.risk === 'medium')).length;

    if (highRiskCount > 0) return 'high';
    if (mediumRiskCount > 2) return 'medium';
    return 'low';
  }

  private calculateRecommendationConfidence(matches: PatternMatch[]): number {
    const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
    return totalConfidence / matches.length;
  }

  private generateRecommendationTitle(category: string, matches: PatternMatch[]): string {
    return `${category.charAt(0).toUpperCase() + category.slice(1)} Optimization`;
  }

  private generateRecommendationDescription(category: string, matches: PatternMatch[]): string {
    return `Found ${matches.length} ${category} patterns that can be optimized`;
  }

  private generateRecommendationCode(category: string, matches: PatternMatch[]): string {
    return `// ${category} optimization code`;
  }

  private generateRecommendationValidation(category: string, matches: PatternMatch[]): string {
    return `// Validation for ${category} optimization`;
  }

  private generateRecommendationRollback(category: string, matches: PatternMatch[]): string {
    return `// Rollback for ${category} optimization`;
  }

  private extractDependencies(matches: PatternMatch[]): string[] {
    return [];
  }

  private extractPrerequisites(matches: PatternMatch[]): string[] {
    return [];
  }

  private generateAlternatives(category: string, matches: PatternMatch[]): string[] {
    return [];
  }

  private generateResources(category: string, matches: PatternMatch[]): string[] {
    return [];
  }

  private generateExamples(category: string, matches: PatternMatch[]): string[] {
    return [];
  }

  private generateTransformations(matches: PatternMatch[], context: ContextAnalysisResult): TransformationSuggestion[] {
    const transformations: TransformationSuggestion[] = [];

    for (const match of matches) {
      transformations.push(...match.transformations);
    }

    return transformations;
  }

  private updateStatistics(matches: PatternMatch[]): void {
    this.statistics.totalPatterns += matches.length;
    this.statistics.matchedPatterns += matches.length;

    for (const match of matches) {
      if (match.confidence >= 0.8) {
        this.statistics.highConfidenceMatches++;
      } else if (match.confidence >= 0.6) {
        this.statistics.mediumConfidenceMatches++;
      } else {
        this.statistics.lowConfidenceMatches++;
      }

      if (match.type.severity === 'critical') {
        this.statistics.criticalMatches++;
      }

      if (match.type.priority >= 3) {
        this.statistics.highPriorityMatches++;
      } else if (match.type.priority >= 2) {
        this.statistics.mediumPriorityMatches++;
      } else {
        this.statistics.lowPriorityMatches++;
      }
    }

    this.statistics.averageConfidence = this.calculateAverageConfidence(matches);
    this.statistics.averagePriority = this.calculateAveragePriority(matches);
  }

  private calculateAverageConfidence(matches: PatternMatch[]): number {
    if (matches.length === 0) return 0;
    const totalConfidence = matches.reduce((sum, match) => sum + match.confidence, 0);
    return totalConfidence / matches.length;
  }

  private calculateAveragePriority(matches: PatternMatch[]): number {
    if (matches.length === 0) return 0;
    const totalPriority = matches.reduce((sum, match) => sum + match.type.priority, 0);
    return totalPriority / matches.length;
  }

  private generateCacheKey(ast: UniversalASTNode): string {
    return `${ast.id}_${ast.language}_${ast.type}`;
  }

  private traverseAST(ast: UniversalASTNode, callback: (node: UniversalASTNode) => void): void {
    callback(ast);
    if (ast.children) {
      ast.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private createPatternMetadata(platform: string, category: string): PatternMetadata {
    return {
      language: 'javascript',
      framework: null,
      platform: platform as SupportedPlatform,
      complexity: 0.5,
      maintainability: 0.7,
      testability: 0.8,
      performance: 0.6,
      security: 0.5,
      accessibility: 0.5,
      seo: 0.5,
      mobile: 0.5,
      desktop: 0.5,
      crossBrowser: 0.5,
      crossPlatform: 0.5,
      internationalization: 0.5,
      localization: 0.5,
      documentation: 0.5,
      versioning: 0.5,
      deprecation: 0.5,
      migration: 0.5
    };
  }

  // Public methods
  addRule(rule: PatternRule): void {
    this.rules.set(rule.id, rule);
    this.metadata.totalRules++;
    this.metadata.activeRules++;
    this.metadata.builtInRules++;
  }

  removeRule(ruleId: string): void {
    if (this.rules.has(ruleId)) {
      this.rules.delete(ruleId);
      this.metadata.totalRules--;
      this.metadata.activeRules--;
    }
  }

  getRule(ruleId: string): PatternRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): PatternRule[] {
    return Array.from(this.rules.values());
  }

  clearCache(): void {
    this.cache.clear();
  }

  getStatistics(): PatternStatistics {
    return { ...this.statistics };
  }

  getMetadata(): PatternMatchingMetadata {
    return { ...this.metadata };
  }
}
