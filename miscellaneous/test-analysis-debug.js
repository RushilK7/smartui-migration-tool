#!/usr/bin/env node

// Debug script to test analysis report components
const { AnalysisReporter } = require('./lib/modules/AnalysisReporter');
const { ReportRenderer } = require('./lib/modules/ReportRenderer');

async function testAnalysisComponents() {
  console.log('Testing Analysis Components...\n');
  
  try {
    // Test with a mock detection result
    const mockDetectionResult = {
      platform: 'Percy',
      framework: 'Cypress',
      language: 'JavaScript/TypeScript',
      files: {
        config: ['.percy.yml'],
        source: ['cypress/e2e/visual.cy.js'],
        ci: ['.github/workflows/visual-tests.yml'],
        packageManager: ['package.json']
      }
    };
    
    console.log('📋 Mock Detection Result:');
    console.log(JSON.stringify(mockDetectionResult, null, 2));
    
    // Test AnalysisReporter
    console.log('\n🔍 Testing AnalysisReporter...');
    const analysisReporter = new AnalysisReporter('./test-analysis-migration');
    
    console.log('✅ AnalysisReporter instantiated successfully');
    
    // Test ReportRenderer
    console.log('\n🔍 Testing ReportRenderer...');
    
    // Create a mock analysis result
    const mockAnalysisResult = {
      filesToCreate: 1,
      filesToModify: 3,
      snapshotCount: 3,
      warnings: [],
      changes: [
        {
          filePath: '.smartui.json',
          type: 'CREATE',
          description: 'Generated SmartUI configuration from .percy.yml'
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
          filePath: 'cypress/e2e/visual.cy.js',
          type: 'MODIFY',
          description: 'Transform 3 snapshot(s) using JavaScript/TypeScript Code Transformer'
        }
      ]
    };
    
    console.log('📊 Rendering mock analysis result...');
    ReportRenderer.renderAnalysisReport(mockAnalysisResult);
    
    console.log('\n✅ ReportRenderer test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAnalysisComponents().catch(console.error);
