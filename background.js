// Service Worker for Promptree Chrome Extension
// Handles background tasks and API requests

// Initialize carbon intensity data when extension is installed/enabled
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Promptree: Extension installed successfully! 🌲');

  // Fetch initial carbon intensity data
  try {
    await initializeCarbonData();
    console.log('Promptree: Initial carbon intensity data loaded');
  } catch (error) {
    console.error('Promptree: Failed to load initial carbon intensity data:', error);
  }
});

// Also initialize on startup (browser restart, extension enable)
chrome.runtime.onStartup.addListener(async () => {
  console.log('Promptree: Extension starting up');
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchCarbonIntensity') {
    fetchCarbonIntensityData()
      .then(intensity => sendResponse({ success: true, intensity }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
});

// Initialize carbon intensity data in storage
async function initializeCarbonData() {
  try {
    const carbonData = await fetchCarbonIntensityFromCO2js();
    const now = new Date();

    await chrome.storage.local.set({
      carbonIntensity: carbonData.intensity,
      dataSource: carbonData.source,
      lastUpdated: now.toISOString(),
      isExternalData: true
    });

    console.log(`Promptree: Initialized with ${carbonData.intensity} gCO₂/kWh from ${carbonData.source}`);
  } catch (error) {
    console.warn('Promptree: Failed to initialize carbon data:', error);

    // Set fallback values
    await chrome.storage.local.set({
      carbonIntensity: 473,
      dataSource: 'Static Fallback (Ember 2024)',
      lastUpdated: new Date().toISOString(),
      isExternalData: false
    });
  }
}

// Function to fetch carbon intensity from CO2.js global data
async function fetchCarbonIntensityFromCO2js() {
  const response = await fetch('https://raw.githubusercontent.com/thegreenwebfoundation/co2.js/main/data/output/average-intensities.json');

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch from CO2.js data source`);
  }

  const data = await response.json();

  // Extract "World" (global average) value only
  if (data && data.World && typeof data.World.emissions_intensity_gco2_per_kwh === 'number') {
    return {
      intensity: Math.round(data.World.emissions_intensity_gco2_per_kwh),
      source: 'CO2.js (Ember)',
      year: data.World.year || 'Latest'
    };
  }

  throw new Error('World data not found in CO2.js source');
}

// Function to fetch carbon intensity data (legacy support)
async function fetchCarbonIntensityData() {
  try {
    const carbonData = await fetchCarbonIntensityFromCO2js();
    return carbonData.intensity;
  } catch (error) {
    console.warn('Promptree Background: CO2.js API failed, using fallback:', error);
    return 473; // Ember 2024 global average fallback
  }
}
