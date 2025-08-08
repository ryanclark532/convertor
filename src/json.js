    const typeMap = {
        'varchar': 'string',
        'nvarchar': 'string',
        'char': 'string',
        'nchar': 'string',
        'text': 'string',
        'ntext': 'string',
        
        'int': 'integer',
        'bigint': 'integer',
        'smallint': 'integer',
        'tinyint': 'integer',
        
        'decimal': 'number',
        'numeric': 'number',
        'float': 'number',
        'real': 'number',
        'money': 'number',
        'smallmoney': 'number',
        
        'bit': 'boolean',
        
        'datetime': 'string',
        'datetime2': 'string',
        'date': 'string',
        'time': 'string',
        'datetimeoffset': 'string',
        'smalldatetime': 'string',
        
        // Binary (as string in JSON)
        'binary': 'string',
        'varbinary': 'string',
        'image': 'string',
        
        'uniqueidentifier': 'string'
};

/**
 * @param {string} procName
 * @param {Array<{column: string, type: string, nullable: boolean}>} columns
 */
function generateJsonSchemaFromProc(procName, columns) {
    const properties = {};
    const required = [];
    
    columns.forEach(column => {
        const jsonType = typeMap[column.type.toLowerCase()]
        
        properties[column.column] = {
            type: jsonType
        };
        
        if (column.type.toLowerCase().includes('date') || column.type.toLowerCase().includes('time')) {
            properties[column.column].format = 'date-time';
        }
        
        if (!column.nullable) {
            required.push(column.column);
        }
    });
    
    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: procName,
        properties: properties
    };
    
    if (required.length > 0) {
        schema.required = required;
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
        if (columnInfo.type.toLowerCase().includes('date') || columnInfo.type.toLowerCase().includes('time')) {
            properties[columnName].format = 'date-time';
        }
        
        // Add to required if not nullable
        if (!columnInfo.nullable) {
            required.push(columnName);
        }
    });
    
    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: tableName,
        properties: properties
    };
    
    if (required.length > 0) {
        schema.required = required;
    }
    
    
    return schema;
}

module.exports = { 
    generateJsonSchemaFromProc,
    generateJsonSchemaFromTable
};