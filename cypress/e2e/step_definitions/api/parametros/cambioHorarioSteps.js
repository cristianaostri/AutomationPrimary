import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

const ejecutarCambioParametro = (accion, horaManual) => {
  let horarioFinal;

  if (horaManual) {
    // Opción 1: Usamos la hora hardcodeada del Feature
    horarioFinal = horaManual;
    cy.log(`Modo: Hardcodeado | Valor: ${horarioFinal}`);
  } else {
    // Opción 2: Lógica dinámica de sumar/restar horas
    const ahora = new Date();
    let horas = ahora.getHours();

    if (accion.toLowerCase() === "casar") {
      if (horas >= 2) {
        horas -= 2;
      } else {
        
        throw new Error(
          `La hora actual (${horas}) no se puede cambiar el horario para ${accion}.`,
        );
      }
    } else if (accion.toLowerCase() === "ofertar") {
      // Lógica: +2 horas con tope en 22:00hs
      horas = horas + 2 > 22 ? 22 : horas + 2;
    }

    // Formateamos a HH:00:00 asegurando los dos dígitos iniciales
    horarioFinal = `${horas.toString().padStart(2, "0")}:00`;
    cy.log(`Modo: Dinámico (${accion}) | Valor calculado: ${horarioFinal}`);
  }

  return cy
    .request({
      method: "PUT",
      url: `${Cypress.env("mainApiUrl")}/Parametros`,
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${Cypress.env("accessToken")}`,
      },
      body: {
        parametroId: 7,
        valor: horarioFinal,
      },
    })
    .as("postParametro");
};

Given("que tengo acceso a la api de OneClearing", () => {
  // expect(Cypress.env("mainApiUrl")).to.exist;
  // expect(Cypress.env("accessToken")).to.exist;
});

// Paso para la hora DINÁMICA
When("solicito el cambio de horario para {string}", (accion) => {
  ejecutarCambioParametro(accion, null);
});

// Paso para la hora HARDCODEADA (Soluciona el error de Cucumber)
When(
  "solicito el cambio de horario para {string} con el valor {string}",
  (accion, valor) => {
    ejecutarCambioParametro(accion, valor);
  },
);

Then("la API debe responder exitosamente", () => {
  // RECOMENDACIÓN: Usar cy.get('@alias') para evitar problemas de contexto 'this'
  cy.get("@postParametro").then((response) => {
    expect(response.status).to.eq(200);
    cy.log(`✅ Cambio exitoso: ${JSON.stringify(response.body)}`);
  });
});
