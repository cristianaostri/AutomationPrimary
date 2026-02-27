const { defineConfig } = require("cypress");
const createBundler = require("@bahmutov/cypress-esbuild-preprocessor");
const addCucumberPreprocessorPlugin = require("@badeball/cypress-cucumber-preprocessor").addCucumberPreprocessorPlugin;
const createEsbuildPlugin = require("@badeball/cypress-cucumber-preprocessor/esbuild").createEsbuildPlugin;
const registerDbTasks = require("./cypress/support/db-task");

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports/temp_jsons',
    charts: true,
    reportPageTitle: 'OneClearing Automation Report',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    overwrite: false
  },
  e2e: {
    specPattern: "cypress/e2e/features/**/*.feature",
    async setupNodeEvents(on, config) {
      // --- 1. PLUGINS (Gherkin & Reports) ---
      await addCucumberPreprocessorPlugin(on, config);
      require('cypress-mochawesome-reporter/plugin')(on);
      on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }));

      // --- 2. CARGA DE AMBIENTE (Usando tu lógica de projectRoot) ---
      const environment = config.env.CYPRESS_ENV || process.env.CYPRESS_ENV || 'qa';
      try {
        const envConfig = require(`${config.projectRoot}/cypress/support/environments/${environment}.js`);
        
        // Seteamos la baseUrl para que cy.visit('/') funcione
        config.baseUrl = envConfig.baseUrl; 
        
        // Mergeamos el resto de variables (user, pass, etc)
        config.env = { ...config.env, ...envConfig };
        
        console.log(`✅ Ambiente [${environment}] cargado con éxito.`);
      } catch (e) {
        console.error(`❌ Error cargando el ambiente ${environment}:`, e.message);
      }
      const dbServer = environment === 'dev' 
      ? '192.168.139.160' 
      : (config.env.dbOCserver_QA || '192.168.139.161');
      
      dbPort = 1433;
      const dbOCConfig = {
        user: config.env.dbOCuser,
        password: config.env.dbOCpassword,
        server: dbServer,
        port: dbPort,
        database: config.env.dbOneClearing,
        options: {
          encrypt: false,
          trustServerCertificate: true // Importante para redes locales Primary
        }
      };

      // Configuración DB 2: ACSA (Inyección de Operaciones)
      
      const dbACSAConfig = {
        user: config.env.dbACSAuser,
        password: config.env.dbACSApassword,
        server: '192.168.99.62', // Nueva IP
        port: 1433,
        database: config.env.dbACSA,
        options: { encrypt: false, trustServerCertificate: true }
      };

      // --- 4. REGISTRO DE TAREAS ---
      registerDbTasks(on, { dbOCConfig, dbACSAConfig });
      console.log('DEBUG -> Spec que Cypress va a ejecutar:', config.specPattern);
      return config;
    },
  },
});