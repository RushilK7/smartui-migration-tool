# SmartUI Migration Tool - Advanced Test Suite

This directory contains comprehensive test suites for the SmartUI Migration Tool CLI, designed to test advanced scenarios, edge cases, and complex real-world situations.

## Test Suites

### 1. Advanced CLI Scenarios (`test-advanced-cli-scenarios.js`)

Tests the CLI with various advanced and complex scenarios:

- **Non-Standard File Structure**: Tests detection in custom directory structures
- **Mixed Framework Project**: Tests projects with multiple testing frameworks
- **Custom Naming Conventions**: Tests files with non-standard naming patterns
- **Mismatched Signals Error**: Tests context-aware error handling
- **Empty Project Error**: Tests handling of projects without visual testing
- **Multiple Platforms Error**: Tests detection of conflicting platforms
- **Verbose Mode**: Tests verbose output and debugging
- **Dry Run Mode**: Tests dry-run functionality

### 2. False Positive Prevention (`test-false-positive-prevention.js`)

Tests that the tool does not incorrectly detect visual testing patterns in:

- **Tool Source Code**: Ensures transformer files are not detected as user test files
- **Regex Patterns**: Tests exclusion of regex patterns without actual visual testing calls
- **Documentation Strings**: Tests exclusion of documentation containing method names
- **Comments**: Tests exclusion of comments with visual testing method names
- **String Literals**: Tests exclusion of string literals containing method names
- **Actual Visual Testing**: Ensures real visual testing code is still detected

### 3. Edge Cases and Complex Scenarios (`test-edge-cases.js`)

Tests the CLI with various edge cases and complex scenarios:

- **Malformed Package.json**: Tests handling of invalid JSON files
- **Empty Files**: Tests handling of empty test files
- **Very Long File Names**: Tests handling of extremely long file names
- **Special Characters**: Tests handling of special characters in file names
- **Nested Directory Structure**: Tests deeply nested directory structures
- **Mixed File Extensions**: Tests handling of .js, .ts, .jsx files
- **Large File Handling**: Tests handling of large test files
- **Unicode Characters**: Tests handling of unicode characters in names and content
- **Symlinks**: Tests handling of symbolic links

## Running the Tests

### Run All Test Suites

```bash
# Run all test suites
node tests/run-all-tests.js
```

### Run Individual Test Suites

```bash
# Run advanced CLI scenarios
node tests/test-advanced-cli-scenarios.js

# Run false positive prevention tests
node tests/test-false-positive-prevention.js

# Run edge cases tests
node tests/test-edge-cases.js
```

### Prerequisites

- Node.js >= 18.0.0
- The SmartUI Migration Tool must be built (`npm run build`)
- All dependencies must be installed (`npm install`)

## Test Structure

Each test suite follows this pattern:

1. **Setup**: Creates test projects with specific configurations
2. **Execution**: Runs the CLI with various parameters
3. **Validation**: Checks output for expected results
4. **Cleanup**: Removes test artifacts
5. **Reporting**: Provides detailed test results

## Test Fixtures

Test projects are created in the `tests/fixtures/` directory with various configurations:

- Different package.json structures
- Various file naming conventions
- Custom directory structures
- Mixed framework configurations
- Edge case scenarios

## Expected Behavior

### Successful Tests

- ✅ **Platform Detection**: Correctly identifies visual testing platforms
- ✅ **Framework Detection**: Correctly identifies testing frameworks
- ✅ **Evidence Display**: Shows transparent detection evidence
- ✅ **File Discovery**: Finds test files in non-standard locations
- ✅ **Error Handling**: Provides helpful error messages for edge cases

### Error Scenarios

- ❌ **Mismatched Signals**: Detects API calls without corresponding dependencies
- ❌ **Empty Projects**: Handles projects without visual testing
- ❌ **Multiple Platforms**: Detects conflicting platform dependencies
- ❌ **Malformed Files**: Handles invalid configuration files

## Contributing

When adding new tests:

1. Follow the existing test structure
2. Use descriptive test names
3. Include detailed error messages
4. Test both success and failure scenarios
5. Update this README with new test descriptions

## Troubleshooting

### Common Issues

1. **CLI Not Found**: Ensure the tool is built (`npm run build`)
2. **Permission Errors**: Ensure test directories are writable
3. **Timeout Issues**: Some tests may take longer on slower systems
4. **Platform Differences**: Some tests may behave differently on different operating systems

### Debug Mode

Run tests with verbose output:

```bash
# Run with debug output
DEBUG=* node tests/test-advanced-cli-scenarios.js
```

## Test Results

Each test suite provides:

- **Pass/Fail Status**: Clear indication of test results
- **Detailed Output**: Specific information about what was tested
- **Error Messages**: Helpful error descriptions for failed tests
- **Summary Statistics**: Overall test suite performance

## Integration with CI/CD

These tests are designed to be run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Advanced CLI Tests
  run: |
    npm run build
    node tests/run-all-tests.js
```

The test suites will exit with code 1 if any tests fail, making them suitable for automated testing environments.
