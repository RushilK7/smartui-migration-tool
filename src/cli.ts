import { run } from '@oclif/core';

/**
 * Main CLI entry point for SmartUI Migration Tool
 * Routes commands to appropriate handlers
 */
async function main() {
  try {
    await run();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the CLI
if (require.main === module) {
  main();
}
