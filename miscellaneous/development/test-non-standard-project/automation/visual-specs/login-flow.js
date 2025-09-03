describe('Login Flow Tests', () => {
  it('should complete login flow successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('user@example.com');
    cy.get('[data-testid="password"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    cy.url().should('include', '/dashboard');
    
    // Take visual snapshot
    cy.percySnapshot('Login Flow - Dashboard');
  });
  
  it('should handle login errors gracefully', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('[data-testid="email"]').type('invalid@example.com');
    cy.get('[data-testid="password"]').type('wrongpassword');
    cy.get('[data-testid="login-button"]').click();
    
    // Take visual snapshot of error state
    cy.percySnapshot('Login Flow - Error State');
  });
});
