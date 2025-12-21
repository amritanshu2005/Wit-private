from typing import List, Dict
import re
from difflib import SequenceMatcher

def detect_duplicate(
    title: str,
    description: str,
    category: str,
    existing_issues: List[Dict]
) -> Dict:
    """
    Detect if a new issue is a duplicate of existing issues.
    Uses text similarity and category matching.
    
    Returns:
        - is_duplicate: bool
        - confidence: float (0-1)
        - similar_issues: list of potentially matching issues
    """
    
    if not existing_issues:
        return {
            "is_duplicate": False,
            "confidence": 0.0,
            "similar_issues": [],
            "recommendation": "No existing issues to compare"
        }
    
    new_text = normalize_text(f"{title} {description}")
    similar_issues = []
    
    for issue in existing_issues:
        existing_text = normalize_text(
            f"{issue.get('title', '')} {issue.get('description', '')}"
        )
        existing_category = issue.get('category', '')
        
        # Calculate text similarity
        text_similarity = calculate_similarity(new_text, existing_text)
        
        # Category match bonus
        category_match = 1.0 if category.lower() == existing_category.lower() else 0.5
        
        # Combined similarity score
        combined_score = (text_similarity * 0.7) + (category_match * 0.3)
        
        if combined_score > 0.4:  # Threshold for potential duplicate
            similar_issues.append({
                "issue_id": issue.get('id', issue.get('_id', 'unknown')),
                "title": issue.get('title', ''),
                "similarity_score": round(combined_score, 2),
                "category_match": category.lower() == existing_category.lower()
            })
    
    # Sort by similarity
    similar_issues.sort(key=lambda x: x['similarity_score'], reverse=True)
    similar_issues = similar_issues[:5]  # Top 5 similar
    
    # Determine if duplicate
    is_duplicate = False
    confidence = 0.0
    recommendation = "New unique issue"
    
    if similar_issues:
        top_score = similar_issues[0]['similarity_score']
        
        if top_score > 0.8:
            is_duplicate = True
            confidence = top_score
            recommendation = "High likelihood of duplicate - consider merging"
        elif top_score > 0.6:
            is_duplicate = False
            confidence = top_score
            recommendation = "Potentially related issue - review before creating"
        else:
            is_duplicate = False
            confidence = 1 - top_score
            recommendation = "New unique issue with some similarities"
    
    return {
        "is_duplicate": is_duplicate,
        "confidence": round(confidence, 2),
        "similar_issues": similar_issues,
        "recommendation": recommendation
    }

def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    # Lowercase
    text = text.lower()
    # Remove punctuation
    text = re.sub(r'[^\w\s]', '', text)
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def calculate_similarity(text1: str, text2: str) -> float:
    """Calculate similarity between two texts using SequenceMatcher"""
    if not text1 or not text2:
        return 0.0
    
    # Direct sequence matching
    seq_similarity = SequenceMatcher(None, text1, text2).ratio()
    
    # Word overlap similarity
    words1 = set(text1.split())
    words2 = set(text2.split())
    
    if not words1 or not words2:
        return seq_similarity
    
    intersection = words1.intersection(words2)
    union = words1.union(words2)
    jaccard = len(intersection) / len(union) if union else 0
    
    # Combined score
    return (seq_similarity * 0.6) + (jaccard * 0.4)
