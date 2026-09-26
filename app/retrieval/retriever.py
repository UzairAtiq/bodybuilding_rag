from qdrant_client import QdrantClient
from sentence_transformers import SentenceTransformer
from app.config import QDRANT_URL, QDRANT_API_KEY, collection_name

# initialize qdrant cloud client
client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)

# initialize sentence transformer embedding model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def retrieve(query: str, top_k: int = 5):
    print(f"Retrieving chunks from Qdrant Cloud collection: {collection_name}")

    # embed the search query
    query_encoded = model.encode(query)

    # query top matching points from qdrant cloud
    response = client.query_points(
        collection_name=collection_name,
        query=query_encoded,
        with_payload=True,
        limit=top_k,
    ).points

    return response
