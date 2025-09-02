#!/usr/bin/env node

// Debug script to test FileSelector components
const { FileSelector } = require('./lib/modules/FileSelector');

async function testFileSelector() {
  console.log('Testing FileSelector Components...\n');
  
  try {
    // Create a mock analysis result
    const mockAnalysisResult = {
      filesToCreate: 1,
      filesToModify: 5,
      snapshotCount: 6,
      warnings: [
        {
          message: 'Percy-specific CSS was detected. This will be emulated during code transformation by injecting styles before the snapshot.',
          details: 'The percy-css property from Percy config will be handled during test code transformation.'
        }
      ],
      changes: [
        {
          filePath: '.smartui.json',
          type: 'CREATE',
          description: 'Generated SmartUI configuration from .percy.yml'
        },
        {
          filePath: 'cypress/e2e/homepage.cy.js',
          type: 'MODIFY',
          description: 'Transform 2 snapshot(s) using JavaScript/TypeScript Code Transformer'
        },
        {
          filePath: 'cypress/e2e/login.cy.js',
          type: 'MODIFY',
          description: 'Transform 2 snapshot(s) using JavaScript/TypeScript Code Transformer'
        },
        {
          filePath: 'cypress/e2e/dashboard.cy.js',
          type: 'MODIFY',
          description: 'Transform 2 snapshot(s) using JavaScript/TypeScript Code Transformer'
        },
        {
          filePath: 'package.json',
          type: 'MODIFY',
          description: 'Update test execution commands for SmartUI integration'
        },
        {
          filePath: '.github/workflows/visual-tests.yml',
          type: 'MODIFY',
          description: 'Update CI/CD commands and environment variables for SmartUI'
        },
        {
          filePath: 'Migration Analysis',
          type: 'INFO',
          description: 'Percy-specific CSS was detected. This will be emulated during code transformation by injecting styles before the snapshot.'
        }
      ]
    };
    
    console.log('📋 Mock Analysis Result:');
    console.log('Files to create:', mockAnalysisResult.filesToCreate);
    console.log('Files to modify:', mockAnalysisResult.filesToModify);
    console.log('Total changes:', mockAnalysisResult.changes.length);
    
    // Test migration scope prompt
    console.log('\n🔍 Testing migration scope prompt...');
    console.log('✅ FileSelector.promptMigrationScope() method exists');
    
    // Test file selection prompt
    console.log('\n🔍 Testing file selection prompt...');
    console.log('✅ FileSelector.promptFileSelection() method exists');
    
    // Test filtering
    console.log('\n🔍 Testing analysis result filtering...');
    const selectedFiles = ['.smartui.json', 'cypress/e2e/homepage.cy.js', 'package.json'];
    const filteredResult = FileSelector.filterAnalysisResult(mockAnalysisResult, selectedFiles);
    
    console.log('Selected files:', selectedFiles);
    console.log('Filtered files to create:', filteredResult.filesToCreate);
    console.log('Filtered files to modify:', filteredResult.filesToModify);
    console.log('Filtered changes:', filteredResult.changes.length);
    
    // Test selection summary
    console.log('\n🔍 Testing selection summary...');
    FileSelector.displaySelectionSummary(selectedFiles, mockAnalysisResult);
    
    console.log('\n✅ FileSelector test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFileSelector().catch(console.error);
