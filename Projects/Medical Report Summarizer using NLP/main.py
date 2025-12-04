import os
import platform
from flask import Flask, request, render_template
from werkzeug.utils import secure_filename
import pytesseract
from PIL import Image
import PyPDF2
import docx

# Hugging Face Transformers
from transformers import pipeline

# Configure Tesseract path for Windows
if platform.system() == "Windows":
    # Common Tesseract installation paths on Windows
    possible_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Users\{}\AppData\Local\Tesseract-OCR\tesseract.exe".format(os.getenv('USERNAME', '')),
        r"C:\tesseract\tesseract.exe"
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            break
    else:
        # If not found, try to use PATH
        try:
            import subprocess
            subprocess.run(["tesseract", "--version"], capture_output=True, check=True)
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("Warning: Tesseract not found. OCR functionality will be limited.")
            print("Please install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")

app = Flask(__name__)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Load a text simplification / summarization model
simplifier = pipeline("summarization", model="t5-small")  # lightweight, can switch to flan-t5-small

def extract_text_from_file(filepath):
    ext = filepath.split(".")[-1].lower()

    if ext in ["jpg", "jpeg", "png"]:
        img = Image.open(filepath)
        return pytesseract.image_to_string(img)

    elif ext == "pdf":
        text = ""
        with open(filepath, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text

    elif ext in ["docx"]:
        doc = docx.Document(filepath)
        return "\n".join([para.text for para in doc.paragraphs])

    else:
        return ""

def simplify_text(text):
    # Use Hugging Face summarization model
    try:
        simplified = simplifier(text, max_length=100, min_length=20, do_sample=False)
        return simplified[0]['summary_text']
    except Exception as e:
        return f"Error simplifying text: {e}"

@app.route("/", methods=["GET", "POST"])
def home():
    simplified = None
    report_text = None

    if request.method == "POST":
        if "file" in request.files:
            file = request.files["file"]
            if file.filename != "":
                filename = secure_filename(file.filename)
                filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
                file.save(filepath)
                report_text = extract_text_from_file(filepath)
        else:
            report_text = request.form.get("report", "")

        if report_text and report_text.strip():
            simplified = simplify_text(report_text)

    return render_template("index.html", simplified=simplified, report_text=report_text)

if __name__ == "__main__":
    app.run(debug=True)
