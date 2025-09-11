"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MultiDetectionSelector = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * MultiDetectionSelector handles the selection process when multiple platforms,
 * frameworks, or languages are detected in a project
 */
class MultiDetectionSelector {
    /**
     * Display detected platforms, frameworks, and languages in a matrix format
     */
    static displayDetectionMatrix(result) {
        console.log(chalk_1.default.bold.blue('\n🔍 MULTIPLE DETECTIONS FOUND'));
        console.log(chalk_1.default.gray('='.repeat(60)));
        console.log(chalk_1.default.white('Your project contains multiple visual testing setups.'));
        console.log(chalk_1.default.white('Please select which one you want to migrate to SmartUI:'));
        console.log(chalk_1.default.gray('='.repeat(60)));
        // Display platforms
        if (result.platforms.length > 0) {
            console.log(chalk_1.default.bold.cyan('\n📱 DETECTED PLATFORMS:'));
            result.platforms.forEach((platform, index) => {
                const confidenceColor = this.getConfidenceColor(platform.confidence);
                const confidenceIcon = this.getConfidenceIcon(platform.confidence);
                console.log(chalk_1.default.white(`  ${index + 1}. ${platform.name}`));
                console.log(chalk_1.default.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(platform.confidence.toUpperCase())}`));
                console.log(chalk_1.default.gray(`     📁 Source: ${platform.evidence.source}`));
                console.log(chalk_1.default.gray(`     🔍 Match: ${platform.evidence.match}`));
                console.log(chalk_1.default.gray(`     📄 Files: ${platform.evidence.files.length} files`));
                if (platform.frameworks.length > 0) {
                    console.log(chalk_1.default.gray(`     🛠️  Frameworks: ${platform.frameworks.join(', ')}`));
                }
                if (platform.languages.length > 0) {
                    console.log(chalk_1.default.gray(`     💻 Languages: ${platform.languages.join(', ')}`));
                }
                console.log('');
            });
        }
        // Display frameworks
        if (result.frameworks.length > 0) {
            console.log(chalk_1.default.bold.green('\n🛠️  DETECTED FRAMEWORKS:'));
            result.frameworks.forEach((framework, index) => {
                const confidenceColor = this.getConfidenceColor(framework.confidence);
                const confidenceIcon = this.getConfidenceIcon(framework.confidence);
                console.log(chalk_1.default.white(`  ${index + 1}. ${framework.name}`));
                console.log(chalk_1.default.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(framework.confidence.toUpperCase())}`));
                console.log(chalk_1.default.gray(`     📄 Files: ${framework.evidence.files.length} files`));
                console.log(chalk_1.default.gray(`     🔍 Signatures: ${framework.evidence.signatures.length} patterns`));
                if (framework.platforms.length > 0) {
                    console.log(chalk_1.default.gray(`     📱 Platforms: ${framework.platforms.join(', ')}`));
                }
                if (framework.languages.length > 0) {
                    console.log(chalk_1.default.gray(`     💻 Languages: ${framework.languages.join(', ')}`));
                }
                console.log('');
            });
        }
        // Display languages
        if (result.languages.length > 0) {
            console.log(chalk_1.default.bold.yellow('\n💻 DETECTED LANGUAGES:'));
            result.languages.forEach((language, index) => {
                const confidenceColor = this.getConfidenceColor(language.confidence);
                const confidenceIcon = this.getConfidenceIcon(language.confidence);
                console.log(chalk_1.default.white(`  ${index + 1}. ${language.name}`));
                console.log(chalk_1.default.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(language.confidence.toUpperCase())}`));
                console.log(chalk_1.default.gray(`     📄 Files: ${language.evidence.files.length} files`));
                console.log(chalk_1.default.gray(`     📝 Extensions: ${language.evidence.extensions.join(', ')}`));
                if (language.platforms.length > 0) {
                    console.log(chalk_1.default.gray(`     📱 Platforms: ${language.platforms.join(', ')}`));
                }
                if (language.frameworks.length > 0) {
                    console.log(chalk_1.default.gray(`     🛠️  Frameworks: ${language.frameworks.join(', ')}`));
                }
                console.log('');
            });
        }
        // Display summary
        console.log(chalk_1.default.bold.magenta('\n📊 DETECTION SUMMARY:'));
        console.log(chalk_1.default.gray('='.repeat(40)));
        console.log(chalk_1.default.white(`📱 Platforms: ${result.platforms.length} detected`));
        console.log(chalk_1.default.white(`🛠️  Frameworks: ${result.frameworks.length} detected`));
        console.log(chalk_1.default.white(`💻 Languages: ${result.languages.length} detected`));
        console.log(chalk_1.default.white(`📋 Total Detections: ${result.totalDetections}`));
        console.log(chalk_1.default.gray('='.repeat(40)));
    }
    /**
     * Get user selection for which platform/framework/language to migrate
     */
    static async getUserSelection(result) {
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        // If only one platform is detected, use it
        if (result.platforms.length === 1) {
            console.log(chalk_1.default.green(`\n✅ Single platform detected: ${result.platforms[0].name}`));
            return { platform: result.platforms[0] };
        }
        // If multiple platforms, ask user to choose
        if (result.platforms.length > 1) {
            const platformChoices = result.platforms.map((platform, index) => ({
                name: `${platform.name} (${platform.confidence} confidence) - ${platform.evidence.source}`,
                value: platform,
                short: platform.name
            }));
            const platformAnswer = await inquirer.default.prompt([
                {
                    type: 'list',
                    name: 'platform',
                    message: 'Which platform would you like to migrate to SmartUI?',
                    choices: platformChoices,
                    pageSize: 10
                }
            ]);
            return { platform: platformAnswer.platform };
        }
        // If no platforms but frameworks detected, ask about frameworks
        if (result.frameworks.length > 0) {
            const frameworkChoices = result.frameworks.map((framework, index) => ({
                name: `${framework.name} (${framework.confidence} confidence) - ${framework.evidence.files.length} files`,
                value: framework,
                short: framework.name
            }));
            const frameworkAnswer = await inquirer.default.prompt([
                {
                    type: 'list',
                    name: 'framework',
                    message: 'Which framework would you like to migrate to SmartUI?',
                    choices: frameworkChoices,
                    pageSize: 10
                }
            ]);
            return { framework: frameworkAnswer.framework };
        }
        // If no platforms or frameworks but languages detected, ask about languages
        if (result.languages.length > 0) {
            const languageChoices = result.languages.map((language, index) => ({
                name: `${language.name} (${language.confidence} confidence) - ${language.evidence.files.length} files`,
                value: language,
                short: language.name
            }));
            const languageAnswer = await inquirer.default.prompt([
                {
                    type: 'list',
                    name: 'language',
                    message: 'Which language would you like to migrate to SmartUI?',
                    choices: languageChoices,
                    pageSize: 10
                }
            ]);
            return { language: languageAnswer.language };
        }
        throw new Error('No valid selections found');
    }
    /**
     * Display the selected option and confirm with user
     */
    static async confirmSelection(selection) {
        const inquirer = await Promise.resolve().then(() => __importStar(require('inquirer')));
        console.log(chalk_1.default.bold.blue('\n✅ SELECTION CONFIRMATION'));
        console.log(chalk_1.default.gray('='.repeat(50)));
        if (selection.platform) {
            console.log(chalk_1.default.green(`📱 Selected Platform: ${selection.platform.name}`));
            console.log(chalk_1.default.gray(`   Confidence: ${selection.platform.confidence}`));
            console.log(chalk_1.default.gray(`   Source: ${selection.platform.evidence.source}`));
            console.log(chalk_1.default.gray(`   Match: ${selection.platform.evidence.match}`));
            console.log(chalk_1.default.gray(`   Files: ${selection.platform.evidence.files.length} files`));
        }
        if (selection.framework) {
            console.log(chalk_1.default.green(`🛠️  Selected Framework: ${selection.framework.name}`));
            console.log(chalk_1.default.gray(`   Confidence: ${selection.framework.confidence}`));
            console.log(chalk_1.default.gray(`   Files: ${selection.framework.evidence.files.length} files`));
            console.log(chalk_1.default.gray(`   Signatures: ${selection.framework.evidence.signatures.length} patterns`));
        }
        if (selection.language) {
            console.log(chalk_1.default.green(`💻 Selected Language: ${selection.language.name}`));
            console.log(chalk_1.default.gray(`   Confidence: ${selection.language.confidence}`));
            console.log(chalk_1.default.gray(`   Files: ${selection.language.evidence.files.length} files`));
            console.log(chalk_1.default.gray(`   Extensions: ${selection.language.evidence.extensions.join(', ')}`));
        }
        const answer = await inquirer.default.prompt([
            {
                type: 'confirm',
                name: 'proceed',
                message: 'Proceed with this selection?',
                default: true
            }
        ]);
        return answer.proceed;
    }
    /**
     * Get confidence color for display
     */
    static getConfidenceColor(confidence) {
        switch (confidence) {
            case 'high': return chalk_1.default.green;
            case 'medium': return chalk_1.default.yellow;
            case 'low': return chalk_1.default.red;
            default: return chalk_1.default.gray;
        }
    }
    /**
     * Get confidence icon for display
     */
    static getConfidenceIcon(confidence) {
        switch (confidence) {
            case 'high': return '🟢';
            case 'medium': return '🟡';
            case 'low': return '🔴';
            default: return '⚪';
        }
    }
}
exports.MultiDetectionSelector = MultiDetectionSelector;
//# sourceMappingURL=MultiDetectionSelector.js.map