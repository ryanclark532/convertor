const { Command } = require('commander');
const fs = require('fs');
const { connectToDatabase, getTableColumns, getStoredProcedures } = require('./database')
const { parseSQL } = require("./parse")
const { generateJsonSchema} = require("./json")

const program = new Command();

program
  .name('convertor')
  .description('A tool for converting MSSQL database data')
  .version('1.0.0')
  .requiredOption('-c, --connection <string>', 'MSSQL connection string')
  .requiredOption('-o, --output <directory>', 'Output directory path')
  .action(async (options) => {
    const { connection, output } = options;
    
    // Validate output directory exists or create it
    if (!fs.existsSync(output)) {
      console.log(`Creating output directory: ${output}`);
      fs.mkdirSync(output, { recursive: true });
    }

    const pool = await connectToDatabase(connection);
    
    const tableColumns = await getTableColumns(pool);
    
    const storedProcedures = await getStoredProcedures(pool);

    storedProcedures.forEach(proc => {
        const parsed = parseSQL(proc.definition, tableColumns);
        const jsonSchema = generateJsonSchema(parsed);
        console.log(jsonSchema)
    });

    await pool.close();
    console.log('Conversion completed successfully!');
  });

program.parse();