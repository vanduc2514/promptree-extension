#!/bin/bash

echo "🌲 PROMPTREE EXTENSION INSTALLER"
echo "================================="
echo ""
echo "Extension directory: $(pwd)"
echo "Status: Ready for installation"
echo ""

# Open Chrome extensions page with AppleScript
echo "🔧 Opening Chrome extensions page..."
osascript -e 'tell application "Google Chrome" to activate' -e 'tell application "Google Chrome" to open location "chrome://extensions/"' 2>/dev/null

sleep 2

echo ""
echo "📋 MANUAL INSTALLATION STEPS:"
echo "1. ✅ Chrome extensions page should now be open"
echo "2. 🔘 Toggle 'Developer mode' ON (top-right corner switch)"
echo "3. 📁 Click 'Load unpacked' button"
echo "4. 📂 Navigate to and select: $(pwd)"
echo "5. ✅ Verify Promptree extension appears with pine tree icon"
echo ""
echo "🎯 EXACT FOLDER TO SELECT: $(pwd)"
echo ""
echo "🧪 TESTING STEPS:"
echo "1. Click the Promptree extension icon in Chrome toolbar"
echo "2. ChatGPT should have opened in a new tab"
echo "3. Start typing in ChatGPT message box"
echo "4. Look for 🌲 tree icons appearing"
echo ""
echo "✅ Files verified:"
ls -la manifest.json images/icon*.png 2>/dev/null | sed 's/^/   /'
echo ""
echo "🔧 If you need help:"
echo "   - Check browser console for errors"
echo "   - Ensure you're on chatgpt.com or chat.openai.com"
echo "   - Try refreshing the ChatGPT page after installation"
echo ""
echo "🚀 Ready to install!"
