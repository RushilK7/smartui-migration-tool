#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
/**
 * Main entry point for the SmartUI Migration Tool
 * This file serves as the CLI entry point and initializes the oclif framework
 */
async function main() {
    try {
        await (0, core_1.run)();
    }
    catch (error) {
        console.error('An unexpected error occurred:', error);
        process.exit(1);
    }
}
// Execute the main function
main();
//# sourceMappingURL=index.js.map