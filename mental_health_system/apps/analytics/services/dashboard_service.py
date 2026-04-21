"""
Dashboard service — fetches user entries and computes all analytics.
This is the bridge between journal data and analytics pure functions.
"""
from apps.journal.models import JournalEntry
from apps.analytics.services.analytics_engine import compute_analytics
from apps.analytics.services.risk_classifier import classify_risk


def get_dashboard(user, window=7):
    """
    Build the full dashboard payload for a user.
    Only entries with sentiment scores are included in analytics.
    """
    entries = JournalEntry.objects.filter(user=user).order_by("created_at")
    scored = entries.filter(sentiment_score__isnull=False)

    scores = list(scored.values_list("sentiment_score", flat=True))

    analytics = compute_analytics(scores, window)
    risk = classify_risk(scores, window)

    # Build recent entries summary (last 5)
    recent = entries[:5]
    recent_data = [
        {
            "id": e.id,
            "snippet": e.content[:80] + ("..." if len(e.content) > 80 else ""),
            "sentiment_score": e.sentiment_score,
            "created_at": e.created_at.isoformat(),
        }
        for e in recent
    ]

    return {
        "wellness": {
            "score_pct": risk["wellness_pct"],
            "label": risk["label"],
            "emoji": risk["emoji"],
            "explanation": risk["explanation"],
            "signal": risk["signal"],
        },
        "analytics": {
            "trend": analytics["trend"],
            "volatility": analytics["volatility"],
            "distribution": analytics["distribution"],
            "entry_count": analytics["entry_count"],
        },
        "recent_entries": recent_data,
    }
