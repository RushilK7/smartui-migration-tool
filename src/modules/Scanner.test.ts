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
            devDependencies: {
              '@percy/cypress': '^3.1.0'
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
            devDependencies: {
              '@applitools/eyes-cypress': '^3.0.0'
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
            devDependencies: {
              '@saucelabs/cypress-visual-plugin': '^1.0.0'
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
});
