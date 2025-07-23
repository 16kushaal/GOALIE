# # app.py - Your Flask Backend (Classification Only)
# # 1. Install dependencies: pip install Flask Flask-Cors python-dotenv gradio_client
# # 2. Update your .env file with GRADIO_SPACE and HF_TOKEN.
# # 3. Run the server: python app.py

# import os
# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv
# from gradio_client import Client

# # Load environment variables from the .env file
# load_dotenv()

# # Initialize Flask App
# app = Flask(__name__)
# CORS(app) # Allow requests from your extension

# # --- SECURELY LOAD YOUR GRADIO CONFIG ---
# GRADIO_SPACE = os.environ.get("GRADIO_SPACE") 
# HF_TOKEN = os.environ.get("HF_TOKEN")

# # --- ROBUST GRADIO CLIENT INITIALIZATION ---
# gradio_client = None
# def initialize_gradio_client():
#     global gradio_client
#     if not GRADIO_SPACE:
#         print("⚠️ GRADIO_SPACE environment variable not set. Cannot connect.")
#         return
#     try:
#         print(f"Attempting to connect to Gradio Space: {GRADIO_SPACE}...")
#         gradio_client = Client(GRADIO_SPACE, hf_token=HF_TOKEN)
#         print(f"✅ Successfully connected to Gradio Space: {GRADIO_SPACE}")
#     except Exception as e:
#         print(f"❌ Failed to connect to Gradio Space on startup: {e}")
#         gradio_client = None

# # Attempt to initialize the client when the server starts
# initialize_gradio_client()


# # --- NEW, SIMPLIFIED API ENDPOINT ---
# @app.route('/classify_and_log', methods=['POST'])
# def classify_and_log():
#     """Receives a single line of commentary, classifies it, and prints to console."""
#     global gradio_client
#     if not gradio_client:
#         # Don't try to reconnect here, just log that it's not ready
#         print("Gradio client not connected. Skipping classification.")
#         return jsonify({"status": "skipped", "reason": "Gradio client not initialized"}), 200

#     data = request.json
#     commentary_text = data.get('text')
#     if not commentary_text:
#         return jsonify({"error": "No text provided"}), 400

#     try:
#         # Use the pre-connected Gradio client to predict
#         classification = gradio_client.predict(
#             text=commentary_text,
#             api_name="/predict"
#         )
#         # Print the classification to the Flask terminal
#         print(f"Received & Classified '{commentary_text[:40]}...' as: {classification}")
        
#         # Send a simple success response back. The extension won't use this.
#         return jsonify({"status": "logged"})

#     except Exception as e:
#         print(f"Error classifying line with Gradio client: {e}")
#         return jsonify({"error": "Failed to classify text."}), 500

# # This allows you to run the server locally for testing
# if __name__ == '__main__':
#     app.run(debug=True, port=5000)

# app.py - Your Flask Backend (Classification + NER Console Output)
# 1. Install dependencies: pip install Flask Flask-Cors python-dotenv gradio_client spacy
# 2. Download spaCy model: python -m spacy download en_core_web_sm
# 3. Update your .env file with GRADIO_SPACE and HF_TOKEN.
# 4. Run the server: python app.py

import os
import spacy
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from gradio_client import Client

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app) # Allow requests from your extension

# --- LOAD SPACY MODEL FOR NER ---
try:
    nlp = spacy.load("en_core_web_sm")
    print("✅ spaCy NER model loaded successfully")
except OSError:
    print("❌ spaCy model not found. Please run: python -m spacy download en_core_web_sm")
    nlp = None

# --- SECURELY LOAD YOUR GRADIO CONFIG ---
GRADIO_SPACE = os.environ.get("GRADIO_SPACE") 
HF_TOKEN = os.environ.get("HF_TOKEN")

# --- ROBUST GRADIO CLIENT INITIALIZATION ---
gradio_client = None
def initialize_gradio_client():
    global gradio_client
    if not GRADIO_SPACE:
        print("⚠️ GRADIO_SPACE environment variable not set. Cannot connect.")
        return
    try:
        print(f"Attempting to connect to Gradio Space: {GRADIO_SPACE}...")
        gradio_client = Client(GRADIO_SPACE, hf_token=HF_TOKEN)
        print(f"✅ Successfully connected to Gradio Space: {GRADIO_SPACE}")
    except Exception as e:
        print(f"❌ Failed to connect to Gradio Space on startup: {e}")
        gradio_client = None

# Attempt to initialize the client when the server starts
initialize_gradio_client()

def extract_named_entities(text):
    """Extract named entities using spaCy NER"""
    if not nlp:
        return []
    
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "text": ent.text,
            "label": ent.label_,
            "description": spacy.explain(ent.label_)
        })
    return entities

def print_analysis_results(text, classification, entities):
    """Print formatted results to console"""
    print("\n" + "="*100)
    print(f"📝 COMMENTARY: {text}")
    print(f"🤖 GRADIO CLASSIFICATION: {classification}")
    print(f"🏷️  NER ENTITIES FOUND: {len(entities) if entities else 0}")
    
    if entities:
        print("   Named Entities Detected:")
        for entity in entities:
            print(f"      • '{entity['text']}' → {entity['label']} ({entity['description']})")
    else:
        print("   No named entities detected")
    
    print("="*100 + "\n")

# --- ENHANCED API ENDPOINT ---
@app.route('/classify_and_log', methods=['POST'])
def classify_and_log():
    """Receives commentary, classifies with Gradio, performs NER, and prints both results."""
    global gradio_client
    
    data = request.json
    commentary_text = data.get('text')
    if not commentary_text:
        return jsonify({"error": "No text provided"}), 400

    classification_result = None
    ner_entities = []

    # Perform Gradio Classification
    if gradio_client:
        try:
            classification_result = gradio_client.predict(
                text=commentary_text,
                api_name="/predict"
            )
        except Exception as e:
            print(f"❌ Error classifying with Gradio: {e}")
            classification_result = "Classification Error"
    else:
        print("⚠️ Gradio client not connected. Skipping classification.")
        classification_result = "Gradio Not Available"

    # Perform NER
    try:
        ner_entities = extract_named_entities(commentary_text)
    except Exception as e:
        print(f"❌ Error performing NER: {e}")
        ner_entities = []

    # Print combined results to console
    print_analysis_results(commentary_text, classification_result, ner_entities)

    # Return simple response (your extension doesn't need the detailed data)
    return jsonify({"status": "logged_and_analyzed"})

# This allows you to run the server locally for testing
if __name__ == '__main__':
    print("🚀 Starting Flask server with Gradio Classification + NER Analysis...")
    app.run(debug=True, port=5000)