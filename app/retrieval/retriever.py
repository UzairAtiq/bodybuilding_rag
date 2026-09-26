import os
from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.config import QDRANT_URL, QDRANT_API_KEY, QDRANT_PATH, collection_name

# initialize sentence transformer embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# initialize qdrant client with automatic local and cloud fallback
def init_qdrant_client():
    # check for local qdrant directory first
    if QDRANT_PATH and os.path.exists(QDRANT_PATH):
        try:
            local_client = QdrantClient(path=QDRANT_PATH)
            existing_collections = [c.name for c in local_client.get_collections().collections]
            target = (
                collection_name
                if collection_name in existing_collections
                else ("bodybuilding_rag" if "bodybuilding_rag" in existing_collections else (existing_collections[0] if existing_collections else collection_name))
            )
            return local_client, target
        except Exception as local_err:
            print(f"local qdrant initialization note: {local_err}")

    # attempt remote qdrant cloud connection
    if QDRANT_URL and QDRANT_URL.startswith("http"):
        try:
            cloud_client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
            return cloud_client, collection_name
        except Exception as cloud_err:
            print(f"cloud qdrant connection failed: {cloud_err}")

    # fallback to default local directory
    return QdrantClient(path="./data/qdrant_local"), "bodybuilding_rag"

client, active_collection = init_qdrant_client()

def retrieve(query: str, top_k: int = 5):
    print(f"Retrieving chunks from collection: {active_collection}")

    # embed the search query
    query_encoded = model.encode(query)

    # query top matching points from qdrant
    response = client.query_points(
        collection_name=active_collection,
        query=query_encoded,
        with_payload=True,
        limit=top_k,
    ).points

    return response


