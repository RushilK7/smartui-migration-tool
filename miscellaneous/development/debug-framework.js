const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testFrameworkDetection() {
  mock({
    '/debug-project': {
      'package.json': JSON.stringify({
        name: 'debug-project',
        dependencies: {
          '@percy/cli': '^1.0.0'
        }
      }),
      '.percy.yml': 'version: 2\nsnapshot:\n  widths: [1280, 375]',
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

  try {
    const scanner = new Scanner('/debug-project', true);
    const result = await scanner.scan();
    console.log('Result:', result);
    console.log('Framework:', result.framework);
    console.log('Source files:', result.files.source);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testFrameworkDetection();
