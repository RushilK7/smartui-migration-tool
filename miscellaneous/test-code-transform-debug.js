#!/usr/bin/env node

// Debug script to test code transformation
const { CodeTransformer } = require('./lib/modules/CodeTransformer');
const fs = require('fs').promises;

async function testCodeTransformation() {
  console.log('Testing Code Transformation...\n');
  
  try {
    const codeTransformer = new CodeTransformer('.');
    
    // Read the Cypress test file
    const testFileContent = await fs.readFile('./test-analysis-migration/cypress/e2e/visual.cy.js', 'utf-8');
    
    console.log('📄 Test file content:');
    console.log(testFileContent);
    console.log('\n' + '─'.repeat(50) + '\n');
    
    // Test Percy transformation
    console.log('🔍 Testing Percy transformation...');
    const result = codeTransformer.transformPercy(testFileContent);
    
    console.log('📊 Transformation Result:');
    console.log('Snapshot count:', result.snapshotCount);
    console.log('Warnings:', result.warnings.length);
    console.log('Content length:', result.content.length);
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    console.log('\n📄 Transformed content:');
    console.log(result.content);
    
    console.log('\n✅ Code transformation test completed');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCodeTransformation().catch(console.error);
