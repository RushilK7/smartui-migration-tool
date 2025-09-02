#!/usr/bin/env node

// Test script to verify Appium migration functionality
const fs = require('fs').promises;
const path = require('path');

async function createMockAppiumProject() {
  const testDir = path.join(__dirname, 'test-appium-migration');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create requirements.txt for Python Appium project
    const requirementsContent = `Appium-Python-Client==2.11.1
percy-appium-app==1.0.0
selenium==4.15.0
pytest==7.4.0
`;
    
    await fs.writeFile(
      path.join(testDir, 'requirements.txt'),
      requirementsContent
    );
    
    // Create test file with Percy Appium commands
    const testFileContent = `import pytest
from appium import webdriver
from percy import percy_screenshot

class TestMobileApp:
    def setup_method(self):
        desired_caps = {
            'deviceName': 'iPhone 12',
            'platformName': 'iOS',
            'platformVersion': '15.0',
            'app': '/path/to/app.app'
        }
        self.driver = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
    
    def teardown_method(self):
        self.driver.quit()
    
    def test_login_screen(self):
        # Switch to native context for hybrid app
        self.driver.switch_to.context('NATIVE_APP')
        
        # Take Percy screenshot with Appium-specific options
        percy_screenshot(self.driver, 'Login Screen', 
                        device_name='iPhone 12',
                        orientation='portrait',
                        full_screen=True,
                        ignore_region_appium_elements=[self.driver.find_element('id', 'status-bar')])
        
        # Switch back to web context
        self.driver.switch_to.context('WEBVIEW_1')
    
    def test_dashboard_screen(self):
        # Navigate to dashboard
        self.driver.find_element('id', 'login-button').click()
        
        # Take screenshot with minimal options
        percy_screenshot(self.driver, 'Dashboard Screen')
`;
    
    await fs.writeFile(
      path.join(testDir, 'test_mobile_app.py'),
      testFileContent
    );
    
    // Create pom.xml for Java Appium project
    const pomXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>appium-tests</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <dependency>
            <groupId>io.appium</groupId>
            <artifactId>appium-java-client</artifactId>
            <version>8.5.1</version>
        </dependency>
        <dependency>
            <groupId>io.percy</groupId>
            <artifactId>percy-appium-java</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.testng</groupId>
            <artifactId>testng</artifactId>
            <version>7.7.0</version>
        </dependency>
    </dependencies>
</project>`;
    
    await fs.writeFile(
      path.join(testDir, 'pom.xml'),
      pomXmlContent
    );
    
    // Create Java test file
    const javaTestContent = `import io.appium.java_client.AppiumDriver;
import io.appium.java_client.MobileElement;
import io.percy.selenium.Percy;
import org.testng.annotations.*;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class MobileAppTest {
    private AppiumDriver<MobileElement> driver;
    private Percy percy;
    
    @BeforeMethod
    public void setUp() throws MalformedURLException {
        Map<String, Object> caps = new HashMap<>();
        caps.put("deviceName", "iPhone 12");
        caps.put("platformName", "iOS");
        caps.put("platformVersion", "15.0");
        caps.put("app", "/path/to/app.app");
        
        driver = new AppiumDriver<>(new URL("http://localhost:4723/wd/hub"), caps);
        percy = new Percy(driver);
    }
    
    @AfterMethod
    public void tearDown() {
        driver.quit();
    }
    
    @Test
    public void testLoginScreen() {
        // Switch to native context for hybrid app
        driver.context("NATIVE_APP");
        
        // Take Percy screenshot with Appium-specific options
        Map<String, Object> options = new HashMap<>();
        options.put("deviceName", "iPhone 12");
        options.put("orientation", "portrait");
        options.put("fullScreen", true);
        options.put("ignoreRegionAppiumElements", new String[]{"status-bar"});
        
        percy.screenshot("Login Screen", options);
        
        // Switch back to web context
        driver.context("WEBVIEW_1");
    }
    
    @Test
    public void testDashboardScreen() {
        // Navigate to dashboard
        driver.findElementById("login-button").click();
        
        // Take screenshot with minimal options
        percy.screenshot("Dashboard Screen");
    }
}`;
    
    await fs.writeFile(
      path.join(testDir, 'MobileAppTest.java'),
      javaTestContent
    );
    
    // Create package.json with Appium execution commands
    const packageJson = {
      name: 'appium-visual-tests',
      version: '1.0.0',
      scripts: {
        'test:python': 'pytest test_mobile_app.py',
        'test:java': 'mvn test',
        'test:visual': 'percy app:exec -- pytest test_mobile_app.py',
        'test:visual:ci': 'percy app:exec -- pytest test_mobile_app.py --parallel=2'
      },
      devDependencies: {
        '@percy/cli': '^1.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Appium project:', error);
    return null;
  }
}

async function testAppiumMigration() {
  console.log('Testing Appium Migration Functionality...\n');
  
  const testDir = await createMockAppiumProject();
  if (!testDir) {
    console.log('❌ Failed to create mock Appium project');
    return;
  }
  
  try {
    console.log('📁 Created mock Appium project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • requirements.txt (Python Appium dependencies)');
    console.log('  • test_mobile_app.py (Python test with Percy Appium commands)');
    console.log('  • pom.xml (Java Appium dependencies)');
    console.log('  • MobileAppTest.java (Java test with Percy Appium commands)');
    console.log('  • package.json (with percy app:exec commands)');
    
    console.log('\n🚀 To test the Appium migration, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected Workflow:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Percy + Appium)');
    console.log('  3. ✅ Analysis report displayed with Appium-specific changes');
    console.log('  4. ✅ Migration scope prompt');
    console.log('  5. ✅ File selection (if subset chosen)');
    console.log('  6. ✅ Appium-specific transformations applied');
    
    console.log('\n🔍 Expected Analysis Report:');
    console.log('  📊 Migration Analysis Report');
    console.log('  ────────────────────────────────────────────────────────────');
    console.log('  📈 Summary:');
    console.log('    • Files to create: 1 (.smartui.json)');
    console.log('    • Files to modify: 3 (package.json, test files)');
    console.log('    • Snapshots to migrate: 3 (percy_screenshot calls)');
    console.log('    • Warnings: 1 (Native context switching preserved)');
    console.log('');
    console.log('  📋 Proposed Changes:');
    console.log('    ┌──────────────────────────────┬────────────┬──────────────────────────────────────────────────┐');
    console.log('    │ File Path                    │ Change Type│ Description                                      │');
    console.log('    ├──────────────────────────────┼────────────┼──────────────────────────────────────────────────┤');
    console.log('    │ .smartui.json                │ CREATE     │ Generated SmartUI configuration                  │');
    console.log('    │ package.json                 │ MODIFY     │ Replace \'percy app:exec\' command with \'npx smartui exec\' │');
    console.log('    │ test_mobile_app.py           │ MODIFY     │ Transform percy_screenshot to smartui.snapshot  │');
    console.log('    │ MobileAppTest.java           │ MODIFY     │ Transform percy.screenshot to SmartUISnapshot.smartuiSnapshot │');
    console.log('    └──────────────────────────────┴────────────┴──────────────────────────────────────────────────┘');
    
    console.log('\n🔍 Expected Transformations:');
    console.log('  • Configuration: Generate .smartui.json');
    console.log('  • Scripts: percy app:exec → npx smartui exec');
    console.log('  • Python: percy_screenshot → smartui.snapshot');
    console.log('  • Java: percy.screenshot → SmartUISnapshot.smartuiSnapshot');
    console.log('  • Options: device_name, orientation, full_screen, ignore_region_appium_elements');
    console.log('  • Context Switching: Preserved driver.switch_to.context(\'NATIVE_APP\')');
    
    console.log('\n📊 Expected Results:');
    console.log('  • Test type: appium (detected correctly)');
    console.log('  • Platform: Percy (detected correctly)');
    console.log('  • Framework: Appium (detected correctly)');
    console.log('  • Language: Python/Java (detected correctly)');
    console.log('  • Files processed: 4 (config, package.json, test files)');
    console.log('  • Snapshots: 3 (2 Python + 1 Java)');
    console.log('  • Warnings: 1 (Native context switching preserved)');
    console.log('  • Appium-specific transformations applied');
    
    console.log('\n🎯 Test Scenarios:');
    console.log('  📋 Scenario 1: Python Appium Project');
    console.log('    • Should detect Appium-Python-Client + percy-appium-app');
    console.log('    • Should transform percy_screenshot → smartui.snapshot');
    console.log('    • Should preserve native context switching');
    console.log('    • Should map Appium-specific options');
    console.log('  📋 Scenario 2: Java Appium Project');
    console.log('    • Should detect appium-java-client + percy-appium-java');
    console.log('    • Should transform percy.screenshot → SmartUISnapshot.smartuiSnapshot');
    console.log('    • Should preserve native context switching');
    console.log('    • Should map Appium-specific options');
    console.log('  📋 Scenario 3: Execution Commands');
    console.log('    • Should transform percy app:exec → npx smartui exec');
    console.log('    • Should handle CI/CD pipeline updates');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testAppiumMigration().catch(console.error);
