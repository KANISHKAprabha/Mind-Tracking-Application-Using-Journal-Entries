"""
Trend analysis — pure functions, no database calls.
Computes rolling averages over sentiment score sequences.
"""
from statistics import mean


def rolling_average(scores, window=7):
    """
    Compute a rolling average over a list of scores.
    scores: list of floats (oldest → newest)
    window: number of entries to average
    Returns: list of {"index": i, "average": float} dicts
    """
    if not scores or window < 1:
        return []

    results = []
    for i in range(len(scores)):
        start = max(0, i - window + 1)
        chunk = scores[start:i + 1]
        results.append({
            "index": i,
            "average": round(mean(chunk), 4),
        })
    return results


def overall_trend(scores, window=7):
    """
    Determine if the overall trend is improving, declining, or stable.
    Compares the first and last rolling average values.
    Returns: {"direction": str, "change": float}
    """
    averages = rolling_average(scores, window)
    if len(averages) < 2:
        return {"direction": "insufficient_data", "change": 0.0}

    first = averages[0]["average"]
    last = averages[-1]["average"]
    change = round(last - first, 4)

    if change > 0.1:
        direction = "improving"
    elif change < -0.1:
        direction = "declining"
    else:
        direction = "stable"

    return {"direction": direction, "change": change}
