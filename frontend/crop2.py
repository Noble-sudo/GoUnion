import os
from PIL import Image

def perfect_crop(image_path):
    print(f"Processing {image_path}...")
    try:
        img = Image.open(image_path).convert("RGB")
        width, height = img.size
        
        # We know the original is 561x1024
        # We need to find the phone mockup inside this!
        # The background of the desktop view is #020202 (almost black)
        # The phone mockup has a bezel (zinc-800) and the screen inside.
        
        # Let's crop it simply first based on percentages
        # But wait, the user's NEW images might just be mobile screenshots directly!
        # Let's check the corners of the new images to see if they are desktop screenshots.
        r, g, b = img.getpixel((0, 0))
        is_desktop_screenshot = max(r, g, b) < 15
        
        if is_desktop_screenshot:
            # It's a screenshot of the landing page itself!
            print("Detected landing page screenshot. Attempting to extract the inner phone screen.")
            
            # Since the user took a screenshot of the landing page, the phone is in the middle.
            # Let's just crop the center with the exact aspect ratio of the phone screen.
            # The phone frame in the landing page has a specific size.
            
            # To be safe, let's just crop out the Safari URL bar from the top and bottom if it's there.
            # Wait, if they are screenshots of the landing page, the "localhost" is INSIDE the landing page's image!
            # Which means it's a screenshot of a screenshot!
            
            # Let's just crop the top 12% and bottom 15% like before, but ALSO crop the left/right 
            # to maintain the 0.482 aspect ratio so `object-cover` doesn't cut the sides!
            pass
            
        # Instead of guessing, let's crop the top and bottom browser chrome.
        # Top 12%, Bottom 15%
        top_crop = int(height * 0.12)
        bottom_crop = int(height * 0.85)
        new_height = bottom_crop - top_crop
        
        # We want the final aspect ratio to be exactly 280/580 = 0.4827
        target_width = int(new_height * (280/580))
        
        # Crop the sides to match the target width perfectly
        side_crop = (width - target_width) // 2
        left_crop = side_crop
        right_crop = width - side_crop
        
        # If the image is narrower than target_width, we can't crop sides, we just use full width
        if target_width > width:
            left_crop = 0
            right_crop = width
            
        cropped_img = img.crop((left_crop, top_crop, right_crop, bottom_crop))
        cropped_img.save(image_path)
        print(f"Success! Cropped {image_path} to {right_crop-left_crop}x{bottom_crop-top_crop}")
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
        perfect_crop(img_path)
