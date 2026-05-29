from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

load_dotenv()

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash-lite")

def get_response(query):
    """Generates a response from the language model based on the provided query."""
    response = llm.invoke(query)
    return response.content