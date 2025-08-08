# MSSQL Convertor

A command-line tool that converts MSSQL database schemas (tables and stored procedures) to language-specific types using [quicktype](https://github.com/glideapps/quicktype). Generate TypeScript, Go, C#, Python, and other language types from your database schema automatically.

## Features

- 🗄️ **Database Schema Analysis** - Extracts table columns and stored procedure definitions
- 🔄 **Multi-Language Support** - Generate types for TypeScript, Go, C#, Python, Java, Rust, Swift, and more
- ✅ **Nullable Field Handling** - Properly handles nullable database columns as optional properties
- 🔗 **Schema Composition** - Uses JSON Schema `$ref` for referencing table definitions in stored procedures
- ✨ **Schema Validation** - Built-in JSON Schema validation using AJV
- 📁 **Flexible Output** - Configurable output directory and quicktype options

## Installation

### Global Installation (Recommended)

Install directly from GitHub:

```bash
npm install -g git+https://github.com/ryanclark532/convertor.git
```

After installation, you can use the `mssql-convertor` command from anywhere.

### Local Development

Clone and install dependencies:

```bash
git clone https://github.com/ryanclark532/convertor.git
cd convertor
npm install
```

## Usage

### Basic Usage

```bash
mssql-convertor -c "connection_string" -o output_directory
```

### Examples

**Generate TypeScript types (default):**
```bash
mssql-convertor -c "Server=localhost;Database=MyDB;User Id=sa;Password=MyPassword;TrustServerCertificate=true;" -o ./types
```

**Generate Go structs:**
```bash
mssql-convertor -c "connection_string" -o ./models -q quicktype-go.json
```

**Generate C# classes:**
```bash
mssql-convertor -c "connection_string" -o ./Models -q quicktype-csharp.json
```

### Command Line Options

| Option | Description | Required |
|--------|-------------|----------|
| `-c, --connection <string>` | MSSQL connection string | ✅ |
| `-o, --output <directory>` | Output directory path | ✅ |
| `-q, --quicktype-options <file>` | JSON file containing quicktype options | ❌ |
| `-h, --help` | Display help information | ❌ |
| `-V, --version` | Display version number | ❌ |

## Connection Strings

### SQL Server Authentication
```
Server=localhost;Database=MyDB;User Id=sa;Password=MyPassword;TrustServerCertificate=true;
```

### Windows Authentication
```
Server=localhost;Database=MyDB;Trusted_Connection=true;
```

### Docker SQL Server
```
Server=localhost,1433;Database=MyDB;User Id=sa;Password=YourStrong!Passw0rd;TrustServerCertificate=true;
```

## Quicktype Configuration

Create a JSON file to customize quicktype options for different languages:

### TypeScript (quicktype-ts.json)
```json
{
  "lang": "typescript",
  "rendererOptions": {
    "just-types": true,
    "runtime-typecheck": false
  }
}
```

### Go (quicktype-go.json)
```json
{
  "lang": "go",
  "rendererOptions": {
    "just-types": true,
    "package-name": "models"
  }
}
```

### C# (quicktype-csharp.json)
```json
{
  "lang": "csharp",
  "rendererOptions": {
    "just-types": true,
    "namespace": "MyApp.Models",
    "features": "attributes-only"
  }
}
```

### Python (quicktype-python.json)
```json
{
  "lang": "python",
  "rendererOptions": {
    "just-types": true,
    "python-version": "3.7"
  }
}
```

## Output

The tool generates:

1. **Table Types** - One file per database table (e.g., `Users.ts`, `Orders.ts`)
2. **Stored Procedure Types** - One file per stored procedure (e.g., `GetUserOrderSummary.ts`)

### Example Output (TypeScript)

```typescript
// Users.ts
export interface Users {
    UserID:       number;
    FirstName:    string;
    LastName:     string;
    Email:        string;
    DateCreated?: Date;
    IsActive?:    boolean;
    Age?:         number;
    Salary?:      number;
}
```

## Development Setup

### Prerequisites

- Node.js 16+ 
- MSSQL Server (local, remote, or Docker)

### Docker Database for Testing

The project includes a Docker setup for testing:

```bash
# Start test database
docker-compose up -d

# Check container status
docker-compose ps

# View logs
docker-compose logs -f mssql

# Stop database
docker-compose down
```

### Running Tests

```bash
npm test
```

### Running in Development

```bash
npm run dev
```

## Supported Languages

- TypeScript
- JavaScript
- C#
- Python
- Java
- Go
- Rust
- Swift
- Kotlin
- C++

For language-specific options, see the [quicktype documentation](https://quicktype.io/).

## Troubleshooting

### Connection Issues

**Error: Login failed**
- Verify username/password
- Check if SQL Server allows SQL Server authentication
- Ensure the database exists

**Error: Server not found**
- Verify server name/IP address
- Check if SQL Server is running
- Verify port number (default: 1433)

**Error: Certificate issues**
- Add `TrustServerCertificate=true` to connection string
- Or configure proper SSL certificates

### Generated Types Issues

**Missing nullable properties**
- Ensure columns are properly marked as NULL/NOT NULL in database
- Check the generated JSON schemas for accuracy

**Stored procedure types missing**
- Verify stored procedures contain SELECT statements
- Check that procedures are not system procedures (filtered out automatically)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/ryanclark532/convertor/issues)
- 📖 **Documentation**: See the `CLAUDE.md` file for detailed project information
- 💡 **Feature Requests**: Open an issue with the "enhancement" label