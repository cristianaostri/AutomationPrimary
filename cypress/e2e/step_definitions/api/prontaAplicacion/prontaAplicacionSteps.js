import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito el listado de prontas aplicaciones", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/ProntaAplicacion`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("prontasAplicaciones");
});

Then("la respuesta de pronta aplicación debe tener estructura paginada", () => {
  cy.get("@prontasAplicaciones").then((res) => {
    expect(res.status).to.eq(200);
    // Schema ProntaAplicacionResponsePageDto: { pageIndex, pageSize, totalCount, items }
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("items");
    cy.log(`✅ ${res.body.totalCount} prontas aplicaciones`);
  });
});

When("solicito los contratos activos para pronta aplicación", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/ProntaAplicacion/GetContratosActivos`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("contratosActivos");
});

When("solicito las cuentas de clientes para pronta aplicación", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/ProntaAplicacion/GetCuentasClientes`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("clientesProntaAplicacion");
});

Then("cada cliente de pronta aplicación debe tener clienteCodigo y clienteDescripcion", () => {
  cy.get("@clientesProntaAplicacion").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema ClienteActivo: { clienteCodigo, clienteDescripcion }
      items.forEach((c, i) => {
        expect(c.clienteCodigo, `Cliente ${i}: clienteCodigo`).to.exist;
        expect(c.clienteDescripcion, `Cliente ${i}: clienteDescripcion`).to.exist;
      });
    }
    cy.log(`✅ ${items.length} clientes para pronta aplicación`);
  });
});
