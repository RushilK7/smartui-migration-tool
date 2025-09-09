import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../utils/Logger';

/**
 * Performance Optimizer for caching and performance improvements
 */

export interface CacheEntry {
  key: string;
  value: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  memoryUsage: number;
  cacheHits: number;
  cacheMisses: number;
}

export class PerformanceOptimizer {
  private cache: Map<string, CacheEntry> = new Map();
  private metrics: PerformanceMetrics[] = [];
  private verbose: boolean;

  constructor(verbose: boolean = false) {
    this.verbose = verbose;
  }

  /**
   * Cache a value with TTL
   */
  public setCache(key: string, value: any, ttl: number = 300000): void { // 5 minutes default
    const entry: CacheEntry = {
      key,
      value,
      timestamp: Date.now(),
      ttl
    };
    
    this.cache.set(key, entry);
    
    if (this.verbose) logger.debug(`Cached: ${key} (TTL: ${ttl}ms)`);
  }

  /**
   * Get a cached value
   */
  public getCache(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      if (this.verbose) logger.debug(`Cache miss: ${key}`);
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      if (this.verbose) logger.debug(`Cache expired: ${key}`);
      return null;
    }

    if (this.verbose) logger.debug(`Cache hit: ${key}`);
    return entry.value;
  }

  /**
   * Clear expired cache entries
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }
    
    if (this.verbose && cleared > 0) logger.debug(`Cleared ${cleared} expired cache entries`);
  }

  /**
   * Clear all cache
   */
  public clearCache(): void {
    const size = this.cache.size;
    this.cache.clear();
    
    if (this.verbose) logger.debug(`Cleared all cache (${size} entries)`);
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): { size: number; hitRate: number; expired: number } {
    const now = Date.now();
    let expired = 0;
    
    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++;
      }
    }
    
    const totalOperations = this.metrics.reduce((sum, m) => sum + m.cacheHits + m.cacheMisses, 0);
    const totalHits = this.metrics.reduce((sum, m) => sum + m.cacheHits, 0);
    const hitRate = totalOperations > 0 ? (totalHits / totalOperations) * 100 : 0;
    
    return {
      size: this.cache.size,
      hitRate: Math.round(hitRate * 100) / 100,
      expired
    };
  }

  /**
   * Measure operation performance
   */
  public async measureOperation<T>(
    operation: string,
    fn: () => Promise<T>,
    useCache: boolean = false,
    cacheKey?: string
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;
    
    let result: T;
    let cacheHits = 0;
    let cacheMisses = 0;

    if (useCache && cacheKey) {
      const cached = this.getCache(cacheKey);
      if (cached !== null) {
        result = cached;
        cacheHits = 1;
      } else {
        result = await fn();
        this.setCache(cacheKey, result);
        cacheMisses = 1;
      }
    } else {
      result = await fn();
    }

    const duration = Date.now() - startTime;
    const memoryUsage = process.memoryUsage().heapUsed - startMemory;

    const metrics: PerformanceMetrics = {
      operation,
      duration,
      memoryUsage,
      cacheHits,
      cacheMisses
    };

    this.metrics.push(metrics);

    if (this.verbose) {
      logger.debug(`Operation: ${operation} - ${duration}ms, ${Math.round(memoryUsage / 1024)}KB`);
    }

    return result;
  }

  /**
   * Optimize file operations with caching
   */
  public async readFileCached(filePath: string, ttl: number = 60000): Promise<string> {
    const cacheKey = `file:${filePath}`;
    
    return await this.measureOperation(
      `readFile:${path.basename(filePath)}`,
      async () => {
        const cached = this.getCache(cacheKey);
        if (cached !== null) {
          return cached;
        }
        
        const content = await fs.readFile(filePath, 'utf-8');
        this.setCache(cacheKey, content, ttl);
        return content;
      },
      true,
      cacheKey
    );
  }

  /**
   * Optimize directory listing with caching
   */
  public async readDirCached(dirPath: string, ttl: number = 30000): Promise<string[]> {
    const cacheKey = `dir:${dirPath}`;
    
    return await this.measureOperation(
      `readDir:${path.basename(dirPath)}`,
      async () => {
        const cached = this.getCache(cacheKey);
        if (cached !== null) {
          return cached;
        }
        
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const files = entries
          .filter(entry => entry.isFile())
          .map(entry => entry.name);
        
        this.setCache(cacheKey, files, ttl);
        return files;
      },
      true,
      cacheKey
    );
  }

  /**
   * Optimize file existence checks
   */
  public async fileExistsCached(filePath: string, ttl: number = 60000): Promise<boolean> {
    const cacheKey = `exists:${filePath}`;
    
    return await this.measureOperation(
      `fileExists:${path.basename(filePath)}`,
      async () => {
        const cached = this.getCache(cacheKey);
        if (cached !== null) {
          return cached;
        }
        
        try {
          await fs.access(filePath);
          this.setCache(cacheKey, true, ttl);
          return true;
        } catch {
          this.setCache(cacheKey, false, ttl);
          return false;
        }
      },
      true,
      cacheKey
    );
  }

  /**
   * Batch file operations for better performance
   */
  public async batchFileOperations<T>(
    operations: Array<{ path: string; operation: () => Promise<T> }>,
    batchSize: number = 10
  ): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < operations.length; i += batchSize) {
      const batch = operations.slice(i, i + batchSize);
      const batchPromises = batch.map(op => op.operation());
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (this.verbose) {
        logger.debug(`Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(operations.length / batchSize)}`);
      }
    }
    
    return results;
  }

  /**
   * Get performance summary
   */
  public getPerformanceSummary(): {
    totalOperations: number;
    averageDuration: number;
    totalMemoryUsage: number;
    cacheStats: { size: number; hitRate: number; expired: number };
    slowestOperations: Array<{ operation: string; duration: number }>;
  } {
    const totalOperations = this.metrics.length;
    const averageDuration = totalOperations > 0 
      ? this.metrics.reduce((sum, m) => sum + m.duration, 0) / totalOperations 
      : 0;
    const totalMemoryUsage = this.metrics.reduce((sum, m) => sum + m.memoryUsage, 0);
    
    const slowestOperations = this.metrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(m => ({ operation: m.operation, duration: m.duration }));
    
    return {
      totalOperations,
      averageDuration: Math.round(averageDuration * 100) / 100,
      totalMemoryUsage: Math.round(totalMemoryUsage / 1024),
      cacheStats: this.getCacheStats(),
      slowestOperations
    };
  }

  /**
   * Clear performance metrics
   */
  public clearMetrics(): void {
    this.metrics = [];
    if (this.verbose) logger.debug('Cleared performance metrics');
  }

  /**
   * Optimize memory usage
   */
  public optimizeMemory(): void {
    // Clear expired cache entries
    this.clearExpiredCache();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
      if (this.verbose) logger.debug('Forced garbage collection');
    }
    
    // Log memory usage
    const memUsage = process.memoryUsage();
    if (this.verbose) {
      logger.debug(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB heap, ${Math.round(memUsage.external / 1024 / 1024)}MB external`);
    }
  }
}
