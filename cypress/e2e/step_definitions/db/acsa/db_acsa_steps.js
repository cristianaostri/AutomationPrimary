import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import dayjs from "dayjs";

let response;
let lastGeneratedOpe;

Given("que tengo conexión a la base de datos ACSA en {string}", (ip) => {
  cy.log(`🌐 Validando acceso a la red de ACSA en: ${ip}`);
});

When("inyecto la operación con los siguientes datos:", (dataTable) => {
  const data = dataTable.rowsHash();
  const fechaHoy = dayjs().format('YYYYMMDD');

  if (data.sufijo === "AUTO") {
    // ⚠️ AGREGAMOS 'return' AL PRINCIPIO
    return cy.task("getLatestOpeMercado", fechaHoy).then((lastID) => {
      const nuevoSufijo = lastID 
        ? (parseInt(lastID.toString().slice(-2)) + 1).toString().padStart(2, '0') 
        : "01";
      
      lastGeneratedOpe = `${fechaHoy}${nuevoSufijo}`;
      
      // ⚠️ OTRO 'return' AQUÍ ADENTRO ya que al ver más de un task, cypress necesita que cada uno esté encadenado con return para manejar correctamente las promesas
      return cy.task("createCarteraManual", { ...data, opeMercado: lastGeneratedOpe });
    });
  } else {
    lastGeneratedOpe = `${fechaHoy}${data.sufijo}`;
    // ⚠️ 'return' PARA EL FLUJO MANUAL
    return cy.task("createCarteraManual", { ...data, opeMercado: lastGeneratedOpe });
  }
});

