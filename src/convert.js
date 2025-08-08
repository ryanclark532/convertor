const { quicktype, InputData, JSONSchemaInput, FetchingJSONSchemaStore } = require('quicktype-core');
const fs = require('fs');
const path = require('path');

const extensions = {
    'typescript': 'ts',
    'javascript': 'js',
    'csharp': 'cs',
    'python': 'py',
    'java': 'java',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'cpp': 'cpp'
};

/**
 * @param {Object} options
 * @param {Array<string>} schemas
 * @param {string} outputDir
 */
async function convertAndSave(options, schemas, outputDir) {
    try {
        console.log(`Converting ${schemas.length} schemas to ${options.lang}...`);

        for (let i = 0; i < schemas.length; i++) {
            const schemaString = schemas[i];
            const schemaObj = JSON.parse(schemaString);
            const typeName = schemaObj.title || `Schema${i + 1}`;

            // Create input data for quicktype
            const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());
            await schemaInput.addSource({
                name: typeName,
                schema: schemaString
            });

            const inputData = new InputData();
            inputData.addInput(schemaInput);

            // Run quicktype conversion
            const result = await quicktype({
                inputData,
                lang: options.lang,
                rendererOptions: {
                    "just-types": true,
                    "runtime-typecheck": false
                },
                ...options
            });



            const ext = extensions[options.lang] || 'txt';
            const fileName = `${typeName}.${ext}`;
            const filePath = path.join(outputDir, fileName);

            // Write the converted code to file
            fs.writeFileSync(filePath, result.lines.join('\n'));
            console.log(`Generated: ${fileName}`);
        }

        console.log(`Successfully converted ${schemas.length} schemas to ${options.lang}`);

    } catch (error) {
        console.error('Error during conversion:', error.message);
        throw error;
    }
}

module.exports = { convertAndSave };