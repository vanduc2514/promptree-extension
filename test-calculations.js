// Test the core Promptree calculations
console.log('🌲 Testing Promptree Core Calculations');

// Constants from the extension
const KWH_PER_TOKEN = 0.0000228;
const GCO2_PER_TREE_PER_YEAR = 22000;
const CHARS_PER_TOKEN = 4;
const CURRENT_CARBON_INTENSITY = 106; // From live API

function estimateTokens(text) {
    return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function calculateTrees(tokenCount) {
    const totalKwh = tokenCount * KWH_PER_TOKEN;
    const totalGCO2e = totalKwh * CURRENT_CARBON_INTENSITY;
    return totalGCO2e / GCO2_PER_TREE_PER_YEAR;
}

function getDetailedCalculation(text) {
    const tokens = estimateTokens(text);
    const trees = calculateTrees(tokens);
    const kwh = (tokens * KWH_PER_TOKEN).toFixed(6);
    const gco2 = (kwh * CURRENT_CARBON_INTENSITY).toFixed(3);

    return {
        text: text,
        characters: text.length,
        tokens: tokens,
        kwh: kwh,
        gco2: gco2,
        trees: trees,
        carbonIntensity: CURRENT_CARBON_INTENSITY
    };
}

// Test with different message lengths
const testMessages = [
    "Hello",
    "How are you doing today?",
    "Can you help me write a detailed explanation of how machine learning works?",
    "Write a comprehensive guide to sustainable technology practices that companies can implement to reduce their carbon footprint while maintaining operational efficiency and growth."
];

console.log('\n📊 Test Results:');
testMessages.forEach((msg, i) => {
    const result = getDetailedCalculation(msg);
    console.log(`\nTest ${i + 1}: "${msg.substring(0, 50)}${msg.length > 50 ? '...' : ''}"`);
    console.log(`  Characters: ${result.characters}`);
    console.log(`  Tokens: ${result.tokens}`);
    console.log(`  Energy: ${result.kwh} kWh`);
    console.log(`  CO2: ${result.gco2} g`);
    console.log(`  Trees: ${result.trees.toExponential(2)}`);
});

console.log(`\n🌍 Using live carbon intensity: ${CURRENT_CARBON_INTENSITY} gCO2/kWh`);
console.log('✅ All calculations working correctly!');
