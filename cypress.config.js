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
    allowCypressEnv: true,
    async setupNodeEvents(on, config) {

      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome' || browser.name === 'chromium') {
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });

      await addCucumberPreprocessorPlugin(on, config);
      require('cypress-mochawesome-reporter/plugin')(on);
      on("file:preprocessor", createBundler({ plugins: [createEsbuildPlugin(config)] }));

      const environment = config.env.CYPRESS_ENV || process.env.CYPRESS_ENV || 'qa';

      // Carga el archivo de ambiente si existe (local), si no usa solo variables de entorno (CI)
      try {
        const envConfig = require(`${config.projectRoot}/cypress/support/environments/${environment}.js`);
        config.baseUrl = envConfig.baseUrl;
        config.env = { ...config.env, ...envConfig };
        console.log(`✅ Ambiente [${environment}] cargado desde archivo.`);
      } catch (e) {
        console.log(`ℹ️ Archivo de ambiente [${environment}] no encontrado, usando variables de entorno.`);
        // baseUrl desde env si viene por --env
        if (config.env.baseUrl) config.baseUrl = config.env.baseUrl;
      }

      const environment2 = config.env.CYPRESS_ENV || 'qa';
      const dbServer = environment2 === 'dev'
        ? '192.168.139.160'
        : (config.env.dbOCserver_QA || '192.168.139.161');

      const dbOCConfig = {
        user: config.env.dbOCuser,
        password: config.env.dbOCpassword,
        server: dbServer,
        port: 1433,
        database: config.env.dbOneClearing,
        options: { encrypt: false, trustServerCertificate: true }
      };

      const dbACSAConfig = {
        user: config.env.dbACSAuser,
        password: config.env.dbACSApassword,
        server: '192.168.99.62',
        port: 1433,
        database: config.env.dbACSA,
        options: { encrypt: false, trustServerCertificate: true }
      };

      registerDbTasks(on, { dbOCConfig, dbACSAConfig });
      console.log('DEBUG -> Spec que Cypress va a ejecutar:', config.specPattern);
      return config;
    },
  },
});
