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

  // Log de variables para debug
  console.log('=== LOGIN DEBUG ===');
  console.log('mainApiUrl:', mainApiUrl);
  console.log('username:', username);
  console.log('password:', password ? '***' : 'VACÍO!');
  console.log('===================');

  cy.request({
    method: 'POST',
    url: `${mainApiUrl}/Auth/Token`,
    form: true,
    body: { username, password },
    failOnStatusCode: false,
  }).then((response) => {
    console.log('LOGIN STATUS:', response.status);
    console.log('LOGIN BODY:', JSON.stringify(response.body));
    expect(
      response.status,
      `Login falló ${response.status}. Body: ${JSON.stringify(response.body)}. URL: ${mainApiUrl}/Auth/Token. User: ${username}`
    ).to.eq(200);
    const token = response.body.access_token;
    expect(token, 'Token debe existir').to.exist;
    Cypress.env('accessToken', token);
  });
});