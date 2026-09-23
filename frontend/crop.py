import os
from PIL import Image

def crop_mobile_ui(image_path):
    print(f"Processing {image_path}...")
    try:
        img = Image.open(image_path)
        width, height = img.size
        
        # Crop 12% from top (status bar + top UI)
        # Crop 15% from bottom (Safari/Chrome bottom UI)
        top_crop = int(height * 0.12)
        bottom_crop = int(height * 0.85)
        
        cropped_img = img.crop((0, top_crop, width, bottom_crop))
        cropped_img.save(image_path)
        print(f"Success! Cropped {image_path} from {height}px to {bottom_crop - top_crop}px height")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

public_dir = r"C:\gounion\New folder (4)\GoUnion-Unified\frontend\public"
images = [
    "showcase-chat.png", 
    "showcase-notifications.png", 
    "showcase-profile.png", 
    "showcase-feed.png", 
    "showcase-settings.png"
]

for img_name in images:
    img_path = os.path.join(public_dir, img_name)
    if os.path.exists(img_path):
        crop_mobile_ui(img_path)
    else:
        print(f"Not found: {img_path}")
