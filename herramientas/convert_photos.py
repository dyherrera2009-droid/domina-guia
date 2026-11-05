# Convierte las 3 fotos originales (3000x2000) a WebP de 800 y 1600 px, cada una <= 200 KB.
import sys, os
from PIL import Image, ImageOps

src_dir, out_dir = sys.argv[1], sys.argv[2]
os.makedirs(out_dir, exist_ok=True)
FOTOS = {"portada-mullins.jpg": "portada", "opcion-multiple-nguyen.jpg": "opcion-multiple", "desayuno-lark.jpg": "desayuno"}
LIMIT = 200 * 1024
for src, name in FOTOS.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(src_dir, src))).convert("RGB")
    print(src, im.size)
    for w in (800, 1600):
        h = round(im.height * w / im.width)
        small = im.resize((w, h), Image.LANCZOS)
        path = os.path.join(out_dir, f"{name}-{w}.webp")
        for q in (80, 75, 70, 65, 60, 55, 50):
            small.save(path, "WEBP", quality=q, method=6)
            if os.path.getsize(path) <= LIMIT:
                break
        print(f"  {name}-{w}.webp {w}x{h} q={q} {os.path.getsize(path) // 1024} KB")
