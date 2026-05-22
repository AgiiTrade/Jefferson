#!/usr/bin/env python3
"""
Generate black-and-white coloring book line art using SD-Turbo on MPS (Apple Silicon).
Model: stabilityai/sd-turbo (non-gated, ~4GB, 1-step inference)
Falls back to CPU if MPS is unavailable.
Usage: gen_lineart.py --theme "..." --out path.png
"""
import argparse
import sys
import time
import os
from pathlib import Path

from PIL import Image, ImageFilter, ImageOps

PROMPT_TEMPLATE = (
    "coloring book line art, thick black outlines, white background, "
    "no shading, no grayscale, no text, no watermark, bold simple shapes, "
    "large open spaces, kids cartoon, ages 4-8, portrait. {theme}"
)

MAX_ATTEMPTS = 3
RETRY_DELAY = 15

# SD-Turbo target dimensions (must be 512x512 for sd-turbo, we upscale after)
SD_WIDTH = 768
SD_HEIGHT = 512
# Final output dimensions
OUT_WIDTH = 1024
OUT_HEIGHT = 1536


def postprocess(raw_path: str, out_path: str) -> None:
    """Resize to portrait, threshold + dilate strokes for clean coloring book look."""
    img = Image.open(raw_path).convert("L")
    # Resize to full portrait size using high-quality resampling
    img = img.resize((OUT_WIDTH, OUT_HEIGHT), Image.LANCZOS)
    # Threshold: pixels darker than 200 → black, rest → white
    img = img.point(lambda x: 0 if x < 200 else 255)
    # Dilate black pixels: invert, MaxFilter (expand white = dilate original black), invert back
    inverted = ImageOps.invert(img)
    dilated = inverted.filter(ImageFilter.MaxFilter(3))
    result = ImageOps.invert(dilated)
    img_rgb = result.convert("RGB")
    img_rgb.save(out_path)


def generate(theme: str, out_path: str) -> None:
    import torch
    from diffusers import AutoPipelineForText2Image

    prompt = PROMPT_TEMPLATE.format(theme=theme)
    out = Path(out_path)
    out.parent.mkdir(parents=True, exist_ok=True)

    # Determine device
    if torch.backends.mps.is_available():
        device = "mps"
        dtype = torch.float16
    else:
        device = "cpu"
        dtype = torch.float32

    print(f"[gen_lineart] Using device: {device}")
    print(f"[gen_lineart] Loading stabilityai/sd-turbo...")

    pipe = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/sd-turbo",
        torch_dtype=dtype,
        variant="fp16" if device != "cpu" else None,
    )
    pipe = pipe.to(device)

    print(f"[gen_lineart] Generating: {theme[:80]}")
    # SD-Turbo: 1 step, guidance_scale=0 for distillation model
    result = pipe(
        prompt=prompt,
        num_inference_steps=2,
        guidance_scale=0.0,
        height=SD_HEIGHT,
        width=SD_WIDTH,
    )
    pil_img = result.images[0]

    tmp_raw = str(out) + ".raw.png"
    pil_img.save(tmp_raw)

    print(f"[gen_lineart] Post-processing...")
    postprocess(tmp_raw, str(out))

    try:
        os.unlink(tmp_raw)
    except Exception:
        pass

    print(f"[ok] Saved post-processed line art to {out}")


def main():
    parser = argparse.ArgumentParser(description="Generate coloring book line art via SD-Turbo/MPS")
    parser.add_argument("--theme", required=True, help="Theme description for the page")
    parser.add_argument("--out", required=True, help="Output PNG file path")
    args = parser.parse_args()

    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            print(f"[gen_lineart] Attempt {attempt}/{MAX_ATTEMPTS}")
            generate(args.theme, args.out)
            sys.exit(0)
        except Exception as e:
            print(f"[gen_lineart] Attempt {attempt} failed: {e}", file=sys.stderr)
            if attempt < MAX_ATTEMPTS:
                print(f"[gen_lineart] Retrying in {RETRY_DELAY}s...")
                time.sleep(RETRY_DELAY)

    print(f"[gen_lineart] All {MAX_ATTEMPTS} attempts failed. Giving up.", file=sys.stderr)
    sys.exit(1)


if __name__ == "__main__":
    main()
