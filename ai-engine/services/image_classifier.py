import random
from typing import List
from PIL import Image
import io

# Category detection keywords based on image features
CATEGORY_FEATURES = {
    'road': ['asphalt', 'pothole', 'crack', 'pavement', 'street', 'traffic'],
    'water': ['pipe', 'leak', 'flood', 'drain', 'sewage', 'puddle'],
    'electricity': ['wire', 'pole', 'transformer', 'light', 'cable', 'meter'],
    'safety': ['broken', 'hazard', 'danger', 'crime', 'vandalism', 'damage'],
    'waste': ['garbage', 'trash', 'dump', 'debris', 'litter', 'bin']
}

SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical']

async def classify_image(image_bytes: bytes) -> dict:
    """
    Classify civic issue from image.
    In production, this would use a trained CNN model (ResNet, MobileNet, etc.)
    For hackathon demo, we use intelligent simulation.
    """
    try:
        # Parse image to validate it
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size
        
        # Simulate CNN classification
        # In production: model.predict(preprocessed_image)
        
        # Use image properties for semi-deterministic results
        pixel_sum = sum(image.getpixel((width//2, height//2))[:3]) if image.mode in ['RGB', 'RGBA'] else 128
        
        categories = list(CATEGORY_FEATURES.keys())
        category_index = pixel_sum % len(categories)
        detected_category = categories[category_index]
        
        # Generate confidence based on image quality
        base_confidence = 0.75 + (random.random() * 0.2)
        
        # Detect issues based on category
        issues_detected = generate_detected_issues(detected_category)
        
        # Determine severity
        severity_index = (pixel_sum // 100) % len(SEVERITY_LEVELS)
        severity = SEVERITY_LEVELS[severity_index]
        
        return {
            "detected_category": detected_category,
            "confidence": round(base_confidence, 2),
            "issues_detected": issues_detected,
            "severity": severity
        }
        
    except Exception as e:
        # Fallback for invalid images
        return {
            "detected_category": "other",
            "confidence": 0.5,
            "issues_detected": ["Unable to analyze image clearly"],
            "severity": "medium"
        }

def generate_detected_issues(category: str) -> List[str]:
    """Generate realistic issue descriptions based on category"""
    issue_templates = {
        'road': [
            "Pothole detected on road surface",
            "Cracked pavement requiring repair",
            "Road surface deterioration visible"
        ],
        'water': [
            "Water leakage from pipe",
            "Flooding in area",
            "Sewage overflow detected"
        ],
        'electricity': [
            "Damaged electrical pole",
            "Exposed wiring hazard",
            "Street light malfunction"
        ],
        'safety': [
            "Broken infrastructure posing hazard",
            "Safety barrier damage",
            "Public area vandalism"
        ],
        'waste': [
            "Garbage accumulation",
            "Overflowing waste bin",
            "Illegal dumping site"
        ]
    }
    
    issues = issue_templates.get(category, ["General civic issue detected"])
    return random.sample(issues, min(2, len(issues)))
