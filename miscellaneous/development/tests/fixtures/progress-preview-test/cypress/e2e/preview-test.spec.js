
describe('Preview Test', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Preview Test');
  });
});