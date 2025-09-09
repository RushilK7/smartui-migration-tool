import * as path from 'path';
import * as fs from 'fs/promises';
import { logger } from '../utils/Logger';

/**
 * Environment Manager for CI/CD setup and environment configuration
 */

export interface CIEnvironment {
  type: 'github-actions' | 'jenkins' | 'gitlab-ci' | 'azure-devops' | 'circleci' | 'travis-ci';
  config: any;
  environmentVariables: EnvironmentVariable[];
  scripts: string[];
}

export interface EnvironmentVariable {
  name: string;
  value: string;
  description: string;
  required: boolean;
  secret: boolean;
}

export interface EnvironmentScripts {
  setup: string;
  test: string;
  cleanup: string;
  validate: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class EnvironmentManager {
  private projectPath: string;
  private verbose: boolean;

  constructor(projectPath: string, verbose: boolean = false) {
    this.projectPath = projectPath;
    this.verbose = verbose;
  }

  /**
   * Setup CI/CD environment for SmartUI
   */
  public async setupCIEnvironment(ciType: string): Promise<CIEnvironment> {
    if (this.verbose) logger.debug(`Setting up ${ciType} environment...`);

    const environment = await this.generateCIEnvironment(ciType);
    await this.writeCIConfig(ciType, environment);
    
    return environment;
  }

  /**
   * Generate environment setup scripts
   */
  public async generateEnvironmentScripts(): Promise<EnvironmentScripts> {
    if (this.verbose) logger.debug('Generating environment setup scripts...');

    const scripts: EnvironmentScripts = {
      setup: this.generateSetupScript(),
      test: this.generateTestScript(),
      cleanup: this.generateCleanupScript(),
      validate: this.generateValidationScript()
    };

    // Write scripts to project
    await this.writeScripts(scripts);
    
    return scripts;
  }

  /**
   * Validate environment configuration
   */
  public async validateEnvironment(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check for required environment variables
    const requiredVars = ['LT_USERNAME', 'LT_ACCESS_KEY'];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        errors.push(`Required environment variable ${varName} is not set`);
      }
    }

    // Check for optional but recommended variables
    const optionalVars = ['LT_PROJECT_TOKEN', 'SMARTUI_BROWSER', 'SMARTUI_VIEWPORT'];
    for (const varName of optionalVars) {
      if (!process.env[varName]) {
        warnings.push(`Optional environment variable ${varName} is not set`);
        suggestions.push(`Consider setting ${varName} for better SmartUI configuration`);
      }
    }

    // Check for .smartui.json
    try {
      await fs.access(path.join(this.projectPath, '.smartui.json'));
    } catch {
      errors.push('.smartui.json configuration file not found');
      suggestions.push('Run the migration tool to generate SmartUI configuration');
    }

    // Check for .env file
    try {
      await fs.access(path.join(this.projectPath, '.env'));
    } catch {
      warnings.push('.env file not found');
      suggestions.push('Create .env file with your SmartUI credentials');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Generate environment variables template
   */
  public generateEnvironmentVariables(): EnvironmentVariable[] {
    return [
      {
        name: 'LT_USERNAME',
        value: '${LT_USERNAME}',
        description: 'LambdaTest username for SmartUI authentication',
        required: true,
        secret: false
      },
      {
        name: 'LT_ACCESS_KEY',
        value: '${LT_ACCESS_KEY}',
        description: 'LambdaTest access key for SmartUI authentication',
        required: true,
        secret: true
      },
      {
        name: 'LT_PROJECT_TOKEN',
        value: '${LT_PROJECT_TOKEN}',
        description: 'SmartUI project token for test organization',
        required: false,
        secret: true
      },
      {
        name: 'SMARTUI_BROWSER',
        value: 'chrome',
        description: 'Default browser for SmartUI tests',
        required: false,
        secret: false
      },
      {
        name: 'SMARTUI_VIEWPORT',
        value: '1920x1080',
        description: 'Default viewport size for SmartUI tests',
        required: false,
        secret: false
      },
      {
        name: 'SMARTUI_TIMEOUT',
        value: '30000',
        description: 'Screenshot timeout in milliseconds',
        required: false,
        secret: false
      },
      {
        name: 'SMARTUI_THRESHOLD',
        value: '0.1',
        description: 'Visual comparison threshold (0.0-1.0)',
        required: false,
        secret: false
      }
    ];
  }

  // Private methods

  private async generateCIEnvironment(ciType: string): Promise<CIEnvironment> {
    const environmentVariables = this.generateEnvironmentVariables();
    
    switch (ciType.toLowerCase()) {
      case 'github-actions':
        return this.generateGitHubActionsConfig(environmentVariables);
      case 'jenkins':
        return this.generateJenkinsConfig(environmentVariables);
      case 'gitlab-ci':
        return this.generateGitLabCIConfig(environmentVariables);
      case 'azure-devops':
        return this.generateAzureDevOpsConfig(environmentVariables);
      case 'circleci':
        return this.generateCircleCIConfig(environmentVariables);
      case 'travis-ci':
        return this.generateTravisCIConfig(environmentVariables);
      default:
        throw new Error(`Unsupported CI type: ${ciType}`);
    }
  }

  private generateGitHubActionsConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      name: 'SmartUI Visual Testing',
      on: {
        push: { branches: ['main', 'develop'] },
        pull_request: { branches: ['main'] }
      },
      jobs: {
        'smartui-tests': {
          'runs-on': 'ubuntu-latest',
          steps: [
            {
              name: 'Checkout code',
              uses: 'actions/checkout@v3'
            },
            {
              name: 'Setup Node.js',
              uses: 'actions/setup-node@v3',
              with: {
                'node-version': '18'
              }
            },
            {
              name: 'Install dependencies',
              run: 'npm install'
            },
            {
              name: 'Run SmartUI tests',
              run: 'npm run test:smartui',
              env: {
                LT_USERNAME: '${{ secrets.LT_USERNAME }}',
                LT_ACCESS_KEY: '${{ secrets.LT_ACCESS_KEY }}',
                LT_PROJECT_TOKEN: '${{ secrets.LT_PROJECT_TOKEN }}'
              }
            }
          ]
        }
      }
    };

    return {
      type: 'github-actions',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private generateJenkinsConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      pipeline: {
        agent: 'any',
        environment: {
          LT_USERNAME: '${LT_USERNAME}',
          LT_ACCESS_KEY: '${LT_ACCESS_KEY}',
          LT_PROJECT_TOKEN: '${LT_PROJECT_TOKEN}'
        },
        stages: [
          {
            stage: 'Checkout',
            steps: ['git checkout']
          },
          {
            stage: 'Install Dependencies',
            steps: ['npm install']
          },
          {
            stage: 'Run SmartUI Tests',
            steps: ['npm run test:smartui']
          }
        ]
      }
    };

    return {
      type: 'jenkins',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private generateGitLabCIConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      image: 'node:18',
      stages: ['test'],
      smartui_tests: {
        stage: 'test',
        script: [
          'npm install',
          'npm run test:smartui'
        ],
        variables: {
          LT_USERNAME: '$LT_USERNAME',
          LT_ACCESS_KEY: '$LT_ACCESS_KEY',
          LT_PROJECT_TOKEN: '$LT_PROJECT_TOKEN'
        }
      }
    };

    return {
      type: 'gitlab-ci',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private generateAzureDevOpsConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      trigger: ['main', 'develop'],
      pool: {
        vmImage: 'ubuntu-latest'
      },
      variables: {
        LT_USERNAME: '$(LT_USERNAME)',
        LT_ACCESS_KEY: '$(LT_ACCESS_KEY)',
        LT_PROJECT_TOKEN: '$(LT_PROJECT_TOKEN)'
      },
      steps: [
        {
          task: 'NodeTool@0',
          inputs: {
            versionSpec: '18.x'
          }
        },
        {
          script: 'npm install',
          displayName: 'Install dependencies'
        },
        {
          script: 'npm run test:smartui',
          displayName: 'Run SmartUI tests'
        }
      ]
    };

    return {
      type: 'azure-devops',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private generateCircleCIConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      version: 2.1,
      jobs: {
        smartui_tests: {
          docker: [
            {
              image: 'cimg/node:18.0'
            }
          ],
          steps: [
            'checkout',
            {
              run: 'npm install'
            },
            {
              run: 'npm run test:smartui',
              environment: {
                LT_USERNAME: '$LT_USERNAME',
                LT_ACCESS_KEY: '$LT_ACCESS_KEY',
                LT_PROJECT_TOKEN: '$LT_PROJECT_TOKEN'
              }
            }
          ]
        }
      },
      workflows: {
        version: 2,
        smartui_workflow: {
          jobs: ['smartui_tests']
        }
      }
    };

    return {
      type: 'circleci',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private generateTravisCIConfig(envVars: EnvironmentVariable[]): CIEnvironment {
    const config = {
      language: 'node_js',
      node_js: ['18'],
      script: ['npm run test:smartui'],
      env: {
        global: [
          'LT_USERNAME=$LT_USERNAME',
          'LT_ACCESS_KEY=$LT_ACCESS_KEY',
          'LT_PROJECT_TOKEN=$LT_PROJECT_TOKEN'
        ]
      }
    };

    return {
      type: 'travis-ci',
      config,
      environmentVariables: envVars,
      scripts: ['npm run test:smartui']
    };
  }

  private async writeCIConfig(ciType: string, environment: CIEnvironment): Promise<void> {
    const configPath = this.getCIConfigPath(ciType);
    const configContent = this.formatCIConfig(ciType, environment.config);
    
    // Create directory if it doesn't exist
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });
    
    await fs.writeFile(configPath, configContent, 'utf-8');
    
    if (this.verbose) logger.debug(`${ciType} configuration written to ${configPath}`);
  }

  private getCIConfigPath(ciType: string): string {
    const configPaths: { [key: string]: string } = {
      'github-actions': '.github/workflows/smartui.yml',
      'jenkins': 'Jenkinsfile',
      'gitlab-ci': '.gitlab-ci.yml',
      'azure-devops': 'azure-pipelines.yml',
      'circleci': '.circleci/config.yml',
      'travis-ci': '.travis.yml'
    };

    return path.join(this.projectPath, configPaths[ciType] || 'ci-config.yml');
  }

  private formatCIConfig(ciType: string, config: any): string {
    switch (ciType.toLowerCase()) {
      case 'github-actions':
      case 'jenkins':
      case 'gitlab-ci':
      case 'azure-devops':
      case 'circleci':
      case 'travis-ci':
        return `# SmartUI ${ciType} Configuration
# Generated by SmartUI Migration Tool

${JSON.stringify(config, null, 2)}`;
      default:
        return JSON.stringify(config, null, 2);
    }
  }

  private generateSetupScript(): string {
    return `#!/bin/bash

# SmartUI Environment Setup Script
echo "🔧 Setting up SmartUI environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# SmartUI Configuration
LT_USERNAME=your_username_here
LT_ACCESS_KEY=your_access_key_here
LT_PROJECT_TOKEN=your_project_token_here
SMARTUI_BROWSER=chrome
SMARTUI_VIEWPORT=1920x1080
SMARTUI_TIMEOUT=30000
SMARTUI_THRESHOLD=0.1
EOF
    echo "⚠️  Please edit .env file with your credentials"
else
    echo "✅ .env file already exists"
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Environment variables loaded"
fi

# Validate required variables
if [ -z "$LT_USERNAME" ] || [ -z "$LT_ACCESS_KEY" ]; then
    echo "❌ Required environment variables not set"
    echo "   Please set LT_USERNAME and LT_ACCESS_KEY in .env file"
    exit 1
fi

echo "✅ SmartUI environment setup complete"
`;
  }

  private generateTestScript(): string {
    return `#!/bin/bash

# SmartUI Test Runner Script
echo "🧪 Running SmartUI tests..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if SmartUI config exists
if [ ! -f .smartui.json ]; then
    echo "❌ .smartui.json not found. Please run migration tool first."
    exit 1
fi

# Run tests based on project type
if [ -f package.json ]; then
    echo "📦 Running Node.js tests..."
    npm run test:smartui
elif [ -f pom.xml ]; then
    echo "☕ Running Maven tests..."
    mvn test -Dtest=*SmartUITest
elif [ -f build.gradle ]; then
    echo "🐘 Running Gradle tests..."
    ./gradlew test --tests "*SmartUITest"
elif [ -f requirements.txt ]; then
    echo "🐍 Running Python tests..."
    python -m pytest tests/test_smartui.py
else
    echo "⚠️  Unknown project type. Please run tests manually."
fi

echo "✅ SmartUI tests completed"
`;
  }

  private generateCleanupScript(): string {
    return `#!/bin/bash

# SmartUI Cleanup Script
echo "🧹 Cleaning up SmartUI artifacts..."

# Remove temporary files
rm -f smartui-*.log
rm -f smartui-*.tmp
rm -rf .smartui-temp

# Clean up test artifacts
rm -rf test-results/
rm -rf screenshots/
rm -rf reports/

echo "✅ Cleanup completed"
`;
  }

  private generateValidationScript(): string {
    return `#!/bin/bash

# SmartUI Validation Script
echo "🔍 Validating SmartUI configuration..."

# Check for required files
required_files=(".smartui.json" ".env")
for file in "\${required_files[@]}"; do
    if [ ! -f "\$file" ]; then
        echo "❌ Required file missing: \$file"
        exit 1
    else
        echo "✅ Found: \$file"
    fi
done

# Load environment variables
if [ -f .env ]; then
    export \$(cat .env | grep -v '^#' | xargs)
fi

# Validate required environment variables
required_vars=("LT_USERNAME" "LT_ACCESS_KEY")
for var in "\${required_vars[@]}"; do
    if [ -z "\${!var}" ]; then
        echo "❌ Required environment variable not set: \$var"
        exit 1
    else
        echo "✅ Environment variable set: \$var"
    fi
done

# Validate SmartUI config
if command -v jq &> /dev/null; then
    if jq empty .smartui.json 2>/dev/null; then
        echo "✅ .smartui.json is valid JSON"
    else
        echo "❌ .smartui.json is not valid JSON"
        exit 1
    fi
else
    echo "⚠️  jq not found, skipping JSON validation"
fi

echo "✅ SmartUI configuration validation passed"
`;
  }

  private async writeScripts(scripts: EnvironmentScripts): Promise<void> {
    const scriptFiles = [
      { name: 'setup-smartui.sh', content: scripts.setup },
      { name: 'test-smartui.sh', content: scripts.test },
      { name: 'cleanup-smartui.sh', content: scripts.cleanup },
      { name: 'validate-smartui.sh', content: scripts.validate }
    ];

    for (const script of scriptFiles) {
      const scriptPath = path.join(this.projectPath, script.name);
      await fs.writeFile(scriptPath, script.content, 'utf-8');
      await fs.chmod(scriptPath, 0o755);
    }

    if (this.verbose) logger.debug('Environment scripts written to project');
  }
}
