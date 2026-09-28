#!/usr/bin/env python3
"""Feather only edge color deltas so a landscape repeats without a vertical line."""

import argparse
from pathlib import Path
from PIL import Image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("--width", type=int, default=96)
    args = parser.parse_args()
    image = Image.open(args.image).convert("RGBA")
    pixels = image.load()
    width = max(2, min(args.width, image.width // 4))

    for y in range(image.height):
        left = pixels[0, y]
        right = pixels[image.width - 1, y]
        # Restrict automatic correction to matching open-sky/background rows.
        # Foreground silhouettes require regeneration or manual review; shifting
        # their colors across a feather band would create visible streaks.
        if not (left[2] > left[0] + 20 and right[2] > right[0] + 20 and left[1] > 130 and right[1] > 130):
            continue
        delta = tuple(left[channel] - right[channel] for channel in range(3))
        for offset in range(width):
            weight = (offset + 1) / width
            x = image.width - width + offset
            source = pixels[x, y]
            rgb = tuple(max(0, min(255, round(source[channel] + delta[channel] * weight))) for channel in range(3))
            pixels[x, y] = (*rgb, source[3])

    image.save(args.image)


if __name__ == "__main__":
    main()
