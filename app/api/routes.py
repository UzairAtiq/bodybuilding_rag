import secrets
from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.config import SHARED_ACCESS_KEY
from app.pipeline import pipeline
from app.generation.llm import is_token_limit_error, TOKEN_LIMIT_MESSAGE

# initialize fastapi app
app = FastAPI(title="Fitness Bot API")

# configure cors to allow requests from cloudfront and local dev servers
origins = [
    "https://d1kipqqm1ofiqs.cloudfront.net",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str


def check_access_authorization(x_access_key: str | None) -> None:
    # if shared access key is configured on server, require exact match (normalizing quotes)
    if SHARED_ACCESS_KEY:
        server_key = SHARED_ACCESS_KEY.strip().strip('"').strip("'")
        client_key = (x_access_key or "").strip().strip('"').strip("'")
        if not client_key or not secrets.compare_digest(client_key, server_key):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or missing access key. Please enter the correct password.",
            )


# health check endpoint to verify backend status (unauthenticated for monitoring)
@app.get("/health")
def health():
    return {"status": "ok", "service": "Fitness Bot API"}


# quick verification endpoint for frontend access code modal
@app.post("/verify-key")
def verify_key(x_access_key: str | None = Header(None, alias="x-access-key")):
    check_access_authorization(x_access_key)
    return {"valid": True}


# handle ask query request from frontend
@app.post("/ask")
def ask(
    request: QueryRequest,
    x_access_key: str | None = Header(None, alias="x-access-key"),
):
    # authenticate request against shared secret
    check_access_authorization(x_access_key)

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
