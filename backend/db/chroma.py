import chromadb
from backend.utils.embedding import embedding_fn

PERSIST_DIR = "./dataset/chroma_db"
COLLECTION_NAME = "bhagavad_gita"

def get_chroma_client():
    return chromadb.PersistentClient(path=PERSIST_DIR)

def get_or_create_collection():
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
    )

def get_collection():
    client = get_chroma_client()
    return client.get_collection(
        name=COLLECTION_NAME,
        embedding_function=embedding_fn,
    )