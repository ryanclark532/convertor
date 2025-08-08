#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const { connectToDatabase, getTableColumns, getStoredProcedures } = require('./database')
const { parseSQL } = require("./parse")
const {  generateJsonSchemaFromTable, generateJsonSchemaFromProc} = require("./json");
const { convertAndSave } = require("./convert")

const program = new Command();

program
  .name('convertor')
  .description('A tool for converting MSSQL database data to language-specific types')
  .version('1.0.0')
  .requiredOption('-c, --connection <string>', 'MSSQL connection string')
  .requiredOption('-o, --output <directory>', 'Output directory path')
  .option('-q, --quicktype-options <file>', 'JSON file containing quicktype options')
  .action(async (options) => {
    const { connection, output, quicktypeOptions } = options;
    
    let qtOptions = {
      lang: 'typescript',
      rendererOptions: {
        "just-types": true,
        "runtime-typecheck": true
      }
    };
    
    if (quicktypeOptions) {
      try {
        const optionsContent = fs.readFileSync(quicktypeOptions, 'utf8');
        qtOptions = JSON.parse(optionsContent);
      } catch (error) {
        console.warn(`Failed to load quicktype options file, using default config: ${error.message}`);
      }
    }

    // Validate output directory exists or create it
    if (!fs.existsSync(output)) {
      console.log(`Creating output directory: ${output}`);
      fs.mkdirSync(output, { recursive: true });
    }

    const pool = await connectToDatabase(connection);
    
    const tableColumns = await getTableColumns(pool);

    const storedProcedures = await getStoredProcedures(pool);

    const tableSchemas = Array.from(tableColumns, ([tableName, columns]) => {
      return JSON.stringify(generateJsonSchemaFromTable(tableName, columns), null, 2);
    });

    const procSchemas = storedProcedures.map(proc => {
        const parsed = parseSQL(proc.definition, tableColumns);
        return JSON.stringify(generateJsonSchemaFromProc(proc.name, parsed), null, 2);
    });

    await convertAndSave(qtOptions, [...tableSchemas, ...procSchemas], output);

    await pool.close();
    console.log('Conversion completed successfully!');
  });

program.parse();