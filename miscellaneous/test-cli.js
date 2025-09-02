#!/usr/bin/env node

// Simple test script to verify the interactive CLI works
const { InteractiveCLI } = require('./lib/cli');

async function testCLI() {
  console.log('Testing Interactive CLI...\n');
  
  // Test automated mode
  console.log('=== Testing Automated Mode ===');
  const automatedCLI = new InteractiveCLI(true);
  const automatedResult = await automatedCLI.runWorkflow();
  console.log('Automated mode result:', automatedResult);
  
  console.log('\n=== Testing Interactive Mode ===');
  console.log('Note: This will show the interactive prompt');
  const interactiveCLI = new InteractiveCLI(false);
  const interactiveResult = await interactiveCLI.runWorkflow();
  console.log('Interactive mode result:', interactiveResult);
}

testCLI().catch(console.error);
