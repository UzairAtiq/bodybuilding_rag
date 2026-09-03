from langchain_groq import ChatGroq

# Initialize Groq LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.7
)

def send_prompt (prompt : str) :
  print("Sending prompt to LLM")

  #Sending prompt to LLM and returning the response 

  response = llm.invoke(prompt)

  return response.content