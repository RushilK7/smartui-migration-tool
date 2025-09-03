
describe('Test 1', () => {
  it('should work', () => {
    cy.visit('/');
    cy.percySnapshot('Test 1');
  });
});