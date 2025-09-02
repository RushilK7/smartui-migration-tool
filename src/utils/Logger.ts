/**
 * Logger utility for the SmartUI Migration Tool
 * Provides different log levels and verbose output control
 */

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  VERBOSE = 4
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private isVerbose: boolean = false;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setVerbose(verbose: boolean): void {
    this.isVerbose = verbose;
    this.logLevel = verbose ? LogLevel.VERBOSE : LogLevel.INFO;
  }

  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  public error(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.ERROR) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.WARN) {
      console.warn(`⚠️  ${message}`, ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(`ℹ️  ${message}`, ...args);
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.DEBUG) {
      console.log(`🐛 ${message}`, ...args);
    }
  }

  public verbose(message: string, ...args: any[]): void {
    if (this.isVerbose && this.logLevel >= LogLevel.VERBOSE) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  public success(message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(`✅ ${message}`, ...args);
    }
  }

  public step(stepNumber: number, totalSteps: number, message: string, ...args: any[]): void {
    if (this.logLevel >= LogLevel.INFO) {
      console.log(`[${stepNumber}/${totalSteps}] ${message}`, ...args);
    }
  }

  public transformer(transformerName: string, action: string, details?: string): void {
    if (this.isVerbose) {
      const message = `Transformer: ${transformerName} - ${action}`;
      if (details) {
        this.verbose(`${message} - ${details}`);
      } else {
        this.verbose(message);
      }
    }
  }

  public fileOperation(operation: string, filePath: string, details?: string): void {
    if (this.isVerbose) {
      const message = `File ${operation}: ${filePath}`;
      if (details) {
        this.verbose(`${message} - ${details}`);
      } else {
        this.verbose(message);
      }
    }
  }

  public transformation(original: string, transformed: string, filePath: string): void {
    if (this.isVerbose) {
      this.verbose(`Transformation in ${filePath}:`);
      this.verbose(`  Original: ${original.substring(0, 100)}${original.length > 100 ? '...' : ''}`);
      this.verbose(`  Transformed: ${transformed.substring(0, 100)}${transformed.length > 100 ? '...' : ''}`);
    }
  }

  public snapshotCount(filePath: string, count: number): void {
    if (this.isVerbose) {
      this.verbose(`Found ${count} snapshot(s) in ${filePath}`);
    }
  }

  public warning(warning: string, details?: string): void {
    if (this.isVerbose) {
      this.warn(`Warning: ${warning}`);
      if (details) {
        this.verbose(`  Details: ${details}`);
      }
    }
  }

  public performance(operation: string, duration: number): void {
    if (this.isVerbose) {
      this.verbose(`Performance: ${operation} took ${duration}ms`);
    }
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
