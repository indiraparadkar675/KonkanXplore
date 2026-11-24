from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


VECTORSTORE_DIR = "vectorstore"


def load_vectorstore():
    """Load the existing FAISS vector store."""

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.load_local(
        VECTORSTORE_DIR,
        embeddings,
        allow_dangerous_deserialization=True
    )

    return vectorstore


def search_places(query, k=5):
    """Search the tourism knowledge base."""

    vectorstore = load_vectorstore()

    results = vectorstore.similarity_search(
        query,
        k=k
    )

    return results


if __name__ == "__main__":

    query = input("Enter your tourism query: ")

    results = search_places(query)

    print("\n🔎 Search Results:\n")

    for i, document in enumerate(results, start=1):

        print(f"--- Result {i} ---")
        print(f"Name: {document.metadata.get('name')}")
        print(f"Source: {document.metadata.get('source')}")
        print(document.page_content)
        print()