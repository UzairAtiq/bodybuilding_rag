from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.pipeline import pipeline
from app.generation.llm import is_token_limit_error, TOKEN_LIMIT_MESSAGE

# initialize fastapi app
app = FastAPI(title="Fitness Bot API")

# configure cors to allow requests from frontend dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str

# health check endpoint to verify backend status
@app.get("/health")
def health():
    return {"status": "ok", "service": "Fitness Bot API"}

# handle ask query request from frontend
@app.post("/ask")
def ask(request: QueryRequest):
    cleaned_query = request.query.strip()
    if not cleaned_query:
        return {"answer": "Please provide a training, workout, or nutrition question."}

    try:
        answer = pipeline(cleaned_query)
        return {"answer": answer}
    except Exception as pipeline_err:
        err_msg = str(pipeline_err)
        print(f"pipeline query failed: {err_msg}")

        # handle qdrant cloud connection resets
        if "Connection reset by peer" in err_msg or "ResponseHandlingException" in err_msg:
            return {
                "answer": (
                    "⚠️ **Could not connect to Qdrant Cloud**:\n\n"
                    "The remote Qdrant Cloud cluster reset the connection (`[Errno 54] Connection reset by peer`).\n\n"
                    "Please check your cluster status at [cloud.qdrant.io](https://cloud.qdrant.io) to ensure the cluster is active (not paused or hibernated)."
                )
            }

        # handle groq token limit and rate limit errors
        if is_token_limit_error(pipeline_err):
            return {"answer": TOKEN_LIMIT_MESSAGE}

        return {"answer": f"⚠️ An error occurred during retrieval or generation:\n\n{err_msg}"}
