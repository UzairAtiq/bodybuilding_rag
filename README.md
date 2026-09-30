# Fitness Bot (Muscle Info RAG)

A Retrieval-Augmented Generation (RAG) system with a React interface that answers bodybuilding and strength training questions grounded in Joe Weider's training course book.

---

## Live Demo and Access

The project is deployed on AWS:

[Launch Fitness Bot](https://d1kipqqm1ofiqs.cloudfront.net)

> Note: Access is password-protected to prevent unauthorized API use and stay within Groq and Qdrant Cloud free-tier rate limits.
>
> If you are reviewing this project and want access credentials, please email uzairatiq65@gmail.com or contact me on [GitHub](https://github.com/UzairAtiq) to get a guest password.

---

## Overview

General-purpose language models often hallucinate exercise routines, mix up training concepts, or answer questions outside the intended topic. Fitness Bot keeps responses grounded in Joe Weider's vintage training course by using semantic search in Qdrant Cloud, cross-encoder reranking, and explicit prompt guardrails on Groq. The application includes a password gate to protect the API and is hosted on AWS using EC2, S3, and CloudFront.

---

## Key Features

- Markdown Document Ingestion: Splits source text using Markdown headers (Header 1 through Header 4) so chapter and exercise titles stay attached to each text chunk.
- Dense Vector Retrieval: Creates 384-dimensional embeddings using `sentence-transformers/all-MiniLM-L6-v2` and retrieves top candidates via cosine similarity in Qdrant Cloud.
- Cross-Encoder Reranking: Reranks the top candidates using `cross-encoder/ms-marco-MiniLM-L-6-v2` (truncated to 1,200 characters to keep CPU latency low) to pick the top 2 most relevant chunks.
- Domain Guardrails: The system prompt tells the model to reject off-topic questions (like geography, politics, or general trivia) and give direct exercise explanations without conversational filler.
- Rate Limit and Error Handling: Catches Groq 413 and 429 token-per-minute errors as well as Qdrant connection resets, returning readable status notices instead of crashing.
- Password-Gated Access: Uses a timing-safe shared key check (`secrets.compare_digest`) on `/ask` and `/verify-key` endpoints.
- React Frontend: Built with React 19, TypeScript, Vite, and Tailwind CSS. Includes an access lock modal, chat history stored in `localStorage`, a typewriter effect, and Markdown rendering for workout tables and lists.
- AWS Deployment: The FastAPI backend runs on an EC2 instance behind an Nginx reverse proxy with HTTPS. The static frontend is hosted on S3 and delivered globally through CloudFront.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | React 19, TypeScript, Vite 8.3 | User interface and chat session flow |
| Styling and Icons | Tailwind CSS 3.4, Lucide React | Dark interface theme and icons |
| Markdown | `react-markdown`, `remark-gfm` | Renders formatted text, lists, and tables |
| Backend API | FastAPI 0.141, Uvicorn | REST API endpoints |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` | Generates 384-dimensional dense vectors |
| Vector Database | Qdrant Cloud (`qdrant-client` 1.19) | Cloud vector search with payload filtering |
| Reranker | `cross-encoder/ms-marco-MiniLM-L-6-v2` | Scores chunk relevance before prompt generation |
| LLM Inference | Groq API (`openai/gpt-oss-120b`) | Generates grounded responses |
| Orchestration | LangChain Core (`langchain-core` 1.6) | Prompt templating and chain wiring |
| Containerization | Docker | Runs the backend with pre-downloaded model weights |
| Cloud Hosting | AWS (EC2, S3, CloudFront) | Cloud hosting and CDN distribution |

---

## Architecture

```text
[ User Browser ]
       |
       v
[ AWS CloudFront CDN / S3 Bucket ] ---> Serves React 19 Frontend
       |
       v (HTTPS POST /ask + x-access-key)
[ AWS EC2 / Nginx Reverse Proxy ]
       |
       v
[ FastAPI Backend (Uvicorn :8000) ]
       |
       +--> 1. check_access_authorization() ---> Validates SHARED_ACCESS_KEY
       |
       +--> 2. model.encode(query) ---------> MiniLM-L6-v2 Embedding
       |
       +--> 3. client.query_points() -------> Qdrant Cloud Cluster (Top 5 chunks)
       |
       +--> 4. CrossEncoder.predict() ------> ms-marco Reranking (Top 2 chunks)
       |
       +--> 5. build_prompt() --------------> Adds domain guardrails and context
       |
       +--> 6. ChatGroq.invoke() -----------> Groq Cloud (gpt-oss-120b)
                                                    |
       <--- Grounded Response ----------------------+
```

### Folder Structure

```text
Muscle_Info_RAG/
├── app/
│   ├── api/
│   │   └── routes.py             # FastAPI endpoints (/ask, /verify-key, /health) and CORS
│   ├── generation/
│   │   ├── llm.py                # Groq ChatGroq client and rate-limit handlers
│   │   └── prompt.py             # Prompt template with bodybuilding domain guardrails
│   ├── ingestion/
│   │   ├── cleaner.py            # Text normalization and whitespace cleaning
│   │   ├── chunker.py            # MarkdownHeaderTextSplitter (Headers 1-4)
│   │   ├── indexer.py            # Qdrant collection setup, embedding, and upserting
│   │   └── loaders.py            # Markdown file loader
│   ├── retrieval/
│   │   ├── reranker.py           # Cross-encoder reranking model and scoring
│   │   └── retriever.py          # Qdrant client retrieval function
│   ├── config.py                 # Loads environment variables
│   └── pipeline.py               # End-to-end RAG pipeline
├── data/
│   ├── evaluation/
│   │   └── evaluate.json         # Output results from evaluation runs
│   └── raw/
│       └── joe-weider-...md      # Source course text in Markdown
├── frontend/
│   ├── src/
│   │   ├── components/           # AccessModal, Header, Sidebar, Chatbox, ChatInput, ChatMessage
│   │   ├── hooks/                # Typewriter animation hook
│   │   ├── services/             # API client connecting to FastAPI (/ask, /verify-key)
│   │   ├── types/                # Session, message, and query status types
│   │   ├── App.tsx               # Main application state and session management
│   │   └── main.tsx              # React entry point
│   ├── index.html                # HTML template with cache prevention meta tags
│   ├── package.json              # Frontend dependencies and npm scripts
│   └── vite.config.ts            # Vite build configuration and path aliases
├── scripts/
│   ├── evaluate.py               # 8-question evaluation script
│   └── ingest.py                 # Chunks, embeds, and indexes source documents
├── tests/
│   └── benchmark_pipeline.py     # Latency and memory profiling script
├── Dockerfile                    # Container configuration with pre-cached models
├── requirements.txt              # Pinned Python dependencies
├── .env.example                  # Backend environment variables template
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.12 or newer
- Node.js 18 or newer with npm
- Qdrant Cloud cluster URL and API key (https://cloud.qdrant.io/)
- Groq Cloud API key (https://console.groq.com/)
- Optional: Docker (if you want to run the backend in a container)

---

### Local Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/UzairAtiq/bodybuilding_rag.git
cd bodybuilding_rag
```

#### 2. Set Up the Python Backend

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### 3. Set Up the React Frontend

```bash
cd frontend
npm install
cd ..
```

---

### Environment Variables

#### Backend Configuration (`.env`)

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

| Variable | Description | Required? | Example |
| :--- | :--- | :---: | :--- |
| `QDRANT_URL` | Endpoint URL of your Qdrant Cloud cluster | Yes | `https://xyz-cluster.us-east-1.gcp.cloud.qdrant.io` |
| `QDRANT_API_KEY` | API key for Qdrant Cloud | Yes | `th1s-1s-an-ap1-k3y` |
| `collection_name` | Target Qdrant collection name | No | `bodybuilding_rag` (default) |
| `GROQ_API_KEY` | Groq Cloud API key for model generation | Yes | `gsk_abc123...` |
| `SHARED_ACCESS_KEY` | Password required by the frontend lock screen and API | Yes | `your-secret-password` |

> Note: For local development, set `SHARED_ACCESS_KEY` in `.env` to any password you want (for example, `SHARED_ACCESS_KEY=my-local-secret`). When you open the frontend, enter that same password into the access modal to unlock the app.

#### Frontend Configuration (`frontend/.env`)

Create a `.env` file inside the `frontend/` folder:

```bash
cp frontend/.env.example frontend/.env
```

| Variable | Description | Required? | Example |
| :--- | :--- | :---: | :--- |
| `VITE_BACKEND_URL` | URL of the backend FastAPI service | No | `http://localhost:8000` (default) |

---

### Running the Application Locally

#### 1. Ingest the Course Material into Qdrant

Make sure the source markdown file is in `data/raw/`, then run:

```bash
python scripts/ingest.py
```

This reads the markdown headers, generates embeddings, and uploads the points into your Qdrant Cloud collection.

#### 2. Start the Backend API

```bash
uvicorn app.api.routes:app --host 0.0.0.0 --port 8000 --reload
```

The API starts at `http://localhost:8000`. You can view the automatic Swagger documentation at `http://localhost:8000/docs`.

#### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser. Enter your `SHARED_ACCESS_KEY` into the access modal to start asking questions.

---

### Running with Docker (Local Container)

The `Dockerfile` uses a Python 3.12 slim base and downloads both model weights during the build step so containers do not download weights from Hugging Face on startup:

```bash
# Build the container image
docker build -t muscle-info-rag .

# Run the container with your environment file
docker run -d -p 8000:8000 --env-file .env --name fitness-bot-api muscle-info-rag
```

Check that the container is responding:

```bash
curl http://localhost:8000/health
```

---

## API Endpoints

| Method | Endpoint | Auth Required | Request Details | Response |
| :--- | :--- | :---: | :--- | :--- |
| `GET` | `/health` | No | None | `{"status": "ok", "service": "Fitness Bot API"}` |
| `POST` | `/verify-key` | Yes | Header: `x-access-key: <key>` | `{"valid": true}` (or 401 Unauthorized) |
| `POST` | `/ask` | Yes | Header: `x-access-key: <key>`<br>JSON: `{"query": "string"}` | `{"answer": "string"}` |

### Example Request

```bash
curl -X POST "http://localhost:8000/ask" \
  -H "Content-Type: application/json" \
  -H "x-access-key: your-secret-password" \
  -d '{"query": "What exercises primarily target the triceps?"}'
```

### Example Response

```json
{
  "answer": "### Triceps Targeted Exercises\n\n- **Close-Grip Bench Press**: Places primary mechanical tension on the inner triceps heads while minimizing shoulder involvement.\n- **Triceps Extension (Lying/Standing)**: Isolates the long head of the triceps through full elbow extension."
}
```

---

## Testing and Profiling

### 1. Latency and Resource Profiling

A benchmark script is included in `tests/benchmark_pipeline.py` to measure latency across each step (MiniLM embeddings, Qdrant vector search, CrossEncoder reranking, Groq LLM call) and check CPU/RAM usage:

```bash
python tests/benchmark_pipeline.py --runs 3
```

Useful flags:
- `--runs <int>`: Number of runs to average (default: 3).
- `--query "<text>"`: Custom question to test.
- `--no-system-check`: Skips reading system CPU and RAM stats.
- `--profile-only`: Measures step timings without generating full text answers.

### 2. Qualitative Retrieval Evaluation

Runs 8 sample questions from different chapters of the source book through the pipeline:

```bash
python scripts/evaluate.py
```

Outputs are written to `data/evaluation/evaluate.json`, including the question, answer, and retrieved chunk headers with scores.

### 3. Unit Tests

```bash
pytest
```

Note: Unit test files in `tests/` currently contain stubs (see Roadmap).

---

## AWS Deployment Architecture

The live version runs on AWS infrastructure:

### 1. Backend on AWS EC2
- Host: Ubuntu EC2 instance running Uvicorn on port 8000.
- Reverse Proxy: Nginx on port 443 with TLS certificates from Let's Encrypt, proxying traffic to `http://localhost:8000`.
- CORS: Configured in `app/api/routes.py` to allow requests from the CloudFront distribution domain (`https://d1kipqqm1ofiqs.cloudfront.net`) and local dev servers.

### 2. Frontend on AWS S3 and CloudFront
- Static Hosting: The production build (`frontend/dist/`) is stored in an S3 bucket.
- Global CDN: Amazon CloudFront (`d1kipqqm1ofiqs.cloudfront.net`) distributes the static files globally.
- Cache Handling:
  - Asset files in `dist/assets/*` use content hashes in filenames (`index-COc4Hb0a.js`) and can be cached long-term.
  - The `dist/index.html` file has S3 metadata set to `Cache-Control: no-cache, no-store, must-revalidate` along with HTML meta tags so browsers always fetch the newest build immediately.

---

## Roadmap and Known Limitations

- Table Boundary Preservation: `MarkdownHeaderTextSplitter` splits on headers rather than table boundaries. As a result, dense workout tables with exercise lists, sets, and reps can sometimes split across chunks. Formatting tables into structured text before chunking is planned.
- Automated CI/CD: Adding a GitHub Actions workflow to build, upload to S3, and invalidate CloudFront on push.
- Unit Test Coverage: Implementing automated tests for chunking (`test_ingestion.py`), retrieval scoring (`test_retrieval.py`), and error mocks (`test_pipeline.py`).
- Token Streaming: Adding Server-Sent Events (SSE) or WebSockets to stream Groq response tokens to the React frontend in real time.

---

## License

TODO: Add license details (for example, MIT or All Rights Reserved).

---

## Contact

- Author: Uzair Atiq
- Email: uzairatiq65@gmail.com
- GitHub: https://github.com/UzairAtiq
- Repository: https://github.com/UzairAtiq/bodybuilding_rag