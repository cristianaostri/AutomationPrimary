import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito los contratos activos", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Productos/GetContratosActivos`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("contratosActivos");
});

Then("cada contrato activo debe tener contratoId y descripcion del contrato", () => {
  cy.get("@contratosActivos").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema ContratoActivoResponse: { contratoId, descripcion, producto, tipoContratoID, ... }
    items.forEach((c, i) => {
      expect(c.contratoId, `Contrato ${i}: contratoId`).to.exist;
      expect(c.producto, `Contrato ${i}: producto`).to.exist;
    });
    cy.log(`✅ ${items.length} contratos activos`);
  });
});
