from langchain_text_splitters import MarkdownHeaderTextSplitter
from cleaner import clean_text
from loaders import load_book
from pathlib import Path

#Getting the file path
file_path = Path("/Users/uzair/Developer/Muscle_Info_RAG/data/raw/joe-weider-s-bodybuilding-system-joe-weider-2929.md")


#Read the file as text
raw_text = load_book(file_path)

#Clean the text
cleaned_text = clean_text(raw_text)

#Defining Headers to split the text on 
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
    ('####', "Header 4") 
]

#Passing the splitting headers to langchain splitter
markdown_splitter = MarkdownHeaderTextSplitter(headers_to_split_on)

#Splitting the text based on headers
md_header_splits = markdown_splitter.split_text(cleaned_text)

for chunk in md_header_splits :
  print("TEXT:", chunk.page_content)

  print("METADATA:", chunk.metadata)

  print("---")
