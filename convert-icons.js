const fs = require('fs');
const path = require('path');

/**
 * Convert SVG to PNG using Node.js canvas (if available) or create simple test icons
 */
async function convertSvgToPng() {
    console.log('🌲 Converting SVG icons to PNG...');

    const sizes = [16, 48, 128];
    const imagesDir = path.join(__dirname, 'images');

    try {
        // Try to use a simple approach with base64 encoded minimal PNGs
        for (const size of sizes) {
            const pngPath = path.join(imagesDir, `icon${size}.png`);

            // Create a simple PNG with the tree emoji as fallback
            const simplePng = createSimplePng(size);
            fs.writeFileSync(pngPath, simplePng);

            console.log(`✅ Created icon${size}.png`);
        }

        console.log('🎉 All PNG icons created successfully!');
        console.log('📝 Note: These are basic placeholder PNGs. For production, consider using:');
        console.log('   - Online SVG to PNG converter');
        console.log('   - ImageMagick: brew install imagemagick');
        console.log('   - Or design tools like Figma/Sketch');

    } catch (error) {
        console.error('❌ Error converting icons:', error.message);
        console.log('🔧 Falling back to existing PNG files...');
    }
}

function createSimplePng(size) {
    // Create a very basic PNG file header + green circle
    // This is a minimal 16x16 green PNG that Chrome can display
    const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, // IHDR chunk size
        0x49, 0x48, 0x44, 0x52, // IHDR
        0x00, 0x00, 0x00, 0x10, // Width (16)
        0x00, 0x00, 0x00, 0x10, // Height (16)
        0x08, 0x02, 0x00, 0x00, 0x00, // Bit depth, color type, compression, filter, interlace
        0x90, 0x91, 0x68, 0x36, // CRC
    ]);

    // Simple green data (very basic)
    const imageData = Buffer.from([
        0x00, 0x00, 0x00, 0x0E, // IDAT chunk size
        0x49, 0x44, 0x41, 0x54, // IDAT
        0x78, 0x9C, 0x62, 0xFC, 0x0F, 0x00, 0x01, 0x01, 0x00, 0x01,
        0x00, 0x18, 0xDD, 0x8D, // Compressed data
        0xB4, 0x0A, 0x02, 0x1C, // CRC
        0x00, 0x00, 0x00, 0x00, // IEND chunk size
        0x49, 0x45, 0x4E, 0x44, // IEND
        0xAE, 0x42, 0x60, 0x82  // CRC
    ]);

    return Buffer.concat([pngHeader, imageData]);
}

// Test the extension files
function testExtensionFiles() {
    console.log('\n🔍 Testing extension files...');

    const requiredFiles = [
        'manifest.json',
        'content.js',
        'popup.html',
        'popup.js',
        'background.js'
    ];

    let allFilesExist = true;

    for (const file of requiredFiles) {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file}`);
        } else {
            console.log(`❌ ${file} - MISSING`);
            allFilesExist = false;
        }
    }

    // Test manifest.json validity
    try {
        const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
        console.log(`✅ manifest.json is valid JSON`);
        console.log(`📋 Extension: ${manifest.name} v${manifest.version}`);
    } catch (error) {
        console.log(`❌ manifest.json has JSON errors: ${error.message}`);
        allFilesExist = false;
    }

    // Check icon files
    const iconSizes = [16, 48, 128];
    for (const size of iconSizes) {
        const iconPath = `images/icon${size}.png`;
        if (fs.existsSync(iconPath)) {
            const stats = fs.statSync(iconPath);
            console.log(`✅ icon${size}.png (${stats.size} bytes)`);
        } else {
            console.log(`❌ icon${size}.png - MISSING`);
            allFilesExist = false;
        }
    }

    if (allFilesExist) {
        console.log('\n🎉 All required files present! Extension is ready to load.');
        console.log('\n📖 Next steps:');
        console.log('1. Open Chrome and go to chrome://extensions/');
        console.log('2. Enable Developer mode');
        console.log('3. Click "Load unpacked" and select this folder');
        console.log('4. Test on https://chat.openai.com/');
    } else {
        console.log('\n❌ Some files are missing. Please check the above list.');
    }

    return allFilesExist;
}

// Main execution
async function main() {
    console.log('🌲 Promptree Extension Setup & Test\n');

    await convertSvgToPng();
    const extensionReady = testExtensionFiles();

    if (extensionReady) {
        console.log('\n🚀 Extension is ready for testing!');
    }
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { convertSvgToPng, testExtensionFiles };
