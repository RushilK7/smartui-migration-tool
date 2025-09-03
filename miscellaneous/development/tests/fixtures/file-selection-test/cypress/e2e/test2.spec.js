
describe('Test 2', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 2');
  });
});