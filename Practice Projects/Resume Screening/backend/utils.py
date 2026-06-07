import os

from dotenv import load_dotenv


load_dotenv()


def get_groq_api_key():
    """
    Fetch Groq API key safely.
    """

    key = os.getenv("GROQ_API_KEY")

    if not key:
        raise ValueError(
            "GROQ_API_KEY not found in environment variables."
        )

    return key