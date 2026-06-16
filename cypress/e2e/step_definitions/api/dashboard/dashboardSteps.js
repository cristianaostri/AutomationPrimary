import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Given reutilizado de getCaratula.js: "que tengo acceso a la API de OneClearing"

When("solicito el dashboard principal", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Dashboard`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("dashboard");
});

Then("el dashboard debe tener las secciones caratulado, presentado y pendiente", () => {
  cy.get("@dashboard").then((res) => {
    expect(res.status).to.eq(200);
    // Schema DashboardResponse: { caratulado, presentado, pendiente, ofertasDia }
    expect(res.body).to.have.property("caratulado");
    expect(res.body).to.have.property("presentado");
    expect(res.body).to.have.property("pendiente");
    cy.log("✅ Dashboard con todas las secciones presentes");
  });
});

When("solicito el volumen caratulado", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Dashboard/volumencaratulado`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("volumenCaratulado");
});

Then("la respuesta de volumen debe tener fecha y contratos", () => {
  cy.get("@volumenCaratulado").then((res) => {
    expect(res.status).to.eq(200);
    // Schema VolumenCaratuladoWrapperResponse: { fecha, contratos }
    expect(res.body).to.have.property("contratos");
    cy.log(`✅ Volumen caratulado: ${(res.body.contratos || []).length} contratos`);
  });
});

When("solicito compras y ventas abiertas para el mes en curso", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Dashboard/comprasventasabiertas`,
    headers: { Authorization: `Bearer ${token}` },
    // MesDeEntregaRango enum: MesEnCurso | MesSiguiente | Completo
    qs: { MesDeEntregaRango: "MesEnCurso" },
    failOnStatusCode: false,
  }).as("comprasVentasAbiertas");
});

Then("la respuesta de compras y ventas abiertas debe tener estructura paginada", () => {
  cy.get("@comprasVentasAbiertas").then((res) => {
    expect(res.status).to.eq(200);
    expect(res.body).to.have.property("pageIndex");
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("items");
    cy.log(`✅ Compras/ventas abiertas: ${res.body.totalCount} registros`);
  });
});
