from app.retrieval.retriever import retrieve
from app.retrieval.reranker import reranker
from app.generation.prompt import build_prompt
from app.generation.llm import send_prompt

def pipeline (query : str) :

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

  return answer



answer = pipeline(query="What are good exercises for a beginner?")
print("LLM Answer : \n\n",answer)
