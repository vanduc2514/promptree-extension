#!/bin/bash

# Promptree Chrome Extension Setup Script
# This script helps you load and test the extension

echo "🌲 Promptree Chrome Extension Setup"
echo "====================================="

# Check if we're in the right directory
if [ ! -f "manifest.json" ]; then
    echo "❌ Error: Please run this script from the promptree-ext directory"
    echo "Expected files: manifest.json, content.js, popup.html, etc."
    exit 1
fi

echo "✅ Found extension files in current directory"

# Check for required files
required_files=("manifest.json" "content.js" "popup.html" "popup.js" "background.js")
missing_files=()

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -ne 0 ]; then
    echo "❌ Missing required files:"
    printf ' - %s\n' "${missing_files[@]}"
    exit 1
fi

echo "✅ All required extension files found"

# Check for icon files
if [ -f "images/icon16.png" ] && [ -f "images/icon48.png" ] && [ -f "images/icon128.png" ]; then
    echo "✅ Icon files found"
else
    echo "⚠️  Icon files missing - creating basic placeholders..."
    mkdir -p images
    # Note: You may want to create proper icons later
fi

echo ""
echo "🚀 Ready to load extension in Chrome!"
echo ""
echo "Loading Instructions:"
echo "1. Open Chrome and go to: chrome://extensions/"
echo "2. Enable 'Developer mode' (toggle in top-right)"
echo "3. Click 'Load unpacked'"
echo "4. Select this folder: $(pwd)"
echo "5. The Promptree extension should appear in your toolbar"
echo ""
echo "Testing Instructions:"
echo "1. Go to https://chat.openai.com/ or https://chatgpt.com/"
echo "2. Start typing in the input field"
echo "3. Look for 🌲 indicators showing environmental impact"
echo "4. Click the Promptree extension icon to see details"
echo ""
echo "Troubleshooting:"
echo "- If icons don't show: Check browser console for errors"
echo "- If carbon data fails: Extension will use global average (475 gCO2/kWh)"
echo "- For UK users: Real-time carbon intensity from NESO"
echo "- For other regions: Global average carbon intensity"
echo ""
echo "API Status Check:"

# Test the UK Carbon Intensity API
echo -n "🔍 Testing UK Carbon Intensity API... "
if curl -s --max-time 5 "https://api.carbonintensity.org.uk/intensity" > /dev/null 2>&1; then
    echo "✅ Online"

    # Get current carbon intensity
    intensity=$(curl -s "https://api.carbonintensity.org.uk/intensity" | grep -o '"forecast":[0-9]*' | head -1 | cut -d':' -f2)
    if [ ! -z "$intensity" ]; then
        echo "📊 Current UK carbon intensity: ${intensity} gCO2/kWh"
    fi
else
    echo "❌ Offline (will use fallback)"
fi

echo ""
echo "🔧 Development Notes:"
echo "- Extension uses Manifest V3"
echo "- Content script runs on ChatGPT domains only"
echo "- No external API keys required for basic functionality"
echo "- All calculations done locally for privacy"
echo ""
echo "Happy carbon tracking! 🌍"
