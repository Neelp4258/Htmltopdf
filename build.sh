#!/bin/bash
set -e

echo "📦 Installing dependencies..."
npm install

echo "🌐 Installing Chrome for Puppeteer..."
npx puppeteer browsers install chrome

echo "✅ Build complete!"
