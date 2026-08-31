#Read the file in data / raw / joe-weider-s-bodybuilding-system-joe-weider-2929.md as output as string 


def readFileAsString () :
  with open ("/Users/uzair/Developer/Muscle_Info_RAG/data/raw/joe-weider-s-bodybuilding-system-joe-weider-2929.md" , "r" , encoding="utf-8") as file : 
    text_content = file.read()
    return text_content




