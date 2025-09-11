"use strict";
/**
 * Logger utility for the SmartUI Migration Tool
 * Provides different log levels and verbose output control
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["WARN"] = 1] = "WARN";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 3] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 4] = "VERBOSE";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
class Logger {
    constructor() {
        this.logLevel = LogLevel.INFO;
        this.isVerbose = false;
    }
    static getInstance() {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }
    setVerbose(verbose) {
        this.isVerbose = verbose;
        this.logLevel = verbose ? LogLevel.VERBOSE : LogLevel.INFO;
    }
    setLogLevel(level) {
        this.logLevel = level;
    }
    error(message, ...args) {
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(`❌ ${message}`, ...args);
        }
    }
    warn(message, ...args) {
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(`⚠️  ${message}`, ...args);
        }
    }
    info(message, ...args) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`ℹ️  ${message}`, ...args);
        }
    }
    debug(message, ...args) {
        if (this.logLevel >= LogLevel.DEBUG) {
            console.log(`🐛 ${message}`, ...args);
        }
    }
    verbose(message, ...args) {
        if (this.isVerbose && this.logLevel >= LogLevel.VERBOSE) {
            console.log(`🔍 ${message}`, ...args);
        }
    }
    success(message, ...args) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`✅ ${message}`, ...args);
        }
    }
    step(stepNumber, totalSteps, message, ...args) {
        if (this.logLevel >= LogLevel.INFO) {
            console.log(`[${stepNumber}/${totalSteps}] ${message}`, ...args);
        }
    }
    transformer(transformerName, action, details) {
        if (this.isVerbose) {
            const message = `Transformer: ${transformerName} - ${action}`;
            if (details) {
                this.verbose(`${message} - ${details}`);
            }
            else {
                this.verbose(message);
            }
        }
    }
    fileOperation(operation, filePath, details) {
        if (this.isVerbose) {
            const message = `File ${operation}: ${filePath}`;
            if (details) {
                this.verbose(`${message} - ${details}`);
            }
            else {
                this.verbose(message);
            }
        }
    }
    transformation(original, transformed, filePath) {
        if (this.isVerbose) {
            this.verbose(`Transformation in ${filePath}:`);
            this.verbose(`  Original: ${original.substring(0, 100)}${original.length > 100 ? '...' : ''}`);
            this.verbose(`  Transformed: ${transformed.substring(0, 100)}${transformed.length > 100 ? '...' : ''}`);
        }
    }
    snapshotCount(filePath, count) {
        if (this.isVerbose) {
            this.verbose(`Found ${count} snapshot(s) in ${filePath}`);
        }
    }
    warning(warning, details) {
        if (this.isVerbose) {
            this.warn(`Warning: ${warning}`);
            if (details) {
                this.verbose(`  Details: ${details}`);
            }
        }
    }
    performance(operation, duration) {
        if (this.isVerbose) {
            this.verbose(`Performance: ${operation} took ${duration}ms`);
        }
    }
}
exports.Logger = Logger;
// Export singleton instance
exports.logger = Logger.getInstance();
//# sourceMappingURL=Logger.js.map