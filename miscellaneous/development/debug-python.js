const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testPythonDetection() {
  mock({
    '/python-project': {
      'requirements.txt': `pytest==7.4.0
selenium==4.15.0
saucelabs_visual==1.0.0
requests==2.31.0`
    }
  });

  try {
    const scanner = new Scanner('/python-project', true);
    const result = await scanner.scan();
    console.log('Python result:', result);
  } catch (error) {
    console.log('Python Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testPythonDetection();
