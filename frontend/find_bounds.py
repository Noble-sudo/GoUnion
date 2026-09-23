import os
from PIL import Image

def find_phone_bounds(image_path):
    img = Image.open(image_path).convert("RGB")
    width, height = img.size
    
    # We want to find the bright phone screen in the middle of a dark background
    # Let's just scan the middle row to find the left and right edges
    middle_y = height // 2
    
    left_edge = 0
    right_edge = width - 1
    
    # Threshold for "dark background" vs "phone screen"
    threshold = 30
    
    # Find left edge
    for x in range(width // 2):
        r, g, b = img.getpixel((x, middle_y))
        if max(r, g, b) > threshold:
            left_edge = x
            break
            
    # Find right edge
    for x in range(width - 1, width // 2, -1):
        r, g, b = img.getpixel((x, middle_y))
        if max(r, g, b) > threshold:
            right_edge = x
            break
            
    return left_edge, right_edge

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
    try:
        left, right = find_phone_bounds(img_path)
        print(f"{img_name}: left={left}, right={right}, width={right-left}")
    except Exception as e:
        print(f"Error: {e}")
