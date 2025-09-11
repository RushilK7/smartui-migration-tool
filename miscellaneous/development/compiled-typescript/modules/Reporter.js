"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reporter = void 0;
/**
 * Reporter module for generating migration summary reports
 * Provides detailed feedback on the migration process and results
 */
class Reporter {
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    /**
     * Generates a comprehensive migration report
     * @param reportData - Final report data containing all migration information
     * @returns Promise<string> - Generated Markdown report content
     */
    async generateReport(reportData) {
        const { detectionResult, filesCreated, filesModified, snapshotCount, warnings, migrationStartTime, migrationEndTime, totalFilesProcessed } = reportData;
        let report = this.generateReportHeader(migrationStartTime, migrationEndTime);
        report += this.generateMigrationSummaryTable(detectionResult, totalFilesProcessed, snapshotCount);
        report += this.generateFilesChangedSection(filesCreated, filesModified);
        report += this.generateWarningsSection(warnings);
        report += this.generateNextStepsSection(detectionResult);
        return report;
    }
    /**
     * Generates console output report
     */
    async generateConsoleReport(migrationResult) {
        // TODO: Implement console report generation
        throw new Error('Console report generation not implemented yet');
    }
    /**
     * Generates HTML report
     */
    async generateHTMLReport(migrationResult) {
        // TODO: Implement HTML report generation
        throw new Error('HTML report generation not implemented yet');
    }
    /**
     * Generates JSON report
     */
    async generateJSONReport(migrationResult) {
        // TODO: Implement JSON report generation
        throw new Error('JSON report generation not implemented yet');
    }
    /**
     * Generates markdown report
     */
    async generateMarkdownReport(migrationResult) {
        let report = `# SmartUI Migration Report\n\n`;
        report += `## Migration Summary\n\n`;
        report += `- **Migration Status**: ${migrationResult.success ? 'Success' : 'Failed'}\n`;
        report += `- **Start Time**: ${migrationResult.startTime}\n`;
        report += `- **End Time**: ${migrationResult.endTime}\n\n`;
        report += `## Statistics\n\n`;
        report += `- **Warnings**: ${migrationResult.warnings.length}\n`;
        report += `- **Errors**: ${migrationResult.errors.length}\n\n`;
        // Add general next steps
        report += this.generateStandardNextSteps('JavaScript/TypeScript');
        return report;
    }
    /**
     * Generates Appium-specific next steps
     */
    generateAppiumNextSteps(language) {
        let steps = `## Next Steps for Appium Testing\n\n`;
        if (language === 'Python') {
            steps += `### 1. Install SmartUI App SDK\n\n`;
            steps += `\`\`\`bash\n`;
            steps += `pip install lambdatest-appium-driver\n`;
            steps += `\`\`\`\n\n`;
            steps += `### 2. Update Your Test Code\n\n`;
            steps += `Replace the import statement:\n\n`;
            steps += `\`\`\`python\n`;
            steps += `# Old import\n`;
            steps += `from percy import percy_screenshot\n\n`;
            steps += `# New import\n`;
            steps += `from lambdatest_appium_driver import SmartUISnapshot\n`;
            steps += `\`\`\`\n\n`;
            steps += `### 3. Verify Appium Capabilities\n\n`;
            steps += `Ensure your Appium capabilities are correctly configured:\n\n`;
            steps += `\`\`\`python\n`;
            steps += `desired_caps = {\n`;
            steps += `    'deviceName': 'iPhone 12',\n`;
            steps += `    'platformName': 'iOS',\n`;
            steps += `    'platformVersion': '15.0',\n`;
            steps += `    'app': '/path/to/your/app.app'\n`;
            steps += `}\n`;
            steps += `\`\`\`\n\n`;
        }
        else if (language === 'Java') {
            steps += `### 1. Install SmartUI App SDK\n\n`;
            steps += `Add to your \`pom.xml\`:\n\n`;
            steps += `\`\`\`xml\n`;
            steps += `<dependency>\n`;
            steps += `    <groupId>com.lambdatest</groupId>\n`;
            steps += `    <artifactId>lambdatest-appium-driver</artifactId>\n`;
            steps += `    <version>1.0.0</version>\n`;
            steps += `</dependency>\n`;
            steps += `\`\`\`\n\n`;
            steps += `### 2. Update Your Test Code\n\n`;
            steps += `Replace the import statement:\n\n`;
            steps += `\`\`\`java\n`;
            steps += `// Old import\n`;
            steps += `import io.percy.selenium.Percy;\n\n`;
            steps += `// New import\n`;
            steps += `import io.github.lambdatest.SmartUISnapshot;\n`;
            steps += `\`\`\`\n\n`;
            steps += `### 3. Verify Appium Capabilities\n\n`;
            steps += `Ensure your Appium capabilities are correctly configured:\n\n`;
            steps += `\`\`\`java\n`;
            steps += `DesiredCapabilities caps = new DesiredCapabilities();\n`;
            steps += `caps.setCapability("deviceName", "iPhone 12");\n`;
            steps += `caps.setCapability("platformName", "iOS");\n`;
            steps += `caps.setCapability("platformVersion", "15.0");\n`;
            steps += `caps.setCapability("app", "/path/to/your/app.app");\n`;
            steps += `\`\`\`\n\n`;
        }
        steps += `### 4. Run Your Tests\n\n`;
        steps += `Execute your Appium tests with SmartUI:\n\n`;
        steps += `\`\`\`bash\n`;
        steps += `npx smartui exec -- your-test-command\n`;
        steps += `\`\`\`\n\n`;
        steps += `### 5. Important Notes\n\n`;
        steps += `- **Native Context Switching**: If your tests use \`driver.switch_to.context('NATIVE_APP')\` (Python) or \`driver.context("NATIVE_APP")\` (Java), these calls have been preserved to maintain hybrid app testing functionality.\n\n`;
        steps += `- **Device Configuration**: Verify that your device names, platform versions, and app paths are correctly configured for your test environment.\n\n`;
        steps += `- **Visual Testing**: SmartUI will automatically capture screenshots of your mobile app during test execution.\n\n`;
        return steps;
    }
    /**
     * Generates standard next steps for non-Appium projects
     */
    generateStandardNextSteps(language) {
        let steps = `## Next Steps\n\n`;
        steps += `### 1. Install SmartUI SDK\n\n`;
        if (language === 'Python') {
            steps += `\`\`\`bash\n`;
            steps += `pip install lambdatest-selenium-driver\n`;
            steps += `\`\`\`\n\n`;
        }
        else if (language === 'Java') {
            steps += `Add to your \`pom.xml\`:\n\n`;
            steps += `\`\`\`xml\n`;
            steps += `<dependency>\n`;
            steps += `    <groupId>com.lambdatest</groupId>\n`;
            steps += `    <artifactId>lambdatest-selenium-driver</artifactId>\n`;
            steps += `    <version>1.0.0</version>\n`;
            steps += `</dependency>\n`;
            steps += `\`\`\`\n\n`;
        }
        else {
            steps += `\`\`\`bash\n`;
            steps += `npm install @lambdatest/smartui-cypress\n`;
            steps += `\`\`\`\n\n`;
        }
        steps += `### 2. Run Your Tests\n\n`;
        steps += `Execute your tests with SmartUI:\n\n`;
        steps += `\`\`\`bash\n`;
        steps += `npx smartui exec -- your-test-command\n`;
        steps += `\`\`\`\n\n`;
        return steps;
    }
    /**
     * Generates the report header with title and timestamp
     */
    generateReportHeader(startTime, endTime) {
        const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
        const timestamp = endTime.toISOString().replace('T', ' ').replace('Z', ' UTC');
        return `# 🚀 SmartUI Migration Report

**Generated:** ${timestamp}  
**Migration Duration:** ${duration} seconds

---

`;
    }
    /**
     * Generates the migration summary table
     */
    generateMigrationSummaryTable(detectionResult, totalFilesProcessed, snapshotCount) {
        const testTypeDisplay = this.getTestTypeDisplay(detectionResult.testType);
        return `## 📊 Migration Summary

| Property | Value |
|----------|-------|
| **Source Platform** | ${detectionResult.platform} |
| **Language** | ${detectionResult.language} |
| **Framework** | ${detectionResult.framework} |
| **Test Type** | ${testTypeDisplay} |
| **Files Processed** | ${totalFilesProcessed} |
| **Snapshots Migrated** | ${snapshotCount} |

---
`;
    }
    /**
     * Generates the files changed section
     */
    generateFilesChangedSection(filesCreated, filesModified) {
        let section = `## 📂 Files Modified / Created

`;
        if (filesCreated.length > 0) {
            section += `### ✅ Files Created\n\n`;
            filesCreated.forEach(file => {
                section += `- \`${file}\`\n`;
            });
            section += `\n`;
        }
        if (filesModified.length > 0) {
            section += `### 🔄 Files Modified\n\n`;
            filesModified.forEach(file => {
                section += `- \`${file}\`\n`;
            });
            section += `\n`;
        }
        if (filesCreated.length === 0 && filesModified.length === 0) {
            section += `No files were created or modified during this migration.\n\n`;
        }
        section += `---
`;
        return section;
    }
    /**
     * Generates the warnings section
     */
    generateWarningsSection(warnings) {
        let section = `## ⚠️ Warnings & Manual Review Required

`;
        if (warnings.length === 0) {
            section += `✅ **No warnings were generated.** Your migration completed successfully without any issues that require manual review.\n\n`;
        }
        else {
            section += `The following items require your attention:\n\n`;
            warnings.forEach((warning, index) => {
                section += `${index + 1}. **${warning.message}**\n`;
                if (warning.details) {
                    section += `   ${warning.details}\n`;
                }
                section += `\n`;
            });
        }
        section += `---
`;
        return section;
    }
    /**
     * Generates the next steps section based on detection result
     */
    generateNextStepsSection(detectionResult) {
        let section = `## 🚀 Next Steps

`;
        // Step 1: Install Dependencies
        section += this.generateInstallDependenciesStep(detectionResult);
        // Step 2: Configure CI/CD Secrets
        section += this.generateConfigureSecretsStep();
        // Step 3: Run Tests
        section += this.generateRunTestsStep(detectionResult);
        // Additional notes based on test type
        section += this.generateAdditionalNotes(detectionResult);
        return section;
    }
    /**
     * Generates the install dependencies step
     */
    generateInstallDependenciesStep(detectionResult) {
        let step = `### 1. Install Dependencies

`;
        if (detectionResult.language === 'Python') {
            if (detectionResult.testType === 'appium') {
                step += `Install the SmartUI App SDK for Python:\n\n`;
                step += `\`\`\`bash\n`;
                step += `pip install lambdatest-appium-driver\n`;
                step += `\`\`\`\n\n`;
            }
            else {
                step += `Install the SmartUI Selenium SDK for Python:\n\n`;
                step += `\`\`\`bash\n`;
                step += `pip install lambdatest-selenium-driver\n`;
                step += `\`\`\`\n\n`;
            }
        }
        else if (detectionResult.language === 'Java') {
            if (detectionResult.testType === 'appium') {
                step += `Add the SmartUI App SDK to your \`pom.xml\`:\n\n`;
                step += `\`\`\`xml\n`;
                step += `<dependency>\n`;
                step += `    <groupId>com.lambdatest</groupId>\n`;
                step += `    <artifactId>lambdatest-appium-driver</artifactId>\n`;
                step += `    <version>1.0.0</version>\n`;
                step += `</dependency>\n`;
                step += `\`\`\`\n\n`;
            }
            else {
                step += `Add the SmartUI Selenium SDK to your \`pom.xml\`:\n\n`;
                step += `\`\`\`xml\n`;
                step += `<dependency>\n`;
                step += `    <groupId>com.lambdatest</groupId>\n`;
                step += `    <artifactId>lambdatest-selenium-driver</artifactId>\n`;
                step += `    <version>1.0.0</version>\n`;
                step += `</dependency>\n`;
                step += `\`\`\`\n\n`;
            }
        }
        else {
            // JavaScript/TypeScript
            if (detectionResult.testType === 'storybook') {
                step += `Install the SmartUI Storybook SDK:\n\n`;
                step += `\`\`\`bash\n`;
                step += `npm install @lambdatest/smartui-storybook\n`;
                step += `\`\`\`\n\n`;
            }
            else {
                step += `Install the SmartUI SDK for your framework:\n\n`;
                if (detectionResult.framework === 'Cypress') {
                    step += `\`\`\`bash\n`;
                    step += `npm install @lambdatest/smartui-cypress\n`;
                    step += `\`\`\`\n\n`;
                }
                else if (detectionResult.framework === 'Playwright') {
                    step += `\`\`\`bash\n`;
                    step += `npm install @lambdatest/smartui-playwright\n`;
                    step += `\`\`\`\n\n`;
                }
                else {
                    step += `\`\`\`bash\n`;
                    step += `npm install @lambdatest/smartui-selenium\n`;
                    step += `\`\`\`\n\n`;
                }
            }
        }
        return step;
    }
    /**
     * Generates the configure secrets step
     */
    generateConfigureSecretsStep() {
        return `### 2. Configure CI/CD Secrets

Set the following environment variables in your CI/CD provider's settings:

- \`PROJECT_TOKEN\` - Your SmartUI project token
- \`LT_USERNAME\` - Your LambdaTest username  
- \`LT_ACCESS_KEY\` - Your LambdaTest access key

**Note:** These secrets have been added as placeholders in your CI/CD configuration files. Make sure to replace them with your actual credentials.

`;
    }
    /**
     * Generates the run tests step
     */
    generateRunTestsStep(detectionResult) {
        let step = `### 3. Run Your Migrated Tests

Execute your tests with SmartUI using one of these commands:

`;
        if (detectionResult.language === 'Python') {
            step += `\`\`\`bash\n`;
            step += `npx smartui exec -- pytest\n`;
            step += `\`\`\`\n\n`;
        }
        else if (detectionResult.language === 'Java') {
            step += `\`\`\`bash\n`;
            step += `npx smartui exec -- mvn test\n`;
            step += `\`\`\`\n\n`;
        }
        else {
            // JavaScript/TypeScript
            if (detectionResult.testType === 'storybook') {
                step += `\`\`\`bash\n`;
                step += `npx smartui exec -- npm run build-storybook\n`;
                step += `npx smartui-storybook\n`;
                step += `\`\`\`\n\n`;
            }
            else if (detectionResult.framework === 'Cypress') {
                step += `\`\`\`bash\n`;
                step += `npx smartui exec -- npx cypress run\n`;
                step += `\`\`\`\n\n`;
            }
            else if (detectionResult.framework === 'Playwright') {
                step += `\`\`\`bash\n`;
                step += `npx smartui exec -- npx playwright test\n`;
                step += `\`\`\`\n\n`;
            }
            else {
                step += `\`\`\`bash\n`;
                step += `npx smartui exec -- npm test\n`;
                step += `\`\`\`\n\n`;
            }
        }
        return step;
    }
    /**
     * Generates additional notes based on test type
     */
    generateAdditionalNotes(detectionResult) {
        let notes = `### 📝 Additional Notes

`;
        if (detectionResult.testType === 'appium') {
            notes += `**Mobile Testing:** Your Appium tests have been migrated to use SmartUI's mobile testing capabilities. Make sure your device configurations and app paths are correctly set up in your test environment.\n\n`;
            notes += `**Native Context Switching:** If your tests use native context switching (e.g., \`driver.switch_to.context('NATIVE_APP')\`), these calls have been preserved to maintain hybrid app testing functionality.\n\n`;
        }
        else if (detectionResult.testType === 'storybook') {
            notes += `**Component Testing:** Your Storybook tests have been migrated to use SmartUI's component testing capabilities. The tool will automatically detect your Storybook server and capture component screenshots.\n\n`;
        }
        else {
            notes += `**E2E Testing:** Your end-to-end tests have been migrated to use SmartUI's web testing capabilities. The tool will capture screenshots during test execution and compare them against your baseline images.\n\n`;
        }
        notes += `**Dashboard Access:** Visit the [SmartUI Dashboard](https://smartui.lambdatest.com) to view your test results, manage baselines, and configure your project settings.\n\n`;
        return notes;
    }
    /**
     * Gets a display-friendly test type string
     */
    getTestTypeDisplay(testType) {
        switch (testType) {
            case 'e2e':
                return 'End-to-End Testing';
            case 'storybook':
                return 'Component Testing (Storybook)';
            case 'appium':
                return 'Mobile Testing (Appium)';
            default:
                return testType;
        }
    }
    /**
     * Calculates migration statistics
     */
    calculateStatistics(migrationResult) {
        // TODO: Implement statistics calculation
        throw new Error('Statistics calculation not implemented yet');
    }
}
exports.Reporter = Reporter;
//# sourceMappingURL=Reporter.js.map