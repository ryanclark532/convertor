const sql = require('mssql');

/**
 * @param {string} connectionString
 */
async function connectToDatabase(connectionString) {
  try {
    console.log('Connecting to database...');
    const pool = await sql.connect(connectionString);
    console.log('Database connection successful!');
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    throw error;
  }
}

/**
 * @param {import('mssql').ConnectionPool} pool
 */
async function getTableColumns(pool) {
  try {
    const query = `
      SELECT 
        t.name AS TABLE_NAME,
        c.name AS COLUMN_NAME,
        tp.name AS DATA_TYPE,
        c.is_nullable AS IS_NULLABLE
      FROM sys.tables t
      INNER JOIN sys.columns c ON t.object_id = c.object_id
      INNER JOIN sys.types tp ON c.user_type_id = tp.user_type_id
      WHERE t.is_ms_shipped = 0
      ORDER BY t.name, c.column_id
    `;

    const result = await pool.request().query(query);
    const tableColumnsMap = new Map();

    result.recordset.forEach(row => {
      const tableName = row.TABLE_NAME;
      const columnName = row.COLUMN_NAME;
      const dataType = row.DATA_TYPE;
      const isNullable = row.IS_NULLABLE === true;

      if (!tableColumnsMap.has(tableName)) {
        tableColumnsMap.set(tableName, new Map());
      }

      // Add column information to the table's column map
      tableColumnsMap.get(tableName).set(columnName, {
        type: dataType,
        nullable: isNullable
      });
    });

    return tableColumnsMap;
  } catch (error) {
    console.error('Error getting table columns:', error.message);
    throw error;
  }
}

/**
 * @param {import('mssql').ConnectionPool} pool
 */
async function getStoredProcedures(pool) {
  try {
    const query = `
      SELECT 
        p.name AS ProcedureName,
        OBJECT_DEFINITION(p.object_id) AS Definition,
        p.create_date AS DateCreated,
        p.modify_date AS DateModified
      FROM sys.procedures p
      WHERE p.is_ms_shipped = 0
      ORDER BY p.name
    `;

    const result = await pool.request().query(query);

    return result.recordset.map(row => ({
      name: row.ProcedureName,
      definition: row.Definition,
      dateCreated: row.DateCreated,
      dateModified: row.DateModified
    }));
  } catch (error) {
    console.error('Error getting stored procedures:', error.message);
    throw error;
  }
}

module.exports = { connectToDatabase, getTableColumns, getStoredProcedures };