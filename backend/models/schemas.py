from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any

# Authentication & User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    id: str  # UID from Firebase or client-generated uuid

class UserResponse(UserBase):
    id: str
    resume_url: Optional[str] = None
    skills: List[str] = []
    created_at: str

# Resume Analysis schema
class ResumeAnalysisResponse(BaseModel):
    id: str
    user_id: str
    ats_score: int
    strengths: List[str]
    weakness: List[str]
    suggestions: List[str]
    parsed_text: str
    created_at: str

# Interview Question schema
class InterviewQuestion(BaseModel):
    id: str
    question_text: str
    category: str
    difficulty: str

# Answer feedback schema
class AnswerFeedback(BaseModel):
    strengths: List[str]
    improvements: List[str]
    technical_accuracy: str
    clarity: str

# Answer submit schemas
class AnswerSubmitRequest(BaseModel):
    question_id: str
    user_answer: str

class AnswerSubmitResponse(BaseModel):
    question_id: str
    user_answer: str
    score: float
    feedback: AnswerFeedback

# Interview Session schemas
class InterviewSessionStartRequest(BaseModel):
    user_id: str
    category: str  # "Technical" | "Behavioral" | "Project-based" | "Mixed"
    difficulty: str  # "Beginner" | "Intermediate" | "Advanced"
    question_count: int = Field(default=10, ge=3, le=15)

class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    category: str
    difficulty: str
    score: float
    questions: List[InterviewQuestion]
    answers: List[Dict[str, Any]]
    status: str
    created_at: str

# Speech Transcription Response
class AudioTranscriptionResponse(BaseModel):
    transcript: str
    confidence: float

# Summary / Dashboard schemas
class InterviewSummaryResponse(BaseModel):
    session_id: str
    overall_score: float
    feedback_summary: str
    roadmap: List[str]
    details: List[Dict[str, Any]]

class AdminStatsResponse(BaseModel):
    total_users: int
    total_resumes: int
    total_interviews: int
    average_score: float
    common_skills: Dict[str, int]

# Career Optimization schemas
class CareerRecommendRequest(BaseModel):
    user_id: str

class LearningRoadmapWeek(BaseModel):
    week: str
    focus: str
    tasks: List[str]

class CareerRecommendResponse(BaseModel):
    recommended_roles: List[str]
    missing_skills: List[str]
    suggested_technologies: List[str]
    learning_roadmap: List[LearningRoadmapWeek]

class LinkedInProfileRequest(BaseModel):
    user_id: str

class LinkedInProfileResponse(BaseModel):
    linkedin_headline: str
    about_section: str
    resume_summary: str

