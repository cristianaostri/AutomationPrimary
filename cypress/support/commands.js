// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


Cypress.Commands.add('loginViaApi', () => {
  const username = Cypress.env('apiUser');
  const password = Cypress.env('apiPassword');
  const mainApiUrl = Cypress.env('mainApiUrl');

  cy.request({
    method: 'POST',
    url: `${mainApiUrl}/Auth/Token`,
    form: true,
    body: { username, password },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(200);
    const token = response.body.access_token;
    expect(token, 'Token debe existir').to.exist;
    Cypress.env('accessToken', token);
    cy.log(`✅ Token obtenido: ${token.substring(0, 20)}...`);
  });
});