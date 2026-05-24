import os
from pathlib import Path
from dotenv import load_dotenv

# Load env variables from a .env file if it exists
load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent
LOCAL_DB_DIR = BASE_DIR / "local_db"
LOCAL_DB_PATH = LOCAL_DB_DIR / "db.json"
CHROMA_DB_PATH = str(BASE_DIR / "db" / "chroma")
UPLOAD_DIR = BASE_DIR / "uploads"

# Create directories if they don't exist
LOCAL_DB_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Environment configuration variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
FIREBASE_CREDENTIALS_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
PORT = int(os.getenv("PORT", 8000))

# Auto-detect database mode
# If a Firebase service account credential file is available, we can use 'firebase'. Otherwise, fall back to 'local'.
DATABASE_MODE = os.getenv("DATABASE_MODE", "auto").lower()

if DATABASE_MODE == "auto":
    if os.path.exists(FIREBASE_CREDENTIALS_PATH) or os.getenv("FIREBASE_CREDENTIALS_JSON"):
        DATABASE_MODE = "firebase"
    else:
        DATABASE_MODE = "local"

print(f"[Config] System initialized in '{DATABASE_MODE.upper()}' database mode.")
