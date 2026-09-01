from langchain_text_splitters import MarkdownHeaderTextSplitter

def chunk_document (cleaned_text : str) -> str :

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


  #Printing the chunks prodcued 
  for chunk in md_header_splits :
    print("TEXT:", chunk.page_content)

    print("METADATA:", chunk.metadata)

    print("---")
