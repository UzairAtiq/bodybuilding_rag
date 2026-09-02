from app.generation.prompt import build_prompt
from langchain_ollama import ChatOllama

llm = ChatOllama(
  model= "qwen3.5:4b"
)

def send_prompt (prompt : str) :

  #Sending prompt to LLM and returning the response 

  response = llm.invoke(prompt)
  return response.content