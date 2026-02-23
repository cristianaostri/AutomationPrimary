const sql = require('mssql');

// Helper centralizado para manejar conexiones
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

module.exports = (on, dbConfig) => {
  on('task', {
    // 1. SELECT (Tu queryDb de siempre)
    async queryDb(query) {
      const result = await execute(dbConfig, query);
      return result.recordset;
    },

    // 2. INSERT 
    async insertIntoDb({ tableName, data }) {
      const columns = Object.keys(data).join(', ');
      const values = Object.values(data).map(val => {
        if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
        if (val === null) return 'NULL';
        if (val instanceof Date) return `'${val.toISOString()}'`;
        return val;
      }).join(', ');
      
      const query = `INSERT INTO ${tableName} (${columns}) VALUES (${values}); SELECT SCOPE_IDENTITY() as id;`;
      const result = await execute(dbConfig, query);
      return result.recordset[0].id;
    },

    // 3. DELETE (Tu clearTable del otro repo)
    async clearTable(tableName) {
      const query = `DELETE FROM ${tableName};`;
      await execute(dbConfig, query);
      return `Tabla ${tableName} limpia.`;
    },

    
    async createCarteraManual(data) {
      const { codigo, monto, usuario } = data;
      const script = `
        DECLARE @p1 Registro.OperacionCarteraTable;
        INSERT INTO @p1 VALUES (NULL, '${codigo}', GETDATE(), CONVERT(time,GETDATE(),101), 1, 1, 1, 5, 1, 74790, NULL, 147236, NULL, ${monto}, GETDATE(), CONVERT(time,GETDATE(),101), 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, GETDATE(), '${usuario}', NULL, NULL, 2369, 2);
        EXEC Registro.InsertOperacionCarteraManual @operaciones=@p1;
      `;
      await execute(dbConfig, script);
      return `Operación ${codigo} inyectada con éxito.`;
    }
  });
};