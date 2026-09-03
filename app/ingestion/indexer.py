from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams,PointStruct
from app.config import QDRANT_URL
from app.config import QDRANT_API_KEY


def indexer(chunked_text,name) :

  #Setting up Qdrant client
  client = QdrantClient(
    url="https://dbe2bf6d-235f-4427-9c81-e0fe28df5f65.australia-southeast1-0.gcp.cloud.qdrant.io",
    api_key=QDRANT_API_KEY,
    cloud_inference=True
)

  #Creeating Qdrant collection if it does not exsist
  if not client.collection_exists ( name ) :
    client.create_collection(
      collection_name=name,
      vectors_config=VectorParams(size=384, distance=Distance.COSINE),
      )

  #Loading pretrained model
  model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

  #Points list for qdrant
  points = []
  for i , chunk in enumerate(chunked_text) :

    #loading the metadeta and page content from langchain document object
    page_content = chunk.page_content

    #Getting and Joining all exsisting headers in hierarchial order
    levels = [chunk.metadata.get(f"Header {n}") for n in range(1,5)]
    header = " > ".join(h for h in levels if h)

    #calculate embeddings for chunks
    emebeddings = model.encode(page_content)

    #Adding the chunks and headers to a list using pointstruct
    points.append (
      PointStruct(
        id = i,
        vector = emebeddings.tolist() , payload= {"text" : page_content , "header" : header}
      )
    )

  #Sending to qdrant
  client.upsert(collection_name=name , points=points)



