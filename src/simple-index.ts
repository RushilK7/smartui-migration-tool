/**
 * SmartUI Migration Tool v1.6.0 - Simplified Index
 * Enterprise-grade CLI tool for migrating visual testing platforms to LambdaTest SmartUI
 */

// Core commands
export { default as SimpleMain } from './commands/simple-main';
export { default as Init } from './commands/init';
export { default as Migrate } from './commands/migrate';
export { default as Version } from './commands/version';
export { default as Help } from './commands/help';

// ASCII Logos
export { ASCIILogos } from './utils/ascii-logos';

// Version information
export const VERSION = '1.6.0';
export const DESCRIPTION = 'Enterprise-grade CLI tool for migrating visual testing platforms to LambdaTest SmartUI';
