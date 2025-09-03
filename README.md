# SmartUI Migration Tool

[![npm version](https://badge.fury.io/js/smartui-migration-tool.svg)](https://badge.fury.io/js/smartui-migration-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/smartui-migration-tool.svg)](https://nodejs.org/)

> **Enterprise-grade CLI tool for migrating visual testing platforms to LambdaTest SmartUI**

The SmartUI Migration Tool is a powerful command-line interface that automates the migration of visual testing suites from popular platforms like Percy, Applitools, and Sauce Labs Visual to LambdaTest SmartUI. It provides intelligent detection, comprehensive transformation, and detailed progress tracking for seamless migration experiences.

## 🚀 Features

### ✨ **Intelligent Detection**
- **Multi-Platform Support**: Automatically detects Percy, Applitools, and Sauce Labs Visual projects
- **Framework Recognition**: Supports Cypress, Playwright, Selenium, Jest, Storybook, and more
- **Content-Aware Analysis**: Deep code analysis beyond file names and dependencies
- **Evidence-Based Detection**: Provides clear reasoning for platform and framework detection

### 🔄 **Comprehensive Transformation**
- **Configuration Migration**: Transforms platform-specific config files to SmartUI format
- **Code Transformation**: Updates test code with SmartUI API calls and syntax
- **Execution Scripts**: Migrates CI/CD pipelines and execution commands
- **Dependency Management**: Updates package.json and dependency files

### 📊 **Advanced Progress Tracking**
- **Real-time Progress Bars**: Visual progress indicators with ETA and speed metrics
- **Detailed Previews**: Comprehensive change preview before transformation
- **Step-by-Step Tracking**: Progress tracking for scanning, preview, and transformation phases
- **Professional UI**: Clean, animated progress indicators for enterprise use

### 🛡️ **Enterprise-Grade Safety**
- **Backup Creation**: Automatic backup of original files before transformation
- **Dry Run Mode**: Preview changes without modifying files
- **Manual Confirmation**: Interactive confirmation for each transformation step
- **Error Recovery**: Robust error handling with graceful degradation

### 🎯 **User Experience**
- **Interactive CLI**: User-friendly command-line interface with clear prompts
- **Verbose Logging**: Detailed logging for debugging and monitoring
- **File Selection**: Choose specific files to migrate
- **Comprehensive Reports**: Detailed migration reports and summaries

## 📦 Installation

### Prerequisites
- Node.js 18.0.0 or higher
- npm, yarn, or pnpm package manager

### Install from npm
```bash
npm install -g smartui-migration-tool
```

### Install from source
```bash
git clone https://github.com/lambdatest/smartui-migration-tool.git
cd smartui-migration-tool
npm install
npm run build
npm link
```

## 🚀 Quick Start

### Basic Migration
```bash
# Navigate to your project directory
cd /path/to/your/project

# Run the migration tool
smartui-migrator migrate
```

### Preview Changes (Recommended)
```bash
# Preview changes without applying them
smartui-migrator migrate --preview-only
```

### Safe Migration with Backups
```bash
# Create backups before transformation
smartui-migrator migrate --backup
```

### Automated Migration (CI/CD)
```bash
# Run in automated mode (no prompts)
smartui-migrator migrate --yes
```

## 📋 Command Options

### Global Options
- `--help`: Show help information
- `--version`: Show version information
- `--verbose`: Enable verbose logging

### Migration Options
- `--project-path <path>`: Specify project path (default: current directory)
- `--preview-only`: Show preview without applying changes
- `--dry-run`: Simulate transformation without modifying files
- `--backup`: Create backups before transformation
- `--confirm-each`: Ask for confirmation before each file
- `--yes`: Run in automated mode (skip prompts)

### Examples
```bash
# Preview changes for a specific project
smartui-migrator migrate --project-path ./my-project --preview-only

# Migrate with backups and manual confirmation
smartui-migrator migrate --backup --confirm-each

# Automated migration for CI/CD
smartui-migrator migrate --yes --backup

# Verbose migration with detailed logging
smartui-migrator migrate --verbose --preview-only
```

## 🔍 Supported Platforms

### Visual Testing Platforms
- **Percy**: Full support for Percy projects with Cypress, Playwright, and Storybook
- **Applitools**: Complete migration for Applitools Eyes projects
- **Sauce Labs Visual**: Migration support for Sauce Labs Visual testing

### Testing Frameworks
- **Cypress**: E2E testing framework with visual testing integration
- **Playwright**: Cross-browser testing with visual regression capabilities
- **Selenium**: WebDriver-based testing with visual validation
- **Jest**: JavaScript testing framework with snapshot testing
- **Storybook**: Component development with visual testing
- **Java**: Selenium-based Java testing projects
- **Python**: Selenium-based Python testing projects

### CI/CD Platforms
- **GitHub Actions**: Automated migration of GitHub Actions workflows
- **Jenkins**: Jenkins pipeline transformation
- **GitLab CI**: GitLab CI/CD pipeline migration
- **Azure DevOps**: Azure DevOps pipeline transformation

## 📊 Migration Process

### 1. **Project Analysis**
- Scans project structure and dependencies
- Detects visual testing platforms and frameworks
- Analyzes configuration files and test code
- Provides evidence-based detection results

### 2. **Change Preview**
- Generates comprehensive preview of all changes
- Shows file-by-file transformation details
- Displays configuration, code, and execution changes
- Provides warnings and recommendations

### 3. **User Confirmation**
- Interactive confirmation for transformation
- Option to confirm each file individually
- Backup recommendations and safety measures
- Clear next steps and guidance

### 4. **Transformation Execution**
- Applies changes with real-time progress tracking
- Creates backups if requested
- Transforms configuration files
- Updates test code and execution scripts

### 5. **Post-Migration Report**
- Comprehensive summary of changes made
- Files created, modified, and backed up
- Next steps and recommendations
- Integration guidance for SmartUI

## 🛠️ Configuration

### SmartUI Configuration
The tool creates a `.smartui.json` configuration file:

```json
{
  "buildName": "My Project Build",
  "buildId": "build-123",
  "project": "my-project",
  "branch": "main",
  "browsers": [
    {
      "browserName": "chrome",
      "browserVersion": "latest",
      "platformName": "Windows 10"
    }
  ],
  "settings": {
    "ignore": [
      ".dynamic-content"
    ],
    "fullPage": true,
    "viewportSize": {
      "width": 1280,
      "height": 720
    }
  }
}
```

### Environment Variables
```bash
# SmartUI Configuration
SMARTUI_BUILD_NAME="My Build"
SMARTUI_PROJECT="my-project"
SMARTUI_BRANCH="main"

# CI/CD Integration
CI=true
BUILD_ID="build-123"
BRANCH_NAME="main"
```

## 🔧 Advanced Usage

### Custom File Selection
```bash
# Select specific files for migration
smartui-migrator migrate --preview-only
# Follow interactive prompts to select files
```

### Batch Processing
```bash
# Process multiple projects
for project in project1 project2 project3; do
  smartui-migrator migrate --project-path ./$project --yes --backup
done
```

### Integration with CI/CD
```yaml
# GitHub Actions example
- name: Migrate to SmartUI
  run: |
    npm install -g smartui-migration-tool
    smartui-migrator migrate --yes --backup
  env:
    SMARTUI_BUILD_NAME: ${{ github.workflow }}
    SMARTUI_PROJECT: ${{ github.repository }}
    SMARTUI_BRANCH: ${{ github.ref_name }}
```

## 📈 Progress Tracking

The tool provides comprehensive progress tracking:

### Scanning Phase
```
Finding configuration anchors |████████████████████████████████████████| 100% (1/1) ETA: 0s
Performing deep content search |████████████████████████████████████████| 100% (2/2) ETA: 0s
Finalizing detection results |████████████████████████████████████████| 100% (4/4) ETA: 0s
```

### Preview Generation
```
Analyzing configuration changes |████████████████████████████████████████| 100% (1/1) ETA: 0s
Analyzing code changes |████████████████████████████████████████| 100% (1/1) ETA: 0s
Analyzing execution changes |████████████████████████████████████████| 100% (3/3) ETA: 0s
```

### Transformation Phase
```
Transforming files |████████████████████████████████████████| 100% (2/2) ETA: 0s Speed: 2.5/s
Processing files |████████████████████████████████████████| 100% (2/2) ETA: 0s Speed: 1.2/s
```

## 🚨 Troubleshooting

### Common Issues

#### Platform Not Detected
```bash
# Enable verbose logging to see detection details
smartui-migrator migrate --verbose --preview-only
```

#### Multiple Platforms Detected
```bash
# The tool supports migrating from one platform at a time
# Remove conflicting dependencies and try again
```

#### Permission Errors
```bash
# Ensure you have write permissions to the project directory
chmod -R 755 /path/to/your/project
```

### Debug Mode
```bash
# Run with maximum verbosity
smartui-migrator migrate --verbose --preview-only
```

### Getting Help
```bash
# Show help information
smartui-migrator --help
smartui-migrator migrate --help
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/lambdatest/smartui-migration-tool.git
cd smartui-migration-tool
npm install
npm run build
npm test
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/lambdatest/smartui-migration-tool/wiki)
- **Issues**: [GitHub Issues](https://github.com/lambdatest/smartui-migration-tool/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lambdatest/smartui-migration-tool/discussions)
- **Email**: support@lambdatest.com

## 🙏 Acknowledgments

- Built with [OCLIF](https://oclif.io/) for enterprise-grade CLI experience
- Powered by [LambdaTest SmartUI](https://www.lambdatest.com/smart-ui) for visual testing
- Thanks to the open-source community for the amazing tools and libraries

---

**Made with ❤️ by the LambdaTest Team**

[![LambdaTest](https://img.shields.io/badge/LambdaTest-SmartUI-blue.svg)](https://www.lambdatest.com/smart-ui)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black.svg)](https://github.com/lambdatest/smartui-migration-tool)
[![npm](https://img.shields.io/badge/npm-Package-red.svg)](https://www.npmjs.com/package/smartui-migration-tool)