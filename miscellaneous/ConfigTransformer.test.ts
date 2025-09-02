import { ConfigTransformer } from '../src/modules/ConfigTransformer';
import { DetectionResult } from '../src/types';

describe('ConfigTransformer', () => {
  let transformer: ConfigTransformer;

  beforeEach(() => {
    transformer = new ConfigTransformer();
  });

  describe('Percy Configuration Transformation', () => {
    it('should transform Percy YAML configuration', () => {
      const percyConfig = `
version: 2
percy:
  version: 1.0.0
  discovery:
    allowedHostnames:
      - localhost
      - example.com
    networkIdleTimeout: 750
    concurrency: 1
  snapshot:
    widths: [1280, 375]
    minHeight: 1024
    percyCSS: |
      .hide { display: none !important; }
      .percy-specific { visibility: hidden; }
`;

      const result = transformer.transformPercyConfig(percyConfig);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle Percy configuration with warnings', () => {
      const percyConfig = `
version: 2
percy:
  version: 1.0.0
  discovery:
    allowedHostnames:
      - localhost
    networkIdleTimeout: 750
    concurrency: 1
  snapshot:
    widths: [1280, 375]
    minHeight: 1024
    percyCSS: |
      .hide { display: none !important; }
  css: |
    .additional-css { color: red; }
`;

      const result = transformer.transformPercyConfig(percyConfig);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('percy-css');
    });
  });

  describe('Applitools Configuration Transformation', () => {
    it('should transform Applitools JavaScript configuration', () => {
      const applitoolsConfig = `
module.exports = {
  apiKey: process.env.APPLITOOLS_API_KEY,
  batch: {
    name: 'My Test Batch',
    id: process.env.APPLITOOLS_BATCH_ID
  },
  appName: 'My App',
  testName: 'My Test',
  viewportSize: { width: 1280, height: 720 },
  matchLevel: 'Layout',
  ignoreDisplacements: true,
  ignoreCaret: true,
  accessibilityValidation: {
    level: 'AA',
    guidelinesVersion: 'WCAG_2_1'
  }
};
`;

      const result = transformer.transformApplitoolsConfig(applitoolsConfig);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle Applitools configuration with Storybook-specific properties', () => {
      const applitoolsConfig = `
module.exports = {
  apiKey: process.env.APPLITOOLS_API_KEY,
  batch: {
    name: 'My Test Batch'
  },
  appName: 'My App',
  testName: 'My Test',
  storybookUrl: 'http://localhost:6006',
  storybook: {
    stories: ['**/*.stories.js'],
    viewportSize: { width: 1280, height: 720 }
  }
};
`;

      const result = transformer.transformApplitoolsConfig(applitoolsConfig);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(2);
      expect(result.warnings[0].message).toContain('storybookUrl');
      expect(result.warnings[1].message).toContain('storybook');
    });
  });

  describe('Sauce Labs Configuration Transformation', () => {
    it('should transform Sauce Labs configuration', () => {
      const sauceConfig = `
module.exports = {
  apiKey: process.env.SCREENER_API_KEY,
  projectRepo: 'my-org/my-repo',
  diffOptions: {
    structure: true,
    layout: true,
    style: true,
    content: true,
    minLayoutIntensity: 4,
    minContentIntensity: 4,
    minStyleIntensity: 2
  },
  states: [
    {
      url: 'http://localhost:3000',
      name: 'Homepage'
    }
  ]
};
`;

      const result = transformer.transformSauceLabsConfig(sauceConfig);

      expect(result.content).toMatchSnapshot();
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid YAML configuration', () => {
      const invalidYaml = `
version: 2
percy:
  version: 1.0.0
  invalid: [unclosed array
`;

      const result = transformer.transformPercyConfig(invalidYaml);

      expect(result.content).toBe(invalidYaml);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Failed to parse YAML');
    });

    it('should handle invalid JavaScript configuration', () => {
      const invalidJs = `
module.exports = {
  apiKey: process.env.APPLITOOLS_API_KEY,
  invalid: [unclosed array
};
`;

      const result = transformer.transformApplitoolsConfig(invalidJs);

      expect(result.content).toBe(invalidJs);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('Failed to parse JavaScript');
    });

    it('should handle empty configuration', () => {
      const emptyConfig = '';

      const result = transformer.transformPercyConfig(emptyConfig);

      expect(result.content).toBe(emptyConfig);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('Configuration Detection', () => {
    it('should detect Percy configuration file', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['.percy.yml'],
          source: [],
          ci: [],
          packageManager: []
        }
      };

      const result = transformer.transformConfig('.percy.yml', 'percy config content', detectionResult);

      expect(result.content).toContain('SmartUI');
      expect(result.warnings).toHaveLength(0);
    });

    it('should detect Applitools configuration file', () => {
      const detectionResult: DetectionResult = {
        platform: 'Applitools',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['applitools.config.js'],
          source: [],
          ci: [],
          packageManager: []
        }
      };

      const result = transformer.transformConfig('applitools.config.js', 'applitools config content', detectionResult);

      expect(result.content).toContain('SmartUI');
      expect(result.warnings).toHaveLength(0);
    });

    it('should handle unknown configuration file', () => {
      const detectionResult: DetectionResult = {
        platform: 'Percy',
        framework: 'Cypress',
        language: 'JavaScript/TypeScript',
        testType: 'e2e',
        files: {
          config: ['unknown.config.js'],
          source: [],
          ci: [],
          packageManager: []
        }
      };

      const result = transformer.transformConfig('unknown.config.js', 'unknown config content', detectionResult);

      expect(result.content).toBe('unknown config content');
      expect(result.warnings).toHaveLength(0);
    });
  });
});
