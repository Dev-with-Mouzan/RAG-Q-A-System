import sys
from pathlib import Path

# Ensure backend/ is in Python path for module resolution
_backend_dir = str(Path(__file__).resolve().parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from services.llm_service import get_response
from services.rag_service import build_prompt
from services.load_service import load_and_split_pdf
from services.vector_service import create_vectorstore, load_vectorstore
from services.db_service import (
    create_conversation,
    get_conversations,
    get_conversation,
    update_conversation,
    delete_conversation,
    add_message,
    get_messages,
)
from services.arxiv_service import search_arxiv, format_documents_for_rag as format_arxiv_docs
from services.semantic_scholar_service import search_semantic_scholar, format_documents_for_rag as format_ss_docs
from services.pubmed_service import search_pubmed, format_documents_for_rag as format_pubmed_docs
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from concurrent.futures import ThreadPoolExecutor
import asyncio

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/")
def serve_index():
    return FileResponse(str(FRONTEND_DIR / "index.html"))

upload_dir = BASE_DIR / "uploads"
os.makedirs(upload_dir, exist_ok=True)

executor = ThreadPoolExecutor(max_workers=4)


# ─── Conversation endpoints ───

@app.get("/api/conversations")
def list_conversations():
    return get_conversations()


@app.post("/api/conversations")
def new_conversation(title: str = "Untitled", pdf_name: str = None):
    conv_id = create_conversation(title, pdf_name)
    conv = get_conversation(conv_id)
    return conv


@app.get("/api/conversations/{conv_id}")
def read_conversation(conv_id: int):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")
    return conv


@app.put("/api/conversations/{conv_id}")
def edit_conversation(conv_id: int, title: str = None, pdf_name: str = None):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")
    update_conversation(conv_id, title, pdf_name)
    return get_conversation(conv_id)


@app.delete("/api/conversations/{conv_id}")
def remove_conversation(conv_id: int):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")
    delete_conversation(conv_id)
    return {"ok": True}


@app.get("/api/conversations/{conv_id}/messages")
def list_messages(conv_id: int):
    conv = get_conversation(conv_id)
    if not conv:
        raise HTTPException(404, "Conversation not found")
    return get_messages(conv_id)


# ─── Search endpoint for Search page ───

@app.get("/search")
async def search_papers(q: str, source: str = "all"):
    results = []

    def to_dict(doc, src):
        return {
            "title": doc.metadata.get("title", doc.page_content[:80]),
            "authors": doc.metadata.get("authors", []),
            "abstract": doc.page_content[:500],
            "url": doc.metadata.get("pdf_url", doc.metadata.get("html_url", "")),
            "date": doc.metadata.get("published", doc.metadata.get("date", "")),
            "source": src,
        }

    loop = asyncio.get_event_loop()

    if source in ("arxiv", "all"):
        try:
            docs = await loop.run_in_executor(executor, search_arxiv, q, 5, "relevance")
            results.extend([to_dict(d, "arXiv") for d in docs])
        except Exception:
            pass

    if source in ("semantic_scholar", "all"):
        try:
            docs = await loop.run_in_executor(executor, search_semantic_scholar, q, 5)
            results.extend([to_dict(d, "Semantic Scholar") for d in docs])
        except Exception:
            pass

    if source in ("pubmed", "all"):
        try:
            docs = await loop.run_in_executor(executor, search_pubmed, q, 5)
            results.extend([to_dict(d, "PubMed") for d in docs])
        except Exception:
            pass

    return {"results": results}


# ─── Query endpoint with multi-source support ───

@app.post("/query")
async def query_pdf(
    query: str = Form(...),
    source_type: str = Form("user"),
    search_query: str = Form(None),
    file: UploadFile = File(None),
    pdf_name: str = Form(None),
    conversation_id: int = Form(None),
    arxiv_sort: str = Form("relevance"),
    ss_sort: str = Form("relevance"),
    pm_sort: str = Form("relevance"),
):
    # Resolve PDF source
    if file and file.filename:
        if file.content_type != "application/pdf":
            raise HTTPException(
                status_code=400, detail="Invalid file type. Please upload a PDF file."
            )
        resolved_name = file.filename
        file_path = upload_dir / resolved_name
        with open(file_path, "wb") as f:
            f.write(await file.read())
    elif pdf_name:
        resolved_name = pdf_name
        file_path = upload_dir / resolved_name
        if not file_path.exists():
            raise HTTPException(
                status_code=404,
                detail=f"File '{pdf_name}' not found on server. Please upload it again.",
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="No file provided. Upload a PDF or reference an existing one.",
        )

    # Auto-create conversation if not provided
    if not conversation_id:
        conversation_id = create_conversation(
            title=resolved_name, pdf_name=resolved_name
        )

    # Save user message
    add_message(conversation_id, "user", query)

    vectorstore_path = upload_dir / f"{Path(resolved_name).stem}_vectorstore"

    if source_type == "arxiv":
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(
            executor, search_arxiv, search_query or query, 5, arxiv_sort
        )
        context = format_arxiv_docs(docs)
    elif source_type == "semantic_scholar":
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(
            search_semantic_scholar, search_query or query, 5
        )
        context = format_ss_docs(docs)
    elif source_type == "pubmed":
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(search_pubmed, search_query or query, 5)
        context = format_pubmed_docs(docs)
    elif source_type == "hybrid":
        loop = asyncio.get_event_loop()
        results = await loop.run_in_executor(
            exec_hybrid_search,
            query,
            arxiv_sort,
            ss_sort,
            pm_sort,
        )
        context = format_hybrid_context(results)
    else:
        if vectorstore_path.exists():
            vectorstore = load_vectorstore(str(vectorstore_path))
        else:
            documents = load_and_split_pdf(str(file_path))
            vectorstore = create_vectorstore(documents, str(vectorstore_path))
        context = vectorstore.similarity_search(query, k=3)

    prompt = build_prompt(context, query)
    response = get_response(prompt)

    # Save assistant message
    add_message(conversation_id, "assistant", response)

    return {
        "response": response,
        "conversation_id": conversation_id,
        "source_type": source_type,
    }


def exec_hybrid_search(query, arxiv_sort, ss_sort, pm_sort):
    """Execute searches across all public sources in parallel."""
    with ThreadPoolExecutor(max_workers=4) as ex:
        arxiv_future = ex.submit(search_arxiv, query, 3, arxiv_sort)
        ss_future = ex.submit(search_semantic_scholar, query, 3)
        pm_future = ex.submit(search_pubmed, query, 3)

        arxiv_docs = arxiv_future.result()
        ss_docs = ss_future.result()
        pm_docs = pm_future.result()

    # Combine and deduplicate by source URL
    seen = set()
    all_docs = []
    for doc in arxiv_docs + ss_docs + pm_docs:
        key = doc.metadata.get("pdf_url", doc.metadata.get("html_url", ""))
        if key not in seen:
            seen.add(key)
            all_docs.append(doc)

    # Get top 3 overall
    return all_docs[:3]


def format_hybrid_context(results):
    """Format hybrid search results into context string."""
    arxiv_docs, ss_docs, pm_docs = results
    parts = []
    if arxiv_docs:
        parts.append(f"arXiv Papers:\n{format_arxiv_docs(arxiv_docs)}")
    if ss_docs:
        parts.append(f"Semantic Scholar Papers:\n{format_ss_docs(ss_docs)}")
    if pm_docs:
        parts.append(f"PubMed Papers:\n{format_pubmed_docs(pm_docs)}")
    return "\n\n".join(parts)