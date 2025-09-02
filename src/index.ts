#!/usr/bin/env node

import { run } from '@oclif/core';

/**
 * Main entry point for the SmartUI Migration Tool
 * This file serves as the CLI entry point and initializes the oclif framework
 */
async function main(): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    process.exit(1);
  }
}

// Execute the main function
main();
