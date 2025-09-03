const mock = require('mock-fs');
const { Scanner } = require('./lib/modules/Scanner');

async function testStorybookDebug() {
  mock({
    '/storybook-debug': {
      'package.json': JSON.stringify({
        name: 'storybook-debug',
        dependencies: {
          '@percy/storybook': '^3.0.0'
        }
      }),
      'src': {
        'components': {
          'Button.stories.js': `export default {
  title: 'Components/Button',
  component: Button,
};

export const Primary = () => <Button primary>Button</Button>;
export const Secondary = () => <Button>Button</Button>;`
        }
      },
      '.storybook': {
        'main.js': `module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
};`
      }
    }
  });

  try {
    const scanner = new Scanner('/storybook-debug', true);
    const result = await scanner.scan();
    console.log('Result:', result);
    console.log('Framework:', result.framework);
    console.log('Source files:', result.files.source);
  } catch (error) {
    console.log('Error:', error.constructor.name, error.message);
  } finally {
    mock.restore();
  }
}

testStorybookDebug();
