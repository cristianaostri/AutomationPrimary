import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ── GET /Ofertas ──────────────────────────────────────────────────────────────

When("solicito el listado de ofertas de entrega", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("ofertasListado");
});

Then("la respuesta de ofertas debe tener estructura paginada con items", () => {
  cy.get("@ofertasListado").then((res) => {
    expect(res.status).to.eq(200);
    // Schema OfertaEntregaResponsePageDto: { pageIndex, pageSize, totalCount, items }
    expect(res.body).to.have.property("items");
    expect(res.body).to.have.property("totalCount");
    expect(res.body).to.have.property("pageIndex");
    cy.log(`✅ ${res.body.totalCount} ofertas en total`);
  });
});

When("solicito las ofertas filtrando por estadoOfertaID {int}", (estadoId) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas`,
    headers: { Authorization: `Bearer ${token}` },
    qs: { EstadoOfertaID: estadoId },
    failOnStatusCode: false,
  }).as("ofertasListado");
});

Then("todas las ofertas deben tener ofertaNumero y estadoOfertaId", () => {
  cy.get("@ofertasListado").then((res) => {
    expect(res.status).to.eq(200);
    const items = res.body.items || [];
    if (items.length === 0) {
      cy.log("⚠️ Sin ofertas en ese estado — lista vacía aceptada");
      return;
    }
    items.forEach((o, i) => {
      expect(o.ofertaNumero, `Oferta ${i}: ofertaNumero`).to.exist;
      expect(o.estadoOfertaId, `Oferta ${i}: estadoOfertaId`).to.not.be.undefined;
    });
    cy.log(`✅ ${items.length} ofertas con estructura correcta`);
  });
});

// ── GET /Ofertas/{numero} ─────────────────────────────────────────────────────

Given("que obtengo una oferta existente del listado", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const items = res.body.items || [];
    expect(items.length, "Debe haber al menos una oferta").to.be.at.least(1);
    const numero = items[0].ofertaNumero;
    cy.wrap(numero).as("ofertaNumero");
    cy.log(`Oferta de trabajo: ${numero}`);
  });
});

When("solicito el detalle de esa oferta por número", function () {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const numero = this.ofertaNumero;

  cy.request({
    method: "GET",
    url: `${url}/Ofertas/${numero}`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("ofertaDetalle");
});

Then("la oferta debe tener los campos obligatorios del schema", () => {
  cy.get("@ofertaDetalle").then((res) => {
    expect(res.status).to.eq(200);
    // Schema OfertaEntregaResponse: { ofertaNumero, estado, estadoOfertaId, cantidadToneladas, ofertaCaratulas[] }
    const o = res.body;
    expect(o.ofertaNumero, "ofertaNumero").to.exist;
    expect(o.estadoOfertaId, "estadoOfertaId").to.not.be.undefined;
    expect(o.cantidadToneladas, "cantidadToneladas").to.not.be.undefined;
    expect(o.ofertaCaratulas, "ofertaCaratulas (requerido en schema)").to.not.be.undefined;
    cy.log(`✅ Oferta ${o.ofertaNumero} — estado: ${o.estadoOfertaId}, toneladas: ${o.cantidadToneladas}`);
  });
});

// ── GET /Ofertas/GetMedioTransporte ──────────────────────────────────────────

When("solicito los medios de transporte disponibles", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas/GetMedioTransporte`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("mediosTransporte");
});

Then("cada medio de transporte debe tener id y descripcion", () => {
  cy.get("@mediosTransporte").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema TipoTransporteResponse: { id, descripcion }
    items.forEach((m, i) => {
      expect(m.id, `Transporte ${i}: id`).to.exist;
      expect(m.descripcion, `Transporte ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} medios de transporte`);
  });
});

// ── GET /Ofertas/GetTipoEntregador ────────────────────────────────────────────

When("solicito los tipos de entregador disponibles", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas/GetTipoEntregador`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("tiposEntregador");
});

Then("cada tipo de entregador debe tener id y descripcion", () => {
  cy.get("@tiposEntregador").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema TipoEntregadorReponse: { id, descripcion }
    items.forEach((t, i) => {
      expect(t.id, `Entregador ${i}: id`).to.exist;
      expect(t.descripcion, `Entregador ${i}: descripcion`).to.exist;
    });
    cy.log(`✅ ${items.length} tipos de entregador`);
  });
});

// ── GET /Ofertas/Cosechas ─────────────────────────────────────────────────────

When("solicito las cosechas disponibles", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Ofertas/Cosechas`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("cosechas");
});

Then("cada cosecha debe tener clave y valor", () => {
  cy.get("@cosechas").then((res) => {
    expect(res.status).to.eq(200);
    const items = Array.isArray(res.body) ? res.body : [];
    expect(items.length).to.be.at.least(1);
    // Schema CosechaResponse: { clave, valor }
    items.forEach((c, i) => {
      expect(c.clave, `Cosecha ${i}: clave`).to.not.be.undefined;
      expect(c.valor, `Cosecha ${i}: valor`).to.exist;
    });
    cy.log(`✅ ${items.length} cosechas disponibles`);
  });
});
