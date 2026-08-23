from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from pathlib import Path

# Load .env from backend/ directory regardless of cwd
_backend_dir = str(Path(__file__).resolve().parent.parent)
load_dotenv(_backend_dir + '/.env')

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")

def get_response(query):
    """Generates a response from the language model based on the provided query."""
    response = llm.invoke(query)
    return response.content