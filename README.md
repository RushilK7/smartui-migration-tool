# SmartUI Migration Tool

[![npm version](https://badge.fury.io/js/smartui-migration-tool.svg)](https://badge.fury.io/js/smartui-migration-tool)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/node/v/smartui-migration-tool.svg)](https://nodejs.org/)

> **Seamlessly migrate your visual testing from Percy, Applitools, and Sauce Labs to LambdaTest SmartUI**

The SmartUI Migration Tool automates the migration of your visual testing suite to LambdaTest SmartUI. Save time and effort with intelligent detection, comprehensive transformation, and detailed progress tracking.

## 🚀 Quick Start

### 1. Install the Tool
```bash
npm install -g smartui-migration-tool
```

### 2. Run Migration
```bash
# Navigate to your project
cd /path/to/your/project

# Start migration (interactive mode)
smartui-migrator migrate --interactive

# Or use traditional flags
smartui-migrator migrate --backup --preview-only
```

### 3. Follow the Prompts
The tool will guide you through:
- ✅ **Detection**: Automatically finds your visual testing setup
- 👀 **Preview**: Shows exactly what will be changed
- 🛡️ **Safety**: Creates backups before making changes
- 🔄 **Migration**: Transforms your code to SmartUI

## 🎯 What Gets Migrated

### **Visual Testing Platforms**
- **Percy** → SmartUI
- **Applitools Eyes** → SmartUI  
- **Sauce Labs Visual** → SmartUI

### **Testing Frameworks**
- **Cypress** (E2E tests)
- **Playwright** (Cross-browser tests)
- **Selenium** (WebDriver tests)
- **Jest** (Unit tests with snapshots)
- **Storybook** (Component tests)

### **What Changes**
- 📁 **Configuration files** (`.percy.yml`, `applitools.config.js`, etc.)
- 💻 **Test code** (API calls, syntax, imports)
- 🔧 **Dependencies** (`package.json`, `requirements.txt`)
- 🚀 **CI/CD scripts** (GitHub Actions, Jenkins, etc.)

## 🎛️ Interactive Mode (Recommended)

Use the interactive mode for the best experience:

```bash
smartui-migrator migrate --interactive
```

This opens a user-friendly menu where you can:
- 🛡️ Choose to create backups
- 🔍 Enable dry-run mode
- 📝 Turn on verbose logging
- 🤖 Set automated mode for CI/CD
- 👀 Preview changes only
- ✅ Confirm each file individually

## 📋 Command Options

### **Basic Commands**
```bash
# Interactive mode (recommended for beginners)
smartui-migrator migrate --interactive

# Preview changes without applying them
smartui-migrator migrate --preview-only

# Safe migration with automatic backups
smartui-migrator migrate --backup

# Automated mode for CI/CD
smartui-migrator migrate --yes --backup
```

### **Advanced Options**
```bash
# Specify project path
smartui-migrator migrate --project-path ./my-project

# Dry run (simulate without changes)
smartui-migrator migrate --dry-run

# Verbose output for debugging
smartui-migrator migrate --verbose

# Confirm each file individually
smartui-migrator migrate --confirm-each
```

### **Flag Combinations**
```bash
# Safe testing with preview and backup
smartui-migrator migrate --preview-only --backup --verbose

# CI/CD automation
smartui-migrator migrate --yes --backup --project-path ./my-project

# Interactive with specific project
smartui-migrator migrate --interactive --project-path ./my-project
```

## 🔍 Supported Projects

### **Percy Projects**
- Cypress with Percy
- Playwright with Percy
- Storybook with Percy
- Custom Percy implementations

### **Applitools Projects**
- Applitools Eyes with Selenium
- Applitools Eyes with Cypress
- Applitools Eyes with Playwright
- Java and Python Applitools projects

### **Sauce Labs Visual**
- Sauce Labs Visual with Selenium
- Cross-browser visual testing setups

## 📊 Migration Process

### **Step 1: Detection** 🔍
- Scans your project structure
- Identifies visual testing platform
- Detects testing framework
- Analyzes configuration files

### **Step 2: Preview** 👀
- Shows all files that will be changed
- Displays line-by-line differences
- Highlights configuration changes
- Provides warnings and recommendations

### **Step 3: Confirmation** ✅
- Interactive confirmation menu
- Option to confirm each file
- Backup recommendations
- Safety warnings

### **Step 4: Transformation** 🔄
- Creates backups (if requested)
- Updates configuration files
- Transforms test code
- Modifies dependencies

### **Step 5: Summary** 📋
- Shows what was changed
- Lists created/modified files
- Provides next steps
- Integration guidance

## 🛡️ Safety Features

### **Backup System**
- Automatic backup creation
- Original files preserved
- Easy restoration if needed
- Timestamped backup folders

### **Preview Mode**
- See changes before applying
- No modifications made
- Detailed change preview
- Safe testing environment

### **Dry Run**
- Simulate transformation
- Test without changes
- Validate migration logic
- Debug configuration

## 🚨 Troubleshooting

### **Common Issues**

#### Platform Not Detected
```bash
# Enable verbose mode to see detection details
smartui-migrator migrate --verbose --preview-only
```

#### Multiple Platforms Found
The tool migrates one platform at a time. Remove conflicting dependencies and try again.

#### Permission Errors
Ensure you have write permissions to your project directory.

### **Getting Help**
```bash
# Show help information
smartui-migrator --help
smartui-migrator migrate --help

# Debug with verbose output
smartui-migrator migrate --verbose --preview-only
```

## 🔧 CI/CD Integration

### **GitHub Actions**
```yaml
- name: Migrate to SmartUI
  run: |
    npm install -g smartui-migration-tool
    smartui-migrator migrate --yes --backup
  env:
    SMARTUI_BUILD_NAME: ${{ github.workflow }}
    SMARTUI_PROJECT: ${{ github.repository }}
    SMARTUI_BRANCH: ${{ github.ref_name }}
```

### **Jenkins**
```groovy
stage('Migrate to SmartUI') {
    steps {
        sh 'npm install -g smartui-migration-tool'
        sh 'smartui-migrator migrate --yes --backup'
    }
}
```

## 📈 What's Next?

After migration, you'll need to:

1. **Install SmartUI CLI**
   ```bash
   npm install @lambdatest/smartui-cli
   ```

2. **Configure SmartUI**
   - Set up your LambdaTest credentials
   - Configure project settings
   - Set up CI/CD integration

3. **Run Your Tests**
   ```bash
   # Run your migrated tests
   npm test
   ```

4. **View Results**
   - Check the SmartUI Dashboard
   - Review visual comparisons
   - Set up notifications

## 🆘 Support

- **Documentation**: [SmartUI Docs](https://www.lambdatest.com/smart-ui)
- **Issues**: [GitHub Issues](https://github.com/lambdatest/smartui-migration-tool/issues)
- **Support**: [LambdaTest Support](https://www.lambdatest.com/support)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by the LambdaTest Team**

[![LambdaTest](https://img.shields.io/badge/LambdaTest-SmartUI-blue.svg)](https://www.lambdatest.com/smart-ui)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black.svg)](https://github.com/lambdatest/smartui-migration-tool)
[![npm](https://img.shields.io/badge/npm-Package-red.svg)](https://www.npmjs.com/package/smartui-migration-tool)