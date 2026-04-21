"""
Risk classifier — pure function, no database calls.
Combines trend, volatility, and distribution into a wellness signal.

Internal codes map to user-friendly labels (see CLAUDE.md Rule #2):
  stable          → "You're doing well"
  mild_shift      → "Worth paying attention to"
  sustained_decline → "Time to take care of yourself"
  elevated_pattern  → "You deserve some extra support"
"""
from apps.analytics.services.trend import overall_trend
from apps.analytics.services.volatility import calculate_volatility
from apps.analytics.services.distribution import calculate_distribution


# Signal definitions: (internal_code, emoji, user_label, explanation)
SIGNALS = {
    "stable": {
        "emoji": "\u2705",
        "label": "You're doing well",
        "explanation": (
            "You've been showing up for yourself consistently. "
            "Your emotional balance looks really healthy. Keep going."
        ),
    },
    "mild_shift": {
        "emoji": "\U0001F49B",
        "label": "Worth paying attention to",
        "explanation": (
            "There's been a small shift in your mood lately \u2014 "
            "nothing to worry about, but worth noticing. How are you feeling today?"
        ),
    },
    "sustained_decline": {
        "emoji": "\U0001F9E1",
        "label": "Time to take care of yourself",
        "explanation": (
            "It looks like things have felt heavier recently. "
            "That's okay \u2014 hard stretches happen. "
            "Even small acts of self-care can help shift things."
        ),
    },
    "elevated_pattern": {
        "emoji": "\u2764\uFE0F",
        "label": "You deserve some extra support",
        "explanation": (
            "You've been carrying a lot lately, and that takes real strength. "
            "You deserve some extra support right now. "
            "Reaching out to someone you trust could make a real difference."
        ),
    },
}


def classify_risk(scores, window=7):
    """
    Classify risk from a list of sentiment scores.
    Returns:
        {
            "signal": str,          # internal code
            "emoji": str,
            "label": str,           # user-facing label
            "explanation": str,     # user-facing explanation
            "risk_score": float,    # 0.0 (safe) to 1.0 (high risk)
            "wellness_pct": int,    # (1 - risk_score) * 100
        }
    """
    if len(scores) < 3:
        return {
            "signal": "insufficient_data",
            "emoji": "",
            "label": "Keep writing \u2014 your insights appear after a few more entries",
            "explanation": "We need a few more journal entries to start noticing patterns.",
            "risk_score": 0.0,
            "wellness_pct": 100,
        }

    trend = overall_trend(scores, window)
    volatility = calculate_volatility(scores)
    distribution = calculate_distribution(scores)

    # Build a risk score from 0.0 to 1.0
    risk = 0.0

    # Factor 1: Trend direction (weight: 0.3)
    if trend["direction"] == "declining":
        risk += 0.3
    elif trend["direction"] == "stable":
        risk += 0.05
    else:  # improving
        risk -= 0.1

    # Factor 2: Volatility (weight: 0.2)
    if volatility["level"] == "high":
        risk += 0.2
    elif volatility["level"] == "moderate":
        risk += 0.08

    # Factor 3: Negative entry ratio (weight: 0.3)
    neg_ratio = distribution["negative_pct"] / 100
    risk += neg_ratio * 0.3

    # Factor 4: Mean score influence (weight: 0.2)
    mean_score = sum(scores) / len(scores)
    if mean_score < -0.3:
        risk += 0.2
    elif mean_score < 0.0:
        risk += 0.1
    elif mean_score > 0.3:
        risk -= 0.05

    # Clamp to [0, 1]
    risk = round(max(0.0, min(1.0, risk)), 4)

    # Classify signal
    if risk < 0.2:
        signal_key = "stable"
    elif risk < 0.4:
        signal_key = "mild_shift"
    elif risk < 0.65:
        signal_key = "sustained_decline"
    else:
        signal_key = "elevated_pattern"

    sig = SIGNALS[signal_key]
    wellness = int((1 - risk) * 100)

    return {
        "signal": signal_key,
        "emoji": sig["emoji"],
        "label": sig["label"],
        "explanation": sig["explanation"],
        "risk_score": risk,
        "wellness_pct": wellness,
    }
