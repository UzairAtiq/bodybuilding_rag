from qdrant_client import QdrantClient , models 
from app.config import QDRANT_URL
from app.config import collection_name
from sentence_transformers import SentenceTransformer

#Setting up qdrant client
client = QdrantClient(url=QDRANT_URL)
#Sentence transformer model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def retrieve(query :str, top_k = 3) :

  #Embedding the query
  query_encoded = model.encode(query)

  #Getting query response 
  response = client.query_points(
    collection_name= collection_name,
    query = query_encoded,
    with_payload=True,
    limit=top_k
  ).points

  return response

