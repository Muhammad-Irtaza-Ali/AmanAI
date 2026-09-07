"""Language detection and translation helpers."""

import re
from typing import Tuple

# Urdu Unicode range (simplified heuristic)
_URDU_RANGE = re.compile(r"[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]")
# Sindhi uses additional characters beyond standard Urdu/Arabic
_SINDHI_CHARS = re.compile(r"[ڄڃڌڍڏڙڳڱڻڼھڪڦٺٽٿ]")


def detect_language(text: str) -> str:
    """Detect language from text. Returns 'en', 'ur', or 'sd'."""
    if not text or not text.strip():
        return "en"

    # Check for Sindhi-specific characters first (subset of Arabic script)
    if _SINDHI_CHARS.search(text):
        return "sd"

    # Check for Urdu/Arabic script
    urdu_chars = len(_URDU_RANGE.findall(text))
    total_alpha = len(re.findall(r"\w", text))

    if total_alpha == 0:
        return "en"

    ratio = urdu_chars / total_alpha
    if ratio > 0.3:
        return "ur"

    return "en"


LANGUAGE_NAMES = {
    "en": "English",
    "ur": "Urdu",
    "sd": "Sindhi",
}


def get_language_name(code: str) -> str:
    return LANGUAGE_NAMES.get(code, "English")


def build_translation_prompt(text: str, source_lang: str, target_lang: str) -> str:
    """Build a prompt to translate text."""
    src_name = get_language_name(source_lang)
    tgt_name = get_language_name(target_lang)
    return (
        f"Translate the following {src_name} text to {tgt_name}. "
        f"Keep it natural and accurate. Return only the translated text.\n\n"
        f"Text: {text}"
    )


def is_rtl(language: str) -> bool:
    """Return True if the language is written right-to-left."""
    return language in ("ur", "sd")
