#!/bin/bash

# Setup script for SportWarren Player Analytics

echo "🚀 Setting up SportWarren Player Analytics..."
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✅ Found Python $PYTHON_VERSION"

# Check for pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3."
    exit 1
fi

echo "✅ Found pip3"
echo ""

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip3 install -r server/services/ai/requirements.txt

if [ $? -eq 0 ]; then
    echo "✅ Python dependencies installed successfully"
else
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo ""
echo "🎉 Player Analytics setup complete!"
echo ""
echo "Next steps:"
echo "1. Add your Roboflow API key to .env:"
echo "   ROBOFLOW_API_KEY=your_api_key_here"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Visit http://localhost:5173/analytics"
echo ""
echo "📖 For more information, see docs/PLAYER_ANALYTICS.md"
