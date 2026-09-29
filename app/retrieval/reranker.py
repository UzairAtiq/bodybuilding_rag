from sentence_transformers import CrossEncoder

# initialize lightweight cpu-optimized cross-encoder
model = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2", max_length=384)


def reranker(query: str, chunks: list) -> list:
    print("Reranking chunks with CPU-optimized cross-encoder")

    # score relevance using first 1200 characters while keeping full text in chunk payload
    pairs = [(query, chunk.payload.get("text", "")[:1200]) for chunk in chunks]

    # predict ranking scores
    scores = model.predict(pairs)

    # sort chunks from highest to lowest score
    ranked = sorted(
        zip(chunks, scores),
        key=lambda x: x[1],
        reverse=True,
    )

    # return top 2 most relevant chunks
    return [chunk for chunk, score in ranked[:2]]

