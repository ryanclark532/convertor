const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const { JSONSchemaStore } = require('quicktype-core');

// JSON Schema validator with format support
const ajv = new Ajv();
addFormats(ajv);

// Schema store for managing table schema references
const schemaStore = new JSONSchemaStore();

const typeMap = {
  varchar: 'string',
  nvarchar: 'string',
  char: 'string',
  nchar: 'string',
  text: 'string',
  ntext: 'string',

  int: 'integer',
  bigint: 'integer',
  smallint: 'integer',
  tinyint: 'integer',

  decimal: 'number',
  numeric: 'number',
  float: 'number',
  real: 'number',
  money: 'number',
  smallmoney: 'number',

  bit: 'boolean',

  datetime: 'string',
  datetime2: 'string',
  date: 'string',
  time: 'string',
  datetimeoffset: 'string',
  smalldatetime: 'string',

  // Binary (as string in JSON)
  binary: 'string',
  varbinary: 'string',
  image: 'string',

  uniqueidentifier: 'string'
};

/**
 * Validates a JSON schema using AJV
 * @param {Object} schema
 * @returns {boolean}
 */
function validateSchema(schema) {
  try {
    ajv.compile(schema);
    return true;
  } catch (error) {
    console.warn('Schema validation failed:', error.message);
    return false;
  }
}

/**
 * @param {string} procName
 * @param {Array<{column: string, type: string, nullable: boolean, table?: string}>} columns
 */
function generateJsonSchemaFromProc(procName, columns) {
  const properties = {};
  const required = [];

  columns.forEach(column => {
    // Check if this column references a table column (has table property)
    if (column.table) {
      // Try to use $ref to reference the table schema
      const tableSchemaId = `#/definitions/${column.table}`;
      try {
        const tableSchema = schemaStore.get(tableSchemaId);
        if (tableSchema && tableSchema.properties && tableSchema.properties[column.column]) {
          // Reference the specific property from the table schema
          properties[column.column] = {
            $ref: `${tableSchemaId}/properties/${column.column}`,
            description: `References ${column.table}.${column.column}`
          };
        } else {
          // Fallback to manual type mapping
          properties[column.column] = createPropertyFromColumn(column);
        }
      } catch (error) {
        // Fallback to manual type mapping
        properties[column.column] = createPropertyFromColumn(column);
      }
    } else {
      // No table reference, use manual type mapping
      properties[column.column] = createPropertyFromColumn(column);
    }

    if (!column.nullable) {
      required.push(column.column);
    }
  });

  function createPropertyFromColumn(column) {
    const jsonType = typeMap[column.type.toLowerCase()];
    const property = { type: jsonType };

    if (
      column.type.toLowerCase().includes('date') ||
      column.type.toLowerCase().includes('time')
    ) {
      property.format = 'date-time';
    }

    return property;
  }

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    title: procName,
    properties: properties
  };

  if (required.length > 0) {
    schema.required = required;
  }

  // Add $id for schema referencing
  schema.$id = `#/definitions/${procName}`;

  // Validate the generated schema
  if (!validateSchema(schema)) {
    console.warn(`Generated schema for procedure ${procName} may be invalid`);
  }

  return schema;
}

/**
 * @param {string} tableName
 * @param {Map<string, {type: string, nullable: boolean}>} tableColumns
 */
function generateJsonSchemaFromTable(tableName, tableColumns) {
  const properties = {};
  const required = [];

  tableColumns.forEach((columnInfo, columnName) => {
    const jsonType = typeMap[columnInfo.type.toLowerCase()] || 'string';

    properties[columnName] = {
      type: jsonType
    };

    // Add format for date/time types
    if (
      columnInfo.type.toLowerCase().includes('date') ||
      columnInfo.type.toLowerCase().includes('time')
    ) {
      properties[columnName].format = 'date-time';
    }

    // Add to required if not nullable
    if (!columnInfo.nullable) {
      required.push(columnName);
    }
  });

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    title: tableName,
    properties: properties
  };

  if (required.length > 0) {
    schema.required = required;
  }

  // Add $id for schema referencing
  schema.$id = `#/definitions/${tableName}`;

  // Validate the generated schema
  if (!validateSchema(schema)) {
    console.warn(`Generated schema for table ${tableName} may be invalid`);
  }

  // Store the schema for potential referencing
  try {
    schemaStore.add(schema, schema.$id);
  } catch (error) {
    console.warn(`Failed to store schema for ${tableName}:`, error.message);
  }

  return schema;
}

/**
 * Gets all stored table schemas as a definitions object for use in composed schemas
 * @returns {Object}
 */
function getStoredTableDefinitions() {
  const definitions = {};
  // Note: JSONSchemaStore doesn't provide a way to iterate, 
  // so we'll track table names separately if needed
  return definitions;
}

/**
 * Clear the schema store (useful for testing)
 */
function clearSchemaStore() {
  // JSONSchemaStore doesn't have a clear method, but we can create a new one
  Object.setPrototypeOf(schemaStore, JSONSchemaStore.prototype);
}

module.exports = {
  generateJsonSchemaFromProc,
  generateJsonSchemaFromTable,
  getStoredTableDefinitions,
  clearSchemaStore,
  validateSchema
};