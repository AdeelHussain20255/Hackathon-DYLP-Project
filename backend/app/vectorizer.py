import os
import requests
import json

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
MISTRAL_EMBED_URL = "https://api.mistral.ai/v1/embeddings"

def embed_text(text: str) -> list[float] | None:
    if not MISTRAL_API_KEY or not text:
        return None
    try:
        resp = requests.post(
            MISTRAL_EMBED_URL,
            headers={
                "Authorization": f"Bearer {MISTRAL_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistral-embed",
                "input": [text[:8000]],
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        return data["data"][0]["embedding"]
    except Exception as e:
        print(f"[embed] Error: {e}")
        return None


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    na = sum(x * x for x in a) ** 0.5
    nb = sum(x * x for x in b) ** 0.5
    if not na or not nb:
        return 0.0
    return dot / (na * nb)
