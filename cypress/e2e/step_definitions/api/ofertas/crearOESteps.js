import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ── Buscar operación por tipo de contrato ────────────────────────────────────

When("busco una operación disponible de tipo {string}", (tipoContrato) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");
  const mesRango = tipoContrato === "Disponible" ? "Completo" : "MesEnCurso";

  cy.log(`🔍 Buscando operaciones de tipo ${tipoContrato}`);

  const buscarOps = (rango) =>
    cy.request({
      method: "GET",
      url: `${url}/Operaciones/GetOperacionesAll`,
      headers: { Authorization: `Bearer ${token}` },
      failOnStatusCode: false,
      qs: {
        TipoContrato: tipoContrato,
        LadoID: 2,
        DatosPortfolio: "ParaEntrega",
        MesDeEntregaRango: rango,
        PageIndex: 0,
        PageSize: 5,
        OrderBy: "Fecha desc",
      },
    });

  buscarOps(mesRango).then((res) => {
    expect(res.status).to.eq(200);
    const data = res.body.items || res.body.data ||
      (Array.isArray(res.body) ? res.body : []);

    if (data.length === 0 && tipoContrato === "Futuro") {
      cy.log("⚠️ Sin ops en MesEnCurso — reintentando con MesSiguiente");
      buscarOps("MesSiguiente").then((res2) => {
        const data2 = res2.body.items || res2.body.data ||
          (Array.isArray(res2.body) ? res2.body : []);
        expect(data2.length, `No hay operaciones de tipo ${tipoContrato}`).to.be.at.least(1);
        cy.wrap(data2[0]).as("operacionSeleccionada");
        cy.log(`✅ Op #${data2[0].operacionNumero} | ${data2[0].cantidadToneladas} ton`);
      });
    } else {
      expect(data.length, `No hay operaciones de tipo ${tipoContrato}`).to.be.at.least(1);
      cy.wrap(data[0]).as("operacionSeleccionada");
      cy.log(`✅ Op #${data[0].operacionNumero} | ${data[0].cantidadToneladas} ton`);
    }
  });
});

// ── Preparar payload — toma el fixture como base y reemplaza operaciones ─────

When("preparo el payload de OE con esa operación", () => {
  cy.get("@operacionSeleccionada").then((op) => {
    cy.fixture("api/operaciones/crearOferta").then((base) => {
      // Spread del fixture completo — solo se sobreescriben las operaciones
      const payload = {
        ...base,
        operaciones: [{
          operacionNumero: op.operacionNumero,
          cantidadToneladas: op.cantidadToneladas,
        }],
      };
      cy.log(`📦 Op #${op.operacionNumero} — ${op.cantidadToneladas} ton`);
      cy.wrap(payload).as("oePayload");
    });
  });
});

When("preparo el payload de OE con esa operación y {int} toneladas", (toneladas) => {
  cy.get("@operacionSeleccionada").then((op) => {
    cy.fixture("api/operaciones/crearOferta").then((base) => {
      const toneladasAUsar = Math.min(toneladas, op.cantidadToneladas);
      if (toneladasAUsar < toneladas) {
        cy.log(`⚠️ Op solo tiene ${op.cantidadToneladas} ton — usando ese valor`);
      }
      // Spread del fixture completo — solo se sobreescriben las operaciones
      const payload = {
        ...base,
        operaciones: [{
          operacionNumero: op.operacionNumero,
          cantidadToneladas: toneladasAUsar,
        }],
      };
      cy.log(`📦 Op #${op.operacionNumero} — ${toneladasAUsar} ton`);
      cy.wrap(payload).as("oePayload");
    });
  });
});

// ── POST /Ofertas ─────────────────────────────────────────────────────────────

When("envío el POST para crear la OE", () => {
  cy.get("@oePayload").then((payload) => {
    const url = Cypress.env("mainApiUrl");
    const token = Cypress.env("accessToken");

    cy.log(`🚀 POST /Ofertas → Op #${payload.operaciones[0].operacionNumero}`);

    cy.request({
      method: "POST",
      url: `${url}/Ofertas`,
      headers: { Authorization: `Bearer ${token}` },
      body: payload,
      failOnStatusCode: false,
    }).as("crearOEResponse");
  });
});

When("envío el POST para crear la OE sin operaciones", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.fixture("api/operaciones/crearOferta").then((base) => {
    cy.request({
      method: "POST",
      url: `${url}/Ofertas`,
      headers: { Authorization: `Bearer ${token}` },
      // Fixture como base pero con operaciones vacías
      body: { ...base, operaciones: [] },
      failOnStatusCode: false,
    }).as("crearOEResponse");
  });
});

// ── Thens ─────────────────────────────────────────────────────────────────────

Then("la OE fue creada exitosamente con un número de oferta", () => {
  cy.get("@crearOEResponse").then((res) => {
    const errorDetail = res.status !== 200 && res.status !== 201
      ? ` | Body: ${JSON.stringify(res.body)}` : "";

    expect([200, 201],
      `Status esperado 200/201, recibí ${res.status}${errorDetail}`
    ).to.include(res.status);

    // Schema OfertaCreadaResponse: { ofertaNumero, cantidad }
    const ofertaNumero = res.body.ofertaNumero || res.body.id || res.body.value;
    expect(ofertaNumero, "Debe retornar número de oferta").to.exist;
    expect(ofertaNumero).to.be.greaterThan(0);
    cy.log(`✅ OE creada. Oferta #${ofertaNumero}`);
  });
});

Then("la creación de OE debe retornar error de validación", () => {
  cy.get("@crearOEResponse").then((res) => {
    expect(res.status).to.be.oneOf([400, 422]);
    cy.log(`✅ Error de validación esperado: ${res.status}`);
  });
});
