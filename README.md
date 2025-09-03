# SmartUI Migration Tool

A sophisticated command-line interface (CLI) designed to help enterprise QA and developers migrate their existing visual testing suites (from Percy, Applitools, and Sauce Labs) to LambdaTest SmartUI.

## Features

- **Interactive CLI Experience**: Modern, user-friendly command-line interface with visual feedback
- **Human-First Design**: Clear prompts and user control with elegant spinners and progress indicators
- **Automated Mode**: `--yes` flag for CI/CD integration without interactive prompts
- **Intelligent Project Scanner**: Automatically detects visual testing platforms, frameworks, and languages
- **Configuration Transformation**: Converts Percy, Applitools, and Sauce Labs configs to SmartUI format
- **Multi-Framework Support**: Migrate from Percy, Applitools, and Sauce Labs
- **Multi-Language Support**: JavaScript/TypeScript, Java, and Python projects
- **Intelligent Code Transformation**: Advanced analysis and transformation of test scripts
- **Configuration Migration**: Automatic conversion of framework-specific configurations
- **CI/CD Integration**: Updates package.json scripts and CI/CD configurations
- **Comprehensive Reporting**: Detailed migration reports with statistics and recommendations
- **Secure & Local**: Runs 100% locally on your machine for maximum security

## Installation

### Option 1: Download Pre-built Binary (Recommended)

Download the appropriate binary for your operating system from the [GitHub Releases](https://github.com/lambdatest/smartui-migration-tool/releases) page:

- **Linux (x64)**: `smartui-migration-tool-linux`
- **macOS (Intel)**: `smartui-migration-tool-macos`
- **macOS (Apple Silicon)**: `smartui-migration-tool-macos-arm64`
- **Windows (x64)**: `smartui-migration-tool-win.exe`

#### Installation Steps:

1. **Download** the appropriate binary for your operating system
2. **Make executable** (Linux/macOS):
   ```bash
   chmod +x smartui-migration-tool-*
   ```
3. **Move to PATH** (optional) or run directly:
   ```bash
   # Run directly
   ./smartui-migration-tool-* migrate
   
   # Or move to PATH for global access
   sudo mv smartui-migration-tool-* /usr/local/bin/smartui-migrator
   smartui-migrator migrate
   ```

### Option 2: Install via npm (Development)

For development or if you prefer npm installation:

```bash
npm install -g smartui-migration-tool
```

Then run:
```bash
smartui-migrator migrate
```

## Supported Platforms & Frameworks

The SmartUI Migration Tool automatically detects and supports migration from:

### **Visual Testing Platforms:**
- **Percy** - Visual testing by BrowserStack
- **Applitools** - AI-powered visual testing
- **Sauce Labs Visual** - Visual testing by Sauce Labs

### **Test Frameworks:**
- **Cypress** - JavaScript/TypeScript end-to-end testing
- **Playwright** - Cross-browser testing framework
- **Selenium** - Web browser automation
- **Storybook** - Component development environment
- **Robot Framework** - Python-based test automation

### **Programming Languages:**
- **JavaScript/TypeScript** - Node.js projects
- **Java** - Maven-based projects
- **Python** - Requirements.txt-based projects

## Configuration Transformation

The tool automatically transforms configuration files from supported platforms to SmartUI format:

### **Percy Configuration Support:**
- **`.percy.yml`** - Percy v2 configuration files
- **`.percyrc`** - Alternative Percy configuration format
- **Automatic Property Mapping**: Converts Percy-specific properties to SmartUI format
- **Feature Gap Handling**: Flags unsupported features for manual review

### **Applitools Configuration Support:**
- **`applitools.config.js`** - JavaScript configuration files
- **Secure Configuration Parsing**: Safely extracts configuration without executing user code
- **Property Mapping**: Converts Applitools properties to SmartUI format
- **Feature Gap Handling**: Notes configuration items that require manual setup

### **Sauce Labs Configuration Support:**
- **`saucectl.yml`** - YAML configuration files for Sauce Labs Visual
- **Framework-embedded configs** - JavaScript/TypeScript files with Sauce Labs properties
- **Dual Format Support**: Handles both YAML and JavaScript configuration sources
- **Property Mapping**: Converts Sauce Labs properties to SmartUI format
- **Feature Gap Handling**: Identifies configuration items that need manual attention

## Development Setup

For development purposes, you can build the tool from source:

```bash
# Clone the repository
git clone <repository-url>
cd smartui-migration-tool

# Install dependencies and build
npm install && npm run build
```

## Usage

### Basic Migration

```bash
# Run the migration tool
npm start migrate

# Or use the built binary
./bin/run migrate
```

### Advanced Options

```bash
# Specify project path
npm start migrate --project-path ./my-project

# Dry run (no actual changes)
npm start migrate --dry-run

# Skip backups
npm start migrate --no-backup

# Verbose output
npm start migrate --verbose

# Automated mode (skip interactive prompts for CI/CD)
npm start migrate --yes

# Migrate specific framework
npm start migrate percy
```

## Project Structure

```
src/
├── commands/          # CLI commands
├── modules/           # Core migration modules
├── types/             # Shared type definitions
├── utils/             # Utility functions
└── cli.ts             # Interactive CLI workflow
```

## Development

### Prerequisites

- Node.js >= 18.0.0
- npm, yarn, or pnpm

### Available Scripts

```bash
npm run build    # Build the project
npm run test     # Run tests
npm run lint     # Lint code
npm run format   # Format code
```

### Code Quality

This project uses modern development tools for type safety, code quality, and formatting.

## Quality Assurance

The SmartUI Migration Tool follows strict quality principles to ensure enterprise-grade reliability:

- **Advanced Code Analysis**: Uses sophisticated parsing techniques for accurate code transformations
- **Enterprise-Grade Safety**: All transformations are safe for production codebases
- **Reliable Processing**: Handles various code formatting styles consistently
- **Future-Proof Design**: Built to handle evolving testing frameworks and patterns

## Testing and Validation

The SmartUI Migration Tool has been thoroughly tested and validated:

- **✅ Comprehensive Test Suite**: Unit and integration tests with Jest
- **✅ Cross-Platform Validation**: All executables tested on Windows, macOS (Intel/ARM), and Linux
- **✅ Multi-Language Support**: Tested with JavaScript/TypeScript, Java, and Python projects
- **✅ Multi-Framework Support**: Validated with Cypress, Playwright, Selenium, Storybook, and Appium
- **✅ Error Handling**: Robust error handling with user-friendly messages
- **✅ Performance Testing**: Optimized for large projects and fast execution

For detailed validation results, see the validation documentation in the miscellaneous folder.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the LambdaTest team or create an issue in the repository.
