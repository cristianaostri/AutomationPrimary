import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// tipoProcesoID 1 = Casamiento según el Swagger

When("consulto el estado del proceso de casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Procesos`,
    qs: { tipoProcesoID: 1 },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("estadoProceso");
});

Then("la respuesta debe indicar si el proceso terminó o está en curso", () => {
  cy.get("@estadoProceso").then((res) => {
    // 200 = terminó | 202 = en curso con MensajeEstadoProcesoResponse
    expect(res.status).to.be.oneOf([200, 202]);
    if (res.status === 202) {
      expect(res.body).to.have.property("title");
      expect(res.body).to.have.property("message");
      cy.log(`Proceso en curso: ${res.body.title}`);
    } else {
      cy.log("✅ Proceso finalizado");
    }
  });
});

When("solicito los subprocesos del tipo de proceso casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Procesos/Subprocesos`,
    qs: { tipoProcesoID: 1 },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("subprocesos");
});

Then("cada subproceso debe tener tipoSubprocesoID y orden", () => {
  cy.get("@subprocesos").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema TipoSubprocesoResponse: { tipoSubprocesoID, tipoSubprocesoDescripcion, orden }
    items.forEach((s, i) => {
      expect(s.tipoSubprocesoID, `Subproceso ${i}: tipoSubprocesoID`).to.exist;
      expect(s.orden, `Subproceso ${i}: orden`).to.not.be.undefined;
    });
    cy.log(`✅ ${items.length} subprocesos de casamiento`);
  });
});
