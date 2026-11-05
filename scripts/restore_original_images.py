import os
import shutil
from PIL import Image
import json

def restore_images():
    print("==================================================================")
    print("BINU'S AQUATIC — SAFE RESTORATION OF ORIGINAL HIGH-QUALITY IMAGES")
    print("==================================================================")
    
    with open("src/data/products.json", "r", encoding="utf-8") as f:
        products = json.load(f)
        
    non_tank = [p for p in products if p.get("category") != "Tanks" and not p.get("isTank")]
    print(f"Total non-tank products to restore: {len(non_tank)}")
    
    backup_dir = os.path.abspath("public/products_original_backup")
    prod_dir = os.path.abspath("public/products")
    thumb_dir = os.path.abspath("public/products/thumbs")
    
    restored_count = 0
    errors = 0
    
    for i, p in enumerate(non_tank):
        base_name = os.path.basename(p["image"].lstrip("/"))
        backup_file = os.path.join(backup_dir, base_name)
        target_file = os.path.join(prod_dir, base_name)
        target_thumb = os.path.join(thumb_dir, base_name)
        
        if not os.path.exists(backup_file):
            print(f"[{i+1}/{len(non_tank)}] ERROR: Backup missing for {base_name}")
            errors += 1
            continue
            
        try:
            # 1. Restore pristine full original photo
            shutil.copy2(backup_file, target_file)
            
            # 2. Generate sharp, uncropped thumbnail with fit: 'inside'
            im = Image.open(backup_file)
            w, h = im.size
            scale = min(480 / w, 480 / h)
            nw, nh = max(1, int(w * scale)), max(1, int(h * scale))
            thumb = im.resize((nw, nh), Image.Resampling.LANCZOS)
            thumb.save(target_thumb, "WEBP", quality=90)
            
            restored_count += 1
            if (i + 1) % 25 == 0 or (i + 1) == len(non_tank):
                print(f"Progress: [{i+1}/{len(non_tank)}] restored ({base_name}: {w}x{h})...")
                
        except Exception as e:
            print(f"[{i+1}/{len(non_tank)}] ERROR on {base_name}: {e}")
            errors += 1
            
    print("=" * 66)
    print(f"RESTORATION COMPLETE: {restored_count} restored, {errors} errors.")
    print("=" * 66)

if __name__ == "__main__":
    restore_images()

