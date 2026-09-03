import os 
from dotenv import load_dotenv

load_dotenv()

QDRANT_URL = os.getenv("QDRANT_URL")
collection_name = os.getenv("collection_name")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")
GROK_API_KEY = os.getenv("GROQ_API_KEY")