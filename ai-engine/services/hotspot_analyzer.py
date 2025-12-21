from typing import List, Dict
import numpy as np
from sklearn.cluster import KMeans
from collections import Counter

def analyze_hotspots(issues: List[Dict]) -> Dict:
    """
    Analyze issue locations to identify hotspots using KMeans clustering.
    
    Args:
        issues: List of issues with location coordinates
        
    Returns:
        - clusters: List of hotspot clusters with center coordinates
        - predictions: Predicted future problem areas
        - risk_zones: High-risk areas requiring attention
    """
    
    if not issues or len(issues) < 3:
        return {
            "clusters": [],
            "predictions": [],
            "risk_zones": [],
            "message": "Insufficient data for hotspot analysis"
        }
    
    # Extract coordinates
    coords = []
    issue_data = []
    
    for issue in issues:
        loc = issue.get('location', {})
        if isinstance(loc, dict):
            coordinates = loc.get('coordinates', [])
            if len(coordinates) >= 2:
                coords.append([coordinates[0], coordinates[1]])  # [lng, lat]
                issue_data.append({
                    'category': issue.get('category', 'other'),
                    'priority': issue.get('priority', 5),
                    'status': issue.get('status', 'pending')
                })
    
    if len(coords) < 3:
        return {
            "clusters": [],
            "predictions": [],
            "risk_zones": [],
            "message": "Insufficient location data"
        }
    
    coords_array = np.array(coords)
    
    # Determine optimal number of clusters (max 5 for visualization)
    n_clusters = min(5, len(coords) // 2)
    n_clusters = max(2, n_clusters)
    
    # Perform KMeans clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    labels = kmeans.fit_predict(coords_array)
    
    # Analyze each cluster
    clusters = []
    for i in range(n_clusters):
        cluster_mask = labels == i
        cluster_issues = [issue_data[j] for j in range(len(issue_data)) if cluster_mask[j]]
        
        if not cluster_issues:
            continue
        
        # Calculate cluster statistics
        categories = [issue['category'] for issue in cluster_issues]
        category_counts = Counter(categories)
        dominant_category = category_counts.most_common(1)[0][0]
        
        avg_priority = np.mean([issue['priority'] for issue in cluster_issues])
        pending_count = sum(1 for issue in cluster_issues if issue['status'] == 'pending')
        
        center = kmeans.cluster_centers_[i]
        
        clusters.append({
            "id": i,
            "center": {
                "lng": float(center[0]),
                "lat": float(center[1])
            },
            "issue_count": int(sum(cluster_mask)),
            "dominant_category": dominant_category,
            "category_distribution": dict(category_counts),
            "avg_priority": round(float(avg_priority), 1),
            "pending_issues": pending_count,
            "risk_level": calculate_risk_level(avg_priority, int(sum(cluster_mask)), pending_count)
        })
    
    # Sort clusters by risk level
    clusters.sort(key=lambda x: x['avg_priority'] * x['issue_count'], reverse=True)
    
    # Identify risk zones (top 3 highest risk clusters)
    risk_zones = [c for c in clusters if c['risk_level'] in ['high', 'critical']][:3]
    
    # Generate predictions (simplified future hotspot prediction)
    predictions = generate_predictions(clusters)
    
    return {
        "clusters": clusters,
        "predictions": predictions,
        "risk_zones": risk_zones,
        "total_issues_analyzed": len(coords)
    }

def calculate_risk_level(avg_priority: float, issue_count: int, pending_count: int) -> str:
    """Calculate risk level for a cluster"""
    risk_score = (avg_priority * 0.4) + (issue_count * 0.3) + (pending_count * 0.3)
    
    if risk_score >= 8:
        return "critical"
    elif risk_score >= 6:
        return "high"
    elif risk_score >= 4:
        return "medium"
    else:
        return "low"

def generate_predictions(clusters: List[Dict]) -> List[Dict]:
    """Generate predicted future problem areas based on current patterns"""
    predictions = []
    
    for cluster in clusters:
        if cluster['risk_level'] in ['high', 'critical']:
            predictions.append({
                "location": cluster['center'],
                "predicted_category": cluster['dominant_category'],
                "confidence": 0.7 + (cluster['avg_priority'] / 30),
                "timeframe": "next 30 days",
                "recommendation": f"Proactive maintenance recommended for {cluster['dominant_category']} issues in this area"
            })
    
    return predictions[:3]  # Top 3 predictions
