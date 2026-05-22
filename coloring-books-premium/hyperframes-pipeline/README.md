# HyperFrames Coloring-Book Pipeline

Local MLX / Apple Silicon image pipeline for premium KDP coloring-book regen.
Replaces OpenAI gpt-image-2 with 100% local generation. No cloud. No API costs.

## Architecture

```
gen_lineart.py       → SD-Turbo on MPS → 768x512 line art → Pillow post-process → 1024x1536 PNG
regen_one.sh         → calls gen_lineart.py + node render.mjs
page-template/       → Puppeteer HTML→PNG at 2550x3300 (KDP 8.5x11 @ 300 DPI)
```

**Model**: `stabilityai/sd-turbo` (non-gated, ~4 GB, 2-step inference on MPS)
**Device**: Apple Silicon MPS (Metal Performance Shaders) — no CUDA needed
**Per-page time**: ~12s on M4 Mac mini (model load ~8s + inference ~2s + compose ~2s)

If `HF_TOKEN` or `~/.cache/huggingface/token` is present, gen_lineart.py will first attempt
`black-forest-labs/FLUX.1-schnell` (gated, requires accepting ToS on huggingface.co)
and fall back to SD-Turbo on failure.

## Install

```bash
cd hyperframes-pipeline/

# Create venv (uses uv if available, otherwise python3 -m venv)
uv venv .venv
uv pip install --python .venv/bin/python mflux pillow diffusers accelerate

# Install Puppeteer for HTML→PNG composition
cd page-template/
npm install
cd ..
```

## Regen one page

```bash
BOOK_ROOT=/path/to/magical-unicorns-premium-rebuild \
  bash hyperframes-pipeline/regen_one.sh 3 "Unicorn beside a sparkling castle"
# → writes generated/page-03.png
```

## Regen all 5 books

Each book's `regen_one.sh` is a thin delegate that sets `BOOK_ROOT` and calls the pipeline.

```bash
# From coloring-books-premium/
cd magical-unicorns-premium-rebuild
bash run_all.sh       # reads themes.txt, calls regen_one.sh for each line
```

Or batch all books:

```bash
for book in magical-unicorns princess-castle bugs-butterflies abc-animal-alphabet farm-animals; do
  cd /path/to/coloring-books-premium/${book}-premium-rebuild
  bash run_all.sh
done
```

## Model weights cache

SD-Turbo weights: `~/.cache/huggingface/hub/models--stabilityai--sd-turbo/` (~4 GB, downloaded on first run)
FLUX.1-schnell weights (if used): `~/.cache/huggingface/hub/models--black-forest-labs--FLUX.1-schnell/` (~23 GB after quantization)

## Quality notes

SD-Turbo (2-step, 768x512 → upscaled to 1024x1536) produces recognizable subjects with strong
black-and-white thresholding. Images are dense/detailed rather than simple outlined areas.
For best KDP coloring-book quality, consider:
1. Setting `HF_TOKEN` and accepting FLUX.1-schnell license on huggingface.co (much better prompting)
2. Using a LoRA fine-tuned for coloring-book line art on top of SD-Turbo
3. Increasing `num_inference_steps` to 4 for slightly better quality (adds ~2s per page)

## OpenAI backup

Each book's original `regen_one.openai.sh.bak` preserves the old OpenAI gpt-image-2 flow.
To restore: `cp regen_one.openai.sh.bak regen_one.sh`

## File structure

```
hyperframes-pipeline/
  .venv/                   Python venv (mflux, pillow, diffusers)
  gen_lineart.py            Image generation script
  regen_one.sh              Pipeline adapter (wraps gen_lineart.py + Puppeteer)
  page-template/
    index.html              KDP page layout (2550x3300, 113px bleed margin)
    render.mjs              Puppeteer HTML→PNG renderer
    package.json
    node_modules/
  test-batch/
    magical-unicorns/
      generated/            5 test pages (page-01.png … page-05.png)
      contact-sheet.jpg     Thumbnail grid of all 5 pages
```
