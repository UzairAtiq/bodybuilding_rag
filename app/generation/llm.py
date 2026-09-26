from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY

# initialize groq llm
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.7,
    api_key=GROQ_API_KEY,
)

def send_prompt (prompt : str) :
  print("Sending prompt to LLM")

  #Sending prompt to LLM and returning the response 

  response = llm.invoke(prompt)

  return response.content