# Fitness Bot (Muscle Info RAG)

A production-ready Retrieval-Augmented Generation (RAG) system with a high-impact React interface that answers vintage bodybuilding and resistance training questions grounded strictly in Joe Weider's foundational course materials.

---

## Overview

General-purpose large language models frequently hallucinate workout routines, blend conflicting training philosophies, or respond to out-of-scope queries. **Fitness Bot** solves this by constraining answers to Joe Weider's verified training course using dense vector embeddings in Qdrant Cloud, CPU-optimized cross-encoder reranking, and domain guardrails on Groq. The system is protected by a password-gated access barrier and served across AWS EC2, S3, and CloudFront.

---

## Key Features

- **Hierarchical Markdown Ingestion**: Parses source material by Markdown headers (`Header 1` through `Header 4`) to preserve chapter, section, and exercise context alongside text content.
- **Dense Vector Retrieval**: Generates 384-dimensional embeddings using `sentence-transformers/all-MiniLM-L6-v2` and retrieves top candidates via cosine distance in Qdrant Cloud.
- **CPU-Optimized Neural Reranking**: Re-scores top-k retrieved candidates using `cross-encoder/ms-marco-MiniLM-L-6-v2` (truncated to 1,200 characters for sub-second execution on CPU) to filter down to the top-2 most relevant chunks.
- **Strict Domain Guardrails**: Custom prompt templates explicitly instruct the LLM to reject off-topic questions (geography, politics, general trivia) and deliver direct, structured workout guidance without conversational preamble.
- **Resilience & Rate Limit Handling**: Gracefully catches Groq 413/429 token-per-minute errors and Qdrant Cloud connection resets, returning clean diagnostic messages rather than raw stack traces.
- **Password-Gated Access Control**: Timing-safe shared access key verification (`secrets.compare_digest`) protects backend `/ask` and `/verify-key` endpoints.
- **High-Impact Frontend**: Built with React 19, Vite, and Tailwind CSS. Features an access lock modal, persistent multi-session chat in `localStorage`, fast typewriter streaming simulation, and Markdown rendering with table support.
- **Production AWS Architecture**: Backend served on AWS EC2 behind an Nginx reverse proxy with HTTPS, paired with a globally distributed static frontend on Amazon S3 and CloudFront CDN.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8.3 | User interface and consultation workflow |
| **Styling & Icons** | Tailwind CSS 3.4, Lucide React | High-contrast dark theme and iconography |
| **Markdown** | `react-markdown`, `remark-gfm` | Structured output rendering with tables |
| **Backend API** | FastAPI 0.141, Uvicorn | High-performance asynchronous REST API |
| **Embeddings** | `sentence-transformers/all-MiniLM-L6-v2` | 384-dimensional dense semantic vectors |
| **Vector Database** | Qdrant Cloud (`qdrant-client` 1.19) | Cloud-hosted vector search with payload filtering |
| **Reranker** | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Deep cross-encoder candidate relevance scoring |
| **LLM Inference** | Groq API (`openai/gpt-oss-120b`) | High-speed grounded response generation |
| **Orchestration** | LangChain Core (`langchain-core` 1.6) | Prompt templating and chain orchestration |
| **Containerization**| Docker | Container build with pre-cached model weights |
| **Cloud Hosting** | AWS (EC2, S3, CloudFront) | Cloud deployment with CDN caching |

---

## Architecture

```
[ User Browser ]
       │
       ▼
[ AWS CloudFront CDN / S3 Bucket ] ─── (Serves React 19 Frontend)
       │
       ▼  (HTTPS POST /ask + x-access-key)
[ AWS EC2 / Nginx Reverse Proxy ]
       │
       ▼
[ FastAPI App (Uvicorn :8000) ]
       │
       ├── 1. check_access_authorization() ──► (Validates SHARED_ACCESS_KEY)
       │
       ├── 2. model.encode(query) ──────────► (MiniLM-L6-v2 Embedding)
       │
       ├── 3. client.query_points() ────────► [ Qdrant Cloud Cluster ] (Top 5 chunks)
       │
       ├── 4. CrossEncoder.predict() ───────► (ms-marco Reranking -> Top 2 chunks)
       │
       ├── 5. build_prompt() ───────────────► (System Guardrails + Context Injection)
       │
       └── 6. ChatGroq.invoke() ────────────► [ Groq Cloud (gpt-oss-120b) ]
                                                        │
       ◄──────────────── Grounded Response ─────────────┘
```

### Folder Structure

```text
Muscle_Info_RAG/
├── app/
│   ├── api/
│   │   └── routes.py             # FastAPI endpoints (/ask, /verify-key, /health) & CORS
│   ├── generation/
│   │   ├── llm.py                # Groq ChatGroq client & rate-limit error handlers
│   │   └── prompt.py             # Domain-restricted bodybuilding prompt template
│   ├── ingestion/
│   │   ├── cleaner.py            # Text normalization and whitespace cleaning
│   │   ├── chunker.py            # MarkdownHeaderTextSplitter (Headers 1-4)
│   │   ├── indexer.py            # Qdrant collection setup, embedding & upserting
│   │   └── loaders.py            # Raw markdown file loader
│   ├── retrieval/
│   │   ├── reranker.py           # Cross-encoder reranking model and scoring
│   │   └── retriever.py          # Qdrant client query points retrieval
│   ├── config.py                 # Environment variable configuration
│   └── pipeline.py               # End-to-end RAG execution pipeline
├── data/
│   ├── evaluation/
│   │   └── evaluate.json         # Output results from evaluation runs
│   └── raw/
│       └── joe-weider-...md      # Source training course markdown
├── frontend/
│   ├── src/
│   │   ├── components/           # AccessModal, Header, Sidebar, Chatbox, ChatInput, ChatMessage
│   │   ├── hooks/                # useTypewriter effect hook
│   │   ├── services/             # API client connecting to FastAPI (/ask, /verify-key)
│   │   ├── types/                # Session, message, and query status types
│   │   ├── App.tsx               # Main state management and consultation sessions
│   │   └── main.tsx              # React DOM entry point
│   ├── index.html                # HTML entry point with cache prevention meta tags
│   ├── package.json              # Frontend dependencies and build scripts
│   └── vite.config.ts            # Vite build configuration and path aliases
├── scripts/
│   ├── evaluate.py               # 8-question benchmark evaluation script
│   └── ingest.py                 # Document chunking, embedding, and indexing script
├── tests/
│   └── benchmark_pipeline.py     # CPU, RAM, and per-component latency profiler
├── Dockerfile                    # Multi-stage production container definition
├── requirements.txt              # Pinned Python dependencies
├── .env.example                  # Backend environment variable template
└── README.md
```

---

## Prerequisites

- **Python**: `3.12+`
- **Node.js**: `18+` and `npm`
- **Qdrant Cloud Account**: Active cluster and API key ([cloud.qdrant.io](https://cloud.qdrant.io/))
- **Groq Cloud Account**: Active API key ([console.groq.com](https://console.groq.com/))
- **(Optional) Docker**: For containerized deployment

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/UzairAtiq/bodybuilding_rag.git
cd bodybuilding_rag
```

### 2. Set Up the Python Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
cd ..
```

---

## Environment Variables

### Backend Configuration (`.env`)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

| Variable | Description | Required? | Example |
| :--- | :--- | :---: | :--- |
| `QDRANT_URL` | Public endpoint URL of your Qdrant Cloud cluster | **Yes** | `https://xyz-cluster.us-east-1.gcp.cloud.qdrant.io` |
| `QDRANT_API_KEY` | API authentication key for Qdrant Cloud | **Yes** | `th1s-1s-an-ap1-k3y` |
| `collection_name`| Target Qdrant collection name | No | `bodybuilding_rag` *(default)* |
| `GROQ_API_KEY` | Groq Cloud API key for model inference | **Yes** | `gsk_abc123...` |
| `SHARED_ACCESS_KEY` | Secret access password required by the lock screen | **Yes** | `your-secure-access-key` |

### Frontend Configuration (`frontend/.env`)

Create a `.env` file inside `frontend/`:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Required? | Example |
| :--- | :--- | :---: | :--- |
| `VITE_BACKEND_URL` | URL of the backend FastAPI service | No | `http://localhost:8000` *(default)* |

---

## Usage

### 1. Ingest Course Material into Qdrant

Ensure your raw markdown book exists in `data/raw/` (or use the included course file), then run:

```bash
python scripts/ingest.py
```

*This parses the markdown headers, generates MiniLM embeddings, and upserts point records into your Qdrant Cloud collection.*

### 2. Run the Backend API

```bash
uvicorn app.api.routes:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`. Swagger documentation is accessible at `http://localhost:8000/docs`.

### 3. Run the Frontend Dev Server

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser. Enter the `SHARED_ACCESS_KEY` when prompted by the lock modal.

---

## API Endpoints

| Method | Endpoint | Auth Required | Request Body / Header | Response |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/health` | No | None | `{"status": "ok", "service": "Fitness Bot API"}` |
| `POST` | `/verify-key` | **Yes** | Header: `x-access-key: <key>` | `{"valid": true}` *(or 401 Unauthorized)* |
| `POST` | `/ask` | **Yes** | Header: `x-access-key: <key>`<br>JSON: `{"query": "string"}` | `{"answer": "string"}` |

### Example Request

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -H "x-access-key: your-secure-access-key" \
  -d '{"query": "What exercises primarily target the triceps?"}'
```

### Example Response

```json
{
  "answer": "### Triceps Targeted Exercises\n\n- **Close-Grip Bench Press**: Places primary mechanical tension on the inner triceps heads while minimizing shoulder involvement.\n- **Triceps Extension (Lying/Standing)**: Isolates the long head of the triceps through full elbow extension."
}
```

---

## Running with Docker

The [`Dockerfile`](Dockerfile) uses a Python 3.12 slim base and bakes in both model weights at build time so the container starts instantly without downloading from Hugging Face on cold boot:

```bash
# Build the container image
docker build -t muscle-info-rag .

# Run the container
docker run -d -p 8000:8000 --env-file .env --name fitness-bot-api muscle-info-rag
```

Test container reachability:

```bash
curl http://localhost:8000/health
```

---

## Testing & Performance Profiling

### 1. Latency & Resource Profiling

A diagnostic profiling script is included in `tests/benchmark_pipeline.py` to isolate per-component bottlenecks across CPU, RAM, embeddings, vector search, reranking, and generation:

```bash
python tests/benchmark_pipeline.py --runs 3
```

**Options**:
- `--runs <int>`: Number of warm runs to average (default: 3).
- `--query "<text>"`: Custom query to profile.
- `--no-system-check`: Skip CPU/RAM diagnostic check.
- `--profile-only`: Profile without generating full text answers.

### 2. Qualitative Retrieval Evaluation

Run the evaluation script to pass 8 domain questions across different course chapters through the pipeline:

```bash
python scripts/evaluate.py
```

*Results are logged to `data/evaluation/evaluate.json` with retrieved chunk headers, document identifiers, and similarity scores.*

### 3. Unit Tests

```bash
pytest
```

*(Note: Unit test suites in `tests/` are currently stubs — see Roadmap).*

---

## Deployment Architecture

### 1. Backend on AWS EC2
- **Host**: Ubuntu EC2 instance running Uvicorn on port `8000`.
- **Reverse Proxy**: Nginx listening on port `443` (TLS via Let's Encrypt / nip.io domain mapping) proxying to `http://localhost:8000`.
- **CORS Configuration**: [`app/api/routes.py`](app/api/routes.py) explicitly permits traffic from the CloudFront distribution domain (`https://d1kipqqm1ofiqs.cloudfront.net`) and local dev servers.

### 2. Frontend on AWS S3 + CloudFront
- **Static Hosting**: The production build bundle (`frontend/dist/`) is stored in an Amazon S3 bucket.
- **Global CDN**: Amazon CloudFront distribution (`d1kipqqm1ofiqs.cloudfront.net`) serves assets globally.
- **Cache Optimization**:
  - `dist/assets/*` are content-hashed (`index-COc4Hb0a.js`) and cached permanently.
  - `dist/index.html` is uploaded with S3 metadata `Cache-Control: no-cache, no-store, must-revalidate` alongside HTML meta tags to ensure client browsers always fetch the latest build immediately without stale cache locks.

---

## Roadmap & Known Limitations

- [ ] **Table Boundary Preservation**: `MarkdownHeaderTextSplitter` splits purely on headers; dense workout charts (exercise, sets, reps) can occasionally split across chunks. Preprocessing tables into serialized JSON or Markdown key-value strings prior to chunking is planned.
- [ ] **Automated CI/CD Pipeline**: Replace manual S3 upload and CloudFront invalidation steps with a GitHub Actions workflow.
- [ ] **Unit Test Coverage**: Implement automated unit tests for chunking (`test_ingestion.py`), vector similarity thresholds (`test_retrieval.py`), and pipeline error mocking (`test_pipeline.py`).
- [ ] **Streaming Responses**: Implement Server-Sent Events (SSE) / WebSocket endpoints in FastAPI to stream Groq generation tokens directly into the React client.

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`.
3. Commit your changes: `git commit -m "feat: add your feature"`.
4. Push to your branch: `git push origin feat/your-feature-name`.
5. Open a Pull Request.

---

## License

<!-- TODO: Specify license (e.g. MIT, Apache 2.0, or All Rights Reserved) -->
TODO

---

## Contact

- **Author**: Uzair Atiq
- **GitHub**: [@UzairAtiq](https://github.com/UzairAtiq)
- **Repository**: [https://github.com/UzairAtiq/bodybuilding_rag](https://github.com/UzairAtiq/bodybuilding_rag)