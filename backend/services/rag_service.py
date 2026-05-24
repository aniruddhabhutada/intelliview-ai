import uuid
import logging
from typing import List, Dict, Any
try:
    from langchain_text_splitters import RecursiveCharacterTextSplitter
except ImportError:
    from langchain.text_splitter import RecursiveCharacterTextSplitter
from backend import config

logger = logging.getLogger(__name__)

# Attempt to initialize ChromaDB. Fall back gracefully to a Python-based keyword search if Chroma fails.
USE_CHROMA = True
chroma_client = None
resumes_collection = None

try:
    import chromadb
    from chromadb.utils import embedding_functions
    
    chroma_client = chromadb.PersistentClient(path=config.CHROMA_DB_PATH)
    # Use Chroma's default sentence-transformer embedding function
    # It will download the lightweight 'all-MiniLM-L6-v2' model automatically on first run
    default_ef = embedding_functions.DefaultEmbeddingFunction()
    resumes_collection = chroma_client.get_or_create_collection(
        name="user_resumes",
        embedding_function=default_ef
    )
    print("[RAG] ChromaDB vector database initialized successfully.")
except Exception as e:
    logger.warning(f"[RAG] Failed to initialize ChromaDB. Using fallback search service. Error: {str(e)}")
    USE_CHROMA = False

# Backup in-memory storage for Local/Fallback RAG Mode
fallback_store: Dict[str, List[Dict[str, Any]]] = {}

class RAGService:
    @staticmethod
    def ingest_resume(user_id: str, parsed_text: str):
        """Chunks the resume text and saves it into the active vector database."""
        # Clean existing entries for this user to avoid duplicating old data
        RAGService.clear_user_data(user_id)

        # Chunk the text using LangChain's RecursiveCharacterTextSplitter
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        chunks = splitter.split_text(parsed_text)

        if not chunks:
            chunks = [parsed_text]

        if USE_CHROMA and resumes_collection:
            try:
                ids = [f"{user_id}_{uuid.uuid4()}" for _ in chunks]
                metadatas = [{"user_id": user_id} for _ in chunks]
                resumes_collection.add(
                    documents=chunks,
                    ids=ids,
                    metadatas=metadatas
                )
                print(f"[RAG] Ingested {len(chunks)} chunks into ChromaDB for user {user_id}.")
                return
            except Exception as e:
                logger.error(f"[RAG] ChromaDB ingestion failed: {str(e)}. Falling back.")

        # Fallback In-Memory Ingestion
        fallback_store[user_id] = [
            {"chunk_id": f"{user_id}_{i}", "text": chunk} for i, chunk in enumerate(chunks)
        ]
        print(f"[RAG] Ingested {len(chunks)} chunks into Local RAG Fallback for user {user_id}.")

    @staticmethod
    def retrieve_relevant_chunks(user_id: str, query: str, k: int = 4) -> List[str]:
        """Retrieves the top-k most relevant resume chunks for the given query."""
        if USE_CHROMA and resumes_collection:
            try:
                results = resumes_collection.query(
                    query_texts=[query],
                    n_results=k,
                    where={"user_id": user_id}
                )
                if results and "documents" in results and results["documents"]:
                    # Return the flat list of retrieved chunks
                    retrieved = results["documents"][0]
                    if retrieved:
                        return retrieved
            except Exception as e:
                logger.error(f"[RAG] ChromaDB query failed: {str(e)}. Using fallback search.")

        # Fallback Search (Keyword TF-IDF-like similarity matching)
        user_chunks = fallback_store.get(user_id, [])
        if not user_chunks:
            return []

        # Simple score based on term matching
        scored_chunks = []
        query_words = set(query.lower().split())
        
        for chunk in user_chunks:
            text = chunk["text"].lower()
            # Calculate intersection score
            score = sum(1 for word in query_words if word in text)
            scored_chunks.append((score, chunk["text"]))
        
        # Sort by score descending and return top-k
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk_text for score, chunk_text in scored_chunks[:k]]

    @staticmethod
    def clear_user_data(user_id: str):
        """Removes existing resume chunks for the user."""
        if USE_CHROMA and resumes_collection:
            try:
                resumes_collection.delete(where={"user_id": user_id})
            except Exception as e:
                logger.debug(f"[RAG] ChromaDB delete error: {str(e)}")
        
        if user_id in fallback_store:
            del fallback_store[user_id]
