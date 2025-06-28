// Service Worker for Promptree Chrome Extension
// Handles background tasks and API requests

// Store carbon intensity data with caching
chrome.runtime.onInstalled.addListener(() => {
  console.log('Promptree: Extension installed successfully! 🌲');
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

// Function to fetch carbon intensity from multiple sources
async function fetchCarbonIntensityData() {
  // Try UK API first (free and reliable)
  try {
    const response = await fetch('https://api.carbonintensity.org.uk/intensity');
    if (response.ok) {
      const data = await response.json();
      if (data.data && data.data.length > 0 && data.data[0].intensity) {
        const intensity = data.data[0].intensity.actual || data.data[0].intensity.forecast;
        if (intensity) {
          console.log(`Promptree Background: UK Carbon intensity: ${intensity} gCO2/kWh`);
          return intensity;
        }
      }
    }
  } catch (error) {
    console.warn('Promptree Background: UK API failed:', error);
  }

  // Fallback to global average
  console.log('Promptree Background: Using fallback carbon intensity');
  return 475; // Global average
}
