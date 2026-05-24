import sys
import os
# Add parent directory of 'backend' to sys.path to enable running directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import uvicorn
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend import config
from backend.routes import auth, resume, interview, admin, career

# Configure logging format
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler()]
)

logger = logging.getLogger("backend_server")

# Initialize FastAPI app
app = FastAPI(
    title="Intelliview AI API",
    description="A production-level FastAPI backend driving RAG resume parses and Llama 3.3 interview evaluations.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production domains when deploying
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local upload directory to serve PDF/DOCX assets statically
app.mount("/uploads", StaticFiles(directory=str(config.UPLOAD_DIR)), name="uploads")

# Register routes
app.include_router(auth.router, prefix="/api")
app.include_router(resume.router, prefix="/api")
app.include_router(interview.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(career.router, prefix="/api")

@app.get("/", tags=["Health"])
def health_check():
    """Health check endpoint to verify backend status."""
    return {
        "status": "online",
        "database_mode": config.DATABASE_MODE,
        "chroma_enabled": config.CHROMA_DB_PATH is not None
    }

if __name__ == "__main__":
    logger.info(f"Starting backend server on port {config.PORT}...")
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
