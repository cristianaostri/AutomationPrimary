const sql = require("mssql");

// Helper centralizado 
async function execute(dbConfig, query) {
  try {
    await sql.connect(dbConfig);
    const result = await sql.query(query);
    return result;
  } finally {
    if (sql.connected) {
      await sql.close();
    }
  }
}

module.exports = (on, configs) => {
  // Extraemos ambas configuraciones del objeto configs
  const { dbOCConfig, dbACSAConfig } = configs;

  on("task", {
    // --- CONSULTAS ONE CLEARING (IP 139.161) ---
    async queryOC(query) {
      const result = await execute(dbOCConfig, query);
      return result.recordset;
    },

    // --- CONSULTAS ACSA (IP 99.62) ---
    async queryACSA(query) {
      const result = await execute(dbACSAConfig, query);
      return result.recordset;
    },

    // --- LÓGICA ESPECÍFICA DE ACSA ---
    async getLatestOpeMercado(fechaYYYYMMDD) {
      const query = `
        SELECT MAX(OperacionMercadoID) as lastID 
        FROM Registro.OperacionCartera 
        WHERE CAST(OperacionMercadoID AS VARCHAR) LIKE '${fechaYYYYMMDD}%'
      `;
      const result = await execute(dbACSAConfig, query);
      return result.recordset[0].lastID;
    },

    async createCarteraManual(data) {
      const { opeMercado, ruedalID, ejecID, cant, contrID, ctaCpraID, precio, ctaVtaID, usuario } = data;
      
      const script = `
        declare @p1 Registro.OperacionCarteraTable
        insert into @p1 values(NULL,'${opeMercado}',GETDATE(),CONVERT(time,getdate(),101),${ruedalID},${ejecID},1,${cant},1,${contrID},NULL,${ctaCpraID},NULL,${precio},GETDATE(),CONVERT(time,getdate(),101),0,0,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,GETDATE(),'${usuario || "SUSER_NAME()"}',NULL,NULL,${ctaVtaID},2)
        exec Registro.InsertOperacionCarteraManual @operaciones=@p1
      `;

      try {
        await execute(dbACSAConfig, script);
        return `OK: ${opeMercado}`;
      } catch (err) {
        throw new Error(`SQL Error en ACSA: ${err.message}`);
      }
    },
  });
};