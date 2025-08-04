const { connectToDatabase } = require('../src/database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    const connectionString = "Server=localhost,1433;Database=master;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;";
    
    try {
        console.log('Connecting to SQL Server...');
        const pool = await connectToDatabase(connectionString);
        
        console.log('Reading initialization script...');
        const initScript = fs.readFileSync(path.join(__dirname, '../docker', 'init-db.sql'), 'utf8');
        
        // Split the script by GO statements and execute each batch
        const batches = initScript.split(/\nGO\s*$/gm).filter(batch => batch.trim());
        
        console.log(`Executing ${batches.length} SQL batches...`);
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i].trim();
            if (batch) {
                console.log(`Executing batch ${i + 1}/${batches.length}...`);
                await pool.request().query(batch);
            }
        }
        
        console.log('Database initialization completed successfully!');
        await pool.close();
        
    } catch (error) {
        console.error('Database initialization failed:', error.message);
        process.exit(1);
    }
}

// Run initialization if this script is called directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };