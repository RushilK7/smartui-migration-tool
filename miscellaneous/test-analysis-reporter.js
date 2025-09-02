#!/usr/bin/env node

// Debug script to test AnalysisReporter with actual files
const { AnalysisReporter } = require('./lib/modules/AnalysisReporter');

async function testAnalysisReporter() {
  console.log('Testing AnalysisReporter with actual files...\n');
  
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
    
    console.log('\n🔍 Running analysis...');
    const analysisResult = await analysisReporter.analyze(mockDetectionResult);
    
    console.log('\n📊 Analysis Result:');
    console.log('Files to create:', analysisResult.filesToCreate);
    console.log('Files to modify:', analysisResult.filesToModify);
    console.log('Snapshot count:', analysisResult.snapshotCount);
    console.log('Warnings:', analysisResult.warnings.length);
    console.log('Changes:', analysisResult.changes.length);
    
    console.log('\n📋 Changes:');
    analysisResult.changes.forEach((change, index) => {
      console.log(`${index + 1}. ${change.type}: ${change.filePath} - ${change.description}`);
    });
    
    if (analysisResult.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      analysisResult.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    console.log('\n✅ AnalysisReporter test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAnalysisReporter().catch(console.error);
