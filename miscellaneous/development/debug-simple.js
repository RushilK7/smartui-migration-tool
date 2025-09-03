const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');

async function testSimple() {
  mock({
    '/test-project': {
      'cypress': {
        'e2e': {
          'login.spec.js': `describe('Login Tests', () => {
            it('should login successfully', () => {
              cy.visit('http://localhost:3000/login');
              cy.get('[data-testid="email"]').type('user@example.com');
            });
          });`
        }
      }
    }
  });

  try {
    const filePath = path.join('/test-project', 'cypress/e2e/login.spec.js');
    const content = await fs.promises.readFile(filePath, 'utf-8');
    console.log('File content:', content);
    
    // Test the magic strings
    const magicStrings = ['percySnapshot', 'percyScreenshot', 'cy.visit', 'cy.get'];
    console.log('Testing magic strings:');
    for (const magicString of magicStrings) {
      const hasMatch = content.includes(magicString);
      console.log(`  ${magicString}: ${hasMatch}`);
    }
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    mock.restore();
  }
}

testSimple();
