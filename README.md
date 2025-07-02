# Promptree Chrome Extension

A Chrome extension that shows how many trees your AI conversations would need to offset their environmental impact. Turn your prompts into a visual forest of leaves and trees.

## Features

- **Global Carbon Intensity Data**: Uses CO2.js dataset from The Green Web Foundation (Ember)
- **Real-time Token Tracking**: Monitors input and response tokens in ChatGPT conversations
- **Tree/Leaf Visualization**: Converts CO2 emissions to intuitive tree and leaf equivalents
- **Session Tracking**: Displays cumulative environmental impact during each chat session
- **Privacy-focused**: All calculations performed locally, no user data collected

## Data Sources

### Primary: CO2.js Global Dataset
- **Provider**: The Green Web Foundation (Ember data)
- **Coverage**: Global average carbon intensity
- **API**: GitHub raw content from co2.js repository
- **License**: Open source
- **Status**: Active and maintained

### Fallback: Static Data
- **Value**: 473 gCO2/kWh (global average for 2024)
- **Used when**: API unavailable or network issues

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable Developer Mode (toggle in top right)
4. Click "Load unpacked" and select the `promptree-ext` folder
5. Pin the extension for easy access

## How It Works

### Calculation Methodology

1. **Token Estimation**: Text length divided by 4 characters per token (OpenAI standard)
2. **Energy Consumption**: 0.0000228 kWh per token (based on GPU analysis research)
3. **Carbon Emissions**: Energy consumption multiplied by carbon intensity
4. **Tree Equivalent**: CO2 emissions divided by 22kg CO2 absorbed per tree per year
5. **Leaf Equivalent**: Tree value multiplied by 250,000 leaves per tree

### Example Calculation
```
100 tokens → 0.00228 kWh → 1.08g CO2 (at 473 gCO2/kWh) → 0.000049 trees → 12 leaves
```

## Browser Compatibility

- **Chrome**: Full support (Manifest V3)
- **Edge**: Compatible (Chromium-based)
- **Firefox**: Not currently supported (different extension API)

## Privacy and Security

- **No data collection**: Extension does not transmit user conversations or personal data
- **Local processing**: All calculations performed in the browser
- **HTTPS only**: External API calls use secure connections
- **Minimal permissions**: Only accesses ChatGPT domains and carbon intensity data

## Contributing

Areas for improvement:
1. **Additional AI Platforms**: Support for Claude, Gemini, and other chatbots
2. **Regional Data Sources**: Integration of local carbon intensity APIs
3. **Enhanced Calculations**: More precise energy consumption models
4. **User Interface**: Improved visual design and accessibility
5. **Performance**: Optimization for large conversation sessions

## References

- [Nature Scientific Reports - GPU Power Analysis](https://www.nature.com/articles/s41598-024-76682-6)
- [EPA Greenhouse Gas Equivalencies Calculator](https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references)
- [USDA Forest Service - Tree Data](https://www.fs.usda.gov/foresthealth/technology/pdfs/FHTET-05-02.pdf)
- [OpenAI Token Documentation](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them)
- [CO2.js by The Green Web Foundation](https://github.com/thegreenwebfoundation/co2.js)

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Disclaimer

This extension provides estimates based on publicly available research and data. Actual environmental impact may vary based on factors including:

- Regional energy mix variations
- AI model efficiency changes
- Data center renewable energy usage
- Carbon intensity fluctuations

These estimates should be used as general guidance rather than precise measurements.
