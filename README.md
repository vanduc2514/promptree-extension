# Promptree Chrome Extension

A Chrome extension that estimates the environmental impact of your ChatGPT conversations by calculating their carbon footprint in real-time.

## 🌲 Features

- **Real-time Carbon Intensity**: Uses live data from UK National Grid and other reliable sources
- **Token-based Calculations**: Estimates energy consumption per AI token generated
- **Visual Indicators**: Shows tree equivalents needed to offset CO2 emissions
- **Multiple Data Sources**: Falls back to global averages when regional data unavailable
- **Privacy-focused**: No data collection, all calculations done locally

## 🔌 Data Sources

### Primary: UK Carbon Intensity API (FREE)
- **Provider**: National Energy System Operator (NESO)
- **Coverage**: Great Britain (England, Scotland, Wales)
- **API**: `https://api.carbonintensity.org.uk/`
- **License**: Creative Commons (CC BY 4.0)
- **Rate Limits**: None specified
- **Status**: ✅ Fully operational and free

### Fallback: Global Average
- **Value**: 475 gCO2/kWh (global average for 2025)
- **Used when**: API unavailable or user outside supported regions

### Optional: Electricity Maps API
- **Provider**: Electricity Maps
- **Coverage**: 200+ zones globally
- **Free Tier**: 1 zone, 50 calls/hour
- **Status**: Available with API key (free tier)

## ⚙️ Installation

1. **Download or Clone** this repository
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `promptree-ext` folder
5. **Pin the extension** for easy access

## 📊 How It Works

### Calculation Methodology

1. **Token Estimation**: Text length ÷ 4 characters per token (OpenAI standard)
2. **Energy Consumption**: ~0.0000228 kWh per token (based on GPU analysis)
3. **Carbon Emissions**: Energy × Regional Carbon Intensity
4. **Tree Equivalent**: CO2 emissions ÷ 22kg CO2 absorbed per tree per year

### Example Calculation
```
100 tokens → 0.00228 kWh → 1.08g CO2 (at 475 gCO2/kWh) → 4.9e-5 trees
```

## 🔧 Technical Details

### Constants Used
- **Energy per token**: 0.0000228 kWh (derived from NVIDIA H100 analysis)
- **CO2 per tree**: 22,000g CO2/year (USDA Forest Service)
- **Characters per token**: 4 (OpenAI documentation)
- **Fallback carbon intensity**: 475 gCO2/kWh (global average)

### API Endpoints
```javascript
// UK Carbon Intensity (Primary)
GET https://api.carbonintensity.org.uk/intensity

// Response format:
{
  "data": [{
    "from": "2025-06-29T12:00Z",
    "to": "2025-06-29T12:30Z",
    "intensity": {
      "forecast": 266,
      "actual": 263,
      "index": "moderate"
    }
  }]
}
```

## 🛡️ Privacy & Security

- **No data collection**: All calculations performed locally
- **No tracking**: Extension doesn't send user data anywhere
- **HTTPS only**: All API calls use secure connections
- **Minimal permissions**: Only requests access to ChatGPT domains

## 🌍 Supported Regions

### Full Support (Real-time data)
- 🇬🇧 **United Kingdom**: England, Scotland, Wales
- 📡 **Data source**: NESO Carbon Intensity API

### Global Fallback
- 🌐 **All other regions**: Global average carbon intensity
- 📊 **Accuracy**: Reasonable estimate for worldwide usage

### Future Expansion
- 🇪🇺 **European Union**: Could integrate ENTSO-E API
- 🇺🇸 **United States**: Regional grid operators (ISO/RTO data)
- 🌏 **Other regions**: Additional APIs as available

## 🔄 Updates & Caching

- **Cache duration**: 30 minutes for carbon intensity data
- **Auto-refresh**: Background updates every 10 minutes when active
- **Manual refresh**: Available via popup interface
- **Offline resilience**: Uses last known data when APIs unavailable

## 📁 Project Structure

```
promptree-ext/
├── manifest.json          # Chrome extension manifest
├── background.js           # Extension background script
├── content.js              # Main extension content script
├── popup.html             # Extension popup interface
├── popup.js               # Popup functionality
├── images/                # Extension icons (16px, 48px, 128px)
├── package.json           # Node.js dependencies
├── README.md              # This file
└── prompt/                # Development & documentation files
    ├── README.md          # Development files documentation
    ├── setup.sh           # Project setup script
    ├── install.sh         # Extension installation helper
    ├── TESTING_GUIDE.md   # Testing instructions
    └── test-*.js/html     # Test files and validation scripts
```

### Core Extension Files
The root directory contains only the essential files needed for the Chrome extension to function:
- Extension manifest and scripts
- UI components (popup)
- Icon assets
- Project configuration

### Development Files
The `prompt/` folder contains all development, testing, and documentation files that support the extension but aren't part of the core functionality.

## 📝 License

This project is licensed under the MIT License - see below for details.

```
MIT License

Copyright (c) 2025 Promptree

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:

1. **Additional APIs**: Integrate more regional carbon intensity sources
2. **Better UI**: Improve visual design and user experience
3. **Enhanced calculations**: More accurate energy consumption models
4. **Localization**: Support for multiple languages
5. **Analytics**: Optional usage statistics (privacy-preserving)

## 📚 References

- [UK Carbon Intensity API Documentation](https://carbon-intensity.github.io/api-definitions/)
- [Electricity Maps API](https://api-portal.electricitymaps.com/)
- [OpenAI Tokenizer Information](https://help.openai.com/en/articles/4936856)
- [USDA Forest Carbon Data](https://www.usda.gov/)
- [Chrome Extension Development Guide](https://developer.chrome.com/docs/extensions/)

## ⚠️ Disclaimer

This extension provides estimates based on publicly available data and research. Actual environmental impact may vary based on numerous factors including:

- Regional energy mix variations
- AI model efficiency improvements
- Data center renewable energy usage
- Seasonal carbon intensity changes

Use these estimates as general guidance rather than precise measurements.
