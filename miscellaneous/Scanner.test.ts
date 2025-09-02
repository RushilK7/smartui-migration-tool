import mockFs from 'mock-fs';
import { Scanner } from '../src/modules/Scanner';
import { DetectionResult } from '../src/types';

describe('Scanner', () => {
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();
  });

  afterEach(() => {
    mockFs.restore();
  });

  describe('Percy Projects', () => {
    it('should detect Percy Cypress JavaScript project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@percy/cypress': '^1.0.0',
            'cypress': '^10.0.0'
          }
        }),
        'cypress.config.js': 'module.exports = { e2e: { baseUrl: "http://localhost:3000" } };',
        'cypress/e2e/test.cy.js': 'describe("Test", () => { it("should work", () => { cy.percySnapshot("test"); }); });'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['cypress.config.js'],
          source: ['cypress/e2e/test.cy.js'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });

    it('should detect Percy Playwright TypeScript project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@percy/playwright': '^1.0.0',
            '@playwright/test': '^1.0.0'
          }
        }),
        'playwright.config.ts': 'import { defineConfig } from "@playwright/test"; export default defineConfig({});',
        'tests/test.spec.ts': 'import { test } from "@playwright/test"; test("test", async ({ page }) => { await page.percySnapshot("test"); });'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Playwright',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['playwright.config.ts'],
          source: ['tests/test.spec.ts'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });

    it('should detect Percy Selenium Java project', async () => {
      mockFs({
        'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
          <project>
            <dependencies>
              <dependency>
                <groupId>io.percy</groupId>
                <artifactId>percy-java-selenium</artifactId>
                <version>1.0.0</version>
              </dependency>
              <dependency>
                <groupId>org.seleniumhq.selenium</groupId>
                <artifactId>selenium-java</artifactId>
                <version>4.0.0</version>
              </dependency>
            </dependencies>
          </project>`,
        'src/test/java/Test.java': 'public class Test { @Test public void test() { percy.screenshot("test"); } }'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Selenium',
        language: 'Java',
        testType: 'e2e',
        files: {
          config: [],
          source: ['src/test/java/Test.java'],
          ci: [],
          packageManager: ['pom.xml']
        }
      });
    });

    it('should detect Percy Python project', async () => {
      mockFs({
        'requirements.txt': 'percy-selenium==1.0.0\nselenium==4.0.0',
        'test_percy.py': 'from percy import percy; percy.screenshot(driver, "test")'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Selenium',
        language: 'Python',
        testType: 'e2e',
        files: {
          config: [],
          source: ['test_percy.py'],
          ci: [],
          packageManager: ['requirements.txt']
        }
      });
    });
  });

  describe('Applitools Projects', () => {
    it('should detect Applitools Cypress project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@applitools/eyes-cypress': '^1.0.0',
            'cypress': '^10.0.0'
          }
        }),
        'cypress.config.js': 'module.exports = { e2e: { baseUrl: "http://localhost:3000" } };',
        'cypress/e2e/test.cy.js': 'describe("Test", () => { it("should work", () => { cy.eyesOpen(); cy.eyesCheckWindow("test"); }); });'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Applitools',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['cypress.config.js'],
          source: ['cypress/e2e/test.cy.js'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });

    it('should detect Applitools Java project', async () => {
      mockFs({
        'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
          <project>
            <dependencies>
              <dependency>
                <groupId>com.applitools</groupId>
                <artifactId>eyes-selenium-java5</artifactId>
                <version>5.0.0</version>
              </dependency>
              <dependency>
                <groupId>org.seleniumhq.selenium</groupId>
                <artifactId>selenium-java</artifactId>
                <version>4.0.0</version>
              </dependency>
            </dependencies>
          </project>`,
        'src/test/java/Test.java': 'public class Test { @Test public void test() { eyes.open(driver, "test", "test"); } }'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Applitools',
        framework: 'Selenium',
        language: 'Java',
        testType: 'e2e',
        files: {
          config: [],
          source: ['src/test/java/Test.java'],
          ci: [],
          packageManager: ['pom.xml']
        }
      });
    });
  });

  describe('Sauce Labs Projects', () => {
    it('should detect Sauce Labs Visual project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            'screener-runner': '^1.0.0',
            'cypress': '^10.0.0'
          }
        }),
        'cypress.config.js': 'module.exports = { e2e: { baseUrl: "http://localhost:3000" } };',
        'cypress/e2e/test.cy.js': 'describe("Test", () => { it("should work", () => { cy.screenerStep("test"); }); });'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Sauce Labs Visual',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['cypress.config.js'],
          source: ['cypress/e2e/test.cy.js'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });
  });

  describe('Storybook Projects', () => {
    it('should detect Percy Storybook project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@percy/storybook': '^1.0.0',
            '@storybook/react': '^6.0.0'
          }
        }),
        '.storybook/main.js': 'module.exports = { stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"] };',
        'src/components/Button.stories.js': 'export default { title: "Button" };'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Storybook',
        language: 'JavaScript/TypeScript',
        testType: 'storybook',
        files: {
          config: ['.storybook/main.js'],
          source: ['src/components/Button.stories.js'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });

    it('should detect Applitools Storybook project', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@applitools/eyes-storybook': '^1.0.0',
            '@storybook/react': '^6.0.0'
          }
        }),
        '.storybook/main.js': 'module.exports = { stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"] };',
        'src/components/Button.stories.js': 'export default { title: "Button" };'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Applitools',
        framework: 'Storybook',
        language: 'JavaScript/TypeScript',
        testType: 'storybook',
        files: {
          config: ['.storybook/main.js'],
          source: ['src/components/Button.stories.js'],
          ci: [],
          packageManager: ['package.json']
        }
      });
    });
  });

  describe('Appium Projects', () => {
    it('should detect Percy Appium Python project', async () => {
      mockFs({
        'requirements.txt': 'Appium-Python-Client==1.0.0\npercy-appium-app==1.0.0',
        'test_mobile.py': 'from percy import percy; percy_screenshot(driver, "test")'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Percy',
        framework: 'Appium',
        language: 'Python',
        testType: 'appium',
        files: {
          config: [],
          source: ['test_mobile.py'],
          ci: [],
          packageManager: ['requirements.txt']
        }
      });
    });

    it('should detect Applitools Appium Java project', async () => {
      mockFs({
        'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
          <project>
            <dependencies>
              <dependency>
                <groupId>io.appium</groupId>
                <artifactId>java-client</artifactId>
                <version>8.0.0</version>
              </dependency>
              <dependency>
                <groupId>com.applitools</groupId>
                <artifactId>eyes-appium-java5</artifactId>
                <version>5.0.0</version>
              </dependency>
            </dependencies>
          </project>`,
        'src/test/java/MobileTest.java': 'public class MobileTest { @Test public void test() { eyes.open(driver, "test", "test"); } }'
      });

      const result = await scanner.scan('/test-project');
      
      expect(result).toEqual({
        platform: 'Applitools',
        framework: 'Appium',
        language: 'Java',
        testType: 'appium',
        files: {
          config: [],
          source: ['src/test/java/MobileTest.java'],
          ci: [],
          packageManager: ['pom.xml']
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle empty project directory', async () => {
      mockFs({});

      await expect(scanner.scan('/empty-project')).rejects.toThrow('No visual testing platform detected');
    });

    it('should handle invalid package.json', async () => {
      mockFs({
        'package.json': 'invalid json'
      });

      await expect(scanner.scan('/invalid-project')).rejects.toThrow('Failed to parse package.json');
    });

    it('should handle invalid pom.xml', async () => {
      mockFs({
        'pom.xml': 'invalid xml'
      });

      await expect(scanner.scan('/invalid-project')).rejects.toThrow('Failed to parse pom.xml');
    });

    it('should handle multiple platforms detected', async () => {
      mockFs({
        'package.json': JSON.stringify({
          dependencies: {
            '@percy/cypress': '^1.0.0',
            '@applitools/eyes-cypress': '^1.0.0'
          }
        })
      });

      await expect(scanner.scan('/multiple-platforms')).rejects.toThrow('Multiple visual testing platforms detected');
    });
  });
});
