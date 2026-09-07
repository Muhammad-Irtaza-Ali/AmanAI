"""Chat endpoint — main conversational interface for Nigehban AI."""

from fastapi import APIRouter
from app.schemas import ChatMessageIn, ChatMessageOut, ClassificationOut, FirstAidOut
from app.services.ai_service import classify_emergency, generate_first_aid, chat_response
from app.utils.language import detect_language

router = APIRouter()

# In-memory session store for MVP (replace with Redis/DB in production)
_sessions: dict[str, list[dict]] = {}


@router.post("/chat", response_model=ChatMessageOut)
async def chat_endpoint(payload: ChatMessageIn):
    """Process a chat message: detect language, classify, generate response."""
    message = payload.message
    session_id = payload.session_id or "default"

    # 1. Detect language
    lang = payload.language
    if lang == "auto" or not lang:
        lang = detect_language(message)

    # 2. Classify the emergency
    classification_data = await classify_emergency(message)
    classification = ClassificationOut(
        category=classification_data.get("category", "Other"),
        confidence=classification_data.get("confidence", 0.0),
        severity=classification_data.get("severity", "Medium"),
        description=classification_data.get("description", ""),
    )

    # 3. Generate first aid if applicable
    first_aid = None
    if classification.category != "Other" and classification.confidence > 0.3:
        fa_data = await generate_first_aid(
            classification.category,
            classification.description or message,
            lang,
        )
        first_aid = FirstAidOut(
            category=fa_data["category"],
            immediate_actions=fa_data["immediate_actions"],
            do_not=fa_data["do_not"],
            seek_medical_help=fa_data["seek_medical_help"],
        )

    # 4. Get conversation history
    if session_id not in _sessions:
        _sessions[session_id] = []
    history = _sessions[session_id]

    # 5. Generate AI chat response
    reply = await chat_response(
        message=message,
        language=lang,
        classification=classification_data,
        history=history,
    )

    # 6. Store in session history
    history.append({"role": "user", "content": message})
    history.append({"role": "assistant", "content": reply})
    # Keep only last 20 messages per session
    if len(history) > 20:
        _sessions[session_id] = history[-20:]

    return ChatMessageOut(
        reply=reply,
        language_detected=lang,
        classification=classification,
        first_aid=first_aid,
    )
