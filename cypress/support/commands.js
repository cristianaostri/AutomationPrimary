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
  const mainApiUrl = Cypress.env('mainApiUrl'); // https://api.oneclearing.testing.primary/api/v1

  // 1. Gestionamos la sesión (persiste localStorage)
  cy.session([username, password], () => {
    cy.log('*** Generando nueva sesión de API ***');
    cy.request({
      method: 'POST',
      url: `${mainApiUrl}/Auth/Token`, 
      form: true, // multipart/form-data según Swagger
      body: { username, password }
    }).then((response) => {
      expect(response.status).to.eq(200);
      const token = response.body.access_token;
      
      // Guardamos en localStorage (esto SÍ lo guarda cy.session)
      window.localStorage.setItem('token', token);
    });
  }, {
    validate() {
      // Validamos que el token exista en el storage
      return window.localStorage.getItem('token') !== null;
    }
  });

  // 2. SINCRONIZACIÓN CRÍTICA: 
  // cy.session restaura el localStorage, pero debemos re-poblar el Cypress.env 
  // para que los comandos de API tengan el token en cada escenario.
  cy.then(() => {
    const cachedToken = window.localStorage.getItem('token');
    Cypress.env('accessToken', cachedToken);
  });
});