from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY

# initialize groq llm
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.7,
    api_key=GROQ_API_KEY,
)

TOKEN_LIMIT_MESSAGE = (
    "⚠️ **Token limit exceeded**: The request exceeded the model's token limit (tokens per minute). "
    "Please wait a moment and try again."
)

def is_token_limit_error(err: Exception) -> bool:
    # check for groq 413 (request too large / tpm exceeded) or 429 (rate limit)
    status_code = getattr(err, "status_code", None)
    if status_code in (413, 429):
        return True

    err_str = str(err)
    return "rate_limit_exceeded" in err_str or "Request too large" in err_str

def send_prompt(prompt: str) -> str:
    print("Sending prompt to LLM")

    try:
        response = llm.invoke(prompt)
        return str(response.content)
    except Exception as llm_err:
        print(f"LLM invocation error: {llm_err}")

        # handle groq token limit and rate limit errors directly
        if is_token_limit_error(llm_err):
            return TOKEN_LIMIT_MESSAGE

        raise