const mock = require('mock-fs');
const fs = require('fs').promises;

async function testDetailedDebug() {
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
    const content = await fs.readFile('/conflicting-project/package.json', 'utf-8');
    const packageJson = JSON.parse(content);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('Dependencies:', dependencies);
    
    // Simulate the Scanner logic
    const detectedPlatforms = [];
    
    if (dependencies['@percy/cypress']) {
      console.log('Found @percy/cypress');
      detectedPlatforms.push('Percy');
    }
    
    if (dependencies['@applitools/eyes-cypress']) {
      console.log('Found @applitools/eyes-cypress');
      detectedPlatforms.push('Applitools');
    }
    
    console.log('Detected platforms:', detectedPlatforms);
    console.log('Length:', detectedPlatforms.length);
    
    if (detectedPlatforms.length > 1) {
      console.log('Should throw MultiplePlatformsDetectedError');
    } else {
      console.log('Should return first platform or null');
    }
    
  } catch (error) {
    console.log('Error:', error.message);
  } finally {
    mock.restore();
  }
}

testDetailedDebug();
