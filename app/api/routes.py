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

# handle ask query request from frontend
@app.post("/ask")
def ask(request: QueryRequest):
    answer = pipeline(request.query)
    return {"answer": answer}