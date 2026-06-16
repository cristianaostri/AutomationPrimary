import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito los tipos de archivo del sobre digital", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/SobreDigital/GetTipoArchivo`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("tiposArchivo");
});

Then("cada tipo de archivo debe tener tipoArchivoId y archivoDescripcion", () => {
  cy.get("@tiposArchivo").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema TipoArchivoResponse: { tipoArchivoId, archivoDescripcion, esInterno, esVisible }
    items.forEach((t, i) => {
      expect(t.tipoArchivoId, `Tipo ${i}: tipoArchivoId`).to.exist;
      expect(t.archivoDescripcion, `Tipo ${i}: archivoDescripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} tipos de archivo del sobre digital`);
  });
});

When("consulto los archivos del sobre digital sin filtros de fecha", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  cy.request({
    method: "GET",
    url: `${url}/SobreDigital/Archivo`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("archivosSD");
});

Then("el resultado de sobre digital debe ser un array", () => {
  cy.get("@archivosSD").then((res) => {
    expect(res.status).to.eq(200);
    // Schema Array<ArchivoResponse>: { entidadId, tipoArchivoId, nombreArchivo, fecha }
    expect(Array.isArray(res.body)).to.eq(true);
    cy.log(`✅ ${res.body.length} archivos en sobre digital`);
  });
});
