from loaders import load_book
import re

def clean_text(text: str) -> str:

    """Clean formatting artifacts from converted Markdown text."""
    # Remove form-feed/page-break characters
    text = text.replace("\f", "")

    # Remove explicit page markers like [PAGE 23]
    text = re.sub(r"\[PAGE\s+\d+\]", "", text, flags=re.IGNORECASE)

    # Remove lines containing only a page number
    text = re.sub(r"(?m)^\s*\d+\s*$", "", text)

    # Normalize Windows line endings
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove trailing whitespace from each line
    text = re.sub(r"[ \t]+$", "", text, flags=re.MULTILINE)

    # Collapse excessive blank lines
    text = re.sub(r"\n{3,}", "\n\n", text)

    # Collapse excessive spaces (but preserve newlines)
    text = re.sub(r"[ \t]{2,}", " ", text)

    # Remove spaces directly inside Markdown heading markers
    text = re.sub(r"^(#{1,6})\s+", r"\1 ", text, flags=re.MULTILINE)

    return text.strip()







