import os
import urllib.request
import sys

def download_u2net():
    dest_dir = os.path.expanduser("~/.u2net")
    os.makedirs(dest_dir, exist_ok=True)
    dest_file = os.path.join(dest_dir, "u2net.onnx")
    
    if os.path.exists(dest_file) and os.path.getsize(dest_file) > 100_000_000:
        print(f"u2net.onnx already exists at {dest_file} ({os.path.getsize(dest_file)} bytes)")
        return True
        
    url = "https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2net.onnx"
    print(f"Downloading u2net.onnx from {url} to {dest_file}...")
    
    def reporthook(blocknum, blocksize, totalsize):
        read = blocknum * blocksize
        if totalsize > 0:
            percent = min(100, read * 100 // totalsize)
            if blocknum % 1000 == 0 or percent == 100:
                print(f"Downloaded {read // (1024*1024)} MB / {totalsize // (1024*1024)} MB ({percent}%)")
                
    urllib.request.urlretrieve(url, dest_file, reporthook)
    print("Download complete! File size:", os.path.getsize(dest_file))
    return True

if __name__ == "__main__":
    download_u2net()

