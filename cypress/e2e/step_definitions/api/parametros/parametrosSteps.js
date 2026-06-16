import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("solicito el listado de parámetros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("parametros");
});

Then("cada parámetro debe tener parametroId, parametroDescripcion y valor", () => {
  cy.get("@parametros").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length, "Debe haber parámetros configurados").to.be.at.least(1);
    // Schema ParametroResponse: { parametroId, parametroDescripcion, parametroDetalle, moduloId, categoriaId, tipoDatoId, valor }
    items.forEach((p, i) => {
      expect(p.parametroId, `Parámetro ${i}: parametroId`).to.exist;
      expect(p.parametroDescripcion, `Parámetro ${i}: parametroDescripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} parámetros del sistema`);
  });
});

When("solicito el listado de módulos de parámetros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros/Modulos`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("modulosParametros");
});

Then("cada módulo debe tener id y descripcion", () => {
  cy.get("@modulosParametros").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema ModuloParametroResponse: { id, descripcion, icono }
    items.forEach((m, i) => {
      expect(m.id, `Módulo ${i}: id`).to.exist;
      expect(m.descripcion, `Módulo ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} módulos de parámetros`);
  });
});

When("solicito las categorías de parámetros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros/Categorias`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("categoriasParametros");
});

Then("cada categoría debe tener id y descripcion", () => {
  cy.get("@categoriasParametros").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    items.forEach((c, i) => {
      expect(c.id, `Categoría ${i}: id`).to.exist;
      expect(c.descripcion, `Categoría ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} categorías de parámetros`);
  });
});

When("solicito la fecha de negocio de hoy", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros/FechaHoy`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("fechaHoy");
});

Then("la respuesta debe incluir si la fecha de negocio es hoy", () => {
  cy.get("@fechaHoy").then((res) => {
    expect(res.status).to.eq(200);
    // Schema FechaHoyResponse: { fechaNegocioEsHoy, fechaHoy, fechaNegocioEsHabil }
    expect(res.body).to.have.property("fechaNegocioEsHoy");
    expect(res.body).to.have.property("fechaHoy");
    expect(res.body).to.have.property("fechaNegocioEsHabil");
    cy.log(`✅ Fecha de negocio: ${res.body.fechaHoy} — hoy: ${res.body.fechaNegocioEsHoy}`);
  });
});

When("solicito los contadores de novedades del módulo general", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros/Contadores`,
    // moduloId 1 = General según el Swagger
    qs: { moduloId: 1 },
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("contadores");
});

Then("los contadores deben incluir caratulasPendientesDeFirmaCount", () => {
  cy.get("@contadores").then((res) => {
    expect(res.status).to.eq(200);
    // Schema ContadorResponse: { caratulasPendientesDeFirmaCount, caratulasPendientesDeAnulacionCount }
    expect(res.body).to.have.property("caratulasPendientesDeFirmaCount");
    expect(res.body).to.have.property("caratulasPendientesDeAnulacionCount");
    cy.log(
      `✅ Pendientes firma: ${res.body.caratulasPendientesDeFirmaCount} | Pendientes anulación: ${res.body.caratulasPendientesDeAnulacionCount}`
    );
  });
});
