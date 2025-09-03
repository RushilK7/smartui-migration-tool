
# API Reference

## Visual Testing Methods

### Percy
- `percySnapshot(name)` - Takes a visual snapshot
- `percyScreenshot(name)` - Takes a screenshot

### Applitools
- `eyes.check(name)` - Checks visual elements
- `eyes.open()` - Opens eyes session
- `eyes.close()` - Closes eyes session

### Sauce Labs
- `sauceVisualCheck(name)` - Performs visual check
- `screener.snapshot(name)` - Takes snapshot

## Usage Examples

```javascript
// Percy example
cy.percySnapshot('Login Page');

// Applitools example
eyes.check('Dashboard');

// Sauce Labs example
sauceVisualCheck('Homepage');
```
