import { ExecutionTransformer } from '../src/modules/ExecutionTransformer';
import { DetectionResult } from '../src/types';

describe('ExecutionTransformer', () => {
  let transformer: ExecutionTransformer;

  beforeEach(() => {
    transformer = new ExecutionTransformer();
  });

  describe('Package.json Script Transformation', () => {
    it('should transform Percy package.json scripts', () => {
      const packageJson = {
        scripts: {
          'test': 'cypress run',
          'test:visual': 'percy exec -- cypress run',
          'test:percy': 'percy exec -- npm test',
          'test:app': 'percy app:exec -- npm test'
        }
      };

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformPackageJson(JSON.stringify(packageJson, null, 2), detectionResult.platform);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Applitools package.json scripts', () => {
      const packageJson = {
        scripts: {
          'test': 'playwright test',
          'test:visual': 'eyes-storybook',
          'test:eyes': 'eyes-storybook --config applitools.config.js'
        }
      };

      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Playwright',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformPackageJson(JSON.stringify(packageJson, null, 2), detectionResult.platform);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Sauce Labs package.json scripts', () => {
      const packageJson = {
        scripts: {
          'test': 'cypress run',
          'test:visual': 'screener-storybook',
          'test:screener': 'screener-storybook --config screener.config.js'
        }
      };

      const detectionResult: DetectionResult = {
        platform: 'Sauce Labs Visual',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformPackageJson(JSON.stringify(packageJson, null, 2), detectionResult.platform);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('CI/CD YAML Transformation', () => {
    it('should transform GitHub Actions workflow', () => {
      const workflowYaml = `
name: Visual Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
      - name: Run visual tests
        run: percy exec -- npm test
        env:
          PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCIConfig(workflowYaml, detectionResult.platform);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });

    it('should transform Jenkins pipeline', () => {
      const jenkinsYaml = `
pipeline {
  agent any
  stages {
    stage('Test') {
      steps {
        sh 'npm install'
        sh 'percy exec -- npm test'
      }
      environment {
        PERCY_TOKEN = credentials('percy-token')
      }
    }
  }
}
`;

      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: { config: [], source: [], ci: [], packageManager: [] }
      };

      const result = transformer.transformCIConfig(jenkinsYaml, detectionResult.platform);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid JSON in package.json', () => {
      const invalidJson = '{ "scripts": { "test": "cypress run" }';

      const result = transformer.transformPackageJson(invalidJson, 'Percy');

      expect(result.content).toBe(invalidJson);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Failed to parse package.json');
    });

    it('should handle invalid YAML in CI config', () => {
      const invalidYaml = `
name: Visual Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run visual tests
        run: percy exec -- npm test
        env:
          PERCY_TOKEN: \${{ secrets.PERCY_TOKEN
          # Missing closing brace
`;

      const result = transformer.transformCIConfig(invalidYaml, 'Percy');

      expect(result.content).toBe(invalidYaml);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Failed to parse YAML');
    });

    it('should handle empty package.json', () => {
      const emptyJson = '{}';

      const result = transformer.transformPackageJson(emptyJson, 'Percy');

      expect(result.content).toBe(emptyJson);
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle package.json without scripts', () => {
      const packageJson = '{ "name": "test-project", "version": "1.0.0" }';

      const result = transformer.transformPackageJson(packageJson, 'Percy');

      expect(result.content).toBe(packageJson);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Command Transformation', () => {
    it('should transform percy exec commands', () => {
      const command = 'percy exec -- npm test';
      const warnings: any[] = [];

      const result = transformer['transformPercyCommand'](command, warnings);

      expect(result).toBe('npx smartui exec -- npm test');
      expect(warnings).toHaveLength(0);
    });

    it('should transform percy app:exec commands', () => {
      const command = 'percy app:exec -- npm test';
      const warnings: any[] = [];

      const result = transformer['transformPercyCommand'](command, warnings);

      expect(result).toBe('npx smartui exec -- npm test');
      expect(warnings).toHaveLength(0);
    });

    it('should transform eyes-storybook commands', () => {
      const command = 'eyes-storybook --config applitools.config.js';
      const warnings: any[] = [];

      const result = transformer['transformApplitoolsCommand'](command, warnings);

      expect(result).toBe('smartui-storybook --config applitools.config.js');
      expect(warnings).toHaveLength(0);
    });

    it('should transform screener-storybook commands', () => {
      const command = 'screener-storybook --config screener.config.js';
      const warnings: any[] = [];

      const result = transformer['transformSauceLabsCommand'](command, warnings);

      expect(result).toBe('smartui-storybook --config screener.config.js');
      expect(warnings).toHaveLength(0);
    });
  });

  describe('Environment Variable Transformation', () => {
    it('should transform Percy environment variables', () => {
      const yaml = `
env:
  PERCY_TOKEN: \${{ secrets.PERCY_TOKEN }}
  PERCY_BRANCH: \${{ github.ref_name }}
  PERCY_PROJECT: my-project
`;

      const result = transformer['transformEnvironmentVariables'](yaml, 'Percy');

      expect(result).toContain('PROJECT_TOKEN');
      expect(result).toContain('LT_USERNAME');
      expect(result).toContain('LT_ACCESS_KEY');
      expect(result).not.toContain('PERCY_TOKEN');
    });

    it('should transform Applitools environment variables', () => {
      const yaml = `
env:
  APPLITOOLS_API_KEY: \${{ secrets.APPLITOOLS_API_KEY }}
  APPLITOOLS_BATCH_ID: \${{ github.run_id }}
  APPLITOOLS_BATCH_NAME: \${{ github.ref_name }}
`;

      const result = transformer['transformEnvironmentVariables'](yaml, 'Applitools');

      expect(result).toContain('PROJECT_TOKEN');
      expect(result).toContain('LT_USERNAME');
      expect(result).toContain('LT_ACCESS_KEY');
      expect(result).not.toContain('APPLITOOLS_API_KEY');
    });

    it('should transform Sauce Labs environment variables', () => {
      const yaml = `
env:
  SCREENER_API_KEY: \${{ secrets.SCREENER_API_KEY }}
  SCREENER_PROJECT: my-project
  SCREENER_BRANCH: \${{ github.ref_name }}
`;

      const result = transformer['transformEnvironmentVariables'](yaml, 'Sauce Labs Visual');

      expect(result).toContain('PROJECT_TOKEN');
      expect(result).toContain('LT_USERNAME');
      expect(result).toContain('LT_ACCESS_KEY');
      expect(result).not.toContain('SCREENER_API_KEY');
    });
  });
});
