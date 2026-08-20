from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageOps

SOURCE = Path("logo-approved.jpg")
MASTER_SIZE = 1024


def master_image() -> Image.Image:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Missing icon source: {SOURCE}")

    with Image.open(SOURCE) as src:
        src = ImageOps.exif_transpose(src).convert("RGBA")
        w, h = src.size
        if w <= 0 or h <= 0:
            raise RuntimeError("Invalid icon source dimensions")

        # The approved artwork is kept unchanged whenever it is already close to square.
        # For non-square sources, use a centered crop instead of stretching the logo.
        ratio = max(w, h) / min(w, h)
        if ratio <= 1.12:
            square = ImageOps.fit(
                src,
                (MASTER_SIZE, MASTER_SIZE),
                method=Image.Resampling.LANCZOS,
                centering=(0.5, 0.5),
            )
        else:
            side = min(w, h)
            left = (w - side) // 2
            top = (h - side) // 2
            square = src.crop((left, top, left + side, top + side)).resize(
                (MASTER_SIZE, MASTER_SIZE), Image.Resampling.LANCZOS
            )

    return square


def build_windows(master: Image.Image) -> None:
    out = Path("Sliqadius.ico")
    sizes = [
        (16, 16),
        (20, 20),
        (24, 24),
        (32, 32),
        (40, 40),
        (48, 48),
        (64, 64),
        (96, 96),
        (128, 128),
        (256, 256),
    ]
    master.save(out, format="ICO", sizes=sizes, bitmap_format="png")

    if not out.is_file() or out.stat().st_size < 4096:
        raise RuntimeError("Windows ICO was not created correctly")

    with Image.open(out) as ico:
        embedded = set(ico.info.get("sizes", set()))
    required = {(16, 16), (32, 32), (48, 48), (128, 128), (256, 256)}
    missing = required - embedded
    if missing:
        raise RuntimeError(f"Windows ICO is missing sizes: {sorted(missing)}")

    print(f"WINDOWS_ICON_OK {out} sizes={sorted(embedded)}")


def save_png(master: Image.Image, path: Path, size: int) -> None:
    image = master.resize((size, size), Image.Resampling.LANCZOS)
    image.save(path, format="PNG", optimize=True)
    with Image.open(path) as check:
        if check.size != (size, size):
            raise RuntimeError(f"Wrong icon size for {path}: {check.size}")


def build_macos(master: Image.Image) -> None:
    iconset = Path("Sliqadius.iconset")
    iconset.mkdir(exist_ok=True)

    files = {
        "icon_16x16.png": 16,
        "icon_16x16@2x.png": 32,
        "icon_32x32.png": 32,
        "icon_32x32@2x.png": 64,
        "icon_128x128.png": 128,
        "icon_128x128@2x.png": 256,
        "icon_256x256.png": 256,
        "icon_256x256@2x.png": 512,
        "icon_512x512.png": 512,
        "icon_512x512@2x.png": 1024,
    }
    for name, size in files.items():
        save_png(master, iconset / name, size)

    print(f"MACOS_ICONSET_OK {iconset} files={len(files)}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Build native Sliqadius desktop icon assets")
    parser.add_argument("--windows", action="store_true")
    parser.add_argument("--macos", action="store_true")
    args = parser.parse_args()

    if not args.windows and not args.macos:
        parser.error("choose --windows and/or --macos")

    master = master_image()
    if args.windows:
        build_windows(master)
    if args.macos:
        build_macos(master)


if __name__ == "__main__":
    main()
