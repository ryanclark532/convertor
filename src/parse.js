const { Parser } = require('node-sql-parser/build/transactsql');

const parser = new Parser();

/**
 * @param {string} sql
 */
function extractProc(sql) {
  const startIndex = sql.indexOf('BEGIN') + 'BEGIN'.length;
  const endIndex = sql.lastIndexOf('END');
  return sql.substring(startIndex, endIndex).trim();
}

/**
 * @param {Array<string>} columns
 * @param {Map<string, Map<string, {type: string, nullable: boolean}>>} tableMap
 */
function applyTypes(columns, tableMap) {
  return columns
    .map(element => {
      const parts = element.split('::');

      const t = parts[1];
      const c = parts[2];

      if (t == 'null') return;
      if (t.startsWith('@')) return;

      const table = tableMap.get(t);

      if (!table) return;

      const column = table.get(c);

      if (!column) return;

      return {
        table: t,
        column: c,
        type: column.type,
        nullable: column.nullable
      };
    })
    .filter(Boolean);
}

/**
 * @param {string} sql
 * @param {Map<string, Map<string, {type: string, nullable: boolean}>>} tableMap
 */
function parseSQL(sql, tableMap) {
  sql = extractProc(sql);

  // Split into individual statements
  const statements = sql.split(';').filter(stmt => stmt.trim());
  const parsedColumns = [];

  for (const statement of statements) {
    const trimmedStmt = statement.trim();

    try {
      if (!trimmedStmt.toUpperCase().startsWith('SELECT')) continue;
      const { columnList } = parser.parse(trimmedStmt);
      parsedColumns.push(...columnList);
    } catch (error) {
      console.warn(
        `Could not parse statement: ${trimmedStmt.substring(0, 50)}...`
      );
    }
  }

  return applyTypes(parsedColumns, tableMap);
}

module.exports = { parseSQL };