import os
import google.generativeai as genai
from typing import Optional
import re

# Configure Gemini
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Category keywords for fallback classification
CATEGORY_KEYWORDS = {
    'road': ['road', 'pothole', 'street', 'pavement', 'traffic', 'highway', 'crack', 'asphalt', 'driving'],
    'water': ['water', 'pipe', 'leak', 'flood', 'drain', 'sewage', 'tap', 'supply', 'plumbing'],
    'electricity': ['electricity', 'power', 'light', 'wire', 'pole', 'outage', 'transformer', 'voltage'],
    'safety': ['safety', 'danger', 'hazard', 'crime', 'theft', 'broken', 'accident', 'vandalism'],
    'waste': ['garbage', 'trash', 'waste', 'dump', 'litter', 'rubbish', 'bin', 'debris', 'pollution']
}

URGENCY_KEYWORDS = {
    'critical': ['emergency', 'urgent', 'immediate', 'dangerous', 'critical', 'life-threatening', 'fire'],
    'high': ['serious', 'major', 'severe', 'important', 'hazardous', 'risk'],
    'medium': ['moderate', 'concerning', 'needs attention', 'repair needed'],
    'low': ['minor', 'small', 'cosmetic', 'inconvenience', 'slight']
}

async def analyze_complaint(text: str, title: Optional[str] = None) -> dict:
    """
    Analyze complaint text using Gemini API for NLP.
    Falls back to keyword-based analysis if API unavailable.
    """
    full_text = f"{title or ''} {text}".lower()
    
    # Try Gemini API first
    if GEMINI_API_KEY:
        try:
            result = await analyze_with_gemini(text, title)
            if result:
                return result
        except Exception as e:
            print(f"Gemini API error: {e}")
    
    # Fallback to keyword-based analysis
    return analyze_with_keywords(full_text)

async def analyze_with_gemini(text: str, title: Optional[str] = None) -> dict:
    """Use Gemini API for advanced NLP analysis"""
    model = genai.GenerativeModel('gemini-pro')
    
    prompt = f"""Analyze this civic complaint and extract the following information.
Respond in JSON format only, no markdown, no explanation.

Complaint Title: {title or 'N/A'}
Complaint Text: {text}

Extract:
1. category: One of [road, water, electricity, safety, waste, other]
2. confidence: Float between 0.7 and 1.0
3. sentiment: One of [negative, neutral, concerned, urgent]
4. urgency: One of [low, medium, high, critical]
5. keywords: Array of 3-5 key terms from the complaint

Response format:
{{"category": "...", "confidence": 0.X, "sentiment": "...", "urgency": "...", "keywords": ["...", "..."]}}
"""
    
    response = model.generate_content(prompt)
    response_text = response.text.strip()
    
    # Clean up response - remove markdown code blocks if present
    if response_text.startswith('```'):
        response_text = re.sub(r'^```(?:json)?\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
    
    import json
    result = json.loads(response_text)
    
    return {
        "category": result.get("category", "other"),
        "confidence": min(max(float(result.get("confidence", 0.8)), 0.7), 1.0),
        "sentiment": result.get("sentiment", "concerned"),
        "urgency": result.get("urgency", "medium"),
        "keywords": result.get("keywords", [])[:5]
    }

def analyze_with_keywords(text: str) -> dict:
    """Fallback keyword-based analysis"""
    # Detect category
    category_scores = {}
    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw in text)
        category_scores[cat] = score
    
    detected_category = max(category_scores, key=category_scores.get)
    if category_scores[detected_category] == 0:
        detected_category = "other"
    
    # Calculate confidence
    max_score = max(category_scores.values())
    confidence = min(0.7 + (max_score * 0.05), 0.95)
    
    # Detect urgency
    urgency = "medium"
    for level, keywords in URGENCY_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            urgency = level
            break
    
    # Detect sentiment
    negative_words = ['bad', 'terrible', 'awful', 'horrible', 'worst', 'angry', 'frustrated']
    urgent_words = ['please', 'help', 'urgent', 'asap', 'immediately']
    
    if any(word in text for word in negative_words):
        sentiment = "negative"
    elif any(word in text for word in urgent_words):
        sentiment = "urgent"
    else:
        sentiment = "concerned"
    
    # Extract keywords
    words = text.split()
    keywords = [w for w in words if len(w) > 4 and w.isalpha()][:5]
    
    return {
        "category": detected_category,
        "confidence": round(confidence, 2),
        "sentiment": sentiment,
        "urgency": urgency,
        "keywords": keywords
    }
