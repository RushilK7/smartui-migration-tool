import chalk from 'chalk';
import { MultiDetectionResult, DetectedPlatform, DetectedFramework, DetectedLanguage } from '../types';

/**
 * MultiDetectionSelector handles the selection process when multiple platforms,
 * frameworks, or languages are detected in a project
 */
export class MultiDetectionSelector {
  /**
   * Display detected platforms, frameworks, and languages in a matrix format
   */
  public static displayDetectionMatrix(result: MultiDetectionResult): void {
    console.log(chalk.bold.blue('\n🔍 MULTIPLE DETECTIONS FOUND'));
    console.log(chalk.gray('='.repeat(60)));
    console.log(chalk.white('Your project contains multiple visual testing setups.'));
    console.log(chalk.white('Please select which one you want to migrate to SmartUI:'));
    console.log(chalk.gray('='.repeat(60)));

    // Display platforms
    if (result.platforms.length > 0) {
      console.log(chalk.bold.cyan('\n📱 DETECTED PLATFORMS:'));
      result.platforms.forEach((platform, index) => {
        const confidenceColor = this.getConfidenceColor(platform.confidence);
        const confidenceIcon = this.getConfidenceIcon(platform.confidence);
        
        console.log(chalk.white(`  ${index + 1}. ${platform.name}`));
        console.log(chalk.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(platform.confidence.toUpperCase())}`));
        console.log(chalk.gray(`     📁 Source: ${platform.evidence.source}`));
        console.log(chalk.gray(`     🔍 Match: ${platform.evidence.match}`));
        console.log(chalk.gray(`     📄 Files: ${platform.evidence.files.length} files`));
        if (platform.frameworks.length > 0) {
          console.log(chalk.gray(`     🛠️  Frameworks: ${platform.frameworks.join(', ')}`));
        }
        if (platform.languages.length > 0) {
          console.log(chalk.gray(`     💻 Languages: ${platform.languages.join(', ')}`));
        }
        console.log('');
      });
    }

    // Display frameworks
    if (result.frameworks.length > 0) {
      console.log(chalk.bold.green('\n🛠️  DETECTED FRAMEWORKS:'));
      result.frameworks.forEach((framework, index) => {
        const confidenceColor = this.getConfidenceColor(framework.confidence);
        const confidenceIcon = this.getConfidenceIcon(framework.confidence);
        
        console.log(chalk.white(`  ${index + 1}. ${framework.name}`));
        console.log(chalk.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(framework.confidence.toUpperCase())}`));
        console.log(chalk.gray(`     📄 Files: ${framework.evidence.files.length} files`));
        console.log(chalk.gray(`     🔍 Signatures: ${framework.evidence.signatures.length} patterns`));
        if (framework.platforms.length > 0) {
          console.log(chalk.gray(`     📱 Platforms: ${framework.platforms.join(', ')}`));
        }
        if (framework.languages.length > 0) {
          console.log(chalk.gray(`     💻 Languages: ${framework.languages.join(', ')}`));
        }
        console.log('');
      });
    }

    // Display languages
    if (result.languages.length > 0) {
      console.log(chalk.bold.yellow('\n💻 DETECTED LANGUAGES:'));
      result.languages.forEach((language, index) => {
        const confidenceColor = this.getConfidenceColor(language.confidence);
        const confidenceIcon = this.getConfidenceIcon(language.confidence);
        
        console.log(chalk.white(`  ${index + 1}. ${language.name}`));
        console.log(chalk.gray(`     ${confidenceIcon} Confidence: ${confidenceColor(language.confidence.toUpperCase())}`));
        console.log(chalk.gray(`     📄 Files: ${language.evidence.files.length} files`));
        console.log(chalk.gray(`     📝 Extensions: ${language.evidence.extensions.join(', ')}`));
        if (language.platforms.length > 0) {
          console.log(chalk.gray(`     📱 Platforms: ${language.platforms.join(', ')}`));
        }
        if (language.frameworks.length > 0) {
          console.log(chalk.gray(`     🛠️  Frameworks: ${language.frameworks.join(', ')}`));
        }
        console.log('');
      });
    }

    // Display summary
    console.log(chalk.bold.magenta('\n📊 DETECTION SUMMARY:'));
    console.log(chalk.gray('='.repeat(40)));
    console.log(chalk.white(`📱 Platforms: ${result.platforms.length} detected`));
    console.log(chalk.white(`🛠️  Frameworks: ${result.frameworks.length} detected`));
    console.log(chalk.white(`💻 Languages: ${result.languages.length} detected`));
    console.log(chalk.white(`📋 Total Detections: ${result.totalDetections}`));
    console.log(chalk.gray('='.repeat(40)));
  }

  /**
   * Get user selection for which platform/framework/language to migrate
   */
  public static async getUserSelection(result: MultiDetectionResult): Promise<{
    platform?: DetectedPlatform;
    framework?: DetectedFramework;
    language?: DetectedLanguage;
  }> {
    const inquirer = await import('inquirer');

    // If only one platform is detected, use it
    if (result.platforms.length === 1) {
      console.log(chalk.green(`\n✅ Single platform detected: ${result.platforms[0]!.name}`));
      return { platform: result.platforms[0]! };
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
  public static async confirmSelection(selection: {
    platform?: DetectedPlatform;
    framework?: DetectedFramework;
    language?: DetectedLanguage;
  }): Promise<boolean> {
    const inquirer = await import('inquirer');

    console.log(chalk.bold.blue('\n✅ SELECTION CONFIRMATION'));
    console.log(chalk.gray('='.repeat(50)));

    if (selection.platform) {
      console.log(chalk.green(`📱 Selected Platform: ${selection.platform.name}`));
      console.log(chalk.gray(`   Confidence: ${selection.platform.confidence}`));
      console.log(chalk.gray(`   Source: ${selection.platform.evidence.source}`));
      console.log(chalk.gray(`   Match: ${selection.platform.evidence.match}`));
      console.log(chalk.gray(`   Files: ${selection.platform.evidence.files.length} files`));
    }

    if (selection.framework) {
      console.log(chalk.green(`🛠️  Selected Framework: ${selection.framework.name}`));
      console.log(chalk.gray(`   Confidence: ${selection.framework.confidence}`));
      console.log(chalk.gray(`   Files: ${selection.framework.evidence.files.length} files`));
      console.log(chalk.gray(`   Signatures: ${selection.framework.evidence.signatures.length} patterns`));
    }

    if (selection.language) {
      console.log(chalk.green(`💻 Selected Language: ${selection.language.name}`));
      console.log(chalk.gray(`   Confidence: ${selection.language.confidence}`));
      console.log(chalk.gray(`   Files: ${selection.language.evidence.files.length} files`));
      console.log(chalk.gray(`   Extensions: ${selection.language.evidence.extensions.join(', ')}`));
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
  private static getConfidenceColor(confidence: 'high' | 'medium' | 'low') {
    switch (confidence) {
      case 'high': return chalk.green;
      case 'medium': return chalk.yellow;
      case 'low': return chalk.red;
      default: return chalk.gray;
    }
  }

  /**
   * Get confidence icon for display
   */
  private static getConfidenceIcon(confidence: 'high' | 'medium' | 'low') {
    switch (confidence) {
      case 'high': return '🟢';
      case 'medium': return '🟡';
      case 'low': return '🔴';
      default: return '⚪';
    }
  }
}
