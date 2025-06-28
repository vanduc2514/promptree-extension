# Promptree Icon Placeholder

To create proper PNG icons for the Chrome extension, you'll need to convert the SVG files to PNG format.

## Converting SVG to PNG

You can use one of these methods:

### Method 1: Online Converter
1. Go to https://svgtopng.com/ or similar
2. Upload each SVG file from the `images/` folder
3. Download as PNG with appropriate sizes:
   - icon16.svg → icon16.png (16x16)
   - icon48.svg → icon48.png (48x48)
   - icon128.svg → icon128.png (128x128)

### Method 2: Using ImageMagick (if installed)
```bash
# Install ImageMagick first (macOS)
brew install imagemagick

# Convert SVGs to PNGs
cd images/
magick icon16.svg icon16.png
magick icon48.svg icon48.png
magick icon128.svg icon128.png
```

### Method 3: Using Inkscape (if installed)
```bash
# Install Inkscape first
brew install inkscape

# Convert SVGs to PNGs
cd images/
inkscape icon16.svg --export-type=png --export-filename=icon16.png
inkscape icon48.svg --export-type=png --export-filename=icon48.png
inkscape icon128.svg --export-type=png --export-filename=icon128.png
```

## Placeholder Icons

For now, basic placeholder PNG files are included to make the extension loadable.
