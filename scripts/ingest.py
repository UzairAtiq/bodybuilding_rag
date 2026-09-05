from pathlib import Path
from app.ingestion.chunker import chunk_document
from app.ingestion.loaders import load_book
from app.ingestion.indexer import indexer 
from app.ingestion.cleaner import clean_text
from app.config import collection_name


book_1 = "Joe_weider_Book"

#Getting the file path
file_path = Path("/Users/uzair/Developer/Muscle_Info_RAG/data/raw/joe-weider-s-bodybuilding-system-joe-weider-2929.md")

#Load book as text
loaded_book = load_book(file_path)

#clean the text from loaded book 
cleaned_text = clean_text(loaded_book)

#split the cleaned text into chunks 
chunked_document = chunk_document(cleaned_text)

#embed the chunks and push to quadrant
indexer(chunked_document,collection_name,book_1)
