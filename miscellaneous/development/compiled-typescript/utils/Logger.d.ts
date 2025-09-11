/**
 * Logger utility for the SmartUI Migration Tool
 * Provides different log levels and verbose output control
 */
export declare enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
    VERBOSE = 4
}
export declare class Logger {
    private static instance;
    private logLevel;
    private isVerbose;
    private constructor();
    static getInstance(): Logger;
    setVerbose(verbose: boolean): void;
    setLogLevel(level: LogLevel): void;
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    verbose(message: string, ...args: any[]): void;
    success(message: string, ...args: any[]): void;
    step(stepNumber: number, totalSteps: number, message: string, ...args: any[]): void;
    transformer(transformerName: string, action: string, details?: string): void;
    fileOperation(operation: string, filePath: string, details?: string): void;
    transformation(original: string, transformed: string, filePath: string): void;
    snapshotCount(filePath: string, count: number): void;
    warning(warning: string, details?: string): void;
    performance(operation: string, duration: number): void;
}
export declare const logger: Logger;
//# sourceMappingURL=Logger.d.ts.map