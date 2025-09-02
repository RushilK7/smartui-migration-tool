#!/bin/bash

# Test script to simulate the GitHub Actions release workflow
echo "🚀 Testing Release Workflow..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository"
    exit 1
fi

# Check if pkg is installed
if ! command -v pkg &> /dev/null; then
    echo "❌ pkg is not installed"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Build and package
echo "🔨 Building and packaging executables..."
pnpm package

if [ $? -ne 0 ]; then
    echo "❌ Failed to build and package"
    exit 1
fi

echo "✅ Build and package completed"

# Check if executables were created
echo "📋 Checking created executables..."
if [ -f "dist/releases/smartui-migration-tool-linux-x64" ]; then
    echo "✅ Linux x64 executable created"
else
    echo "❌ Linux x64 executable not found"
fi

if [ -f "dist/releases/smartui-migration-tool-macos-x64" ]; then
    echo "✅ macOS x64 executable created"
else
    echo "❌ macOS x64 executable not found"
fi

if [ -f "dist/releases/smartui-migration-tool-macos-arm64" ]; then
    echo "✅ macOS ARM64 executable created"
else
    echo "❌ macOS ARM64 executable not found"
fi

if [ -f "dist/releases/smartui-migration-tool-win-x64.exe" ]; then
    echo "✅ Windows x64 executable created"
else
    echo "❌ Windows x64 executable not found"
fi

# Show file sizes
echo "📊 Executable sizes:"
ls -lh dist/releases/

echo ""
echo "🎉 Release workflow test completed successfully!"
echo "📁 Executables are ready in: dist/releases/"
echo ""
echo "📋 Next steps:"
echo "  1. Commit and push your changes"
echo "  2. Create a version tag: git tag v1.0.0"
echo "  3. Push the tag: git push origin v1.0.0"
echo "  4. GitHub Actions will automatically create a release"
