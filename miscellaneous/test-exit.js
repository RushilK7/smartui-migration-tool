#!/usr/bin/env node

// Test script to verify the exit option works
const { InteractiveCLI } = require('./lib/cli');
const inquirer = require('inquirer').default;

async function testExit() {
  console.log('Testing Exit Option...\n');
  
  // Simulate user choosing exit
  const question = {
    type: 'list',
    name: 'action',
    message: '? What would you like to do?',
    choices: [
      {
        name: '🚀 Migrate to SmartUI',
        value: 'migrate',
        short: 'Migrate to SmartUI',
      },
      {
        name: '❌ Exit',
        value: 'exit',
        short: 'Exit',
      },
    ],
    default: 'exit', // Default to exit for testing
  };

  const answers = await inquirer.prompt([question]);
  
  switch (answers['action']) {
    case 'migrate':
      console.log('🚀 Proceeding with migration...');
      break;
    
    case 'exit':
      console.log('👋 Migration cancelled. Goodbye!');
      break;
    
    default:
      console.log('❌ Invalid choice. Exiting...');
      break;
  }
}

testExit().catch(console.error);
