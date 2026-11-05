import os
import sys
import json
import shutil
import cv2
import numpy as np
from PIL import Image
import onnxruntime as ort
import time

def process_all_images(limit=None):
    print("==================================================================")
    print("BINU'S AQUATIC — SAFE PURE WHITE BACKGROUND REFINEMENT")
    print("==================================================================")
    
    model_path = os.path.abspath("models/u2net.onnx")
    if not os.path.exists(model_path):
        print("ERROR: U2Net model not found at", model_path)
        return
        
    print(f"Loading ONNX model from {model_path}...")
    opts = ort.SessionOptions()
    opts.inter_op_num_threads = 4
    opts.intra_op_num_threads = 4
    session = ort.InferenceSession(model_path, sess_options=opts, providers=['CPUExecutionProvider'])
    input_name = session.get_inputs()[0].name
    print("Model loaded successfully!")
    
    with open("src/data/products.json", "r", encoding="utf-8") as f:
        products = json.load(f)
        
    non_tank = [p for p in products if p.get("category") != "Tanks" and not p.get("isTank")]
    print(f"Total non-tank products to process: {len(non_tank)}")
    
    if limit:
        non_tank = non_tank[:limit]
        print(f"Processing first {limit} products...")
        
    backup_dir = os.path.abspath("public/products_original_backup")
    prod_dir = os.path.abspath("public/products")
    thumb_dir = os.path.abspath("public/products/thumbs")
    
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    
    success_count = 0
    retained_original_count = 0
    errors_count = 0
    start_time = time.time()
    
    for i, p in enumerate(non_tank):
        base_name = os.path.basename(p["image"].lstrip("/"))
        backup_file = os.path.join(backup_dir, base_name)
        target_file = os.path.join(prod_dir, base_name)
        target_thumb = os.path.join(thumb_dir, base_name)
        
        if not os.path.exists(backup_file):
            print(f"[{i+1}/{len(non_tank)}] ERROR: Backup file missing for {base_name}")
            errors_count += 1
            continue
            
        try:
            im = Image.open(backup_file).convert("RGB")
            orig_w, orig_h = im.size
            orig_bgr = cv2.cvtColor(np.array(im), cv2.COLOR_RGB2BGR)
            
            # 1. U2Net inference for preliminary saliency map
            resized = im.resize((320, 320), Image.Resampling.BILINEAR)
            arr = (np.array(resized).astype(np.float32) / 255.0 - mean) / std
            tensor = np.expand_dims(np.transpose(arr, (2, 0, 1)), axis=0)
            pred = session.run(None, {input_name: tensor})[0][0][0]
            ma, mi = np.max(pred), np.min(pred)
            pred = (pred - mi) / (ma - mi) if ma > mi else np.zeros_like(pred)
            u2_mask = np.array(Image.fromarray((pred * 255).astype(np.uint8)).resize((orig_w, orig_h), Image.Resampling.BILINEAR))
            
            # 2. Ground grass detection in original photo
            hsv = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2HSV)
            grass_mask = cv2.inRange(hsv, np.array([20, 25, 20]), np.array([90, 255, 255]))
            b_ch, g_ch, r_ch = orig_bgr[:, :, 0].astype(int), orig_bgr[:, :, 1].astype(int), orig_bgr[:, :, 2].astype(int)
            grass_rgb = (g_ch > r_ch + 6) & (g_ch > b_ch + 6) & (g_ch > 30)
            combined_grass = (grass_mask > 0) | grass_rgb
            
            num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(combined_grass.astype(np.uint8))
            ground_grass = np.zeros_like(u2_mask)
            for lbl in range(1, num_labels):
                top = stats[lbl, cv2.CC_STAT_TOP]
                height = stats[lbl, cv2.CC_STAT_HEIGHT]
                if top + height >= orig_h - 15 or top >= int(orig_h * 0.75):
                    ground_grass[labels == lbl] = 255
                    
            dilated_grass = cv2.dilate(ground_grass, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5)), iterations=1)
            
            # 3. Build GrabCut mask at full native resolution
            gc_mask = np.full((orig_h, orig_w), cv2.GC_PR_BGD, dtype=np.uint8)
            gc_mask[(u2_mask > 70) & (dilated_grass == 0)] = cv2.GC_PR_FGD
            
            # Certain background boundaries
            gc_mask[:8, :] = cv2.GC_BGD
            gc_mask[-8:, :] = cv2.GC_BGD
            gc_mask[:, :8] = cv2.GC_BGD
            gc_mask[:, -8:] = cv2.GC_BGD
            gc_mask[dilated_grass > 0] = cv2.GC_BGD
            gc_mask[u2_mask < 15] = cv2.GC_BGD
            
            # Certain foreground core
            core_fg = cv2.erode((u2_mask > 200).astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (21, 21)))
            gc_mask[(core_fg > 0) & (dilated_grass == 0)] = cv2.GC_FGD
            
            # 4. Run GrabCut
            bgd_model = np.zeros((1, 65), np.float64)
            fgd_model = np.zeros((1, 65), np.float64)
            cv2.grabCut(orig_bgr, gc_mask, None, bgd_model, fgd_model, 2, cv2.GC_INIT_WITH_MASK)
            
            final_fg = np.where((gc_mask == cv2.GC_FGD) | (gc_mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)
            num_lbls, lbls, sts, _ = cv2.connectedComponentsWithStats(final_fg)
            if num_lbls > 1:
                areas = sts[1:, cv2.CC_STAT_AREA]
                largest_lbl = np.argmax(areas) + 1
                final_fg = np.where(lbls == largest_lbl, 255, 0).astype(np.uint8)
                
            y_idx, x_idx = np.where(final_fg > 0)
            
            # Safety check: Area between 2% and 88% of total photo
            fg_area = np.sum(final_fg > 0)
            total_px = orig_w * orig_h
            area_ratio = fg_area / total_px
            
            if len(y_idx) == 0 or len(x_idx) == 0 or area_ratio < 0.02 or area_ratio > 0.88:
                # Retain original photo safely
                print(f"[{i+1}/{len(non_tank)}] NOTICE: Safety threshold triggered for {base_name} (area {area_ratio*100:.1f}%). Retaining original.")
                shutil.copy2(backup_file, target_file)
                # Generate uncropped thumbnail
                scale = min(480 / orig_w, 480 / orig_h)
                nw, nh = max(1, int(orig_w * scale)), max(1, int(orig_h * scale))
                thumb = im.resize((nw, nh), Image.Resampling.LANCZOS)
                thumb.save(target_thumb, "WEBP", quality=90)
                retained_original_count += 1
                continue
                
            min_y, max_y = np.min(y_idx), np.max(y_idx)
            min_x, max_x = np.min(x_idx), np.max(x_idx)
            pw = max_x - min_x + 1
            ph = max_y - min_y + 1
            
            # Anti-aliased alpha boundary
            alpha = cv2.GaussianBlur(final_fg.astype(np.float32), (3, 3), 0)
            alpha = np.clip(alpha, 0.0, 1.0)
            
            # Extract cropped RGBA using authentic original pixels
            crop_rgb = np.array(im)[min_y:max_y+1, min_x:max_x+1]
            crop_alpha = (alpha[min_y:max_y+1, min_x:max_x+1] * 255).astype(np.uint8)
            crop_rgba = np.dstack([crop_rgb, crop_alpha])
            crop_pil = Image.fromarray(crop_rgba)
            
            # 5. Composite on 800x800 Pure White Canvas (#FFFFFF)
            canvas_size = 800
            margin = 50
            target_max = canvas_size - 2 * margin # 700px
            scale = min(target_max / pw, target_max / ph, 1.0) # NEVER upscale past 1.0
            nw = int(pw * scale)
            nh = int(ph * scale)
            
            if scale < 1.0:
                resized_crop = crop_pil.resize((nw, nh), Image.Resampling.LANCZOS)
            else:
                resized_crop = crop_pil
                nw, nh = pw, ph
                
            canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
            ox = (canvas_size - nw) // 2
            oy = (canvas_size - nh) // 2
            canvas.paste(resized_crop, (ox, oy), resized_crop)
            canvas.convert("RGB").save(target_file, "WEBP", quality=94)
            
            # 6. Generate 400x400 Pure White Thumbnail
            thumb_size = 400
            thumb_margin = 25
            thumb_target = thumb_size - 2 * thumb_margin # 350px
            thumb_scale = min(thumb_target / pw, thumb_target / ph, 1.0)
            tnw = int(pw * thumb_scale)
            tnh = int(ph * thumb_scale)
            
            thumb_resized = crop_pil.resize((tnw, tnh), Image.Resampling.LANCZOS)
            thumb_canvas = Image.new("RGBA", (thumb_size, thumb_size), (255, 255, 255, 255))
            thumb_ox = (thumb_size - tnw) // 2
            thumb_oy = (thumb_size - tnh) // 2
            thumb_canvas.paste(thumb_resized, (thumb_ox, thumb_oy), thumb_resized)
            thumb_canvas.convert("RGB").save(target_thumb, "WEBP", quality=88)
            
            success_count += 1
            if (i + 1) % 20 == 0 or (i + 1) == len(non_tank):
                elapsed = time.time() - start_time
                print(f"Progress: [{i+1}/{len(non_tank)}] refined in {elapsed:.1f}s (Success: {success_count}, Retained Original: {retained_original_count})...")
                
        except Exception as e:
            print(f"[{i+1}/{len(non_tank)}] ERROR on {base_name}: {e}. Retaining original.")
            shutil.copy2(backup_file, target_file)
            retained_original_count += 1
            
    total_time = time.time() - start_time
    print("=" * 66)
    print(f"PROCESSING COMPLETE in {total_time:.1f}s")
    print(f"Cleaned & Standardized: {success_count}")
    print(f"Retained Original (Safety Fallback): {retained_original_count}")
    print(f"Errors: {errors_count}")
    print("=" * 66)

if __name__ == "__main__":
    limit_arg = int(sys.argv[1]) if len(sys.argv) > 1 else None
    process_all_images(limit_arg)

