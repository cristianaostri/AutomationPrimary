import { Before } from "@badeball/cypress-cucumber-preprocessor";

Before({ tags: "@api" }, () => {
  cy.log("🚀 Sincronizando sesión de API...");
  cy.loginViaApi();
});