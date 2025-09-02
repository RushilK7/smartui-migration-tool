#!/usr/bin/env node

// Debug script to test Storybook components
const { StorybookTransformer } = require('./lib/modules/StorybookTransformer');
const { Scanner } = require('./lib/modules/Scanner');

async function testStorybookComponents() {
  console.log('Testing Storybook Components...\n');
  
  try {
    // Test StorybookTransformer
    console.log('🔍 Testing StorybookTransformer...');
    const storybookTransformer = new StorybookTransformer('./test-storybook-migration');
    
    // Test package.json script transformation
    const packageJsonContent = `{
  "name": "test-storybook-migration",
  "version": "1.0.0",
  "scripts": {
    "storybook": "start-storybook -p 6006",
    "build-storybook": "build-storybook",
    "test:visual": "percy storybook --build-dir=storybook-static",
    "test:visual:ci": "percy storybook --build-dir=storybook-static --parallel=3"
  }
}`;
    
    console.log('📄 Original package.json scripts:');
    const originalPackage = JSON.parse(packageJsonContent);
    console.log(JSON.stringify(originalPackage.scripts, null, 2));
    
    const result = storybookTransformer.transformPackageJsonScripts(packageJsonContent, 'Percy');
    
    console.log('\n📄 Transformed package.json scripts:');
    const transformedPackage = JSON.parse(result.content);
    console.log(JSON.stringify(transformedPackage.scripts, null, 2));
    
    console.log('\n📊 Transformation Result:');
    console.log('Warnings:', result.warnings.length);
    console.log('Script count:', storybookTransformer.countStorybookScripts(packageJsonContent, 'Percy'));
    
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    // Test configuration analysis
    console.log('\n🔍 Testing configuration analysis...');
    const configAnalysis = await storybookTransformer.analyzeStorybookConfigurations('Percy');
    console.log('Configuration changes:', configAnalysis.changes.length);
    console.log('Configuration warnings:', configAnalysis.warnings.length);
    
    if (configAnalysis.changes.length > 0) {
      console.log('\n📋 Configuration Changes:');
      configAnalysis.changes.forEach((change, index) => {
        console.log(`${index + 1}. ${change.type}: ${change.filePath} - ${change.description}`);
      });
    }
    
    // Test Scanner
    console.log('\n🔍 Testing Scanner...');
    const scanner = new Scanner('./test-storybook-migration');
    
    console.log('✅ Scanner instantiated successfully');
    
    console.log('\n✅ Storybook components test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testStorybookComponents().catch(console.error);
