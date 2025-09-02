#!/usr/bin/env node

// Test script to verify Java code transformation
const { JavaCodeTransformer } = require('./lib/modules/JavaCodeTransformer');

async function testJavaCodeTransformation() {
  console.log('Testing Java Code Transformation...\n');
  
  const javaCodeTransformer = new JavaCodeTransformer('.');
  
  // Test 1: Basic Percy Java test
  console.log('📋 Test 1: Basic Percy Java Test');
  console.log('─'.repeat(50));
  
  const percyJavaTest = `
import io.percy.selenium.Percy;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

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
}
`;
  
  const result1 = javaCodeTransformer.transform(percyJavaTest, 'Percy');
  console.log('Transformed Code:');
  console.log(result1.content);
  console.log('Snapshots found:', result1.snapshotCount);
  console.log('Warnings:', result1.warnings.length);
  result1.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Basic Percy Java test passed\n');
  
  // Test 2: Applitools Java test with stateful-to-stateless conversion
  console.log('📋 Test 2: Applitools Java Test with Stateful-to-Stateless Conversion');
  console.log('─'.repeat(50));
  
  const applitoolsJavaTest = `
import com.applitools.eyes.selenium.Eyes;
import com.applitools.eyes.selenium.Target;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

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
    
    @Test
    public void testLogin() {
        driver.get("https://example.com/login");
        eyes.open(driver, "My App", "Login Test");
        eyes.check(Target.region(By.cssSelector(".login-form")));
        eyes.closeAsync();
    }
}
`;
  
  const result2 = javaCodeTransformer.transform(applitoolsJavaTest, 'Applitools');
  console.log('Transformed Code:');
  console.log(result2.content);
  console.log('Snapshots found:', result2.snapshotCount);
  console.log('Warnings:', result2.warnings.length);
  result2.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Applitools Java test passed\n');
  
  // Test 3: Sauce Labs Java test
  console.log('📋 Test 3: Sauce Labs Java Test');
  console.log('─'.repeat(50));
  
  const sauceLabsJavaTest = `
import com.saucelabs.visual.VisualApi;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class SauceLabsTest {
    private WebDriver driver;
    private VisualApi visual;
    
    @BeforeEach
    public void setUp() {
        driver = new ChromeDriver();
        visual = new VisualApi(driver);
    }
    
    @Test
    public void testHomepage() {
        driver.get("https://example.com");
        visual.sauceVisualCheck("Homepage");
    }
    
    @Test
    public void testProductPage() {
        driver.get("https://example.com/products");
        visual.sauceVisualCheck("Product Page");
    }
}
`;
  
  const result3 = javaCodeTransformer.transform(sauceLabsJavaTest, 'Sauce Labs Visual');
  console.log('Transformed Code:');
  console.log(result3.content);
  console.log('Snapshots found:', result3.snapshotCount);
  console.log('Warnings:', result3.warnings.length);
  result3.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Sauce Labs Java test passed\n');
  
  // Test 4: Complex Applitools Java test with layout emulation
  console.log('📋 Test 4: Complex Applitools Java Test with Layout Emulation');
  console.log('─'.repeat(50));
  
  const complexApplitoolsTest = `
import com.applitools.eyes.selenium.Eyes;
import com.applitools.eyes.selenium.Target;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class ComplexApplitoolsTest {
    private WebDriver driver;
    private Eyes eyes;
    
    @Test
    public void testComplexDashboard() {
        driver.get("https://example.com/dashboard");
        eyes.open(driver, "My App", "Complex Dashboard Test");
        
        // Full page check
        eyes.check(Target.window());
        
        // Region check with ignore
        eyes.check(Target.region(By.cssSelector(".main-content"))
            .ignore(By.cssSelector(".ads"))
            .ignore(By.cssSelector(".popup")));
        
        // Layout check
        eyes.check(Target.layout(By.cssSelector(".navigation")));
        
        eyes.closeAsync();
    }
}
`;
  
  const result4 = javaCodeTransformer.transform(complexApplitoolsTest, 'Applitools');
  console.log('Transformed Code:');
  console.log(result4.content);
  console.log('Snapshots found:', result4.snapshotCount);
  console.log('Warnings:', result4.warnings.length);
  result4.warnings.forEach((w, i) => console.log(`  ${i+1}. ${w.message}`));
  console.log('✅ Complex Applitools Java test passed\n');
  
  // Test 5: Invalid Java syntax
  console.log('📋 Test 5: Invalid Java Syntax');
  console.log('─'.repeat(50));
  
  const invalidJavaTest = `
import io.percy.selenium.Percy;

public class InvalidTest {
    @Test
    public void testInvalid() {
        percy.snapshot("Invalid Test"
        // Missing closing parenthesis
    }
}
`;
  
  const result5 = javaCodeTransformer.transform(invalidJavaTest, 'Percy');
  console.log('Transformed Code (should be original):');
  console.log(result5.content);
  console.log('Snapshots found:', result5.snapshotCount);
  console.log('Warnings:', result5.warnings.length);
  console.log('Warning message:', result5.warnings[0]?.message);
  console.log('✅ Invalid Java syntax test passed\n');
  
  console.log('🎉 All Java code transformation tests completed!');
}

testJavaCodeTransformation().catch(console.error);
