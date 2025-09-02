# Packaging and Distribution Guide

This document describes how the SmartUI Migration Tool is packaged and distributed as standalone executables.

## Overview

The SmartUI Migration Tool is packaged using the `pkg` library to create self-contained, dependency-free executables for multiple platforms. This allows users to download and run the tool without requiring Node.js to be installed.

## Package Configuration

### package.json Configuration

The `package.json` file includes the following key configurations:

```json
{
  "bin": {
    "smartui-migrator": "./bin/run"
  },
  "pkg": {
    "scripts": "lib/**/*.js",
    "assets": "bin/**/*",
    "targets": [
      "node18-linux-x64",
      "node18-macos-x64", 
      "node18-macos-arm64",
      "node18-win-x64"
    ],
    "outputPath": "dist/releases"
  }
}
```

### Build Scripts

The packaging process is automated with the following script:

```json
{
  "scripts": {
    "package": "pnpm build && pkg ."
  }
}
```

## Supported Platforms

The tool creates executables for the following platforms:

- **Linux (x64)**: `smartui-migration-tool-linux-x64`
- **macOS (Intel)**: `smartui-migration-tool-macos-x64`
- **macOS (Apple Silicon)**: `smartui-migration-tool-macos-arm64`
- **Windows (x64)**: `smartui-migration-tool-win-x64.exe`

## Building Executables

### Local Development

To build executables locally:

```bash
# Install dependencies
pnpm install

# Build and package
pnpm package
```

The executables will be created in the `dist/releases/` directory.

### Automated Releases

The GitHub Actions workflow (`.github/workflows/release.yml`) automatically builds and releases executables when a version tag is pushed:

```bash
# Create and push a version tag
git tag v1.0.0
git push origin v1.0.0
```

This triggers the release workflow which:
1. Builds the TypeScript code
2. Creates executables for all platforms
3. Creates a GitHub Release with the executables as downloadable assets

## File Structure

```
dist/releases/
├── smartui-migration-tool-linux-x64
├── smartui-migration-tool-macos-x64
├── smartui-migration-tool-macos-arm64
└── smartui-migration-tool-win-x64.exe
```

## Installation Instructions

Users can download the appropriate executable for their platform from the GitHub Releases page and:

1. **Download** the appropriate binary
2. **Make executable** (Linux/macOS): `chmod +x smartui-migration-tool-*`
3. **Run directly** or **move to PATH** for global access

## Technical Notes

- The `pkg` library bundles all dependencies into the executable
- Executables are self-contained and don't require Node.js
- File sizes are typically 90-110MB due to bundled dependencies
- The tool uses Node.js 18 as the target runtime

## Troubleshooting

### Common Issues

1. **Import statement warnings**: These are normal and don't affect functionality
2. **Large file sizes**: Expected due to bundled dependencies
3. **Command not found**: Ensure the executable has proper permissions

### Development Notes

- The `pkg` configuration includes both `scripts` and `assets` to ensure all necessary files are bundled
- The `bin` field in `package.json` defines the command name for global installation
- The `oclif` configuration ensures proper command discovery
