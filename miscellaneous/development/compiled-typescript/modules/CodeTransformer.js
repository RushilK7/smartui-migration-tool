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
exports.CodeTransformer = void 0;
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const generator_1 = __importDefault(require("@babel/generator"));
const t = __importStar(require("@babel/types"));
/**
 * CodeTransformer module for transforming test code from visual testing platforms to SmartUI
 * Uses Abstract Syntax Trees (AST) for safe and accurate code transformation
 */
class CodeTransformer {
    constructor(projectPath) {
        this.projectPath = projectPath;
    }
    /**
     * Transforms Percy JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformPercy(sourceCode) {
        const warnings = [];
        let snapshotCount = 0;
        try {
            // Parse the source code into an AST
            const ast = (0, parser_1.parse)(sourceCode, {
                sourceType: 'module',
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                plugins: [
                    'objectRestSpread',
                    'functionBind',
                    'exportDefaultFrom',
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'asyncGenerators',
                    'functionSent',
                    'throwExpressions'
                ]
            });
            // Traverse and transform the AST
            const self = this;
            (0, traverse_1.default)(ast, {
                // Transform import declarations
                ImportDeclaration(path) {
                    self.transformPercyImport(path, warnings);
                },
                // Transform require() calls
                CallExpression(path) {
                    if (t.isIdentifier(path.node.callee, { name: 'require' })) {
                        self.transformPercyRequire(path, warnings);
                    }
                    else if (t.isIdentifier(path.node.callee, { name: 'percySnapshot' })) {
                        self.transformPercySnapshot(path, warnings);
                        snapshotCount++;
                    }
                },
                // Transform destructured require calls
                VariableDeclarator(path) {
                    if (path.node.init && t.isCallExpression(path.node.init) &&
                        t.isIdentifier(path.node.init.callee, { name: 'require' })) {
                        self.transformPercyRequire(path.node.init, warnings);
                    }
                }
            });
            // Generate the transformed code
            const result = (0, generator_1.default)(ast, {
                retainLines: false,
                compact: false,
                comments: true
            });
            return {
                content: result.code,
                warnings,
                snapshotCount
            };
        }
        catch (error) {
            // Handle parsing errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            warnings.push({
                message: `Failed to parse source code: ${errorMessage}`,
                details: 'The source file may contain unsupported syntax or be malformed.'
            });
            return {
                content: sourceCode, // Return original code on error
                warnings,
                snapshotCount: 0
            };
        }
    }
    /**
     * Transforms Percy import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    transformPercyImport(path, warnings) {
        const source = path.node.source.value;
        // Map Percy SDK imports to SmartUI equivalents
        const importMappings = {
            '@percy/cypress': '@lambdatest/smartui-cypress',
            '@percy/playwright': '@lambdatest/smartui-playwright',
            '@percy/storybook': '@lambdatest/smartui-storybook',
            '@percy/selenium-webdriver': '@lambdatest/smartui-selenium',
            '@percy/puppeteer': '@lambdatest/smartui-puppeteer'
        };
        if (importMappings[source]) {
            path.node.source.value = importMappings[source];
        }
    }
    /**
     * Transforms Percy require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    transformPercyRequire(path, warnings) {
        if (path.node && path.node.arguments && path.node.arguments.length > 0 && t.isStringLiteral(path.node.arguments[0])) {
            const source = path.node.arguments[0].value;
            // Map Percy SDK requires to SmartUI equivalents
            const requireMappings = {
                '@percy/cypress': '@lambdatest/smartui-cypress',
                '@percy/playwright': '@lambdatest/smartui-playwright',
                '@percy/storybook': '@lambdatest/smartui-storybook',
                '@percy/selenium-webdriver': '@lambdatest/smartui-selenium',
                '@percy/puppeteer': '@lambdatest/smartui-puppeteer'
            };
            if (requireMappings[source]) {
                path.node.arguments[0].value = requireMappings[source];
            }
        }
    }
    /**
     * Transforms percySnapshot calls to smartuiSnapshot calls
     * @param path - The AST path for the percySnapshot call
     * @param warnings - Array to add warnings to
     */
    transformPercySnapshot(path, warnings) {
        // Change the function name from percySnapshot to smartuiSnapshot
        path.node.callee.name = 'smartuiSnapshot';
        // Transform options if present (options is typically the last argument)
        if (path.node.arguments.length > 2) {
            const optionsArg = path.node.arguments[2];
            if (t.isObjectExpression(optionsArg)) {
                this.transformPercySnapshotOptions(optionsArg, warnings, path);
            }
        }
        else if (path.node.arguments.length === 2) {
            const optionsArg = path.node.arguments[1];
            if (t.isObjectExpression(optionsArg)) {
                this.transformPercySnapshotOptions(optionsArg, warnings, path);
            }
        }
    }
    /**
     * Transforms Percy snapshot options to SmartUI options
     * @param optionsNode - The AST node for the options object
     * @param warnings - Array to add warnings to
     * @param snapshotPath - The AST path for the snapshot call (for adding comments)
     */
    transformPercySnapshotOptions(optionsNode, warnings, snapshotPath) {
        const newProperties = [];
        let hasWidthsWarning = false;
        optionsNode.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                const key = prop.key.name;
                switch (key) {
                    case 'widths':
                        // widths is not supported in SmartUI - generate warning and skip this property
                        hasWidthsWarning = true;
                        warnings.push({
                            message: 'Per-snapshot `widths` option was found and is not supported. Viewports must be configured in `.smartui.json`.',
                            details: 'Configure viewports globally in your SmartUI configuration file instead of per-snapshot.'
                        });
                        // Don't add this property to newProperties (skip it)
                        break;
                    case 'ignore_region_selectors':
                        // Map to SmartUI ignoreDOM.cssSelector
                        if (t.isArrayExpression(prop.value)) {
                            newProperties.push(t.objectProperty(t.identifier('ignoreDOM'), t.objectExpression([
                                t.objectProperty(t.identifier('cssSelector'), prop.value)
                            ])));
                        }
                        break;
                    case 'scope':
                        // Map to SmartUI element.cssSelector
                        if (t.isStringLiteral(prop.value)) {
                            newProperties.push(t.objectProperty(t.identifier('element'), t.objectExpression([
                                t.objectProperty(t.identifier('cssSelector'), prop.value)
                            ])));
                        }
                        break;
                    default:
                        // Keep other properties as-is
                        newProperties.push(prop);
                        break;
                }
            }
            else {
                // Keep non-identifier properties as-is
                newProperties.push(prop);
            }
        });
        // Update the options object with transformed properties
        optionsNode.properties = newProperties;
        // Add warning comment if widths was found
        if (hasWidthsWarning) {
            this.addWarningComment(snapshotPath);
        }
    }
    /**
     * Adds a warning comment above the snapshot call
     * @param snapshotPath - The AST path for the snapshot call
     */
    addWarningComment(snapshotPath) {
        const warningComment = t.addComment(snapshotPath.node, 'leading', ' MIGRATION-WARNING: per-snapshot widths are not supported. Please configure viewports in your .smartui.json file.', false);
    }
    /**
     * Transforms Applitools JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @param framework - The testing framework (Cypress or Playwright)
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformApplitools(sourceCode, framework) {
        const warnings = [];
        let snapshotCount = 0;
        try {
            // Parse the source code into an AST
            const ast = (0, parser_1.parse)(sourceCode, {
                sourceType: 'module',
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                plugins: [
                    'objectRestSpread',
                    'functionBind',
                    'exportDefaultFrom',
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'asyncGenerators',
                    'functionSent',
                    'throwExpressions'
                ]
            });
            // Traverse and transform the AST
            const self = this;
            const snapshotCountRef = { count: 0 };
            (0, traverse_1.default)(ast, {
                // Transform import declarations
                ImportDeclaration(path) {
                    self.transformApplitoolsImport(path, warnings);
                },
                // Transform require() calls
                CallExpression(path) {
                    if (t.isIdentifier(path.node.callee, { name: 'require' })) {
                        self.transformApplitoolsRequire(path, warnings);
                    }
                },
                // Transform Applitools API calls
                ExpressionStatement(path) {
                    let callNode = null;
                    if (t.isCallExpression(path.node.expression)) {
                        callNode = path.node.expression;
                    }
                    else if (t.isAwaitExpression(path.node.expression) && t.isCallExpression(path.node.expression.argument)) {
                        callNode = path.node.expression.argument;
                    }
                    if (callNode) {
                        // Handle eyes.open() and eyes.close() calls - remove them
                        if (self.isEyesOpenCall(callNode) || self.isEyesCloseCall(callNode)) {
                            path.remove();
                            return;
                        }
                        // Handle eyes.check() calls - transform to smartuiSnapshot
                        if (self.isEyesCheckCall(callNode)) {
                            self.transformEyesCheckToSmartUISnapshot(callNode, warnings, framework);
                            snapshotCountRef.count++;
                        }
                    }
                },
                // Transform Applitools API calls in variable declarations
                VariableDeclarator(path) {
                    if (path.node.init && t.isCallExpression(path.node.init)) {
                        const callNode = path.node.init;
                        // Handle eyes.open() and eyes.close() calls - remove them
                        if (self.isEyesOpenCall(callNode) || self.isEyesCloseCall(callNode)) {
                            path.remove();
                            return;
                        }
                        // Handle eyes.check() calls - transform to smartuiSnapshot
                        if (self.isEyesCheckCall(callNode)) {
                            self.transformEyesCheckToSmartUISnapshot(callNode, warnings, framework);
                            snapshotCountRef.count++;
                        }
                    }
                }
            });
            snapshotCount = snapshotCountRef.count;
            // Generate the transformed code
            const result = (0, generator_1.default)(ast, {
                retainLines: false,
                compact: false,
                comments: true
            });
            return {
                content: result.code,
                warnings,
                snapshotCount
            };
        }
        catch (error) {
            // Handle parsing errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            warnings.push({
                message: `Failed to parse source code: ${errorMessage}`,
                details: 'The source file may contain unsupported syntax or be malformed.'
            });
            return {
                content: sourceCode, // Return original code on error
                warnings,
                snapshotCount: 0
            };
        }
    }
    /**
     * Transforms Applitools import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    transformApplitoolsImport(path, warnings) {
        const source = path.node.source.value;
        // Map Applitools SDK imports to SmartUI equivalents
        const importMappings = {
            '@applitools/eyes-cypress': '@lambdatest/smartui-cypress',
            '@applitools/eyes-playwright': '@lambdatest/smartui-playwright',
            '@applitools/eyes-selenium': '@lambdatest/smartui-selenium',
            '@applitools/eyes-puppeteer': '@lambdatest/smartui-puppeteer'
        };
        if (importMappings[source]) {
            path.node.source.value = importMappings[source];
        }
    }
    /**
     * Transforms Applitools require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    transformApplitoolsRequire(path, warnings) {
        if (path.node && path.node.arguments && path.node.arguments.length > 0 && t.isStringLiteral(path.node.arguments[0])) {
            const source = path.node.arguments[0].value;
            // Map Applitools SDK requires to SmartUI equivalents
            const requireMappings = {
                '@applitools/eyes-cypress': '@lambdatest/smartui-cypress',
                '@applitools/eyes-playwright': '@lambdatest/smartui-playwright',
                '@applitools/eyes-selenium': '@lambdatest/smartui-selenium',
                '@applitools/eyes-puppeteer': '@lambdatest/smartui-puppeteer'
            };
            if (requireMappings[source]) {
                path.node.arguments[0].value = requireMappings[source];
            }
        }
    }
    /**
     * Checks if a call is an eyes.open() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.open() call
     */
    isEyesOpenCall(callNode) {
        return ((t.isMemberExpression(callNode.callee) &&
            t.isIdentifier(callNode.callee.object, { name: 'eyes' }) &&
            t.isIdentifier(callNode.callee.property, { name: 'open' })) ||
            (t.isMemberExpression(callNode.callee) &&
                t.isIdentifier(callNode.callee.object, { name: 'cy' }) &&
                t.isIdentifier(callNode.callee.property, { name: 'eyesOpen' })));
    }
    /**
     * Checks if a call is an eyes.close() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.close() call
     */
    isEyesCloseCall(callNode) {
        return ((t.isMemberExpression(callNode.callee) &&
            t.isIdentifier(callNode.callee.object, { name: 'eyes' }) &&
            (t.isIdentifier(callNode.callee.property, { name: 'close' }) ||
                t.isIdentifier(callNode.callee.property, { name: 'closeAsync' }))) ||
            (t.isMemberExpression(callNode.callee) &&
                t.isIdentifier(callNode.callee.object, { name: 'cy' }) &&
                t.isIdentifier(callNode.callee.property, { name: 'eyesClose' })));
    }
    /**
     * Checks if a call is an eyes.check() call
     * @param callNode - The AST node for the call expression
     * @returns True if this is an eyes.check() call
     */
    isEyesCheckCall(callNode) {
        return ((t.isMemberExpression(callNode.callee) &&
            t.isIdentifier(callNode.callee.object, { name: 'eyes' }) &&
            t.isIdentifier(callNode.callee.property, { name: 'check' })) ||
            (t.isMemberExpression(callNode.callee) &&
                t.isIdentifier(callNode.callee.object, { name: 'cy' }) &&
                t.isIdentifier(callNode.callee.property, { name: 'eyesCheckWindow' })));
    }
    /**
     * Transforms eyes.check() calls to smartuiSnapshot calls
     * @param callNode - The AST node for the eyes.check() call
     * @param warnings - Array to add warnings to
     * @param framework - The testing framework
     */
    transformEyesCheckToSmartUISnapshot(callNode, warnings, framework) {
        // Extract snapshot name and options from the eyes.check() call
        const { snapshotName, options, isLayout } = this.parseEyesCheckArguments(callNode, warnings);
        // Create the smartuiSnapshot call
        const smartUISnapshotCall = this.createSmartUISnapshotCall(snapshotName, options, framework);
        // If this is a layout region, inject functional assertion
        if (isLayout) {
            this.injectLayoutEmulation(callNode, smartUISnapshotCall, framework, warnings);
        }
        // Replace the original call
        callNode.callee = t.identifier('smartuiSnapshot');
        callNode.arguments = smartUISnapshotCall.arguments;
    }
    /**
     * Parses arguments from eyes.check() calls
     * @param callNode - The AST node for the eyes.check() call
     * @param warnings - Array to add warnings to
     * @returns Object containing snapshot name, options, and layout flag
     */
    parseEyesCheckArguments(callNode, warnings) {
        let snapshotName = 'Untitled Snapshot';
        let options = {};
        let isLayout = false;
        if (callNode.arguments.length > 0) {
            // First argument is typically the snapshot name or target
            const firstArg = callNode.arguments[0];
            if (t.isStringLiteral(firstArg)) {
                snapshotName = firstArg.value;
            }
            else if (t.isCallExpression(firstArg)) {
                // Handle Target.window() or Target.region() calls
                const targetCall = firstArg;
                if (t.isMemberExpression(targetCall.callee) &&
                    t.isIdentifier(targetCall.callee.object, { name: 'Target' })) {
                    if (t.isIdentifier(targetCall.callee.property, { name: 'window' })) {
                        // Target.window() - no special options needed
                    }
                    else if (t.isIdentifier(targetCall.callee.property, { name: 'region' })) {
                        // Target.region() - extract selector
                        if (targetCall.arguments.length > 0 && t.isStringLiteral(targetCall.arguments[0])) {
                            options.element = { cssSelector: targetCall.arguments[0].value };
                        }
                    }
                    else if (t.isIdentifier(targetCall.callee.property, { name: 'layout' })) {
                        // Target.layout() - this is a layout region
                        isLayout = true;
                        if (targetCall.arguments.length > 0 && t.isStringLiteral(targetCall.arguments[0])) {
                            options.layoutSelector = targetCall.arguments[0].value;
                            callNode._layoutSelector = targetCall.arguments[0].value;
                        }
                    }
                }
            }
        }
        // Parse additional arguments for options
        if (callNode.arguments.length > 1) {
            const optionsArg = callNode.arguments[1];
            if (t.isStringLiteral(optionsArg)) {
                snapshotName = optionsArg.value;
            }
            else if (t.isObjectExpression(optionsArg)) {
                this.parseApplitoolsOptions(optionsArg, options, warnings);
            }
        }
        return { snapshotName, options, isLayout };
    }
    /**
     * Parses Applitools options object
     * @param optionsNode - The AST node for the options object
     * @param options - The options object to populate
     * @param warnings - Array to add warnings to
     */
    parseApplitoolsOptions(optionsNode, options, warnings) {
        optionsNode.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                const key = prop.key.name;
                switch (key) {
                    case 'ignore':
                        // Handle ignore regions
                        if (t.isArrayExpression(prop.value)) {
                            const ignoreSelectors = prop.value.elements
                                .filter((element) => t.isStringLiteral(element))
                                .map((element) => element.value);
                            if (ignoreSelectors.length > 0) {
                                options.ignoreDOM = { cssSelector: ignoreSelectors };
                            }
                        }
                        break;
                    case 'fully':
                        // Handle fully() modifier (can be boolean true or function call)
                        if (t.isBooleanLiteral(prop.value) && prop.value.value === true) {
                            warnings.push({
                                message: 'Applitools `fully()` was detected. To achieve full-page screenshots in SmartUI, please ensure your viewports in `.smartui.json` are defined with a single width value (e.g., `[1920]`).',
                                details: 'Configure viewports globally in your SmartUI configuration file for full-page screenshots.'
                            });
                        }
                        else if (t.isCallExpression(prop.value) &&
                            t.isIdentifier(prop.value.callee, { name: 'fully' })) {
                            warnings.push({
                                message: 'Applitools `fully()` was detected. To achieve full-page screenshots in SmartUI, please ensure your viewports in `.smartui.json` are defined with a single width value (e.g., `[1920]`).',
                                details: 'Configure viewports globally in your SmartUI configuration file for full-page screenshots.'
                            });
                        }
                        break;
                    default:
                        // Keep other properties as-is
                        break;
                }
            }
        });
    }
    /**
     * Creates a smartuiSnapshot call AST node
     * @param snapshotName - The name of the snapshot
     * @param options - The options object
     * @param framework - The testing framework
     * @returns The AST node for the smartuiSnapshot call
     */
    createSmartUISnapshotCall(snapshotName, options, framework) {
        const args = [t.stringLiteral(snapshotName)];
        // Add options if present
        if (Object.keys(options).length > 0) {
            const optionsObject = t.objectExpression([]);
            if (options.ignoreDOM) {
                optionsObject.properties.push(t.objectProperty(t.identifier('ignoreDOM'), t.objectExpression([
                    t.objectProperty(t.identifier('cssSelector'), t.arrayExpression(options.ignoreDOM.cssSelector.map((selector) => t.stringLiteral(selector))))
                ])));
            }
            if (options.element) {
                optionsObject.properties.push(t.objectProperty(t.identifier('element'), t.objectExpression([
                    t.objectProperty(t.identifier('cssSelector'), t.stringLiteral(options.element.cssSelector))
                ])));
            }
            args.push(optionsObject);
        }
        return t.callExpression(t.identifier('smartuiSnapshot'), args);
    }
    /**
     * Injects layout emulation with functional assertions
     * @param originalCall - The original eyes.check() call
     * @param smartUISnapshotCall - The new smartuiSnapshot call
     * @param framework - The testing framework
     * @param warnings - Array to add warnings to
     */
    injectLayoutEmulation(originalCall, smartUISnapshotCall, framework, warnings) {
        const layoutSelector = originalCall._layoutSelector;
        if (!layoutSelector)
            return;
        // Add warning comment
        const warningComment = t.addComment(originalCall, 'leading', ' MIGRATION-NOTE: Applitools \'layout\' region was emulated. A functional assertion was added to check for the container\'s visibility, and a SmartUI snapshot was taken with child elements ignored. Please verify this provides adequate coverage.', false);
        // Create functional assertion based on framework
        let assertionCall;
        if (framework === 'Playwright') {
            assertionCall = t.awaitExpression(t.callExpression(t.memberExpression(t.callExpression(t.memberExpression(t.identifier('expect'), t.identifier('toBeVisible')), [t.callExpression(t.memberExpression(t.identifier('page'), t.identifier('locator')), [t.stringLiteral(layoutSelector)])]), t.identifier('toBeVisible')), []));
        }
        else {
            // Cypress
            assertionCall = t.callExpression(t.memberExpression(t.callExpression(t.memberExpression(t.identifier('cy'), t.identifier('get')), [t.stringLiteral(layoutSelector)]), t.identifier('should')), [t.stringLiteral('be.visible')]);
        }
        // Modify the smartuiSnapshot call to ignore child elements
        if (smartUISnapshotCall.arguments.length > 1) {
            const optionsArg = smartUISnapshotCall.arguments[1];
            if (t.isObjectExpression(optionsArg)) {
                // Add ignoreDOM for child elements
                optionsArg.properties.push(t.objectProperty(t.identifier('ignoreDOM'), t.objectExpression([
                    t.objectProperty(t.identifier('cssSelector'), t.arrayExpression([t.stringLiteral(`${layoutSelector} *`)]))
                ])));
            }
        }
        // Store the assertion to be inserted before the snapshot
        originalCall._layoutAssertion = assertionCall;
    }
    /**
     * Transforms Sauce Labs Visual JavaScript/TypeScript code to SmartUI format
     * @param sourceCode - The source code to transform
     * @returns CodeTransformationResult - Transformation result with content, warnings, and snapshot count
     */
    transformSauceLabs(sourceCode) {
        const warnings = [];
        let snapshotCount = 0;
        try {
            // Parse the source code into an AST
            const ast = (0, parser_1.parse)(sourceCode, {
                sourceType: 'module',
                allowImportExportEverywhere: true,
                allowReturnOutsideFunction: true,
                plugins: [
                    'objectRestSpread',
                    'functionBind',
                    'exportDefaultFrom',
                    'typescript',
                    'jsx',
                    'decorators-legacy',
                    'classProperties',
                    'asyncGenerators',
                    'functionSent',
                    'throwExpressions'
                ]
            });
            // Traverse and transform the AST
            const self = this;
            const snapshotCountRef = { count: 0 };
            (0, traverse_1.default)(ast, {
                // Transform import declarations
                ImportDeclaration(path) {
                    self.transformSauceLabsImport(path, warnings);
                },
                // Transform require() calls
                CallExpression(path) {
                    if (t.isIdentifier(path.node.callee, { name: 'require' })) {
                        self.transformSauceLabsRequire(path, warnings);
                    }
                },
                // Transform Sauce Labs API calls
                ExpressionStatement(path) {
                    let callNode = null;
                    if (t.isCallExpression(path.node.expression)) {
                        callNode = path.node.expression;
                    }
                    else if (t.isAwaitExpression(path.node.expression) && t.isCallExpression(path.node.expression.argument)) {
                        callNode = path.node.expression.argument;
                    }
                    if (callNode && self.isSauceVisualCheckCall(callNode)) {
                        self.transformSauceVisualCheckToSmartUISnapshot(callNode, warnings);
                        snapshotCountRef.count++;
                    }
                },
                // Transform Sauce Labs API calls in variable declarations
                VariableDeclarator(path) {
                    if (path.node.init && t.isCallExpression(path.node.init) && self.isSauceVisualCheckCall(path.node.init)) {
                        self.transformSauceVisualCheckToSmartUISnapshot(path.node.init, warnings);
                        snapshotCountRef.count++;
                    }
                }
            });
            snapshotCount = snapshotCountRef.count;
            // Generate the transformed code
            const result = (0, generator_1.default)(ast, {
                retainLines: false,
                compact: false,
                comments: true
            });
            return {
                content: result.code,
                warnings,
                snapshotCount
            };
        }
        catch (error) {
            // Handle parsing errors
            const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error';
            warnings.push({
                message: `Failed to parse source code: ${errorMessage}`,
                details: 'The source file may contain unsupported syntax or be malformed.'
            });
            return {
                content: sourceCode, // Return original code on error
                warnings,
                snapshotCount: 0
            };
        }
    }
    /**
     * Transforms Sauce Labs import declarations to SmartUI imports
     * @param path - The AST path for the import declaration
     * @param warnings - Array to add warnings to
     */
    transformSauceLabsImport(path, warnings) {
        const source = path.node.source.value;
        // Map Sauce Labs SDK imports to SmartUI equivalents
        const importMappings = {
            '@saucelabs/cypress-plugin': '@lambdatest/smartui-cypress',
            '@saucelabs/webdriverio': '@lambdatest/smartui-selenium',
            '@saucelabs/playwright-plugin': '@lambdatest/smartui-playwright'
        };
        if (importMappings[source]) {
            path.node.source.value = importMappings[source];
        }
    }
    /**
     * Transforms Sauce Labs require() calls to SmartUI requires
     * @param path - The AST path for the require call
     * @param warnings - Array to add warnings to
     */
    transformSauceLabsRequire(path, warnings) {
        if (path.node && path.node.arguments && path.node.arguments.length > 0 && t.isStringLiteral(path.node.arguments[0])) {
            const source = path.node.arguments[0].value;
            // Map Sauce Labs SDK requires to SmartUI equivalents
            const requireMappings = {
                '@saucelabs/cypress-plugin': '@lambdatest/smartui-cypress',
                '@saucelabs/webdriverio': '@lambdatest/smartui-selenium',
                '@saucelabs/playwright-plugin': '@lambdatest/smartui-playwright'
            };
            if (requireMappings[source]) {
                path.node.arguments[0].value = requireMappings[source];
            }
        }
    }
    /**
     * Checks if a call is a sauceVisualCheck call
     * @param callNode - The AST node for the call expression
     * @returns True if this is a sauceVisualCheck call
     */
    isSauceVisualCheckCall(callNode) {
        return ((t.isIdentifier(callNode.callee, { name: 'sauceVisualCheck' })) ||
            (t.isMemberExpression(callNode.callee) &&
                t.isIdentifier(callNode.callee.object, { name: 'cy' }) &&
                t.isIdentifier(callNode.callee.property, { name: 'sauceVisualCheck' })) ||
            (t.isMemberExpression(callNode.callee) &&
                t.isIdentifier(callNode.callee.object, { name: 'browser' }) &&
                t.isIdentifier(callNode.callee.property, { name: 'sauceVisualCheck' })));
    }
    /**
     * Transforms sauceVisualCheck calls to smartuiSnapshot calls
     * @param callNode - The AST node for the sauceVisualCheck call
     * @param warnings - Array to add warnings to
     */
    transformSauceVisualCheckToSmartUISnapshot(callNode, warnings) {
        // Extract snapshot name and options from the sauceVisualCheck call
        const { snapshotName, options } = this.parseSauceVisualCheckArguments(callNode, warnings);
        // Create the smartuiSnapshot call
        const smartUISnapshotCall = this.createSmartUISnapshotCallFromSauceLabs(snapshotName, options);
        // Replace the original call
        callNode.callee = t.identifier('smartuiSnapshot');
        callNode.arguments = smartUISnapshotCall.arguments;
    }
    /**
     * Parses arguments from sauceVisualCheck calls
     * @param callNode - The AST node for the sauceVisualCheck call
     * @param warnings - Array to add warnings to
     * @returns Object containing snapshot name and options
     */
    parseSauceVisualCheckArguments(callNode, warnings) {
        let snapshotName = 'Untitled Snapshot';
        let options = {};
        if (callNode.arguments.length > 0) {
            // First argument is typically the snapshot name
            const firstArg = callNode.arguments[0];
            if (t.isStringLiteral(firstArg)) {
                snapshotName = firstArg.value;
            }
        }
        // Parse additional arguments for options
        if (callNode.arguments.length > 1) {
            const optionsArg = callNode.arguments[1];
            if (t.isObjectExpression(optionsArg)) {
                this.parseSauceLabsOptions(optionsArg, options, warnings);
            }
        }
        return { snapshotName, options };
    }
    /**
     * Parses Sauce Labs options object
     * @param optionsNode - The AST node for the options object
     * @param options - The options object to populate
     * @param warnings - Array to add warnings to
     */
    parseSauceLabsOptions(optionsNode, options, warnings) {
        optionsNode.properties.forEach((prop) => {
            if (t.isObjectProperty(prop) && t.isIdentifier(prop.key)) {
                const key = prop.key.name;
                switch (key) {
                    case 'ignoredRegions':
                        // Handle ignored regions
                        if (t.isArrayExpression(prop.value)) {
                            const ignoreSelectors = prop.value.elements
                                .filter((element) => t.isStringLiteral(element))
                                .map((element) => element.value);
                            if (ignoreSelectors.length > 0) {
                                options.ignoreDOM = { cssSelector: ignoreSelectors };
                            }
                        }
                        break;
                    case 'clipSelector':
                        // Handle clip selector
                        if (t.isStringLiteral(prop.value)) {
                            options.element = { cssSelector: prop.value.value };
                        }
                        break;
                    case 'captureDom':
                        // Handle capture DOM flag - SmartUI always captures DOM, so this can be ignored
                        // No warning needed as this is a compatible feature
                        break;
                    case 'diffingMethod':
                    case 'diffingOptions':
                        // Handle unsupported diffing options
                        warnings.push({
                            message: 'Sauce Labs\' custom `diffingMethod` and `diffingOptions` are not supported by SmartUI. The snapshot will be compared using SmartUI\'s default algorithm. Please review the results carefully.',
                            details: 'SmartUI uses its own comparison algorithm. Consider adjusting your test expectations if needed.'
                        });
                        break;
                    default:
                        // Keep other properties as-is
                        break;
                }
            }
        });
    }
    /**
     * Creates a smartuiSnapshot call AST node from Sauce Labs options
     * @param snapshotName - The name of the snapshot
     * @param options - The options object
     * @returns The AST node for the smartuiSnapshot call
     */
    createSmartUISnapshotCallFromSauceLabs(snapshotName, options) {
        const args = [t.stringLiteral(snapshotName)];
        // Add options if present
        if (Object.keys(options).length > 0) {
            const optionsObject = t.objectExpression([]);
            if (options.ignoreDOM) {
                optionsObject.properties.push(t.objectProperty(t.identifier('ignoreDOM'), t.objectExpression([
                    t.objectProperty(t.identifier('cssSelector'), t.arrayExpression(options.ignoreDOM.cssSelector.map((selector) => t.stringLiteral(selector))))
                ])));
            }
            if (options.element) {
                optionsObject.properties.push(t.objectProperty(t.identifier('element'), t.objectExpression([
                    t.objectProperty(t.identifier('cssSelector'), t.stringLiteral(options.element.cssSelector))
                ])));
            }
            args.push(optionsObject);
        }
        return t.callExpression(t.identifier('smartuiSnapshot'), args);
    }
}
exports.CodeTransformer = CodeTransformer;
//# sourceMappingURL=CodeTransformer.js.map