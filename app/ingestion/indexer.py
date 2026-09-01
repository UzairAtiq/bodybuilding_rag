from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams,PointStruct




def indexer(chunked_text,name) :

  #Setting up Qdrant client
  client = QdrantClient(url="http://localhost:6333")

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

    #Joining all exsisting headers in hierarchial order
    levels = [chunk.metadata.get(f"Header {n}") for n in range(1,5)]
    header = " > ".join(h for h in levels if h)

    #calculate embeddings 
    emebeddings = model.encode(page_content)

    points.append (
      PointStruct(
        id = i,
        vector = emebeddings.tolist() , payload= {"text" : page_content , "header" : header}
      )
    )

  #Sending to qdrant
  client.upsert(collection_name=name , points=points)



