# 📋 Cypress QA Framework - README

## 📋 Tabla de Contenidos
1. [Requisitos Previos](#-requisitos-previos)
2. [Guía de Onboarding (Instalación)](#-guía-de-onboarding-instalación)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Flujo de Trabajo Diario (Scripts)](#-flujo-de-trabajo-diario-scripts)
5. [Cómo Escribir un Test](#-cómo-escribir-un-test)
6. [Estrategia de Reportes](#-estrategia-de-reportes)

---

## 🛠️ Requisitos Previos

Para garantizar el funcionamiento correcto del framework en su entorno local, asegúrese de contar con:

* **Node.js**: v18.0.0 o posterior
* **Google Chrome**: Navegador oficial requerido para la ejecución de las suites de prueba
* **OpenConnect**: Herramienta necesaria para la conexión VPN de Primary (Linux/Ubuntu)

---

## 🚀 Guía de Onboarding (Instalación)

Tras clonar el repositorio, complete los siguientes **pasos obligatorios** para configurar su entorno local y prevenir falsos positivos o fallos de infraestructura.

### 1. Sincronización de Dependencias

Instale las dependencias exactas del proyecto:

```bash
npm install --save-dev cypress @badeball/cypress-cucumber-preprocessor @bahmutov/cypress-esbuild-preprocessor esbuild cypress-mochawesome-reporter mochawesome-merge mochawesome-report-generator
```

### 2. Configuración del Entorno

Cree el archivo `.env.vpn` en la carpeta `cypress`:

```env
# Archivo: .env.vpn (Local)
VPN_PROTOCOL="gp"
VPN_HOST="externos.primary.com.ar"
VPN_USER="su_usuario"
VPN_MTU="1450"
VPN_AUTHGROUP="externos.primary.com.ar"
```

Realice los ajustes necesarios según su usuario y URL de conexión.

Cree el archivo `connect_vpn.sh` en la carpeta `cypress`:

```bash
#!/bin/bash

if [ -f ".env.vpn" ]; then
    ENV_FILE=".env.vpn"
elif [ -f "$(dirname "$0")/../.env.vpn" ]; then
    ENV_FILE="$(dirname "$0")/../.env.vpn"
else
    echo "❌ Error: No se encontró el archivo .env.vpn en la raíz del proyecto."
    echo "Asegúrese de que el archivo exista en: $(pwd)"
    exit 1
fi

export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "🛡️ Iniciando VPN para $VPN_USER en $VPN_HOST..."

sudo openconnect --protocol=$VPN_PROTOCOL \
    $VPN_HOST \
    --user=$VPN_USER \
    --base-mtu=$VPN_MTU \
    --authgroup=$VPN_AUTHGROUP
```

### 3. Verificación de Cypress

Abra Cypress para validar la instalación:

```bash
npm run cy:open
```

---

## 📁 Estructura del Proyecto

```
.
├── cypress/
│   ├── e2e/
│   │   ├── features/          # ✍️ Archivos .feature en Gherkin (Especificación)
│   │   └── step_definitions/  # 🧠 Implementación en JavaScript de los steps
│   ├── reports/               # 📊 Artefactos y reportes HTML (Excluido de Git)
│   ├── screenshots/           # 📸 Evidencia visual automática en caso de fallos
│   ├── support/               
│   │   ├── commands.js        # Comandos Cypress personalizados
│   │   ├── e2e.js             # Configuración global y hooks
│   │   └── environments/      # Configuraciones por ambiente (qa, dev, prod)
│   └── connect_vpn.sh         # 🛡️ Script automatizado de VPN
├── .env.vpn                   # Variables locales de VPN (Ignorado)
├── cypress.config.js          # Configuración de Cypress, Esbuild y Mochawesome
├── package.json               # Scripts de ejecución y dependencias
└── README.md                  # Este documento
```

---

## ⚙️ Flujo de Trabajo Diario (Scripts)

| Comando | Descripción |
|---------|-------------|
| `npm run vpn:connect` | Establece la conexión VPN solicitando credenciales |
| `npm run cypress:open` | Abre el Test Runner interactivo para desarrollo |
| `npm run test:run` | Ejecuta Cypress en modo headless con Chrome |
| `npm run test:master` | Pipeline completo: pruebas → reporte HTML → apertura |

**Nota**: Para ejecutar en un ambiente específico, establezca la variable `CYPRESS_ENV`.

Ejemplo: `CYPRESS_ENV=qa npm run test:master`

---

## ✍️ Cómo Escribir un Test

Cree un archivo en `cypress/e2e/features/`:

```gherkin
Feature: Autenticación de Usuario
    Scenario: Inicio de sesión exitoso
        Given el usuario se encuentra en la página de inicio de sesión
        When ingresa credenciales válidas
        Then se redirige al panel de control
```

---

## 📊 Estrategia de Reportes

Los reportes se generan automáticamente en `cypress/reports/`. Para visualizar los resultados, ejecute:

```bash
npm run report:open
```

Este documento se actualiza continuamente conforme se realizan cambios en el framework.

