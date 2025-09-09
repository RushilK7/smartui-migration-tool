import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../utils/Logger';

/**
 * Rollback Manager for automatic rollback on failure
 */

export interface Checkpoint {
  id: string;
  timestamp: Date;
  description: string;
  projectPath: string;
  files: FileBackup[];
  packageJson?: string | undefined;
  pomXml?: string | undefined;
  metadata: CheckpointMetadata;
}

export interface FileBackup {
  path: string;
  content: string;
  timestamp: Date;
  checksum: string;
}

export interface CheckpointMetadata {
  migrationVersion: string;
  platform: string;
  framework: string;
  language: string;
  filesCount: number;
  totalSize: number;
}

export interface RollbackResult {
  success: boolean;
  message: string;
  restoredFiles: string[];
  errors: string[];
  duration: number;
}

export interface CleanupResult {
  success: boolean;
  message: string;
  cleanedFiles: string[];
  errors: string[];
}

export class RollbackManager {
  private checkpoints: Map<string, Checkpoint> = new Map();
  private checkpointsDir: string;
  private verbose: boolean;

  constructor(projectPath: string, verbose: boolean = false) {
    this.checkpointsDir = path.join(projectPath, '.smartui-checkpoints');
    this.verbose = verbose;
  }

  /**
   * Create a checkpoint before migration
   */
  public async createCheckpoint(
    projectPath: string,
    description: string,
    metadata: Partial<CheckpointMetadata> = {}
  ): Promise<Checkpoint> {
    if (this.verbose) logger.debug(`Creating checkpoint: ${description}`);

    const checkpoint: Checkpoint = {
      id: this.generateCheckpointId(),
      timestamp: new Date(),
      description,
      projectPath,
      files: await this.backupProjectFiles(projectPath),
      packageJson: await this.backupPackageJson(projectPath),
      pomXml: await this.backupPomXml(projectPath),
      metadata: {
        migrationVersion: '1.5.0',
        platform: metadata.platform || 'unknown',
        framework: metadata.framework || 'unknown',
        language: metadata.language || 'unknown',
        filesCount: 0,
        totalSize: 0,
        ...metadata
      }
    };

    // Update metadata with actual counts
    checkpoint.metadata.filesCount = checkpoint.files.length;
    checkpoint.metadata.totalSize = checkpoint.files.reduce((sum, file) => sum + file.content.length, 0);

    this.checkpoints.set(checkpoint.id, checkpoint);
    await this.saveCheckpoint(checkpoint);

    if (this.verbose) logger.debug(`Checkpoint created: ${checkpoint.id}`);
    return checkpoint;
  }

  /**
   * Rollback to a specific checkpoint
   */
  public async rollbackToCheckpoint(checkpointId: string): Promise<RollbackResult> {
    const startTime = Date.now();
    const restoredFiles: string[] = [];
    const errors: string[] = [];

    if (this.verbose) logger.debug(`Rolling back to checkpoint: ${checkpointId}`);

    try {
      const checkpoint = await this.loadCheckpoint(checkpointId);
      if (!checkpoint) {
        return {
          success: false,
          message: `Checkpoint ${checkpointId} not found`,
          restoredFiles: [],
          errors: [`Checkpoint ${checkpointId} not found`],
          duration: Date.now() - startTime
        };
      }

      // Restore project files
      for (const file of checkpoint.files) {
        try {
          const filePath = path.join(checkpoint.projectPath, file.path);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content, 'utf-8');
          restoredFiles.push(file.path);
        } catch (error) {
          errors.push(`Failed to restore ${file.path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Restore package.json
      if (checkpoint.packageJson) {
        try {
          const packageJsonPath = path.join(checkpoint.projectPath, 'package.json');
          await fs.writeFile(packageJsonPath, checkpoint.packageJson, 'utf-8');
          restoredFiles.push('package.json');
        } catch (error) {
          errors.push(`Failed to restore package.json: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Restore pom.xml
      if (checkpoint.pomXml) {
        try {
          const pomPath = path.join(checkpoint.projectPath, 'pom.xml');
          await fs.writeFile(pomPath, checkpoint.pomXml, 'utf-8');
          restoredFiles.push('pom.xml');
        } catch (error) {
          errors.push(`Failed to restore pom.xml: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Clean up SmartUI installations
      await this.cleanupSmartUIInstallations(checkpoint.projectPath);

      const success = errors.length === 0;
      const message = success 
        ? `Successfully rolled back to checkpoint ${checkpointId}`
        : `Rollback completed with ${errors.length} errors`;

      if (this.verbose) logger.debug(`Rollback completed: ${message}`);

      return {
        success,
        message,
        restoredFiles,
        errors,
        duration: Date.now() - startTime
      };

    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        restoredFiles,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime
      };
    }
  }

  /**
   * Clean up after rollback
   */
  public async cleanupAfterRollback(checkpointId: string): Promise<CleanupResult> {
    const cleanedFiles: string[] = [];
    const errors: string[] = [];

    if (this.verbose) logger.debug(`Cleaning up after rollback: ${checkpointId}`);

    try {
      // Remove SmartUI configuration files
      const smartuiFiles = ['.smartui.json', '.env', 'setup-smartui.sh', 'test-smartui.sh', 'cleanup-smartui.sh', 'validate-smartui.sh'];
      
      for (const file of smartuiFiles) {
        try {
          const filePath = path.join(this.checkpointsDir, '..', file);
          await fs.unlink(filePath);
          cleanedFiles.push(file);
        } catch {
          // File doesn't exist, skip
        }
      }

      // Remove CI/CD configuration files
      const ciFiles = ['.github/workflows/smartui.yml', 'Jenkinsfile', '.gitlab-ci.yml', 'azure-pipelines.yml', '.circleci/config.yml', '.travis.yml'];
      
      for (const file of ciFiles) {
        try {
          const filePath = path.join(this.checkpointsDir, '..', file);
          await fs.unlink(filePath);
          cleanedFiles.push(file);
        } catch {
          // File doesn't exist, skip
        }
      }

      // Remove checkpoint
      await this.removeCheckpoint(checkpointId);

      const success = errors.length === 0;
      const message = success 
        ? `Cleanup completed successfully`
        : `Cleanup completed with ${errors.length} errors`;

      if (this.verbose) logger.debug(`Cleanup completed: ${message}`);

      return {
        success,
        message,
        cleanedFiles,
        errors
      };

    } catch (error) {
      return {
        success: false,
        message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        cleanedFiles,
        errors: [...errors, error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * List available checkpoints
   */
  public async listCheckpoints(): Promise<Checkpoint[]> {
    const checkpoints: Checkpoint[] = [];

    try {
      await fs.mkdir(this.checkpointsDir, { recursive: true });
      const files = await fs.readdir(this.checkpointsDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          try {
            const checkpoint = await this.loadCheckpoint(file.replace('.json', ''));
            if (checkpoint) {
              checkpoints.push(checkpoint);
            }
          } catch {
            // Skip invalid checkpoint files
          }
        }
      }
    } catch {
      // No checkpoints directory exists
    }

    return checkpoints.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get checkpoint by ID
   */
  public async getCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
    return await this.loadCheckpoint(checkpointId);
  }

  /**
   * Delete a checkpoint
   */
  public async deleteCheckpoint(checkpointId: string): Promise<boolean> {
    try {
      await this.removeCheckpoint(checkpointId);
      this.checkpoints.delete(checkpointId);
      return true;
    } catch {
      return false;
    }
  }

  // Private methods

  private generateCheckpointId(): string {
    return `checkpoint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async backupProjectFiles(projectPath: string): Promise<FileBackup[]> {
    const files: FileBackup[] = [];
    const sourceFiles = await this.findSourceFiles(projectPath);
    
    for (const file of sourceFiles) {
      try {
        const filePath = path.join(projectPath, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const checksum = this.calculateChecksum(content);
        
        files.push({
          path: file,
          content,
          timestamp: new Date(),
          checksum
        });
      } catch (error) {
        if (this.verbose) logger.debug(`Skipped file ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return files;
  }

  private async backupPackageJson(projectPath: string): Promise<string | undefined> {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      return await fs.readFile(packageJsonPath, 'utf-8');
    } catch {
      return undefined;
    }
  }

  private async backupPomXml(projectPath: string): Promise<string | undefined> {
    try {
      const pomPath = path.join(projectPath, 'pom.xml');
      return await fs.readFile(pomPath, 'utf-8');
    } catch {
      return undefined;
    }
  }

  private async findSourceFiles(projectPath: string): Promise<string[]> {
    const patterns = ['**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx', '**/*.java', '**/*.py', '**/*.json', '**/*.xml', '**/*.yml', '**/*.yaml'];
    const files: string[] = [];

    for (const pattern of patterns) {
      try {
        const patternFiles = await this.findFilesByPattern(projectPath, pattern);
        files.push(...patternFiles);
      } catch {
        // Skip patterns that don't match
      }
    }

    return files;
  }

  private async findFilesByPattern(projectPath: string, pattern: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(projectPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.matchesPattern(entry.name, pattern)) {
          files.push(entry.name);
        } else if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          const subFiles = await this.findFilesInDirectory(path.join(projectPath, entry.name), pattern);
          files.push(...subFiles.map(f => path.join(entry.name, f)));
        }
      }
    } catch {
      // Skip directories that can't be read
    }

    return files;
  }

  private async findFilesInDirectory(dirPath: string, pattern: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isFile() && this.matchesPattern(entry.name, pattern)) {
          files.push(entry.name);
        } else if (entry.isDirectory() && !this.shouldSkipDirectory(entry.name)) {
          const subFiles = await this.findFilesInDirectory(path.join(dirPath, entry.name), pattern);
          files.push(...subFiles.map(f => path.join(entry.name, f)));
        }
      }
    } catch {
      // Skip directories that can't be read
    }

    return files;
  }

  private matchesPattern(filename: string, pattern: string): boolean {
    // Simplified pattern matching
    if (pattern.includes('**/*.js')) return filename.endsWith('.js');
    if (pattern.includes('**/*.ts')) return filename.endsWith('.ts');
    if (pattern.includes('**/*.jsx')) return filename.endsWith('.jsx');
    if (pattern.includes('**/*.tsx')) return filename.endsWith('.tsx');
    if (pattern.includes('**/*.java')) return filename.endsWith('.java');
    if (pattern.includes('**/*.py')) return filename.endsWith('.py');
    if (pattern.includes('**/*.json')) return filename.endsWith('.json');
    if (pattern.includes('**/*.xml')) return filename.endsWith('.xml');
    if (pattern.includes('**/*.yml')) return filename.endsWith('.yml');
    if (pattern.includes('**/*.yaml')) return filename.endsWith('.yaml');
    return false;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    const skipDirs = ['.git', 'node_modules', '.next', 'dist', 'build', 'coverage', '.nyc_output', '.smartui-backup', '.smartui-checkpoints'];
    return skipDirs.includes(dirName) || dirName.startsWith('.');
  }

  private calculateChecksum(content: string): string {
    // Simple checksum calculation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async saveCheckpoint(checkpoint: Checkpoint): Promise<void> {
    await fs.mkdir(this.checkpointsDir, { recursive: true });
    const checkpointPath = path.join(this.checkpointsDir, `${checkpoint.id}.json`);
    await fs.writeFile(checkpointPath, JSON.stringify(checkpoint, null, 2), 'utf-8');
  }

  private async loadCheckpoint(checkpointId: string): Promise<Checkpoint | null> {
    try {
      const checkpointPath = path.join(this.checkpointsDir, `${checkpointId}.json`);
      const content = await fs.readFile(checkpointPath, 'utf-8');
      const checkpoint = JSON.parse(content);
      
      // Convert timestamp back to Date object
      checkpoint.timestamp = new Date(checkpoint.timestamp);
      checkpoint.files.forEach((file: any) => {
        file.timestamp = new Date(file.timestamp);
      });
      
      return checkpoint;
    } catch {
      return null;
    }
  }

  private async removeCheckpoint(checkpointId: string): Promise<void> {
    try {
      const checkpointPath = path.join(this.checkpointsDir, `${checkpointId}.json`);
      await fs.unlink(checkpointPath);
    } catch {
      // Checkpoint file doesn't exist
    }
  }

  private async cleanupSmartUIInstallations(projectPath: string): Promise<void> {
    // Remove SmartUI packages from package.json
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      
      if (packageJson.dependencies) {
        Object.keys(packageJson.dependencies).forEach(dep => {
          if (dep.includes('smartui') || dep.includes('lambdatest')) {
            delete packageJson.dependencies[dep];
          }
        });
      }
      
      if (packageJson.devDependencies) {
        Object.keys(packageJson.devDependencies).forEach(dep => {
          if (dep.includes('smartui') || dep.includes('lambdatest')) {
            delete packageJson.devDependencies[dep];
          }
        });
      }
      
      await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
    } catch {
      // Not a Node.js project or package.json doesn't exist
    }

    // Remove SmartUI dependencies from pom.xml
    try {
      const pomPath = path.join(projectPath, 'pom.xml');
      let pomContent = await fs.readFile(pomPath, 'utf-8');
      
      // Remove SmartUI dependencies
      pomContent = pomContent.replace(/<dependency>[\s\S]*?<groupId>com\.lambdatest<\/groupId>[\s\S]*?<\/dependency>/g, '');
      pomContent = pomContent.replace(/<dependency>[\s\S]*?<groupId>io\.github\.lambdatest<\/groupId>[\s\S]*?<\/dependency>/g, '');
      
      await fs.writeFile(pomPath, pomContent, 'utf-8');
    } catch {
      // Not a Maven project or pom.xml doesn't exist
    }
  }
}
