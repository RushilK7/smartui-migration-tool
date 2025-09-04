describe('Multi Platform Demo', () => {
  it('should take Percy snapshot', () => {
    cy.visit('https://example.com');
    cy.percySnapshot('Homepage with Percy');
  });

  it('should take Applitools snapshot', () => {
    cy.visit('https://example.com');
    cy.eyesOpen({
      appName: 'Multi Platform Demo',
      testName: 'Homepage with Applitools'
    });
    cy.eyesCheckWindow('Homepage');
    cy.eyesClose();
  });
});
