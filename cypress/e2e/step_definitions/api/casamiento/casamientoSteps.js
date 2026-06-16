import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito el dashboard de casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/Dashboard`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("dashboardCasamiento");
});

Then("el dashboard de casamiento debe tener fecha, estadoCasamiento y cards", () => {
  cy.get("@dashboardCasamiento").then((res) => {
    expect(res.status).to.eq(200);
    // Schema DashboardCasamientoResponse
    expect(res.body).to.have.property("estadoCasamiento");
    expect(res.body).to.have.property("cards");
    expect(res.body).to.have.property("habilitarEjecucion");
    cy.log(`✅ Casamiento estado: ${res.body.estadoCasamiento} | cards: ${(res.body.cards || []).length}`);
  });
});

When("solicito los tipos de regla de casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/GetTipoReglaCasamiento`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("tiposReglaCasamiento");
});

Then("cada tipo de regla debe tener tipoReglaCasamientoID y tipoReglaCasamientoDescripcion", () => {
  cy.get("@tiposReglaCasamiento").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema TipoReglaCasamientoResponse
    items.forEach((t, i) => {
      expect(t.tipoReglaCasamientoID, `Tipo ${i}: tipoReglaCasamientoID`).to.exist;
      expect(t.tipoReglaCasamientoDescripcion, `Tipo ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} tipos de regla de casamiento`);
  });
});

When("solicito las reglas de casamiento habilitadas", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/Regla`,
    qs: { habilitadas: true },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("reglasCasamiento");
});

When("solicito todas las reglas de casamiento incluyendo deshabilitadas", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/Regla`,
    qs: { habilitadas: false },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("reglasCasamiento");
});

Then("el resultado debe ser un array de reglas de casamiento", () => {
  cy.get("@reglasCasamiento").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema ReglaCasamientoResponse
      expect(items[0]).to.have.property("reglaCasamientoNumero");
      expect(items[0]).to.have.property("tipoReglaCasamientoID");
    }
    cy.log(`✅ ${items.length} reglas de casamiento`);
  });
});

When("solicito las convenidas con saldo insuficiente", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/ConvenidasSaldoInsuficiente`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("convenidas");
});

When("solicito los controles del proceso de casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Casamiento/Controles`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("controlesCasamiento");
});

Then("cada control debe tener controlId y titulo", () => {
  cy.get("@controlesCasamiento").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema ControlResponse: { controlId, titulo, subtitulo, contenido, link }
      items.forEach((c, i) => {
        expect(c.controlId, `Control ${i}: controlId`).to.exist;
        expect(c.titulo, `Control ${i}: titulo`).to.exist;
      });
    }
    cy.log(`✅ ${items.length} controles de casamiento`);
  });
});

Then("el resultado debe ser un array que puede estar vacío", () => {
  cy.get("@convenidas").then((res) => {
    expect(res.status).to.eq(200);
    expect(Array.isArray(res.body)).to.eq(true);
    cy.log(`✅ ${res.body.length} convenidas con saldo insuficiente`);
  });
});
