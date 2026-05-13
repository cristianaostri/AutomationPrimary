import { Before } from "@badeball/cypress-cucumber-preprocessor";
import LoginPage from "../../support/page-objects/front/LoginPage"; // Ajusta la ruta

Before({ tags: "@api" }, () => {
  cy.log("🚀 Sincronizando sesión de API...");
  cy.loginViaApi();
});

Before({ tags: "@front" }, () => {
   LoginPage.visit();
   LoginPage.login("cris", "cris");
  cy.log("✅ Sesión de frontend lista");
});

