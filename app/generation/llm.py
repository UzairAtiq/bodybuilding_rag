from app.generation.prompt import build_prompt
from langchain_ollama import ChatOllama

llm = ChatOllama(
  model= "qwen3.5:4b",
  num_ctx=8192
)

def send_prompt (prompt : str) :
  print("Sending prompt to LLM")

  #Sending prompt to LLM and returning the response 

  response = llm.invoke(prompt)

  return response.content