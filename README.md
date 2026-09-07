# Muscle Info RAG

A RAG pipeline that answers questions about a vintage bodybuilding training course (Joe Weider's course book) using local embeddings, Qdrant vector search, cross-encoder reranking, and an LLM for generation.

I built the chunking, indexing, retrieval, reranking, and pipeline logic manually to understand each part before using LangChain for orchestration.

## What it does

Ask a question like "What are good exercises for a beginner?" and it:

1. Retrieves the most relevant chunks from the source book (stored as vector embeddings in Qdrant)
2. Reranks those chunks with a cross-encoder for better relevance ordering
3. Builds a prompt from the top chunks
4. Sends it to an LLM and returns a grounded answer

## Architecture

```
loaders.py      → reads the source markdown file
cleaner.py      → strips noise from raw text
chunker.py      → splits text by markdown headers (Header 1-4)
indexer.py      → embeds chunks (all-MiniLM-L6-v2) and upserts to Qdrant
retriever.py    → queries Qdrant for top-k relevant chunks
reranker.py     → cross-encoder reranks retrieved chunks
prompt.py       → builds the final prompt from reranked chunks
llm.py          → sends the prompt to the LLM, returns the answer
pipeline.py     → wires all of the above together
```

## Tech stack

- **Embeddings:** sentence-transformers (`all-MiniLM-L6-v2`)
- **Reranker:** cross-encoder (`tomaarsen/reranker-ModernBERT-base-gooaq-bce`)
- **Vector DB:** Qdrant Cloud
- **LLM:** Groq (`openai/gpt-oss-120b`)
- **Orchestration:** LangChain (LCEL-style chaining)
- **API:** FastAPI + Uvicorn
- **Containerization:** Docker

## Setup

### 1. Clone and install

```bash
git clone https://github.com/UzairAtiq/bodybuilding_rag.git
cd bodybuilding_rag
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your own values:

```bash
cp .env.example .env
```

You'll need:
- A [Qdrant Cloud](https://cloud.qdrant.io/) cluster URL and API key
- A collection name of your choice (`collection_name` in `.env`). Qdrant creates it automatically on first ingestion if it doesn't already exist.
- A [Groq](https://console.groq.com/) API key (free tier works, see rate limit notes below)

### 3. Add your source document(s)

Drop your markdown file(s) into `data/raw/`. To index more than one document, add more files there and run ingestion for each. `indexer.py` tags every chunk with a `book_id`, so multiple documents can coexist in the same collection without overwriting each other.

### 4. Ingest the source document(s)

```bash
python scripts/ingest.py
```

This chunks the source markdown, embeds it, and pushes it into your Qdrant collection.

### 5. Run the API

```bash
uvicorn app.api.routes:app --host 0.0.0.0 --port 8000
```

Then query it:

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -d '{"query": "What are good exercises for a beginner?"}'
```

## Running with Docker

```bash
docker build -t muscle-info-rag .
docker run -p 8000:8000 --env-file .env muscle-info-rag
```

The image bakes in both the embedding and reranker model weights at build time, so containers don't re-download them from Hugging Face on every start.

## Evaluation

`scripts/evaluate.py` runs 8 questions (pulled directly from the source book, covering different chapters and chart types) through the pipeline and logs the question, final answer, and retrieved chunk headers/scores to `data/evaluation/evaluate.json`.

This is a manual, qualitative eval, not an automated scoring pipeline. Running each question through a rate-limited API is slow, so I skipped automated scoring in favor of just reading the outputs and checking retrieval quality by hand.

On the 8-question evaluation, most answers were grounded in the retrieved source material, including specific exercises, sets, and reps. The retrieved chunk headers and scores are logged alongside each answer for manual inspection.

## Known limitations

**Table/chart data gets mangled during chunking.** `MarkdownHeaderTextSplitter` splits by headers, not table boundaries, and the source book has a lot of workout tables (exercise, sets, reps). Rows sometimes get cut mid-table or lose their alignment. Fixing this properly means preprocessing tables into a flat, consistent text format before chunking. Out of scope for now.

## Project structure

```
app/
  api/            → FastAPI routes
  generation/     → prompt building and LLM calls
  ingestion/      → loaders, cleaning, chunking, indexing
  retrieval/      → retriever and reranker
  config.py
  pipeline.py
scripts/
  ingest.py       → run the ingestion pipeline
  evaluate.py     → run the evaluation questions
data/
  raw/            → source markdown
  evaluation/     → evaluation results (evaluate.json)
Dockerfile
.dockerignore
requirements.txt
```