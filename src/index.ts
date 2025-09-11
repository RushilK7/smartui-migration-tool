/**
 * SmartUI Migration Tool v1.6.0
 * Enterprise-grade CLI tool for migrating visual testing platforms to LambdaTest SmartUI
 */

export { default as Init } from './commands/init';
export { default as Migrate } from './commands/migrate';
export { default as Version } from './commands/version';
export { default as Help } from './commands/help';

// Core modules
export * from './modules/Scanner';
export * from './modules/CodeTransformer';
export * from './modules/ConfigTransformer';
export * from './modules/TransformationManager';
export * from './modules/ChangePreviewer';

// Phase 1: AST Parsing & Pattern Recognition
export * from './modules/ASTTypes';
export * from './modules/ASTParser';
export * from './modules/PatternRecognitionEngine';
export * from './modules/ASTEnhancementEngine';
export * from './modules/EnhancedScanner';

// Phase 2: Context Analysis & Semantic Analysis
export * from './modules/ContextAnalysisEngine';
export * from './modules/AdvancedPatternMatcher';
export * from './modules/SemanticAnalysisEngine';
export * from './modules/EnhancedMigrationEngine';

// Phase 3: Cross-File Dependency Analysis & Intelligent Suggestions
export * from './modules/CrossFileDependencyAnalyzer';
export * from './modules/IntelligentSuggestionEngine';
export * from './modules/AdvancedTransformationEngine';

// Phase 4: Multi-Language & Framework Support
export * from './modules/MultiLanguageParser';
export * from './modules/FrameworkSpecificAnalyzer';
export * from './modules/PlatformSpecificTransformer';

// Phase 5: Advanced AI & Machine Learning Integration
export * from './modules/AIPoweredCodeAnalyzer';
export * from './modules/MachineLearningEngine';
export * from './modules/IntelligentCodeGenerator';

// Version information
export const VERSION = '1.6.0';
export const DESCRIPTION = 'Enterprise-grade CLI tool for migrating visual testing platforms to LambdaTest SmartUI';