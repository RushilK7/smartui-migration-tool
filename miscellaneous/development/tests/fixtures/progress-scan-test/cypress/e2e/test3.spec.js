
describe('Test 3', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 3');
  });
});