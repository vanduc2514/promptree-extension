// Shared constants for Promptree Chrome Extension
// This file is loaded by all scripts via manifest.json

const EXTENSION_CONSTANTS = {
    KWH_PER_TOKEN: {
        value: 0.0000228,
        display: '0.0000228 kWh',
        source: 'Nature Scientific Reports - GPU power analysis',
        url: 'https://www.nature.com/articles/s41598-024-76682-6'
    },
    GCO2_PER_TREE_PER_YEAR: {
        value: 22000,
        display: '22 kg',
        source: 'EPA Greenhouse Gas Equivalencies Calculator',
        url: 'https://www.epa.gov/energy/greenhouse-gases-equivalencies-calculator-calculations-and-references'
    },
    LEAVES_PER_TREE: {
        value: 250000,
        display: '250,000',
        source: 'USDA Forest Service - Tree leaf estimates',
        url: 'https://www.fs.usda.gov/foresthealth/technology/pdfs/FHTET-05-02.pdf'
    },
    CHARS_PER_TOKEN: {
        value: 4,
        display: '4',
        source: 'OpenAI Help Center - Token counting guide',
        url: 'https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them'
    }
};
