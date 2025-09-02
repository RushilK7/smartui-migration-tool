import mockFs from 'mock-fs';
import { Scanner } from '../src/modules/Scanner';

describe('Scanner - Simple Tests', () => {
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner('/test-project');
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('should detect Percy Cypress project', async () => {
    mockFs({
      '/test-project/package.json': JSON.stringify({
        dependencies: {
          '@percy/cypress': '^1.0.0',
          'cypress': '^10.0.0'
        }
      }),
      '/test-project/cypress.config.js': 'module.exports = { e2e: { baseUrl: "http://localhost:3000" } };',
      '/test-project/cypress/e2e/test.cy.js': 'describe("Test", () => { it("should work", () => { cy.percySnapshot("test"); }); });'
    });

    const result = await scanner.scan();
    
    expect(result.platform).toBe('Percy');
    expect(result.framework).toBe('Cypress');
    expect(result.language).toBe('JavaScript/TypeScript');
    expect(result.testType).toBe('e2e');
  });

  it('should handle empty project directory', async () => {
    mockFs({
      '/test-project': {}
    });

    await expect(scanner.scan()).rejects.toThrow('Could not detect a supported visual testing platform');
  });
});
