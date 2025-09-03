describe('Demo Test', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Demo Test');
  });
});
