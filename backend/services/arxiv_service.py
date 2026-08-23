import requests
from langchain_core.documents import Document


ARXIV_API_URL = "http://export.arxiv.org/api/query"


def search_arxiv(query, max_results=5, sort_by="relevance"):
    """Search arXiv for papers matching the query."""
    params = {
        "search_query": f"all:{query}",
        "sortBy": sort_by,
        "max_results": max_results,
    }
    response = requests.get(ARXIV_API_URL, params=params)
    response.raise_for_status()
    return parse_arxiv_response(response.text)


def parse_arxiv_response(xml_text):
    """Parse arXiv API XML response into LangChain Documents."""
    from xml.etree import ElementTree as ET

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    root = ET.fromstring(xml_text)

    def text(path, element=None):
        el = (element or root).find(path, ns)
        return el.text.strip() if el is not None and el.text else ""

    entries = root.findall("atom:entry", ns)
    documents = []

    for entry in entries:
        title = text("atom:title", entry).replace("\n", " ").strip()
        summary = text("atom:summary", entry).replace("\n", " ").strip()
        published = text("atom:published", entry)

        authors = []
        for author in entry.findall("atom:author", ns):
            name = text("atom:name", author)
            if name:
                authors.append(name)

        id_url = text("atom:id", entry)
        arxiv_id = id_url.split("/abs/")[-1].split("v")[0] if id_url else ""
        pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
        html_url = f"https://arxiv.org/abs/{arxiv_id}"

        doc = Document(
            page_content=f"Title: {title}\n\nAbstract: {summary}\n\nAuthors: {', '.join(authors)}\n\narXiv ID: {arxiv_id}",
            metadata={
                "title": title,
                "abstract": summary,
                "authors": authors,
                "arxiv_id": arxiv_id,
                "pdf_url": pdf_url,
                "html_url": html_url,
                "published": published,
                "source": "arxiv",
            },
        )
        documents.append(doc)

    return documents


def format_documents_for_rag(documents):
    """Format arxiv documents into context string for RAG."""
    context_parts = []
    for i, doc in enumerate(documents, 1):
        meta = doc.metadata
        part = f"Paper {i}: {meta['title']}\nAbstract: {meta['abstract']}\nAuthors: {', '.join(meta['authors'])}\narXiv: {meta['arxiv_id']}"
        context_parts.append(part)
    return "\n\n".join(context_parts)