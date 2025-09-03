
describe('Login Flow', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
    
    cy.percySnapshot('Login Flow - Dashboard');
  });
  
  it('should handle login errors', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('invalid@example.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    cy.percySnapshot('Login Error State');
  });
});