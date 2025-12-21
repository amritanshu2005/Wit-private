import numpy as np
from sklearn.ensemble import RandomForestClassifier
from typing import Dict

# Pre-trained weights simulation (in production, load from saved model)
# Priority factors and their weights
CATEGORY_PRIORITY = {
    'safety': 8,
    'electricity': 7,
    'water': 6,
    'road': 5,
    'waste': 4,
    'other': 3
}

URGENCY_KEYWORDS = {
    'critical': ['emergency', 'fire', 'accident', 'collapse', 'electrocution'],
    'high': ['flooding', 'broken', 'exposed', 'dangerous', 'blocked'],
    'medium': ['leaking', 'damaged', 'crack', 'pothole'],
    'low': ['minor', 'small', 'slight', 'cosmetic']
}

def predict_priority(
    category: str,
    description: str,
    upvotes: int = 0,
    verifications: int = 0,
    location_density: float = 0.5
) -> Dict:
    """
    Predict issue priority using Random Forest-inspired scoring.
    In production, this would use a trained sklearn model.
    
    Priority scale: 1-10 (1 = lowest, 10 = highest)
    """
    
    # Base priority from category
    base_priority = CATEGORY_PRIORITY.get(category.lower(), 5)
    
    # Urgency modifier from description
    description_lower = description.lower()
    urgency_modifier = 0
    
    if any(kw in description_lower for kw in URGENCY_KEYWORDS['critical']):
        urgency_modifier = 3
    elif any(kw in description_lower for kw in URGENCY_KEYWORDS['high']):
        urgency_modifier = 2
    elif any(kw in description_lower for kw in URGENCY_KEYWORDS['medium']):
        urgency_modifier = 1
    elif any(kw in description_lower for kw in URGENCY_KEYWORDS['low']):
        urgency_modifier = -1
    
    # Community engagement modifier
    engagement_score = min((upvotes * 0.3 + verifications * 0.5), 2)
    
    # Location density modifier (hotspot areas get higher priority)
    density_modifier = location_density * 1.5
    
    # Calculate final priority
    raw_priority = base_priority + urgency_modifier + engagement_score + density_modifier
    
    # Clamp to 1-10 range
    final_priority = int(min(max(round(raw_priority), 1), 10))
    
    # Factor breakdown for transparency
    factors = {
        "category_weight": base_priority,
        "urgency_modifier": urgency_modifier,
        "engagement_score": round(engagement_score, 2),
        "density_modifier": round(density_modifier, 2),
        "raw_score": round(raw_priority, 2)
    }
    
    return {
        "priority": final_priority,
        "factors": factors
    }

def train_model():
    """
    Train a Random Forest model on historical data.
    This is a placeholder for production training.
    """
    # Simulated training data
    X = np.random.rand(1000, 5)  # Features: category_encoded, urgency, upvotes, verifications, density
    y = np.random.randint(1, 11, 1000)  # Priority 1-10
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    return model
