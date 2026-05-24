from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from typing import Dict, Any, List
from backend.models.schemas import UserCreate, UserResponse, UserLoginRequest
from backend.models.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    """Registers a new user or updates their profile if they already exist."""
    db = get_db()
    
    # Check if user already exists
    existing_user = db.get_user(user.id)
    if existing_user:
        # Keep existing fields like skills/resume_url, but update name/email if changed
        updates = {
            "name": user.name,
            "email": user.email
        }
        updated_user = db.update_user(user.id, updates)
        return updated_user

    # Create new user record
    new_user = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "resume_url": None,
        "skills": [],
        "created_at": datetime.utcnow().isoformat()
    }
    
    saved_user = db.create_user(new_user)
    return saved_user


@router.post("/login", response_model=UserResponse)
def login_user(req: UserLoginRequest):
    """Validates if user exists in the backend DB and returns profile, or fails."""
    db = get_db()
    user = db.get_user(req.id)
    if not user:
        raise HTTPException(
            status_code=404, 
            detail="User profile not found. Please sign up or verify your credentials."
        )
    return user


@router.post("/google", response_model=UserResponse)
def google_auth(user: UserCreate):
    """Authenticates a Google user. Fetches their profile or registers them if missing."""
    db = get_db()
    existing_user = db.get_user(user.id)
    if existing_user:
        return existing_user

    # Create new profile if missing
    new_user = {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "resume_url": None,
        "skills": [],
        "created_at": datetime.utcnow().isoformat()
    }
    saved_user = db.create_user(new_user)
    return saved_user


@router.post("/logout")
def logout_user():
    """Logs out the candidate profile session."""
    return {"status": "success", "message": "Successfully logged out."}


@router.get("/profile/{user_id}", response_model=UserResponse)
def get_user_profile(user_id: str):
    """Fetches user profile by ID."""
    db = get_db()
    user = db.get_user(user_id)
    if not user:
        # If running local mode and user is not registered yet, auto-create a default mock user for a seamless experience
        from backend import config
        if config.DATABASE_MODE == "local":
            mock_user = {
                "id": user_id,
                "name": "Demo User",
                "email": "demo@example.com",
                "resume_url": None,
                "skills": [],
                "created_at": datetime.utcnow().isoformat()
            }
            db.create_user(mock_user)
            return mock_user
        
        raise HTTPException(status_code=404, detail="User profile not found.")
    
    return user
