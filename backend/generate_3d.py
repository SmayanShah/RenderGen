import os
import torch
import numpy as np
import cv2
import open3d as o3d
from diffusers import StableDiffusionPipeline
from transformers import DPTForDepthEstimation, DPTImageProcessor
from PIL import Image

# ✅ Define models directory
MODELS_DIR = r"C:\Users\shahs\rendergen\models"
os.makedirs(MODELS_DIR, exist_ok=True)

def generate_3d(prompt, output_filename, input_image_path=None):
    """Generates a 3D point cloud with colors and saves it with the same name as the uploaded image."""
    device = "cuda" if torch.cuda.is_available() else "cpu"
    output_file_path = os.path.join(MODELS_DIR, output_filename)

    # ✅ Step 1: Generate or Use Uploaded Image (Use only one image)
    if input_image_path and os.path.exists(input_image_path):
        print(f"📷 Using uploaded image: {input_image_path}")
        image_path = input_image_path
    else:
        print(f"🖼 Generating image from text: {prompt}")
        pipe = StableDiffusionPipeline.from_pretrained(
            "runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16 if device == "cuda" else torch.float32
        ).to(device)
        image = pipe(prompt).images[0]
        image_path = os.path.join(MODELS_DIR, f"{prompt.replace(' ', '_')}.png")
        image.save(image_path)

    # ✅ Step 2: Estimate Depth Using MiDaS
    depth_map = estimate_depth(image_path, device)

    # ✅ Step 3: Convert Depth to 3D Point Cloud
    pcd = depth_to_point_cloud(depth_map, image_path)
    o3d.io.write_point_cloud(output_file_path, pcd)

    print(f"✅ 3D Model saved at: {output_file_path}")
    return os.path.basename(output_file_path)

# ✅ Faster Depth Estimation
def estimate_depth(image_path, device):
    """Compute depth map using a single image for speed optimization."""
    model = DPTForDepthEstimation.from_pretrained("Intel/dpt-large").to(device).eval()  # ✅ Ensure evaluation mode
    processor = DPTImageProcessor.from_pretrained("Intel/dpt-large")

    img = Image.open(image_path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt").to(device)

    with torch.no_grad():
        depth = model(**inputs).predicted_depth.squeeze()
        depth = depth.cpu().numpy()  # ✅ Move to CPU after processing

    depth = (depth - depth.min()) / (depth.max() - depth.min()) * 255  # Normalize
    return depth.astype(np.uint8)

# ✅ Convert Depth Map to 3D Point Cloud with Color
def depth_to_point_cloud(depth_map, image_path, scale=1.0):
    """Convert depth map to a colored 3D point cloud."""
    h, w = depth_map.shape
    fx, fy = w * 1.0, h * 1.0
    cx, cy = w / 2, h / 2

    # Load original image
    image = cv2.imread(image_path)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # Ensure image and depth map sizes match
    if image.shape[:2] != (h, w):
        print(f"⚠️ Resizing image from {image.shape[:2]} to {h, w}")
        image = cv2.resize(image, (w, h))

    points = []
    colors = []

    for y in range(h):
        for x in range(w):
            d = depth_map[y, x] * scale
            if d > 1e-6:
                X = (x - cx) * d / fx
                Y = -(y - cy) * d / fy  # ✅ Flip Y-axis to fix upside-down issue
                Z = d

                # ✅ Get the color safely after resizing
                r, g, b = image[y, x] / 255.0  # Normalize to [0,1]
                points.append([X, Y, Z])
                colors.append([r, g, b])

    # Create Open3D point cloud with colors
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(np.array(points))
    pcd.colors = o3d.utility.Vector3dVector(np.array(colors))  # ✅ Assign colors

    return pcd
