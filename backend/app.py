import os
from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
from generate_3d import generate_3d

# ✅ Define models directory
MODELS_DIR = r"C:\Users\shahs\rendergen\models"
os.makedirs(MODELS_DIR, exist_ok=True)

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.form.get("prompt", "").strip()
    image_file = request.files.get("image")

    if not prompt and not image_file:
        return jsonify({"error": "No prompt or image provided"}), 400

    output_filename = f"{os.path.splitext(image_file.filename)[0]}.ply" if image_file else f"{prompt.replace(' ', '_')}.ply"
    image_path = os.path.join(MODELS_DIR, output_filename.replace(".ply", ".png")) if image_file else None

    if image_file:
        image_file.save(image_path)

    model_filename = generate_3d(prompt, output_filename, image_path)

    if model_filename:
        return jsonify({"message": "3D model generated!", "file": model_filename})
    else:
        return jsonify({"error": "Failed to generate model"}), 500

@app.route("/download/<filename>")
def download_file(filename):
    file_path = os.path.join(MODELS_DIR, filename)

    if os.path.exists(file_path):
        return send_file(file_path, as_attachment=True)
    else:
        print(f"❌ File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
