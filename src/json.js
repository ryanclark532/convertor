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

function generateJsonSchema(columns) {
    const properties = {};
    const required = [];
    
    columns.forEach(column => {
        const jsonType = typeMap[column.type.toLowerCase()]
        
        properties[column.column] = {
            type: jsonType
        };
        
        // Add format for date/time types
        if (column.type.toLowerCase().includes('date') || column.type.toLowerCase().includes('time')) {
            properties[column.column].format = 'date-time';
        }
        
        // Add to required if not nullable
        if (!column.nullable) {
            required.push(column.column);
        }
    });
    
    const schema = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        properties: properties
    };
    
    if (required.length > 0) {
        schema.required = required;
    }
    
    return schema;
}

module.exports = { generateJsonSchema };