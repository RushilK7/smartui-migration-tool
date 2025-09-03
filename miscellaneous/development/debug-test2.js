const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testSimpleDetection() {
  mock({
    '/simple-project': {
      'package.json': JSON.stringify({
        name: 'simple-project',
        dependencies: {
          '@percy/cypress': '^3.1.0'
        }
      })
    }
  });

  try {
    const scanner = new Scanner('/simple-project', true);
    const result = await scanner.scan();
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testSimpleDetection();
