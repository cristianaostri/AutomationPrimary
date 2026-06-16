import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

// ═══════════════════════════════════════════════════════════════════════════
// PARTE 1 — PARÁMETROS
// Lee la hora actual del parámetro 7 y la ajusta antes/después de crear OE
// ═══════════════════════════════════════════════════════════════════════════

// Guarda la hora original para poder restaurarla si se necesita
let horaOriginal = null;

When("obtengo el valor actual del parámetro de hora de corte", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Parametros`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(200);

    // Buscar el parámetro 7 (hora de corte)
    const params = res.body.items || res.body.data ||
      (Array.isArray(res.body) ? res.body : []);

    const param7 = params.find(p => p.parametroId === 7);
    expect(param7, "Debe existir el parámetro 7").to.exist;

    horaOriginal = param7.valor;
    cy.log(`🕐 Hora actual del parámetro 7: ${horaOriginal}`);
    cy.wrap(horaOriginal).as("horaOriginal");
  });
});

// Setea una hora MAYOR a la actual → permite crear OE
// Ej: si la hora actual es "21:00", pone "23:59"
When("actualizo el parámetro de hora de corte a una hora mayor", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.get("@horaOriginal").then((horaActual) => {
    // Calcular hora mayor: sumar 2 horas, tope 23:59
    const [hh, mm] = horaActual.split(":").map(Number);
    let nuevaHora = hh + 2;
    if (nuevaHora >= 24) nuevaHora = 23;
    const horaMayor = `${String(nuevaHora).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    cy.log(`⏰ Actualizando parámetro 7 a hora MAYOR: ${horaMayor} (era ${horaActual})`);

    cy.request({
      method: "PUT",
      url: `${url}/Parametros`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        parametroId: 7,
        valor: horaMayor,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 204]);
      cy.log(`✅ Parámetro 7 actualizado a ${horaMayor}`);
      cy.wrap(horaMayor).as("horaMayor");
    });
  });
});

// Setea una hora MENOR a la actual → permite iniciar casamiento
// Ej: si la hora original era "21:00", pone "00:00"
When("actualizo el parámetro de hora de corte a una hora menor", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.get("@horaOriginal").then((horaActual) => {
    // Calcular hora menor: restar 2 horas, mínimo 00:00
    const [hh, mm] = horaActual.split(":").map(Number);
    let nuevaHora = hh - 2;
    if (nuevaHora < 0) nuevaHora = 0;
    const horaMenor = `${String(nuevaHora).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;

    cy.log(`⏰ Actualizando parámetro 7 a hora MENOR: ${horaMenor} (era ${horaActual})`);

    cy.request({
      method: "PUT",
      url: `${url}/Parametros`,
      headers: { Authorization: `Bearer ${token}` },
      body: {
        parametroId: 7,
        valor: horaMenor,
      },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([200, 204]);
      cy.log(`✅ Parámetro 7 actualizado a ${horaMenor}`);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// PARTE 3 — CASAMIENTO
// ═══════════════════════════════════════════════════════════════════════════

When("inicio el proceso de casamiento", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.log("🚀 Iniciando casamiento...");

  cy.request({
    method: "POST",
    url: `${url}/Casamiento/IniciarCasamiento`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).as("iniciarCasamiento");
});

Then("la respuesta de inicio de casamiento debe ser exitosa", () => {
  cy.get("@iniciarCasamiento").then((res) => {
    cy.log(`Inicio casamiento → status: ${res.status} | Body: ${JSON.stringify(res.body)}`);
    expect(res.status).to.be.oneOf([200, 202]);
    if (res.status === 202) {
      cy.log(`Estado: ${res.body.title} — ${res.body.message}`);
    } else {
      cy.log("✅ Casamiento iniciado (200)");
    }
  });
});

When("ejecuto el proceso de casamiento con estado actual {int}", (estadoActualID) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.log(`⚙️ Ejecutando proceso — estadoActualID: ${estadoActualID}`);

  cy.request({
    method: "POST",
    url: `${url}/Procesos`,
    headers: { Authorization: `Bearer ${token}` },
    body: { tipoProcesoID: 1, ejecucionProcesoID: null, estadoActualID, continuar: true },
    failOnStatusCode: false,
  }).as("ejecutarCasamiento");
});

Then("el proceso de casamiento fue ejecutado correctamente", () => {
  cy.get("@ejecutarCasamiento").then((res) => {
    cy.log(`Ejecutar proceso → status: ${res.status} | Body: ${JSON.stringify(res.body)}`);
    expect(res.status).to.be.oneOf([200, 202]);
    if (res.status === 202) {
      cy.log(`✅ En curso: ${res.body.title} — ${res.body.message}`);
    } else {
      cy.log("✅ Ejecutado exitosamente (200)");
    }
  });
});

When("verifico que todas las carátulas están en estado casado", () => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.request({
    method: "GET",
    url: `${url}/Casamiento/Dashboard`,
    headers: { Authorization: `Bearer ${token}` },
    failOnStatusCode: false,
  }).then((res) => {
    expect(res.status).to.eq(200);
    const cards = res.body.cards || [];
    const pendientes = cards.filter(c => c.tienePendientes === true);

    if (pendientes.length > 0) {
      throw new Error(
        `No se puede finalizar: hay pendientes en: ${pendientes.map(c => c.titulo).join(", ")}`
      );
    }
    cy.log("✅ Todas las carátulas casadas — se puede finalizar");
  });
});

When("finalizo el proceso de casamiento con estado actual {int}", (estadoActualID) => {
  const url = Cypress.env("mainApiUrl");
  const token = Cypress.env("accessToken");

  cy.log(`🏁 Finalizando proceso — estadoActualID: ${estadoActualID}`);

  cy.request({
    method: "POST",
    url: `${url}/Procesos`,
    headers: { Authorization: `Bearer ${token}` },
    body: { tipoProcesoID: 1, ejecucionProcesoID: null, estadoActualID, continuar: true },
    failOnStatusCode: false,
  }).as("finalizarCasamiento");
});

Then("el proceso de casamiento fue finalizado correctamente", () => {
  cy.get("@finalizarCasamiento").then((res) => {
    cy.log(`Finalizar → status: ${res.status} | Body: ${JSON.stringify(res.body)}`);
    expect(res.status).to.be.oneOf([200, 202]);
    if (res.status === 202) {
      cy.log(`✅ Finalizando: ${res.body.title} — ${res.body.message}`);
    } else {
      cy.log("✅ Proceso finalizado exitosamente (200)");
    }
  });
});
