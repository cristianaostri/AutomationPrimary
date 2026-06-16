import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// Given reutilizado de caratulasDetalleSteps.js: "que obtengo una carátula existente del listado"

When("solicito las carátulas disponibles para facturar", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/Caratulas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("facturacionCaratulas");
});

Then("la respuesta de facturación debe tener totalCount e items", () => {
  cy.get("@facturacionCaratulas").then((res) => {
    expect(res.status).to.eq(200);
    // Schema CaratulasFacturacionListResponse: { totalCount, items }
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("items");
    cy.log(`✅ ${res.body.totalCount} carátulas para facturar`);
  });
});

When("solicito los estados de recibos", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/Recibos/Estados`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("estadosRecibos");
});

Then("cada estado de recibo debe tener id y descripcion", () => {
  cy.get("@estadosRecibos").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema ElementoResponse: { id, descripcion }
    items.forEach((e, i) => {
      expect(e.id, `Estado ${i}: id`).to.exist;
      expect(e.descripcion, `Estado ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} estados de recibos`);
  });
});

When("realizo una consulta general de recibos sin filtros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/Recibos`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("recibosConsulta");
});

Then("la respuesta de recibos debe tener estructura paginada", () => {
  cy.get("@recibosConsulta").then((res) => {
    expect(res.status).to.eq(200);
    // Schema RecibosCaratulaResumenResponse: { pageIndex, pageSize, totalCount, items, totalKilos }
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("items");
    expect(res.body).to.have.property("totalKilos");
    cy.log(`✅ ${res.body.totalCount} recibos | ${res.body.totalKilos} kg totales`);
  });
});

When("solicito los recibos reservados pendientes de facturar", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/Recibos/Reservados`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("recibosReservados");
});

Then("la respuesta debe tener totales y lista de recibos reservados", () => {
  cy.get("@recibosReservados").then((res) => {
    expect(res.status).to.eq(200);
    // Schema RecibosReservadosResponseDTO: { totales, recibos }
    expect(res.body).to.have.property("totales");
    expect(res.body).to.have.property("recibos");
    const totales = res.body.totales || {};
    expect(totales).to.have.property("totalKilos");
    cy.log(`✅ ${(res.body.recibos || []).length} recibos reservados | ${totales.totalKilos} kg`);
  });
});

When("solicito el estado del servicio LPG en AFIP", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/LPGServicio/Estado`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("lpgEstado");
});

Then("la respuesta debe incluir code y serviceName del servicio", () => {
  cy.get("@lpgEstado").then((res) => {
    expect(res.status).to.eq(200);
    // Schema LPGServicioEstadoResponse: { code, message, serviceName }
    expect(res.body).to.have.property("code");
    expect(res.body).to.have.property("serviceName");
    cy.log(`✅ LPG servicio: ${res.body.serviceName} código ${res.body.code}`);
  });
});

When("solicito los recibos de esa carátula", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const numero = this.caratulaNumero;
  cy.request({
    method: "GET",
    url: `${url}/Facturacion/RecibosPorCaratula/${numero}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("recibosPorCaratula");
});

Then("la respuesta de recibos por carátula debe tener totalKilos e items", () => {
  cy.get("@recibosPorCaratula").then((res) => {
    expect(res.status).to.eq(200);
    // Schema RecibosByCaratulaResponse: { totalKilos, items }
    expect(res.body).to.have.property("totalKilos");
    expect(res.body).to.have.property("items");
    cy.log(`✅ Recibos: ${(res.body.items || []).length} items | ${res.body.totalKilos} kg`);
  });
});
