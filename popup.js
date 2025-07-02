// Popup script for Promptree Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
    const carbonIntensityEl = document.getElementById('carbon-intensity');
    const dataSourceEl = document.getElementById('data-source');
    const lastUpdatedEl = document.getElementById('last-updated');
    const sourceAttributionEl = document.getElementById('source-attribution');
    const totalLeavesEl = document.getElementById('total-leaves');
    const responseTokensEl = document.getElementById('response-tokens');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshText = document.getElementById('refresh-text');

    // Load initial data
    await loadCarbonData();

    // Populate constant values and their source links
    populateConstants();

    // Set up refresh button
    refreshBtn.addEventListener('click', async () => {
        refreshText.textContent = '⟳';
        refreshBtn.textContent = 'Loading...';
        refreshBtn.disabled = true;

        try {
            await loadCarbonData(true);
        } finally {
            refreshText.textContent = '🔄';
            refreshBtn.innerHTML = '<span id="refresh-text">🔄</span> Refresh Carbon Intensity Data';
            refreshBtn.disabled = false;
        }
    });

    // Update token count from content script data
    await updateTokenCount();

    // Update token count periodically while popup is open
    const tokenCountInterval = setInterval(updateTokenCount, 1000); // Update every second

    // Clean up interval when popup is closed
    window.addEventListener('beforeunload', () => {
        clearInterval(tokenCountInterval);
    });

    async function loadCarbonData(forceRefresh = false) {
        try {
            // Get stored data
            const stored = await chrome.storage.local.get(['carbonIntensity', 'dataSource', 'lastUpdated', 'isExternalData']);

            // Determine if we need to fetch external data
            const shouldFetchExternal = forceRefresh ||
                                       !stored.carbonIntensity ||
                                       !stored.dataSource ||
                                       stored.isExternalData === false; // If current data is static, try to get external

            if (shouldFetchExternal) {
                console.log('Attempting to fetch external data...');

                try {
                    const carbonData = await fetchCarbonIntensity();

                    if (carbonData.success) {
                        const now = new Date();
                        await chrome.storage.local.set({
                            carbonIntensity: carbonData.intensity,
                            dataSource: carbonData.source,
                            lastUpdated: now.toISOString(),
                            isExternalData: true
                        });

                        updateUI(carbonData.intensity, carbonData.source, now, true);
                        return;
                    }
                } catch (error) {
                    console.warn('External fetch failed:', error);
                    // Fall through to use static data
                }
            }

            // Use existing data from storage or fallback to static
            if (stored.carbonIntensity && stored.dataSource && stored.lastUpdated) {
                const lastUpdate = new Date(stored.lastUpdated);
                updateUI(stored.carbonIntensity, stored.dataSource, lastUpdate, stored.isExternalData !== false);
            } else {
                // No data in storage, use static fallback
                const fallbackValue = 473;
                const fallbackSource = 'Static Fallback (Ember 2024)';
                const now = new Date();

                await chrome.storage.local.set({
                    carbonIntensity: fallbackValue,
                    dataSource: fallbackSource,
                    lastUpdated: now.toISOString(),
                    isExternalData: false
                });

                updateUI(fallbackValue, fallbackSource, now, false);
            }

        } catch (error) {
            console.error('Failed to load carbon data:', error);

            // Final fallback
            const fallbackValue = 473;
            const fallbackSource = 'Static Fallback (Ember 2024)';
            updateUI(fallbackValue, fallbackSource, new Date(), false);
        }
    }

    async function fetchCarbonIntensity() {
        try {
            // Fetch global carbon intensity from CO2.js data source
            // Source: https://github.com/thegreenwebfoundation/co2.js/tree/main/data/output
            const response = await fetch('https://raw.githubusercontent.com/thegreenwebfoundation/co2.js/main/data/output/average-intensities.json');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Failed to fetch from CO2.js data source`);
            }

            const data = await response.json();

            // Extract "World" (global average) value only
            if (data && data.World && typeof data.World.emissions_intensity_gco2_per_kwh === 'number') {
                return {
                    success: true,
                    intensity: Math.round(data.World.emissions_intensity_gco2_per_kwh),
                    source: 'CO2.js (Ember)',
                    year: data.World.year || 'Latest'
                };
            }

            throw new Error('World data not found in CO2.js source');
        } catch (error) {
            console.warn('Failed to fetch from CO2.js source:', error);

            // Return fallback data - this will be handled by the caller
            throw new Error('API fetch failed, using static fallback');
        }
    }

    function updateUI(intensity, source, lastUpdate, isExternal) {
        carbonIntensityEl.textContent = `${intensity} gCO₂/kWh`;
        dataSourceEl.textContent = source;
        lastUpdatedEl.textContent = formatTime(lastUpdate);

        // Update source attribution based on whether it's external or static data
        if (isExternal) {
            sourceAttributionEl.innerHTML = 'Data from <strong><a href="https://www.thegreenwebfoundation.org/" target="_blank" style="color: inherit; text-decoration: underline;">CO2.js (Ember)</a></strong> by The Green Web Foundation';
        } else {
            sourceAttributionEl.innerHTML = 'Using <strong><a href="https://ember-climate.org/" target="_blank" style="color: inherit; text-decoration: underline;">static data from 2024</a></strong> (Ember dataset)';
        }
    }

    async function updateTokenCount() {
        try {
            // Try to get current session token count from content script or storage
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]) {
                const tab = tabs[0];

                // Check if we're on a ChatGPT page where the content script is available
                const isChatGPTPage = tab.url && (
                    tab.url.includes('chat.openai.com') ||
                    tab.url.includes('chatgpt.com')
                );

                if (!isChatGPTPage) {
                    totalLeavesEl.textContent = '0 leaves';
                    responseTokensEl.textContent = '0 tokens';
                    return;
                }                // Send message to content script to get current stats
                try {
                    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getTokenCount' });

                    if (response) {
                        // Update total leaves
                        const totalLeaves = response.totalLeaves || 0;
                        totalLeavesEl.textContent = totalLeaves === 1 ? '1 leaf' : `${totalLeaves} leaves`;

                        // Update response tokens
                        const responseTokens = response.responseTokens || 0;
                        responseTokensEl.textContent = responseTokens === 1 ? '1 token' : `${responseTokens} tokens`;
                    } else {
                        totalLeavesEl.textContent = '0 leaves';
                        responseTokensEl.textContent = '0 tokens';
                    }
                } catch (error) {
                    // Content script not available - this is normal when not on ChatGPT page
                    totalLeavesEl.textContent = '0 leaves';
                    responseTokensEl.textContent = '0 tokens';
                }
            } else {
                totalLeavesEl.textContent = '0 leaves';
                responseTokensEl.textContent = '0 tokens';
            }
        } catch (error) {
            console.warn('Could not get token count:', error);
            totalLeavesEl.textContent = '0 leaves';
            responseTokensEl.textContent = '0 tokens';
        }
    }

    function populateConstants() {
        // Energy per Token
        const energyPerTokenEl = document.getElementById('energy-per-token');
        const energyPerTokenLinkEl = document.getElementById('energy-per-token-link');
        if (energyPerTokenEl) energyPerTokenEl.textContent = EXTENSION_CONSTANTS.KWH_PER_TOKEN.display;
        if (energyPerTokenLinkEl) {
            energyPerTokenLinkEl.href = EXTENSION_CONSTANTS.KWH_PER_TOKEN.url;
            energyPerTokenLinkEl.title = `Source: ${EXTENSION_CONSTANTS.KWH_PER_TOKEN.source}`;
        }

        // CO₂ per Tree/Year
        const co2PerTreeEl = document.getElementById('co2-per-tree');
        const co2PerTreeLinkEl = document.getElementById('co2-per-tree-link');
        if (co2PerTreeEl) co2PerTreeEl.textContent = EXTENSION_CONSTANTS.GCO2_PER_TREE_PER_YEAR.display;
        if (co2PerTreeLinkEl) {
            co2PerTreeLinkEl.href = EXTENSION_CONSTANTS.GCO2_PER_TREE_PER_YEAR.url;
            co2PerTreeLinkEl.title = `Source: ${EXTENSION_CONSTANTS.GCO2_PER_TREE_PER_YEAR.source}`;
        }

        // Leaves per Tree
        const leavesPerTreeEl = document.getElementById('leaves-per-tree');
        const leavesPerTreeLinkEl = document.getElementById('leaves-per-tree-link');
        if (leavesPerTreeEl) leavesPerTreeEl.textContent = EXTENSION_CONSTANTS.LEAVES_PER_TREE.display;
        if (leavesPerTreeLinkEl) {
            leavesPerTreeLinkEl.href = EXTENSION_CONSTANTS.LEAVES_PER_TREE.url;
            leavesPerTreeLinkEl.title = `Source: ${EXTENSION_CONSTANTS.LEAVES_PER_TREE.source}`;
        }
    }

    function formatTime(date) {
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

        return date.toLocaleDateString();
    }
});
