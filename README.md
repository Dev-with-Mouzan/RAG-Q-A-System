<div align="center">

# ✨ RAG Studio - Intelligent PDF Analyzer

<p align="center">
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/FastAPI.svg" height="40" alt="FastAPI" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/Python-Dark.svg" height="40" alt="Python" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/HTML.svg" height="40" alt="HTML5" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/CSS.svg" height="40" alt="CSS3" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/JavaScript.svg" height="40" alt="JavaScript" />
  <img src="https://raw.githubusercontent.com/tandpfun/skill-icons/main/icons/SQLite.svg" height="40" alt="SQLite" />
</p>

[![Python Version](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1.4-1C3C3C?style=for-the-badge&logo=langchain)](https://langchain.com/)

**Talk to your Documents.** Upload any PDF and get intelligent, context-aware answers instantly powered by AI.

</div>

---

## 🚀 Features

- 📄 **PDF Processing:** Seamlessly upload and parse PDF documents.
- 🧠 **Retrieval-Augmented Generation (RAG):** Context-aware answers utilizing LangChain, FAISS, and Google GenAI/Ollama.
- 💬 **Conversation Management:** Built-in chat history tracking with SQLite. Conversations and messages are saved and easily retrievable.
- 🎨 **Aurora Glassmorphism UI:** A breathtaking, ultra-modern frontend featuring fluid mesh gradients and frosted glass aesthetics.
- ⚡ **High Performance:** Asynchronous endpoints built on FastAPI for lightning-fast responses.

## 🛠️ Technology Stack

- **Backend:** Python 3, FastAPI, Uvicorn
- **AI / NLP:** LangChain, FAISS (Vector Store), PyPDF, Google Generative AI / Ollama
- **Database:** SQLite (via DB Service)
- **Frontend:** Vanilla HTML5, CSS3 (Glassmorphism), JavaScript

## 📂 Project Structure

```text
app/
├── core/
│   ├── llm_service.py      # LLM initialization and response generation
│   ├── load_service.py     # PDF loading and text splitting
│   ├── rag_service.py      # Prompt building and RAG logic
│   └── vector_service.py   # FAISS VectorStore creation and loading
├── services/
│   └── db_service.py       # SQLite Conversation and Message management
├── static/
│   ├── index.html          # Main User Interface
│   ├── styles.css          # Aurora Glassmorphism Styling
│   └── script.js           # Client-side logic and API integration
├── uploads/                # Directory for uploaded PDFs and FAISS indices
├── main.py                 # FastAPI application entry point & routing
└── requirements.txt        # Python dependencies
```

## ⚙️ Installation & Setup

1. **Clone the repository and navigate to the project directory:**
   ```bash
   cd app
   ```

2. **Create and activate a virtual environment:**
   ```bash
   uv venv
   source .venv/bin/activate
   ```

3. **Install dependencies:**
   ```bash
   uv pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory and add your necessary API keys (e.g., Google Gemini API key if using GenAI).
   ```env
   GOOGLE_API_KEY=your_api_key_here
   ```

5. **Run the FastAPI server:**
   ```bash
   uvicorn main:app --reload
   ```

6. **Access the Application:**
   Open your browser and navigate to `http://localhost:8000` to interact with Aura AI!

## 📡 API Endpoints

- `GET /` - Serves the frontend UI.
- `POST /query` - Upload a PDF or query an existing one to get AI-generated insights.
- `GET /api/conversations` - List all chat sessions.
- `POST /api/conversations` - Create a new chat session.
- `GET /api/conversations/{id}` - Get a specific conversation.
- `DELETE /api/conversations/{id}` - Remove a conversation.
- `GET /api/conversations/{id}/messages` - Retrieve chat history for a session.

---

<div align="center">
  <i>Built with ❤️ using FastAPI and LangChain</i>
</div>
# RAG-Q-A-System
