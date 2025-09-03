
// Utility functions for regex pattern matching
const percySnapshotRegex = /(\w+)\.snapshot\s*\(\s*"([^"]+)"\s*\)/g;
const eyesCheckRegex = /(\w+)\.check\s*\(\s*"([^"]+)"\s*\)/g;
const sauceVisualCheckRegex = /(\w+)\.sauceVisualCheck\s*\(\s*"([^"]+)"\s*\)/g;

function transformPercyCode(code) {
  return code.replace(percySnapshotRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

function transformApplitoolsCode(code) {
  return code.replace(eyesCheckRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

function transformSauceLabsCode(code) {
  return code.replace(sauceVisualCheckRegex, 'SmartUISnapshot.smartuiSnapshot(driver, "$2")');
}

module.exports = {
  transformPercyCode,
  transformApplitoolsCode,
  transformSauceLabsCode
};
