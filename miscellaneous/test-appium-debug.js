#!/usr/bin/env node

// Debug script to test Appium components
const { PythonCodeTransformer } = require('./lib/modules/PythonCodeTransformer');
const { JavaCodeTransformer } = require('./lib/modules/JavaCodeTransformer');
const { ExecutionTransformer } = require('./lib/modules/ExecutionTransformer');
const { Scanner } = require('./lib/modules/Scanner');

async function testAppiumComponents() {
  console.log('Testing Appium Components...\n');
  
  try {
    // Test Python Appium transformation
    console.log('🔍 Testing Python Appium Transformation...');
    const pythonTransformer = new PythonCodeTransformer('./test-appium-migration');
    
    const pythonTestCode = `import pytest
from appium import webdriver
from percy import percy_screenshot

def test_login_screen():
    driver = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
    
    # Switch to native context for hybrid app
    driver.switch_to.context('NATIVE_APP')
    
    # Take Percy screenshot with Appium-specific options
    percy_screenshot(driver, 'Login Screen', 
                    device_name='iPhone 12',
                    orientation='portrait',
                    full_screen=True,
                    ignore_region_appium_elements=[driver.find_element('id', 'status-bar')])
    
    # Switch back to web context
    driver.switch_to.context('WEBVIEW_1')
`;
    
    console.log('📄 Original Python code:');
    console.log(pythonTestCode);
    
    const pythonResult = pythonTransformer.transform(pythonTestCode, 'test_mobile_app.py', 'Percy');
    
    console.log('\n📄 Transformed Python code:');
    console.log(pythonResult.content);
    
    console.log('\n📊 Python Transformation Result:');
    console.log('Warnings:', pythonResult.warnings.length);
    console.log('Snapshots:', pythonResult.snapshotCount);
    
    if (pythonResult.warnings.length > 0) {
      console.log('\n⚠️  Python Warnings:');
      pythonResult.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    // Test Java Appium transformation
    console.log('\n🔍 Testing Java Appium Transformation...');
    const javaTransformer = new JavaCodeTransformer('./test-appium-migration');
    
    const javaTestCode = `import io.appium.java_client.AppiumDriver;
import io.percy.selenium.Percy;

public class MobileAppTest {
    private AppiumDriver<MobileElement> driver;
    private Percy percy;
    
    @Test
    public void testLoginScreen() {
        // Switch to native context for hybrid app
        driver.context("NATIVE_APP");
        
        // Take Percy screenshot with Appium-specific options
        Map<String, Object> options = new HashMap<>();
        options.put("deviceName", "iPhone 12");
        options.put("orientation", "portrait");
        options.put("fullScreen", true);
        
        percy.screenshot("Login Screen", options);
        
        // Switch back to web context
        driver.context("WEBVIEW_1");
    }
}`;
    
    console.log('📄 Original Java code:');
    console.log(javaTestCode);
    
    const javaResult = javaTransformer.transform(javaTestCode, 'Percy');
    
    console.log('\n📄 Transformed Java code:');
    console.log(javaResult.content);
    
    console.log('\n📊 Java Transformation Result:');
    console.log('Warnings:', javaResult.warnings.length);
    console.log('Snapshots:', javaResult.snapshotCount);
    
    if (javaResult.warnings.length > 0) {
      console.log('\n⚠️  Java Warnings:');
      javaResult.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    // Test Execution Transformer
    console.log('\n🔍 Testing Execution Transformer...');
    const executionTransformer = new ExecutionTransformer('./test-appium-migration');
    
    const packageJsonContent = `{
  "scripts": {
    "test:visual": "percy app:exec -- pytest test_mobile_app.py",
    "test:visual:ci": "percy app:exec -- pytest test_mobile_app.py --parallel=2"
  }
}`;
    
    console.log('📄 Original package.json scripts:');
    const originalPackage = JSON.parse(packageJsonContent);
    console.log(JSON.stringify(originalPackage.scripts, null, 2));
    
    const executionResult = executionTransformer.transformPackageJson(packageJsonContent, 'Percy');
    
    console.log('\n📄 Transformed package.json scripts:');
    const transformedPackage = JSON.parse(executionResult.content);
    console.log(JSON.stringify(transformedPackage.scripts, null, 2));
    
    console.log('\n📊 Execution Transformation Result:');
    console.log('Warnings:', executionResult.warnings.length);
    
    if (executionResult.warnings.length > 0) {
      console.log('\n⚠️  Execution Warnings:');
      executionResult.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.message}`);
        if (warning.details) {
          console.log(`   ${warning.details}`);
        }
      });
    }
    
    // Test Scanner
    console.log('\n🔍 Testing Scanner...');
    const scanner = new Scanner('./test-appium-migration');
    
    console.log('✅ Scanner instantiated successfully');
    
    console.log('\n✅ Appium components test completed successfully');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testAppiumComponents().catch(console.error);
