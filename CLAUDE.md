# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Node.js project named "mssql-convertor" - a production-ready command-line tool that converts MSSQL database schemas (tables and stored procedures) to language-specific types using quicktype. The project generates TypeScript, Go, C#, Python, Java, Rust, Swift, and other language types from database metadata.

## Project Structure

```
src/
├── index.js       - Main CLI entry point with Commander.js setup
├── database.js    - Database connection and schema extraction
├── json.js        - JSON Schema generation with validation and composition
├── convert.js     - quicktype integration and file generation
└── parse.js       - SQL stored procedure parsing logic

docker/
├── init-db.sql    - Database initialization script with test data

.vscode/
└── launch.json    - VS Code debug configurations
```

## Key Features

- **Multi-Language Support**: Generate types for 10+ programming languages
- **Schema Validation**: Built-in JSON Schema validation using AJV
- **Schema Composition**: Uses JSON Schema `$ref` for referencing table definitions
- **Nullable Field Handling**: Properly maps SQL NULL/NOT NULL to optional properties
- **Global Installation**: Can be installed globally via npm from Git repository
- **Configurable Output**: Support for custom quicktype options via JSON files
- **Docker Test Environment**: Includes complete test database setup

## Common Commands

### Running the CLI application
```bash
# Using npm start (requires arguments)
npm start -- -c "Server=localhost,1433;Database=TestDB;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;" -o ./output

# Direct execution
node src/index.js -c "connection_string" -o output_directory

# After npm link (globally installed)
mssql-convertor -c "connection_string" -o output_directory

# With custom quicktype options
mssql-convertor -c "connection_string" -o output_directory -q quicktype-config.json

# Show help
mssql-convertor --help
```

### Global Installation
```bash
# Install globally from GitHub
npm install -g git+https://github.com/ryanclark532/convertor.git

# Create local symlink for development
npm link
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
- **Debug Application**: Debug the main application with test database connection
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
- `Users` - Customer information with nullable fields (Age, Salary, MiddleName, PhoneNumber, LastLoginDate)
- `Products` - Product catalog with nullable fields (Category, Description, DiscountPercentage, ManufacturerCode)
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

### Required Arguments
- `-c, --connection <string>`: MSSQL connection string
- `-o, --output <directory>`: Output directory path

### Optional Arguments
- `-q, --quicktype-options <file>`: JSON file containing quicktype configuration

### Example Connection Strings
- `"Server=localhost,1433;Database=TestDB;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;"` (Docker)
- `"Server=localhost;Database=mydb;Trusted_Connection=true;"` (Windows Auth)
- `"Server=localhost;Database=mydb;User Id=user;Password=pass;"` (SQL Auth)

### Quicktype Configuration Examples

**TypeScript:**
```json
{
  "lang": "typescript",
  "rendererOptions": {
    "just-types": true,
    "runtime-typecheck": false
  }
}
```

**Go:**
```json
{
  "lang": "go",
  "rendererOptions": {
    "just-types": true,
    "package-name": "models"
  }
}
```

**C#:**
```json
{
  "lang": "csharp",
  "rendererOptions": {
    "just-types": true,
    "namespace": "MyApp.Models"
  }
}
```

## Architecture & Dependencies

### Core Dependencies
- **Commander.js**: CLI argument parsing and help generation
- **mssql**: SQL Server connectivity and query execution
- **quicktype-core**: Multi-language type generation from JSON Schema
- **node-sql-parser**: SQL stored procedure parsing
- **ajv + ajv-formats**: JSON Schema validation with format support

### Architecture Pattern
The project follows a modular pipeline architecture:

1. **Database Layer** (`database.js`): Connects to SQL Server and extracts table/procedure metadata
2. **Schema Generation** (`json.js`): Converts database metadata to JSON Schema with validation
3. **Parsing Layer** (`parse.js`): Analyzes stored procedure SQL to extract return types
4. **Conversion Layer** (`convert.js`): Uses quicktype to generate language-specific types
5. **CLI Layer** (`index.js`): Orchestrates the pipeline with user-friendly interface

### Key Features Implementation
- **JSON Schema Store**: Uses quicktype-core's JSONSchemaStore for schema composition
- **Type Validation**: All generated schemas are validated with AJV before conversion
- **Reference Resolution**: Stored procedure schemas can reference table column definitions via `$ref`
- **Nullable Handling**: SQL `IS_NULLABLE` metadata properly maps to optional properties
- **Error Handling**: Comprehensive error handling with graceful degradation
- **Formatted Output**: Generated code follows language-specific formatting conventions

## Development Notes

### Code Quality
- **JSDoc Documentation**: All functions have parameter type documentation
- **Consistent Formatting**: All source files follow Prettier-style formatting
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Validation**: JSON Schema validation ensures generated schemas are valid
- **Testing**: Jest test framework configured for unit and integration testing

### File Generation
- **One File Per Type**: Each table and stored procedure generates a separate file
- **Smart Naming**: Generated files use table/procedure names (e.g., `Users.ts`, `GetUserOrderSummary.go`)
- **Clean Output**: Uses quicktype's "just-types" mode for minimal, clean type definitions
- **Language Extensions**: Automatic file extension detection for supported languages

### Database Compatibility
- **SQL Server 2017+**: Tested with SQL Server 2017 and later versions
- **System Tables**: Uses `sys.tables`, `sys.columns`, `sys.procedures` for metadata
- **Connection Pooling**: Proper connection lifecycle management with cleanup
- **Security**: Supports both SQL Server and Windows authentication

This project represents a complete, production-ready database-to-code generation tool with modern Node.js best practices and comprehensive feature set.