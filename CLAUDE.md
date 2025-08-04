# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js project named "convertor" - a minimal JavaScript application with a simple structure. The project appears to be in early development stages with basic scaffolding.

## Project Structure

- `src/index.js` - Main entry point (currently empty)
- `package.json` - Node.js project configuration

## Common Commands

### Running the CLI application
```bash
# Using npm start (requires arguments)
npm start -- -c "Server=localhost;Database=mydb;Trusted_Connection=true;" -o ./output

# Direct execution
node src/index.js -c "connection_string" -o output_directory

# After npm link (globally installed)
convertor -c "connection_string" -o output_directory

# Show help
node src/index.js --help
```

### Development with debugging
```bash
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npx jest tests/index.test.js
```

## Debugging

### VS Code Launch Configurations
The project includes VS Code debug configurations:
- **Debug Application**: Debug the main application (src/index.js)
- **Debug Tests**: Debug all Jest tests
- **Debug Current Test File**: Debug the currently open test file

Access these via VS Code's Debug panel (Ctrl+Shift+D) or F5.

## Docker Database Setup

### Starting the Test Database
```bash
# Build and start the SQL Server container
docker-compose up -d

# Check if the container is healthy
docker-compose ps

# View logs to see initialization progress
docker-compose logs -f mssql
```

### Test Database Schema
The Docker container creates a `TestDB` database with:

**Tables:**
- `Users` - Customer information with sample users
- `Products` - Product catalog with sample items
- `Orders` - Order records
- `OrderItems` - Order line items
- `OrderDetailsView` - View combining order information

**Stored Procedures:**
- `GetUserOrderSummary` - Get order summary for a specific user
- `GetProductSalesReport` - Generate sales report for date range
- `UpdateProductStock` - Update product inventory

**Connection Details:**
- Server: `localhost:1433`
- Database: `TestDB`
- Username: `sa`
- Password: `YourStrong!Passw0rd`

### Stopping the Database
```bash
docker-compose down
```

## CLI Usage

The convertor tool requires two arguments:
- `-c, --connection <string>`: MSSQL connection string
- `-o, --output <directory>`: Output directory path

Example connection strings:
- `"Server=localhost;Database=TestDB;User Id=sa;Password=YourStrong!Passw0rd;"` (for Docker container)
- `"Server=localhost;Database=mydb;Trusted_Connection=true;"`
- `"Server=localhost;Database=mydb;User Id=user;Password=pass;"`

## Development Notes

- Built with Commander.js for CLI functionality
- Uses mssql package for SQL Server database connectivity
- Jest is configured for testing with coverage support
- Test files are located in the `tests/` directory
- No build process is currently defined
- No linting or formatting tools are configured
- CLI validates and creates output directory if it doesn't exist
- Database connections are properly handled with error handling and cleanup

## Architecture

This is a basic Node.js project without any frameworks or specific architectural patterns implemented yet. The structure suggests it may be intended as a utility for converting between different formats or data types, but the implementation is not yet present.