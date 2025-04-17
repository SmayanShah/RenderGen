# 8th Sem Project – Text/Image to 3D Point Cloud Generator

This project takes a **text prompt** or **uploaded image**, estimates its **depth**, and generates a **colored 3D point cloud** using Stable Diffusion, MiDaS, and Open3D.

---

## Features

- Generate an image using a **text prompt** via Stable Diffusion
- Or use any **uploaded image**
- Estimate depth using Intel’s **DPT (MiDaS)** model
- Convert depth + image into a **realistic 3D point cloud**
- Save the final point cloud as a `.ply` file using Open3D

---

## Tech Stack

- `diffusers` – For text-to-image generation
- `transformers` – For DPT depth estimation model
- `open3d` – For 3D point cloud generation and saving
- `torch` – Core deep learning engine
- `Pillow`, `opencv-python`, `numpy` – Image processing

---

## Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/RenderGen.git
   cd RenderGen
