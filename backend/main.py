import re
import sys
import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("literaai")

# Ensure backend/ is in Python path for module resolution
_backend_dir = str(Path(__file__).resolve().parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from services.llm_service import get_response
from services.rag_service import build_prompt
from services.load_service import load_and_split_pdf
from services.vector_service import create_vectorstore, load_vectorstore, embedding_tag
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
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from concurrent.futures import ThreadPoolExecutor
import asyncio

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
DIST_DIR = FRONTEND_DIR / "dist"
ASSETS_DIR = DIST_DIR / "assets"

if ASSETS_DIR.is_dir():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")


@app.get("/")
def serve_index():
    if (DIST_DIR / "index.html").is_file():
        return FileResponse(str(DIST_DIR / "index.html"))
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
        meta = doc.metadata
        published = str(meta.get("published") or meta.get("date") or "")
        year_match = re.search(r"\d{4}", published)
        return {
            "title": (meta.get("title") or "").strip(),
            "authors": [a.strip() for a in (meta.get("authors") or []) if isinstance(a, str) and a.strip()],
            "abstract": (meta.get("abstract") or doc.page_content[:500]).strip(),
            "url": meta.get("pdf_url") or meta.get("html_url") or "",
            "year": year_match.group(0) if year_match else "",
            "source": src,
        }

    loop = asyncio.get_event_loop()
    src = (source or "all").strip().lower()

    if src in ("arxiv", "all", "hybrid"):
        try:
            docs = await loop.run_in_executor(executor, search_arxiv, q, 5, "relevance")
            results.extend([to_dict(d, "arXiv") for d in docs])
        except Exception as e:
            logger.warning(f"arxiv search failed: {e}")

    if src in ("semantic_scholar", "semantic", "all", "hybrid"):
        try:
            docs = await loop.run_in_executor(executor, search_semantic_scholar, q, 5)
            results.extend([to_dict(d, "Semantic Scholar") for d in docs])
        except Exception as e:
            logger.warning(f"semantic scholar search failed: {e}")

    if src in ("pubmed", "all", "hybrid"):
        try:
            docs = await loop.run_in_executor(executor, search_pubmed, q, 5)
            results.extend([to_dict(d, "PubMed") for d in docs])
        except Exception as e:
            logger.warning(f"pubmed search failed: {e}")

    return {"results": results}


# ── Chat about a specific paper ──────────────────────────────────────

@app.post("/paper-chat")
async def paper_chat(request: Request):
    data = await request.json()
    paper = data.get("paper") or {}
    query = (data.get("query") or "").strip()
    history = data.get("messages") or []
    model = data.get("model")
    api_key = data.get("api_key")

    if not query:
        raise HTTPException(status_code=400, detail="Please type a question about the paper.")

    title = (paper.get("title") or "Untitled").strip()
    authors = ", ".join(
        a.strip() for a in (paper.get("authors") or []) if isinstance(a, str) and a.strip()
    ) or "Unknown"
    year = paper.get("year") or "n/a"
    url = paper.get("url") or "n/a"
    abstract = (paper.get("abstract") or "").strip() or "(abstract unavailable)"

    prompt = (
        "You are a research assistant helping a user understand an academic paper.\n"
        "Answer questions about this paper based ONLY on the information provided below.\n"
        "If that information is not enough to answer, say so briefly and honestly.\n"
        "Be concise, clear, and use plain language.\n\n"
        f"PAPER:\nTitle: {title}\nAuthors: {authors}\nYear: {year}\nLink: {url}\nAbstract: {abstract}\n"
    )
    convo = ""
    for m in history[-10:]:
        content = (m.get("content") or "").strip()
        if content:
            role = "User" if m.get("role") == "user" else "Assistant"
            convo += f"{role}: {content}\n"
    if convo:
        prompt += f"\nCONVERSATION SO FAR:\n{convo}\n"
    prompt += f"\nUser: {query}\nAssistant:"

    loop = asyncio.get_event_loop()
    try:
        answer = await loop.run_in_executor(executor, get_response, prompt, None, model, api_key)
    except HTTPException:
        raise
    except Exception as e:
        detail = str(e)
        status = 502 if "401" not in detail and "api key" not in detail.lower() else 401
        raise HTTPException(status_code=status, detail=detail)

    return {"response": answer}


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
    provider: str = Form(None),
    model: str = Form(None),
    embedding_model: str = Form(None),
    api_key: str = Form(None),
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

    vectorstore_path = upload_dir / (
        f"{Path(resolved_name).stem}_vs_{embedding_tag(None, embedding_model)}"
    )

    if source_type == "arxiv":
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(
            executor, search_arxiv, search_query or query, 5, arxiv_sort
        )
        context = format_arxiv_docs(docs)
    elif source_type == "semantic_scholar":
        loop = asyncio.get_event_loop()
        docs = await loop.run_in_executor(
            executor, search_semantic_scholar, search_query or query, 5
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
            vectorstore = load_vectorstore(
                str(vectorstore_path), model=embedding_model, api_key=api_key
            )
        else:
            documents = load_and_split_pdf(str(file_path))
            vectorstore = create_vectorstore(
                documents, str(vectorstore_path), model=embedding_model, api_key=api_key
            )
        context = vectorstore.similarity_search(query, k=3)

    prompt = build_prompt(context, query)
    response = get_response(prompt, provider=provider, model=model, api_key=api_key)

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


# ─── Static frontend (registered last so API routes take priority) ───

@app.get("/{static_path:path}", include_in_schema=False)
def serve_frontend(static_path: str):
    dist_index = DIST_DIR / "index.html"
    if not dist_index.is_file():
        raise HTTPException(404, "Frontend build not found — run `npm run build` in frontend/")

    candidate = (DIST_DIR / static_path).resolve()
    try:
        candidate.relative_to(DIST_DIR.resolve())
    except ValueError:
        raise HTTPException(404)

    if static_path and candidate.is_file():
        return FileResponse(str(candidate))
    return FileResponse(str(dist_index))