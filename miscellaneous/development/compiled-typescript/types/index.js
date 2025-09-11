"use strict";
/**
 * Shared type definitions for the SmartUI Migration Tool
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MismatchedSignalsError = exports.MultiplePlatformsDetectedError = exports.PlatformNotDetectedError = void 0;
// Custom error classes for scanner
class PlatformNotDetectedError extends Error {
    constructor(message = 'Could not detect a supported visual testing platform. Please run this tool from the root of your project.') {
        super(message);
        this.name = 'PlatformNotDetectedError';
    }
}
exports.PlatformNotDetectedError = PlatformNotDetectedError;
class MultiplePlatformsDetectedError extends Error {
    constructor(message = 'Multiple visual testing platforms were detected. The migration tool supports migrating from only one platform at a time.') {
        super(message);
        this.name = 'MultiplePlatformsDetectedError';
    }
}
exports.MultiplePlatformsDetectedError = MultiplePlatformsDetectedError;
class MismatchedSignalsError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MismatchedSignalsError';
    }
}
exports.MismatchedSignalsError = MismatchedSignalsError;
//# sourceMappingURL=index.js.map