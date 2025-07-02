// ==============================================================================
//  PROMPTREE: CARBON INTENSITY ESTIMATION FROM AI EXTENSION
// ==============================================================================

let currentCarbonIntensity = 0; // Will be loaded from storage (background.js handles initialization)
let currentInputTokens = 0; // Current input token count
let lastSentTokens = 0; // Token count of the last sent message
let totalResponseTokens = 0; // Total tokens in all AI responses
let totalResponseLeaves = 0; // Total leaves impact from all AI responses

// ==============================================================================
//  UTILS - Helper Functions
// ==============================================================================

async function loadCarbonIntensityFromStorage() {
  try {
    const stored = await chrome.storage.local.get(['carbonIntensity']);

    if (stored.carbonIntensity && typeof stored.carbonIntensity === 'number') {
      currentCarbonIntensity = stored.carbonIntensity;
      console.log(`Promptree: Loaded carbon intensity: ${currentCarbonIntensity} gCO₂/kWh`);
    } else {
      console.log(`Promptree: Using fallback carbon intensity: ${currentCarbonIntensity} gCO₂/kWh`);
    }
  } catch (error) {
    console.warn('Promptree: Failed to load carbon intensity from storage, using fallback:', error);
  }
}

/**
 * Estimates token count from text length
 */
function estimateTokens(text) {
  return Math.ceil(text.length / EXTENSION_CONSTANTS.CHARS_PER_TOKEN.value);
}

/**
 * Calculates trees using the DYNAMIC carbon intensity value.
 * @param {number} tokenCount - The number of tokens.
 * @returns {number} The estimated number of trees.
 */
function calculateTrees(tokenCount) {
  const totalKwh = tokenCount * EXTENSION_CONSTANTS.KWH_PER_TOKEN.value;
  const totalGCO2e = totalKwh * currentCarbonIntensity; // Using the dynamic value
  return totalGCO2e / EXTENSION_CONSTANTS.GCO2_PER_TREE_PER_YEAR.value;
}

/**
 * Formats tree count for display using leaves/trees with intuitive rounding
 */
function formatTreeCount(trees) {
  if (trees >= 1000) {
    // Very large numbers - use K notation for trees
    return `🌲 ${(trees / 1000).toFixed(1)}K trees`;
  } else if (trees >= 1) {
    // 1 or more trees
    const wholeTreesFloor = Math.floor(trees);
    const remainingFraction = trees - wholeTreesFloor;
    const remainingLeaves = Math.floor(remainingFraction * EXTENSION_CONSTANTS.LEAVES_PER_TREE.value);

    if (remainingLeaves === 0 || trees >= 0.95) {
      // Nearly a whole number of trees or no significant leaves
      return `🌲 ${Math.round(trees)} tree${Math.round(trees) === 1 ? '' : 's'}`;
    } else {
      // Mixed trees and leaves
      return `🌲 ${wholeTreesFloor} tree${wholeTreesFloor === 1 ? '' : 's'} 🍃 ${remainingLeaves} ${remainingLeaves === 1 ? 'leaf' : 'leaves'}`;
    }
  } else {
    // Less than 1 tree - convert to leaves
    const totalLeaves = Math.floor(trees * EXTENSION_CONSTANTS.LEAVES_PER_TREE.value);

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

// ==============================================================================
//  UI - User Interface Functions
// ==============================================================================

/**
 * Updates the input token counter icon
 */
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

  // Detect when message is sent (input becomes empty after having content)
  if (currentInputTokens > 0 && tokens === 0) {
    // Message was just sent, store the token count
    lastSentTokens = currentInputTokens;
  }

  currentInputTokens = tokens;

  if (tokens > 0) {
    const tokenText = tokens === 1 ? '1 token' : `${tokens} tokens`;
    icon.textContent = tokenText;
    icon.style.display = 'flex';
  } else {
    icon.style.display = 'none';
  }
}

/**
 * Adds tree count icons to AI assistant response messages
 */
function addResponseIcons() {
  // Reset totals and recalculate from all responses
  totalResponseTokens = 0;
  totalResponseLeaves = 0;

  // Look for AI assistant messages
  const assistantMessages = document.querySelectorAll('[data-message-author-role="assistant"]');

  assistantMessages.forEach(messageElement => {
    const textContent = messageElement.textContent.trim();
    if (!textContent) return;

    const tokens = estimateTokens(textContent);
    const trees = calculateTrees(tokens);
    const leaves = Math.floor(trees * EXTENSION_CONSTANTS.LEAVES_PER_TREE.value);

    // Add this response to totals
    totalResponseTokens += tokens;
    totalResponseLeaves += leaves;

    // Check if icon already exists
    let existingIcon = messageElement.querySelector('.promptree-assistant-icon');

    if (existingIcon) {
      // Update existing icon if content has changed
      const treeIconSpan = existingIcon.querySelector('.tree-icon');
      const accumulatedIconSpan = existingIcon.querySelector('.accumulated-icon');

      if (treeIconSpan && accumulatedIconSpan) {
        const newTreeDisplay = formatTreeCount(trees);

        // Only update if the display has changed (response is still growing)
        if (treeIconSpan.textContent !== newTreeDisplay) {
          treeIconSpan.textContent = newTreeDisplay;
          treeIconSpan.dataset.previousText = textContent;

          // Update accumulated trees display with recalculated total
          const totalTrees = totalResponseLeaves / EXTENSION_CONSTANTS.LEAVES_PER_TREE.value;
          accumulatedIconSpan.textContent = `Total: ${formatTreeCount(totalTrees)}`;
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
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-weight: 500;
      display: flex;
      gap: 8px;
      align-items: center;
    `;

    // Current response tree count icon
    const treeIcon = document.createElement('span');
    treeIcon.className = 'tree-icon';
    treeIcon.style.cssText = `
      background: rgba(5, 150, 105, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      user-select: none;
      border: 1px solid rgba(5, 150, 105, 0.2);
      color: #059669;
    `;
    treeIcon.textContent = formatTreeCount(trees);
    treeIcon.dataset.previousText = textContent;

    // Accumulated trees icon with teal color scheme and "Total:" prefix
    const accumulatedIcon = document.createElement('span');
    accumulatedIcon.className = 'accumulated-icon';
    accumulatedIcon.style.cssText = `
      background: rgba(8, 145, 178, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      user-select: none;
      border: 1px solid rgba(8, 145, 178, 0.2);
      color: #0891b2;
    `;
    const totalTrees = totalResponseLeaves / EXTENSION_CONSTANTS.LEAVES_PER_TREE.value;
    accumulatedIcon.textContent = `Total: ${formatTreeCount(totalTrees)}`;

    iconContainer.appendChild(treeIcon);
    iconContainer.appendChild(accumulatedIcon);
    messageElement.appendChild(iconContainer);
  });
}

/**
 * Adds token count icons to user messages
 */
function addUserMessageIcon() {
  // Look for user messages that don't already have token icons
  const userMessages = document.querySelectorAll('[data-message-author-role="user"]');

  userMessages.forEach((messageElement, index) => {
    const textContent = messageElement.textContent.trim();
    if (!textContent) return;

    // For the most recent message, use the stored token count from when it was sent
    // For older messages, calculate normally
    const isLatestMessage = index === userMessages.length - 1;
    const tokens = isLatestMessage && lastSentTokens > 0 ? lastSentTokens : estimateTokens(textContent);

    // Check if icon already exists
    let existingIcon = messageElement.querySelector('.promptree-user-icon');

    if (existingIcon) {
      // Update existing icon if content has changed
      const iconSpan = existingIcon.querySelector('span');
      if (iconSpan) {
        const newDisplay = tokens === 1 ? '1 token' : `${tokens} tokens`;

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
    icon.textContent = tokens === 1 ? '1 token' : `${tokens} tokens`;

    iconContainer.appendChild(icon);
    messageElement.appendChild(iconContainer);
  });
}

// ==============================================================================
//  MESSAGE HANDLING - Communication with popup
// ==============================================================================

/**
 * Handle messages from popup script
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTokenCount') {
    // Calculate total leaves from AI responses
    const totalTrees = totalResponseTokens > 0 ? calculateTrees(totalResponseTokens) : 0;
    const totalLeaves = Math.floor(totalTrees * EXTENSION_CONSTANTS.LEAVES_PER_TREE.value);

    sendResponse({
      totalLeaves: totalLeaves,
      responseTokens: totalResponseTokens
    });
    return true; // Indicate we will send a response
  }
});

// ==============================================================================
//  MAIN - Initialization and Event Handling
// ==============================================================================

/**
 * Initialize the extension
 */
async function initializeExtension() {
  await loadCarbonIntensityFromStorage();

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
}

// Start the extension
(async () => {
  await initializeExtension();
})();
