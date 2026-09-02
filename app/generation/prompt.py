from langchain_core.prompts import PromptTemplate

def build_prompt(query , context) :

  prompt = PromptTemplate.from_template("Answer the question using only the provided context" \
  "Question : {question}" \
  "Context : {}")

  #Formatting the pormpt with inputs
  return prompt.format(Question = query ,
                       Context = context )

  

