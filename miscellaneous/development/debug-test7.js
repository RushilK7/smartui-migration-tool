const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testCreateDetectionResult() {
  mock({
    '/test-project': {
      'package.json': JSON.stringify({
        name: 'test-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      })
    }
  });

  try {
    const scanner = new Scanner('/test-project', true);
    
    // Call the private method directly using reflection
    const result = await scanner.createDetectionResult('Percy', 'Cypress', 'JavaScript/TypeScript', '/test-project');
    console.log('Detection result:', result);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testCreateDetectionResult();
