import os
import sys
import glob
import json
import time
import cv2
import numpy as np
from PIL import Image
import onnxruntime as ort

def process_product_catalog():
    print("==================================================================")
    print("BINU'S AQUATIC — PROFESSIONAL PRODUCT IMAGE STANDARDIZATION")
    print("==================================================================")
    
    model_path = os.path.abspath("models/u2net.onnx")
    if not os.path.exists(model_path):
        print(f"ERROR: Model not found at {model_path}")
        sys.exit(1)
        
    print("Initializing ONNX inference session...")
    opts = ort.SessionOptions()
    opts.inter_op_num_threads = 4
    opts.intra_op_num_threads = 4
    session = ort.InferenceSession(model_path, sess_options=opts, providers=['CPUExecutionProvider'])
    input_name = session.get_inputs()[0].name
    
    backup_dir = os.path.abspath("public/products_original_backup")
    prod_dir = os.path.abspath("public/products")
    thumb_dir = os.path.abspath("public/products/thumbs")
    os.makedirs(prod_dir, exist_ok=True)
    os.makedirs(thumb_dir, exist_ok=True)
    
    with open("src/data/products.json", "r", encoding="utf-8") as f:
        products = json.load(f)
        
    non_tank = [p for p in products if p.get("category") != "Tanks" and not p.get("isTank")]
    print(f"Total non-tank products to process: {len(non_tank)}")
    
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)
    std = np.array([0.229, 0.224, 0.225], dtype=np.float32)
    
    success_count = 0
    start_time = time.time()
    
    for i, p in enumerate(non_tank):
        base_name = os.path.basename(p["image"].lstrip("/"))
        backup_file = os.path.join(backup_dir, base_name)
        target_file = os.path.join(prod_dir, base_name)
        target_thumb = os.path.join(thumb_dir, base_name)
        
        if not os.path.exists(backup_file):
            print(f"[{i+1}/{len(non_tank)}] ERROR: Missing backup for {base_name}")
            continue
            
        im = Image.open(backup_file).convert("RGB")
        w, h = im.size
        orig_arr = np.array(im)
        orig_bgr = cv2.cvtColor(orig_arr, cv2.COLOR_RGB2BGR)
        
        # 1. Saliency via U2Net
        res = im.resize((320, 320), Image.Resampling.BILINEAR)
        tensor_arr = (np.array(res).astype(np.float32) / 255.0 - mean) / std
        tensor = np.expand_dims(np.transpose(tensor_arr, (2, 0, 1)), axis=0)
        pred = session.run(None, {input_name: tensor})[0][0][0]
        ma, mi = np.max(pred), np.min(pred)
        pred = (pred - mi) / (ma - mi) if ma > mi else np.zeros_like(pred)
        u2 = np.array(Image.fromarray((pred * 255).astype(np.uint8)).resize((w, h), Image.Resampling.BILINEAR))
        
        # 2. Check if original photo was taken on turf grass ground
        bl_bgr = orig_bgr[-30:, :30].mean(axis=(0,1))
        br_bgr = orig_bgr[-30:, -30:].mean(axis=(0,1))
        is_grass_ground = (bl_bgr[1] > bl_bgr[2] + 12 and bl_bgr[1] > bl_bgr[0] + 12) or \
                          (br_bgr[1] > br_bgr[2] + 12 and br_bgr[1] > br_bgr[0] + 12)
                          
        fg_mask = (u2 > 100).astype(np.uint8)
        
        if is_grass_ground:
            # Detect ground grass connected strictly to the bottom of the photo
            b_ch, g_ch, r_ch = orig_bgr[:, :, 0].astype(int), orig_bgr[:, :, 1].astype(int), orig_bgr[:, :, 2].astype(int)
            hsv = cv2.cvtColor(orig_bgr, cv2.COLOR_BGR2HSV)
            grass_color = ((g_ch > r_ch + 12) & (g_ch > b_ch + 12) & (g_ch > 30)) | \
                          (cv2.inRange(hsv, np.array([25, 30, 20]), np.array([85, 255, 255])) > 0)
            
            num_lbls, lbls, sts, _ = cv2.connectedComponentsWithStats(grass_color.astype(np.uint8))
            ground_grass = np.zeros_like(fg_mask)
            for lbl in range(1, num_lbls):
                top = sts[lbl, cv2.CC_STAT_TOP]
                height = sts[lbl, cv2.CC_STAT_HEIGHT]
                # Ground grass MUST touch the bottom edge of the photo
                if top + height >= h - 10:
                    ground_grass[lbls == lbl] = 1
            
            # Remove ground grass from foreground mask
            fg_mask[ground_grass > 0] = 0
            
        # 3. Morphological close to bridge any gaps and preserve complete product
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
        fg_closed = cv2.morphologyEx(fg_mask, cv2.MORPH_CLOSE, kernel)
        
        # 4. Fill internal holes (ensuring all labels, logos, and printed text are solid)
        contours, _ = cv2.findContours(fg_closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        filled_mask = np.zeros_like(fg_mask)
        cv2.drawContours(filled_mask, contours, -1, 1, thickness=cv2.FILLED)
        
        # 5. Clean small detached noise while keeping all genuine product parts
        num_lbls, lbls, sts, _ = cv2.connectedComponentsWithStats(filled_mask)
        if num_lbls > 1:
            areas = sts[1:, cv2.CC_STAT_AREA]
            max_area = np.max(areas)
            keep = [idx for idx in range(1, num_lbls) if sts[idx, cv2.CC_STAT_AREA] >= max_area * 0.04]
            clean_mask = np.isin(lbls, keep).astype(np.uint8)
        else:
            clean_mask = filled_mask
            
        # 6. Additional grass fringe cleanup at the product base for grass photos
        if is_grass_ground:
            # In the bottom 15 rows of the segmented product, eliminate any stray green fringe
            ys, xs = np.where(clean_mask > 0)
            if len(ys) > 0:
                base_y = ys.max()
                b_ch, g_ch, r_ch = orig_bgr[:, :, 0].astype(int), orig_bgr[:, :, 1].astype(int), orig_bgr[:, :, 2].astype(int)
                fringe_green = (g_ch > r_ch + 14) & (g_ch > b_ch + 14)
                bottom_fringe = fringe_green & (clean_mask > 0) & (np.arange(h)[:, None] >= base_y - 12)
                clean_mask[bottom_fringe] = 0
                
        # 7. Sizing & Centering on 800x800 Pure White Canvas
        ys, xs = np.where(clean_mask > 0)
        if len(ys) == 0:
            print(f"[{i+1}/{len(non_tank)}] WARNING: Empty mask for {base_name}. Using U2 fallback.")
            clean_mask = (u2 > 80).astype(np.uint8)
            ys, xs = np.where(clean_mask > 0)
            
        min_y, max_y = ys.min(), ys.max()
        min_x, max_x = xs.min(), xs.max()
        pw = max_x - min_x + 1
        ph = max_y - min_y + 1
        
        # Anti-aliasing alpha channel
        alpha = cv2.GaussianBlur(clean_mask.astype(np.float32), (3, 3), 0)
        alpha = np.clip(alpha, 0.0, 1.0)
        
        crop_rgb = orig_arr[min_y:max_y+1, min_x:max_x+1]
        crop_alpha = (alpha[min_y:max_y+1, min_x:max_x+1] * 255).astype(np.uint8)
        crop_rgba = np.dstack([crop_rgb, crop_alpha])
        crop_pil = Image.fromarray(crop_rgba)
        
        # Standardized balanced bounding box inside 800x800
        canvas_size = 800
        target_dim = 670 # leaves ~65px padding around bounding box
        scale = min(target_dim / pw, target_dim / ph)
        nw = max(1, int(pw * scale))
        nh = max(1, int(ph * scale))
        
        resized_crop = crop_pil.resize((nw, nh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 255))
        ox = (canvas_size - nw) // 2
        oy = (canvas_size - nh) // 2
        canvas.paste(resized_crop, (ox, oy), resized_crop)
        canvas.convert("RGB").save(target_file, "WEBP", quality=95)
        
        # 8. Standardized 400x400 Thumbnail
        thumb_size = 400
        thumb_target = 335
        thumb_scale = min(thumb_target / pw, thumb_target / ph)
        tnw = max(1, int(pw * thumb_scale))
        tnh = max(1, int(ph * thumb_scale))
        
        thumb_resized = crop_pil.resize((tnw, tnh), Image.Resampling.LANCZOS)
        thumb_canvas = Image.new("RGBA", (thumb_size, thumb_size), (255, 255, 255, 255))
        tox = (thumb_size - tnw) // 2
        toy = (thumb_size - tnh) // 2
        thumb_canvas.paste(thumb_resized, (tox, toy), thumb_resized)
        thumb_canvas.convert("RGB").save(target_thumb, "WEBP", quality=90)
        
        success_count += 1
        if (i + 1) % 25 == 0 or (i + 1) == len(non_tank):
            elapsed = time.time() - start_time
            print(f"[{i+1}/{len(non_tank)}] {base_name[:32]:32} -> {nw}x{nh} on 800x800 ({elapsed:.1f}s)")
            
    total_time = time.time() - start_time
    print("=" * 66)
    print(f"SUCCESS: Standardized all {success_count} non-tank product images in {total_time:.1f}s")
    print("=" * 66)

if __name__ == "__main__":
    process_product_catalog()

