const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testPythonDetection() {
  mock({
    '/python-test': {
      'requirements.txt': `pytest==7.4.0
selenium==4.15.0
saucelabs_visual==1.0.0
requests==2.31.0`,
      'tests': {
        'visual': {
          'login_tests.py': `import pytest
from saucelabs_visual import SauceVisual

def test_login_page():
    visual = SauceVisual()
    visual.check_page("Login Page")
    visual.snapshot("login_screen")`
        }
      }
    }
  });

  try {
    const scanner = new Scanner('/python-test', true);
    const result = await scanner.scan();
    console.log('Result:', result);
    console.log('Source files:', result.files.source);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testPythonDetection();
