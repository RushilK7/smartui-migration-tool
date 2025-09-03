
describe('Dashboard Tests', () => {
  it('should display dashboard correctly', () => {
    cy.visit('http://localhost:3000/dashboard');
    cy.get('[data-testid="dashboard-header"]').should('be.visible');
    
    cy.percySnapshot('Dashboard Layout');
  });
});