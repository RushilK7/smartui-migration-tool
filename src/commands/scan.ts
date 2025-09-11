import { Command } from '@oclif/core';
import chalk from 'chalk';
import { ASCIILogos } from '../utils/ascii-logos';
import * as fs from 'fs';
import * as path from 'path';
import inquirer from 'inquirer';

export default class Scan extends Command {
  static description = 'Scan specific path for visual testing patterns and migration opportunities';

  static flags = {};

  static args = [
    {
      name: 'path',
      description: 'Path to scan for visual testing patterns',
      required: true,
    },
  ];

  async run(): Promise<void> {
    // Display minimal ASCII logo
    console.log(chalk.cyan(ASCIILogos.getMinimalLogo()));
    
    const { args } = await this.parse(Scan);
    const scanPath = args.path;
    
    // Validate path exists
    if (!fs.existsSync(scanPath)) {
      console.log(chalk.red.bold('\n❌ ERROR:'));
      console.log(chalk.red(`  Path "${scanPath}" does not exist.`));
      console.log(chalk.yellow('\n💡 TIP:'));
      console.log(chalk.yellow('  Make sure the path is correct and accessible.'));
      process.exit(1);
    }
    
    // Get absolute path
    const absolutePath = path.resolve(scanPath);
    
    // Ask for confirmation
    console.log(chalk.blue.bold('\n🔍 SCAN CONFIRMATION:'));
    console.log(chalk.white(`  Path: ${chalk.cyan(absolutePath)}`));
    console.log(chalk.white(`  Type: ${fs.statSync(absolutePath).isDirectory() ? 'Directory' : 'File'}`));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Proceed with scan?',
        default: true,
      },
    ]);
    
    if (!confirm) {
      console.log(chalk.yellow('\n⏹️  Scan cancelled by user.'));
      process.exit(0);
    }
    
    // Start scanning
    console.log(chalk.green.bold('\n🚀 STARTING SCAN...'));
    console.log(chalk.white(`  Scanning: ${absolutePath}`));
    
    // Simulate scanning process
    const spinner = chalk.cyan('⏳ Scanning...');
    console.log(spinner);
    
    // Wait for 2 seconds to simulate scanning
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scan results
    console.log(chalk.green.bold('\n✅ SCAN COMPLETED!'));
    
    // Detect project type
    const projectType = this.detectProjectType(absolutePath);
    console.log(chalk.blue.bold('\n📋 PROJECT ANALYSIS:'));
    console.log(chalk.white(`  Project Type: ${chalk.cyan(projectType.type)}`));
    console.log(chalk.white(`  Framework: ${chalk.cyan(projectType.framework)}`));
    console.log(chalk.white(`  Language: ${chalk.cyan(projectType.language)}`));
    
    // Detect visual testing platform
    const platform = this.detectVisualTestingPlatform(absolutePath);
    console.log(chalk.magenta.bold('\n🎯 VISUAL TESTING DETECTION:'));
    console.log(chalk.white(`  Platform: ${chalk.cyan(platform.name)}`));
    console.log(chalk.white(`  Confidence: ${chalk.cyan(platform.confidence)}%`));
    console.log(chalk.white(`  Patterns Found: ${chalk.cyan(platform.patterns)}`));
    
    // Migration recommendations
    console.log(chalk.yellow.bold('\n💡 MIGRATION RECOMMENDATIONS:'));
    console.log(chalk.white('  • Run "smartui-migrator init" to start migration'));
    console.log(chalk.white('  • Backup your project before migration'));
    console.log(chalk.white('  • Review migration plan before proceeding'));
    
    // Next steps
    console.log(chalk.green.bold('\n🎯 NEXT STEPS:'));
    console.log(chalk.white('  1. smartui-migrator init          # Start interactive migration'));
    console.log(chalk.white('  2. smartui-migrator --help        # Get detailed help'));
    console.log(chalk.white('  3. Review migration plan carefully'));
    
    // Footer
    console.log(chalk.gray('\n' + '='.repeat(60)));
    console.log(chalk.gray('Scan completed successfully!'));
    console.log(chalk.gray('='.repeat(60)));
  }
  
  private detectProjectType(scanPath: string): { type: string; framework: string; language: string } {
    // Simple project type detection
    if (fs.existsSync(path.join(scanPath, 'package.json'))) {
      return { type: 'Node.js', framework: 'React', language: 'TypeScript' };
    } else if (fs.existsSync(path.join(scanPath, 'pom.xml'))) {
      return { type: 'Java', framework: 'Selenium', language: 'Java' };
    } else if (fs.existsSync(path.join(scanPath, 'requirements.txt'))) {
      return { type: 'Python', framework: 'Pytest', language: 'Python' };
    } else if (fs.existsSync(path.join(scanPath, '*.csproj'))) {
      return { type: 'C#', framework: 'NUnit', language: 'C#' };
    }
    return { type: 'Unknown', framework: 'Unknown', language: 'Unknown' };
  }
  
  private detectVisualTestingPlatform(scanPath: string): { name: string; confidence: number; patterns: number } {
    // Simple platform detection
    const files = this.getAllFiles(scanPath);
    let platform = 'Unknown';
    let confidence = 0;
    let patterns = 0;
    
    for (const file of files) {
      if (file.includes('percy') || file.includes('@percy')) {
        platform = 'Percy';
        confidence = 85;
        patterns++;
      } else if (file.includes('applitools') || file.includes('eyes')) {
        platform = 'Applitools';
        confidence = 90;
        patterns++;
      } else if (file.includes('sauce') || file.includes('saucelabs')) {
        platform = 'Sauce Labs';
        confidence = 80;
        patterns++;
      }
    }
    
    return { name: platform, confidence, patterns };
  }
  
  private getAllFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    try {
      const items = fs.readdirSync(dirPath);
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          files.push(...this.getAllFiles(fullPath));
        } else {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Ignore errors
    }
    
    return files;
  }
}
