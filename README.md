# RenderGen

RenderGen is a simple 3D generation backend using Stable Diffusion, Depth Estimation, and Open3D.

## Features
- Upload or generate an image
- Estimate depth maps
- Generate 3D point clouds
- View or download results

## Tech Stack
- Python 3.11
- Flask
- Diffusers (Stable Diffusion)
- Open3D
- HuggingFace Hub

## Setup Instructions

1. Clone the repository
2. Install requirements:

    ```bash
    pip install -r requirements.txt
    ```

3. Run the backend:

    ```bash
    python backend/app.py
    ```

---

✅ That's it! Super clean!

---

# 🛠 3. `.gitkeep` (optional)

- Create an **empty** file called `.gitkeep` inside folders **if any folder is empty** (for example if you had an empty `static/` or `uploads/` folder)
- In your case **no need** right now since `backend/` has real `.py` files.

✅ **Skip for now.**

---

# 🧹 Final File Structure before Upload

```plaintext
rendergen/
│
├── backend/
│   ├── app.py
│   ├── generate_3d.py
│   └── utils.py (or any helper files you have)
│
├── requirements.txt
├── README.md
├── .gitignore
