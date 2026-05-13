# Proyecto Cypress Primary

## 📌 Objetivo
Este repositorio contiene el framework de pruebas automatizadas con Cypress + Cucumber para el proyecto Primary.

Incluye pruebas de interfaz, API y bases de datos, además de integración con la base ACSA y generación de reportes Mochawesome.

---

## 🚀 Clonar e instalar

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPO>
cd "Primary2026 original repo"
```

2. Instalar dependencias:

```bash
npm install
```

3. Instalar desde `requirements.txt` (opcional):

```bash
npm run install:requirements
```

> `package.json` es el manifiesto principal de Node. `requirements.txt` se incluye como referencia y ayuda a ver todas las librerías usadas en el proyecto.

---

## 🧩 Dependencias adicionales necesarias

El repositorio omite algunos archivos locales sensibles en `.gitignore`. Estos archivos deben entregarse o recrearse manualmente:

* `.env.vpn` – variables de configuración local de la VPN
* `cypress/connect_vpn.sh` – script de conexión VPN local

Si cualquiera de estos archivos no está presente al clonar, el proyecto no funcionará correctamente.

---

## 🛠️ Requisitos previos

* Node.js 18 o superior
* Google Chrome
* OpenConnect (para conexión VPN en Linux)

---

## 📁 Estructura básica del proyecto

```text
.
├── cypress/
│   ├── e2e/
│   │   ├── features/
│   │   └── step_definitions/
│   ├── reports/
│   ├── screenshots/
│   ├── support/
│   │   ├── commands.js
│   │   ├── e2e.js
│   │   └── environments/
│   └── connect_vpn.sh
├── cypress.config.js
├── package.json
├── requirements.txt
└── readme.md
```

---

## ⚙️ Comandos principales

| Comando | Descripción |
|---|---|
| `npm install` | Instala dependencias desde `package.json` |
| `npm run install:requirements` | Instala las dependencias listadas en `requirements.txt` |
| `npm run cy:open` | Abre el Test Runner interactivo |
| `npm run cy:open:qa` | Abre Cypress con `CYPRESS_ENV=qa` |
| `npm run test:run` | Ejecuta Cypress headless en Chrome |
| `npm run test:dev` | Ejecuta pruebas con `CYPRESS_ENV=dev` |
| `npm run test:qa` | Ejecuta pruebas con `CYPRESS_ENV=qa` |
| `npm run test:uat` | Ejecuta pruebas con `CYPRESS_ENV=uat` |
| `npm run test:master` | Ejecuta pruebas, genera reportes y abre el último reporte |
| `npm run vpn:connect` | Ejecuta el script local de VPN |

---

## 🌐 Ejecución por ambiente

```bash
CYPRESS_ENV=qa npm run test:run
```

O bien:

```bash
npm run test:qa
```

---

## 📄 Uso de `requirements.txt`

El archivo `requirements.txt` contiene la lista de paquetes usados en el proyecto.

Para instalar todos los paquetes listados:

```bash
npm run install:requirements
```

---

## 🧪 Flujo de reportes

1. Ejecutar la suite:
   ```bash
   npm run test:master
   ```
2. El reporte se genera en `cypress/reports/`.
3. El comando `npm run report:open` intentará abrir el último HTML generado.

---

## 📌 Notas importantes

* El archivo `.env.vpn` no se debe versionar; está excluido por `.gitignore`.
* Si el comando `npm run test:master` falla, verifique que `cypress/connect_vpn.sh` y `.env.vpn` existan y que `npm install` haya instalado todas las dependencias.
* La lista de dependencias reales se encuentra en `package.json`.

