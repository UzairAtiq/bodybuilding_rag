from app.retrieval.retriever import retrieve
from app.retrieval.reranker import reranker
from app.generation.prompt import build_prompt
from app.generation.llm import send_prompt

def pipeline (query : str , debug : bool = False) :

  #Sending query to retriever
  chunks_recieved = retrieve(query) 

  #Sending the query and top-k chunks to reranker for better ranking ]
  reranked_chunks = reranker(query , chunks_recieved)

  #Building the prompt
  prompt = build_prompt(query,reranked_chunks)


  # print("prompt\n\n")
  # print(prompt)
  # print("Prompt Length:\n\n")
  # print(len(prompt))

  # Sending the prompt to the llmm and getting answer
  answer = send_prompt(prompt)

  #Getting the chunk headers and text to return when debugging
  if debug == True :
    chunk_info = [
    {
       "header": chunk.payload.get("header", "N/A"), "score": chunk.score
    }
    for chunk in reranked_chunks
]
    return answer, chunk_info

  return answer



