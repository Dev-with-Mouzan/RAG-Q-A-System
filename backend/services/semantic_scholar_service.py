import requests
from langchain_core.documents import Document


def search_semantic_scholar(query, max_results=5):
    """Search Semantic Scholar papers matching the query using Crossref API."""
    url = "https://api.crossref.org/works"
    params = {
        "query": query,
        "rows": max_results,
        "select": "title,author,container-title,abstract,published-print,pub-id",
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()
    documents = []

    for item in data.get("message", {}).get("items", []):
        title = item.get("title", [""])[0] if item.get("title") else ""
        authors = [a.get("family", "") + ", " + a.get("given", "")
                   for a in item.get("author", [])]
        authors = [a.strip() for a in authors if a]
        abstract = item.get("abstract", "")
        journal = item.get("container-title", [""])[0] if item.get("container-title") else ""
        published = item.get("published-print", {}).get("date-parts", [[None]])[0][0] if item.get("published-print") else ""

        arxiv_id = item.get("DOI", "")

        pdf_url = f"https://doi.org/{arxiv_id}" if arxiv_id else ""

        doc = Document(
            page_content=f"Title: {title}\n\nAbstract: {abstract}\n\nAuthors: {', '.join(authors)}\nJournal: {journal}",
            metadata={
                "title": title,
                "abstract": abstract,
                "authors": authors,
                "journal": journal,
                "doi": arxiv_id,
                "pdf_url": pdf_url,
                "source": "semantic_scholar",
            },
        )
        documents.append(doc)

    return documents


def format_documents_for_rag(documents):
    """Format semantic scholar documents into context string for RAG."""
    context_parts = []
    for i, doc in enumerate(documents, 1):
        meta = doc.metadata
        part = f"Paper {i}: {meta['title']}\nAbstract: {meta['abstract']}\nAuthors: {', '.join(meta['authors'])}"
        context_parts.append(part)
    return "\n\n".join(context_parts)