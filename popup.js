// Popup script for Promptree Chrome Extension

document.addEventListener('DOMContentLoaded', async () => {
    const carbonIntensityEl = document.getElementById('carbon-intensity');
    const dataSourceEl = document.getElementById('data-source');
    const lastUpdatedEl = document.getElementById('last-updated');
    const connectionStatusEl = document.getElementById('connection-status');
    const refreshBtn = document.getElementById('refresh-btn');
    const refreshText = document.getElementById('refresh-text');

    // Load initial data
    await loadCarbonData();

    // Set up refresh button
    refreshBtn.addEventListener('click', async () => {
        refreshText.textContent = '⟳ Refreshing...';
        refreshBtn.disabled = true;

        try {
            await loadCarbonData(true);
        } finally {
            refreshText.textContent = '🔄 Refresh Data';
            refreshBtn.disabled = false;
        }
    });

    async function loadCarbonData(forceRefresh = false) {
        try {
            // Try to get data from storage first
            const stored = await chrome.storage.local.get(['carbonIntensity', 'dataSource', 'lastUpdated']);

            if (!forceRefresh && stored.carbonIntensity && stored.lastUpdated) {
                const lastUpdate = new Date(stored.lastUpdated);
                const now = new Date();
                const timeDiff = now - lastUpdate;

                // Use cached data if less than 30 minutes old
                if (timeDiff < 30 * 60 * 1000) {
                    updateUI(stored.carbonIntensity, stored.dataSource, lastUpdate);
                    return;
                }
            }

            // Fetch fresh data
            const carbonData = await fetchCarbonIntensity();

            if (carbonData.success) {
                const now = new Date();
                await chrome.storage.local.set({
                    carbonIntensity: carbonData.intensity,
                    dataSource: carbonData.source || 'UK Grid',
                    lastUpdated: now.toISOString()
                });

                updateUI(carbonData.intensity, carbonData.source || 'UK Grid', now);
                showConnectedStatus();
            } else {
                throw new Error(carbonData.error || 'Failed to fetch data');
            }
        } catch (error) {
            console.error('Failed to load carbon data:', error);
            showDisconnectedStatus(error.message);

            // Show fallback data
            updateUI(475, 'Global Average', new Date());
        }
    }

    async function fetchCarbonIntensity() {
        try {
            // Try UK Carbon Intensity API first
            const response = await fetch('https://api.carbonintensity.org.uk/intensity');

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (data.data && data.data.length > 0 && data.data[0].intensity) {
                const intensity = data.data[0].intensity.actual || data.data[0].intensity.forecast;
                if (intensity) {
                    return {
                        success: true,
                        intensity: intensity,
                        source: 'UK Grid (NESO)'
                    };
                }
            }

            throw new Error('Invalid data format received');
        } catch (error) {
            console.warn('UK API failed, using fallback:', error);
            return {
                success: true,
                intensity: 475,
                source: 'Global Average'
            };
        }
    }

    function updateUI(intensity, source, lastUpdate) {
        carbonIntensityEl.textContent = `${intensity} gCO₂/kWh`;
        dataSourceEl.textContent = source;
        lastUpdatedEl.textContent = formatTime(lastUpdate);
    }

    function showConnectedStatus() {
        connectionStatusEl.className = 'status connected';
        connectionStatusEl.textContent = '✅ Connected to carbon intensity API';
    }

    function showDisconnectedStatus(error) {
        connectionStatusEl.className = 'status disconnected';
        connectionStatusEl.textContent = `⚠️ API Error: ${error}`;
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
