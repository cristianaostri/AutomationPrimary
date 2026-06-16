import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito la limpieza de caché del sistema", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "POST",
    url: `${url}/Sistema/LimpiarCache`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("limpiarCache");
});

Then("la respuesta de sistema debe ser exitosa", () => {
  cy.get("@limpiarCache").then((res) => {
    expect(res.status).to.eq(200);
    cy.log("✅ Caché del sistema limpiada correctamente");
  });
});
