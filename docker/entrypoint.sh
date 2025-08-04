#!/bin/bash

# Start SQL Server in the background
echo "Starting SQL Server..."
/opt/mssql/bin/sqlservr &

# Get the process ID of SQL Server
SQLSERVER_PID=$!

# Wait for SQL Server to start up
echo "Waiting for SQL Server to start..."
for i in {1..50}; do
    if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; then
        echo "SQL Server is ready!"
        break
    fi
    echo "Waiting... ($i/50)"
    sleep 2
done

# Check if SQL Server started successfully
if ! /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -Q "SELECT 1" > /dev/null 2>&1; then
    echo "ERROR: SQL Server failed to start within timeout period"
    exit 1
fi

# Run the initialization script
echo "Running database initialization script..."
if /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "$SA_PASSWORD" -d master -i /opt/mssql-scripts/init-db.sql; then
    echo "Database initialization completed successfully!"
else
    echo "ERROR: Database initialization failed"
    exit 1
fi

# Keep the container running by waiting for the SQL Server process
echo "SQL Server container is ready and initialized!"
wait $SQLSERVER_PID