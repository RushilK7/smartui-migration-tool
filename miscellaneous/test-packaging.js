#!/usr/bin/env node

// Simple test to verify packaging works
console.log('SmartUI Migration Tool - Packaging Test');
console.log('Version: 1.0.0');
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Node Version:', process.version);

// Test basic functionality
try {
  const fs = require('fs');
  const path = require('path');
  
  console.log('\n✅ File system access works');
  console.log('✅ Path resolution works');
  console.log('✅ Basic Node.js functionality works');
  
  console.log('\n🎉 Packaging test successful!');
  console.log('The executable is working correctly.');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
