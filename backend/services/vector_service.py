from pathlib import Path
from langchain_ollama import OllamaEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OllamaEmbeddings(model="nomic-embed-text-v2-moe:latest")


def create_vectorstore(chunks, vectorstore_path="db/vectorstore"):
    """Creates a vector store from the provided document chunks and saves it locally."""
    path = Path(vectorstore_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    vectorstore = FAISS.from_documents(chunks, embeddings)
    vectorstore.save_local(str(path))
    return vectorstore


def load_vectorstore(vectorstore_path="db/vectorstore"):
    """Loads the vector store from the provided local path."""
    vectorstore = FAISS.load_local(
        vectorstore_path,
        embeddings,
        allow_dangerous_deserialization=True,
    )
    return vectorstore




