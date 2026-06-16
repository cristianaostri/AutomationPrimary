import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("consulto los logs del sistema sin filtros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Log`,
    headers: { Authorization: `Bearer ${token}` },
    qs: { PageIndex: 0, PageSize: 10 },
    failOnStatusCode: false,
  }).as("logs");
});

When("consulto los logs del sistema filtrando por nivel Error", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Log`,
    headers: { Authorization: `Bearer ${token}` },
    // NivelLog enum: Debug | Information | Warning | Error | Fatal
    qs: { Nivel: "Error", PageIndex: 0, PageSize: 10 },
    failOnStatusCode: false,
  }).as("logs");
});

Then("la respuesta de logs debe tener estructura paginada con items de log", () => {
  cy.get("@logs").then((res) => {
    expect(res.status).to.eq(200);
    // Schema LogResponsePageDto: { pageIndex, pageSize, totalCount, items }
    expect(res.body).to.have.property("pageIndex");
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("items");
    const items = res.body.items || [];
    if (items.length > 0) {
      // Schema LogResponse: { timestamp, nivel, mensaje, usuario, requestId }
      expect(items[0]).to.have.property("timestamp");
      expect(items[0]).to.have.property("nivel");
    }
    cy.log(`✅ ${res.body.totalCount} logs totales, ${items.length} en esta página`);
  });
});

When("solicito el ranking de queries del sistema", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/Log/ranking`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("logRanking");
});

Then("el ranking debe tener consultasMasUtilizadas y consultasMasLargas", () => {
  cy.get("@logRanking").then((res) => {
    expect(res.status).to.eq(200);
    // Schema QueryRankingResponse: { consultasMasUtilizadas, consultasMasPesadasPromedio, consultasMasLargas }
    expect(res.body).to.have.property("consultasMasUtilizadas");
    expect(res.body).to.have.property("consultasMasPesadasPromedio");
    expect(res.body).to.have.property("consultasMasLargas");
    cy.log(`✅ Ranking: ${(res.body.consultasMasUtilizadas || []).length} queries más usadas`);
  });
});
