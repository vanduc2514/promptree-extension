# 🌲 Promptree Chrome Extension - Installation & Testing Guide

## ✅ Pre-Installation Status
- **Icons**: ✅ Unified design (16px, 48px, 128px)
- **API**: ✅ UK Carbon Intensity API working (106 gCO2/kWh currently)
- **Calculations**: ✅ Core logic tested and verified
- **Files**: ✅ All extension files present and valid

## 📦 Installation Steps

### 1. Open Chrome Extensions Manager
```
chrome://extensions/
```
Or go to: Chrome Menu → More Tools → Extensions

### 2. Enable Developer Mode
- Toggle "Developer mode" switch in top-right corner

### 3. Load the Extension
- Click "Load unpacked" button
- Navigate to and select: `/Users/nvduc/projects/hobby/promptree-ext`
- Click "Select Folder"

### 4. Verify Installation
- You should see "Promptree" extension with the pine tree icon
- Pin it to toolbar for easy access

## 🧪 Testing Checklist

### Phase 1: Extension Popup Test
1. **Click the Promptree icon** in Chrome toolbar
2. **Verify popup opens** with:
   - Pine tree logo and "PROMPTREE >" text
   - Current carbon intensity (should show UK data ~106 gCO2/kWh)
   - Data source (UK Grid NESO)
   - Last updated timestamp
   - Refresh button

### Phase 2: ChatGPT Integration Test
1. **Open ChatGPT**: https://chatgpt.com or https://chat.openai.com
2. **Test input field**:
   - Start typing in the message box
   - Look for 🌲 icon appearing near input field
   - Verify tree count updates as you type more text
3. **Test message display**:
   - Send a message to ChatGPT
   - Look for tree icons next to your message and AI response
   - Hover over icons to see detailed calculations

### Phase 3: Calculation Verification
Test with these messages to verify calculations:

| Message | Expected Tokens | Expected Trees (approx) |
|---------|----------------|-------------------------|
| "Hello" | ~2 | ~2.2e-7 |
| "How are you doing today?" | ~6 | ~6.6e-7 |
| "Write a detailed explanation..." | ~19 | ~2.1e-6 |

## 🔧 Troubleshooting

### Extension Not Loading
- Check manifest.json is valid JSON ✅
- Ensure all required files exist ✅
- Try disabling/re-enabling the extension

### Icons Not Showing
- Verify PNG files exist in images/ folder ✅
- Check browser console for errors
- Try refreshing the ChatGPT page

### API Issues
- Current UK API status: ✅ Working (106 gCO2/kWh)
- Check network tab for failed requests
- Extension falls back to global average (475 gCO2/kWh) if API fails

### Content Script Not Injecting
- Ensure you're on chatgpt.com or chat.openai.com
- Check if extension has permission for these sites
- Look for console messages starting with "Promptree:"

## 📊 Expected Behavior Details

### Popup Features
- **Carbon Intensity**: Real-time UK grid data (updates every 30 minutes)
- **Data Source**: "UK Grid (NESO)" when API working
- **Refresh Button**: Manually update data
- **Fallback**: Global average if API unavailable

### ChatGPT Integration
- **Input Icon**: Shows tree count as you type
- **Message Icons**: Appear next to sent/received messages
- **Hover Tooltips**: Detailed calculation breakdown
- **Real-time Updates**: Uses current carbon intensity

### Calculation Logic
- **Token Estimation**: ~4 characters per token
- **Energy**: 0.0000228 kWh per token
- **CO2**: Energy × current carbon intensity (gCO2/kWh)
- **Trees**: CO2 ÷ 22,000 g (annual tree absorption)

## 🚀 Ready to Test!

The extension is now ready for testing. All components are working:
- ✅ Unified icon design
- ✅ Working API integration (no key required)
- ✅ Validated calculations
- ✅ All files present and valid

Start with the installation steps above and work through the testing phases systematically.
