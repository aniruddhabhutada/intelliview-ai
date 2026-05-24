import json
import os
import threading
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend import config

# Thread lock for local JSON database file operations
db_lock = threading.Lock()

class LocalJSONDatabase:
    """A thread-safe local JSON database for out-of-the-box local testing."""
    def __init__(self, filepath: str):
        self.filepath = filepath
        self._init_db()

    def _init_db(self):
        with db_lock:
            if not os.path.exists(self.filepath):
                with open(self.filepath, "w") as f:
                    json.dump({
                        "users": {},
                        "resume_analyses": {},
                        "interview_sessions": {}
                    }, f, indent=2)

    def _read_db(self) -> Dict[str, Any]:
        with db_lock:
            try:
                with open(self.filepath, "r") as f:
                    return json.load(f)
            except Exception:
                return {"users": {}, "resume_analyses": {}, "interview_sessions": {}}

    def _write_db(self, data: Dict[str, Any]):
        with db_lock:
            with open(self.filepath, "w") as f:
                json.dump(data, f, indent=2)

    # User CRUD
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        db = self._read_db()
        return db["users"].get(user_id)

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        db = self._read_db()
        user_id = user_data["id"]
        db["users"][user_id] = user_data
        self._write_db(db)
        return user_data

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = self._read_db()
        if user_id in db["users"]:
            db["users"][user_id].update(updates)
            self._write_db(db)
            return db["users"][user_id]
        return None

    def list_users(self) -> List[Dict[str, Any]]:
        db = self._read_db()
        return list(db["users"].values())

    # Resume Analysis CRUD
    def get_resume_analysis(self, user_id: str) -> Optional[Dict[str, Any]]:
        db = self._read_db()
        # Find the latest analysis for the user
        analyses = [a for a in db["resume_analyses"].values() if a["user_id"] == user_id]
        if not analyses:
            return None
        # Sort by created_at descending
        analyses.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return analyses[0]

    def save_resume_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        db = self._read_db()
        analysis_id = analysis_data["id"]
        db["resume_analyses"][analysis_id] = analysis_data
        self._write_db(db)
        return analysis_data

    def list_resume_analyses(self) -> List[Dict[str, Any]]:
        db = self._read_db()
        return list(db["resume_analyses"].values())

    # Interview Sessions CRUD
    def get_interview_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        db = self._read_db()
        return db["interview_sessions"].get(session_id)

    def create_interview_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        db = self._read_db()
        session_id = session_data["id"]
        db["interview_sessions"][session_id] = session_data
        self._write_db(db)
        return session_data

    def update_interview_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        db = self._read_db()
        if session_id in db["interview_sessions"]:
            db["interview_sessions"][session_id].update(updates)
            self._write_db(db)
            return db["interview_sessions"][session_id]
        return None

    def list_interview_sessions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        db = self._read_db()
        sessions = list(db["interview_sessions"].values())
        if user_id:
            sessions = [s for s in sessions if s["user_id"] == user_id]
        return sorted(sessions, key=lambda x: x.get("created_at", ""), reverse=True)


class FirebaseFirestoreDatabase:
    """Production database engine using Firebase Cloud Firestore."""
    def __init__(self):
        import firebase_admin
        from firebase_admin import credentials, firestore
        
        # Initialize Firebase App if not already initialized
        if not firebase_admin._apps:
            if os.getenv("FIREBASE_CREDENTIALS_JSON"):
                cred_dict = json.loads(os.getenv("FIREBASE_CREDENTIALS_JSON"))
                cred = credentials.Certificate(cred_dict)
            elif os.path.exists(config.FIREBASE_CREDENTIALS_PATH):
                cred = credentials.Certificate(config.FIREBASE_CREDENTIALS_PATH)
            else:
                cred = credentials.ApplicationDefault()
            firebase_admin.initialize_app(cred)
        
        self.db = firestore.client()

    # User CRUD
    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection("users").document(user_id).get()
        return doc.to_dict() if doc.exists else None

    def create_user(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        user_id = user_data["id"]
        self.db.collection("users").document(user_id).set(user_data)
        return user_data

    def update_user(self, user_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc_ref = self.db.collection("users").document(user_id)
        if doc_ref.get().exists:
            doc_ref.update(updates)
            return doc_ref.get().to_dict()
        return None

    def list_users(self) -> List[Dict[str, Any]]:
        docs = self.db.collection("users").stream()
        return [doc.to_dict() for doc in docs]

    # Resume Analysis CRUD
    def get_resume_analysis(self, user_id: str) -> Optional[Dict[str, Any]]:
        docs = self.db.collection("resume_analyses")\
            .where("user_id", "==", user_id)\
            .order_by("created_at", direction="DESCENDING")\
            .limit(1)\
            .stream()
        analyses = [doc.to_dict() for doc in docs]
        return analyses[0] if analyses else None

    def save_resume_analysis(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        analysis_id = analysis_data["id"]
        self.db.collection("resume_analyses").document(analysis_id).set(analysis_data)
        return analysis_data

    def list_resume_analyses(self) -> List[Dict[str, Any]]:
        docs = self.db.collection("resume_analyses").stream()
        return [doc.to_dict() for doc in docs]

    # Interview Sessions CRUD
    def get_interview_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        doc = self.db.collection("interview_sessions").document(session_id).get()
        return doc.to_dict() if doc.exists else None

    def create_interview_session(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        session_id = session_data["id"]
        self.db.collection("interview_sessions").document(session_id).set(session_data)
        return session_data

    def update_interview_session(self, session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        doc_ref = self.db.collection("interview_sessions").document(session_id)
        if doc_ref.get().exists:
            doc_ref.update(updates)
            return doc_ref.get().to_dict()
        return None

    def list_interview_sessions(self, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.db.collection("interview_sessions")
        if user_id:
            query = query.where("user_id", "==", user_id)
        docs = query.order_by("created_at", direction="DESCENDING").stream()
        return [doc.to_dict() for doc in docs]


# Instantiate the active database client based on active mode
if config.DATABASE_MODE == "firebase":
    db_client = FirebaseFirestoreDatabase()
else:
    db_client = LocalJSONDatabase(str(config.LOCAL_DB_PATH))


def get_db():
    """Utility helper to return the active database client instance."""
    return db_client
