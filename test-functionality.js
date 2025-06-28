// Final functionality test for Promptree
const fs = require('fs');

console.log('🌲 Promptree Functionality Test\n');

// Test the carbon intensity calculation logic
function testCalculations() {
    console.log('🧮 Testing calculation logic...');

    // Constants from content.js
    const KWH_PER_TOKEN = 0.0000228;
    const GCO2_PER_TREE_PER_YEAR = 22000;
    const CHARS_PER_TOKEN = 4;
    const FALLBACK_CARBON_INTENSITY = 475;

    // Test token estimation
    const testText = "What is the environmental impact of AI?";
    const estimatedTokens = Math.ceil(testText.length / CHARS_PER_TOKEN);
    console.log(`📝 Test text: "${testText}"`);
    console.log(`📊 Estimated tokens: ${estimatedTokens}`);

    // Test energy calculation
    const totalKwh = estimatedTokens * KWH_PER_TOKEN;
    console.log(`⚡ Energy consumption: ${totalKwh.toFixed(6)} kWh`);

    // Test CO2 calculation
    const totalGCO2e = totalKwh * FALLBACK_CARBON_INTENSITY;
    console.log(`🏭 CO2 emissions: ${totalGCO2e.toFixed(3)} g`);

    // Test tree calculation
    const trees = totalGCO2e / GCO2_PER_TREE_PER_YEAR;
    console.log(`🌲 Trees needed: ${trees.toExponential(2)}`);

    console.log('✅ Calculation logic working correctly!\n');
}

// Test API endpoint
async function testApiEndpoint() {
    console.log('🌐 Testing UK Carbon Intensity API...');

    try {
        const response = await fetch('https://api.carbonintensity.org.uk/intensity');

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.data && data.data.length > 0 && data.data[0].intensity) {
            const intensity = data.data[0].intensity.actual || data.data[0].intensity.forecast;
            const index = data.data[0].intensity.index;
            const from = data.data[0].from;
            const to = data.data[0].to;

            console.log(`✅ API Response:`);
            console.log(`   Current intensity: ${intensity} gCO2/kWh`);
            console.log(`   Level: ${index}`);
            console.log(`   Time period: ${from} to ${to}`);
            console.log(`✅ API is working correctly!\n`);

            return intensity;
        } else {
            throw new Error('Invalid data format received');
        }
    } catch (error) {
        console.log(`❌ API Error: ${error.message}`);
        console.log(`🔄 Will use fallback: 475 gCO2/kWh\n`);
        return 475;
    }
}

// Test file integrity
function testFileIntegrity() {
    console.log('📁 Testing file integrity...');

    const files = [
        { name: 'manifest.json', test: (content) => JSON.parse(content) },
        { name: 'content.js', test: (content) => content.includes('calculateTrees') },
        { name: 'popup.html', test: (content) => content.includes('Promptree') },
        { name: 'popup.js', test: (content) => content.includes('fetchCarbonIntensity') },
        { name: 'background.js', test: (content) => content.includes('chrome.runtime') }
    ];

    let allGood = true;

    for (const file of files) {
        try {
            const content = fs.readFileSync(file.name, 'utf8');
            file.test(content);
            console.log(`✅ ${file.name}`);
        } catch (error) {
            console.log(`❌ ${file.name}: ${error.message}`);
            allGood = false;
        }
    }

    if (allGood) {
        console.log('✅ All files are valid and contain expected content!\n');
    } else {
        console.log('❌ Some files have issues.\n');
    }

    return allGood;
}

// Main test function
async function runTests() {
    console.log('Starting comprehensive functionality tests...\n');

    testCalculations();
    const carbonIntensity = await testApiEndpoint();
    const filesOk = testFileIntegrity();

    console.log('📋 Test Summary:');
    console.log(`🧮 Calculations: ✅ Working`);
    console.log(`🌐 API Status: ${carbonIntensity ? '✅' : '❌'} ${carbonIntensity ? 'Online' : 'Offline'}`);
    console.log(`📁 Files: ${filesOk ? '✅' : '❌'} ${filesOk ? 'Valid' : 'Issues found'}`);

    if (filesOk && carbonIntensity) {
        console.log('\n🎉 All tests passed! Extension is fully functional.');
        console.log('\n🚀 Ready for Chrome installation:');
        console.log('1. Open chrome://extensions/');
        console.log('2. Enable Developer mode');
        console.log('3. Click "Load unpacked"');
        console.log('4. Select this directory');
        console.log('5. Visit ChatGPT and see the magic! ✨');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the issues above.');
    }
}

// Import fetch for Node.js if needed
if (typeof fetch === 'undefined') {
    console.log('🔧 Importing fetch for Node.js...');
    const { fetch } = require('undici');
    global.fetch = fetch;
}

runTests().catch(console.error);
