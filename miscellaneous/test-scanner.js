#!/usr/bin/env node

// Test script to verify the Scanner works
const { Scanner } = require('./lib/modules/Scanner');

async function testScanner() {
  console.log('Testing Scanner...\n');
  
  try {
    const scanner = new Scanner(process.cwd());
    const result = await scanner.scan();
    
    console.log('✅ Scanner completed successfully!');
    console.log('Detection Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.log('❌ Scanner error:', error.message);
    console.log('Error type:', error.constructor.name);
  }
}

testScanner().catch(console.error);
