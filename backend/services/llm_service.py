import os
from pathlib import Path

from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# Load .env from backend/ directory regardless of cwd
_backend_dir = str(Path(__file__).resolve().parent.parent)
load_dotenv(_backend_dir + '/.env')


def build_llm(model=None, api_key=None):
    """Builds the OpenAI chat model used for answer generation."""
    return ChatOpenAI(
        model=model or os.getenv("OPENAI_MODEL", "gpt-4o"),
        api_key=api_key or os.getenv("OPENAI_API_KEY") or None,
    )


def get_response(query, provider=None, model=None, api_key=None):
    """Generates a response from the language model based on the provided query.

    `provider` is accepted for API compatibility but ignored — OpenAI only.
    """
    llm = build_llm(model, api_key)
    response = llm.invoke(query)
    return response.content
