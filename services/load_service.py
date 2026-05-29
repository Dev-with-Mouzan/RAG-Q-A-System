from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

def load_and_split_pdf(input_path):
    """Loads a PDF file from the specified path and splits it into chunks."""
    loader = PyPDFLoader(input_path)
    pages = loader.load()

    splitter = RecursiveCharacterTextSplitter(chunk_size=150, chunk_overlap=20)
    chunks = splitter.split_documents(pages)

    return chunks