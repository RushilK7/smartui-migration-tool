const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testJavaScriptDependencies() {
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
    
    // Call the private method directly using reflection
    const result = await scanner.analyzeJavaScriptDependencies('/conflicting-project');
    console.log('JavaScript result:', result);
  } catch (error) {
    console.log('JavaScript Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testJavaScriptDependencies();
