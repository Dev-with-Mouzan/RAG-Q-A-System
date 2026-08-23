from langchain_core.prompts import PromptTemplate

prompt=PromptTemplate(
    input_variables=["context","query"],
    template="Answer the question based on the following context:\n{context}\nQuestion: {query}")

def build_prompt(context,query)->str:
    """Builds a prompt for the language model based on the provided context and query."""

    final_query=prompt.format(context=context,query=query)
    return final_query