from app.retrieval.retriever import retrieve
from sentence_transformers import CrossEncoder

#Setting up the reranker model
model = CrossEncoder("tomaarsen/reranker-ModernBERT-base-gooaq-bce")

#Test query
query = "WHat is a good training routine for a beginner"


#Getting the response from the retriever
chunks = retrieve(query)

def reranker(query,chunks) :
  #Making pairs of query and chunk

  pairs = [(query , chunk.payload["text"]) for chunk in chunks]

  #predicting the scores for pair of texts
  scores = model.predict(pairs)

  #Sorting the ranking from Highest to lowest
  ranked = sorted(
        zip(chunks, scores),
        key=lambda x: x[1],
        reverse=True
    )

  print(ranked)
  return [chunk for chunk, score in ranked]

reranker(query,chunks)