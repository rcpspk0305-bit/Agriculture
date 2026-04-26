from pathlib import Path
from typing import Dict, List

from fastapi import APIRouter

from app.models.schemas import ChatRequest, GenAIRequest
from app.services.llm_service import generate_action_plan, generate_chat_response

router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[1]
RAG_FILE = BASE_DIR / "agriculture-compendium.pdf"


def load_rag_text() -> str:
    if not RAG_FILE.exists():
        return ""
    return RAG_FILE.read_text(encoding="utf-8", errors="ignore")


def chunk_text(text: str, chunk_size: int = 1200, overlap: int = 200) -> List[str]:
    if not text:
        return []

    chunks: List[str] = []
    start = 0

    while start < len(text):
        end = min(len(text), start + chunk_size)
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(0, end - overlap)

    return chunks


def score_chunk(chunk: str, query: str) -> int:
    query_terms = set(query.lower().split())
    chunk_lower = chunk.lower()
    score = 0

    for term in query_terms:
        if term in chunk_lower:
            score += 1

    return score


def retrieve_context(query: str, top_k: int = 3) -> List[Dict[str, str]]:
    text = load_rag_text()
    chunks = chunk_text(text)
    ranked = []

    for idx, chunk in enumerate(chunks):
        score = score_chunk(chunk, query)
        if score > 0:
            ranked.append((score, idx, chunk))

    ranked.sort(key=lambda x: x[0], reverse=True)

    return [
        {"chunk_id": str(idx), "content": chunk.strip()}
        for score, idx, chunk in ranked[:top_k]
    ]


def rag_fallback_answer(query: str) -> str:
    results = retrieve_context(query)

    if not results:
        return (
            "I could not find a matching answer in the agriculture knowledge base right now. "
            "Please ask about crop care, disease management, irrigation, soil, or nutrients."
        )

    response_parts = ["I am answering from the local agriculture knowledge base:"]

    for i, item in enumerate(results, start=1):
        cleaned = " ".join(item["content"].split())[:500]
        response_parts.append(f"{i}. {cleaned}")

    return "\n\n".join(response_parts)


@router.post("/chat/action-plan")
async def action_plan_endpoint(request: GenAIRequest):
    try:
        plan = await generate_action_plan(request)
        return {
            "status": "success",
            "mode": "llm",
            "action_plan": plan,
        }
    except Exception as e:
        print(f"LLM action-plan failed, using RAG fallback: {e}")
        query = (
            f"crop {request.crop} "
            f"disease {request.disease} "
            f"humidity {request.sensor_data.get('humidity')} "
            f"rainfall {request.sensor_data.get('rainfall')} "
            f"ph {request.sensor_data.get('ph')}"
        )
        plan = rag_fallback_answer(query)
        return {
            "status": "success",
            "mode": "rag_fallback",
            "action_plan": plan,
        }


@router.post("/chat/conversational")
async def conversational_endpoint(request: ChatRequest):
    try:
        reply = await generate_chat_response(request)
        return {
            "status": "success",
            "mode": "llm",
            "reply": reply,
        }
    except Exception as e:
        print(f"LLM chat failed, using RAG fallback: {e}")
        reply = rag_fallback_answer(request.message)
        return {
            "status": "success",
            "mode": "rag_fallback",
            "reply": reply,
        }