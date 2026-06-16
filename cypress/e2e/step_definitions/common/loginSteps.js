import { Given, When, Then } from "@badeball/cypress-cucumber-preprocessor";
import loginPage from "../../../support/page-objects/front/LoginPage";

Given("que el usuario navega a la pagina de inicio de sesion", () => {
  loginPage.visit();
});

When("el usuario ingresa credenciales validas", () => {
  // Cypress.env() busca en las variables cargadas desde qa.js/dev.js
  const user = Cypress.env('frontendUser'); 
  const pass = Cypress.env('frontendPassword');
  
  loginPage.login(user, pass);
});

Then("debería ver el dashboard", () => {
  cy.url().should('not.include', '/login');
});