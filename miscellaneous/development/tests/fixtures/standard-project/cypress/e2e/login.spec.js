
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.percySnapshot('Login Flow - Dashboard');
  });
});