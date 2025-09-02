#!/usr/bin/env node

// Test script to verify Python code transformation
const { PythonCodeTransformer } = require('./lib/modules/PythonCodeTransformer');

async function testPythonCodeTransformation() {
  console.log('Testing Python Code Transformation...\n');
  
  const pythonCodeTransformer = new PythonCodeTransformer('.');
  
  // Test 1: Basic Percy Python test
  console.log('📋 Test 1: Basic Percy Python Test');
  console.log('─'.repeat(50));
  
  const percyPythonTest = `
from percy import Percy
from selenium import webdriver

def test_homepage():
    driver = webdriver.Chrome()
    percy = Percy(driver)
    driver.get("https://example.com")
    percy.snapshot("Homepage")
    driver.quit()

def test_login():
    driver = webdriver.Chrome()
    percy = Percy(driver)
    driver.get("https://example.com/login")
    percy.snapshot("Login Page")
    driver.quit()
`;
  
  const result1 = pythonCodeTransformer.transform(percyPythonTest, 'test_percy.py', 'Percy');
  console.log('Transformed Code:');
  console.log(result1.content);
  console.log('Snapshots found:', result1.snapshotCount);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic Percy Python test passed\n');
  
  // Test 2: Applitools Python test with stateful-to-stateless conversion
  console.log('📋 Test 2: Applitools Python Test with Stateful-to-Stateless Conversion');
  console.log('─'.repeat(50));
  
  const applitoolsPythonTest = `
from applitools.selenium import Eyes
from selenium import webdriver

def test_dashboard():
    driver = webdriver.Chrome()
    eyes = Eyes()
    driver.get("https://example.com/dashboard")
    eyes.open(driver, "My App", "Dashboard Test")
    eyes.check_window()
    eyes.close()
    driver.quit()

def test_login():
    driver = webdriver.Chrome()
    eyes = Eyes()
    driver.get("https://example.com/login")
    eyes.open(driver, "My App", "Login Test")
    eyes.check("Login Form")
    eyes.close()
    driver.quit()
`;
  
  const result2 = pythonCodeTransformer.transform(applitoolsPythonTest, 'test_applitools.py', 'Applitools');
  console.log('Transformed Code:');
  console.log(result2.content);
  console.log('Snapshots found:', result2.snapshotCount);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Applitools Python test passed\n');
  
  // Test 3: Sauce Labs Python test
  console.log('📋 Test 3: Sauce Labs Python Test');
  console.log('─'.repeat(50));
  
  const sauceLabsPythonTest = `
from saucelabs_visual import SauceLabsVisual
from selenium import webdriver

def test_homepage():
    driver = webdriver.Chrome()
    visual = SauceLabsVisual(driver)
    driver.get("https://example.com")
    visual.sauce_visual_check("Homepage")
    driver.quit()

def test_product_page():
    driver = webdriver.Chrome()
    visual = SauceLabsVisual(driver)
    driver.get("https://example.com/products")
    visual.sauce_visual_check("Product Page")
    driver.quit()
`;
  
  const result3 = pythonCodeTransformer.transform(sauceLabsPythonTest, 'test_sauce_labs.py', 'Sauce Labs Visual');
  console.log('Transformed Code:');
  console.log(result3.content);
  console.log('Snapshots found:', result3.snapshotCount);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Sauce Labs Python test passed\n');
  
  // Test 4: Robot Framework test
  console.log('📋 Test 4: Robot Framework Test');
  console.log('─'.repeat(50));
  
  const robotFrameworkTest = `
*** Settings ***
Library    SeleniumLibrary
Library    SauceLabsVisual

*** Test Cases ***
Login Test
    Open Browser    https://example.com/login    chrome
    Create Visual Build    My App    Login Test
    Visual Snapshot    Login Page Snapshot
    Finish Visual Build
    Close Browser

Homepage Test
    Open Browser    https://example.com    chrome
    Create Visual Build    My App    Homepage Test
    Visual Snapshot    Homepage Snapshot
    Finish Visual Build
    Close Browser
`;
  
  const result4 = pythonCodeTransformer.transform(robotFrameworkTest, 'test_robot.robot', 'Sauce Labs Visual');
  console.log('Transformed Code:');
  console.log(result4.content);
  console.log('Snapshots found:', result4.snapshotCount);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Robot Framework test passed\n');
  
  // Test 5: Complex Applitools Python test
  console.log('📋 Test 5: Complex Applitools Python Test');
  console.log('─'.repeat(50));
  
  const complexApplitoolsTest = `
from applitools.selenium import Eyes
from selenium import webdriver

def test_complex_dashboard():
    driver = webdriver.Chrome()
    eyes = Eyes()
    driver.get("https://example.com/dashboard")
    eyes.open(driver, "My App", "Complex Dashboard Test")
    
    # Full page check
    eyes.check_window()
    
    # Region check
    eyes.check_region(driver.find_element_by_css_selector(".main-content"))
    
    # Named check
    eyes.check("Dashboard Overview")
    
    eyes.close()
    driver.quit()
`;
  
  const result5 = pythonCodeTransformer.transform(complexApplitoolsTest, 'test_complex_applitools.py', 'Applitools');
  console.log('Transformed Code:');
  console.log(result5.content);
  console.log('Snapshots found:', result5.snapshotCount);
  console.log('Warnings:', result5.warnings.length);
  result5.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Complex Applitools Python test passed\n');
  
  // Test 6: Unsupported file type
  console.log('📋 Test 6: Unsupported File Type');
  console.log('─'.repeat(50));
  
  const unsupportedTest = `
def test_unsupported():
    print("This is a test file")
`;
  
  const result6 = pythonCodeTransformer.transform(unsupportedTest, 'test_unsupported.txt', 'Percy');
  console.log('Transformed Code (should be original):');
  console.log(result6.content);
  console.log('Snapshots found:', result6.snapshotCount);
  console.log('Warnings:', result6.warnings.length);
  console.log('Warning message:', result6.warnings[0]?.message);
  console.log('✅ Unsupported file type test passed\n');
  
  console.log('🎉 All Python code transformation tests completed!');
}

testPythonCodeTransformation().catch(console.error);
