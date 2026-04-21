"""
HuggingFace emotion analysis service.
Uses j-hartmann/emotion-english-distilroberta-base which classifies text into
seven emotions: joy, sadness, anger, fear, disgust, surprise, neutral.
Converts the top emotion into a sentiment score on the -1.0 to +1.0 scale.
"""
import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

API_URL = (
    "https://router.huggingface.co/hf-inference/models/"
    "j-hartmann/emotion-english-distilroberta-base"
)

# Emotion → sentiment polarity mapping
POSITIVE_EMOTIONS = {"joy"}
NEGATIVE_EMOTIONS = {"sadness", "anger", "fear", "disgust"}
NEUTRAL_EMOTIONS = {"neutral"}
AMBIGUOUS_EMOTIONS = {"surprise"}  # mildly positive


def _to_sentiment_score(label, confidence):
    """
    Convert one of the 7 emotion labels into a sentiment score (-1.0 to +1.0).
    """
    if label in POSITIVE_EMOTIONS:
        return round(+confidence, 4)
    if label in NEGATIVE_EMOTIONS:
        return round(-confidence, 4)
    if label in NEUTRAL_EMOTIONS:
        return 0.0
    if label in AMBIGUOUS_EMOTIONS:
        # Surprise is treated as mildly positive
        return round(confidence * 0.3, 4)
    logger.warning("Unknown emotion label from model: %s", label)
    return 0.0


def analyze_sentiment(text):
    """
    Send text to HuggingFace and return (score, label).

    score: float from -1.0 to +1.0
    label: one of "joy", "sadness", "anger", "fear", "disgust", "surprise", "neutral"

    Returns (None, "") if the API call fails or the API key is missing.
    """
    api_key = getattr(settings, "HUGGINGFACE_API_KEY", None)

    if not api_key:
        logger.warning("HUGGINGFACE_API_KEY not set — skipping sentiment analysis.")
        return None, ""

    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        response = requests.post(
            API_URL,
            headers=headers,
            json={
                "inputs": text[:512],
                # top_k=None tells the inference API to return *all* class scores
                # so we always pick the strongest emotion ourselves.
                "parameters": {"top_k": None},
            },
            timeout=15,
        )
        response.raise_for_status()
        result = response.json()

        # The HF Inference API may return either:
        #   [[{"label": "joy", "score": 0.91}, ...]]   ← nested
        #   [{"label": "joy", "score": 0.91}, ...]     ← flat
        # Handle both shapes defensively.
        if isinstance(result, list) and result and isinstance(result[0], list):
            predictions = result[0]
        else:
            predictions = result

        if not predictions:
            logger.error("Empty predictions from sentiment API: %s", result)
            return None, ""

        top = max(predictions, key=lambda x: x["score"])
        label = str(top["label"]).lower()
        confidence = float(top["score"])

        score = _to_sentiment_score(label, confidence)
        return round(score, 4), label

    except Exception as e:
        logger.error("Sentiment analysis failed: %s", e)
        return None, ""
