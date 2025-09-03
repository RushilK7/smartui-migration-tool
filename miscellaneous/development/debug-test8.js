const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testExactLogic() {
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
    
    // Simulate the exact logic from analyzeJavaScriptDependencies
    const absoluteScanPath = '/conflicting-project';
    const fs = require('fs').promises;
    const path = require('path');
    
    const packageJsonPath = path.join(absoluteScanPath, 'package.json');
    const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    console.log('Dependencies:', dependencies);
    
    const detectedPlatforms = [];
    
    // Check for Percy dependencies
    if (dependencies['@percy/cypress']) {
      console.log('Found @percy/cypress, creating detection result...');
      const result1 = await scanner.createDetectionResult('Percy', 'Cypress', 'JavaScript/TypeScript', absoluteScanPath);
      detectedPlatforms.push(result1);
      console.log('Added Percy result');
    }
    
    // Check for Applitools dependencies
    if (dependencies['@applitools/eyes-cypress']) {
      console.log('Found @applitools/eyes-cypress, creating detection result...');
      const result2 = await scanner.createDetectionResult('Applitools', 'Cypress', 'JavaScript/TypeScript', absoluteScanPath);
      detectedPlatforms.push(result2);
      console.log('Added Applitools result');
    }
    
    console.log('Detected platforms length:', detectedPlatforms.length);
    
    if (detectedPlatforms.length > 1) {
      console.log('Should throw MultiplePlatformsDetectedError');
      const { MultiplePlatformsDetectedError } = require('./lib/types');
      throw new MultiplePlatformsDetectedError();
    }
    
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testExactLogic();
