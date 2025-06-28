// ==============================================================================
//  PROMPTREE: DYNAMIC CARBON INTENSITY & API INTEGRATION (JUNE 2025)
// ==============================================================================

// --- STATIC CONSTANTS (RESEARCH-BASED) ---

// CONSTANT 1: ENERGY CONSUMPTION PER TOKEN (kWh/token)
// SOURCE: Based on analyses of modern GPU (e.g., NVIDIA H100) power draw.
// VALUE: Generating ~350 tokens draws ~0.008 kWh. This gives us an average.
const KWH_PER_TOKEN = 0.0000228; // (0.008 kWh / 350 tokens)

// CONSTANT 2: GRAMS OF CO2 ABSORBED PER TREE PER YEAR
// SOURCE: U.S. Department of Agriculture (USDA) Forest Service.
const GCO2_PER_TREE_PER_YEAR = 22000;

// CONSTANT 3: CHARACTER-TO-TOKEN ESTIMATION RATIO
// SOURCE: OpenAI Help Center.
const CHARS_PER_TOKEN = 4;

// CONSTANT 4: FALLBACK CARBON INTENSITY (gCO2e/kWh)
// SOURCE: Global average carbon intensity (updated 2025).
const FALLBACK_CARBON_INTENSITY = 475;

// --- DYNAMIC DATA & API CONFIGURATION ---

let currentCarbonIntensity = FALLBACK_CARBON_INTENSITY; // Default to fallback
let lastApiUpdate = 0;
const API_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

// ==============================================================================
//  API & DATA FETCHING LOGIC (MULTIPLE SOURCES)
// ==============================================================================

/**
 * Fetches carbon intensity from UK Carbon Intensity API (free, no key required)
 * Covers Great Britain (England, Scotland, Wales)
 */
async function fetchUKCarbonIntensity() {
  try {
    const response = await fetch('https://api.carbonintensity.org.uk/intensity', {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('Promptree: UK Carbon Intensity API request failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.data && data.data.length > 0 && data.data[0].intensity) {
      const intensity = data.data[0].intensity.actual || data.data[0].intensity.forecast;
      if (intensity) {
        console.log(`Promptree: UK Carbon intensity updated to ${intensity} gCO2/kWh.`);
        return intensity;
      }
    }
  } catch (error) {
    console.warn('Promptree: Error calling UK Carbon Intensity API:', error);
  }
  return null;
}

/**
 * Fetches carbon intensity from Electricity Maps (requires API key for production)
 * This is a fallback option - users would need to provide their own API key
 */
async function fetchElectricityMapsIntensity(coords) {
  // Note: This would require an API key. For demo purposes, we'll skip this
  // Users can sign up at https://api-portal.electricitymaps.com/ for free tier
  console.log('Promptree: Electricity Maps API would require API key configuration.');
  return null;
}

/**
 * Gets user location and attempts to fetch relevant carbon intensity data
 */
function getUserLocationAndFetchData() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        console.log(`Promptree: User location: ${coords.latitude}, ${coords.longitude}`);

        // For UK coordinates, use UK API
        if (isUKLocation(coords.latitude, coords.longitude)) {
          fetchUKCarbonIntensity().then(intensity => {
            if (intensity) {
              currentCarbonIntensity = intensity;
              updateLastApiUpdate();
            }
          });
        } else {
          // For other locations, could implement other regional APIs
          console.log('Promptree: Location outside UK - using global average.');
        }
      },
      (error) => {
        console.warn('Promptree: Geolocation permission denied or failed:', error.message);
        // Try UK API anyway as a reasonable default for many users
        fetchUKCarbonIntensity().then(intensity => {
          if (intensity) {
            currentCarbonIntensity = intensity;
            updateLastApiUpdate();
          }
        });
      }
    );
  } else {
    console.warn('Promptree: Geolocation not supported.');
    // Try UK API as fallback
    fetchUKCarbonIntensity().then(intensity => {
      if (intensity) {
        currentCarbonIntensity = intensity;
        updateLastApiUpdate();
      }
    });
  }
}

/**
 * Simple check if coordinates are within UK bounds
 */
function isUKLocation(lat, lng) {
  // Approximate UK bounding box
  return lat >= 49.5 && lat <= 61.0 && lng >= -8.5 && lng <= 2.0;
}

/**
 * Updates the last API update timestamp
 */
function updateLastApiUpdate() {
  lastApiUpdate = Date.now();
}

/**
 * Checks if we need to refresh carbon intensity data
 */
function shouldRefreshCarbonData() {
  return (Date.now() - lastApiUpdate) > API_CACHE_DURATION;
}

/**
 * Main function to initialize carbon data fetching
 */
function initializeCarbonData() {
  // Only fetch if we don't have recent data
  if (shouldRefreshCarbonData()) {
    getUserLocationAndFetchData();
  }
}

// ==============================================================================
//  CORE CALCULATION & UI FUNCTIONS
// ==============================================================================

function estimateTokens(text) {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Calculates trees using the DYNAMIC carbon intensity value.
 * @param {number} tokenCount - The number of tokens.
 * @returns {number} The estimated number of trees.
 */
function calculateTrees(tokenCount) {
  const totalKwh = tokenCount * KWH_PER_TOKEN;
  const totalGCO2e = totalKwh * currentCarbonIntensity; // Using the dynamic value
  return totalGCO2e / GCO2_PER_TREE_PER_YEAR;
}

/**
 * Gets a more detailed tooltip with calculation breakdown
 */
function getDetailedTooltip(tokens, trees) {
  const kwh = (tokens * KWH_PER_TOKEN).toFixed(6);
  const gco2 = (kwh * currentCarbonIntensity).toFixed(3);

  return `Calculation breakdown:
~${tokens} tokens
~${kwh} kWh energy
~${gco2} g CO2 emissions
@ ${currentCarbonIntensity} gCO2/kWh
≈ ${trees.toExponential(2)} trees needed`;
}

function updateInputIcon() {
  const inputElement = document.querySelector('textarea[data-id="root"]') ||
                      document.querySelector('div[contenteditable="true"]') ||
                      document.querySelector('textarea[placeholder*="message"]') ||
                      document.querySelector('#prompt-textarea');

  if (!inputElement) return;

  // Find or create container for the icon
  let container = inputElement.closest('.relative') || inputElement.parentElement;
  if (!container) return;

  let icon = container.querySelector('#promptree-input-icon');
  if (!icon) {
    icon = document.createElement('div');
    icon.id = 'promptree-input-icon';
    icon.style.cssText = `
      position: absolute;
      right: 12px;
      top: 12px;
      z-index: 1000;
      background: rgba(0, 0, 0, 0.05);
      border-radius: 8px;
      padding: 4px 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      color: #059669;
      cursor: help;
      user-select: none;
      pointer-events: auto;
      border: 1px solid rgba(5, 150, 105, 0.2);
      backdrop-filter: blur(4px);
    `;
    container.style.position = 'relative';
    container.appendChild(icon);
  }

  const inputText = inputElement.value || inputElement.textContent || '';
  const tokens = estimateTokens(inputText);
  const trees = calculateTrees(tokens);

  if (tokens > 0) {
    icon.textContent = `🌲 ${trees.toExponential(2)}`;
    icon.title = getDetailedTooltip(tokens, trees);
    icon.style.display = 'block';
  } else {
    icon.style.display = 'none';
  }
}

function addResponseIcons() {
  // Multiple selectors to catch different ChatGPT layouts
  const responseSelectors = [
    '.group.w-full',
    '[data-message-author-role="assistant"]',
    '.markdown',
    '.prose',
    '[class*="conversation"]',
    '[class*="message"]'
  ];

  let responseElements = [];
  for (const selector of responseSelectors) {
    const elements = document.querySelectorAll(selector);
    responseElements = responseElements.concat(Array.from(elements));
  }

  responseElements.forEach(response => {
    if (response.querySelector('.promptree-response-icon')) return;

    // Try different text content selectors
    const textElement = response.querySelector('.prose') ||
                       response.querySelector('.markdown') ||
                       response.querySelector('[class*="text"]') ||
                       response;

    if (textElement && textElement.textContent.trim()) {
      const tokens = estimateTokens(textElement.textContent);
      const trees = calculateTrees(tokens);

      const icon = document.createElement('span');
      icon.className = 'promptree-response-icon';
      icon.style.cssText = `
        margin-left: 8px;
        font-size: 12px;
        color: #059669;
        background: rgba(5, 150, 105, 0.1);
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
        cursor: help;
        user-select: none;
      `;
      icon.textContent = `🌲 ${trees.toExponential(2)}`;
      icon.title = getDetailedTooltip(tokens, trees);

      // Try to find action buttons area or append to response
      const actionArea = response.querySelector('.text-gray-400') ||
                        response.querySelector('[class*="action"]') ||
                        response.querySelector('[class*="button"]') ||
                        textElement;

      if (actionArea) {
        actionArea.appendChild(icon);
      }
    }
  });
}

// ==============================================================================
//  INITIALIZATION & MONITORING
// ==============================================================================

// Initialize carbon data when script loads
initializeCarbonData();

// Refresh carbon data periodically
setInterval(() => {
  if (shouldRefreshCarbonData()) {
    initializeCarbonData();
  }
}, 10 * 60 * 1000); // Check every 10 minutes

// Set up UI update intervals
setInterval(updateInputIcon, 500);
setInterval(addResponseIcons, 1000);

// Also update when the page content changes
const observer = new MutationObserver(() => {
  addResponseIcons();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Promptree: Extension loaded successfully! 🌲');
console.log(`Promptree: Using carbon intensity: ${currentCarbonIntensity} gCO2/kWh`);
