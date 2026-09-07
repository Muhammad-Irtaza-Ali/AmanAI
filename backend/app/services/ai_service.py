"""AI service — unified interface for OpenAI and Google Gemini."""

import json
import logging
from typing import Optional

import httpx

from app.config import settings
from app.ai.prompts import (
    SYSTEM_PROMPT,
    CLASSIFICATION_PROMPT,
    FIRST_AID_PROMPT,
    CHAT_PROMPT,
    TRANSLATION_PROMPT,
)

logger = logging.getLogger(__name__)


# ─── Low-level provider calls ───────────────────────────────────────────────────

async def _call_openai(system: str, user: str, temperature: float = 0.4) -> str:
    """Call OpenAI Chat Completions API."""
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": settings.AI_MODEL,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "temperature": temperature,
            },
        )
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]


async def _call_gemini(system: str, user: str, temperature: float = 0.4) -> str:
    """Call Google Gemini generateContent API."""
    model = settings.AI_MODEL or "gemini-1.5-flash"
    url = (
        f"https://generativelanguage.googleapis.com/v1beta/models/{model}"
        f":generateContent?key={settings.GEMINI_API_KEY}"
    )
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            url,
            json={
                "contents": [
                    {
                        "parts": [
                            {"text": f"System: {system}\n\nUser: {user}"}
                        ]
                    }
                ],
                "generationConfig": {"temperature": temperature},
            },
        )
        resp.raise_for_status()
        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]


async def _ai_call(system: str, user: str, temperature: float = 0.4) -> str:
    """Route to the configured AI provider."""
    if settings.AI_PROVIDER == "gemini":
        return await _call_gemini(system, user, temperature)
    return await _call_openai(system, user, temperature)


# ─── High-level service functions ───────────────────────────────────────────────

async def classify_emergency(text: str) -> dict:
    """Classify an emergency from free-text and return a structured dict."""
    user_prompt = CLASSIFICATION_PROMPT.format(text=text)
    raw = await _ai_call(SYSTEM_PROMPT, user_prompt, temperature=0.1)
    try:
        # Strip any markdown code fences before parsing
        cleaned = raw.strip().strip("`").strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logger.warning("Classification JSON parse error: %s — raw: %s", e, raw)
        return {
            "category": "Other",
            "confidence": 0.0,
            "severity": "Medium",
            "description": text[:200],
        }


async def generate_first_aid(category: str, description: str, language: str = "en") -> dict:
    """Generate structured first-aid guidance."""
    lang_map = {"en": "English", "ur": "Urdu", "sd": "Sindhi"}
    lang_name = lang_map.get(language, "English")
    user_prompt = FIRST_AID_PROMPT.format(
        category=category, description=description, language=lang_name
    )
    raw = await _ai_call(SYSTEM_PROMPT, user_prompt, temperature=0.2)
    try:
        cleaned = raw.strip().strip("`").strip()
        if cleaned.startswith("json"):
            cleaned = cleaned[4:].strip()
        data = json.loads(cleaned)
        return {
            "category": category,
            "immediate_actions": data.get("immediate_actions", []),
            "do_not": data.get("do_not", []),
            "seek_medical_help": data.get("seek_medical_help", "Call emergency services immediately."),
        }
    except json.JSONDecodeError as e:
        logger.warning("First-aid JSON parse error: %s — raw: %s", e, raw)
        return {
            "category": category,
            "immediate_actions": ["Call emergency services (1122 / 15) immediately."],
            "do_not": ["Do not attempt risky actions without professional guidance."],
            "seek_medical_help": "Seek professional medical help right away.",
        }


async def chat_response(
    message: str,
    language: str,
    classification: Optional[dict] = None,
    history: Optional[list] = None,
) -> str:
    """Generate a conversational AI reply in the user's language."""
    cls_str = json.dumps(classification) if classification else "None"
    user_prompt = CHAT_PROMPT.format(
        language=language, classification=cls_str, message=message
    )
    # Include recent history for context (last 6 messages)
    if history:
        history_text = "\n".join(
            f"{m['role']}: {m['content']}" for m in history[-6:]
        )
        user_prompt = f"Recent conversation:\n{history_text}\n\n{user_prompt}"

    return await _ai_call(SYSTEM_PROMPT, user_prompt, temperature=0.5)


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """Translate text between supported languages."""
    lang_map = {"en": "English", "ur": "Urdu", "sd": "Sindhi"}
    src = lang_map.get(source_lang, "English")
    tgt = lang_map.get(target_lang, "English")
    user_prompt = TRANSLATION_PROMPT.format(source=src, target=tgt, text=text)
    return await _ai_call(SYSTEM_PROMPT, user_prompt, temperature=0.1)
