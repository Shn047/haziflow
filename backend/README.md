HanziFlow Backend API (FastAPI + vLLM)

This is the backend API server for the HanziFlow project, built with FastAPI. It acts as the bridge between your Firefox browser extension and your fine-tuned Small Language Model (SLM) served with vLLM.

This backend is designed to work with your teammate's original frontend code.

Your 4-Step Setup Guide

Step 1: Run Your vLLM Server

First, you must serve your fine-tuned model (e.g., your Qwen3) using vLLM's OpenAI-compatible server. Open a terminal and run this command:

# IMPORTANT:
# Replace 'your-huggingface-repo/your-finetuned-model'
# with the actual name of your model (e.g., 'YeMoe/Qwen3-8B-finetuned')

python -m vllm.entrypoints.openai.api_server \
    --model your-huggingface-repo/your-finetuned-model \
    --api-key your-vllm-api-key


--model: This is the Hugging Face repo ID of your fine-tuned model.

--api-key: This is an optional key to protect your vLLM server. The value you use here must match VLLM_API_KEY in your .env file.

Your vLLM server will start, usually on http://127.0.0.1:8000.

Step 2: Configure Your FastAPI Backend

Edit the .env file:

VLLM_SERVER_URL: Make sure this matches the URL from Step 1 (e.g., http://127.0.0.1:8000).

VLLM_API_KEY: Make sure this matches the --api-key you used in Step 1.

FIREFOX_EXTENSION_ORIGIN: This is critical for security.

Open Firefox and go to about:debugging#/runtime/this-firefox.

Find your "HanziFlow" extension.

Copy the Internal UUID.

Paste it into the .env file, like this: FIREFOX_EXTENSION_ORIGIN="moz-extension://YOUR-UUID-HERE"

Edit the main.py file:

Find the line YOUR_VLLM_MODEL_NAME_HERE = "your-finetuned-model-name"

Change "your-finetuned-model-name" to the same model ID you used in Step 1.

Step 3: Install Dependencies & Run This API Server

Open a new terminal (leave your vLLM server running in the first one).

# 1. Create a virtual environment
python -m venv venv

# 2. Activate it
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# 3. Install all required packages
pip install -r requirements.txt

# 4. Run the FastAPI server!
# This runs on port 8080 to match your teammate's background.js file
uvicorn main:app --reload --port 8080


Your FastAPI server is now running on http://127.0.0.1:8080.

Step 4: Connect Your Browser Extension

Your teammate's background.js file is set up to call http://localhost:8080/segment. Since your FastAPI server is now running on that exact address and path, it should connect successfully.

API Endpoint (Simple Version)

POST /segment

Unsecured endpoint that performs segmentation and returns a simplified list of words (to match the original frontend).

Headers:

(None required)

Request Body (JSON):

{
  "text": "我今天在路上遇到了一只特别胖的橘猫。"
}


Success Response (200 OK):
This response is formatted to match what your teammate's popup.js file expects.

{
  "segmented_text": [
    {"word": "我", "translation": "I"},
    {"word": "今天", "translation": "today"},
    {"word": "在路上", "translation": "on the road"},
    {"word": "遇到", "translation": "met"},
    {"word": "了", "translation": "particle indicating past tense"},
    {"word": "一只", "translation": "one (measure word)"},
    {"word": "特别胖的", "translation": "especially fat"},
    {"word": "橘猫", "translation": "orange cat"}
  ]
}
