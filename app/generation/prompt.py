from langchain_core.prompts import PromptTemplate



def build_prompt(query , ranked_chunks) :

  print("Building Prompt")

  #Recieved chunks in list join into one big string 
  context = "\n\n".join([chunk.payload["text"] for chunk in ranked_chunks])

  prompt = PromptTemplate.from_template("Answer the question using only the provided context\n" \
  "Question : {Question} \n" \
  "Context : {Context} \n")

  #Formatting the pormpt with inputs
  return prompt.format(Question = query ,
                       Context = context )


  





