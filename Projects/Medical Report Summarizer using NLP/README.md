# MedSimplify 🏥

A Flask-based web application that transforms complex medical reports into clear, understandable language using AI-powered text processing and OCR technology.

## Features

- **Multiple Input Formats**: Upload medical reports as PDF, Word documents (.docx), or images (JPG, PNG)
- **Text Input**: Paste medical text directly for quick simplification
- **OCR Technology**: Extract text from scanned documents and images using Tesseract
- **AI-Powered Simplification**: Uses Hugging Face Transformers (T5 model) to generate simplified summaries
- **Modern UI**: Clean, responsive interface with gradient design and smooth animations
- **Secure Processing**: All processing happens locally on your machine

## Prerequisites

- Python 3.7 or higher
- Tesseract OCR (for image processing)

## Installation

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd medsimplify
```

### 2. Install Python Dependencies

```bash
pip install flask werkzeug pytesseract pillow PyPDF2 python-docx transformers torch
```

### 3. Install Tesseract OCR

#### Windows
Download and install from: https://github.com/UB-Mannheim/tesseract/wiki

Common installation paths:
- `C:\Program Files\Tesseract-OCR\tesseract.exe`
- `C:\Program Files (x86)\Tesseract-OCR\tesseract.exe`

#### macOS
```bash
brew install tesseract
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
```

## Usage

### 1. Start the Application

```bash
python main.py
```

The application will start on `http://127.0.0.1:5000/`

### 2. Upload or Paste Medical Report

- **Option 1**: Click "Choose File" to upload a PDF, Word document, or image
- **Option 2**: Paste medical text directly into the text area

### 3. Get Simplified Results

Click "Simplify Report" and the AI will generate an easy-to-understand summary of your medical report.

## Project Structure

```
medsimplify/
├── main.py                 # Flask application and core logic
├── templates/
│   └── index.html         # Frontend UI
├── uploads/               # Uploaded files storage
└── README.md             # This file
```

## How It Works

1. **File Upload**: Users upload medical documents or paste text
2. **Text Extraction**: 
   - Images → Tesseract OCR extracts text
   - PDFs → PyPDF2 extracts text
   - Word docs → python-docx extracts text
3. **AI Processing**: T5-small model from Hugging Face summarizes the text
4. **Display**: Simplified explanation is shown in an easy-to-read format

## Technologies Used

- **Backend**: Flask (Pyth