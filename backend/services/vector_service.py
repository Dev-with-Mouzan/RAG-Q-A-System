import os
import re
from pathlib import Path

from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

# Load .env from backend/ directory regardless of cwd
_backend_dir = str(Path(__file__).resolve().parent.parent)
load_dotenv(_backend_dir + '/.env')


def get_embeddings(model=None, api_key=None):
    """Builds the OpenAI embedding function used for vector stores."""
    return OpenAIEmbeddings(
        model=model or os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small"),
        api_key=api_key or os.getenv("OPENAI_API_KEY") or None,
    )


def embedding_tag(provider=None, model=None):
    """Sanitized identifier for the embedding config (used in store paths)."""
    safe = re.sub(r"[^a-zA-Z0-9_.-]", "_", model or "default")
    return f"openai_{safe}"


def create_vectorstore(chunks, vectorstore_path="db/vectorstore", provider=None, model=None, api_key=None):
    """Creates a vector store from the provided document chunks and saves it locally."""
    path = Path(vectorstore_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    vectorstore = FAISS.from_documents(chunks, get_embeddings(model, api_key))
    vectorstore.save_local(str(path))
    return vectorstore


def load_vectorstore(vectorstore_path="db/vectorstore", provider=None, model=None, api_key=None):
    """Loads the vector store from the provided local path."""
    vectorstore = FAISS.load_local(
        vectorstore_path,
        get_embeddings(model, api_key),
        allow_dangerous_deserialization=True,
    )
    return vectorstore
