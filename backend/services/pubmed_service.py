import requests
from langchain_core.documents import Document


def search_pubmed(query, max_results=5):
    """Search PubMed for biomedical papers matching the query."""
    base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmax": max_results,
        "retmode": "json",
    }
    response = requests.get(base_url, params=params)
    response.raise_for_status()
    data = response.json()
    id_list = data.get("esearchresult", {}).get("idlist", [])

    if not id_list:
        return []

    # Fetch summaries for the found IDs
    summary_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    summary_params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "retmode": "json",
    }
    summary_response = requests.get(summary_url, params=summary_params)
    summary_response.raise_for_status()
    summary_data = summary_response.json()

    # Fetch full abstracts
    fetch_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi"
    fetch_params = {
        "db": "pubmed",
        "id": ",".join(id_list),
        "rettype": "abstract",
        "retmode": "text",
    }
    fetch_response = requests.get(fetch_url, params=fetch_params)
    fetch_response.raise_for_status()
    fetch_text = fetch_response.text

    documents = []
    from xml.etree import ElementTree as ET

    root = ET.fromstring(f"<root>{fetch_text}</root>")
    for pid in id_list:
        article = summary_data.get("result", {}).get(pid, {})
        title = article.get("title", "")
        authors = article.get("authors", [])
        author_names = [f"{a.get('lastname', '')}, {a.get('firstname', '')}".strip()
                       for a in authors if a]
        abstract_match = root.findtext(f".//PMID[@Value='{pid}']/Abstract/AbstractText", "")
        
        doi_elem = article.get("elocation-id", "")
        pubdate = article.get("pubdate", "")

        pdf_url = f"https://doi.org/{doi_elem}" if doi_elem else ""

        doc = Document(
            page_content=f"Title: {title}\n\nAbstract: {abstract_match}\n\nAuthors: {', '.join(author_names)}",
            metadata={
                "title": title,
                "abstract": abstract_match,
                "authors": author_names,
                "doi": doi_elem,
                "pdf_url": pdf_url,
                "published": pubdate,
                "source": "pubmed",
            },
        )
        documents.append(doc)

    return documents


def format_documents_for_rag(documents):
    """Format pubmed documents into context string for RAG."""
    context_parts = []
    for i, doc in enumerate(documents, 1):
        meta = doc.metadata
        part = f"Paper {i}: {meta['title']}\nAbstract: {meta['abstract']}\nAuthors: {', '.join(meta['authors'])}"
        context_parts.append(part)
    return "\n\n".join(context_parts)