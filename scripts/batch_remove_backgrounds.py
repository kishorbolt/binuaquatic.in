import os
import sys
import json
import shutil
import cv2
import numpy as np
from PIL import Image
import onnxruntime as ort
import time

def process_batch(limit=None):
    model_path = os.path.abspath("models/u2net.onnx")
    if not os.path.exists(model_path):
        print("ERROR: Model not found at", model_path)
        return
        
    print(f"Loading ONNX model from {model_path}...")
    opts = ort.SessionOptions()
    opts.inter_op_num_threads = 4
    opts.intra_op_num_threads = 4
    session = ort.InferenceSession(model_path, sess_options=opts, providers=['CPUExecutionProvider'])
    input_name = session.get_inputs()[0].name
    print("Model loaded successfully!")
    
    # Load products.json
    with open("src/data/products.json", "r", encoding="utf-8") as f:
        products = json.load(f)
        
    # Filter non-tank products
    non_tank_products = [p for p in products if p.get("category") != "Tanks" and not p.get("isTank")]
    print(f"Total non-tank products to process: {len(non_tank_products)}")
    
    if limit:
        non_tank_products = non_tank_products[:limit]
        print(f"Testing on first {limit} products...")
        
    backup_dir = os.path.abspath("public/products_original_backup")
    if not os.path.exists(backup_dir):
        print("ERROR: Backup directory not found at", backup_dir)
        return

    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    
    processed_count = 0
    failed_count = 0
    grass_cleaned_count = 0
    start_time = time.time()
    
    for i, p in enumerate(non_tank_products):
        img_rel = p["image"].lstrip("/")
        thumb_rel = p["thumbnail"].lstrip("/")
        
        base_name = os.path.basename(img_rel)
        backup_src = os.path.join(backup_dir, base_name)
        
        if not os.path.exists(backup_src):
            print(f"[{i+1}/{len(non_tank_products)}] Backup file missing: {backup_src}")
            failed_count += 1
            continue
            
        target_full = os.path.abspath(os.path.join("public", img_rel))
        target_thumb = os.path.abspath(os.path.join("public", thumb_rel))
        
        try:
            # 1. Load pristine original from backup
            orig_img = Image.open(backup_src).convert("RGB")
            orig_w, orig_h = orig_img.size
            orig_arr = np.array(orig_img)
            
            # 2. Resize to 320x320 and normalize for U2Net
            resized = orig_img.resize((320, 320), Image.Resampling.BILINEAR)
            arr = (np.array(resized).astype(np.float32) / 255.0 - mean) / std
            tensor = np.expand_dims(np.transpose(arr, (2, 0, 1)), axis=0)
            
            # 3. Run U2Net inference
            outputs = session.run(None, {input_name: tensor})
            pred = outputs[0][0][0]
            ma, mi = np.max(pred), np.min(pred)
            if ma > mi:
                pred = (pred - mi) / (ma - mi)
            else:
                pred = np.zeros_like(pred)
                
            mask_320 = (pred * 255).astype(np.uint8)
            mask_orig = Image.fromarray(mask_320, mode='L').resize((orig_w, orig_h), Image.Resampling.BILINEAR)
            u2_mask = np.array(mask_orig)
            
            # 4. Ground grass & artifact detection in original photo
            # Convert original image to HSV
            hsv = cv2.cvtColor(orig_arr, cv2.COLOR_RGB2HSV)
            # Grass green in HSV: H in [20, 90], S >= 25, V >= 20
            grass_hsv = cv2.inRange(hsv, np.array([20, 25, 20]), np.array([90, 255, 255]))
            
            # Also check RGB green dominance (grass in shade or bright light)
            r = orig_arr[:, :, 0].astype(int)
            g = orig_arr[:, :, 1].astype(int)
            b = orig_arr[:, :, 2].astype(int)
            grass_rgb = (g > r + 6) & (g > b + 6) & (g > 30)
            combined_grass = (grass_hsv > 0) | grass_rgb
            
            # Find connected grass components touching bottom edge or in the bottom 25% ground region
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(combined_grass.astype(np.uint8))
            ground_grass = np.zeros_like(u2_mask)
            
            for lbl in range(1, num_labels):
                top = stats[lbl, cv2.CC_STAT_TOP]
                height = stats[lbl, cv2.CC_STAT_HEIGHT]
                # If component touches bottom border or is in bottom 25% ground area
                if top + height >= orig_h - 15 or top >= int(orig_h * 0.75):
                    ground_grass[labels == lbl] = 255
                    
            # Dilate ground grass slightly (3px) to catch blade tips and fringing
            kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
            dilated_grass = cv2.dilate(ground_grass, kernel, iterations=1)
            
            # Subtract ground grass from U2Net foreground mask
            grass_overlap = np.sum((u2_mask > 35) & (dilated_grass > 0))
            if grass_overlap > 100:
                grass_cleaned_count += 1
                
            clean_mask = np.where(dilated_grass > 0, 0, u2_mask)
            
            # Threshold to get solid product core
            clean_bin = clean_mask > 80
            
            # Select largest connected component (the actual product packaging)
            num_lbls, lbls, sts, _ = cv2.connectedComponentsWithStats(clean_bin.astype(np.uint8))
            if num_lbls > 1:
                areas = sts[1:, cv2.CC_STAT_AREA]
                largest_lbl = np.argmax(areas) + 1
                final_bin = (lbls == largest_lbl).astype(np.uint8)
            else:
                final_bin = clean_bin.astype(np.uint8)
                
            y_indices, x_indices = np.where(final_bin > 0)
            if len(y_indices) == 0 or len(x_indices) == 0:
                # Fallback to general mask if threshold was too strict
                y_indices, x_indices = np.where(u2_mask > 35)
                if len(y_indices) == 0:
                    print(f"[{i+1}/{len(non_tank_products)}] WARNING: Foreground not detected for {p['name']}, retaining backup.")
                    failed_count += 1
                    continue
                final_bin = (u2_mask > 35).astype(np.uint8)
                
            min_y, max_y = np.min(y_indices), np.max(y_indices)
            min_x, max_x = np.min(x_indices), np.max(x_indices)
            
            prod_w = max_x - min_x + 1
            prod_h = max_y - min_y + 1
            
            # Anti-aliased alpha boundary
            blurred_mask = cv2.GaussianBlur(final_bin.astype(np.float32) * 255.0, (5, 5), 0)
            alpha_matte = np.minimum(u2_mask, blurred_mask.astype(np.uint8))
            
            # 5. Extract foreground with alpha channel
            rgba = orig_img.convert("RGBA")
            rgba.putalpha(Image.fromarray(alpha_matte, mode='L'))
            prod_crop = rgba.crop((min_x, min_y, max_x + 1, max_y + 1))
            
            # 6. Generate 800x800 Pure White Canvas (#FFFFFF)
            canvas_size = 800
            margin = 60
            target_max = canvas_size - 2 * margin
            scale = min(target_max / prod_w, target_max / prod_h)
            nw = max(1, int(prod_w * scale))
            nh = max(1, int(prod_h * scale))
            
            resized_prod = prod_crop.resize((nw, nh), Image.Resampling.LANCZOS)
            
            canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
            offset_x = (canvas_size - nw) // 2
            offset_y = (canvas_size - nh) // 2
            canvas.paste(resized_prod, (offset_x, offset_y), resized_prod)
            
            # Save 800x800 Full WebP
            final_full = canvas.convert("RGB")
            final_full.save(target_full, "WEBP", quality=92)
            
            # 7. Generate 400x400 Pure White Thumbnail
            thumb_size = 400
            thumb_margin = 30
            thumb_target = thumb_size - 2 * thumb_margin
            thumb_scale = min(thumb_target / prod_w, thumb_target / prod_h)
            tnw = max(1, int(prod_w * thumb_scale))
            tnh = max(1, int(prod_h * thumb_scale))
            
            thumb_resized = prod_crop.resize((tnw, tnh), Image.Resampling.LANCZOS)
            thumb_canvas = Image.new("RGBA", (thumb_size, thumb_size), (255, 255, 255, 255))
            thumb_ox = (thumb_size - tnw) // 2
            thumb_oy = (thumb_size - tnh) // 2
            thumb_canvas.paste(thumb_resized, (thumb_ox, thumb_oy), thumb_resized)
            
            # Save 400x400 Thumbnail WebP
            final_thumb = thumb_canvas.convert("RGB")
            final_thumb.save(target_thumb, "WEBP", quality=88)
            
            processed_count += 1
            if (i + 1) % 20 == 0 or (i + 1) == len(non_tank_products):
                elapsed = time.time() - start_time
                print(f"Progress: [{i+1}/{len(non_tank_products)}] processed in {elapsed:.1f}s (Grass Cleaned: {grass_cleaned_count})...")
                
        except Exception as e:
            print(f"[{i+1}/{len(non_tank_products)}] ERROR processing {p['name']}: {str(e)}")
            failed_count += 1
            
    total_elapsed = time.time() - start_time
    print("=" * 60)
    print(f"BATCH PROCESSING COMPLETE in {total_elapsed:.1f}s")
    print(f"Total Processed: {processed_count}")
    print(f"Grass Cleaned: {grass_cleaned_count}")
    print(f"Failed / Skipped: {failed_count}")
    print("=" * 60)

if __name__ == "__main__":
    limit_arg = int(sys.argv[1]) if len(sys.argv) > 1 else None
    process_batch(limit_arg)
