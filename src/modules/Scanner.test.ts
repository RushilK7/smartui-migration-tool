import mock from 'mock-fs';
import { Scanner } from './Scanner';
import { PlatformNotDetectedError, MultiplePlatformsDetectedError, DetectionResult } from '../types';

describe('Scanner', () => {
  afterEach(() => {
    mock.restore();
  });

  describe('Successful Detection Scenarios', () => {
    it('should correctly detect a Percy/Cypress project', async () => {
      mock({
        '/my-project': {
          'package.json': JSON.stringify({
            name: 'test-project',
            devDependencies: {
              '@percy/cypress': '^3.1.0',
              'cypress': '^12.0.0'
            }
          })
        }
      });

      const scanner = new Scanner('/my-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      expect(result.files.packageManager).toContain('package.json');
    });

    it('should correctly detect an Applitools/Java project', async () => {
      mock({
        '/my-java-project': {
          'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>test-project</artifactId>
  <version>1.0.0</version>
  
  <dependencies>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java5</artifactId>
      <version>5.56.0</version>
    </dependency>
  </dependencies>
</project>`
        }
      });

      const scanner = new Scanner('/my-java-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Java');
      expect(result.testType).toBe('e2e');
      expect(result.files.packageManager).toContain('pom.xml');
    });

    it('should correctly detect a Sauce Labs/Python project', async () => {
      mock({
        '/my-python-project': {
          'requirements.txt': `pytest==7.4.0
selenium==4.15.0
saucelabs_visual==1.0.0
requests==2.31.0`
        }
      });

      const scanner = new Scanner('/my-python-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Python');
      expect(result.testType).toBe('e2e');
      expect(result.files.packageManager).toContain('requirements.txt');
    });

    it('should correctly detect Percy/Playwright project', async () => {
      mock({
        '/my-playwright-project': {
          'package.json': JSON.stringify({
            name: 'playwright-project',
            dependencies: {
              '@percy/playwright': '^1.0.0',
              '@playwright/test': '^1.40.0'
            }
          })
        }
      });

      const scanner = new Scanner('/my-playwright-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Playwright');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });

    it('should correctly detect Percy/Storybook project', async () => {
      mock({
        '/my-storybook-project': {
          'package.json': JSON.stringify({
            name: 'storybook-project',
            devDependencies: {
              '@percy/storybook': '^4.0.0',
              '@storybook/react': '^7.0.0'
            }
          }),
          '.storybook': {
            'main.js': 'module.exports = {};'
          }
        }
      });

      const scanner = new Scanner('/my-storybook-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Storybook');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('storybook');
    });

    it('should correctly detect Applitools/Cypress project', async () => {
      mock({
        '/my-applitools-cypress': {
          'package.json': JSON.stringify({
            name: 'applitools-cypress',
            devDependencies: {
              '@applitools/eyes-cypress': '^3.0.0',
              'cypress': '^12.0.0'
            }
          })
        }
      });

      const scanner = new Scanner('/my-applitools-cypress', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Cypress');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });

    it('should correctly detect Applitools/Playwright project', async () => {
      mock({
        '/my-applitools-playwright': {
          'package.json': JSON.stringify({
            name: 'applitools-playwright',
            dependencies: {
              '@applitools/eyes-playwright': '^1.0.0',
              '@playwright/test': '^1.40.0'
            }
          })
        }
      });

      const scanner = new Scanner('/my-applitools-playwright', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Playwright');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });

    it('should correctly detect Applitools/Storybook project', async () => {
      mock({
        '/my-applitools-storybook': {
          'package.json': JSON.stringify({
            name: 'applitools-storybook',
            devDependencies: {
              '@applitools/eyes-storybook': '^3.0.0',
              '@storybook/react': '^7.0.0'
            }
          }),
          '.storybook': {
            'main.js': 'module.exports = {};'
          }
        }
      });

      const scanner = new Scanner('/my-applitools-storybook', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Storybook');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('storybook');
    });

    it('should correctly detect Sauce Labs/Cypress project', async () => {
      mock({
        '/my-sauce-cypress': {
          'package.json': JSON.stringify({
            name: 'sauce-cypress',
            devDependencies: {
              '@saucelabs/cypress-visual-plugin': '^1.0.0',
              'cypress': '^12.0.0'
            }
          })
        }
      });

      const scanner = new Scanner('/my-sauce-cypress', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.framework).toBe('Cypress');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });

    it('should correctly detect Sauce Labs/Storybook project', async () => {
      mock({
        '/my-sauce-storybook': {
          'package.json': JSON.stringify({
            name: 'sauce-storybook',
            devDependencies: {
              'screener-storybook': '^1.0.0',
              '@storybook/react': '^7.0.0'
            }
          }),
          '.storybook': {
            'main.js': 'module.exports = {};'
          }
        }
      });

      const scanner = new Scanner('/my-sauce-storybook', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.framework).toBe('Storybook');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('storybook');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should throw PlatformNotDetectedError for a generic project', async () => {
      mock({
        '/generic-project': {
          'package.json': JSON.stringify({
            name: 'generic-project',
            dependencies: {
              'react': '^18.0.0',
              'lodash': '^4.17.21'
            }
          })
        }
      });

      const scanner = new Scanner('/generic-project', false);
      
      await expect(scanner.scan()).rejects.toThrow(PlatformNotDetectedError);
    });

    it('should throw PlatformNotDetectedError for empty project', async () => {
      mock({
        '/empty-project': {}
      });

      const scanner = new Scanner('/empty-project', false);
      
      await expect(scanner.scan()).rejects.toThrow(PlatformNotDetectedError);
    });

    it('should throw MultiplePlatformsDetectedError if both Percy and Applitools dependencies exist', async () => {
      mock({
        '/conflicting-project': {
          'package.json': JSON.stringify({
            name: 'conflicting-project',
            dependencies: {
              '@percy/cypress': '^3.1.0',
              '@applitools/eyes-cypress': '^3.0.0'
            }
          })
        }
      });

      const scanner = new Scanner('/conflicting-project', true);
      
      await expect(scanner.scan()).rejects.toThrow(MultiplePlatformsDetectedError);
    });

    it('should throw MultiplePlatformsDetectedError if Percy and Sauce Labs dependencies exist', async () => {
      mock({
        '/conflicting-project-2': {
          'package.json': JSON.stringify({
            name: 'conflicting-project-2',
            devDependencies: {
              '@percy/cypress': '^3.1.0',
              '@saucelabs/cypress-visual-plugin': '^1.0.0'
            }
          })
        }
      });

      const scanner = new Scanner('/conflicting-project-2', false);
      
      await expect(scanner.scan()).rejects.toThrow(MultiplePlatformsDetectedError);
    });

    it('should throw MultiplePlatformsDetectedError if Applitools and Sauce Labs dependencies exist', async () => {
      mock({
        '/conflicting-project-3': {
          'package.json': JSON.stringify({
            name: 'conflicting-project-3',
            dependencies: {
              '@applitools/eyes-playwright': '^1.0.0',
              'screener-storybook': '^1.0.0'
            }
          }),
          '.storybook': {
            'main.js': 'module.exports = {};'
          }
        }
      });

      const scanner = new Scanner('/conflicting-project-3', false);
      
      await expect(scanner.scan()).rejects.toThrow(MultiplePlatformsDetectedError);
    });

    it('should handle malformed package.json gracefully', async () => {
      mock({
        '/malformed-project': {
          'package.json': '{ invalid json content'
        }
      });

      const scanner = new Scanner('/malformed-project', false);
      
      await expect(scanner.scan()).rejects.toThrow(PlatformNotDetectedError);
    });

    it('should handle malformed pom.xml gracefully', async () => {
      mock({
        '/malformed-java-project': {
          'pom.xml': '<?xml version="1.0" encoding="UTF-8"?><project><invalid xml'
        }
      });

      const scanner = new Scanner('/malformed-java-project', false);
      
      await expect(scanner.scan()).rejects.toThrow(PlatformNotDetectedError);
    });
  });

  describe('Configuration File Detection', () => {
    it('should detect Percy configuration files', async () => {
      mock({
        '/percy-config-project': {
          'package.json': JSON.stringify({
            name: 'percy-config-project',
            dependencies: {
              'react': '^18.0.0'
            }
          }),
          '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]',
          '.percyrc': '{"snapshot": {"widths": [1280, 375]}}'
        }
      });

      const scanner = new Scanner('/percy-config-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.files.config).toContain('.percy.yml');
      expect(result.files.config).toContain('.percyrc');
    });

    it('should detect Applitools configuration files', async () => {
      mock({
        '/applitools-config-project': {
          'package.json': JSON.stringify({
            name: 'applitools-config-project',
            dependencies: {
              'react': '^18.0.0'
            }
          }),
          'applitools.config.js': 'module.exports = { apiKey: "test-key" };',
          'applitools.config.json': '{"apiKey": "test-key"}'
        }
      });

      const scanner = new Scanner('/applitools-config-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.files.config).toContain('applitools.config.js');
      expect(result.files.config).toContain('applitools.config.json');
    });

    it('should detect Sauce Labs configuration files', async () => {
      mock({
        '/sauce-config-project': {
          'package.json': JSON.stringify({
            name: 'sauce-config-project',
            dependencies: {
              'react': '^18.0.0'
            }
          }),
          'sauce.config.js': 'module.exports = { username: "test-user" };',
          'sauce.config.json': '{"username": "test-user"}'
        }
      });

      const scanner = new Scanner('/sauce-config-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.files.config).toContain('sauce.config.js');
      expect(result.files.config).toContain('sauce.config.json');
    });
  });

  describe('Verbose Logging', () => {
    it('should work with verbose logging enabled', async () => {
      mock({
        '/verbose-test-project': {
          'package.json': JSON.stringify({
            name: 'verbose-test-project',
            devDependencies: {
              '@percy/cypress': '^3.1.0'
            }
          })
        }
      });

      const scanner = new Scanner('/verbose-test-project', true);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress');
    });
  });

  describe('Edge Cases', () => {
    it('should handle projects with only dependencies (no devDependencies)', async () => {
      mock({
        '/deps-only-project': {
          'package.json': JSON.stringify({
            name: 'deps-only-project',
            dependencies: {
              '@percy/cypress': '^3.1.0'
            }
          })
        }
      });

      const scanner = new Scanner('/deps-only-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress');
    });

    it('should handle projects with both dependencies and devDependencies', async () => {
      mock({
        '/mixed-deps-project': {
          'package.json': JSON.stringify({
            name: 'mixed-deps-project',
            dependencies: {
              '@percy/playwright': '^1.0.0'
            },
            devDependencies: {
              '@percy/cypress': '^3.1.0'
            }
          })
        }
      });

      const scanner = new Scanner('/mixed-deps-project', false);
      
      // This should throw MultiplePlatformsDetectedError because it detects both Percy/Playwright and Percy/Cypress
      await expect(scanner.scan()).rejects.toThrow(MultiplePlatformsDetectedError);
    });

    it('should handle Java projects with multiple Applitools dependencies', async () => {
      mock({
        '/multi-applitools-java': {
          'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>test-project</artifactId>
  <version>1.0.0</version>
  
  <dependencies>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java5</artifactId>
      <version>5.56.0</version>
    </dependency>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java4</artifactId>
      <version>4.0.0</version>
    </dependency>
  </dependencies>
</project>`
        }
      });

      const scanner = new Scanner('/multi-applitools-java', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Java');
    });

    it('should handle Python projects with multiple Sauce Labs dependencies', async () => {
      mock({
        '/multi-sauce-python': {
          'requirements.txt': `pytest==7.4.0
selenium==4.15.0
saucelabs_visual==1.0.0
saucelabs_selenium==1.0.0
requests==2.31.0`
        }
      });

      const scanner = new Scanner('/multi-sauce-python', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Python');
    });
  });

  describe('Anchor and Search Strategy - Non-Standard Directory Structure', () => {
    it('should detect Percy project with test files in non-standard directory structure', async () => {
      mock({
        '/custom-structure-project': {
          'package.json': JSON.stringify({
            name: 'custom-structure-project',
            dependencies: {
              '@percy/cypress': '^3.1.0'
            }
          }),
          'src': {
            'qa': {
              'specs': {
                'login-visuals.js': `describe('Login Visual Tests', () => {
                  it('should capture login page', () => {
                    cy.visit('/login');
                    percySnapshot('Login Page');
                  });
                });`
              }
            }
          },
          'tests': {
            'e2e': {
              'visual-checks.js': `describe('Visual Regression Tests', () => {
                it('should capture dashboard', () => {
                  cy.visit('/dashboard');
                  percySnapshot('Dashboard View');
                });
              });`
            }
          }
        }
      });

      const scanner = new Scanner('/custom-structure-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      
      // Should find source files in non-standard locations
      expect(result.files.source).toContain('src/qa/specs/login-visuals.js');
      expect(result.files.source).toContain('tests/e2e/visual-checks.js');
      expect(result.files.packageManager).toContain('package.json');
    });

    it('should detect Applitools project with Java files in custom test structure', async () => {
      mock({
        '/custom-java-project': {
          'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>custom-java-project</artifactId>
  <version>1.0.0</version>
  
  <dependencies>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java5</artifactId>
      <version>5.56.0</version>
    </dependency>
  </dependencies>
</project>`,
          'src': {
            'test': {
              'java': {
                'com': {
                  'example': {
                    'visual': {
                      'LoginVisualTest.java': `package com.example.visual;

import com.applitools.eyes.selenium.Eyes;
import org.junit.Test;

public class LoginVisualTest {
    @Test
    public void testLoginPage() {
        Eyes eyes = new Eyes();
        eyes.open(driver, "Login Test", "Login Page");
        eyes.checkWindow("Login Page");
        eyes.close();
    }
}`,
                      'DashboardVisualTest.java': `package com.example.visual;

import com.applitools.eyes.selenium.Eyes;
import org.junit.Test;

public class DashboardVisualTest {
    @Test
    public void testDashboard() {
        Eyes eyes = new Eyes();
        eyes.open(driver, "Dashboard Test", "Dashboard Page");
        eyes.checkWindow("Dashboard View");
        eyes.close();
    }
}`
                    }
                  }
                }
              }
            }
          }
        }
      });

      const scanner = new Scanner('/custom-java-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Java');
      expect(result.testType).toBe('e2e');
      
      // Should find Java test files in custom structure
      expect(result.files.source).toContain('src/test/java/com/example/visual/LoginVisualTest.java');
      expect(result.files.source).toContain('src/test/java/com/example/visual/DashboardVisualTest.java');
      expect(result.files.packageManager).toContain('pom.xml');
    });

    it('should detect Sauce Labs Python project with custom test organization', async () => {
      mock({
        '/custom-python-project': {
          'requirements.txt': `pytest==7.4.0
selenium==4.15.0
saucelabs_visual==1.0.0
requests==2.31.0`,
          'tests': {
            'visual': {
              'login_tests.py': `import pytest
from saucelabs_visual import SauceVisual

def test_login_page():
    visual = SauceVisual()
    visual.check_page("Login Page")
    visual.snapshot("login_screen")`,
              'dashboard_tests.py': `import pytest
from saucelabs_visual import SauceVisual

def test_dashboard():
    visual = SauceVisual()
    visual.check_page("Dashboard")
    visual.snapshot("dashboard_view")`
            }
          },
          'qa': {
            'regression': {
              'visual_checks.py': `import pytest
from saucelabs_visual import SauceVisual

def test_homepage():
    visual = SauceVisual()
    visual.check_page("Homepage")
    visual.snapshot("homepage_layout")`
            }
          }
        }
      });

      const scanner = new Scanner('/custom-python-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Sauce Labs Visual');
      expect(result.framework).toBe('Selenium');
      expect(result.language).toBe('Python');
      expect(result.testType).toBe('e2e');
      
      // Should find Python test files in custom structure
      expect(result.files.source).toContain('tests/visual/login_tests.py');
      expect(result.files.source).toContain('tests/visual/dashboard_tests.py');
      expect(result.files.source).toContain('qa/regression/visual_checks.py');
      expect(result.files.packageManager).toContain('requirements.txt');
    });

    it('should perform cold search when no anchor is found but magic strings exist in code', async () => {
      mock({
        '/cold-search-project': {
          'package.json': JSON.stringify({
            name: 'cold-search-project',
            dependencies: {
              'react': '^18.0.0',
              'lodash': '^4.17.21'
            }
          }),
          'src': {
            'components': {
              'visual-tests.js': `// Custom visual testing without standard dependencies
function captureLoginPage() {
  // Using Percy directly without @percy/cypress
  percySnapshot('Login Page');
}

function captureDashboard() {
  percySnapshot('Dashboard View');
}`
            }
          }
        }
      });

      const scanner = new Scanner('/cold-search-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Selenium'); // Default when no specific framework detected
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      
      // Should find source files through cold search
      expect(result.files.source).toContain('src/components/visual-tests.js');
      expect(result.files.packageManager).toContain('package.json');
    });

    it('should handle mixed file types in custom directory structure', async () => {
      mock({
        '/mixed-structure-project': {
          'package.json': JSON.stringify({
            name: 'mixed-structure-project',
            dependencies: {
              '@percy/cypress': '^3.1.0'
            }
          }),
          'app': {
            'tests': {
              'visual': {
                'login.spec.ts': `describe('Login Visual Tests', () => {
                  it('should capture login page', () => {
                    cy.visit('/login');
                    percySnapshot('Login Page');
                  });
                });`
              }
            }
          },
          'lib': {
            'test-utils': {
              'visual-helpers.js': `// Visual testing utilities
export function capturePage(name) {
  percySnapshot(name);
}

export function captureElement(selector, name) {
  percyScreenshot(selector, name);
}`
            }
          },
          'docs': {
            'test-examples.md': `# Visual Testing Examples

This project uses Percy for visual regression testing.

Example usage:
\`\`\`javascript
percySnapshot('Page Name');
\`\`\``
          }
        }
      });

      const scanner = new Scanner('/mixed-structure-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress');
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      
      // Should find TypeScript and JavaScript files in custom structure
      expect(result.files.source).toContain('app/tests/visual/login.spec.ts');
      expect(result.files.source).toContain('lib/test-utils/visual-helpers.js');
      expect(result.files.packageManager).toContain('package.json');
    });
  });

  describe('Framework Signature Engine', () => {
    it('should detect Cypress framework from generic Percy dependency', async () => {
      mock({
        '/cypress-signature-project': {
          'package.json': JSON.stringify({
            name: 'cypress-signature-project',
            dependencies: {
              '@percy/cli': '^1.0.0' // Generic Percy dependency, doesn't reveal framework
            }
          }),
          '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]', // Add config to provide anchor
          'cypress': {
            'e2e': {
              'login.spec.js': `describe('Login Tests', () => {
                it('should login successfully', () => {
                  cy.visit('http://localhost:3000/login');
                  cy.get('[data-testid="email"]').type('user@example.com');
                  cy.get('[data-testid="password"]').type('password123');
                  cy.get('[data-testid="login-button"]').click();
                  cy.url().should('include', '/dashboard');
                });
              });`
            }
          }
        }
      });

      const scanner = new Scanner('/cypress-signature-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress'); // Should detect from cy.visit, cy.get, etc.
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      expect(result.files.source).toContain('cypress/e2e/login.spec.js');
    });

    it('should detect Playwright framework from generic Percy dependency', async () => {
      mock({
        '/playwright-signature-project': {
          'package.json': JSON.stringify({
            name: 'playwright-signature-project',
            dependencies: {
              '@percy/cli': '^1.0.0' // Generic Percy dependency
            }
          }),
          '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]', // Add config to provide anchor
          'tests': {
            'login.spec.ts': `import { test, expect } from '@playwright/test';

test('should login successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/login');
  await page.fill('[data-testid="email"]', 'user@example.com');
  await page.fill('[data-testid="password"]', 'password123');
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL(/.*dashboard/);
});`
          }
        }
      });

      const scanner = new Scanner('/playwright-signature-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Playwright'); // Should detect from page.goto, page.fill, etc.
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
      expect(result.files.source).toContain('tests/login.spec.ts');
    });

    it('should detect Selenium framework from Java files', async () => {
      mock({
        '/selenium-signature-project': {
          'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>selenium-signature-project</artifactId>
  <version>1.0.0</version>
  
  <dependencies>
    <dependency>
      <groupId>com.applitools</groupId>
      <artifactId>eyes-selenium-java5</artifactId>
      <version>5.56.0</version>
    </dependency>
  </dependencies>
</project>`,
          'src': {
            'test': {
              'java': {
                'LoginTest.java': `import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

public class LoginTest {
    public void testLogin() {
        WebDriver driver = new ChromeDriver();
        driver.get("http://localhost:3000/login");
        WebElement emailField = driver.findElement(By.id("email"));
        emailField.sendKeys("user@example.com");
        driver.quit();
    }
}`
              }
            }
          }
        }
      });

      const scanner = new Scanner('/selenium-signature-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Applitools');
      expect(result.framework).toBe('Selenium'); // Should detect from new ChromeDriver(), By.id(), etc.
      expect(result.language).toBe('Java');
      expect(result.testType).toBe('e2e');
      expect(result.files.source).toContain('src/test/java/LoginTest.java');
    });

    it('should detect Storybook framework from story files', async () => {
      mock({
        '/storybook-signature-project': {
          'package.json': JSON.stringify({
            name: 'storybook-signature-project',
            dependencies: {
              '@percy/storybook': '^3.0.0'
            }
          }),
          'src': {
            'components': {
              'Button.stories.js': `export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => <Button primary>Button</Button>;
export const Secondary = () => <Button>Button</Button>;`
            }
          },
          '.storybook': {
            'main.js': `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
};`
          }
        }
      });

      const scanner = new Scanner('/storybook-signature-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Storybook'); // Should detect from .stories.js, title:, export const
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('storybook');
      expect(result.files.source).toContain('src/components/Button.stories.js');
    });

    it('should handle mixed framework signatures and choose the strongest', async () => {
      mock({
        '/mixed-signature-project': {
          'package.json': JSON.stringify({
            name: 'mixed-signature-project',
            dependencies: {
              '@percy/cli': '^1.0.0'
            }
          }),
          '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]', // Add config to provide anchor
          'tests': {
            'mixed.spec.js': `// This file has both Cypress and generic test patterns
describe('Mixed Tests', () => {
  it('should test something', () => {
    // Cypress-specific code (stronger signal)
    cy.visit('http://localhost:3000');
    cy.get('[data-testid="button"]').click();
    
    // Generic test code (weaker signal)
    expect(true).toBe(true);
  });
});`
          }
        }
      });

      const scanner = new Scanner('/mixed-signature-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Cypress'); // Should choose Cypress due to stronger signals
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });

    it('should default to Selenium when no framework signatures are found', async () => {
      mock({
        '/generic-project': {
          'package.json': JSON.stringify({
            name: 'generic-project',
            dependencies: {
              '@percy/cli': '^1.0.0'
            }
          }),
          '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]', // Add config to provide anchor
          'tests': {
            'generic.spec.js': `// Generic test file with no framework-specific patterns
function testSomething() {
  console.log('This is a generic test');
  return true;
}

testSomething();`
          }
        }
      });

      const scanner = new Scanner('/generic-project', false);
      const result = await scanner.scan();
      
      expect(result).toBeDefined();
      expect(result.platform).toBe('Percy');
      expect(result.framework).toBe('Selenium'); // Should default to Selenium
      expect(result.language).toBe('JavaScript/TypeScript');
      expect(result.testType).toBe('e2e');
    });
  });
});
