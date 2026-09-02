from app.retrieval.retriever import retrieve
from sentence_transformers import CrossEncoder

#Setting up the reranker model
model = CrossEncoder("tomaarsen/reranker-ModernBERT-base-gooaq-bce")


def reranker(query,chunks) :

  print("Reranking chunks")

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

  #Returining only the top 3 reranked chunks
  return [chunk for chunk, score in ranked[:3]]

