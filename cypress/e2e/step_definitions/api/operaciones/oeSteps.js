import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const BASE_URL = Cypress.env("mainApiUrl");
const HEADERS = {
  Authorization: `Bearer ${Cypress.env("accessToken")}`,
};

Given("que preparo los datos de la OE en modo {string}", (modo) => {
  cy.fixture("api/operaciones/crearOferta").then((fixtureBody) => {
    
    if (modo.toLowerCase().includes("auto")) {
      cy.request({
        method: "GET",
        url: `${BASE_URL}/Operaciones/GetOperacionesAll`,
        failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
        qs: {
          LadoID: 2,
          MesDeEntregaRango: "MesEnCurso",
          DatosPortfolio: "ParaEntrega",
          PageIndex: 0,
          PageSize: 1,
          OrderBy: "Fecha desc", // No hace falta el %20, Cypress lo encodea solo
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        // Mapeo robusto de la data
        const data = response.body.items || response.body.data || (Array.isArray(response.body) ? response.body : []);
        console.log("Respuesta de Operaciones:", response.body);
        expect(data.length, "No hay operaciones de venta").to.be.at.least(1);

        const op = data[0];
        cy.log(`🤖 Modo Automático: Usando Op #${op.operacionNumero}`);

        fixtureBody.operaciones = [
          {
            operacionNumero: op.operacionNumero,
            cantidadToneladas: op.cantidadToneladas
          }
        ];
        
        cy.wrap(fixtureBody).as("finalPayload");
      });
    } else {
      cy.log("📝 Modo Manual: Usando datos estáticos del fixture");
      cy.wrap(fixtureBody).as("finalPayload");
    }
  });
});

When("envío la solicitud POST para crear la OE", () => {
  cy.get("@finalPayload").then((payload) => {
    cy.request({
      method: "POST",
      url: `${BASE_URL}/Ofertas`,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
      body: payload,
      failOnStatusCode: false,
    }).as("postResponse");
  });
});

Then("la respuesta debe ser exitosa y retornar un ID", () => {
  cy.get("@postResponse").then((res) => {
    const errorDetail = res.status !== 200 && res.status !== 201 
      ? ` | Error Body: ${JSON.stringify(res.body)}` 
      : "";
    
    expect([200, 201], `Status esperado 200/201 pero recibí ${res.status}${errorDetail}`).to.include(res.status);
    
    const id = res.body.id || res.body.value || (res.body.data ? res.body.data.id : null);
    expect(id, "La API no devolvió un ID").to.not.be.null;
    cy.log(`🚀 OE creada con éxito. ID: ${id}`);
  });
});