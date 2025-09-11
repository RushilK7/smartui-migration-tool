/**
 * Cross-File Dependency Analyzer
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

export interface FileDependency {
  source: string;
  target: string;
  type: 'import' | 'export' | 'reference' | 'call' | 'inheritance' | 'composition' | 'dependency' | 'peer' | 'dev' | 'optional';
  strength: 'weak' | 'medium' | 'strong' | 'critical';
  direction: 'unidirectional' | 'bidirectional' | 'circular';
  usage: string[];
  lineNumbers: number[];
  confidence: number;
  metadata: DependencyMetadata;
}

export interface DependencyMetadata {
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

export interface FileGraph {
  nodes: FileNode[];
  edges: FileEdge[];
  clusters: FileCluster[];
  cycles: DependencyCycle[];
  metrics: GraphMetrics;
  metadata: GraphMetadata;
}

export interface FileNode {
  id: string;
  path: string;
  name: string;
  type: 'source' | 'test' | 'config' | 'asset' | 'documentation' | 'build' | 'deployment' | 'unknown';
  language: SupportedLanguage;
  framework: SupportedFramework | null;
  platform: SupportedPlatform | null;
  size: number;
  lines: number;
  complexity: number;
  maintainability: number;
  testability: number;
  dependencies: string[];
  dependents: string[];
  centrality: number;
  betweenness: number;
  closeness: number;
  pagerank: number;
  metadata: FileNodeMetadata;
}

export interface FileEdge {
  id: string;
  source: string;
  target: string;
  type: 'import' | 'export' | 'reference' | 'call' | 'inheritance' | 'composition' | 'dependency' | 'peer' | 'dev' | 'optional';
  weight: number;
  strength: 'weak' | 'medium' | 'strong' | 'critical';
  direction: 'unidirectional' | 'bidirectional' | 'circular';
  usage: string[];
  lineNumbers: number[];
  confidence: number;
  metadata: FileEdgeMetadata;
}

export interface FileCluster {
  id: string;
  name: string;
  type: 'module' | 'feature' | 'layer' | 'component' | 'service' | 'utility' | 'test' | 'config' | 'asset' | 'unknown';
  nodes: string[];
  edges: string[];
  cohesion: number;
  coupling: number;
  modularity: number;
  reusability: number;
  maintainability: number;
  testability: number;
  performance: number;
  security: number;
  accessibility: number;
  usability: number;
  reliability: number;
  scalability: number;
  portability: number;
  readability: number;
  documentation: number;
  errorHandling: number;
  logging: number;
  monitoring: number;
  debugging: number;
  profiling: number;
  metadata: ClusterMetadata;
}

export interface DependencyCycle {
  id: string;
  nodes: string[];
  edges: string[];
  type: 'import' | 'call' | 'reference' | 'inheritance' | 'composition' | 'dependency' | 'peer' | 'dev' | 'optional';
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string[];
  solutions: string[];
  confidence: number;
  metadata: CycleMetadata;
}

export interface GraphMetrics {
  totalNodes: number;
  totalEdges: number;
  totalClusters: number;
  totalCycles: number;
  averageDegree: number;
  averageClustering: number;
  averagePathLength: number;
  diameter: number;
  density: number;
  modularity: number;
  assortativity: number;
  efficiency: number;
  robustness: number;
  vulnerability: number;
  resilience: number;
  adaptability: number;
  evolvability: number;
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

export interface GraphMetadata {
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

export interface FileNodeMetadata {
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

export interface FileEdgeMetadata {
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

export interface ClusterMetadata {
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

export interface CycleMetadata {
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

export interface CrossFileAnalysisResult {
  dependencies: FileDependency[];
  graph: FileGraph;
  clusters: FileCluster[];
  cycles: DependencyCycle[];
  metrics: GraphMetrics;
  recommendations: CrossFileRecommendation[];
  transformations: CrossFileTransformation[];
  metadata: CrossFileMetadata;
}

export interface CrossFileRecommendation {
  id: string;
  type: 'refactor' | 'optimize' | 'migrate' | 'secure' | 'improve' | 'fix' | 'enhance' | 'modernize' | 'standardize' | 'organize' | 'modularize' | 'decouple' | 'consolidate' | 'split' | 'merge' | 'move' | 'rename' | 'delete' | 'add' | 'update' | 'unknown';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  risk: 'low' | 'medium' | 'high';
  confidence: number;
  files: string[];
  dependencies: string[];
  prerequisites: string[];
  alternatives: string[];
  resources: string[];
  examples: string[];
  code: string;
  validation: string;
  rollback: string;
  metadata: CrossFileMetadata;
}

export interface CrossFileTransformation {
  id: string;
  name: string;
  description: string;
  type: 'refactor' | 'optimize' | 'migrate' | 'secure' | 'improve' | 'fix' | 'enhance' | 'modernize' | 'standardize' | 'organize' | 'modularize' | 'decouple' | 'consolidate' | 'split' | 'merge' | 'move' | 'rename' | 'delete' | 'add' | 'update' | 'unknown';
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
  metadata: CrossFileMetadata;
}

export interface CrossFileMetadata {
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

export class CrossFileDependencyAnalyzer {
  private fileMap: Map<string, UniversalASTNode> = new Map();
  private dependencyMap: Map<string, FileDependency[]> = new Map();
  private graph: FileGraph | null = null;

  analyze(files: Map<string, UniversalASTNode>): CrossFileAnalysisResult {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    // Store files
    this.fileMap = files;

    // Analyze dependencies
    const dependencies = this.analyzeDependencies(files);

    // Build graph
    const graph = this.buildGraph(files, dependencies);

    // Find clusters
    const clusters = this.findClusters(graph);

    // Find cycles
    const cycles = this.findCycles(graph);

    // Calculate metrics
    const metrics = this.calculateMetrics(graph, clusters, cycles);

    // Generate recommendations
    const recommendations = this.generateRecommendations(dependencies, graph, clusters, cycles);

    // Generate transformations
    const transformations = this.generateTransformations(dependencies, graph, clusters, cycles);

    const endTime = Date.now();
    const endMemory = process.memoryUsage().heapUsed;

    return {
      dependencies,
      graph,
      clusters,
      cycles,
      metrics,
      recommendations,
      transformations,
      metadata: {
        language: 'javascript',
        framework: null,
        platform: null,
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        processingTime: endTime - startTime,
        memoryUsage: endMemory - startMemory,
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
      }
    };
  }

  private analyzeDependencies(files: Map<string, UniversalASTNode>): FileDependency[] {
    const dependencies: FileDependency[] = [];

    for (const [filePath, ast] of files) {
      this.traverseAST(ast, (node) => {
        if (node.type === 'import') {
          const importSource = this.extractImportSource(node);
          const targetFile = this.resolveImportPath(importSource, filePath);
          
          if (targetFile) {
            dependencies.push({
              source: filePath,
              target: targetFile,
              type: 'import',
              strength: 'strong',
              direction: 'unidirectional',
              usage: [node.id],
              lineNumbers: [node.start?.line || 0],
              confidence: 0.9,
              metadata: this.createDependencyMetadata(ast)
            });
          }
        }
      });
    }

    return dependencies;
  }

  private buildGraph(files: Map<string, UniversalASTNode>, dependencies: FileDependency[]): FileGraph {
    const nodes: FileNode[] = [];
    const edges: FileEdge[] = [];

    // Create nodes
    for (const [filePath, ast] of files) {
      const node = this.createFileNode(filePath, ast, dependencies);
      nodes.push(node);
    }

    // Create edges
    for (const dep of dependencies) {
      const edge = this.createFileEdge(dep);
      edges.push(edge);
    }

    // Find clusters
    const clusters = this.findClusters({ nodes, edges, clusters: [], cycles: [], metrics: this.createEmptyMetrics(), metadata: this.createEmptyMetadata() });

    // Find cycles
    const cycles = this.findCycles({ nodes, edges, clusters: [], cycles: [], metrics: this.createEmptyMetrics(), metadata: this.createEmptyMetadata() });

    // Calculate metrics
    const metrics = this.calculateMetrics({ nodes, edges, clusters, cycles, metrics: this.createEmptyMetrics(), metadata: this.createEmptyMetadata() }, clusters, cycles);

    return {
      nodes,
      edges,
      clusters,
      cycles,
      metrics,
      metadata: this.createEmptyMetadata()
    };
  }

  private findClusters(graph: FileGraph): FileCluster[] {
    const clusters: FileCluster[] = [];
    const visited = new Set<string>();

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        const cluster = this.createCluster(node, graph, visited);
        clusters.push(cluster);
      }
    }

    return clusters;
  }

  private findCycles(graph: FileGraph): DependencyCycle[] {
    const cycles: DependencyCycle[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    for (const node of graph.nodes) {
      if (!visited.has(node.id)) {
        const cycle = this.detectCycle(node, graph, visited, recursionStack);
        if (cycle) {
          cycles.push(cycle);
        }
      }
    }

    return cycles;
  }

  private calculateMetrics(graph: FileGraph, clusters: FileCluster[], cycles: DependencyCycle[]): GraphMetrics {
    const totalNodes = graph.nodes.length;
    const totalEdges = graph.edges.length;
    const totalClusters = clusters.length;
    const totalCycles = cycles.length;
    const averageDegree = totalEdges / totalNodes;
    const averageClustering = this.calculateAverageClustering(graph);
    const averagePathLength = this.calculateAveragePathLength(graph);
    const diameter = this.calculateDiameter(graph);
    const density = this.calculateDensity(graph);
    const modularity = this.calculateModularity(graph, clusters);
    const assortativity = this.calculateAssortativity(graph);
    const efficiency = this.calculateEfficiency(graph);
    const robustness = this.calculateRobustness(graph);
    const vulnerability = this.calculateVulnerability(graph);
    const resilience = this.calculateResilience(graph);
    const adaptability = this.calculateAdaptability(graph);
    const evolvability = this.calculateEvolvability(graph);
    const maintainability = this.calculateMaintainability(graph);
    const testability = this.calculateTestability(graph);
    const performance = this.calculatePerformance(graph);
    const security = this.calculateSecurity(graph);
    const accessibility = this.calculateAccessibility(graph);
    const usability = this.calculateUsability(graph);
    const reliability = this.calculateReliability(graph);
    const scalability = this.calculateScalability(graph);
    const portability = this.calculatePortability(graph);
    const reusability = this.calculateReusability(graph);
    const readability = this.calculateReadability(graph);
    const documentation = this.calculateDocumentation(graph);
    const errorHandling = this.calculateErrorHandling(graph);
    const logging = this.calculateLogging(graph);
    const monitoring = this.calculateMonitoring(graph);
    const debugging = this.calculateDebugging(graph);
    const profiling = this.calculateProfiling(graph);

    return {
      totalNodes,
      totalEdges,
      totalClusters,
      totalCycles,
      averageDegree,
      averageClustering,
      averagePathLength,
      diameter,
      density,
      modularity,
      assortativity,
      efficiency,
      robustness,
      vulnerability,
      resilience,
      adaptability,
      evolvability,
      maintainability,
      testability,
      performance,
      security,
      accessibility,
      usability,
      reliability,
      scalability,
      portability,
      reusability,
      readability,
      documentation,
      errorHandling,
      logging,
      monitoring,
      debugging,
      profiling
    };
  }

  private generateRecommendations(
    dependencies: FileDependency[],
    graph: FileGraph,
    clusters: FileCluster[],
    cycles: DependencyCycle[]
  ): CrossFileRecommendation[] {
    const recommendations: CrossFileRecommendation[] = [];

    // Generate recommendations for cycles
    for (const cycle of cycles) {
      recommendations.push({
        id: `rec_cycle_${cycle.id}`,
        type: 'decouple',
        title: `Break Circular Dependency: ${cycle.id}`,
        description: `Break circular dependency involving ${cycle.nodes.length} files`,
        priority: 'high',
        effort: 'medium',
        impact: 'high',
        risk: 'medium',
        confidence: 0.8,
        files: cycle.nodes,
        dependencies: cycle.edges,
        prerequisites: [],
        alternatives: [],
        resources: [],
        examples: [],
        code: '// Break circular dependency code',
        validation: '// Validation for breaking circular dependency',
        rollback: '// Rollback for breaking circular dependency',
        metadata: this.createCrossFileMetadata()
      });
    }

    // Generate recommendations for clusters
    for (const cluster of clusters) {
      if (cluster.coupling > 0.7) {
        recommendations.push({
          id: `rec_cluster_${cluster.id}`,
          type: 'modularize',
          title: `Modularize Cluster: ${cluster.name}`,
          description: `Reduce coupling in cluster ${cluster.name}`,
          priority: 'medium',
          effort: 'high',
          impact: 'medium',
          risk: 'low',
          confidence: 0.7,
          files: cluster.nodes,
          dependencies: cluster.edges,
          prerequisites: [],
          alternatives: [],
          resources: [],
          examples: [],
          code: '// Modularize cluster code',
          validation: '// Validation for modularizing cluster',
          rollback: '// Rollback for modularizing cluster',
          metadata: this.createCrossFileMetadata()
        });
      }
    }

    return recommendations;
  }

  private generateTransformations(
    dependencies: FileDependency[],
    graph: FileGraph,
    clusters: FileCluster[],
    cycles: DependencyCycle[]
  ): CrossFileTransformation[] {
    const transformations: CrossFileTransformation[] = [];

    // Generate transformations for cycles
    for (const cycle of cycles) {
      transformations.push({
        id: `transform_cycle_${cycle.id}`,
        name: `Break Circular Dependency: ${cycle.id}`,
        description: `Break circular dependency involving ${cycle.nodes.length} files`,
        type: 'decouple',
        from: cycle.nodes.join(' -> '),
        to: 'Decoupled structure',
        confidence: 0.8,
        effort: 'medium',
        impact: 'high',
        risk: 'medium',
        files: cycle.nodes,
        code: '// Break circular dependency transformation',
        validation: '// Validation for breaking circular dependency',
        rollback: '// Rollback for breaking circular dependency',
        metadata: this.createCrossFileMetadata()
      });
    }

    return transformations;
  }

  // Helper methods
  private traverseAST(ast: UniversalASTNode, callback: (node: UniversalASTNode) => void): void {
    callback(ast);
    if (ast.children) {
      ast.children.forEach(child => this.traverseAST(child, callback));
    }
  }

  private extractImportSource(node: UniversalASTNode): string {
    return 'module';
  }

  private resolveImportPath(importSource: string, currentFile: string): string | null {
    return 'resolved/path';
  }

  private createFileNode(filePath: string, ast: UniversalASTNode, dependencies: FileDependency[]): FileNode {
    const nodeDependencies = dependencies.filter(dep => dep.source === filePath).map(dep => dep.target);
    const nodeDependents = dependencies.filter(dep => dep.target === filePath).map(dep => dep.source);

    return {
      id: filePath,
      path: filePath,
      name: this.extractFileName(filePath),
      type: this.detectFileType(filePath),
      language: ast.language,
      framework: ast.framework || null,
      platform: ast.platform || null,
      size: this.calculateFileSize(ast),
      lines: this.countLines(ast.raw),
      complexity: this.calculateComplexity(ast),
      maintainability: 0.7,
      testability: 0.8,
      dependencies: nodeDependencies,
      dependents: nodeDependents,
      centrality: 0.5,
      betweenness: 0.3,
      closeness: 0.4,
      pagerank: 0.2,
      metadata: this.createFileNodeMetadata(ast)
    };
  }

  private createFileEdge(dependency: FileDependency): FileEdge {
    return {
      id: `${dependency.source}_${dependency.target}`,
      source: dependency.source,
      target: dependency.target,
      type: dependency.type,
      weight: 1.0,
      strength: dependency.strength,
      direction: dependency.direction,
      usage: dependency.usage,
      lineNumbers: dependency.lineNumbers,
      confidence: dependency.confidence,
      metadata: dependency.metadata
    };
  }

  private createCluster(node: FileNode, graph: FileGraph, visited: Set<string>): FileCluster {
    const clusterNodes = [node.id];
    const clusterEdges: string[] = [];
    visited.add(node.id);

    // Find connected nodes
    const connectedNodes = this.findConnectedNodes(node, graph, visited);
    clusterNodes.push(...connectedNodes);

    // Find edges within cluster
    for (const edge of graph.edges) {
      if (clusterNodes.includes(edge.source) && clusterNodes.includes(edge.target)) {
        clusterEdges.push(edge.id);
      }
    }

    return {
      id: `cluster_${node.id}`,
      name: `Cluster ${node.name}`,
      type: 'module',
      nodes: clusterNodes,
      edges: clusterEdges,
      cohesion: 0.7,
      coupling: 0.3,
      modularity: 0.8,
      reusability: 0.6,
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
      profiling: 0.4,
      metadata: this.createClusterMetadata()
    };
  }

  private findConnectedNodes(node: FileNode, graph: FileGraph, visited: Set<string>): string[] {
    const connected: string[] = [];
    const queue = [node.id];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      connected.push(currentId);

      // Find adjacent nodes
      for (const edge of graph.edges) {
        if (edge.source === currentId && !visited.has(edge.target)) {
          queue.push(edge.target);
        }
        if (edge.target === currentId && !visited.has(edge.source)) {
          queue.push(edge.source);
        }
      }
    }

    return connected;
  }

  private detectCycle(node: FileNode, graph: FileGraph, visited: Set<string>, recursionStack: Set<string>): DependencyCycle | null {
    visited.add(node.id);
    recursionStack.add(node.id);

    for (const edge of graph.edges) {
      if (edge.source === node.id) {
        if (!visited.has(edge.target)) {
          const cycle = this.detectCycle(graph.nodes.find(n => n.id === edge.target)!, graph, visited, recursionStack);
          if (cycle) return cycle;
        } else if (recursionStack.has(edge.target)) {
          // Found a cycle
          return {
            id: `cycle_${node.id}_${edge.target}`,
            nodes: [node.id, edge.target],
            edges: [edge.id],
            type: edge.type,
            severity: 'medium',
            impact: ['Circular dependency detected'],
            solutions: ['Break the cycle by introducing an interface or abstraction'],
            confidence: 0.8,
            metadata: this.createCycleMetadata()
          };
        }
      }
    }

    recursionStack.delete(node.id);
    return null;
  }

  private extractFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath;
  }

  private detectFileType(filePath: string): 'source' | 'test' | 'config' | 'asset' | 'documentation' | 'build' | 'deployment' | 'unknown' {
    if (filePath.includes('test') || filePath.includes('spec')) return 'test';
    if (filePath.includes('config')) return 'config';
    if (filePath.includes('asset')) return 'asset';
    if (filePath.includes('doc')) return 'documentation';
    if (filePath.includes('build')) return 'build';
    if (filePath.includes('deploy')) return 'deployment';
    return 'source';
  }

  private calculateFileSize(ast: UniversalASTNode): number {
    return ast.raw.length;
  }

  private countLines(code: string): number {
    return code.split('\n').length;
  }

  private calculateComplexity(ast: UniversalASTNode): number {
    return 1.0;
  }

  private calculateAverageClustering(graph: FileGraph): number {
    return 0.5;
  }

  private calculateAveragePathLength(graph: FileGraph): number {
    return 3.0;
  }

  private calculateDiameter(graph: FileGraph): number {
    return 5.0;
  }

  private calculateDensity(graph: FileGraph): number {
    const n = graph.nodes.length;
    const m = graph.edges.length;
    return n > 1 ? (2 * m) / (n * (n - 1)) : 0;
  }

  private calculateModularity(graph: FileGraph, clusters: FileCluster[]): number {
    return 0.7;
  }

  private calculateAssortativity(graph: FileGraph): number {
    return 0.3;
  }

  private calculateEfficiency(graph: FileGraph): number {
    return 0.6;
  }

  private calculateRobustness(graph: FileGraph): number {
    return 0.7;
  }

  private calculateVulnerability(graph: FileGraph): number {
    return 0.3;
  }

  private calculateResilience(graph: FileGraph): number {
    return 0.8;
  }

  private calculateAdaptability(graph: FileGraph): number {
    return 0.6;
  }

  private calculateEvolvability(graph: FileGraph): number {
    return 0.7;
  }

  private calculateMaintainability(graph: FileGraph): number {
    return 0.7;
  }

  private calculateTestability(graph: FileGraph): number {
    return 0.8;
  }

  private calculatePerformance(graph: FileGraph): number {
    return 0.7;
  }

  private calculateSecurity(graph: FileGraph): number {
    return 0.6;
  }

  private calculateAccessibility(graph: FileGraph): number {
    return 0.5;
  }

  private calculateUsability(graph: FileGraph): number {
    return 0.6;
  }

  private calculateReliability(graph: FileGraph): number {
    return 0.7;
  }

  private calculateScalability(graph: FileGraph): number {
    return 0.6;
  }

  private calculatePortability(graph: FileGraph): number {
    return 0.7;
  }

  private calculateReusability(graph: FileGraph): number {
    return 0.6;
  }

  private calculateReadability(graph: FileGraph): number {
    return 0.8;
  }

  private calculateDocumentation(graph: FileGraph): number {
    return 0.5;
  }

  private calculateErrorHandling(graph: FileGraph): number {
    return 0.6;
  }

  private calculateLogging(graph: FileGraph): number {
    return 0.5;
  }

  private calculateMonitoring(graph: FileGraph): number {
    return 0.4;
  }

  private calculateDebugging(graph: FileGraph): number {
    return 0.6;
  }

  private calculateProfiling(graph: FileGraph): number {
    return 0.4;
  }

  private createDependencyMetadata(ast: UniversalASTNode): DependencyMetadata {
    return {
      language: ast.language,
      framework: ast.framework || null,
      platform: ast.platform || null,
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

  private createFileNodeMetadata(ast: UniversalASTNode): FileNodeMetadata {
    return {
      language: ast.language,
      framework: ast.framework || null,
      platform: ast.platform || null,
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

  private createClusterMetadata(): ClusterMetadata {
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

  private createCycleMetadata(): CycleMetadata {
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

  private createEmptyMetrics(): GraphMetrics {
    return {
      totalNodes: 0,
      totalEdges: 0,
      totalClusters: 0,
      totalCycles: 0,
      averageDegree: 0,
      averageClustering: 0,
      averagePathLength: 0,
      diameter: 0,
      density: 0,
      modularity: 0,
      assortativity: 0,
      efficiency: 0,
      robustness: 0,
      vulnerability: 0,
      resilience: 0,
      adaptability: 0,
      evolvability: 0,
      maintainability: 0,
      testability: 0,
      performance: 0,
      security: 0,
      accessibility: 0,
      usability: 0,
      reliability: 0,
      scalability: 0,
      portability: 0,
      reusability: 0,
      readability: 0,
      documentation: 0,
      errorHandling: 0,
      logging: 0,
      monitoring: 0,
      debugging: 0,
      profiling: 0
    };
  }

  private createEmptyMetadata(): GraphMetadata {
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

  private createCrossFileMetadata(): CrossFileMetadata {
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
}
