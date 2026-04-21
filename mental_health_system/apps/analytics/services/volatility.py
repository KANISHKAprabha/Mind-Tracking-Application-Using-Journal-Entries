"""
Volatility analysis — pure functions, no database calls.
Measures how much sentiment scores fluctuate.
"""
from statistics import stdev


def calculate_volatility(scores):
    """
    Compute the standard deviation of sentiment scores.
    Returns: {"volatility": float, "level": str}
    """
    if len(scores) < 2:
        return {"volatility": 0.0, "level": "insufficient_data"}

    vol = round(stdev(scores), 4)

    if vol < 0.2:
        level = "low"
    elif vol < 0.5:
        level = "moderate"
    else:
        level = "high"

    return {"volatility": vol, "level": level}
