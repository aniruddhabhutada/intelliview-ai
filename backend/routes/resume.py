import os
import uuid
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from datetime import datetime
from backend import config
from backend.services.resume_parser import ResumeParserService
from backend.services.rag_service import RAGService
from backend.agents.interview_agent import InterviewAgent
from backend.models.database import get_db
from backend.models.schemas import ResumeAnalysisResponse

router = APIRouter(prefix="/resume", tags=["Resume Operations"])
logger = logging.getLogger(__name__)

@router.post("/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    user_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Handles resume upload, parsing, RAG indexing, and LLM-driven ATS analysis."""
    # Validate extension
    filename = file.filename
    _, ext = os.path.splitext(filename.lower())
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX formats are supported.")

    # Create temporary local file path
    unique_filename = f"{user_id}_{uuid.uuid4()}{ext}"
    local_path = os.path.join(config.UPLOAD_DIR, unique_filename)

    try:
        # Write binary content
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")
            
        with open(local_path, "wb") as f:
            f.write(content)

        # 1. Parse Text from Resume
        try:
            parsed_text = ResumeParserService.parse_resume(local_path)
        except ValueError as val_err:
            raise HTTPException(status_code=400, detail=str(val_err))

        # 2. Ingest into ChromaDB / Fallback RAG
        RAGService.ingest_resume(user_id, parsed_text)

        # 3. Analyze Resume using Llama 3.3 via Groq
        analysis_data = InterviewAgent.analyze_resume(parsed_text)

        # Save analysis data
        db = get_db()
        analysis_id = str(uuid.uuid4())
        
        db_analysis = {
            "id": analysis_id,
            "user_id": user_id,
            "ats_score": int(analysis_data.get("ats_score", 70)),
            "strengths": list(analysis_data.get("strengths", [])),
            "weakness": list(analysis_data.get("weakness", [])),
            "suggestions": list(analysis_data.get("suggestions", [])),
            "parsed_text": parsed_text,
            "created_at": datetime.utcnow().isoformat()
        }
        
        saved_analysis = db.save_resume_analysis(db_analysis)

        # 4. Update User Profile with new details
        skills_detected = list(analysis_data.get("skills", []))
        user_updates = {
            "resume_url": f"/uploads/{unique_filename}",
            "skills": skills_detected
        }
        db.update_user(user_id, user_updates)

        return saved_analysis

    except Exception as e:
        logger.error(f"[Resume Route] Upload or analysis failed: {str(e)}")
        # Clean up local file in case of failure
        if os.path.exists(local_path):
            try:
                os.remove(local_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=f"Resume processing failed: {str(e)}")


@router.get("/analysis/{user_id}", response_model=ResumeAnalysisResponse)
def get_resume_analysis(user_id: str):
    """Retrieves the latest resume analysis for a user."""
    db = get_db()
    analysis = db.get_resume_analysis(user_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="No resume analysis found for this user. Please upload your resume first.")
    return analysis
