import os
from typing import List, Dict

from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter


EMBEDDING_MODEL = "BAAI/bge-small-en-v1.5"


def get_embeddings():
    """
    Load local HuggingFace embeddings.
    """

    encode_kwargs = {
        "normalize_embeddings": True
    }

    return HuggingFaceBgeEmbeddings(
        model_name=EMBEDDING_MODEL,
        model_kwargs={"device": "cpu"},
        encode_kwargs=encode_kwargs
    )


def create_vector_store(texts: List[str], metadatas: List[Dict]):
    """
    Create FAISS vector store from resume texts.
    """

    if not texts:
        raise ValueError("No resume text data provided.")

    embeddings = get_embeddings()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""]
    )

    splits = []
    final_metadatas = []

    for text, metadata in zip(texts, metadatas):

        if not text or text.startswith("Error"):
            continue

        chunks = text_splitter.split_text(text)

        for chunk in chunks:
            splits.append(chunk)
            final_metadatas.append(metadata)

    if not splits:
        raise ValueError("No valid text chunks generated.")

    vector_store = FAISS.from_texts(
        texts=splits,
        embedding=embeddings,
        metadatas=final_metadatas
    )

    return vector_store


def save_vector_store(vector_store, path="vector_store"):
    """
    Save FAISS vector store locally.
    """

    os.makedirs(path, exist_ok=True)
    vector_store.save_local(path)

    print(f"✅ Vector store saved at: {path}")


def load_vector_store(path="vector_store"):
    """
    Load FAISS vector store.
    """

    if not os.path.exists(path):
        raise FileNotFoundError(
            f"Vector store path '{path}' does not exist."
        )

    embeddings = get_embeddings()

    return FAISS.load_local(
        path,
        embeddings,
        allow_dangerous_deserialization=True
    )