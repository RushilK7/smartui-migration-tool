/**
 * Universal AST Node Types for Multi-Language Support
 * Phase 1: Advanced AST Parser Infrastructure
 */

export type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp';
export type SupportedFramework = 'react' | 'angular' | 'vue' | 'cypress' | 'playwright' | 'selenium' | 'jest' | 'mocha' | 'jasmine';
export type SupportedPlatform = 'percy' | 'applitools' | 'sauce-labs' | 'smartui';

export interface SourceLocation {
  start: {
    line: number;
    column: number;
    offset: number;
  };
  end: {
    line: number;
    column: number;
    offset: number;
  };
  source?: string;
}

export interface NodeMetadata {
  confidence: number;
  context: string[];
  dependencies: string[];
  frameworkHints: string[];
  platformHints: string[];
  complexity: 'low' | 'medium' | 'high';
  transformationPriority: number;
}

export interface UniversalASTNode {
  id: string;
  type: ASTNodeType;
  language: SupportedLanguage;
  framework?: SupportedFramework;
  platform?: SupportedPlatform;
  position: SourceLocation;
  metadata: NodeMetadata;
  children?: UniversalASTNode[];
  parent?: UniversalASTNode;
  raw: string;
  transformed?: string;
}

export type ASTNodeType = 
  | 'import' 
  | 'export' 
  | 'class' 
  | 'function' 
  | 'method' 
  | 'variable' 
  | 'decorator' 
  | 'annotation'
  | 'interface'
  | 'type'
  | 'enum'
  | 'namespace'
  | 'module'
  | 'statement'
  | 'expression'
  | 'literal'
  | 'identifier'
  | 'call'
  | 'member'
  | 'assignment'
  | 'conditional'
  | 'loop'
  | 'try-catch'
  | 'comment'
  | 'directive'
  | 'jsx-element'
  | 'template'
  | 'string'
  | 'number'
  | 'boolean'
  | 'array'
  | 'object'
  | 'arrow-function'
  | 'async-function'
  | 'generator'
  | 'destructuring'
  | 'spread'
  | 'rest'
  | 'optional'
  | 'nullish-coalescing'
  | 'logical'
  | 'binary'
  | 'unary'
  | 'update'
  | 'new'
  | 'this'
  | 'super'
  | 'yield'
  | 'await'
  | 'return'
  | 'throw'
  | 'break'
  | 'continue'
  | 'debugger'
  | 'with'
  | 'switch'
  | 'case'
  | 'default'
  | 'label'
  | 'block'
  | 'program'
  | 'file'
  | 'unknown';

export interface LanguageSpecificNode {
  language: SupportedLanguage;
  nodeType: string;
  properties: Record<string, any>;
  source: string;
  position: SourceLocation;
}

export interface ASTParserConfig {
  language: SupportedLanguage;
  framework?: SupportedFramework;
  platform?: SupportedPlatform;
  includeComments: boolean;
  includeWhitespace: boolean;
  strictMode: boolean;
  experimentalFeatures: boolean;
  sourceType: 'module' | 'script' | 'unambiguous';
}

export interface ASTParseResult {
  success: boolean;
  ast?: UniversalASTNode;
  errors: ParseError[];
  warnings: ParseWarning[];
  metadata: ParseMetadata;
}

export interface ParseError {
  message: string;
  code: string;
  position: SourceLocation;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
}

export interface ParseWarning {
  message: string;
  code: string;
  position: SourceLocation;
  suggestion?: string;
}

export interface ParseMetadata {
  language: SupportedLanguage;
  framework?: SupportedFramework;
  platform?: SupportedPlatform;
  complexity: number;
  nodeCount: number;
  importCount: number;
  functionCount: number;
  classCount: number;
  testCount: number;
  visualTestCount: number;
  parseTime: number;
  memoryUsage: number;
}

export interface ASTTransformation {
  id: string;
  name: string;
  description: string;
  fromPattern: ASTNodeType[];
  toPattern: ASTNodeType[];
  transformation: (node: UniversalASTNode) => UniversalASTNode;
  validation: (node: UniversalASTNode) => boolean;
  rollback: (node: UniversalASTNode) => UniversalASTNode;
}

export interface ASTAnalysisResult {
  nodes: UniversalASTNode[];
  imports: UniversalASTNode[];
  exports: UniversalASTNode[];
  functions: UniversalASTNode[];
  classes: UniversalASTNode[];
  variables: UniversalASTNode[];
  decorators: UniversalASTNode[];
  annotations: UniversalASTNode[];
  visualTests: UniversalASTNode[];
  testFiles: UniversalASTNode[];
  dependencies: string[];
  frameworks: SupportedFramework[];
  platforms: SupportedPlatform[];
  complexity: number;
  maintainability: number;
  testability: number;
}

export interface LanguageParser {
  language: SupportedLanguage;
  parse: (code: string, config: ASTParserConfig) => ASTParseResult;
  analyze: (ast: UniversalASTNode) => ASTAnalysisResult;
  transform: (ast: UniversalASTNode, transformations: ASTTransformation[]) => UniversalASTNode;
  generate: (ast: UniversalASTNode) => string;
  validate: (code: string) => boolean;
}

export interface PatternMatcher {
  patterns: RegExp[];
  nodeTypes: ASTNodeType[];
  frameworks: SupportedFramework[];
  platforms: SupportedPlatform[];
  match: (node: UniversalASTNode) => boolean;
  extract: (node: UniversalASTNode) => Record<string, any>;
  transform: (node: UniversalASTNode, data: Record<string, any>) => UniversalASTNode;
}

export interface ASTEnhancementEngine {
  parsers: Map<SupportedLanguage, LanguageParser>;
  patternMatchers: PatternMatcher[];
  transformations: Map<string, ASTTransformation>;
  analyze: (code: string, language: SupportedLanguage, config?: Partial<ASTParserConfig>) => ASTAnalysisResult;
  transform: (ast: UniversalASTNode, transformationIds: string[]) => UniversalASTNode;
  generate: (ast: UniversalASTNode, language: SupportedLanguage) => string;
}
