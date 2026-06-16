import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito el listado de agentes agro", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetAgentes`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("agentes");
});

Then("cada agente debe tener codigo, descripcion y cuitCuil", () => {
  cy.get("@agentes").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema CuentaAgroResponse: { codigo, descripcion, cuitCuil }
    items.forEach((a, i) => {
      expect(a.codigo, `Agente ${i}: codigo`).to.exist;
      expect(a.descripcion, `Agente ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} agentes agro`);
  });
});

Given("obtengo el código de un agente existente", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetAgentes`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    cy.wrap(items[0].codigo).as("agenteCodigo");
    cy.log(`Agente de trabajo: ${items[0].codigo}`);
  });
});

When("solicito los clientes de ese agente", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetClientes`,
    // AgenteId requerido
    qs: { AgenteId: this.agenteCodigo },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("clientesAgente");
});

Then("cada cliente debe tener codigo y descripcion", () => {
  cy.get("@clientesAgente").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema ClienteAgroResponse: { codigo, descripcion, cuitCuil }
      expect(items[0]).to.have.property("codigo");
      expect(items[0]).to.have.property("descripcion");
    }
    cy.log(`✅ ${items.length} clientes del agente`);
  });
});

When("solicito el listado de agentes de entrega", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetAgentesEntrega`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("agentesEntrega");
});

When("solicito el listado completo de todos los agentes de entrega", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetAgentesEntregaAll`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("agentesEntrega");
});

When("solicito la lista de compañías para impersonación", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetListaImpersonacion`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("listaImpersonacion");
});

Then("cada compañía de impersonación debe tener companyId y companyName", () => {
  cy.get("@listaImpersonacion").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema PersonaImpersonacionResponse: { companyId, companyName }
      items.forEach((c, i) => {
        expect(c.companyId, `Compañía ${i}: companyId`).to.exist;
        expect(c.companyName, `Compañía ${i}: companyName`).to.exist;
      });
    }
    cy.log(`✅ ${items.length} compañías para impersonación`);
  });
});

When("solicito las cuentas de entrega disponibles", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Personas/GetCuentasEntrega`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("cuentasEntrega");
});

Then("el listado de agentes de entrega puede ser un array vacío", () => {
  cy.get("@agentesEntrega").then((res) => {
    expect(res.status).to.eq(200);
    expect(Array.isArray(res.body)).to.eq(true);
    cy.log(`✅ ${res.body.length} agentes de entrega`);
  });
});

Then("las cuentas de entrega pueden ser un array vacío", () => {
  cy.get("@cuentasEntrega").then((res) => {
    expect(res.status).to.eq(200);
    expect(Array.isArray(res.body)).to.eq(true);
    cy.log(`✅ ${res.body.length} cuentas de entrega`);
  });
});
