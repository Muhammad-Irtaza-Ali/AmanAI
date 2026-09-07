"""Classification and First-aid endpoints."""

from fastapi import APIRouter

from app.schemas import (
    ClassifyRequest,
    ClassificationOut,
    FirstAidRequest,
    FirstAidOut,
)
from app.services.ai_service import classify_emergency, generate_first_aid
from app.utils.language import detect_language

router = APIRouter()


@router.post("/classify", response_model=ClassificationOut)
async def classify(payload: ClassifyRequest):
    """Classify the type and severity of an emergency."""
    lang = payload.language
    if lang == "auto" or not lang:
        lang = detect_language(payload.text)

    result = await classify_emergency(payload.text)
    return ClassificationOut(
        category=result.get("category", "Other"),
        confidence=result.get("confidence", 0.0),
        severity=result.get("severity", "Medium"),
        description=result.get("description", ""),
    )


@router.post("/first-aid", response_model=FirstAidOut)
async def first_aid(payload: FirstAidRequest):
    """Generate first-aid guidance for a classified emergency."""
    result = await generate_first_aid(
        category=payload.category,
        description=payload.description,
        language=payload.language or "en",
    )
    return FirstAidOut(
        category=result["category"],
        immediate_actions=result["immediate_actions"],
        do_not=result["do_not"],
        seek_medical_help=result["seek_medical_help"],
    )
