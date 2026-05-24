from fastapi import APIRouter, HTTPException, Query
from collections import Counter
from typing import Dict, Any, List
from backend.models.schemas import AdminStatsResponse
from backend.models.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin Statistics"])

def verify_admin_status(user_id: str):
    """Verifies if the requesting user has administrator privileges."""
    if not user_id:
        raise HTTPException(status_code=403, detail="Access denied. User ID required.")
    
    db = get_db()
    user = db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=403, detail="Access denied. User profile not found.")
        
    email = user.get("email", "").lower()
    is_admin = (
        email == "admin@example.com"
        or email == "anirudhabhutada@gmail.com"
        or email.endswith("@intelliview.ai")
    )
    
    if not is_admin:
        raise HTTPException(status_code=403, detail="Access denied. Administrator privileges required.")

@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_dashboard_statistics(user_id: str = Query(...)):
    """Queries, processes, and packages aggregate dashboard statistics for admin eyes."""
    verify_admin_status(user_id)
    db = get_db()
    
    users = db.list_users()
    resumes = db.list_resume_analyses()
    sessions = db.list_interview_sessions()

    # Calculate average score across completed sessions
    completed_sessions = [s for s in sessions if s.get("status") == "completed"]
    total_completed = len(completed_sessions)
    average_score = 0.0
    if total_completed > 0:
        average_score = sum(s.get("score", 0.0) for s in completed_sessions) / total_completed

    # Count skill keyword frequencies
    all_skills = []
    for user in users:
        skills = user.get("skills", [])
        all_skills.extend(skills)

    skill_counts = dict(Counter(all_skills).most_common(10))

    return {
        "total_users": len(users),
        "total_resumes": len(resumes),
        "total_interviews": len(sessions),
        "average_score": round(average_score, 2),
        "common_skills": skill_counts
    }


@router.get("/users", response_model=List[Dict[str, Any]])
def list_all_candidates(user_id: str = Query(...)):
    """Lists details of all registered candidates and active profiles."""
    verify_admin_status(user_id)
    db = get_db()
    return db.list_users()


@router.get("/resumes", response_model=List[Dict[str, Any]])
def list_all_analyzed_resumes(user_id: str = Query(...)):
    """Lists details of all uploaded resumes and their ATS score records."""
    verify_admin_status(user_id)
    db = get_db()
    
    raw_resumes = db.list_resume_analyses()
    light_resumes = []
    
    for r in raw_resumes:
        light_resumes.append({
            "id": r.get("id"),
            "user_id": r.get("user_id"),
            "ats_score": r.get("ats_score"),
            "strengths": r.get("strengths", [])[:3], # first 3
            "created_at": r.get("created_at")
        })
        
    return light_resumes
