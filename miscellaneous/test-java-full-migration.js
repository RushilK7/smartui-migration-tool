#!/usr/bin/env node

// Test script to verify full migration workflow with Java code transformation
const fs = require('fs').promises;
const path = require('path');

async function createMockJavaProject() {
  const testDir = path.join(__dirname, 'test-java-migration');
  
  try {
    await fs.mkdir(testDir, { recursive: true });
    
    // Create package.json with Java dependencies
    const packageJson = {
      name: 'test-java-migration',
      version: '1.0.0',
      dependencies: {
        'io.percy:percy-selenium': '1.0.0',
        'org.seleniumhq.selenium:selenium-java': '4.0.0'
      }
    };
    
    await fs.writeFile(
      path.join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Create pom.xml for Maven
    const pomXml = `
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <groupId>com.example</groupId>
    <artifactId>visual-tests</artifactId>
    <version>1.0.0</version>
    
    <dependencies>
        <dependency>
            <groupId>io.percy</groupId>
            <artifactId>percy-selenium</artifactId>
            <version>1.0.0</version>
        </dependency>
        <dependency>
            <groupId>org.seleniumhq.selenium</groupId>
            <artifactId>selenium-java</artifactId>
            <version>4.0.0</version>
        </dependency>
    </dependencies>
</project>`;
    
    await fs.writeFile(
      path.join(testDir, 'pom.xml'),
      pomXml
    );
    
    // Create Java test files
    await fs.mkdir(path.join(testDir, 'src', 'test', 'java', 'com', 'example'), { recursive: true });
    
    // Test file 1: Basic Percy Java test
    await fs.writeFile(
      path.join(testDir, 'src', 'test', 'java', 'com', 'example', 'PercyTest.java'),
      `import io.percy.selenium.Percy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

public class PercyTest {
    private WebDriver driver;
    private Percy percy;
    
    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        percy = new Percy(driver);
    }
    
    @Test
    public void testHomepage() {
        driver.get("https://example.com");
        percy.snapshot("Homepage");
    }
    
    @Test
    public void testLogin() {
        driver.get("https://example.com/login");
        percy.snapshot("Login Page");
    }
}`
    );
    
    // Test file 2: Applitools Java test
    await fs.writeFile(
      path.join(testDir, 'src', 'test', 'java', 'com', 'example', 'ApplitoolsTest.java'),
      `import com.applitools.eyes.selenium.Eyes;
import com.applitools.eyes.selenium.Target;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;

public class ApplitoolsTest {
    private WebDriver driver;
    private Eyes eyes;
    
    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        eyes = new Eyes();
    }
    
    @Test
    public void testDashboard() {
        driver.get("https://example.com/dashboard");
        eyes.open(driver, "My App", "Dashboard Test");
        eyes.check(Target.window().fully());
        eyes.closeAsync();
    }
}`
    );
    
    return testDir;
  } catch (error) {
    console.error('Error creating mock Java project:', error);
    return null;
  }
}

async function testFullJavaMigration() {
  console.log('Testing Full Java Migration Workflow...\n');
  
  const testDir = await createMockJavaProject();
  if (!testDir) {
    console.log('❌ Failed to create mock Java project');
    return;
  }
  
  try {
    console.log('📁 Created mock Java project at:', testDir);
    console.log('📄 Files created:');
    console.log('  • package.json (with Java dependencies)');
    console.log('  • pom.xml (Maven configuration)');
    console.log('  • src/test/java/com/example/PercyTest.java (with Percy tests)');
    console.log('  • src/test/java/com/example/ApplitoolsTest.java (with Applitools tests)');
    
    console.log('\n🚀 To test the full migration workflow, run:');
    console.log(`   cd "${testDir}"`);
    console.log('   node ../bin/run migrate --yes');
    console.log('\n   Or for interactive mode:');
    console.log('   node ../bin/run migrate');
    
    console.log('\n📋 Expected behavior:');
    console.log('  1. ✅ Welcome screen displayed');
    console.log('  2. ✅ Project scanning (detects Java + Selenium)');
    console.log('  3. ✅ Configuration transformation (Java → SmartUI)');
    console.log('  4. ✅ Code transformation (Java method calls → SmartUI)');
    console.log('  5. ✅ Generated .smartui.json content logged');
    console.log('  6. ✅ Interactive prompt (unless --yes flag used)');
    
    console.log('\n🔍 Expected Code Transformations:');
    console.log('  • Import: io.percy.selenium.Percy → io.github.lambdatest.SmartUISnapshot');
    console.log('  • Import: com.applitools.eyes.selenium.Eyes → io.github.lambdatest.SmartUISnapshot');
    console.log('  • Method: percy.snapshot("name") → SmartUISnapshot.smartuiSnapshot(driver, "name")');
    console.log('  • Method: eyes.check(Target.window()) → SmartUISnapshot.smartuiSnapshot(driver, "Full Page")');
    console.log('  • Removal: eyes.open() and eyes.closeAsync() calls removed');
    
    console.log('\n📊 Expected Results:');
    console.log('  • Total snapshots transformed: 3');
    console.log('  • Files processed: 2 (PercyTest.java, ApplitoolsTest.java)');
    console.log('  • Warnings: 0 (all transformations supported)');
    
  } catch (error) {
    console.log('❌ Error:', error.message);
  } finally {
    console.log('\n📁 Test project created at:', testDir);
    console.log('🧹 Clean up manually when done: rm -rf', testDir);
  }
}

testFullJavaMigration().catch(console.error);
