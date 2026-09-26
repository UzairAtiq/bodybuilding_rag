from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.pipeline import pipeline

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

    answer = pipeline(cleaned_query)
    return {"answer": answer}