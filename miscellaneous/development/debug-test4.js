const mock = require('mock-fs');
const fs = require('fs').promises;

async function testFileReading() {
  mock({
    '/test-project': {
      'package.json': JSON.stringify({
        name: 'test-project',
        dependencies: {
          '@percy/cypress': '^3.1.0',
          '@applitools/eyes-cypress': '^3.0.0'
        }
      })
    }
  });

  try {
    const content = await fs.readFile('/test-project/package.json', 'utf-8');
    console.log('File content:', content);
    
    const packageJson = JSON.parse(content);
    console.log('Parsed JSON:', packageJson);
    
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    console.log('Merged dependencies:', dependencies);
    
    console.log('Has @percy/cypress:', !!dependencies['@percy/cypress']);
    console.log('Has @applitools/eyes-cypress:', !!dependencies['@applitools/eyes-cypress']);
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    mock.restore();
  }
}

testFileReading();
