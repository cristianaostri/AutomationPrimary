
import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

Given('que me autentico por API', () => {
  
});

// --- ACCIÓN 1: LISTAR ---
When('obtengo la lista de carátulas en estado pendiente de firma', () => {
  const token = Cypress.env('accessToken');
  const urlListado = 'https://api.oneclearing.testing.primary/api/v1/Caratulas?estadoId=1';

  cy.request({
    method: 'GET',
    url: urlListado,
    headers: { Authorization: `Bearer ${token}` }
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.log('Carátulas pendientes:', response.body);
    // Mapeamos solo los números para el body del POST
    const listado = response.body.value || response.body.data || response.body.items;

    if (!Array.isArray(listado)) {
        cy.log('ESTRUCTURA RECIBIDA:', JSON.stringify(response.body));
        throw new Error("La respuesta no contiene un array. Revisá la consola (F12) para ver la propiedad correcta.");
    }

    // 2. Ahora que tenemos el array, mapeamos los IDs
    const ids = listado.map(c => c.caratulaNumero);
    
    cy.log(`Se encontraron ${ids.length} carátulas.`);
    cy.wrap(ids).as('caratulasIds');
    if (ids.length === 0) {
      throw new Error("No se encontraron carátulas pendientes de firma.");
    }
  });
});

// --- ACCIÓN 2: FIRMAR ---
When('realizo la firma masiva de las carátulas encontradas', function () {
  const token = Cypress.env('accessToken');
  const ids = this.caratulasIds; // Recuperamos del alias

  cy.request({
    method: 'POST',
    url: 'https://api.oneclearing.testing.primary/api/v1/Caratulas/Firmar',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      caratulas: ids
    }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204]);
    cy.log(`Firmadas con éxito: ${ids}`);
  });
});

// --- RESULTADO / ACCIÓN FINAL: CARATULAR ---
Then('realizo la caratulación definitiva de las mismas', function () {
  const token = Cypress.env('accessToken');
  const ids = this.caratulasIds;

  cy.request({
    method: 'POST',
    url: 'https://api.oneclearing.testing.primary/api/v1/Caratulas/CaratulacionDefinitiva',
    headers: { Authorization: `Bearer ${token}` },
    body: {
      caratulas: ids
    }
  }).then((response) => {
    expect(response.status).to.be.oneOf([200, 204]);
    cy.log('Proceso de caratulación finalizado correctamente');
  });
});