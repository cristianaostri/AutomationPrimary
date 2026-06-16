import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ── Estado compartido entre steps ───────────────────────────────────────────
let caratulaNumeroActual;

// ── Given reutilizable: obtener una carátula existente del listado ───────────
// Reutiliza el step de getCaratula.js: "que tengo acceso a la API de OneClearing"
// y el When: "solicito el listado general de carátulas"
// Acá hacemos el encadenamiento: GET listado → tomar el primer número

Given("que obtengo una carátula existente del listado", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((response) => {
    expect(response.status).to.eq(200);
    const items =
      response.body.items ||
      response.body.data ||
      (Array.isArray(response.body) ? response.body : []);
    expect(items.length, "Debe haber al menos una carátula en el sistema").to.be.at.least(1);
    caratulaNumeroActual = items[0].caratulaNumero;
    cy.wrap(caratulaNumeroActual).as("caratulaNumero");
    cy.log(`Carátula de trabajo: ${caratulaNumeroActual}`);
  });
});

// ── GET /Caratulas/{numero} ──────────────────────────────────────────────────

When("solicito el detalle de esa carátula por número", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const numero = this.caratulaNumero;

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/${numero}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("caratulaDetalle");
});

When("solicito el detalle de la carátula número {int}", (numero) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/${numero}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("caratulaDetalle");
});

Then("la carátula debe tener los campos obligatorios del contrato", () => {
  cy.get("@caratulaDetalle").then((res) => {
    const c = res.body;
    // Campos del schema CaratulaResponse del Swagger
    expect(c.caratulaNumero, "caratulaNumero presente").to.exist;
    expect(c.ofertaNumero, "ofertaNumero presente").to.exist;
    expect(c.estadoCaratulaID, "estadoCaratulaID presente").to.exist;
    expect(c.cantidadToneladas, "cantidadToneladas presente").to.exist;
    expect(c.precio, "precio presente").to.not.be.undefined;
    expect(c.fechaVencimiento, "fechaVencimiento presente").to.exist;
    cy.log(`✅ Carátula ${c.caratulaNumero} — estado: ${c.estadoCaratulaID}, toneladas: ${c.cantidadToneladas}`);
  });
});

// ── GET /Caratulas/GetEstadoCaratulas ────────────────────────────────────────

When("solicito el listado de estados de carátulas", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/GetEstadoCaratulas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("estadosCaratulas");
});

Then("el listado de estados debe contener al menos un elemento con id y descripción", () => {
  cy.get("@estadosCaratulas").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length, "Debe haber al menos un estado").to.be.at.least(1);
    // Schema ElementoResponse: { id, descripcion }
    items.forEach((item, i) => {
      expect(item.id, `Estado ${i}: id presente`).to.exist;
      expect(item.descripcion, `Estado ${i}: descripcion presente`).to.exist;
    });
    cy.log(`✅ ${items.length} estados de carátulas encontrados`);
  });
});

// ── GET /Caratulas/consultageneral ───────────────────────────────────────────

When("realizo una consulta general de carátulas sin filtros", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/consultageneral`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("consultaGeneral");
});

When("realizo una consulta general de carátulas filtrando por estadoId {int}", (estadoId) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/consultageneral`,
    headers: { Authorization: `Bearer ${token}` },
    qs: { estadoId },
    failOnStatusCode: false,
  }).as("consultaGeneral");
});

Then("la respuesta debe tener estructura de página con items, pageIndex y totalCount", () => {
  cy.get("@consultaGeneral").then((res) => {
    expect(res.status).to.eq(200);
    // Schema CaratulaConsultaGeneralResponsePageDto
    expect(res.body.pageIndex, "pageIndex presente").to.not.be.undefined;
    expect(res.body.totalCount, "totalCount presente").to.not.be.undefined;
    expect(res.body.items, "items presente").to.not.be.undefined;
    cy.log(`✅ Consulta general: ${res.body.totalCount} carátulas, página ${res.body.pageIndex}`);
  });
});

Then("todas las carátulas del resultado deben tener estadoCaratulaID igual a {int}", (estadoEsperado) => {
  cy.get("@consultaGeneral").then((res) => {
    expect(res.status).to.eq(200);
    const items = res.body.items || [];
    if (items.length === 0) {
      cy.log("⚠️ Sin carátulas en ese estado — validación omitida");
      return;
    }
    items.forEach((c, i) => {
      expect(c.estadoCaratulaID, `Carátula ${i}: estadoCaratulaID debe ser ${estadoEsperado}`)
        .to.eq(estadoEsperado);
    });
    cy.log(`✅ ${items.length} carátulas con estadoCaratulaID=${estadoEsperado}`);
  });
});

// ── PUT /Caratulas ────────────────────────────────────────────────────────────

When("edito la carátula con datos válidos del fixture", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const numero = this.caratulaNumero;

  cy.fixture("api/caratulas/editarCaratula").then((body) => {
    cy.request({
      method: "PUT",
      url: `${url}/Caratulas`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
      body: { ...body, caratulaNumero: numero },
    }).as("editarCaratula");
  });
});

When("edito la carátula número {int} con datos válidos", (numero) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.fixture("api/caratulas/editarCaratula").then((body) => {
    cy.request({
      method: "PUT",
      url: `${url}/Caratulas`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
      body: { ...body, caratulaNumero: numero },
    }).as("editarCaratula");
  });
});

Then("la respuesta debe ser un booleano verdadero", () => {
  cy.get("@editarCaratula").then((res) => {
    expect(res.status).to.eq(200);
    // Schema: boolean
    expect(res.body).to.eq(true);
    cy.log("✅ Edición de carátula exitosa");
  });
});

// ── POST /Caratulas/solicitarAnulacion ───────────────────────────────────────

When("solicito la anulación de esa carátula con un motivo", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const numero = this.caratulaNumero;

  cy.request({
    method: "POST",
    url: `${url}/Caratulas/solicitarAnulacion`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
    // Schema SolicitarAnulacionRequest: { caratulaNumero, motivo }
    body: {
      caratulaNumero: numero,
      motivo: "Test automatizado — solicitud de anulación",
    },
  }).as("solicitarAnulacion");
});

Then("la respuesta de solicitud de anulación debe ser exitosa", () => {
  cy.get("@solicitarAnulacion").then((res) => {
    // 201 Created según el Swagger
    expect(res.status).to.be.oneOf([200, 201]);
    cy.log(`✅ Solicitud de anulación enviada: ${res.status}`);
  });
});

// ── GET /Caratulas/solicitudAnulacion ────────────────────────────────────────

When("consulto la solicitud de anulación de la carátula número {int}", (numero) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/solicitudAnulacion`,
    headers: { Authorization: `Bearer ${token}` },
    qs: { CaratulaNumero: numero },
    failOnStatusCode: false,
  }).as("solicitudAnulacion");
});

Then("la respuesta debe tener status 200 o indicar que no hay solicitud", () => {
  cy.get("@solicitudAnulacion").then((res) => {
    expect(res.status).to.be.oneOf([200, 400, 404]);
    if (res.status === 200) {
      // Schema MotivoResponse: { motivo }
      expect(res.body).to.have.property("motivo");
      cy.log(`Motivo: ${res.body.motivo}`);
    } else {
      cy.log(`⚠️ Sin solicitud de anulación para esa carátula: ${res.status}`);
    }
  });
});

// ── GET /Caratulas/AjustesSolicitados ────────────────────────────────────────

When("solicito el listado de carátulas con ajustes solicitados", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Caratulas/AjustesSolicitados`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("ajustesSolicitados");
});

Then("el listado puede estar vacío o contener carátulas con caratulaNumero", () => {
  cy.get("@ajustesSolicitados").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    if (items.length > 0) {
      // Schema AjusteSolicitadoResponse: { caratulaNumero, fechaCaratulacion, ... }
      items.forEach((item, i) => {
        expect(item.caratulaNumero, `Ajuste ${i}: caratulaNumero`).to.exist;
      });
      cy.log(`✅ ${items.length} carátulas con ajustes solicitados`);
    } else {
      cy.log("✅ Sin ajustes solicitados actualmente — lista vacía aceptada");
    }
  });
});

Then("la respuesta debe tener un status de error", () => {
  cy.get("@caratulaDetalle").then((res) => {
    expect(res.status).to.be.oneOf([400, 404, 422, 500]);
    cy.log(`✅ Error esperado recibido: ${res.status}`);
  });
});
