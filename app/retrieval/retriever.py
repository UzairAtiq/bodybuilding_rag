from qdrant_client import QdrantClient , models 
from app.config import QDRANT_URL
from app.config import collection_name
from sentence_transformers import SentenceTransformer
from app.config import QDRANT_API_KEY

#Setting up qdrant client
  #Setting up Qdrant client

  
client = QdrantClient(
    url="https://dbe2bf6d-235f-4427-9c81-e0fe28df5f65.australia-southeast1-0.gcp.cloud.qdrant.io",
    api_key=QDRANT_API_KEY,
    cloud_inference=True
)
#Sentence transformer model
model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

def retrieve(query :str, top_k = 5) :
  print("Retrieving chunks")

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

