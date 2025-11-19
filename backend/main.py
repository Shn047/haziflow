import os
import json
import httpx
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, ValidationError
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware # Import CORS
load_dotenv()

# --- Configuration ---
load_dotenv()

VLLM_SERVER_URL = os.getenv("VLLM_SERVER_URL", "http://127.0.0.1:8000")
VLLM_API_KEY = os.getenv("VLLM_API_KEY", "your-vllm-api-key")
INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY") 
YOUR_VLLM_MODEL_NAME_HERE = "your-finetuned-model-name" 

# --- System Prompt (Not used by mock, but good to keep) ---
SYSTEM_PROMPT = """
You are an expert Chinese linguist and assistant...
...
""" # (The full prompt is kept here for when you go live)


# --- API Models (Request & Response) ---
class SegmentRequest(BaseModel):
    sentence: str

class SegmentedWord(BaseModel):
    word: str
    translation: str

class UsagePattern(BaseModel):
    phrase: str
    explanation: str
    example: str

class SegmentResponse(BaseModel):
    segmented_sentence: str
    words: list[SegmentedWord]
    usage_patterns: list[UsagePattern]


# --- Authentication ---
api_key_header = APIKeyHeader(name="X-API-Key")

async def get_api_key(api_key: str = Security(api_key_header)):
    if not INTERNAL_API_KEY:
        print("--- HanziFlow: ERROR: INTERNAL_API_KEY is not set in .env file ---")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="API key not configured on server."
        )
    if api_key == INTERNAL_API_KEY:
        return api_key
    else:
        print("--- HanziFlow: ERROR: Invalid API Key received ---")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Invalid API Key"
        )

# --- FastAPI App ---
app = FastAPI(
    title="HanziFlow API",
    description="Backend API for the Chinese Segmentation browser extension.",
    version="1.0.0"
)

# --- CORS (Cross-Origin Resource Sharing) Middleware ---
FIREFOX_EXTENSION_ORIGIN = os.getenv("FIREFOX_EXTENSION_ORIGIN", None)
origins = [
    "http://localhost",
    "http://127.0.0.1",
    "http://localhost:8001",
    "http://127.0.0.1:8001",
]
if FIREFOX_EXTENSION_ORIGIN:
    print(f"--- HanziFlow: Allowing origin: {FIREFOX_EXTENSION_ORIGIN} ---")
    origins.append(FIREFOX_EXTENSION_ORIGIN)
else:
    print("--- HanziFlow: WARNING: FIREFOX_EXTENSION_ORIGIN not set. This will fail. ---")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "moz-extension://2875e5c1-e406-4796-abcb-7e0684730b0f",   # <--- yours
        "http://localhost",
        "http://127.0.0.1"
    ],
    allow_credentials=True,
    allow_methods=["*"],              # <-- allows OPTIONS
    allow_headers=["*"],              # <-- allows X-API-Key
)



# --- Helper Function (Not used in mock) ---
async def call_vllm_model(sentence: str) -> str:
    # This function is not called, but we leave it for the future
    pass

# --- API Endpoint ---
@app.post("/api/v1/segment", response_model=SegmentResponse)
async def segment_text(
    request: SegmentRequest, 
    api_key: str = Depends(get_api_key)
):
    if not request.sentence.strip():
        raise HTTPException(status_code=400, detail="Sentence cannot be empty.")

    # --- THIS IS THE MOCK RESPONSE ---
    # We are NOT calling the vLLM model. We are sending fake data.
    try:
        mock_data = {
          "segmented_sentence": "我 / 是 / 升级版 / 模拟 / 响应。",
          "words": [
            {"word": "我", "translation": "I (mock)"},
            {"word": "是", "translation": "am (mock)"},
            {"word": "升级版", "translation": "upgraded (mock)"},
            {"word": "模拟", "translation": "mock (mock)"},
            {"word": "响应", "translation": "response (mock)"}
          ],
          "usage_patterns": [
            {
              "phrase": "升级版模拟",
              "explanation": "This is a mock grammar pattern for the *upgraded* API.",
              "example": "这是一个升级版的模拟响应。 (This is an upgraded mock response.)"
            }
          ]
        }
        
        # Validate and return the mock data
        response = SegmentResponse(**mock_data)
        return response
        
    except Exception as e:
        print(f"An unexpected error occurred during mock parsing: {e}")
        raise HTTPException(status_code=500, detail="Error processing mock response.")

# --- Root Endpoint for Health Check ---
@app.get("/", summary="Health Check")
async def read_root():
    return {"status": "HanziFlow API is running"}