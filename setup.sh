#!/bin/bash

echo "🚀 Setting up AreoVizN AI..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node --version) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create necessary directories if they don't exist
mkdir -p public

echo "✅ Setup complete!"
echo ""
echo "To start the development server, run:"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser."
