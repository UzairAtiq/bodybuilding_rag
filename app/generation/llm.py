from langchain_groq import ChatGroq
from app.config import GROQ_API_KEY

# initialize groq llm
llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.7,
    api_key=GROQ_API_KEY,
)

# indicator phrases that signal token limit exhaustion
TOKEN_LIMIT_PHRASES = [
    "exhausted my token limit",
    "exhausted token limit",
    "token limit exceeded",
    "exceeded my token limit",
    "token limit has been reached",
    "exceeded the token limit",
    "rate limit exceeded",
    "rate limit reached",
    "rate_limit_exceeded",
    "tokens per minute",
    "tokens per day",
    "tpm",
    "quota exceeded",
    "resourceexhausted",
]

TOKEN_LIMIT_MESSAGE = (
    "⚠️ **Token limit exceeded**: The AI model has reached its token limit. "
    "Please wait a moment before asking another question."
)

def is_token_limit_text(text: str) -> bool:
    # check if text or exception contains token exhaustion keywords
    lowered = text.lower()
    return any(phrase in lowered for phrase in TOKEN_LIMIT_PHRASES)

def send_prompt(prompt: str) -> str:
    print("Sending prompt to LLM")

    try:
        response = llm.invoke(prompt)
        content = response.content

        # inspect string response for token exhaustion messages
        if isinstance(content, str) and is_token_limit_text(content):
            print("Detected token limit exhaustion in LLM response text")
            return TOKEN_LIMIT_MESSAGE

        return str(content)
    except Exception as llm_err:
        err_msg = str(llm_err)
        print(f"LLM invocation error: {err_msg}")

        # intercept api token quota or rate limit exceptions
        if is_token_limit_text(err_msg):
            return TOKEN_LIMIT_MESSAGE

        raise