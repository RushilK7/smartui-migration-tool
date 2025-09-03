const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testMultiplePlatforms() {
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

  try {
    const scanner = new Scanner('/conflicting-project', true);
    const result = await scanner.scan();
    console.log('Result:', result);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testMultiplePlatforms();
