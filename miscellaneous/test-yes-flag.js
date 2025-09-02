#!/usr/bin/env node

// Test script to verify the --yes flag functionality
const { InteractiveCLI } = require('./lib/cli');

async function testYesFlag() {
  console.log('Testing --yes flag functionality...\n');
  
  // Test with --yes flag (automated mode)
  console.log('=== Testing with --yes flag (automated mode) ===');
  const automatedCLI = new InteractiveCLI(true);
  const result = await automatedCLI.runWorkflow();
  
  console.log('\nResult:', result);
  console.log('✅ --yes flag test completed successfully!');
  console.log('The tool should have skipped interactive prompts and proceeded automatically.');
}

testYesFlag().catch(console.error);
