"""
Emotion distribution — pure functions, no database calls.
Counts positive, negative, and neutral entries.
"""


def calculate_distribution(scores):
    """
    Categorize scores into positive (>0.1), negative (<-0.1), neutral.
    Returns: {"positive": int, "negative": int, "neutral": int,
              "positive_pct": float, "negative_pct": float, "neutral_pct": float}
    """
    if not scores:
        return {
            "positive": 0, "negative": 0, "neutral": 0,
            "positive_pct": 0.0, "negative_pct": 0.0, "neutral_pct": 0.0,
        }

    positive = sum(1 for s in scores if s > 0.1)
    negative = sum(1 for s in scores if s < -0.1)
    neutral = len(scores) - positive - negative

    total = len(scores)
    return {
        "positive": positive,
        "negative": negative,
        "neutral": neutral,
        "positive_pct": round(positive / total * 100, 1),
        "negative_pct": round(negative / total * 100, 1),
        "neutral_pct": round(neutral / total * 100, 1),
    }
