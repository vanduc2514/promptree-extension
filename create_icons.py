#!/usr/bin/env python3
"""
Simple script to create basic PNG icons for the Promptree Chrome extension.
Creates minimal green tree emoji-style icons.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    """Create a simple tree icon PNG file."""
    # Create image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Define colors
    green = (5, 150, 105, 255)  # #059669
    brown = (139, 69, 19, 255)  # Brown trunk
    white = (255, 255, 255, 255)

    # Calculate proportions based on size
    trunk_width = max(2, size // 8)
    trunk_height = size // 3
    tree_radius = size // 3

    # Draw tree trunk
    trunk_x = size // 2 - trunk_width // 2
    trunk_y = size - trunk_height - size // 10
    draw.rectangle([trunk_x, trunk_y, trunk_x + trunk_width, trunk_y + trunk_height], fill=brown)

    # Draw tree crown (circle)
    crown_x = size // 2 - tree_radius
    crown_y = size // 4
    draw.ellipse([crown_x, crown_y, crown_x + tree_radius * 2, crown_y + tree_radius * 2], fill=green)

    # Add some highlight for 3D effect
    highlight_radius = tree_radius // 2
    highlight_x = size // 2 - highlight_radius // 2
    highlight_y = size // 3
    draw.ellipse([highlight_x, highlight_y, highlight_x + highlight_radius, highlight_y + highlight_radius],
                fill=(16, 185, 129, 180))  # Semi-transparent lighter green

    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    """Create all required icon sizes."""
    sizes = [16, 48, 128]

    for size in sizes:
        filename = f"icon{size}.png"
        create_icon(size, filename)

    print("All icons created successfully!")
    print("\nTo use these icons:")
    print("1. Make sure the PNG files are in the images/ directory")
    print("2. Load the extension in Chrome")
    print("3. The icons should appear in the toolbar and extension management")

if __name__ == "__main__":
    main()
