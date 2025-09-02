describe('Homepage Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the homepage correctly', () => {
    cy.get('h1').should('contain', 'Welcome');
    cy.percySnapshot('Homepage');
  });

  it('should display the navigation menu', () => {
    cy.get('nav').should('be.visible');
    cy.percySnapshot('Navigation Menu', { widths: [1280, 375] });
  });

  it('should display the footer', () => {
    cy.get('footer').should('be.visible');
    cy.percySnapshot('Footer');
  });
});
