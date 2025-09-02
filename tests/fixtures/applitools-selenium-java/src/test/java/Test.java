import com.applitools.eyes.selenium.Eyes;
import com.applitools.eyes.selenium.fluent.Target;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

public class Test {
    private WebDriver driver;
    private Eyes eyes;

    @BeforeMethod
    public void setUp() {
        driver = new ChromeDriver();
        eyes = new Eyes();
        eyes.setApiKey(System.getenv("APPLITOOLS_API_KEY"));
    }

    @AfterMethod
    public void tearDown() {
        if (eyes != null) {
            eyes.close();
        }
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    public void testHomepage() {
        eyes.open(driver, "My App", "Homepage Test");
        driver.get("http://localhost:3000");
        eyes.check("Homepage", Target.window());
        eyes.close();
    }

    @Test
    public void testNavigation() {
        eyes.open(driver, "My App", "Navigation Test");
        driver.get("http://localhost:3000");
        eyes.check("Navigation", Target.window().fully());
        eyes.close();
    }
}
