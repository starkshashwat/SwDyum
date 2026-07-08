import glob
import os
from PIL import Image

def optimize_images():
    image_paths = glob.glob('public/*.png') + glob.glob('public/*.jpg') + glob.glob('public/*.jpeg')
    mappings = {}

    # Convert images
    for path in image_paths:
        try:
            with Image.open(path) as img:
                filename = os.path.basename(path)
                name, ext = os.path.splitext(filename)
                
                # Some svgs might have been caught if we used general wildcard, but we didn't
                new_filename = name + '.webp'
                new_path = os.path.join('public', new_filename)
                
                # Convert to webp
                img.save(new_path, 'webp', quality=80)
                
                mappings[filename] = new_filename
                
                # Delete original
                os.remove(path)
                print(f"Converted {filename} -> {new_filename}")
        except Exception as e:
            print(f"Failed to convert {path}: {e}")

    # Update references in code
    code_files = glob.glob('src/**/*.jsx', recursive=True) + glob.glob('src/**/*.css', recursive=True) + ['index.html'] + ['src/components/cart/CartDrawer.jsx']
    
    # ensure we got everything
    all_js = glob.glob('src/**/*.js', recursive=True)
    all_jsx = glob.glob('src/**/*.jsx', recursive=True)
    all_css = glob.glob('src/**/*.css', recursive=True)
    code_files = list(set(code_files + all_js + all_jsx + all_css))
    
    for file_path in code_files:
        if not os.path.exists(file_path):
            continue
            
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        new_content = content
        for old_name, new_name in mappings.items():
            new_content = new_content.replace(old_name, new_name)
            
        if new_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated references in {file_path}")

if __name__ == "__main__":
    optimize_images()
