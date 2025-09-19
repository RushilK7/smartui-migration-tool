# SmartUI Migration Tool - Critical Gaps Fix Plan

## 🎯 Objective
Transform the SmartUI Migration Tool from a semi-automated tool requiring extensive user intervention to a fully automated migration solution with zero user interaction required.

## 🔧 Critical Gaps to Fix

### 1. **Package.json Dependency Migration**

#### Current Gap
```json
// BEFORE (Percy)
{
  "devDependencies": {
    "@percy/cli": "^1.30.11",
    "@percy/selenium-webdriver": "^2.2.3"
  }
}

// AFTER (Manual - Should be automatic)
{
  "devDependencies": {
    "@lambdatest/smartui-cli": "^1.0.0",
    "@lambdatest/smartui-selenium": "^1.0.0"
  }
}
```

#### Implementation Plan
1. **Enhance ConfigTransformer** to handle package.json
2. **Add dependency mapping** for all Percy/Applitools packages
3. **Update scripts section** automatically
4. **Handle version compatibility** intelligently

#### Code Changes Needed
```typescript
// In ConfigTransformer.ts
private async transformPackageJson(detectionResult: DetectionResult): Promise<void> {
  const packageJsonPath = path.join(this.projectPath, 'package.json');
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
  
  // Map Percy dependencies to SmartUI
  const dependencyMappings = {
    '@percy/cli': '@lambdatest/smartui-cli',
    '@percy/selenium-webdriver': '@lambdatest/smartui-selenium',
    '@percy/cypress': '@lambdatest/smartui-cypress',
    '@percy/playwright': '@lambdatest/smartui-playwright',
    '@percy/storybook': '@lambdatest/smartui-storybook',
    // Add more mappings...
  };
  
  // Transform dependencies
  this.transformDependencies(packageJson, dependencyMappings);
  
  // Transform scripts
  this.transformScripts(packageJson, detectionResult);
  
  // Write back
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
```

### 2. **Import Statement Migration**

#### Current Gap
```javascript
// BEFORE (Percy)
const percySnapshot = require('@percy/selenium-webdriver');

// AFTER (Manual - Should be automatic)
const smartuiSnapshot = require('@lambdatest/smartui-selenium');
```

#### Implementation Plan
1. **Enhance CodeTransformer** for JavaScript/TypeScript
2. **Add AST-based transformation** for import statements
3. **Handle different import styles** (require, import, dynamic)
4. **Update function calls** automatically

#### Code Changes Needed
```typescript
// In CodeTransformer.ts
private transformImportStatements(filePath: string, content: string): string {
  // Transform require statements
  content = content.replace(
    /const\s+(\w+)\s*=\s*require\(['"`]@percy\/([^'"`]+)['"`]\)/g,
    (match, varName, packageName) => {
      const smartuiPackage = this.getSmartUIPackage(packageName);
      return `const ${varName} = require('${smartuiPackage}')`;
    }
  );
  
  // Transform ES6 imports
  content = content.replace(
    /import\s+(\w+)\s+from\s+['"`]@percy\/([^'"`]+)['"`]/g,
    (match, varName, packageName) => {
      const smartuiPackage = this.getSmartUIPackage(packageName);
      return `import ${varName} from '${smartuiPackage}'`;
    }
  );
  
  return content;
}
```

### 3. **Function Call Migration**

#### Current Gap
```javascript
// BEFORE (Percy)
await percySnapshot(driver, 'Empty Todos');

// AFTER (Manual - Should be automatic)
await smartuiSnapshot(driver, 'Empty Todos');
```

#### Implementation Plan
1. **Add function call transformation** to CodeTransformer
2. **Handle different function patterns** (percySnapshot, percy.screenshot, etc.)
3. **Preserve function arguments** and context
4. **Update method calls** on objects

#### Code Changes Needed
```typescript
// In CodeTransformer.ts
private transformFunctionCalls(content: string): string {
  // Transform percySnapshot calls
  content = content.replace(
    /percySnapshot\s*\(/g,
    'smartuiSnapshot('
  );
  
  // Transform percy.screenshot calls
  content = content.replace(
    /percy\.screenshot\s*\(/g,
    'smartui.screenshot('
  );
  
  // Transform eyes.check calls (Applitools)
  content = content.replace(
    /eyes\.check\s*\(/g,
    'smartui.check('
  );
  
  return content;
}
```

### 4. **Script Command Migration**

#### Current Gap
```json
// BEFORE (Percy)
{
  "scripts": {
    "test": "percy exec -- node tests/test.js"
  }
}

// AFTER (Manual - Should be automatic)
{
  "scripts": {
    "test": "smartui exec -- node tests/test.js"
  }
}
```

#### Implementation Plan
1. **Add script transformation** to ConfigTransformer
2. **Handle different command patterns** (percy exec, npx percy, etc.)
3. **Update CI/CD scripts** automatically
4. **Preserve script arguments** and options

#### Code Changes Needed
```typescript
// In ConfigTransformer.ts
private transformScripts(packageJson: any, detectionResult: DetectionResult): void {
  if (!packageJson.scripts) return;
  
  Object.keys(packageJson.scripts).forEach(scriptName => {
    const script = packageJson.scripts[scriptName];
    
    // Transform percy exec commands
    packageJson.scripts[scriptName] = script.replace(
      /percy\s+exec\s+--/g,
      'smartui exec --'
    );
    
    // Transform npx percy commands
    packageJson.scripts[scriptName] = script.replace(
      /npx\s+percy/g,
      'npx smartui'
    );
  });
}
```

### 5. **Fully Automated Mode Implementation**

#### Current Gap
- Tool requires multiple user confirmations
- No single-command automation
- Complex flag selection process

#### Implementation Plan
1. **Add `--auto` flag** for fully automated mode
2. **Implement smart defaults** for all decisions
3. **Remove confirmation prompts** in auto mode
4. **Add intelligent file selection** (migrate all by default)

#### Code Changes Needed
```typescript
// In migrate.ts
static override flags = {
  // ... existing flags
  'auto': Flags.boolean({
    char: 'a',
    description: 'Fully automated mode - no user interaction required',
    default: false,
  }),
};

// In run method
const isAutoMode = finalFlags['auto'] as boolean;
if (isAutoMode) {
  // Skip all user interactions
  // Use smart defaults
  // Migrate all files automatically
  // No confirmations required
}
```

## 🚀 Implementation Priority

### Phase 1: Critical Code Transformation (Week 1)
1. ✅ **Package.json dependency migration**
2. ✅ **Import statement transformation**
3. ✅ **Function call migration**
4. ✅ **Script command updates**

### Phase 2: Automation Enhancement (Week 2)
1. ✅ **Add `--auto` flag**
2. ✅ **Implement smart defaults**
3. ✅ **Remove confirmation prompts**
4. ✅ **Add intelligent file selection**

### Phase 3: User Experience (Week 3)
1. ✅ **Simplify command interface**
2. ✅ **Add contextual help**
3. ✅ **Improve error handling**
4. ✅ **Add progress indicators**

## 🎯 Success Criteria

### Zero-Interaction Migration
```bash
# This should work with zero user input
smartui-migrate --auto

# Expected output:
# ✅ Detected Percy + Selenium + JavaScript
# ✅ Migrated package.json dependencies
# ✅ Updated import statements
# ✅ Transformed function calls
# ✅ Updated script commands
# ✅ Created backups
# ✅ Migration complete!
```

### Automated Flow
1. **Detect** platform/framework automatically
2. **Migrate** all code and dependencies automatically
3. **Update** package.json and scripts automatically
4. **Create** backups automatically
5. **Generate** report automatically
6. **Validate** migration success automatically

### User Experience
- **Single command** migration
- **No confirmations** required
- **No file selection** needed
- **No flag configuration** required
- **Complete automation** from start to finish

## 📊 Testing Strategy

### Test Cases
1. **Percy Selenium JavaScript** → SmartUI (our current test case)
2. **Percy Cypress TypeScript** → SmartUI
3. **Applitools Playwright** → SmartUI
4. **Sauce Labs Selenium** → SmartUI
5. **Multi-platform projects** → SmartUI

### Validation Points
1. **Package.json** correctly updated
2. **Import statements** properly transformed
3. **Function calls** successfully migrated
4. **Script commands** updated correctly
5. **Tests run** with SmartUI
6. **No manual intervention** required

## 🎯 Expected Outcome

After implementing these fixes, the SmartUI Migration Tool will achieve:

- ✅ **100% Automation**: Zero user interaction required
- ✅ **Complete Migration**: All code, dependencies, and scripts migrated
- ✅ **Zero Manual Steps**: No manual file editing required
- ✅ **Seamless Experience**: Single command migration
- ✅ **Production Ready**: Reliable for customer deployment

The tool will transform from a semi-automated helper to a fully automated migration solution that achieves its core goal of seamless Percy/Applitools to SmartUI migration.
