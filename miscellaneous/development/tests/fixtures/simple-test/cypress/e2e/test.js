
describe('Login Tests', () => {
  it('should login successfully', () => {
    cy.visit('http://localhost:3000/login');
    cy.percySnapshot('Login Page');
  });
});