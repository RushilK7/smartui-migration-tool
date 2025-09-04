describe('Enhanced Demo Tests', () => {
  beforeEach(() => {
    cy.visit('https://example.com');
  });

  it('should take a visual snapshot of the homepage', () => {
    cy.get('h1').should('be.visible');
    cy.percySnapshot('Homepage - Enhanced Demo');
  });

  it('should take a snapshot of the navigation', () => {
    cy.get('nav').should('exist');
    cy.percySnapshot('Navigation - Enhanced Demo');
  });

  it('should take a snapshot with custom name', () => {
    cy.get('body').should('be.visible');
    cy.percySnapshot('Custom Test Name - Enhanced Demo');
  });
});
