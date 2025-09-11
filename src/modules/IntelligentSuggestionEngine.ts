/**
 * Intelligent Suggestion Engine
 * Phase 3: Cross-File Dependency Analysis & Intelligent Suggestions
 */

import { 
  UniversalASTNode, 
  ASTAnalysisResult,
  SupportedLanguage,
  SupportedFramework,
  SupportedPlatform
} from '../types/ASTTypes';
import { ContextAnalysisResult } from './ContextAnalysisEngine';
import { PatternMatchingResult } from './AdvancedPatternMatcher';
import { SemanticAnalysisResult } from './SemanticAnalysisEngine';
import { CrossFileAnalysisResult } from './CrossFileDependencyAnalyzer';

export interface IntelligentSuggestion {
  id: string;
  type: 'refactor' | 'optimize' | 'migrate' | 'secure' | 'improve' | 'fix' | 'enhance' | 'modernize' | 'standardize' | 'organize' | 'modularize' | 'decouple' | 'consolidate' | 'split' | 'merge' | 'move' | 'rename' | 'delete' | 'add' | 'update' | 'test' | 'document' | 'monitor' | 'debug' | 'profile' | 'unknown';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  category: 'code-quality' | 'performance' | 'security' | 'maintainability' | 'testability' | 'accessibility' | 'usability' | 'reliability' | 'scalability' | 'portability' | 'reusability' | 'readability' | 'documentation' | 'error-handling' | 'logging' | 'monitoring' | 'debugging' | 'profiling' | 'architecture' | 'design' | 'implementation' | 'deployment' | 'migration' | 'visual-testing' | 'unit-testing' | 'integration-testing' | 'e2e-testing' | 'api-testing' | 'performance-testing' | 'security-testing' | 'accessibility-testing' | 'ui-testing' | 'business-logic' | 'data-processing' | 'user-interface' | 'api-development' | 'configuration' | 'utility' | 'library' | 'framework' | 'unknown';
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  urgency: 'low' | 'medium' | 'high' | 'critical';
  files: string[];
  dependencies: string[];
  prerequisites: string[];
  alternatives: string[];
  resources: string[];
  examples: string[];
  code: string;
  validation: string;
  rollback: string;
  metadata: SuggestionMetadata;
}

export interface SuggestionMetadata {
  language: SupportedLanguage;
  framework: SupportedFramework | null;
  platform: SupportedPlatform | null;
  version: string;
  timestamp: string;
  processingTime: number;
  memoryUsage: number;
  confidence: number;
  quality: number;
  complexity: number;
  maintainability: number;
  testability: number;
  performance: number;
  security: number;
  accessibility: number;
  usability: number;
  reliability: number;
  scalability: number;
  portability: number;
  reusability: number;
  readability: number;
  documentation: number;
  errorHandling: number;
  logging: number;
  monitoring: number;
  debugging: number;
  profiling: number;
}

export interface SuggestionRule {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  conditions: SuggestionCondition[];
  actions: SuggestionAction[];
  metadata: SuggestionMetadata;
}

export interface SuggestionCondition {
  type: 'file-type' | 'file-size' | 'file-complexity' | 'file-maintainability' | 'file-testability' | 'file-performance' | 'file-security' | 'file-accessibility' | 'file-usability' | 'file-reliability' | 'file-scalability' | 'file-portability' | 'file-reusability' | 'file-readability' | 'file-documentation' | 'file-error-handling' | 'file-logging' | 'file-monitoring' | 'file-debugging' | 'file-profiling' | 'dependency-count' | 'dependency-type' | 'dependency-strength' | 'dependency-direction' | 'circular-dependency' | 'cluster-coupling' | 'cluster-cohesion' | 'cluster-modularity' | 'cluster-reusability' | 'cluster-maintainability' | 'cluster-testability' | 'cluster-performance' | 'cluster-security' | 'cluster-accessibility' | 'cluster-usability' | 'cluster-reliability' | 'cluster-scalability' | 'cluster-portability' | 'cluster-readability' | 'cluster-documentation' | 'cluster-error-handling' | 'cluster-logging' | 'cluster-monitoring' | 'cluster-debugging' | 'cluster-profiling' | 'pattern-match' | 'context-match' | 'semantic-match' | 'cross-file-match' | 'unknown';
  operator: 'equals' | 'not-equals' | 'contains' | 'not-contains' | 'matches' | 'not-matches' | 'greater-than' | 'less-than' | 'greater-equals' | 'less-equals' | 'exists' | 'not-exists' | 'in' | 'not-in' | 'between' | 'not-between' | 'starts-with' | 'ends-with' | 'regex' | 'not-regex' | 'unknown';
  value: any;
  weight: number;
}

export interface SuggestionAction {
  type: 'suggest' | 'warn' | 'error' | 'info' | 'optimize' | 'refactor' | 'migrate' | 'update' | 'deprecate' | 'modernize' | 'standardize' | 'organize' | 'modularize' | 'decouple' | 'consolidate' | 'split' | 'merge' | 'move' | 'rename' | 'delete' | 'add' | 'test' | 'document' | 'monitor' | 'debug' | 'profile' | 'unknown';
  message: string;
  code: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
}

export interface SuggestionResult {
  suggestions: IntelligentSuggestion[];
  statistics: SuggestionStatistics;
  recommendations: SuggestionRecommendation[];
  transformations: SuggestionTransformation[];
  metadata: SuggestionMetadata;
}

export interface SuggestionStatistics {
  totalSuggestions: number;
  highPrioritySuggestions: number;
  mediumPrioritySuggestions: number;
  lowPrioritySuggestions: number;
  criticalSuggestions: number;
  highEffortSuggestions: number;
  mediumEffortSuggestions: number;
  lowEffortSuggestions: number;
  highImpactSuggestions: number;
  mediumImpactSuggestions: number;
  lowImpactSuggestions: number;
  highRiskSuggestions: number;
  mediumRiskSuggestions: number;
  lowRiskSuggestions: number;
  highConfidenceSuggestions: number;
  mediumConfidenceSuggestions: number;
  lowConfidenceSuggestions: number;
  averageConfidence: number;
  averagePriority: number;
  averageEffort: number;
  averageImpact: number;
  averageRisk: number;
  processingTime: number;
  memoryUsage: number;
}

export interface SuggestionRecommendation {
  id: string;
  type: 'optimization' | 'refactoring' | 'migration' | 'security' | 'performance' | 'accessibility' | 'maintainability' | 'testability' | 'architecture' | 'design' | 'implementation' | 'deployment' | 'monitoring' | 'documentation' | 'unknown';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string[];
  alternatives: string[];
  prerequisites: string[];
  dependencies: string[];
  resources: string[];
  examples: string[];
  code: string;
  validation: string;
  rollback: string;
  metadata: SuggestionMetadata;
}

export interface SuggestionTransformation {
  id: string;
  name: string;
  description: string;
  type: 'refactor' | 'optimize' | 'migrate' | 'secure' | 'improve' | 'fix' | 'enhance' | 'modernize' | 'standardize' | 'organize' | 'modularize' | 'decouple' | 'consolidate' | 'split' | 'merge' | 'move' | 'rename' | 'delete' | 'add' | 'update' | 'test' | 'document' | 'monitor' | 'debug' | 'profile' | 'unknown';
  from: string;
  to: string;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  files: string[];
  code: string;
  validation: string;
  rollback: string;
  metadata: SuggestionMetadata;
}

export class IntelligentSuggestionEngine {
  private rules: Map<string, SuggestionRule> = new Map();
  private statistics: SuggestionStatistics;
  private metadata: SuggestionMetadata;

  constructor() {
    this.statistics = this.initializeStatistics();
    this.metadata = this.initializeMetadata();
    this.initializeBuiltInRules();
  }

  private initializeStatistics(): SuggestionStatistics {
    return {
      totalSuggestions: 0,
      highPrioritySuggestions: 0,
      mediumPrioritySuggestions: 0,
      lowPrioritySuggestions: 0,
      criticalSuggestions: 0,
      highEffortSuggestions: 0,
      mediumEffortSuggestions: 0,
      lowEffortSuggestions: 0,
      highImpactSuggestions: 0,
      mediumImpactSuggestions: 0,
      lowImpactSuggestions: 0,
      highRiskSuggestions: 0,
      mediumRiskSuggestions: 0,
      lowRiskSuggestions: 0,
      highConfidenceSuggestions: 0,
      mediumConfidenceSuggestions: 0,
      lowConfidenceSuggestions: 0,
      averageConfidence: 0,
      averagePriority: 0,
      averageEffort: 0,
      averageImpact: 0,
      averageRisk: 0,
      processingTime: 0,
      memoryUsage: 0
    };
  }

  private initializeMetadata(): SuggestionMetadata {
    return {
      language: 'javascript',
      framework: null,
      platform: null,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      processingTime: 0,
      memoryUsage: 0,
      confidence: 0.8,
      quality: 0.7,
      complexity: 0.5,
      maintainability: 0.7,
      testability: 0.8,
      performance: 0.7,
      security: 0.6,
      accessibility: 0.5,
      usability: 0.6,
      reliability: 0.7,
      scalability: 0.6,
      portability: 0.7,
      reusability: 0.6,
      readability: 0.8,
      documentation: 0.5,
      errorHandling: 0.6,
      logging: 0.5,
      monitoring: 0.4,
      debugging: 0.6,
      profiling: 0.4
    };
  }

  private initializeBuiltInRules(): void {
    // Code Quality Rules
    this.addRule({
      id: 'large-file',
      name: 'Large File Detection',
      description: 'Detect files that are too large and suggest splitting',
      category: 'code-quality',
      subcategory: 'file-size',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'file-size', operator: 'greater-than', value: 1000, weight: 1.0 }
      ],
      actions: [
        { type: 'suggest', message: 'Consider splitting this large file into smaller modules', code: '// Split into smaller modules', confidence: 0.8, effort: 'high', impact: 'high', risk: 'medium' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    this.addRule({
      id: 'high-complexity',
      name: 'High Complexity Detection',
      description: 'Detect files with high cyclomatic complexity',
      category: 'code-quality',
      subcategory: 'complexity',
      severity: 'high',
      priority: 4,
      conditions: [
        { type: 'file-complexity', operator: 'greater-than', value: 10, weight: 1.0 }
      ],
      actions: [
        { type: 'suggest', message: 'Reduce cyclomatic complexity by breaking down complex functions', code: '// Break down complex functions', confidence: 0.9, effort: 'medium', impact: 'high', risk: 'low' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Performance Rules
    this.addRule({
      id: 'performance-optimization',
      name: 'Performance Optimization',
      description: 'Suggest performance optimizations',
      category: 'performance',
      subcategory: 'optimization',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'file-performance', operator: 'less-than', value: 0.7, weight: 1.0 }
      ],
      actions: [
        { type: 'optimize', message: 'Optimize performance by reducing unnecessary computations', code: '// Performance optimization', confidence: 0.7, effort: 'medium', impact: 'medium', risk: 'low' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Security Rules
    this.addRule({
      id: 'security-vulnerability',
      name: 'Security Vulnerability Detection',
      description: 'Detect potential security vulnerabilities',
      category: 'security',
      subcategory: 'vulnerability',
      severity: 'critical',
      priority: 5,
      conditions: [
        { type: 'file-security', operator: 'less-than', value: 0.6, weight: 1.0 }
      ],
      actions: [
        { type: 'warn', message: 'Address potential security vulnerabilities', code: '// Security fix', confidence: 0.9, effort: 'high', impact: 'high', risk: 'high' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Maintainability Rules
    this.addRule({
      id: 'low-maintainability',
      name: 'Low Maintainability Detection',
      description: 'Detect files with low maintainability',
      category: 'maintainability',
      subcategory: 'maintainability',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'file-maintainability', operator: 'less-than', value: 0.6, weight: 1.0 }
      ],
      actions: [
        { type: 'refactor', message: 'Improve maintainability by reducing coupling and improving cohesion', code: '// Improve maintainability', confidence: 0.8, effort: 'high', impact: 'medium', risk: 'medium' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Testability Rules
    this.addRule({
      id: 'low-testability',
      name: 'Low Testability Detection',
      description: 'Detect files with low testability',
      category: 'testability',
      subcategory: 'testability',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'file-testability', operator: 'less-than', value: 0.6, weight: 1.0 }
      ],
      actions: [
        { type: 'test', message: 'Improve testability by reducing dependencies and improving modularity', code: '// Improve testability', confidence: 0.8, effort: 'medium', impact: 'medium', risk: 'low' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Cross-File Dependency Rules
    this.addRule({
      id: 'circular-dependency',
      name: 'Circular Dependency Detection',
      description: 'Detect circular dependencies between files',
      category: 'architecture',
      subcategory: 'circular-dependency',
      severity: 'high',
      priority: 4,
      conditions: [
        { type: 'circular-dependency', operator: 'exists', value: true, weight: 1.0 }
      ],
      actions: [
        { type: 'decouple', message: 'Break circular dependency by introducing interfaces or abstractions', code: '// Break circular dependency', confidence: 0.9, effort: 'high', impact: 'high', risk: 'medium' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    this.addRule({
      id: 'high-coupling',
      name: 'High Coupling Detection',
      description: 'Detect high coupling between files',
      category: 'architecture',
      subcategory: 'coupling',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'cluster-coupling', operator: 'greater-than', value: 0.7, weight: 1.0 }
      ],
      actions: [
        { type: 'modularize', message: 'Reduce coupling by improving modularity', code: '// Reduce coupling', confidence: 0.8, effort: 'high', impact: 'medium', risk: 'medium' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Visual Testing Rules
    this.addRule({
      id: 'visual-testing-migration',
      name: 'Visual Testing Migration',
      description: 'Suggest migration from other visual testing platforms to SmartUI',
      category: 'visual-testing',
      subcategory: 'migration',
      severity: 'medium',
      priority: 3,
      conditions: [
        { type: 'pattern-match', operator: 'matches', value: /percy|applitools|sauce/i, weight: 1.0 }
      ],
      actions: [
        { type: 'migrate', message: 'Migrate to SmartUI for better performance and pricing', code: 'smartui.snapshot($1)', confidence: 0.9, effort: 'low', impact: 'high', risk: 'low' }
      ],
      metadata: this.createSuggestionMetadata()
    });

    // Documentation Rules
    this.addRule({
      id: 'missing-documentation',
      name: 'Missing Documentation Detection',
      description: 'Detect files with missing or insufficient documentation',
      category: 'documentation',
      subcategory: 'documentation',
      severity: 'low',
      priority: 2,
      conditions: [
        { type: 'file-documentation', operator: 'less-than', value: 0.5, weight: 1.0 }
      ],
      actions: [
        { type: 'document', message: 'Add comprehensive documentation to improve code understanding', code: '// Add documentation', confidence: 0.7, effort: 'medium', impact: 'low', risk: 'low' }
      ],
      metadata: this.createSuggestionMetadata()
    });
  }

  analyze(
    files: Map<string, UniversalASTNode>,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): SuggestionResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    const suggestions: IntelligentSuggestion[] = [];
    const recommendations: SuggestionRecommendation[] = [];
    const transformations: SuggestionTransformation[] = [];

    // Apply all rules
    this.rules.forEach((rule, ruleId) => {
      const ruleSuggestions = this.applyRule(rule, files, context, patterns, semantics, crossFile);
      suggestions.push(...ruleSuggestions);
    });

    // Generate recommendations
    recommendations.push(...this.generateRecommendations(suggestions, files, context, patterns, semantics, crossFile));

    // Generate transformations
    transformations.push(...this.generateTransformations(suggestions, files, context, patterns, semantics, crossFile));

    // Update statistics
    this.updateStatistics(suggestions);

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    this.statistics.processingTime = endTime - startTime;
    this.statistics.memoryUsage = endMemory - startMemory;

    return {
      suggestions,
      statistics: this.statistics,
      recommendations,
      transformations,
      metadata: this.metadata
    };
  }

  private applyRule(
    rule: SuggestionRule,
    files: Map<string, UniversalASTNode>,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): IntelligentSuggestion[] {
    const suggestions: IntelligentSuggestion[] = [];

    for (const [filePath, ast] of files) {
      if (this.checkConditions(rule.conditions, filePath, ast, context, patterns, semantics, crossFile)) {
        const suggestion = this.createSuggestion(rule, filePath, ast, context, patterns, semantics, crossFile);
        suggestions.push(suggestion);
      }
    }

    return suggestions;
  }

  private checkConditions(
    conditions: SuggestionCondition[],
    filePath: string,
    ast: UniversalASTNode,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): boolean {
    let totalWeight = 0;
    let matchedWeight = 0;

    for (const condition of conditions) {
      totalWeight += condition.weight;
      
      if (this.evaluateCondition(condition, filePath, ast, context, patterns, semantics, crossFile)) {
        matchedWeight += condition.weight;
      }
    }

    return totalWeight > 0 && matchedWeight / totalWeight >= 0.5;
  }

  private evaluateCondition(
    condition: SuggestionCondition,
    filePath: string,
    ast: UniversalASTNode,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): boolean {
    switch (condition.type) {
      case 'file-size':
        return this.compareValues(ast.raw.length, condition.operator, condition.value);
      case 'file-complexity':
        return this.compareValues(this.calculateComplexity(ast), condition.operator, condition.value);
      case 'file-maintainability':
        return this.compareValues(context.maintainability.overall === 'excellent' ? 0.9 : context.maintainability.overall === 'good' ? 0.7 : context.maintainability.overall === 'fair' ? 0.5 : 0.3, condition.operator, condition.value);
      case 'file-testability':
        return this.compareValues(context.testability.overall === 'excellent' ? 0.9 : context.testability.overall === 'good' ? 0.7 : context.testability.overall === 'fair' ? 0.5 : 0.3, condition.operator, condition.value);
      case 'file-performance':
        return this.compareValues(0.7, condition.operator, condition.value);
      case 'file-security':
        return this.compareValues(0.6, condition.operator, condition.value);
      case 'file-documentation':
        return this.compareValues(0.5, condition.operator, condition.value);
      case 'circular-dependency':
        return this.compareValues(crossFile.cycles.length > 0, condition.operator, condition.value);
      case 'cluster-coupling':
        return this.compareValues(crossFile.clusters.reduce((sum, cluster) => sum + cluster.coupling, 0) / crossFile.clusters.length, condition.operator, condition.value);
      case 'pattern-match':
        return this.compareValues(ast.raw, condition.operator, condition.value);
      default:
        return false;
    }
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
      case 'in':
        return Array.isArray(expected) && expected.includes(actual);
      case 'not-in':
        return Array.isArray(expected) && !expected.includes(actual);
      case 'between':
        return Array.isArray(expected) && expected.length === 2 && Number(actual) >= Number(expected[0]) && Number(actual) <= Number(expected[1]);
      case 'not-between':
        return Array.isArray(expected) && expected.length === 2 && (Number(actual) < Number(expected[0]) || Number(actual) > Number(expected[1]));
      case 'starts-with':
        return String(actual).startsWith(String(expected));
      case 'ends-with':
        return String(actual).endsWith(String(expected));
      case 'regex':
        return new RegExp(expected).test(String(actual));
      case 'not-regex':
        return !new RegExp(expected).test(String(actual));
      default:
        return false;
    }
  }

  private createSuggestion(
    rule: SuggestionRule,
    filePath: string,
    ast: UniversalASTNode,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): IntelligentSuggestion {
    const action = rule.actions[0];
    
    return {
      id: `${rule.id}_${filePath}_${Date.now()}`,
      type: action.type as any,
      title: action.message,
      description: action.message,
      priority: this.calculatePriority(rule, action),
      effort: action.effort,
      impact: action.impact,
      risk: action.risk,
      confidence: action.confidence,
      category: rule.category as any,
      subcategory: rule.subcategory,
      severity: rule.severity,
      urgency: this.calculateUrgency(rule, action),
      files: [filePath],
      dependencies: [],
      prerequisites: [],
      alternatives: [],
      resources: [],
      examples: [],
      code: action.code,
      validation: this.generateValidation(action.code),
      rollback: this.generateRollback(action.code),
      metadata: this.createSuggestionMetadata()
    };
  }

  private calculatePriority(rule: SuggestionRule, action: SuggestionAction): 'low' | 'medium' | 'high' | 'critical' {
    if (rule.severity === 'critical') return 'critical';
    if (rule.severity === 'high') return 'high';
    if (rule.severity === 'medium') return 'medium';
    return 'low';
  }

  private calculateUrgency(rule: SuggestionRule, action: SuggestionAction): 'low' | 'medium' | 'high' | 'critical' {
    if (action.impact === 'high' && action.risk === 'low') return 'high';
    if (action.impact === 'high' && action.risk === 'medium') return 'medium';
    if (action.impact === 'medium' && action.risk === 'low') return 'medium';
    return 'low';
  }

  private generateValidation(code: string): string {
    return `// Validation: Check if suggestion was applied correctly`;
  }

  private generateRollback(code: string): string {
    return `// Rollback: Revert suggestion if needed`;
  }

  private generateRecommendations(
    suggestions: IntelligentSuggestion[],
    files: Map<string, UniversalASTNode>,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): SuggestionRecommendation[] {
    const recommendations: SuggestionRecommendation[] = [];

    // Group suggestions by category
    const suggestionsByCategory = this.groupSuggestionsByCategory(suggestions);

    // Generate recommendations for each category
    for (const [category, categorySuggestions] of suggestionsByCategory) {
      const recommendation = this.createRecommendation(category, categorySuggestions, files, context, patterns, semantics, crossFile);
      if (recommendation) {
        recommendations.push(recommendation);
      }
    }

    return recommendations;
  }

  private groupSuggestionsByCategory(suggestions: IntelligentSuggestion[]): Map<string, IntelligentSuggestion[]> {
    const grouped = new Map<string, IntelligentSuggestion[]>();

    for (const suggestion of suggestions) {
      const category = suggestion.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(suggestion);
    }

    return grouped;
  }

  private createRecommendation(
    category: string,
    suggestions: IntelligentSuggestion[],
    files: Map<string, UniversalASTNode>,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): SuggestionRecommendation | null {
    if (suggestions.length === 0) return null;

    const firstSuggestion = suggestions[0];
    const priority = this.calculateRecommendationPriority(suggestions);
    const effort = this.calculateRecommendationEffort(suggestions);
    const impact = this.calculateRecommendationImpact(suggestions);
    const risk = this.calculateRecommendationRisk(suggestions);

    return {
      id: `rec_${category}_${Date.now()}`,
      type: category as any,
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} Optimization`,
      description: `Found ${suggestions.length} ${category} suggestions that can be optimized`,
      priority,
      effort,
      impact,
      risk,
      confidence: this.calculateRecommendationConfidence(suggestions),
      evidence: suggestions.map(s => s.title),
      alternatives: [],
      prerequisites: [],
      dependencies: [],
      resources: [],
      examples: [],
      code: `// ${category} optimization code`,
      validation: `// Validation for ${category} optimization`,
      rollback: `// Rollback for ${category} optimization`,
      metadata: this.createSuggestionMetadata()
    };
  }

  private calculateRecommendationPriority(suggestions: IntelligentSuggestion[]): 'low' | 'medium' | 'high' | 'critical' {
    const criticalCount = suggestions.filter(s => s.priority === 'critical').length;
    const highCount = suggestions.filter(s => s.priority === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 2) return 'high';
    return 'medium';
  }

  private calculateRecommendationEffort(suggestions: IntelligentSuggestion[]): 'low' | 'medium' | 'high' {
    const highEffortCount = suggestions.filter(s => s.effort === 'high').length;
    const mediumEffortCount = suggestions.filter(s => s.effort === 'medium').length;
    
    if (highEffortCount > 2) return 'high';
    if (mediumEffortCount > 3) return 'medium';
    return 'low';
  }

  private calculateRecommendationImpact(suggestions: IntelligentSuggestion[]): 'low' | 'medium' | 'high' {
    const highImpactCount = suggestions.filter(s => s.impact === 'high').length;
    const mediumImpactCount = suggestions.filter(s => s.impact === 'medium').length;
    
    if (highImpactCount > 1) return 'high';
    if (mediumImpactCount > 2) return 'medium';
    return 'low';
  }

  private calculateRecommendationRisk(suggestions: IntelligentSuggestion[]): 'low' | 'medium' | 'high' {
    const highRiskCount = suggestions.filter(s => s.risk === 'high').length;
    const mediumRiskCount = suggestions.filter(s => s.risk === 'medium').length;
    
    if (highRiskCount > 0) return 'high';
    if (mediumRiskCount > 2) return 'medium';
    return 'low';
  }

  private calculateRecommendationConfidence(suggestions: IntelligentSuggestion[]): number {
    const totalConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0);
    return totalConfidence / suggestions.length;
  }

  private generateTransformations(
    suggestions: IntelligentSuggestion[],
    files: Map<string, UniversalASTNode>,
    context: ContextAnalysisResult,
    patterns: PatternMatchingResult,
    semantics: SemanticAnalysisResult,
    crossFile: CrossFileAnalysisResult
  ): SuggestionTransformation[] {
    const transformations: SuggestionTransformation[] = [];

    for (const suggestion of suggestions) {
      if (suggestion.type === 'migrate' || suggestion.type === 'refactor' || suggestion.type === 'optimize') {
        transformations.push({
          id: `transform_${suggestion.id}`,
          name: suggestion.title,
          description: suggestion.description,
          type: suggestion.type,
          from: suggestion.files[0],
          to: suggestion.code,
          confidence: suggestion.confidence,
          effort: suggestion.effort,
          impact: suggestion.impact,
          risk: suggestion.risk,
          files: suggestion.files,
          code: suggestion.code,
          validation: suggestion.validation,
          rollback: suggestion.rollback,
          metadata: suggestion.metadata
        });
      }
    }

    return transformations;
  }

  private updateStatistics(suggestions: IntelligentSuggestion[]): void {
    this.statistics.totalSuggestions = suggestions.length;

    for (const suggestion of suggestions) {
      if (suggestion.priority === 'critical') this.statistics.criticalSuggestions++;
      else if (suggestion.priority === 'high') this.statistics.highPrioritySuggestions++;
      else if (suggestion.priority === 'medium') this.statistics.mediumPrioritySuggestions++;
      else this.statistics.lowPrioritySuggestions++;

      if (suggestion.effort === 'high') this.statistics.highEffortSuggestions++;
      else if (suggestion.effort === 'medium') this.statistics.mediumEffortSuggestions++;
      else this.statistics.lowEffortSuggestions++;

      if (suggestion.impact === 'high') this.statistics.highImpactSuggestions++;
      else if (suggestion.impact === 'medium') this.statistics.mediumImpactSuggestions++;
      else this.statistics.lowImpactSuggestions++;

      if (suggestion.risk === 'high') this.statistics.highRiskSuggestions++;
      else if (suggestion.risk === 'medium') this.statistics.mediumRiskSuggestions++;
      else this.statistics.lowRiskSuggestions++;

      if (suggestion.confidence >= 0.8) this.statistics.highConfidenceSuggestions++;
      else if (suggestion.confidence >= 0.6) this.statistics.mediumConfidenceSuggestions++;
      else this.statistics.lowConfidenceSuggestions++;
    }

    this.statistics.averageConfidence = this.calculateAverageConfidence(suggestions);
    this.statistics.averagePriority = this.calculateAveragePriority(suggestions);
    this.statistics.averageEffort = this.calculateAverageEffort(suggestions);
    this.statistics.averageImpact = this.calculateAverageImpact(suggestions);
    this.statistics.averageRisk = this.calculateAverageRisk(suggestions);
  }

  private calculateAverageConfidence(suggestions: IntelligentSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const totalConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0);
    return totalConfidence / suggestions.length;
  }

  private calculateAveragePriority(suggestions: IntelligentSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const priorityMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const totalPriority = suggestions.reduce((sum, s) => sum + priorityMap[s.priority], 0);
    return totalPriority / suggestions.length;
  }

  private calculateAverageEffort(suggestions: IntelligentSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const effortMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const totalEffort = suggestions.reduce((sum, s) => sum + effortMap[s.effort], 0);
    return totalEffort / suggestions.length;
  }

  private calculateAverageImpact(suggestions: IntelligentSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const impactMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const totalImpact = suggestions.reduce((sum, s) => sum + impactMap[s.impact], 0);
    return totalImpact / suggestions.length;
  }

  private calculateAverageRisk(suggestions: IntelligentSuggestion[]): number {
    if (suggestions.length === 0) return 0;
    const riskMap = { 'low': 1, 'medium': 2, 'high': 3 };
    const totalRisk = suggestions.reduce((sum, s) => sum + riskMap[s.risk], 0);
    return totalRisk / suggestions.length;
  }

  private calculateComplexity(ast: UniversalASTNode): number {
    return 1.0;
  }

  private createSuggestionMetadata(): SuggestionMetadata {
    return {
      language: 'javascript',
      framework: null,
      platform: null,
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      processingTime: 0,
      memoryUsage: 0,
      confidence: 0.8,
      quality: 0.7,
      complexity: 0.5,
      maintainability: 0.7,
      testability: 0.8,
      performance: 0.7,
      security: 0.6,
      accessibility: 0.5,
      usability: 0.6,
      reliability: 0.7,
      scalability: 0.6,
      portability: 0.7,
      reusability: 0.6,
      readability: 0.8,
      documentation: 0.5,
      errorHandling: 0.6,
      logging: 0.5,
      monitoring: 0.4,
      debugging: 0.6,
      profiling: 0.4
    };
  }

  // Public methods
  addRule(rule: SuggestionRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  getRule(ruleId: string): SuggestionRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): SuggestionRule[] {
    return Array.from(this.rules.values());
  }

  getStatistics(): SuggestionStatistics {
    return { ...this.statistics };
  }

  getMetadata(): SuggestionMetadata {
    return { ...this.metadata };
  }
}
