from pathlib import Path

from PIL import Image


out = Path("worker/sample-previews")
out.mkdir(parents=True, exist_ok=True)

for source in Path("dist/assets/sample-pages").glob("*.png"):
    image = Image.open(source).convert("RGB")
    image.thumbnail((420, 560))
    target = out / f"{source.stem}.jpg"
    image.save(target, quality=78, optimize=True)
    print(f"{source.name} -> {target} ({target.stat().st_size} bytes)")
