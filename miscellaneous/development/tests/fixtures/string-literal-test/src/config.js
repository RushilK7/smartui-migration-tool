
// Configuration file
const config = {
  visualTestingMethods: [
    'percySnapshot',
    'eyes.check',
    'sauceVisualCheck'
  ],
  testCommands: {
    percy: 'cy.percySnapshot("Login Page")',
    applitools: 'eyes.check("Dashboard")',
    sauceLabs: 'sauceVisualCheck("Homepage")'
  }
};

module.exports = config;
