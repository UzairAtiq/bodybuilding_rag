from fastapi import FastAPI
from app.pipeline import pipeline
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    query: str

@app.post("/ask")
def ask(request: QueryRequest):
    answer = pipeline(request.query)
    return {"answer": answer}