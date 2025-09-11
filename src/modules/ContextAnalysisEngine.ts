/**
 * Context Analysis Engine
 * Phase 2: Advanced Pattern Matching & Context Analysis
 */

import { 
  UniversalASTNode, 
  ASTAnalysisResult,
  SupportedLanguage,
  SupportedFramework,
  SupportedPlatform
} from '../types/ASTTypes';

export interface ContextInfo {
  scope: 'global' | 'function' | 'class' | 'module' | 'block';
  depth: number;
  parent: string | null;
  siblings: string[];
  children: string[];
  variables: VariableContext[];
  functions: FunctionContext[];
  imports: ImportContext[];
  exports: ExportContext[];
  dependencies: DependencyContext[];
  testContext: TestContext | null;
  visualTestContext: VisualTestContext | null;
}

export interface VariableContext {
  name: string;
  type: 'const' | 'let' | 'var' | 'parameter' | 'property';
  scope: string;
  isUsed: boolean;
  isModified: boolean;
  references: number;
  declaration: UniversalASTNode;
  usage: UniversalASTNode[];
}

export interface FunctionContext {
  name: string;
  type: 'function' | 'arrow' | 'method' | 'constructor' | 'async' | 'generator';
  scope: string;
  parameters: ParameterContext[];
  returnType: string | null;
  isTest: boolean;
  isVisualTest: boolean;
  complexity: number;
  calls: string[];
  calledBy: string[];
  declaration: UniversalASTNode;
  body: UniversalASTNode[];
}

export interface ParameterContext {
  name: string;
  type: string | null;
  isOptional: boolean;
  defaultValue: string | null;
  usage: UniversalASTNode[];
}

export interface ImportContext {
  source: string;
  specifiers: ImportSpecifier[];
  isDefault: boolean;
  isNamespace: boolean;
  isSideEffect: boolean;
  usage: UniversalASTNode[];
  declaration: UniversalASTNode;
}

export interface ImportSpecifier {
  name: string;
  alias: string | null;
  isDefault: boolean;
  isTypeOnly: boolean;
}

export interface ExportContext {
  name: string;
  type: 'default' | 'named' | 'namespace' | 'all';
  source: string | null;
  isTypeOnly: boolean;
  usage: UniversalASTNode[];
  declaration: UniversalASTNode;
}

export interface DependencyContext {
  name: string;
  version: string | null;
  type: 'dependency' | 'devDependency' | 'peerDependency' | 'optionalDependency';
  isInstalled: boolean;
  isUsed: boolean;
  usage: UniversalASTNode[];
  files: string[];
}

export interface TestContext {
  framework: SupportedFramework;
  type: 'unit' | 'integration' | 'e2e' | 'visual';
  describe: string | null;
  it: string | null;
  beforeEach: string[];
  afterEach: string[];
  beforeAll: string[];
  afterAll: string[];
  setup: UniversalASTNode[];
  teardown: UniversalASTNode[];
  assertions: UniversalASTNode[];
}

export interface VisualTestContext {
  platform: SupportedPlatform;
  type: 'snapshot' | 'check' | 'visual' | 'screenshot';
  name: string;
  selector: string | null;
  options: Record<string, any>;
  beforeHook: UniversalASTNode | null;
  afterHook: UniversalASTNode | null;
  assertions: UniversalASTNode[];
  dependencies: string[];
}

export interface ContextAnalysisResult {
  globalContext: ContextInfo;
  functionContexts: Map<string, ContextInfo>;
  classContexts: Map<string, ContextInfo>;
  moduleContexts: Map<string, ContextInfo>;
  testContexts: Map<string, TestContext>;
  visualTestContexts: Map<string, VisualTestContext>;
  crossReferences: CrossReference[];
  complexity: ComplexityAnalysis;
  maintainability: MaintainabilityAnalysis;
  testability: TestabilityAnalysis;
  metadata: ContextMetadata;
}

export interface CrossReference {
  from: string;
  to: string;
  type: 'import' | 'call' | 'reference' | 'inheritance' | 'composition';
  strength: 'weak' | 'medium' | 'strong';
  bidirectional: boolean;
  usage: UniversalASTNode[];
}

export interface ComplexityAnalysis {
  cyclomatic: number;
  cognitive: number;
  nesting: number;
  parameters: number;
  lines: number;
  statements: number;
  expressions: number;
  branches: number;
  loops: number;
  conditionals: number;
  tryCatch: number;
  async: number;
  generators: number;
  decorators: number;
  annotations: number;
  overall: 'low' | 'medium' | 'high' | 'very-high';
}

export interface MaintainabilityAnalysis {
  cohesion: number;
  coupling: number;
  abstraction: number;
  encapsulation: number;
  polymorphism: number;
  inheritance: number;
  composition: number;
  modularity: number;
  reusability: number;
  readability: number;
  overall: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface TestabilityAnalysis {
  coverage: number;
  isolation: number;
  mocking: number;
  assertions: number;
  setup: number;
  teardown: number;
  data: number;
  edgeCases: number;
  errorHandling: number;
  performance: number;
  overall: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface ContextMetadata {
  totalNodes: number;
  totalFunctions: number;
  totalClasses: number;
  totalVariables: number;
  totalImports: number;
  totalExports: number;
  totalTests: number;
  totalVisualTests: number;
  totalDependencies: number;
  processingTime: number;
  memoryUsage: number;
  confidence: number;
}

export class ContextAnalysisEngine {
  private nodeMap: Map<string, UniversalASTNode> = new Map();
  private contextMap: Map<string, ContextInfo> = new Map();
  private crossReferences: CrossReference[] = [];

  analyze(ast: UniversalASTNode): ContextAnalysisResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Build node map
    this.buildNodeMap(ast);

    // Analyze global context
    const globalContext = this.analyzeGlobalContext(ast);

    // Analyze function contexts
    const functionContexts = this.analyzeFunctionContexts(ast);

    // Analyze class contexts
    const classContexts = this.analyzeClassContexts(ast);

    // Analyze module contexts
    const moduleContexts = this.analyzeModuleContexts(ast);

    // Analyze test contexts
    const testContexts = this.analyzeTestContexts(ast);

    // Analyze visual test contexts
    const visualTestContexts = this.analyzeVisualTestContexts(ast);

    // Build cross references
    this.buildCrossReferences(ast);

    // Calculate complexity
    const complexity = this.calculateComplexity(ast);

    // Calculate maintainability
    const maintainability = this.calculateMaintainability(ast);

    // Calculate testability
    const testability = this.calculateTestability(ast);

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      globalContext,
      functionContexts,
      classContexts,
      moduleContexts,
      testContexts,
      visualTestContexts,
      crossReferences: this.crossReferences,
      complexity,
      maintainability,
      testability,
      metadata: {
        totalNodes: this.nodeMap.size,
        totalFunctions: functionContexts.size,
        totalClasses: classContexts.size,
        totalVariables: this.countVariables(ast),
        totalImports: this.countImports(ast),
        totalExports: this.countExports(ast),
        totalTests: testContexts.size,
        totalVisualTests: visualTestContexts.size,
        totalDependencies: this.countDependencies(ast),
        processingTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
        confidence: this.calculateConfidence(ast)
      }
    };
  }

  private buildNodeMap(ast: UniversalASTNode): void {
    this.nodeMap.set(ast.id, ast);
    if (ast.children) {
      ast.children.forEach(child => this.buildNodeMap(child));
    }
  }

  private analyzeGlobalContext(ast: UniversalASTNode): ContextInfo {
    const variables: VariableContext[] = [];
    const functions: FunctionContext[] = [];
    const imports: ImportContext[] = [];
    const exports: ExportContext[] = [];
    const dependencies: DependencyContext[] = [];

    this.traverseAST(ast, (node) => {
      switch (node.type) {
        case 'variable':
          variables.push(this.analyzeVariable(node));
          break;
        case 'function':
        case 'arrow-function':
        case 'async-function':
        case 'generator':
          functions.push(this.analyzeFunction(node));
          break;
        case 'import':
          imports.push(this.analyzeImport(node));
          break;
        case 'export':
          exports.push(this.analyzeExport(node));
          break;
      }
    });

    return {
      scope: 'global',
      depth: 0,
      parent: null,
      siblings: [],
      children: ast.children?.map(child => child.id) || [],
      variables,
      functions,
      imports,
      exports,
      dependencies,
      testContext: null,
      visualTestContext: null
    };
  }

  private analyzeFunctionContexts(ast: UniversalASTNode): Map<string, ContextInfo> {
    const contexts = new Map<string, ContextInfo>();

    this.traverseAST(ast, (node) => {
      if (['function', 'arrow-function', 'async-function', 'generator'].includes(node.type)) {
        const context = this.analyzeFunctionContext(node);
        contexts.set(node.id, context);
      }
    });

    return contexts;
  }

  private analyzeClassContexts(ast: UniversalASTNode): Map<string, ContextInfo> {
    const contexts = new Map<string, ContextInfo>();

    this.traverseAST(ast, (node) => {
      if (node.type === 'class') {
        const context = this.analyzeClassContext(node);
        contexts.set(node.id, context);
      }
    });

    return contexts;
  }

  private analyzeModuleContexts(ast: UniversalASTNode): Map<string, ContextInfo> {
    const contexts = new Map<string, ContextInfo>();

    this.traverseAST(ast, (node) => {
      if (['module', 'namespace'].includes(node.type)) {
        const context = this.analyzeModuleContext(node);
        contexts.set(node.id, context);
      }
    });

    return contexts;
  }

  private analyzeTestContexts(ast: UniversalASTNode): Map<string, TestContext> {
    const contexts = new Map<string, TestContext>();

    this.traverseAST(ast, (node) => {
      if (this.isTestNode(node)) {
        const context = this.analyzeTestContext(node);
        contexts.set(node.id, context);
      }
    });

    return contexts;
  }

  private analyzeVisualTestContexts(ast: UniversalASTNode): Map<string, VisualTestContext> {
    const contexts = new Map<string, VisualTestContext>();

    this.traverseAST(ast, (node) => {
      if (this.isVisualTestNode(node)) {
        const context = this.analyzeVisualTestContext(node);
        contexts.set(node.id, context);
      }
    });

    return contexts;
  }

  private analyzeVariable(node: UniversalASTNode): VariableContext {
    return {
      name: this.extractVariableName(node),
      type: this.extractVariableType(node),
      scope: this.extractScope(node),
      isUsed: this.isVariableUsed(node),
      isModified: this.isVariableModified(node),
      references: this.countVariableReferences(node),
      declaration: node,
      usage: this.findVariableUsage(node)
    };
  }

  private analyzeFunction(node: UniversalASTNode): FunctionContext {
    return {
      name: this.extractFunctionName(node),
      type: this.extractFunctionType(node),
      scope: this.extractScope(node),
      parameters: this.extractParameters(node),
      returnType: this.extractReturnType(node),
      isTest: this.isTestFunction(node),
      isVisualTest: this.isVisualTestFunction(node),
      complexity: this.calculateFunctionComplexity(node),
      calls: this.extractFunctionCalls(node),
      calledBy: this.findCallers(node),
      declaration: node,
      body: this.extractFunctionBody(node)
    };
  }

  private analyzeImport(node: UniversalASTNode): ImportContext {
    return {
      source: this.extractImportSource(node),
      specifiers: this.extractImportSpecifiers(node),
      isDefault: this.isDefaultImport(node),
      isNamespace: this.isNamespaceImport(node),
      isSideEffect: this.isSideEffectImport(node),
      usage: this.findImportUsage(node),
      declaration: node
    };
  }

  private analyzeExport(node: UniversalASTNode): ExportContext {
    return {
      name: this.extractExportName(node),
      type: this.extractExportType(node),
      source: this.extractExportSource(node),
      isTypeOnly: this.isTypeOnlyExport(node),
      usage: this.findExportUsage(node),
      declaration: node
    };
  }

  private analyzeTestContext(node: UniversalASTNode): TestContext {
    return {
      framework: this.detectTestFramework(node),
      type: this.detectTestType(node),
      describe: this.extractDescribe(node),
      it: this.extractIt(node),
      beforeEach: this.extractBeforeEach(node),
      afterEach: this.extractAfterEach(node),
      beforeAll: this.extractBeforeAll(node),
      afterAll: this.extractAfterAll(node),
      setup: this.extractTestSetup(node),
      teardown: this.extractTestTeardown(node),
      assertions: this.extractAssertions(node)
    };
  }

  private analyzeVisualTestContext(node: UniversalASTNode): VisualTestContext {
    return {
      platform: this.detectVisualTestPlatform(node),
      type: this.detectVisualTestType(node),
      name: this.extractVisualTestName(node),
      selector: this.extractVisualTestSelector(node),
      options: this.extractVisualTestOptions(node),
      beforeHook: this.extractBeforeHook(node),
      afterHook: this.extractAfterHook(node),
      assertions: this.extractVisualTestAssertions(node),
      dependencies: this.extractVisualTestDependencies(node)
    };
  }

  private buildCrossReferences(ast: UniversalASTNode): void {
    this.crossReferences = [];
    this.traverseAST(ast, (node) => {
      this.findCrossReferences(node);
    });
  }

  private calculateComplexity(ast: UniversalASTNode): ComplexityAnalysis {
    let cyclomatic = 1;
    let cognitive = 0;
    let nesting = 0;
    let parameters = 0;
    let lines = 0;
    let statements = 0;
    let expressions = 0;
    let branches = 0;
    let loops = 0;
    let conditionals = 0;
    let tryCatch = 0;
    let async = 0;
    let generators = 0;
    let decorators = 0;
    let annotations = 0;

    this.traverseAST(ast, (node) => {
      switch (node.type) {
        case 'conditional':
          cyclomatic++;
          cognitive += 2;
          conditionals++;
          break;
        case 'loop':
          cyclomatic++;
          cognitive += 3;
          loops++;
          break;
        case 'try-catch':
          tryCatch++;
          break;
        case 'async-function':
          async++;
          break;
        case 'generator':
          generators++;
          break;
        case 'decorator':
          decorators++;
          break;
        case 'annotation':
          annotations++;
          break;
        case 'function':
        case 'arrow-function':
          parameters += this.countParameters(node);
          break;
      }
      
      lines += this.countLines(node.raw);
      statements += this.countStatements(node);
      expressions += this.countExpressions(node);
      nesting = Math.max(nesting, this.calculateNestingDepth(node));
    });

    const overall = this.calculateOverallComplexity(cyclomatic, cognitive, nesting);

    return {
      cyclomatic,
      cognitive,
      nesting,
      parameters,
      lines,
      statements,
      expressions,
      branches: conditionals,
      loops,
      conditionals,
      tryCatch,
      async,
      generators,
      decorators,
      annotations,
      overall
    };
  }

  private calculateMaintainability(ast: UniversalASTNode): MaintainabilityAnalysis {
    const cohesion = this.calculateCohesion(ast);
    const coupling = this.calculateCoupling(ast);
    const abstraction = this.calculateAbstraction(ast);
    const encapsulation = this.calculateEncapsulation(ast);
    const polymorphism = this.calculatePolymorphism(ast);
    const inheritance = this.calculateInheritance(ast);
    const composition = this.calculateComposition(ast);
    const modularity = this.calculateModularity(ast);
    const reusability = this.calculateReusability(ast);
    const readability = this.calculateReadability(ast);

    const overall = this.calculateOverallMaintainability(
      cohesion, coupling, abstraction, encapsulation, polymorphism,
      inheritance, composition, modularity, reusability, readability
    );

    return {
      cohesion,
      coupling,
      abstraction,
      encapsulation,
      polymorphism,
      inheritance,
      composition,
      modularity,
      reusability,
      readability,
      overall
    };
  }

  private calculateTestability(ast: UniversalASTNode): TestabilityAnalysis {
    const coverage = this.calculateTestCoverage(ast);
    const isolation = this.calculateTestIsolation(ast);
    const mocking = this.calculateMocking(ast);
    const assertions = this.calculateAssertions(ast);
    const setup = this.calculateTestSetup(ast);
    const teardown = this.calculateTestTeardown(ast);
    const data = this.calculateTestData(ast);
    const edgeCases = this.calculateEdgeCases(ast);
    const errorHandling = this.calculateErrorHandling(ast);
    const performance = this.calculatePerformance(ast);

    const overall = this.calculateOverallTestability(
      coverage, isolation, mocking, assertions, setup, teardown,
      data, edgeCases, errorHandling, performance
    );

    return {
      coverage,
      isolation,
      mocking,
      assertions,
      setup,
      teardown,
      data,
      edgeCases,
      errorHandling,
      performance,
      overall
    };
  }

  // Helper methods
  private traverseAST(ast: UniversalASTNode, callback: (node: UniversalASTNode) => void): void {
    callback(ast);
    if (ast.children) {
      ast.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private isTestNode(node: UniversalASTNode): boolean {
    const testPatterns = [
      /test/i, /spec/i, /describe/i, /it\(/i, /expect\(/i
    ];
    return testPatterns.some(pattern => pattern.test(node.raw));
  }

  private isVisualTestNode(node: UniversalASTNode): boolean {
    const visualTestPatterns = [
      /percy/i, /applitools/i, /eyes/i, /sauce/i, /visual/i, /screenshot/i, /snapshot/i
    ];
    return visualTestPatterns.some(pattern => pattern.test(node.raw));
  }

  private isTestFunction(node: UniversalASTNode): boolean {
    return this.isTestNode(node) && ['function', 'arrow-function', 'async-function'].includes(node.type);
  }

  private isVisualTestFunction(node: UniversalASTNode): boolean {
    return this.isVisualTestNode(node) && ['function', 'arrow-function', 'async-function'].includes(node.type);
  }

  // Placeholder implementations for complex analysis methods
  private extractVariableName(node: UniversalASTNode): string {
    // Implementation for extracting variable name
    return 'variable';
  }

  private extractVariableType(node: UniversalASTNode): 'const' | 'let' | 'var' | 'parameter' | 'property' {
    return 'const';
  }

  private extractScope(node: UniversalASTNode): string {
    return 'global';
  }

  private isVariableUsed(node: UniversalASTNode): boolean {
    return true;
  }

  private isVariableModified(node: UniversalASTNode): boolean {
    return false;
  }

  private countVariableReferences(node: UniversalASTNode): number {
    return 1;
  }

  private findVariableUsage(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private extractFunctionName(node: UniversalASTNode): string {
    return 'function';
  }

  private extractFunctionType(node: UniversalASTNode): 'function' | 'arrow' | 'method' | 'constructor' | 'async' | 'generator' {
    return 'function';
  }

  private extractParameters(node: UniversalASTNode): ParameterContext[] {
    return [];
  }

  private extractReturnType(node: UniversalASTNode): string | null {
    return null;
  }

  private calculateFunctionComplexity(node: UniversalASTNode): number {
    return 1;
  }

  private extractFunctionCalls(node: UniversalASTNode): string[] {
    return [];
  }

  private findCallers(node: UniversalASTNode): string[] {
    return [];
  }

  private extractFunctionBody(node: UniversalASTNode): UniversalASTNode[] {
    return node.children || [];
  }

  private extractImportSource(node: UniversalASTNode): string {
    return 'module';
  }

  private extractImportSpecifiers(node: UniversalASTNode): ImportSpecifier[] {
    return [];
  }

  private isDefaultImport(node: UniversalASTNode): boolean {
    return false;
  }

  private isNamespaceImport(node: UniversalASTNode): boolean {
    return false;
  }

  private isSideEffectImport(node: UniversalASTNode): boolean {
    return false;
  }

  private findImportUsage(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private extractExportName(node: UniversalASTNode): string {
    return 'export';
  }

  private extractExportType(node: UniversalASTNode): 'default' | 'named' | 'namespace' | 'all' {
    return 'named';
  }

  private extractExportSource(node: UniversalASTNode): string | null {
    return null;
  }

  private isTypeOnlyExport(node: UniversalASTNode): boolean {
    return false;
  }

  private findExportUsage(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private detectTestFramework(node: UniversalASTNode): SupportedFramework {
    return 'jest';
  }

  private detectTestType(node: UniversalASTNode): 'unit' | 'integration' | 'e2e' | 'visual' {
    return 'unit';
  }

  private extractDescribe(node: UniversalASTNode): string | null {
    return null;
  }

  private extractIt(node: UniversalASTNode): string | null {
    return null;
  }

  private extractBeforeEach(node: UniversalASTNode): string[] {
    return [];
  }

  private extractAfterEach(node: UniversalASTNode): string[] {
    return [];
  }

  private extractBeforeAll(node: UniversalASTNode): string[] {
    return [];
  }

  private extractAfterAll(node: UniversalASTNode): string[] {
    return [];
  }

  private extractTestSetup(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private extractTestTeardown(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private extractAssertions(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private detectVisualTestPlatform(node: UniversalASTNode): SupportedPlatform {
    return 'percy';
  }

  private detectVisualTestType(node: UniversalASTNode): 'snapshot' | 'check' | 'visual' | 'screenshot' {
    return 'snapshot';
  }

  private extractVisualTestName(node: UniversalASTNode): string {
    return 'visual-test';
  }

  private extractVisualTestSelector(node: UniversalASTNode): string | null {
    return null;
  }

  private extractVisualTestOptions(node: UniversalASTNode): Record<string, any> {
    return {};
  }

  private extractBeforeHook(node: UniversalASTNode): UniversalASTNode | null {
    return null;
  }

  private extractAfterHook(node: UniversalASTNode): UniversalASTNode | null {
    return null;
  }

  private extractVisualTestAssertions(node: UniversalASTNode): UniversalASTNode[] {
    return [];
  }

  private extractVisualTestDependencies(node: UniversalASTNode): string[] {
    return [];
  }

  private findCrossReferences(node: UniversalASTNode): void {
    // Implementation for finding cross references
  }

  private countParameters(node: UniversalASTNode): number {
    return 0;
  }

  private countLines(code: string): number {
    return code.split('\n').length;
  }

  private countStatements(node: UniversalASTNode): number {
    return 1;
  }

  private countExpressions(node: UniversalASTNode): number {
    return 1;
  }

  private calculateNestingDepth(node: UniversalASTNode): number {
    return 1;
  }

  private calculateOverallComplexity(cyclomatic: number, cognitive: number, nesting: number): 'low' | 'medium' | 'high' | 'very-high' {
    const score = cyclomatic + cognitive + nesting;
    if (score < 10) return 'low';
    if (score < 20) return 'medium';
    if (score < 30) return 'high';
    return 'very-high';
  }

  private calculateCohesion(ast: UniversalASTNode): number {
    return 0.8;
  }

  private calculateCoupling(ast: UniversalASTNode): number {
    return 0.3;
  }

  private calculateAbstraction(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculateEncapsulation(ast: UniversalASTNode): number {
    return 0.6;
  }

  private calculatePolymorphism(ast: UniversalASTNode): number {
    return 0.4;
  }

  private calculateInheritance(ast: UniversalASTNode): number {
    return 0.3;
  }

  private calculateComposition(ast: UniversalASTNode): number {
    return 0.5;
  }

  private calculateModularity(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculateReusability(ast: UniversalASTNode): number {
    return 0.6;
  }

  private calculateReadability(ast: UniversalASTNode): number {
    return 0.8;
  }

  private calculateOverallMaintainability(
    cohesion: number, coupling: number, abstraction: number, encapsulation: number,
    polymorphism: number, inheritance: number, composition: number, modularity: number,
    reusability: number, readability: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = (cohesion + (1 - coupling) + abstraction + encapsulation + 
                  polymorphism + inheritance + composition + modularity + 
                  reusability + readability) / 10;
    
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  }

  private calculateTestCoverage(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculateTestIsolation(ast: UniversalASTNode): number {
    return 0.8;
  }

  private calculateMocking(ast: UniversalASTNode): number {
    return 0.6;
  }

  private calculateAssertions(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculateTestSetup(ast: UniversalASTNode): number {
    return 0.8;
  }

  private calculateTestTeardown(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculateTestData(ast: UniversalASTNode): number {
    return 0.6;
  }

  private calculateEdgeCases(ast: UniversalASTNode): number {
    return 0.5;
  }

  private calculateErrorHandling(ast: UniversalASTNode): number {
    return 0.7;
  }

  private calculatePerformance(ast: UniversalASTNode): number {
    return 0.8;
  }

  private calculateOverallTestability(
    coverage: number, isolation: number, mocking: number, assertions: number,
    setup: number, teardown: number, data: number, edgeCases: number,
    errorHandling: number, performance: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    const score = (coverage + isolation + mocking + assertions + setup + 
                  teardown + data + edgeCases + errorHandling + performance) / 10;
    
    if (score >= 0.8) return 'excellent';
    if (score >= 0.6) return 'good';
    if (score >= 0.4) return 'fair';
    return 'poor';
  }

  private countVariables(ast: UniversalASTNode): number {
    let count = 0;
    this.traverseAST(ast, (node) => {
      if (node.type === 'variable') count++;
    });
    return count;
  }

  private countImports(ast: UniversalASTNode): number {
    let count = 0;
    this.traverseAST(ast, (node) => {
      if (node.type === 'import') count++;
    });
    return count;
  }

  private countExports(ast: UniversalASTNode): number {
    let count = 0;
    this.traverseAST(ast, (node) => {
      if (node.type === 'export') count++;
    });
    return count;
  }

  private countDependencies(ast: UniversalASTNode): number {
    let count = 0;
    this.traverseAST(ast, (node) => {
      if (node.type === 'import') count++;
    });
    return count;
  }

  private calculateConfidence(ast: UniversalASTNode): number {
    return 0.9;
  }

  private analyzeFunctionContext(node: UniversalASTNode): ContextInfo {
    return {
      scope: 'function',
      depth: 1,
      parent: node.parent?.id || null,
      siblings: [],
      children: node.children?.map(child => child.id) || [],
      variables: [],
      functions: [],
      imports: [],
      exports: [],
      dependencies: [],
      testContext: null,
      visualTestContext: null
    };
  }

  private analyzeClassContext(node: UniversalASTNode): ContextInfo {
    return {
      scope: 'class',
      depth: 1,
      parent: node.parent?.id || null,
      siblings: [],
      children: node.children?.map(child => child.id) || [],
      variables: [],
      functions: [],
      imports: [],
      exports: [],
      dependencies: [],
      testContext: null,
      visualTestContext: null
    };
  }

  private analyzeModuleContext(node: UniversalASTNode): ContextInfo {
    return {
      scope: 'module',
      depth: 1,
      parent: node.parent?.id || null,
      siblings: [],
      children: node.children?.map(child => child.id) || [],
      variables: [],
      functions: [],
      imports: [],
      exports: [],
      dependencies: [],
      testContext: null,
      visualTestContext: null
    };
  }
}
