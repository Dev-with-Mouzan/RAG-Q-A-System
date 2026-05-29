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
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

app = FastAPI()

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

upload_dir = BASE_DIR / "uploads"
os.makedirs(upload_dir, exist_ok=True)


@app.get("/")
def read_root():
    return FileResponse(STATIC_DIR / "index.html")


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


# ─── Query endpoint ───

@app.post("/query")
async def query_pdf(
    query: str = Form(...),
    file: UploadFile = File(None),
    pdf_name: str = Form(None),
    conversation_id: int = Form(None),
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
    }
