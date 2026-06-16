import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito los operadores lógicos disponibles", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Filtros/OperadoresLogicos`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("operadoresLogicos");
});

Then("cada operador lógico debe tener id y descripcion", () => {
  cy.get("@operadoresLogicos").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    items.forEach((op, i) => {
      expect(op.id, `Operador ${i}: id`).to.exist;
      expect(op.descripcion, `Operador ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} operadores lógicos`);
  });
});
