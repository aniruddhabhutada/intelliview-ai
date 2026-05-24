from fastapi import APIRouter, HTTPException
from backend.models.database import get_db
from backend.agents.interview_agent import InterviewAgent
from backend.models.schemas import (
    CareerRecommendRequest,
    CareerRecommendResponse,
    LinkedInProfileRequest,
    LinkedInProfileResponse
)

router = APIRouter(prefix="/career", tags=["Career Operations"])

@router.post("/recommend", response_model=CareerRecommendResponse)
def get_internship_recommendations(req: CareerRecommendRequest):
    """Computes personalized internship recommendations, gaps, and roadmaps based on resume analysis."""
    db = get_db()
    # 1. Fetch user resume analysis
    analysis = db.get_resume_analysis(req.user_id)
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No resume analysis found. Please upload a resume first to run recommendations!"
        )
    
    # 2. Get user profile details
    user = db.get_user(req.user_id)
    skills = user.get("skills", []) if user else []
    
    # 3. Call AI agent
    try:
        recommendations = InterviewAgent.generate_internship_recommendations(
            parsed_text=analysis["parsed_text"],
            skills=skills
        )
        return recommendations
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate internship recommendations: {str(e)}"
        )

@router.post("/linkedin", response_model=LinkedInProfileResponse)
def get_linkedin_generator(req: LinkedInProfileRequest):
    """Generates professional LinkedIn headlines, bios, and summaries tailored to resume achievements."""
    db = get_db()
    # 1. Fetch user resume analysis
    analysis = db.get_resume_analysis(req.user_id)
    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="No resume analysis found. Please upload a resume first to generate profile summaries!"
        )
    
    # 2. Get user profile details
    user = db.get_user(req.user_id)
    skills = user.get("skills", []) if user else []
    
    # 3. Call AI agent
    try:
        profile_copies = InterviewAgent.generate_linkedin_profile(
            parsed_text=analysis["parsed_text"],
            skills=skills
        )
        return profile_copies
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate LinkedIn profiles: {str(e)}"
        )
