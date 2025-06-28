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
 * Formats tree count for display using leaves/trees with intuitive rounding
 */
function formatTreeCount(trees) {
  const LEAVES_PER_TREE = 250000; // Conservative estimate of leaves per mature tree

  if (trees >= 1000) {
    // Very large numbers - use K notation for trees
    return `🌲 ${(trees / 1000).toFixed(1)}K trees`;
  } else if (trees >= 1) {
    // 1 or more trees
    const wholeTreesFloor = Math.floor(trees);
    const remainingFraction = trees - wholeTreesFloor;
    const remainingLeaves = Math.floor(remainingFraction * LEAVES_PER_TREE);

    if (remainingLeaves === 0 || trees >= 0.95) {
      // Nearly a whole number of trees or no significant leaves
      return `🌲 ${Math.round(trees)} tree${Math.round(trees) === 1 ? '' : 's'}`;
    } else {
      // Mixed trees and leaves
      return `🌲 ${wholeTreesFloor} tree${wholeTreesFloor === 1 ? '' : 's'} 🍃 ${remainingLeaves} ${remainingLeaves === 1 ? 'leaf' : 'leaves'}`;
    }
  } else {
    // Less than 1 tree - convert to leaves
    const totalLeaves = Math.floor(trees * LEAVES_PER_TREE);

    if (totalLeaves >= 1000) {
      // Too many leaves - convert back to trees for readability
      return `🌲 ${trees.toFixed(1)} tree${trees.toFixed(1) === '1.0' ? '' : 's'}`;
    } else if (totalLeaves >= 1) {
      return `🍃 ${totalLeaves} ${totalLeaves === 1 ? 'leaf' : 'leaves'}`;
    } else {
      // Very small - show as fraction of a leaf
      return `🍃 <1 leaf`;
    }
  }
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
≈ ${formatTreeCount(trees)}

🌲 1 tree absorbs 22kg CO2/year
🍃 1 tree ≈ 250,000 leaves worth of absorption`;
}

function updateInputIcon() {
  const inputElement = document.querySelector('textarea[data-id="root"]') ||
                      document.querySelector('div[contenteditable="true"]') ||
                      document.querySelector('textarea[placeholder*="message"]') ||
                      document.querySelector('#prompt-textarea');

  if (!inputElement) return;

  // Look for the send button - try multiple selectors for different UI layouts
  const sendButton = document.querySelector('button[data-testid="send-button"]') ||
                    document.querySelector('button[aria-label*="Send"]') ||
                    document.querySelector('button[aria-label*="submit"]') ||
                    document.querySelector('button:has(svg)') ||
                    document.querySelector('[data-testid="fruitjuice-send-button"]') ||
                    inputElement.parentElement?.querySelector('button') ||
                    inputElement.closest('form')?.querySelector('button[type="submit"]') ||
                    inputElement.closest('div')?.querySelector('button');

  if (!sendButton) return;

  // Find the parent container that holds both input and send button
  let container = sendButton.parentElement;

  // If the send button is in a separate container, look for a common parent
  if (!container || !container.contains(inputElement)) {
    container = inputElement.closest('div')?.parentElement?.querySelector('div:has(button)') ||
                sendButton.closest('div')?.parentElement;
  }

  if (!container) return;

  let icon = document.querySelector('#promptree-input-icon'); // Global search to avoid duplicates

  // Remove existing icon if it's in the wrong place
  if (icon && !container.contains(icon)) {
    icon.remove();
    icon = null;
  }

  if (!icon) {
    icon = document.createElement('div');
    icon.id = 'promptree-input-icon';
    icon.style.cssText = `
      display: flex;
      align-items: center;
      margin-right: 8px;
      background: rgba(59, 130, 246, 0.1);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      color: #2563eb;
      user-select: none;
      border: 1px solid rgba(59, 130, 246, 0.2);
      white-space: nowrap;
      flex-shrink: 0;
    `;

    // Try to insert the icon right before the send button
    try {
      sendButton.parentElement.insertBefore(icon, sendButton);
    } catch (e) {
      // Fallback: append to the container
      container.appendChild(icon);
    }
  }

  const inputText = inputElement.value || inputElement.textContent || '';
  const tokens = estimateTokens(inputText);

  if (tokens > 0) {
    const tokenText = tokens === 1 ? '~1 token' : `~${tokens} tokens`;
    icon.textContent = tokenText;
    icon.style.display = 'flex';
  } else {
    icon.style.display = 'none';
  }
}

function addResponseIcons() {
  // Look for AI assistant messages
  const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');

  assistantMessages.forEach(messageElement => {
    const textContent = messageElement.textContent.trim();
    if (!textContent) return;

    const tokens = estimateTokens(textContent);
    const trees = calculateTrees(tokens);

    // Check if icon already exists
    let existingIcon = messageElement.querySelector('.promptree-assistant-icon');

    if (existingIcon) {
      // Update existing icon if content has changed
      const iconSpan = existingIcon.querySelector('span');
      if (iconSpan) {
        const newDisplay = formatTreeCount(trees);
        const newTooltip = getDetailedTooltip(tokens, trees);

        // Only update if the display has changed (response is still growing)
        if (iconSpan.textContent !== newDisplay) {
          iconSpan.textContent = newDisplay;
          iconSpan.title = newTooltip;
        }
      }
      return;
    }

    // Create new icon container at the end of the response in a separate section
    const iconContainer = document.createElement('div');
    iconContainer.className = 'promptree-assistant-icon';
    iconContainer.style.cssText = `
      margin-top: 12px;
      padding-top: 8px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
      text-align: left;
      font-size: 12px;
      color: #059669;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
    `;

    const icon = document.createElement('span');
    icon.style.cssText = `
      background: rgba(5, 150, 105, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      cursor: help;
      user-select: none;
      border: 1px solid rgba(5, 150, 105, 0.2);
    `;
    icon.textContent = formatTreeCount(trees);
    icon.title = getDetailedTooltip(tokens, trees);

    iconContainer.appendChild(icon);
    messageElement.appendChild(iconContainer);
  });
}

function addUserMessageIcon() {
  // Look for user messages that don't already have token icons
  const userMessages = document.querySelectorAll('[data-message-author-role="user"]');

  userMessages.forEach(messageElement => {
    const textContent = messageElement.textContent.trim();
    if (!textContent) return;

    const tokens = estimateTokens(textContent);

    // Check if icon already exists
    let existingIcon = messageElement.querySelector('.promptree-user-icon');

    if (existingIcon) {
      // Update existing icon if content has changed
      const iconSpan = existingIcon.querySelector('span');
      if (iconSpan) {
        const newDisplay = tokens === 1 ? '~1 token' : `~${tokens} tokens`;

        // Only update if the display has changed
        if (iconSpan.textContent !== newDisplay) {
          iconSpan.textContent = newDisplay;
        }
      }
      return;
    }

    // Create new token icon container below the message bubble
    const iconContainer = document.createElement('div');
    iconContainer.className = 'promptree-user-icon';
    iconContainer.style.cssText = `
      margin-top: 8px;
      text-align: right;
      font-size: 12px;
      color: #2563eb;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
    `;

    const icon = document.createElement('span');
    icon.style.cssText = `
      background: rgba(59, 130, 246, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      user-select: none;
      border: 1px solid rgba(59, 130, 246, 0.2);
    `;
    icon.textContent = tokens === 1 ? '~1 token' : `~${tokens} tokens`;

    iconContainer.appendChild(icon);
    messageElement.appendChild(iconContainer);
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
setInterval(addResponseIcons, 500); // Faster updates for streaming responses
setInterval(addUserMessageIcon, 1000);

// Also update when the page content changes
const observer = new MutationObserver(() => {
  addResponseIcons();
  addUserMessageIcon();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});

console.log('Promptree: Extension loaded successfully! 🌲');
console.log(`Promptree: Using carbon intensity: ${currentCarbonIntensity} gCO2/kWh`);
