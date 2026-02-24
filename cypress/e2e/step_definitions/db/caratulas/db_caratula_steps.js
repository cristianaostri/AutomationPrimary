import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";

let caratulas;

Given("que el sistema está conectado a la base de datos del ambiente elegido", () => {
  cy.log("Utilizando configuración de ambiente: " + Cypress.env('CYPRESS_ENV'));
});

When("ejecuto una consulta para obtener las últimas 5 carátulas", () => {

  const query = "SELECT TOP 5 * FROM Caratula.Caratula ORDER BY FechaCreacion DESC";
  
  cy.task("queryDb", query).then((result) => {
    caratulas = result;
  });
});

Then("la respuesta debería contener registros válidos", () => {
  expect(caratulas).to.not.be.null;
  expect(caratulas.length).to.be.at.least(1);
  console.log(`✅ Se encontraron ${caratulas.length} carátulas.`);
});

Then("muestro la carátulaNumero y la Fecha de la primera carátula en el log", () => {
 const primera = caratulas[0];
 
  cy.log(`📄 Carátula Numero: ${primera.CaratulaNumero}`);
  cy.log(`📅 Fecha: ${primera.FechaCreacion}`);
});