# Architectural Decision: Code Transformation Strategy

## Principle

For the SmartUI Migration Tool, all transformations of source code (JavaScript, TypeScript, Java, Python, etc.) **must** be performed using Abstract Syntax Tree (AST) manipulation. The use of Regular Expressions for code modification is strictly prohibited.

## The Case Against Regular Expressions (Regex)

Regular Expressions are a powerful tool for pattern matching in plain text, but they are fundamentally **context-unaware** of code structure. When applied to source code transformation, regex-based approaches introduce unacceptable risks that can lead to catastrophic failures in enterprise environments.

### Code Formatting Vulnerabilities

Consider a simple transformation from `percySnapshot` to `smartuiSnapshot`. A naive regex approach might use:

```javascript
// ❌ DANGEROUS: Regex-based replacement
code.replace(/percySnapshot/g, 'smartuiSnapshot');
```

This approach fails catastrophically with common formatting variations:

```javascript
// Original code
percySnapshot('Homepage');

// Developer formats code differently
percySnapshot( 
  'Homepage' 
);

// Or with different spacing
percySnapshot( name , options );

// ❌ Regex fails: The replacement breaks the function call structure
// Result: smartuiSnapshot( name , options ) - syntax error!
```

### Comments and String Literals

Regex cannot distinguish between actual code and text content:

```javascript
// ❌ DANGEROUS: Regex modifies commented code
// percySnapshot('This is commented out');  // Gets modified to smartuiSnapshot!

// ❌ DANGEROUS: Regex modifies string literals
const message = "Call percySnapshot() to take a snapshot";  // Gets modified!

// ❌ DANGEROUS: Regex modifies documentation
/**
 * Use percySnapshot() to capture visual elements
 * @param {string} name - The snapshot name
 */
```

### Renamed Imports and Aliases

Enterprise codebases frequently use import aliases and destructuring:

```javascript
// ❌ DANGEROUS: Regex misses renamed imports
import { percySnapshot as ps } from '@percy/cypress';
import { percySnapshot as percy } from '@percy/cypress';
import { percySnapshot } from '@percy/cypress';

// Actual function calls that regex would miss:
ps('My Snapshot');           // ❌ Not replaced
percy('Another Snapshot');   // ❌ Not replaced
percySnapshot('Third');      // ✅ Only this gets replaced

// Result: Broken code with mixed function calls
```

### Complex Logic and Nested Structures

Regex cannot safely parse and modify complex argument objects:

```javascript
// ❌ DANGEROUS: Regex cannot handle complex arguments
percySnapshot('Homepage', {
  widths: [1280, 768, 375],
  minHeight: 600,
  percyCSS: `
    .ads { display: none; }
    .popup { visibility: hidden; }
  `,
  enableJavaScript: true
});

// Regex replacement would break the object structure
// Result: Malformed JavaScript with syntax errors
```

### Real-World Enterprise Scenarios

Enterprise codebases contain patterns that make regex transformation impossible:

```javascript
// ❌ DANGEROUS: Dynamic property access
const method = 'percySnapshot';
element[method]('Dynamic call');  // Regex cannot handle this

// ❌ DANGEROUS: Template literals
const snapshotName = `page-${pageId}`;
percySnapshot(snapshotName);  // Regex cannot understand context

// ❌ DANGEROUS: Conditional logic
if (shouldTakeSnapshot) {
  percySnapshot('Conditional snapshot');
}
```

## The Mandate for Abstract Syntax Trees (AST)

An Abstract Syntax Tree (AST) is a tree representation of code's syntactic structure, built by language-specific parsers (such as Babel for JavaScript/TypeScript, JavaParser for Java, or ast for Python). This structural understanding is what makes ASTs the professional standard for code transformation.

### Structural Understanding & Accuracy

ASTs understand the grammar of code, enabling precise targeting of specific language constructs:

```javascript
// ✅ SAFE: AST can precisely identify CallExpression nodes
// AST visitor function
function visitCallExpression(node) {
  if (node.callee.name === 'percySnapshot') {
    // This is guaranteed to be a real function call
    // Not a comment, string, or variable name
    node.callee.name = 'smartuiSnapshot';
  }
}
```

The AST approach guarantees that transformations only affect actual function calls, never comments, strings, or other text content.

### Robustness & Reliability

AST transformations are immune to formatting changes, whitespace variations, and comments:

```javascript
// All of these are handled identically by AST:

percySnapshot('Homepage');

percySnapshot( 
  'Homepage' 
);

percySnapshot(
  'Homepage',
  { width: 1280 }
);

// AST understands the structure regardless of formatting
// Result: All are correctly transformed to smartuiSnapshot
```

### Power & Extensibility

ASTs enable transformations that are impossible with regex. Consider the future feature of emulating Applitools' `Layout` match level:

```javascript
// Current Applitools code
eyes.checkWindow('Homepage', 'Layout');

// Future SmartUI transformation with AST:
// 1. Parse the AST
// 2. Identify the eyes.checkWindow call
// 3. Programmatically create new functional assertions
// 4. Inject them before the snapshot call

// AST transformation result:
expect(element).toBeVisible();
expect(element).toHaveText('Expected text');
smartuiSnapshot('Homepage');
```

This level of programmatic code generation and injection is impossible with regex but straightforward with AST manipulation.

### Advanced Transformation Capabilities

ASTs enable sophisticated transformations that maintain code integrity:

```javascript
// ✅ SAFE: AST can handle complex transformations
// Original: Multiple platform calls in one file
percySnapshot('Homepage');
eyes.checkWindow('Homepage');

// AST transformation:
// 1. Identify all visual testing calls
// 2. Group them by page/component
// 3. Transform to SmartUI equivalents
// 4. Maintain proper import statements
// 5. Preserve code structure and formatting

// Result: Clean, maintainable SmartUI code
smartuiSnapshot('Homepage');
```

### Maintainability

AST visitor functions are clear, readable, and maintainable:

```javascript
// ✅ CLEAR: AST visitor pattern
const transformer = {
  CallExpression(node) {
    if (node.callee.name === 'percySnapshot') {
      return this.transformPercyCall(node);
    }
    if (node.callee.name === 'eyes.checkWindow') {
      return this.transformApplitoolsCall(node);
    }
  },
  
  ImportDeclaration(node) {
    if (node.source.value === '@percy/cypress') {
      return this.transformPercyImport(node);
    }
  }
};

// vs.

// ❌ UNREADABLE: Complex regex patterns
const regexPattern = /(?<!\/\/.*?)(?<!\/\*.*?)(?<!['"`].*?)percySnapshot(?![a-zA-Z0-9_])/g;
```

## Enterprise-Grade Reliability

For enterprise QA and developers working in strict environments, the choice between AST and regex is not just technical—it's about **trust and reliability**.

### Risk Mitigation

- **AST**: Zero risk of breaking code structure or introducing syntax errors
- **Regex**: High risk of catastrophic failures in production codebases

### Scalability

- **AST**: Handles any complexity of real-world enterprise code
- **Regex**: Limited to simple, predictable patterns

### Future-Proofing

- **AST**: Enables advanced features like code generation and complex transformations
- **Regex**: Cannot evolve beyond basic text replacement

## Conclusion

The choice is between a **professional, reliable, and powerful approach (AST)** and a **fragile, error-prone, and limited one (Regex)**. 

To ensure the SmartUI Migration Tool is safe, accurate, and capable of handling the complexities of real-world enterprise codebases, the use of Abstract Syntax Trees is **mandatory**.

This architectural decision ensures that:
- ✅ Code transformations are **100% accurate** and **structurally sound**
- ✅ Enterprise developers can **trust** the tool with their production codebases
- ✅ The tool can **evolve** to handle increasingly complex transformation scenarios
- ✅ **Zero risk** of introducing syntax errors or breaking existing functionality

**Any code transformation implementation that uses Regular Expressions will be rejected and must be rewritten using AST manipulation.**

---

*This document serves as the foundational architectural principle for all code transformation work in the SmartUI Migration Tool. All developers, contributors, and maintainers must adhere to this mandate.*
