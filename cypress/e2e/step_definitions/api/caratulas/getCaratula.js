import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let apiResponse; // Variable global

Given("que tengo acceso a la API de OneClearing", () => {
  expect(Cypress.env("mainApiUrl")).to.exist;
});

When("solicito el listado general de carátulas", () => {
  const url = `${Cypress.env("mainApiUrl")}/Caratulas`;
  const token = Cypress.env("accessToken");

  return cy.request({
    method: "GET",
    url: url,
    headers: {
      Authorization: `Bearer ${token}`
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status >= 400) {
      throw new Error(`API Error ${response.status}: ${JSON.stringify(response.body)}`);
    }
    apiResponse = response; 
  });
});

Then("la respuesta debe tener un status 200", () => {
  expect(apiResponse.status).to.eq(200);
});

Then("el tiempo de respuesta debe ser inferior a {int}ms", (maxTime) => {
  expect(apiResponse.duration).to.be.lessThan(maxTime);
});

Then("no debe haber campos con valores vacíos en los registros", () => {
  const registros = apiResponse.body.items || apiResponse.body;
  const fallos = [];
  expect(registros, "La respuesta  contiene una lista válida").to.be.an('array');

  registros.forEach((item, i) => {
    // 1. Extraemos el identificador para el reporte
    const idRegistro = item.caratulaNumero || item.id || `Índice ${i}`;

    Object.entries(item).forEach(([key, value]) => {
      // 2. Validamos vacío o undefined (null queda fuera según tu preferencia)
      if (value === undefined || value === "") {
        
        fallos.push({
          Registro: idRegistro,
          Campo: key,
          Estado: "VACÍO/UNDEFINED"
        });
        
      }
    });
  });
   if (fallos.length > 0) {
    // 1. Esto imprime una tabla hermosa en la consola del navegador (F12)
    console.table(fallos);
    
    // 2. Esto lo muestra en el log de Cypress para el reporte
    cy.log('⚠️ Se encontraron inconsistencias. Revisar console.table en DevTools');
    
    // --- EL ERROR QUE SALTA AL FINAL ---
    const mensajeError = fallos.map(f => `[ID: ${f.Registro}] Campo: ${f.Campo}`).join('\n');
    expect(fallos, `Se detectaron ${fallos.length} campos vacíos:\n${mensajeError}`).to.be.empty;
  } else {
    cy.log(`✅ Éxito: ${registros.length} registros auditados sin campos vacíos.`);
  }
});

Then("no debe haber caratulas en estadoId 4 y 5", () => {
  const registros = apiResponse.body.items;
  const caratulasInvalidas = registros.filter(item => item.estadoId === 4 || item.estadoId === 5);
  
  if (caratulasInvalidas.length > 0) {
    console.table(caratulasInvalidas);
    cy.log('⚠️ Se encontraron carátulas en estadoId 4 o 5. Revisar console.table en DevTools');
    const mensajeError = caratulasInvalidas.map(c => `CarátulaNumero: ${c.caratulaNumero}, EstadoId: ${c.estadoId}`).join('\n');
    expect(caratulasInvalidas, `Se detectaron ${caratulasInvalidas.length} carátulas inválidas:\n${mensajeError}`).to.be.empty;
  } else {
    cy.log(`✅ Éxito: No se encontraron carátulas en estadoId 4 o 5.`);
  }
});

Then("cada carátula debe tener un caratulaNumero único", () => {
  const registros = apiResponse.body.items;
  const numerosVistos = new Set();
  const duplicados = [];

  registros.forEach(item => {
    if (numerosVistos.has(item.caratulaNumero)) {
      duplicados.push(item);
    } else {
      numerosVistos.add(item.caratulaNumero);
    }
  });

  if (duplicados.length > 0) {
    console.table(duplicados);
    cy.log('⚠️ Se encontraron carátulas con caratulaNumero duplicado. Revisar console.table en DevTools');
    const mensajeError = duplicados.map(c => `CarátulaNumero: ${c.caratulaNumero}`).join('\n');
    expect(duplicados, `Se detectaron ${duplicados.length} carátulas con número duplicado:\n${mensajeError}`).to.be.empty;
  } else {
    cy.log(`✅ Éxito: Todos los caratulaNumero son únicos.`);
  }
}); 