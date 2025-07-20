# app.py - Your Flask Backend (Classification Only)
# 1. Install dependencies: pip install Flask Flask-Cors python-dotenv gradio_client
# 2. Update your .env file with GRADIO_SPACE and HF_TOKEN.
# 3. Run the server: python app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from gradio_client import Client

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask App
app = Flask(__name__)
CORS(app) # Allow requests from your extension

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


# --- NEW, SIMPLIFIED API ENDPOINT ---
@app.route('/classify_and_log', methods=['POST'])
def classify_and_log():
    """Receives a single line of commentary, classifies it, and prints to console."""
    global gradio_client
    if not gradio_client:
        # Don't try to reconnect here, just log that it's not ready
        print("Gradio client not connected. Skipping classification.")
        return jsonify({"status": "skipped", "reason": "Gradio client not initialized"}), 200

    data = request.json
    commentary_text = data.get('text')
    if not commentary_text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Use the pre-connected Gradio client to predict
        classification = gradio_client.predict(
            text=commentary_text,
            api_name="/predict"
        )
        # Print the classification to the Flask terminal
        print(f"Received & Classified '{commentary_text[:40]}...' as: {classification}")
        
        # Send a simple success response back. The extension won't use this.
        return jsonify({"status": "logged"})

    except Exception as e:
        print(f"Error classifying line with Gradio client: {e}")
        return jsonify({"error": "Failed to classify text."}), 500

# This allows you to run the server locally for testing
if __name__ == '__main__':
    app.run(debug=True, port=5000)
