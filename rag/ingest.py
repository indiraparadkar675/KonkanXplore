import json
import os

from langchain_core.documents import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


DATA_DIR = "data"
VECTORSTORE_DIR = "vectorstore"


def load_json_file(file_path):
    """Load records from a JSON file."""
    with open(file_path, "r", encoding="utf-8") as file:
        return json.load(file)


def create_documents():
    """Convert all tourism JSON records into LangChain documents."""

    documents = []

    for filename in os.listdir(DATA_DIR):

        if not filename.endswith(".json"):
            continue

        file_path = os.path.join(DATA_DIR, filename)
        records = load_json_file(file_path)

        for record in records:

            text_parts = []

            for key, value in record.items():

                if key == "id":
                    continue

                if isinstance(value, (dict, list)):
                    value = json.dumps(value, ensure_ascii=False)

                text_parts.append(f"{key}: {value}")

            text = "\n".join(text_parts)

            documents.append(
                Document(
                    page_content=text,
                    metadata={
                        "source": filename,
                        "id": record.get("id"),
                        "name": record.get("name")
                    }
                )
            )

    return documents


def create_vectorstore():
    """Create FAISS vector database from tourism data."""

    print("Loading tourism data...")

    documents = create_documents()

    print(f"Loaded {len(documents)} tourism records.")

    print("Loading embedding model...")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    print("Creating FAISS vector store...")

    vectorstore = FAISS.from_documents(
        documents,
        embeddings
    )

    os.makedirs(VECTORSTORE_DIR, exist_ok=True)

    vectorstore.save_local(VECTORSTORE_DIR)

    print("✅ Vector store created successfully!")
    print(f"Saved to: {VECTORSTORE_DIR}")


if __name__ == "__main__":
    create_vectorstore()