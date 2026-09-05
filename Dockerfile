FROM python:3.12-slim

WORKDIR /code

COPY requirements.txt .

RUN pip install --no-cache-dir \
    --index-url https://download.pytorch.org/whl/cpu \
    --extra-index-url https://pypi.org/simple \
    -r requirements.txt

RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"
RUN python -c "from sentence_transformers import CrossEncoder; CrossEncoder('tomaarsen/reranker-ModernBERT-base-gooaq-bce')"

COPY . .

CMD ["uvicorn", "app.api.routes:app", "--host", "0.0.0.0", "--port", "8000"]