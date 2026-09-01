#Read the file in data / raw / joe-weider-s-bodybuilding-system-joe-weider-2929.md as output as string 


def load_book (path : str) -> str :
  with open (path , "r" , encoding="utf-8") as file : 
    text_content = file.read()
    return text_content




