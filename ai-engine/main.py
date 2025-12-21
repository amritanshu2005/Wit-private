from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from dotenv import load_dotenv
import os

from services.image_classifier import classify_image
from services.nlp_analyzer import analyze_complaint
from services.priority_predictor import predict_priority
from services.duplicate_detector import detect_duplicate
from services.hotspot_analyzer import analyze_hotspots

load_dotenv()

app = FastAPI(
    title="iCivic Guardian AI Engine",
    description="AI/ML microservice for civic issue analysis",
    version="1.0.0"
)

# CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class TextAnalysisRequest(BaseModel):
    text: str
    title: Optional[str] = None

class PriorityRequest(BaseModel):
    category: str
    description: str
    upvotes: int = 0
    verifications: int = 0
    location_density: float = 0.5

class DuplicateRequest(BaseModel):
    title: str
    description: str
    category: str
    existing_issues: List[dict]

class HotspotRequest(BaseModel):
    issues: List[dict]

class AnalysisResponse(BaseModel):
    category: str
    confidence: float
    sentiment: str
    urgency: str
    keywords: List[str]

class PriorityResponse(BaseModel):
    priority: int
    factors: dict

class ImageAnalysisResponse(BaseModel):
    detected_category: str
    confidence: float
    issues_detected: List[str]
    severity: str

# Endpoints
@app.get("/")
async def root():
    return {"message": "iCivic Guardian AI Engine", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ai-engine"}

@app.post("/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """Analyze uploaded image to detect civic issues"""
    try:
        contents = await file.read()
        result = await classify_image(contents)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_text_endpoint(request: TextAnalysisRequest):
    """Analyze complaint text using NLP"""
    try:
        result = await analyze_complaint(request.text, request.title)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict-priority", response_model=PriorityResponse)
async def predict_priority_endpoint(request: PriorityRequest):
    """Predict issue priority using ML model"""
    try:
        result = predict_priority(
            category=request.category,
            description=request.description,
            upvotes=request.upvotes,
            verifications=request.verifications,
            location_density=request.location_density
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/detect-duplicate")
async def detect_duplicate_endpoint(request: DuplicateRequest):
    """Detect if a new issue is a duplicate of existing issues"""
    try:
        result = detect_duplicate(
            title=request.title,
            description=request.description,
            category=request.category,
            existing_issues=request.existing_issues
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/get-hotspots")
async def get_hotspots_endpoint(request: HotspotRequest):
    """Analyze issue locations to find hotspots"""
    try:
        result = analyze_hotspots(request.issues)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
