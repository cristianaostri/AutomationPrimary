import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ✅ TOKEN y URL leídos INLINE en cada step — nunca a nivel módulo
// ❌ Removido: const BASE_URL y const HEADERS a nivel módulo
//    Se leían antes de que cy.loginViaApi() corriera → token siempre undefined

Given("que preparo los datos de la OE en modo {string}", (modo) => {
  cy.fixture("api/operaciones/crearOferta").then((fixtureBody) => {
    if (modo.toLowerCase().includes("auto")) {
      const url = Cypress.env("mainApiUrl");
      const token = Cypress.env("accessToken");

      cy.request({
        method: "GET",
        url: `${url}/Operaciones/GetOperacionesAll`,
        failOnStatusCode: false,
        headers: { Authorization: `Bearer ${token}` },
        qs: {
          LadoID: 2,
          MesDeEntregaRango: "MesEnCurso",
          DatosPortfolio: "ParaEntrega",
          PageIndex: 0,
          PageSize: 1,
          OrderBy: "Fecha desc",
        },
      }).then((response) => {
        expect(response.status).to.eq(200);
        const data =
          response.body.items ||
          response.body.data ||
          (Array.isArray(response.body) ? response.body : []);
        expect(data.length, "No hay operaciones de venta disponibles").to.be.at.least(1);

        const op = data[0];
        cy.log(`🤖 Modo Automático: usando Op #${op.operacionNumero}`);

        fixtureBody.operaciones = [
          {
            operacionNumero: op.operacionNumero,
            cantidadToneladas: op.cantidadToneladas,
          },
        ];
        cy.wrap(fixtureBody).as("finalPayload");
      });
    } else {
      cy.log("📝 Modo Manual: usando datos estáticos del fixture");
      cy.wrap(fixtureBody).as("finalPayload");
    }
  });
});

When("envío la solicitud POST para crear la OE", () => {
  cy.get("@finalPayload").then((payload) => {
    const url = Cypress.env("mainApiUrl");
    const token = Cypress.env("accessToken");

    // ✅ failOnStatusCode: false aparece UNA SOLA VEZ
    cy.request({
      method: "POST",
      url: `${url}/Ofertas`,
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
      failOnStatusCode: false,
    }).as("postResponse");
  });
});

Then("la respuesta debe ser exitosa y retornar un ID", () => {
  cy.get("@postResponse").then((res) => {
    const errorDetail =
      res.status !== 200 && res.status !== 201
        ? ` | Body: ${JSON.stringify(res.body)}`
        : "";
    expect(
      [200, 201],
      `Status esperado 200/201, recibí ${res.status}${errorDetail}`
    ).to.include(res.status);

    const id =
      res.body.id ||
      res.body.value ||
      (res.body.data ? res.body.data.id : null);
    expect(id, "La API no devolvió un ID en la respuesta").to.not.be.null;
    cy.log(`✅ OE creada. ID: ${id}`);
    cy.wrap(id).as("oeId");
  });
});

// ── Escenario negativo ──────────────────────────────────────────────────────

When("envío la solicitud POST para crear la OE con body vacío", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "POST",
    url: `${url}/Ofertas`,
    headers: { Authorization: `Bearer ${token}` },
    body: {},
    failOnStatusCode: false,
  }).as("postResponseInvalido");
});

Then("la respuesta debe indicar un error de validación", () => {
  cy.get("@postResponseInvalido").then((res) => {
    expect(res.status).to.be.oneOf([400, 422]);
    cy.log(`✅ Error de validación recibido: ${res.status}`);
  });
});

// ── Consulta de operaciones ─────────────────────────────────────────────────

When("consulto las operaciones disponibles para entrega", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Operaciones/GetOperacionesAll`,
    headers: { Authorization: `Bearer ${token}` },
    qs: {
      LadoID: 2,
      MesDeEntregaRango: "MesEnCurso",
      DatosPortfolio: "ParaEntrega",
      PageIndex: 0,
      PageSize: 10,
      OrderBy: "Fecha desc",
    },
    failOnStatusCode: false,
  }).as("operacionesResponse");
});

Then("la respuesta debe contener una lista de operaciones", () => {
  cy.get("@operacionesResponse").then((res) => {
    expect(res.status).to.eq(200);
    const data =
      res.body.items ||
      res.body.data ||
      (Array.isArray(res.body) ? res.body : []);
    expect(data).to.be.an("array");
    expect(data.length, "La lista no debe estar vacía").to.be.at.least(1);
    cy.log(`✅ ${data.length} operaciones encontradas`);
  });
});

Then("cada operación debe tener operacionNumero y cantidadToneladas", () => {
  cy.get("@operacionesResponse").then((res) => {
    const data =
      res.body.items ||
      res.body.data ||
      (Array.isArray(res.body) ? res.body : []);
    data.forEach((op, i) => {
      expect(op.operacionNumero, `Operación ${i}: falta operacionNumero`).to.exist;
      expect(op.cantidadToneladas, `Operación ${i}: falta cantidadToneladas`).to.exist;
    });
    cy.log(`✅ Estructura validada en ${data.length} operaciones`);
  });
});