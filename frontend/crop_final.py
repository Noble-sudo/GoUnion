import os
from PIL import Image

def process_image(image_path):
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    # Original: 861x1024
    
    # Remove desktop browser chrome + sidebar + right floating tools
    left = 60
    top = 55  
    right = 730
    # Cut off more from the bottom - the localhost bar + nav arrows + home indicator
    # are inside the phone. Need to go higher.
    # From looking at the image, the app's bottom nav (PULSE, KONNECT, etc) 
    # ends at roughly y=810 from original. Below that is Safari UI.
    # So crop at y=810
    bottom = 810
    
    cropped = img.crop((left, top, right, bottom))
    cw, ch = cropped.size
    
    # Clean up background to pure black
    pixels = cropped.load()
    for y in range(ch):
        for x in range(cw):
            r, g, b = pixels[x, y]
            if r < 25 and g < 30 and b < 28:
                pixels[x, y] = (2, 2, 2)
    
    cropped.save(image_path, optimize=True)
    print(f"  {os.path.basename(image_path)}: {width}x{height} -> {cw}x{ch}")

public_dir = r"C:\gounion\New folder (4)\GoUnion-Unified\frontend\public"
for name in ["showcase-chat.png", "showcase-notifications.png", "showcase-profile.png", "showcase-feed.png", "showcase-settings.png"]:
    process_image(os.path.join(public_dir, name))
